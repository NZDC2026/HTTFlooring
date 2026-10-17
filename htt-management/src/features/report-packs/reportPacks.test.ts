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
function sales(kind: 'ORDER' | 'INVOICE' = 'INVOICE') { const product = state('products').products[0], customer = state('customers').customers[0]; return { kind, customerId: customer.id, documentDate: '2026-10-10', dueDate: '2026-11-10', customerReference: 'Direct example', lines: [{ productId: product.id, unitId: product.baseUnitId, quantity: 2, unitPrice: 100, priceBasis: 'Exclusive' as const }] }; }
function expense() { return { kind: 'EXPENSE' as const, supplierId: state('suppliers').suppliers[0].id, supplierInvoiceNumber: 'SERVICE-001', documentDate: '2026-10-10', dueDate: '2026-11-10', lines: [{ description: 'Installation service', accountId: state('accounts').accounts.find((a: any) => a.systemRole === 'OPERATING_EXPENSE').id, quantity: 2, unitCost: 55, taxCode: 'GST', priceBasis: 'Inclusive' as const }] }; }
function postSales(kind: 'ORDER' | 'INVOICE' = 'INVOICE') { const draft = cmd('managedSalesDocuments', 'save', { operationId: 'sales-' + crypto.randomUUID(), payload: sales(kind) }); const approved = cmd('managedSalesDocuments', 'approve', draft.id, draft.revision); return cmd('managedSalesDocuments', 'post', draft.id, approved.revision); }
function postExpense() { const draft = cmd('expenseBillDrafts', 'save', { operationId: 'expense-' + crypto.randomUUID(), payload: expense() }), approved = cmd('expenseBillDrafts', 'approve', draft.id, draft.revision); return cmd('expenseBillDrafts', 'post', draft.id, approved.revision); }
async function role(name: 'SALES' | 'WAREHOUSE' | 'PURCHASING' | 'ACCOUNTANT' | 'FINANCE_ADMIN' | 'AUDITOR') { security.login(admin); const user = security.createUser({ username: 'documents.' + name.toLowerCase(), displayName: name, password: admin.password, roles: [name] }); security.login({ username: user.username, password: admin.password }); }
function config(reports = 'Profit & loss, Balance sheet, Trial balance, Cash flow, Net sales, Net purchases') { return cmd('workspace_report_packs', 'save', { name: 'October management pack', periodStart: '2026-10-01', periodEnd: '2026-10-31', reports, cover: 'Management review', introduction: 'Prepared for internal review', status: 'Active' }); }
const generate = (c: any) => cmd('workspace_report_packs', 'generate', { id: c.id, expectedRevision: c.revision });
it('generates the selected ordered reports using current main-owned data without posting to books', async () => {
    const c = config(), d = postSales(), b = postExpense();
    expect(d.documentId).toBeTruthy();
    expect(b.documentId).toBeTruthy();
    const before = structuredClone(host.view().repositories), pack = generate(c);
    expect(pack.sections.map((s: any) => s.title)).toEqual(c.reports.split(', '));
    expect(pack.generatedBy).toBe(security.principal()!.userId);
    expect(pack.company.currency).toBe('AUD');
    expect(pack.configRevision).toBe(c.revision);
    expect(host.view().repositories).toEqual(before);
    const sources = (await import('./reportPackCommand')).reportPackSources(), { calculateProfitAndLoss } = await import('../accounting/data/profitAndLossService'), { calculateBalanceSheet } = await import('../accounting/data/balanceSheetService'), { calculateTrialBalance } = await import('../accounting/data/trialBalanceService'), { calculateCashReport } = await import('../cash-reports/cashReportService');
    expect(pack.sections[0].totals.find((t: any) => t.label === 'Net profit').value).toBe(calculateProfitAndLoss(sources.accounts, sources.journals, c.periodStart, c.periodEnd).netProfit);
    expect(pack.sections[1].totals.find((t: any) => t.label === 'Assets').value).toBe(calculateBalanceSheet(sources.accounts, sources.journals, c.periodEnd).totalAssets);
    expect(pack.sections[2].totals.find((t: any) => t.label === 'Closing debit').value).toBe(calculateTrialBalance(sources.accounts, sources.journals, c.periodStart, c.periodEnd).totalClosingDebit);
    expect(pack.sections[3].totals.find((t: any) => t.label === 'Closing').value).toBe(calculateCashReport({ bankAccounts: sources.banks, journalEntries: sources.journals, from: c.periodStart, to: c.periodEnd, currency: 'AUD' }).closing);
});
it('uses real credits in the net sales and expense-purchase sections', () => {
    const c = config('Net sales, Net purchases'), d = postSales(), i = state('sales').invoices.find((i: any) => i.id === d.documentId), b = postExpense(), bill = state('supplierBills').supplierBills.find((i: any) => i.id === b.documentId), before = generate(c);
    cmd('sales', 'createCreditNoteFromInvoice', { invoiceId: i.id, creditDate: '2026-10-11', reason: 'Pack sales allowance', lines: [{ ...i.lines[0], quantity: 0.5 }] });
    cmd('supplierCredits', 'create', { sourceSupplierBillId: bill.id, supplierCreditNumber: 'PACK-CREDIT', creditDate: '2026-10-11', reason: 'Pack service allowance', lines: [{ supplierBillLineId: bill.lines[0].id, quantity: 1, unitCost: 50 }] });
    const pack = generate(c);
    expect(pack.sections[0].totals.find((t: any) => t.label === 'Gross').value - before.sections[0].totals.find((t: any) => t.label === 'Gross').value).toBe(-55);
    expect(pack.sections[1].totals.find((t: any) => t.label === 'Gross').value).toBe(55);
    expect(pack.sourceSignature).not.toBe(before.sourceSignature);
});
it('copies values and company context, detects subsequent source changes and regenerates independently', async () => {
    const c = config(), pack = generate(c), copy = structuredClone(pack);
    postSales();
    const { reportPackSources } = await import('./reportPackCommand'), { reportSourceSignature } = await import('./reportPackService');
    expect(reportSourceSignature(reportPackSources())).not.toBe(pack.sourceSignature);
    expect(pack).toEqual(copy);
    const next = generate(c);
    expect(next.id).not.toBe(pack.id);
    expect(next.sections[0].totals.find((t: any) => t.label === 'Revenue').value - pack.sections[0].totals.find((t: any) => t.label === 'Revenue').value).toBe(200);
    await restart();
    expect(generate(state('workspace_report_packs').records[0]).sections).toEqual(next.sections);
});
it('rejects stale, inactive, missing and caller-injected generation data', () => {
    const c = config();
    const updated = cmd('workspace_report_packs', 'save', { ...c, name: 'Updated pack' }, c.revision);
    expect(() => generate(c)).toThrow(/changed/);
    expect(() => cmd('workspace_report_packs', 'generate', { id: updated.id, expectedRevision: updated.revision, generatedBy: 'forged' })).toThrow();
    expect(() => cmd('workspace_report_packs', 'generate', { id: updated.id, expectedRevision: updated.revision, journals: [] })).toThrow();
    expect(() => generate({ id: 'missing', revision: '1' })).toThrow(/not found/);
    const inactive = cmd('workspace_report_packs', 'setStatus', updated.id, 'Inactive', updated.revision);
    expect(() => generate(inactive)).toThrow(/Activate/);
});
it('validates report selection before saving new or changed pack configuration', () => {
    for (const reports of ['Unknown report', 'Profit & loss, Profit & loss', 'Profit & loss,', ''])
        expect(() => config(reports)).toThrow();
    expect(config('balance sheet, profit & loss').reports).toBe('balance sheet, profit & loss');
});
it('keeps existing legacy configuration restorable and gives a clear generation error for unsupported report names', async () => {
    const c = config();
    const { configurationRows } = await import('../business-workspace/configurationState');
    configurationRows['report-packs'][0] = { ...c, reports: 'Legacy custom report' };
    expect(() => generate(c)).toThrow(/Supported reports/);
    const { validateConfigurationSnapshot } = await import('../business-workspace/workspaceRepository');
    expect(() => validateConfigurationSnapshot('report-packs', { records: configurationRows['report-packs'], history: [] })).not.toThrow();
});
it('allows accountant and auditor generation, blocks operational roles, and does not grant read-only users configuration writes', async () => {
    const c = config();
    await role('AUDITOR');
    expect(generate(c).sections).toHaveLength(6);
    expect(() => cmd('workspace_report_packs', 'save', { ...c, name: 'Unauthorized' }, c.revision)).toThrow(/Permission denied/);
    await role('ACCOUNTANT');
    expect(generate(c).sections).toHaveLength(6);
    for (const r of ['SALES', 'PURCHASING', 'WAREHOUSE'] as const) {
        await role(r);
        expect(() => generate(c)).toThrow(/Permission denied/);
        expect(state('workspace_report_packs').records).toEqual([]);
    }
    expect(() => cmd('workspace_jobs', 'generate', { id: c.id, expectedRevision: c.revision })).toThrow(/Unknown or internal/);
});
it('records generation in the security audit and retains configuration and history after restart', async () => {
    const c = config();
    generate(c);
    const data = readFileSync(join(root, 'security.json'), 'utf8');
    expect(data).toContain('workspace_report_packs.generate');
    await restart();
    expect(state('workspace_report_packs').records[0]).toEqual(c);
    expect(state('workspace_report_packs').history).toHaveLength(1);
    expect(generate(c).sections).toHaveLength(6);
});
