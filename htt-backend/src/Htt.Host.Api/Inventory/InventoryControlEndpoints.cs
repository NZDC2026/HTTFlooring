using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api.Inventory;

public sealed record StockControlLine(Guid ProductId,decimal Quantity);
public sealed record StockTransferInput(Guid SourceWarehouseId,Guid DestinationWarehouseId,string Reference,string Reason,IReadOnlyList<StockControlLine>? Lines);
public sealed record StockWriteOffInput(Guid WarehouseId,string Reference,string Reason,IReadOnlyList<StockControlLine>? Lines);
public sealed record StockCountInput(Guid WarehouseId,string Reference,string Reason,IReadOnlyList<Guid>? ProductIds);
public sealed record StockCountActual(Guid ProductId,decimal? CountedQuantity,decimal? GainValue=null);
public sealed record StockCountSubmission(IReadOnlyList<StockCountActual>? Lines);

internal static class InventoryControlEndpoints
{
    public static void MapInventoryControl(this WebApplication app)
    {
        var g=app.MapGroup("/api/v1").RequireAuthorization().RequireRateLimiting("api").AddEndpointFilter<CompanyFilter>();
        g.MapPost("/inventory/transfers",async(StockTransferInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>
        {
            Check.That(input.SourceWarehouseId!=Guid.Empty && input.DestinationWarehouseId!=Guid.Empty && input.SourceWarehouseId!=input.DestinationWarehouseId,"warehouse","Distinct source and destination required.");return await Post("TRANSFER",input.SourceWarehouseId,input.DestinationWarehouseId,input.Reference,input.Reason,input.Lines,h,s,idem,ct);
        }).WithMetadata(new Permission("inventory.transfers.post"));
        g.MapPost("/inventory/write-offs",async(StockWriteOffInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>
        {
            Check.That(input.WarehouseId!=Guid.Empty,"warehouseId","Warehouse required.");return await Post("WRITE_OFF",input.WarehouseId,null,input.Reference,input.Reason,input.Lines,h,s,idem,ct);
        }).WithMetadata(new Permission("inventory.writeoffs.post"));
        g.MapGet("/inventory/transfers/{id:guid}",async(Guid id,HttpContext h,CompanySession s,CancellationToken ct)=>Results.Ok(await Operation(id,h,s,ct,false))).WithMetadata(new Permission("inventory.transfers.read"));
        g.MapGet("/accounting/inventory-operations/{id:guid}",async(Guid id,HttpContext h,CompanySession s,CancellationToken ct)=>Results.Ok(await Operation(id,h,s,ct,true))).WithMetadata(new Permission("inventory.control.read"));
        g.MapGet("/accounting/inventory-operations",async(Guid? warehouseId,string? kind,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>
        {
            if(kind is not null)Check.OneOf(kind,"kind","TRANSFER","COUNT","WRITE_OFF");var(offset,size)=Page(page,pageSize);
            return Results.Ok(new{items=(await Read(s,"SELECT o.*,d.number,d.business_date::text FROM inventory.operations o JOIN platform.documents d ON d.company_id=o.company_id AND d.id=o.id WHERE o.company_id=@company AND (@warehouse IS NULL OR o.warehouse_id=@warehouse OR o.destination_id=@warehouse) AND (@kind IS NULL OR o.kind=@kind) ORDER BY o.created_at DESC,o.id LIMIT @size OFFSET @offset",ct,new DbArg("warehouse",warehouseId,NpgsqlDbType.Uuid),new DbArg("kind",kind,NpgsqlDbType.Text),new DbArg("size",size),new DbArg("offset",offset))).Select(PublicRow),page=page??1,pageSize=size});
        }).WithMetadata(new Permission("inventory.control.read"));
        g.MapPost("/inventory/stock-counts",Start).WithMetadata(new Permission("inventory.counts.write"));
        g.MapPost("/inventory/stock-counts/{id:guid}/submit",Submit).WithMetadata(new Permission("inventory.counts.write"));
        g.MapPost("/inventory/stock-counts/{id:guid}/post",PostCount).WithMetadata(new Permission("inventory.counts.post"));
        g.MapPost("/inventory/stock-counts/{id:guid}/cancel",Cancel).WithMetadata(new Permission("inventory.counts.write"));
        g.MapGet("/inventory/stock-counts/{id:guid}",async(Guid id,HttpContext h,CompanySession s,CancellationToken ct)=>Results.Ok(await Count(id,h,s,ct,false))).WithMetadata(new Permission("inventory.counts.read"));
        g.MapGet("/accounting/stock-counts/{id:guid}",async(Guid id,HttpContext h,CompanySession s,CancellationToken ct)=>Results.Ok(await Count(id,h,s,ct,true))).WithMetadata(new Permission("inventory.control.read"));
        g.MapGet("/accounting/stock-counts",async(string? state,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>
        {
            if(state is not null)Check.OneOf(state,"state","OPEN","SUBMITTED","POSTED","CANCELLED");var(offset,size)=Page(page,pageSize);
            return Results.Ok(new{items=(await Read(s,"SELECT c.*,d.number,d.version,d.business_date::text FROM inventory.counts c JOIN platform.documents d ON d.company_id=c.company_id AND d.id=c.id WHERE c.company_id=@company AND (@state IS NULL OR c.state=@state) ORDER BY c.created_at,c.id LIMIT @size OFFSET @offset",ct,new DbArg("state",state,NpgsqlDbType.Text),new DbArg("size",size),new DbArg("offset",offset))).Select(PublicRow),page=page??1,pageSize=size});
        }).WithMetadata(new Permission("inventory.control.read"));
    }
    private static async Task<IResult> Post(string kind,Guid from,Guid? to,string inputReference,string inputReason,IReadOnlyList<StockControlLine>? inputLines,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        var reference=Check.Text(inputReference,"reference",200);var reason=Check.Text(inputReason,"reason",2000);Check.That(inputLines is{Count:>=1 and <=50} && inputLines.All(x=>x is not null && x.ProductId!=Guid.Empty) && inputLines.Select(x=>x.ProductId).Distinct().Count()==inputLines.Count,"lines","Supply 1..50 distinct stock products.");foreach(var l in inputLines!){Check.Amount(l.Quantity,"quantity",6);Check.That(l.Quantity>0,"quantity","Positive base quantity required.");}var lines=inputLines!.OrderBy(x=>x.ProductId).ToArray();
        var result=await idem.ExecuteAsync("POST "+h.Request.Path,h.Request.Headers["Idempotency-Key"].ToString(),Json(new{kind,from,to,reference,reason,lines}),async()=>
        {
            var row=await One(s,"SELECT inventory.post_control(@kind,@from,@to,@reference,@reason,@lines) AS id",ct,new DbArg("kind",kind),new DbArg("from",from),new DbArg("to",to,NpgsqlDbType.Uuid),new DbArg("reference",reference),new DbArg("reason",reason),new DbArg("lines",Json(lines),NpgsqlDbType.Jsonb));var id=(Guid)row["id"]!;
            await Sql.AuditAsync(s,kind=="TRANSFER"?"inventory.transferred":"inventory.written_off","inventory_operation",id,h.TraceIdentifier,ct,new{from,to,reference});return ApiJson.Stored(await Operation(id,h,s,ct,kind!="TRANSFER"));
        },ct);return ApiJson.Result(result);
    }
    private static async Task<IResult> Start(StockCountInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        var reference=Check.Text(input.Reference,"reference",200);var reason=Check.Text(input.Reason,"reason",2000);Check.That(input.WarehouseId!=Guid.Empty && input.ProductIds is{Count:>=1 and <=50} && input.ProductIds.All(x=>x!=Guid.Empty) && input.ProductIds.Distinct().Count()==input.ProductIds.Count,"productIds","Warehouse and 1..50 distinct stock products required.");var products=input.ProductIds!.Order().ToArray();
        var result=await idem.ExecuteAsync("POST /inventory/stock-counts",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{input.WarehouseId,reference,reason,products}),async()=>
        {
            var row=await One(s,"SELECT inventory.start_count(@warehouse,@reference,@reason,@products) AS id",ct,new DbArg("warehouse",input.WarehouseId),new DbArg("reference",reference),new DbArg("reason",reason),new DbArg("products",products,NpgsqlDbType.Array|NpgsqlDbType.Uuid));var id=(Guid)row["id"]!;await Sql.AuditAsync(s,"inventory.count_started","stock_count",id,h.TraceIdentifier,ct);return ApiJson.Stored(await Count(id,h,s,ct,false));
        },ct);return ApiJson.Result(result);
    }
    private static async Task<IResult> Submit(Guid id,StockCountSubmission input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        var expected=Version(h);Check.That(input.Lines is{Count:>=1 and <=50} && input.Lines.All(x=>x is not null && x.ProductId!=Guid.Empty) && input.Lines.Select(x=>x.ProductId).Distinct().Count()==input.Lines.Count,"lines","Supply every count product exactly once.");foreach(var l in input.Lines!){Check.That(l.CountedQuantity is not null,"countedQuantity","Explicit physical counted quantity is required.");Check.Amount(l.CountedQuantity!.Value,"countedQuantity",6);if(l.GainValue is{} value)Check.Amount(value,"gainValue",2);}var lines=input.Lines!.OrderBy(x=>x.ProductId).ToArray();
        var result=await idem.ExecuteAsync($"POST /inventory/stock-counts/{id}/submit",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{expected,lines}),async()=>
        {
            await Read(s,"SELECT inventory.submit_count(@id,@expected,@lines)",ct,new DbArg("id",id),new DbArg("expected",expected),new DbArg("lines",Json(lines),NpgsqlDbType.Jsonb));await Sql.AuditAsync(s,"inventory.count_submitted","stock_count",id,h.TraceIdentifier,ct);return ApiJson.Stored(await Count(id,h,s,ct,false),200);
        },ct);return ApiJson.Result(result);
    }
    private static async Task<IResult> PostCount(Guid id,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        var expected=Version(h);var result=await idem.ExecuteAsync($"POST /inventory/stock-counts/{id}/post",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{expected}),async()=>
        {
            await Read(s,"SELECT inventory.post_count(@id,@expected)",ct,new DbArg("id",id),new DbArg("expected",expected));await Sql.AuditAsync(s,"inventory.count_posted","stock_count",id,h.TraceIdentifier,ct);return ApiJson.Stored(await Count(id,h,s,ct,true),200);
        },ct);return ApiJson.Result(result);
    }
    private static async Task<IResult> Cancel(Guid id,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        var expected=Version(h);var result=await idem.ExecuteAsync($"POST /inventory/stock-counts/{id}/cancel",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{expected}),async()=>
        {
            await Read(s,"SELECT inventory.cancel_count(@id,@expected)",ct,new DbArg("id",id),new DbArg("expected",expected));await Sql.AuditAsync(s,"inventory.count_cancelled","stock_count",id,h.TraceIdentifier,ct);return ApiJson.Stored(await Count(id,h,s,ct,false),200);
        },ct);return ApiJson.Result(result);
    }
    private static async Task<object> Operation(Guid id,HttpContext h,CompanySession s,CancellationToken ct,bool financial)
    {
        var o=await One(s,"SELECT o.*,d.number,d.state,d.version,d.business_date::text FROM inventory.operations o JOIN platform.documents d ON d.company_id=o.company_id AND d.id=o.id WHERE o.company_id=@company AND o.id=@id",ct,new DbArg("id",id));
        if(!financial){Check.That((string)o["kind"]! == "TRANSFER","kind","Transfer view required.");await Scope(s,(Guid)o["warehouse_id"]!,"inventory.transfers.read",ct);await Scope(s,(Guid)o["destination_id"]!,"inventory.transfers.read",ct);}var cost=financial||Access(h).Has("inventory.cost.read");var lines=await Read(s,"SELECT * FROM inventory.operation_lines WHERE company_id=@company AND operation_id=@id ORDER BY warehouse_id,product_id",ct,new DbArg("id",id));foreach(var l in lines){l["snapshot"]=Element(l["snapshot"]!);if(!cost)foreach(var f in new[]{"value_delta","value_before","value_after"})l.Remove(f);}if(!cost)o.Remove("journal_entry_id");return new{operation=PublicRow(o),lines=lines.Select(PublicRow)};
    }
    private static async Task<object> Count(Guid id,HttpContext h,CompanySession s,CancellationToken ct,bool financial)
    {
        if((bool)(await One(s,"SELECT inventory.is_bin_count(@id)AS result",ct,new DbArg("id",id)))["result"]!)return await BinCountEndpoints.View(s,id,financial,ct);var o=await One(s,"SELECT c.*,d.number,d.version,d.business_date::text FROM inventory.counts c JOIN platform.documents d ON d.company_id=c.company_id AND d.id=c.id WHERE c.company_id=@company AND c.id=@id",ct,new DbArg("id",id));if(!financial)await Scope(s,(Guid)o["warehouse_id"]!,"inventory.counts.read",ct);var cost=financial||Access(h).Has("inventory.cost.read");var lines=await Read(s,"SELECT * FROM inventory.count_lines WHERE company_id=@company AND count_id=@id ORDER BY product_id",ct,new DbArg("id",id));foreach(var l in lines){l["snapshot"]=Element(l["snapshot"]!);if(!cost){l.Remove("snapshot_value");l.Remove("gain_value");}}return new{count=PublicRow(o),lines=lines.Select(PublicRow)};
    }
    private static Task<List<Dictionary<string,object?>>> Scope(CompanySession s,Guid id,string permission,CancellationToken ct)=>Read(s,"SELECT inventory.require_access(@permission,@id)",ct,new DbArg("permission",permission),new DbArg("id",id));
}
