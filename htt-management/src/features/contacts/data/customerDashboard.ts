import type { Customer } from "../types/customer";
import type { SalesDocument } from "../../sales/types/salesDocument";
import type { CreditNote } from "../../sales/types/creditNote";
import { businessDateKey, requireDateKey } from "../../../lib/businessDate";
export const daysAgo=(today:string,days:number)=>new Date(Date.parse(today)-days*86400000).toISOString().slice(0,10);
export const priorYear=(date:string)=>{const [y,m,d]=date.split('-').map(Number);return `${y-1}-${String(m).padStart(2,'0')}-${String(Math.min(d,new Date(Date.UTC(y-1,m,0)).getUTCDate())).padStart(2,'0')}`;};
export function customerDashboard(customers:readonly Customer[],documents:readonly SalesDocument[],credits:readonly CreditNote[],from:string,to:string){
 requireDateKey(from);requireDateKey(to);
 const invoices=documents.filter(d=>d.type==='INVOICE'&&!['DRAFT','VOID'].includes(d.status)&&!d.openingBalanceImportId&&d.documentDate<=to);
 const creditRows=credits.filter(c=>!['DRAFT','VOID'].includes(c.status)&&!c.openingBalanceImportId&&c.creditDate<=to);
 const orders=documents.filter(d=>d.type==='SALES_ORDER'&&!['DRAFT','CANCELLED'].includes(d.status));
 const net=(id:string,start:string,end:string)=>Math.round((invoices.filter(d=>d.customerId===id&&d.documentDate>=start&&d.documentDate<=end).reduce((n,d)=>n+d.totals.subtotal,0)-creditRows.filter(c=>c.customerId===id&&c.creditDate>=start&&c.creditDate<=end).reduce((n,c)=>n+c.totals.subtotal,0))*100)/100;
 const rows=customers.filter(c=>businessDateKey(c.createdAt)<=to).map(c=>{
  const lastPurchase=invoices.filter(d=>d.customerId===c.id).reduce((latest,d)=>d.documentDate>latest?d.documentDate:latest,'');
  const recent=net(c.id,daysAgo(to,30),to),previous=net(c.id,daysAgo(to,60),daysAgo(to,31));
  const health=!lastPurchase||lastPurchase<daysAgo(to,30)?'Inactive':previous>0&&recent<previous?'At Risk':'Active';
  const count=orders.filter(d=>d.customerId===c.id&&d.documentDate>=from&&d.documentDate<=to).length;
  return {id:c.id,name:c.businessName,created:businessDateKey(c.createdAt),lastPurchase,health,purchases:net(c.id,from,to),previousPurchases:net(c.id,priorYear(from),priorYear(to)),orders:count};
 });
 const months:{key:string;month:string;purchases:number;orders:number}[]=[];
 let cursor=from.slice(0,7)+'-01';while(cursor<=to){const end=new Date(Date.parse(cursor)+32*86400000).toISOString().slice(0,7)+'-01';const last=daysAgo(end,1);const start=cursor<from?from:cursor;months.push({key:cursor.slice(0,7),month:new Intl.DateTimeFormat('en-AU',{month:'short',timeZone:'UTC'}).format(new Date(cursor)),purchases:rows.reduce((n,c)=>n+net(c.id,start,last<to?last:to),0),orders:orders.filter(d=>d.documentDate>=start&&d.documentDate<end&&d.documentDate<=to&&rows.some(c=>c.id===d.customerId)).length});cursor=end;}
 return {rows,months,total:rows.length,active:rows.filter(c=>c.health==='Active').length,inactive:rows.filter(c=>c.health==='Inactive').length,risk:rows.filter(c=>c.health==='At Risk').length,newCustomers:rows.filter(c=>c.created>=from).length,purchases:rows.reduce((n,c)=>n+c.purchases,0),previousPurchases:rows.reduce((n,c)=>n+c.previousPurchases,0)};
}
