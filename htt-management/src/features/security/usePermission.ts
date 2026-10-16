import { useSecurity } from './securityClient';
import { hasPermission, type Permission } from './rbac';
export function usePermission(permission: Permission) { const { session } = useSecurity(); return hasPermission(session && { userId: session.user.id, roles: session.user.roles, authenticated: true }, permission); }
