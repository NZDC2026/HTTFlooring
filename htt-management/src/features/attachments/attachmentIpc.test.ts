import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync, symlinkSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const mocks = vi.hoisted(() => ({ on: vi.fn(), showSaveDialog: vi.fn(), showOpenDialog: vi.fn() }));
vi.mock('electron', () => ({ ipcMain: { on: mocks.on }, dialog: { showSaveDialog: mocks.showSaveDialog, showOpenDialog: mocks.showOpenDialog } }));
let root: string, request: (action: string, input?: unknown) => Promise<any>;
beforeEach(async () => {
    vi.resetModules();
    vi.stubGlobal('window', undefined);
    vi.stubGlobal('localStorage', undefined);
    vi.stubGlobal('__HTT_MAIN_HOST__', true);
    root = mkdtempSync(join(tmpdir(), 'htt-attachment-ipc-'));
    mocks.on.mockClear();
    mocks.showOpenDialog.mockReset();
    mocks.showSaveDialog.mockReset();
    const { registerSecurityIpc } = await import('../../../electron/security/registerSecurityIpc');
    const owner = { webContents: { mainFrame: {} } };
    registerSecurityIpc(join(root, 'active'), () => owner as any);
    const event = { sender: owner.webContents, senderFrame: owner.webContents.mainFrame, returnValue: undefined as any };
    request = async (action, input = {}) => { await mocks.on.mock.calls[0][1](event, action, input); return event.returnValue; };
    await request('setup', { username: 'test.admin', displayName: 'Test admin', password: 'Test-profile-only-8D-4821' });
    expect((await request('business.bootstrap')).ok).toBe(true);
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); rmSync(root, { recursive: true, force: true }); });
const command = async (repository: string, method: string, ...args: unknown[]) => request('business.command', { repository, method, args });
async function customer() { const reply = await request('business.command', { repository: 'attachments', method: 'targets', args: [] }); return reply.value.result.find((t: any) => t.kind === 'Customer'); }
async function select(patch = {}) { const c = await customer(); return request('attachments.select', { operationId: crypto.randomUUID(), expectedRevision: 0, target: { kind: c.kind, id: c.id }, title: 'Native file attachment', reason: 'Verified native selection', ...patch }); }
it('cancels native upload and export without creating attachment or file', async () => { mocks.showOpenDialog.mockResolvedValue({ canceled: true, filePaths: [] }); expect((await select()).value).toEqual({ saved: false }); const c = await customer(), d = await command('attachments', 'upload', { operationId: 'cancel-export', expectedRevision: 0, target: { kind: c.kind, id: c.id }, title: 'Cancel export', reason: 'Test export cancel', file: { name: 'cancel.txt', content: Buffer.from('cancel').toString('base64') } }); mocks.showSaveDialog.mockResolvedValue({ canceled: true }); expect((await request('attachments.export', { id: d.value.result.id, versionId: d.value.result.currentVersionId })).value).toEqual({ saved: false }); });
it('reads only the native chosen file, persists its bytes and exports an exact historical version', async () => { const file = join(root, 'chosen.txt'), other = join(root, 'ignored.txt'), out = join(root, 'export.txt'); writeFileSync(file, 'Native chosen bytes 客户'); writeFileSync(other, 'Ignored renderer path'); mocks.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: [file] }); const saved = await select(); expect(saved.ok).toBe(true); const d = saved.value.result; expect(JSON.stringify(saved.value.view)).not.toContain(Buffer.from('Native chosen bytes 客户').toString('base64')); mocks.showSaveDialog.mockResolvedValue({ canceled: false, filePath: out }); const exported = await request('attachments.export', { id: d.id, versionId: d.currentVersionId }); expect(exported.ok).toBe(true); expect(readFileSync(out)).toEqual(readFileSync(file)); const audit=JSON.parse(readFileSync(join(root, 'active', 'security-v1.json'), 'utf8')).audit;expect(audit.some((a:any)=>a.action==='attachments.export'&&a.resourceId===d.id+'/'+d.currentVersionId&&a.outcome==='SUCCESS')).toBe(true); });
it('refuses arbitrary renderer paths, symlinks, directories and unsupported selected files', async () => {
    const file = join(root, 'actual.txt'), link = join(root, 'link.txt'), folder = join(root, 'folder'), html = join(root, 'unsafe.html');
    writeFileSync(file, 'valid');
    symlinkSync(file, link);
    mkdirSync(folder);
    writeFileSync(html, '<html>Not accepted</html>');
    for (const path of [link, folder, html]) {
        mocks.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: [path] });
        expect((await select()).ok).toBe(false);
    }
    mocks.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: [file] });
    expect((await select({ filePath: join(root, 'private.txt') })).ok).toBe(false);
});
it('checks object authority before showing a file dialog and blocks unreadable exports', async () => { const c = await customer(); await request('users.create', { username: 'native.warehouse', displayName: 'Warehouse', password: 'Test-profile-only-8D-4821', roles: ['WAREHOUSE'] }); await request('login', { username: 'native.warehouse', password: 'Test-profile-only-8D-4821' }); mocks.showOpenDialog.mockClear(); const denied = await request('attachments.select', { operationId: 'denied', expectedRevision: 0, target: { kind: c.kind, id: c.id }, title: 'Denied', reason: 'Denied' }); expect(denied.ok).toBe(false); expect(mocks.showOpenDialog).not.toHaveBeenCalled(); expect((await request('attachments.export', { id: 'unknown', versionId: 'unknown' })).ok).toBe(false); expect(mocks.showSaveDialog).not.toHaveBeenCalled(); });
it('prevents attachment export into active profile storage', async () => { const file = join(root, 'chosen.txt'); writeFileSync(file, 'Native export bytes'); mocks.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: [file] }); const saved = await select(), d = saved.value.result; const before = readFileSync(join(root, 'active', 'security-v1.json'), 'utf8'); mocks.showSaveDialog.mockResolvedValue({ canceled: false, filePath: join(root, 'active', 'security-v1.json') }); expect((await request('attachments.export', { id: d.id, versionId: d.currentVersionId })).ok).toBe(false); expect(JSON.parse(readFileSync(join(root, 'active', 'security-v1.json'), 'utf8')).users).toEqual(JSON.parse(before).users); });
it('rechecks source permission after the export dialog if the session expires', async () => { const file = join(root, 'session.txt'), out = join(root, 'should-not-export.txt'); writeFileSync(file, 'Session guarded bytes'); mocks.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: [file] }); const saved = await select(), d = saved.value.result, now = Date.now(); mocks.showSaveDialog.mockImplementation(async () => { vi.spyOn(Date, 'now').mockReturnValue(now + 31 * 60000); return { canceled: false, filePath: out }; }); expect((await request('attachments.export', { id: d.id, versionId: d.currentVersionId })).ok).toBe(false); expect(existsSync(out)).toBe(false); });
