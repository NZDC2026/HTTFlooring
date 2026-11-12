import {accountRepository} from '../../accounting/data/accountRepository';
import {expect,it} from 'vitest';
import {inventoryInsightSummary,performanceSeries,performanceValue,priorYearDate} from './adminInsights';
import type {Product} from '../../inventory/types/product';
import type {InventoryMovement} from '../../inventory/types/inventoryMovement';
const product=(id:string,createdAt='2025-01-01'):Product=>({id,sku:id,name:id,category:'Timber',status:'ACTIVE',createdAt,updatedAt:createdAt,baseUnitId:'m2',units:[],reorderPoint:5});
const sale=(productId:string,date:string):InventoryMovement=>({id:productId,movementNumber:productId,movementType:'SALE',siteId:'a',productId,baseUnitId:'m2',quantityBase:-1,transactionUnitId:'m2',transactionUnitSymbol:'m²',transactionQuantity:1,conversionToBase:1,referenceType:'SALES_FULFILMENT',referenceId:productId,occurredAt:date,createdAt:date});
it('counts positive old stock without sales for 60 days, excluding new products and future sales',()=>{
 const products=[product('recent'),product('old'),product('never'),product('new','2026-11-01'),product('empty')];
 const positions=products.map(p=>({productId:p.id,quantityOnHand:p.id==='empty'?0:4,inventoryValue:p.id==='empty'?0:100}));
 const result=inventoryInsightSummary(products,positions,[sale('recent','2026-11-01'),sale('old','2026-09-13'),sale('never','2026-12-01')],'2026-11-12');
 expect(result).toMatchObject({value:400,active:5,slowValue:200,slow:2,low:4,out:1,since:'2025-11-12',cutoff:'2026-09-13'});
});
it('ignores voided sales when classifying slow moving stock',()=>{
 const original=sale('oak','2026-11-01'),voided={...original,id:'void',movementType:'RETURN_IN' as const,referenceType:'SALES_FULFILMENT_VOID' as const,occurredAt:'2026-11-02'};
 expect(inventoryInsightSummary([product('oak')],[{productId:'oak',quantityOnHand:4,inventoryValue:100}],[original,voided],'2026-11-12').slow).toBe(1);
});
it('compares the selected dates, clamps leap days and keeps monthly totals consistent',()=>{
 expect(priorYearDate('2024-02-29')).toBe('2023-02-28');
 const year=performanceSeries([],[],'2026-01-01','2026-12-31',true);
 expect(year.rows).toHaveLength(12);expect(year.current.salesRevenue).toBeCloseTo(3520000);
 expect(year.rows.reduce((n,r)=>n+r.current.salesRevenue,0)).toBeCloseTo(year.current.salesRevenue);
 expect((year.current.salesRevenue/year.prior.salesRevenue-1)*100).toBeCloseTo(12.8);
 const oneDay=performanceSeries([],[],'2026-11-12','2026-11-12',true);
 expect(oneDay.rows).toHaveLength(1);expect(oneDay.current.salesRevenue).toBeLessThan(year.current.salesRevenue);
 expect(performanceValue('Margin',oneDay.current)).toBe(31.5);expect(performanceValue('Expense',oneDay.current)).toBeCloseTo(oneDay.current.salesRevenue*.128);
 expect(performanceSeries(accountRepository.getAll(),[],'2026-11-12','2026-11-12',false).current.salesRevenue).toBe(0);
});
