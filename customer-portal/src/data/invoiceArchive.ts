import { calculateInvoice } from "./invoices";
// Paid historical example, kept separate from the existing outstanding ledger.
export const archivedInvoices=[{...calculateInvoice({id:"inv-10355",invoiceNumber:"INV-10355",issueDate:"18 Jul 2026",dueDate:"01 Aug 2026",paid:3342.99,freight:50,items:[{productId:"bonita-natural-oak",quantity:20,unitPrice:69}]}),creditApplied:0,creditTotal:0,unappliedCredit:0,settledDate:"2026-07-30"}];
