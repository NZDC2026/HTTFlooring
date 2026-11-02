import { invoices as originalInvoices, summarizeInvoices } from "./invoices";
import { useReturnNotes, type ReturnNote } from "./returnNotes";

export function calculateLedger(notes: ReturnNote[]) {
    const credits = notes.flatMap(note => note.creditNote ? [note.creditNote] : []).map(credit=>{
        const applications=credit.applications??[];
        const appliedCents=applications.reduce((sum,application)=>sum+Math.round(application.amount*100),0);
        return {...credit,applications,appliedAmount:appliedCents/100,remainingAmount:(Math.round(credit.total*100)-appliedCents)/100};
    });
    const invoices = originalInvoices.map(invoice => {
        const appliedCents=credits.flatMap(credit=>credit.applications).filter(application=>application.invoiceId===invoice.id).reduce((sum,application)=>sum+Math.round(application.amount*100),0);
        const balance = Math.max(0,Math.round(invoice.balance*100)-appliedCents)/100;
        const status = balance === 0 ? "Paid" as const : invoice.status;
        const issued=credits.filter(credit=>credit.invoiceId===invoice.id);
        return {...invoice,balance,status,overdueDays:balance === 0 ? 0 : invoice.overdueDays,creditApplied:appliedCents/100,creditTotal:issued.reduce((sum,credit)=>sum+Math.round(credit.total*100),0)/100,unappliedCredit:issued.reduce((sum,credit)=>sum+Math.round(credit.remainingAmount*100),0)/100};
    });
    return {invoices,credits,invoiceSummary:summarizeInvoices(invoices),unappliedCredit:credits.reduce((sum,credit)=>sum+Math.round(credit.remainingAmount*100),0)/100};
}
export function useInvoiceLedger() { return calculateLedger(useReturnNotes()); }
