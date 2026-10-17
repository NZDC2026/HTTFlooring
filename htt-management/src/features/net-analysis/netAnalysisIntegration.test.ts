import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
let root: string, security: InstanceType<typeof import('../../../electron/security/localSecurity').LocalSecurity>, host: InstanceType<typeof import('../../../electron/security/businessHost').BusinessHost>;
const admin = { username: 'documents.admin', displayName: 'Document acceptance', password: 'Documents-test-password-4821' };
async function restart() { vi.resetModules(); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.login(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); }
beforeEach(async () => { vi.resetModules(); vi.stubGlobal('__HTT_MAIN_HOST__', true); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined); root = mkdtempSync(join(tmpdir(), 'htt-direct-docs-')); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.setup(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); rmSync(root, { recursive: true, force: true }); });
const cmd = (repository: string, method: string, ...args: unknown[]) => host.command({ repository, method, args }).result as any;
const state = (key: string) => host.view().repositories[key] as any;
const date = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Pacific/Auckland' });
function sales(kind: 'ORDER' | 'INVOICE' = 'INVOICE') { const product = state('products').products[0], customer = state('customers').customers[0]; return { kind, customerId: customer.id, documentDate: '2026-10-10', dueDate: '2026-11-10', customerReference: 'Direct example', lines: [{ productId: product.id, unitId: product.baseUnitId, quantity: 2, unitPrice: 100, priceBasis: 'Exclusive' as const }] }; }
function expense() { return { kind: 'EXPENSE' as const, supplierId: state('suppliers').suppliers[0].id, supplierInvoiceNumber: 'SERVICE-001', documentDate: '2026-10-10', dueDate: '2026-11-10', lines: [{ description: 'Installation service', accountId: state('accounts').accounts.find((a: any) => a.systemRole === 'OPERATING_EXPENSE').id, quantity: 2, unitCost: 55, taxCode: 'GST', priceBasis: 'Inclusive' as const }] }; }
function postSales(kind: 'ORDER' | 'INVOICE' = 'INVOICE') { const draft = cmd('managedSalesDocuments', 'save', { operationId: 'sales-' + crypto.randomUUID(), payload: sales(kind) }); const approved = cmd('managedSalesDocuments', 'approve', draft.id, draft.revision); return cmd('managedSalesDocuments', 'post', draft.id, approved.revision); }
function postExpense() { const draft = cmd('expenseBillDrafts', 'save', { operationId: 'expense-' + crypto.randomUUID(), payload: expense() }), approved = cmd('expenseBillDrafts', 'approve', draft.id, draft.revision); return cmd('expenseBillDrafts', 'post', draft.id, approved.revision); }
async function role(name: 'SALES' | 'WAREHOUSE' | 'PURCHASING' | 'ACCOUNTANT' | 'FINANCE_ADMIN' | 'AUDITOR') { security.login(admin); const user = security.createUser({ username: 'documents.' + name.toLowerCase(), displayName: name, password: admin.password, roles: [name] }); security.login({ username: user.username, password: admin.password }); }
function stockBill(options: {
    quantity?: number;
    cost?: number;
    billCost?: number;
    unitCode?: string;
    receiptDate?: string;
    billDate?: string;
} = {}) {
    const product = state('products').products[0];
    if (options.unitCode)
        cmd('products', 'save', { ...product, wholePacks: true }, product.revision ?? 0);
    const unit = options.unitCode ? product.units.find((u: any) => u.code === options.unitCode) : product.units.find((u: any) => u.id === product.baseUnitId), siteId = 'site_001', quantity = options.quantity ?? 10;
    const po = cmd('purchaseOrders', 'create', { supplierId: state('suppliers').suppliers[0].id, orderDate: '2026-10-01', lines: [{ productId: product.id, unitId: unit.id, orderedQuantity: quantity, unitCost: options.cost ?? 10, priceBasis: 'Exclusive' }] });
    cmd('purchaseOrders', 'approve', po.id);
    cmd('purchaseOrders', 'send', po.id);
    const receipt = cmd('goodsReceipts', 'create', { purchaseOrderId: po.id, siteId, receiptDate: options.receiptDate ?? '2026-10-02', lines: [{ purchaseOrderLineId: po.lines[0].id, receivedQuantity: quantity }] });
    const bill = cmd('supplierBills', 'create', { purchaseOrderId: po.id, supplierInvoiceNumber: 'RETURN-BILL-' + crypto.randomUUID(), billDate: options.billDate ?? options.receiptDate ?? '2026-10-03', dueDate: '2026-11-10', lines: [{ purchaseOrderLineId: po.lines[0].id, quantity, unitCost: options.billCost ?? options.cost ?? 10 }] });
    const match = state('receiptMatches').matches.find((m: any) => m.supplierBillId === bill.id);
    return { product, unit, siteId, po, receipt, bill, match };
}
async function analysis(purchases = false, from = '2026-10-01', to = date()) { const { salesAnalysisSources, purchaseAnalysisSources } = await import('./analysisSources'), { calculateNetAnalysis } = await import('./netAnalysisService'); return calculateNetAnalysis(purchases ? purchaseAnalysisSources(state('supplierBills').supplierBills, state('supplierCredits').supplierCredits) : salesAnalysisSources(state('sales').invoices, state('customerCredits').creditNotes, state('customers').customers), { from, to }); }
function invoice() { const d = postSales(); return state('sales').invoices.find((i: any) => i.id === d.documentId); }
function bill() { const d = postExpense(); return state('supplierBills').supplierBills.find((i: any) => i.id === d.documentId); }
it('nets actual invoice and partial credit, matches revenue GL, and leaves settlement outside document activity', async () => {
    const baseline = await analysis(), beforeIds = new Set(state('journals').journalEntries.map((j: any) => j.id)), i = invoice(), c = cmd('sales', 'createCreditNoteFromInvoice', { invoiceId: i.id, creditDate: '2026-10-11', reason: 'Partial allowance', lines: [{ ...i.lines[0], quantity: 0.5 }] }), r = await analysis();
    expect(r.totals.total - baseline.totals.total).toBe(165);
    expect(r.totals.subtotal - baseline.totals.subtotal).toBe(150);
    const revenue = state('accounts').accounts.find((a: any) => a.systemRole === 'SALES_REVENUE').id, gl = state('journals').journalEntries.filter((j: any) => !beforeIds.has(j.id)).flatMap((j: any) => j.lines).filter((l: any) => l.accountId === revenue).reduce((n: number, l: any) => n + l.credit - l.debit, 0);
    expect(gl).toBe(150);
    cmd('customerSettlements', 'recordReceipt', { operationId: 'net-receipt', customerId: i.customerId, paymentDate: date(), bankAccountId: 'bank_001', allocations: [{ invoiceId: i.id, amount: 220 }] });
    cmd('customerSettlements', 'createRefund', { operationId: 'net-refund', creditId: c.id, paymentDate: date(), bankAccountId: 'bank_001', amount: 55 });
    expect((await analysis()).totals).toEqual(r.totals);
    const before = readFileSync(join(root, 'business.json'), 'utf8');
    await analysis();
    expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before);
    await restart();
    expect((await analysis()).totals).toEqual(r.totals);
});
it('retains historic original and credit dates after both are voided later', async () => {
    const baseline = await analysis(false, '2026-10-10', '2026-10-10'), i = invoice(), c = cmd('sales', 'createCreditNoteFromInvoice', { invoiceId: i.id, creditDate: '2026-10-11', reason: 'Partial allowance', lines: [{ ...i.lines[0], quantity: 0.5 }] });
    cmd('sales', 'voidCreditNote', { creditNoteId: c.id, reason: 'Correct credit' });
    cmd('sales', 'voidInvoice', i.id, 'Correct invoice');
    expect((await analysis(false, '2026-10-10', '2026-10-10')).totals.total - baseline.totals.total).toBe(220);
    const rows = (await analysis()).events.filter(e => [i.id, c.id].includes(e.id));
    expect(rows).toHaveLength(4);
    expect(rows.reduce((n, e) => n + e.total, 0)).toBe(0);
    expect(rows.filter(e => e.event === 'VOID').every(e => e.date === date())).toBe(true);
    expect(rows.find(e => e.id === c.id && e.event === 'VOID')!.total).toBe(55);
});
it('nets expense bill credits against AP source activity without treating payment/refund as purchases', async () => {
    const base = await analysis(true), before = new Set(state('journals').journalEntries.map((j: any) => j.id)), b = bill(), c = cmd('supplierCredits', 'create', { sourceSupplierBillId: b.id, supplierCreditNumber: 'NET-CR', creditDate: '2026-10-11', reason: 'Service allowance', lines: [{ supplierBillLineId: b.lines[0].id, quantity: 1, unitCost: 50 }] }), r = await analysis(true);
    expect(r.totals.total - base.totals.total).toBe(55);
    const ap = state('accounts').accounts.find((a: any) => a.systemRole === 'ACCOUNTS_PAYABLE').id, gl = state('journals').journalEntries.filter((j: any) => !before.has(j.id)).flatMap((j: any) => j.lines).filter((l: any) => l.accountId === ap).reduce((n: number, l: any) => n + l.credit - l.debit, 0);
    expect(gl).toBe(55);
    cmd('supplierPayments', 'create', { operationId: 'net-supplier-payment', supplierId: b.supplierId, paymentDate: date(), method: 'BANK_TRANSFER', bankAccountId: 'bank_001', allocations: [{ supplierBillId: b.id, amount: 110 }] });
    cmd('supplierRefunds', 'create', { operationId: 'net-supplier-refund', creditId: c.id, paymentDate: date(), bankAccountId: 'bank_001', amount: 55 });
    expect((await analysis(true)).totals).toEqual(r.totals);
    await restart();
    expect((await analysis(true)).totals).toEqual(r.totals);
});
it('includes a physical-return credit once and restores its value on the selected return reversal date', async () => {
    const f = stockBill(), r = cmd('physicalSupplierReturns', 'create', { operationId: 'net-physical-return', supplierBillId: f.bill.id, supplierCreditNumber: 'NET-RETURN', returnDate: '2026-10-10', reason: 'Damaged flooring', lines: [{ matchId: f.match.id, quantity: 2 }] }), a = await analysis(true, '2026-10-01', '2026-10-10');
    expect(a.totals.total).toBe(88);
    expect(a.events.filter(e => e.kind === 'SUPPLIER_CREDIT')).toHaveLength(1);
    cmd('physicalSupplierReturns', 'reverse', { returnId: r.id, voidDate: '2026-10-11', reason: 'Return correction' });
    expect((await analysis(true, '2026-10-01', '2026-10-10')).totals.total).toBe(88);
    expect((await analysis(true, '2026-10-01', '2026-10-11')).totals.total).toBe(110);
});
it('preserves saved source tax after changing the current tax master', async () => {
    const i = invoice(), tax = state('workspace_tax_codes').records.find((t: any) => t.code === 'GST');
    cmd('workspace_tax_codes', 'save', { ...tax, rate: '20' }, tax.revision);
    cmd('sales', 'createCreditNoteFromInvoice', { invoiceId: i.id, creditDate: '2026-10-11', reason: 'Old-rate allowance', lines: [{ ...i.lines[0], quantity: 0.5 }] });
    const rows = (await analysis()).events.filter(e => e.id === i.id || e.kind === 'CUSTOMER_CREDIT');
    expect(rows.find(e => e.id === i.id)!.tax).toBe(20);
    expect(rows.find(e => e.kind === 'CUSTOMER_CREDIT')!.tax).toBe(-5);
});
it('uses trusted role-filtered sources without exposing the opposite operational ledger', async () => {
    invoice();
    bill();
    const sales = await analysis(), purchases = await analysis(true);
    await role('SALES');
    expect((await analysis()).totals).toEqual(sales.totals);
    expect((await analysis(true)).events).toEqual([]);
    await role('PURCHASING');
    expect((await analysis(true)).totals).toEqual(purchases.totals);
    expect((await analysis()).events).toEqual([]);
    await role('AUDITOR');
    expect((await analysis()).totals).toEqual(sales.totals);
    expect((await analysis(true)).totals).toEqual(purchases.totals);
    expect(() => cmd('managedSalesDocuments', 'approve', 'x', 1)).toThrow(/Permission denied/);
});
it('retains supplier bill and credit history after ordinary expense corrections', async () => {
    const base = await analysis(true, '2026-10-10', '2026-10-10'), b = bill(), c = cmd('supplierCredits', 'create', { sourceSupplierBillId: b.id, supplierCreditNumber: 'VOID-NET-CR', creditDate: '2026-10-11', reason: 'Service allowance', lines: [{ supplierBillLineId: b.lines[0].id, quantity: 1, unitCost: 50 }] });
    cmd('supplierCredits', 'voidCredit', { supplierCreditId: c.id, reason: 'Credit correction' });
    cmd('supplierBills', 'markVoid', b.id, 'Bill correction');
    expect((await analysis(true, '2026-10-10', '2026-10-10')).totals.total - base.totals.total).toBe(110);
    const rows = (await analysis(true)).events.filter(e => [b.id, c.id].includes(e.id));
    expect(rows).toHaveLength(4);
    expect(rows.reduce((n, e) => n + e.total, 0)).toBe(0);
});
it('does not turn managed drafts, orders or legacy quotes into sales activity', async () => {
    const baseline = await analysis();
    postSales('ORDER');
    cmd('managedSalesDocuments', 'save', { operationId: 'unposted-net', payload: sales() });
    const { salesRepository } = await import('../sales/data/salesRepository'), { salesAnalysisSources } = await import('./analysisSources');
    const sources = salesAnalysisSources(salesRepository.getAll(), [], state('customers').customers);
    expect(sources.every(d => d.kind === 'INVOICE')).toBe(true);
    expect((await analysis()).totals).toEqual(baseline.totals);
});
