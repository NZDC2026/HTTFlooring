import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createWebApplication } from './app';

describe('web authentication and durable business database', () => {
    const directory = mkdtempSync(join(tmpdir(), 'htt-web-test-'));
    let app: ReturnType<typeof createWebApplication>;
    let origin = '';
    let adminCookie = '', readerCookie = '';
    const password = 'test-password-12345';
    async function request(action: string, input: unknown = {}, cookie = '') {
        const response = await fetch(origin + '/api/security', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'X-HTT-Request': '1', Cookie: cookie }, body: JSON.stringify({ action, input }) });
        return { body: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] ?? cookie, status: response.status };
    }
    async function start() {
        app = createWebApplication({ directory });
        await new Promise<void>((done, reject) => { app.server.once('error', reject); app.server.listen(0, '127.0.0.1', done); });
        const address = app.server.address();
        if (!address || typeof address === 'string') throw new Error('No server address.');
        origin = `http://127.0.0.1:${address.port}`;
    }
    beforeAll(start);
    afterAll(async () => { await app.close(); rmSync(directory, { recursive: true, force: true }); });
    it('rejects cross-origin requests and unauthenticated business access', async () => {
        expect((await fetch(origin + '/api/security', { method: 'POST', headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json', 'X-HTT-Request': '1' }, body: '{"action":"setup"}' })).status).toBe(403);
        expect((await request('business.bootstrap')).body.ok).toBe(false);
    });
    it('creates the administrator, initializes business data, and prevents another setup', async () => {
        const setup = await request('setup', { username: 'admin', displayName: 'Administrator', password });
        expect(setup.body.ok).toBe(true); adminCookie = setup.cookie;
        const bootstrap = await request('business.bootstrap', {}, adminCookie);
        expect(bootstrap.body.ok, JSON.stringify(bootstrap.body)).toBe(true);
        expect(Object.keys(bootstrap.body.value.repositories).length).toBeGreaterThan(10);
        expect((await request('setup', { username: 'other', displayName: 'Other', password })).body.ok).toBe(false);
    });
    it('previews unpaid invoice and customer statement batches without emailing or changing financial balances', async () => {
        expect((await request('invoiceReminders.view')).body.ok).toBe(false);
        const call=async(repository:string,method:string,...args:unknown[])=>{const r=await request('business.command',{repository,method,args},adminCookie);expect(r.body.ok,JSON.stringify(r.body)).toBe(true);return r.body.value.result;};
        let view=(await request('business.view',{},adminCookie)).body.value.repositories;
        const c=view.customers.customers[0],p=view.products.products[0];
        const loc=await call('customers','addLocation',c.id,{name:'Reminder test store',addressLine1:'42 Test Road',addressLine2:'',suburb:'Test',state:'NSW',postcode:'2000',country:'AU',phone:'',isPrimary:false});
        const contact=await call('customers','addContact',c.id,{firstName:'Accounts',lastName:'Test',jobTitle:'Accounts',email:'reminder@example.test',phone:'',mobile:'',locationId:loc.id,isAccounting:true,isPrimary:false});
        const draft=await call('managedSalesDocuments','save',{operationId:crypto.randomUUID(),payload:{kind:'INVOICE',customerId:c.id,locationId:loc.id,accountingContactId:contact.id,documentDate:'2026-10-10',dueDate:'2026-10-11',lines:[{productId:p.id,unitId:p.baseUnitId,quantity:2,unitPrice:100,priceBasis:'Exclusive'}]}});
        const approved=await call('managedSalesDocuments','approve',draft.id,draft.revision),posted=await call('managedSalesDocuments','post',draft.id,approved.revision);
        view=(await request('business.view',{},adminCookie)).body.value.repositories;const before=JSON.stringify([view.sales,view.customerPayments,view.customerCredits,view.journals]);
        const list=await request('invoiceReminders.view',{},adminCookie);expect(list.body.ok).toBe(true);expect(list.body.value.rows).toContainEqual(expect.objectContaining({id:posted.documentId,amount:220,email:'reminder@example.test'}));
        for(const mode of ['INVOICE','STATEMENT']){const preview=await request('invoiceReminders.preview',{mode,ids:[posted.documentId]},adminCookie);expect(preview.body.ok,JSON.stringify(preview.body)).toBe(true);expect(preview.body.value.mails[0].html).toContain(mode==='INVOICE'?'Discount':'Customer statement');expect(preview.body.value.mails[0].to).toBe('reminder@example.test');}
        view=(await request('business.view',{},adminCookie)).body.value.repositories;expect(JSON.stringify([view.sales,view.customerPayments,view.customerCredits,view.journals])).toBe(before);
    });
    it('keeps browser sessions and permissions isolated, including concurrent requests', async () => {
        expect((await request('users.create', { username: 'reader', displayName: 'Reader', password, roles: ['SALES'] }, adminCookie)).body.ok).toBe(true);
        const login = await request('login', { username: 'reader', password });
        expect(login.body.ok).toBe(true); readerCookie = login.cookie;
        const [admin, reader, anonymous] = await Promise.all([request('status', {}, adminCookie), request('status', {}, readerCookie), request('status')]);
        expect(admin.body.value.session.user.username).toBe('admin');
        expect(reader.body.value.session.user.username).toBe('reader');
        expect(anonymous.body.value.session).toBeNull();
        expect((await request('users.list', {}, readerCookie)).body.ok).toBe(false);
        expect((await request('business.command', { repository: 'unknown', method: 'anything', args: [] }, readerCookie)).body.ok).toBe(false);
        expect((await request('business.command', { repository: '__proto__', method: 'toString', args: [] }, readerCookie)).body.ok).toBe(false);
    });
    it('persists column order across login sessions without sharing it with other accounts', async () => {
        const table = 'customers';
        const order = ['status', 'customer'];
        expect((await request('preferences.columnOrder.set', { table, order })).body.ok).toBe(false);
        expect((await request('preferences.columnOrder.set', { table, order }, adminCookie)).body.value).toEqual(order);
        const secondBrowser = await request('login', { username: 'admin', password });
        expect((await request('preferences.columnOrder.get', { table }, secondBrowser.cookie)).body.value).toEqual(order);
        expect((await request('preferences.columnOrder.get', { table }, readerCookie)).body.value).toBeNull();
        expect((await request('preferences.columnOrder.set', { table, order: [] }, secondBrowser.cookie)).body.value).toEqual([]);
        expect((await request('preferences.columnOrder.get', { table }, adminCookie)).body.value).toEqual([]);
    });
    it('saves a customer delivery task against its order and persists snooze and completion', async () => {
        const assignees = await request('tasks.assignees', {}, adminCookie);
        expect(assignees.body.ok).toBe(true);
        expect((await request('tasks.assignees')).body.ok).toBe(false);
        const owner = assignees.body.value.find((staff: { displayName: string }) => staff.displayName === 'Reader');
        expect(owner).toBeDefined();
        const task = {
            name: 'Delivery · SO-2026-0001', customerId: 'cus_001', orderId: 'order_001', owner: owner.id,
            deliveryAt: '2026-11-05T10:00', deliveryAddress: 'Test delivery site', due: '2026-11-05',
            reminderAt: '2026-11-05T09:00', reminderTimeZone: 'Pacific/Auckland', priority: 'Normal', notes: 'Call on arrival',
        };
        const command = (method: string, args: unknown[], cookie = adminCookie) =>
            request('business.command', { repository: 'workspace_tasks', method, args }, cookie);
        expect((await command('save', [{ ...task, customerId: 'cus_002' }])).body.ok).toBe(false);
        expect((await command('save', [{ ...task, owner: 'nonexistent' }])).body.ok).toBe(false);
        const saved = await command('save', [task]);
        expect(saved.body.ok, JSON.stringify(saved.body)).toBe(true);
        const created = saved.body.value.result;
        const snoozed = await command('save', [{ ...created, snoozedUntil: '2026-11-04T20:15:00.000Z' }, created.revision], readerCookie);
        expect(snoozed.body.ok, JSON.stringify(snoozed.body)).toBe(true);
        expect(snoozed.body.value.result.snoozedUntil).toBe('2026-11-04T20:15:00.000Z');
        const completed = await command('setStatus', [created.id, 'Completed', snoozed.body.value.result.revision], readerCookie);
        expect(completed.body.ok, JSON.stringify(completed.body)).toBe(true);
        const view = await request('business.view', {}, adminCookie);
        expect(view.body.value.repositories.workspace_tasks.records).toContainEqual(expect.objectContaining({ id: created.id, status: 'Completed', completedBy: owner.id }));
    });
    it('records who wrote, replied to, and resolved a customer note', async () => {
        const add = (input: Record<string, unknown>, cookie = adminCookie) =>
            request('business.command', {
                repository: 'customers', method: 'addNote',
                args: [{ customerId: 'cus_001', source: 'Desktop', operationId: crypto.randomUUID(), ...input }],
            }, cookie);
        const created = await add({ text: 'Arrange a delivery follow-up.' });
        expect(created.body.ok, JSON.stringify(created.body)).toBe(true);
        const original = created.body.value.result;
        expect(original.actorName).toBe('Administrator');
        expect((await add({ customerId: 'cus_002', text: 'Wrong customer', action: 'reply', threadId: original.id }, readerCookie)).body.ok).toBe(false);
        const reply = await add({ text: 'Called the customer.', action: 'reply', threadId: original.id }, readerCookie);
        expect(reply.body.value.result).toMatchObject({ actorName: 'Reader', action: 'reply', threadId: original.id });
        const resolved = await add({ text: 'Marked resolved', action: 'resolve', threadId: original.id });
        expect(resolved.body.value.result).toMatchObject({ actorName: 'Administrator', action: 'resolve', threadId: original.id });
        expect((await add({ text: 'Late reply', action: 'reply', threadId: original.id }, readerCookie)).body.ok).toBe(false);
        const view = await request('business.view', {}, readerCookie);
        const customer = view.body.value.repositories.customers.customers.find((row: { id: string }) => row.id === 'cus_001');
        expect(customer.notes).toEqual(expect.arrayContaining([
            expect.objectContaining({ id: original.id, actorName: 'Administrator' }),
            expect.objectContaining({ action: 'reply', actorName: 'Reader' }),
            expect.objectContaining({ action: 'resolve', actorName: 'Administrator' }),
        ]));
    });
    it('persists a business mutation and user accounts across a server restart', async () => {
        const targets = await request('business.command', { repository: 'customers', method: 'create', args: [{}] }, adminCookie);
        // Malformed writes fail validation instead of damaging the database.
        expect(targets.body.ok).toBe(false);
        const created = await request('business.command', { repository: 'customers', method: 'create', args: [{ businessName: 'Persistent web customer', tradingName: '', abn: '', businessType: 'Builder', status: 'ACTIVE', email: '', phone: '', website: '', creditLimit: 1000, paymentTermsDays: 30 }] }, adminCookie);
        expect(created.body.ok, JSON.stringify(created.body)).toBe(true);
        expect(created.body.value.result.businessName).toBe('Persistent web customer');
        const uploaded = await request('attachments.select', { operationId: crypto.randomUUID(), expectedRevision: 0, target: { kind: 'Customer', id: created.body.value.result.id }, title: 'Web attachment', reason: 'Verify web upload', file: { name: 'example.txt', content: Buffer.from('persistent web attachment').toString('base64') } }, adminCookie);
        expect(uploaded.body.ok, JSON.stringify(uploaded.body)).toBe(true);
        const attachment = uploaded.body.value.view.repositories.attachments.documents.find((row: any) => row.title === 'Web attachment');
        expect(attachment).toBeDefined();
        const exported = await request('attachments.export', { id: attachment.id, versionId: attachment.versions[0].id }, adminCookie);
        expect(exported.body.ok, JSON.stringify(exported.body)).toBe(true);
        expect(Buffer.from(exported.body.value.download.content, 'base64').toString()).toBe('persistent web attachment');
        const backup = await request('business.backup.save', {}, adminCookie);
        expect(backup.body.ok).toBe(true);
        const before = backup.body.value.download.repositories;
        await app.close(); await start();
        expect((await request('status', {}, adminCookie)).body.value.session).toBeNull();
        const login = await request('login', { username: 'admin', password }); adminCookie = login.cookie;
        expect(login.body.ok).toBe(true);
        expect((await request('business.bootstrap', {}, adminCookie)).body.ok).toBe(true);
        const after = await request('business.backup.save', {}, adminCookie);
        expect(after.body.value.download.repositories).toEqual(before);
        expect((await request('users.list', {}, adminCookie)).body.value).toHaveLength(2);
    });
    it('logs out only the current browser and rejects incorrect passwords', async () => {
        const login = await request('login', { username: 'reader', password }); readerCookie = login.cookie;
        expect((await request('logout', {}, readerCookie)).body.ok).toBe(true);
        expect((await request('status', {}, readerCookie)).body.value.session).toBeNull();
        expect((await request('status', {}, adminCookie)).body.value.session.user.username).toBe('admin');
        expect((await request('login', { username: 'admin', password: 'incorrect' })).body.ok).toBe(false);
    });
    it('secures follow-up settings and rejects untrusted portal origins and links',async()=>{
        const config={enabled:false,from:'dispatch@example.invalid',notificationEmail:'manager@example.invalid',portalOrigin:'https://portal.example.invalid',timezone:'Australia/Melbourne'};
        expect((await request('dispatchFollowups.configure',config,adminCookie)).body.ok).toBe(true);
        expect((await request('dispatchFollowups.view',{},adminCookie)).body.value.configuration.enabled).toBe(false);
        const login=await request('login',{username:'reader',password});readerCookie=login.cookie;
        expect((await request('dispatchFollowups.configure',config,readerCookie)).body.ok).toBe(false);
        expect((await request('dispatchFollowups.reservations',{},readerCookie)).body.ok).toBe(true);
        expect((await request('dispatchFollowups.view')).body.ok).toBe(false);
        const portal=(originHeader:string)=>fetch(origin+'/api/dispatch-portal',{method:'POST',headers:{Origin:originHeader,'Content-Type':'application/json','X-HTT-Request':'1'},body:JSON.stringify({action:'view',input:{token:'0'.repeat(64)}})});
        expect((await portal('https://evil.example')).status).toBe(403);
        const allowed=await portal(config.portalOrigin);expect(allowed.headers.get('access-control-allow-origin')).toBe(config.portalOrigin);expect((await allowed.json()).ok).toBe(false);
        expect((await request('status',{},adminCookie)).body.value.session.user.username).toBe('admin');
    });

});
