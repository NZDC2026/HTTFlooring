import {describe,it,expect} from 'vitest';
import {buildPerformanceRows,reportRange,samplePerformance} from './soldBoughtReport';
import type {Item} from './inventorySamples';
import type {Product} from '../types/product';
import type {InventoryMovement} from '../types/inventoryMovement';
import type {InventoryTransaction} from './inventoryTransactions';
import type {InventoryCostMovement} from '../types/inventoryCost';
const item={id:'p',name:'Oak',sku:'O',unit:'m²',onHand:130,low:10} as Item;
const p={id:'p',units:[{symbol:'Box',conversionToBase:2},{symbol:'m²',conversionToBase:1}]} as Product;
const tx={id:'f:line:inv',date:'2026-11-10',productId:'p',quantity:5,unit:'Box',amount:200} as InventoryTransaction;
describe('Sold & Bought report',()=>{
 it('uses inclusive periods across month and financial year boundaries',()=>{expect(reportRange('Last 30 days','2026-11-14')).toEqual({from:'2026-10-16',to:'2026-11-14'});expect(reportRange('Last month','2026-01-14')).toEqual({from:'2025-12-01',to:'2025-12-31'});expect(reportRange('This financial year','2026-02-14').from).toBe('2025-07-01');});
 it('converts packs and reconciles historical balances independently from invoice coverage',()=>{const movements=[{productId:'p',quantityBase:50,occurredAt:'2026-11-15'},{productId:'p',quantityBase:-10,occurredAt:'2026-11-10'},{productId:'p',quantityBase:20,occurredAt:'2026-11-05'}] as InventoryMovement[];const row=buildPerformanceRows([item],[p],[tx],[],movements,[],'2026-11-01','2026-11-14')[0];expect(row.soldQty).toBe(10);expect(row.opening).toBe(70);expect(row.onHand).toBe(80);expect(row.profit).toBeUndefined();});
 it('prefers posted unit conversions over edited catalogue units',()=>{expect(buildPerformanceRows([item],[p],[{...tx,baseQuantity:15}],[],[],[],'2026-11-01','2026-11-14')[0].soldQty).toBe(15);});
 it('uses posted issue costs proportionally and never estimates missing costs',()=>{const costs=[{productId:'p',referenceId:'f',quantityBase:-20,valueChange:-120}] as InventoryCostMovement[];expect(buildPerformanceRows([item],[p],[tx],[],[],costs,'2026-11-01','2026-11-14')[0].profit).toBe(140);expect(buildPerformanceRows([item],[p],[tx],[],[],[],'2026-11-01','2026-11-14')[0].profit).toBeUndefined();});
 it('keeps sample transactions isolated and stock metrics reconciled',()=>{for(const r of samplePerformance('2026-11-14')){expect(r.opening+r.boughtQty-r.soldQty+r.adjustment).toBe(r.onHand);expect(r.soldRows.reduce((n,t)=>n+t.quantity,0)).toBe(r.soldQty);expect(r.boughtRows.reduce((n,t)=>n+t.quantity,0)).toBe(r.boughtQty);expect(r.soldRows.every(t=>t.sample&&t.productId===r.id)).toBe(true);}});
});
