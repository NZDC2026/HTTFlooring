import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
let root: string, security: InstanceType<typeof import('../../../electron/security/localSecurity').LocalSecurity>, host: InstanceType<typeof import('../../../electron/security/businessHost').BusinessHost>;
const admin = { username: 'documents.admin', displayName: 'Document acceptance', password: 'Documents-test-password-4821' };
async function restart() { vi.resetModules(); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.login(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); }
beforeEach(async () => { vi.resetModules(); vi.stubGlobal('__HTT_MAIN_HOST__', true); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined); root = mkdtempSync(join(tmpdir(), 'htt-recycle-')); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.setup(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); rmSync(root, { recursive: true, force: true }); });
const cmd = (repository: string, method: string, ...args: unknown[]) => host.command({ repository, method, args }).result as any;
const state = (key: string) => host.view().repositories[key] as any;
function sales(kind: 'ORDER' | 'INVOICE' = 'INVOICE') { const product = state('products').products[0], customer = state('customers').customers[0]; return { kind, customerId: customer.id, documentDate: '2026-10-10', dueDate: '2026-11-10', customerReference: 'Direct example', lines: [{ productId: product.id, unitId: product.baseUnitId, quantity: 2, unitPrice: 100, priceBasis: 'Exclusive' as const }] }; }
function expense() { return { kind: 'EXPENSE' as const, supplierId: state('suppliers').suppliers[0].id, supplierInvoiceNumber: 'SERVICE-001', documentDate: '2026-10-10', dueDate: '2026-11-10', lines: [{ description: 'Installation service', accountId: state('accounts').accounts.find((a: any) => a.systemRole === 'OPERATING_EXPENSE').id, quantity: 2, unitCost: 55, taxCode: 'GST', priceBasis: 'Inclusive' as const }] }; }
async function role(name: 'SALES' | 'WAREHOUSE' | 'PURCHASING' | 'ACCOUNTANT' | 'FINANCE_ADMIN' | 'AUDITOR') { security.login(admin); const user = security.createUser({ username: 'documents.' + name.toLowerCase(), displayName: name, password: admin.password, roles: [name] }); security.login({ username: user.username, password: admin.password }); }
const list = () => cmd('documentRecycle', 'list') as any[];
const choice = (recordId: string) => { const r = list().find(r => r.recordId === recordId)!; return { kind: r.kind, recordId, token: r.token }; };
const change = (recordId: string, action = 'Trashed', patch = {}) => cmd('documentRecycle', 'change', { operationId: crypto.randomUUID(), action, reason: 'Reviewed duplicate draft', records: [choice(recordId)], ...patch });
function draft(kind: string) {
    if (kind === 'Quote')
        return cmd('sales', 'createQuote', { ...sales('ORDER'), kind: undefined });
    if (kind === 'Purchase order') {
        const p = state('products').products[0];
        return cmd('purchaseOrders', 'create', { supplierId: state('suppliers').suppliers[0].id, orderDate: '2026-10-10', lines: [{ productId: p.id, unitId: p.baseUnitId, orderedQuantity: 2, unitCost: 10 }] });
    }
    return cmd(kind === 'Expense bill draft' ? 'expenseBillDrafts' : 'managedSalesDocuments', 'save', { operationId: crypto.randomUUID(), payload: kind === 'Expense bill draft' ? expense() : sales(kind === 'Sales order draft' ? 'ORDER' : 'INVOICE') });
}
it.each(['Quote', 'Purchase order', 'Sales order draft', 'Invoice draft', 'Expense bill draft'])('recycles and recovers real %s without changing original content or financial balances', async (kind) => {
    const row = draft(kind), before = structuredClone(host.exportBackup().repositories);
    change(row.id);
    expect(list().find(r => r.recordId === row.id).deleted).toBe(true);
    const helper = await import('./recycleState');
    expect(helper.isRecycled(row.id)).toBe(true);
    const current = host.exportBackup().repositories;
    for (const key of Object.keys(before).filter(k => k !== 'documentRecycle'))
        expect(current[key]).toEqual(before[key]);
    change(row.id, 'Recovered');
    expect(list().find(r => r.recordId === row.id).deleted).toBe(false);
    expect(cmd('documentRecycle', 'detail', kind, row.id)).toEqual(row);
    expect(state('documentRecycle').history).toHaveLength(2);
});
it('hides recycled records from normal repository lists and blocks stale detail mutations in main', async () => {
    const q = draft('Quote'), po = draft('Purchase order'), d = draft('Invoice draft');
    [q, po, d].forEach(r => change(r.id));
    const { salesRepository } = await import('../sales/data/salesRepository'), { purchaseOrderRepository } = await import('../purchases/data/purchaseOrderRepository'), { managedSalesRepository } = await import('../direct-documents/managedDocumentRepository');
    expect(salesRepository.getAll().some(r => r.id === q.id)).toBe(false);
    expect(salesRepository.getSnapshot().some(r => r.id === q.id)).toBe(false);
    expect(salesRepository.getById(q.id)).toBeUndefined();
    expect(purchaseOrderRepository.getAll().some(r => r.id === po.id)).toBe(false);
    expect(purchaseOrderRepository.getById(po.id)).toBeUndefined();
    expect(managedSalesRepository.getAll().some(r => r.id === d.id)).toBe(false);
    expect(() => cmd('sales', 'sendQuote', q.id)).toThrow(/recycle bin/);
    expect(() => cmd('purchaseOrders', 'approve', po.id)).toThrow(/recycle bin/);
    expect(() => cmd('managedSalesDocuments', 'approve', d.id, d.revision)).toThrow(/recycle bin/);
    expect(() => cmd('managedSalesDocuments', 'save', { operationId: d.operationId, payload: d.payload })).toThrow(/Recover/);
    change(q.id, 'Recovered');
    expect(cmd('sales', 'sendQuote', q.id).status).toBe('SENT');
});
it('rejects sent quotes, approved purchase orders, approved and posted entry drafts', () => {
    const q = draft('Quote'), po = draft('Purchase order'), d = draft('Invoice draft');
    cmd('sales', 'sendQuote', q.id);
    cmd('purchaseOrders', 'approve', po.id);
    const a = cmd('managedSalesDocuments', 'approve', d.id, d.revision);
    for (const r of [q, po, d])
        expect(() => change(r.id)).toThrow(/unapproved/);
    cmd('managedSalesDocuments', 'post', d.id, a.revision);
    expect(() => change(d.id)).toThrow(/unapproved/);
});
it('rejects newly stale content and lifecycle ABA selections', () => {
    const d = draft('Invoice draft'), old = choice(d.id);
    cmd('managedSalesDocuments', 'save', { id: d.id, expectedRevision: d.revision, operationId: crypto.randomUUID(), payload: { ...d.payload, notes: 'New note' } });
    expect(() => change(d.id, 'Trashed', { records: [old] })).toThrow(/changed/);
    const fresh = choice(d.id);
    change(d.id);
    change(d.id, 'Recovered');
    expect(() => change(d.id, 'Trashed', { records: [fresh] })).toThrow(/changed/);
});
it('retries the same operation across restart and later recovery without repeating deletion', async () => {
    const d = draft('Quote'), request = { operationId: 'stable-trash', action: 'Trashed', reason: 'Reviewed duplicate draft', records: [choice(d.id)] }, first = cmd('documentRecycle', 'change', request);
    change(d.id, 'Recovered');
    await restart();
    expect(cmd('documentRecycle', 'change', request)).toEqual(first);
    expect(list().find(r => r.recordId === d.id).deleted).toBe(false);
    expect(() => cmd('documentRecycle', 'change', { ...request, reason: 'Different request' })).toThrow(/different/);
});
it('rejects a whole batch when a later selection is invalid or repeated', () => {
    const a = draft('Quote'), b = draft('Purchase order'), records = [choice(a.id), choice(b.id)];
    cmd('purchaseOrders', 'approve', b.id);
    expect(() => change(a.id, 'Trashed', { records })).toThrow(/changed/);
    expect(list().find(r => r.recordId === a.id).deleted).toBe(false);
    expect(state('documentRecycle').history).toEqual([]);
    expect(() => change(a.id, 'Trashed', { records: [choice(a.id), choice(a.id)] })).toThrow(/once/);
});
it('requires a reason, strict trusted fields, a correct type and explicit state transition', () => {
    const d = draft('Quote');
    expect(() => change(d.id, 'Trashed', { reason: ' ' })).toThrow();
    expect(() => change(d.id, 'Recovered')).toThrow(/state/);
    expect(() => change(d.id, 'Trashed', { actorId: 'forged' })).toThrow();
    expect(() => change(d.id, 'Trashed', { records: [{ ...choice(d.id), kind: 'Purchase order' }] })).toThrow(/not found/);
    change(d.id);
    expect(() => change(d.id)).toThrow(/state/);
});
it('enforces sales, purchasing and read-only role boundaries on list, details and lifecycle', async () => {
    const q = draft('Quote'), po = draft('Purchase order');
    await role('SALES');
    expect(list().some(r => r.recordId === po.id)).toBe(false);
    expect(() => cmd('documentRecycle', 'detail', 'Purchase order', po.id)).toThrow(/Permission denied/);
    change(q.id);
    expect(() => cmd('documentRecycle', 'change', { operationId: 'forbidden-po', action: 'Trashed', reason: 'Forbidden purchase recycle', records: [{ kind: 'Purchase order', recordId: po.id, token: '0'.repeat(64) }] })).toThrow(/Permission denied/);
    await role('PURCHASING');
    expect(JSON.stringify(state('documentRecycle'))).not.toContain(q.id);
    change(po.id);
    await role('AUDITOR');
    expect(list().every(r => !r.canWrite)).toBe(true);
    expect(() => change(q.id, 'Recovered')).toThrow(/Permission denied/);
    expect(() => cmd('documentRecycle', 'detail', 'Quote', q.id)).not.toThrow();
}, 30000);
it('retains the same record through backup restore and permits normal posting after recovery', async () => {
    const d = draft('Invoice draft');
    change(d.id);
    const backup = host.exportBackup();
    change(d.id, 'Recovered');
    const pending = host.prepareRestore(JSON.stringify(backup));
    await host.restoreBackup(pending.token);
    await restart();
    expect(list().find(r => r.recordId === d.id).deleted).toBe(true);
    change(d.id, 'Recovered');
    const a = cmd('managedSalesDocuments', 'approve', d.id, d.revision);
    cmd('managedSalesDocuments', 'post', d.id, a.revision);
    await restart();
    expect(state('managedSalesDocuments').drafts.find((x: any) => x.id === d.id).status).toBe('POSTED');
});
it('migrates schema 15 without deleting any original document', async () => {
    const d = draft('Quote'), old = host.exportBackup() as any;
    old.schemaVersion = 15;
    delete old.repositories.documentRecycle;
    delete old.checksum;
    old.checksum = createHash('sha256').update(JSON.stringify(old)).digest('hex');
    writeFileSync(join(root, 'business.json'), JSON.stringify(old));
    await restart();
    expect(host.exportBackup().schemaVersion).toBe(23);
    expect(state('documentRecycle').history).toEqual([]);
    expect(list().some(r => r.recordId === d.id)).toBe(true);
});
it('rejects corrupted lifecycle history and changes to currently recycled documents on restore', () => {
    const d = draft('Quote');
    change(d.id);
    const backup = host.exportBackup();
    for (const corrupt of [(b: any) => b.repositories.documentRecycle.history[0].recordId = 'missing', (b: any) => b.repositories.documentRecycle.history[0].action = 'Recovered', (b: any) => b.repositories.documentRecycle.history[0].actorId = 'forged', (b: any) => b.repositories.sales.quotes.find((q: any) => q.id === d.id).notes = 'forged']) {
        const b = structuredClone(backup) as any;
        corrupt(b);
        delete b.checksum;
        b.checksum = createHash('sha256').update(JSON.stringify(b)).digest('hex');
        expect(() => host.prepareRestore(JSON.stringify(b))).toThrow();
    }
});
it('blocks deleting an entry draft used by a recurring schedule and blocks a new schedule from a recycled source', () => {
    const d = draft('Invoice draft');
    cmd('recurringInvoices', 'create', { operationId: 'linked-schedule', name: 'Linked schedule', sourceDraftId: d.id, frequency: 'Monthly', firstDate: '2026-10-01', endDate: '2026-12-01' });
    expect(() => change(d.id)).toThrow(/recurringInvoices/);
    const other = draft('Invoice draft');
    change(other.id);
    expect(() => cmd('recurringInvoices', 'create', { operationId: 'hidden-source', name: 'Cannot use recycled draft', sourceDraftId: other.id, frequency: 'Monthly', firstDate: '2026-10-01', endDate: '2026-12-01' })).toThrow();
});
it('retains linked attachment bytes and routes their business link to the recycle bin', async () => {
    const q = draft('Quote'), attachment = cmd('attachments', 'upload', { operationId: 'recycle-attachment', expectedRevision: 0, target: { kind: 'Quote', id: q.id }, title: 'Retained quote evidence', reason: 'Verified quote evidence', file: { name: 'quote.txt', content: Buffer.from('Retained quote file').toString('base64') } });
    change(q.id);
    await restart();
    expect(state('attachments').documents[0].targetPath).toBe('/sales/recycle-bin');
    const file = cmd('attachments', 'read', { id: attachment.id, versionId: attachment.currentVersionId });
    expect(Buffer.from(file.content, 'base64').toString()).toBe('Retained quote file');
    change(q.id, 'Recovered');
    expect(state('attachments').documents[0].targetPath).toContain(q.id);
});
it('commits a mixed-dataset batch atomically with one consistent audit operation and retains document numbering', () => {
    const q = draft('Quote'), po = draft('Purchase order'), d = draft('Expense bill draft'), records = [q, po, d].map(r => choice(r.id));
    change(q.id, 'Trashed', { operationId: 'mixed-batch', records });
    expect(state('documentRecycle').history.filter((h: any) => h.operationId === 'mixed-batch')).toHaveLength(3);
    expect(records.every(r => list().find(v => v.recordId === r.recordId).deleted)).toBe(true);
    const next = draft('Quote');
    expect(next.documentNumber).not.toBe(q.documentNumber);
    change(q.id, 'Recovered', { records: [q, po, d].map(r => choice(r.id)) });
    expect(records.every(r => !list().find(v => v.recordId === r.recordId).deleted)).toBe(true);
});
