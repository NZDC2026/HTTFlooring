import { dirname, join } from "node:path";
import { existsSync, readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { hasPermission } from '../../src/features/security/rbac';
import { resolveCommand, restoreRepositories, snapshotForPrincipal, snapshotRepositories } from '../../src/features/security/repositoryHost';
import type { BusinessView } from '../../src/features/security/securityContract';
import { LocalSecurity, atomicJson } from './localSecurity';
type Database = { schemaVersion: 1; storage: Record<string, string>; repositories: Record<string, unknown>; lastCommandId?: string };
export class BusinessHost {
    private values: Record<string, string> = {};
    private initialized = false;
    private blocked = false;
    private lastCommandId?: string;
    private path: string;
    private security: LocalSecurity;
    constructor(path: string, security: LocalSecurity) { this.path = path; this.security = security; }
    async initialize(legacy: Record<string, string> = {}): Promise<void> {
        if (this.initialized) return;
        if (!this.security.principal()) throw new Error('Login required.');
        let saved: Database | undefined;
        if (existsSync(this.path)) {
            saved = JSON.parse(readFileSync(this.path, 'utf8')) as Database;
            if (saved?.schemaVersion !== 1 || !saved.storage || !saved.repositories || typeof saved.storage !== 'object' || Array.isArray(saved.storage) || !Object.values(saved.storage).every(value => typeof value === 'string')) throw new Error('Invalid business database; writes blocked.');
            this.values = saved.storage;
        } else {
            this.security.require('users.manage');
            if (!legacy || typeof legacy !== 'object' || Object.keys(legacy).length > 1000) throw new Error('Invalid legacy local data.');
            for (const [key, value] of Object.entries(legacy)) {
                if (!key.startsWith('htt') || typeof value !== 'string' || value.length > 50_000_000) throw new Error('Invalid legacy local data.');
            }
            const backup = join(dirname(this.path), 'legacy-profile-backup-v1.json');
            if (!existsSync(backup)) atomicJson(backup, { schemaVersion: 1, capturedAt: new Date().toISOString(), storage: legacy });
            this.values = { ...legacy };
            this.security.audit('business.import', 'local-desktop-profile', 'INTENT', 'users.manage');
        }
        const store: Storage = {
            get length() { return Object.keys(thisHost.values).length; },
            key: index => Object.keys(this.values)[index] ?? null,
            getItem: key => this.values[key] ?? null,
            setItem: (key, value) => { this.values[key] = String(value); },
            removeItem: key => { delete this.values[key]; },
            clear: () => { this.values = {}; },
        };
        const thisHost = this;
        Object.defineProperty(globalThis, '__HTT_MAIN_HOST__', { configurable: true, value: true });
        Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store });
        Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: store } });
        const engine = await import('./businessEngine');
        if (saved) {
            const shape = snapshotRepositories();
            const keys = Object.keys(shape).sort();
            if (JSON.stringify(Object.keys(saved.repositories).sort()) !== JSON.stringify(keys)) throw new Error('Business repository schema mismatch; migration required.');
            for (const key of keys) {
                const expected = shape[key], actual = saved.repositories[key];
                if (Array.isArray(expected) ? !Array.isArray(actual) : !actual || typeof actual !== 'object' || Object.keys(expected as object).some(field => !Array.isArray((actual as Record<string, unknown>)[field]))) throw new Error(`Invalid ${key} snapshot; writes blocked.`);
            }
            restoreRepositories(saved.repositories);
            this.lastCommandId = saved.lastCommandId;
        }
        engine.initialize(() => this.security.principal());
        if (!saved) {
            this.persist();
            this.security.audit('business.import', 'local-desktop-profile', 'SUCCESS', 'users.manage');
        }
        for (const pending of this.security.pendingBusinessCommands()) {
            this.security.audit(`recovery.${pending.action}`, pending.resourceId, pending.commandId === this.lastCommandId ? 'SUCCESS' : 'FAILED', pending.permission, pending.commandId);
        }
        this.initialized = true;
    }
    private persist(commandId = this.lastCommandId): void {
        atomicJson(this.path, { schemaVersion: 1, storage: this.values, repositories: snapshotRepositories(), lastCommandId: commandId } satisfies Database);
        this.lastCommandId = commandId;
    }
    view(): BusinessView {
        const principal = this.security.principal(); if (!principal || !this.initialized) throw new Error('Login and desktop data initialization required.');
        const storage = hasPermission(principal, 'audit.read') ? Object.fromEntries(Object.entries(this.values).filter(([key]) => key === 'htt:financial-operations:v1' || key.startsWith('htt.purchasePosting.'))) : {};
        return { repositories: snapshotForPrincipal(principal), storage };
    }
    command(input: { repository: string; method: string; args: unknown[] }): { result: unknown; view: BusinessView } {
        if (this.blocked || !this.initialized) throw new Error('Business writes blocked; restart and inspect local audit.');
        if (!input || typeof input.repository !== 'string' || typeof input.method !== 'string' || !Array.isArray(input.args) || input.args.length > 20) throw new Error('Invalid business command.');
        let command: ReturnType<typeof resolveCommand>;
        try { command = resolveCommand(input.repository, input.method); }
        catch (error) { this.security.audit('command.denied', `${input.repository}.${input.method}`.slice(0, 200), 'DENIED'); throw error; }
        const actor = this.security.require(command.permission);
        const args = structuredClone(input.args);
        // System GL sources can only be posted/reversed by their owning business services.
        if (input.repository === 'journals') {
            const first = args[0] as Record<string, unknown>;
            if (input.method === 'post' && (first?.sourceType !== 'MANUAL_JOURNAL' || first.sourceId)) throw new Error('System journals must be posted through their business source.');
            if (input.method === 'reverse') {
                const state = snapshotRepositories().journals as { journalEntries: { id: string; sourceType: string }[] };
                const original = state.journalEntries.find(entry => entry.id === first?.journalEntryId);
                if (original?.sourceType !== 'MANUAL_JOURNAL') throw new Error('System journals must be reversed through their business source.');
            }
        }
        if (input.repository === 'salesRecovery' && args[0] && typeof args[0] === 'object') {
            const request = args[0] as Record<string, unknown>;
            if (input.method === 'recordSalesManualReview') request.operator = actor.userId;
            if (input.method === 'closeVerifiedSalesReview') request.approver = actor.userId;
        }
        const commandId = randomUUID(), action = `${input.repository}.${input.method}`;
        const resource = typeof args[0] === 'string' ? args[0].slice(0, 200) : String((args[0] as Record<string, unknown>)?.id ?? (args[0] as Record<string, unknown>)?.invoiceId ?? input.repository).slice(0, 200);
        this.security.audit(action, resource, 'INTENT', command.permission, commandId);
        const before = snapshotRepositories(), storedBefore = structuredClone(this.values);
        let result: unknown;
        try {
            result = command.execute(args);
            if (result instanceof Promise) throw new Error('Business commands must be synchronous.');
        } catch (error) {
            this.values = storedBefore; restoreRepositories(before);
            this.security.audit(action, resource, 'FAILED', command.permission, commandId);
            throw error;
        }
        try { this.persist(commandId); }
        catch (error) {
            // A rename may have succeeded before the directory sync failed. Preserve the
            // durable intent and stop all further writes until restart inspects commandId.
            this.values = storedBefore; restoreRepositories(before); this.blocked = true;
            throw new Error(`Business commit ${commandId} could not be confirmed: ${error instanceof Error ? error.message : String(error)}. Restart and review before retry.`);
        }
        try { this.security.audit(action, resource, 'SUCCESS', command.permission, commandId); }
        catch { this.blocked = true; throw new Error(`Business command ${commandId} committed, but final audit confirmation failed. Do not repeat it; restart and review.`); }
        return { result, view: this.view() };
    }
}
