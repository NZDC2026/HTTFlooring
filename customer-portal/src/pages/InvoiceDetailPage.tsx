import { ArrowLeft, Download } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PortalHeader from "../components/PortalHeader";
import { invoices } from "../data/invoices";
import { useLocalAccount } from "../data/localAccount";
const money=(v:number)=>v.toLocaleString("en-AU",{style:"currency",currency:"AUD"});
const area = (value: number | null | undefined) => value == null ? "-" : `${value.toFixed(3)} m²`;
export default function InvoiceDetailPage(){
 const {profile}=useLocalAccount();
 const {id}=useParams(); const invoice=invoices.find(i=>i.id===id);
 if(!invoice) return <><PortalHeader/><main className="invoice-detail"><h1>Invoice not found</h1></main></>;
 const items = invoice.items;
 const totals = invoice;
 return <><PortalHeader/><main className="invoice-detail">
  <Link className="back-link" to="/invoices"><ArrowLeft size={17}/> Back to invoices</Link>
  <section className="invoice-paper">
   <div className="invoice-detail-head"><div><small>INVOICE</small><h1>{invoice.invoiceNumber}</h1></div><span className={`invoice-status ${invoice.status.toLowerCase()}`}>{invoice.status === "Overdue" ? `${invoice.overdueDays} DAYS OVERDUE` : invoice.status}</span></div>
   <div className="invoice-meta"><div><small>Issued</small><strong>{invoice.issueDate}</strong></div><div><small>Due</small><strong>{invoice.dueDate}</strong></div><div><small>Bill To</small><strong>{profile.businessName}</strong><span>{[profile.address,profile.suburb,profile.state,profile.postcode,"Australia"].filter(Boolean).join(", ")}</span></div></div>
   <div className="invoice-items-scroll"><div className="invoice-items">
    <div className="invoice-items-head"><span>Description</span><span>Size Per Box</span><span>Qty</span><span>Total Size</span><span>Unit Price</span><span>Amount</span></div>
    {items.map(item => <div key={item.productId}><span>{item.description}</span><span>{area(item.sizePerBox)}</span><span>{item.quantity}</span><span>{area(item.totalSize)}</span><span>{money(item.unitPrice)}</span><span>{money(item.amountCents / 100)}</span></div>)}
   </div></div>
   <div className="invoice-totals"><span>Subtotal <strong>{money(totals.subtotal)}</strong></span><span>Freight <strong>{money(totals.freight)}</strong></span><span>GST <strong>{money(totals.gst)}</strong></span><span>Total <strong>{money(totals.total)}</strong></span><span>Paid <strong>{money(totals.paid)}</strong></span><span className="balance">Balance Due <strong>{money(totals.balance)}</strong></span></div>
   <button className="primary-button invoice-download" onClick={()=>window.print()}><Download size={17}/> Print / Save PDF</button>
  </section>
 </main></>;
}
