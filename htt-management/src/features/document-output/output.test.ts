import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
let root: string, security: InstanceType<typeof import('../../../electron/security/localSecurity').LocalSecurity>, host: InstanceType<typeof import('../../../electron/security/businessHost').BusinessHost>;
const admin = { username: 'documents.admin', displayName: 'Document acceptance', password: 'Documents-test-password-4821' };
async function restart() { vi.resetModules(); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.login(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); }
beforeEach(async () => { vi.resetModules(); vi.stubGlobal('__HTT_MAIN_HOST__', true); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined); root = mkdtempSync(join(tmpdir(), 'htt-direct-docs-')); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.setup(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); rmSync(root, { recursive: true, force: true }); });
const cmd = (repository: string, method: string, ...args: unknown[]) => host.command({ repository, method, args }).result as any;
const state = (key: string) => host.view().repositories[key] as any;
const date = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Pacific/Auckland' });
function sales(kind: 'ORDER' | 'INVOICE' = 'INVOICE') { const product = state('products').products[0], customer = state('customers').customers[0]; return { kind, customerId: customer.id, documentDate: '2026-10-10', dueDate: '2026-11-10', customerReference: 'Direct example', lines: [{ productId: product.id, unitId: product.baseUnitId, quantity: 2, unitPrice: 100, priceBasis: 'Exclusive' as const }] }; }
function postSales(kind: 'ORDER' | 'INVOICE' = 'INVOICE') { const draft = cmd('managedSalesDocuments', 'save', { operationId: 'sales-' + crypto.randomUUID(), payload: sales(kind) }); const approved = cmd('managedSalesDocuments', 'approve', draft.id, draft.revision); return cmd('managedSalesDocuments', 'post', draft.id, approved.revision); }
async function role(name: 'SALES' | 'WAREHOUSE' | 'PURCHASING' | 'ACCOUNTANT' | 'FINANCE_ADMIN' | 'AUDITOR') { security.login(admin); const user = security.createUser({ username: 'documents.' + name.toLowerCase(), displayName: name, password: admin.password, roles: [name] }); security.login({ username: user.username, password: admin.password }); }
function invoice() { const posted = postSales(); return state('sales').invoices.find((i: any) => i.id === posted.documentId); }
function request(i: any, operationId: string = crypto.randomUUID()) { return { operationId, sourceId: i.id, kind: i.type as 'INVOICE', expectedUpdatedAt: i.updatedAt }; }
function prepare(i: any, operationId?: string) { return cmd('preparedSalesOutputs', 'prepare', request(i, operationId)); }
function reseal(b: any) { delete b.checksum; b.checksum = createHash('sha256').update(JSON.stringify(b)).digest('hex'); return JSON.stringify(b); }
it('prepares a main-owned immutable invoice with issuer, source lines and totals, without posting or sending', () => {
    const i = invoice(), journals = state('journals').journalEntries.length, a = prepare(i);
    expect(a).toMatchObject({ sourceId: i.id, kind: 'INVOICE', documentNumber: i.documentNumber, status: 'ISSUED', amountPaid: 0, amountDue: 220, totals: i.totals });
    expect(a.lines[0]).toMatchObject({ quantity: 2, unitPrice: 100, lineSubtotal: 200, taxAmount: 20, lineTotal: 220 });
    expect(a.preparedBy).toBe(security.principal()!.userId);
    expect(state('journals').journalEntries).toHaveLength(journals);
    expect(state('sales').invoices.find((v: any) => v.id === i.id).status).toBe('ISSUED');
    expect(a).not.toHaveProperty('sentAt');
});
it('retries one operation without creating another output and rejects changed request data', () => {
    const i = invoice(), r = request(i), a = cmd('preparedSalesOutputs', 'prepare', r);
    expect(cmd('preparedSalesOutputs', 'prepare', r).id).toBe(a.id);
    expect(() => cmd('preparedSalesOutputs', 'prepare', { ...r, sourceId: 'different' })).toThrow(/different/);
    expect(state('preparedSalesOutputs').artifacts).toHaveLength(1);
});
it('retains past status and balance after source void and regenerates as a new version', async () => {
    const i = invoice(), a = prepare(i);
    cmd('sales', 'voidInvoice', i.id, 'Incorrect invoice');
    const current = state('sales').invoices.find((v: any) => v.id === i.id), b = prepare(current);
    expect(a.status).toBe('ISSUED');
    expect(b.status).toBe('VOID');
    expect(a.id).not.toBe(b.id);
    await restart();
    expect(state('preparedSalesOutputs').artifacts.find((v: any) => v.id === a.id)).toMatchObject({ status: 'ISSUED', amountDue: 220 });
    expect(state('preparedSalesOutputs').artifacts).toHaveLength(2);
});
it('rejects a stale source, unknown document and forged renderer snapshot fields', () => {
    const i = invoice();
    cmd('sales', 'voidInvoice', i.id, 'Incorrect invoice');
    expect(() => prepare(i)).toThrow(/changed/);
    expect(() => cmd('preparedSalesOutputs', 'prepare', { ...request(i), sourceId: 'missing' })).toThrow(/not found/);
    expect(() => cmd('preparedSalesOutputs', 'prepare', { ...request(i), totals: { total: 1 } })).toThrow();
});
it('renders configured template tokens and keeps old content after template edits', async () => {
    const i = invoice(), t = cmd('workspace_templates', 'save', { name: 'Accounts template', status: 'Active', kind: 'Invoice', subject: 'Invoice {{documentNumber}} for {{customerName}}', body: '{{companyName}} · {{currency}} {{total}} due {{dueDate}}', footer: 'Thank you {{customerName}}', paper: 'Letter', logo: 'Left' }), r = { ...request(i), templateId: t.id }, a = cmd('preparedSalesOutputs', 'prepare', r);
    expect(a.subject).toContain(i.documentNumber);
    expect(a.body).toContain('AUD 220.00');
    expect(a.template).toMatchObject({ paper: 'Letter', revision: t.revision });
    cmd('workspace_templates', 'save', { ...t, body: 'Updated body', footer: 'Updated footer' }, t.revision);
    const b = cmd('preparedSalesOutputs', 'prepare', { ...r, operationId: crypto.randomUUID() });
    expect(b.body).toBe('Updated body');
    expect(a.body).not.toBe(b.body);
    await restart();
    expect(state('preparedSalesOutputs').artifacts.find((v: any) => v.id === a.id).body).toBe(a.body);
});
it('rejects inactive or mismatched templates and unknown merge fields without saving partial output', () => {
    const i = invoice(), t = cmd('workspace_templates', 'save', { name: 'Quote only', status: 'Active', kind: 'Quotation', subject: 'Test', body: 'Test' });
    expect(() => cmd('preparedSalesOutputs', 'prepare', { ...request(i), templateId: t.id })).toThrow(/active template/);
    const bad = cmd('workspace_templates', 'save', { name: 'Bad field', status: 'Active', kind: 'Invoice', subject: '{{secret}}', body: 'Test' });
    expect(() => cmd('preparedSalesOutputs', 'prepare', { ...request(i), templateId: bad.id })).toThrow(/Unsupported template token/);
    expect(state('preparedSalesOutputs').artifacts).toEqual([]);
});
it('supports quote, order and credit output with draft/void labels and original credit amounts', async () => {
    const q = cmd('sales', 'createQuote', sales('ORDER')), a = cmd('preparedSalesOutputs', 'prepare', { ...request(q), kind: 'QUOTE' });
    expect(a.status).toBe('DRAFT');
    const { renderOutputHtml } = await import('./outputHtml');
    expect(renderOutputHtml(a)).toContain('DRAFT — NOT ISSUED');
    cmd('sales', 'sendQuote', q.id);
    cmd('sales', 'acceptQuote', q.id);
    const o = cmd('sales', 'convertQuoteToOrder', q.id);
    expect(cmd('preparedSalesOutputs', 'prepare', { ...request(o), kind: 'SALES_ORDER' }).kind).toBe('SALES_ORDER');
    const i = cmd('sales', 'createInvoiceFromOrder', o.id), credit = cmd('sales', 'createCreditNoteFromInvoice', { invoiceId: i.id, creditDate: date(), reason: 'Return one unit', lines: [{ ...i.lines[0], quantity: 1 }] });
    expect(cmd('preparedSalesOutputs', 'prepare', { operationId: crypto.randomUUID(), sourceId: credit.id, kind: 'CREDIT_NOTE', expectedUpdatedAt: credit.updatedAt })).toMatchObject({ documentNumber: credit.creditNoteNumber, notes: 'Return one unit', totals: { total: 110 } });
});
it('preserves source recipient and area snapshots without adopting later contact master changes', () => {
    const c = state('customers').customers[0], loc = cmd('customers', 'addLocation', c.id, { name: 'Store A', addressLine1: '42 Example Road', addressLine2: '', suburb: 'Test', state: 'Auckland', postcode: '1010', country: 'NZ', phone: '', isPrimary: true }), values = { firstName: 'Accounts', lastName: 'Team', jobTitle: 'Accounts', email: 'accounts@example.test', phone: '', mobile: '', locationId: loc.id, isAccounting: true, isPrimary: false }, contact = cmd('customers', 'addContact', c.id, values), product = state('products').products[0], unit = product.units.find((u: any) => u.code === 'BOX');
    const q = cmd('sales', 'createQuote', { ...sales('ORDER'), locationId: loc.id, accountingContactId: contact.id, lines: [{ productId: product.id, unitId: unit.id, quantity: 1, requestedArea: 5, unitPrice: 100, priceBasis: 'Exclusive' }] });
    cmd('customers', 'updateContact', c.id, contact.id, { ...values, email: 'new@example.test' });
    const a = cmd('preparedSalesOutputs', 'prepare', { ...request(q), kind: 'QUOTE' });
    expect(a.recipient.accountingEmail).toBe('accounts@example.test');
    expect(a.lines[0]).toMatchObject({ requestedArea: 5, quantity: 3, coveredArea: 6.498 });
});
it('does not fabricate a recipient for legacy documents', () => {
    const i = state('sales').invoices[0];
    expect(prepare(i).recipient).toBeUndefined();
});
it('escapes malicious customer/template/description strings and restricts printable content', async () => {
    const i = invoice(), t = cmd('workspace_templates', 'save', { name: 'Escaping', status: 'Active', kind: 'Invoice', subject: '<script>alert(1)</script>', body: 'Test', footer: '<img src="https://example.test/x" onerror="alert(1)">' }), a = cmd('preparedSalesOutputs', 'prepare', { ...request(i), templateId: t.id }), { renderOutputHtml, outputFileName } = await import('./outputHtml'), html = renderOutputHtml(a);
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<script');
    expect(html).toContain('&lt;img');
    expect(html).toContain("default-src 'none'");
    expect(html).toContain('@page{size:A4');
    expect(outputFileName({ ...a, documentNumber: '../../invoice/<script>' })).not.toContain('/');
    expect(a.lines[0]).not.toHaveProperty('cost');
});
it('rejects malformed saved totals and invalid source references before backup restore', () => {
    const i = invoice(), a = prepare(i), b = host.exportBackup() as any;
    b.repositories.preparedSalesOutputs.artifacts[0].totals.total = 1;
    expect(() => host.prepareRestore(reseal(b))).toThrow(/totals/);
    const c = host.exportBackup() as any;
    c.repositories.preparedSalesOutputs.artifacts[0].sourceId = 'missing';
    const raw = JSON.parse(a.requestFingerprint);
    raw.sourceId = 'missing';
    c.repositories.preparedSalesOutputs.artifacts[0].requestFingerprint = JSON.stringify(raw);
    expect(() => host.prepareRestore(reseal(c))).toThrow(/source reference/);
});
it('migrates schema 7 while retaining sources and initializing empty prepared history', async () => {
    const i = invoice(), b = host.exportBackup() as any;
    delete b.repositories.preparedSalesOutputs;
    b.schemaVersion = 7;
    writeFileSync(join(root, 'business.json'), reseal(b));
    await restart();
    expect(host.exportBackup().schemaVersion).toBe(20);
    expect(state('preparedSalesOutputs').artifacts).toEqual([]);
    expect(state('sales').invoices.some((v: any) => v.id === i.id)).toBe(true);
    prepare(state('sales').invoices.find((v: any) => v.id === i.id));
});
it('allows sales preparation without exposing template maintenance or finance-only settings', async () => {
    const i = invoice();
    await role('SALES');
    const a = prepare(i);
    expect(a.documentNumber).toBe(i.documentNumber);
    expect(state('workspace_templates').records).toEqual([]);
    expect(() => cmd('workspace_templates', 'save', { name: 'Denied', status: 'Active', kind: 'Invoice', subject: 'x', body: 'x' })).toThrow(/Permission denied/);
});
it('keeps prepared outputs out of warehouse view and rejects preparation', async () => {
    const i = invoice();
    prepare(i);
    await role('WAREHOUSE');
    expect(state('preparedSalesOutputs')).toEqual({ artifacts: [], templates: [] });
    expect(() => prepare(i)).toThrow(/Permission denied/);
});
it('gives auditors read-only history and accounting users preparation access', async () => {
    const i = invoice();
    prepare(i);
    await role('AUDITOR');
    expect(state('preparedSalesOutputs').artifacts).toHaveLength(1);
    expect(() => prepare(i)).toThrow(/Permission denied/);
    await role('ACCOUNTANT');
    expect(prepare(i).sourceId).toBe(i.id);
});
it('audits successful preparation with the trusted actor and does not mark delivery', () => {
    const i = invoice(), a = prepare(i), audit = security.listAudit({ query: 'preparedSalesOutputs.prepare', limit: 100 });
    expect(audit.rows.some(r => r.outcome === 'SUCCESS' && r.actorId === a.preparedBy)).toBe(true);
    expect(state('sales').invoices.find((v: any) => v.id === i.id)).not.toHaveProperty('sentAt');
});
it('rolls back prepared history when the durable commit fails', () => { const i = invoice(), before = state('preparedSalesOutputs').artifacts.length, spy = vi.spyOn(host as any, 'persist').mockImplementation(() => { throw new Error('Synthetic output persistence failure'); }); expect(() => prepare(i)).toThrow(/Synthetic output persistence/); spy.mockRestore(); expect(state('preparedSalesOutputs').artifacts).toHaveLength(before); });
