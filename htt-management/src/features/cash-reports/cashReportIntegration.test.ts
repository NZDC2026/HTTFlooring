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
async function cash(from = '2026-10-01', to = date()) { const { calculateCashReport } = await import('./cashReportService'); return calculateCashReport({ bankAccounts: state('bankAccounts').bankAccounts, journalEntries: state('journals').journalEntries, from, to, currency: 'AUD' }); }
it('tracks actual receipts, supplier payments, both refunds and restart without changing books', async () => {
    const start = await cash(), row = postSales(), i = state('sales').invoices.find((i: any) => i.id === row.documentId), billRow = postExpense(), b = state('supplierBills').supplierBills.find((b: any) => b.id === billRow.documentId);
    cmd('customerSettlements', 'recordReceipt', { operationId: 'cash-receipt', customerId: i.customerId, paymentDate: date(), bankAccountId: 'bank_001', allocations: [{ invoiceId: i.id, amount: 220 }] });
    cmd('supplierPayments', 'create', { operationId: 'cash-payment', supplierId: b.supplierId, paymentDate: date(), method: 'BANK_TRANSFER', bankAccountId: 'bank_001', allocations: [{ supplierBillId: b.id, amount: 110 }] });
    const cc = cmd('sales', 'createCreditNoteFromInvoice', { invoiceId: i.id, creditDate: date(), reason: 'Service allowance', lines: [{ ...i.lines[0], quantity: 0.5 }] }), sc = cmd('supplierCredits', 'create', { sourceSupplierBillId: b.id, supplierCreditNumber: 'CASH-CR', creditDate: date(), reason: 'Service allowance', lines: [{ supplierBillLineId: b.lines[0].id, quantity: 1, unitCost: 50 }] });
    cmd('customerSettlements', 'createRefund', { operationId: 'cash-customer-refund', creditId: cc.id, paymentDate: date(), bankAccountId: 'bank_001', amount: 55 });
    cmd('supplierRefunds', 'create', { operationId: 'cash-supplier-refund', creditId: sc.id, paymentDate: date(), bankAccountId: 'bank_001', amount: 55 });
    const before = readFileSync(join(root, 'business.json'), 'utf8'), r = await cash();
    expect(r.closing - start.closing).toBe(110);
    expect(r.groups[0].moneyIn - start.groups[0].moneyIn).toBe(220);
    expect(r.groups[2].moneyOut - start.groups[2].moneyOut).toBe(110);
    expect(r.groups[1].moneyOut - start.groups[1].moneyOut).toBe(55);
    expect(r.groups[3].moneyIn - start.groups[3].moneyIn).toBe(55);
    expect(r.difference).toBe(0);
    expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before);
    await restart();
    expect(await cash()).toEqual(r);
});
it('agrees with every bank register including dated payment reversals', async () => {
    const row = postSales(), i = state('sales').invoices.find((i: any) => i.id === row.documentId), receipt = cmd('customerSettlements', 'recordReceipt', { operationId: 'reverse-cash', customerId: i.customerId, paymentDate: date(), bankAccountId: 'bank_001', allocations: [{ invoiceId: i.id, amount: 220 }] });
    cmd('customerSettlements', 'reverseReceipt', { id: receipt.id, reason: 'Acceptance reversal' });
    const r = await cash(), { calculateBankRegister } = await import('../banking/data/bankRegisterService');
    for (const a of r.accounts) {
        const b = state('bankAccounts').bankAccounts.find((b: any) => b.id === a.bankId);
        expect(a.closing).toBe(calculateBankRegister(b, state('journals').journalEntries, date()).closingBalance);
        expect(a.difference).toBe(0);
    }
    expect(r.difference).toBe(0);
});
it('keeps real transfer gross lines and cancels the selected-account cash effect', async () => {
    const banks = state('bankAccounts').bankAccounts;
    expect(banks.length).toBeGreaterThan(1);
    const start = await cash();
    cmd('bankTransactions', 'createTransfer', { fromBankAccountId: banks[0].id, toBankAccountId: banks[1].id, transferDate: date(), amount: 5, description: 'Cash report transfer' }, 'cash-transfer');
    const r = await cash();
    expect(r.closing).toBe(start.closing);
    expect(r.groups[5].net).toBe(start.groups[5].net);
    expect(r.grossIn - start.grossIn).toBe(5);
    expect(r.grossOut - start.grossOut).toBe(5);
    expect(r.details.length - start.details.length).toBe(2);
});
it('uses trusted filtered snapshots: operational roles receive no bank or journal data', async () => {
    await role('SALES');
    expect(state('bankAccounts').bankAccounts).toEqual([]);
    expect(state('journals').journalEntries).toEqual([]);
    expect((await cash()).accounts).toEqual([]);
    await role('WAREHOUSE');
    expect(state('bankAccounts').bankAccounts).toEqual([]);
    expect(state('journals').journalEntries).toEqual([]);
});
it('allows read-only accounting and audit users to calculate reports without posting permission', async () => {
    const expected = await cash();
    await role('AUDITOR');
    expect(await cash()).toEqual(expected);
    expect(() => cmd('bankTransactions', 'createTransfer', {})).toThrow(/Permission denied/);
    await role('ACCOUNTANT');
    expect(await cash()).toEqual(expected);
});
