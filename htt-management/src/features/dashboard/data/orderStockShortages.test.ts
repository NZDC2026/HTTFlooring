import {expect,it} from 'vitest';
import {orderStockShortages} from './orderStockShortages';
it('shares stock between orders, respects partial dispatch and ignores incoming quantities',()=>{
 const products:any=[{id:'p',baseUnitId:'m',name:'Oak',units:[{id:'box',conversionToBase:2},{id:'m',symbol:'m²',conversionToBase:1}]}];
 const documents:any=['2026-11-12','2026-11-13'].map((date,i)=>({id:'o'+i,type:'SALES_ORDER',status:'CONFIRMED',documentDate:'2026-11-01',documentNumber:'SO'+i,customerId:'c',expectedDispatchDate:date,lines:[{id:'l'+i,productId:'p',unitId:'box',quantity:10}]}));
 const stock=[{productId:'p',siteId:'s',quantityOnHand:25}];
 expect(orderStockShortages(documents,products,stock,[],'ALL')).toMatchObject([{orderId:'o1',required:20,available:5,shortage:15}]);
 const fulfilments:any=[{salesOrderId:'o0',status:'ACTIVE',lines:[{salesOrderLineId:'l0',fulfilledBaseQuantity:10}]}];
 expect(orderStockShortages(documents,products,stock,fulfilments,'s')).toMatchObject([{orderId:'o1',required:20,available:15,shortage:5}]);
 documents[1].status='CANCELLED';expect(orderStockShortages(documents,products,stock,fulfilments,'s')).toEqual([]);
});
