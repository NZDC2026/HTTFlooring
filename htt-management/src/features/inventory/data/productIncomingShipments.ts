import type { Product } from '../types/product';
import type { Shipment } from '../../incoming-shipments/shipmentModel';
import type { PurchaseOrder } from '../../purchases/types/purchaseOrder';
/** Informational inbound balance only. Never writes to stock, availability or valuation. */
export function productIncomingShipments(product:Product,shipments:readonly Shipment[],orders:readonly PurchaseOrder[],site='ALL'){
 const area=product.units.find(u=>u.code==='M2'||['m²','m2'].includes(u.symbol)),base=product.units.find(u=>u.id===product.baseUnitId);
 const unit=area?'m²':base?.symbol??'';
 const entries=shipments.filter(s=>!['Draft','Cancelled'].includes(s.status)&&(site==='ALL'||s.siteId===site)).flatMap(s=>s.lines.flatMap(l=>{
  const po=orders.find(o=>o.id===l.purchaseOrderId);if(!po||po.status==='CANCELLED')return [];
  const line=po.lines.find(x=>x.id===l.lineId);if(line?.productId!==product.id)return [];
  const remaining=Math.max(0,l.quantity-l.received);if(!remaining)return [];
  const sourceUnit=product.units.find(u=>u.id===line.unitId),factor=sourceUnit?.conversionToBase;
  return [{shipmentId:s.id,shipmentNumber:s.number,supplierId:s.supplierId,purchaseOrderId:po.id,purchaseOrderLineId:line.id,productId:product.id,siteId:s.siteId,eta:s.eta,remainingQuantity:remaining,sourceUnit:l.unit,quantity:factor===undefined?undefined:remaining*factor/(area?.conversionToBase??1),unit}];
 }));
 return {productId:product.id,siteId:site,unit,quantity:Math.round(entries.reduce((n,e)=>n+(e.quantity??0),0)*10000)/10000,incomplete:entries.some(e=>e.quantity===undefined),entries};
}
