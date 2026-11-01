import { ArrowLeft, Download } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PortalHeader from "../components/PortalHeader";
import { invoices } from "../data/invoices";
import { products } from "../data/products";
const money=(v:number)=>v.toLocaleString("en-AU",{style:"currency",currency:"AUD"});
type InvoiceItem = {
 productId: string;
 quantity: number;
 unitPrice: number;
};
const invoiceItems: InvoiceItem[] = [
 { productId: "bonita-natural-oak", quantity: 40, unitPrice: 69 },
 { productId: "guardian-d3016", quantity: 20, unitPrice: 47.5 },
];
const getSizePerBox = (packSize?: string) => {
 const match = packSize?.match(/^\s*(\d+(?:\.\d+)?)\s*m(?:²|2|\^2)\s*$/i);
 const value = match ? Number(match[1]) : undefined;
 return value != null && Number.isFinite(value) && value > 0 ? value : undefined;
};
const calculateItems = (items: InvoiceItem[]) => items.map(item => {
 const product = products.find(product => product.id === item.productId);
 const sizePerBox = getSizePerBox(product?.packSize);
 const totalSize = sizePerBox == null ? undefined : sizePerBox * item.quantity;
 const amountCents = Math.round(item.unitPrice * (totalSize ?? item.quantity) * 100);
 return { ...item, description: product?.name ?? item.productId, sizePerBox, totalSize, amountCents };
});
const calculateTotals = (items: { amountCents: number }[], paid: number) => {
 const subtotalCents = items.reduce((sum, item) => sum + item.amountCents, 0);
 const gstCents = Math.round(subtotalCents * 0.1);
 const totalCents = subtotalCents + gstCents;
 const paidCents = Math.round(paid * 100);
 return { subtotal: subtotalCents / 100, gst: gstCents / 100, total: totalCents / 100, paid: paidCents / 100, balance: (totalCents - paidCents) / 100 };
};
const area = (value: number | null | undefined) => value == null ? "-" : `${value.toFixed(3)} m²`;
export default function InvoiceDetailPage(){
 const {id}=useParams(); const invoice=invoices.find(i=>i.id===id);
 if(!invoice) return <><PortalHeader/><main className="invoice-detail"><h1>Invoice not found</h1></main></>;
 const items = calculateItems(invoiceItems);
 const totals = calculateTotals(items, invoice.total - invoice.balance);
 return <><PortalHeader/><main className="invoice-detail">
  <Link className="back-link" to="/invoices"><ArrowLeft size={17}/> Back to invoices</Link>
  <section className="invoice-paper">
   <div className="invoice-detail-head"><div><small>INVOICE</small><h1>{invoice.invoiceNumber}</h1></div><span className={`invoice-status ${invoice.status.toLowerCase()}`}>{invoice.status === "Overdue" ? `${invoice.overdueDays} DAYS OVERDUE` : invoice.status}</span></div>
   <div className="invoice-meta"><div><small>Issued</small><strong>{invoice.issueDate}</strong></div><div><small>Due</small><strong>{invoice.dueDate}</strong></div><div><small>Bill To</small><strong>ABC Flooring Pty Ltd</strong><span>Melbourne, Australia</span></div></div>
   <div className="invoice-items-scroll"><div className="invoice-items">
    <div className="invoice-items-head"><span>Description</span><span>Size Per Box</span><span>Qty</span><span>Total Size</span><span>Unit Price</span><span>Amount</span></div>
    {items.map(item => <div key={item.productId}><span>{item.description}</span><span>{area(item.sizePerBox)}</span><span>{item.quantity}</span><span>{area(item.totalSize)}</span><span>{money(item.unitPrice)}</span><span>{money(item.amountCents / 100)}</span></div>)}
   </div></div>
   <div className="invoice-totals"><span>Subtotal <strong>{money(totals.subtotal)}</strong></span><span>GST <strong>{money(totals.gst)}</strong></span><span>Total <strong>{money(totals.total)}</strong></span><span>Paid <strong>{money(totals.paid)}</strong></span><span className="balance">Balance Due <strong>{money(totals.balance)}</strong></span></div>
   <button className="primary-button invoice-download"><Download size={17}/> Download PDF</button>
  </section>
 </main></>;
}
