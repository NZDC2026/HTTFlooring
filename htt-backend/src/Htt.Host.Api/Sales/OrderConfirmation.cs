using Htt.Host.Api.MasterData;
using Htt.Infrastructure;
using Htt.SharedKernel;
using NpgsqlTypes;
using static Htt.Host.Api.MasterData.MasterDataSupport;
using static Htt.Host.Api.Sales.SalesSupport;

namespace Htt.Host.Api.Sales;

internal sealed record ConfirmationLine(int Number,Guid? SourceQuoteLineId,Guid Product,Guid Unit,string ItemType,decimal Quantity,decimal BaseQuantity,decimal UnitPrice,decimal Net,decimal Tax,decimal Gross,string Snapshot);
internal sealed record ConfirmedOrder(Guid Id,string Number,long Version);
internal static class OrderConfirmation
{
    // Both entry points lock the customer first. Credit, SKU demand aggregation and lock order stay identical.
    public static async Task<ConfirmedOrder> Confirm(CompanySession s,QuoteContext context,Guid customer,Guid branch,Guid warehouse,string snapshot,decimal net,decimal tax,decimal gross,IReadOnlyList<ConfirmationLine> lines,Guid? quote,long? quoteVersion,string? reason,string notes,DateTimeOffset pricingAt,CancellationToken ct)
    {
        var credit=await One(s,"SELECT * FROM sales.lock_credit(@id)",ct,new DbArg("id",customer));var limit=(decimal)context.Customer["credit_limit"]!;
        var exposure=decimal.Max(0,(decimal)credit["receivable"]!+(decimal)credit["unbilled_orders"]!+gross-(decimal)credit["available_advances"]!);
        if(exposure>limit)throw new BusinessException("credit_limit_exceeded","Customer credit is insufficient for this tax-inclusive order.",409);
        var balances=new Dictionary<Guid,Guid>();
        foreach(var demand in lines.Where(l=>l.ItemType=="STOCK").GroupBy(l=>l.Product).OrderBy(g=>g.Key))
        {
            var balance=(await Read(s,"SELECT * FROM inventory.lock_balance(@warehouse,@product)",ct,new DbArg("warehouse",warehouse),new DbArg("product",demand.Key))).SingleOrDefault();
            if(balance is null || (decimal)balance["on_hand"]!-(decimal)balance["reserved"]!<demand.Sum(l=>l.BaseQuantity))throw new BusinessException("insufficient_stock","Available stock is insufficient; no part of the order was reserved.",409);
            balances[demand.Key]=(Guid)balance["id"]!;
        }
        var id=Guid.NewGuid();var document=await One(s,"INSERT INTO platform.documents(id,company_id,document_type,number,business_date,state,created_by) VALUES(@id,@company,'SALES_ORDER',sales.next_number('SALES_ORDER'),@today,'CONFIRMED',@actor) RETURNING number,version",ct,new DbArg("id",id),new DbArg("today",context.Today));
        await Read(s,"""
            INSERT INTO sales.orders(id,company_id,order_origin,source_quote_id,approved_quote_version,creation_reason,notes,pricing_at,customer_id,customer_branch_id,warehouse_id,customer_snapshot,net,tax,gross,approved_by,created_by)
            VALUES(@id,@company,@origin,@quote,@quoteVersion,@reason,@notes,@pricing,@customer,@branch,@warehouse,@snapshot,@net,@tax,@gross,@actor,@actor)
            """,ct,new DbArg("id",id),new DbArg("origin",quote is null?"DIRECT":"QUOTE"),new DbArg("quote",quote,NpgsqlDbType.Uuid),new DbArg("quoteVersion",quoteVersion,NpgsqlDbType.Bigint),new DbArg("reason",reason,NpgsqlDbType.Text),new DbArg("notes",notes),new DbArg("pricing",pricingAt),new DbArg("customer",customer),new DbArg("branch",branch),new DbArg("warehouse",warehouse),new DbArg("snapshot",snapshot,NpgsqlDbType.Jsonb),new DbArg("net",net),new DbArg("tax",tax),new DbArg("gross",gross));
        foreach(var l in lines)
        {
            var line=Guid.NewGuid();await Read(s,"""
                INSERT INTO platform.document_lines(id,company_id,document_id,line_no,created_by) VALUES(@line,@company,@id,@no,@actor);
                INSERT INTO sales.order_lines(id,company_id,order_id,source_quote_line_id,product_id,product_unit_id,item_type,quantity,base_quantity,unit_price,net,tax,gross,snapshot,created_by)
                VALUES(@line,@company,@id,@source,@product,@unit,@type,@quantity,@base,@price,@net,@tax,@gross,@snapshot,@actor)
                """,ct,new DbArg("line",line),new DbArg("id",id),new DbArg("no",l.Number),new DbArg("source",l.SourceQuoteLineId,NpgsqlDbType.Uuid),new DbArg("product",l.Product),new DbArg("unit",l.Unit),new DbArg("type",l.ItemType),new DbArg("quantity",l.Quantity),new DbArg("base",l.BaseQuantity),new DbArg("price",l.UnitPrice),new DbArg("net",l.Net),new DbArg("tax",l.Tax),new DbArg("gross",l.Gross),new DbArg("snapshot",l.Snapshot,NpgsqlDbType.Jsonb));
            if(l.ItemType=="STOCK")await Read(s,"INSERT INTO inventory.stock_reservations(company_id,order_line_id,stock_balance_id,quantity,created_by) VALUES(@company,@line,@balance,@qty,@actor)",ct,new DbArg("line",line),new DbArg("balance",balances[l.Product]),new DbArg("qty",l.BaseQuantity));
        }
        await Read(s,"""
            INSERT INTO sales.credit_decisions(company_id,order_id,customer_id,credit_limit,receivable,unbilled_before,advances,order_amount,exposure_after,created_by)
            VALUES(@company,@id,@customer,@limit,@ar,@before,@advances,@gross,@exposure,@actor);
            INSERT INTO sales.credit_commitments(company_id,order_id,customer_id,amount,created_by) VALUES(@company,@id,@customer,@gross,@actor)
            """,ct,new DbArg("id",id),new DbArg("customer",customer),new DbArg("limit",limit),new DbArg("ar",(decimal)credit["receivable"]!),new DbArg("before",(decimal)credit["unbilled_orders"]!),new DbArg("advances",(decimal)credit["available_advances"]!),new DbArg("gross",gross),new DbArg("exposure",exposure));
        return new(id,(string)document["number"]!,(long)document["version"]!);
    }
}
