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
    expect(host.exportBackup().schemaVersion).toBe(35);
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
it('persists company payment details and freezes them in prepared sales copies',async()=>{const {businessSettings}=await import('../business-workspace/configurationState');const row=state('workspace_settings').records.find((r:any)=>r.section==='business')??{...businessSettings(),name:'Sample company settings',section:'business',status:'Active'},saved=cmd('workspace_settings','save',{...row,paymentAccountName:'Sample HTT <Company>',paymentBankName:'Sample Bank',paymentBsb:'000-000',paymentAccountNumber:'00001234',paymentInstructions:'Sample only — quote document number.'},row.revision),i=invoice(),a=prepare(i);expect(a.issuer.paymentDetails.accountNumber).toBe('00001234');const {renderOutputHtml}=await import('./outputHtml');const html=renderOutputHtml(a);expect(html).toContain('Payment Details');expect(html).toContain('Sample HTT &lt;Company&gt;');expect(html).toContain('Reference: '+i.documentNumber.match(/(\d+)$/)[1]);expect(html).not.toContain('Reference: '+i.documentNumber);cmd('workspace_settings','save',{...saved,paymentAccountNumber:'00005678'},saved.revision);expect(state('preparedSalesOutputs').artifacts.find((v:any)=>v.id===a.id).issuer.paymentDetails.accountNumber).toBe('00001234');await restart();expect(state('workspace_settings').records.find((r:any)=>r.section==='business').paymentAccountNumber).toBe('00005678');expect(state('preparedSalesOutputs').artifacts.find((v:any)=>v.id===a.id).issuer.paymentDetails.accountNumber).toBe('00001234');});
it.each(['ORDER','INVOICE'] as const)('persists entered discounts through %s approval, posting, restart and printable output',async kind=>{
 const payload={...sales(kind),lines:sales(kind).lines.map(l=>({...l,discountPercent:10}))};
 const draft=cmd('managedSalesDocuments','save',{operationId:crypto.randomUUID(),payload});expect(draft.lines[0].unitPrice).toBe(90);expect(draft.totals).toEqual({subtotal:180,taxAmount:18,total:198});
 await restart();const saved=state('managedSalesDocuments').drafts?.find((d:any)=>d.id===draft.id);if(saved)expect(saved.payload.lines[0].discountPercent).toBe(10);
 const approved=cmd('managedSalesDocuments','approve',draft.id,draft.revision),posted=cmd('managedSalesDocuments','post',draft.id,approved.revision),doc=(kind==='ORDER'?state('sales').salesOrders:state('sales').invoices).find((d:any)=>d.id===posted.documentId);
 expect(doc.lines[0].explicitDiscountPercent).toBe(10);expect(doc.lines[0].discountBaseUnitPrice).toBe(100);const a=prepare(doc);expect(a.lines[0].discountPercent).toBe(10);expect(a.lines[0].standardUnitPrice).toBe(100);expect(a.totals.total).toBe(198);await restart();expect(state('preparedSalesOutputs').artifacts.find((p:any)=>p.id===a.id).lines[0].discountPercent).toBe(10);
});
it('validates discount range and recalculates inclusive GST without applying discount twice',()=>{
 for(const discountPercent of [-1,101,NaN])expect(()=>cmd('managedSalesDocuments','save',{operationId:crypto.randomUUID(),payload:{...sales(),lines:sales().lines.map(l=>({...l,discountPercent}))}})).toThrow();
 const d=cmd('managedSalesDocuments','save',{operationId:crypto.randomUUID(),payload:{...sales(),lines:sales().lines.map(l=>({...l,unitPrice:110,priceBasis:'Inclusive',discountPercent:10}))}});expect(d.totals).toEqual({subtotal:180,taxAmount:18,total:198});
});
it('retains entered quote discount through conversion to order and invoice',async()=>{
 const q=cmd('sales','createQuote',{...sales('ORDER'),lines:sales('ORDER').lines.map(l=>({...l,discountPercent:25}))});expect(q.totals).toEqual({subtotal:150,taxAmount:15,total:165});cmd('sales','sendQuote',q.id);cmd('sales','acceptQuote',q.id);const o=cmd('sales','convertQuoteToOrder',q.id),i=cmd('sales','createInvoiceFromOrder',o.id);for(const d of [q,o,i]){expect(d.lines[0].explicitDiscountPercent).toBe(25);expect(prepare([...state('sales').quotes,...state('sales').salesOrders,...state('sales').invoices].find((v:any)=>v.id===d.id)).lines[0].discountPercent).toBe(25);}await restart();expect(state('sales').invoices.find((d:any)=>d.id===i.id).totals.total).toBe(165);
});
it('credits the original discounted invoice proportionally, ignores replacement discounts and prints the inherited rate',async()=>{
 const payload={...sales(),lines:sales().lines.map(l=>({...l,discountPercent:20}))},draft=cmd('managedSalesDocuments','save',{operationId:crypto.randomUUID(),payload}),approved=cmd('managedSalesDocuments','approve',draft.id,draft.revision),posted=cmd('managedSalesDocuments','post',draft.id,approved.revision),i=state('sales').invoices.find((d:any)=>d.id===posted.documentId);
 const c=cmd('sales','createCreditNoteFromInvoice',{invoiceId:i.id,creditDate:'2026-10-11',reason:'Return discounted unit',lines:[{...i.lines[0],quantity:1,explicitDiscountPercent:99,unitPrice:1}]});
 expect(c.lines[0].explicitDiscountPercent).toBe(20);expect(c.lines[0].unitPrice).toBe(80);expect(c.totals).toEqual({subtotal:80,taxAmount:8,total:88});const a=cmd('preparedSalesOutputs','prepare',{operationId:crypto.randomUUID(),kind:'CREDIT_NOTE',sourceId:c.id,expectedUpdatedAt:c.updatedAt});expect(a.lines[0].discountPercent).toBe(20);expect(a.lines[0].standardUnitPrice).toBe(100);const {renderOutputHtml}=await import('./outputHtml');const html=renderOutputHtml(a);expect(html).toContain('20%');expect(html).toContain('Source Invoice');expect(html).toContain(i.documentNumber);expect(html).toContain('$88.00');
 const rest=cmd('sales','createCreditNoteFromInvoice',{invoiceId:i.id,creditDate:'2026-10-12',reason:'Return final unit',lines:[{...i.lines[0],quantity:1}]});expect(rest.totals.total+c.totals.total).toBe(i.totals.total);await restart();expect(state('customerCredits').creditNotes.find((r:any)=>r.id===c.id).lines[0].explicitDiscountPercent).toBe(20);
});
it('links internal tasks to saved quotes and sales drafts without leaking instructions into customer output',async()=>{
 const q=cmd('sales','createQuote',{...sales('ORDER'),notes:'Customer note: thank you for your order.'});
 const draft=cmd('managedSalesDocuments','save',{operationId:crypto.randomUUID(),payload:sales('ORDER')});
 const base={name:'Confirm access internally',customerId:q.customerId,owner:security.principal()!.userId,due:'2026-11-10',priority:'Normal',notes:'STAFF_ONLY_ACCESS_CODE_123',status:'Open'};
 const task=cmd('workspace_tasks','save',{...base,sourceQuoteId:q.id}),dt=cmd('workspace_tasks','save',{...base,name:'Draft dispatch check',sourceSalesDraftId:draft.id});expect(task.sourceQuoteId).toBe(q.id);expect(dt.sourceSalesDraftId).toBe(draft.id);
 const other=state('customers').customers.find((c:any)=>c.id!==q.customerId);if(other)expect(()=>cmd('workspace_tasks','save',{...base,customerId:other.id,sourceQuoteId:q.id})).toThrow(/quote.*customer/);
 const artifact=cmd('preparedSalesOutputs','prepare',{operationId:crypto.randomUUID(),kind:'QUOTE',sourceId:q.id,expectedUpdatedAt:q.updatedAt}),{renderOutputHtml}=await import('./outputHtml');expect(renderOutputHtml(artifact)).toContain('Customer note: thank you');expect(renderOutputHtml(artifact)).not.toContain('STAFF_ONLY_ACCESS_CODE_123');
 await restart();expect(state('workspace_tasks').records.find((r:any)=>r.id===task.id).sourceQuoteId).toBe(q.id);expect(state('workspace_tasks').records.find((r:any)=>r.id===dt.id).sourceSalesDraftId).toBe(draft.id);
});

