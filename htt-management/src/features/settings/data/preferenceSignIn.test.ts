import { beforeEach, afterEach, expect, it, vi } from 'vitest';
const fixture = vi.hoisted(() => ({ current: { initialized: true, session: { user: { id: 'user-a', roles: ['SALES'] } } } as any, native: vi.fn(), hydrate: vi.fn() }));
vi.mock('../../security/repositoryHost', () => ({ nativeRequest: fixture.native, hydrateBusiness: fixture.hydrate }));
let disk: Record<string, any>;
beforeEach(() => {
    vi.resetModules(); fixture.current = { initialized: true, session: { user: { id: 'user-a', roles: ['SALES'] } } }; fixture.native.mockReset(); fixture.hydrate.mockClear();
    fixture.native.mockImplementation((action: string) => action === 'business.bootstrap' ? { repositories: {}, storage: {} } : fixture.current);
    disk = { getItem: (key: string) => disk[key] ?? null, setItem: (key: string, value: string) => { disk[key] = value; } }; vi.stubGlobal('localStorage', disk);
    let hash = ''; vi.stubGlobal('location', { get hash() { return hash; }, set hash(value: string) { hash = value.startsWith('#') ? value : '#' + value; } });
});
afterEach(() => vi.unstubAllGlobals());
it('opens the saved home after business hydration and leaves display preferences outside legacy migration', async () => {
    const { personalPreferenceStore, defaultPreferences } = await import('./personalPreferences'); personalPreferenceStore().save('user-a', { ...defaultPreferences, landingPage: '/documents' });
    const { enterBusiness } = await import('../../security/securityClient'); enterBusiness(); expect(location.hash).toBe('#/documents'); expect(fixture.native).toHaveBeenCalledWith('business.bootstrap', { legacyStorage: {} }); expect(fixture.hydrate).toHaveBeenCalled();
});
it('preserves a direct document link and falls back when the preferred page is forbidden', async () => {
    const { personalPreferenceStore, defaultPreferences } = await import('./personalPreferences'); personalPreferenceStore().save('user-a', { ...defaultPreferences, landingPage: '/payroll' }); const { enterBusiness } = await import('../../security/securityClient');
    location.hash = '/documents/actual-file'; enterBusiness(); expect(location.hash).toBe('#/documents/actual-file'); location.hash = '/'; enterBusiness(); expect(location.hash).toBe('#/sales');
});
it('resets the route on sign-out and reads the next user’s own home on sign-in', async () => {
    const { personalPreferenceStore, defaultPreferences } = await import('./personalPreferences'); personalPreferenceStore().save('user-a', { ...defaultPreferences, landingPage: '/documents' }); personalPreferenceStore().save('user-b', { ...defaultPreferences, landingPage: '/inventory' });
    const { logout, enterBusiness } = await import('../../security/securityClient'); location.hash = '/documents/actual-file'; logout(); expect(location.hash).toBe('#/'); expect(fixture.native).toHaveBeenCalledWith('logout'); fixture.current.session.user.id = 'user-b'; enterBusiness(); expect(location.hash).toBe('#/inventory');
});
