import {it,expect} from 'vitest';
import {pendingQuotesOrders} from './PendingQuotesOrders';
it('excludes converted quotes, completed orders and out-of-range expected dates; retains partial dispatch',()=>{
 const docs:any=[{id:'q',type:'QUOTE',status:'SENT',expectedDispatchDate:'2026-11-12'},{id:'o',type:'SALES_ORDER',sourceQuoteId:'q',status:'INVOICED',expectedDispatchDate:'2026-11-13',lines:[{id:'l',quantity:10}]},{id:'late',type:'QUOTE',status:'SENT',expectedDispatchDate:'2026-12-01'},{id:'expired',type:'QUOTE',status:'EXPIRED'}];
 const f:any=[{salesOrderId:'o',status:'ACTIVE',lines:[{salesOrderLineId:'l',fulfilledQuantity:4}]}];
 expect(pendingQuotesOrders(docs,f,'2026-11-01','2026-11-30').map(d=>d.id)).toEqual(['o']);
 f[0].lines[0].fulfilledQuantity=10;expect(pendingQuotesOrders(docs,f,'2026-11-01','2026-11-30')).toEqual([]);
});

import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {PendingQuotesOrders} from './PendingQuotesOrders';
it('shows GST-inclusive document totals and aligned days in live and Sample previews',()=>{
 const render=(sample:boolean)=>renderToStaticMarkup(createElement(MemoryRouter,null,createElement(PendingQuotesOrders,{documents:[{id:'q',type:'QUOTE',status:'SENT',documentNumber:'QU-0001',documentDate:'2026-11-01',expectedDispatchDate:'2026-11-10',customerId:'c',totals:{subtotal:100,total:110}}] as any,fulfilments:[],customers:[{id:'c',businessName:'Test customer'}],sample,from:'2026-11-01',to:'2026-11-10',link:(p:string)=>p})));
 const live=render(false);
 expect(live).toContain('Amount (inc. GST)');
 expect(live).toContain('$110.00');
 expect(live).not.toContain('$100.00');
 expect(live).toContain('class="pending-days"');
 const sample=render(true);
 expect(sample).toContain('$4,752.00');
 expect(sample).toContain('pending-days-value pending-aged');
 expect(sample).toContain('class="pending-days-value"');
});
