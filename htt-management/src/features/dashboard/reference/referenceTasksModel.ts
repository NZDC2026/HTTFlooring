import {customerSample} from '../../contacts/workspace/customerWorkspaceModel';
import type {ReferenceTask} from './ReferenceTaskTable';
import type {HubTask} from '../../task-hub/taskHubModel';
export function referenceTaskSamples(today:string){
 const base=customerSample(today),tasks:ReferenceTask[]=base.tasks.map(t=>({...t,accountName:base.customers.find(c=>c.id===t.customerId)?.name,source:'customer',canEdit:true}));
 const warehouse=tasks.find(t=>t.owner==='sample-admin')!;Object.assign(warehouse,{name:'Prepare showroom sample delivery',type:'Sample Delivery',owner:'sample-warehouse',ownerName:'Warehouse',related:'Bonita sample boards'});
 const due=(offset:number)=>new Date(Date.parse(today+'T12:00:00Z')+offset*86400000).toISOString().slice(0,10);
 for(const [i,name,type,owner,ownerName,offset,accountName] of [
 [0,'Chase factory — PO-2026-0038 missed ETD 10 Nov','Order Follow-up','sample-user','Admin',-2,'Guangdong Huayu Flooring Co., Ltd'],
 [1,'Request packing list and FSC certificate','Chase Documents','sample-front','Front desk',1,'Jiangsu Lingge Wood Co., Ltd'],
 [2,'Schedule supplier balance payment','Supplier Payment','sample-account','Account',2,'Anhui Yangzi Flooring Co., Ltd'],
 ] as const)tasks.push({id:'rd-supplier-'+i,customerId:'',name,type,related:'',owner,ownerName,due:due(offset),priority:'High',status:'Open',accountName,source:'supplier',canEdit:true});
 return {customers:base.customers,tasks};
}
export function dashboardTaskType(t:HubTask){
 if(t.source==='supplier')return /pay/i.test(t.name)?'Supplier Payment':/document|packing|certificate/i.test(t.name)?'Chase Documents':/price|quote/i.test(t.name)?'Price List / Quote':/claim|quality/i.test(t.name)?'Claim / Quality':'Order Follow-up';
 return /quote/i.test(t.name)?'Quote Follow-up':t.type;
}
export type DashboardRole='Admin'|'Account'|'Front desk'|'Sales'|'Warehouse';
export const sampleRoleUser=(role:DashboardRole)=>role==='Account'?'sample-account':role==='Sales'?'sample-jason':role==='Front desk'?'sample-front':role==='Warehouse'?'sample-warehouse':'sample-user';
export function roleTaskSamples(today:string,role:DashboardRole){
 const base=referenceTaskSamples(today);
 if(role==='Account'){
  const payment=base.tasks.find(t=>t.type==='Supplier Payment')!;Object.assign(payment,{name:'Pay balance for PO-2026-0041 before B/L release',accountName:'Jiangsu Lingge Wood Co., Ltd',due:today.slice(0,8)+'20',priority:'Medium'});
  base.tasks.push({...base.tasks[0],id:'sample-account-completed',name:'Reconciled customer payment',type:'Payment Follow-up',owner:'sample-account',ownerName:'Account',status:'Completed'});
 }
 if(role==='Warehouse'){const t=base.tasks.find(t=>t.owner==='sample-warehouse')!;base.tasks=[{...t,name:'Pack Laminate sample boards',accountName:'Coastal Timber Floors',due:today,priority:'Medium',related:'Sample request',source:'customer'}];}
 if(role==='Sales')base.tasks=[{...base.tasks[0],id:'sample-sales-delivery',name:'Deliver Bonita Herringbone samples',customerId:'cw-sample-0',accountName:'ABC Flooring Pty Ltd',owner:'sample-jason',ownerName:'Jason Wu',type:'Sample Delivery',due:today.slice(0,8)+'18',priority:'Medium',status:'In progress',related:'Sample request'},{...base.tasks[0],id:'sample-sales-price',name:'Renew or end special price',customerId:'cw-sample-5',accountName:'Coastal Timber Floors',owner:'sample-jason',ownerName:'Jason Wu',type:'Special Price',due:today.slice(0,8)+'26',priority:'Medium',status:'Open',related:'Expires 3 Dec',auto:true,actionLabel:'View prices'}];
 return base;
}
