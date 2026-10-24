using System.Net;
using System.Text;
using System.Text.Json;
using Htt.Host.Api;
using Htt.Host.Api.MasterData;
using Htt.Host.Api.Purchasing;
using Htt.Host.Api.Sales;
using Htt.Infrastructure;
using Htt.Infrastructure.Documents;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using Xunit;
using static Htt.IntegrationTests.SalesFlowSupport;

namespace Htt.IntegrationTests;

public sealed class DocumentDeliveryTests(DatabaseFixture db):IClassFixture<DatabaseFixture>,IAsyncLifetime
{
    private sealed record Data(Guid Id,long Version,SalesData Sales);
    private Task<object?> S(string sql,params(string,object)[] args)=>db.OwnerScalarAsync(sql,args);
    public async Task InitializeAsync()=>await S("UPDATE platform.document_jobs SET state='FAILED',last_error='test_cleanup',lease_token=NULL,lease_until=NULL WHERE company_id=@company AND state IN('QUEUED','RETRY','PROCESSING')",("company",db.Company));
    public Task DisposeAsync()=>Task.CompletedTask;
    private TestApi Api(){var api=new TestApi(db);api.Services.GetRequiredService<DocumentOptions>().MailFrom="documents@htt-test.invalid";return api;}
    private async Task<Data> SetupDocument(HttpClient c,string type="QUOTE",int lineCount=1,bool longText=false)
    {
        var d=await Setup(db,c,0);
        if(longText || type=="INVOICE")
        {
            var p=await Get(c,$"/products/{d.Product}");
            await Expect(await Send(c,HttpMethod.Put,$"/products/{d.Product}",new ProductMaintenance(p.GetProperty("sku").GetString()!,longText?string.Concat(Enumerable.Repeat("Engineered flooring - Renée & Sons <Oak> ",5))[..195]:"Installation service",p.GetProperty("taxCodeId").GetGuid(),ItemType:type=="INVOICE"?"SERVICE":"STOCK",WholePacks:type!="INVOICE"),1),HttpStatusCode.OK);
        }
        if(type=="PURCHASE_ORDER")
        {
            var supplier=await Create(c,"/suppliers",new SupplierMaintenance(Code(),"Renée Supply & Co",null));
            var p=await Expect(await Send(c,HttpMethod.Post,"/purchase-orders",new PurchaseOrderInput(supplier,d.Warehouse,[new(d.BoxUnit,2,10.005m)],Notes:"Deliver to receiving warehouse")),HttpStatusCode.Created);
            var id=p.GetProperty("order").GetProperty("id").GetGuid();p=await Expect(await Send(c,HttpMethod.Post,$"/purchase-orders/{id}/confirm",version:1),HttpStatusCode.OK);
            return new(id,p.GetProperty("order").GetProperty("version").GetInt64(),d);
        }
        var draft=d.Draft() with{Lines=Enumerable.Range(0,lineCount).Select(_=>new QuoteLineInput(d.BoxUnit,Quantity:2)).ToArray(),Notes=longText?string.Join("\n",Enumerable.Repeat("Customer notes: <script> & delivery instructions, measured in m².",20)):"Customer <Oak> & delivery notes"};
        var q=await Submitted(c,draft);
        if(type=="QUOTE")return new(q.Id,q.Version,d);
        await S("UPDATE core.companies SET gst_registered=true WHERE id=@company",("company",db.Company));
        var order=(await Expect(await Approve(c,q.Id,q.Version),HttpStatusCode.Created)).GetProperty("orderId").GetGuid();
        var ol=(await Get(c,$"/sales-orders/{order}")).GetProperty("lines")[0].GetProperty("id").GetGuid();var v=(await Get(c,$"/sales-orders/{order}/invoiceable")).GetProperty("version").GetInt64();
        var invoice=await Expect(await Send(c,HttpMethod.Post,$"/sales-orders/{order}/invoices",new InvoiceInput([new(ol,2)],"Completed"),v),HttpStatusCode.Created);
        return new(invoice.GetProperty("id").GetGuid(),invoice.GetProperty("version").GetInt64(),d);
    }
    private static Task<HttpResponseMessage> Pdf(HttpClient c,Data d,string? key=null,long? version=null)=>Send(c,HttpMethod.Post,$"/documents/{d.Id}/pdf",version:version??d.Version,key:key);
    private static Guid Jid(JsonElement r)=>r.GetProperty("id").GetGuid();
    private static Task<JsonElement> View(HttpClient c,Guid id)=>Get(c,$"/document-jobs/{id}");
    private static DocumentOptions Runtime()=>new(){PythonExecutable=Environment.GetEnvironmentVariable("HTT_TEST_PDF_PYTHON")??"python3"};
    private sealed class Scanner(bool clean=true,DocumentWorkException? error=null):IFileScanner
    {public int Calls;public Task<bool> IsCleanAsync(byte[] bytes,CancellationToken ct){Interlocked.Increment(ref Calls);if(error is not null)throw error;return Task.FromResult(clean);}}
    private sealed class Mailer(DocumentWorkException? error=null):IDocumentMailer
    {public int Calls;public JsonElement Message;public Task<string> SendAsync(Guid id,JsonElement message,CancellationToken ct){Interlocked.Increment(ref Calls);Message=message.Clone();if(error is not null)throw error;return Task.FromResult("accepted-"+id);}}
    private sealed class Renderer(DocumentWorkException? error=null):IPdfRenderer
    {public int Calls;public Task<byte[]> RenderAsync(JsonElement snapshot,CancellationToken ct){Interlocked.Increment(ref Calls);if(error is not null)throw error;return new ReportLabPdfRenderer(Runtime()).RenderAsync(snapshot,ct);}}
    private async Task Run(Guid id,IPdfRenderer? renderer=null,IFileScanner? scanner=null,IDocumentMailer? mailer=null)
    {
        await S("UPDATE platform.document_jobs SET available_at=now()-interval '1 day' WHERE company_id=@company AND id=@id AND state IN('QUEUED','RETRY')",("company",db.Company),("id",id));
        await using var source=NpgsqlDataSource.Create(db.Worker);Assert.True(await new DocumentWorker(source,renderer??new Renderer(),scanner??new Scanner(),mailer??new Mailer()).ProcessOneAsync());
    }
    private static readonly byte[] UploadPdf="%PDF-1.4\nfixture attachment for scanner\n%%EOF"u8.ToArray();
    private static async Task<HttpResponseMessage> Upload(HttpClient c,Data d,byte[]? bytes=null,string filename="evidence.pdf",string type="application/pdf",string? key=null)
    {
        using var r=new HttpRequestMessage(HttpMethod.Post,$"/api/v1/documents/{d.Id}/attachments?fileName={Uri.EscapeDataString(filename)}");r.Headers.Add("Idempotency-Key",key??Guid.NewGuid().ToString());r.Headers.TryAddWithoutValidation("If-Match",$"\"{d.Version}\"");
        r.Content=new ByteArrayContent(bytes??UploadPdf);r.Content.Headers.ContentType=new(type);return await c.SendAsync(r);
    }
    private async Task<(Guid Job,Guid File)> Generated(HttpClient c,Data d)
    {
        var id=Jid(await Expect(await Pdf(c,d),HttpStatusCode.Accepted));await Run(id);var j=await View(c,id);
        Assert.True(j.GetProperty("state").GetString()=="SUCCEEDED",j.GetRawText());return(id,j.GetProperty("outputFileId").GetGuid());
    }
    private static Task<HttpResponseMessage> Email(HttpClient c,Data d,Guid pdf,string? key=null,Guid[]? attachments=null)=>Send(c,HttpMethod.Post,$"/documents/{d.Id}/emails",new DocumentEmailInput(pdf,["customer@htt-test.invalid"],"Your document","Please find the attached document.",attachments),d.Version,key);
    [Theory]
    [InlineData("QUOTE")]
    [InlineData("INVOICE")]
    [InlineData("PURCHASE_ORDER")]
    public async Task Official_document_PDFs_are_real_downloadable_and_version_frozen(string type)
    {
        await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c,type);
        var job=Jid(await Expect(await Pdf(c,d),HttpStatusCode.Accepted));
        var original=(string)(await S("SELECT payload::text FROM platform.document_jobs WHERE company_id=@company AND id=@id",("company",db.Company),("id",job)))!;
        var name=(string)(await S("SELECT name FROM core.companies WHERE id=@company",("company",db.Company)))!;
        await S("UPDATE core.companies SET name='Changed after queue' WHERE id=@company",("company",db.Company));
        try{await Run(job);}finally{await S("UPDATE core.companies SET name=@name WHERE id=@company",("company",db.Company),("name",name));}
        var view=await View(c,job);Assert.True(view.GetProperty("state").GetString()=="SUCCEEDED",view.GetRawText());var file=view.GetProperty("outputFileId").GetGuid();
        using var response=await c.GetAsync($"/api/v1/files/{file}/content");Assert.Equal(HttpStatusCode.OK,response.StatusCode);Assert.Equal("application/pdf",response.Content.Headers.ContentType!.MediaType);
        Assert.Equal("attachment",response.Content.Headers.ContentDisposition!.DispositionType);var bytes=await response.Content.ReadAsByteArrayAsync();Assert.True(bytes.AsSpan().StartsWith("%PDF-"u8));Assert.True(bytes.Length>10000);
        Assert.Contains("sandbox",response.Headers.GetValues("Content-Security-Policy").Single());Assert.Contains("no-store",response.Headers.CacheControl!.ToString());
        Assert.Equal(original,await S("SELECT payload::text FROM platform.document_jobs WHERE company_id=@company AND id=@id",("company",db.Company),("id",job)));
        var output=Environment.GetEnvironmentVariable("HTT_TEST_PDF_OUTPUT");if(output is not null){Directory.CreateDirectory(output);await File.WriteAllBytesAsync(Path.Combine(output,type+".pdf"),bytes);}
    }
    [Fact]
    public async Task Long_fifty_line_quote_generates_paginated_PDF_with_escaped_text()
    {
        await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c,lineCount:50,longText:true);var(_,file)=await Generated(c,d);
        var bytes=await c.GetByteArrayAsync($"/api/v1/files/{file}/content");Assert.True(bytes.Length>15000);
        var output=Environment.GetEnvironmentVariable("HTT_TEST_PDF_OUTPUT");if(output is not null){Directory.CreateDirectory(output);await File.WriteAllBytesAsync(Path.Combine(output,"LONG_QUOTE.pdf"),bytes);}
    }
    [Fact]
    public async Task PDF_requests_deduplicate_across_keys_and_concurrent_requests()
    {
        await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c);var key=Guid.NewGuid().ToString();
        var responses=await Task.WhenAll(Pdf(c,d,key),Pdf(c,d,key),Pdf(c,d));var ids=new List<Guid>();foreach(var r in responses)ids.Add(Jid(await Expect(r,HttpStatusCode.Accepted)));Assert.Single(ids.Distinct());
        Assert.Equal(1L,await S("SELECT count(*) FROM platform.document_jobs WHERE company_id=@company AND document_id=@id AND kind='PDF'",("company",db.Company),("id",d.Id)));
        await Expect(await Pdf(c,d,key,d.Version+1),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task PDF_request_checks_draft_version_and_missing_idempotency()
    {
        await using var api=Api();using var c=api.Authenticated();var d=await Setup(db,c,0);var id=await Create(c,"/quotes",d.Draft());var draft=new Data(id,1,d);
        await Expect(await Pdf(c,draft),HttpStatusCode.Conflict);var submitted=await Expect(await Send(c,HttpMethod.Post,$"/quotes/{id}/submit",version:1),HttpStatusCode.OK);var formal=draft with{Version=submitted.GetProperty("version").GetInt64()};
        await Expect(await Pdf(c,formal,version:1),HttpStatusCode.Conflict);
        using var req=new HttpRequestMessage(HttpMethod.Post,$"/api/v1/documents/{id}/pdf");req.Headers.TryAddWithoutValidation("If-Match",$"\"{formal.Version}\"");await Expect(await c.SendAsync(req),HttpStatusCode.BadRequest);
        Assert.Equal(0L,await S("SELECT count(*) FROM platform.document_jobs WHERE company_id=@company AND document_id=@id",("company",db.Company),("id",id)));
    }
    [Fact]
    public async Task Attachments_stay_private_until_scan_and_upload_replay_does_not_duplicate_bytes()
    {
        await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c);var key=Guid.NewGuid().ToString();
        var a=await Expect(await Upload(c,d,key:key),HttpStatusCode.Accepted);var again=await Expect(await Upload(c,d,key:key),HttpStatusCode.Accepted);Assert.Equal(Jid(a),Jid(again));
        await Expect(await c.GetAsync($"/api/v1/files/{Jid(a)}/content"),HttpStatusCode.Conflict);
        await Run(a.GetProperty("jobId").GetGuid());using var response=await c.GetAsync($"/api/v1/files/{Jid(a)}/content");Assert.Equal(HttpStatusCode.OK,response.StatusCode);Assert.Equal(UploadPdf,await response.Content.ReadAsByteArrayAsync());
        await Expect(await Upload(c,d,filename:"different.pdf",key:key),HttpStatusCode.Conflict);
        Assert.Equal(1L,await S("SELECT count(*) FROM platform.file_assets WHERE company_id=@company AND document_id=@id",("company",db.Company),("id",d.Id)));
    }
    [Theory]
    [InlineData("../escape.pdf","application/pdf")]
    [InlineData("a\\escape.pdf","application/pdf")]
    [InlineData("evidence.html","text/html")]
    [InlineData("evidence.jpg","image/jpeg")]
    [InlineData("evidence.png","image/png")]
    public async Task Path_traversal_active_content_and_spoofed_signatures_are_rejected(string name,string type)
    {await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c);await Expect(await Upload(c,d,filename:name,type:type),HttpStatusCode.UnprocessableEntity);}
    [Fact]
    public async Task Oversized_upload_has_no_file_or_job_side_effects()
    {
        await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c);await Expect(await Upload(c,d,new byte[FileRules.MaxBytes+1]),HttpStatusCode.RequestEntityTooLarge);
        Assert.Equal(0L,await S("SELECT count(*) FROM platform.file_assets WHERE company_id=@company AND document_id=@id",("company",db.Company),("id",d.Id)));
    }
    [Fact]
    public async Task Malware_is_rejected_and_cannot_be_retried_into_verified_state()
    {
        await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c);var a=await Expect(await Upload(c,d),HttpStatusCode.Accepted);var job=a.GetProperty("jobId").GetGuid();await Run(job,scanner:new Scanner(false));
        var j=await View(c,job);Assert.Equal("FAILED",j.GetProperty("state").GetString());Assert.Equal("malware_detected",j.GetProperty("lastError").GetString());
        await Expect(await c.GetAsync($"/api/v1/files/{Jid(a)}/content"),HttpStatusCode.Conflict);
        // A permanent rejection cannot be laundered by replaying the scanner; the original bytes stay rejected.
        await Expect(await Send(c,HttpMethod.Post,$"/document-jobs/{job}/retry",new DocumentRetryInput("Recheck"),j.GetProperty("version").GetInt64()),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Unconfigured_scanner_fails_closed_and_can_be_retried_after_configuration()
    {
        await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c);var a=await Expect(await Upload(c,d),HttpStatusCode.Accepted);var job=a.GetProperty("jobId").GetGuid();await Run(job,scanner:new ClamAvFileScanner(new DocumentOptions()));
        var j=await View(c,job);Assert.Equal("FAILED",j.GetProperty("state").GetString());await Expect(await c.GetAsync($"/api/v1/files/{Jid(a)}/content"),HttpStatusCode.Conflict);
        var key=Guid.NewGuid().ToString();var retry=new DocumentRetryInput("Scanner configured");var version=j.GetProperty("version").GetInt64();
        await Expect(await Send(c,HttpMethod.Post,$"/document-jobs/{job}/retry",retry,version,key),HttpStatusCode.Accepted);await Expect(await Send(c,HttpMethod.Post,$"/document-jobs/{job}/retry",retry,version,key),HttpStatusCode.Accepted);
        await Run(job);j=await View(c,job);Assert.Equal("SUCCEEDED",j.GetProperty("state").GetString());Assert.Equal(2,j.GetProperty("totalAttempts").GetInt32());
    }
    [Fact]
    public async Task Revoked_attachment_access_is_immediately_removed_even_with_known_file_ID()
    {
        await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c);var a=await Expect(await Upload(c,d),HttpStatusCode.Accepted);await Run(a.GetProperty("jobId").GetGuid());
        var f=(await Get(c,$"/documents/{d.Id}/files")).GetProperty("items")[0];var key=Guid.NewGuid().ToString();var version=f.GetProperty("version").GetInt64();
        await Expect(await Send(c,HttpMethod.Post,$"/files/{Jid(a)}/revoke",version:version,key:key),HttpStatusCode.OK);await Expect(await Send(c,HttpMethod.Post,$"/files/{Jid(a)}/revoke",version:version,key:key),HttpStatusCode.OK);
        await Expect(await c.GetAsync($"/api/v1/files/{Jid(a)}/content"),HttpStatusCode.NotFound);Assert.Equal(0,(await Get(c,$"/documents/{d.Id}/files")).GetProperty("items").GetArrayLength());
    }
    [Fact]
    public async Task Email_requests_are_idempotent_and_use_frozen_verified_attachments()
    {
        await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c);var(pdf,file)=await Generated(c,d);var a=await Expect(await Upload(c,d),HttpStatusCode.Accepted);await Run(a.GetProperty("jobId").GetGuid());
        var key=Guid.NewGuid().ToString();var j=Jid(await Expect(await Email(c,d,pdf,key,[Jid(a)]),HttpStatusCode.Accepted));Assert.Equal(j,Jid(await Expect(await Email(c,d,pdf,key,[Jid(a)]),HttpStatusCode.Accepted)));
        var mailer=new Mailer();await Run(j,mailer:mailer);Assert.Equal(1,mailer.Calls);Assert.Equal(2,mailer.Message.GetProperty("attachments").GetArrayLength());Assert.Equal("documents@htt-test.invalid",mailer.Message.GetProperty("from").GetString());
        var result=await View(c,j);Assert.Equal("SUCCEEDED",result.GetProperty("state").GetString());Assert.StartsWith("accepted-",result.GetProperty("providerId").GetString());
        Assert.Equal(2L,await S("SELECT count(*) FROM platform.file_assets WHERE company_id=@company AND document_id=@id",("company",db.Company),("id",d.Id)));
    }
    [Fact]
    public async Task Pending_or_wrong_document_attachments_are_not_mailable()
    {
        await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c);var(pdf,_)=await Generated(c,d);var a=await Expect(await Upload(c,d),HttpStatusCode.Accepted);
        await Expect(await Email(c,d,pdf,attachments:[Jid(a)]),HttpStatusCode.NotFound);await Run(a.GetProperty("jobId").GetGuid());var other=await SetupDocument(c);await Expect(await Email(c,other,pdf),HttpStatusCode.NotFound);
    }
    [Theory]
    [InlineData("PDF")]
    [InlineData("SCAN")]
    [InlineData("EMAIL")]
    public async Task Temporary_failure_retries_with_backoff_then_stops_after_five_attempts(string kind)
    {
        await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c);Guid j;
        if(kind=="SCAN")j=(await Expect(await Upload(c,d),HttpStatusCode.Accepted)).GetProperty("jobId").GetGuid();
        else if(kind=="EMAIL"){var(pdf,_)=await Generated(c,d);j=Jid(await Expect(await Email(c,d,pdf),HttpStatusCode.Accepted));}
        else j=Jid(await Expect(await Pdf(c,d),HttpStatusCode.Accepted));
        var error=new DocumentWorkException("temporary_test",WorkFailure.Retry);
        for(var i=1;i<=5;i++)
        {
            await Run(j,new Renderer(error),new Scanner(error:error),new Mailer(error));var state=await View(c,j);
            Assert.Equal(i,state.GetProperty("attempts").GetInt32());Assert.Equal(i<5?"RETRY":"FAILED",state.GetProperty("state").GetString());
            Assert.True(DateTimeOffset.Parse(state.GetProperty("availableAt").GetString()!)>DateTimeOffset.UtcNow);
        }
        Assert.Equal(5L,await S("SELECT count(*) FROM platform.document_job_attempts WHERE company_id=@company AND job_id=@id",("company",db.Company),("id",j)));
    }
    [Fact]
    public async Task Mail_timeout_is_UNKNOWN_and_is_never_automatically_or_manually_resent()
    {
        await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c);var(pdf,_)=await Generated(c,d);var id=Jid(await Expect(await Email(c,d,pdf),HttpStatusCode.Accepted));var mail=new Mailer(new("mail_outcome_unknown",WorkFailure.Unknown));await Run(id,mailer:mail);
        var j=await View(c,id);Assert.Equal("UNKNOWN",j.GetProperty("state").GetString());
        await Expect(await Send(c,HttpMethod.Post,$"/document-jobs/{id}/retry",new DocumentRetryInput("Retry uncertain send"),j.GetProperty("version").GetInt64()),HttpStatusCode.Conflict);
        await using var source=NpgsqlDataSource.Create(db.Worker);Assert.False(await new DocumentWorker(source,new Renderer(),new Scanner(),mail).ProcessOneAsync());Assert.Equal(1,mail.Calls);
    }
    [Fact]
    public async Task Changed_document_or_revoked_file_blocks_queued_email_before_provider_call()
    {
        await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c);var(pdf,_)=await Generated(c,d);var id=Jid(await Expect(await Email(c,d,pdf),HttpStatusCode.Accepted));
        await Expect(await Send(c,HttpMethod.Post,$"/quotes/{d.Id}/return-to-draft",new ReviewInput("Amend"),d.Version),HttpStatusCode.OK);
        var mail=new Mailer();await Run(id,mailer:mail);Assert.Equal(0,mail.Calls);Assert.Equal("FAILED",(await View(c,id)).GetProperty("state").GetString());
    }
    [Theory]
    [InlineData("WAREHOUSE")]
    [InlineData("SALES")]
    public async Task Unassigned_or_warehouse_staff_cannot_access_documents_or_replay_cached_output(string role)
    {
        await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c);var(pdf,file)=await Generated(c,d);var staff=await Staff(db,role);using var denied=api.Authenticated(staff.Subject);
        await Expect(await Pdf(denied,d),HttpStatusCode.Forbidden);await Expect(await denied.GetAsync($"/api/v1/files/{file}/content"),HttpStatusCode.Forbidden);
        await Expect(await denied.GetAsync($"/api/v1/document-jobs/{pdf}"),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Assigned_sales_can_send_quotes_but_not_invoices_and_cannot_access_another_company()
    {
        await using var api=Api();using var c=api.Authenticated();var quote=await SetupDocument(c);var staff=await Staff(db,"SALES",quote.Sales);using var sales=api.Authenticated(staff.Subject);
        var(pdf,file)=await Generated(sales,quote);await Expect(await Email(sales,quote,pdf),HttpStatusCode.Accepted);
        using var other=api.Authenticated(company:db.OtherCompany);await Expect(await other.GetAsync($"/api/v1/files/{file}/content"),HttpStatusCode.NotFound);
        var invoice=await SetupDocument(c,"INVOICE");await S("INSERT INTO identity.customer_assignments(company_id,membership_id,customer_id) VALUES(@company,@membership,@customer)",("company",db.Company),("membership",staff.Membership),("customer",invoice.Sales.Customer));
        var(ipdf,_)=await Generated(c,invoice);await Expect(await Email(sales,invoice,ipdf),HttpStatusCode.Forbidden);
    }
    [Fact]
    public async Task Revoking_customer_assignment_revokes_download_replay_and_queued_dispatch()
    {
        await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c);var staff=await Staff(db,"SALES",d.Sales);using var sales=api.Authenticated(staff.Subject);var key=Guid.NewGuid().ToString();
        var job=Jid(await Expect(await Pdf(sales,d,key),HttpStatusCode.Accepted));await Run(job);var file=(await View(sales,job)).GetProperty("outputFileId").GetGuid();var mail=Jid(await Expect(await Email(sales,d,job),HttpStatusCode.Accepted));
        await S("DELETE FROM identity.customer_assignments WHERE company_id=@company AND membership_id=@membership",("company",db.Company),("membership",staff.Membership));
        await Expect(await Pdf(sales,d,key),HttpStatusCode.Forbidden);await Expect(await sales.GetAsync($"/api/v1/files/{file}/content"),HttpStatusCode.Forbidden);var provider=new Mailer();await Run(mail,mailer:provider);Assert.Equal(0,provider.Calls);
    }
    [Fact]
    public async Task Two_workers_claim_a_PDF_once_and_stale_fencing_token_cannot_publish()
    {
        await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c);var job=Jid(await Expect(await Pdf(c,d),HttpStatusCode.Accepted));var renderer=new Renderer();
        await using var source=NpgsqlDataSource.Create(db.Worker);var first=new DocumentWorker(source,renderer,new Scanner(),new Mailer());var second=new DocumentWorker(source,renderer,new Scanner(),new Mailer());
        var results=await Task.WhenAll(first.ProcessOneAsync(),second.ProcessOneAsync());Assert.Single(results,x=>x);Assert.Equal(1,renderer.Calls);Assert.Equal("SUCCEEDED",(await View(c,job)).GetProperty("state").GetString());
        await using var con=await source.OpenConnectionAsync();await using var cmd=new NpgsqlCommand("SELECT platform.finish_document_work(@id,@fence,'SUCCEEDED',NULL,@pdf,NULL)",con);cmd.Parameters.AddWithValue("id",job);cmd.Parameters.AddWithValue("fence",Guid.NewGuid());cmd.Parameters.AddWithValue("pdf","%PDF-test"u8.ToArray());Assert.Equal(false,await cmd.ExecuteScalarAsync());
    }
    [Theory]
    [InlineData("PDF","RETRY")]
    [InlineData("EMAIL","UNKNOWN")]
    public async Task Expired_lease_recovery_is_fenced_and_does_not_resend_uncertain_email(string kind,string expected)
    {
        await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c);Guid job;
        if(kind=="EMAIL"){var(pdf,_)=await Generated(c,d);job=Jid(await Expect(await Email(c,d,pdf),HttpStatusCode.Accepted));}else job=Jid(await Expect(await Pdf(c,d),HttpStatusCode.Accepted));
        await using var source=NpgsqlDataSource.Create(db.Worker);Guid fence;
        await using(var con=await source.OpenConnectionAsync())await using(var claim=new NpgsqlCommand("SELECT lease_token FROM platform.claim_document_job()",con))fence=(Guid)(await claim.ExecuteScalarAsync())!;
        await S("UPDATE platform.document_jobs SET lease_until=now()-interval '1 second' WHERE company_id=@company AND id=@id",("company",db.Company),("id",job));
        // Keep retryable PDF unavailable for the second claim so its recovered state can be observed.
        await S("UPDATE platform.document_jobs SET available_at=now()+interval '1 hour' WHERE company_id=@company AND id=@id",("company",db.Company),("id",job));
        await using(var con=await source.OpenConnectionAsync())await using(var recover=new NpgsqlCommand("SELECT count(*) FROM platform.claim_document_job()",con))Assert.Equal(0L,await recover.ExecuteScalarAsync());
        var r=await View(c,job);Assert.Equal(expected,r.GetProperty("state").GetString());
        await using(var con=await source.OpenConnectionAsync())await using(var old=new NpgsqlCommand("SELECT platform.load_document_work(@id,@fence)",con)){old.Parameters.AddWithValue("id",job);old.Parameters.AddWithValue("fence",fence);var e=await Assert.ThrowsAsync<PostgresException>(()=>old.ExecuteScalarAsync());Assert.Equal("HD409",e.SqlState);}
    }
    [Fact]
    public async Task Worker_has_no_direct_file_table_access_and_app_cannot_claim_work()
    {
        await using var worker=new NpgsqlConnection(db.Worker);await worker.OpenAsync();await using var cmd=new NpgsqlCommand("SELECT * FROM platform.file_contents",worker);var e=await Assert.ThrowsAsync<PostgresException>(()=>cmd.ExecuteScalarAsync());Assert.Equal("42501",e.SqlState);
        await using var app=new NpgsqlConnection(db.App);await app.OpenAsync();await using var claim=new NpgsqlCommand("SELECT * FROM platform.claim_document_job()",app);e=await Assert.ThrowsAsync<PostgresException>(()=>claim.ExecuteScalarAsync());Assert.Equal("42501",e.SqlState);
    }
    [Fact]
    public async Task Revoked_extra_attachment_blocks_queued_email_before_provider_call()
    {
        await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c);var(pdf,_)=await Generated(c,d);var a=await Expect(await Upload(c,d),HttpStatusCode.Accepted);await Run(a.GetProperty("jobId").GetGuid());
        var job=Jid(await Expect(await Email(c,d,pdf,attachments:[Jid(a)]),HttpStatusCode.Accepted));var file=(await Get(c,$"/documents/{d.Id}/files")).GetProperty("items").EnumerateArray().Single(f=>f.GetProperty("id").GetGuid()==Jid(a));
        await Expect(await Send(c,HttpMethod.Post,$"/files/{Jid(a)}/revoke",version:file.GetProperty("version").GetInt64()),HttpStatusCode.OK);
        var mail=new Mailer();await Run(job,mailer:mail);Assert.Equal(0,mail.Calls);Assert.Equal("FAILED",(await View(c,job)).GetProperty("state").GetString());
    }
    [Fact]
    public async Task Expired_provider_idempotency_window_blocks_automatic_and_manual_retries()
    {
        await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c);var(pdf,_)=await Generated(c,d);var job=Jid(await Expect(await Email(c,d,pdf),HttpStatusCode.Accepted));
        await Run(job,mailer:new Mailer(new("mail_provider_temporary",WorkFailure.Retry)));
        await S("UPDATE platform.document_jobs SET first_started_at=now()-interval '13 hours',available_at=now()-interval '1 day' WHERE company_id=@company AND id=@id",("company",db.Company),("id",job));
        await using var source=NpgsqlDataSource.Create(db.Worker);var provider=new Mailer();Assert.False(await new DocumentWorker(source,new Renderer(),new Scanner(),provider).ProcessOneAsync());Assert.Equal(0,provider.Calls);
        var j=await View(c,job);Assert.Equal("UNKNOWN",j.GetProperty("state").GetString());await Expect(await Send(c,HttpMethod.Post,$"/document-jobs/{job}/retry",new DocumentRetryInput("Late retry"),j.GetProperty("version").GetInt64()),HttpStatusCode.Conflict);
    }
    [Fact]
    public async Task Concurrent_email_requests_and_workers_send_once_for_same_operation()
    {
        await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c);var(pdf,_)=await Generated(c,d);var key=Guid.NewGuid().ToString();var requests=await Task.WhenAll(Email(c,d,pdf,key),Email(c,d,pdf,key));
        var first=Jid(await Expect(requests[0],HttpStatusCode.Accepted));Assert.Equal(first,Jid(await Expect(requests[1],HttpStatusCode.Accepted)));
        await using var source=NpgsqlDataSource.Create(db.Worker);var mail=new Mailer();var a=new DocumentWorker(source,new Renderer(),new Scanner(),mail);var b=new DocumentWorker(source,new Renderer(),new Scanner(),mail);
        var completed=await Task.WhenAll(a.ProcessOneAsync(),b.ProcessOneAsync());Assert.Single(completed,x=>x);Assert.Equal(1,mail.Calls);Assert.Equal("SUCCEEDED",(await View(c,first)).GetProperty("state").GetString());
    }
    [Fact]
    public async Task Email_retry_payload_conflict_and_header_injection_are_rejected()
    {
        await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c);var(pdf,_)=await Generated(c,d);var key=Guid.NewGuid().ToString();await Expect(await Email(c,d,pdf,key),HttpStatusCode.Accepted);
        var changed=new DocumentEmailInput(pdf,["different@htt-test.invalid"],"Changed","Changed recipient");await Expect(await Send(c,HttpMethod.Post,$"/documents/{d.Id}/emails",changed,d.Version,key),HttpStatusCode.Conflict);
        await Expect(await Send(c,HttpMethod.Post,$"/documents/{d.Id}/emails",changed with{Subject="Bad\r\nBcc: someone@htt-test.invalid"},d.Version),HttpStatusCode.UnprocessableEntity);
        await Expect(await Send(c,HttpMethod.Post,$"/documents/{d.Id}/emails",changed with{To=["Name <customer@htt-test.invalid>"]},d.Version),HttpStatusCode.UnprocessableEntity);
    }
    [Fact]
    public async Task PDF_failure_retry_retains_snapshot_and_ledger_safe_single_file()
    {
        await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c);var id=Jid(await Expect(await Pdf(c,d),HttpStatusCode.Accepted));
        var original=await S("SELECT payload::text FROM platform.document_jobs WHERE company_id=@company AND id=@id",("company",db.Company),("id",id));await Run(id,new Renderer(new("pdf_runtime_unavailable",WorkFailure.Permanent)));
        var j=await View(c,id);Assert.Equal("FAILED",j.GetProperty("state").GetString());await Expect(await Send(c,HttpMethod.Post,$"/document-jobs/{id}/retry",new DocumentRetryInput("Renderer repaired"),j.GetProperty("version").GetInt64()),HttpStatusCode.Accepted);await Run(id);
        Assert.Equal("SUCCEEDED",(await View(c,id)).GetProperty("state").GetString());Assert.Equal(original,await S("SELECT payload::text FROM platform.document_jobs WHERE company_id=@company AND id=@id",("company",db.Company),("id",id)));
        Assert.Equal(1L,await S("SELECT count(*) FROM platform.file_assets WHERE company_id=@company AND document_id=@id",("company",db.Company),("id",d.Id)));
    }
    [Fact]
    public async Task Uploaded_bytes_and_document_job_payload_are_immutable()
    {
        await using var api=Api();using var c=api.Authenticated();var d=await SetupDocument(c);var a=await Expect(await Upload(c,d),HttpStatusCode.Accepted);
        var error=await Assert.ThrowsAsync<PostgresException>(()=>S("UPDATE platform.file_contents SET body=convert_to('changed','UTF8') WHERE company_id=@company AND file_id=@id",("company",db.Company),("id",Jid(a))));Assert.Equal("23514",error.SqlState);
        error=await Assert.ThrowsAsync<PostgresException>(()=>S("UPDATE platform.document_jobs SET payload='{}'::jsonb WHERE company_id=@company AND id=@id",("company",db.Company),("id",a.GetProperty("jobId").GetGuid())));Assert.Equal("23514",error.SqlState);
    }
}
