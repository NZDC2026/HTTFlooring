import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
let root: string, security: InstanceType<typeof import('../../../electron/security/localSecurity').LocalSecurity>, host: InstanceType<typeof import('../../../electron/security/businessHost').BusinessHost>;
const admin = { username: 'documents.admin', displayName: 'Document acceptance', password: 'Documents-test-password-4821' };
async function restart() { vi.resetModules(); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.login(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); }
beforeEach(async () => { vi.resetModules(); vi.stubGlobal('__HTT_MAIN_HOST__', true); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined); root = mkdtempSync(join(tmpdir(), 'htt-direct-docs-')); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.setup(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); rmSync(root, { recursive: true, force: true }); });
const cmd = (repository: string, method: string, ...args: unknown[]) => host.command({ repository, method, args }).result as any;
const state = (key: string) => host.view().repositories[key] as any;
async function fixture() {
 const product = state('products').products[0], site = (await import('../inventory/data/inventorySiteRepository')).inventorySiteRepository.getActive()[0], customer = state('customers').customers[0];
 const po = cmd('purchaseOrders', 'create', { supplierId: state('suppliers').suppliers[0].id, orderDate: '2026-10-08', lines: [{ productId: product.id, unitId: product.baseUnitId, orderedQuantity: 10, unitCost: 10 }] }); cmd('purchaseOrders', 'approve', po.id); cmd('purchaseOrders', 'send', po.id); cmd('goodsReceipts', 'create', { purchaseOrderId: po.id, siteId: site.id, receiptDate: '2026-10-09', lines: [{ purchaseOrderLineId: po.lines[0].id, receivedQuantity: 10 }] });
 const d = cmd('managedSalesDocuments', 'save', { operationId: crypto.randomUUID(), payload: { kind: 'INVOICE', customerId: customer.id, documentDate: '2026-10-10', dueDate: '2026-11-10', lines: [{ productId: product.id, unitId: product.baseUnitId, quantity: 2, unitPrice: 100, priceBasis: 'Exclusive' }] } }), a = cmd('managedSalesDocuments', 'approve', d.id, d.revision), posted = cmd('managedSalesDocuments', 'post', d.id, a.revision), invoice = state('sales').invoices.find((i: any) => i.id === posted.documentId), order = state('sales').salesOrders.find((o: any) => o.id === invoice.sourceSalesOrderId);
 cmd('salesDispatch', 'record', { operationId: crypto.randomUUID(), salesOrderId: order.id, siteId: site.id, fulfilmentDate: '2026-10-11', lines: [{ salesOrderLineId: order.lines[0].id, fulfilledQuantity: 2 }] });
 const { availableCustomerReturnSources } = await import('../customer-returns/customerReturnRepository'); return { product, site, invoice, source: availableCustomerReturnSources(invoice.id)[0] };
}

async function warehouse(){security.login(admin);const u=security.createUser({username:'proof.warehouse.'+crypto.randomUUID().slice(0,8),displayName:'Warehouse recorder',password:admin.password,roles:['WAREHOUSE']});security.login({username:u.username,password:admin.password});}
const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
function proof(f:any){return {operationId:crypto.randomUUID(),fulfilmentId:f.source.fulfilmentId,recipientName:'Jordan Lee',collectedAt:'2026-10-11T10:30:00.000Z',notes:'Collected first batch',photos:[{name:'cartons.png',data:png}],signature:png};}
it('saves immutable actor-owned collection proof, survives restart and does not repost stock or money',async()=>{
 const f=await fixture();await warehouse();const input=proof(f),stock=structuredClone(state('stock')),journals=structuredClone(state('journals'));
 const r=cmd('collectionProofs','add',input);expect(r.createdBy).toBe(security.principal()!.userId);expect(r.salesOrderId).toBe(f.invoice.sourceSalesOrderId);expect(r.customerId).toBe(f.invoice.customerId);expect(cmd('collectionProofs','add',input).id).toBe(r.id);
 expect(()=>cmd('collectionProofs','add',{...input,recipientName:'Different'})).toThrow();
 expect(state('stock')).toEqual(stock);expect(state('journals')).toEqual(journals);
 await restart();expect(state('collectionProofs').records[0]).toMatchObject({id:r.id,signature:png,recipientName:'Jordan Lee'});
});
it('rejects forged actors, unknown dispatches, missing evidence and unsafe images',async()=>{
 const f=await fixture();await warehouse();const input=proof(f);
 expect(()=>cmd('collectionProofs','add',{...input,createdBy:'forged'})).toThrow();
 expect(()=>cmd('collectionProofs','add',{...input,fulfilmentId:'missing'})).toThrow();
 expect(()=>cmd('collectionProofs','add',{...input,photos:[],signature:undefined})).toThrow();
 expect(()=>cmd('collectionProofs','add',{...input,signature:'data:image/svg+xml;base64,PHN2Zz4='})).toThrow();
 expect(state('collectionProofs').records).toHaveLength(0);
});
it('requires collection proof permission to save evidence',async()=>{
 const f=await fixture(),input=proof(f),u=security.createUser({username:'proof.audit',displayName:'Auditor',password:admin.password,roles:['AUDITOR']});security.login({username:u.username,password:admin.password});
 expect(()=>cmd('collectionProofs','add',input)).toThrow();
});

it('allows warehouse recording and keeps management roles read-only',async()=>{
 const f=await fixture();for(const role of ['SALES','ADMIN','FINANCE_ADMIN','ACCOUNTANT'] as const){security.login(admin);const u=security.createUser({username:'proof.'+role.toLowerCase(),displayName:role+' recorder',password:admin.password,roles:[role]});security.login({username:u.username,password:admin.password});expect(()=>cmd('collectionProofs','add',proof(f))).toThrow();}
 await warehouse();const r=cmd('collectionProofs','add',proof(f));expect(r.createdBy).toBe(security.principal()!.userId);security.login(admin);expect(state('collectionProofs').records.some((p:any)=>p.id===r.id)).toBe(true);
});
