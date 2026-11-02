import { useSyncExternalStore } from "react";
import { invoices, type Invoice } from "./invoices";
export type ReturnStatus = "Requested" | "Approved" | "Confirmed" | "Cancelled";
export type CreditApplication = { invoiceId:string; amount:number; appliedAt:string };
export type CreditNote = { applications?: CreditApplication[]; id:string; number:string; returnId:string; returnNumber:string; invoiceId:string; date:string; reason:string; items:Invoice["items"]; subtotal:number; gst:number; total:number };
export type ReturnNote = { id: string; number: string; invoiceId: string; date: string; reason: string; status: ReturnStatus; creditNote?: CreditNote; items: {productId:string;quantity:number}[] };
const key = "htt.local.returns.v1";
const samples: ReturnNote[] = [
 {id:"ret-1002",number:"RET-1002",invoiceId:"inv-10521",date:"2026-10-28",reason:"Damaged packaging",status:"Requested",items:[{productId:"bonita-natural-oak",quantity:2}]},
 {id:"ret-1001",number:"RET-1001",invoiceId:"inv-10482",date:"2026-10-24",reason:"Incorrect item supplied",status:"Approved",items:[{productId:"guardian-d3016",quantity:1}]},
];
let revision=0;
const listeners=new Set<()=>void>();
function notify(){revision++;listeners.forEach(listener=>listener());}
if(typeof window!=="undefined")window.addEventListener("storage",notify);
// Ship preview credits with the app, so every origin/browser starts with the same examples.
const demoReturn:ReturnNote={id:"f3f20370-7a44-4ba3-bc17-521df979b92e",number:"RET-F3F20370",invoiceId:"inv-10521",date:"2026-11-02",reason:"Additional return sample for INV-10521",status:"Confirmed",items:[{productId:"guardian-d3016",quantity:1}]};
const seededSamples:ReturnNote[]=[...samples,demoReturn].map(note=>{
 const detail=returnDetails(note);
 const applied=note.invoiceId==="inv-10521";
 const creditNote:CreditNote={id:`cn-${note.id}`,number:note.number.replace(/^RET-/,"CN-"),returnId:note.id,returnNumber:note.number,invoiceId:note.invoiceId,date:"2026-11-02",reason:note.reason,items:detail.items.map(item=>({...item})),subtotal:detail.subtotal,gst:detail.gst,total:detail.total,applications:applied?[{invoiceId:note.invoiceId,amount:detail.total,appliedAt:"2026-11-02T00:00:00.000Z"}]:[]};
 return {...note,status:"Confirmed",creditNote};
});
function persistReturnNotes(notes:ReturnNote[]){localStorage.setItem(key,JSON.stringify({version:2,notes}));}
export function getReturnNotes(): ReturnNote[] {
 let stored;
 try{stored=JSON.parse(localStorage.getItem(key)??"null");}catch{stored=null;}
 if(stored?.version===2&&Array.isArray(stored.notes))return stored.notes;
 const existing:ReturnNote[]=Array.isArray(stored)?stored:[];
 const merged=existing.map(note=>{
  const sample=seededSamples.find(sample=>sample.id===note.id);
  return sample&&!note.creditNote&&note.status!=="Cancelled"?{...note,status:sample.status,creditNote:sample.creditNote}:note;
 });
 for(const sample of seededSamples)if(!merged.some(note=>note.id===sample.id))merged.push(sample);
 // Migrate once; subsequent cancellations and Apply changes remain untouched.
 try{persistReturnNotes(merged);}catch{/* Read-only storage still shows the bundled preview. */}
 return merged;
}
export function useReturnNotes(){useSyncExternalStore(listener=>{listeners.add(listener);return()=>{listeners.delete(listener);};},()=>revision);return getReturnNotes();}
export function returnDetails(note: ReturnNote){
 const invoice=invoices.find(invoice=>invoice.id===note.invoiceId);
 if(!invoice)throw new Error("Original invoice not found.");
 const items=note.creditNote?.items ?? note.items.map(item=>{
  const original=invoice.items.find(line=>line.productId===item.productId);
  if(!original)throw new Error("Item not found on original invoice.");
  const totalSize=original.sizePerBox==null?undefined:original.sizePerBox*item.quantity;
  const amountCents=Math.round(original.unitPrice*(totalSize??item.quantity)*100);
  return {...original,quantity:item.quantity,totalSize,amountCents};
 });
 const subtotalCents=items.reduce((sum,item)=>sum+item.amountCents,0),gstCents=Math.round(subtotalCents*.1);
 return {...note,invoice,items,subtotal:note.creditNote?.subtotal??subtotalCents/100,gst:note.creditNote?.gst??gstCents/100,total:note.creditNote?.total??(subtotalCents+gstCents)/100};
}
export function remainingReturnQuantity(invoiceId:string,productId:string,notes=getReturnNotes()){
 const original=invoices.find(invoice=>invoice.id===invoiceId)?.items.find(item=>item.productId===productId);
 const reserved=notes.filter(note=>note.invoiceId===invoiceId&&note.status!=="Cancelled").flatMap(note=>note.items).filter(item=>item.productId===productId).reduce((sum,item)=>sum+item.quantity,0);
 return Math.max(0,(original?.quantity??0)-reserved);
}
export function createReturnNote(invoiceId:string,items:ReturnNote["items"],reason:string){
 const notes=getReturnNotes();
 if(!invoices.some(invoice=>invoice.id===invoiceId))throw new Error("Select a valid invoice.");
 if(!reason.trim()||reason.trim().length>1000)throw new Error("Enter a return reason (up to 1000 characters).");
 if(!items.length)throw new Error("Select at least one item to return.");
 if(new Set(items.map(item=>item.productId)).size!==items.length)throw new Error("Duplicate return items.");
 for(const item of items)if(!Number.isInteger(item.quantity)||item.quantity<=0||item.quantity>remainingReturnQuantity(invoiceId,item.productId,notes))throw new Error("Return quantity exceeds the remaining purchased quantity.");
 const now=new Date(),date=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
 const id=crypto.randomUUID();
 const note:ReturnNote={id,number:`RET-${id.slice(0,8).toUpperCase()}`,invoiceId,date,reason:reason.trim(),status:"Requested",items};
 persistReturnNotes([note,...notes]);notify();return note;
}
export function cancelReturnNote(id:string){const notes=getReturnNotes(),note=notes.find(note=>note.id===id);if(!note||note.status!=="Requested")throw new Error("Only requested returns can be cancelled.");persistReturnNotes(notes.map(note=>note.id===id?{...note,status:"Cancelled"}:note));notify();}

