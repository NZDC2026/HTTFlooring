import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
let root:string,security:InstanceType<typeof import('../../../electron/security/localSecurity').LocalSecurity>,host:InstanceType<typeof import('../../../electron/security/businessHost').BusinessHost>;
const admin={username:'purchase.settings.admin',displayName:'Purchase acceptance',password:'Purchase-test-password-4821'};
async function restart(){vi.resetModules();const {LocalSecurity}=await import('../../../electron/security/localSecurity');const {BusinessHost}=await import('../../../electron/security/businessHost');security=new LocalSecurity(join(root,'security.json'));security.login(admin);host=new BusinessHost(join(root,'business.json'),security);await host.initialize();}
beforeEach(async()=>{vi.resetModules();vi.stubGlobal('__HTT_MAIN_HOST__',true);vi.stubGlobal('window',undefined);vi.stubGlobal('localStorage',undefined);root=mkdtempSync(join(tmpdir(),'htt-g10-'));const {LocalSecurity}=await import('../../../electron/security/localSecurity');const {BusinessHost}=await import('../../../electron/security/businessHost');security=new LocalSecurity(join(root,'security.json'));security.setup(admin);host=new BusinessHost(join(root,'business.json'),security);await host.initialize();});
afterEach(()=>{vi.unstubAllGlobals();vi.restoreAllMocks();rmSync(root,{recursive:true,force:true});});
const cmd=(repository:string,method:string,...args:unknown[])=>host.command({repository,method,args}).result as any;
const state=(key:string)=>host.view().repositories[key] as any;
const fx=(rate=1.5)=>({currency:'USD',baseCurrency:'AUD',rate,rateDate:'2026-10-01',source:'Manual'});
async function foreignBill(){
    const supplier=state('suppliers').suppliers[0],product=state('products').products[0];
    const {defaults}=await import('../data-transfer/transferModel');
    cmd('suppliers','update',supplier.id,{...defaults.Suppliers,...Object.fromEntries(Object.entries(supplier).filter(([,v])=>v!==undefined)),currency:'USD'});
    const order=cmd('purchaseOrders','create',{supplierId:supplier.id,orderDate:'2026-10-01',fx:fx(),lines:[{productId:product.id,unitId:product.baseUnitId,orderedQuantity:2,unitCost:100}]});
    expect(order.lines[0].unitCost).toBe(150);
    expect(order.totals.total).toBe(330);
    cmd('purchaseOrders','approve',order.id);
    cmd('purchaseOrders','send',order.id);
    const {inventorySiteRepository}=await import('../inventory/data/inventorySiteRepository');
    cmd('goodsReceipts','create',{purchaseOrderId:order.id,siteId:inventorySiteRepository.getActive()[0].id,receiptDate:'2026-10-02',lines:[{purchaseOrderLineId:order.lines[0].id,receivedQuantity:2}]});
    const bill=cmd('supplierBills','create',{purchaseOrderId:order.id,supplierInvoiceNumber:'USD-BILL-001',billDate:'2026-10-03',dueDate:'2026-11-02',fx:fx(),lines:[{purchaseOrderLineId:order.lines[0].id,quantity:2,unitCost:100}]});
    expect(bill.totals.total).toBe(330);
    expect(bill.fx.currency).toBe('USD');
    const {purchaseSourceRevision}=await import('../document-output/purchaseOutputRepository');
    const output=cmd('preparedPurchaseOutputs','prepare',{operationId:'fx-order-output',kind:'PURCHASE_ORDER',sourceId:order.id,expectedRevision:purchaseSourceRevision('PURCHASE_ORDER',order.id)});
    expect(output).toMatchObject({total:220,issuer:{currency:'USD'}});
    expect(output.lines[0].unitPrice).toBe(100);

    return {supplier,order,bill};
}
it.each([1.4,1.6])('records actual foreign cash and FX gain/loss at rate %s, restarts, and reverses',async rate=>{
    const {supplier,bill}=await foreignBill();
    const request={operationId:'foreign-payment',supplierId:supplier.id,paymentDate:'2026-10-05',method:'BANK_TRANSFER',bankAccountId:state('bankAccounts').bankAccounts[0].id,fx:fx(rate),settlementAmount:220,allocations:[{supplierBillId:bill.id,amount:330}]};
    const payment=cmd('supplierPayments','create',request);
    expect(payment.amount).toBe(Math.round(220*rate*100)/100);
    expect(payment.exchangeDifference).toBe(Math.round((payment.amount-330)*100)/100);
    expect(state('supplierBills').supplierBills.find((b:any)=>b.id===bill.id).totals.amountDue).toBe(0);
    const journal=state('journals').journalEntries.find((j:any)=>j.sourceType==='SUPPLIER_PAYMENT'&&j.sourceId===payment.id);
    const payable=state('accounts').accounts.find((a:any)=>a.systemRole==='ACCOUNTS_PAYABLE');
    expect(journal.lines.find((l:any)=>l.accountId===payable.id).debit).toBe(330);
    const debit=journal.lines.reduce((sum:number,l:any)=>sum+l.debit,0),credit=journal.lines.reduce((sum:number,l:any)=>sum+l.credit,0);
    expect(debit).toBeCloseTo(credit,2);
    expect(cmd('supplierPayments','create',request).id).toBe(payment.id);
    const {purchaseSourceRevision}=await import('../document-output/purchaseOutputRepository');
    const advice=cmd('preparedPurchaseOutputs','prepare',{operationId:'fx-advice',kind:'REMITTANCE',sourceId:payment.id,expectedRevision:purchaseSourceRevision('REMITTANCE',payment.id)});
    expect(advice).toMatchObject({total:220,settlementAmount:220,bankAmount:payment.amount});
    const {renderPurchaseOutput}=await import('../document-output/purchaseOutputHtml');
    expect(renderPurchaseOutput(advice)).toContain('USD 220.00');
    await restart();
    expect(state('supplierPayments').supplierPayments.find((p:any)=>p.id===payment.id).amount).toBe(payment.amount);
    cmd('supplierPayments','reverse',payment.id,'Currency reversal test');
    expect(state('supplierBills').supplierBills.find((b:any)=>b.id===bill.id).totals.amountDue).toBe(330);
});
it('supports a partial foreign payment and prevents a missing conversion',async()=>{
    const {supplier,bill}=await foreignBill();
    const request={supplierId:supplier.id,paymentDate:'2026-10-05',method:'BANK_TRANSFER',bankAccountId:state('bankAccounts').bankAccounts[0].id,allocations:[{supplierBillId:bill.id,amount:165}]};
    expect(()=>cmd('supplierPayments','create',request)).toThrow(/currency/);
    const payment=cmd('supplierPayments','create',{...request,fx:fx(1.4),settlementAmount:110});
    expect(payment.amount).toBe(154);
    expect(state('supplierBills').supplierBills.find((b:any)=>b.id===bill.id).totals.amountDue).toBe(165);
});
it('converts expense bills and keeps the snapshot after supplier and reference changes',async()=>{
    const supplier=state('suppliers').suppliers[0];
    const payload={kind:'EXPENSE',supplierId:supplier.id,supplierInvoiceNumber:'FX-EXPENSE',documentDate:'2026-10-01',fx:fx(),lines:[{description:'Freight',accountId:state('accounts').accounts.find((a:any)=>a.systemRole==='OPERATING_EXPENSE').id,quantity:1,unitCost:100,taxCode:'GST'}]};
    const draft=cmd('expenseBillDrafts','save',{operationId:'fx-expense',payload});
    expect(draft.totals.total).toBe(165);
    const approved=cmd('expenseBillDrafts','approve',draft.id,draft.revision);
    const posted=cmd('expenseBillDrafts','post',draft.id,approved.revision);
    await restart();
    expect(state('supplierBills').supplierBills.find((b:any)=>b.id===posted.documentId)).toMatchObject({fx:{...fx(),originalAmount:110,baseAmount:165},totals:{total:165}});
});


