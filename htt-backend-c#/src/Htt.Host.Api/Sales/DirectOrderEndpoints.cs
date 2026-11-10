using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using Htt.SharedKernel;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api.Sales;

public sealed record DirectOrderInput(Guid CustomerId,Guid CustomerBranchId,Guid WarehouseId,QuoteLineInput[] Lines,string Reason,string? Notes=null);
internal static class DirectOrderEndpoints
{
    public static void Map(RouteGroupBuilder g)=>g.MapPost("/sales-orders",Create).WithMetadata(new Permission("sales.orders.create"));
    private static async Task<IResult> Create(DirectOrderInput input,HttpContext h,CompanySession s,Idempotency idem,CancellationToken ct)
    {
        if(!Access(h).Has("sales.orders.read"))throw new BusinessException("permission_denied","Direct order creation requires order reading permission.",403);
        await Customer(h,s,input.CustomerId,ct);
        var access=Access(h);
        await One(s,"SELECT w.id FROM catalog.warehouses w WHERE w.company_id=@company AND w.id=@id AND (@all OR EXISTS(SELECT 1 FROM identity.warehouse_scopes sc WHERE sc.company_id=w.company_id AND sc.warehouse_id=w.id AND sc.membership_id=@membership))",ct,new DbArg("id",input.WarehouseId),new DbArg("all",access.Has("warehouses.all")),new DbArg("membership",access.MembershipId));
        var reason=Check.Text(input.Reason,"reason",2000);var notes=Check.Optional(input.Notes,"notes",2000)??"";
        // Reuse the quote builder without persisting a quote or consuming a Q number. No quote expiry is part of this API.
        var normalized=QuoteBuilder.Normalize(new(input.CustomerId,input.CustomerBranchId,input.WarehouseId,input.Lines,Notes:notes),DateOnly.MinValue);
        var result=await idem.ExecuteAsync("POST /sales-orders",h.Request.Headers["Idempotency-Key"].ToString(),Json(new{input.CustomerId,input.CustomerBranchId,input.WarehouseId,normalized.Lines,reason,notes}),async()=>
        {
            await One(s,"SELECT id FROM crm.customers WHERE company_id=@company AND id=@id FOR UPDATE",ct,new DbArg("id",input.CustomerId));
            var built=await QuoteBuilder.Build(h,s,new(input.CustomerId,input.CustomerBranchId,input.WarehouseId,normalized.Lines,Notes:notes),ct);
            var lines=built.Lines.Select((l,i)=>new ConfirmationLine(i+1,null,l.ProductId,l.Input.ProductUnitId,l.ItemType,l.Quantity,l.BaseQuantity,l.UnitPrice,l.Amounts.Net,l.Amounts.Tax,l.Amounts.Gross,Json(l.Snapshot))).ToArray();
            var order=await OrderConfirmation.Confirm(s,built.Context,input.CustomerId,input.CustomerBranchId,input.WarehouseId,Json(built.Context.Snapshot),built.Net,built.Tax,built.Gross,lines,null,null,reason,notes,built.PricingAt,ct);
            await Sql.AuditAsync(s,"sales.order_confirmed","sales_order",order.Id,h.TraceIdentifier,ct,new{orderOrigin="DIRECT",reason,number=order.Number});
            return ApiJson.Stored(new{orderId=order.Id,number=order.Number,version=order.Version,state="CONFIRMED",orderOrigin="DIRECT",sourceQuoteId=(Guid?)null});
        },ct);return ApiJson.Result(result);
    }
}
