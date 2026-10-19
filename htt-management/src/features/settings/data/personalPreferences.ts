import { z } from 'zod';
import { hasPermission, type Permission, type VerifiedPrincipal } from '../../security/rbac';
export const landingPages: { path: string; label: string; permission?: Permission }[] = [
    { path: '', label: 'Automatic for my role' }, { path: '/workspace', label: 'Page directory' },
    { path: '/dashboard', label: 'Dashboard', permission: 'accounting.read' },
    { path: '/sales', label: 'Sales', permission: 'sales.read' },
    { path: '/purchases', label: 'Purchases', permission: 'purchases.read' },
    { path: '/inventory', label: 'Inventory', permission: 'inventory.read' },
    { path: '/banking', label: 'Banking', permission: 'banking.read' },
    { path: '/payroll', label: 'Payroll', permission: 'payroll.read' }, { path: '/documents', label: 'Documents' },
];
export const preferenceSchema = z.object({ version: z.literal(1), landingPage: z.enum(['', '/workspace', '/dashboard', '/sales', '/purchases', '/inventory', '/banking', '/payroll', '/documents']), density: z.enum(['Comfortable', 'Compact']), reduceMotion: z.boolean() }).strict();
export type PersonalPreferences = z.infer<typeof preferenceSchema>;
export const defaultPreferences: PersonalPreferences = Object.freeze({ version: 1, landingPage: '', density: 'Comfortable', reduceMotion: false });
export const preferencePrefix = 'ui-preferences:v1:';
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
export function createPreferenceStore(storage?: StorageLike) {
    const cache = new Map<string, PersonalPreferences>(), listeners = new Set<() => void>();
    const key = (userId: string) => preferencePrefix + encodeURIComponent(userId);
    return {
        subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },
        get(userId: string): PersonalPreferences {
            if (!userId) return defaultPreferences;
            const old = cache.get(userId); if (old) return old;
            let value = defaultPreferences;
            try { const raw = storage?.getItem(key(userId)); if (raw && raw.length <= 4096) value = Object.freeze(preferenceSchema.parse(JSON.parse(raw))); } catch { /* Invalid or unavailable display storage falls back safely. */ }
            cache.set(userId, value); return value;
        },
        save(userId: string, values: unknown) {
            if (!userId) throw new Error('Sign in before saving personal preferences.');
            const value = Object.freeze(preferenceSchema.parse(values));
            if (!storage) throw new Error('Personal preference storage is unavailable on this device.');
            // Publish only after the durable write succeeds. Business backup hydration does not own this key.
            storage.setItem(key(userId), JSON.stringify(value)); cache.set(userId, value);
            listeners.forEach(fn => fn()); return value;
        },
        invalidate(storageKey: string | null) {
            if (storageKey !== null && !storageKey.startsWith(preferencePrefix)) return;
            cache.clear(); listeners.forEach(fn => fn());
        },
    };
}
let store: ReturnType<typeof createPreferenceStore> | undefined;
export function personalPreferenceStore() {
    if (!store) { let storage: StorageLike | undefined; try { storage = globalThis.localStorage; } catch { /* Disabled device storage. */ } store = createPreferenceStore(storage); }
    return store;
}
export function landingFor(principal: VerifiedPrincipal | null, preferred: string) {
    const destination = landingPages.find(p => p.path === preferred && p.path);
    if (principal?.authenticated && destination && (!destination.permission || hasPermission(principal, destination.permission))) return destination.path;
    return ['/dashboard', '/sales', '/purchases', '/inventory'].find(path => {
        const permission = landingPages.find(p => p.path === path)!.permission!; return hasPermission(principal, permission);
    }) ?? '/workspace';
}
