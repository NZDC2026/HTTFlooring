import { requireDateKey } from "../../../lib/businessDate";
export interface SalesRange { from:string; to:string }
export type SalesPeriodRow = {id:string;date:string;number:string;type:"QUOTE"|"SALES_ORDER"|"INVOICE"|"PAYMENT";status:string;reference:string;amount:number;path?:string};
export function withinSalesRange(date:string,range:SalesRange) { return date>=range.from&&date<=range.to; }
export function previousSalesRange(range:SalesRange):SalesRange {
 const from=new Date(`${range.from}T00:00:00Z`),to=new Date(`${range.to}T00:00:00Z`);
 const days=Math.round((to.getTime()-from.getTime())/86400000)+1;
 const end=new Date(from.getTime()-86400000);
 return {from:new Date(end.getTime()-(days-1)*86400000).toISOString().slice(0,10),to:end.toISOString().slice(0,10)};
}
export function salesPeriodSummary(rows:SalesPeriodRow[],range:SalesRange) {
 requireDateKey(range.from);requireDateKey(range.to);if(range.from>range.to)throw new Error("Start date must be before end date.");
 const selected=rows.filter(r=>withinSalesRange(r.date,range));
 const invoices=selected.filter(r=>r.type==="INVOICE"&&!["DRAFT","VOID"].includes(r.status));
 const orders=selected.filter(r=>r.type==="SALES_ORDER"&&r.status!=="CANCELLED");
 const sales=invoices.reduce((s,r)=>s+r.amount,0),orderValue=orders.reduce((s,r)=>s+r.amount,0);
 const payments=selected.filter(r=>r.type==="PAYMENT"&&r.status==="RECEIVED").reduce((s,r)=>s+r.amount,0);
 const buckets=new Map<string,{month:string;sales:number;orders:number}>();
 const cursor=new Date(`${range.from.slice(0,7)}-01T00:00:00Z`);
 while(cursor.toISOString().slice(0,10)<=range.to){const month=cursor.toISOString().slice(0,7);buckets.set(month,{month,sales:0,orders:0});cursor.setUTCMonth(cursor.getUTCMonth()+1);}
 invoices.forEach(r=>{buckets.get(r.date.slice(0,7))!.sales+=r.amount;});orders.forEach(r=>{buckets.get(r.date.slice(0,7))!.orders++;});
 return {rows:selected,sales,orders:orders.length,average:orders.length?orderValue/orders.length:0,payments,trend:[...buckets.values()]};
}
export function sampleCustomerSalesRows(today:string):SalesPeriodRow[] {
 const offsets=[2,5,22,46,74,108,165,365];
 return offsets.flatMap((offset,i)=>{const d=new Date(`${today}T00:00:00Z`);d.setUTCDate(d.getUTCDate()-offset);const date=d.toISOString().slice(0,10),amount=5843.75+i*975,n=String(i+1).padStart(4,"0");return [
 {id:`sample-q-${i}`,date,number:`QU-SAMPLE-${n}`,type:"QUOTE" as const,status:"CONVERTED",reference:"Sample showroom order",amount},
 {id:`sample-o-${i}`,date,number:`SO-SAMPLE-${n}`,type:"SALES_ORDER" as const,status:"INVOICED",reference:`QU-SAMPLE-${n}`,amount},
 {id:`sample-i-${i}`,date,number:`INV-SAMPLE-${n}`,type:"INVOICE" as const,status:i===0?"PARTIALLY_PAID":"PAID",reference:`SO-SAMPLE-${n}`,amount},
 {id:`sample-p-${i}`,date,number:`PAY-SAMPLE-${n}`,type:"PAYMENT" as const,status:"RECEIVED",reference:`INV-SAMPLE-${n}`,amount:i===0?3000:amount},
 ];});
}