it('normalizes RMB supplier selections and keeps precise original order amounts',async()=>{
    const {defaults}=await import('../data-transfer/transferModel');
    const supplier=cmd('suppliers','create',{...defaults.Suppliers,businessName:'Sample RMB supplier',country:'China',currency:'RMB'});
    expect(supplier.currency).toBe('CNY');
    const product=state('products').products[0];
    const order=cmd('purchaseOrders','create',{supplierId:supplier.id,orderDate:'2026-10-01',fx:{...fx(0.2),currency:'CNY'},lines:[{productId:product.id,unitId:product.baseUnitId,orderedQuantity:1,unitCost:1000}]});
    expect(order.fx).toMatchObject({currency:'CNY',originalAmount:1100,baseAmount:220});
    await restart();
    expect(state('purchaseOrders').purchaseOrders.find((o:any)=>o.id===order.id).fx.originalAmount).toBe(1100);
});

it('prints base-currency settlements against foreign bills without relabelling the payable',async()=>{
    const {supplier,bill}=await foreignBill();
    const payment=cmd('supplierPayments','create',{supplierId:supplier.id,paymentDate:'2026-10-05',method:'BANK_TRANSFER',bankAccountId:'bank_001',fx:{...fx(1),currency:'AUD'},settlementAmount:308,allocations:[{supplierBillId:bill.id,amount:330}]});
    const {purchaseSourceRevision}=await import('../document-output/purchaseOutputRepository');
    const output=cmd('preparedPurchaseOutputs','prepare',{operationId:'aud-fx-advice',kind:'REMITTANCE',sourceId:payment.id,expectedRevision:purchaseSourceRevision('REMITTANCE',payment.id)});
    expect(output).toMatchObject({total:330,settlementAmount:308,bankAmount:308,originalCurrency:false,issuer:{currency:'AUD'}});
});

it('reviews captured supplier totals in the original currency before converting the draft',()=>{
    const supplier=state('suppliers').suppliers[0];
    const input={operationId:'fx-capture',reviewed:true,sourceName:'Sample USD freight invoice',declared:{subtotal:100,taxAmount:10,total:110},payload:{kind:'EXPENSE',supplierId:supplier.id,supplierInvoiceNumber:'FX-CAPTURE',documentDate:'2026-10-01',dueDate:'2026-11-01',fx:fx(),lines:[{description:'Freight',accountId:state('accounts').accounts.find((a:any)=>a.systemRole==='OPERATING_EXPENSE').id,quantity:1,unitCost:100,taxCode:'GST'}]}};
    expect(cmd('expenseBillDrafts','reviewCapture',input).matches).toBe(true);
    expect(cmd('expenseBillDrafts','capture',input).totals.total).toBe(165);
});
