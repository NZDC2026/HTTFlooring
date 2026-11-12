import {useSyncExternalStore} from 'react';
import {Layers,Truck} from 'lucide-react';
import {useProducts} from '../../business-workspace/productRepository';
import {useInventoryStockRows} from '../../inventory/data/useInventory';
import {salesFulfilmentRepository} from '../data/salesFulfilmentRepository';
import type {SalesDocument} from '../types/salesDocument';
export function SalesDispatchSummary({document,documents,sample}:{document:SalesDocument;documents:SalesDocument[];sample:boolean}){
 const products=useProducts(),stock=useInventoryStockRows(),fulfilments=useSyncExternalStore(salesFulfilmentRepository.subscribe,salesFulfilmentRepository.getSnapshot,salesFulfilmentRepository.getSnapshot);
 const order=document.type==='SALES_ORDER'?document:document.type==='INVOICE'?documents.find(d=>d.type==='SALES_ORDER'&&d.id===document.sourceSalesOrderId):undefined;
 if(!order||order.type!=='SALES_ORDER')return null;
 const dispatches=fulfilments.filter(f=>f.salesOrderId===order.id&&f.status==='ACTIVE');
 const rows=order.lines.map(line=>{const p=products.find(p=>p.id===line.productId),conversion=sample?1:p?.units.find(u=>u.id===line.unitId)?.conversionToBase;
 const ordered=conversion===undefined?null:line.quantity*conversion,dispatched=sample?order.fulfilmentStatus==='FULFILLED'?ordered??0:order.fulfilmentStatus==='PARTIALLY_FULFILLED'?(ordered??0)*.4:0:dispatches.flatMap(f=>f.lines).filter(l=>l.salesOrderLineId===line.id).reduce((n,l)=>n+l.fulfilledBaseQuantity,0);
 return {id:line.id,name:line.description,unit:sample?line.unitSymbol:p?.units.find(u=>u.id===p.baseUnitId)?.symbol??'',ordered,dispatched,available:sample?260:stock.filter(s=>s.productId===line.productId).reduce((n,s)=>n+s.quantityOnHand,0)};});
 return <section className="sales-dispatch-summary"><h3><Layers size={17}/>Stock &amp; Allocation</h3>{rows.map(r=><div key={r.id}><small>{r.name}{sample?' · Sample':''}</small><div className="sales-stock-values"><div><small>On hand</small><b>{r.available.toLocaleString()} {r.unit}</b></div><div><small>Ordered</small><b>{r.ordered===null?'Conversion missing':r.ordered.toLocaleString()+' '+r.unit}</b></div></div><h3><Truck size={17}/>Dispatch Progress <b>{r.ordered?Math.min(100,Math.round(r.dispatched/r.ordered*100))+'%':'—'}</b></h3><progress max={r.ordered||1} value={r.dispatched}/><div className="sales-stock-values"><div><small>Dispatched</small><b>{r.dispatched.toLocaleString()} {r.unit}</b></div><div><small>Remaining</small><b>{r.ordered===null?'—':Math.max(0,r.ordered-r.dispatched).toLocaleString()+' '+r.unit}</b></div></div></div>)}<p>Dispatches: {sample?(['FULFILLED','PARTIALLY_FULFILLED'].includes(order.fulfilmentStatus??'')?1:0):dispatches.length} · Next pickup: {order.expectedDispatchDate||order.requestedDeliveryDate||'Not scheduled'}</p></section>;
}
