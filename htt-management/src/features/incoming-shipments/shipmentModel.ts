import { z } from "zod";
import { requireDateKey } from "../../lib/businessDate";
import type { PurchaseOrder } from "../purchases/types/purchaseOrder";
const date=z.string().refine(v=>{try{requireDateKey(v);return true;}catch{return false;}},"Enter a valid date");
const qty=z.number().finite().positive().max(1e9).refine(v=>Math.abs(v*10000-Math.round(v*10000))<0.0001,"Use at most four decimal places");
export const shipmentLineInput=z.object({purchaseOrderId:z.string().min(1),lineId:z.string().min(1),quantity:qty}).strict();
export const shipmentInput=z.object({supplierId:z.string().min(1),id:z.string().optional(),operationId:z.uuid(),revision:z.number().int().nonnegative(),type:z.enum(["Overseas","Local"]),container:z.string().trim().max(100),origin:z.string().trim().max(100),destination:z.string().trim().max(100),siteId:z.string().min(1),etd:z.union([date,z.literal("")]),eta:date,status:z.enum(["Draft","Preparing","In Transit","Arrived","Cancelled"]),reason:z.string().trim().min(3).max(2000),lines:z.array(shipmentLineInput).min(1)}).strict();
export const shipmentReceiptInput=z.object({supplierId:z.string().min(1),id:z.string().min(1),operationId:z.uuid(),revision:z.number().int().positive(),date,reason:z.string().trim().min(3).max(2000),lines:z.array(shipmentLineInput).min(1)}).strict();
const event=z.object({request:z.string().optional(),operationId:z.uuid(),actorId:z.string().min(1),actorName:z.string().min(1),at:z.iso.datetime(),reason:z.string().min(3),action:z.enum(["Created","Updated","Received"]),eta:date,previousEta:z.string().optional(),status:z.string(),receiptIds:z.array(z.string()).optional()});
export const shipmentSchema=z.object({id:z.string().min(1),number:z.string().min(1),supplierId:z.string().min(1),revision:z.number().int().positive(),type:z.enum(["Overseas","Local"]),container:z.string(),origin:z.string(),destination:z.string(),siteId:z.string(),etd:z.string(),eta:date,status:z.enum(["Draft","Preparing","In Transit","Arrived","Cancelled"]),lines:z.array(shipmentLineInput.extend({sku:z.string(),description:z.string(),unit:z.string(),received:z.number().nonnegative()})).min(1),history:z.array(event).min(1),updatedAt:z.iso.datetime()});
export type Shipment=z.infer<typeof shipmentSchema>;
export type ShipmentInput=z.infer<typeof shipmentInput>;
export function shipmentStatus(s:Shipment,today:string){
 if(s.status==='Cancelled'||s.status==='Draft')return s.status;
 if(s.lines.every(l=>l.received>=l.quantity))return 'Received';
 if(s.lines.some(l=>l.received>0))return 'Partially Received';
 if(s.status==='Arrived')return 'Arrived';
 if(s.status==='Preparing')return 'Preparing';
 const days=(Date.parse(s.eta)-Date.parse(today))/86400000;
 return days>=0&&days<=7?'Arriving Soon':'In Transit';
}
export function buildShipmentLines(input:ShipmentInput,orders:readonly PurchaseOrder[],existing:readonly Shipment[],old?:Shipment){
 const keys=new Set<string>();
 return input.lines.map(l=>{
  const key=l.purchaseOrderId+':'+l.lineId;if(keys.has(key))throw Error('Duplicate shipment item');keys.add(key);
  const po=orders.find(p=>p.id===l.purchaseOrderId&&p.supplierId===input.supplierId),line=po?.lines.find(x=>x.id===l.lineId);
  if(!po||!line||!['APPROVED','SENT','PARTIALLY_RECEIVED'].includes(po.status))throw Error('Select eligible purchase orders belonging to this supplier');
  const prior=old?.lines.find(x=>x.purchaseOrderId===l.purchaseOrderId&&x.lineId===l.lineId);
  const reserved=existing.filter(s=>s.id!==old?.id&&s.status!=='Cancelled').flatMap(s=>s.lines).filter(x=>x.purchaseOrderId===l.purchaseOrderId&&x.lineId===l.lineId).reduce((n,x)=>n+x.quantity-x.received,0);
  if(l.quantity>(line.orderedQuantity-line.receivedQuantity-reserved+(prior?.received??0))+0.000001)throw Error('Shipment quantity exceeds unallocated purchase order quantity');
  if(l.quantity<(prior?.received??0))throw Error('Shipment quantity is below quantity already received');
  return {...l,sku:line.sku,description:line.description,unit:line.unitSymbol,received:prior?.received??0};
 });
}
