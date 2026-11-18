import TradeDocumentsList from "./TradeDocumentsList";
import { useWorkflowDocuments } from "../data/documentWorkflow";
import { ArrowLeft, Download } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import PortalHeader from "../components/PortalHeader";
import { type DocumentKind } from "../data/salesDocuments";
import { useLocalAccount } from "../services/account";
const money=(value:number)=>value.toLocaleString("en-AU",{style:"currency",currency:"AUD"});
const statusClass=(status:string)=>["Accepted","Completed"].includes(status)?"paid":status==="Expired"?"overdue":"outstanding";
const area=(value:number|undefined)=>value==null?"-":`${value.toFixed(3)} m²`;
export default function SalesDocumentsPage({kind}:{kind:DocumentKind}) {
 const {id}=useParams();
 const [params]=useSearchParams();
 const {profile}=useLocalAccount();
 const singular=kind==="quotes"?"Quote":"Order";
 const dateLabel=kind==="quotes"?"Valid Until":"Expected Date";
 const documents=useWorkflowDocuments();
 const records=documents.filter(record=>record.kind===kind);
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
 return <TradeDocumentsList kind={kind}/>;
}
