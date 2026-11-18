import {businessDateKey} from '../../../lib/businessDate';
import {round} from './reportsReferenceModel';
import {stockSalesStart,type ReportStock,type ReportIncoming} from './reportsStockModel';
import {coveragePerUnit} from '../../purchases/data/purchaseCoverage';
import {calculateInventoryValuation} from '../../inventory/data/inventoryValuationService';
import type {Product,ProductUnit} from '../../inventory/types/product';
import type {InventoryMovement} from '../../inventory/types/inventoryMovement';
import type {InventoryCostMovement} from '../../inventory/types/inventoryCost';
import type {Supplier} from '../../contacts/types/supplier';
import type {PurchaseOrder} from '../../purchases/types/purchaseOrder';
import type {GoodsReceipt} from '../../purchases/types/goodsReceipt';
const quantity=(n:number)=>Math.round(n*1e6)/1e6;
export function reportStockUnit(p:Product):ProductUnit{const u=p.units.find(u=>u.code==='BOX'&&u.active)??p.units.find(u=>u.id===p.measureUnitId&&u.active)??p.units.find(u=>u.id===p.baseUnitId);if(!u||!Number.isFinite(u.conversionToBase)||u.conversionToBase<=0)throw Error(p.sku+': review the saved inventory unit conversion.');return u;}
function names(p:Product){const [name,...variant]=p.name.split(' · ');return {name,variant:variant.join(' · ')};}
/** Filter in the business timezone before invoking the shared valuation accumulator. */
export function recordedStock(products:Product[],movements:InventoryMovement[],costs:InventoryCostMovement[],to:string):{stock:ReportStock[];notes:string[]}{
 const physical=movements.filter(m=>businessDateKey(m.occurredAt)<=to),costRows=costs.filter(m=>businessDateKey(m.occurredAt)<=to),cutoff=costRows.reduce((date,m)=>m.occurredAt.slice(0,10)>date?m.occurredAt.slice(0,10):date,to),valuation=calculateInventoryValuation(costRows,cutoff),start=stockSalesStart(to),notes:string[]=[];
 for(const m of physical){if(!products.some(p=>p.id===m.productId))throw Error('Inventory product '+m.productId+' was not found.');if(!Number.isFinite(m.quantityBase))throw Error(m.productId+': invalid inventory quantity.');}for(const m of costRows)if(!Number.isFinite(m.quantityBase)||!Number.isFinite(m.valueChange))throw Error(m.productId+': invalid recorded inventory value.');
 const stock=products.filter(p=>(p.itemType??'STOCK')==='STOCK').map(p=>{const unit=reportStockUnit(p),pm=physical.filter(m=>m.productId===p.id),vm=valuation.rows.filter(r=>r.productId===p.id),qBase=pm.length?quantity(pm.reduce((n,m)=>n+m.quantityBase,0)):quantity(vm.reduce((n,r)=>n+r.quantityOnHand,0)),value=round(vm.reduce((n,r)=>n+r.inventoryValue,0));
 if([...pm,...costRows.filter(m=>m.productId===p.id)].some(m=>m.baseUnitId!==p.baseUnitId))throw Error(p.sku+': inventory base units do not match the product.');
 const sites=[...new Set([...pm.map(m=>m.siteId),...vm.map(v=>v.siteId)])],matched=vm.length>0&&(!pm.length||sites.every(site=>Math.abs(pm.filter(m=>m.siteId===site).reduce((n,m)=>n+m.quantityBase,0)-vm.filter(r=>r.siteId===site).reduce((n,r)=>n+r.quantityOnHand,0))<1e-5));
 if(qBase!==0&&!matched)notes.push(p.sku+': quantity and valuation sources do not fully reconcile; cost and value are unavailable.');
 const soldBase=physical.filter(m=>m.productId===p.id&&businessDateKey(m.occurredAt)>=start&&(m.movementType==='SALE'||['SALES_FULFILMENT_VOID','CUSTOMER_RETURN','CUSTOMER_RETURN_VOID'].includes(m.referenceType))).reduce((n,m)=>n-m.quantityBase,0),q=quantity(qBase/unit.conversionToBase),coverage=coveragePerUnit(p,unit);
 return {id:p.id,...names(p),sku:p.sku,unit:unit.code==='BOX'?'boxes':unit.code==='BUCKET'?'pails':unit.symbol,quantity:q,area:coverage===undefined?undefined:q*coverage,cost:matched&&q!==0?value/q:undefined,value:matched?value:q===0?0:undefined,low:p.reorderPoint!==undefined&&qBase<p.reorderPoint,sold12:quantity(Math.max(0,soldBase)/unit.conversionToBase)};
 }).filter(r=>r.quantity!==0||r.sold12>0||(r.value??0)!==0).sort((a,b)=>(b.value??-Infinity)-(a.value??-Infinity)||a.sku.localeCompare(b.sku));
 return {stock,notes};
}
export function recordedIncoming(products:Product[],suppliers:Supplier[],orders:PurchaseOrder[],receipts:GoodsReceipt[],to:string):ReportIncoming[]{
 const rows:ReportIncoming[]=[];
 for(const supplier of suppliers)for(const s of supplier.shipments??[]){const events=s.history.filter(h=>businessDateKey(h.at)<=to).sort((a,b)=>a.at.localeCompare(b.at)),last=events.at(-1);if(s.history.length&&!last)continue;const status=last?.status??s.status;if(['Draft','Cancelled'].includes(status))continue;
 const receiptIds=new Set(events.flatMap(h=>h.receiptIds??[])),current=businessDateKey(s.updatedAt)<=to,eta=last?.eta??s.eta,created=events[0]?businessDateKey(events[0].at):businessDateKey(s.updatedAt);
 for(const l of s.lines){const po=orders.find(p=>p.id===l.purchaseOrderId);if(!po||po.orderDate>to||['DRAFT','QUOTATION'].includes(po.status)||po.status==='CANCELLED'&&(!po.cancelledAt||businessDateKey(po.cancelledAt)<=to))continue;const source=po.lines.find(p=>p.id===l.lineId),p=products.find(p=>p.id===source?.productId);if(!source||!p)throw Error(s.number+': a shipment product or PO line is missing.');if((p.itemType??'STOCK')!=='STOCK')continue;
 const sourceUnit=p.units.find(u=>u.id===source.unitId),display=reportStockUnit(p);if(!sourceUnit||!Number.isFinite(sourceUnit.conversionToBase)||sourceUnit.conversionToBase<=0)throw Error(s.number+' · '+p.sku+': shipment quantity conversion is unavailable.');
 if(!current&&l.received>0&&s.history.some(h=>h.action==='Received'&&!h.receiptIds?.length))throw Error(s.number+': receipt history cannot reconstruct the selected date. Open the shipment to review receiving records.');
 const received=current?l.received:receipts.filter(r=>receiptIds.has(r.id)&&r.status==='POSTED'&&r.purchaseOrderId===po.id&&r.receiptDate<=to).flatMap(r=>r.lines).filter(r=>r.purchaseOrderLineId===source.id).reduce((n,r)=>n+r.receivedQuantity,0),remaining=Math.max(0,l.quantity-received);if(!Number.isFinite(l.quantity)||!Number.isFinite(received)||l.quantity<0||received<0||received>l.quantity+1e-6)throw Error(s.number+': invalid received or shipped quantity.');if(remaining<=1e-6)continue;
 const q=quantity(remaining*sourceUnit.conversionToBase/display.conversionToBase),area=coveragePerUnit(p,sourceUnit),lineStatus=received>0?'Part received':status==='Preparing'?'Booked':status==='Arrived'?'Arrived':'In transit';
 rows.push({id:s.id+':'+po.id+':'+source.id,productId:p.id,...names(p),sku:p.sku,unit:display.code==='BOX'?'boxes':display.symbol,quantity:q,area:area===undefined?undefined:remaining*area,container:s.container||'TBA',shipmentId:s.id,shipmentNumber:s.purchaseNumber||s.number,eta,status:lineStatus,date:created,path:'/purchases/incoming-shipments?detail='+encodeURIComponent('shipment:'+s.id)});
 }}return rows.sort((a,b)=>a.eta.localeCompare(b.eta)||a.date.localeCompare(b.date)||a.shipmentNumber.localeCompare(b.shipmentNumber));
}
