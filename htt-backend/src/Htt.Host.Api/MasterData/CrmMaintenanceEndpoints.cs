using Htt.Infrastructure;
using Htt.SharedKernel;
using NpgsqlTypes;
using System.Text.Json.Serialization;
using static Htt.Host.Api.MasterData.MasterDataSupport;

namespace Htt.Host.Api.MasterData;

public sealed record CustomerMaintenance(string Code, string LegalName, string? Abn, string Status, [property: JsonRequired] decimal CreditLimit, [property: JsonRequired] int PaymentTermsDays);
public sealed record SupplierMaintenance(string Code, string LegalName, string? Abn, int? PaymentTermsDays = null, string Status = "ACTIVE");
public sealed record BranchMaintenance(string Code, string Name, string AddressLine1, string? Suburb, string? State, string? Postcode, string Country = "AU", bool Active = true);
public sealed record ContactMaintenance(string Name, string? Email = null, string? Phone = null, string? Mobile = null, string? JobTitle = null, bool IsAccounting = false, bool Active = true, Guid[]? BranchIds = null);

internal static class CrmMaintenanceEndpoints
{
    public static void MapCrm(RouteGroupBuilder group)
    {
        group.MapGet("/customers/{customerId:guid}", async (Guid customerId, HttpContext h, CompanySession s, CancellationToken ct) =>
        {
            await Customer(h, s, customerId, ct);
            return Results.Ok(PublicRow(await One(s, "SELECT c.id,c.code,c.status,c.credit_limit,c.payment_terms_days,c.version,p.legal_name,p.abn FROM crm.customers c JOIN crm.parties p ON p.company_id=c.company_id AND p.id=c.party_id WHERE c.company_id=@company AND c.id=@id", ct, new DbArg("id", customerId))));
        }).WithMetadata(new Permission("customers.read"));
        group.MapPut("/customers/{customerId:guid}", UpdateCustomer).WithMetadata(new Permission("customers.write"));
        group.MapGet("/customers/{customerId:guid}/branches", async (Guid customerId, HttpContext h, CompanySession s, int? page, int? pageSize, CancellationToken ct) =>
        {
            await Customer(h, s, customerId, ct);
            var (offset, size) = Page(page, pageSize);
            return Results.Ok(new { items = (await Read(s, "SELECT * FROM crm.customer_branches WHERE company_id=@company AND customer_id=@customer ORDER BY code,id LIMIT @size OFFSET @offset", ct, new DbArg("customer", customerId), new DbArg("size", size), new DbArg("offset", offset))).Select(PublicRow), page = page ?? 1, pageSize = size });
        }).WithMetadata(new Permission("customers.read"));
        group.MapPost("/customers/{customerId:guid}/branches", CreateBranch).WithMetadata(new Permission("customers.write"));
        group.MapPut("/customers/{customerId:guid}/branches/{id:guid}", UpdateBranch).WithMetadata(new Permission("customers.write"));
        group.MapGet("/customers/{customerId:guid}/branches/{id:guid}", async (Guid customerId, Guid id, HttpContext h, CompanySession s, CancellationToken ct) =>
        {
            await Customer(h, s, customerId, ct);
            return Results.Ok(PublicRow(await One(s, "SELECT * FROM crm.customer_branches WHERE company_id=@company AND id=@id AND customer_id=@customer", ct, new DbArg("id", id), new DbArg("customer", customerId))));
        }).WithMetadata(new Permission("customers.read"));

        group.MapGet("/suppliers", async (CompanySession s, int? page, int? pageSize, CancellationToken ct) =>
        {
            var (offset, size) = Page(page, pageSize);
            return Results.Ok(new { items = (await Read(s, "SELECT su.id,su.code,su.status,su.payment_terms_days,su.version,p.legal_name,p.abn FROM crm.suppliers su JOIN crm.parties p ON p.company_id=su.company_id AND p.id=su.party_id WHERE su.company_id=@company ORDER BY su.code,su.id LIMIT @size OFFSET @offset", ct, new DbArg("size", size), new DbArg("offset", offset))).Select(PublicRow), page = page ?? 1, pageSize = size });
        }).WithMetadata(new Permission("suppliers.read"));
        group.MapGet("/suppliers/{id:guid}", async (Guid id, CompanySession s, CancellationToken ct) => Results.Ok(PublicRow(await One(s, "SELECT su.id,su.code,su.status,su.payment_terms_days,su.version,p.legal_name,p.abn FROM crm.suppliers su JOIN crm.parties p ON p.company_id=su.company_id AND p.id=su.party_id WHERE su.company_id=@company AND su.id=@id", ct, new DbArg("id", id)))))
            .WithMetadata(new Permission("suppliers.read"));
        group.MapPost("/suppliers", CreateSupplier).WithMetadata(new Permission("suppliers.write"));
        group.MapPut("/suppliers/{id:guid}", UpdateSupplier).WithMetadata(new Permission("suppliers.write"));
        MapContacts(group, true);
        MapContacts(group, false);
    }

