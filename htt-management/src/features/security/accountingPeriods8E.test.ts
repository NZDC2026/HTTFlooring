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

function loginRole(role: Role) {
    security.login(admin);
    const user = security.createUser({ username: `test.${role.toLowerCase()}`, displayName: role, password: admin.password, roles: [role] });
    security.login({ username: user.username, password: admin.password }); return user;
}
function createPeriod(startDate = '2026-09-01', endDate = '2026-09-30') { return command('accountingPeriods', 'create', { name: startDate.slice(0, 7), startDate, endDate, reason: 'Configure accounting period for acceptance' }).result as any; }
async function restart() {
    vi.resetModules(); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined);
    const { LocalSecurity } = await import('../../../electron/security/localSecurity');
    const { BusinessHost } = await import('../../../electron/security/businessHost');
    security = new LocalSecurity(join(root, 'security.json')); security.login(admin);
    host = new BusinessHost(join(root, 'business.json'), security); await host.initialize();
}
const reason = 'Acceptance reviewed all evidence';
function manual(date: string) {
    const accounts = (host.view().repositories.accounts as any).accounts.filter((a: any) => a.active && a.allowManualPosting && ['EXPENSE', 'REVENUE'].includes(a.type));
    return command('journals', 'post', { journalDate: date, description: '8E journal acceptance', sourceType: 'MANUAL_JOURNAL', lines: [{ accountId: accounts[0].id, debit: 10, credit: 0 }, { accountId: accounts[1].id, debit: 0, credit: 10 }] }).result as any;
}
describe('8E trusted accounting period lifecycle', () => {
    it('runs close checks on the real initialized business data', () => {
        const period = createPeriod(); const result = command('accountingPeriods', 'preflight', period.id).result as any;
        expect(result).toMatchObject({ debit: expect.any(Number), credit: expect.any(Number), journalCount: expect.any(Number) });
        expect(result.blockers).toEqual([]);
    });
    it('closes, blocks closed dates, reopens with actual actors and retains history over restart', async () => {
        const user = security.principal()!.userId, period = createPeriod();
        manual('2026-09-15'); command('accountingPeriods', 'close', { id: period.id, reason, actor: 'forged' });
        const before = readFileSync(join(root, 'business.json'), 'utf8');
        expect(() => manual('2026-09-30')).toThrow(/closed/); expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before);
        command('accountingPeriods', 'reopen', { id: period.id, reason, actor: 'forged' }); manual('2026-09-30'); await restart();
        const rows = (host.view().repositories.accountingPeriods as any).periods;
        expect(rows[0].history.map((h: any) => h.action)).toEqual(['CREATE', 'CLOSE', 'REOPEN']);
        expect(rows[0].history.every((h: any) => h.actor === user)).toBe(true);
    });
    it('rejects overlap, invalid dates and short reasons without changing saved state', () => {
        createPeriod(); const before = readFileSync(join(root, 'business.json'), 'utf8');
        expect(() => createPeriod('2026-09-30', '2026-10-31')).toThrow(/overlap/);
        expect(() => createPeriod('2026-02-30', '2026-03-31')).toThrow(/valid/);
        expect(() => command('accountingPeriods', 'create', { name: 'Invalid', startDate: '2026-10-01', endDate: '2026-10-31', reason: 'short' })).toThrow(/reason/);
        expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before);
    });
    it('requires sequential close and reverse sequential reopen', async () => {
        const first = createPeriod(), second = createPeriod('2026-10-01', '2026-10-31');
        expect(() => command('accountingPeriods', 'close', { id: second.id, reason })).toThrow(/earlier/);
        command('accountingPeriods', 'close', { id: first.id, reason });
        vi.useFakeTimers(); vi.setSystemTime(new Date('2026-12-01T00:00:00.000Z')); security.login(admin);
        const { calculateBankRegister } = await import('../banking/data/bankRegisterService');
        const state = host.view().repositories as any;
        for (const bank of state.bankAccounts.bankAccounts) {
            const register = calculateBankRegister(bank, state.journals.journalEntries, second.endDate);
            command('bankReconciliations', 'complete', { bankAccountId: bank.id, statementDate: second.endDate, statementBalance: register.closingBalance, clearedTransactionIds: register.transactions.map(t => t.id) });
        }
        command('accountingPeriods', 'close', { id: second.id, reason });
        expect(() => command('accountingPeriods', 'reopen', { id: first.id, reason })).toThrow(/later/);
        command('accountingPeriods', 'reopen', { id: second.id, reason }); command('accountingPeriods', 'reopen', { id: first.id, reason });
    });
    it('blocks dates outside configured periods and dates before the last close, including gaps', () => {
        const p = createPeriod(); createPeriod('2026-11-01', '2026-11-30');
        expect(() => manual('2026-10-10')).toThrow(/No open/);
        command('accountingPeriods', 'close', { id: p.id, reason });
        expect(() => manual('2026-08-01')).toThrow(/closed/);
        expect(() => createPeriod('2026-08-01', '2026-08-31')).toThrow(/Reopen/);
    });
    it.each(['ACCOUNTANT', 'SALES', 'WAREHOUSE', 'PURCHASING', 'AUDITOR'] as Role[])('denies %s direct close/reopen/create requests', role => {
        const p = createPeriod(); loginRole(role);
        expect(() => command('accountingPeriods', 'close', { id: p.id, reason })).toThrow(/Permission/);
        expect(() => command('accountingPeriods', 'reopen', { id: p.id, reason })).toThrow(/Permission/);
        expect(() => createPeriod('2026-10-01', '2026-10-31')).toThrow(/Permission/);
    });
    it('allows finance administrators and gives auditors read-only close checks', () => {
        loginRole('FINANCE_ADMIN'); const p = createPeriod(); command('accountingPeriods', 'close', { id: p.id, reason }); command('accountingPeriods', 'reopen', { id: p.id, reason });
        loginRole('AUDITOR'); expect((command('accountingPeriods', 'preflight', p.id).result as any).blockers).toEqual([]);
    });
    it('blocks future/current periods from closing', () => {
        const p = createPeriod('2099-01-01', '2099-01-31');
        expect(() => command('accountingPeriods', 'close', { id: p.id, reason })).toThrow(/ended/);
    });
});
describe('8E upgrade and failure durability', () => {
    it('upgrades an actual v2-shaped snapshot and preserves the original backup', async () => {
        const { createHash } = await import('node:crypto'), file = join(root, 'business.json');
        const saved = JSON.parse(readFileSync(file, 'utf8')); delete saved.repositories.accountingPeriods;
        const body = { schemaVersion: 2, savedAt: saved.savedAt, storage: saved.storage, repositories: saved.repositories, ...(saved.lastCommandId ? { lastCommandId: saved.lastCommandId } : {}) };
        const v2 = { ...body, checksum: createHash('sha256').update(JSON.stringify(body)).digest('hex') }; writeFileSync(file, JSON.stringify(v2));
        await restart(); expect((host.view().repositories.accountingPeriods as any).periods).toEqual([]);
        const backups = readdirSync(root).filter(name => name.startsWith('pre-migration-v2-')); expect(backups).toHaveLength(1);
        expect(JSON.parse(readFileSync(join(root, backups[0]), 'utf8'))).toEqual(v2); expect(JSON.parse(readFileSync(file, 'utf8')).schemaVersion).toBe(10);
    });
    it('rolls back the closed flag and history if the business commit fails', async () => {
        const p = createPeriod(), before = readFileSync(join(root, 'business.json'), 'utf8');
        const storage = await import('../../../electron/security/localSecurity'), original = storage.atomicJson;
        vi.spyOn(storage, 'atomicJson').mockImplementation((path, value) => { if (path.endsWith('business.json')) throw new Error('period storage full'); original(path, value); });
        expect(() => command('accountingPeriods', 'close', { id: p.id, reason })).toThrow(/could not be confirmed/);
        expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before); expect((host.view().repositories.accountingPeriods as any).periods[0].status).toBe('OPEN');
        vi.restoreAllMocks(); await restart(); expect((host.view().repositories.accountingPeriods as any).periods[0].history).toHaveLength(1);
    });
    it('restores period locks through business backup and preserves security audit', async () => {
        const p = createPeriod(); command('accountingPeriods', 'close', { id: p.id, reason }); const backup = host.exportBackup();
        command('accountingPeriods', 'reopen', { id: p.id, reason }); const preview = host.prepareRestore(JSON.stringify(backup)); await host.restoreBackup(preview.token); await restart();
        expect(() => manual('2026-09-30')).toThrow(/closed/);
        expect(security.listAudit({ query: 'accountingPeriods.reopen' }).rows.some(row => row.outcome === 'SUCCESS')).toBe(true);
    });
});
describe('8E close blockers and cross-module posting enforcement', () => {
    it('blocks pending financial operations and recomputes close checks after resolution', async () => {
        const p = createPeriod(), { financialOperationJournal } = await import('../../../src/lib/persistence/financialOperationJournal');
        financialOperationJournal.begin('8E-unresolved', 'CUSTOMER_PAYMENT', 'pending-identity');
        const check = command('accountingPeriods', 'preflight', p.id).result as any;
        expect(check.blockers.some((b: any) => b.code === 'UNRESOLVED_OPERATION')).toBe(true);
        expect(() => command('accountingPeriods', 'close', { id: p.id, reason, checks: { blockers: [] } })).toThrow(/Resolve financial/);
    });
    it('blocks unresolved purchase postings', async () => {
        const p = createPeriod(), { purchasePostingOperationRepository } = await import('../purchases/data/purchasePostingOperationRepository');
        purchasePostingOperationRepository.begin('GOODS_RECEIPT', 'missing-receipt');
        expect(() => command('accountingPeriods', 'close', { id: p.id, reason })).toThrow(/Resolve purchase/);
    });
    it('blocks AR control differences and unbalanced journal evidence', async () => {
        const p = createPeriod();
        const { snapshotRepositories, restoreRepositories } = await import('./repositoryHost');
        const state = snapshotRepositories() as any;
        const ar = state.accounts.accounts.find((a: any) => a.systemRole === 'ACCOUNTS_RECEIVABLE'), other = state.accounts.accounts.find((a: any) => a.id !== ar.id && a.allowManualPosting);
        state.journals.journalEntries.push({ id: 'damaged-journal', journalNumber: 'DAMAGED', journalDate: '2026-09-10', sourceType: 'MANUAL_JOURNAL', status: 'POSTED', totalDebit: 10, totalCredit: 10, lines: [{ id: 'one', accountId: ar.id, debit: 10, credit: 0 }, { id: 'two', accountId: other.id, debit: 0, credit: 9 }] }); restoreRepositories(state);
        const check = command('accountingPeriods', 'preflight', p.id).result as any;
        expect(check.blockers.some((b: any) => b.code === 'UNBALANCED_JOURNAL')).toBe(true); expect(check.blockers.some((b: any) => b.code === 'AR_DIFFERENCE')).toBe(true);
        expect(() => command('accountingPeriods', 'close', { id: p.id, reason })).toThrow(/cannot close/);
    });
    it('blocks bank activity without completed reconciliation through period end', () => {
        const p = createPeriod(), accounts = (host.view().repositories.accounts as any).accounts;
        const expense = accounts.find((a: any) => a.type === 'EXPENSE' && a.allowManualPosting);
        command('bankTransactions', 'createTransaction', { bankAccountId: 'bank_001', transactionDate: '2026-09-15', direction: 'MONEY_OUT', amount: 10, offsetAccountId: expense.id, description: '8E bank fee' });
        const check = command('accountingPeriods', 'preflight', p.id).result as any; expect(check.blockers.some((b: any) => b.code === 'BANK_NOT_RECONCILED')).toBe(true);
        expect(() => command('accountingPeriods', 'close', { id: p.id, reason })).toThrow(/Reconcile/);
    });
    it.each([
        ['bankTransactions', 'createTransaction', 'transactionDate'], ['bankTransactions', 'createTransfer', 'transferDate'],
        ['goodsReceipts', 'create', 'receiptDate'], ['supplierBills', 'create', 'billDate'], ['supplierPayments', 'create', 'paymentDate'],
        ['supplierCredits', 'create', 'creditDate'], ['fulfilments', 'create', 'fulfilmentDate'], ['sales', 'recordInvoicePayment', 'paymentDate'], ['sales', 'applyCreditToInvoice', 'allocationDate'],
    ])('rejects closed-period %s.%s before any business mutation', (repository, method, key) => {
        const p = createPeriod(); command('accountingPeriods', 'close', { id: p.id, reason }); const before = readFileSync(join(root, 'business.json'), 'utf8');
        expect(() => command(repository, method, { [key]: '2026-09-30' })).toThrow(/closed/); expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before);
    });
    it('allows a current-period reversing journal for an older closed-period journal', () => {
        const p = createPeriod(); createPeriod('2026-10-01', '2026-10-31');
        const original = manual('2026-09-10'); command('accountingPeriods', 'close', { id: p.id, reason });
        expect(() => command('journals', 'reverse', { journalEntryId: original.id, reversalDate: '2026-09-30', reason })).toThrow(/closed/);
        expect(command('journals', 'reverse', { journalEntryId: original.id, reversalDate: '2026-10-01', reason }).result).toMatchObject({ journalDate: '2026-10-01' });
    });
});
describe('8E real purchasing and fulfilment period boundary', () => {
    it('rejects real receipt, bill, payment and fulfilment dates in a closed period and commits the open-period flow', async () => {
        vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-16T00:00:00.000Z')); security.login(admin);
        const closed = createPeriod(); createPeriod('2026-10-01', '2026-10-31'); command('accountingPeriods', 'close', { id: closed.id, reason });
        const { mockProducts } = await import('../inventory/data/mockProducts'), { supplierRepository } = await import('../contacts/data/supplierRepository'), { inventorySiteRepository } = await import('../inventory/data/inventorySiteRepository');
        const product = mockProducts[0], siteId = inventorySiteRepository.getActive()[0].id;
        const po = command('purchaseOrders', 'create', { supplierId: supplierRepository.getAll()[0].id, orderDate: '2026-09-20', lines: [{ productId: product.id, unitId: product.baseUnitId, orderedQuantity: 5, unitCost: 20 }] }).result as any;
        command('purchaseOrders', 'approve', po.id); command('purchaseOrders', 'send', po.id);
        const receipt = { purchaseOrderId: po.id, siteId, receiptDate: '2026-09-30', lines: [{ purchaseOrderLineId: po.lines[0].id, receivedQuantity: 5 }] };
        const original = readFileSync(join(root, 'business.json'), 'utf8'); expect(() => command('goodsReceipts', 'create', receipt)).toThrow(/closed/); expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(original);
        command('goodsReceipts', 'create', { ...receipt, receiptDate: '2026-10-01' });
        const billInput = { purchaseOrderId: po.id, supplierInvoiceNumber: '8E-AP', billDate: '2026-09-30', dueDate: '2026-10-31', lines: [{ purchaseOrderLineId: po.lines[0].id, quantity: 5, unitCost: 20 }] };
        expect(() => command('supplierBills', 'create', billInput)).toThrow(/closed/);
        const bill = command('supplierBills', 'create', { ...billInput, billDate: '2026-10-02' }).result as any;
        const payment = { supplierId: bill.supplierId, paymentDate: '2026-09-30', method: 'BANK_TRANSFER', bankAccountId: 'bank_001', operationId: '8E-AP-payment', allocations: [{ supplierBillId: bill.id, amount: 50 }] };
        expect(() => command('supplierPayments', 'create', payment)).toThrow(/closed/); command('supplierPayments', 'create', { ...payment, paymentDate: '2026-10-16' });
        const quote = command('sales', 'createQuote', { customerId: 'cus_001', documentDate: '2026-09-20', lines: [{ productId: product.id, unitId: product.baseUnitId, quantity: 1, unitPrice: 40 }] }).result as any;
        command('sales', 'sendQuote', quote.id); command('sales', 'acceptQuote', quote.id);
        const order = command('sales', 'convertQuoteToOrder', quote.id).result as any;
        const fulfil = { salesOrderId: order.id, siteId, fulfilmentDate: '2026-09-30', lines: [{ salesOrderLineId: order.lines[0].id, fulfilledQuantity: 1 }] };
        expect(() => command('fulfilments', 'create', fulfil)).toThrow(/closed/); command('fulfilments', 'create', { ...fulfil, fulfilmentDate: '2026-10-03' });
        expect(command('sales', 'createInvoiceFromOrder', order.id).result).toMatchObject({ documentDate: '2026-10-16' });
        const snapshot = host.view(); await restart(); expect(host.view()).toEqual(snapshot);
        expect(security.listAudit({ query: 'period.denied' }).total).toBe(4);
    });
});
