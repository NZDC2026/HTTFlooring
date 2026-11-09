import type {Invoice,SalesDocument} from '../sales/types/salesDocument';
import type {Payment} from '../sales/types/payment';
import type {CreditAllocation} from '../sales/types/creditNote';
import {calculateInvoiceBalanceAsAt} from '../sales/data/invoiceBalanceAsAtService';
export type ReminderRow={id:string;customerId:string;number:string;customer:string;email:string;dueDate:string;days:number;amount:number;status:'Overdue'|'Due today'|'Due soon'|'Later'|'Missing due date'};
export function reminderRows(documents:SalesDocument[],payments:Payment[],credits:CreditAllocation[],customers:{id:string;businessName:string}[],today:string,soon=7):ReminderRow[]{
 return documents.filter((d):d is Invoice=>d.type==='INVOICE'&&['ISSUED','PARTIALLY_PAID','OVERDUE'].includes(d.status)&&!/sample/i.test(d.documentNumber)).flatMap<ReminderRow>(d=>{
 const amount=calculateInvoiceBalanceAsAt(d,payments,credits,today).amountDue;if(amount<=0)return [];
 const days=d.dueDate?Math.round((Date.parse(d.dueDate+'T00:00:00Z')-Date.parse(today+'T00:00:00Z'))/86400000):NaN;
 return [{id:d.id,customerId:d.customerId,number:d.documentNumber,customer:customers.find(c=>c.id===d.customerId)?.businessName??'Unknown customer',email:d.recipient?.accountingEmail??'',dueDate:d.dueDate??'',days:Number.isFinite(days)?days:0,amount,status:!d.dueDate?'Missing due date':days<0?'Overdue':days===0?'Due today':days<=soon?'Due soon':'Later'}];
 }).sort((a,b)=>(a.dueDate||'9999').localeCompare(b.dueDate||'9999'));
}
export function sampleReminderRows(today:string):ReminderRow[]{const day=(n:number)=>new Date(Date.parse(today+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);return [
 {id:'sample-1',customerId:'sample-a',number:'INV-SAMPLE-0004725',customer:'Sample Harbour Flooring',email:'accounts@harbour.example.invalid',dueDate:day(-14),days:-14,amount:2843.75,status:'Overdue'},
 {id:'sample-2',customerId:'sample-a',number:'INV-SAMPLE-0004726',customer:'Sample Harbour Flooring',email:'accounts@harbour.example.invalid',dueDate:day(3),days:3,amount:1100,status:'Due soon'},
 {id:'sample-3',customerId:'sample-b',number:'INV-SAMPLE-0004727',customer:'Sample Parkside Interiors',email:'accounts@parkside.example.invalid',dueDate:day(0),days:0,amount:660,status:'Due today'}];}
