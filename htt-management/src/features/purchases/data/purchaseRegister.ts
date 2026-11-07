import type { PurchaseOrder } from '../types/purchaseOrder';
export const remainingQuantity=(ordered:number,received:number)=>Math.max(0,ordered-received);
export function purchaseReceiving(order:PurchaseOrder){
 const outstanding=order.lines.some(l=>remainingQuantity(l.orderedQuantity,l.receivedQuantity)>0.000001),received=order.lines.some(l=>l.receivedQuantity>0);
 return !outstanding?'Fully Received':received?'Partially Received':'Not Received';
}
/** PO lineSubtotal is already in business currency, excluding GST. */
export function outstandingPurchaseValue(order:PurchaseOrder){
 if(!['APPROVED','SENT','PARTIALLY_RECEIVED'].includes(order.status))return 0;
 return Math.round(order.lines.reduce((n,l)=>n+(l.orderedQuantity>0?l.lineSubtotal*remainingQuantity(l.orderedQuantity,l.receivedQuantity)/l.orderedQuantity:0),0)*100)/100;
}
export function purchaseQuantitySummary(order:PurchaseOrder){
 const units=new Map<string,{ordered:number;received:number}>();for(const l of order.lines){const v=units.get(l.unitSymbol)??{ordered:0,received:0};v.ordered+=l.orderedQuantity;v.received+=Math.min(l.orderedQuantity,l.receivedQuantity);units.set(l.unitSymbol,v);}
 const progress=order.lines.length?order.lines.reduce((n,l)=>n+(l.orderedQuantity?Math.min(1,l.receivedQuantity/l.orderedQuantity):1),0)/order.lines.length*100:0;
 return {units:[...units].map(([unit,v])=>({unit,...v,outstanding:remainingQuantity(v.ordered,v.received)})),progress};
}
export function purchaseRegisterSamples(today:string):PurchaseOrder[]{
 const date=(offset:number)=>new Date(Date.parse(today)+offset*86400000).toISOString().slice(0,10);
 return [['Timbercraft Supply',520,0,55,'m²'],['Flooring Supplies AU',1200,0,44,'m²'],['Premium Underlay Co.',1000,500,9.75,'m²'],['Adhesive Solutions',240,240,52,'Bucket'],['Trim & Profiles AU',1200,1200,6.3,'Piece'],['Engineered Flooring Co.',300,300,36,'m²']].map((r,i)=>{const quantity=Number(r[1]),received=Number(r[2]),cost=Number(r[3]),subtotal=quantity*cost;return {id:'sample-purchase-'+i,purchaseOrderNumber:'PO-SAMPLE-'+(10489-i),supplierId:'sample-supplier-'+i,supplierCode:'SUP-SAMPLE',supplierName:String(r[0]),orderDate:date(-10-i),expectedDeliveryDate:date(i<2?5+i:-i),status:i===2?'PARTIALLY_RECEIVED':i>2?'RECEIVED':'SENT',createdAt:today+'T09:00:00Z',updatedAt:today+'T09:00:00Z',lines:[{id:'sample-line-'+i,productId:'sample-product-'+i,unitId:'sample-unit',sku:'SKU-SAMPLE-'+i,description:['Natural Oak','Hybrid Flooring','Underlay Roll','Adhesive Bucket','Scotia Trim','Engineered Oak'][i],unitSymbol:String(r[4]),orderedQuantity:quantity,receivedQuantity:received,billedQuantity:0,unitCost:cost,lineSubtotal:subtotal,taxAmount:subtotal*.1,lineTotal:subtotal*1.1}],totals:{subtotal,taxAmount:subtotal*.1,total:subtotal*1.1}};});
}
