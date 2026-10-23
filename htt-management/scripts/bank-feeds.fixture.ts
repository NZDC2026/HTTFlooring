import { it, vi } from 'vitest';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs'; import { join } from 'node:path'; import { tmpdir } from 'node:os';
it('creates an opt-in isolated E02 review fixture without provider keys or network access', async () => {
 const target = process.env.HTT_ACCEPTANCE_PROFILE; if (!target || (!target.startsWith(tmpdir()) && !target.startsWith('/private/tmp/'))) throw Error('Use a new temporary HTT_ACCEPTANCE_PROFILE.');
 const root = join(target, 'local-security'); if (existsSync(root)) throw Error('Use a fresh acceptance profile.'); mkdirSync(root, { recursive: true });
 vi.resetModules(); vi.stubGlobal('__HTT_MAIN_HOST__', true); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined);
 const { LocalSecurity } = await import('../electron/security/localSecurity'), { BusinessHost } = await import('../electron/security/businessHost');
 const security = new LocalSecurity(join(root, 'security-v1.json')); security.setup({ username: 'qa.admin', displayName: 'Synthetic E02 ADMIN', password: 'Desktop-Acceptance-4821' });
 const host = new BusinessHost(join(root, 'business-v1.json'), security); await host.initialize();
 const { FeedStore, FeedVault, feedDigest } = await import('../electron/bank-feeds/store'); const store = new FeedStore(root), vault = new FeedVault(root, { available: () => false, encrypt: () => { throw Error('No fixture credentials'); }, decrypt: () => { throw Error('No fixture credentials'); } });
 const bank = (host.view().repositories.bankAccounts as any).bankAccounts.find((b: any) => b.id === 'bank_001');
 store.change(s => {
  s.mappings.push({ id: 'synthetic-map', ownerId: security.principal()!.userId, credentialRevision: vault.revision(), providerUserId: 'synthetic-user', production: false, retired: false, remote: { id: 'synthetic-remote', connectionId: 'synthetic-connection', institutionId: 'AU00000', name: 'Synthetic Basiq QA', masked: '•••• 1234', currency: 'AUD', lastUpdated: '2026-10-23T00:00:00Z', expiresAt: Date.parse('2026-11-23T00:00:00Z') }, bankAccountId: bank.id, bankIdentity: feedDigest([bank.id, bank.accountNumber, bank.glAccountId, bank.currency, bank.openingBalance, bank.openingBalanceDate]), startDate: '2026-10-01', timeZone: 'Australia/Sydney', enabled: false, nextAt: Date.now(), lastThrough: '2026-10-23', lastSuccess: Date.now(), failures: 0, pendingCount: 1 });
  s.batches.push({ id: 'synthetic-review', mappingId: 'synthetic-map', createdAt: Date.now(), throughDate: '2026-10-23', status: 'REVIEW', rows: [{ externalId: 'basiq:synthetic-native:txn-1', date: '2026-10-22', description: 'Synthetic E02 review expense', reference: 'QA-E02', amount: -11 }], excludedIds: [], reason: '', evidence: [] });
 });
 writeFileSync(join(target, 'baseline-business.json'), JSON.stringify(host.exportBackup()));
 writeFileSync(join(target, 'acceptance-case.json'), JSON.stringify({ kind: 'E02 direct synthetic staged batch; no live provider retrieval', bankAccountId: bank.id, batchId: 'synthetic-review' })); vi.unstubAllGlobals();
}, 30000);