    private static CustomerMaintenance Normalize(CustomerMaintenance d) => d with
    {
        Code = Check.Code(d.Code),
        LegalName = Check.Text(d.LegalName, "legalName"),
        Abn = string.IsNullOrWhiteSpace(d.Abn) ? null : AustralianBusinessNumber.Normalize(d.Abn),
        Status = Check.OneOf(d.Status, "status", "ACTIVE", "ON_HOLD", "INACTIVE"),
        CreditLimit = Check.Amount(d.CreditLimit, "creditLimit", 2)
    };
    private static SupplierMaintenance Normalize(SupplierMaintenance d)
    {
        Check.That(d.PaymentTermsDays is >= 0 and <= 365, "paymentTermsDays", "Terms must be 0..365 days.");
        return d with { Code = Check.Code(d.Code), LegalName = Check.Text(d.LegalName, "legalName"), Abn = string.IsNullOrWhiteSpace(d.Abn) ? null : AustralianBusinessNumber.Normalize(d.Abn), Status = Check.OneOf(d.Status, "status", "ACTIVE", "INACTIVE") };
    }
    private static BranchMaintenance Normalize(BranchMaintenance d)
    {
        var country = (d.Country ?? "").Trim().ToUpperInvariant();
        var state = Check.Optional(d.State, "state", 100)?.ToUpperInvariant();
        var postcode = Check.Optional(d.Postcode, "postcode", 20);
        Check.Address(country, state, postcode);
        return d with { Code = Check.Code(d.Code), Name = Check.Text(d.Name, "name"), AddressLine1 = Check.Text(d.AddressLine1, "addressLine1", 300), Suburb = Check.Optional(d.Suburb, "suburb"), State = state, Postcode = postcode, Country = country };
    }
    private static ContactMaintenance Normalize(ContactMaintenance d) => d with
    {
        Name = Check.Text(d.Name, "name"),
        Email = Check.Email(d.Email),
        Phone = Check.Phone(d.Phone, "phone"),
        Mobile = Check.Phone(d.Mobile, "mobile"),
        JobTitle = Check.Optional(d.JobTitle, "jobTitle", 100),
        BranchIds = Check.BranchIds(d.BranchIds)
    };

