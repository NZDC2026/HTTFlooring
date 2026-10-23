import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs'; import { join } from 'node:path'; import { tmpdir } from 'node:os';
let root: string, security: any, host: any, service: any, store: any, vault: any, provider: any;
const now = Date.parse('2026-10-23T01:00:00Z'), admin = { username: 'e02.admin', displayName: 'E02 acceptance', password: 'E02-acceptance-password-4821' };
const cmd = (repository: string, method: string, ...args: any[]) => host.command({ repository, method, args }).result;
const state = (key: string) => host.view().repositories[key];
const remote = { id: 'remote-1', connectionId: 'connection-1', institutionId: 'AU00000', name: 'Synthetic bank', masked: '•••• 1234', currency: 'AUD', lastUpdated: '2026-10-23T00:00:00Z', expiresAt: now + 86400000 };
const row = { externalId: 'basiq:synthetic:txn-1', date: '2026-10-20', description: 'Synthetic bank expense', reference: 'E02-TEST', amount: -110 };
async function init(restart = false) {
 vi.resetModules(); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined); vi.stubGlobal('__HTT_MAIN_HOST__', true);
 const { LocalSecurity } = await import('../../../electron/security/localSecurity'), { BusinessHost } = await import('../../../electron/security/businessHost');
 security = new LocalSecurity(join(root, 'security.json')); restart ? security.login(admin) : security.setup(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize();
 const { FeedStore, FeedVault } = await import('../../../electron/bank-feeds/store'), { BankFeeds } = await import('../../../electron/bank-feeds/bankFeeds');
 store = new FeedStore(root); vault = new FeedVault(root, { available: () => true, encrypt: (v: string) => Buffer.from(v), decrypt: (v: Buffer) => v.toString() }); if (!restart) vault.set({ enabled: true, apiKey: 'synthetic-key', userId: 'user-1', production: false });
 service = new BankFeeds(store, vault, security, host, provider, () => now);
}
beforeEach(async () => { root = mkdtempSync(join(tmpdir(), 'htt-e02-business-')); provider = { discover: vi.fn().mockResolvedValue([remote]), transactions: vi.fn().mockResolvedValue({ rows: [row], pending: 0, account: remote }) }; await init(); vi.stubGlobal('fetch', vi.fn(() => { throw Error('Live network forbidden'); })); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); rmSync(root, { recursive: true, force: true }); });
async function batch() { service.request({ kind: 'DISCOVER', confirmed: true }); await service.tick(); service.map({ remoteId: remote.id, bankAccountId: 'bank_001', startDate: '2026-10-01', timeZone: 'Australia/Sydney', confirmed: true }); await service.tick(); return store.read().batches[0]; }
const input = (id: string) => ({ id, excludedIds: [], reason: 'Verified synthetic bank statement evidence', confirmed: true });
it('imports through the real business host, retains audit and leaves posting to the existing bank workbench', async () => {
 const before = readFileSync(join(root, 'business.json'), 'utf8'), b = await batch(); expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before);
 const journals = state('journals').journalEntries.length; service.importBatch(input(b.id)); const line = state('bankStatements').lines.find((l: any) => l.externalId === row.externalId); expect(line).toMatchObject({ status: 'UNMATCHED', amount: -110 }); expect(state('journals').journalEntries).toHaveLength(journals); expect(security.listAudit({ query: 'bankFeeds.import' }).rows.some((a: any) => a.outcome === 'SUCCESS')).toBe(true);
 const expense = state('accounts').accounts.find((a: any) => a.systemRole === 'OPERATING_EXPENSE'); cmd('bankStatements', 'post', { id: line.id, splits: [{ accountId: expense.id, amount: 110, taxCode: 'GST' }] }); expect(state('journals').journalEntries).toHaveLength(journals + 1); await init(true); expect(service.view().health).not.toMatch(/missing or changed/); expect(state('bankStatements').lines.find((l: any) => l.id === line.id).status).toBe('POSTED');
});
it('preserves reconciled-period rejection and rolls back the entire reviewed import', async () => {
 const { calculateBankRegister } = await import('../banking/data/bankRegisterService'); const bank = state('bankAccounts').bankAccounts.find((b: any) => b.id === 'bank_001'), r = calculateBankRegister(bank, state('journals').journalEntries, '2026-10-21'); cmd('bankReconciliations', 'complete', { bankAccountId: bank.id, statementDate: '2026-10-21', statementBalance: r.closingBalance, clearedTransactionIds: r.transactions.map(t => t.id) });
 const b = await batch(), before = readFileSync(join(root, 'business.json'), 'utf8'); expect(() => service.importBatch(input(b.id))).toThrow(/reconciled/); expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before); expect(store.read().batches[0].status).toBe('REVIEW'); expect(state('bankStatements').lines).toEqual([]);
});
it('recovers a crash between business persistence and feed acknowledgement without importing twice', async () => {
 const b = await batch(), change = store.change.bind(store); let failed = false;
 vi.spyOn(store, 'change').mockImplementation((fn: any) => { const draft = store.read(); fn(draft); if (!failed && draft.batches.some((b: any) => b.status === 'COMPLETED')) { failed = true; throw Error('Simulated feed acknowledgement failure'); } change(fn); });
 expect(() => service.importBatch(input(b.id))).toThrow(/acknowledgement/); const lineId = state('bankStatements').lines[0].id; expect(state('bankStatements').lines).toHaveLength(1); await init(true); service.importBatch(input(b.id)); expect(state('bankStatements').lines).toHaveLength(1); expect(store.read().batches[0].evidence[0].lineId).toBe(lineId);
});
it('blocks an older business-only restore from replaying completed feed imports', async () => {
 const b = await batch(), old = readFileSync(join(root, 'business.json'), 'utf8'); service.importBatch(input(b.id)); writeFileSync(join(root, 'business.json'), old); await init(true); expect(service.view().health).toMatch(/missing or changed/); provider.transactions.mockClear(); await service.tick(); expect(provider.transactions).not.toHaveBeenCalled(); expect(state('bankStatements').lines).toEqual([]);
});
it.each(['ACCOUNTANT', 'AUDITOR', 'SALES'] as const)('enforces the main-process feed boundary for %s', async role => {
 const user = security.createUser({ username: 'e02.' + role.toLowerCase(), displayName: role, password: admin.password, roles: [role] }); security.login({ username: user.username, password: admin.password }); expect(() => service.configure({ enabled: false, apiKey: '', userId: '', production: false })).toThrow(/Permission/); expect(() => service.request({ kind: 'DISCOVER', confirmed: true })).toThrow(/Permission/); if (role === 'SALES') expect(() => service.view()).toThrow(/Permission/); else expect(service.view().configuration).not.toHaveProperty('apiKey');
});
