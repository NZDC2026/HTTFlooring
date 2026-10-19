import { landingFor, personalPreferenceStore } from '../settings/data/personalPreferences';
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
    if (!location.hash || location.hash === '#/' || location.hash === '#') {
        const preferences = personalPreferenceStore().get(current.session?.user.id ?? '');
        location.hash = landingFor(principal, preferences.landingPage);
    }
}
export function logout(): void {
    nativeRequest('logout'); refreshSecurity(); location.hash = '/';
}
export function useSecurity() { return useSyncExternalStore(listener => { listeners.add(listener); return () => listeners.delete(listener); }, () => status, () => status); }
