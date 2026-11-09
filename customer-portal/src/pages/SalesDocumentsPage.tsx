import { ArrowLeft, Download, Search } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import PortalHeader from "../components/PortalHeader";
import { salesDocuments, type DocumentKind } from "../data/salesDocuments";
import { useLocalAccount } from "../data/localAccount";
const money=(value:number)=>value.toLocaleString("en-AU",{style:"currency",currency:"AUD"});
const statusClass=(status:string)=>["Accepted","Completed"].includes(status)?"paid":status==="Expired"?"overdue":"outstanding";
const area=(value:number|undefined)=>value==null?"-":`${value.toFixed(3)} m²`;
export default function SalesDocumentsPage({kind}:{kind:DocumentKind}) {
 const {id}=useParams();
 const [params,setParams]=useSearchParams();
 const {profile}=useLocalAccount();
 const title=kind==="quotes"?"Quotes":"Orders", singular=kind==="quotes"?"Quote":"Order";
 const dateLabel=kind==="quotes"?"Valid Until":"Expected Date";
 const records=salesDocuments.filter(record=>record.kind===kind);
 const query=params.get("q")??"",status=params.get("status")??"All";
 const update=(key:string,value:string)=>setParams(previous=>{const next=new URLSearchParams(previous);next.set(key,value);return next;},{replace:true});
 const listUrl=`/${kind}${params.size?`?${params}`:""}`;
 if(id){
  const record=records.find(record=>record.id===id);
  return <><PortalHeader/><main className="invoice-detail"><Link className="back-link" to={listUrl}><ArrowLeft size={17}/> Back to {kind}</Link>{!record?<h1>{singular} not found</h1>:<section className="invoice-paper">
   <div className="invoice-detail-head"><div><small>{singular.toUpperCase()}</small><h1>{record.number}</h1></div><span className={`invoice-status ${statusClass(record.status)}`}>{record.status}</span></div>
   <div className="invoice-meta"><div><small>Issued</small><strong>{record.issued}</strong></div><div><small>{dateLabel}</small><strong>{record.date}</strong></div><div><small>Customer</small><strong>{profile.businessName}</strong><span>{[profile.address,profile.suburb,profile.state,profile.postcode,"Australia"].filter(Boolean).join(", ")}</span></div></div>
   <div className="sales-document-reference"><small>Reference</small>{record.reference==="INV-10521"?<Link to="/invoices/inv-10521">{record.reference}</Link>:record.reference==="ORD-10540"?<Link to="/orders/ord-10540">{record.reference}</Link>:<strong>{record.reference}</strong>}</div>
   <div className="invoice-items-scroll"><div className="invoice-items"><div className="invoice-items-head"><span>Description</span><span>Size Per Box</span><span>Qty</span><span>Total Size</span><span>Unit Price</span><span>Amount</span></div>{record.items.map(item=><div key={item.productId}><Link to={`/products/${item.productId}`}>{item.description}</Link><span>{area(item.sizePerBox)}</span><span>{item.quantity}</span><span>{area(item.totalSize)}</span><span>{money(item.unitPrice)}</span><span>{money(item.amountCents/100)}</span></div>)}</div></div>
   <div className="invoice-totals"><span>Subtotal<strong>{money(record.subtotal)}</strong></span><span>Freight<strong>{money(record.freight)}</strong></span><span>GST<strong>{money(record.gst)}</strong></span><span className="balance">Total<strong>{money(record.total)}</strong></span></div>
   <button className="primary-button invoice-download" onClick={()=>window.print()}><Download size={17}/> Print / Save PDF</button>
  </section>}</main></>;
 }
 const summaryStatuses=kind==="quotes"?["Open","Accepted","Expired"]:["Processing","Ready for Collection","Completed"];
 const visible=records.filter(record=>(`${record.number} ${record.reference}`.toLowerCase().includes(query.trim().toLowerCase()))&&(status==="All"||record.status===status));
 return <><PortalHeader/><main className="invoices-page"><section className="invoices-heading"><h1>{title}</h1><p>{kind==="quotes"?"View quotations, pricing and validity dates.":"Track orders, expected dates and order status."}</p></section><section className="invoice-content">
 <nav className="document-tabs" aria-label={`${singular} documents`}><Link to={`/${kind}`} className="active" aria-current="page">{title}</Link></nav>
 <div className="invoice-summary">{summaryStatuses.map(value=>{const matches=records.filter(record=>record.status===value);return <div key={value} className={value==="Expired"?"danger-card":undefined}><small>{value}</small><strong>{money(matches.reduce((sum,record)=>sum+Math.round(record.total*100),0)/100)}</strong><span>{matches.length} {matches.length===1?singular.toLowerCase():kind}</span></div>;})}</div>
 <div className="invoice-search"><Search size={18}/><input aria-label={`Search ${kind}`} placeholder={`Search ${singular.toLowerCase()} number or reference...`} value={query} onChange={event=>update("q",event.target.value)}/><select aria-label={`${singular} status`} value={status} onChange={event=>update("status",event.target.value)}>{["All",...new Set(records.map(record=>record.status))].map(value=><option key={value}>{value}</option>)}</select></div>
 <div className="invoice-table"><div className="invoice-table-head"><span>{singular}</span><span>Issue Date</span><span>{dateLabel}</span><span>Amount</span><span>Reference</span><span>Status</span></div>{visible.map(record=><Link className="invoice-line" key={record.id} to={`/${kind}/${record.id}${params.size?`?${params}`:""}`}><strong>{record.number}</strong><span>{record.issued}</span><span>{record.date}</span><span>{money(record.total)}</span><span>{record.reference}</span><span className={`invoice-status ${statusClass(record.status)}`}>{record.status}</span></Link>)}{!visible.length&&<div className="empty-state"><p>No {kind} match your search.</p><button className="outline-copper-button" onClick={()=>setParams({})}>Clear filters</button></div>}</div>
 </section></main></>;
}
