import {InvoiceReminders} from './invoiceReminders';
import {reminderRows} from '../src/features/invoice-reminders/rules';
import {businessSettings} from '../src/features/business-workspace/configurationState';
import {businessDateKey} from '../src/lib/businessDate';
import {buildCustomerStatement} from '../src/features/sales/data/customerStatementService';
import {renderStatement} from '../src/features/external-services/statementHtml';
import {statementSchema} from '../src/features/external-services/contract';
import {renderOutputHtml} from '../src/features/document-output/outputHtml';
import type {PreparedOutput} from '../src/features/document-output/outputRepository';
import env from '../config/environment.cjs';
import {commercialReservation} from '../src/features/dispatch-followups/stockReservations';
import {visibleDocuments} from '../src/features/document-recycle/recycleState';
import { DispatchFollowups } from './dispatchFollowups';
import {snapshotRepositories} from '../src/features/security/repositoryHost';
import type {SalesDocument} from '../src/features/sales/types/salesDocument';
import { configureCaptureHelper } from '../electron/security/captureRecognizer';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve, join, extname, sep } from 'node:path';
import { LocalSecurity } from '../electron/security/localSecurity';
import { BusinessHost } from '../electron/security/businessHost';
import { assertApprovedDesktopCommand } from '../src/features/security/optionalWorkflows';
import { WebStorage } from './storage';

