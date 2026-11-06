import { Link } from "react-router-dom";
import { usePurchaseOrders } from "../../purchases/data/usePurchaseOrders";
import { useSupplierBills } from "../../purchases/data/useSupplierBills";
import { useState } from "react";
import { supplierRepository } from "../data/supplierRepository";
import { useSuppliers } from "../data/useSuppliers";
import { usePermission } from "../../security/usePermission";
import { businessSettings } from "../../business-workspace/configurationState";

export function SupplierNotesTasks({supplierId}:{supplierId:string}) {
    const orders=usePurchaseOrders().filter(o=>o.supplierId===supplierId);
    const bills=useSupplierBills().filter(b=>b.supplierId===supplierId);
    const [documentType,setDocumentType]=useState(""),[documentId,setDocumentId]=useState("");
    const documents=documentType==="Order"?orders.map(o=>({id:o.id,number:o.purchaseOrderNumber})):bills.map(b=>({id:b.id,number:b.billNumber+" · "+b.supplierInvoiceNumber}));
    const supplier=useSuppliers().find(s=>s.id===supplierId);
    const canWrite=usePermission("contacts.write");
    const [kind,setKind]=useState<"Note"|"Task">("Note"),[text,setText]=useState(""),[due,setDue]=useState(""),[error,setError]=useState("");
    const [replies,setReplies]=useState<Record<string,string>>({});
    const timestamp=(v:string)=>new Intl.DateTimeFormat("en-AU",{timeZone:businessSettings().timezone,dateStyle:"medium",timeStyle:"short"}).format(new Date(v));
    const run=(fn:()=>void)=>{try{fn();setError("");}catch(e){setError(e instanceof Error?e.message:"Could not save activity.");}};
    const field="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm";
    return <section className="rounded-xl border border-[var(--color-border)] bg-white p-5">
        <h2 className="font-display text-xl">Notes &amp; Tasks</h2>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">Shared supplier follow-ups · Author and time are recorded automatically.</p>
        {canWrite&&<form className="mt-4 space-y-2" onSubmit={e=>{e.preventDefault();run(()=>{supplierRepository.addActivity({supplierId,operationId:crypto.randomUUID(),kind,text,...(kind==="Task"?{due,...(documentType?{documentType,documentId}:{})}:{})});setText("");setDue("");setDocumentType("");setDocumentId("");});}}>
            <div className="flex flex-wrap gap-2"><select className={field} aria-label="Supplier activity type" value={kind} onChange={e=>setKind(e.target.value as "Note"|"Task")}><option>Note</option><option>Task</option></select>{kind==="Task"&&<label className="text-xs">Due date <input type="date" className={field} required value={due} onChange={e=>setDue(e.target.value)}/></label>}</div>
            {kind==="Task"&&<div className="flex flex-wrap gap-2"><label className="grid gap-1 text-xs">Link to<select className={field} value={documentType} onChange={e=>{setDocumentType(e.target.value);setDocumentId("");}}><option value="">No document</option><option value="Order">Purchase order</option><option value="Invoice">Supplier invoice / bill</option></select></label>{documentType&&<label className="grid gap-1 text-xs">{documentType==="Order"?"Order number":"Invoice number"}<select required className={field} value={documentId} onChange={e=>setDocumentId(e.target.value)}><option value="">Select a number</option>{documents.map(d=><option key={d.id} value={d.id}>{d.number}</option>)}</select>{!documents.length&&<span>No documents for this supplier.</span>}</label>}</div>}
            <textarea aria-label="Supplier note or task" className={`${field} w-full`} required maxLength={2000} placeholder="Record a supplier conversation or follow-up task…" value={text} onChange={e=>setText(e.target.value)}/>
            <button className="rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs text-white">Add {kind.toLowerCase()}</button>
        </form>}
        {error&&<p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
        <div className="mt-4 space-y-3">{[...(supplier?.activities??[])].reverse().map(a=><article key={a.id} className="rounded-lg border border-[var(--color-border)] p-3">
            <div className="flex justify-between gap-2 text-xs"><span>{a.kind} · {a.actorName} · {timestamp(a.at)}</span><span className={a.completion?"text-green-700":"text-orange-700"}>{a.completion?"Completed":"Open"}</span></div>
            <p className="mt-2 whitespace-pre-wrap text-sm">{a.text}</p>{a.documentId&&<Link className="mt-2 inline-block text-xs underline" to={a.documentType==="Order"?`/purchases/${a.documentId}`:`/purchases/bills/${a.documentId}`}>{a.documentType==="Order"?orders.find(o=>o.id===a.documentId)?.purchaseOrderNumber:bills.find(b=>b.id===a.documentId)?.supplierInvoiceNumber||bills.find(b=>b.id===a.documentId)?.billNumber}</Link>}{a.due&&<p className="mt-1 text-xs">Due {a.due} · Responsible: {a.actorName}</p>}
            {a.replies.map(r=><div key={r.id} className="mt-2 border-l-2 border-[var(--color-border)] pl-3"><p className="text-[11px] text-[var(--color-text-muted)]">Reply · {r.actorName} · {timestamp(r.at)}</p><p className="whitespace-pre-wrap text-sm">{r.text}</p></div>)}
            {a.completion?<p className="mt-2 text-xs text-green-700">Handled by {a.completion.actorName} · {timestamp(a.completion.at)}</p>:canWrite&&<div className="mt-3 flex flex-wrap gap-2"><input aria-label={`Reply to ${a.kind}`} className={`${field} min-w-0 flex-1`} maxLength={2000} value={replies[a.id]??""} onChange={e=>setReplies({...replies,[a.id]:e.target.value})} placeholder="Reply…"/><button className={field} disabled={!replies[a.id]?.trim()} onClick={()=>run(()=>{supplierRepository.activityAction({supplierId,activityId:a.id,operationId:crypto.randomUUID(),action:"reply",text:replies[a.id]});setReplies({...replies,[a.id]:""});})}>Reply</button><button className={field} onClick={()=>run(()=>{supplierRepository.activityAction({supplierId,activityId:a.id,operationId:crypto.randomUUID(),action:"complete",text:"Marked as handled."});})}>Mark handled</button></div>}
        </article>)}{!supplier?.activities?.length&&<p className="text-sm text-[var(--color-text-muted)]">No saved notes or tasks.</p>}</div>
        <details className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs"><summary className="cursor-pointer font-semibold text-amber-900">Sample · Notes &amp; Tasks · Read-only preview</summary><div className="mt-3 space-y-3"><div><p className="font-semibold text-orange-700">Sample · Open task · Jamie · Purchasing</p><p>Confirm revised vessel ETA with agency. Purchase order: PO-SAMPLE-021 · Due in 3 days.</p></div><div><p className="font-semibold">Sample · Note · Alex · Purchasing</p><p>Supplier confirmed oak flooring is ready for dispatch. Completed task invoice link: BILL-SAMPLE-028 / SUP-INV-SAMPLE-442.</p><p className="mt-1 pl-3">Reply · Jamie: Packing list received and checked.</p><p className="mt-1 text-green-700">Completed by Jamie · Purchasing</p></div><p>Sample records are not saved or sent as live notifications.</p></div></details>
    </section>;
}
