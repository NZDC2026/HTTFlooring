import type {AgedReceivablesReport} from './types/agedReceivables';
import {sampleReminderRows} from '../invoice-reminders/rules';
export const agingKeys=['current','days1To30','days31To60','days61To90','days90Plus'] as const;
export const agingLabels=['Current','1–30 Days','31–60 Days','61–90 Days','90+ Days'];
export function sampleReceivables(date:string):AgedReceivablesReport{
 const invoices=sampleReminderRows(date),ids=[...new Set(invoices.map(r=>r.customerId))];
 const rows=ids.map(id=>{const docs=invoices.filter(r=>r.customerId===id);const aging={current:0,days1To30:0,days31To60:0,days61To90:0,days90Plus:0};for(const d of docs){const days=-d.days;aging[days<=0?'current':days<=30?'days1To30':days<=60?'days31To60':days<=90?'days61To90':'days90Plus']+=d.amount;}return {customerId:id,customerCode:id==='sample-a'?'CUST-SAMPLE-001':'CUST-SAMPLE-002',customerName:docs[0].customer,aging,totalOutstanding:docs.reduce((n,d)=>n+d.amount,0),overdueAmount:docs.filter(d=>d.days<0).reduce((n,d)=>n+d.amount,0),outstandingInvoiceCount:docs.length,overdueInvoiceCount:docs.filter(d=>d.days<0).length};});
 return {asOfDate:date,rows,aging:Object.fromEntries(agingKeys.map(k=>[k,rows.reduce((n,r)=>n+r.aging[k],0)])) as unknown as AgedReceivablesReport['aging'],totalOutstanding:rows.reduce((n,r)=>n+r.totalOutstanding,0),totalOverdue:rows.reduce((n,r)=>n+r.overdueAmount,0),customerCount:rows.length,overdueCustomerCount:rows.filter(r=>r.overdueAmount>0).length};
}
