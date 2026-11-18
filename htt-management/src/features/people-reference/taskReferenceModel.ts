import type {HubTask} from '../task-hub/taskHubModel';
export type ReferenceTask=HubTask&{category:'Customers'|'Suppliers'|'Internal';kind:string;automatic?:boolean;comments?:number};
export const taskKinds={Customers:['Customer Follow-up','Quote Follow-up','Payment Follow-up','Store Visit','Sample Delivery','Product Enquiry','Customer Complaint','Special Price'],Suppliers:['Order Follow-up','Chase Documents','Supplier Payment','Price List / Quote','Claim / Quality'],Internal:['Internal task','Staff document','Receiving']};
export const nativeTaskType=(kind:string)=>kind==='Store Visit'?'Site Visit':kind==='Sample Delivery'?'Sample':kind.includes('Payment')?'Payment':kind==='Product Enquiry'?'Enquiry':kind==='Customer Complaint'?'Complaint':kind==='Internal task'||kind==='Staff document'||kind==='Receiving'?'Other':'Follow-up';
const task=(id:string,name:string,account:string,category:ReferenceTask['category'],kind:string,due:string,owner='Team',extra:Partial<ReferenceTask>={}):ReferenceTask=>({id,source:'sample',name,account,category,kind,due,owner,ownerName:owner==='me'?'Admin':owner,accountId:'sample-'+id,priority:'Medium',status:'Open',type:nativeTaskType(kind),notes:'Synthetic task preview. No live record or notification is changed.',updatedAt:'2026-11-16T09:00:00.000Z',...extra});
export const referenceTaskSamples:ReferenceTask[]=[
 task('mine-factory','Chase factory — PO-2026-0038 missed ETD 10 Nov','Guangdong Huayu Flooring Co., Ltd','Suppliers','Order Follow-up','2026-11-14','me',{priority:'High'}),
 task('mine-expired','Expired: Forklift licence · Ben Nguyen','Internal · Expired 10 Nov','Internal','Staff document','2026-11-16','me',{priority:'High'}),
 task('mine-credit','Review credit limit','Westgate Flooring Depot · Limit $120,000.00','Customers','Customer Follow-up','2026-11-20','me'),
 task('mine-prices','Update price list for 2027','Internal','Internal','Internal task','2026-11-28','me'),
 task('mine-kevin','Renew Forklift licence · Kevin','Internal · Expires 5 Dec','Internal','Staff document','2026-12-05','me',{priority:'High'}),
 task('mine-tom','Renew First aid · Tom','Internal · Expires 20 Dec','Internal','Staff document','2026-12-20','me'),
 task('mine-jason','Renew Visa / work rights · Jason Wu','Internal · Expires 10 Jan','Internal','Staff document','2027-01-10','me'),
 task('bill3377','Pay BILL-3377 · CN¥31,369.93','Guangdong Huayu Flooring Co., Ltd · BILL-3377','Suppliers','Supplier Payment','2026-10-31','Account',{priority:'High',automatic:true}),
 task('bill-pair','Pay 2 bills · US$23,810.00','Anhui Yangzi Flooring Co., Ltd · BILL-3416, BILL-3402','Suppliers','Supplier Payment','2026-11-11','Account',{priority:'High',automatic:true}),
 task('quote-town','Follow up townhouse quote','Oak Living Pty Ltd · QT-2051','Customers','Quote Follow-up','2026-11-12','Front desk',{priority:'High',comments:1}),
 task('bill3385','Pay BILL-3385 · US$2,860.00','Binh Duong Timber Co., Ltd · BILL-3385','Suppliers','Supplier Payment','2026-11-13','Account',{priority:'High',automatic:true}),
 task('quote-hybrid','Follow up Hybrid flooring quote','Floor Plus · QT-2048','Customers','Quote Follow-up','2026-11-13','Mia Chen',{priority:'High'}),
 task('bill-customs','Pay 2 bills · $10,411.20','Bayside Customs Brokers · BILL-3406, BILL-3414','Suppliers','Supplier Payment','2026-11-14','Account',{priority:'High',automatic:true}),
 task('receive','Finish receiving MSKU4421907','Internal · SHP-2026-0033 · Jiangsu · 400 units','Internal','Receiving','2026-11-14','Warehouse',{priority:'High',automatic:true}),
 task('measure','Confirm site measure date','Oak Living Pty Ltd · QT-2051','Customers','Customer Follow-up','2026-11-14','Front desk'),
 task('today-call','Confirm delivery details','ABC Flooring Pty Ltd','Customers','Customer Follow-up','2026-11-16','Jason Wu'),
 task('today-quote','Follow up laminate quote','Melbourne Interiors · QT-2055','Customers','Quote Follow-up','2026-11-16','Front desk'),
 task('today-sample','Deliver Natural Oak samples','Bayside Floors','Customers','Sample Delivery','2026-11-16','Mia Chen'),
 task('today-visit','Visit Eastern Timber Co','Eastern Timber Co · Bayswater','Customers','Store Visit','2026-11-16','Jason Wu'),
 task('today-bill','Pay freight invoice','Border Express · BILL-3420','Suppliers','Supplier Payment','2026-11-16','Account',{automatic:true}),
 ...(['Customer Follow-up','Customer Follow-up','Quote Follow-up','Payment Follow-up','Payment Follow-up','Sample Delivery','Sample Delivery','Product Enquiry','Customer Complaint'] as const).map((kind,i)=>task('week-'+i,['Confirm container requirements','Call Westgate about stock','Follow up Oak quote','Review overdue invoice','Confirm payment received','Prepare Harbour sample pack','Deliver new display samples','Confirm laminate specifications','Resolve damaged box complaint'][i],['Coastal Timber Floors','Westgate Flooring Depot','Oak Living Pty Ltd','ABC Flooring Pty Ltd','Floor Plus','Harbour Flooring','Bayside Floors','Riverside Builders','Urban Floors'][i],'Customers',kind,'2026-11-'+String(17+i%7).padStart(2,'0'),i%2?'Mia Chen':'Front desk',{automatic:i===3})),
 task('week-supplier','Confirm supplier payment due','Anhui Yangzi Flooring Co., Ltd','Suppliers','Supplier Payment','2026-11-19','Account',{automatic:true}),
 task('week-internal','Check receiving bay readiness','Internal','Internal','Internal task','2026-11-18','Warehouse'),
 task('later-price','Review special price request','Coastal Timber Floors','Customers','Special Price','2026-11-28','Front desk'),
 task('later-doc','Collect packing list and invoice','Jiangsu Flooring Co., Ltd','Suppliers','Chase Documents','2026-11-28','Account'),
 task('later-internal','Review warehouse safety checklist','Internal','Internal','Internal task','2026-12-01','Warehouse'),
 task('done-customer','Sample delivery completed','Bayside Floors','Customers','Sample Delivery','2026-11-13','Mia Chen',{status:'Completed',completedAt:'2026-11-13T08:00:00.000Z'}),
 task('done-internal','Receiving bay cleared','Internal','Internal','Internal task','2026-11-13','Warehouse',{status:'Completed',completedAt:'2026-11-13T09:00:00.000Z'})
];
export const isOpenTask=(t:HubTask)=>!['Completed','Inactive','Cancelled'].includes(t.status);
export function referenceTaskCounts(tasks:ReferenceTask[],today:string){const open=tasks.filter(isOpenTask),end=new Date(today+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+7);return {open:open.length,today:open.filter(t=>t.due===today).length,overdue:open.filter(t=>t.due&&t.due<today).length,week:open.filter(t=>t.due>=today&&t.due<=end.toISOString().slice(0,10)).length,completed:tasks.filter(t=>t.status==='Completed').length};}
export function asReferenceTask(t:HubTask):ReferenceTask{const category=t.source==='supplier'?'Suppliers':'Customers';return {...t,category,kind:t.source==='supplier'?'Order Follow-up':({'Follow-up':'Customer Follow-up','Site Visit':'Store Visit',Sample:'Sample Delivery',Payment:'Payment Follow-up',Enquiry:'Product Enquiry',Complaint:'Customer Complaint'}[t.type]??'Customer Follow-up'),automatic:!!(t.row?.sourceQuoteId||t.row?.sourceSalesDraftId)};}
