import type {SalesDocument} from '../sales/types/salesDocument';
import type {CreditNote} from '../sales/types/creditNote';
import type {Customer} from '../contacts/types/customer';
import {analysisEvents} from '../net-analysis/netAnalysisService';
import {salesAnalysisSources} from '../net-analysis/analysisSources';
import type {RepPerformance} from './performanceModel';
/** Uses dated invoice, credit and void events; does not infer margin or payroll awards. */
export function livePerformance(documents:SalesDocument[],credits:CreditNote[],customers:Customer[],month:string):RepPerformance[]{
 const repFor=(id:string)=>customers.find(c=>c.id===id)?.setup?.salesRep?.trim();
 const names=[...new Set(customers.map(c=>c.setup?.salesRep?.trim()).filter((n):n is string=>!!n))].sort();
 const events=analysisEvents(salesAnalysisSources(documents,credits,customers)).filter(e=>e.date.startsWith(month));
 return names.map((name,index)=>{const own=events.filter(e=>repFor(e.partyId)===name),sales=own.reduce((n,e)=>n+Math.round(e.subtotal*100),0)/100;const points=new Map<number,number>();let running=0;for(const e of own){running+=Math.round(e.subtotal*100);points.set(Number(e.date.slice(-2)),running/100);}return {id:name,name,initials:name.split(' ').map(n=>n[0]).slice(0,2).join(''),color:['#2d66ff','#e91e73','#21813c'][index%3],kpi:0,sales,openOrders:documents.filter(d=>d.type==='SALES_ORDER'&&repFor(d.customerId)===name&&!['DRAFT','VOID','CANCELLED','INVOICED'].includes(d.status)).reduce((n,d)=>n+d.totals.subtotal,0),quotes:documents.filter(d=>d.type==='QUOTE'&&repFor(d.customerId)===name&&!['DRAFT','VOID','CANCELLED','DECLINED','ACCEPTED','EXPIRED'].includes(d.status)).reduce((n,d)=>n+d.totals.subtotal,0),invoices:own.filter(e=>e.kind==='INVOICE'&&e.event==='DOCUMENT').length,mix:[],customers:'',daily:[[1,0],...points]};});
}
