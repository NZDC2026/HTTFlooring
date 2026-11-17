import type {Customer} from '../../contacts/types/customer';
import type {SalesDocument} from '../../sales/types/salesDocument';
import type {CustomerPrice} from '../../contacts/types/customerPricing';
import {customerPriceGroup} from '../../contacts/data/customerPriceGroups';
export function assignedStoreCustomers(customers:Customer[],userId:string){return customers.filter(c=>!!userId&&c.setup?.salesRep===userId&&customerPriceGroup(c.businessType)==='A'&&c.status!=='INACTIVE');}
export function activeOperationalOrders(documents:SalesDocument[]){return documents.filter(d=>d.type==='SALES_ORDER'&&['CONFIRMED','PARTIALLY_FULFILLED','INVOICED'].includes(d.status)&&(d.fulfilmentStatus??d.status)!=='FULFILLED');}
export function expiringStorePrices(prices:CustomerPrice[],customerIds:Set<string>,today:string){const end=new Date(Date.parse(today+'T12:00:00Z')+30*86400000).toISOString().slice(0,10);return prices.filter(p=>customerIds.has(p.customerId)&&p.active&&p.effectiveFrom<=today&&p.effectiveTo&&p.effectiveTo>=today&&p.effectiveTo<=end);}
export const sampleStoreRows=[
 {id:'cw-sample-2',name:'Floor Plus',suburb:'Richmond',age:39,last:'8 Oct',sales:0,orders:0,note:'Overdue task'},
 {id:'cw-sample-5',name:'Coastal Timber Floors',suburb:'Geelong',age:33,last:'14 Oct',sales:9615.4,orders:2,note:'Special price ends 3 Dec'},
 {id:'cw-sample-6',name:'Westgate Flooring Depot',suburb:'Altona North',age:18,last:'29 Oct',sales:14960.75,orders:4,note:'—'},
 {id:'cw-sample-0',name:'ABC Flooring Pty Ltd',suburb:'Dandenong',age:7,last:'9 Nov',sales:23634.4,orders:6,note:'$12,480.30 overdue'},
];
export function sampleSalesPeriodFactor(from:string,to:string){const a=Math.max(Date.parse(from),Date.parse('2026-11-01')),b=Math.min(Date.parse(to),Date.parse('2026-11-16'));return Math.max(0,Math.floor((b-a)/86400000)+1)/16;}
export const receptionSampleTodos=[
 {id:'exception',title:'Resolve Exception',detail:'Short pick · SO-10422',kind:'exception',due:'Overdue',path:'/sales?special=awaiting'},
 {id:'held',title:'Confirm Pickup',detail:'Richmond Timber Floors · SO-10441 · 1:00 pm',kind:'hold',due:'Payment required',path:'/sales?special=pickup'},
 {id:'pickup1',title:'Confirm Pickup',detail:'ABC Flooring · SO-10432 · 10:30 am',kind:'pickup',due:'Today',path:'/sales?special=pickup'},
 {id:'pickup2',title:'Confirm Pickup',detail:'Carlton Flooring Co. · SO-10436 · 3:00 pm',kind:'pickup',due:'Today',path:'/sales?special=pickup'},
 {id:'deliveries',title:'Book 2 Deliveries',detail:'SO-10438 · SO-10445',kind:'delivery',due:'Today',path:'/sales?special=delivery'},
 {id:'orders',title:'Process 4 New Sales Orders',detail:'phone and email',kind:'order',due:'Today',path:'/sales?tab=SALES_ORDER'},
 {id:'quote',title:'Quotation Follow-up',detail:'Carlton Flooring Co. · QT-00321',kind:'order',due:'Today',path:'/sales?tab=QUOTE'},
 {id:'visits',title:'Showroom Visits (2)',detail:'Tomorrow 10:00 am · 2:30 pm',kind:'visit',due:'Upcoming',path:'/contacts?tab=visits'},
];
