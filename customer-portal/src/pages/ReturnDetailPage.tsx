import { useState } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PortalHeader from "../components/PortalHeader";
import { confirmReturnNote, cancelReturnNote, returnDetails, useReturnNotes } from "../data/returnNotes";
import { useLocalAccount } from "../services/account";
const money=(value:number)=>value.toLocaleString("en-AU",{style:"currency",currency:"AUD"});
const area=(value?:number)=>value==null?"-":`${value.toFixed(3)} m²`;
export default function ReturnDetailPage(){
 const navigate=useNavigate();
 const {id}=useParams(),notes=useReturnNotes(),{profile}=useLocalAccount();
 const [error,setError]=useState("");
 const note=notes.find(note=>note.id===id);
 if(!note)return <><PortalHeader/><main className="invoice-detail"><Link to="/invoices?tab=returns">Back to return notes</Link><h1>Return note not found</h1></main></>;
 const detail=returnDetails(note);
 return <><PortalHeader/><main className="invoice-detail"><Link className="back-link" to="/invoices?tab=returns"><ArrowLeft size={17}/> Back to return notes</Link><section className="invoice-paper">
 <div className="invoice-detail-head"><div><small>RETURN NOTE</small><h1>{note.number}</h1></div><span className={`invoice-status return-${note.status.toLowerCase()}`}>{note.status}</span></div>
 <div className="invoice-meta"><div><small>Return Date</small><strong>{new Date(`${note.date}T12:00:00`).toLocaleDateString("en-AU",{day:"2-digit",month:"short",year:"numeric"})}</strong></div><div><small>Original Invoice</small><Link to={`/invoices/${detail.invoice.id}`}>{detail.invoice.invoiceNumber} →</Link></div><div><small>Customer</small><strong>{profile.businessName}</strong><span>{profile.region}, Australia</span></div></div>
 <div className="return-reason"><small>Return Reason</small><p>{note.reason}</p></div>
 <div className="invoice-items-scroll"><div className="invoice-items"><div className="invoice-items-head"><span>Description</span><span>Size Per Box</span><span>Return Qty</span><span>Total Size</span><span>Unit Price</span><span>Amount</span></div>{detail.items.map(item=><div key={item.productId}><span>{item.description}</span><span>{area(item.sizePerBox)}</span><span>{item.quantity}</span><span>{area(item.totalSize)}</span><span>{money(item.unitPrice)}</span><span>{money(item.amountCents/100)}</span></div>)}</div></div>
 <div className="invoice-totals"><span>Subtotal<strong>{money(detail.subtotal)}</strong></span><span>GST<strong>{money(detail.gst)}</strong></span><span className="balance">Return Total<strong>{money(detail.total)}</strong></span></div>
 <p className="local-notice">{note.status==="Cancelled"?"This request has been cancelled. No credit has been issued.":note.creditNote?`Credit note ${note.creditNote.number} has been issued. Open the credit note to apply it to an invoice. Freight is excluded.`:"Confirm receipt of these returned goods to issue an unapplied credit note. Apply it separately to reduce an invoice balance. Freight is excluded."}</p>
 {error&&<p className="form-error" role="alert">{error}</p>}{note.creditNote&&<Link className="credit-note-link" to={`/invoices/credits/${note.creditNote.id}`}>View {note.creditNote.number} →</Link>}<div className="return-actions">{(note.status==="Requested"||note.status==="Approved")&&<button className="primary-button" onClick={()=>{try{const credit=confirmReturnNote(note.id);navigate(`/invoices/credits/${credit.id}`);}catch(error){setError(error instanceof Error?error.message:"Unable to issue credit note.");}}}>Confirm Return & Issue Credit</button>}{note.status==="Requested"&&<button className="outline-copper-button" onClick={()=>{try{cancelReturnNote(note.id);}catch(error){setError(error instanceof Error?error.message:"Unable to cancel request.");}}}>Cancel Request</button>}<button className="primary-button" onClick={()=>window.print()}><Printer size={16}/> Print / Save PDF</button></div>
 </section></main></>;
}
