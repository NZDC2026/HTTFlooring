import { it, expect } from "vitest";
import { customerDashboard, daysAgo, priorYear } from "./customerDashboard";
import type { Customer } from "../types/customer";
import type { SalesDocument } from "../../sales/types/salesDocument";
import type { CreditNote } from "../../sales/types/creditNote";
const today='2026-11-06';
const customer=(id:string)=>({id,businessName:id,createdAt:'2025-01-01T00:00:00Z'}) as Customer;
const doc=(customerId:string,date:string,amount:number,type='INVOICE',status='ISSUED')=>({id:crypto.randomUUID(),customerId,documentDate:date,type,status,totals:{subtotal:amount,total:amount*1.1,taxAmount:amount*.1}}) as SalesDocument;
it('uses an inclusive 30-day boundary and mutually exclusive health groups',()=>{
 const docs=[doc('risk',daysAgo(today,5),100),doc('risk',daysAgo(today,45),200),doc('active',daysAgo(today,30),90),doc('inactive',daysAgo(today,31),50)];
 const result=customerDashboard(['risk','active','inactive','none'].map(customer),docs,[],'2026-01-01',today);
 expect(result.rows.map(r=>[r.id,r.health])).toEqual([['risk','At Risk'],['active','Active'],['inactive','Inactive'],['none','Inactive']]);
 expect(result.active+result.inactive+result.risk).toBe(result.total);
});
it('nets issued credits, excludes non-invoices, drafts, voids and opening imports, and counts orders separately',()=>{
 const docs=[doc('c',today,100),doc('c',today,999,'QUOTE','ACCEPTED'),doc('c',today,999,'INVOICE','DRAFT'),doc('c',today,999,'INVOICE','VOID'),{...doc('c',today,999),openingBalanceImportId:'opening'},doc('c',today,400,'SALES_ORDER','CONFIRMED'),doc('c',today,200,'SALES_ORDER','CANCELLED'),doc('c','2025-11-06',50)];
 const credits=[{customerId:'c',creditDate:today,status:'ISSUED',totals:{subtotal:20}},{customerId:'c',creditDate:today,status:'DRAFT',totals:{subtotal:999}}] as CreditNote[];
 const result=customerDashboard([customer('c')],docs,credits,'2026-01-01',today);
 expect(result.purchases).toBe(80);expect(result.previousPurchases).toBe(50);expect(result.rows[0].orders).toBe(1);
 expect(result.months.reduce((n,m)=>n+m.purchases,0)).toBe(80);expect(result.months.reduce((n,m)=>n+m.orders,0)).toBe(1);
});
it('respects date windows, future-created accounts and leap-year comparisons',()=>{
 const result=customerDashboard([customer('a'),{...customer('future'),createdAt:'2026-12-01T00:00:00Z'}],[doc('a','2026-10-01',10),doc('a',today,20),doc('a','2026-12-01',500)],[],'2026-11-01',today);
 expect(result.total).toBe(1);expect(result.purchases).toBe(20);expect(result.months).toHaveLength(1);
 expect(priorYear('2024-02-29')).toBe('2023-02-28');
});
