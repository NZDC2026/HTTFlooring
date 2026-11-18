import type {SupplierBill} from '../types/supplierBill';
import {expect,it} from 'vitest';
import {samplePurchaseWorkspace,purchaseOverview,orderMatches,shipmentMatches,billMatches,buildPurchaseWorkspace,nativeMoney} from './purchaseWorkspaceModel';
import {purchaseRegisterSamples} from '../data/purchaseRegister';
import {mockSuppliers} from '../../contacts/data/mockSuppliers';
import type {Shipment} from '../../incoming-shipments/shipmentModel';
import type {PurchaseBillRow} from '../data/purchaseOverview';
const today='2026-11-16';
it('reconciles the populated reference totals, aging, order states and bill filters',()=>{
 const data=samplePurchaseWorkspace(),overview=purchaseOverview(data,today);
 expect(overview).toMatchObject({ordered:104430.64,orderedCount:4,transit:232364.82,transitCount:7,open:214312.71,openCount:21,overdue:38510.77,overdueCount:4});
 expect(overview.ageing.map(a=>a.amount)).toEqual([175801.94,38510.77,0,0,0]);
 expect(['Open','Ordered','On the way','To receive','Received','Cancelled','All'].map(s=>data.orders.filter(r=>orderMatches(r,s)).length)).toEqual([12,4,7,1,1,0,13]);
 expect(['Open','Overdue','Due in 7 days','Part paid','Paid','All'].map(s=>data.bills.filter(r=>billMatches(r,s,today)).length)).toEqual([21,4,11,0,6,27]);
});
it('keeps received shipments pending cost finalisation and exposes completed payment samples',()=>{
 const data=samplePurchaseWorkspace();
 expect(['Active','In transit','To receive','To cost','Costed','All'].map(s=>data.shipments.filter(r=>shipmentMatches(r,s)).length)).toEqual([5,3,1,1,0,5]);
 expect(data.shipments.filter(r=>shipmentMatches(r,'In transit')).reduce((n,r)=>n+r.containers.length,0)).toBe(5);
 expect(data.bills.filter(r=>billMatches(r,'Paid',today)).every(r=>r.balance===0&&r.paid>0)).toBe(true);
 expect(nativeMoney(96760,'CNY')).toBe('CN¥96,760.00');
});
it('groups physical containers, values linked goods once and uses saved FX for live display',()=>{
 const order={...purchaseRegisterSamples(today)[0],supplierId:mockSuppliers[0].id,fx:{currency:'USD' as const,baseCurrency:'AUD' as const,rate:1.5,rateDate:today,source:'Manual' as const}};
 const first:Shipment={id:'pw-live-c1',number:'SHP-LIVE',purchaseNumber:'SHP-GROUP',supplierId:order.supplierId,revision:1,type:'Overseas',container:'LIVE-001',containerSize:'40HQ',origin:'Shanghai',destination:'Melbourne',siteId:'site',etd:'2026-11-01',eta:'2026-11-20',status:'In Transit',lines:[{purchaseOrderId:order.id,lineId:order.lines[0].id,quantity:20,received:5,sku:'SKU',description:'Flooring',unit:'Box'}],history:[],updatedAt:today+'T00:00:00Z'};
 const second={...first,id:'pw-live-c2',container:'LIVE-002',lines:first.lines.map(l=>({...l,quantity:30,received:0}))};
 const suppliers=[{...mockSuppliers[0],shipments:[first,second]}],before=structuredClone({order,suppliers});
 const data=buildPurchaseWorkspace([order],suppliers,[],today,'AUD');
 expect(data.shipments).toHaveLength(1);expect(data.shipments[0].containers).toHaveLength(2);expect(data.shipments[0]).toMatchObject({received:5,quantity:50,status:'Part received',costed:false});
 expect(data.shipments[0].amount).toBeCloseTo(order.lines[0].lineSubtotal*50/order.lines[0].orderedQuantity,2);
 expect(data.shipments[0].native).toBeCloseTo(data.shipments[0].amount/1.5,2);
 expect(data.orders[0].native).toBeCloseTo(order.totals.total/1.5,2);expect({order,suppliers}).toEqual(before);
});
it('excludes void bills from live registers and does not invent rates or paid balances',()=>{
 const row:PurchaseBillRow={id:'bill',number:'BILL-LIVE',supplierId:'supplier',supplier:'Live supplier',po:'PO-LIVE',reference:'REF',container:'',date:today,dueDate:today,total:150,subtotal:150,paid:0,credited:0,due:150,status:'Unpaid'};
 const data=buildPurchaseWorkspace([],[],[row],today,'AUD');expect(data.bills[0]).toMatchObject({amount:150,native:150,balance:150,nativeBalance:150,currency:'AUD'});
 expect(purchaseOverview(data,today).ageing[0]).toEqual({amount:150,count:1});
 expect(buildPurchaseWorkspace([],[],[{...row,bill:{status:'VOID'} as SupplierBill}],today,'AUD').bills).toEqual([]);
 expect(buildPurchaseWorkspace([],[],[{...row,bill:{status:'VOID'} as SupplierBill}],today,'AUD').bills).toEqual([]);
});
