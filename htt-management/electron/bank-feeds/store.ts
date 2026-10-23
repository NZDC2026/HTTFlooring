import {requireDateKey} from '../../src/lib/businessDate';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { atomicJson } from '../security/localSecurity';
import type { SecretCodec } from '../integrations/localIntegrationStore';
import { feedSettingsSchema, feedStateSchema, type FeedSettings, type FeedState } from '../../src/features/bank-feeds/contract';
export const feedDigest = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
function validateFeedState(state: FeedState) {
    if(new Set(state.mappings.map(m=>m.id)).size!==state.mappings.length||new Set(state.batches.map(b=>b.id)).size!==state.batches.length)throw new Error('Duplicate feed journal identities.');
    for(const m of state.mappings){requireDateKey(m.startDate);if(m.lastThrough)requireDateKey(m.lastThrough);if(m.retired&&m.enabled)throw new Error('Retired mapping cannot be active.');}
    for(const b of state.batches){
        requireDateKey(b.throughDate);const rows=new Map(b.rows.map(r=>[r.externalId,r]));
        if(!state.mappings.some(m=>m.id===b.mappingId)||rows.size!==b.rows.length||new Set(b.excludedIds).size!==b.excludedIds.length||new Set(b.evidence.map(e=>e.externalId)).size!==b.evidence.length||b.excludedIds.some(e=>!rows.has(e)))throw new Error('Invalid feed batch identities.');
        for(const r of b.rows)requireDateKey(r.date);
        for(const e of b.evidence){const r=rows.get(e.externalId);if(!r||b.excludedIds.includes(e.externalId)||e.digest!==feedDigest([r.date,r.amount,r.description,r.reference]))throw new Error('Invalid feed import proof.');}
        if(b.status==='COMPLETED'&&b.evidence.length!==b.rows.length-b.excludedIds.length)throw new Error('Incomplete feed import proof.');
    }
}
export class FeedStore {
    readonly path: string;
    private state: FeedState;
    constructor(directory: string) {
        this.path = join(directory, 'bank-feed-journal-v1.json');
        if (existsSync(this.path)) {
            try {
                const raw = readFileSync(this.path, 'utf8'); if (Buffer.byteLength(raw) > 55000000) throw Error();
                const { checksum, ...data } = JSON.parse(raw); if (checksum !== feedDigest(data)) throw Error();
                this.state = feedStateSchema.parse(data);
                validateFeedState(this.state);
            } catch { throw new Error('Bank feed journal is invalid. Preserve the full desktop profile; do not reset it to import again.'); }
        } else { this.state = { version: 1, mappings: [], accounts: [], accountsRevision: '', batches: [], history: [] }; this.save(this.state); }
    }
    read() { return structuredClone(this.state); }
    private save(value: FeedState) {
        const state = feedStateSchema.parse(value); validateFeedState(state);
        if (Buffer.byteLength(JSON.stringify(state)) > 50000000) throw new Error('Bank feed journal quota reached. Preserve the full profile before archiving.');
        atomicJson(this.path, { ...state, checksum: feedDigest(state) }); this.state = structuredClone(state);
    }
    change(fn: (state: FeedState) => void) { const state = this.read(); fn(state); this.save(state); }
}
export class FeedVault {
    readonly path: string;
    readonly codec: SecretCodec;
    constructor(directory: string, codec: SecretCodec) { this.path = join(directory, 'bank-feed-secrets-v1.json'); this.codec = codec; }
    get(): FeedSettings {
        if (!existsSync(this.path)) return { enabled: false, apiKey: '', userId: '', production: false };
        if (!this.codec.available()) throw new Error('OS protected credential storage is unavailable.');
        try {
            const raw = JSON.parse(readFileSync(this.path, 'utf8')); if (raw.version !== 1 || typeof raw.cipher !== 'string') throw Error();
            return feedSettingsSchema.parse(JSON.parse(this.codec.decrypt(Buffer.from(raw.cipher, 'base64'))));
        } catch { throw new Error('Bank feed credentials cannot be decrypted. Reconfigure locally; preserve the feed journal.'); }
    }
    set(raw: unknown) {
        if (!this.codec.available()) throw new Error('OS protected credential storage is unavailable.');
        const result = feedSettingsSchema.safeParse(raw); if (!result.success) throw new Error('Invalid bank feed settings.');
        const next = result.data; let old: FeedSettings | undefined;
        try { old = this.get(); } catch { if (next.enabled && !next.apiKey) throw new Error('Enter a fresh key to replace unreadable bank feed credentials.'); }
        next.apiKey = next.apiKey || old?.apiKey || '';
        if (next.apiKey && /\s/.test(next.apiKey)) throw new Error('Use the Basiq API key exactly as issued, without spaces.');
        if (next.enabled && (!next.apiKey || !next.userId)) throw new Error('Configure a Basiq API key and provisioned user ID before enabling.');
        atomicJson(this.path, { version: 1, cipher: this.codec.encrypt(JSON.stringify(next)).toString('base64') });
    }
    revision() { const c = this.get(); return feedDigest([c.apiKey, c.userId, c.production]); }
}
