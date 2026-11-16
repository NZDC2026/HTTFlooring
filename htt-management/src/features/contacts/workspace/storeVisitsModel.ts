import {daysAgo} from '../data/customerDashboard';
import type {WorkspaceCustomer} from './customerWorkspaceModel';
export type WorkspaceVisit={id:string;customerId:string;date:string;repId:string;repName:string;note:string;at?:string};
export const visitBuckets=['All','Due (30+ days)','0–14 days','15–29 days','30–59 days','60+ days','Not visited'] as const;
export type VisitBucket=typeof visitBuckets[number];
export const visitDays=(date:string,today:string)=>Math.round((Date.parse(today+'T00:00:00Z')-Date.parse(date+'T00:00:00Z'))/86400000);
export const visitDay=(date:string,days:number)=>daysAgo(date,-days);
export function storeVisitModel(customers:WorkspaceCustomer[],visits:WorkspaceVisit[],today:string){
 const stores=customers.filter(c=>c.kind==='Store'&&c.status!=='INACTIVE'&&c.created<=today),ids=new Set(stores.map(c=>c.id)),log=visits.filter(v=>ids.has(v.customerId)&&v.date<=today).sort((a,b)=>b.date.localeCompare(a.date)||(b.at??b.date).localeCompare(a.at??a.date));
 const rows=stores.map(c=>{const entries=log.filter(v=>v.customerId===c.id),last=entries[0],age=last?visitDays(last.date,today):null;return{...c,last,age,due:age===null||age>=30,next:last?visitDay(last.date,30):'',count90:entries.filter(v=>v.date>=daysAgo(today,89)).length,entries};}).sort((a,b)=>(b.age??Infinity)-(a.age??Infinity)||a.name.localeCompare(b.name));
 const monthVisits=log.filter(v=>v.date.slice(0,7)===today.slice(0,7)),intervals=rows.flatMap(r=>r.entries.slice(1).map((v,i)=>visitDays(v.date,r.entries[i].date)));
 return{rows,log,stores:rows.length,visited:rows.filter(r=>r.age!==null&&r.age<30).length,due:rows.filter(r=>r.due).length,month:monthVisits.length,average:intervals.length?Math.round(intervals.reduce((a,b)=>a+b,0)/intervals.length):null,monthVisits};
}
export type StoreVisitRow=ReturnType<typeof storeVisitModel>['rows'][number];
export function visitBucketMatch(row:StoreVisitRow,bucket:VisitBucket){const age=row.age;return bucket==='All'?true:bucket==='Due (30+ days)'?row.due:bucket==='Not visited'?age===null:age!==null&&(bucket==='0–14 days'?age<=14:bucket==='15–29 days'?age>=15&&age<=29:bucket==='30–59 days'?age>=30&&age<=59:age>=60);}
export function sampleStoreVisits(today='2026-11-16'):WorkspaceVisit[]{
 const rows:[number,number,string,string][]=[
 [5,4,'Jason Wu','Special prices expire 3 Dec — they want to renew at the same rate.'],[0,7,'Jason Wu','Showed Bonita Herringbone boards. Wants 2 sample sets delivered this week.'],[6,19,'Mia Chen','Planning a container order for January. Credit limit review requested.'],[5,25,'Jason Wu','New showroom wall finished; asked for 6 display boards.'],[0,27,'Jason Wu','Asked about January price increase. Floor displays look tidy.'],[2,39,'Mia Chen','Quote QT-2048 for Hybrid discussed. Owner on leave until late Oct.'],[6,45,'Mia Chen','Discussed stock availability and container quantities.'],[0,50,'Jason Wu','Reviewed new oak ranges and showroom display options.'],[2,52,'Mia Chen','Reviewed Hybrid flooring samples and upcoming projects.'],[5,60,'Jason Wu','Confirmed trade account contact details and delivery access.']];
 return rows.map(([c,days,rep,note],i)=>({id:'cw-visit-'+i,customerId:'cw-sample-'+c,date:daysAgo(today,days),repId:rep==='Jason Wu'?'sample-jason':'sample-mia',repName:rep,note}));
}
export function customerTaskType(type:string){if(/payment/i.test(type))return'Payment Follow-up';if(/visit/i.test(type))return'Store Visit';if(/sample/i.test(type))return'Sample Delivery';if(/quote|quotation/i.test(type))return'Quote Follow-up';if(/special.*price|price.*special/i.test(type))return'Special Price';return'Customer Follow-up';}
