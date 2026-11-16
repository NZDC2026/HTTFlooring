import {sampleStoreVisits} from './storeVisitsModel';
import {customerPriceGroup} from '../data/customerPriceGroups';
import {daysAgo,priorYear} from '../data/customerDashboard';
import type {Customer} from '../types/customer';
import type {SalesDocument} from '../../sales/types/salesDocument';
import type {CreditNote} from '../../sales/types/creditNote';
export type CustomerKind='All'|'Store'|'Installer'|'C Customer';
export type Health='Active'|'At risk'|'Lapsed'|'Never purchased';
export type WorkspaceCustomer={id:string;name:string;code:string;kind:Exclude<CustomerKind,'All'>;created:string;status:Customer['status'];creditHold:boolean;contact:string;mobile:string;rep:string;repId?:string;suburb?:string;balance:number;overdue:number;overdueDays?:number;creditLimit:number;lastVisit:string;original?:Customer};
export type CustomerFact={id:string;customerId:string;date:string;amount:number;kind:'invoice'|'credit'|'order'};
export type WorkspaceTask={id:string;customerId:string;name:string;type:string;related:string;owner:string;ownerName:string;due:string;priority:string;status:string;auto?:boolean;action?:'visit'|'reminder';originalRevision?:string;derived?:boolean};
export const roundMoney=(n:number)=>Math.round(n*100)/100;
export function customerKind(c:Customer):WorkspaceCustomer['kind']{const group=customerPriceGroup(c.businessType);return group==='A'?'Store':group==='B'?'Installer':'C Customer';}
export function customerFacts(documents:readonly SalesDocument[],credits:readonly CreditNote[]):CustomerFact[]{return [...documents.filter(d=>['INVOICE','SALES_ORDER'].includes(d.type)&&!['DRAFT','VOID','CANCELLED'].includes(d.status)&&!d.openingBalanceImportId).map(d=>({id:d.id,customerId:d.customerId,date:d.documentDate,amount:d.totals.subtotal,kind:d.type==='INVOICE'?'invoice' as const:'order' as const})),...credits.filter(c=>!['DRAFT','VOID'].includes(c.status)&&!c.openingBalanceImportId).map(c=>({id:c.id,customerId:c.customerId,date:c.creditDate,amount:c.totals.subtotal,kind:'credit' as const}))];}
export function lastPurchase(id:string,facts:CustomerFact[],today:string){return facts.filter(f=>f.customerId===id&&f.kind==='invoice'&&f.date<=today).reduce((date,f)=>f.date>date?f.date:date,'');}
export function customerHealth(id:string,facts:CustomerFact[],today:string):Health{const last=lastPurchase(id,facts,today);return !last?'Never purchased':last>=daysAgo(today,60)?'Active':last>=daysAgo(today,90)?'At risk':'Lapsed';}
export function visitAge(c:WorkspaceCustomer,today:string){return c.lastVisit?Math.max(0,Math.round((Date.parse(today)-Date.parse(c.lastVisit))/86400000)):null;}
export function overviewModel(customers:WorkspaceCustomer[],facts:CustomerFact[],from:string,to:string,today:string,kind:CustomerKind){
 const rows=customers.filter(c=>(kind==='All'||c.kind===kind)&&c.created<=today),ids=new Set(rows.map(c=>c.id));
 const inRange=(a:string,b:string)=>facts.filter(f=>ids.has(f.customerId)&&f.date>=a&&f.date<=b);
 const current=inRange(from,to),previous=inRange(priorYear(from),priorYear(to));
 const sales=(fs:CustomerFact[])=>roundMoney(fs.filter(f=>f.kind!=='order').reduce((n,f)=>n+(f.kind==='credit'?-f.amount:f.amount),0));
 const invoices=current.filter(f=>f.kind==='invoice'),priorInvoices=previous.filter(f=>f.kind==='invoice');
 const top=rows.map(c=>({...c,sales:sales(current.filter(f=>f.customerId===c.id)),previousSales:sales(previous.filter(f=>f.customerId===c.id)),invoices:invoices.filter(f=>f.customerId===c.id).length})).filter(c=>c.sales>0).sort((a,b)=>b.sales-a.sales);
 const healthRows=rows.filter(c=>c.kind!=='C Customer'),health=Object.fromEntries((['Active','At risk','Lapsed','Never purchased'] as const).map(h=>[h,healthRows.filter(c=>customerHealth(c.id,facts,today)===h).length])) as Record<Health,number>;
 const stores=rows.filter(c=>c.kind==='Store'),visits=[stores.filter(c=>{const n=visitAge(c,today);return n!==null&&n<=14;}).length,stores.filter(c=>{const n=visitAge(c,today);return n!==null&&n>=15&&n<=29;}).length,stores.filter(c=>{const n=visitAge(c,today);return n!==null&&n>=30&&n<=59;}).length,stores.filter(c=>{const n=visitAge(c,today);return n!==null&&n>=60;}).length,stores.filter(c=>!c.lastVisit).length];
 const months:{key:string;month:string;sales:number;previous:number;invoices:number;previousInvoices:number}[]=[];
 let month=from.slice(0,7)+'-01';while(month<=to){const next=new Date(Date.parse(month)+32*86400000).toISOString().slice(0,7)+'-01',a=month<from?from:month,b=daysAgo(next,1)<to?daysAgo(next,1):to,now=inRange(a,b),prior=inRange(priorYear(a),priorYear(b));months.push({key:month,month:new Date(month).toLocaleDateString('en-GB',{month:'short',timeZone:'UTC'}),sales:sales(now),previous:sales(prior),invoices:now.filter(f=>f.kind==='invoice').length,previousInvoices:prior.filter(f=>f.kind==='invoice').length});month=next;}
 return {rows,sales:sales(current),previousSales:sales(previous),invoices:invoices.length,previousInvoices:priorInvoices.length,buyers:new Set(invoices.map(f=>f.customerId)).size,newCustomers:rows.filter(c=>c.created>=from&&c.created<=to).length,health,healthTotal:healthRows.length,visits,stores:stores.length,top,months};
}
export function customerOrders(id:string,facts:CustomerFact[],from:string,to:string){const rows=facts.filter(f=>f.customerId===id&&f.kind==='order'&&f.date>=from&&f.date<=to);return {amount:roundMoney(rows.reduce((n,f)=>n+f.amount,0)),count:rows.length,last:rows.reduce((d,f)=>f.date>d?f.date:d,'')};}
export function priorChange(now:number,prior:number){return prior===0?null:(now-prior)/Math.abs(prior)*100;}
export function customerSample(today='2026-11-16'){
 const names=['ABC Flooring Pty Ltd','Oak Living Pty Ltd','Floor Plus','Urban Floors','Melbourne Interiors','Coastal Timber Floors','Westgate Flooring Depot','Sarah Nguyen'];
 const contacts=['John Smith','Emma Brown','Daniel Wilson','Olivia Martin','James Taylor','Ben Harris','Tom Nguyen','Sarah Nguyen'],phones=['0412 345 678','0411 882 920','0433 120 450','0414 909 828','','0422 610 384','0436 771 902','0408 213 557'];
 const customers:WorkspaceCustomer[]=names.map((name,i)=>({id:`cw-sample-${i}`,name,code:`CUST-${String(i+1).padStart(4,'0')}`,kind:[0,2,5,6].includes(i)?'Store':i===7?'C Customer':'Installer',created:i===7?'2026-10-03':i===1||i===4?'2026-08-01':'2024-01-01',status:i===3?'ON_HOLD':'ACTIVE',creditHold:i===3,contact:contacts[i],mobile:phones[i],rep:[0,5].includes(i)?'Jason Wu':[2,6].includes(i)?'Mia Chen':'Front desk',repId:[0,5].includes(i)?'sample-jason':[2,6].includes(i)?'sample-mia':'sample-front',suburb:({0:'Collingwood',2:'Geelong',5:'Torquay',6:'Sunshine'} as Record<number,string>)[i]??'',balance:({0:2843.75,2:8420,5:12480,6:38650} as Record<number,number>)[i]??0,overdue:i===0?2843.75:0,overdueDays:i===0?15:undefined,creditLimit:[50000,75000,30000,0,40000,60000,120000,0][i],lastVisit:({0:daysAgo(today,7),2:daysAgo(today,39),5:daysAgo(today,4),6:daysAgo(today,19)} as Record<number,string>)[i]??''}));
 const facts:CustomerFact[]=[];const add=(customer:number,date:string,amount:number,kind:CustomerFact['kind'],count=1)=>{let used=0;for(let i=0;i<count;i++){const value=i===count-1?roundMoney(amount-used):roundMoney(amount/count);used=roundMoney(used+value);facts.push({id:`cw-fact-${facts.length}`,customerId:customers[customer].id,date,amount:value,kind});}};
 const monthSales=[18917.55,17601.35,21067.53,15104.74,5738.45],totals=[41575.91,17321.88,10959.98,8571.85],customerIndices=[6,5,2,0],counts=[[3,3,3,2,2],[3,3,3,2,2],[2,2,1,2,2],[1,1,1,1,0]],spent=[0,0,0,0];
 for(let m=0;m<5;m++){let used=0;const abc=m===3?roundMoney(totals[3]-spent[3]):m<3?roundMoney(totals[3]*monthSales[m]/72691.17):0;
  for(let c=0;c<4;c++){let amount=m===4?roundMoney(totals[c]-spent[c]):c===3?roundMoney(monthSales[m]-used):c===2?roundMoney(monthSales[m]-abc-used):roundMoney((monthSales[m]-abc)*totals[c]/69857.77);if(m<4&&c<3)used=roundMoney(used+amount);spent[c]=roundMoney(spent[c]+amount);if(counts[c][m])add(customerIndices[c],`2026-${String(7+m).padStart(2,'0')}-${m===4?['13','10','06','02'][c]:m===3&&c===3?'02':'15'}`,amount,'invoice',counts[c][m]);}
 }
 add(7,'2026-10-21',3200,'invoice');
 const lastYear=[18550,13750,16600,17804.38,10380],priorTotals=[43083.85,16907.84,7126.12,9966.57],priorSpent=[0,0,0,0];for(let m=0;m<5;m++){let used=0;for(let c=0;c<4;c++){const amount=m===4?roundMoney(priorTotals[c]-priorSpent[c]):c===3?roundMoney(lastYear[m]-used):roundMoney(lastYear[m]*priorTotals[c]/77084.38);used=roundMoney(used+amount);priorSpent[c]=roundMoney(priorSpent[c]+amount);add(customerIndices[c],`2025-${String(7+m).padStart(2,'0')}-15`,amount,'invoice',m===3?[3,3,3,1][c]:[2,2,2,1][c]);}}
 add(3,'2025-08-15',1410.8,'invoice');add(3,'2025-09-15',2070,'invoice');add(3,'2025-10-15',1984,'invoice');add(3,'2026-03-18',500,'invoice');
 for(const [c,total,count,date]of [[0,28085,12,'2026-10-02'],[5,40070,28,'2026-11-10'],[2,42060,20,'2026-11-06'],[6,119090,29,'2026-11-13'],[7,3250,1,'2026-10-21']] as const)add(c,date,total,'order',count);
 const taskRows:[string,number,string,number,string,string,string,string,WorkspaceTask['action']?,boolean?][]=[
 ['Review credit limit',6,'Customer Follow-up',-4,'Medium','sample-user','Admin','Limit $120,000.00'],
 ['Follow up townhouse quote',1,'Quote Follow-up',4,'High','sample-front','Front desk','QT-2051'],
 ['Follow up Hybrid flooring quote',2,'Quote Follow-up',3,'High','sample-mia','Mia Chen','QT-2048'],
 ['Confirm site measure date',1,'Customer Follow-up',2,'Medium','sample-front','Front desk','QT-2051'],
 ['Chase overdue balance',0,'Payment Follow-up',0,'High','sample-account','Account','Invoice · 15d late','reminder',true],
 ['Visit the store',2,'Store Visit',0,'Medium','sample-mia','Mia Chen','Last visit 39d ago','visit',true],
 ['Collect payment before pickup',3,'Payment Follow-up',-1,'High','sample-account','Account','SO-10441'],
 ['Arrange showroom sample delivery',0,'Sample Delivery',-2,'Medium','sample-jason','Jason Wu','Bonita sample boards'],
 ['Confirm new account details',4,'Customer Follow-up',-3,'Medium','sample-front','Front desk','New account'],
 ['Confirm sample collection',7,'Sample Delivery',-4,'Medium','sample-front','Front desk','Sample set'],
 ['Review expiring special price',5,'Special Price',-5,'Medium','sample-jason','Jason Wu','Special price expires 3 Dec'],
 ['Check next order requirements',5,'Customer Follow-up',-6,'Medium','sample-jason','Jason Wu','Customer'],
 ['Review trade account documents',1,'Customer Follow-up',-7,'Medium','sample-admin','Admin','Credit application'],
 ['Follow up oak flooring quote',6,'Quote Follow-up',-8,'Medium','sample-mia','Mia Chen','QT-2039'],
 ['Delivered oak sample boards',0,'Sample Delivery',1,'Medium','sample-jason','Jason Wu','Sample delivery'],
 ['Confirmed delivery access',6,'Customer Follow-up',1,'Medium','sample-mia','Mia Chen','Customer']];
 const tasks:WorkspaceTask[]=taskRows.map(([name,c,type,due,priority,owner,ownerName,related,action,auto],i)=>({id:'cw-task-'+i,customerId:customers[c].id,name,type,related,owner,ownerName,due:daysAgo(today,due),priority,status:i>=14?'Completed':'Open',action,auto}));
 return {customers,facts,tasks,visits:sampleStoreVisits(today)};
}