    private static async Task<IResult> UpdateCustomer(Guid customerId, CustomerMaintenance input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var d = Normalize(input);
        Check.That(d.PaymentTermsDays is >= 0 and <= 365, "paymentTermsDays", "Terms must be 0..365 days.");
        var party = await Customer(h, s, customerId, ct);
        return await Update(h, s, idem, "crm.customers", customerId, d, async before =>
        {
            if ((d.CreditLimit != (decimal)before["credit_limit"]! || d.PaymentTermsDays != (int)before["payment_terms_days"]! || (string)before["status"]! == "ON_HOLD" && d.Status != "ON_HOLD") && !Access(h).Has("customers.credit.write"))
                throw new BusinessException("permission_denied", "Credit limits, terms and hold releases require credit permission.", 403);
            await SharedPartyPermission(h, s, party, true, ct);
            var oldParty = await One(s, "SELECT legal_name,abn FROM crm.parties WHERE company_id=@company AND id=@party FOR UPDATE", ct, new DbArg("party", party));
            before["party"] = PublicRow(oldParty);
            await Read(s, "UPDATE crm.parties SET legal_name=@name,abn=@abn WHERE company_id=@company AND id=@party", ct, new DbArg("name", d.LegalName), new DbArg("abn", d.Abn, NpgsqlDbType.Varchar), new DbArg("party", party));
            await Read(s, "UPDATE crm.customers SET code=@code,status=@status,credit_limit=@credit,payment_terms_days=@terms WHERE company_id=@company AND id=@id", ct, new DbArg("code", d.Code), new DbArg("status", d.Status), new DbArg("credit", d.CreditLimit), new DbArg("terms", d.PaymentTermsDays), new DbArg("id", customerId));
        }, ct);
    }
    private static async Task SharedPartyPermission(HttpContext h, CompanySession s, Guid party, bool fromCustomer, CancellationToken ct)
    {
        if (fromCustomer)
        {
            if ((await Read(s, "SELECT id FROM crm.suppliers WHERE company_id=@company AND party_id=@party", ct, new DbArg("party", party))).Count > 0 && !Access(h).Has("suppliers.write"))
                throw new BusinessException("permission_denied", "This shared customer/supplier party requires both maintenance permissions.", 403);
        }
        else
        {
            foreach (var customer in await Read(s, "SELECT id FROM crm.customers WHERE company_id=@company AND party_id=@party", ct, new DbArg("party", party)))
            {
                if (!Access(h).Has("customers.write")) throw new BusinessException("permission_denied", "This shared party also requires customer maintenance permission.", 403);
                await Customer(h, s, (Guid)customer["id"]!, ct);
            }
        }
    }
    private static async Task<IResult> CreateBranch(Guid customerId, BranchMaintenance input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var d = Normalize(input); await Customer(h, s, customerId, ct);
        return await Create(h, s, idem, "crm.customer_branches", d, async id => { await Read(s, "INSERT INTO crm.customer_branches(id,company_id,customer_id,code,name,address_line1,suburb,state,postcode,country,active,created_by) VALUES(@id,@company,@customer,@code,@name,@address,@suburb,@state,@postcode,@country,@active,@actor)", ct, BranchArgs(d, id, customerId)); }, ct);
    }
    private static async Task<IResult> UpdateBranch(Guid customerId, Guid id, BranchMaintenance input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var d = Normalize(input); await Customer(h, s, customerId, ct);
        await One(s, "SELECT id FROM crm.customer_branches WHERE company_id=@company AND id=@id AND customer_id=@customer", ct, new DbArg("id", id), new DbArg("customer", customerId));
        return await Update(h, s, idem, "crm.customer_branches", id, d, async _ => { await Read(s, "UPDATE crm.customer_branches SET code=@code,name=@name,address_line1=@address,suburb=@suburb,state=@state,postcode=@postcode,country=@country,active=@active WHERE company_id=@company AND id=@id AND customer_id=@customer", ct, BranchArgs(d, id, customerId)); }, ct);
    }
    private static DbArg[] BranchArgs(BranchMaintenance d, Guid id, Guid customer) => [new DbArg("id", id), new DbArg("customer", customer), new DbArg("code", d.Code), new DbArg("name", d.Name), new DbArg("address", d.AddressLine1), new DbArg("suburb", d.Suburb, NpgsqlDbType.Text), new DbArg("state", d.State, NpgsqlDbType.Text), new DbArg("postcode", d.Postcode, NpgsqlDbType.Text), new DbArg("country", d.Country), new DbArg("active", d.Active)];
    private static async Task<IResult> CreateSupplier(SupplierMaintenance input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var requestedTerms=input.PaymentTermsDays;var d = Normalize(input with{PaymentTermsDays=input.PaymentTermsDays??await DiscoverySettingsEndpoints.DefaultTerms(s,true,ct)});
        return await Create(h, s, idem, "crm.suppliers", d with{PaymentTermsDays=requestedTerms}, async id =>
        {
            var party = Guid.NewGuid();
            await Read(s, "INSERT INTO crm.parties(id,company_id,legal_name,abn,created_by) VALUES(@party,@company,@name,@abn,@actor); INSERT INTO crm.suppliers(id,company_id,party_id,code,status,payment_terms_days,created_by) VALUES(@id,@company,@party,@code,@status,@terms,@actor)", ct, new DbArg("party", party), new DbArg("name", d.LegalName), new DbArg("abn", d.Abn, NpgsqlDbType.Varchar), new DbArg("id", id), new DbArg("code", d.Code), new DbArg("status", d.Status), new DbArg("terms", d.PaymentTermsDays));
        }, ct);
    }
    private static async Task<IResult> UpdateSupplier(Guid id, SupplierMaintenance input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct)
    {
        var requestedTerms=input.PaymentTermsDays;var d = Normalize(input with{PaymentTermsDays=input.PaymentTermsDays??await DiscoverySettingsEndpoints.DefaultTerms(s,true,ct)});
        return await Update(h, s, idem, "crm.suppliers", id, d with{PaymentTermsDays=requestedTerms}, async before =>
        {
            var party = (Guid)before["party_id"]!; await SharedPartyPermission(h, s, party, false, ct);
            before["party"] = PublicRow(await One(s, "SELECT legal_name,abn FROM crm.parties WHERE company_id=@company AND id=@party FOR UPDATE", ct, new DbArg("party", party)));
            await Read(s, "UPDATE crm.parties SET legal_name=@name,abn=@abn WHERE company_id=@company AND id=@party; UPDATE crm.suppliers SET code=@code,status=@status,payment_terms_days=@terms WHERE company_id=@company AND id=@id", ct, new DbArg("party", party), new DbArg("name", d.LegalName), new DbArg("abn", d.Abn, NpgsqlDbType.Varchar), new DbArg("id", id), new DbArg("code", d.Code), new DbArg("status", d.Status), new DbArg("terms", d.PaymentTermsDays));
        }, ct);
    }

