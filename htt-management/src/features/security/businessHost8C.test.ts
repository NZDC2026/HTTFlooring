import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
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
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); rmSync(root, { recursive: true, force: true }); });
function command(repository: string, method: string, ...args: unknown[]) { return host.command({ repository, method, args }); }
function accountInput() { return { code: '8999', name: '8C Test Expense', type: 'EXPENSE', allowManualPosting: true }; }
function loginRole(role: Role) {
    security.login(admin);
    const user = security.createUser({ username: `test.${role.toLowerCase()}`, displayName: role, password: admin.password, roles: [role] });
    security.login({ username: user.username, password: admin.password }); return user;
}
describe('8C trusted business command boundary', () => {
    it('runs a real authorized business mutation and persists its actor and outcome', () => {
        const actor = security.principal()!.userId;
        const reply = command('accounts', 'create', accountInput());
        expect(reply.result).toMatchObject({ code: '8999' });
        expect(readFileSync(join(root, 'business.json'), 'utf8')).toContain('8C Test Expense');
        expect(security.listAudit({ query: 'accounts.create' }).rows).toEqual(expect.arrayContaining([expect.objectContaining({ actorId: actor, outcome: 'INTENT' }), expect.objectContaining({ actorId: actor, outcome: 'SUCCESS' })]));
    });
    it.each(['SALES', 'WAREHOUSE', 'PURCHASING', 'AUDITOR'] as Role[])('blocks %s from GL configuration even on direct command invocation', role => {
        loginRole(role); const before = readFileSync(join(root, 'business.json'), 'utf8');
        expect(() => command('accounts', 'create', accountInput())).toThrow(/Permission denied/);
        expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before);
        security.login(admin);
        expect(security.listAudit({ query: 'permission.denied' }).rows.some(row => row.outcome === 'DENIED')).toBe(true);
    });
    it.each(['FINANCE_ADMIN', 'ACCOUNTANT'] as Role[])('allows the configured %s accounting operation', role => { loginRole(role); expect(command('accounts', 'create', accountInput()).result).toMatchObject({ code: '8999' }); });
    it('blocks unauthenticated and logged-out mutations', () => {
        security.logout(); expect(() => command('accounts', 'create', accountInput())).toThrow(/Permission denied/);
    });
    it('rejects internal repository methods and forged system journal sources', () => {
        expect(() => command('stock', 'receive', {})).toThrow(/internal/);
        expect(() => command('customerPayments', 'create', {})).toThrow(/internal/);
        expect(() => command('journals', 'post', { sourceType: 'CUSTOMER_PAYMENT', sourceId: 'fake', lines: [] })).toThrow(/business source/);
    });
    it('rolls back main-owned snapshots and records a failed business operation', () => {
        const before = JSON.parse(readFileSync(join(root, 'business.json'), 'utf8'));
        expect(() => command('accounts', 'create', { ...accountInput(), code: '' })).toThrow();
        expect(JSON.parse(readFileSync(join(root, 'business.json'), 'utf8'))).toEqual(before);
        expect(security.listAudit({ query: 'accounts.create' }).rows[0].outcome).toBe('FAILED');
    });
    it('does not expose accounting or banking state to a sales-only session', () => {
        loginRole('SALES'); const view = host.view();
        expect(view.repositories.accounts).toEqual({ accounts: [] });
        expect(view.repositories.journals).toEqual({ journalEntries: [] });
        expect(view.repositories.bankAccounts).toEqual({ bankAccounts: [] });
        expect(view.storage).toEqual({});
    });
    it('does not trust roles, actor IDs or local state supplied with a command', () => {
        loginRole('SALES');
        expect(() => host.command({ repository: 'accounts', method: 'create', args: [{ ...accountInput(), roles: ['ADMIN'], actorId: 'admin' }] })).toThrow(/Permission denied/);
    });
    it('commits a real AP lifecycle with no duplicate journals and restores it after restart', async () => {
        const { mockProducts } = await import('../inventory/data/mockProducts');
        const { supplierRepository } = await import('../contacts/data/supplierRepository');
        const { inventorySiteRepository } = await import('../inventory/data/inventorySiteRepository');
        const product = mockProducts[0];
        const po = command('purchaseOrders', 'create', { supplierId: supplierRepository.getAll()[0].id, orderDate: '2026-10-01', lines: [{ productId: product.id, unitId: product.baseUnitId, orderedQuantity: 1, unitCost: 20 }] }).result as any;
        command('purchaseOrders', 'approve', po.id); command('purchaseOrders', 'send', po.id);
        command('goodsReceipts', 'create', { purchaseOrderId: po.id, siteId: inventorySiteRepository.getActive()[0].id, receiptDate: '2026-10-02', lines: [{ purchaseOrderLineId: po.lines[0].id, receivedQuantity: 1 }] });
        const bill = command('supplierBills', 'create', { purchaseOrderId: po.id, supplierInvoiceNumber: '8C-AP', billDate: '2026-10-03', dueDate: '2026-10-20', lines: [{ purchaseOrderLineId: po.lines[0].id, quantity: 1, unitCost: 20 }] }).result as any;
        command('supplierPayments', 'create', { supplierId: bill.supplierId, paymentDate: '2026-10-15', method: 'BANK_TRANSFER', bankAccountId: 'bank_001', operationId: '8C-payment', allocations: [{ supplierBillId: bill.id, amount: 10 }] });
        expect((host.view().repositories.supplierBills as any).supplierBills.find((b: any) => b.id === bill.id).totals.amountPaid).toBe(10);
        vi.resetModules();
        const { LocalSecurity } = await import('../../../electron/security/localSecurity');
        const { BusinessHost } = await import('../../../electron/security/businessHost');
        security = new LocalSecurity(join(root, 'security.json')); expect(security.status().session).toBeNull(); security.login(admin);
        host = new BusinessHost(join(root, 'business.json'), security); await host.initialize();
        expect((host.view().repositories.supplierBills as any).supplierBills.find((b: any) => b.id === bill.id).totals.amountPaid).toBe(10);
        expect((host.view().repositories.supplierPayments as any).supplierPayments).toHaveLength(1);
    });
});

