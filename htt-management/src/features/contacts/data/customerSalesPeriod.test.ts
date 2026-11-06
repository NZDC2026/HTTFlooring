import { expect, it } from "vitest";
import { previousSalesRange, salesPeriodSummary, sampleCustomerSalesRows, type SalesPeriodRow } from "./customerSalesPeriod";
const range={from:"2026-10-01",to:"2026-11-06"};
const row=(type:SalesPeriodRow["type"],date:string,amount:number,status:string):SalesPeriodRow=>({id:crypto.randomUUID(),type,date,amount,status,number:"TEST",reference:""});
it("includes both date boundaries and excludes values outside the period across all metrics",()=>{
 const result=salesPeriodSummary([row("INVOICE",range.from,100,"ISSUED"),row("INVOICE",range.to,200,"PAID"),row("INVOICE","2026-09-30",999,"ISSUED"),row("SALES_ORDER",range.to,400,"CONFIRMED"),row("PAYMENT",range.from,150,"RECEIVED"),row("PAYMENT","2026-11-07",999,"RECEIVED")],range);
 expect(result.sales).toBe(300);expect(result.orders).toBe(1);expect(result.average).toBe(400);expect(result.payments).toBe(150);expect(result.rows).toHaveLength(4);
 expect(result.trend.reduce((s,r)=>s+r.sales,0)).toBe(300);expect(result.trend.reduce((s,r)=>s+r.orders,0)).toBe(1);
});
it("excludes drafts, void invoices, cancelled orders and reversed receipts from totals while retaining history",()=>{
 const result=salesPeriodSummary([row("QUOTE",range.from,999,"ACCEPTED"),row("INVOICE",range.from,999,"DRAFT"),row("INVOICE",range.from,999,"VOID"),row("SALES_ORDER",range.from,999,"CANCELLED"),row("PAYMENT",range.from,999,"REVERSED")],range);
 expect([result.sales,result.orders,result.average,result.payments]).toEqual([0,0,0,0]);expect(result.rows).toHaveLength(5);
});
it("calculates preceding equal-length inclusive periods across leap day",()=>{
 expect(previousSalesRange({from:"2024-03-01",to:"2024-03-02"})).toEqual({from:"2024-02-28",to:"2024-02-29"});
});
it("rejects invalid ranges and represents empty months without invented values",()=>{
 expect(()=>salesPeriodSummary([],{from:range.to,to:range.from})).toThrow();expect(()=>salesPeriodSummary([],{from:"2026-02-30",to:range.to})).toThrow();
 expect(salesPeriodSummary([],range).trend).toEqual([{month:"2026-10",sales:0,orders:0},{month:"2026-11",sales:0,orders:0}]);
});
it("Sample preview responds to the same date filter and includes completed and pending invoices",()=>{
 const rows=sampleCustomerSalesRows("2026-11-06"),recent=salesPeriodSummary(rows,{from:"2026-11-01",to:"2026-11-06"}),ytd=salesPeriodSummary(rows,{from:"2026-07-01",to:"2026-11-06"});
 expect(recent.rows).toHaveLength(8);expect(ytd.sales).toBeGreaterThan(0);expect(rows.some(r=>r.status==="PARTIALLY_PAID")).toBe(true);expect(rows.some(r=>r.status==="PAID")).toBe(true);expect(rows.every(r=>r.number.includes("SAMPLE"))).toBe(true);
});
