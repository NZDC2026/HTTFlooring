import { it, expect, vi, afterEach } from "vitest";
import { commandCustomerId, noticeCustomer, showCreditHoldNotice, isCustomerCreditHeld } from "./creditHoldNotice";
const customer={id:'c1',code:'CUST-0001',businessName:'Example Flooring',status:'ON_HOLD',creditHold:false};
const snapshots={customers:{customers:[customer]},sales:{quotes:[{id:'q1',customerId:'c1'}],salesOrders:[{id:'o1',customerId:'c1'}],invoices:[{id:'i1',customerId:'c1'}]},managedSalesDocuments:{drafts:[{id:'d1',payload:{customerId:'c1'}}]},customerCredits:{creditNotes:[{id:'cn1',customerId:'c1'}]}};
afterEach(()=>vi.unstubAllGlobals());
it('resolves creates, quote conversions, order invoices, credits and printable source documents',()=>{
 for(const [repo,method,args] of [
 ['sales','createQuote',[{customerId:'c1'}]],['sales','convertQuoteToOrder',['q1']],['sales','createInvoiceFromOrder',['o1']],
 ['sales','createCreditNoteFromInvoice',[{invoiceId:'i1'}]],['managedSalesDocuments','save',[{payload:{customerId:'c1'}}]],['managedSalesDocuments','post',['d1',1]],
 ['preparedSalesOutputs','prepare',[{sourceId:'i1'}]],['preparedSalesOutputs','prepare',[{sourceId:'cn1'}]],
 ] as [string,string,unknown[]][])expect(commandCustomerId(repo,method,args,snapshots)).toBe('c1');
});
it('ignores supplier and customer-master changes and recognizes both hold controls',()=>{
 expect(commandCustomerId('suppliers','saveShipment',[{customerId:'c1'}],snapshots)).toBeUndefined();
 expect(commandCustomerId('customers','update',['c1'],snapshots)).toBeUndefined();
 expect(noticeCustomer('c1',snapshots)?.code).toBe('CUST-0001');
 expect(isCustomerCreditHeld({...customer,status:'ACTIVE',creditHold:true})).toBe(true);
 expect(isCustomerCreditHeld({...customer,status:'ACTIVE'})).toBe(false);
});
it('opens the reminder every time without dismissing it for later actions',()=>{
 const alert=vi.fn();vi.stubGlobal('window',{alert});
 showCreditHoldNotice(customer,'Create quotation');showCreditHoldNotice(customer,'Convert order');showCreditHoldNotice(customer,'Print invoice');
 expect(alert).toHaveBeenCalledTimes(3);expect(alert.mock.calls[0][0]).toContain('Example Flooring (CUST-0001)');expect(alert.mock.calls[2][0]).toContain('Credit On Hold');
 showCreditHoldNotice({...customer,status:'ACTIVE'},'Print');expect(alert).toHaveBeenCalledTimes(3);
});
