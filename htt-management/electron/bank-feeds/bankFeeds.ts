import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { hasPermission } from '../../src/features/security/rbac';
import { businessDateKey, requireDateKey } from '../../src/lib/businessDate';
import { feedTimeZones, type FeedMapping, type FeedBatch, type FeedRow, type FeedView } from '../../src/features/bank-feeds/contract';
import type { LocalSecurity } from '../security/localSecurity';
import type { BusinessHost } from '../security/businessHost';
import { FeedStore, FeedVault, feedDigest } from './store';
import { BasiqProvider, FeedFault, hostedConsentUrl } from './basiq';
const id = z.string().min(1).max(200);
const fingerprint = (row: FeedRow) => feedDigest([row.date, row.amount, row.description, row.reference]);
export class BankFeeds {
    readonly store: FeedStore;
    readonly vault: FeedVault;
    private security: LocalSecurity;
    private business: BusinessHost;
    private provider: BasiqProvider;
    private now: () => number;
    private running = false;
    private blocked = '';
    private link?: { url: string; until: number; ownerId: string; revision: string };
    constructor(store: FeedStore, vault: FeedVault, security: LocalSecurity, business: BusinessHost, provider = new BasiqProvider(), now = () => Date.now()) {
        this.store = store; this.vault = vault; this.security = security; this.business = business; this.provider = provider; this.now = now;
        if (store.read().batches.some(b => b.status === 'IMPORTING')) store.change(s => { for (const b of s.batches) if (b.status === 'IMPORTING') { b.status = 'REVIEW'; b.error = 'Interrupted import. Inspect existing statement rows, then confirm the original batch; stable external IDs prevent duplicate imports.'; } });
    }
    private passive(write = false) {
        const p = this.security.principal(); if (!hasPermission(p, write ? 'banking.write' : 'banking.read')) throw new Error('Permission denied: bank feeds.'); return p!;
    }
    private snapshots(): Record<string, any> { return this.business.view().repositories; }
    private lines(): any[] { return this.snapshots().bankStatements?.lines ?? []; }
    private bank(id: string) { const bank = this.snapshots().bankAccounts?.bankAccounts.find((b: any) => b.id === id); if (!bank || !bank.active || bank.currency !== 'AUD') throw new Error('Choose an active AUD local bank account.'); return bank; }
    private identity(b: any) { return feedDigest([b.id, b.accountNumber, b.glAccountId, b.currency, b.openingBalance, b.openingBalanceDate]); }
    private today() { return businessDateKey(new Date(this.now()).toISOString()); }
    private history(action: string, resource: string) { this.store.change(s => { s.history = [...s.history.slice(-999), { at: this.now(), action, resource }]; }); }
    private audit(action: string, resource: string, outcome: 'INTENT' | 'SUCCESS' | 'FAILED') { this.security.audit('bankFeeds.' + action, resource, outcome, 'banking.write'); }
    private owned(mapping: FeedMapping) { const p = this.passive(true); if (mapping.ownerId !== p.userId) throw new Error('Only the mapping owner may process this bank feed.'); return p; }
    private mapping(id: string) { const m = this.store.read().mappings.find(m => m.id === id); if (!m) throw new Error('Bank feed mapping not found.'); return m; }
    private verifyMapping(m: FeedMapping) { const b = this.bank(m.bankAccountId); if (this.identity(b) !== m.bankIdentity) throw new Error('Local bank identity changed. Review this mapping before importing.'); if (m.credentialRevision !== this.vault.revision()) throw new Error('Provider account or credentials changed. Reconcile the original mapping before enabling it.'); }
    private restoreCheck() {
        const p = this.security.principal(), state = this.store.read(), lines = this.lines();
        for (const b of state.batches.filter(b => b.status === 'COMPLETED')) {
            const m = state.mappings.find(m => m.id === b.mappingId)!;
            if (m.ownerId !== p?.userId || !hasPermission(p, 'banking.write')) continue;
            for (const e of b.evidence) { const l = lines.find(l => l.id === e.lineId && l.bankAccountId === m.bankAccountId && l.externalId === e.externalId); if (!l || fingerprint(l) !== e.digest) throw new Error('Imported bank feed evidence is missing or changed in this business backup. Restore compatible statement evidence before continuing; do not reset the feed journal.'); }
        }
    }
    private possibleDuplicates(batch: FeedBatch) {
        const m = this.mapping(batch.mappingId), lines = this.lines();
        return batch.rows.filter(r => lines.some(l => l.bankAccountId === m.bankAccountId && l.externalId !== r.externalId && l.date === r.date && l.amount === r.amount && (l.description.trim().toLowerCase() === r.description.trim().toLowerCase() || !!r.reference && l.reference === r.reference))).map(r => r.externalId);
    }
    view(): FeedView {
        this.passive(); const state = this.store.read(); let health = this.blocked || 'Ready. Bank feeds remain inactive until configured and explicitly enabled.';
        let c = { enabled: false, apiKey: '', userId: '', production: false };
        try { c = this.vault.get(); this.restoreCheck(); } catch (error) { health = error instanceof Error ? error.message : 'Bank feed inspection failed.'; }
        const p = this.security.principal();
        return { configuration: { enabled: c.enabled, configured: !!c.apiKey && !!c.userId, userId: c.userId, production: c.production, secureStorage: this.vault.codec.available() }, accounts: state.accountsRevision === feedDigest([c.apiKey,c.userId,c.production]) ? state.accounts : [], mappings: state.mappings, batches: state.batches.map(b => ({ ...b, possibleDuplicates: b.status === 'COMPLETED' ? [] : this.possibleDuplicates(b) })), banks: (this.snapshots().bankAccounts?.bankAccounts ?? []).filter((b: any) => b.active).map((b: any) => ({ id: b.id, name: b.name, currency: b.currency, openingBalanceDate: b.openingBalanceDate })), running: this.running, health, authorizationReady: !!this.link && this.link.until > this.now() && this.link.ownerId === p?.userId && this.link.revision === feedDigest([c.apiKey,c.userId,c.production]), request: state.request?.kind };
    }
    configure(raw: unknown) {
        this.security.require('users.manage'); if (this.running) throw new Error('Wait for the running bank feed request.');
        this.security.audit('bankFeeds.configuration', 'bank-feed-vault', 'INTENT', 'users.manage'); this.vault.set(raw); this.link = undefined; this.blocked = ''; 
        this.security.audit('bankFeeds.configuration', 'bank-feed-vault', 'SUCCESS', 'users.manage'); return this.view();
    }
    request(raw: unknown) {
        const i = z.object({ kind: z.enum(['DISCOVER', 'AUTHORIZE']), confirmed: z.literal(true) }).strict().parse(raw), p = this.security.require('banking.write'), c = this.vault.get();
        if (!c.enabled || !c.apiKey || !c.userId) throw new Error('Configure and enable Basiq first.');
        if (this.running || this.store.read().request) throw new Error('A bank feed request is already pending.');
        this.blocked = ''; this.audit('request.' + i.kind, 'provider-user', 'INTENT'); this.store.change(s => { s.request = { ownerId: p.userId, kind: i.kind, attempted: false }; }); this.audit('request.' + i.kind, 'provider-user', 'SUCCESS'); return this.view();
    }
    authorizationUrl() { const p = this.passive(true); if (!this.link || this.link.until <= this.now() || this.link.ownerId !== p.userId || this.link.revision !== this.vault.revision()) throw new Error('Request a valid provider authorization link first.'); return hostedConsentUrl(this.link.url); }
    map(raw: unknown) {
        const i = z.object({ remoteId: id, bankAccountId: id, startDate: z.string(), timeZone: z.enum(feedTimeZones), confirmed: z.literal(true) }).strict().parse(raw), p = this.security.require('banking.write'), state = this.store.read(), c = this.vault.get();
        if (!c.enabled || state.accountsRevision !== this.vault.revision()) throw new Error('Discover authorized provider accounts with the current configuration first.');
        const remote = state.accounts.find(a => a.id === i.remoteId), bank = this.bank(i.bankAccountId); requireDateKey(i.startDate);
        if (!remote || remote.expiresAt <= this.now()) throw new Error('Discover a currently authorized AUD account.');
        if (i.startDate < bank.openingBalanceDate || i.startDate > this.today()) throw new Error('Start date must be between the bank opening date and today.');
        if (state.mappings.some(m => !m.retired && (m.remote.id === remote.id && m.providerUserId === c.userId && m.production === c.production || m.bankAccountId === bank.id))) throw new Error('This provider account or local bank already has a mapping. Preserve its history and review it instead.');
        const m: FeedMapping = { id: randomUUID(), ownerId: p.userId, credentialRevision: this.vault.revision(), providerUserId: c.userId, production: c.production, retired: false, remote, bankAccountId: bank.id, bankIdentity: this.identity(bank), startDate: i.startDate, timeZone: i.timeZone, enabled: true, nextAt: this.now(), failures: 0, pendingCount: 0 };
        this.audit('map', m.id, 'INTENT'); this.store.change(s => s.mappings.push(m)); this.audit('map', m.id, 'SUCCESS'); return this.view();
    }
    setEnabled(raw: unknown) {
        const i = z.object({ id, enabled: z.boolean() }).strict().parse(raw), m = this.mapping(i.id); this.security.require('banking.write'); this.owned(m); if(m.retired)throw new Error('Retired mappings retain history and cannot resume.'); if (i.enabled) { this.restoreCheck(); this.verifyMapping(m); }
        this.audit(i.enabled ? 'resume' : 'pause', m.id, 'INTENT'); this.store.change(s => { const row = s.mappings.find(x => x.id === m.id)!; row.enabled = i.enabled; row.nextAt = this.now(); row.failures = 0; }); this.audit(i.enabled ? 'resume' : 'pause', m.id, 'SUCCESS'); return this.view();
    }
    sync(raw: unknown) {
        const i = z.object({ id }).strict().parse(raw), m = this.mapping(i.id); this.security.require('banking.write'); this.owned(m); this.restoreCheck(); this.verifyMapping(m);
        if (!m.enabled) throw new Error('Resume the mapping before synchronizing.'); this.blocked=''; this.store.change(s => { s.mappings.find(x => x.id === m.id)!.nextAt = this.now(); }); return this.view();
    }
    retire(raw: unknown) {
        const i=z.object({id,confirmed:z.literal(true)}).strict().parse(raw),m=this.mapping(i.id);this.security.require('banking.write');this.owned(m);if(this.running)throw new Error('Wait for the running request.');if(this.store.read().batches.some(b=>b.mappingId===m.id&&b.status!=='COMPLETED'))throw new Error('Review all existing batches before retiring this mapping.');this.audit('retire',m.id,'INTENT');this.store.change(s=>{const row=s.mappings.find(x=>x.id===m.id)!;row.retired=true;row.enabled=false;});this.audit('retire',m.id,'SUCCESS');return this.view();
    }
    renew(raw: unknown) {
        const i=z.object({id,confirmed:z.literal(true)}).strict().parse(raw),m=this.mapping(i.id);this.security.require('banking.write');this.owned(m);this.restoreCheck();const c=this.vault.get(),state=this.store.read(),remote=state.accounts.find(a=>a.id===m.remote.id&&a.institutionId===m.remote.institutionId);if(this.running||m.retired||!c.enabled||m.providerUserId!==c.userId||m.production!==c.production||state.accountsRevision!==this.vault.revision()||!remote||remote.expiresAt<=this.now()||this.identity(this.bank(m.bankAccountId))!==m.bankIdentity)throw new Error('Renew only the same provider user, environment and local bank after current account discovery.');this.audit('renew',m.id,'INTENT');this.store.change(s=>{const row=s.mappings.find(x=>x.id===m.id)!;row.remote=remote;row.credentialRevision=this.vault.revision();row.enabled=true;row.failures=0;row.error=undefined;row.nextAt=this.now();});this.audit('renew',m.id,'SUCCESS');return this.view();
    }
    cancelRequest() {
        const p=this.security.require('banking.write'),request=this.store.read().request;if(this.running)throw new Error('Wait for the running request.');if(request&&request.ownerId!==p.userId&&!hasPermission(p,'users.manage'))throw new Error('Only the request owner or administrator may cancel.');this.store.change(s=>{s.request=undefined;});this.audit('request.cancel','provider-user','SUCCESS');return this.view();
    }
    importBatch(raw: unknown) {
        const i = z.object({ id, excludedIds: z.array(id).max(10000), reason: z.string().min(10).max(2000), confirmed: z.literal(true) }).strict().parse(raw); this.security.require('banking.write'); this.restoreCheck();
        const batch = this.store.read().batches.find(b => b.id === i.id); if (!batch) throw new Error('Feed batch not found.'); const m = this.mapping(batch.mappingId); this.owned(m); this.verifyMapping(m);
        if (batch.status === 'COMPLETED') return this.view();
        if (new Set(i.excludedIds).size !== i.excludedIds.length || i.excludedIds.some(e => !batch.rows.some(r => r.externalId === e))) throw new Error('Choose unique rows from this batch.');
        if (this.running) throw new Error('Wait for the running feed request before importing.');
        const selected = batch.rows.filter(r => !i.excludedIds.includes(r.externalId));
        this.audit('import', batch.id, 'INTENT'); this.store.change(s => { const b = s.batches.find(b => b.id === batch.id)!; b.status = 'IMPORTING'; b.excludedIds = i.excludedIds; b.reason = i.reason; b.error = undefined; });
        try {
            if (selected.length) this.business.command({ repository: 'bankStatements', method: 'importRows', args: [{ bankAccountId: m.bankAccountId, rows: selected }] });
            const current = this.lines(), evidence = selected.map(row => { const l = current.find(l => l.bankAccountId === m.bankAccountId && l.externalId === row.externalId); if (!l || fingerprint(l) !== fingerprint(row)) throw new Error('Imported statement evidence differs from the reviewed batch.'); return { externalId: row.externalId, lineId: l.id, digest: fingerprint(row) }; });
            this.store.change(s => { const b = s.batches.find(b => b.id === batch.id)!; b.status = 'COMPLETED'; b.evidence = evidence; b.error = undefined; });
            this.audit('import', batch.id, 'SUCCESS'); this.history('BATCH_IMPORTED', batch.id);
        } catch (error) {
            this.store.change(s => { const b = s.batches.find(b => b.id === batch.id)!; b.status = 'REVIEW'; b.error = 'Import requires review. Existing statement IDs, reconciled periods and source conflicts remain protected.'; }); this.audit('import', batch.id, 'FAILED'); throw error;
        }
        return this.view();
    }
    async tick() {
        if (this.running || this.blocked || !hasPermission(this.security.principal(), 'banking.write')) return;
        this.running = true;
        try {
            this.restoreCheck(); const c = this.vault.get(); if (!c.enabled || !c.apiKey || !c.userId) return;
            const owner = this.passive(true).userId, revision = this.vault.revision(), request = this.store.read().request;
            if (request && request.ownerId === owner) {
                this.store.change(s => { if (s.request) s.request.attempted = true; });
                try {
                    if (request.kind === 'AUTHORIZE') { const link = await this.provider.authorization(c, this.now(), !request.attempted); if (this.security.principal()?.userId === owner && this.vault.revision() === revision) this.link = { ...link, ownerId: owner, revision }; }
                    else { const accounts = await this.provider.discover(c, this.now()); if (this.security.principal()?.userId !== owner || this.vault.revision() !== revision) throw new FeedFault('SESSION_OR_CONFIGURATION_CHANGED'); this.store.change(s => { s.accounts = accounts; s.accountsRevision = revision; }); }
                    this.store.change(s => { s.request = undefined; }); this.history(request.kind + '_COMPLETE', 'provider-user'); this.audit(request.kind.toLowerCase(), 'provider-user', 'SUCCESS');
                } catch (error) { this.store.change(s => { s.request = undefined; }); this.history(error instanceof FeedFault ? error.code : 'PROVIDER_REQUEST_FAILED', 'provider-user'); this.audit(request.kind.toLowerCase(), 'provider-user', 'FAILED'); this.blocked = error instanceof FeedFault ? error.code : 'Bank feed request failed. Inspect configuration and try again.'; }
                return;
            }
            const m = this.store.read().mappings.find(m => !m.retired && m.enabled && m.ownerId === owner && m.nextAt <= this.now()); if (!m) return;
            try {
                this.verifyMapping(m); this.audit('sync', m.id, 'INTENT');
                const through = this.today(), overlap = m.lastThrough ? new Date(Date.parse(m.lastThrough + 'T00:00:00Z') - 7 * 86400000).toISOString().slice(0, 10) : m.startDate, from = overlap < m.startDate ? m.startDate : overlap;
                const result = await this.provider.transactions(c, m.remote, from, through, this.now(), m.timeZone);
                if (this.security.principal()?.userId !== owner || !hasPermission(this.security.principal(), 'banking.write') || this.vault.revision() !== revision || !this.mapping(m.id).enabled) throw new FeedFault('SESSION_CONFIGURATION_OR_MAPPING_CHANGED');
                this.verifyMapping(m); const currentState=this.store.read(); const sharedIds=new Set(currentState.mappings.filter(x=>x.bankAccountId===m.bankAccountId&&x.providerUserId===m.providerUserId&&x.production===m.production&&x.remote.id===m.remote.id).map(x=>x.id)); const existing = currentState.batches.filter(b => sharedIds.has(b.mappingId)).flatMap(b => b.rows), rows: FeedRow[] = [];
                for (const row of result.rows) { const prior = existing.find(r => r.externalId === row.externalId); if (prior && fingerprint(prior) !== fingerprint(row)) throw new FeedFault('POSTED_TRANSACTION_CHANGED_REVIEW_REQUIRED'); if (!prior) rows.push(row); }
                this.store.change(s => { if (rows.length) s.batches.push({ id: randomUUID(), mappingId: m.id, createdAt: this.now(), throughDate: through, status: 'REVIEW', rows, excludedIds: [], reason: '', evidence: [] }); const row = s.mappings.find(x => x.id === m.id)!; row.lastSuccess = this.now(); row.lastThrough = through; row.remote = result.account; row.pendingCount = result.pending; row.failures = 0; row.error = undefined; row.nextAt = this.now() + 15 * 60000; });
                this.audit('sync', m.id, 'SUCCESS');
            } catch (error) { this.store.change(s => { const row = s.mappings.find(x => x.id === m.id)!; row.failures++; row.error = error instanceof FeedFault ? error.code : 'Mapping, local bank or persistence requires review.'; row.nextAt = this.now() + Math.min(60000 * 2 ** Math.min(row.failures, 8), 6 * 3600000); if (row.failures >= 5 || error instanceof FeedFault && /CONSENT|CONNECTION|CHANGED|MISMATCH|ACCOUNT_UNAVAILABLE|HTTP_40[134]/.test(error.code)) row.enabled = false; }); this.audit('sync', m.id, 'FAILED'); }
        } catch (error) { this.blocked = error instanceof Error ? error.message : 'Bank feed worker stopped. Preserve the profile.'; }
        finally { this.running = false; }
    }
}
