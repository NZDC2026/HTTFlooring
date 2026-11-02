import { expect, it } from 'vitest';
import { emptyPayroll, type PayRun } from '../../payroll/data/payrollModel';
import type { Account } from '../../accounting/types/account';
import type { JournalEntry } from '../../accounting/types/journalEntry';
import { dashboardGst, dashboardPayroll } from './dashboardObligations';
it('shows zero balances and no dates when payroll has no records',()=>{
 const result=dashboardPayroll(emptyPayroll(),'2026-11-02');
 expect(result.payRuns).toEqual([]);
 expect(result.superannuation).toEqual({amount:0,nextPaymentDate:undefined,lastPaymentDate:undefined});
 expect(result.payg.amount).toBe(0);
});
function fixture(){
 const state=emptyPayroll();
 state.runs=[{id:'run',start:'2026-10-19',end:'2026-11-01',payDate:'2026-11-02',status:'Posted',settings:{superItemId:'super',netAccountId:'wages'},slips:[{lines:[{item:{id:'super',category:'Employer contribution',liabilityAccountId:'super-payable'},amount:120},{item:{id:'tax',category:'Tax',accountId:'tax-payable'},amount:200},{item:{id:'other',category:'Employer contribution',liabilityAccountId:'other-payable'},amount:99}]}]} as unknown as PayRun];
 return state;
}
it('subtracts only matching payments and separates scheduled dates from completed payments',()=>{
 const state=fixture();
 state.payments=[{id:'super-payment',runId:'run',accountId:'super-payable',date:'2026-11-02',amount:40,status:'Posted'},{id:'tax-payment',runId:'run',accountId:'tax-payable',date:'2026-11-10',amount:100,status:'Posted'}] as typeof state.payments;
 const result=dashboardPayroll(state,'2026-11-02');
 expect(result.superannuation).toEqual({amount:80,nextPaymentDate:undefined,lastPaymentDate:'2026-11-02'});
 expect(result.payg).toEqual({amount:200,nextPaymentDate:'2026-11-10',lastPaymentDate:undefined});
 expect(result.payRuns[0]).toMatchObject({start:'2026-10-19',end:'2026-11-01',payDate:'2026-11-02'});
 expect(dashboardPayroll(state,'2026-11-01').superannuation.amount).toBe(0);
});
it('preserves historical liabilities until their run reversal date',()=>{
 const state=fixture(); state.runs[0].status='Reversed';state.runs[0].reversalDate='2026-11-05';
 expect(dashboardPayroll(state,'2026-11-02').payg.amount).toBe(200);
 expect(dashboardPayroll(state,'2026-11-05').payg.amount).toBe(0);
});
it('calculates GST from the selected month with dated reversing entries and excludes openings',()=>{
 const accounts=[{id:'collected',systemRole:'GST_PAYABLE'},{id:'paid',systemRole:'GST_RECEIVABLE'}] as Account[];
 const row=(date:string,collected:number,paid:number,sourceType:JournalEntry['sourceType']='CUSTOMER_INVOICE')=>({journalDate:date,sourceType,status:'POSTED',lines:[{accountId:'collected',debit:Math.max(-collected,0),credit:Math.max(collected,0)},{accountId:'paid',debit:Math.max(paid,0),credit:Math.max(-paid,0)}]} as JournalEntry);
 const journals=[row('2026-11-01',100,30),row('2026-11-02',-10,0,'INVOICE_VOID'),row('2026-10-31',999,999),row('2026-11-03',500,500),row('2026-11-01',800,0,'OPENING_BALANCE')];
 expect(dashboardGst(accounts,journals,'2026-11-02')).toEqual({collected:90,paid:30,net:60});
});
