using System.Security.Cryptography;
using System.Text.Json;
using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using Htt.Infrastructure.Documents;
using Htt.SharedKernel;
using Npgsql;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api;

public sealed record DocumentEmailInput(Guid PdfJobId,string[] To,string Subject,string Message,Guid[]? AttachmentIds=null);
public sealed record DocumentRetryInput(string Reason);

internal static class DocumentEndpoints
{
    public static void MapDocuments(this WebApplication app)
    {
        var g=app.MapGroup("/api/v1").RequireAuthorization().RequireRateLimiting("api").AddEndpointFilter<CompanyFilter>();
        g.MapPost("/documents/{id:guid}/pdf",RequestPdf).WithMetadata(new Permission("documents.pdf.request"));
        g.MapPost("/documents/{id:guid}/emails",RequestEmail).WithMetadata(new Permission("documents.email.send"));
        g.MapPost("/documents/{id:guid}/attachments",Upload).WithMetadata(new Permission("documents.attachments.write"));
        g.MapGet("/documents/{id:guid}/files",async(Guid id,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>
        {
            await Authorize(s,id,"READ",ct);var(offset,size)=Page(page,pageSize);
            var rows=await Read(s,"SELECT f.id,f.content_type,f.size_bytes,f.sha256,f.state,f.version,a.filename,a.kind,a.source_version,f.created_at FROM platform.file_assets a JOIN platform.files f ON f.company_id=a.company_id AND f.id=a.file_id WHERE a.company_id=@company AND a.document_id=@id AND a.revoked_at IS NULL ORDER BY f.created_at DESC,f.id LIMIT @size OFFSET @offset",ct,new DbArg("id",id),new DbArg("size",size),new DbArg("offset",offset));
            return Results.Ok(new{items=rows.Select(PublicRow),page=page??1,pageSize=size});
        }).WithMetadata(new Permission("documents.files.read"));
        g.MapGet("/files/{id:guid}/content",Download).WithMetadata(new Permission("documents.files.read"));
        g.MapPost("/files/{id:guid}/revoke",Revoke).WithMetadata(new Permission("documents.attachments.write"));
        g.MapGet("/documents/{id:guid}/jobs",async(Guid id,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>
        {
            await Authorize(s,id,"READ",ct);var(offset,size)=Page(page,pageSize);
            return Results.Ok(new{items=(await Read(s,JobColumns+" WHERE company_id=@company AND document_id=@id ORDER BY created_at DESC,id LIMIT @size OFFSET @offset",ct,new DbArg("id",id),new DbArg("size",size),new DbArg("offset",offset))).Select(PublicRow),page=page??1,pageSize=size});
        }).WithMetadata(new Permission("documents.files.read"));
        g.MapGet("/document-jobs/{id:guid}",async(Guid id,CompanySession s,CancellationToken ct)=>Results.Ok(PublicRow(await Job(id,s,ct)))).WithMetadata(new Permission("documents.files.read"));
        g.MapPost("/document-jobs/{id:guid}/retry",Retry).WithMetadata(new Permission("documents.jobs.retry"));
    }
    private const string JobColumns="SELECT id,document_id,source_version,kind,state,attempts,total_attempts,available_at,output_file_id,provider_id,last_error,completed_at,created_at,version FROM platform.document_jobs";
    private static Task<List<Dictionary<string,object?>>> Authorize(CompanySession s,Guid id,string action,CancellationToken ct)=>Read(s,"SELECT platform.require_document_access(@id,@action)",ct,new DbArg("id",id),new DbArg("action",action));
    private static async Task<Dictionary<string,object?>> Job(Guid id,CompanySession s,CancellationToken ct)
    {var j=await One(s,JobColumns+" WHERE company_id=@company AND id=@id",ct,new DbArg("id",id));await Authorize(s,(Guid)j["document_id"]!,"READ",ct);return j;}
    private static async Task<Dictionary<string,object?>> Document(Guid id,string action,long expected,CompanySession s,CancellationToken ct)
    {
        await Authorize(s,id,action,ct);
        var d=await One(s,"SELECT id,document_type,number,business_date::text,state,version FROM platform.documents WHERE company_id=@company AND id=@id AND deleted_at IS NULL FOR SHARE",ct,new DbArg("id",id));
        // A trash command may have committed while this request waited for the registry lock.
        await Authorize(s,id,action,ct);
        if((long)d["version"]! != expected)throw new BusinessException("version_conflict","Document changed; refresh before requesting output.",409);
        if(action is "PDF" or "EMAIL" && (d["number"] is not string || (string)d["state"]! is not ("CONFIRMED" or "POSTED")))
            throw new BusinessException("document_not_final","Submit/confirm the document before generating or sending its PDF.",409);
        return d;
    }
    private static async Task<IResult> RequestPdf(Guid id,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        await Authorize(s,id,"PDF",ct);
        var version=Version(h);
        var result=await idem.ExecuteAsync($"POST /documents/{id}/pdf",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,version}),async()=>
        {
            var d=await Document(id,"PDF",version,s,ct);
            var payload=await Snapshot(d,s,ct);
            var rows=await Read(s,"""
                INSERT INTO platform.document_jobs(company_id,document_id,source_version,kind,payload,created_by)
                VALUES(@company,@doc,@version,'PDF',@payload,@actor)
                ON CONFLICT(company_id,document_id,source_version) WHERE kind='PDF' DO NOTHING RETURNING id
                """,ct,new DbArg("doc",id),new DbArg("version",version),new DbArg("payload",Json(payload),NpgsqlDbType.Jsonb));
            var jid=rows.Count>0?(Guid)rows[0]["id"]!:(Guid)(await One(s,"SELECT id FROM platform.document_jobs WHERE company_id=@company AND document_id=@doc AND source_version=@version AND kind='PDF'",ct,new DbArg("doc",id),new DbArg("version",version)))["id"]!;
            if(rows.Count>0)await Sql.AuditAsync(s,"documents.pdf_requested","document_job",jid,h.TraceIdentifier,ct,new{documentId=id,sourceVersion=version});
            return ApiJson.Stored(new{id=jid,documentId=id,sourceVersion=version},202);
        },ct);return ApiJson.Result(result);
    }
    private static async Task<object> Snapshot(Dictionary<string,object?> d,CompanySession s,CancellationToken ct)
    {
        var id=(Guid)d["id"]!;var typ=(string)d["document_type"]!;
        var issuer=(await One(s,"SELECT jsonb_build_object('name',name,'abn',abn,'country',country,'currency',base_currency,'gstRegistered',gst_registered)::text AS issuer FROM core.companies WHERE id=@company",ct))["issuer"]!;
        Dictionary<string,object?> head;List<Dictionary<string,object?>> lines;string title;
        if(typ=="QUOTE")
        {
            head=await One(s,"SELECT customer_snapshot::text AS party,notes,net,tax,gross,expires_on::text AS term FROM sales.quotes WHERE company_id=@company AND id=@id",ct,new DbArg("id",id));
            lines=await Read(s,"SELECT l.snapshot::text AS snapshot,l.quantity,l.unit_price,l.net,l.tax,l.gross,l.tax_rate FROM sales.quote_lines l JOIN platform.document_lines dl ON dl.company_id=l.company_id AND dl.id=l.id WHERE l.company_id=@company AND l.quote_id=@id ORDER BY dl.line_no",ct,new DbArg("id",id));title="QUOTATION";
        }
        else if(typ=="INVOICE")
        {
            head=await One(s,"SELECT issuer_snapshot::text AS issuer,customer_snapshot::text AS party,''::text AS notes,net,tax,gross,due_on::text AS term,title FROM sales.invoices WHERE company_id=@company AND id=@id",ct,new DbArg("id",id));issuer=head["issuer"]!;
            lines=await Read(s,"SELECT l.snapshot::text AS snapshot,l.quantity,(l.snapshot->>'unitPrice')::numeric AS unit_price,l.net,l.tax,l.gross,l.tax_rate FROM sales.invoice_lines l JOIN platform.document_lines dl ON dl.company_id=l.company_id AND dl.id=l.id WHERE l.company_id=@company AND l.invoice_id=@id ORDER BY dl.line_no",ct,new DbArg("id",id));title=(string)head["title"]! == "TAX_INVOICE"?"TAX INVOICE":"INVOICE";
        }
        else
        {
            head=await One(s,"SELECT supplier_snapshot::text AS party,notes,net,tax,gross,expected_on::text AS term FROM purchase.orders WHERE company_id=@company AND id=@id",ct,new DbArg("id",id));
            lines=await Read(s,"SELECT l.snapshot::text AS snapshot,l.quantity,l.unit_cost AS unit_price,l.net,l.tax,l.gross,l.tax_rate FROM purchase.order_lines l JOIN platform.document_lines dl ON dl.company_id=l.company_id AND dl.id=l.id WHERE l.company_id=@company AND l.order_id=@id ORDER BY dl.line_no",ct,new DbArg("id",id));title="PURCHASE ORDER";
        }
        var number=(string)d["number"]!;var safe=new string(number.Select(c=>char.IsAsciiLetterOrDigit(c)||c is '-' or '_'?c:'_').Take(100).ToArray());
        return new{templateVersion=1,filename=$"{safe}-v{d["version"]}.pdf",title,number,sourceVersion=d["version"],businessDate=d["business_date"],term=head["term"],termLabel=typ=="QUOTE"?"Valid until":typ=="INVOICE"?"Due date":"Expected delivery",currency="AUD",issuer=Element(issuer),party=Element(head["party"]!),notes=head["notes"],net=head["net"],tax=head["tax"],gross=head["gross"],lines=lines.Select(l=>new{snapshot=Element(l["snapshot"]!),quantity=l["quantity"],unitPrice=l["unit_price"],net=l["net"],tax=l["tax"],gross=l["gross"],taxRate=l["tax_rate"]})};
    }
    private static async Task<IResult> Upload(Guid id,string fileName,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        await Authorize(s,id,"UPLOAD",ct);
        var version=Version(h);var filename=FileRules.Filename(fileName);var contentType=(h.Request.ContentType??"").Split(';')[0].Trim().ToLowerInvariant();
        if(h.Request.ContentLength>FileRules.MaxBytes)throw new BusinessException("file_too_large","Attachments are limited to 10 MiB.",413);
        using var timeout=CancellationTokenSource.CreateLinkedTokenSource(ct);timeout.CancelAfter(TimeSpan.FromSeconds(30));
        using var buffer=new MemoryStream();var chunk=new byte[16384];int count;
        while((count=await h.Request.Body.ReadAsync(chunk,timeout.Token))>0)
        {if(buffer.Length+count>FileRules.MaxBytes)throw new BusinessException("file_too_large","Attachments are limited to 10 MiB.",413);await buffer.WriteAsync(chunk.AsMemory(0,count),timeout.Token);}
        var body=buffer.ToArray();FileRules.Validate(body,contentType,filename);var sha=Convert.ToHexStringLower(SHA256.HashData(body));
        var result=await idem.ExecuteAsync($"POST /documents/{id}/attachments",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,version,filename,contentType,sha,size=body.Length}),async()=>
        {
            await Document(id,"UPLOAD",version,s,ct);var fid=Guid.NewGuid();var jid=Guid.NewGuid();
            await Read(s,"""
                INSERT INTO platform.files(id,company_id,object_key,content_type,size_bytes,sha256,created_by) VALUES(@file,@company,@object,@type,@size,@sha,@actor);
                INSERT INTO platform.file_contents(company_id,file_id,body) VALUES(@company,@file,@body);
                INSERT INTO platform.file_assets(company_id,file_id,document_id,source_version,filename,kind) VALUES(@company,@file,@doc,@version,@filename,'ATTACHMENT');
                INSERT INTO platform.file_links(company_id,file_id,document_id,created_by) VALUES(@company,@file,@doc,@actor);
                INSERT INTO platform.document_jobs(id,company_id,document_id,source_version,kind,payload,created_by) VALUES(@job,@company,@doc,@version,'SCAN',jsonb_build_object('fileId',@file::text),@actor);
                """,ct,new DbArg("file",fid),new DbArg("job",jid),new DbArg("doc",id),new DbArg("version",version),new DbArg("object",$"{s.CompanyId}/{fid}"),new DbArg("type",contentType),new DbArg("size",body.Length),new DbArg("sha",sha),new DbArg("body",body,NpgsqlDbType.Bytea),new DbArg("filename",filename));
            await Sql.AuditAsync(s,"documents.attachment_uploaded","file",fid,h.TraceIdentifier,ct,new{documentId=id,sourceVersion=version,sha256=sha,size=body.Length});
            return ApiJson.Stored(new{id=fid,jobId=jid,state="PENDING",version=1,sha256=sha},202);
        },ct);return ApiJson.Result(result);
    }
    private static async Task<IResult> RequestEmail(Guid id,DocumentEmailInput input,HttpContext h,CompanySession s,Idempotency idem,DocumentOptions options,CancellationToken ct)
    {
        await Authorize(s,id,"EMAIL",ct);
        var version=Version(h);Check.That(input.To is{Length:>=1 and <=10},"to","Supply 1..10 recipient addresses.");
        var recipients=input.To.Select(x=>Check.Email(x)??throw new BusinessException("invalid_email","Recipient is required.")).Select(x=>x.ToLowerInvariant()).Distinct().Order(StringComparer.Ordinal).ToArray();
        var subject=Check.Text(input.Subject,"subject",200);Check.That(!subject.Any(char.IsControl),"subject","Subject cannot contain control characters.");var message=Check.Text(input.Message,"message",10000);
        Check.That(message.All(c=>!char.IsControl(c)||c is '\r' or '\n' or '\t'),"message","Message contains invalid control characters.");
        var extra=input.AttachmentIds??[];Check.That(extra.Length<=5 && extra.Distinct().Count()==extra.Length && extra.All(x=>x!=Guid.Empty),"attachmentIds","Supply up to five distinct attachments.");
        var result=await idem.ExecuteAsync($"POST /documents/{id}/emails",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,version,input.PdfJobId,recipients,subject,message,extra=extra.Order().ToArray()}),async()=>
        {
            if(string.IsNullOrWhiteSpace(options.MailFrom) || Check.Email(options.MailFrom) is null)throw new BusinessException("mail_not_configured","Configure the verified sender before queuing mail.",503);
            await Document(id,"EMAIL",version,s,ct);
            var pdf=await One(s,"SELECT output_file_id FROM platform.document_jobs WHERE company_id=@company AND id=@job AND document_id=@doc AND source_version=@version AND kind='PDF' AND state='SUCCEEDED'",ct,new DbArg("job",input.PdfJobId),new DbArg("doc",id),new DbArg("version",version));
            var fid=(Guid)pdf["output_file_id"]!;Check.That(!extra.Contains(fid),"attachmentIds","The generated PDF is attached automatically.");var files=new[]{fid}.Concat(extra.Order()).ToArray();long total=0;
            foreach(var file in files)
            {
                var f=await One(s,"SELECT x.size_bytes,a.kind FROM platform.file_assets a JOIN platform.files x ON x.company_id=a.company_id AND x.id=a.file_id WHERE a.company_id=@company AND a.file_id=@file AND a.document_id=@doc AND a.revoked_at IS NULL AND x.state='VERIFIED'",ct,new DbArg("file",file),new DbArg("doc",id));
                Check.That(file==fid || (string)f["kind"]! == "ATTACHMENT","attachmentIds","Additional files must be uploaded attachments.");total+=(long)f["size_bytes"]!;
            }
            Check.That(total<=15*1024*1024,"attachmentIds","Mail attachment total cannot exceed 15 MiB.");var job=Guid.NewGuid();
            var payload=Json(new{from=options.MailFrom,to=recipients,subject,text=message,fileIds=files});
            await Read(s,"INSERT INTO platform.document_jobs(id,company_id,document_id,source_version,kind,payload,created_by) VALUES(@id,@company,@doc,@version,'EMAIL',@payload,@actor)",ct,new DbArg("id",job),new DbArg("doc",id),new DbArg("version",version),new DbArg("payload",payload,NpgsqlDbType.Jsonb));
            await Sql.AuditAsync(s,"documents.email_requested","document_job",job,h.TraceIdentifier,ct,new{documentId=id,sourceVersion=version,pdfJobId=input.PdfJobId,recipientCount=recipients.Length});return ApiJson.Stored(new{id=job,documentId=id,sourceVersion=version},202);
        },ct);return ApiJson.Result(result);
    }
    private static async Task<IResult> Download(Guid id,HttpContext h,CompanySession s,CancellationToken ct)
    {
        var f=await One(s,"SELECT a.document_id,a.filename,f.content_type FROM platform.file_assets a JOIN platform.files f ON f.company_id=a.company_id AND f.id=a.file_id WHERE a.company_id=@company AND a.file_id=@id AND a.revoked_at IS NULL",ct,new DbArg("id",id));
        await Authorize(s,(Guid)f["document_id"]!,"READ",ct);
        var row=await One(s,"SELECT platform.read_private_file(@id) AS body",ct,new DbArg("id",id));
        h.Response.Headers.ContentSecurityPolicy="sandbox; default-src 'none'";
        return Results.File((byte[])row["body"]!,(string)f["content_type"]!,(string)f["filename"]!,enableRangeProcessing:false);
    }
    private static async Task<IResult> Retry(Guid id,DocumentRetryInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        await Job(id,s,ct);
        var version=Version(h);var reason=Check.Text(input.Reason,"reason",1000);
        var response=await idem.ExecuteAsync($"POST /document-jobs/{id}/retry",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,version,reason}),async()=>
        {await Read(s,"SELECT platform.retry_document_job(@id,@version,@reason)",ct,new DbArg("id",id),new DbArg("version",version),new DbArg("reason",reason));await Sql.AuditAsync(s,"documents.work_retried","document_job",id,h.TraceIdentifier,ct,new{reason});return ApiJson.Stored(new{id},202);},ct);return ApiJson.Result(response);
    }
    private static async Task<IResult> Revoke(Guid id,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        var asset=await One(s,"SELECT document_id FROM platform.file_assets WHERE company_id=@company AND file_id=@id",ct,new DbArg("id",id));await Authorize(s,(Guid)asset["document_id"]!,"UPLOAD",ct);
        var version=Version(h);var response=await idem.ExecuteAsync($"POST /files/{id}/revoke",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,version}),async()=>
        {await Read(s,"SELECT platform.revoke_attachment(@id,@version)",ct,new DbArg("id",id),new DbArg("version",version));await Sql.AuditAsync(s,"documents.attachment_revoked","file",id,h.TraceIdentifier,ct);return ApiJson.Stored(new{id},200);},ct);return ApiJson.Result(response);
    }
}
