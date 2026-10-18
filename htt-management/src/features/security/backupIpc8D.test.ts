import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const mocks = vi.hoisted(() => ({ on: vi.fn(), showSaveDialog: vi.fn(), showOpenDialog: vi.fn() }));
vi.mock('electron', () => ({ ipcMain: { on: mocks.on }, dialog: { showSaveDialog: mocks.showSaveDialog, showOpenDialog: mocks.showOpenDialog } }));
let root: string, request: (action: string, input?: unknown) => Promise<any>;
beforeEach(async () => {
    vi.resetModules(); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined); vi.stubGlobal('__HTT_MAIN_HOST__', true);
    root = mkdtempSync(join(tmpdir(), 'htt-8d-ipc-')); mocks.on.mockClear(); mocks.showOpenDialog.mockReset(); mocks.showSaveDialog.mockReset();
    const { registerSecurityIpc } = await import('../../../electron/security/registerSecurityIpc');
    const owner = { webContents: { mainFrame: {} } }; registerSecurityIpc(join(root, 'active'), () => owner as any);
    const event = { sender: owner.webContents, senderFrame: owner.webContents.mainFrame, returnValue: undefined as any };
    request = async (action, input = {}) => { await mocks.on.mock.calls[0][1](event, action, input); return event.returnValue; };
    await request('setup', { username: 'test.admin', displayName: 'Test admin', password: 'Test-profile-only-8D-4821' });
    expect((await request('business.bootstrap')).ok).toBe(true);
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); rmSync(root, { recursive: true, force: true }); });
describe('8D native backup file boundary', () => {
    it('cancels without reading or writing files', async () => {
        mocks.showSaveDialog.mockResolvedValue({ canceled: true }); mocks.showOpenDialog.mockResolvedValue({ canceled: true, filePaths: [] });
        expect((await request('business.backup.save')).value).toEqual({ saved: false });
        expect((await request('business.restore.preview')).value).toBeNull();
    });
    it('exports only business state through a native chosen file and previews that file', async () => {
        const file = join(root, 'export.json'); mocks.showSaveDialog.mockResolvedValue({ canceled: false, filePath: file });
        expect((await request('business.backup.save')).ok).toBe(true);
        const text = readFileSync(file, 'utf8'); expect(text).not.toContain('passwordHash'); expect(text).not.toContain('auditKey');
        mocks.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: [file] });
        const preview = await request('business.restore.preview', { filePath: '/ignored-renderer-path' }); expect(preview.ok).toBe(true); expect(preview.value.schemaVersion).toBe(13);
        expect((await request('business.restore.commit', { token: preview.value.token })).value.restartRequired).toBe(true);
    });
    it('rejects a save over active account or business data', async () => {
        const file = join(root, 'active', 'security-v1.json'), before = readFileSync(file, 'utf8'); mocks.showSaveDialog.mockResolvedValue({ canceled: false, filePath: file });
        expect((await request('business.backup.save')).ok).toBe(false); expect(readFileSync(file, 'utf8')).toBe(before);
    });
    it('rejects malformed selected files without replacing live business data', async () => {
        const file = join(root, 'invalid.json'); writeFileSync(file, '{}'); mocks.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: [file] });
        const before = readFileSync(join(root, 'active', 'business-v1.json'), 'utf8');
        expect((await request('business.restore.preview')).ok).toBe(false); expect(readFileSync(join(root, 'active', 'business-v1.json'), 'utf8')).toBe(before);
    });
});
