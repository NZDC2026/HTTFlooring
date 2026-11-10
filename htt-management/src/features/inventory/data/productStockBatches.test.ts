import {it,expect} from 'vitest';
import {productStockBatches} from './productStockBatches';
import type {InventoryCostMovement} from '../types/inventoryCost';
it('keeps separate receipt batches and remaining quantities after FIFO issues',()=>{
 const base={productId:'p',siteId:'s',costingMethod:'FIFO',unitCostBase:10} as const;
 const rows=[{...base,id:'issue',quantityBase:-5,valueChange:-50,quantityAfter:25,inventoryValueAfter:250},{...base,id:'r2',referenceNumber:'GR2',occurredAt:'2026-11-02',quantityBase:20,valueChange:200,quantityAfter:30,inventoryValueAfter:300},{...base,id:'r1',referenceNumber:'GR1',occurredAt:'2026-11-01',quantityBase:10,valueChange:100,quantityAfter:10,inventoryValueAfter:100}] as unknown as InventoryCostMovement[];
 expect(productStockBatches('p','s',25,rows)).toEqual([{id:'r1',batchNumber:'GR1',incomeDate:'2026-11-01',quantity:5,value:50},{id:'r2',batchNumber:'GR2',incomeDate:'2026-11-02',quantity:20,value:200}]);
 expect(productStockBatches('p','other',7,rows)[0]).toMatchObject({batchNumber:'Not recorded',quantity:7});
});
it('allocates old weighted-average stock oldest-first without modifying historical costs',()=>{
 const rows=[{id:'out',productId:'p',siteId:'s',costingMethod:'MOVING_WEIGHTED_AVERAGE',quantityBase:-12,quantityAfter:8,valueChange:-180,inventoryValueAfter:120},{id:'new',productId:'p',siteId:'s',costingMethod:'MOVING_WEIGHTED_AVERAGE',quantityBase:10,quantityAfter:20,occurredAt:'2026-11-02',referenceNumber:'GR2',valueChange:200},{id:'old',productId:'p',siteId:'s',costingMethod:'MOVING_WEIGHTED_AVERAGE',quantityBase:10,quantityAfter:10,occurredAt:'2026-11-01',referenceNumber:'GR1',valueChange:100}] as unknown as InventoryCostMovement[];
 const before=JSON.stringify(rows);
 expect(productStockBatches('p','s',8,rows)).toEqual([{id:'new',batchNumber:'GR2',incomeDate:'2026-11-02',quantity:8,value:undefined}]);
 expect(JSON.stringify(rows)).toBe(before);expect(rows[0].valueChange).toBe(-180);
});
it('treats returned goods as a new batch and removes only that batch on reversal',()=>{
 const base={productId:'p',siteId:'s',costingMethod:'MOVING_WEIGHTED_AVERAGE'};
 const rows=[{...base,id:'reverse',quantityBase:-2,quantityAfter:10,fifoReturnLayerId:'return'},{...base,id:'return',quantityBase:2,quantityAfter:12,occurredAt:'2026-11-03',referenceNumber:'RT1'},{...base,id:'old',quantityBase:10,quantityAfter:10,occurredAt:'2026-11-01',referenceNumber:'GR1'}] as unknown as InventoryCostMovement[];
 expect(productStockBatches('p','s',10,rows)).toMatchObject([{id:'old',quantity:10}]);
});
