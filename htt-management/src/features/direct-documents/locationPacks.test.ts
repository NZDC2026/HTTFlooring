import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
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
async function role(name: 'SALES' | 'WAREHOUSE' | 'PURCHASING' | 'ACCOUNTANT' | 'FINANCE_ADMIN' | 'AUDITOR') { security.login(admin); const user = security.createUser({ username: 'documents.' + name.toLowerCase(), displayName: name, password: admin.password, roles: [name] }); security.login({ username: user.username, password: admin.password }); }
async function stock() { const { inventorySiteRepository } = await import('../inventory/data/inventorySiteRepository'), product = state('products').products[0], site = inventorySiteRepository.getActive()[0]; const po = cmd('purchaseOrders', 'create', { supplierId: state('suppliers').suppliers[0].id, orderDate: '2026-10-08', lines: [{ productId: product.id, unitId: product.baseUnitId, orderedQuantity: 10, unitCost: 10 }] }); cmd('purchaseOrders', 'approve', po.id); cmd('purchaseOrders', 'send', po.id); cmd('goodsReceipts', 'create', { purchaseOrderId: po.id, siteId: site.id, receiptDate: '2026-10-09', lines: [{ purchaseOrderLineId: po.lines[0].id, receivedQuantity: 10 }] }); return { product, site }; }
function packPayload(kind: 'ORDER' | 'INVOICE' = 'INVOICE') {
    const p = state('products').products.find((p: any) => p.units.some((u: any) => u.code === 'BOX') && p.units.find((u: any) => u.id === p.baseUnitId)?.code === 'M2'), u = p.units.find((u: any) => u.code === 'BOX');
    return { ...sales(kind), lines: [{ productId: p.id, unitId: u.id, quantity: 999, requestedArea: 4, unitPrice: 55, priceBasis: 'Inclusive' as const }] };
}
function recipient() {
    const c = state('customers').customers[0];
    const location = cmd('customers', 'addLocation', c.id, { name: 'Test store', addressLine1: '42 Test Road', addressLine2: '', suburb: 'Test suburb', state: 'Auckland', postcode: '1010', country: 'NZ', phone: '', isPrimary: true });
    const values = { firstName: 'Accounts', lastName: 'Test', jobTitle: 'Accounts', email: 'accounts@example.test', phone: '', mobile: '', locationId: location.id, isPrimary: false, isAccounting: true };
    const contact = cmd('customers', 'addContact', c.id, values);
    return { customerId: c.id, location, contact, values };
}
function postPack(kind: 'ORDER' | 'INVOICE' = 'INVOICE') { const d = cmd('managedSalesDocuments', 'save', { operationId: crypto.randomUUID(), payload: packPayload(kind) }), a = cmd('managedSalesDocuments', 'approve', d.id, d.revision); return cmd('managedSalesDocuments', 'post', d.id, a.revision); }
it('ceil area into packs authoritatively and price whole packs including tax', () => {
    const d = cmd('managedSalesDocuments', 'save', { operationId: 'area', payload: packPayload() }), p = state('products').products.find((p: any) => p.id === d.lines[0].productId), size = p.units.find((u: any) => u.id === d.lines[0].unitId).conversionToBase;
    expect(d.lines[0]).toMatchObject({ quantity: Math.ceil(4 / size), requestedArea: 4, areaPerPack: size, coveredArea: Math.round(Math.ceil(4 / size) * size * 1e8) / 1e8 });
    expect(d.totals.total).toBe(d.lines[0].quantity * 55);
    expect(d.totals.subtotal + d.totals.taxAmount).toBe(d.totals.total);
});
it('uses selected store and accounting contact snapshots throughout quote order invoice and credit', async () => {
    const r = recipient(), payload = packPayload(), quote = cmd('sales', 'createQuote', { ...payload, kind: undefined, locationId: r.location.id, accountingContactId: r.contact.id }), saved = structuredClone(quote.recipient);
    cmd('customers', 'updateLocation', r.customerId, r.location.id, { ...r.location, name: 'Renamed store', addressLine1: 'Changed', addressLine2: '', phone: '' });
    cmd('customers', 'updateContact', r.customerId, r.contact.id, { ...r.values, email: 'changed@example.test' });
    cmd('sales', 'sendQuote', quote.id);
    cmd('sales', 'acceptQuote', quote.id);
    const order = cmd('sales', 'convertQuoteToOrder', quote.id), invoice = cmd('sales', 'createInvoiceFromOrder', order.id);
    expect(order.recipient).toEqual(saved);
    expect(invoice.recipient).toEqual(saved);
    expect(invoice.lines).toEqual(quote.lines);
    const credit = cmd('sales', 'createCreditNoteFromInvoice', { invoiceId: invoice.id, creditDate: date(), reason: 'Return one pack', lines: [{ ...invoice.lines[0], quantity: 1 }] });
    expect(credit.recipient).toEqual(saved);
    expect(credit.lines[0].requestedArea).toBeUndefined();
    expect(credit.lines[0].coveredArea).toBe(invoice.lines[0].areaPerPack);
    await restart();
    expect(state('sales').invoices.find((i: any) => i.id === invoice.id).recipient).toEqual(saved);
});
it('supports editing quote area and retains existing recipient when caller omits selection', () => {
    recipient();
    const q = cmd('sales', 'createQuote', packPayload('ORDER'));
    const line = q.lines[0], edit = { documentDate: q.documentDate, lines: [{ ...line, lineId: line.id, quantity: 1, requestedArea: 6 }] };
    const changed = cmd('sales', 'updateDraftQuote', q.id, edit);
    expect(changed.lines[0].quantity).toBe(Math.ceil(6 / line.areaPerPack));
    expect(changed.lines[0].requestedArea).toBe(6);
    expect(changed.recipient).toEqual(q.recipient);
});
it('keeps managed approved recipient snapshots after master changes and reload', async () => {
    const r = recipient(), d = cmd('managedSalesDocuments', 'save', { operationId: 'recipient', payload: packPayload() }), saved = d.recipient;
    cmd('customers', 'updateContact', r.customerId, r.contact.id, { ...r.values, email: 'changed@example.test', isAccounting: false });
    const a = cmd('managedSalesDocuments', 'approve', d.id, d.revision), posted = cmd('managedSalesDocuments', 'post', d.id, a.revision), invoice = state('sales').invoices.find((i: any) => i.id === posted.documentId);
    expect(invoice.recipient).toEqual(saved);
    await restart();
    expect(state('managedSalesDocuments').drafts[0].recipient).toEqual(saved);
});
it('rejects contacts and stores outside the selected customer or contact store', () => {
    const r = recipient(), p = packPayload();
    expect(() => cmd('managedSalesDocuments', 'save', { operationId: 'bad-store', payload: { ...p, locationId: 'wrong' } })).toThrow(/store/);
    expect(() => cmd('sales', 'createQuote', { ...p, accountingContactId: 'wrong' })).toThrow(/contact/);
    expect(() => cmd('sales', 'createQuote', { ...p, locationId: '', accountingContactId: r.contact.id })).toThrow(/contact/);
});
it('supports explicitly clearing store and recipient while not adding them to legacy documents', () => {
    recipient();
    const q = cmd('sales', 'createQuote', { ...packPayload(), locationId: '', accountingContactId: '' });
    expect(q.recipient.locationId).toBeUndefined();
    expect(q.recipient.accountingEmail).toBeUndefined();
    expect(state('sales').invoices.filter((i: any) => !i.managedDraftId).every((i: any) => i.recipient === undefined)).toBe(true);
});
it('rejects invalid area without changing any durable business data', () => {
    const p = packPayload(), before = readFileSync(join(root, 'business.json'), 'utf8');
    for (const area of [0, -1, NaN, Infinity, 1e10])
        expect(() => cmd('managedSalesDocuments', 'save', { operationId: crypto.randomUUID(), payload: { ...p, lines: [{ ...p.lines[0], requestedArea: area }] } })).toThrow();
    expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before);
});
it('rejects area for base-unit and length products and preserves quantity-only behavior', () => {
    const p = sales();
    expect(() => cmd('sales', 'createQuote', { ...p, lines: [{ ...p.lines[0], requestedArea: 4 }] })).toThrow(/Area entry/);
    const q = cmd('sales', 'createQuote', p);
    expect(q.lines[0].quantity).toBe(2);
    expect(q.lines[0].requestedArea).toBeUndefined();
});
it('dispatches pack quantity converted to base area, posts COGS, then void restores stock', async () => {
    const { site } = await stock(), posted = postPack(), invoice = state('sales').invoices.find((i: any) => i.id === posted.documentId), order = state('sales').salesOrders.find((o: any) => o.id === invoice.sourceSalesOrderId), l = order.lines[0];
    const request = { operationId: 'pack-dispatch', salesOrderId: order.id, siteId: site.id, fulfilmentDate: date(), lines: [{ salesOrderLineId: l.id, fulfilledQuantity: l.quantity }] };
    expect(() => cmd('salesDispatch', 'record', { ...request, lines: [{ salesOrderLineId: l.id, fulfilledQuantity: 0.5 }] })).toThrow(/whole packs/);
    const f = cmd('salesDispatch', 'record', request);
    expect(state('stock').balances.find((b: any) => b.productId === l.productId).quantityOnHand).toBeCloseTo(10 - l.coveredArea);
    const j = state('journals').journalEntries.find((j: any) => j.sourceId === f.id);
    expect(j.lines.reduce((n: number, l: any) => n + l.debit, 0)).toBeCloseTo(l.coveredArea * 10, 2);
    cmd('sales', 'voidInvoice', invoice.id, 'Test invoice reversal');
    cmd('salesDispatch', 'reverse', { fulfilmentId: f.id, voidDate: date(), reason: 'Return all stock' });
    expect(state('stock').balances.find((b: any) => b.productId === l.productId).quantityOnHand).toBe(10);
});
it('blocks fractional pack credits and over-credit while preserving original tax', () => {
    const posted = postPack(), i = state('sales').invoices.find((i: any) => i.id === posted.documentId), args = { invoiceId: i.id, creditDate: date(), reason: 'Return packs', lines: [{ ...i.lines[0], quantity: 0.5 }] };
    expect(() => cmd('sales', 'createCreditNoteFromInvoice', args)).toThrow(/whole packs/);
    expect(() => cmd('sales', 'createCreditNoteFromInvoice', { ...args, lines: [{ ...i.lines[0], quantity: i.lines[0].quantity + 1 }] })).toThrow(/exceed/);
});
it('rejects corrupt saved area coverage on backup restore', () => {
    postPack();
    const backup = host.exportBackup() as any;
    backup.repositories.sales.invoices[0].lines[0].coveredArea = 1;
    delete backup.checksum;
    backup.checksum = createHash('sha256').update(JSON.stringify(backup)).digest('hex');
    expect(() => host.prepareRestore(JSON.stringify(backup))).toThrow(/coverage/);
});
it('protects recipient and area commands with existing main-process permissions', async () => {
    await role('WAREHOUSE');
    expect(() => cmd('managedSalesDocuments', 'save', { operationId: 'denied', payload: packPayload() })).toThrow();
});
it('warehouse dispatch view carries delivery address and omits accounting email', async () => {
    recipient();
    const p = postPack('ORDER');
    await role('WAREHOUSE');
    const order = state('salesDispatch').orders.find((o: any) => o.id === p.documentId);
    expect(order.delivery).toContain('42 Test Road');
    expect(order.store).toBe('Test store');
    expect(JSON.stringify(order)).not.toContain('accounts@example.test');
});
it('handles exact pack boundaries and floating point noise without adding a pack', async () => {
    const { areaQuantity } = await import('../sales/data/areaPacks'), p = packPayload().lines[0], size = state('products').products.find((v: any) => v.id === p.productId).units.find((u: any) => u.id === p.unitId).conversionToBase;
    expect(areaQuantity(p.productId, p.unitId, 1, size * 3).quantity).toBe(3);
    expect(areaQuantity(p.productId, p.unitId, 1, size * 3 + 0.000001).quantity).toBe(4);
});
