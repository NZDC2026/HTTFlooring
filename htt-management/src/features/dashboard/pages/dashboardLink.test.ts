import {describe,it,expect} from 'vitest';
import {dashboardLink} from './dashboardLink';
describe('dashboard drill-down links',()=>{
 it('carries inclusive dates, warehouse, sample mode and the requested filter',()=>{
 const result=dashboardLink('/sales?tab=SALES_ORDER','2026-10-01','2026-10-31',true,'melbourne',{special:'delivery'});
 const [path,query]=result.split('?');const p=new URLSearchParams(query);
 expect(path).toBe('/sales');expect(Object.fromEntries(p)).toEqual({tab:'SALES_ORDER',dashboard:'1',from:'2026-10-01',to:'2026-10-31',sample:'1',special:'delivery',site:'melbourne'});
 });
 it('explicitly disables sample data for live entries and omits an all-warehouse restriction',()=>{
 const p=new URLSearchParams(dashboardLink('/tasks','2026-11-01','2026-11-11',false,'ALL',{type:'Follow-up'}).split('?')[1]);
 expect(p.get('sample')).toBe('0');expect(p.has('site')).toBe(false);expect(p.get('type')).toBe('Follow-up');
 });
});
