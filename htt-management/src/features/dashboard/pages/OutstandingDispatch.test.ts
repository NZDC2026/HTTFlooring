import {expect,it} from 'vitest';
import {partialDispatchRows} from './OutstandingDispatch';
import type {SalesDocument} from '../../sales/types/salesDocument';
import type {SalesFulfilment} from '../../sales/types/salesFulfilment';
import type {Product} from '../../inventory/types/product';
it('shows only partial dispatches, converts packs and ignores voided dispatches',()=>{
 const product={id:'p',baseUnitId:'sqm',units:[{id:'sqm',symbol:'m²',conversionToBase:1},{id:'box',symbol:'Box',conversionToBase:2.5}]} as Product;
 const order=(id:string)=>({id,type:'SALES_ORDER',status:'CONFIRMED',documentNumber:id,customerId:'c',lines:[{id:'line',productId:'p',unitId:'box',quantity:40,itemType:'STOCK'}]}) as SalesDocument;
 const dispatch=(id:string,qty:number,status='ACTIVE')=>({salesOrderId:id,status,lines:[{salesOrderLineId:'line',fulfilledBaseQuantity:qty}]}) as SalesFulfilment;
 const rows=partialDispatchRows([order('partial'),order('full'),order('none')],[dispatch('partial',30),dispatch('partial',40,'VOIDED'),dispatch('full',100)],[product]);
 expect(rows).toHaveLength(1);
 expect(rows[0]).toMatchObject({id:'partial',total:'100 m²',sent:'30 m²',remaining:'70 m²',progress:30});
});
