import {describe,it,expect} from 'vitest';
import {calculateRebate,rebatePeriod} from './rebateCalculation';
import {mockProducts} from '../inventory/data/mockProducts';
import type {SalesDocument} from '../sales/types/salesDocument';
import type {CreditNote} from '../sales/types/creditNote';
const rule={customerId:'cus',productId:'prod_001',starts:'2026-01-01',ends:'2026-12-31',cycle:'Monthly',rate:'1',minArea:'10',minSales:'100'};
const line={id:'l',productId:'prod_001',unitId:'unit_001_box',unitSymbol:'box',quantity:10,lineSubtotal:259.92};
const invoice={id:'i',customerId:'cus',type:'INVOICE',status:'ISSUED',documentDate:'2026-11-05',documentNumber:'INV-1',lines:[line]} as SalesDocument;
describe('customer rebates',()=>{
 it('uses calendar month and quarter boundaries',()=>{expect(rebatePeriod('2026-11-10','Quarterly')).toEqual({from:'2026-10-01',to:'2026-12-31'});expect(rebatePeriod('2024-02-10','Monthly').to).toBe('2024-02-29');});
 it('converts boxes, preserves invoice price and pays full eligible area after qualification',()=>{const v=calculateRebate(rule,'2026-11-10',[invoice],[],mockProducts);expect(v.totalArea).toBeCloseTo(21.66);expect(v.sales).toBe(259.92);expect(v.rebate).toBe(21.66);expect(invoice.lines[0].lineSubtotal).toBe(259.92);});
 it('requires both thresholds and excludes drafts, quotes, voids and other customers',()=>{const docs=[invoice,...['DRAFT','VOID'].map(status=>({...invoice,status}) as SalesDocument),{...invoice,type:'QUOTE'} as SalesDocument,{...invoice,customerId:'other'}];expect(calculateRebate({...rule,minArea:'22'},'2026-11-10',docs,[],mockProducts).rebate).toBe(0);expect(calculateRebate({...rule,minSales:'260'},'2026-11-10',docs,[],mockProducts).rebate).toBe(0);expect(calculateRebate(rule,'2026-11-10',docs,[],mockProducts).totalArea).toBeCloseTo(21.66);});
 it('deducts issued credits, ignores draft credits and clamps negative results',()=>{const c={id:'c',customerId:'cus',status:'ISSUED',creditDate:'2026-11-08',creditNoteNumber:'CN-1',lines:[{...line,quantity:2,lineSubtotal:51.984}]} as CreditNote;expect(calculateRebate(rule,'2026-11-10',[invoice],[c,{...c,status:'DRAFT'}],mockProducts).rebate).toBe(17.33);expect(calculateRebate(rule,'2026-11-10',[],[c],mockProducts).rebate).toBe(0);});
 it('clips to agreement dates and excludes other products and no-area units',()=>{expect(calculateRebate({...rule,starts:'2026-11-06'},'2026-11-10',[invoice],[],mockProducts).totalArea).toBe(0);expect(calculateRebate(rule,'2026-12-10',[invoice],[],mockProducts).totalArea).toBe(0);const doc={...invoice,lines:[{...line,productId:'other'}]} as SalesDocument;expect(calculateRebate(rule,'2026-11-10',[doc],[],mockProducts).rebate).toBe(0);});
});

it('accumulates orders once, deducts returns and rechecks the net threshold',()=>{
 const order={...invoice,id:'so1',type:'SALES_ORDER',status:'CONFIRMED',lines:[{...line,coveredArea:80,lineSubtotal:960}]} as SalesDocument;
 const order2={...order,id:'so2',lines:[{...line,coveredArea:160,lineSubtotal:1920}]} as SalesDocument;
 const linked={...invoice,sourceSalesOrderId:'so1'} as SalesDocument;
 const credit={id:'return',customerId:'cus',status:'ISSUED',creditDate:'2026-11-08',creditNoteNumber:'CN-2',lines:[{...line,coveredArea:20,lineSubtotal:240}]} as CreditNote;
 const r={...rule,minArea:'200',minSales:'0'};
 const result=calculateRebate(r,'2026-11-10',[order,order2,linked],[credit],mockProducts);
 expect(result.totalArea).toBe(220);expect(result.rebate).toBe(220);expect(result.sales).toBe(2640);
 expect(calculateRebate({...r,minArea:'230'},'2026-11-10',[order,order2,linked],[credit],mockProducts).rebate).toBe(0);
 expect(calculateRebate(r,'2026-11-10',[{...order,status:'CANCELLED'} as SalesDocument,order2],[credit],mockProducts).totalArea).toBe(140);
});
it('uses all past orders for the area threshold but pays only the settlement period',()=>{
 const old={...invoice,id:'old',type:'SALES_ORDER',status:'CONFIRMED',documentDate:'2025-05-01',lines:[{...line,coveredArea:300}]} as SalesDocument;
 const current={...invoice,lines:[{...line,coveredArea:80}]} as SalesDocument;
 const future={...old,id:'future',documentDate:'2027-01-01',lines:[{...line,coveredArea:1000}]} as SalesDocument;
 const r={...rule,minArea:'350',minSales:'0'};
 const v=calculateRebate(r,'2026-11-10',[old,current,future],[],mockProducts);
 expect(v.historicalArea).toBe(380);expect(v.totalArea).toBe(80);expect(v.rebate).toBe(80);
 const returned={id:'c',customerId:'cus',status:'ISSUED',creditDate:'2026-11-08',creditNoteNumber:'CN',lines:[{...line,coveredArea:10,lineSubtotal:12}]} as CreditNote;
 const net=calculateRebate(r,'2026-11-10',[old,current],[returned],mockProducts);
 expect(net.historicalArea).toBe(370);expect(net.rebate).toBe(70);
 expect(calculateRebate({...r,minArea:'375'},'2026-11-10',[old,current],[returned],mockProducts).rebate).toBe(0);
});
