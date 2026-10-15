import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const { on } = vi.hoisted(() => ({ on: vi.fn() }));
vi.mock('electron', () => ({ ipcMain: { on } }));
import { registerSecurityIpc } from '../../../electron/security/registerSecurityIpc';
let root: string;
beforeEach(() => { root = mkdtempSync(join(tmpdir(), 'htt-8c-ipc-')); on.mockClear(); });
afterEach(() => { rmSync(root, { recursive: true, force: true }); });
describe('8C trusted Electron sender boundary', () => {
    it('rejects a different webContents before executing account setup', async () => {
        const owner = { webContents: { mainFrame: {} } };
        registerSecurityIpc(root, () => owner as any);
        const handler = on.mock.calls[0][1]; const event = { sender: {}, senderFrame: owner.webContents.mainFrame, returnValue: undefined as any };
        await handler(event, 'setup', { username: 'forged.admin', displayName: 'Forged', password: 'Long-test-password-123' });
        expect(event.returnValue).toEqual({ ok: false, error: 'Untrusted desktop sender.' });
    });
    it('rejects a child-frame request even inside the correct window', async () => {
        const owner = { webContents: { mainFrame: {} } };
        registerSecurityIpc(root, () => owner as any);
        const event = { sender: owner.webContents, senderFrame: {}, returnValue: undefined as any };
        await on.mock.calls[0][1](event, 'status', {});
        expect(event.returnValue.ok).toBe(false);
    });
    it('allows the designated main frame and refuses an unknown action', async () => {
        const owner = { webContents: { mainFrame: {} } };
        registerSecurityIpc(root, () => owner as any);
        const event = { sender: owner.webContents, senderFrame: owner.webContents.mainFrame, returnValue: undefined as any };
        await on.mock.calls[0][1](event, 'status', {});
        expect(event.returnValue).toEqual({ ok: true, value: { initialized: false, session: null } });
        await on.mock.calls[0][1](event, 'setRendererRole', { role: 'ADMIN' });
        expect(event.returnValue).toEqual({ ok: false, error: 'Unknown desktop security action.' });
    });
});
