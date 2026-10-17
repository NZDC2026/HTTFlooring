import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Role } from './rbac';
let root: string;
let security: InstanceType<typeof import('../../../electron/security/localSecurity').LocalSecurity>;
let host: InstanceType<typeof import('../../../electron/security/businessHost').BusinessHost>;
const admin = { username: 'admin.test', displayName: 'Administrator', password: 'Local-test-password-4821' };
beforeEach(async () => {
    vi.resetModules(); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined); vi.stubGlobal('__HTT_MAIN_HOST__', true);
    root = mkdtempSync(join(tmpdir(), 'htt-8c-business-'));
    const { LocalSecurity } = await import('../../../electron/security/localSecurity');
    const { BusinessHost } = await import('../../../electron/security/businessHost');
    security = new LocalSecurity(join(root, 'security.json')); security.setup(admin);
    host = new BusinessHost(join(root, 'business.json'), security); await host.initialize();
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); rmSync(root, { recursive: true, force: true }); });
function command(repository: string, method: string, ...args: unknown[]) { return host.command({ repository, method, args }); }
function accountInput() { return { code: '8999', name: '8C Test Expense', type: 'EXPENSE', allowManualPosting: true }; }
function loginRole(role: Role) {
    security.login(admin);
    const user = security.createUser({ username: `test.${role.toLowerCase()}`, displayName: role, password: admin.password, roles: [role] });
    security.login({ username: user.username, password: admin.password }); return user;
}
async function restart() {
    vi.resetModules(); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined);
    const { LocalSecurity } = await import('../../../electron/security/localSecurity');
    const { BusinessHost } = await import('../../../electron/security/businessHost');
    security = new LocalSecurity(join(root, 'security.json')); security.login(admin);
    host = new BusinessHost(join(root, 'business.json'), security); await host.initialize();
}
describe('8D versioned business snapshots and recovery', () => {
    it('saves checksummed v2 snapshots and rejects accidental byte changes on restart', async () => {
        const file = join(root, 'business.json'); const saved = JSON.parse(readFileSync(file, 'utf8'));
        expect(saved.schemaVersion).toBe(7); expect(saved.checksum).toMatch(/^[a-f0-9]{64}$/);
        saved.repositories.accounts.accounts[0].name = 'damaged'; writeFileSync(file, JSON.stringify(saved));
        await expect(restart()).rejects.toThrow(/checksum/);
        expect(() => command('accounts', 'create', accountInput())).toThrow(/blocked/);
    });
    it('migrates v1 once, retaining an exact source backup and all repositories', async () => {
        command('accounts', 'create', accountInput());
        const file = join(root, 'business.json'); const v2 = JSON.parse(readFileSync(file, 'utf8'));
        const legacy = { schemaVersion: 1, storage: v2.storage, repositories: v2.repositories, lastCommandId: v2.lastCommandId };
        writeFileSync(file, JSON.stringify(legacy)); await restart();
        expect(JSON.parse(readFileSync(file, 'utf8')).repositories).toEqual(legacy.repositories);
        const backups = readdirSync(root).filter(name => name.startsWith('pre-migration-v1-')); expect(backups).toHaveLength(1);
        expect(JSON.parse(readFileSync(join(root, backups[0]), 'utf8'))).toEqual(legacy);
        await restart(); expect(readdirSync(root).filter(name => name.startsWith('pre-migration-v1-'))).toHaveLength(1);
    });
    it('rejects newer schemas without modifying their bytes', async () => {
        const file = join(root, 'business.json'), text = '{"schemaVersion":999}'; writeFileSync(file, text);
        await expect(restart()).rejects.toThrow(/Unsupported/); expect(readFileSync(file, 'utf8')).toBe(text);
    });
    it.each(['SALES', 'WAREHOUSE', 'PURCHASING', 'ACCOUNTANT', 'FINANCE_ADMIN', 'AUDITOR'] as Role[])('denies %s backup and restore even with a stolen preview token', async role => {
        const snapshot = JSON.stringify(host.exportBackup()), preview = host.prepareRestore(snapshot), before = readFileSync(join(root, 'business.json'), 'utf8'); loginRole(role);
        expect(() => host.exportBackup()).toThrow(/Permission/); expect(() => host.prepareRestore(snapshot)).toThrow(/Permission/);
        await expect(host.restoreBackup(preview.token)).rejects.toThrow(/Permission/); expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before);
    });
    it('previews record counts, restores only business data, preserves the old file, and requires restart', async () => {
        const snapshot = host.exportBackup(), preview = host.prepareRestore(JSON.stringify(snapshot));
        expect(preview.counts.accounts).toBeGreaterThan(0);
        // A write invalidates the preview, so an administrator cannot discard unseen updates.
        command('accounts', 'create', accountInput());
        await expect(host.restoreBackup(preview.token)).rejects.toThrow(/expired/);
        const fresh = host.prepareRestore(JSON.stringify(snapshot)), before = readFileSync(join(root, 'business.json'), 'utf8');
        const user = security.createUser({ username: 'preserved.user', displayName: 'Preserved', password: admin.password, roles: ['SALES'] });
        await host.restoreBackup(fresh.token);
        expect(() => command('accounts', 'create', accountInput())).toThrow(/blocked/);
        const files = readdirSync(join(root, 'recovery-backups')); expect(files).toHaveLength(1);
        expect(readFileSync(join(root, 'recovery-backups', files[0]), 'utf8')).toBe(before);
        await restart(); expect(security.listUsers().some(row => row.id === user.id)).toBe(true);
        expect(security.listAudit({ query: 'business.restore' }).rows.some(row => row.outcome === 'SUCCESS')).toBe(true);
        expect((host.view().repositories.accounts as any).accounts.some((a: any) => a.code === '8999')).toBe(false);
        await expect(host.restoreBackup(fresh.token)).rejects.toThrow(/expired/);
    });
    it('rejects malformed or duplicate rows even with a valid checksum, without touching current data', async () => {
        const { sealDatabase } = await import('../../../electron/security/businessSnapshot');
        const snapshot = host.exportBackup(), before = readFileSync(join(root, 'business.json'), 'utf8');
        const rows = (snapshot.repositories.accounts as any).accounts; rows.push(structuredClone(rows[0]));
        expect(() => host.prepareRestore(JSON.stringify(sealDatabase(snapshot)))).toThrow(/duplicate/);
        expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before);
    });
    it('recovers a corrupt startup file and retains its exact damaged bytes for inspection', async () => {
        const snapshot = JSON.stringify(host.exportBackup()), file = join(root, 'business.json'); writeFileSync(file, '{damaged');
        await expect(restart()).rejects.toThrow();
        const preview = host.prepareRestore(snapshot); await host.restoreBackup(preview.token);
        const names = readdirSync(join(root, 'recovery-backups')); expect(readFileSync(join(root, 'recovery-backups', names[0]), 'utf8')).toBe('{damaged');
        await restart(); expect(host.view().repositories).toBeDefined();
    });
    it('blocks all writes after uncertain restore and reconciles the actual saved restore ID on restart', async () => {
        const snapshot = host.exportBackup(); command('accounts', 'create', accountInput()); const preview = host.prepareRestore(JSON.stringify(snapshot));
        const storage = await import('../../../electron/security/localSecurity'), original = storage.atomicJson;
        vi.spyOn(storage, 'atomicJson').mockImplementation((path, value) => { original(path, value); if (path.endsWith('business.json')) throw new Error('sync failure'); });
        await expect(host.restoreBackup(preview.token)).rejects.toThrow(/could not be confirmed/);
        expect(() => command('accounts', 'create', accountInput())).toThrow(/blocked/);
        vi.restoreAllMocks(); await restart();
        expect(security.listAudit({ query: 'recovery.business.restore' }).rows[0].outcome).toBe('SUCCESS');
        expect((host.view().repositories.accounts as any).accounts.some((a: any) => a.code === '8999')).toBe(false);
    });
});
describe('8D complete local lifecycle continuity', () => {
    it('preserves purchasing, moving-average costs, fulfilment, AR/AP payments, bank and GL across restart and backup restore', async () => {
        vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-15T00:00:00.000Z'));
        const { mockProducts } = await import('../inventory/data/mockProducts');
        const { supplierRepository } = await import('../contacts/data/supplierRepository');
        const { inventorySiteRepository } = await import('../inventory/data/inventorySiteRepository');
        const product = mockProducts[0], siteId = inventorySiteRepository.getActive()[0].id;
        const po = command('purchaseOrders', 'create', { supplierId: supplierRepository.getAll()[0].id, orderDate: '2026-10-01', lines: [{ productId: product.id, unitId: product.baseUnitId, orderedQuantity: 10, unitCost: 20 }] }).result as any;
        command('purchaseOrders', 'approve', po.id); command('purchaseOrders', 'send', po.id);
        command('goodsReceipts', 'create', { purchaseOrderId: po.id, siteId, receiptDate: '2026-10-02', lines: [{ purchaseOrderLineId: po.lines[0].id, receivedQuantity: 10 }] });
        const bill = command('supplierBills', 'create', { purchaseOrderId: po.id, supplierInvoiceNumber: '8D-AP', billDate: '2026-10-03', dueDate: '2026-10-20', lines: [{ purchaseOrderLineId: po.lines[0].id, quantity: 10, unitCost: 20 }] }).result as any;
        command('supplierPayments', 'create', { supplierId: bill.supplierId, paymentDate: '2026-10-15', method: 'BANK_TRANSFER', bankAccountId: 'bank_001', operationId: '8D-AP-payment', allocations: [{ supplierBillId: bill.id, amount: 100 }] });
        const quote = command('sales', 'createQuote', { customerId: 'cus_001', documentDate: '2026-10-03', lines: [{ productId: product.id, unitId: product.baseUnitId, quantity: 2, unitPrice: 40 }] }).result as any;
        command('sales', 'sendQuote', quote.id); command('sales', 'acceptQuote', quote.id);
        const order = command('sales', 'convertQuoteToOrder', quote.id).result as any;
        command('fulfilments', 'create', { salesOrderId: order.id, siteId, fulfilmentDate: '2026-10-04', lines: [{ salesOrderLineId: order.lines[0].id, fulfilledQuantity: 2 }] });
        const invoice = command('sales', 'createInvoiceFromOrder', order.id).result as any;
        command('sales', 'recordInvoicePayment', { invoiceId: invoice.id, paymentDate: '2026-10-15', amount: 40, method: 'BANK_TRANSFER', bankAccountId: 'bank_001', operationId: '8D-AR-payment' });
        const before = host.view(), backup = JSON.stringify(host.exportBackup());
        expect((before.repositories.fulfilments as any).fulfilments).toHaveLength(1);
        expect((before.repositories.costMovements as any).movements.length).toBeGreaterThanOrEqual(2);
        await restart(); expect(host.view()).toEqual(before);
        command('accounts', 'create', accountInput());
        const preview = host.prepareRestore(backup); await host.restoreBackup(preview.token); await restart(); expect(host.view()).toEqual(before);
        expect(() => command('sales', 'recordInvoicePayment', { invoiceId: invoice.id, paymentDate: '2026-10-15', amount: 40, method: 'BANK_TRANSFER', bankAccountId: 'bank_001', operationId: '8D-AR-payment' })).toThrow(/already recorded/);
    });
});