describe('8C durable audit and failure boundaries', () => {
    it('does not execute a business mutation if the audit intent cannot be saved', () => {
        const before = readFileSync(join(root, 'business.json'), 'utf8');
        vi.spyOn(security, 'audit').mockImplementation(() => { throw new Error('audit unavailable'); });
        expect(() => command('accounts', 'create', accountInput())).toThrow(/audit unavailable/);
        expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before);
        expect((host.view().repositories.accounts as any).accounts.some((a: any) => a.code === '8999')).toBe(false);
    });
    it('rolls back repository memory if the business database commit fails', async () => {
        const before = readFileSync(join(root, 'business.json'), 'utf8');
        const storage = await import('../../../electron/security/localSecurity');
        const original = storage.atomicJson;
        vi.spyOn(storage, 'atomicJson').mockImplementation((path, value) => { if (path.endsWith('business.json')) throw new Error('business disk full'); original(path, value); });
        expect(() => command('accounts', 'create', accountInput())).toThrow(/business disk full/);
        expect(() => command('accounts', 'create', { ...accountInput(), code: '8998' })).toThrow(/blocked/);
        expect(security.pendingBusinessCommands()).toHaveLength(1);
        expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before);
        expect((host.view().repositories.accounts as any).accounts.some((a: any) => a.code === '8999')).toBe(false);
    });
    it('blocks ambiguous retries after commit and confirms the saved command on restart without replay', async () => {
        const original = security.audit.bind(security);
        vi.spyOn(security, 'audit').mockImplementation((action, resource, outcome, ...rest) => { if (action === 'accounts.create' && outcome === 'SUCCESS') throw new Error('confirmation unavailable'); original(action, resource, outcome, ...rest); });
        expect(() => command('accounts', 'create', accountInput())).toThrow(/committed/);
        expect(() => command('accounts', 'create', { ...accountInput(), code: '8998' })).toThrow(/blocked/);
        vi.restoreAllMocks(); vi.resetModules();
        const { LocalSecurity } = await import('../../../electron/security/localSecurity');
        const { BusinessHost } = await import('../../../electron/security/businessHost');
        security = new LocalSecurity(join(root, 'security.json')); security.login(admin);
        host = new BusinessHost(join(root, 'business.json'), security); await host.initialize();
        expect((host.view().repositories.accounts as any).accounts.filter((a: any) => a.code === '8999')).toHaveLength(1);
        expect(security.listAudit({ query: 'recovery.accounts.create' }).rows[0].outcome).toBe('SUCCESS');
    });
    it('records a noncommitted interrupted intent as failed without executing it', async () => {
        security.audit('accounts.create', 'never-committed', 'INTENT', 'accounting.post', 'interrupted-command');
        vi.resetModules();
        const { LocalSecurity } = await import('../../../electron/security/localSecurity');
        const { BusinessHost } = await import('../../../electron/security/businessHost');
        security = new LocalSecurity(join(root, 'security.json')); security.login(admin);
        host = new BusinessHost(join(root, 'business.json'), security); await host.initialize();
        expect(security.listAudit({ query: 'recovery.accounts.create' }).rows[0]).toMatchObject({ outcome: 'FAILED', commandId: 'interrupted-command' });
        expect((host.view().repositories.accounts as any).accounts.some((a: any) => a.code === '8999')).toBe(false);
    });
    it('does not allow legacy renderer data to overwrite an existing main-owned database', async () => {
        command('accounts', 'create', accountInput());
        vi.resetModules();
        const { LocalSecurity } = await import('../../../electron/security/localSecurity');
        const { BusinessHost } = await import('../../../electron/security/businessHost');
        security = new LocalSecurity(join(root, 'security.json')); security.login(admin);
        host = new BusinessHost(join(root, 'business.json'), security);
        await host.initialize({ 'htt:financial-snapshot:v1': '{malicious legacy replacement' });
        expect((host.view().repositories.accounts as any).accounts.some((a: any) => a.code === '8999')).toBe(true);
    });
});