    private static void MapContacts(RouteGroupBuilder group, bool customer)
    {
        var path = customer ? "/customers/{parentId:guid}/contacts" : "/suppliers/{parentId:guid}/contacts";
        var read = customer ? "customers.read" : "suppliers.read";
        var write = customer ? "customers.write" : "suppliers.write";
        group.MapGet(path, async (Guid parentId, HttpContext h, CompanySession s, int? page, int? pageSize, CancellationToken ct) =>
        {
            var party = await ParentParty(h, s, parentId, customer, ct); var (offset, size) = Page(page, pageSize);
            var rows = await Read(s, "SELECT c.*,ARRAY(SELECT l.customer_branch_id FROM crm.contact_branch_links l WHERE l.company_id=c.company_id AND l.contact_id=c.id ORDER BY l.customer_branch_id) AS branch_ids FROM crm.contacts c WHERE c.company_id=@company AND c.party_id=@party ORDER BY c.name,c.id LIMIT @size OFFSET @offset", ct, new DbArg("party", party), new DbArg("size", size), new DbArg("offset", offset));
            return Results.Ok(new { items = rows.Select(PublicRow), page = page ?? 1, pageSize = size });
        }).WithMetadata(new Permission(read));
        group.MapGet(path + "/{id:guid}", async (Guid parentId, Guid id, HttpContext h, CompanySession s, CancellationToken ct) =>
        {
            var party = await ParentParty(h, s, parentId, customer, ct);
            return Results.Ok(PublicRow(await One(s, "SELECT c.*,ARRAY(SELECT l.customer_branch_id FROM crm.contact_branch_links l WHERE l.company_id=c.company_id AND l.contact_id=c.id ORDER BY l.customer_branch_id) AS branch_ids FROM crm.contacts c WHERE c.company_id=@company AND c.id=@id AND c.party_id=@party", ct, new DbArg("party", party), new DbArg("id", id))));
        }).WithMetadata(new Permission(read));
        group.MapPost(path, async (Guid parentId, ContactMaintenance input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct) =>
        {
            var d = Normalize(input); var party = await ParentParty(h, s, parentId, customer, ct);
            return await Create(h, s, idem, "crm.contacts", d, async id =>
            {
                await ValidateContactBranches(s, parentId, d.BranchIds!, customer, ct);
                await SharedPartyPermission(h, s, party, customer, ct);
                await Read(s, "INSERT INTO crm.contacts(id,company_id,party_id,name,email,phone,mobile,job_title,is_accounting,active,created_by) VALUES(@id,@company,@party,@name,@email,@phone,@mobile,@job,@accounting,@active,@actor)", ct, ContactArgs(d, id, party));
                await ReplaceLinks(s, id, d.BranchIds!, ct);
            }, ct);
        }).WithMetadata(new Permission(write));
        group.MapPut(path + "/{id:guid}", async (Guid parentId, Guid id, ContactMaintenance input, HttpContext h, CompanySession s, Idempotency idem, CancellationToken ct) =>
        {
            var d = Normalize(input); var party = await ParentParty(h, s, parentId, customer, ct);
            await One(s, "SELECT id FROM crm.contacts WHERE company_id=@company AND id=@id AND party_id=@party", ct, new DbArg("id", id), new DbArg("party", party));
            return await Update(h, s, idem, "crm.contacts", id, d, async before =>
            {
                await ValidateContactBranches(s, parentId, d.BranchIds!, customer, ct);
                await SharedPartyPermission(h, s, party, customer, ct);
                before["branch_ids"] = (await Read(s, "SELECT customer_branch_id FROM crm.contact_branch_links WHERE company_id=@company AND contact_id=@id ORDER BY customer_branch_id", ct, new DbArg("id", id))).Select(x => (Guid)x["customer_branch_id"]!).ToArray();
                if (!customer && ((Guid[])before["branch_ids"]!).Length > 0)
                    throw new BusinessException("customer_contact_route_required", "Maintain branch-linked contacts through their customer route.", 409);
                await Read(s, "UPDATE crm.contacts SET name=@name,email=@email,phone=@phone,mobile=@mobile,job_title=@job,is_accounting=@accounting,active=@active WHERE company_id=@company AND id=@id AND party_id=@party", ct, ContactArgs(d, id, party));
                await ReplaceLinks(s, id, d.BranchIds!, ct);
            }, ct);
        }).WithMetadata(new Permission(write));
    }
    private static async Task<Guid> ParentParty(HttpContext h, CompanySession s, Guid id, bool customer, CancellationToken ct) => customer ? await Customer(h, s, id, ct) : (Guid)(await One(s, "SELECT party_id FROM crm.suppliers WHERE company_id=@company AND id=@id", ct, new DbArg("id", id)))["party_id"]!;
    private static async Task ValidateContactBranches(CompanySession s, Guid parent, Guid[] branches, bool customer, CancellationToken ct)
    {
        Check.That(customer || branches.Length == 0, "branchIds", "Supplier contacts cannot be linked through customer branch management.");
        foreach (var branch in branches) await One(s, "SELECT id FROM crm.customer_branches WHERE company_id=@company AND customer_id=@parent AND id=@id AND active", ct, new DbArg("parent", parent), new DbArg("id", branch));
    }
    private static async Task ReplaceLinks(CompanySession s, Guid contact, Guid[] branches, CancellationToken ct)
    {
        await Read(s, "DELETE FROM crm.contact_branch_links WHERE company_id=@company AND contact_id=@contact", ct, new DbArg("contact", contact));
        foreach (var branch in branches) await Read(s, "INSERT INTO crm.contact_branch_links(company_id,contact_id,customer_branch_id,created_by) VALUES(@company,@contact,@branch,@actor)", ct, new DbArg("contact", contact), new DbArg("branch", branch));
    }
    private static DbArg[] ContactArgs(ContactMaintenance d, Guid id, Guid party) => [new DbArg("id", id), new DbArg("party", party), new DbArg("name", d.Name), new DbArg("email", d.Email, NpgsqlDbType.Text), new DbArg("phone", d.Phone, NpgsqlDbType.Text), new DbArg("mobile", d.Mobile, NpgsqlDbType.Text), new DbArg("job", d.JobTitle, NpgsqlDbType.Text), new DbArg("accounting", d.IsAccounting), new DbArg("active", d.Active)];
}
