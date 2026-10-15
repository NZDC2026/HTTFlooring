import { hasPermission } from "./rbac";
import { useSyncExternalStore } from 'react';
import { hydrateBusiness, nativeRequest } from './repositoryHost';
import type { BusinessView, SecurityStatus } from './securityContract';
let status: SecurityStatus = { initialized: false, session: null };
const listeners = new Set<() => void>();
export function refreshSecurity(): SecurityStatus {
    status = nativeRequest<SecurityStatus>('status');
    listeners.forEach(listener => listener());
    return status;
}
export function enterBusiness(): void {
    const legacyStorage = Object.fromEntries(Object.keys(localStorage).filter(key => key.startsWith('htt')).map(key => [key, localStorage.getItem(key)!]));
    hydrateBusiness(nativeRequest<BusinessView>('business.bootstrap', { legacyStorage }));
    const current = refreshSecurity();
    const principal = current.session && { userId: current.session.user.id, roles: current.session.user.roles, authenticated: true as const };
    if ((!location.hash || location.hash === '#/' || location.hash === '#/dashboard') && !hasPermission(principal, 'accounting.read')) {
        location.hash = hasPermission(principal, 'sales.read') ? '/sales' : hasPermission(principal, 'purchases.read') ? '/purchases' : '/inventory';
    }
}
export function logout(): void {
    nativeRequest('logout'); refreshSecurity();
}
export function useSecurity() { return useSyncExternalStore(listener => { listeners.add(listener); return () => listeners.delete(listener); }, () => status, () => status); }
