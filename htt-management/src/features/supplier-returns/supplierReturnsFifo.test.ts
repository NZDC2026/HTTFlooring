import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
let root: string, security: InstanceType<typeof import('../../../electron/security/localSecurity').LocalSecurity>, host: InstanceType<typeof import('../../../electron/security/businessHost').BusinessHost>;
const admin = { username: 'documents.admin', displayName: 'Document acceptance', password: 'Documents-test-password-4821' };
async function restart() { vi.resetModules(); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.login(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); }
beforeEach(async () => { vi.resetModules(); vi.stubGlobal('__HTT_MAIN_HOST__', true); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined); root = mkdtempSync(join(tmpdir(), 'htt-direct-docs-')); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.setup(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); rmSync(root, { recursive: true, force: true }); });
const cmd = (repository: string, method: string, ...args: unknown[]) => host.command({ repository, method, args }).result as any;
const state = (key: string) => host.view().repositories[key] as any;
function stockBill(options: {
    quantity?: number;
    cost?: number;
    billCost?: number;
    unitCode?: string;
    receiptDate?: string;
    billDate?: string;
} = {}) {
    const product = state('products').products[0];
    const policy=state('costingPolicies').policies.find((p:any)=>p.productId===product.id);if(policy.costingMethod!=='FIFO')cmd('costingPolicies','setMethod',{productId:product.id,method:'FIFO',expectedUpdatedAt:policy.updatedAt,reason:'Reviewed FIFO policy'});
    if (options.unitCode)
        cmd('products', 'save', { ...product, wholePacks: true }, product.revision ?? 0);
    const unit = options.unitCode ? product.units.find((u: any) => u.code === options.unitCode) : product.units.find((u: any) => u.id === product.baseUnitId), siteId = 'site_001', quantity = options.quantity ?? 10;
    const po = cmd('purchaseOrders', 'create', { supplierId: state('suppliers').suppliers[0].id, orderDate: '2026-10-01', lines: [{ productId: product.id, unitId: unit.id, orderedQuantity: quantity, unitCost: options.cost ?? 10, priceBasis: 'Exclusive' }] });
    cmd('purchaseOrders', 'approve', po.id);
    cmd('purchaseOrders', 'send', po.id);
    const receipt = cmd('goodsReceipts', 'create', { purchaseOrderId: po.id, siteId, receiptDate: options.receiptDate ?? '2026-10-02', lines: [{ purchaseOrderLineId: po.lines[0].id, receivedQuantity: quantity }] });
    const bill = cmd('supplierBills', 'create', { purchaseOrderId: po.id, supplierInvoiceNumber: 'RETURN-BILL-' + crypto.randomUUID(), billDate: options.billDate ?? options.receiptDate ?? '2026-10-03', dueDate: '2026-11-10', lines: [{ purchaseOrderLineId: po.lines[0].id, quantity, unitCost: options.billCost ?? options.cost ?? 10 }] });
    const match = state('receiptMatches').matches.find((m: any) => m.supplierBillId === bill.id);
    return { product, unit, siteId, po, receipt, bill, match };
}
function request(f: ReturnType<typeof stockBill>, quantity = 2) { return { operationId: crypto.randomUUID(), supplierBillId: f.bill.id, supplierCreditNumber: 'RETURN-CREDIT-' + crypto.randomUUID(), returnDate: '2026-10-10', reason: 'Confirmed damaged goods return', lines: [{ matchId: f.match.id, quantity }] }; }

it('FIFO supplier returns consume the oldest layer and preserve bill variance plus reversal after restart',async()=>{stockBill({quantity:2,cost:10});const f=stockBill({quantity:2,cost:20});const r=cmd('physicalSupplierReturns','create',request(f,1));expect(r.lines[0].inventoryValue).toBe(10);expect(state('costBalances').balances.find((b:any)=>b.productId===f.product.id&&b.siteId===f.siteId).inventoryValue).toBe(50);expect(host.exportBackup()).toBeTruthy();await restart();cmd('physicalSupplierReturns','reverse',{returnId:r.id,voidDate:'2026-10-11',reason:'Reviewed return reversal'});expect(state('costBalances').balances.find((b:any)=>b.productId===f.product.id&&b.siteId===f.siteId).inventoryValue).toBe(60);await restart();expect(host.exportBackup()).toBeTruthy();});
