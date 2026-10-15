import { auditTrail } from './auditTrail';
import { hasPermission, type Permission } from './rbac';
import { trustedAuthorization } from './trustedAuthorization';
/** Secure write boundary: permission + durable audit intent before mutation.
 * A backend must independently enforce the same permission and append-only audit.
 */
export function authorizedWrite<T>(permission: Permission, action: string, resourceId: string, write: () => T): T {
  const actor = trustedAuthorization.current();
  if (!hasPermission(actor, permission)) {
    auditTrail.record({ actor, permission, action, resourceId, outcome: 'DENIED' });
    throw new Error(`Permission denied: ${permission}`);
  }
  auditTrail.record({ actor, permission, action, resourceId, outcome: 'ALLOWED' });
  try { return write(); }
  catch (error) {
    auditTrail.record({ actor, permission, action, resourceId, outcome: 'FAILED' });
    throw error;
  }
}
