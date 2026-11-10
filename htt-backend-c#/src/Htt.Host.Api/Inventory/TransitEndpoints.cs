using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api.Inventory;

public sealed record TransitDispatchInput(Guid SourceWarehouseId,Guid DestinationWarehouseId,string Reference,string Reason,IReadOnlyList<StockControlLine>? Lines);
public sealed record TransitEventLine(Guid TransferLineId,decimal Quantity);
public sealed record TransitEventInput(string Reference,string Reason,IReadOnlyList<TransitEventLine>? Lines);

internal static class TransitEndpoints
{
    public static void MapTransit(this WebApplication app)
    {
        var g=app.MapGroup("/api/v1").RequireAuthorization().RequireRateLimiting("api").AddEndpointFilter<CompanyFilter>();
        g.MapPost("/inventory/transit-transfers",Dispatch).WithMetadata(new Permission("inventory.transit.dispatch"));
        g.MapPost("/inventory/transit-transfers/{id:guid}/receipts",async(Guid id,TransitEventInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Event(id,"RECEIPT",input,h,s,idem,ct)).WithMetadata(new Permission("inventory.transit.receive"));
        g.MapPost("/inventory/transit-transfers/{id:guid}/returns",async(Guid id,TransitEventInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Event(id,"RETURN",input,h,s,idem,ct)).WithMetadata(new Permission("inventory.transit.return"));
        g.MapPost("/inventory/transit-transfers/{id:guid}/shortages",async(Guid id,TransitEventInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)=>await Event(id,"SHORTAGE",input,h,s,idem,ct)).WithMetadata(new Permission("inventory.transit.resolve"));
        g.MapGet("/inventory/transit-transfers/{id:guid}",async(Guid id,HttpContext h,CompanySession s,CancellationToken ct)=>Results.Ok(await TransferView(id,h,s,ct,false))).WithMetadata(new Permission("inventory.transit.read"));
        g.MapGet("/inventory/transit-events/{id:guid}",async(Guid id,HttpContext h,CompanySession s,CancellationToken ct)=>Results.Ok(await EventView(id,h,s,ct,false))).WithMetadata(new Permission("inventory.transit.read"));
        g.MapGet("/accounting/transit-transfers/{id:guid}",async(Guid id,HttpContext h,CompanySession s,CancellationToken ct)=>Results.Ok(await TransferView(id,h,s,ct,true))).WithMetadata(new Permission("inventory.control.read"));
        g.MapGet("/accounting/transit-events/{id:guid}",async(Guid id,HttpContext h,CompanySession s,CancellationToken ct)=>Results.Ok(await EventView(id,h,s,ct,true))).WithMetadata(new Permission("inventory.control.read"));
        g.MapGet("/inventory/transit-transfers",async(Guid warehouseId,string? state,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>
        {
            await Read(s,"SELECT inventory.require_access('inventory.transit.read',@warehouse)",ct,new DbArg("warehouse",warehouseId));return await List(warehouseId,state,page,pageSize,s,ct,false);
        }).WithMetadata(new Permission("inventory.transit.read"));
        g.MapGet("/accounting/transit-transfers",async(Guid? warehouseId,string? state,int? page,int? pageSize,CompanySession s,CancellationToken ct)=>await List(warehouseId,state,page,pageSize,s,ct,true)).WithMetadata(new Permission("inventory.control.read"));
    }
    private static async Task<IResult> List(Guid? warehouse,string? state,int? page,int? pageSize,CompanySession s,CancellationToken ct,bool financial)
    {
        if(state is not null)Check.OneOf(state,"state","IN_TRANSIT","PARTIAL","CLOSED");var(offset,size)=Page(page,pageSize);var args=new DbArg[]{new("warehouse",warehouse,NpgsqlDbType.Uuid),new("state",state,NpgsqlDbType.Text),new("size",size),new("offset",offset)};
        const string where=" WHERE t.company_id=@company AND (@warehouse IS NULL OR t.source_id=@warehouse OR t.destination_id=@warehouse) AND (@state IS NULL OR t.state=@state)";
        var rows=await Read(s,"SELECT t.*,d.number,d.business_date::text FROM inventory.transit_transfer_balances t JOIN platform.documents d ON d.company_id=t.company_id AND d.id=t.id"+where+" ORDER BY t.created_at,t.id LIMIT @size OFFSET @offset",ct,args);
        var totals=financial?await One(s,"SELECT coalesce(sum(t.remaining_cost),0) AS remaining_cost FROM inventory.transit_transfer_balances t"+where,ct,args):null;
        return Results.Ok(new{currency="AUD",remainingCost=totals?["remaining_cost"],items=rows.Select(r=>PublicRow(Redact(r,financial))),page=page??1,pageSize=size});
    }
    private static async Task<IResult> Dispatch(TransitDispatchInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        Check.That(input.SourceWarehouseId!=Guid.Empty && input.DestinationWarehouseId!=Guid.Empty && input.SourceWarehouseId!=input.DestinationWarehouseId,"warehouse","Distinct source and destination required.");var reference=Check.Text(input.Reference,"reference",200);var reason=Check.Text(input.Reason,"reason",2000);Check.That(input.Lines is{Count:>=1 and <=50} && input.Lines.All(l=>l is not null && l.ProductId!=Guid.Empty) && input.Lines.Select(l=>l.ProductId).Distinct().Count()==input.Lines.Count,"lines","Supply 1..50 distinct stock products.");foreach(var l in input.Lines!){Check.Amount(l.Quantity,"quantity",6);Check.That(l.Quantity>0,"quantity","Positive base quantity required.");}var lines=input.Lines!.OrderBy(l=>l.ProductId).ToArray();
        var result=await idem.ExecuteAsync("POST /inventory/transit-transfers",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{input.SourceWarehouseId,input.DestinationWarehouseId,reference,reason,lines}),async()=>
        {
            var row=await One(s,"SELECT inventory.dispatch_transit(@source,@destination,@reference,@reason,@lines) AS id",ct,new DbArg("source",input.SourceWarehouseId),new DbArg("destination",input.DestinationWarehouseId),new DbArg("reference",reference),new DbArg("reason",reason),new DbArg("lines",Json(lines),NpgsqlDbType.Jsonb));var id=(Guid)row["id"]!;
            await Sql.AuditAsync(s,"inventory.transit_dispatched","transit_transfer",id,h.TraceIdentifier,ct,new{input.SourceWarehouseId,input.DestinationWarehouseId,reference});return ApiJson.Stored(await TransferView(id,h,s,ct,false));
        },ct);return ApiJson.Result(result);
    }
    private static async Task<IResult> Event(Guid id,string kind,TransitEventInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        var reference=Check.Text(input.Reference,"reference",200);var reason=Check.Text(input.Reason,"reason",2000);Check.That(input.Lines is{Count:>=1 and <=50} && input.Lines.All(l=>l is not null && l.TransferLineId!=Guid.Empty) && input.Lines.Select(l=>l.TransferLineId).Distinct().Count()==input.Lines.Count,"lines","Supply 1..50 distinct shipment lines.");foreach(var l in input.Lines!){Check.Amount(l.Quantity,"quantity",6);Check.That(l.Quantity>0,"quantity","Positive actual base quantity required.");}var lines=input.Lines!.OrderBy(l=>l.TransferLineId).ToArray();
        var result=await idem.ExecuteAsync("POST "+h.Request.Path,h.Request.Headers["Idempotency-Key"].ToString(),Json(new{id,kind,reference,reason,lines}),async()=>
        {
            var row=await One(s,"SELECT inventory.post_transit_event(@id,@kind,@reference,@reason,@lines) AS id",ct,new DbArg("id",id),new DbArg("kind",kind),new DbArg("reference",reference),new DbArg("reason",reason),new DbArg("lines",Json(lines),NpgsqlDbType.Jsonb));var eid=(Guid)row["id"]!;
            await Sql.AuditAsync(s,kind=="RECEIPT"?"inventory.transit_received":kind=="RETURN"?"inventory.transit_returned":"inventory.transit_shortage_posted","transit_event",eid,h.TraceIdentifier,ct,new{transferId=id,reference});return ApiJson.Stored(await EventView(eid,h,s,ct,kind=="SHORTAGE"));
        },ct);return ApiJson.Result(result);
    }
    private static Dictionary<string,object?> Redact(Dictionary<string,object?> row,bool cost)
    {
        if(!cost)foreach(var f in new[]{"cost","shipped_cost","received_cost","returned_cost","shortage_cost","remaining_cost","value_before","value_after","inventory_account_id","transit_account_id","debit_account_id","journal_entry_id"})row.Remove(f);return row;
    }
    private static void HidePool(Dictionary<string,object?> row)
    {
        foreach(var field in new[]{"stock_balance_id","quantity_before","quantity_after","value_before","value_after","reserved_after","revision_before","revision_after"})row.Remove(field);
    }
    private static Task<Dictionary<string,object?>> Header(Guid id,CompanySession s,CancellationToken ct)=>One(s,"SELECT t.*,d.number,d.state AS document_state,d.version,d.business_date::text FROM inventory.transit_transfer_balances t JOIN platform.documents d ON d.company_id=t.company_id AND d.id=t.id WHERE t.company_id=@company AND t.id=@id",ct,new DbArg("id",id));
    private static async Task Scope(Dictionary<string,object?> t,HttpContext h,CompanySession s,CancellationToken ct)
    {
        var access=Access(h);var row=await One(s,"SELECT @all OR EXISTS(SELECT 1 FROM identity.warehouse_scopes WHERE company_id=@company AND membership_id=@member AND warehouse_id IN(@source,@destination)) AS allowed",ct,new DbArg("all",access.Has("warehouses.all")),new DbArg("member",access.MembershipId),new DbArg("source",t["source_id"]),new DbArg("destination",t["destination_id"]));
        if(!(bool)row["allowed"]!)throw new Htt.SharedKernel.BusinessException("scope_denied","Transfer is outside assigned source/destination warehouses.",403);
    }
    private static async Task<object> TransferView(Guid id,HttpContext h,CompanySession s,CancellationToken ct,bool financial)
    {
        var t=await Header(id,s,ct);if(!financial)await Scope(t,h,s,ct);var cost=financial||Access(h).Has("inventory.cost.read");var lines=await Read(s,"SELECT * FROM inventory.transit_line_balances WHERE company_id=@company AND transfer_id=@id ORDER BY product_id",ct,new DbArg("id",id));foreach(var l in lines){l["snapshot"]=Element(l["snapshot"]!);if(!financial)HidePool(l);}
        return new{transfer=PublicRow(Redact(t,cost)),lines=lines.Select(l=>PublicRow(Redact(l,cost))),events=(await Read(s,"SELECT e.id,e.kind,e.reference,e.reason,d.number,d.business_date::text FROM inventory.transit_events e JOIN platform.documents d ON d.company_id=e.company_id AND d.id=e.id WHERE e.company_id=@company AND e.transfer_id=@id ORDER BY e.created_at,e.id",ct,new DbArg("id",id))).Select(PublicRow)};
    }
    private static async Task<object> EventView(Guid id,HttpContext h,CompanySession s,CancellationToken ct,bool financial)
    {
        var e=await One(s,"SELECT e.*,d.number,d.state,d.version,d.business_date::text FROM inventory.transit_events e JOIN platform.documents d ON d.company_id=e.company_id AND d.id=e.id WHERE e.company_id=@company AND e.id=@id",ct,new DbArg("id",id));var transfer=await Header((Guid)e["transfer_id"]!,s,ct);if(!financial)await Scope(transfer,h,s,ct);var cost=financial||Access(h).Has("inventory.cost.read");
        return new{@event=PublicRow(Redact(e,cost)),lines=(await Read(s,"SELECT el.*,tl.product_id FROM inventory.transit_event_lines el JOIN inventory.transit_transfer_lines tl ON tl.company_id=el.company_id AND tl.id=el.transfer_line_id WHERE el.company_id=@company AND el.event_id=@id ORDER BY tl.product_id",ct,new DbArg("id",id))).Select(l=>{if(!financial)HidePool(l);return PublicRow(Redact(l,cost));})};
    }
}
