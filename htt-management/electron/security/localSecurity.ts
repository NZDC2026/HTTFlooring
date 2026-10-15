import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, openSync, closeSync, fsyncSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { hasPermission, roles, type Permission, type Role, type VerifiedPrincipal } from '../../src/features/security/rbac';
import type { PublicUser, SecurityAuditRow, SecurityStatus, Session } from '../../src/features/security/securityContract';
type StoredUser = PublicUser & { salt: string; passwordHash: string; failures: number; lockedUntil: number };
type State = { schemaVersion: 1; auditKey: string; users: StoredUser[]; audit: SecurityAuditRow[] };
export function atomicJson(path: string, value: unknown): void {
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    const temporary = `${path}.${randomUUID()}.tmp`;
    const fd = openSync(temporary, 'wx', 0o600);
    try { writeFileSync(fd, JSON.stringify(value)); fsyncSync(fd); } finally { closeSync(fd); }
    renameSync(temporary, path);
    const directory = openSync(dirname(path), 'r');
    try { fsyncSync(directory); } finally { closeSync(directory); }
}
const publicUser = ({ id, username, displayName, roles: userRoles, active }: StoredUser): PublicUser => ({ id, username, displayName, roles: [...userRoles], active });
function username(value: unknown): string {
    if (typeof value !== 'string' || !/^[a-z0-9][a-z0-9._-]{2,63}$/.test(value.trim().toLowerCase())) throw new Error('Username must contain 3–64 letters, numbers, dots, underscores or hyphens.');
    return value.trim().toLowerCase();
}
function password(value: unknown): string {
    if (typeof value !== 'string' || value.length < 12 || value.length > 256) throw new Error('Password must contain 12–256 characters.');
    return value;
}
function roleList(value: unknown): Role[] {
    if (!Array.isArray(value) || !value.length || !value.every(role => roles.includes(role))) throw new Error('Choose at least one valid role.');
    return [...new Set(value)] as Role[];
}
const hashPassword = (value: string, salt: string) => scryptSync(value, salt, 64).toString('hex');
export class LocalSecurity {
    private state: State;
    private session: { userId: string; idleUntil: number; absoluteUntil: number } | null = null;
    private poisoned = false;
    private path: string;
    private save: (path: string, state: unknown) => void;
    private now: () => number;
    constructor(path: string, save: (path: string, state: unknown) => void = atomicJson, now = () => Date.now()) {
        this.path = path; this.save = save; this.now = now;
        if (existsSync(path)) {
            const value = JSON.parse(readFileSync(path, 'utf8')) as State;
            if (value?.schemaVersion !== 1 || !/^[a-f0-9]{64}$/.test(value.auditKey) || !Array.isArray(value.users) || !Array.isArray(value.audit)) throw new Error('Invalid local security database; access blocked.');
            const ids = new Set<string>(), names = new Set<string>();
            for (const user of value.users) {
                if (!user.id || ids.has(user.id) || names.has(user.username) || username(user.username) !== user.username || typeof user.displayName !== 'string' || typeof user.active !== 'boolean' || !Number.isFinite(user.failures) || !Number.isFinite(user.lockedUntil) || !/^[a-f0-9]{32}$/.test(user.salt) || !/^[a-f0-9]{128}$/.test(user.passwordHash)) throw new Error('Invalid local user data; access blocked.');
                roleList(user.roles); ids.add(user.id); names.add(user.username);
            }
            if (value.users.length && !value.users.some(user => user.active && user.roles.includes('ADMIN'))) throw new Error('No active administrator; access blocked.');
            let previousHash = '';
            for (const row of value.audit) {
                const { hash, ...event } = row;
                if (row.previousHash !== previousHash || hash !== createHmac('sha256', value.auditKey).update(JSON.stringify(event)).digest('hex')) throw new Error('Local audit integrity check failed; access blocked.');
                previousHash = hash;
            }
            this.state = value;
        } else this.state = { schemaVersion: 1, auditKey: randomBytes(32).toString('hex'), users: [], audit: [] };
    }
    private commit(next: State): void {
        if (this.poisoned) throw new Error('Security storage is unavailable; restart and review required.');
        try { this.save(this.path, next); this.state = next; }
        catch (error) { this.poisoned = true; this.session = null; throw error; }
    }
    audit(action: string, resourceId: string, outcome: SecurityAuditRow['outcome'], permission?: Permission, commandId?: string, actorId = this.principal()?.userId ?? 'UNAUTHENTICATED'): void {
        const event = { id: randomUUID(), timestamp: new Date(this.now()).toISOString(), actorId, action, permission, resourceId, outcome, commandId, previousHash: this.state.audit.at(-1)?.hash ?? '' };
        // JSON normalisation also removes optional undefined properties before signing.
        const normalized = JSON.parse(JSON.stringify(event)) as Omit<SecurityAuditRow, 'hash'>;
        const row = { ...normalized, hash: createHmac('sha256', this.state.auditKey).update(JSON.stringify(normalized)).digest('hex') };
        this.commit({ ...this.state, audit: [...this.state.audit, row] });
    }
    principal(): VerifiedPrincipal | null {
        if (this.poisoned || !this.session) return null;
        const now = this.now();
        const user = this.state.users.find(row => row.id === this.session!.userId);
        if (now >= this.session.idleUntil || now >= this.session.absoluteUntil || !user?.active) { this.session = null; return null; }
        return { userId: user.id, roles: [...user.roles], authenticated: true };
    }
    require(permission: Permission): VerifiedPrincipal {
        const actor = this.principal();
        if (!hasPermission(actor, permission)) { this.audit('permission.denied', permission, 'DENIED', permission); throw new Error(`Permission denied: ${permission}`); }
        this.session!.idleUntil = Math.min(this.now() + 30 * 60_000, this.session!.absoluteUntil);
        return actor!;
    }
    status(): SecurityStatus {
        const actor = this.principal();
        const user = actor && this.state.users.find(row => row.id === actor.userId);
        const session: Session | null = user ? { user: publicUser(user), expiresAt: new Date(Math.min(this.session!.idleUntil, this.session!.absoluteUntil)).toISOString() } : null;
        return { initialized: this.state.users.length > 0, session };
    }
    setup(input: { username: string; displayName: string; password: string }): SecurityStatus {
        if (this.state.users.length) throw new Error('An administrator is already configured.');
        this.addUser(input, ['ADMIN']);
        return this.login(input);
    }
    private addUser(input: { username: string; displayName: string; password: string }, userRoles: Role[]): PublicUser {
        const name = username(input.username), secret = password(input.password);
        if (!input.displayName?.trim() || input.displayName.trim().length > 100) throw new Error('Display name is required (maximum 100 characters).');
        if (this.state.users.some(user => user.username === name)) throw new Error('Username already exists.');
        const salt = randomBytes(16).toString('hex');
        const user: StoredUser = { id: randomUUID(), username: name, displayName: input.displayName.trim(), roles: roleList(userRoles), active: true, salt, passwordHash: hashPassword(secret, salt), failures: 0, lockedUntil: 0 };
        this.commit({ ...this.state, users: [...this.state.users, user] });
        this.audit('user.created', user.id, 'SUCCESS', 'users.manage', undefined, this.principal()?.userId ?? user.id);
        return publicUser(user);
    }
    login(input: { username: string; password: string }): SecurityStatus {
        this.session = null;
        const name = username(input.username);
        if (typeof input.password !== 'string' || input.password.length > 256) throw new Error('Invalid username or password.');
        const user = this.state.users.find(row => row.username === name);
        if (user && user.lockedUntil > this.now()) throw new Error('Too many login attempts; try again later.');
        const actual = Buffer.from(hashPassword(input.password, user?.salt ?? 'unavailable-account'), 'hex');
        const expected = user ? Buffer.from(user.passwordHash, 'hex') : Buffer.alloc(64);
        if (!user?.active || !timingSafeEqual(actual, expected)) {
            if (user) this.commit({ ...this.state, users: this.state.users.map(row => row.id === user.id ? { ...row, failures: row.failures + 1, lockedUntil: row.failures + 1 >= 5 ? this.now() + 60_000 : 0 } : row) });
            this.audit('session.login', name, 'DENIED');
            throw new Error('Invalid username or password.');
        }
        this.commit({ ...this.state, users: this.state.users.map(row => row.id === user.id ? { ...row, failures: 0, lockedUntil: 0 } : row) });
        this.audit('session.login', user.id, 'SUCCESS', undefined, undefined, user.id);
        this.session = { userId: user.id, idleUntil: this.now() + 30 * 60_000, absoluteUntil: this.now() + 8 * 60 * 60_000 };
        return this.status();
    }
    logout(): SecurityStatus { this.audit('session.logout', this.principal()?.userId ?? '', 'SUCCESS'); this.session = null; return this.status(); }
    listUsers(): PublicUser[] { this.require('users.manage'); return this.state.users.map(publicUser); }
    createUser(input: { username: string; displayName: string; password: string; roles: Role[] }): PublicUser { this.require('users.manage'); return this.addUser(input, input.roles); }
    updateUser(input: { id: string; roles: Role[]; active: boolean }): void {
        const actor = this.require('users.manage');
        const userRoles = roleList(input.roles);
        if (typeof input.active !== 'boolean' || !this.state.users.some(user => user.id === input.id)) throw new Error('User was not found or active flag is invalid.');
        const users = this.state.users.map(user => user.id === input.id ? { ...user, roles: userRoles, active: input.active } : user);
        if (!users.some(user => user.active && user.roles.includes('ADMIN'))) throw new Error('The last active administrator cannot be disabled or demoted.');
        this.audit('user.updated', input.id, 'INTENT', 'users.manage');
        this.commit({ ...this.state, users });
        this.audit('user.updated', input.id, 'SUCCESS', 'users.manage', undefined, actor.userId);
    }
    changePassword(input: { currentPassword: string; password: string }): void {
        const actor = this.principal(); if (!actor) throw new Error('Login required.');
        const user = this.state.users.find(row => row.id === actor.userId)!;
        if (typeof input.currentPassword !== 'string' || input.currentPassword.length > 256 || !timingSafeEqual(Buffer.from(hashPassword(input.currentPassword, user.salt), 'hex'), Buffer.from(user.passwordHash, 'hex'))) throw new Error('Current password is incorrect.');
        const nextPassword = password(input.password), salt = randomBytes(16).toString('hex');
        this.audit('user.password', user.id, 'INTENT');
        this.commit({ ...this.state, users: this.state.users.map(row => row.id === user.id ? { ...row, salt, passwordHash: hashPassword(nextPassword, salt) } : row) });
        this.audit('user.password', user.id, 'SUCCESS'); this.session = null;
    }
    pendingBusinessCommands(): SecurityAuditRow[] {
        const completed = new Set(this.state.audit.filter(row => row.commandId && (row.outcome === 'SUCCESS' || row.outcome === 'FAILED')).map(row => row.commandId));
        return this.state.audit.filter(row => row.commandId && row.outcome === 'INTENT' && !completed.has(row.commandId)).map(row => ({ ...row }));
    }
    listAudit(input: { offset?: number; limit?: number; query?: string } = {}): { total: number; rows: SecurityAuditRow[] } {
        this.require('audit.read');
        const offset = Math.max(0, Math.trunc(input.offset ?? 0)), limit = Math.max(1, Math.min(100, Math.trunc(input.limit ?? 50)));
        if (!Number.isFinite(offset) || !Number.isFinite(limit)) throw new Error('Invalid audit pagination.');
        const query = String(input.query ?? '').toLowerCase().slice(0, 200);
        const rows = this.state.audit.filter(row => !query || `${row.actorId} ${row.action} ${row.resourceId} ${row.outcome} ${row.commandId ?? ""}`.toLowerCase().includes(query));
        return { total: rows.length, rows: [...rows].reverse().slice(offset, offset + limit) };
    }
}
