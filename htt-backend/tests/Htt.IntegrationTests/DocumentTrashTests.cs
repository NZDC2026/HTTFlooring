using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Htt.Host.Api;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Purchasing;
using Htt.Host.Api.Sales;
using Htt.Infrastructure;
using Htt.Infrastructure.Documents;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class DocumentTrashTests(DatabaseFixture db):IClassFixture<DatabaseFixture>
{
    private sealed record InvoiceData(SalesData Sales,Guid Order,Guid OrderLine,JsonElement Invoice,Guid? Movement=null)
    {public Guid Id=>Invoice.GetProperty("id").GetGuid();public Guid Line=>Invoice.GetProperty("lines")[0].GetProperty("id").GetGuid();}
    private Task<object?> S(string sql,params(string,object)[] args)=>db.OwnerScalarAsync(sql,args);
    private static Task<JsonElement> Life(HttpClient c,Guid id)=>Get(c,$"/documents/{id}/lifecycle");
    private static async Task<HttpResponseMessage> Change(HttpClient c,Guid id,bool restore=false,long life=1,long business=1,string? key=null,string reason="Reviewed deletion",bool delete=false)
    {
        using var request=new HttpRequestMessage(delete?HttpMethod.Delete:HttpMethod.Post,$"/api/v1/documents/{id}"+(delete?"":restore?"/restore":"/trash"));
        request.Headers.Add("Idempotency-Key",key??Guid.NewGuid().ToString());request.Headers.Add("If-Match",$"\"{life}\"");request.Headers.Add("X-Document-Version",business.ToString());request.Content=JsonContent.Create(new DocumentTrashInput(reason));return await c.SendAsync(request);
    }
    private async Task<(SalesData Sales,Guid Id)> Draft(HttpClient c)
    {var d=await Setup(db,c);return(d,await Create(c,"/quotes",d.Draft()));}
    private async Task<(SalesData Sales,Guid Id,Guid Line)> Purchase(HttpClient c)
    {
        var d=await Setup(db,c,0);var supplier=await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Trash supplier",null));
        var p=await Expect(await Send(c,HttpMethod.Post,"/purchase-orders",new PurchaseOrderInput(supplier,d.Warehouse,[new(d.BoxUnit,2,10)])),HttpStatusCode.Created);
        return(d,p.GetProperty("order").GetProperty("id").GetGuid(),p.GetProperty("lines")[0].GetProperty("id").GetGuid());
    }
    private async Task<InvoiceData> Invoiced(HttpClient c,string basis="CASH",bool stock=false,decimal price=22)
    {
        await S("UPDATE core.companies SET gst_registered=true,gst_basis=@basis WHERE id=@company",("company",db.Company),("basis",basis));var d=await Setup(db,c,stock?4.4m:0);
        if(!stock){var p=await Get(c,$"/products/{d.Product}");await Expect(await Send(c,HttpMethod.Put,$"/products/{d.Product}",new ProductMaintenance(p.GetProperty("sku").GetString()!,"Trash service",p.GetProperty("taxCodeId").GetGuid(),ItemType:"SERVICE",WholePacks:false),1),HttpStatusCode.OK);}
        var q=await Submitted(c,d.Draft() with{Lines=[new(d.BoxUnit,Quantity:2,UnitPrice:price)]});var o=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();var line=(await Get(c,$"/sales-orders/{o}")).GetProperty("lines")[0].GetProperty("id").GetGuid();Guid? movement=null;
        if(stock){await StockValuation.InitializeAsync(db.Owner,db.Company,d.Warehouse,d.Product,20.01m,Code(),DatabaseFixture.Issuer,db.Subject);var pick=await Expect(await Send(c,HttpMethod.Post,$"/warehouse/orders/{o}/picks",new PickInput([new(line,2)]),1),HttpStatusCode.Created);await Expect(await Send(c,HttpMethod.Post,$"/warehouse/picks/{pick.GetProperty("id").GetGuid()}/confirm",new DispatchInput("PICKUP","Customer",Code()),1),HttpStatusCode.OK);movement=(await Get(c,$"/warehouse/orders/{o}/returnable")).GetProperty("movements")[0].GetProperty("stockMovementId").GetGuid();}
        var version=(await Get(c,$"/sales-orders/{o}/invoiceable")).GetProperty("version").GetInt64();var i=await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{o}/invoices",new InvoiceInput([new(line,2)],"Completed"),version),HttpStatusCode.Created);return new(d,o,line,i,movement);
    }
    private static Task<HttpResponseMessage> Credit(HttpClient c,InvoiceData d,decimal quantity=2,Guid? returned=null)=>Send(c,HttpMethod.Post,$"/sales-invoices/{d.Id}/credit-notes",new CreditNoteInput("Legally reverse supply",[new(d.Line,quantity,returned)]));
    private static Task<HttpResponseMessage> Pay(HttpClient c,InvoiceData d)=>Send(c,HttpMethod.Post,$"/customers/{d.Sales.Customer}/receipts",new CustomerReceiptInput(D(d.Invoice.GetProperty("gross")),"BANK_TRANSFER",Code(),[new(d.Line,D(d.Invoice.GetProperty("gross")))]));
    private static Task<HttpResponseMessage> Refund(HttpClient c,InvoiceData d,JsonElement credit)=>Send(c,HttpMethod.Post,$"/customers/{d.Sales.Customer}/refunds",new CustomerRefundInput(D(credit.GetProperty("gross")),Code(),"Verified refund",credit.GetProperty("lines")[0].GetProperty("id").GetGuid()));
    private async Task<string> FinancialSnapshot()
    {
        var tables=new[]{"platform.documents","platform.document_lines","sales.quotes","sales.quote_lines","sales.orders","sales.order_lines","sales.invoices","sales.invoice_lines","sales.credit_notes","sales.credit_note_lines","sales.credit_commitments","inventory.stock_balances","inventory.stock_reservations","inventory.stock_movements","inventory.stock_values","accounting.posting_batches","accounting.journal_entries","accounting.journal_lines","accounting.receivable_items","accounting.payment_allocations","accounting.gst_attributions","accounting.gst_adjustments","accounting.customer_refunds","crm.customer_credit_exposures","purchase.orders","purchase.order_lines"};
        var hashes=new List<string>();foreach(var t in tables)hashes.Add((string)(await S($"SELECT md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)::text)::text,'[]')) FROM {t} t WHERE company_id=@company",("company",db.Company)))!);return string.Join(':',hashes);
    }
    [Fact]
    public async Task Draft_quote_trash_hides_lists_details_mutations_and_restore_preserves_exact_contents_and_versions()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Draft(c);var original=(await Get(c,$"/quotes/{d.Id}")).GetRawText();var before=await FinancialSnapshot();
        var hidden=await Expect(await Change(c,d.Id,delete:true),HttpStatusCode.OK);Assert.True(hidden.GetProperty("isTrashed").GetBoolean());Assert.Equal(2,hidden.GetProperty("lifecycleVersion").GetInt32());Assert.Equal(before,await FinancialSnapshot());
        await Expect(await c.GetAsync($"/api/v1/quotes/{d.Id}"),HttpStatusCode.NotFound);await Expect(await Send(c,HttpMethod.Put,$"/quotes/{d.Id}",d.Sales.Draft(),1),HttpStatusCode.NotFound);await Expect(await Send(c,HttpMethod.Post,$"/quotes/{d.Id}/submit",version:1),HttpStatusCode.NotFound);
        Assert.DoesNotContain((await Get(c,"/quotes")).GetProperty("items").EnumerateArray(),x=>x.GetProperty("id").GetGuid()==d.Id);Assert.Contains((await Get(c,"/documents/trash?documentType=QUOTE")).GetProperty("items").EnumerateArray(),x=>x.GetProperty("id").GetGuid()==d.Id);
        await Expect(await Change(c,d.Id,true,2),HttpStatusCode.OK);Assert.Equal(original,(await Get(c,$"/quotes/{d.Id}")).GetRawText());Assert.Equal(before,await FinancialSnapshot());Assert.False((await Life(c,d.Id)).GetProperty("isTrashed").GetBoolean());
        await Expect(await Send(c,HttpMethod.Post,$"/quotes/{d.Id}/submit",version:1),HttpStatusCode.OK);
    }
    [Fact]
    public async Task Purchase_draft_restores_without_new_number_or_lines_then_can_be_confirmed_once()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Purchase(c);var before=await FinancialSnapshot();await Expect(await Change(c,d.Id),HttpStatusCode.OK);await Expect(await c.GetAsync($"/api/v1/purchase-orders/{d.Id}"),HttpStatusCode.NotFound);
        Assert.DoesNotContain((await Get(c,"/purchase-orders")).GetProperty("items").EnumerateArray(),x=>x.GetProperty("id").GetGuid()==d.Id);await Expect(await Change(c,d.Id,true,2),HttpStatusCode.OK);Assert.Equal(before,await FinancialSnapshot());
        var p=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{d.Id}/confirm",version:1),HttpStatusCode.OK);Assert.StartsWith("PO-",p.GetProperty("order").GetProperty("number").GetString());Assert.Equal(d.Line,p.GetProperty("lines")[0].GetProperty("id").GetGuid());
    }
    [Fact]
    public async Task Submitted_quote_requires_office_return_and_restoring_never_resubmits_or_reallocates_number()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c);var q=await Submitted(c,d.Draft());await Expect(await Change(c,q.Id,business:q.Version),HttpStatusCode.Conflict);
        var returned=await Expect(await Send(c,HttpMethod.Post,$"/quotes/{q.Id}/return-to-draft",new ReviewInput("Revise"),q.Version),HttpStatusCode.OK);var v=returned.GetProperty("version").GetInt64();var prior=await FinancialSnapshot();await Expect(await Change(c,q.Id,business:v),HttpStatusCode.OK);await Expect(await Change(c,q.Id,true,2,v),HttpStatusCode.OK);Assert.Equal(prior,await FinancialSnapshot());
        var resubmitted=await Expect(await Send(c,HttpMethod.Post,$"/quotes/{q.Id}/submit",version:v),HttpStatusCode.OK);Assert.Equal(returned.GetProperty("number").GetString(),resubmitted.GetProperty("number").GetString());
    }
    [Fact]
    public async Task Confirmed_order_requires_cancellation_and_restore_never_reopens_credit_or_reservations()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c);var q=await Submitted(c,d.Draft());var id=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();await Expect(await Change(c,id),HttpStatusCode.Conflict);
        var cancelled=await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{id}/cancel",new ReviewInput("Supply cancelled"),1),HttpStatusCode.OK);var v=cancelled.GetProperty("version").GetInt64();var before=await FinancialSnapshot();await Expect(await Change(c,id,business:v),HttpStatusCode.OK);await Expect(await Change(c,id,true,2,v),HttpStatusCode.OK);Assert.Equal(before,await FinancialSnapshot());Assert.Equal("CANCELLED",(await Get(c,$"/sales-orders/{id}")).GetProperty("state").GetString());
    }
    [Fact]
    public async Task Confirmed_purchase_order_requires_closure_and_closed_order_does_not_reopen_on_restore()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Purchase(c);await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{d.Id}/confirm",version:1),HttpStatusCode.OK);var v=(await Life(c,d.Id)).GetProperty("documentVersion").GetInt64();await Expect(await Change(c,d.Id,business:v),HttpStatusCode.Conflict);
        await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{d.Id}/close",new PurchaseCloseInput("Cancel remaining"),v),HttpStatusCode.OK);v=(await Life(c,d.Id)).GetProperty("documentVersion").GetInt64();var before=await FinancialSnapshot();await Expect(await Change(c,d.Id,business:v),HttpStatusCode.OK);await Expect(await Change(c,d.Id,true,2,v),HttpStatusCode.OK);Assert.Equal(before,await FinancialSnapshot());Assert.Equal("CLOSED",(await Get(c,$"/purchase-orders/{d.Id}")).GetProperty("order").GetProperty("status").GetString());
    }
    [Theory]
    [InlineData("CASH",false)][InlineData("NON_CASH",false)][InlineData("CASH",true)][InlineData("NON_CASH",true)]
    public async Task Posted_or_paid_invoice_cannot_be_deleted_in_place(string basis,bool paid)
    {await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Invoiced(c,basis);if(paid)await Expect(await Pay(c,d),HttpStatusCode.Created);var before=await FinancialSnapshot();await Expect(await Change(c,d.Id,business:d.Invoice.GetProperty("version").GetInt64()),HttpStatusCode.Conflict);Assert.Equal(before,await FinancialSnapshot());}
    [Theory]
    [InlineData("CASH",false)][InlineData("NON_CASH",false)][InlineData("CASH",true)][InlineData("NON_CASH",true)]
    public async Task Legally_credited_invoice_only_hides_after_refunds_and_restore_keeps_all_GST_AR_and_GL_unchanged(string basis,bool paid)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Invoiced(c,basis);if(paid)await Expect(await Pay(c,d),HttpStatusCode.Created);var credit=await Expect(await Credit(c,d),HttpStatusCode.Created);var version=d.Invoice.GetProperty("version").GetInt64();
        if(paid){await Expect(await Change(c,d.Id,business:version),HttpStatusCode.Conflict);await Expect(await Refund(c,d,credit),HttpStatusCode.Created);}
        var before=await FinancialSnapshot();await Expect(await Change(c,d.Id,business:version),HttpStatusCode.OK);await Expect(await c.GetAsync($"/api/v1/sales-invoices/{d.Id}"),HttpStatusCode.NotFound);Assert.Equal(before,await FinancialSnapshot());
        Assert.Contains((await Get(c,$"/customers/{d.Sales.Customer}/receivables")).GetProperty("items").EnumerateArray(),x=>x.GetProperty("invoiceId").GetGuid()==d.Id);await Get(c,$"/sales-credit-notes/{credit.GetProperty("id").GetGuid()}");
        await Expect(await Change(c,d.Id,true,2,version),HttpStatusCode.OK);Assert.Equal(before,await FinancialSnapshot());Assert.Equal("POSTED",(await Get(c,$"/sales-invoices/{d.Id}")).GetProperty("state").GetString());
    }
    [Fact]
    public async Task Partial_credit_is_insufficient_and_refunded_credit_note_is_still_not_a_reversed_credit_note()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Invoiced(c);await Expect(await Pay(c,d),HttpStatusCode.Created);var credit=await Expect(await Credit(c,d,1),HttpStatusCode.Created);await Expect(await Change(c,d.Id,business:d.Invoice.GetProperty("version").GetInt64()),HttpStatusCode.Conflict);await Expect(await Refund(c,d,credit),HttpStatusCode.Created);var id=credit.GetProperty("id").GetGuid();await Expect(await Change(c,id,business:credit.GetProperty("version").GetInt64()),HttpStatusCode.Conflict);await Get(c,$"/sales-credit-notes/{id}");
    }
    [Theory]
    [InlineData("CASH")][InlineData("NON_CASH")]
    public async Task Stock_return_and_credit_cost_postings_are_retained_across_invoice_visibility_cycles(string basis)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Invoiced(c,basis,true);var r=await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{d.Order}/returns",new SalesReturnInput(d.Sales.Warehouse,"RESTOCK","Inspected full return",[new(d.Movement!.Value,2,d.Line)])),HttpStatusCode.Created);await Expect(await Credit(c,d,2,r.GetProperty("lines")[0].GetProperty("id").GetGuid()),HttpStatusCode.Created);var before=await FinancialSnapshot();var v=d.Invoice.GetProperty("version").GetInt64();await Expect(await Change(c,d.Id,business:v),HttpStatusCode.OK);await Expect(await Change(c,d.Id,true,2,v),HttpStatusCode.OK);Assert.Equal(before,await FinancialSnapshot());
    }
    [Fact]
    public async Task Zero_value_invoice_still_requires_quantity_reversal()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Invoiced(c,price:0);var v=d.Invoice.GetProperty("version").GetInt64();await Expect(await Change(c,d.Id,business:v),HttpStatusCode.Conflict);await Expect(await Credit(c,d),HttpStatusCode.Created);await Expect(await Change(c,d.Id,business:v),HttpStatusCode.OK);
    }
    [Fact]
    public async Task Visibility_and_business_versions_both_protect_against_stale_commands()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Draft(c);await Expect(await Send(c,HttpMethod.Put,$"/quotes/{d.Id}",d.Sales.Draft() with{Notes="Latest draft"},1),HttpStatusCode.OK);await Expect(await Change(c,d.Id),HttpStatusCode.Conflict);await Expect(await Change(c,d.Id,business:2),HttpStatusCode.OK);await Expect(await Change(c,d.Id,true,1,2),HttpStatusCode.Conflict);await Expect(await Change(c,d.Id,true,2,2),HttpStatusCode.OK);await Expect(await Change(c,d.Id,life:1,business:2),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Idempotency_replays_original_result_without_redeleting_a_restored_document_and_hash_conflicts_fail()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Draft(c);var key=Code();await Expect(await Change(c,d.Id,key:key),HttpStatusCode.OK);await Expect(await Change(c,d.Id,key:key,delete:true),HttpStatusCode.OK);await Expect(await Change(c,d.Id,key:key,reason:"Changed"),HttpStatusCode.Conflict);await Expect(await Change(c,d.Id,true,2),HttpStatusCode.OK);await Expect(await Change(c,d.Id,key:key),HttpStatusCode.OK);Assert.False((await Life(c,d.Id)).GetProperty("isTrashed").GetBoolean());await Get(c,$"/quotes/{d.Id}");
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Concurrent_same_key_visibility_commands_execute_and_audit_once(bool restore)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Draft(c);if(restore)await Expect(await Change(c,d.Id),HttpStatusCode.OK);var key=Code();var replies=await Task.WhenAll(Enumerable.Range(0,4).Select(_=>Change(c,d.Id,restore,restore?2:1,key:key)));foreach(var r in replies)await Expect(r,HttpStatusCode.OK);
        Assert.Equal(1L,await S("SELECT count(*) FROM platform.audit_events WHERE company_id=@company AND entity_id=@id AND action=@action",("company",db.Company),("id",d.Id),("action",restore?"documents.restored":"documents.trashed")));
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Concurrent_distinct_keys_have_one_version_winner(bool restore)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Draft(c);if(restore)await Expect(await Change(c,d.Id),HttpStatusCode.OK);var replies=await Task.WhenAll(Change(c,d.Id,restore,restore?2:1),Change(c,d.Id,restore,restore?2:1));Assert.Single(replies,x=>x.StatusCode==HttpStatusCode.OK);Assert.Single(replies,x=>x.StatusCode==HttpStatusCode.Conflict);
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Trash_racing_draft_edit_or_submit_cannot_mutate_a_hidden_document(bool submit)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Draft(c);var replies=await Task.WhenAll(Change(c,d.Id),submit?Send(c,HttpMethod.Post,$"/quotes/{d.Id}/submit",version:1):Send(c,HttpMethod.Put,$"/quotes/{d.Id}",d.Sales.Draft() with{Notes="Concurrent revision"},1));Assert.Single(replies,x=>x.StatusCode==HttpStatusCode.OK);Assert.Single(replies,x=>x.StatusCode is HttpStatusCode.Conflict or HttpStatusCode.NotFound);
        var life=await Life(c,d.Id);if(life.GetProperty("isTrashed").GetBoolean()){Assert.Equal(1,life.GetProperty("documentVersion").GetInt32());await Expect(await c.GetAsync($"/api/v1/quotes/{d.Id}"),HttpStatusCode.NotFound);}else Assert.Equal(2,life.GetProperty("documentVersion").GetInt32());
    }
    [Fact]
    public async Task Sales_can_only_trash_their_owned_assigned_quote_and_list_never_leaks_unassigned_trash()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await Setup(db,admin);var a=await Staff(db,"SALES",d);var b=await Staff(db,"SALES",d);var unassigned=await Staff(db,"SALES");using var ca=api.Authenticated(a.Subject);using var cb=api.Authenticated(b.Subject);using var cu=api.Authenticated(unassigned.Subject);var id=await Create(ca,"/quotes",d.Draft());await Expect(await Change(cb,id),HttpStatusCode.Forbidden);await Expect(await Change(ca,id),HttpStatusCode.OK);await Expect(await cu.GetAsync($"/api/v1/documents/{id}/lifecycle"),HttpStatusCode.Forbidden);Assert.Empty((await Get(cu,"/documents/trash")).GetProperty("items").EnumerateArray());await Expect(await Change(cb,id,true,2),HttpStatusCode.Forbidden);await Expect(await Change(ca,id,true,2),HttpStatusCode.OK);
    }
    [Theory]
    [InlineData("WAREHOUSE")][InlineData("PRICING_MANAGER")]
    public async Task Roles_without_trash_permission_cannot_view_delete_or_restore(string role)
    {await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await Draft(admin);var user=await Staff(db,role,d.Sales);using var c=api.Authenticated(user.Subject);await Expect(await c.GetAsync("/api/v1/documents/trash"),HttpStatusCode.Forbidden);await Expect(await Change(c,d.Id),HttpStatusCode.Forbidden);await Expect(await Change(c,d.Id,true,2),HttpStatusCode.Forbidden);}
    [Fact]
    public async Task Cross_company_and_unknown_documents_do_not_expose_lifecycle_and_portal_tokens_are_rejected()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Draft(c);using var other=api.Authenticated(company:db.OtherCompany);await Expect(await other.GetAsync($"/api/v1/documents/{d.Id}/lifecycle"),HttpStatusCode.NotFound);await Expect(await Change(other,d.Id),HttpStatusCode.NotFound);await Expect(await Change(c,Guid.NewGuid()),HttpStatusCode.NotFound);using var portal=api.Authenticated(audience:"htt-test-portal");Assert.Equal(HttpStatusCode.Unauthorized,(await portal.GetAsync("/api/v1/documents/trash")).StatusCode);
    }
    [Fact]
    public async Task Cached_command_replay_rechecks_current_customer_scope()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await Setup(db,admin);var staff=await Staff(db,"SALES",d);using var c=api.Authenticated(staff.Subject);var id=await Create(c,"/quotes",d.Draft());var key=Code();await Expect(await Change(c,id,key:key),HttpStatusCode.OK);await S("DELETE FROM identity.customer_assignments WHERE company_id=@company AND membership_id=@membership",("company",db.Company),("membership",staff.Membership));await Expect(await Change(c,id,key:key),HttpStatusCode.Forbidden);
    }
    [Theory]
    [InlineData("&page=0")][InlineData("&pageSize=101")][InlineData("&documentType=JOURNAL")]
    public async Task Trash_list_validates_filters(string query)
    {await using var api=new TestApi(db);using var c=api.Authenticated();await Expect(await c.GetAsync("/api/v1/documents/trash?"+query.TrimStart('&')),HttpStatusCode.UnprocessableEntity);}
    [Fact]
    public async Task SQL_cannot_bypass_visibility_or_legacy_delete_markers()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Draft(c);
        await using(var s=await db.SessionAsync()){var ex=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(s,"UPDATE platform.documents SET deleted_at=now(),deleted_by=@actor WHERE company_id=@company AND id=@id",default,("company",db.Company),("actor",db.Actor),("id",d.Id)));Assert.Equal("23514",ex.SqlState);}
        await Expect(await Change(c,d.Id),HttpStatusCode.OK);
        foreach(var sql in new[]{"UPDATE sales.quotes SET notes='bypass' WHERE company_id=@company AND id=@id","DELETE FROM sales.quote_lines WHERE company_id=@company AND quote_id=@id","UPDATE platform.documents SET state='CONFIRMED' WHERE company_id=@company AND id=@id"})
        {await using var s=await db.SessionAsync();var ex=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(s,sql,default,("company",db.Company),("id",d.Id)));Assert.Equal("HT404",ex.SqlState);}
        await using(var s=await db.SessionAsync()){var ex=await Assert.ThrowsAsync<PostgresException>(()=>Sql.RowsAsync(s,"UPDATE platform.document_visibility SET trashed_at=NULL WHERE company_id=@company AND document_id=@id",default,("company",db.Company),("id",d.Id)));Assert.Equal("42501",ex.SqlState);}
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task Audit_failure_rolls_back_visibility_and_idempotency_then_same_key_can_retry(bool restore)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Draft(c);if(restore)await Expect(await Change(c,d.Id),HttpStatusCode.OK);var key=Code();await S("CREATE FUNCTION platform.trash_test_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action IN('documents.trashed','documents.restored') THEN RAISE EXCEPTION 'injected lifecycle failure';END IF;RETURN NEW;END $$;CREATE TRIGGER trash_test_failure BEFORE INSERT ON platform.audit_events FOR EACH ROW EXECUTE FUNCTION platform.trash_test_failure()");
        try{await Expect(await Change(c,d.Id,restore,restore?2:1,key:key),HttpStatusCode.ServiceUnavailable);Assert.Equal(restore,(await Life(c,d.Id)).GetProperty("isTrashed").GetBoolean());Assert.Equal(0L,await S("SELECT count(*) FROM platform.idempotency_requests WHERE company_id=@company AND key=@key",("company",db.Company),("key",key)));}
        finally{await S("DROP TRIGGER trash_test_failure ON platform.audit_events;DROP FUNCTION platform.trash_test_failure()");}
        await Expect(await Change(c,d.Id,restore,restore?2:1,key:key),HttpStatusCode.OK);
    }
    [Theory]
    [InlineData("if-match",428)][InlineData("business-version",428)][InlineData("idempotency",400)][InlineData("reason",422)]
    public async Task Required_command_metadata_and_reasons_are_validated(string missing,int status)
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Draft(c);using var r=new HttpRequestMessage(HttpMethod.Post,$"/api/v1/documents/{d.Id}/trash");
        if(missing!="if-match")r.Headers.Add("If-Match","\"1\"");if(missing!="business-version")r.Headers.Add("X-Document-Version","1");if(missing!="idempotency")r.Headers.Add("Idempotency-Key",Code());r.Content=JsonContent.Create(new DocumentTrashInput(missing=="reason"?" ":"Reviewed"));await Expect(await c.SendAsync(r),(HttpStatusCode)status);Assert.False((await Life(c,d.Id)).GetProperty("isTrashed").GetBoolean());
    }
    [Fact]
    public async Task Repeated_cycles_use_monotonic_visibility_versions_without_changing_business_version()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Draft(c);var before=await FinancialSnapshot();for(var i=0;i<3;i++){await Expect(await Change(c,d.Id,life:1+i*2),HttpStatusCode.OK);await Expect(await Change(c,d.Id,true,2+i*2),HttpStatusCode.OK);}var state=await Life(c,d.Id);Assert.Equal(7,state.GetProperty("lifecycleVersion").GetInt32());Assert.Equal(1,state.GetProperty("documentVersion").GetInt32());Assert.Equal(before,await FinancialSnapshot());
    }
    [Fact]
    public async Task Prepaid_order_cannot_be_cancelled_or_hidden_until_refunded()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c);var q=await Submitted(c,d.Draft());var id=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();var line=(await Get(c,$"/sales-orders/{id}")).GetProperty("lines")[0].GetProperty("id").GetGuid();await Expect(await Send(c,HttpMethod.Post,$"/customers/{d.Customer}/receipts",new CustomerReceiptInput(10,"BANK_TRANSFER",Code(),[],[new(line,10)])),HttpStatusCode.Created);await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{id}/cancel",new ReviewInput("Cancelled supply"),1),HttpStatusCode.Conflict);var version=(await Life(c,id)).GetProperty("documentVersion").GetInt64();await Expect(await Change(c,id,business:version),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Received_purchase_order_cannot_be_hidden_even_after_closing_remainder()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Purchase(c);await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{d.Id}/confirm",version:1),HttpStatusCode.OK);var v=(await Life(c,d.Id)).GetProperty("documentVersion").GetInt64();await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{d.Id}/receipts",new PurchaseReceiptInput(Code(),[new(d.Line,1)]),v),HttpStatusCode.Created);v=(await Life(c,d.Id)).GetProperty("documentVersion").GetInt64();await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{d.Id}/close",new PurchaseCloseInput("No more goods"),v),HttpStatusCode.OK);v=(await Life(c,d.Id)).GetProperty("documentVersion").GetInt64();await Expect(await Change(c,d.Id,business:v),HttpStatusCode.Conflict);
    }
    private sealed class CleanScanner:IFileScanner{public Task<bool> IsCleanAsync(byte[] bytes,CancellationToken ct)=>Task.FromResult(true);}
    private sealed class NoPdf:IPdfRenderer{public Task<byte[]> RenderAsync(JsonElement snapshot,CancellationToken ct)=>throw new InvalidOperationException("No PDF expected");}
    private sealed class NoMail:IDocumentMailer{public Task<string> SendAsync(Guid id,JsonElement message,CancellationToken ct)=>throw new InvalidOperationException("No email expected");}
    [Fact]
    public async Task Existing_attachment_is_hidden_in_trash_and_restored_without_uploading_or_scanning_again()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Draft(c);using var r=new HttpRequestMessage(HttpMethod.Post,$"/api/v1/documents/{d.Id}/attachments?fileName=evidence.pdf");r.Headers.Add("If-Match","\"1\"");r.Headers.Add("Idempotency-Key",Code());var bytes="%PDF-1.4\nfixture attachment\n%%EOF"u8.ToArray();r.Content=new ByteArrayContent(bytes);r.Content.Headers.ContentType=new("application/pdf");var upload=await Expect(await c.SendAsync(r),HttpStatusCode.Accepted);var file=upload.GetProperty("id").GetGuid();var job=upload.GetProperty("jobId").GetGuid();
        // Prioritize this fixture job without modifying any other company's queued work.
        await S("UPDATE platform.document_jobs SET available_at='2000-01-01' WHERE id=@id",("id",job));await using(var source=NpgsqlDataSource.Create(db.Worker))Assert.True(await new DocumentWorker(source,new NoPdf(),new CleanScanner(),new NoMail()).ProcessOneAsync());
        Assert.Equal(HttpStatusCode.OK,(await c.GetAsync($"/api/v1/files/{file}/content")).StatusCode);await Expect(await Change(c,d.Id),HttpStatusCode.OK);await Expect(await c.GetAsync($"/api/v1/files/{file}/content"),HttpStatusCode.NotFound);await Expect(await c.GetAsync($"/api/v1/documents/{d.Id}/files"),HttpStatusCode.NotFound);await Expect(await c.GetAsync($"/api/v1/document-jobs/{job}"),HttpStatusCode.NotFound);
        await Expect(await Change(c,d.Id,true,2),HttpStatusCode.OK);using var downloaded=await c.GetAsync($"/api/v1/files/{file}/content");Assert.Equal(bytes,await downloaded.Content.ReadAsByteArrayAsync());Assert.Equal(1L,await S("SELECT count(*) FROM platform.document_jobs WHERE company_id=@company AND document_id=@id",("company",db.Company),("id",d.Id)));
    }
    [Fact]
    public async Task Queued_or_unknown_output_must_be_resolved_before_trash()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Setup(db,c);var q=await Submitted(c,d.Draft());var job=await Expect(await Send(c,HttpMethod.Post,$"/documents/{q.Id}/pdf",version:q.Version),HttpStatusCode.Accepted);var id=job.GetProperty("id").GetGuid();var returned=await Expect(await Send(c,HttpMethod.Post,$"/quotes/{q.Id}/return-to-draft",new ReviewInput("Revision"),q.Version),HttpStatusCode.OK);var v=returned.GetProperty("version").GetInt64();await Expect(await Change(c,q.Id,business:v),HttpStatusCode.Conflict);
        await S("UPDATE platform.document_jobs SET state='UNKNOWN' WHERE company_id=@company AND id=@id",("company",db.Company),("id",id));await Expect(await Change(c,q.Id,business:v),HttpStatusCode.Conflict);await S("UPDATE platform.document_jobs SET state='FAILED' WHERE company_id=@company AND id=@id",("company",db.Company),("id",id));await Expect(await Change(c,q.Id,business:v),HttpStatusCode.OK);
    }
    [Fact]
    public async Task New_document_work_waiting_on_registry_lock_cannot_enter_after_trash_commits()
    {
        await using var api=new TestApi(db);using var c=api.Authenticated();var d=await Draft(c);await using var app=await db.SessionAsync();
        var pid=(int)(await Sql.RowsAsync(app,"SELECT pg_backend_pid() AS pid",default)).Single()["pid"]!;
        await using var owner=new NpgsqlConnection(db.Owner);await owner.OpenAsync();await using var tx=await owner.BeginTransactionAsync();await using var cmd=new NpgsqlCommand("SELECT set_config('htt.company_id',@company::text,true),set_config('htt.actor_id',@actor::text,true)",owner,tx);cmd.Parameters.AddWithValue("company",db.Company);cmd.Parameters.AddWithValue("actor",db.Actor);cmd.Parameters.AddWithValue("id",d.Id);cmd.Parameters.AddWithValue("pid",pid);await cmd.ExecuteNonQueryAsync();cmd.CommandText="SELECT id FROM platform.documents WHERE company_id=@company AND id=@id FOR UPDATE";await cmd.ExecuteScalarAsync();
        var insert=Sql.RowsAsync(app,"INSERT INTO platform.document_jobs(company_id,document_id,source_version,kind,payload,created_by) VALUES(@company,@id,1,'PDF','{}',@actor)",default,("company",db.Company),("id",d.Id),("actor",db.Actor));
        var waiting=false;for(var i=0;i<80;i++){cmd.CommandText="SELECT pg_stat_clear_snapshot()";await cmd.ExecuteNonQueryAsync();cmd.CommandText="SELECT wait_event_type='Lock' FROM pg_stat_activity WHERE pid=@pid";if(await cmd.ExecuteScalarAsync() is true){waiting=true;break;}await Task.Delay(25);}Assert.True(waiting);
        cmd.CommandText="SELECT platform.change_visibility(@id,1,1,false,'Concurrent trash')";await cmd.ExecuteNonQueryAsync();await tx.CommitAsync();var rejected=await Assert.ThrowsAsync<PostgresException>(()=>insert);Assert.Equal("HT404",rejected.SqlState);Assert.Equal(0L,await S("SELECT count(*) FROM platform.document_jobs WHERE company_id=@company AND document_id=@id",("company",db.Company),("id",d.Id)));
    }
    [Fact]
    public async Task Cached_visibility_response_cannot_bypass_revoked_trash_read_permission()
    {
        await using var api=new TestApi(db);using var admin=api.Authenticated();var d=await Setup(db,admin);var staff=await Staff(db,"SALES",d);using var c=api.Authenticated(staff.Subject);var id=await Create(c,"/quotes",d.Draft());var key=Code();await Expect(await Change(c,id,key:key),HttpStatusCode.OK);
        await S("DELETE FROM identity.role_permissions p USING identity.roles r WHERE p.company_id=@company AND p.role_id=r.id AND r.company_id=p.company_id AND r.code='SALES' AND p.permission_code='documents.trash.read'",("company",db.Company));
        try{await Expect(await Change(c,id,key:key),HttpStatusCode.Forbidden);}
        finally{await S("SELECT identity.seed_trash_roles(@company)",("company",db.Company));}
    }
}
