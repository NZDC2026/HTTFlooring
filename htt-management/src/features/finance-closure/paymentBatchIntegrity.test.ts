import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
let root: string, security: InstanceType<typeof import('../../../electron/security/localSecurity').LocalSecurity>, host: InstanceType<typeof import('../../../electron/security/businessHost').BusinessHost>;
const admin = { username: 'integration.admin', displayName: 'Integration admin', password: 'Integration-test-password-4821' };
async function restart() { vi.resetModules(); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.login(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); }
beforeEach(async () => { vi.resetModules(); vi.stubGlobal('__HTT_MAIN_HOST__', true); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined); root = mkdtempSync(join(tmpdir(), 'htt-business-integration-')); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.setup(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); rmSync(root, { recursive: true, force: true }); });
function command(repository: string, method: string, ...args: unknown[]) { return host.command({ repository, method, args }).result as any; }
function state(name: string) { return host.view().repositories[name] as any; }
function fixture() { const product = state('products').products[0], customer = state('customers').customers[0]; return { product, customer }; }
const date = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Pacific/Auckland' });
async function supplierCredit(supplierId?: string, reference = 'CLOSURE') { const { product } = fixture(); const { supplierRepository } = await import('../contacts/data/supplierRepository'); const { inventorySiteRepository } = await import('../inventory/data/inventorySiteRepository'); const po = command('purchaseOrders', 'create', { supplierId: supplierId ?? supplierRepository.getAll()[0].id, orderDate: '2026-10-01', lines: [{ productId: product.id, unitId: product.baseUnitId, orderedQuantity: 2, unitCost: 20 }] }); command('purchaseOrders', 'approve', po.id); command('purchaseOrders', 'send', po.id); command('goodsReceipts', 'create', { purchaseOrderId: po.id, siteId: inventorySiteRepository.getActive()[0].id, receiptDate: '2026-10-02', lines: [{ purchaseOrderLineId: po.lines[0].id, receivedQuantity: 2 }] }); const bill = command('supplierBills', 'create', { purchaseOrderId: po.id, supplierInvoiceNumber: reference, billDate: '2026-10-03', dueDate: '2026-10-20', lines: [{ purchaseOrderLineId: po.lines[0].id, quantity: 2, unitCost: 20 }] }); const credit = command('supplierCredits', 'create', { sourceSupplierBillId: bill.id, supplierCreditNumber: reference + '-CR', creditDate: '2026-10-04', reason: 'Financial price credit, no stock return', lines: [{ supplierBillLineId: bill.lines[0].id, quantity: 1, unitCost: 20 }] }); return { credit, bill }; }

