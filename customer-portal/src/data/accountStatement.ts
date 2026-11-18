import { calculateInvoice, summarizeInvoices, type Invoice } from "./invoices";
import { archivedInvoices } from "./invoiceArchive";
import type { calculateLedger } from "./ledger";
type Ledger=ReturnType<typeof calculateLedger>;
export function accountStatement(ledger:Ledger,asOf:Date){
 const end=new Date(asOf.getFullYear(),asOf.getMonth(),asOf.getDate(),23,59,59,999);
 const invoices=[...ledger.invoices,...archivedInvoices].filter(invoice=>new Date(invoice.issueDate)<=end).map(invoice=>{
  const availableApplications=ledger.credits.flatMap(credit=>new Date(`${credit.date}T00:00:00`)<=end?credit.applications:[]).filter(application=>application.invoiceId===invoice.id&&new Date(application.appliedAt)<=end);
  const applied=availableApplications.reduce((sum,application)=>sum+Math.round(application.amount*100),0)/100;
  const base=calculateInvoice({...invoice,paid:"settledDate" in invoice&&new Date(String(invoice.settledDate))>end?0:invoice.paid,items:invoice.items},end);
  const balance=Math.max(0,Math.round((base.balance-applied)*100))/100;
  return {...base,balance,status:balance<=0?"Paid" as const:base.status,overdueDays:balance<=0?0:base.overdueDays,creditApplied:applied};
 }).filter(invoice=>invoice.balance>0).sort((a,b)=>new Date(a.issueDate).getTime()-new Date(b.issueDate).getTime());
 const credits=ledger.credits.filter(credit=>new Date(`${credit.date}T00:00:00`)<=end).map(credit=>{
  const applied=credit.applications.filter(application=>new Date(application.appliedAt)<=end).reduce((sum,application)=>sum+Math.round(application.amount*100),0);
  return {...credit,remainingAmount:Math.max(0,Math.round(credit.total*100)-applied)/100};
 }).filter(credit=>credit.remainingAmount>0);
 const summary=summarizeInvoices(invoices as Invoice[]);
 const unapplied=credits.reduce((sum,credit)=>sum+Math.round(credit.remainingAmount*100),0)/100;
 return {invoices,credits,summary,unapplied,net:Math.round((summary.outstanding-unapplied)*100)/100};
}
