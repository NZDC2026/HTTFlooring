import {describe,expect,it} from 'vitest';
import {customerSample,overviewModel,customerHealth,customerFacts,customerOrders,visitAge,type CustomerFact,type WorkspaceCustomer} from './customerWorkspaceModel';
import {customerPeriod} from './customerWorkspaceDates';
import {daysAgo} from '../data/customerDashboard';
import type {SalesDocument} from '../../sales/types/salesDocument';
import type {CreditNote} from '../../sales/types/creditNote';
const today='2026-11-16',range={from:'2026-07-01',to:today};
describe('reference customer workspace',()=>{
 const s=customerSample(today);
 it('reproduces all four customer-type states from consistent underlying invoice facts',()=>{
  for(const [kind,sales,invoices,buyers,total,newCustomers] of [['All',81629.62,40,5,8,3],['Store',78429.62,39,4,4,0],['Installer',0,0,0,3,2],['C Customer',3200,1,1,1,1]] as const){const m=overviewModel(s.customers,s.facts,range.from,range.to,today,kind);expect(m.sales).toBe(sales);expect(m.invoices).toBe(invoices);expect(m.buyers).toBe(buyers);expect(m.rows).toHaveLength(total);expect(m.newCustomers).toBe(newCustomers);expect(Math.round(m.months.reduce((n,v)=>n+v.sales,0)*100)/100).toBe(sales);}
  const all=overviewModel(s.customers,s.facts,range.from,range.to,today,'All');expect(all.previousSales).toBe(82549.18);expect(all.previousInvoices).toBe(41);expect(all.health).toEqual({'Active':4,'At risk':0,'Lapsed':1,'Never purchased':2});expect(all.healthTotal).toBe(7);expect(all.visits).toEqual([2,1,1,0,0]);expect(all.top.map(c=>c.sales)).toEqual([41575.91,17321.88,10959.98,8571.85,3200]);
 });
 it('keeps selected order totals, current balances and tasks separate from invoiced sales',()=>{
  const r=customerPeriod('Last 90 days',today);expect(r.from).toBe('2026-08-19');const orders=s.customers.map(c=>customerOrders(c.id,s.facts,r.from,r.to));expect(orders.reduce((n,o)=>n+o.amount,0)).toBe(232555);expect(orders.reduce((n,o)=>n+o.count,0)).toBe(90);expect(s.customers.reduce((n,c)=>n+c.balance,0)).toBe(62393.75);expect(s.customers.reduce((n,c)=>n+c.overdue,0)).toBe(2843.75);expect(s.tasks.filter(t=>t.status==='Open')).toHaveLength(14);expect(s.tasks.filter(t=>t.status==='Open'&&t.due<today)).toHaveLength(3);expect(s.tasks.filter(t=>t.status==='Completed')).toHaveLength(2);expect(visitAge(s.customers[2],today)).toBe(39);
 });
 it('uses invoice dates, nets credits and excludes drafts, voids, cancelled orders and opening imports',()=>{
  const doc=(type:string,status:string,amount:number)=>({id:crypto.randomUUID(),customerId:'c',documentDate:today,type,status,totals:{subtotal:amount}}) as SalesDocument;
  const facts=customerFacts([doc('INVOICE','ISSUED',100),doc('INVOICE','DRAFT',900),doc('INVOICE','VOID',900),{...doc('INVOICE','ISSUED',900),openingBalanceImportId:'opening'},doc('QUOTE','ACCEPTED',900),doc('SALES_ORDER','CONFIRMED',500),doc('SALES_ORDER','CANCELLED',900)],[{id:'credit',customerId:'c',creditDate:today,status:'ISSUED',totals:{subtotal:20}} as CreditNote]);
  const c={...s.customers[0],id:'c'};const m=overviewModel([c],facts,range.from,range.to,today,'All');expect(m.sales).toBe(80);expect(m.invoices).toBe(1);expect(m.buyers).toBe(1);expect(customerOrders('c',facts,range.from,range.to).amount).toBe(500);
 });
 it('uses mutually exclusive 60/90-day health buckets as of today and excludes C Customers',()=>{
  const fact=(id:string,days:number):CustomerFact=>({id,customerId:id,date:daysAgo(today,days),amount:10,kind:'invoice'}),facts=[fact('active',60),fact('risk',61),fact('risk90',90),fact('lapsed',91),fact('future',-1)];
  expect(customerHealth('active',facts,today)).toBe('Active');expect(customerHealth('risk',facts,today)).toBe('At risk');expect(customerHealth('risk90',facts,today)).toBe('At risk');expect(customerHealth('lapsed',facts,today)).toBe('Lapsed');expect(customerHealth('future',facts,today)).toBe('Never purchased');
  const c:WorkspaceCustomer={...s.customers[7],id:'active'};expect(overviewModel([c],facts,range.from,range.to,today,'All').healthTotal).toBe(0);
 });
 it('changes the period without changing current health, and handles zero and leap-year comparisons',()=>{
  const all=overviewModel(s.customers,s.facts,today,today,today,'All');expect(all.sales).toBe(0);expect(all.healthTotal).toBe(7);expect(all.health.Active).toBe(4);expect(all.months).toHaveLength(1);expect(customerPeriod('Yesterday',today)).toEqual({from:'2026-11-15',to:'2026-11-15'});expect(customerPeriod('Last month',today)).toEqual({from:'2026-10-01',to:'2026-10-31'});expect(customerPeriod('This financial year','2026-02-28').from).toBe('2025-07-01');expect(customerPeriod('Last 12 months','2024-02-29').from).toBe('2023-03-01');
 });
});
