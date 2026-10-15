import type { Permission, VerifiedPrincipal } from './rbac';
export type AuditEvent = Readonly<{
  id: string; timestamp: string; actorId: string; permission: Permission;
  action: string; resourceId: string; outcome: 'ALLOWED' | 'DENIED' | 'FAILED';
}>;
export type AuditSink = (event: AuditEvent) => void;
/** Audit records must be forwarded to an append-only trusted backend sink.
 * A missing sink fails closed; renderer localStorage is not an immutable audit log.
 */
let sink: AuditSink | null = null;
let sequence = 0;
export const auditTrail = {
  connect(writer: AuditSink): () => void { sink = writer; return () => { if (sink === writer) sink = null; }; },
  disconnect(): void { sink = null; },
  record(input: { actor: VerifiedPrincipal | null; permission: Permission; action: string; resourceId: string; outcome: AuditEvent['outcome'] }): AuditEvent {
    if (!sink) throw new Error('Audit sink unavailable; privileged writes are blocked.');
    const event: AuditEvent = Object.freeze({
      id: `${Date.now()}-${++sequence}`, timestamp: new Date().toISOString(),
      actorId: input.actor?.userId ?? 'UNAUTHENTICATED', permission: input.permission,
      action: input.action, resourceId: input.resourceId, outcome: input.outcome,
    });
    sink(event); // Failure to persist blocks the caller.
    return event;
  },
};
