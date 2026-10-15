import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalSecurity, atomicJson } from '../../../electron/security/localSecurity';
const credentials = { username: 'admin.test', displayName: 'Test Administrator', password: 'Test-only-long-password-4821' };
let directory: string, path: string;
beforeEach(() => { directory = mkdtempSync(join(tmpdir(), 'htt-8c-auth-')); path = join(directory, 'security.json'); });
afterEach(() => { rmSync(directory, { recursive: true, force: true }); });
describe('8C main-process local identity and audit', () => {
    it('requires one-time setup and stores salted hashes without plaintext passwords', () => {
        const security = new LocalSecurity(path);
        expect(security.status()).toEqual({ initialized: false, session: null });
        expect(security.setup(credentials).session?.user.roles).toEqual(['ADMIN']);
        expect(() => security.setup(credentials)).toThrow(/already/);
        expect(readFileSync(path, 'utf8')).not.toContain(credentials.password);
        const publicUsers = JSON.stringify(security.listUsers());
        expect(publicUsers).not.toMatch(/salt|passwordHash/);
    });
    it('requires login after a process restart and rejects incorrect passwords', () => {
        new LocalSecurity(path).setup(credentials);
        const restarted = new LocalSecurity(path);
        expect(restarted.status()).toEqual({ initialized: true, session: null });
        expect(() => restarted.login({ ...credentials, password: 'incorrect' })).toThrow(/Invalid/);
        expect(restarted.login(credentials).session?.user.username).toBe(credentials.username);
    });
    it('rejects short passwords, duplicate usernames and forged roles', () => {
        const security = new LocalSecurity(path);
        expect(() => security.setup({ ...credentials, password: 'short' })).toThrow(/12/);
        security.setup(credentials);
        expect(() => security.createUser({ ...credentials, roles: ['ADMIN'] })).toThrow(/exists/);
        expect(() => security.createUser({ ...credentials, username: 'forged.user', roles: ['SUPERUSER' as 'ADMIN'] })).toThrow(/valid role/);
    });
    it('persists lockout so restart does not reset repeated login failures', () => {
        let now = 1000;
        const security = new LocalSecurity(path, atomicJson, () => now);
        security.setup(credentials);
        for (let i = 0; i < 5; i++) expect(() => security.login({ ...credentials, password: 'incorrect' })).toThrow(/Invalid/);
        const restarted = new LocalSecurity(path, atomicJson, () => now);
        expect(() => restarted.login(credentials)).toThrow(/Too many/);
        now += 61_000;
        expect(restarted.login(credentials).session).not.toBeNull();
    });
    it('expires inactive sessions and does not accept renderer-supplied roles', () => {
        let now = 1000;
        const security = new LocalSecurity(path, atomicJson, () => now);
        security.setup(credentials);
        const sales = security.createUser({ username: 'sales.test', displayName: 'Sales', password: credentials.password, roles: ['SALES'] });
        security.login({ username: sales.username, password: credentials.password });
        expect(() => security.require('accounting.post')).toThrow(/Permission denied/);
        now += 31 * 60_000;
        expect(security.principal()).toBeNull();
        expect(() => security.require('sales.write')).toThrow(/Permission denied/);
    });
    it('protects the last active administrator', () => {
        const security = new LocalSecurity(path); security.setup(credentials);
        const admin = security.listUsers()[0];
        expect(() => security.updateUser({ id: admin.id, active: false, roles: ['ADMIN'] })).toThrow(/last active/);
        expect(() => security.updateUser({ id: admin.id, active: true, roles: ['SALES'] })).toThrow(/last active/);
    });
    it('applies role changes and account disabling on subsequent authenticated requests', () => {
        const security = new LocalSecurity(path); security.setup(credentials);
        const user = security.createUser({ username: 'auditor.test', displayName: 'Auditor', password: credentials.password, roles: ['AUDITOR'] });
        security.updateUser({ id: user.id, active: true, roles: ['SALES'] });
        security.login({ username: user.username, password: credentials.password });
        expect(security.require('sales.write').roles).toEqual(['SALES']);
        expect(() => security.listUsers()).toThrow(/Permission denied/);
        security.login(credentials); security.updateUser({ id: user.id, active: false, roles: ['SALES'] });
        expect(() => security.login({ username: user.username, password: credentials.password })).toThrow(/Invalid/);
    });
    it('records the actual actor and keeps credentials out of audit records', () => {
        const security = new LocalSecurity(path); const session = security.setup(credentials).session!;
        const audit = security.listAudit();
        expect(audit.rows.some(row => row.actorId === session.user.id && row.action === 'session.login')).toBe(true);
        expect(JSON.stringify(audit)).not.toContain(credentials.password);
        expect(JSON.stringify(audit)).not.toContain('passwordHash');
    });
    it('fails closed on audit or user database tampering', () => {
        const security = new LocalSecurity(path); security.setup(credentials);
        const data = JSON.parse(readFileSync(path, 'utf8'));
        data.audit[0].actorId = 'forged'; writeFileSync(path, JSON.stringify(data));
        expect(() => new LocalSecurity(path)).toThrow(/integrity/);
        writeFileSync(path, '{broken'); expect(() => new LocalSecurity(path)).toThrow();
    });
    it('blocks privileged work when durable audit persistence fails', () => {
        let fail = false;
        const security = new LocalSecurity(path, (file, data) => { if (fail) throw new Error('disk full'); atomicJson(file, data); });
        security.setup(credentials); fail = true;
        expect(() => security.audit('journals.post', 'test', 'INTENT', 'accounting.post')).toThrow(/disk full/);
        expect(security.principal()).toBeNull();
        expect(() => security.createUser({ username: 'blocked.user', displayName: 'Blocked', password: credentials.password, roles: ['SALES'] })).toThrow();
    });
    it('requires the old password and revokes the session when changing it', () => {
        const security = new LocalSecurity(path); security.setup(credentials);
        expect(() => security.changePassword({ currentPassword: 'incorrect', password: 'Next-test-password-4821' })).toThrow(/incorrect/);
        security.changePassword({ currentPassword: credentials.password, password: 'Next-test-password-4821' });
        expect(security.principal()).toBeNull();
        expect(() => security.login(credentials)).toThrow(/Invalid/);
        expect(security.login({ ...credentials, password: 'Next-test-password-4821' }).session).not.toBeNull();
    });
    it('retains audit history and supports bounded searching and pagination', () => {
        const security = new LocalSecurity(path); security.setup(credentials);
        for (let i = 0; i < 6; i++) security.audit('test.operation', `resource-${i}`, 'SUCCESS');
        expect(security.listAudit({ query: 'test.operation', offset: 2, limit: 2 })).toMatchObject({ total: 6, rows: [{ resourceId: 'resource-3' }, { resourceId: 'resource-2' }] });
        security.logout(); expect(() => security.listAudit()).toThrow(/Permission denied/);
    });
});
