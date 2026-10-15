import { ipcMain, type BrowserWindow } from 'electron';
import { join } from 'node:path';
import { LocalSecurity } from './localSecurity';
import { BusinessHost } from './businessHost';
import type { Role } from '../../src/features/security/rbac';
export function registerSecurityIpc(directory: string, getWindow: () => BrowserWindow | null) {
    const security = new LocalSecurity(join(directory, 'security-v1.json'));
    const business = new BusinessHost(join(directory, 'business-v1.json'), security);
    let busy = false;
    ipcMain.on('security:request', async (event, action: unknown, raw: unknown) => {
        const owner = getWindow();
        if (!owner || event.sender !== owner.webContents || event.senderFrame !== owner.webContents.mainFrame) { event.returnValue = { ok: false, error: 'Untrusted desktop sender.' }; return; }
        if (busy) { event.returnValue = { ok: false, error: 'A desktop operation is already running.' }; return; }
        busy = true;
        try {
            if (typeof action !== 'string' || JSON.stringify(raw ?? null).length > 60_000_000) throw new Error('Invalid desktop request.');
            const input = (raw ?? {}) as Record<string, any>;
            let value: unknown;
            switch (action) {
                case 'status': value = security.status(); break;
                case 'setup': value = security.setup(input as { username: string; displayName: string; password: string }); break;
                case 'login': value = security.login(input as { username: string; password: string }); break;
                case 'logout': value = security.logout(); break;
                case 'users.list': value = security.listUsers(); break;
                case 'users.create': value = security.createUser(input as { username: string; displayName: string; password: string; roles: Role[] }); break;
                case 'users.update': value = security.updateUser(input as { id: string; roles: Role[]; active: boolean }); break;
                case 'password.change': value = security.changePassword(input as { currentPassword: string; password: string }); break;
                case 'audit.list': value = security.listAudit(input); break;
                case 'business.bootstrap': await business.initialize(input.legacyStorage); value = business.view(); break;
                case 'business.command': value = business.command(input as { repository: string; method: string; args: unknown[] }); break;
                default: throw new Error('Unknown desktop security action.');
            }
            event.returnValue = { ok: true, value };
        } catch (error) { event.returnValue = { ok: false, error: error instanceof Error ? error.message : 'Desktop operation failed.' }; }
        finally { busy = false; }
    });
    // A reload or renderer crash drops the authenticated session. No bearer token is stored in the UI.
    return { lock: () => { try { if (security.principal()) security.logout(); } catch { /* Storage failure already invalidates the session and blocks writes. */ } } };
}
