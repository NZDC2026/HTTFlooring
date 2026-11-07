import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Shipment } from './shipmentModel';
import type { PurchaseOrder } from '../purchases/types/purchaseOrder';
import type { Product } from '../inventory/types/product';
type Line=Shipment['lines'][number];
const num=(n:number)=>n.toLocaleString('en-AU',{maximumFractionDigits:4});
export function shipmentItemArea(line:Line,orders:readonly PurchaseOrder[],products:readonly Product[],sample=false){
 const poLine=orders.find(o=>o.id===line.purchaseOrderId)?.lines.find(l=>l.id===line.lineId),p=products.find(p=>p.id===poLine?.productId),u=p?.units.find(u=>u.id===poLine?.unitId),area=p?.units.find(u=>u.code==='M2');
 const coverage=sample?2.166:u&&area?u.conversionToBase/area.conversionToBase:undefined;
 return {coverage,total:coverage===undefined?undefined:line.quantity*coverage,received:coverage===undefined?undefined:line.received*coverage,remaining:coverage===undefined?undefined:Math.max(0,line.quantity-line.received)*coverage};
}
export function ShipmentItems({lines,orders,products,sample=false,controls}:{lines:readonly Line[];orders:readonly PurchaseOrder[];products:readonly Product[];sample?:boolean;controls?:(line:Line,index:number)=>ReactNode}){
 const ids=[...new Set(lines.map(l=>l.purchaseOrderId))];
 return <div className="divide-y-2 divide-stone-200">{ids.map((id,group)=>{const po=orders.find(o=>o.id===id),title=sample?`PO-SAMPLE-${String(283+group).padStart(4,'0')}`:po?.purchaseOrderNumber??id;return <section key={id} className="py-4 first:pt-0"><header className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 font-semibold text-emerald-900">{sample?<span>{title} · Sample</span>:<Link target="_blank" rel="noreferrer" className="underline" to={`/purchases/${id}`}>{title} ↗</Link>}</header><div className="divide-y divide-stone-100">{lines.filter(l=>l.purchaseOrderId===id).map(l=>{const i=lines.indexOf(l),a=shipmentItemArea(l,orders,products,sample);const area=(n:number|undefined)=>n===undefined?'Not configured':`${num(n)} m²`;return <article key={l.lineId} className="space-y-3 py-3"><div><p className="text-sm font-semibold">{l.description}</p><p className="text-xs text-stone-500">{l.sku}</p></div><div className="grid grid-cols-2 gap-3 rounded-lg bg-stone-50 p-3 text-xs sm:grid-cols-3">{[['Quantity',`${num(l.quantity)} ${l.unit}`],['Coverage / unit',a.coverage===undefined?'Not configured':`${num(a.coverage)} m² / ${l.unit}`],['Total Area',area(a.total)],['Received',`${num(l.received)} ${l.unit}${a.received===undefined?'':' · '+area(a.received)}`],['Remaining',`${num(Math.max(0,l.quantity-l.received))} ${l.unit}${a.remaining===undefined?'':' · '+area(a.remaining)}`]].map(([label,value])=><div key={label}><p className="text-stone-500">{label}</p><strong className="mt-1 block font-semibold">{value}</strong></div>)}</div>{controls&&<div className="flex items-center justify-end gap-3">{controls(l,i)}</div>}</article>;})}</div></section>;})}{!lines.length&&<p className="text-xs text-stone-500">Link a purchase order above to display its products and quantities.</p>}</div>;
}
