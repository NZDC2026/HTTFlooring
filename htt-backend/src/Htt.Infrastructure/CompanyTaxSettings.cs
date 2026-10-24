using Htt.SharedKernel;
using Npgsql;

namespace Htt.Infrastructure;

public static class CompanyTaxSettings
{
    // Owner CLI: explicit human verification, not an assertion from an ABN lookup.
    public static async Task ConfigureAsync(string connection, Guid company, bool registered, string basis, string issuer, string subject, CancellationToken ct = default)
    {
        if (basis is not ("CASH" or "NON_CASH")) throw new BusinessException("invalid_gst_basis", "Use CASH or NON_CASH.");
        await using var source = NpgsqlDataSource.Create(connection);
        var access = (await new AccessResolver(source).ResolveAsync(issuer, subject, ct)).SingleOrDefault(a => a.CompanyId == company && a.Has("accounting.tax.configure"))
            ?? throw new BusinessException("permission_denied", "An authorized company tax-configuration member is required.", 403);
        await using var s = new CompanySession(source); await s.BeginAsync(company, access.ActorId, "tax-registration-cli", ct);
        var before = (await Sql.RowsAsync(s, "SELECT gst_registered,gst_basis,abn FROM core.companies WHERE id=@company FOR UPDATE", ct, ("company", company))).Single();
        if (registered && before["abn"] is not string) throw new BusinessException("company_abn_required", "A valid company ABN is required for GST registration configuration.");
        if ((bool)before["gst_registered"]! == registered && (string)before["gst_basis"]! == basis) { await s.Transaction.CommitAsync(ct); return; }
        if ((await Sql.RowsAsync(s, "SELECT id FROM accounting.customer_advances WHERE company_id=@company UNION ALL SELECT id FROM purchase.bills WHERE company_id=@company UNION ALL SELECT id FROM accounting.supplier_advances WHERE company_id=@company LIMIT 1", ct, ("company", company))).Count > 0)
            throw new BusinessException("tax_transition_required", "Existing advances or supplier bills/prepayments require a controlled GST registration/basis transition.", 409);
        await Sql.RowsAsync(s, "UPDATE core.companies SET gst_registered=@registered,gst_basis=@basis,version=version+1 WHERE id=@company", ct, ("company", company), ("registered", registered), ("basis", basis));
        await Sql.AuditAsync(s, "accounting.tax_configured", "company", company, "tax-registration-cli", ct, new { before, gstRegistered = registered, gstBasis = basis });
        await s.Transaction.CommitAsync(ct);
    }
}
