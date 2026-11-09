import { expect, it } from "vitest";
import { calculateDashboardBasis, type DashboardBasisInput } from "./dashboardBasis";
import type { Account } from "../../accounting/types/account";
import type { JournalEntry } from "../../accounting/types/journalEntry";
import type { Invoice } from "../../sales/types/salesDocument";
import type { SupplierBill } from "../../purchases/types/supplierBill";
const account = (id: string, role: Account['systemRole']): Account => ({ id, code: id, name: id, type: role === 'GST_PAYABLE' ? 'LIABILITY' : 'ASSET', systemRole: role, active: true, allowManualPosting: true, createdAt: '', updatedAt: '' });
const journal = (id: string, date: string, cash: number, sourceType: JournalEntry['sourceType'] = 'BANK_TRANSACTION', tax = 0): JournalEntry => ({ id, journalNumber: id, journalDate: date, description: '', sourceType, status: 'POSTED', lines: [{ id: id+'cash', accountId: 'cash', accountCode: '', accountName: '', debit: Math.max(cash,0), credit: Math.max(-cash,0) }, { id: id+'tax', accountId: 'gst', accountCode: '', accountName: '', debit: Math.max(-tax,0), credit: Math.max(tax,0) }], totalDebit: 0, totalCredit: 0, createdAt: '', updatedAt: '', postedAt: '' });
const invoice: Invoice = { id: 'inv', documentNumber: 'INV', type: 'INVOICE', customerId: 'c', documentDate: '2026-11-01', dueDate: '2026-12-01', status: 'ISSUED', sourceSalesOrderId: 'so', lines: [], totals: {subtotal:100,taxAmount:10,total:110}, amountPaid:0,amountDue:110,createdAt:'',updatedAt:'' };
const bill: SupplierBill = {id:'bill',billNumber:'B',supplierInvoiceNumber:'B',supplierId:'s',supplierCode:'s',supplierName:'s',purchaseOrderId:'po',purchaseOrderNumber:'PO',billDate:'2026-10-01',dueDate:'2026-11-25',status:'OPEN',lines:[],totals:{subtotal:200,taxAmount:20,total:220,amountPaid:0,amountCredited:0,amountDue:220},createdAt:'',updatedAt:''};
const base = (): DashboardBasisInput => ({ accounts:[account('cash','BANK'),account('gst','GST_PAYABLE')],banks:[],journals:[],documents:[invoice],bills:[bill],payments:[],creditAllocations:[],supplierPayments:[],supplierCreditAllocations:[],date:'2026-11-02',basis:'accrual',includeGst:true,currency:'AUD' });
it('uses invoice date for AR and due date for AP, including later bills due this month',()=>{
 const input=base(), result=calculateDashboardBasis(input);
 expect(result.chart.at(-1)).toMatchObject({revenue:110,expenses:220});
 expect(calculateDashboardBasis({...input,includeGst:false}).chart.at(-1)).toMatchObject({revenue:100,expenses:200});
 expect(calculateDashboardBasis({...input,date:'2026-10-31'}).chart.at(-1)).toMatchObject({revenue:0,expenses:0});
});
it('reduces receivables after payment without treating later payments as historical receipts',()=>{
 const input=base(); input.payments=[{id:'p',paymentNumber:'p',customerId:'c',invoiceId:'inv',paymentDate:'2026-11-02',amount:55,method:'CASH',bankAccountId:'b',status:'RECEIVED',createdAt:'',updatedAt:''}];
 expect(calculateDashboardBasis(input).chart.at(-1)?.revenue).toBe(55);
 expect(calculateDashboardBasis({...input,date:'2026-11-01'}).chart.at(-1)?.revenue).toBe(110);
 expect(calculateDashboardBasis({...input,includeGst:false}).chart.at(-1)?.revenue).toBe(50);
});
it('counts actual cash, excludes openings and transfers, and never makes noncash GST into cash',()=>{
 const input={...base(),basis:'cash' as const,journals:[journal('receipt','2026-11-01',110,'BANK_TRANSACTION',10),journal('paid','2026-11-02',-55,'BANK_TRANSACTION',-5),journal('future','2026-11-03',99),journal('opening','2026-11-01',500,'OPENING_BALANCE'),journal('transfer','2026-11-01',40,'BANK_TRANSFER'),journal('invoice','2026-11-01',0,'CUSTOMER_INVOICE',10)]};
 expect(calculateDashboardBasis(input).chart.at(-1)).toMatchObject({revenue:110,expenses:55});
 expect(calculateDashboardBasis({...input,includeGst:false}).chart.at(-1)).toMatchObject({revenue:100,expenses:50});
});
it('uses the settled invoice tax ratio when a receipt journal itself has no GST lines',()=>{
 const input={...base(),basis:'cash' as const,includeGst:false};
 input.payments=[{id:'p',paymentNumber:'p',customerId:'c',invoiceId:'inv',paymentDate:'2026-11-01',amount:55,method:'CASH',bankAccountId:'b',status:'RECEIVED',createdAt:'',updatedAt:''}];
 input.journals=[{...journal('receipt','2026-11-01',55,'CUSTOMER_PAYMENT'),sourceId:'p'}];
 expect(calculateDashboardBasis(input).chart.at(-1)?.revenue).toBe(50);
});
it('breaks down all open balances, with overdue as a subset and due today still current',()=>{
 const input=base();
 input.documents=[{...invoice,id:'old',documentDate:'2026-10-01',dueDate:'2026-11-01'},{...invoice,id:'today',dueDate:'2026-11-02'},{...invoice,id:'draft',status:'DRAFT'},{...invoice,id:'future',documentDate:'2026-12-01'}];
 input.bills=[{...bill,id:'oldbill',dueDate:'2026-10-30'},bill,{...bill,id:'void',status:'VOID'}];
 expect(calculateDashboardBasis(input).breakdown).toEqual({asOf:'2026-11-02',invoices:{openCount:2,openAmount:220,overdueCount:1,overdueAmount:110},bills:{openCount:2,openAmount:440,overdueCount:1,overdueAmount:220}});
 const net=calculateDashboardBasis({...input,includeGst:false}).breakdown;
 expect(net.invoices).toMatchObject({openAmount:200,overdueAmount:100});
 expect(net.bills).toMatchObject({openAmount:400,overdueAmount:200});
});
it('reconciles expense drilldowns with chart amounts and respects GST and reporting dates',()=>{
 for(const includeGst of [true,false]) {
  const input={...base(),includeGst,journals:[journal('paid','2026-11-02',-55,'BANK_TRANSACTION',-5),journal('future','2026-11-03',-99)]};
  const accrual=calculateDashboardBasis(input);
  expect(accrual.expenseDetails.at(-1)?.chart.reduce((n,r)=>n+r.amount,0)).toBe(accrual.chart.at(-1)?.expenses);
  expect(accrual.expenseDetails.at(-1)?.chart[0]).toMatchObject({billId:'bill',date:'2026-11-25'});
  const cash=calculateDashboardBasis({...input,basis:'cash'});
  expect(cash.expenseDetails.at(-1)?.cash.reduce((n,r)=>n+r.amount,0)).toBe(cash.chart.at(-1)?.expenses);
  expect(cash.expenseDetails.at(-1)?.cash.map(r=>r.reference)).toEqual(['paid']);
  expect(accrual.expenseDetails.at(-2)?.bills[0]).toMatchObject({billId:'bill',amount:includeGst?220:200});
 }
});
