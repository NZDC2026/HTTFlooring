import {expect,it} from 'vitest';
import {salesStockStatus} from './salesStockStatus';
import type {SalesDocument} from '../types/salesDocument';
import type {Product} from '../../inventory/types/product';
const product={id:'oak',itemType:'STOCK',units:[{id:'box',conversionToBase:2}]} as Product;
const order={id:'o',documentNumber:'SO-1',type:'SALES_ORDER',status:'CONFIRMED',lines:[{id:'l',productId:'oak',unitId:'box',quantity:5}]} as SalesDocument;
it('uses base units and other commercial reservations to identify shortages',()=>{
 expect(salesStockStatus(order,[order],[product],[{productId:'oak',quantityOnHand:12}],[])).toBe('Reserved');
 expect(salesStockStatus(order,[order],[product],[{productId:'oak',quantityOnHand:9}],[])).toBe('Low Stock');
 const other={...order,id:'o2',documentNumber:'SO-2'};
 expect(salesStockStatus(order,[order,other],[product],[{productId:'oak',quantityOnHand:12}],[])).toBe('Low Stock');
});
it('avoids stock claims for completed orders or missing unit conversions',()=>{
 expect(salesStockStatus({...order,fulfilmentStatus:'FULFILLED'} as SalesDocument,[order],[product],[],[])).toBe('—');
 expect(salesStockStatus(order,[order],[{...product,units:[]}],[],[])).toBe('Not available');
});
