import {it,expect} from 'vitest';
import {productStockBatches} from './productStockBatches';
import type {InventoryCostMovement} from '../types/inventoryCost';
it('keeps separate receipt batches and remaining quantities after FIFO issues',()=>{
 const base={productId:'p',siteId:'s',costingMethod:'FIFO',unitCostBase:10} as const;
 const rows=[{...base,id:'issue',quantityBase:-5,valueChange:-50,quantityAfter:25,inventoryValueAfter:250},{...base,id:'r2',referenceNumber:'GR2',occurredAt:'2026-11-02',quantityBase:20,valueChange:200,quantityAfter:30,inventoryValueAfter:300},{...base,id:'r1',referenceNumber:'GR1',occurredAt:'2026-11-01',quantityBase:10,valueChange:100,quantityAfter:10,inventoryValueAfter:100}] as InventoryCostMovement[];
 expect(productStockBatches('p','s',25,rows)).toEqual([{id:'r1',batchNumber:'GR1',incomeDate:'2026-11-01',quantity:5,value:50},{id:'r2',batchNumber:'GR2',incomeDate:'2026-11-02',quantity:20,value:200}]);
 expect(productStockBatches('p','other',7,rows)[0]).toMatchObject({batchNumber:'Not recorded',quantity:7});
});
