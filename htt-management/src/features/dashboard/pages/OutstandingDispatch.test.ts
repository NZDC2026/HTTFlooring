import {expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {OutstandingDispatch,partialDispatchRows} from './OutstandingDispatch';
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

it('renders only partially dispatched orders in live and labelled sample previews',()=>{
 const order=(id:string)=>({id,type:'SALES_ORDER',status:'CONFIRMED',documentNumber:id,customerId:'c',lines:[{id:'line',quantity:100,unitSymbol:'m²',itemType:'STOCK'}]}) as SalesDocument;
 const dispatch=(id:string,qty:number)=>({salesOrderId:id,status:'ACTIVE',lines:[{salesOrderLineId:'line',fulfilledBaseQuantity:qty}]}) as SalesFulfilment;
 const render=(sample:boolean)=>renderToStaticMarkup(createElement(MemoryRouter,null,createElement(OutstandingDispatch,{documents:[order('SO-PARTIAL'),order('SO-NONE'),order('SO-FULL')],fulfilments:[dispatch('SO-PARTIAL',40),dispatch('SO-FULL',100)],products:[],customers:[{id:'c',businessName:'Oak Flooring'}],sample,date:'2026-11-12',link:(path:string)=>path})));
 const live=render(false),sample=render(true);
 expect(live).toContain('SO-PARTIAL');expect(live).toContain('60 m²');
 expect(live).not.toContain('SO-NONE');expect(live).not.toContain('SO-FULL');
 expect(sample).toContain('Sample');expect(sample).toContain('SO-SAMPLE-10432');expect(sample).toContain('SO-SAMPLE-10438');
 for(const html of [live,sample])for(const removed of ['dispatch-overview','All Orders','Partial Only','Not Started','Not Dispatched','SO-SAMPLE-10441'])expect(html).not.toContain(removed);
});