export function confirmReturnNote(id:string): CreditNote {
 const notes=getReturnNotes(),note=notes.find(note=>note.id===id);
 if(!note)throw new Error("Return note not found.");
 if(note.creditNote)return note.creditNote;
 if(note.status!=="Requested"&&note.status!=="Approved")throw new Error("Only requested or approved returns can be confirmed.");
 if(!note.items.length||new Set(note.items.map(item=>item.productId)).size!==note.items.length)throw new Error("Invalid return items.");
 for(const item of note.items)if(!Number.isInteger(item.quantity)||item.quantity<=0||item.quantity>remainingReturnQuantity(note.invoiceId,item.productId,notes.filter(other=>other.id!==id)))throw new Error("Return quantity exceeds the purchased quantity.");
 const detail=returnDetails(note),now=new Date();
 const previousCredits=notes.flatMap(other=>other.creditNote&&other.invoiceId===note.invoiceId?[other.creditNote]:[]);
 // Final quantities receive remaining line cents, avoiding drift across split returns.
 detail.items=detail.items.map(item=>{
  const original=detail.invoice.items.find(line=>line.productId===item.productId)!;
  const previousItems=previousCredits.flatMap(credit=>credit.items).filter(line=>line.productId===item.productId);
  const returned=previousItems.reduce((sum,line)=>sum+line.quantity,0);
  const remainingCents=original.amountCents-previousItems.reduce((sum,line)=>sum+line.amountCents,0);
  return {...item,amountCents:returned+item.quantity===original.quantity?remainingCents:Math.min(item.amountCents,remainingCents)};
 });
 const subtotalCents=detail.items.reduce((sum,item)=>sum+item.amountCents,0);
 const originalSubtotalCents=detail.invoice.items.reduce((sum,item)=>sum+item.amountCents,0);
 const remainingSubtotalCents=originalSubtotalCents-previousCredits.reduce((sum,credit)=>sum+Math.round(credit.subtotal*100),0);
 const remainingGstCents=Math.round(originalSubtotalCents*.1)-previousCredits.reduce((sum,credit)=>sum+Math.round(credit.gst*100),0);
 const gstCents=subtotalCents===remainingSubtotalCents?remainingGstCents:Math.min(Math.round(subtotalCents*.1),remainingGstCents);
 detail.subtotal=subtotalCents/100;detail.gst=gstCents/100;detail.total=(subtotalCents+gstCents)/100;
 const date=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
 const credit:CreditNote={id:`cn-${note.id}`,number:note.number.replace(/^RET-/,"CN-"),returnId:note.id,returnNumber:note.number,invoiceId:note.invoiceId,date,reason:note.reason,items:detail.items.map(item=>({...item})),subtotal:detail.subtotal,gst:detail.gst,total:detail.total};
 // One storage write commits confirmation and its immutable credit snapshot together.
 persistReturnNotes(notes.map(other=>other.id===id?{...other,status:"Confirmed",creditNote:credit}:other));
 notify();return credit;
}

export function applyCreditNote(creditId:string,invoiceId:string,amount?:number){
 const notes=getReturnNotes();
 const credits=notes.flatMap(note=>note.creditNote?[note.creditNote]:[]);
 const credit=credits.find(credit=>credit.id===creditId);
 const invoice=invoices.find(invoice=>invoice.id===invoiceId);
 if(!credit||!invoice)throw new Error("Credit note or invoice not found.");
 const availableCents=Math.round(credit.total*100)-(credit.applications??[]).reduce((sum,application)=>sum+Math.round(application.amount*100),0);
 const balanceCents=Math.max(0,Math.round(invoice.balance*100)-credits.flatMap(credit=>credit.applications??[]).filter(application=>application.invoiceId===invoiceId).reduce((sum,application)=>sum+Math.round(application.amount*100),0));
 const amountCents=amount==null?Math.min(availableCents,balanceCents):Math.round(amount*100);
 if(!Number.isFinite(amountCents)||amountCents<=0||amountCents>availableCents||amountCents>balanceCents)throw new Error("Apply amount must be positive and cannot exceed available credit or invoice balance.");
 const updated:CreditNote={...credit,applications:[...(credit.applications??[]),{invoiceId,amount:amountCents/100,appliedAt:new Date().toISOString()}]};
 persistReturnNotes(notes.map(note=>note.creditNote?.id===creditId?{...note,creditNote:updated}:note));
 notify();return updated;
}
