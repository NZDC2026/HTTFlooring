import {it,expect} from 'vitest';
import {pendingQuotesOrders} from './PendingQuotesOrders';
it('excludes converted quotes, completed orders and out-of-range expected dates; retains partial dispatch',()=>{
 const docs:any=[{id:'q',type:'QUOTE',status:'SENT',expectedDispatchDate:'2026-11-12'},{id:'o',type:'SALES_ORDER',sourceQuoteId:'q',status:'INVOICED',expectedDispatchDate:'2026-11-13',lines:[{id:'l',quantity:10}]},{id:'late',type:'QUOTE',status:'SENT',expectedDispatchDate:'2026-12-01'},{id:'expired',type:'QUOTE',status:'EXPIRED'}];
 const f:any=[{salesOrderId:'o',status:'ACTIVE',lines:[{salesOrderLineId:'l',fulfilledQuantity:4}]}];
 expect(pendingQuotesOrders(docs,f,'2026-11-01','2026-11-30').map(d=>d.id)).toEqual(['o']);
 f[0].lines[0].fulfilledQuantity=10;expect(pendingQuotesOrders(docs,f,'2026-11-01','2026-11-30')).toEqual([]);
});
