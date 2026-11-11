import type {Invoice} from '../../sales/types/salesDocument';
import type {HubTask} from '../../task-hub/taskHubModel';
export type PaymentFollowup={status:'Not Contacted'|'Contacted'|'Promised to Pay'|'Paid';last:string;note:string;promiseDate:string;promiseAmount:string;history:{at:string;action:string;note:string}[]};
export const emptyPaymentFollowup=():PaymentFollowup=>({status:'Not Contacted',last:'',note:'',promiseDate:'',promiseAmount:'',history:[]});
export function readPaymentFollowup(notes:string):PaymentFollowup{try{const v=JSON.parse(notes);return v.kind==='payment-followup-v1'?{...emptyPaymentFollowup(),...v}:emptyPaymentFollowup();}catch{return emptyPaymentFollowup();}}
export function unpaidCustomerRows(invoices:Invoice[],customers:{id:string;businessName:string}[],tasks:HubTask[],date:string){
 const groups=new Map<string,{id:string;customer:string;total:number;overdue:number;days:number;invoices:Invoice[];task?:HubTask;profile:PaymentFollowup}>();
 for(const i of invoices){if(i.amountDue<=0)continue;let row=groups.get(i.customerId);if(!row){const task=tasks.filter(t=>t.accountId===i.customerId&&t.source==='customer'&&t.type==='Payment'&&!!t.row?.paymentFollowupData).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))[0];row={id:i.customerId,customer:customers.find(c=>c.id===i.customerId)?.businessName??'Customer',total:0,overdue:0,days:0,invoices:[],task,profile:readPaymentFollowup(task?.row?.paymentFollowupData??'')};groups.set(i.customerId,row);}row.total+=i.amountDue;row.invoices.push(i);const days=Math.max(0,Math.round((Date.parse(date)-Date.parse(i.dueDate))/86400000));row.days=Math.max(row.days,days);if(days>0)row.overdue+=i.amountDue;}
 return [...groups.values()].map(r=>({...r,total:Math.round(r.total*100)/100,overdue:Math.round(r.overdue*100)/100})).sort((a,b)=>b.days-a.days||b.total-a.total);
}