export function createWebApplication(options: { directory: string; staticDirectory?: string; publicOrigin?: string; secureCookie?: boolean }) {
    configureCaptureHelper(resolve(env.required('HTT_OCR_HELPER')));
    const storage = new WebStorage(options.directory);
    const security = new LocalSecurity(join(options.directory, 'security-v1.json'),
        (path, value) => storage.write(path, value), () => Date.now(),
        path => { const text = storage.read(path); return text === undefined ? undefined : JSON.parse(text); });
    const business = new BusinessHost(join(options.directory, 'business-v1.json'), security, storage);
    business.restrictToApprovedScope();
    let queue = Promise.resolve();
    const followupDocuments=()=>{const state=snapshotRepositories().sales as {quotes:SalesDocument[];salesOrders:SalesDocument[];invoices:SalesDocument[]}|undefined;return state?visibleDocuments([...state.quotes,...state.salesOrders,...state.invoices]):[];};
    const followups=new DispatchFollowups(storage,{
        documents:followupDocuments,
        schedule:(id,date,actor,reason)=>{const d=followupDocuments().find(d=>d.id===id)!;security.runDispatchServiceSync(()=>business.command({repository:'sales',method:'scheduleDispatch',args:[id,date,d.awaitingCollection??false,d.deliveryBooked,{actor,reason}]}));},
        expire:(id,date)=>{security.runDispatchServiceSync(()=>business.command({repository:'sales',method:'expireDispatchQuote',args:[id,date]}));},
    });
    const reminderSnapshot=()=>snapshotRepositories() as any;
    const invoiceReminders=new InvoiceReminders(storage,{
        rows:()=>{const s=reminderSnapshot();return reminderRows(followupDocuments(),s.customerPayments?.payments??[],s.customerCredits?.allocations??[],s.customers?.customers??[],businessDateKey(new Date().toISOString()));},
        fingerprint:()=>{const s=reminderSnapshot();return JSON.stringify([businessDateKey(new Date().toISOString()),followupDocuments(),s.customerPayments,s.customerCredits,s.customers,businessSettings()]);},
        document:(mode,rows)=>{
            const s=reminderSnapshot(),today=businessDateKey(new Date().toISOString());
            if(mode==='INVOICE'){
                const d=followupDocuments().find(d=>d.id===rows[0].id)!;
                const artifact=(business.command({repository:'preparedSalesOutputs',method:'prepare',args:[{operationId:randomBytes(16).toString('hex'),sourceId:d.id,kind:'INVOICE',expectedUpdatedAt:d.updatedAt}]}).result) as PreparedOutput;
                return {html:renderOutputHtml({...artifact,amountDue:rows[0].amount}),filename:d.documentNumber.replace(/[^a-z0-9_-]/gi,'_')+'.html'};
            }
            const customer=s.customers.customers.find((c:any)=>c.id===rows[0].customerId),fromDate='1900-01-01';
            const report=buildCustomerStatement({customerId:customer.id,documents:followupDocuments().filter(d=>!/sample/i.test(d.documentNumber)),payments:s.customerPayments.payments.filter((p:any)=>!/sample/i.test(p.paymentNumber??p.reference??'')),creditNotes:s.customerCredits.creditNotes.filter((c:any)=>!/sample/i.test(c.creditNoteNumber)),fromDate,toDate:today});
            const a=statementSchema.parse({id:'reminder-statement',operationId:'reminder-statement',ownerId:security.principal()!.userId,kind:'CUSTOMER_STATEMENT',sourceId:customer.id,sourceRevision:'0'.repeat(64),documentNumber:'STATEMENT-'+customer.code+'-'+today,fromDate,toDate:today,customerName:customer.businessName,issuerName:businessSettings().companyName,currency:businessSettings().currency,recipient:{accountingEmail:rows[0].email},subject:'Customer statement',body:'Account statement',template:{paper:'A4'},openingBalance:report.openingBalance,closingBalance:report.closingBalance,totalDebits:report.totalDebits,totalCredits:report.totalCredits,entries:report.entries.map(({date,reference,description,debit,credit,balance})=>({date,reference,description,debit,credit,balance}))});
            return {html:renderStatement(a),filename:'Statement-'+customer.code+'-'+today+'.html'};
        },
    });
    // Only initialization joins the principal-sensitive request queue. Provider I/O must
    // never hold that queue or a user's identity; business mutations use short sync scopes.
    let followupWork:Promise<unknown>=Promise.resolve();let followupWorking=false;
    const followupTimer=setInterval(()=>{
        if(followupWorking)return;followupWorking=true;
        const ready=queue.then(()=>security.runDispatchService(async()=>{if(storage.read(join(options.directory,'business-v1.json'))===undefined)return false;await business.initialize();return true;}));
        queue=ready.then(()=>{},()=>{});
        followupWork=ready.then(ok=>ok?Promise.all([followups.tick(),invoiceReminders.tick()]):undefined).catch(error=>console.error('Dispatch follow-up service:',error instanceof Error?error.message:'Failed')).finally(()=>{followupWorking=false;});
    },60000);followupTimer.unref();

    const lastScans = new Map<string, number>();
    const attempts = new Map<string, { count: number; until: number }>();
    const cookieName = options.secureCookie ? '__Host-htt-session' : 'htt-session';
    function reply(res: ServerResponse, status: number, value: unknown) {
        res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
        res.end(JSON.stringify(value));
    }
    async function dispatch(action: string, input: any): Promise<unknown> {
        switch (action) {
            case 'status': return security.status();
            case 'setup': return security.setup(input);
            case 'login': return security.login(input);
            case 'logout': return security.logout();
            case 'tasks.assignees': return security.taskAssignees();
            case 'users.list': return security.listUsers();
            case 'users.create': return security.createUser(input);
            case 'users.update': return security.updateUser(input);
            case 'password.change': return security.changePassword(input);
            case 'audit.list': return security.listAudit(input);
            // Browser caches are never imported into the authoritative shared database.
            case 'preferences.columnOrder.get':
            case 'preferences.columnOrder.set': {
                const actor = security.principal();
                if (!actor) throw new Error('Sign in to access column preferences.');
                if (typeof input.table !== 'string' || !input.table || input.table.length > 4096) {
                    throw new Error('Invalid table identifier.');
                }
                const key = createHash('sha256').update(JSON.stringify([actor.userId, input.table])).digest('hex');
                const file = `column-order-${key}.json`;
                if (action === 'preferences.columnOrder.get') {
                    const saved = storage.read(file);
                    return saved === undefined ? null : JSON.parse(saved);
                }
                const order: unknown = input.order;
                if (!Array.isArray(order) || order.length > 250 ||
                    !order.every(item => typeof item === 'string' && item.length > 0 && item.length <= 250) ||
                    new Set(order).size !== order.length) {
                    throw new Error('Invalid column order.');
                }
                storage.write(file, order);
                return order;
            }
            case 'business.view': {
                const actor = security.principal();
                if (actor && Date.now() - (lastScans.get(actor.userId) ?? 0) >= 60_000) {
                    business.scanRecurringDue(); lastScans.set(actor.userId, Date.now());
                }
                return business.view();
            }
            case 'business.bootstrap': await business.initialize(); business.scanRecurringDue(); return business.view();
            case 'dispatchFollowups.reservations': {security.require('inventory.read');const s=snapshotRepositories() as any;return (s.products?.products??[]).map((p:any)=>({productId:p.id,quantity:commercialReservation(p,followupDocuments(),s.fulfilments?.fulfilments??[])}));}
            case 'invoiceReminders.view': security.require('sales.read');return invoiceReminders.view();
            case 'invoiceReminders.configure': security.require('users.manage');{const result=invoiceReminders.configure(input);security.audit('invoice.reminders.configure','company','SUCCESS','users.manage');return result;}
            case 'invoiceReminders.preview': security.require('documents.prepare');security.require('sales.read');return invoiceReminders.preview(input,security.principal()!.userId);
            case 'invoiceReminders.queue': security.require('documents.prepare');security.require('sales.read');{const result=invoiceReminders.queue(input);security.audit('invoice.reminders.queue',result.id,'SUCCESS','documents.prepare');return result;}
            case 'dispatchFollowups.view': security.require('sales.read');return followups.view(input.documentId);
            case 'dispatchFollowups.configure': security.require('users.manage');security.audit('dispatch.followups.configure','company','INTENT','users.manage');{const result=followups.configure(input);security.audit('dispatch.followups.configure','company','SUCCESS','users.manage');return result;}
            case 'business.command': {assertApprovedDesktopCommand(input);security.validateDeliveryAssignee(input);const before=structuredClone(followupDocuments()),actor=security.principal();const result=business.command(input);followups.recordChanges(before,actor?.displayName||actor?.userId||'Staff');return result;}
            case 'business.recurring.scan': {
                if (Object.keys(input).length) throw new Error('Recurring scan does not accept caller dates, actors or limits.');
                security.require('inventory.read');
                return { result: business.scanRecurringDue(), view: business.view() };
            }
            case 'business.backup.save': return { saved: true, download: business.exportBackup(), name: `HTT-Business-${new Date().toISOString().slice(0, 10)}.json` };
            case 'business.restore.preview': return business.prepareRestore(input.text);
            case 'business.restore.commit': await business.restoreBackup(input.token); return { restartRequired: true };
            case 'attachments.select': {
                security.require('inventory.read');
                business.command({ repository: 'attachments', method: 'checkTarget', args: [input.target] });
                return { saved: true, ...business.command({ repository: 'attachments', method: 'upload', args: [input] }) };
            }
            case 'attachments.export': {
                security.require('inventory.read');
                return { saved: true, download: business.command({ repository: 'attachments', method: 'read', args: [input] }).result };
            }
            case 'capture.select': {
                security.require('purchases.bill');
                const result = business.command({ repository: 'captureSources', method: 'recognize', args: [input] });
                return { source: result.result, view: result.view };
            }
            case 'capture.export': {
                security.require('purchases.bill');
                return { saved: true, download: business.command({ repository: 'captureSources', method: 'read', args: [input.id] }).result };
            }
            default: throw new Error('This service is not configured for the web server: ' + action);
        }
    }
    const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
        if(req.url?.split('?')[0]==='/api/dispatch-portal'){
            const origin=followups.view().configuration.portalOrigin.replace(/\/$/,'');
            if(req.headers.origin!==origin){reply(res,403,{ok:false,error:'Portal origin not permitted.'});return;}
            res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');
            if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Methods','POST');res.setHeader('Access-Control-Allow-Headers','Content-Type, X-HTT-Request');res.writeHead(204);res.end();return;}
            if(req.method!=='POST'||req.headers['x-htt-request']!=='1'||!req.headers['content-type']?.startsWith('application/json')){reply(res,403,{ok:false,error:'Invalid portal request.'});return;}
            const rateKey='portal:'+req.socket.remoteAddress,rate=attempts.get(rateKey);if(rate&&rate.until>Date.now()&&rate.count>=30){reply(res,429,{ok:false,error:'Too many requests; try again in a minute.'});return;}attempts.set(rateKey,{count:rate&&rate.until>Date.now()?rate.count+1:1,until:rate&&rate.until>Date.now()?rate.until:Date.now()+60000});
            try{let raw='';for await(const part of req){raw+=part.toString();if(raw.length>10000)throw Error('Request too large.');}const body=JSON.parse(raw);
                const task=queue.then(()=>security.runDispatchService(async()=>{try{if(storage.read(join(options.directory,'business-v1.json'))===undefined)throw Error('Business service is not ready.');await business.initialize();if(body.action!=='view'&&body.action!=='update')throw Error('Unknown portal action.');const value=body.action==='view'?followups.portalView(body.input?.token):followups.portalUpdate(body.input);reply(res,200,{ok:true,value});}catch(error){reply(res,200,{ok:false,error:error instanceof Error?error.message:'Unable to update document.'});}}));queue=task.catch(()=>{});await task;
            }catch{reply(res,400,{ok:false,error:'Invalid portal request.'});}return;
        }
        if (req.url?.split('?')[0] !== '/api/security') {
            if (req.url?.startsWith('/api/')) { reply(res, 404, { ok: false, error: 'Unknown API route.' }); return; }
            if (!['GET', 'HEAD'].includes(req.method ?? '') || !options.staticDirectory) { reply(res, 404, { ok: false, error: 'Not found.' }); return; }
            try {
                const root = resolve(options.staticDirectory);
                const path = resolve(root, '.' + decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname));
                if (path !== root && !path.startsWith(root + sep)) throw new Error('Invalid path.');
                const file = existsSync(path) && statSync(path).isFile() ? path : join(root, 'index.html');
                const types: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
                res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'same-origin' });
                res.end(req.method === 'HEAD' ? undefined : readFileSync(file));
            } catch { reply(res, 404, { ok: false, error: 'Web build not found. Run pnpm build:web first.' }); }
            return;
        }
        const expectedOrigin = options.publicOrigin ?? `${options.secureCookie ? 'https' : 'http'}://${req.headers.host}`;
        const host = req.headers.host?.split(':')[0];
        if ((!options.publicOrigin && host !== 'localhost' && host !== '127.0.0.1') || req.method !== 'POST' || req.headers.origin !== expectedOrigin || req.headers['x-htt-request'] !== '1' || !req.headers['content-type']?.startsWith('application/json') || req.headers['sec-fetch-site'] === 'cross-site') {
            reply(res, 403, { ok: false, error: 'Invalid same-origin request.' }); return;
        }
        let raw = '', size = 0;
        try {
            for await (const chunk of req) {
                size += chunk.length;
                if (size > 60_000_000) { reply(res, 413, { ok: false, error: 'Request exceeds 60 MB.' }); return; }
                raw += chunk.toString();
            }
            const body = JSON.parse(raw);
            if (!body || typeof body.action !== 'string') throw new Error('Invalid request.');
            const action = body.action, input = body.input ?? {};
            if (typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid request input.');
            if (action === 'login' || action === 'setup') {
                const now = Date.now();
                for (const [key, entry] of attempts) if (entry.until < now) attempts.delete(key);
                const key = req.socket.remoteAddress ?? 'local';
                const entry = attempts.get(key) ?? { count: 0, until: now + 60_000 };
                attempts.set(key, entry);
                if (++entry.count > 20) { reply(res, 429, { ok: false, error: 'Too many attempts; try again in a minute.' }); return; }
            }
            const cookie = req.headers.cookie?.split(';').map(value => value.trim()).find(value => value.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
            const rotate = action === 'setup' || action === 'login';
            const sessionId = !rotate && cookie && /^[a-f0-9]{64}$/.test(cookie) ? cookie : randomBytes(32).toString('hex');
            // Repositories are synchronous and share process memory: serialize complete operations,
            // including bootstrap imports, so one request cannot inherit another user's principal.
            const task = queue.then(async () => {
                security.selectSession(sessionId);
                try {
                    const value = await dispatch(action, input);
                    res.setHeader('Set-Cookie', `${cookieName}=${action === 'logout' || action === 'password.change' ? '' : sessionId}; Path=/; HttpOnly; SameSite=Strict${options.secureCookie ? '; Secure' : ''}${action === 'logout' || action === 'password.change' ? '; Max-Age=0' : ''}`);
                    reply(res, 200, { ok: true, value });
                } catch (error) { reply(res, 200, { ok: false, error: error instanceof Error ? error.message : 'Operation failed.' }); }
                finally { security.selectSession('web-idle'); }
            });
            queue = task.catch(() => {});
            await task;
        } catch { if (!res.writableEnded) reply(res, 400, { ok: false, error: 'Invalid request.' }); }
    });
    server.requestTimeout = 120_000;
    server.headersTimeout = 15_000;
    return { server, close: () => new Promise<void>((done, reject) => {clearInterval(followupTimer);server.close(error => {void Promise.allSettled([queue,followupWork]).then(()=>{storage.close();if(error)reject(error);else done();});});}) };
}
