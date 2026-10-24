using Htt.SharedKernel;
using Npgsql;

namespace Htt.Infrastructure;

public static class StockValuation
{
    // One-time owner CLI financial opening. Never treats missing cost as zero.
    public static async Task<Guid> InitializeAsync(string connection, Guid company, Guid warehouse, Guid product, decimal value, string reference, string issuer, string subject, CancellationToken ct = default)
    {
        if (value < 0 || value > 999999999999999999.99m || decimal.Round(value, 2) != value || string.IsNullOrWhiteSpace(reference) || reference.Trim().Length > 200)
            throw new BusinessException("invalid_valuation", "Supply a nonnegative AUD opening value with at most two decimals and a reference.");
        await using var source = NpgsqlDataSource.Create(connection);
        var access = (await new AccessResolver(source).ResolveAsync(issuer, subject, ct)).SingleOrDefault(a => a.CompanyId == company && a.Has("inventory.opening.write"))
            ?? throw new BusinessException("permission_denied", "An authorized opening-stock member is required.", 403);
        await using var s = new CompanySession(source); await s.BeginAsync(company, access.ActorId, "stock-valuation-cli", ct);
        var args = new (string, object)[] { ("company", company), ("warehouse", warehouse), ("product", product) };
        var b = (await Sql.RowsAsync(s, "SELECT * FROM inventory.lock_balance(@warehouse,@product)", ct, args)).SingleOrDefault()
            ?? throw new BusinessException("stock_missing", "Initialize quantity before value.", 409);
        var balance = (Guid)b["id"]!;
        var existing = (await Sql.RowsAsync(s, "SELECT id,value,reference FROM inventory.valuation_openings WHERE company_id=@company AND stock_balance_id=@balance", ct, ("company", company), ("balance", balance))).SingleOrDefault();
        if (existing is not null)
        {
            if ((decimal)existing["value"]! != value || (string)existing["reference"]! != reference.Trim()) throw new BusinessException("valuation_conflict", "Opening value already recorded.", 409);
            await s.Transaction.CommitAsync(ct); return (Guid)existing["id"]!;
        }
        if ((decimal)b["on_hand"]! <= 0) throw new BusinessException("empty_stock", "Positive on-hand stock is required for initial valuation.", 409);
        var id = Guid.NewGuid();
        await Sql.RowsAsync(s, """
            INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by)
             SELECT @id,@company,'STOCK_VALUATION',inventory.next_number('STOCK_VALUATION'),(now() AT TIME ZONE timezone)::date,'CONFIRMED',@actor FROM core.companies WHERE id=@company;
            INSERT INTO inventory.valuation_openings(id,company_id,stock_balance_id,quantity,value,reference,created_by)
             SELECT @id,@company,id,on_hand,@value,@reference,@actor FROM inventory.stock_balances WHERE company_id=@company AND id=@balance;
            INSERT INTO inventory.stock_values(company_id,stock_balance_id,value,opening_document_id) VALUES(@company,@balance,@value,@id)
            """, ct, ("company", company), ("id", id), ("balance", balance), ("actor", access.ActorId), ("value", value), ("reference", reference.Trim()));
        // Includes explicit zero valuation: financial-period validation still applies.
        var period = await Sql.RowsAsync(s, "SELECT p.id FROM accounting.periods p JOIN platform.documents d ON d.company_id=p.company_id AND d.business_date>=p.starts_on AND d.business_date<p.ends_on WHERE d.company_id=@company AND d.id=@id AND p.state='OPEN' FOR SHARE OF p", ct, ("company", company), ("id", id));
        if (period.Count != 1) throw new BusinessException("period_closed", "Opening date requires an open accounting period.", 409);
        if (value > 0)
        {
            var posted = await Sql.RowsAsync(s, """
                SELECT accounting.post_journal(@id,d.version,'STOCK_OPENING',d.business_date,'Opening inventory valuation',jsonb_build_array(
                 jsonb_build_object('accountId',i.account_id,'debit',@value),jsonb_build_object('accountId',e.account_id,'credit',@value))) AS id
                FROM platform.documents d JOIN accounting.account_mappings i ON i.company_id=d.company_id AND i.purpose='INVENTORY'
                JOIN accounting.account_mappings e ON e.company_id=d.company_id AND e.purpose='OPENING_EQUITY'
                JOIN accounting.accounts ia ON ia.company_id=i.company_id AND ia.id=i.account_id AND ia.active AND ia.control_kind='INVENTORY'
                JOIN accounting.accounts ea ON ea.company_id=e.company_id AND ea.id=e.account_id AND ea.active AND ea.kind='EQUITY'
                WHERE d.company_id=@company AND d.id=@id
                """, ct, ("company", company), ("id", id), ("value", value));
            if (posted.Count != 1) throw new BusinessException("account_mapping_missing", "Inventory and opening-equity mappings are required.", 409);
        }
        await Sql.RowsAsync(s, "UPDATE platform.documents SET state='POSTED' WHERE company_id=@company AND id=@id", ct, ("company", company), ("id", id));
        await Sql.AuditAsync(s, "inventory.valuation_opened", "stock_valuation", id, "stock-valuation-cli", ct, new { warehouseId = warehouse, productId = product, value, reference = reference.Trim() });
        await s.Transaction.CommitAsync(ct); return id;
    }
}