describe('8C migration and actor provenance', () => {
    it('backs up legacy profile keys before migration and preserves their values', async () => {
        vi.resetModules();
        const { LocalSecurity } = await import('../../../electron/security/localSecurity');
        const { BusinessHost } = await import('../../../electron/security/businessHost');
        const directory = join(root, 'migrated');
        security = new LocalSecurity(join(directory, 'security.json')); security.setup(admin);
        const legacy = { 'htt.test.migration-marker': 'preserve-this-value' };
        host = new BusinessHost(join(directory, 'business.json'), security); await host.initialize(legacy);
        expect(JSON.parse(readFileSync(join(directory, 'legacy-profile-backup-v1.json'), 'utf8')).storage).toEqual(legacy);
        expect(JSON.parse(readFileSync(join(directory, 'business.json'), 'utf8')).storage['htt.test.migration-marker']).toBe('preserve-this-value');
    });
    it('binds a recovery review to the authenticated actor instead of the supplied operator', async () => {
        const actor = security.principal()!.userId;
        const { financialOperationJournal } = await import('../../../src/lib/persistence/financialOperationJournal');
        financialOperationJournal.begin('8C-pending-review', 'CUSTOMER_PAYMENT', 'test-identity');
        command('salesRecovery', 'recordSalesManualReview', { operationId: '8C-pending-review', reference: 'TEST-REF', operator: 'forged.operator', summary: 'Inspected synthetic test evidence', businessRecordChecked: true, originalGlChecked: true, reversalGlChecked: true, balancesChecked: true });
        expect(financialOperationJournal.list().find(row => row.operationId === '8C-pending-review')?.reviewHistory?.[0].operator).toBe(actor);
    });
});

describe('8C uncertain filesystem commit', () => {
    it('uses the saved command ID after restart when rename succeeded but sync reported failure', async () => {
        const storage = await import('../../../electron/security/localSecurity'); const original = storage.atomicJson;
        vi.spyOn(storage, 'atomicJson').mockImplementation((path, value) => { original(path, value); if (path.endsWith('business.json')) throw new Error('directory sync failed'); });
        expect(() => command('accounts', 'create', accountInput())).toThrow(/could not be confirmed/);
        expect(() => command('accounts', 'create', { ...accountInput(), code: '8998' })).toThrow(/blocked/);
        vi.restoreAllMocks(); vi.resetModules();
        const { LocalSecurity } = await import('../../../electron/security/localSecurity');
        const { BusinessHost } = await import('../../../electron/security/businessHost');
        security = new LocalSecurity(join(root, 'security.json')); security.login(admin);
        host = new BusinessHost(join(root, 'business.json'), security); await host.initialize();
        expect((host.view().repositories.accounts as any).accounts.filter((a: any) => a.code === '8999')).toHaveLength(1);
        expect(security.listAudit({ query: 'recovery.accounts.create' }).rows[0].outcome).toBe('SUCCESS');
    });
});
