import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Layers} from 'lucide-react';
import type {SalesDocument} from '../../sales/types/salesDocument';
import type {SalesFulfilment} from '../../sales/types/salesFulfilment';
export function pendingQuotesOrders(documents:SalesDocument[],fulfilments:SalesFulfilment[],from:string,to:string){
 return documents.filter(d=>{
  const expected=d.expectedDispatchDate||(d.type==='SALES_ORDER'?d.requestedDeliveryDate:'');
  if(expected&&(expected<from||expected>to))return false;
  if(d.type==='QUOTE')return ['DRAFT','SENT','ACCEPTED'].includes(d.status)&&!documents.some(x=>x.type==='SALES_ORDER'&&x.sourceQuoteId===d.id);
  if(d.type!=='SALES_ORDER'||!['CONFIRMED','PARTIALLY_FULFILLED','INVOICED'].includes(d.status)||d.fulfilmentStatus==='FULFILLED')return false;
  return d.lines.some(l=>(!l.itemType||l.itemType==='STOCK')&&l.quantity>fulfilments.filter(f=>f.status==='ACTIVE'&&f.salesOrderId===d.id).flatMap(f=>f.lines).filter(x=>x.salesOrderLineId===l.id).reduce((n,x)=>n+x.fulfilledQuantity,0)+0.000001);
 }).sort((a,b)=>(a.expectedDispatchDate||'9999').localeCompare(b.expectedDispatchDate||'9999'));
}
export function PendingQuotesOrders({documents,fulfilments,customers,sample,from,to,link}:{documents:SalesDocument[];fulfilments:SalesFulfilment[];customers:{id:string;businessName:string}[];sample:boolean;from:string;to:string;link:(path:string,filters?:Record<string,string>)=>string}){
 const [tab,setTab]=useState<'QUOTE'|'SALES_ORDER'>('QUOTE'),[all,setAll]=useState(false);
 const live=pendingQuotesOrders(documents,fulfilments,from,to);
 const rows=sample?(['QUOTE','SALES_ORDER'] as const).flatMap(type=>[0,1,2].map(i=>({id:type+i,type,number:(type==='QUOTE'?'QU':'SO')+'-SAMPLE-00000'+(i+1),customer:['Carlton Flooring Co.','Eastside Interiors','ABC Flooring'][i],amount:[4752,2365,7458][i],expected:to,days:[7,6,3][i]}))):live.map(d=>({id:d.id,type:d.type,number:d.documentNumber,customer:customers.find(c=>c.id===d.customerId)?.businessName??'Customer',amount:d.totals.total,expected:d.expectedDispatchDate||(d.type==='SALES_ORDER'?d.requestedDeliveryDate:'')||'',days:Math.max(0,Math.floor((new Date(to+'T12:00:00').getTime()-new Date(d.documentDate+'T12:00:00').getTime())/86400000))}));
 const selected=rows.filter(r=>r.type===tab);
 return <section className="reception-panel reception-pending"><h2><Layers/>Quotes &amp; Orders – Pending {sample&&<small>Sample</small>}<button onClick={()=>setAll(!all)}>{all?'Show less':'View All'} →</button></h2><p>Quotes not yet converted to orders and orders not fully dispatched. Dates show the customer’s requested Expected Date.</p><div className="pending-tabs">{(['QUOTE','SALES_ORDER'] as const).map(t=><button key={t} aria-pressed={tab===t} onClick={()=>{setTab(t);setAll(false);}}>{t==='QUOTE'?'Pending Quotes':'Pending Orders'} ({rows.filter(r=>r.type===t).length})</button>)}</div><div className="reception-shortage-scroll"><table><thead><tr><th>{tab==='QUOTE'?'Quote No.':'Order No.'}</th><th>Customer</th><th>Amount (inc. GST)</th><th>Expected Date</th><th className="pending-days">Days Open</th></tr></thead><tbody>{(all?selected:selected.slice(0,5)).map(r=><tr key={r.id}><td><Link to={sample?link('/sales',{special:tab==='QUOTE'?'pendingQuotes':'awaiting'}):link('/sales/'+(tab==='QUOTE'?'quotes/':'orders/')+r.id)}>{r.number}</Link></td><td>{r.customer}</td><td>{new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD'}).format(r.amount)}</td><td>{r.expected?new Date(r.expected+'T12:00:00').toLocaleDateString('en-AU'):'Not scheduled'}</td><td className="pending-days"><span className={'pending-days-value'+(r.days>=7?' pending-aged':'')}>{r.days} days</span></td></tr>)}</tbody></table>{!selected.length&&<p className="reception-empty">No pending {tab==='QUOTE'?'quotes':'orders'} for the selected dates.</p>}</div></section>;
}
