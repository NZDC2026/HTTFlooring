using System.Text.Json;
using Htt.SharedKernel;
using Npgsql;

namespace Htt.Infrastructure;

public static class StockOpening
{
    // Controlled owner CLI initialization only: quantity ledger, not a goods-receipt or financial opening command.
    public static async Task<Guid> InitializeAsync(string connectionString, Guid company, Guid warehouse, Guid product, decimal quantity, string reference, string issuer, string subject, CancellationToken ct = default)
    {
        if (quantity <= 0 || quantity > 99999999999999.999999m || decimal.Round(quantity, 6) != quantity || string.IsNullOrWhiteSpace(reference) || reference.Length > 200)
            throw new BusinessException("invalid_opening", "Positive base quantity (max six decimals) and a reference are required.");
        await using var source = NpgsqlDataSource.Create(connectionString);
        var access = (await new AccessResolver(source).ResolveAsync(issuer, subject, ct)).SingleOrDefault(a => a.CompanyId == company && a.Has("inventory.opening.write"))
            ?? throw new BusinessException("permission_denied", "Opening stock requires an active authorized company member.", 403);
        await using var session = new CompanySession(source); await session.BeginAsync(company, access.ActorId, "stock-opening-cli", ct);
        await using (var gate = new NpgsqlCommand("SELECT pg_advisory_xact_lock(hashtextextended(@key,0))", session.Connection, session.Transaction))
        {
            gate.Parameters.AddWithValue("key", $"opening:{company}:{warehouse}:{product}"); await gate.ExecuteNonQueryAsync(ct);
        }
        var existing = await Sql.RowsAsync(session, "SELECT id,quantity,reference FROM inventory.stock_openings WHERE company_id=@company AND warehouse_id=@warehouse AND product_id=@product", ct, ("company", company), ("warehouse", warehouse), ("product", product));
        if (existing.Count > 0)
        {
            var row = existing.Single(); if ((decimal)row["quantity"]! != quantity || (string)row["reference"]! != reference.Trim()) throw new BusinessException("opening_conflict", "Opening already exists; use a future stock-adjustment workflow to change stock.", 409);
            await session.Transaction.CommitAsync(ct); return (Guid)row["id"]!;
        }
        var warehouseRow = await Sql.RowsAsync(session, "SELECT id FROM catalog.warehouses WHERE company_id=@company AND id=@warehouse AND active AND kind='SELLABLE' FOR SHARE", ct, ("company", company), ("warehouse", warehouse));
        var productRow = await Sql.RowsAsync(session, "SELECT id FROM catalog.products WHERE company_id=@company AND id=@product AND status='ACTIVE' AND item_type='STOCK' FOR SHARE", ct, ("company", company), ("product", product));
        if (warehouseRow.Count != 1 || productRow.Count != 1) throw new BusinessException("invalid_opening_reference", "Active sellable warehouse and stock product in the selected company are required.");
        var id = Guid.NewGuid();
        await using (var write = new NpgsqlCommand("""
            INSERT INTO inventory.stock_openings(id,company_id,warehouse_id,product_id,quantity,reference,created_by) VALUES(@id,@company,@warehouse,@product,@quantity,@reference,@actor);
            INSERT INTO inventory.stock_balances(company_id,warehouse_id,product_id,on_hand,created_by) VALUES(@company,@warehouse,@product,@quantity,@actor)
            """, session.Connection, session.Transaction))
        {
            write.Parameters.AddWithValue("id", id); write.Parameters.AddWithValue("company", company); write.Parameters.AddWithValue("warehouse", warehouse); write.Parameters.AddWithValue("product", product); write.Parameters.AddWithValue("quantity", quantity); write.Parameters.AddWithValue("reference", reference.Trim()); write.Parameters.AddWithValue("actor", access.ActorId); await write.ExecuteNonQueryAsync(ct);
        }
        await Sql.AuditAsync(session, "inventory.opening_recorded", "stock_opening", id, "stock-opening-cli", ct, new { warehouseId = warehouse, productId = product, quantity, reference = reference.Trim() });
        await session.Transaction.CommitAsync(ct); return id;
    }
}
