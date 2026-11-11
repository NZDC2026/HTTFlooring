import {it,expect} from 'vitest';
import {unpaidCustomerRows,emptyPaymentFollowup,readPaymentFollowup} from './paymentFollowups';
import type {Invoice} from '../../sales/types/salesDocument';
import type {HubTask} from '../../task-hub/taskHubModel';
it('groups unpaid balances by customer, uses oldest due date, and leaves invoice sources unchanged',()=>{
 const invoices=[{id:'a',customerId:'c',amountDue:20,dueDate:'2026-10-01'},{id:'b',customerId:'c',amountDue:30,dueDate:'2026-11-20'},{id:'c',customerId:'d',amountDue:0,dueDate:'2026-10-01'}] as Invoice[];
 const before=JSON.stringify(invoices),rows=unpaidCustomerRows(invoices,[{id:'c',businessName:'Oak Trade'}],[],'2026-11-12');
 expect(rows).toHaveLength(1);expect(rows[0]).toMatchObject({customer:'Oak Trade',total:50,overdue:20,days:42});expect(JSON.stringify(invoices)).toBe(before);
});
it('reads structured payment follow-ups without repurposing unrelated payment tasks',()=>{
 const profile={...emptyPaymentFollowup(),status:'Contacted',last:'2026-11-11'};
 const task={id:'follow',source:'customer',type:'Payment',accountId:'c',updatedAt:'2026-11-11',row:{paymentFollowupData:JSON.stringify({kind:'payment-followup-v1',...profile})}} as unknown as HubTask;
 const rows=unpaidCustomerRows([{customerId:'c',amountDue:10,dueDate:'2026-11-01'}] as Invoice[],[],[task,{...task,id:'general',updatedAt:'2026-11-12',row:undefined}],'2026-11-12');
 expect(rows[0].task?.id).toBe('follow');expect(rows[0].profile.status).toBe('Contacted');
 expect(readPaymentFollowup('Ordinary task note')).toEqual(emptyPaymentFollowup());
});
