import { describe, expect, it } from 'vitest';
import { soldTransactions, boughtTransactions, filterTransactions, sampleTransactions, sampleProductTransactions, transactionSummary } from './inventoryTransactions';
import type { Product } from '../types/product';
import type { SalesDocument } from '../../sales/types/salesDocument';
import type { SalesFulfilment } from '../../sales/types/salesFulfilment';
import type { GoodsReceipt } from '../../purchases/types/goodsReceipt';
const p={id:'p',category:'Timber',baseUnitId:'m2',units:[{id:'m2',code:'M2'}]} as Product;
const invoice=(status='ISSUED')=>({id:'inv',type:'INVOICE',status,sourceSalesOrderId:'order',documentDate:'2026-11-01',documentNumber:'INV1',lines:[{id:'line',productId:'p',unitId:'box',quantity:10,lineSubtotal:1000}]}) as SalesDocument;
const dispatch=(id:string,quantity:number,status='ACTIVE',orderId='order')=>({id,status,salesOrderId:orderId,salesOrderNumber:'SO1',customerId:'c',siteId:'site',fulfilmentDate:'2026-11-02',lines:[{id:'fline',salesOrderLineId:'line',productId:'p',unitId:'box',sku:'OAK',description:'Oak',unitSymbol:'Box',fulfilledQuantity:quantity,conversionToBase:2.166,fulfilledBaseQuantity:quantity*2.166}]}) as SalesFulfilment;
describe('inventory transaction reports',()=>{
 it('counts only active invoiced dispatches, caps partial quantities and allocates invoice value once',()=>{
  const rows=soldTransactions([p],[invoice()],[dispatch('a',6),dispatch('b',6),dispatch('void',4,'VOIDED'),dispatch('not-invoiced',5,'ACTIVE','other')],[{id:'c',businessName:'Customer'}]);
  expect(rows.map(r=>r.quantity)).toEqual([6,4]);expect(transactionSummary(rows).amount).toBe(1000);expect(transactionSummary(rows).floorArea).toBeCloseTo(21.66);expect(transactionSummary(rows).orders).toBe(1);
 });
 it('excludes draft and void invoices and invoices without physical dispatch',()=>{
  expect(soldTransactions([p],[invoice('VOID')],[dispatch('a',2)],[])).toEqual([]);
  expect(soldTransactions([p],[invoice('DRAFT')],[dispatch('a',2)],[])).toEqual([]);
  expect(soldTransactions([p],[invoice()],[],[])).toEqual([]);
 });
 it('uses receipt snapshots for received quantity, area and cost',()=>{
  const receipt={id:'gr',receiptNumber:'GR1',purchaseOrderId:'po',purchaseOrderNumber:'PO1',supplierId:'s',supplierName:'Supplier',siteId:'site',receiptDate:'2026-11-03',status:'POSTED',lines:[{id:'l',productId:'p',sku:'OAK',description:'Oak',unitSymbol:'Box',receivedQuantity:10,conversionToBase:2.166,receivedBaseQuantity:21.66,unitCost:42}]} as GoodsReceipt;
  const rows=boughtTransactions([p],[receipt]);expect(rows[0]).toMatchObject({quantity:10,area:21.66,amount:420});expect(transactionSummary(rows).documents).toBe(1);
 });
 it('filters dates inclusively with warehouse, category, party and SKU',()=>{
  const rows=soldTransactions([p],[invoice()],[dispatch('a',2)],[]);
  const filter={from:'2026-11-02',to:'2026-11-02',site:'site',category:'Timber',party:'c',search:'oak'};
  expect(filterTransactions(rows,filter)).toHaveLength(1);expect(filterTransactions(rows,{...filter,site:'other'})).toHaveLength(0);expect(filterTransactions(rows,{...filter,from:'2026-11-03'})).toHaveLength(0);
 });
 it('locks a product report to its product ID even when another product shares its name',()=>{
  const products=sampleTransactions('Sold','2026-11-07');const rows=[...products,{...products[0],id:'other',productId:'unrelated',name:products[0].name}];
  const result=filterTransactions(rows,{from:'2026-11-01',to:'2026-11-07',site:'ALL',category:'All',party:'All',search:'',productId:products[0].productId});
  expect(result).toHaveLength(1);expect(result[0].id).toBe(products[0].id);
 });
 it('generates dated product-specific Sold and Bought samples without other products',()=>{
  const product={...p,name:'Sample Oak Product',sku:'CURRENT-SKU',units:[{id:'m2',code:'M2',symbol:'m²',conversionToBase:1,basePrice:45,isBaseUnit:true,active:true},{id:'box',code:'BOX',symbol:'box',conversionToBase:2.166,basePrice:97.47,isBaseUnit:false,active:true}]} as Product;
  for(const mode of ['Sold','Bought'] as const){const rows=sampleProductTransactions(mode,'2026-11-07',product);expect(rows).toHaveLength(6);expect(rows.every(r=>r.productId===product.id&&r.sku===product.sku&&r.name===product.name&&r.sample)).toBe(true);expect(rows[0].coverage).toBe(2.166);expect(rows[0].date).toBe('2026-11-07');expect(rows[5].date).toBe('2026-11-02');}
  expect(sampleProductTransactions('Sold','2026-11-07',product)[0].amount).toBeCloseTo(40*97.47);
 });
 it('keeps flooring m² separate from accessory units in isolated samples',()=>{
  const rows=sampleTransactions('Sold','2026-11-07'),s=transactionSummary(rows);
  expect(s.floorArea).toBeCloseTo(205.77);expect(s.accessories).toEqual({Roll:16,Piece:120});expect(s.accessoryUnits).toBe(136);expect(s.orders).toBe(6);expect(rows.every(r=>r.sample)).toBe(true);
 });
});
