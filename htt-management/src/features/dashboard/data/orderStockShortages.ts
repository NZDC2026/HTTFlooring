import type {SalesDocument} from '../../sales/types/salesDocument';
import type {SalesFulfilment} from '../../sales/types/salesFulfilment';
import type {Product} from '../../inventory/types/product';
export interface OrderStockShortage {id:string;orderId:string;number:string;customerId:string;expected:string;product:string;unit:string;required:number;available:number;shortage:number}
/** Allocate existing stock by promised date; incoming shipments never count as stock. */
export function orderStockShortages(documents:SalesDocument[],products:Product[],stock:{productId:string;siteId:string;quantityOnHand:number}[],fulfilments:SalesFulfilment[],site:string):OrderStockShortage[]{
 const pool=new Map<string,number>();
 for(const s of stock)if(site==='ALL'||s.siteId===site)pool.set(s.productId,(pool.get(s.productId)??0)+s.quantityOnHand);
 const rows:OrderStockShortage[]=[];
 const orders=documents.filter(d=>d.type==='SALES_ORDER'&&['CONFIRMED','PARTIALLY_FULFILLED','INVOICED'].includes(d.status)).sort((a,b)=>(a.expectedDispatchDate||'9999').localeCompare(b.expectedDispatchDate||'9999')||a.documentDate.localeCompare(b.documentDate)||a.id.localeCompare(b.id));
 for(const d of orders)for(const l of d.lines){
  const p=products.find(p=>p.id===l.productId);if(!p||l.itemType&&l.itemType!=='STOCK')continue;
  const conversion=p.units.find(u=>u.id===l.unitId)?.conversionToBase;if(!conversion)continue;
  const dispatched=fulfilments.filter(f=>f.status==='ACTIVE'&&f.salesOrderId===d.id).flatMap(f=>f.lines).filter(x=>x.salesOrderLineId===l.id).reduce((n,x)=>n+x.fulfilledBaseQuantity,0);
  const required=Math.max(0,l.quantity*conversion-dispatched),available=Math.max(0,pool.get(p.id)??0);
  pool.set(p.id,Math.max(0,available-required));
  if(required>available+0.000001)rows.push({id:d.id+l.id,orderId:d.id,number:d.documentNumber,customerId:d.customerId,expected:d.expectedDispatchDate??'',product:l.description||p.name,unit:p.units.find(u=>u.id===p.baseUnitId)?.symbol??l.unitSymbol,required,available,shortage:required-available});
 }
 return rows;
}