const batch = (bill: any, patch = {}) => command('paymentBatches', 'create', { operationId: crypto.randomUUID(), paymentDate: date(), bankAccountId: 'bank_001', reference: 'Reviewed batch', allocations: [{ supplierBillId: bill.id, amount: 10 }], ...patch });
function postBatch(b: any) { command('paymentBatches', 'approve', b.id); return command('paymentBatches', 'post', b.id); }
function corrupt(backup: any, change: (rows: any) => void) { const b = structuredClone(backup); change(b.repositories.paymentBatches.batches); delete b.checksum; b.checksum = createHash('sha256').update(JSON.stringify(b)).digest('hex'); return JSON.stringify(b); }
it('rejects altered draft identities, creation fingerprints, invalid dates and hidden payment links in restore previews', async () => {
    const { bill } = await supplierCredit(); batch(bill); const backup = host.exportBackup();
    for (const change of [(r: any[]) => r.push(structuredClone(r[0])), (r: any[]) => r[0].reference = 'Changed after approval', (r: any[]) => r[0].paymentDate = '2026-02-30', (r: any[]) => r[0].paymentIds = ['hidden-payment'], (r: any[]) => r[0].history[0].actor = 'another-actor'])
        expect(() => host.prepareRestore(corrupt(backup, change))).toThrow(/batch|duplicate/i);
});
it('rejects approved batches whose approval actor or lifecycle history was changed', async () => {
    const { bill } = await supplierCredit(), b = batch(bill); command('paymentBatches', 'approve', b.id); const backup = host.exportBackup();
    for (const change of [(r: any[]) => r[0].approvedBy = 'forged-approver', (r: any[]) => r[0].history.pop(), (r: any[]) => r[0].history[0].at = 'not-a-timestamp'])
        expect(() => host.prepareRestore(corrupt(backup, change))).toThrow(/batch/i);
});
it('rejects swapping equal-value posted payments between batches and double-owning a payment', async () => {
    const a = await supplierCredit(), b = await supplierCredit(state('suppliers').suppliers[1].id, 'SECOND'); postBatch(batch(a.bill)); postBatch(batch(b.bill)); const backup = host.exportBackup();
    expect(() => host.prepareRestore(corrupt(backup, rows => { const ids = rows[0].paymentIds; rows[0].paymentIds = rows[1].paymentIds; rows[1].paymentIds = ids; }))).toThrow(/batch/i);
    expect(() => host.prepareRestore(corrupt(backup, rows => { rows[1].paymentIds = rows[0].paymentIds; }))).toThrow(/batch/i);
});
it('rejects wrong bill allocations even when total, bank, date and supplier stay equal', async () => {
    const a = await supplierCredit(), b = await supplierCredit(undefined, 'ANOTHER-BILL'); postBatch(batch(a.bill)); const backup = host.exportBackup();
    expect(() => host.prepareRestore(corrupt(backup, rows => { rows[0].allocations[0].supplierBillId = b.bill.id; const { operationId, paymentDate, bankAccountId, reference, allocations } = rows[0]; rows[0].fingerprint = JSON.stringify({ operationId, paymentDate, bankAccountId, reference, allocations }); }))).toThrow(/batch/i);
});
it('rolls back every supplier payment, allocation and journal if a later supplier fails, then safely retries', async () => {
    const a = await supplierCredit(), b = await supplierCredit(state('suppliers').suppliers[1].id, 'MULTI'); const group = batch(a.bill, { allocations: [{ supplierBillId: a.bill.id, amount: 10 }, { supplierBillId: b.bill.id, amount: 15 }] }); command('paymentBatches', 'approve', group.id);
    const { snapshotRepositories } = await import('../security/repositoryHost'), before = structuredClone(snapshotRepositories()), disk = readFileSync(join(root, 'business.json'), 'utf8'); const { supplierPaymentRepository } = await import('../purchases/data/supplierPaymentRepository'), original = supplierPaymentRepository.create.bind(supplierPaymentRepository); let count = 0;
    const spy = vi.spyOn(supplierPaymentRepository, 'create').mockImplementation(input => { const result = original(input); if (++count === 2) throw new Error('Injected second supplier failure'); return result; });
    expect(() => command('paymentBatches', 'post', group.id)).toThrow(/Injected/); spy.mockRestore(); expect(snapshotRepositories()).toEqual(before); expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(disk);
    const posted = command('paymentBatches', 'post', group.id); expect(posted.paymentIds).toHaveLength(2); expect(command('paymentBatches', 'post', group.id).paymentIds).toEqual(posted.paymentIds); await restart(); expect(state('paymentBatches').batches[0].status).toBe('POSTED');
});
it('rolls back the entire multi-supplier reversal after a later failure and preserves valid reversed backups', async () => {
    const a = await supplierCredit(), b = await supplierCredit(state('suppliers').suppliers[1].id, 'REVERSE'); const group = postBatch(batch(a.bill, { allocations: [{ supplierBillId: a.bill.id, amount: 10 }, { supplierBillId: b.bill.id, amount: 15 }] }));
    const { snapshotRepositories } = await import('../security/repositoryHost'), before = structuredClone(snapshotRepositories()), { supplierPaymentRepository } = await import('../purchases/data/supplierPaymentRepository'), original = supplierPaymentRepository.reverse.bind(supplierPaymentRepository); let count = 0;
    const spy = vi.spyOn(supplierPaymentRepository, 'reverse').mockImplementation((...args) => { const result = original(...args); if (++count === 2) throw new Error('Injected second reversal failure'); return result; });
    expect(() => command('paymentBatches', 'reverse', { id: group.id, reason: 'Correct all payments' })).toThrow(/Injected/); spy.mockRestore(); expect(snapshotRepositories()).toEqual(before);
    command('paymentBatches', 'reverse', { id: group.id, reason: 'Correct all payments' }); const backup = host.exportBackup(); expect(host.prepareRestore(JSON.stringify(backup)).token).toBeTruthy(); await restart(); expect(state('paymentBatches').batches[0].status).toBe('REVERSED');
});
it('includes approved unpaid batches in period close checks but excludes drafts, future dates and cancellations', async () => {
    const { bill } = await supplierCredit(), period = command('accountingPeriods', 'create', { name: 'October batch close', startDate: '2026-10-01', endDate: '2026-10-18', reason: 'Review approved payment batches' }); const b = batch(bill, { paymentDate: '2026-10-10' });
    const pending = () => command('accountingPeriods', 'preflight', period.id).blockers.filter((b: any) => b.code === 'PAYMENT_BATCH_NOT_POSTED'); expect(pending()).toHaveLength(0); command('paymentBatches', 'approve', b.id); expect(pending()).toHaveLength(1); expect(() => command('accountingPeriods', 'close', { id: period.id, reason: 'Close reviewed period' })).toThrow(/approved payment batch/);
    command('paymentBatches', 'cancel', { id: b.id, reason: 'Replace unposted batch' }); expect(pending()).toHaveLength(0); const future = batch(bill, { paymentDate: '2026-10-19' }); command('paymentBatches', 'approve', future.id); expect(pending()).toHaveLength(0); expect(host.prepareRestore(JSON.stringify(host.exportBackup())).token).toBeTruthy();
});
it('refuses to mark a batch posted when a reused operation points to a reversed payment', async () => {
    const { bill } = await supplierCredit(), b = batch(bill); command('paymentBatches', 'approve', b.id);
    const p = command('supplierPayments', 'create', { operationId: 'batch:' + b.id + ':' + bill.supplierId, supplierId: bill.supplierId, paymentDate: b.paymentDate, method: 'BANK_TRANSFER', bankAccountId: b.bankAccountId, reference: b.reference, allocations: b.allocations }); command('supplierPayments', 'reverse', p.id, 'Correct previously recorded payment');
    expect(() => command('paymentBatches', 'post', b.id)).toThrow(/not posted/); expect(state('paymentBatches').batches[0].status).toBe('APPROVED'); expect(host.exportBackup()).toBeTruthy();
});
it('restores normalized references, multi-bill supplier grouping and stale unpaid drafts without rewriting approved data', async () => {
    const a = await supplierCredit(), b = await supplierCredit(undefined, 'SAME-SUPPLIER');
    const stale = batch(a.bill, { allocations: [{ supplierBillId: a.bill.id, amount: 44 }] });
    const posted = postBatch(batch(a.bill, { reference: '  Reviewed remittance  ', allocations: [{ supplierBillId: b.bill.id, amount: 5 }, { supplierBillId: a.bill.id, amount: 10 }] }));
    expect(posted.paymentIds).toHaveLength(1); const backup = host.exportBackup(); expect(host.prepareRestore(JSON.stringify(backup)).token).toBeTruthy(); await restart();
    expect(state('paymentBatches').batches.find((b: any) => b.id === stale.id).status).toBe('DRAFT'); expect(state('paymentBatches').batches.find((b: any) => b.id === posted.id).reference).toBe('  Reviewed remittance  ');
});
