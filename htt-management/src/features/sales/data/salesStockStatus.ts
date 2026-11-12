import type {SalesDocument} from '../types/salesDocument';
import type {Product} from '../../inventory/types/product';
import type {SalesFulfilment} from '../types/salesFulfilment';
import {commercialReservation} from '../../dispatch-followups/stockReservations';
export function salesStockStatus(document:SalesDocument,documents:SalesDocument[],products:Product[],stock:{productId:string;quantityOnHand:number}[],fulfilments:SalesFulfilment[]){
 const order=document.type==='SALES_ORDER'?document:document.type==='INVOICE'?documents.find(d=>d.type==='SALES_ORDER'&&d.id===document.sourceSalesOrderId):undefined;
 const source=order??document;
 if(['VOID','CANCELLED','DECLINED','EXPIRED','CONVERTED'].includes(source.status)||source.type==='SALES_ORDER'&&source.fulfilmentStatus==='FULFILLED')return '—';
 const required=new Map<string,number>();
 for(const line of source.lines){const product=products.find(p=>p.id===line.productId);if(line.itemType&&line.itemType!=='STOCK'||product?.itemType&&product.itemType!=='STOCK')continue;if(!product)return 'Not available';const conversion=product.units.find(u=>u.id===line.unitId)?.conversionToBase;if(!conversion)return 'Not available';const dispatched=source.type==='SALES_ORDER'?fulfilments.filter(f=>f.status==='ACTIVE'&&f.salesOrderId===source.id).flatMap(f=>f.lines).filter(l=>l.salesOrderLineId===line.id).reduce((n,l)=>n+l.fulfilledBaseQuantity,0):0;required.set(product.id,(required.get(product.id)??0)+Math.max(0,line.quantity*conversion-dispatched));}
 if(![...required.values()].some(n=>n>0))return '—';
 for(const [id,quantity] of required){const product=products.find(p=>p.id===id)!,reserved= commercialReservation(product,documents.filter(d=>d.id!==source.id),fulfilments);if(reserved===undefined)return 'Not available';const available=stock.filter(s=>s.productId===id).reduce((n,s)=>n+s.quantityOnHand,0)-reserved;if(available<quantity)return 'Low Stock';}
 return order&&['CONFIRMED','PARTIALLY_FULFILLED','INVOICED'].includes(order.status)?'Reserved':document.type==='QUOTE'?'In Stock':'Available';
}
