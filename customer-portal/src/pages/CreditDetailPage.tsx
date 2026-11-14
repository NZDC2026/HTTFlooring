import { useState } from "react";
import { applyCreditNote } from "../data/returnNotes";
import { ArrowLeft, Printer } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PortalHeader from "../components/PortalHeader";
import { useInvoiceLedger } from "../data/ledger";
import { useLocalAccount } from "../services/account";
const money=(value:number)=>value.toLocaleString("en-AU",{style:"currency",currency:"AUD"});
const area=(value?:number)=>value==null?"-":`${value.toFixed(3)} m²`;
export default function CreditDetailPage(){
 const [targetId,setTargetId]=useState(""),[error,setError]=useState("");
 const {id}=useParams(),{credits,invoices}=useInvoiceLedger(),{profile}=useLocalAccount();const credit=credits.find(credit=>credit.id===id);
 if(!credit)return <><PortalHeader/><main className="invoice-detail"><Link to="/invoices?tab=credits">Back to credit notes</Link><h1>Credit note not found</h1></main></>;
 const invoice=invoices.find(invoice=>invoice.id===credit.invoiceId)!;
 const eligible=invoices.filter(invoice=>invoice.balance>0);
 const target=eligible.find(invoice=>invoice.id===targetId)??eligible.find(invoice=>invoice.id===credit.invoiceId)??eligible[0];
 const maximum=target?Math.min(target.balance,credit.remainingAmount):0;
 return <><PortalHeader/><main className="invoice-detail"><Link className="back-link" to="/invoices?tab=credits"><ArrowLeft size={17}/> Back to credit notes</Link><section className="invoice-paper"><div className="invoice-detail-head"><div><small>CREDIT NOTE</small><h1>{credit.number}</h1></div><span className="invoice-status return-confirmed">{credit.remainingAmount===0?"Applied":credit.appliedAmount>0?"Partially Applied":"Issued"}</span></div>
 <div className="invoice-meta"><div><small>Issued</small><strong>{new Date(`${credit.date}T12:00:00`).toLocaleDateString("en-AU",{day:"2-digit",month:"short",year:"numeric"})}</strong></div><div><small>Original Invoice</small><Link to={`/invoices/${invoice.id}`}>{invoice.invoiceNumber} →</Link><small>Return Note</small><Link to={`/invoices/returns/${credit.returnId}`}>{credit.returnNumber} →</Link></div><div><small>Customer</small><strong>{profile.businessName}</strong><span>{profile.region}, Australia</span></div></div>
 <div className="return-reason"><small>Reason</small><p>{credit.reason}</p></div><div className="invoice-items-scroll"><div className="invoice-items"><div className="invoice-items-head"><span>Description</span><span>Size Per Box</span><span>Return Qty</span><span>Total Size</span><span>Unit Price</span><span>Credit Amount</span></div>{credit.items.map(item=><div key={item.productId}><span>{item.description}</span><span>{area(item.sizePerBox)}</span><span>{item.quantity}</span><span>{area(item.totalSize)}</span><span>{money(item.unitPrice)}</span><span>{money(item.amountCents/100)}</span></div>)}</div></div>
 <div className="invoice-totals"><span>Subtotal<strong>{money(credit.subtotal)}</strong></span><span>GST<strong>{money(credit.gst)}</strong></span><span className="balance">Credit Total<strong>{money(credit.total)}</strong></span></div>
 <div className="invoice-totals"><span>Applied<strong>{money(credit.appliedAmount)}</strong></span><span>Available Credit<strong>{money(credit.remainingAmount)}</strong></span></div>
 <section className="credit-application"><h3>Apply to Invoice</h3>{credit.applications.length ? <ul>{credit.applications.map((application,index)=><li key={index}><Link to={`/invoices/${application.invoiceId}`}>{invoices.find(invoice=>invoice.id===application.invoiceId)?.invoiceNumber}</Link><strong>{money(application.amount)}</strong></li>)}</ul> : <p>-</p>}
 {credit.remainingAmount>0&&<form className="local-form" onSubmit={event=>{event.preventDefault();setError("");try{const values=new FormData(event.currentTarget);if(!target)throw new Error("No outstanding invoice is available.");applyCreditNote(credit.id,target.id,Number(values.get("amount")));}catch(error){setError(error instanceof Error?error.message:"Unable to apply credit.");}}}>
 <label>Invoice<select value={target?.id??""} onChange={event=>{setTargetId(event.target.value);setError("");}} disabled={!target}>{eligible.map(invoice=><option key={invoice.id} value={invoice.id}>{invoice.invoiceNumber} · Balance {money(invoice.balance)}</option>)}</select></label>
 <label>Amount to Apply<input key={`${target?.id}-${maximum}`} name="amount" type="number" min="0.01" max={maximum} step="0.01" defaultValue={maximum.toFixed(2)} required disabled={maximum<=0}/></label>
 {error&&<p role="alert" className="form-error">{error}</p>}<button className="primary-button" disabled={maximum<=0}>Apply Credit</button></form>}
 </section><p className="local-notice">Unapplied credit does not change invoice balances. Apply Credit updates the selected invoice and all account summaries immediately. Freight is excluded.</p>
 <div className="return-actions"><button className="primary-button" onClick={()=>window.print()}><Printer size={16}/> Print / Save PDF</button></div></section></main></>;
}
