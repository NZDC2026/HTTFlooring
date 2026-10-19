import { expect, it, vi } from 'vitest';
import { createPreferenceStore, defaultPreferences, landingFor, preferencePrefix } from './personalPreferences';
const values = { ...defaultPreferences, density: 'Compact' as const, reduceMotion: true, landingPage: '/documents' as const };
function storage() { const data = new Map<string, string>(); return { data, getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } }; }
it('persists only validated display preferences and restores them after a store restart', () => {
    const disk = storage(), store = createPreferenceStore(disk); store.save('user-a', values);
    expect(createPreferenceStore(disk).get('user-a')).toEqual(values); expect([...disk.data.keys()]).toEqual([preferencePrefix + 'user-a']); expect(Object.isFrozen(store.get('user-a'))).toBe(true);
});
it('isolates users and restores defaults without changing another user or business records', () => {
    const disk = storage(); disk.data.set('htt.business', 'business records'); const store = createPreferenceStore(disk); store.save('user-a', values); store.save('user-b', { ...values, reduceMotion: false }); store.save('user-a', defaultPreferences);
    expect(store.get('user-a')).toEqual(defaultPreferences); expect(store.get('user-b').reduceMotion).toBe(false); expect(disk.data.get('htt.business')).toBe('business records');
});
it('uses stable default snapshots for missing, malformed, future and oversized settings', () => {
    const disk = storage(); for (const raw of ['broken', JSON.stringify({ ...values, version: 2 }), JSON.stringify({ ...values, density: 'Unknown' }), ' '.repeat(5000)]) { disk.data.set(preferencePrefix + 'a', raw); const store = createPreferenceStore(disk); expect(store.get('a')).toBe(defaultPreferences); expect(store.get('a')).toBe(store.get('a')); }
    expect(createPreferenceStore().get('')).toBe(defaultPreferences);
});
it('does not publish a save that fails, including unavailable and full device storage', () => {
    const store = createPreferenceStore({ getItem: () => null, setItem: () => { throw new Error('Quota exceeded'); } }), listener = vi.fn(); store.subscribe(listener);
    expect(() => store.save('a', values)).toThrow(/Quota/); expect(store.get('a')).toBe(defaultPreferences); expect(listener).not.toHaveBeenCalled(); expect(() => createPreferenceStore().save('a', values)).toThrow(/unavailable/); expect(() => store.save('', values)).toThrow(/Sign in/);
});
it('rejects injected routes and unsupported keys before touching storage', () => {
    const disk = storage(), store = createPreferenceStore(disk); for (const patch of [{ landingPage: 'https://evil.test' }, { landingPage: '/settings/security' }, { roles: ['ADMIN'] }]) expect(() => store.save('a', { ...values, ...patch })).toThrow(); expect(disk.data.size).toBe(0);
});
it('notifies live subscribers and handles cross-window changes only for owned keys', () => {
    const disk = storage(), store = createPreferenceStore(disk), listener = vi.fn(), stop = store.subscribe(listener); store.get('a'); store.save('a', values); expect(listener).toHaveBeenCalledTimes(1); disk.data.set(preferencePrefix + 'a', JSON.stringify(defaultPreferences)); store.invalidate('htt.business'); expect(store.get('a')).toEqual(values); store.invalidate(preferencePrefix + 'a'); expect(store.get('a')).toEqual(defaultPreferences); expect(listener).toHaveBeenCalledTimes(2); stop(); store.invalidate(null); expect(listener).toHaveBeenCalledTimes(2);
});
it.each([['ADMIN', '/dashboard'], ['SALES', '/sales'], ['PURCHASING', '/purchases'], ['WAREHOUSE', '/purchases'], ['ACCOUNTANT', '/dashboard'], ['AUDITOR', '/dashboard']])('uses an authorized automatic destination for %s', (role, path) => {
    expect(landingFor({ userId: 'a', roles: [role], authenticated: true }, '')).toBe(path);
});
it('rechecks preferred home authority after a role change and never accepts an arbitrary destination', () => {
    const sales = { userId: 'a', roles: ['SALES'], authenticated: true as const };
    expect(landingFor(sales, '/payroll')).toBe('/sales'); expect(landingFor(sales, '/documents')).toBe('/documents'); expect(landingFor(sales, '//evil.test')).toBe('/sales'); expect(landingFor(null, '/documents')).toBe('/workspace');
});
