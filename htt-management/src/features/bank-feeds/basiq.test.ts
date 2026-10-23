import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { BasiqProvider, FeedFault, normalizeTransaction, feedExternalId, hostedConsentUrl, feedTransport } from '../../../electron/bank-feeds/basiq';
import type { FeedAccount } from './contract';
const now = Date.parse('2026-10-23T01:00:00Z');
const config = { enabled: true, apiKey: 'synthetic-key', userId: 'user-1', production: false };
const account: FeedAccount = { id: 'remote-1', connectionId: 'connection-1', institutionId: 'AU00000', name: 'Synthetic bank', masked: '•••• 1234', currency: 'AUD', lastUpdated: '2026-10-23T00:00:00Z', expiresAt: now + 86400000 };
const transaction = (patch = {}) => ({ type: 'transaction', id: 'txn-1', account: 'remote-1', status: 'posted', currency: 'AUD', description: 'Office supplies', reference: 'REF-1', amount: '-110.01', direction: 'debit', postDate: '2026-10-21T13:30:00Z', ...patch });
function response(url: string) {
    if (url.endsWith('/token')) return { access_token: 'synthetic-token', token_type: 'Bearer', expires_in: 3600 };
    if (url.endsWith('/consents')) return { type: 'list', data: [{ type: 'consent', status: 'active', expiryDate: '2027-10-23T00:00:00Z', data: { permissions: [{ scope: 'transaction.detail', consented: true }] } }] };
    if (url.endsWith('/accounts/remote-1')) return { type: 'account', id: 'remote-1', connection: 'connection-1', institution: 'AU00000', name: 'Synthetic bank', accountNo: '1234567891234', currency: 'AUD', status: 'available', lastUpdated: '2026-10-23T00:00:00Z' };
    if (url.endsWith('/connections/connection-1')) return { type: 'connection', id: 'connection-1', method: 'open-banking', status: 'active', expiryDate: '2027-10-23T00:00:00Z', accounts: { data: [{ id: 'remote-1' }] } };
    return { type: 'list', data: [transaction()] };
}
beforeEach(() => vi.stubGlobal('fetch', vi.fn(() => { throw Error('Live network forbidden'); })));
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
it('normalizes signed decimal cents and bank statement dates without using Auckland time', () => {
    expect(normalizeTransaction(transaction(), config, account, 'Australia/Sydney')).toMatchObject({ date: '2026-10-22', amount: -110.01 });
    expect(normalizeTransaction(transaction(), config, account, 'Australia/Perth')).toMatchObject({ date: '2026-10-21' });
    expect(normalizeTransaction(transaction({ postDate: '2026-10-21' }), config, account)).toMatchObject({ date: '2026-10-21' });
    expect(feedExternalId('user-1', 'remote-1', 'txn-1')).not.toBe(feedExternalId('user-2', 'remote-1', 'txn-1'));
    expect(feedExternalId('user-1', 'remote-1', 'txn-1')).not.toBe(feedExternalId('user-1', 'remote-1', 'txn-1', true));
});
it('excludes pending transactions before requiring amounts or posting dates', () => { expect(normalizeTransaction({ type: 'transaction', id: 'pending-1', account: 'remote-1', status: 'pending', amount: null, postDate: null }, config, account)).toBeNull(); });
it.each([{ amount: '1e2' }, { amount: '-1.123' }, { amount: '0' }, { amount: '110', direction: 'debit' }, { amount: '-110', direction: 'credit' }, { currency: 'USD' }, { account: 'foreign' }, { postDate: '2026-02-30' }])('fails closed for malformed or foreign transactions %j', patch => { expect(() => normalizeTransaction(transaction(patch), config, account)).toThrow(); });
it('uses raw Basic API key, short-lived in-memory bearer tokens and encoded range filters', async () => {
    const transport = vi.fn(async (url: string) => response(url)), p = new BasiqProvider(transport);
    const result = await p.transactions(config, account, '2026-10-20', '2026-10-23', now);
    expect(result.rows).toHaveLength(1); expect(transport.mock.calls.filter(c => c[0].endsWith('/token'))).toHaveLength(1);
    const tokenCall = (transport.mock.calls as unknown as [string, RequestInit][])[0]; expect(tokenCall[1].headers).toMatchObject({ Authorization: 'Basic synthetic-key', 'basiq-version': '3.0' });
    const url = transport.mock.calls.find(c => c[0].includes('/transactions?'))![0]; expect(url).toContain('limit=500'); expect(new URL(url).searchParams.get('filter')).toContain("account.id.eq('remote-1')");
    await p.transactions(config, account, '2026-10-20', '2026-10-23', now + 1000); expect(transport.mock.calls.filter(c => c[0].endsWith('/token'))).toHaveLength(1);
    await p.transactions(config, account, '2026-10-20', '2026-10-23', now + 31 * 60000); expect(transport.mock.calls.filter(c => c[0].endsWith('/token'))).toHaveLength(2);
});
it('retrieves every page before returning any transactions and deduplicates stable repeated IDs', async () => {
    const transport = vi.fn(async (url: string) => { if (!url.includes('/transactions?')) return response(url); const u = new URL(url); if (u.searchParams.has('next')) return { type: 'list', data: [transaction(), transaction({ id: 'txn-2' })] }; u.searchParams.set('next', 'cursor-1'); return { type: 'list', data: [transaction()], links: { next: u.href } }; });
    expect((await new BasiqProvider(transport).transactions(config, account, '2026-10-20', '2026-10-23', now)).rows).toHaveLength(2);
});
it.each(['https://evil.test/transactions', 'https://au-api.basiq.io/users/foreign/transactions?next=1', 'https://au-api.basiq.io/users/user-1/transactions?filter=foreign&next=1'])('rejects unsafe or scope-changing pagination %s', async next => {
    const transport = vi.fn(async (url: string) => url.includes('/transactions?') ? { type: 'list', data: [], links: { next } } : response(url));
    await expect(new BasiqProvider(transport).transactions(config, account, '2026-10-20', '2026-10-23', now)).rejects.toThrow(/PAGINATION/); expect(transport.mock.calls.some(c => c[0].startsWith('https://evil.test'))).toBe(false);
});
it('detects pagination loops and conflicting posted IDs', async () => {
    const loop = new BasiqProvider(async url => url.includes('/transactions?') ? { type: 'list', data: [], links: { next: url } } : response(url)); await expect(loop.transactions(config, account, '2026-10-20', '2026-10-23', now)).rejects.toThrow(/LOOP/);
    const conflict = new BasiqProvider(async url => url.includes('/transactions?') ? { type: 'list', data: [transaction(), transaction({ amount: '-5' })] } : response(url)); await expect(conflict.transactions(config, account, '2026-10-20', '2026-10-23', now)).rejects.toThrow(/CONFLICT/);
});
it.each(['revoked', 'expired'])('requires active consent: %s', async status => {
    const transport = vi.fn(async url => url.endsWith('/consents') ? { type: 'list', data: [{ type: 'consent', status, expiryDate: '2027-01-01', data: { permissions: [{ scope: 'transaction.detail', consented: true }] } }] } : response(url));
    await expect(new BasiqProvider(transport).transactions(config, account, '2026-10-20', '2026-10-23', now)).rejects.toThrow(/CONSENT/); expect(transport.mock.calls.some(c => c[0].includes('/transactions?'))).toBe(false);
});
it('rejects expired connections, foreign accounts and unconsented transaction scopes', async () => {
    for (const patch of [{ expiryDate: '2020-01-01' }, { accounts: { data: [{ id: 'foreign' }] } }, { method: 'web' }]) {
        const p = new BasiqProvider(async url => url.includes('/connections/') ? { ...response(url), ...patch } : response(url)); await expect(p.transactions(config, account, '2026-10-20', '2026-10-23', now)).rejects.toThrow();
    }
    const p = new BasiqProvider(async url => url.endsWith('/consents') ? { type: 'list', data: [{ type: 'consent', status: 'active', expiryDate: '2027-01-01', data: { permissions: [{ scope: 'transaction.detail', consented: false }] } }] } : response(url)); await expect(p.discover(config, now)).rejects.toThrow(/CONSENT/);
});
it('reuses existing hosted consent links and refuses unknown outcomes without fresh confirmation', async () => {
    const link = { type: 'auth_link', userId: 'user-1', expiresAt: '2026-10-24T00:00:00Z', links: { public: 'https://connect.basiq.io/synthetic' } };
    const transport = vi.fn(async url => url.endsWith('/auth_link') ? link : response(url)); expect((await new BasiqProvider(transport).authorization(config, now, true)).url).toBe(link.links.public);
    expect((transport.mock.calls as unknown as [string, RequestInit][]).every(c => c[1].method !== 'POST' || c[0].endsWith('/token'))).toBe(true);
    const missing = new BasiqProvider(async url => { if (url.endsWith('/auth_link')) throw new FeedFault('BASIQ_HTTP_404'); return response(url); }); await expect(missing.authorization(config, now, false)).rejects.toThrow(/CONFIRMATION/);
    expect(() => hostedConsentUrl('https://connect.basiq.io.evil.test/synthetic')).toThrow(); expect(() => hostedConsentUrl('file:///tmp/auth')).toThrow();
});
it('does not log HTTP error bodies and refuses redirects', async () => {
    const cancel = vi.fn(); vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429, body: { cancel } }));
    await expect(feedTransport('https://au-api.basiq.io/token', {})).rejects.toThrow('BASIQ_HTTP_429'); expect(cancel).toHaveBeenCalled(); expect(fetch).toHaveBeenCalledWith('https://au-api.basiq.io/token', expect.objectContaining({ redirect: 'error' }));
});