describe('8D recovery guard failures', () => {
    it('expires restore previews after five minutes', async () => {
        const preview = host.prepareRestore(JSON.stringify(host.exportBackup()));
        vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 301_000);
        await expect(host.restoreBackup(preview.token)).rejects.toThrow(/expired/);
    });
    it('does not restore when the durable audit intent fails', async () => {
        const preview = host.prepareRestore(JSON.stringify(host.exportBackup())), before = readFileSync(join(root, 'business.json'), 'utf8');
        vi.spyOn(security, 'audit').mockImplementation(() => { throw new Error('audit disk full'); });
        await expect(host.restoreBackup(preview.token)).rejects.toThrow(/audit disk full/);
        expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before);
    });
    it('preserves a v1 database when migration commit fails', async () => {
        const snapshot = host.exportBackup(), file = join(root, 'business.json');
        const legacy = JSON.stringify({ schemaVersion: 1, storage: snapshot.storage, repositories: snapshot.repositories, lastCommandId: snapshot.lastCommandId }); writeFileSync(file, legacy);
        vi.resetModules();
        const storage = await import('../../../electron/security/localSecurity'), original = storage.atomicJson;
        vi.spyOn(storage, 'atomicJson').mockImplementation((path, value) => { if (path === file) throw new Error('disk full'); original(path, value); });
        security = new storage.LocalSecurity(join(root, 'security.json')); security.login(admin);
        const { BusinessHost } = await import('../../../electron/security/businessHost'); host = new BusinessHost(file, security);
        await expect(host.initialize()).rejects.toThrow(/disk full/); expect(readFileSync(file, 'utf8')).toBe(legacy);
        expect(readdirSync(root).some(name => name.startsWith('pre-migration-v1-'))).toBe(true);
        expect(() => command('accounts', 'create', accountInput())).toThrow(/blocked/);
    });
});
