import { ipcMain, dialog, type BrowserWindow } from 'electron';
import { readFileSync, statSync, realpathSync } from 'node:fs';
import {attachmentBytes,atomicAttachmentExport,readSelectedAttachment} from './attachmentFiles';
import { atomicJson } from './localSecurity';
import { join, relative, isAbsolute, dirname, basename, sep } from 'node:path';
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
                case 'business.bootstrap': await business.initialize(input.legacyStorage); business.scanRecurringDue(); value = business.view(); break;
                case 'business.backup.save': {
                    security.require('users.manage');
                    const choice = await dialog.showSaveDialog(owner, { title: 'Save business backup', defaultPath: `HTT-Business-${new Date().toISOString().slice(0, 10)}.json`, filters: [{ name: 'HTT business backup', extensions: ['json'] }] });
                    if (choice.canceled || !choice.filePath) { value = { saved: false }; break; }
                    const target = relative(realpathSync(directory), join(realpathSync(dirname(choice.filePath)), basename(choice.filePath)));
                    if (!target || (!target.startsWith('..' + sep) && target !== '..' && !isAbsolute(target))) throw new Error('Choose a backup location outside the active local data directory.');
                    const snapshot = business.exportBackup();
                    security.audit('business.backup', 'business-data-only', 'INTENT', 'users.manage');
                    try { atomicJson(choice.filePath, snapshot); }
                    catch (error) { security.audit('business.backup', 'business-data-only', 'FAILED', 'users.manage'); throw error; }
                    security.audit('business.backup', 'business-data-only', 'SUCCESS', 'users.manage');
                    value = { saved: true }; break;
                }
                case 'business.restore.preview': {
                    security.require('users.manage');
                    const choice = await dialog.showOpenDialog(owner, { title: 'Select business backup', properties: ['openFile'], filters: [{ name: 'HTT business backup', extensions: ['json'] }] });
                    if (choice.canceled || !choice.filePaths[0]) { value = null; break; }
                    if (statSync(choice.filePaths[0]).size > 250_000_000) throw new Error('Backup exceeds 250 MB.');
                    value = business.prepareRestore(readFileSync(choice.filePaths[0], 'utf8')); break;
                }
                case 'business.restore.commit': await business.restoreBackup(input.token); value = { restartRequired: true }; break;
                case 'attachments.select': {
                    security.require('inventory.read');
                    business.command({repository:'attachments',method:'checkTarget',args:[input.target]});
                    const choice=await dialog.showOpenDialog(owner,{title:'Select attachment file (maximum 10 MB)',properties:['openFile'],filters:[{name:'Business files',extensions:['pdf','png','jpg','jpeg','csv','txt','docx','xlsx']}]});
                    if(choice.canceled||!choice.filePaths[0]){value={saved:false};break;}
                    const content=readSelectedAttachment(choice.filePaths[0]);
                    const result=business.command({repository:'attachments',method:'upload',args:[{...input,file:{name:basename(choice.filePaths[0]),content:content.toString('base64')}}]});
                    value={saved:true,...result};break;
                }
                case 'attachments.export': {
                    security.require('inventory.read');
                    const result=business.command({repository:'attachments',method:'read',args:[input]}).result as Parameters<typeof attachmentBytes>[0];
                    const choice=await dialog.showSaveDialog(owner,{title:'Export attachment version',defaultPath:result.name});
                    if(choice.canceled||!choice.filePath){value={saved:false};break;}
                    const target=relative(realpathSync(directory),join(realpathSync(dirname(choice.filePath)),basename(choice.filePath)));
                    if(!target||(!target.startsWith('..'+sep)&&target!=='..'&&!isAbsolute(target)))throw new Error('Choose an export location outside the active local data directory.');
                    security.audit('attachments.export',String(input.id)+'/'+String(input.versionId),'INTENT','inventory.read');
                    try{const current=business.command({repository:'attachments',method:'read',args:[input]}).result as Parameters<typeof attachmentBytes>[0];atomicAttachmentExport(join(realpathSync(dirname(choice.filePath)),basename(choice.filePath)),attachmentBytes(current));}catch(error){security.audit('attachments.export',String(input.id)+'/'+String(input.versionId),'FAILED','inventory.read');throw error;}
                    security.audit('attachments.export',String(input.id)+'/'+String(input.versionId),'SUCCESS','inventory.read');value={saved:true};break;
                }
                case 'business.recurring.scan': {
                    security.require('inventory.read');
                    if(Object.keys(input).length) throw new Error('Recurring scan does not accept caller dates, actors or limits.');
                    const result=business.scanRecurringDue(); value={result,view:business.view()}; break;
                }
                case 'business.command': value = business.command(input as { repository: string; method: string; args: unknown[] }); break;
                default: throw new Error('Unknown desktop security action.');
            }
            event.returnValue = { ok: true, value };
        } catch (error) { event.returnValue = { ok: false, error: error instanceof Error ? error.message : 'Desktop operation failed.' }; }
        finally { busy = false; }
    });
    let timerStopped=false;
    const recurringTimer=setInterval(()=>{
        if(busy||timerStopped) return;
        busy=true;
        try { business.scanRecurringDue(); }
        catch(error) { timerStopped=true; console.error('Local recurring scan stopped:',error instanceof Error?error.message:'Restart and inspect business data.'); }
        finally { busy=false; }
    },60_000);
    recurringTimer.unref();
    // A reload or renderer crash drops the authenticated session. No bearer token is stored in the UI.
    return { dispose:()=>clearInterval(recurringTimer), lock: () => { try { if (security.principal()) security.logout(); } catch { /* Storage failure already invalidates the session and blocks writes. */ } } };
}
