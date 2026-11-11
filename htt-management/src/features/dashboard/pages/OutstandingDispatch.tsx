import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Package} from 'lucide-react';
import type {SalesDocument} from '../../sales/types/salesDocument';
import type {SalesFulfilment} from '../../sales/types/salesFulfilment';
import type {Product} from '../../inventory/types/product';
export function outstandingDispatchRows(documents:SalesDocument[],fulfilments:SalesFulfilment[],products:Product[]){
 return documents.filter(d=>d.type==='SALES_ORDER'&&!['CANCELLED','VOIDED'].includes(d.status)).flatMap(d=>{
 const lines=d.lines.filter(l=>!l.itemType||l.itemType==='STOCK').map(l=>{const p=products.find(p=>p.id===l.productId),unit=p?.units.find(u=>u.id===l.unitId);const total=l.quantity*(unit?.conversionToBase??1);const sent=fulfilments.filter(f=>f.status==='ACTIVE'&&f.salesOrderId===d.id).flatMap(f=>f.lines).filter(x=>x.salesOrderLineId===l.id).reduce((n,x)=>n+x.fulfilledBaseQuantity,0);return {total,sent:Math.min(total,sent),unit:p?.units.find(u=>u.id===p.baseUnitId)?.symbol??l.unitSymbol};});
 const total=lines.reduce((n,l)=>n+l.total,0),sent=lines.reduce((n,l)=>n+l.sent,0);
 if(total<=0||total-sent<0.000001)return [];
 const quantities=(key:'total'|'sent'|'remaining')=>{const groups=new Map<string,number>();for(const l of lines)groups.set(l.unit,(groups.get(l.unit)??0)+(key==='remaining'?l.total-l.sent:l[key]));return [...groups].map(([u,n])=>`${n.toLocaleString('en-AU',{maximumFractionDigits:3})} ${u}`).join(' · ');};
 return [{id:d.id,number:d.documentNumber,customerId:d.customerId,total:quantities('total'),sent:quantities('sent'),remaining:quantities('remaining'),hasDispatch:sent>0,progress:Math.round(sent/total*100),expected:d.expectedDispatchDate??''}];
 });
}
export function partialDispatchRows(documents:SalesDocument[],fulfilments:SalesFulfilment[],products:Product[]){return outstandingDispatchRows(documents,fulfilments,products).filter(r=>r.hasDispatch);}
export function OutstandingDispatch({documents,fulfilments,products,customers,sample,date,link}:{documents:SalesDocument[];fulfilments:SalesFulfilment[];products:Product[];customers:{id:string;businessName:string}[];sample:boolean;date:string;link:(path:string,filters?:Record<string,string>)=>string}){
 const [search,setSearch]=useState(''),[all,setAll]=useState(false);
 const rows=sample?[{id:'sample-partial-1',number:'SO-SAMPLE-10432',customerId:'sample',total:'300 m²',sent:'220 m²',remaining:'80 m²',hasDispatch:true,progress:73,expected:date},{id:'sample-partial-2',number:'SO-SAMPLE-10438',customerId:'sample',total:'150 m²',sent:'50 m²',remaining:'100 m²',hasDispatch:true,progress:33,expected:date}]:partialDispatchRows(documents,fulfilments,products);
 const customerName=(r:typeof rows[number])=>sample?['ABC Flooring','Richmond Timber Floors'][rows.indexOf(r)]:customers.find(c=>c.id===r.customerId)?.businessName??'';
 const filtered=rows.filter(r=>`${r.number} ${customerName(r)}`.toLowerCase().includes(search.toLowerCase()));
 return <section className="reception-panel outstanding-dispatch"><h2><Package/>Outstanding Dispatch {sample&&<small>Sample</small>}<button type="button" onClick={()=>setAll(!all)}>{all?'Show less':'View all'} →</button></h2><p>Partially dispatched orders with quantity still remaining.</p><div className="dispatch-summary"><input aria-label="Search outstanding dispatch orders" placeholder="Search order or customer…" value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="reception-shortage-scroll"><table><thead><tr>{['Order No.','Customer','Total Qty','Dispatched','Remaining','Progress','Status','Next Pickup / ETA'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{(all?filtered:filtered.slice(0,5)).map(r=><tr key={r.id}><td><Link to={sample?link('/sales',{sample:'1',tab:'SALES_ORDER'}):link('/sales/orders/'+r.id)}>{r.number}</Link></td><td>{customerName(r)}</td><td>{r.total}</td><td>{r.sent}</td><td><b>{r.remaining}</b></td><td><progress value={r.progress} max={100}/> {r.progress}%</td><td><em className="follow-up">Partial</em></td><td>{r.expected?new Date(r.expected+'T12:00:00').toLocaleDateString('en-AU'):'Not scheduled'}</td></tr>)}</tbody></table></div>{!filtered.length&&<p className="reception-empty">No partially dispatched orders match your search.</p>}</section>;
}
