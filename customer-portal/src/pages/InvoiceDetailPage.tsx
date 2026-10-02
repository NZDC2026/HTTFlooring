import { ArrowLeft, Download } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PortalHeader from "../components/PortalHeader";
import { invoices } from "../data/invoices";
const money=(v:number)=>v.toLocaleString("en-AU",{style:"currency",currency:"AUD"});
export default function InvoiceDetailPage(){
 const {id}=useParams(); const invoice=invoices.find(i=>i.id===id);
 if(!invoice) return <><PortalHeader/><main className="invoice-detail"><h1>Invoice not found</h1></main></>;
 return <><PortalHeader/><main className="invoice-detail">
  <Link className="back-link" to="/invoices"><ArrowLeft size={17}/> Back to invoices</Link>
  <section className="invoice-paper">
   <div className="invoice-detail-head"><div><small>INVOICE</small><h1>{invoice.invoiceNumber}</h1></div><span className={`invoice-status ${invoice.status.toLowerCase()}`}>{invoice.status === "Overdue" ? `${invoice.overdueDays} DAYS OVERDUE` : invoice.status}</span></div>
   <div className="invoice-meta"><div><small>Issued</small><strong>{invoice.issueDate}</strong></div><div><small>Due</small><strong>{invoice.dueDate}</strong></div><div><small>Bill To</small><strong>ABC Flooring Pty Ltd</strong><span>Melbourne, Australia</span></div></div>
   <div className="invoice-items"><div className="invoice-items-head"><span>Description</span><span>Qty</span><span>Unit Price</span><span>Amount</span></div><div><span>Bonita Natural Oak</span><span>40</span><span>$69.00</span><span>$2,760.00</span></div><div><span>Guardian D3016</span><span>20</span><span>$47.50</span><span>$950.00</span></div></div>
   <div className="invoice-totals"><span>Subtotal <strong>$3,710.00</strong></span><span>GST <strong>$371.00</strong></span><span>Total <strong>{money(invoice.total)}</strong></span><span>Paid <strong>{money(invoice.total-invoice.balance)}</strong></span><span className="balance">Balance Due <strong>{money(invoice.balance)}</strong></span></div>
   <button className="primary-button invoice-download"><Download size={17}/> Download PDF</button>
  </section>
 </main></>;
}