it('preserves document COD override through conversion, restart and print without changing customer terms',async()=>{
 const customer=structuredClone(state('customers').customers[0]);
 const q=cmd('sales','createQuote',{...sales('ORDER'),paymentTerms:{paymentTermsType:'COD',paymentTermsDays:0}});
 cmd('sales','sendQuote',q.id);cmd('sales','acceptQuote',q.id);
 const o=cmd('sales','convertQuoteToOrder',q.id),i=cmd('sales','createInvoiceFromOrder',o.id);
 for(const d of [q,o,i])expect(d.paymentTerms).toEqual({paymentTermsType:'COD',paymentTermsDays:0});
 expect(i.dueDate).toBe(i.documentDate);expect(prepare(i).paymentTerms).toBe('COD');
 expect(state('customers').customers[0]).toEqual(customer);
 await restart();expect(state('sales').invoices.find((d:any)=>d.id===i.id).paymentTerms.paymentTermsType).toBe('COD');
});
it('persists managed invoice End Of Month terms and prints the saved selection',async()=>{
 const payload={...sales(),paymentTerms:{paymentTermsType:'DAY_OF_MONTH',paymentTermsDays:30},dueDate:'2026-11-30'};
 const draft=cmd('managedSalesDocuments','save',{operationId:crypto.randomUUID(),payload});
 expect(draft.payload.paymentTerms).toEqual(payload.paymentTerms);
 const a=cmd('managedSalesDocuments','approve',draft.id,draft.revision),posted=cmd('managedSalesDocuments','post',draft.id,a.revision),i=state('sales').invoices.find((d:any)=>d.id===posted.documentId);
 expect(i.paymentTerms).toEqual(payload.paymentTerms);expect(prepare(i).paymentTerms).toContain('30 End Of Month');
 expect(()=>cmd('sales','createQuote',{...sales('ORDER'),paymentTerms:{paymentTermsType:'COD',paymentTermsDays:30}})).toThrow();
});
