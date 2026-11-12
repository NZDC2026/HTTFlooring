import type {Invoice,SalesDocument} from '../sales/types/salesDocument';
import type {Payment} from '../sales/types/payment';
import type {CreditAllocation} from '../sales/types/creditNote';
import {calculateInvoiceBalanceAsAt} from '../sales/data/invoiceBalanceAsAtService';
export type ReminderRow={id:string;customerId:string;number:string;customer:string;email:string;contactName?:string;recipientOptions?:{name:string;email:string}[];invoiceTotal?:number;documentDate?:string;dueDate:string;days:number;amount:number;status:'Overdue'|'Due today'|'Due soon'|'Later'|'Missing due date'|'Paid'};
export function reminderRows(documents:SalesDocument[],payments:Payment[],credits:CreditAllocation[],customers:{id:string;businessName:string;email?:string;primaryContactId?:string;contacts?:{id:string;firstName:string;lastName:string;email:string;isAccounting?:boolean;isPrimary:boolean;jobTitle?:string}[]}[],today:string,soon=7,includePaid=false):ReminderRow[]{
 return documents.filter((d):d is Invoice=>d.type==='INVOICE'&&['ISSUED','PARTIALLY_PAID','OVERDUE',...(includePaid?['PAID']:[])].includes(d.status)&&d.documentDate<=today&&!/sample/i.test(d.documentNumber)).flatMap<ReminderRow>(d=>{
 const amount=calculateInvoiceBalanceAsAt(d,payments,credits,today).amountDue;if(amount<=0&&!includePaid)return [];
 const customer=customers.find(c=>c.id===d.customerId),contacts=customer?.contacts??[],accountant=contacts.find(c=>c.isAccounting&&c.email),primary=contacts.find(c=>c.id===customer?.primaryContactId&&c.email)??contacts.find(c=>c.isPrimary&&c.email),owner=contacts.find(c=>/owner/i.test(c.jobTitle??''))??primary;
 const days=d.dueDate?Math.round((Date.parse(d.dueDate+'T00:00:00Z')-Date.parse(today+'T00:00:00Z'))/86400000):NaN;
 return [{id:d.id,customerId:d.customerId,number:d.documentNumber,customer:customers.find(c=>c.id===d.customerId)?.businessName??'Unknown customer',email:accountant?.email||d.recipient?.accountingEmail||primary?.email||customer?.email||'',contactName:owner?[owner.firstName,owner.lastName].filter(Boolean).join(' '):undefined,recipientOptions:[...contacts.filter(c=>c.email).map(c=>({name:[c.firstName,c.lastName].join(' '),email:c.email})),...(customer?.email?[{name:'Company primary email',email:customer.email}]:[])],invoiceTotal:d.totals.total,documentDate:d.documentDate,dueDate:d.dueDate??'',days:Number.isFinite(days)?days:0,amount,status:amount<=0?'Paid':!d.dueDate?'Missing due date':days<0?'Overdue':days===0?'Due today':days<=soon?'Due soon':'Later'}];
 }).sort((a,b)=>(a.dueDate||'9999').localeCompare(b.dueDate||'9999'));
}
export function sampleReminderRows(today:string):ReminderRow[]{const day=(n:number)=>new Date(Date.parse(today+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);return [
 {id:'sample-1',customerId:'sample-a',number:'INV-SAMPLE-0004725',customer:'Sample Harbour Flooring',email:'accounts@harbour.example.invalid',dueDate:day(-14),days:-14,amount:2843.75,status:'Overdue'},
 {id:'sample-2',customerId:'sample-a',number:'INV-SAMPLE-0004726',customer:'Sample Harbour Flooring',email:'accounts@harbour.example.invalid',dueDate:day(3),days:3,amount:1100,status:'Due soon'},
 {id:'sample-3',customerId:'sample-b',number:'INV-SAMPLE-0004727',customer:'Sample Parkside Interiors',email:'accounts@parkside.example.invalid',dueDate:day(0),days:0,amount:660,status:'Due today'}];}
