import {useState} from 'react';
import {UserRound,ArrowRight,X} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useFinanceOverview} from '../data/useFinanceOverview';
import {useCustomers} from '../../contacts/data/useCustomers';
import {useTaskHub} from '../../task-hub/useTaskHub';
import {businessSettings} from '../../business-workspace/configurationState';
import {agingLabels,agingColors,agingBucket,overdueDays} from '../data/receivablesAging';
import './receivables-aging.css';
export function ReceivablesAging({sample,date}:{sample:boolean;date:string}){
 const finance=useFinanceOverview(date),customers=useCustomers(),tasks=useTaskHub();
 const [selection,setSelection]=useState<number|null>(null);
 const currency=businessSettings().currency;
 const money=(n:number)=>new Intl.NumberFormat('en-AU',{style:'currency',currency,maximumFractionDigits:n%1?2:0}).format(n);
 const sampleCounts=[18,0,5,3,4];
 const rows=sample
  ? [299750,0,76800,43200,48450].flatMap((amount,bucket)=>{
     const count=sampleCounts[bucket];
     const share=count ? Math.floor(amount/count*100)/100 : 0;
     return Array.from({length:count},(_,i)=>({
      id:`sample-${bucket}-${i}`,
      number:`INV-SAMPLE-${bucket+1}${String(i+1).padStart(3,'0')}`,
      customer:['Harbour Flooring','Parkside Interiors','Richmond Timber Floors'][i%3],
      amount:i===0 ? amount-share*(count-1) : share,
      days:[0,15,45,75,104][bucket],
      last:i%2 ? '—' : date,
      bucket,
     }));
    })
  :
 finance.openInvoices.map(invoice=>{const days=overdueDays(invoice.dueDate,date);const last=tasks.rows.filter(t=>t.documentPath==='/sales/invoices/'+invoice.id&&['Payment','Follow-up'].includes(t.type)&&t.completedAt&&t.completedAt.slice(0,10)<=date).map(t=>t.completedAt!).sort().at(-1);return {id:invoice.id,number:invoice.documentNumber,customer:customers.find(c=>c.id===invoice.customerId)?.businessName??'Customer',amount:invoice.amountDue,days,last:last?.slice(0,10)||'—',bucket:agingBucket(days)};});
 const total=rows.reduce((s,r)=>s+Math.round(r.amount*100),0)/100;
 const buckets=agingLabels.map((label,i)=>({label,color:agingColors[i],amount:rows.filter(r=>r.bucket===i).reduce((s,r)=>s+Math.round(r.amount*100),0)/100,count:rows.filter(r=>r.bucket===i).length}));
 let position=0;const gradient=buckets.map(b=>{const start=position;position+=total?b.amount/total*100:0;return `${b.color} ${start}% ${position}%`;}).join(',');
 const filtered=selection===-1?rows:rows.filter(r=>r.bucket===selection);
 return <section className="ar-aging" aria-label="Accounts Receivable – Aging"><header><span className="ar-person"><UserRound/></span><div className="ar-heading"><h2>Accounts Receivable – Aging</h2><p>Outstanding customer invoices by aging period.</p>{sample&&<small>Sample · Read-only populated preview</small>}</div><div className="ar-total"><span>Total Outstanding</span><strong>{money(total)}</strong><small>{rows.filter(r=>r.days>0).length} overdue invoices · incl. GST</small></div><button className="ar-view" onClick={()=>setSelection(-1)}>View All <ArrowRight/></button></header><div className="ar-content"><div className="ar-donut" role="img" aria-label={'Total AR '+money(total)} style={{background:total?`conic-gradient(${gradient})`:'#edf0f2'}}><div><strong>{money(total)}</strong><span>Total AR</span></div></div><div className="ar-table-wrap"><table><thead><tr><th>Aging</th><th>Amount ({currency})</th><th>% of Total</th><th>Invoices</th></tr></thead><tbody>{buckets.map((b,i)=><tr key={b.label} className={i===0?'ar-current':i===4?'ar-late':''} onClick={()=>setSelection(i)}><td><button onClick={e=>{e.stopPropagation();setSelection(i);}}><i style={{background:b.color}}/>{b.label}</button></td><td>{money(b.amount)}</td><td>{total?Math.round(b.amount/total*100):0}%</td><td>{b.count}</td></tr>)}</tbody></table></div></div>{!rows.length&&<p className="ar-empty">No outstanding invoices as at {date}.</p>}
 {selection!==null&&<div className="ar-details"><div><h3>{sample?'Sample · ':''}{selection===-1?'All outstanding invoices':agingLabels[selection]} · {filtered.length} invoices</h3><button aria-label="Close aging details" onClick={()=>setSelection(null)}><X size={20}/></button></div><p>As at {date} · Due-date aging · Amounts include GST · Last Follow-up shows the latest completed invoice-linked payment / follow-up task.</p><div className="ar-table-wrap"><table><thead><tr>{['Customer','Invoice','Outstanding','Days Overdue','Last Follow-up'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{filtered.map(r=><tr key={r.id}><td>{r.customer}</td><td>{sample?r.number:<Link to={'/sales/invoices/'+r.id}>{r.number}</Link>}</td><td>{money(r.amount)}</td><td>{r.days||'Current'}</td><td>{r.last}</td></tr>)}</tbody></table>{!filtered.length&&<p className="ar-empty">No outstanding invoices in this aging period.</p>}</div></div>}
 </section>;
}
