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
function invoice() { const { product, customer } = fixture(); const q = command('sales', 'createQuote', { customerId: customer.id, documentDate: date(), lines: [{ productId: product.id, unitId: product.baseUnitId, quantity: 2, unitPrice: 100 }] }); command('sales', 'sendQuote', q.id); command('sales', 'acceptQuote', q.id); const o = command('sales', 'convertQuoteToOrder', q.id); return command('sales', 'createInvoiceFromOrder', o.id); }

function seal(b: any) { delete b.checksum; b.checksum = createHash('sha256').update(JSON.stringify(b)).digest('hex'); return JSON.stringify(b); }
function imported(amount = 30) { command('bankStatements', 'importRows', { bankAccountId: 'bank_001', rows: [{ date: date(), description: 'Verified statement transaction', amount, externalId: crypto.randomUUID() }] }); return state('bankStatements').lines.at(-1); }
function matchedReceipt() { const i = invoice(), receipt = command('customerSettlements', 'recordReceipt', { operationId: crypto.randomUUID(), customerId: i.customerId, paymentDate: date(), bankAccountId: 'bank_001', allocations: [{ invoiceId: i.id, amount: 30 }] }), l = imported(); const candidate = command('bankStatements', 'candidates', { bankAccountId: 'bank_001', asOfDate: date() }).find((c: any) => c.sourceId === receipt.paymentIds[0]); command('bankStatements', 'match', { id: l.id, ledgerIds: [candidate.id] }); return { receipt, line: state('bankStatements').lines.at(-1), candidate }; }
it('locks a matched receipt source until it is explicitly unmatched, without partial reversal', () => {
    const { receipt, line } = matchedReceipt(), before = readFileSync(join(root, 'business.json'), 'utf8');
    expect(() => command('customerSettlements', 'reverseReceipt', { id: receipt.id, reason: 'Correct matched receipt' })).toThrow(/Unmatch/); expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before); expect(state('customerSettlements').receipts[0].status).toBe('POSTED');
    command('bankStatements', 'revert', { id: line.id, reversalDate: date(), reason: 'Release bank match for correction' }); command('customerSettlements', 'reverseReceipt', { id: receipt.id, reason: 'Correct matched receipt' }); expect(state('customerSettlements').receipts[0].status).toBe('REVERSED'); expect(host.exportBackup()).toBeTruthy();
});
it('loads an old stale match for repair, rejects reconciliation, and allows unmatching it', async () => {
    const { receipt, line } = matchedReceipt(); command('bankStatements', 'revert', { id: line.id, reversalDate: date(), reason: 'Release before reversal' }); command('customerSettlements', 'reverseReceipt', { id: receipt.id, reason: 'Legacy receipt correction' });
    const backup = host.exportBackup() as any; backup.repositories.bankStatements.lines[0] = line; const prepared = host.prepareRestore(seal(backup)); await host.restoreBackup(prepared.token); await restart();
    expect(() => command('bankStatements', 'reconcile', { bankAccountId: 'bank_001', statementDate: date(), statementBalance: 30 })).toThrow(/stale/);
    command('bankStatements', 'revert', { id: line.id, reversalDate: date(), reason: 'Repair old stale bank match' }); expect(state('bankStatements').lines[0].status).toBe('UNMATCHED'); expect(host.exportBackup()).toBeTruthy();
});
it('rejects altered import identities, non-cent values, missing banks, invalid dates and hidden ledger links', () => {
    imported(); const backup = host.exportBackup();
    for (const mutate of [(l: any) => l.key = 'wrong-key', (l: any) => l.amount = 30.001, (l: any) => l.amount = 0, (l: any) => l.bankAccountId = 'missing', (l: any) => l.date = '2026-02-30', (l: any) => l.ledgerIds = ['hidden-link'], (l: any) => l.history = [], (l: any) => l.history[0].date = 'invalid']) {
        const b = structuredClone(backup) as any; mutate(b.repositories.bankStatements.lines[0]); expect(() => host.prepareRestore(seal(b))).toThrow(/statement|record/i);
    }
});
it('rejects reused ledger links, a wrong matched amount and ledger entries from another bank', () => {
    const { line } = matchedReceipt(), backup = host.exportBackup();
    for (const mutate of [(rows: any[]) => { const copy = structuredClone(rows[0]); copy.id = crypto.randomUUID(); copy.externalId = crypto.randomUUID(); copy.key = JSON.stringify([copy.bankAccountId, copy.externalId]); rows.push(copy); }, (rows: any[]) => rows[0].amount = 31, (rows: any[]) => { rows[0].bankAccountId = 'bank_002'; rows[0].key = JSON.stringify(['bank_002', line.externalId]); }]) {
        const b = structuredClone(backup) as any; mutate(b.repositories.bankStatements.lines); expect(() => host.prepareRestore(seal(b))).toThrow(/statement/i);
    }
});
it('keeps valid categorisation cycles recoverable and rejects a wrong source journal or fingerprint', async () => {
    const l = imported(-11), accountId = state('accounts').accounts.find((a: any) => a.systemRole === 'OPERATING_EXPENSE').id, input = { id: l.id, splits: [{ accountId, amount: 11, taxCode: 'GST' }] };
    command('bankStatements', 'post', input); command('bankStatements', 'revert', { id: l.id, reversalDate: date(), reason: 'Correct category' }); command('bankStatements', 'post', input); const backup = host.exportBackup();
    for (const mutate of [(r: any) => r.journalEntryId = 'missing', (r: any) => r.fingerprint = 'broken', (r: any) => r.history[1].action = 'Matched']) { const b = structuredClone(backup) as any; mutate(b.repositories.bankStatements.lines[0]); expect(() => host.prepareRestore(seal(b))).toThrow(/statement/i); }
    await restart(); expect(state('bankStatements').lines[0].status).toBe('POSTED'); expect(host.prepareRestore(JSON.stringify(host.exportBackup())).token).toBeTruthy();
});
it('rejects categorisation after the unused bank opening date changes while retaining an exclusion recovery path', () => {
    const gl = command('accounts', 'create', { code: '1199', name: 'Isolated statement bank', type: 'ASSET', active: true, allowManualPosting: false });
    const b = command('bankAccounts', 'save', { name: 'Unused bank', bankName: 'Acceptance', accountNumber: 'Test-only', accountType: 'TRANSACTION', currency: 'AUD', glAccountId: gl.id, openingBalanceDate: '2026-10-01', active: true });
    command('bankStatements', 'importRows', { bankAccountId: b.id, rows: [{ date: '2026-10-10', description: 'Earlier imported line', amount: -11 }] }); const l = state('bankStatements').lines[0];
    command('bankAccounts', 'save', { id: b.id, name: b.name, bankName: b.bankName, accountNumber: b.accountNumber, accountType: b.accountType, currency: b.currency, glAccountId: b.glAccountId, openingBalanceDate: '2026-10-11', active: b.active }, b.updatedAt);
    const accountId = state('accounts').accounts.find((a: any) => a.systemRole === 'OPERATING_EXPENSE').id; expect(() => command('bankStatements', 'post', { id: l.id, splits: [{ accountId, amount: 11, taxCode: 'GST' }] })).toThrow(/opening date/); command('bankStatements', 'ignore', { id: l.id, reason: 'Outside revised bank opening period' }); expect(host.exportBackup()).toBeTruthy();
});
