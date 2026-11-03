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
    configureCaptureHelper(resolve(process.env.HTT_OCR_HELPER || 'dist-ocr/htt-ocr'));
    const storage = new WebStorage(options.directory);
    const security = new LocalSecurity(join(options.directory, 'security-v1.json'),
        (path, value) => storage.write(path, value), () => Date.now(),
        path => { const text = storage.read(path); return text === undefined ? undefined : JSON.parse(text); });
    const business = new BusinessHost(join(options.directory, 'business-v1.json'), security, storage);
    business.restrictToApprovedScope();
    let queue = Promise.resolve();
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
            case 'business.command': assertApprovedDesktopCommand(input); return business.command(input);
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
    return { server, close: () => new Promise<void>((done, reject) => server.close(error => { storage.close(); if (error) reject(error); else done(); })) };
}
