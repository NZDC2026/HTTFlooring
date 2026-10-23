import {PayrollFilings} from '../payroll-filing/filings';
import {FilingStore} from '../payroll-filing/store';
import {BankFeeds} from '../bank-feeds/bankFeeds';
import {FeedStore,FeedVault} from '../bank-feeds/store';
import {ExternalServices} from '../integrations/externalServices';
import {IntegrationStore,IntegrationVault} from '../integrations/localIntegrationStore';
import {renderDeliveryPdf} from '../integrations/outputPdf';
import {configureCaptureHelper} from './captureRecognizer';
import { app, ipcMain, dialog, safeStorage, shell, type BrowserWindow } from 'electron';
import { readFileSync, statSync, realpathSync } from 'node:fs';
import {attachmentBytes,atomicAttachmentExport,readSelectedAttachment} from './attachmentFiles';
import { atomicJson } from './localSecurity';
import { join, relative, isAbsolute, dirname, basename, sep } from 'node:path';
import { LocalSecurity } from './localSecurity';
import { BusinessHost } from './businessHost';
import type { Role } from '../../src/features/security/rbac';
export function registerSecurityIpc(directory: string, getWindow: () => BrowserWindow | null, onRecurringStopped: () => void = () => {}) {
    configureCaptureHelper(join(app.isPackaged?process.resourcesPath:app.getAppPath(),app.isPackaged?'ocr':'dist-ocr','htt-ocr'));
    const security = new LocalSecurity(join(directory, 'security-v1.json'));
    const business = new BusinessHost(join(directory, 'business-v1.json'), security);
    let integrations:ExternalServices|undefined, integrationError='';
    try {integrations=new ExternalServices(new IntegrationStore(directory),new IntegrationVault(directory,{available:()=>safeStorage.isEncryptionAvailable()&&(process.platform!=='linux'||safeStorage.getSelectedStorageBackend()!=='basic_text'),encrypt:value=>safeStorage.encryptString(value),decrypt:value=>safeStorage.decryptString(value)}),security,business,renderDeliveryPdf);}
    catch {integrationError='Integration journal is unavailable. Preserve the complete profile for recovery; business data has not been reset.';}
    let feeds:BankFeeds|undefined, feedError='';
    try {feeds=new BankFeeds(new FeedStore(directory),new FeedVault(directory,{available:()=>safeStorage.isEncryptionAvailable()&&(process.platform!=='linux'||safeStorage.getSelectedStorageBackend()!=='basic_text'),encrypt:value=>safeStorage.encryptString(value),decrypt:value=>safeStorage.decryptString(value)}),security,business);}
    catch {feedError='Bank feed journal is unavailable. Preserve the full profile; business data has not been reset.';}
    let payrollFilings:PayrollFilings|undefined, payrollFilingError='';
    try {payrollFilings=new PayrollFilings(new FilingStore(directory,{available:()=>safeStorage.isEncryptionAvailable()&&(process.platform!=='linux'||safeStorage.getSelectedStorageBackend()!=='basic_text'),encrypt:value=>safeStorage.encryptString(value),decrypt:value=>safeStorage.decryptString(value)}),security,business);}
    catch {payrollFilingError='Payroll filing journal is unavailable. Preserve the full profile and OS credentials; business data has not been reset.';}
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
            if(action.startsWith('payrollFilings.')){
                if(!payrollFilings)throw new Error(payrollFilingError);
                let reply:unknown;
                switch(action){
                    case 'payrollFilings.view':reply=payrollFilings.view();break;
                    case 'payrollFilings.configure':reply=payrollFilings.configure(input);break;
                    case 'payrollFilings.saveProfile':reply=payrollFilings.saveProfile(input);break;
                    case 'payrollFilings.preflight':reply=payrollFilings.preflight(input);break;
                    case 'payrollFilings.prepare':reply=payrollFilings.prepare(input);break;
                    case 'payrollFilings.preview':reply=payrollFilings.preview(input);break;
                    case 'payrollFilings.declare':reply=payrollFilings.declare(input);break;
                    case 'payrollFilings.manualReview':reply=payrollFilings.manualReview(input);break;
                    case 'payrollFilings.refresh':reply=payrollFilings.refresh(input);break;
                    case 'payrollFilings.cancel':reply=payrollFilings.cancel(input);break;
                    default:throw new Error('Unknown payroll filing action.');
                }
                event.returnValue={ok:true,value:reply};return;
            }
            if(action.startsWith('bankFeeds.')){
                if(!feeds)throw new Error(feedError);let reply:unknown;
                switch(action){
                    case 'bankFeeds.view':reply=feeds.view();break;
                    case 'bankFeeds.configure':reply=feeds.configure(input);break;
                    case 'bankFeeds.request':reply=feeds.request(input);break;
                    case 'bankFeeds.cancelRequest':reply=feeds.cancelRequest();break;
                    case 'bankFeeds.openAuthorization':await shell.openExternal(feeds.authorizationUrl());reply={opened:true};break;
                    case 'bankFeeds.map':reply=feeds.map(input);break;
                    case 'bankFeeds.enabled':reply=feeds.setEnabled(input);break;
                    case 'bankFeeds.sync':reply=feeds.sync(input);break;
                    case 'bankFeeds.renew':reply=feeds.renew(input);break;
                    case 'bankFeeds.retire':reply=feeds.retire(input);break;
                    case 'bankFeeds.import':reply={feed:feeds.importBatch(input),view:business.view()};break;
                    default:throw new Error('Unknown bank feed action.');
                }
                event.returnValue={ok:true,value:reply};return;
            }
            if(action.startsWith('integrations.')){
                if(!integrations)throw new Error(integrationError);
                let reply:unknown;
                switch(action){
                    case 'integrations.view':reply=integrations.view();break;
                    case 'integrations.configure':reply=integrations.configure(input);break;
                    case 'integrations.preview':reply=integrations.preview(input);break;
                    case 'integrations.statement':reply={id:integrations.prepareStatement(input)};break;
                    case 'integrations.mail':reply={id:await integrations.queueMail(input)};break;
                    case 'integrations.checkout':reply={id:integrations.queueCheckout(input)};break;
                    case 'integrations.reminders':reply=integrations.policy(input);break;
                    case 'integrations.retry':integrations.retry(input);reply=integrations.view();break;
                    case 'integrations.cancel':integrations.cancel(input);reply=integrations.view();break;
                    case 'integrations.receipt':reply=integrations.requestReceipt(input);break;
                    case 'integrations.run':integrations.view();void integrations.tick();reply=integrations.view();break;
                    case 'integrations.open':await shell.openExternal(integrations.checkoutUrl(input));reply={opened:true};break;
                    default:throw new Error('Unknown integration action.');
                }
                event.returnValue={ok:true,value:reply};return;
            }
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
                case 'capture.select': {
                    security.require('purchases.bill');
                    if(Object.keys(input).some(k=>k!=='operationId')||typeof input.operationId!=='string'||!input.operationId||input.operationId.length>200)throw new Error('Invalid recognition request.');
                    const choice=await dialog.showOpenDialog(owner,{title:'Recognize supplier original locally (10 MB maximum)',properties:['openFile'],filters:[{name:'Supplier originals',extensions:['pdf','png','jpg','jpeg']}]});
                    if(choice.canceled||!choice.filePaths[0]){value={};break;}
                    const bytes=readSelectedAttachment(choice.filePaths[0]);
                    const reply=business.command({repository:'captureSources',method:'recognize',args:[{operationId:input.operationId,file:{name:basename(choice.filePaths[0]),content:bytes.toString('base64')}}]});
                    value={source:reply.result,view:reply.view};break;
                }
                case 'capture.export': {
                    security.require('purchases.bill');
                    if(Object.keys(input).some(k=>k!=='id')||typeof input.id!=='string')throw new Error('Invalid source export request.');
                    const source=business.command({repository:'captureSources',method:'read',args:[input.id]}).result as Parameters<typeof attachmentBytes>[0];
                    const choice=await dialog.showSaveDialog(owner,{title:'Export preserved original',defaultPath:source.name});
                    if(choice.canceled||!choice.filePath){value={saved:false};break;}
                    const target=relative(realpathSync(directory),join(realpathSync(dirname(choice.filePath)),basename(choice.filePath)));
                    if(!target||(!target.startsWith('..'+sep)&&target!=='..'&&!isAbsolute(target)))throw new Error('Choose an export location outside the active local data directory.');
                    security.audit('capture.export',input.id,'INTENT','purchases.bill');
                    try{const current=business.command({repository:'captureSources',method:'read',args:[input.id]}).result as Parameters<typeof attachmentBytes>[0];atomicAttachmentExport(choice.filePath,attachmentBytes(current));}catch(e){security.audit('capture.export',input.id,'FAILED','purchases.bill');throw e;}
                    security.audit('capture.export',input.id,'SUCCESS','purchases.bill');value={saved:true};break;
                }
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
        catch { timerStopped=true; onRecurringStopped(); }
        finally { busy=false; }
    },60_000);
    recurringTimer.unref();
    const integrationTimer=setInterval(()=>{if(!busy)void integrations?.tick();},10000);integrationTimer.unref();
    const feedTimer=setInterval(()=>{if(!busy)void feeds?.tick();},10000);feedTimer.unref();
    const payrollFilingTimer=setInterval(()=>{if(!busy)void payrollFilings?.tick();},10000);payrollFilingTimer.unref();
    // A reload or renderer crash drops the authenticated session. No bearer token is stored in the UI.
    return { dispose:()=>{clearInterval(recurringTimer);clearInterval(integrationTimer);clearInterval(feedTimer);clearInterval(payrollFilingTimer);}, lock: () => { try { if (security.principal()) security.logout(); } catch { /* Storage failure already invalidates the session and blocks writes. */ } } };
}
