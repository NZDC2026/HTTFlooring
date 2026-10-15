import type { Permission, Role } from './rbac';
export type PublicUser = { id: string; username: string; displayName: string; roles: Role[]; active: boolean };
export type Session = { user: PublicUser; expiresAt: string };
export type SecurityStatus = { initialized: boolean; session: Session | null };
export type SecurityAuditRow = { id: string; timestamp: string; actorId: string; action: string; permission?: Permission; resourceId: string; outcome: 'INTENT' | 'SUCCESS' | 'DENIED' | 'FAILED'; commandId?: string; previousHash: string; hash: string };
export type RepositorySnapshots = Record<string, unknown>;
export type BusinessView = { repositories: RepositorySnapshots; storage: Record<string, string> };
export type SecurityReply<T = unknown> = { ok: true; value: T } | { ok: false; error: string };
export interface SecurityBridge {
    request(action: string, input?: unknown): SecurityReply;
}
declare global { interface Window { securityBridge?: SecurityBridge } }
