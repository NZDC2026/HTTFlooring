import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
beforeEach(() => { vi.resetModules(); vi.stubEnv('MODE', 'production'); vi.stubGlobal('__HTT_MAIN_HOST__', false); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe('8C production renderer repository boundary', () => {
    it('requires a native host and never executes the renderer business function directly', async () => {
        vi.stubGlobal('window', {});
        const { registerRepository } = await import('./repositoryHost');
        const original = vi.fn(); const repository = { create: original, internal: vi.fn() };
        registerRepository('test', { repository, read: 'sales.read', commands: { create: 'sales.write', internal: null }, snapshot: () => [], restore: () => {}, publish: () => {} });
        expect(() => repository.create()).toThrow(/secure Electron/);
        expect(() => repository.internal()).toThrow(/Internal/);
        expect(original).not.toHaveBeenCalled();
    });
    it('preserves a main-process denial even if the renderer claims an administrator role', async () => {
        const request = vi.fn(() => ({ ok: false, error: 'Permission denied: accounting.post' }));
        vi.stubGlobal('window', { securityBridge: { request } });
        const { registerRepository } = await import('./repositoryHost');
        const original = vi.fn(), repository = { post: original };
        registerRepository('testJournal', { repository, read: 'accounting.read', commands: { post: 'accounting.post' }, snapshot: () => [], restore: () => {}, publish: () => {} });
        expect(() => repository.post({ roles: ['ADMIN'], actorId: 'forged' })).toThrow(/Permission denied/);
        expect(request).toHaveBeenCalledWith('business.command', expect.objectContaining({ repository: 'testJournal', method: 'post' }));
        expect(original).not.toHaveBeenCalled();
    });
});
