import type {HubTask} from '../../task-hub/taskHubModel';
import type {Customer} from '../../contacts/types/customer';
import type {CreditNote} from '../../sales/types/creditNote';
import type {StockAdjustment} from '../../stock-adjustments/stockAdjustmentRepository';
import type {ManagedDraft} from '../../direct-documents/managedDocumentRepository';
import type {PaymentBatch} from '../../finance-closure/paymentBatchRepository';
import type {SupplierBill} from '../../purchases/types/supplierBill';
export const approvalKinds=['Credit Hold','Credit Note','Special Discount','Inventory Adj.','Payment Approval'] as const;
export type ApprovalKind=typeof approvalKinds[number];
export type AdminApproval={id:string;sourceId:string;kind:ApprovalKind;details:string;amount?:number;requestedBy:string;date:string;path:string;status:'Pending'|'Approved'|'Rejected';source:'hold'|'credit'|'discount'|'adjustment'|'payment';revision?:number};
export const shiftAdminDate=(date:string,offset:number)=>new Date(Date.parse(date+'T12:00:00Z')+offset*86400000).toISOString().slice(0,10);
export function teamTaskBucket(task:HubTask,today:string){
 if(task.status==='Completed')return 'Completed';
 if(task.status==='Overdue'||task.due&&task.due.slice(0,10)<today)return 'Overdue';
 if(task.due.slice(0,10)===today)return 'Due Today';
 if(task.due&&task.due.slice(0,10)>today&&task.due.slice(0,10)<=shiftAdminDate(today,7))return 'Due Soon';
 return task.status==='In progress'?'In Progress':'Not Started';
}
export function teamTaskOverview(tasks:HubTask[],today:string,userId:string){
 const rows=tasks.filter(t=>!['Cancelled','Inactive'].includes(t.status));
 const buckets=['Completed','In Progress','Due Today','Due Soon','Overdue','Not Started'].map(label=>({label,count:rows.filter(t=>teamTaskBucket(t,today)===label).length}));
 return {rows,buckets,total:rows.length,mine:rows.filter(t=>t.owner===userId).length,overdue:buckets.find(b=>b.label==='Overdue')!.count,completed:buckets[0].count};
}
export function adminTaskSamples(today:string,userId:string):HubTask[]{
 const visible=[['Confirm 3 customer pickups','SO-10482','Jessica W.','Delivery',-1,'High','Open'],['Schedule 2 delivery bookings','SO-10475','Mark T.','Delivery',0,'High','Open'],['Process 4 new sales orders','—','Emily C.','Other',8,'Medium','In progress'],['Follow up – Quote #Q-1089','Q-1089','David L.','Follow-up',2,'Medium','In progress'],['Customer callback – ABC Flooring','—','Jessica W.','Enquiry',2,'Low','Open']];
 const extra=Array.from({length:21},(_,i)=>[i<7?['Confirm dispatch paperwork','Prepare delivery labels','Check pickup confirmation','Review customer booking','Confirm order details','Arrange delivery time','Review showroom orders'][i]:'Complete customer order check '+(i-6),'—',i===20?'Jessica W.':['Emily C.','Jessica W.','Mark T.','David L.'][i%4],i<7?'Other':'Delivery',i<4?-1:i<6?0:i===6?9:-2,i<4?'High':'Medium',i>=7?'Completed':i===6?'In progress':'Open']);
 return [...visible,...extra].map((r,i)=>({id:'admin-task-sample-'+i,source:'sample',name:String(r[0]),documentNumber:String(r[1]),account:'Sample trade account',accountId:'sample',owner:String(r[2])==='Jessica W.'?userId:'sample-staff-'+String(r[2]).replace(/[^a-z]/gi,'').toLowerCase(),ownerName:String(r[2]),type:String(r[3]),due:shiftAdminDate(today,Number(r[4])),priority:String(r[5]),status:String(r[6]),notes:'Sample · Read-only team task preview. No live task or notification is changed.',updatedAt:today+'T08:00:00Z',...(r[6]==='Completed'?{completedAt:today+'T09:00:00Z'}:{})}));
}
export function adminApprovalSamples(today:string):AdminApproval[]{
 const rows:[ApprovalKind,string,number|undefined,string,number,AdminApproval['source']][]=[['Payment Approval','Supplier Payment – Bostik (INV-66021)',12480,'Emily C.',-2,'payment'],['Credit Note','CN-10056 – ABC Flooring',-2600,'Jessica W.',-2,'credit'],['Special Discount','SO-10488 – Additional 5% Discount',undefined,'Mark T.',-2,'discount'],['Inventory Adj.','Stock Adjustment – SPC-2026-018',undefined,'David L.',-2,'adjustment'],['Credit Hold','Customer – Carlton Flooring Co.',undefined,'Jessica W.',0,'hold'],['Credit Note','CN-10057 – Harbour Flooring',-850,'David L.',-1,'credit'],['Payment Approval','Supplier Payment – Oak Trade',5600,'Emily C.',-1,'payment']];
 return rows.map(([kind,details,amount,requestedBy,offset,source],i)=>({id:'admin-approval-sample-'+i,sourceId:'sample-'+i,kind,details,amount,requestedBy,date:shiftAdminDate(today,offset),path:'',status:'Pending',source}));
}
export function adminApprovalRows(input:{customers:Customer[];credits:CreditNote[];adjustments:StockAdjustment[];drafts:ManagedDraft[];payments:PaymentBatch[];bills:SupplierBill[]}):AdminApproval[]{
 const {customers,credits,adjustments,drafts,payments,bills}=input;
 return [
 ...payments.filter(p=>p.status==='DRAFT').map(p=>({id:'payment:'+p.id,sourceId:p.id,kind:'Payment Approval' as const,details:'Supplier Payment – '+(p.reference||p.allocations.map(a=>bills.find(b=>b.id===a.supplierBillId)?.supplierName??'Supplier').join(', ')),amount:p.allocations.reduce((n,a)=>n+Math.round(a.amount*100),0)/100,requestedBy:p.createdBy,date:p.history[0]?.at.slice(0,10)??p.paymentDate,path:'/purchases/payables',status:'Pending' as const,source:'payment' as const})),
 ...credits.filter(c=>c.status==='DRAFT').map(c=>({id:'credit:'+c.id,sourceId:c.id,kind:'Credit Note' as const,details:c.creditNoteNumber+' – '+(customers.find(a=>a.id===c.customerId)?.businessName??'Customer'),amount:-c.totals.total,requestedBy:'—',date:c.creditDate,path:'/sales/credit-notes/'+encodeURIComponent(c.id),status:'Pending' as const,source:'credit' as const})),
 ...drafts.filter(d=>d.status==='DRAFT'&&d.payload.kind!=='EXPENSE'&&d.lines.some(l=>'discountPercent' in l&&Number(l.discountPercent)>0||'discountAmount' in l&&Number(l.discountAmount)>0)).map(d=>({id:'discount:'+d.id,sourceId:d.id,kind:'Special Discount' as const,details:(d.kind==='ORDER'?'Sales Order':'Invoice')+' – Discount review',requestedBy:d.history[0]?.actorId??'—',date:d.payload.documentDate,path:'/sales/drafts/'+(d.kind==='ORDER'?'orders':'invoices')+'/'+encodeURIComponent(d.id),status:'Pending' as const,source:'discount' as const,revision:d.revision})),
 ...adjustments.filter(a=>a.status==='DRAFT').map(a=>({id:'adjustment:'+a.id,sourceId:a.id,kind:'Inventory Adj.' as const,details:'Stock Adjustment – '+a.number,requestedBy:a.createdBy,date:a.date,path:'/inventory/adjustments',status:'Pending' as const,source:'adjustment' as const,revision:a.revision})),
 ...customers.filter(c=>c.creditHold&&c.status==='ACTIVE').map(c=>({id:'hold:'+c.id,sourceId:c.id,kind:'Credit Hold' as const,details:'Customer – '+c.businessName,requestedBy:'—',date:c.updatedAt.slice(0,10),path:'/contacts/customers/'+encodeURIComponent(c.id),status:'Pending' as const,source:'hold' as const})),
 ];
}
