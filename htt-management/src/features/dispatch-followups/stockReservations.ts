import type {SalesDocument} from '../sales/types/salesDocument';
import type {SalesFulfilment} from '../sales/types/salesFulfilment';
import type {Product} from '../inventory/types/product';
/** Company-wide commercial holds, expressed in inventory base units. Never stock movements. */
export function commercialReservation(product:Product,documents:SalesDocument[],fulfilments:SalesFulfilment[]){
 let quantity=0;
 for(const d of documents){
  if(/sample/i.test(d.documentNumber))continue;
  if(d.type==='INVOICE'||d.type==='QUOTE'&&(!['SENT','ACCEPTED'].includes(d.status)||documents.some(x=>x.type==='SALES_ORDER'&&x.sourceQuoteId===d.id))||d.type==='SALES_ORDER'&&['DRAFT','CANCELLED','FULFILLED'].includes(d.status))continue;
  for(const line of d.lines.filter(l=>l.productId===product.id)){
   if(line.itemType&&line.itemType!=='STOCK')continue;
   const conversion=product.units.find(u=>u.id===line.unitId)?.conversionToBase;
   if(!conversion)return undefined;
   const dispatched=d.type==='SALES_ORDER'?fulfilments.filter(f=>f.salesOrderId===d.id&&f.status==='ACTIVE').flatMap(f=>f.lines).filter(l=>l.salesOrderLineId===line.id).reduce((n,l)=>n+l.fulfilledBaseQuantity,0):0;
   quantity+=Math.max(0,line.quantity*conversion-dispatched);
  }
 }
 return Math.round(quantity*1e6)/1e6;
}
