import { z } from 'zod';
import { createHash } from 'node:crypto';
import { feedId, feedAccountSchema, type FeedSettings, type FeedAccount, type FeedRow } from '../../src/features/bank-feeds/contract';
import { requireDateKey } from '../../src/lib/businessDate';
export class FeedFault extends Error {
    readonly code: string;
    constructor(code: string) { super(code); this.code = code; }
}
export type FeedTransport = (url: string, init: RequestInit) => Promise<unknown>;
export const feedTransport: FeedTransport = async (url, init) => {
    let response: Response;
    try { response = await fetch(url, { ...init, redirect: 'error', signal: AbortSignal.timeout(20000) }); }
    catch { throw new FeedFault('NETWORK_UNAVAILABLE'); }
    if (!response.ok) { await response.body?.cancel(); throw new FeedFault('BASIQ_HTTP_' + response.status); }
    try {
        const reader = response.body?.getReader(); if (!reader) throw Error();
        const parts: Uint8Array[] = []; let bytes = 0;
        while (true) { const part = await reader.read(); if (part.done) break; bytes += part.value.byteLength; if (bytes > 5000000) { await reader.cancel(); throw Error(); } parts.push(part.value); }
        return JSON.parse(Buffer.concat(parts).toString('utf8'));
    } catch { throw new FeedFault('BASIQ_RESPONSE_INVALID'); }
};
const origin = 'https://au-api.basiq.io';
const account = z.object({ type: z.literal('account'), id: feedId, name: z.string().max(1000), displayName: z.string().max(1000).optional(), maskedNumber: z.string().max(200).optional(), accountNo: z.string().max(200).optional(), currency: z.string(), status: z.enum(['available', 'unavailable']), connection: feedId, institution: feedId, lastUpdated: z.string().max(100) });
const page = z.object({ type: z.literal('list'), data: z.array(z.unknown()).max(500), links: z.object({ next: z.string().nullable().optional() }).optional() });
function parsed<T>(schema: z.ZodType<T>, value: unknown): T { const result = schema.safeParse(value); if (!result.success) throw new FeedFault('BASIQ_RESPONSE_INVALID'); return result.data; }
export function hostedConsentUrl(raw: string) {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.hostname !== 'connect.basiq.io' || url.port || url.username || url.password || url.hash || !/^\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)) throw new FeedFault('CONSENT_URL_UNTRUSTED');
    return url.href;
}
export function feedExternalId(userId: string, accountId: string, transactionId: string, production = false) {
    return 'basiq:' + createHash('sha256').update(JSON.stringify([userId, accountId, production])).digest('hex').slice(0, 32) + ':' + transactionId;
}
export function normalizeTransaction(raw: unknown, settings: FeedSettings, selected: FeedAccount, timeZone = 'Australia/Sydney'): FeedRow | null {
    const basic = parsed(z.object({ type: z.literal('transaction'), id: feedId, account: feedId, status: z.enum(['pending', 'posted']) }), raw);
    if (basic.account !== selected.id) throw new FeedFault('TRANSACTION_ACCOUNT_MISMATCH');
    if (basic.status === 'pending') return null;
    const row = parsed(z.object({ id: feedId, account: feedId, status: z.literal('posted'), currency: z.literal('AUD'), description: z.string().trim().min(1).max(1000), reference: z.string().max(500).nullable().optional(), amount: z.string().regex(/^-?\d{1,9}(?:\.\d{1,2})?$/), direction: z.enum(['debit', 'credit']), postDate: z.string().regex(/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/) }), raw);
    const date = row.postDate.length === 10 ? row.postDate : new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(row.postDate)); requireDateKey(date, 'Provider posting date');
    if (row.postDate.length > 10 && !Number.isFinite(Date.parse(row.postDate))) throw new FeedFault('TRANSACTION_DATE_INVALID');
    const negative = row.amount.startsWith('-'), [whole, fraction = ''] = row.amount.replace('-', '').split('.');
    const cents = Number(BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0')));
    if (!Number.isSafeInteger(cents) || cents === 0 || (row.direction === 'debit') !== negative) throw new FeedFault('TRANSACTION_AMOUNT_OR_DIRECTION_INVALID');
    return { externalId: feedExternalId(settings.userId, selected.id, row.id, settings.production), date, description: row.description, reference: row.reference ?? '', amount: (negative ? -cents : cents) / 100 };
}
export class BasiqProvider {
    private transport: FeedTransport;
    private token?: { revision: string; value: string; until: number };
    constructor(transport: FeedTransport = feedTransport) { this.transport = transport; }
    private revision(c: FeedSettings) { return createHash('sha256').update(JSON.stringify([c.apiKey, c.userId, c.production])).digest('hex'); }
    private async access(c: FeedSettings, now: number) {
        const revision = this.revision(c);
        if (this.token?.revision === revision && this.token.until > now) return this.token.value;
        const token = parsed(z.object({ access_token: z.string().min(1).max(20000), token_type: z.literal('Bearer'), expires_in: z.number().int().min(60).max(86400) }), await this.transport(origin + '/token', { method: 'POST', headers: { Authorization: 'Basic ' + c.apiKey, 'basiq-version': '3.0', 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'scope=SERVER_ACCESS' }));
        this.token = { revision, value: token.access_token, until: now + Math.min(token.expires_in - 60, 1800) * 1000 };
        return token.access_token;
    }
    private async request(path: string, c: FeedSettings, now: number, method = 'GET', body?: string) {
        const token = await this.access(c, now);
        try { return await this.transport(origin + path, { method, headers: { Authorization: 'Bearer ' + token, 'basiq-version': '3.0', ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body } : {}) }); }
        catch (error) { if (error instanceof FeedFault && ['BASIQ_HTTP_401', 'BASIQ_HTTP_403'].includes(error.code)) this.token = undefined; throw error; }
    }
    private root(c: FeedSettings) { return '/users/' + feedId.parse(c.userId); }
    private async list(path: string, c: FeedSettings, now: number) {
        const seen = new Set<string>(), rows: unknown[] = []; let next: string | undefined = path;
        while (next) {
            if (seen.has(next) || seen.size >= 20) throw new FeedFault('PAGINATION_LOOP_OR_LIMIT'); seen.add(next);
            const response: z.infer<typeof page> = parsed(page, await this.request(next, c, now)); rows.push(...response.data);
            const link: string | null | undefined = response.links?.next;
            if (!link) { next = undefined; continue; }
            const url: URL = new URL(link, origin);
            if (url.origin !== origin || url.username || url.password || url.hash || url.pathname !== path.split('?')[0] || url.searchParams.get('filter') !== new URL(origin+path).searchParams.get('filter')) throw new FeedFault('PAGINATION_LINK_UNTRUSTED');
            next = url.pathname + url.search;
        }
        return rows;
    }
    async consent(c: FeedSettings, now: number) {
        const rows = await this.list(this.root(c) + '/consents', c, now);
        const consents = rows.map(row => parsed(z.object({ type: z.literal('consent'), status: z.enum(['active', 'revoked', 'expired']), expiryDate: z.string(), data: z.object({ permissions: z.array(z.object({ scope: z.string(), consented: z.boolean().optional() })) }) }), row));
        if (!consents.some(row => row.status === 'active' && Date.parse(row.expiryDate) > now && row.data.permissions.some(p => p.scope === 'transaction.detail' && p.consented === true))) throw new FeedFault('CONSENT_EXPIRED_REVOKED_OR_MISSING');
    }
    async validateAccount(c: FeedSettings, id: string, now: number): Promise<FeedAccount> {
        const a = parsed(account, await this.request(this.root(c) + '/accounts/' + feedId.parse(id), c, now));
        if (a.id !== id || a.currency !== 'AUD' || a.status !== 'available') throw new FeedFault('ACCOUNT_UNAVAILABLE_OR_CURRENCY');
        const connection = parsed(z.object({ type: z.literal('connection'), id: feedId, method: z.literal('open-banking'), status: z.literal('active'), expiryDate: z.string(), accounts: z.object({ data: z.array(z.object({ id: feedId })) }) }), await this.request(this.root(c) + '/connections/' + a.connection, c, now));
        const expiresAt = Date.parse(connection.expiryDate);
        if (connection.id !== a.connection || !(expiresAt > now) || !connection.accounts.data.some(row => row.id === id)) throw new FeedFault('CONNECTION_EXPIRED_OR_ACCOUNT_MISMATCH');
        const number = a.maskedNumber ?? a.accountNo ?? '';
        return feedAccountSchema.parse({ id: a.id, connectionId: a.connection, institutionId: a.institution, name: a.displayName || a.name, masked: number ? '•••• ' + number.slice(-4) : 'Not supplied', currency: 'AUD', lastUpdated: a.lastUpdated, expiresAt });
    }
    async discover(c: FeedSettings, now: number) {
        await this.consent(c, now);
        const rows = await this.list(this.root(c) + '/accounts', c, now), result: FeedAccount[] = [];
        for (const raw of rows) { const a = parsed(account, raw); if (a.currency !== 'AUD' || a.status !== 'available') continue; result.push(await this.validateAccount(c, a.id, now)); }
        if (new Set(result.map(a => a.id)).size !== result.length) throw new FeedFault('DUPLICATE_PROVIDER_ACCOUNT');
        return result;
    }
    async transactions(c: FeedSettings, selected: FeedAccount, from: string, through: string, now: number, timeZone = 'Australia/Sydney') {
        requireDateKey(from); requireDateKey(through); await this.consent(c, now);
        const current = await this.validateAccount(c, selected.id, now);
        if (current.connectionId !== selected.connectionId || current.institutionId !== selected.institutionId) throw new FeedFault('CONNECTION_CHANGED_REMAP_REQUIRED');
        const lower = new Date(Date.parse(from+'T00:00:00Z')-86400000).toISOString().slice(0,10), upper = new Date(Date.parse(through+'T00:00:00Z')+86400000).toISOString().slice(0,10);
        const filter = `account.id.eq('${selected.id}'),transaction.postDate.gteq('${lower}'),transaction.postDate.lteq('${upper}T23:59:59.999Z')`;
        const raws = await this.list(this.root(c) + '/transactions?limit=500&filter=' + encodeURIComponent(filter), c, now), rows: FeedRow[] = []; let pending = 0;
        for (const raw of raws) { const row = normalizeTransaction(raw, c, selected, timeZone); if (!row) { pending++; continue; } if (row.date < from || row.date > through) continue; const prior = rows.find(r => r.externalId === row.externalId); if (prior && JSON.stringify(prior) !== JSON.stringify(row)) throw new FeedFault('DUPLICATE_TRANSACTION_CONFLICT'); if (!prior) rows.push(row); }
        return { rows, pending, account: current };
    }
    async authorization(c: FeedSettings, now: number, allowCreate: boolean) {
        let raw: unknown;
        try { raw = await this.request(this.root(c) + '/auth_link', c, now); }
        catch (error) { if (!(error instanceof FeedFault) || !['BASIQ_HTTP_404', 'BASIQ_HTTP_410'].includes(error.code)) throw error; if (!allowCreate) throw new FeedFault('AUTH_LINK_RETRY_REQUIRES_CONFIRMATION'); }
        if (raw) { const current = parsed(z.object({ expiresAt: z.string() }), raw); if (!(Date.parse(current.expiresAt) > now)) raw = undefined; }
        if (!raw) { if (!allowCreate) throw new FeedFault('AUTH_LINK_RETRY_REQUIRES_CONFIRMATION'); raw = await this.request(this.root(c) + '/auth_link', c, now, 'POST', '{}'); }
        const link = parsed(z.object({ type: z.literal('auth_link'), userId: feedId, expiresAt: z.string(), links: z.object({ public: z.string() }) }), raw);
        if (link.userId !== c.userId || !(Date.parse(link.expiresAt) > now)) throw new FeedFault('AUTH_LINK_EVIDENCE_INVALID');
        return { url: hostedConsentUrl(link.links.public), until: Date.parse(link.expiresAt) };
    }
}
