import { afterEach, expect, it, vi } from 'vitest';
vi.mock('./repositoryHost', () => ({ snapshotRepositories: () => ({ sample: { rows: [] } }) }));
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.resetModules(); });
it('opens an isolated read-only dashboard without requesting live data', async () => {
 vi.stubEnv('VITE_WEB_ONLY', '1'); vi.stubEnv('VITE_PUBLIC_PREVIEW', '1');
 const browser = { location: { hash: '' }, securityBridge: undefined as any };
 vi.stubGlobal('window', browser); vi.stubGlobal('localStorage', { removeItem: vi.fn() });
 const transport = vi.fn(); vi.stubGlobal('XMLHttpRequest', transport);
 await import('./webBridge');
 expect(browser.location.hash).toBe('/dashboard');
 expect(browser.securityBridge.request('status').value.session.user.id).toBe('public-sample-preview');
 expect(browser.securityBridge.request('business.view').value.repositories).toEqual({ sample: { rows: [] } });
 for (const action of ['business.command', 'users.create', 'invoiceReminders.queue', 'login']) expect(browser.securityBridge.request(action).ok).toBe(false);
 expect(transport).not.toHaveBeenCalled();
});
