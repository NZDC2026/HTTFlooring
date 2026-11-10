import { describe, expect, it } from 'vitest';
import { inventoryItemMetrics } from './inventoryItemMetrics';
import type { Product } from '../types/product';
import type { SupplierBill } from '../../purchases/types/supplierBill';
import type { InventoryCostBalance } from '../types/inventoryCost';
const product={id:'p',units:[{id:'box',conversionToBase:2},{id:'m2',conversionToBase:1}]} as Product;
const balances=[{productId:'p',siteId:'a',quantityOnHand:10,inventoryValue:200},{productId:'p',siteId:'b',quantityOnHand:30,inventoryValue:900}] as InventoryCostBalance[];
const bill=(date:string,cost:number,status='OPEN',unit='box')=>({billDate:date,createdAt:date,status,lines:[{productId:'p',unitId:unit,quantity:5,unitCost:cost}]}) as SupplierBill;
describe('inventory item metrics',()=>{
 it('uses selected warehouse value and quantity-weighted average',()=>{
  expect(inventoryItemMetrics(product,balances,[],'a')).toMatchObject({currentValue:200,averageCost:20});
  expect(inventoryItemMetrics(product,balances,[],'ALL')).toMatchObject({currentValue:1100,averageCost:27.5});
 });
 it('uses latest non-void bill and converts purchase units to base units',()=>{
  expect(inventoryItemMetrics(product,balances,[bill('2026-10-01',40),bill('2026-11-01',50),bill('2026-11-02',80,'VOID')],'a')).toMatchObject({lastPurchasePrice:25,currentPurchasePrice:25,previousPurchasePrice:20,currentPurchaseDate:'2026-11-01',previousPurchaseDate:'2026-10-01'});
 });
 it('does not invent missing costs or unit conversion',()=>{
  expect(inventoryItemMetrics(product,[],[],'ALL')).toEqual({currentValue:0,averageCost:undefined,lastPurchasePrice:undefined});
  expect(inventoryItemMetrics(product,[],[bill('2026-11-01',50,'OPEN','missing')],'ALL').lastPurchasePrice).toBeUndefined();
 });
});

it('uses saved ex-GST bill amounts for both purchase price comparisons, including zero-cost lines',()=>{
 const previous={...bill('2026-10-01',40),id:'previous',lines:[{...bill('2026-10-01',40).lines[0],lineSubtotal:160}]};
 const current={...bill('2026-11-01',50),id:'current',lines:[{...bill('2026-11-01',50).lines[0],lineSubtotal:200}]};
 expect(inventoryItemMetrics(product,balances,[previous,current],'ALL')).toMatchObject({currentPurchasePrice:20,previousPurchasePrice:16,lastPurchasePrice:20,currentPurchaseBillId:'current',previousPurchaseBillId:'previous'});
 expect(inventoryItemMetrics(product,balances,[{...current,lines:[{...current.lines[0],lineSubtotal:0}]}],'ALL').currentPurchasePrice).toBe(0);
});
