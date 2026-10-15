import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installPurchaseTestStorage } from '../purchases/data/purchaseTestStorage';

async function modules() {
    const [po, receipts, bills, payments, credits, journals, accounts, banks, banking, reconciliations, products, sites, suppliers, state] = await Promise.all([
        import('../purchases/data/purchaseOrderRepository'), import('../purchases/data/goodsReceiptRepository'),
        import('../purchases/data/supplierBillRepository'), import('../purchases/data/supplierPaymentRepository'),
        import('../purchases/data/supplierCreditRepository'), import('../accounting/data/journalEntryRepository'),
        import('../accounting/data/accountRepository'), import('../banking/data/bankAccountRepository'),
        import('../banking/data/bankTransactionRepository'), import('../banking/data/bankReconciliationRepository'),
        import('../inventory/data/mockProducts'), import('../inventory/data/inventorySiteRepository'),
        import('../contacts/data/supplierRepository'), import('../../lib/persistence/financialStateStorage'),
    ]);
    return { po: po.purchaseOrderRepository, receipts: receipts.goodsReceiptRepository, bills: bills.supplierBillRepository,
        payments: payments.supplierPaymentRepository, credits: credits.supplierCreditRepository, journals: journals.journalEntryRepository,
        accounts: accounts.accountRepository, banks: banks.bankAccountRepository, banking: banking.bankTransactionRepository,
        reconciliations: reconciliations.bankReconciliationRepository, products: products.mockProducts, sites: sites.inventorySiteRepository,
        suppliers: suppliers.supplierRepository, state: state.financialStateStorage };
}
let m: Awaited<ReturnType<typeof modules>>;
beforeEach(async () => {
    installPurchaseTestStorage();
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-15T08:00:00Z'));
    m = await modules();
});
afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });
function bill() {
    const product = m.products.find(p => p.id === 'prod_001')!;
    const supplier = m.suppliers.getAll().find(s => s.status === 'ACTIVE')!;
    const order = m.po.create({ supplierId: supplier.id, orderDate: '2026-10-01', lines: [{ productId: product.id, unitId: product.baseUnitId, orderedQuantity: 10, unitCost: 20 }] });
    m.po.approve(order.id); m.po.send(order.id);
    m.receipts.create({ purchaseOrderId: order.id, siteId: m.sites.getActive()[0].id, receiptDate: '2026-10-02', lines: [{ purchaseOrderLineId: order.lines[0].id, receivedQuantity: 10 }] });
    return m.bills.create({ purchaseOrderId: order.id, supplierInvoiceNumber: '8B-INVOICE', billDate: '2026-10-03', dueDate: '2026-10-10', lines: [{ purchaseOrderLineId: order.lines[0].id, quantity: 10, unitCost: 20 }] });
}
function paymentDraft(b: ReturnType<typeof bill>, amount = 50) {
    return { operationId: '8B-payment', supplierId: b.supplierId, paymentDate: '2026-10-10', method: 'BANK_TRANSFER' as const,
        bankAccountId: m.banks.getAll().find(b => b.active)!.id, allocations: [{ supplierBillId: b.id, amount }] };
}
function bankInput() {
    return { bankAccountId: m.banks.getAll().find(b => b.active)!.id, transactionDate: '2026-10-10', direction: 'MONEY_IN' as const, amount: 100,
        description: '8B deposit', offsetAccountId: m.accounts.getAll().find(a => a.active && a.allowManualPosting && a.type === 'EXPENSE')!.id };
}
describe('8B real repository business closure', () => {
    it('payment, AP, Dashboard, GL and historical reports agree through reversal', async () => {
        const b = bill();
        const p = m.payments.create(paymentDraft(b));
        const { calculateAccountsPayableGlReconciliation } = await import('../accounting/data/accountsPayableGlReconciliationService');
        const { calculateFinanceOverview } = await import('../dashboard/data/financeOverview');
        const reconcile = (date: string) => calculateAccountsPayableGlReconciliation({ suppliers: m.suppliers.getAll(), bills: m.bills.getAll(), payments: m.payments.getAll(), credits: [], creditAllocations: [], accounts: m.accounts.getAll(), journalEntries: m.journals.getAll(), asOfDate: date });
        expect(m.bills.getById(b.id)?.totals.amountPaid).toBe(50);
        expect(reconcile('2026-10-10').difference).toBe(0);
        const overview = (date: string) => calculateFinanceOverview([], m.bills.getAll(), m.banks.getAll(), m.journals.getAll(), [], date, { payments: [], creditAllocations: [], supplierPayments: m.payments.getAll(), supplierCreditAllocations: [] });
        expect(overview('2026-10-09').payables).toBe(b.totals.total);
        expect(overview('2026-10-10').payables).toBe(b.totals.total - 50);
        m.payments.reverse(p.id, '8B reversal');
        expect(m.bills.getById(b.id)?.totals.amountPaid).toBe(0);
        expect(overview('2026-10-14').payables).toBe(b.totals.total - 50);
        expect(overview('2026-10-15').payables).toBe(b.totals.total);
        expect(reconcile('2026-10-15').difference).toBe(0);
    });
    it('supplier credit allocation, reversal and void preserve AP/GL and restart evidence', async () => {
        const b = bill();
        const credit = m.credits.create({ sourceSupplierBillId: b.id, supplierCreditNumber: '8B-CREDIT', creditDate: '2026-10-10', reason: 'Price adjustment', lines: [{ supplierBillLineId: b.lines[0].id, quantity: 1, unitCost: 20 }] });
        const allocation = m.credits.applyToBill({ supplierCreditId: credit.id, supplierBillId: b.id, allocationDate: '2026-10-11', amount: credit.totals.total });
        expect(m.bills.getById(b.id)?.totals.amountCredited).toBe(credit.totals.total);
        m.credits.reverseAllocation({ allocationId: allocation.id, reversalReason: 'Incorrect allocation' });
        expect(m.bills.getById(b.id)?.totals.amountCredited).toBe(0);
        m.credits.voidCredit({ supplierCreditId: credit.id, reason: 'Cancelled credit' });
        const count = m.journals.getAll().length;
        vi.resetModules(); m = await modules();
        expect(m.credits.getById(credit.id)?.status).toBe('VOID');
        expect(m.bills.getById(b.id)?.totals.amountDue).toBe(b.totals.total);
        expect(m.credits.getAllocationById(allocation.id)?.status).toBe('REVERSED');
        const { initializePurchasesAccounting } = await import('../accounting/data/purchasesAccountingBootstrap');
        initializePurchasesAccounting();
        expect(m.journals.getAll()).toHaveLength(count);
        const { runFinancialConsistencyAudit } = await import('../../lib/persistence/runFinancialConsistencyAudit');
        expect(runFinancialConsistencyAudit().filter(i => i.message.includes('SUPPLIER_'))).toEqual([]);
    });
    it('rolls back bill, payment and GL together when durable storage rejects the commit', () => {
        const b = bill(); const before = m.state.read();
        const listener = vi.fn(); m.bills.subscribe(listener); m.payments.subscribe(listener); m.journals.subscribe(listener);
        const original = localStorage.setItem.bind(localStorage);
        vi.spyOn(localStorage, 'setItem').mockImplementation((key, value) => {
            if (key === 'htt:financial-snapshot:v1') throw new Error('quota');
            original(key, value);
        });
        expect(() => m.payments.create(paymentDraft(b))).toThrow(/write failed/);
        expect(m.state.read()).toEqual(before);
        expect(m.payments.getAll()).toEqual([]);
        expect(m.bills.getById(b.id)?.totals).toEqual(b.totals);
        expect(m.journals.getAll()).toEqual(before.journals);
        expect(listener).not.toHaveBeenCalled();
    });
    it('GL failure rolls back credit issuance and publishes no partial state', async () => {
        const b = bill(); const before = m.state.read();
        const { purchasesAccountingPostingService } = await import('../accounting/data/purchasesAccountingPostingService');
        vi.spyOn(purchasesAccountingPostingService, 'postSupplierCredit').mockImplementation(() => { throw new Error('GL unavailable'); });
        expect(() => m.credits.create({ sourceSupplierBillId: b.id, supplierCreditNumber: 'FAIL', creditDate: '2026-10-10', reason: 'Adjustment', lines: [{ supplierBillLineId: b.lines[0].id, quantity: 1, unitCost: 20 }] })).toThrow('GL unavailable');
        expect(m.state.read()).toEqual(before);
        expect(m.credits.getAll()).toEqual([]);
    });
    it('stores all payment effects once, retries idempotently and rejects changed retry data', () => {
        const b = bill(); const save = vi.spyOn(localStorage, 'setItem');
        const listener = vi.fn(() => expect(m.payments.getAll()).toHaveLength(1)); m.bills.subscribe(listener);
        const p = m.payments.create(paymentDraft(b));
        expect(save.mock.calls.filter(([key]) => key === 'htt:financial-snapshot:v1')).toHaveLength(1);
        expect(listener).toHaveBeenCalledTimes(1);
        expect(m.payments.create(paymentDraft(b)).id).toBe(p.id);
        expect(() => m.payments.create(paymentDraft(b, 60))).toThrow(/reused/);
        expect(m.journals.getBySource('SUPPLIER_PAYMENT', p.id)).toHaveLength(1);
    });
    it('keeps cumulative reconciliation clearing after two periods and restart', async () => {
        const one = m.banking.createTransaction(bankInput(), 'deposit-1');
        const { calculateBankRegister } = await import('../banking/data/bankRegisterService');
        const bank = m.banks.getById(one.bankAccountId)!;
        let register = calculateBankRegister(bank, m.journals.getAll(), '2026-10-10');
        m.reconciliations.complete({ bankAccountId: bank.id, statementDate: '2026-10-10', statementBalance: 100, clearedTransactionIds: register.transactions.map(t => t.id) });
        m.banking.createTransaction({ ...bankInput(), transactionDate: '2026-10-11' }, 'deposit-2');
        register = calculateBankRegister(bank, m.journals.getAll(), '2026-10-11');
        const ids = register.transactions.filter(t => !m.reconciliations.getClearedTransactionIds(bank.id).has(t.id)).map(t => t.id);
        m.reconciliations.complete({ bankAccountId: bank.id, statementDate: '2026-10-11', statementBalance: 200, clearedTransactionIds: ids });
        vi.resetModules(); m = await modules();
        const { calculateFinanceOverview } = await import('../dashboard/data/financeOverview');
        const result = calculateFinanceOverview([], [], m.banks.getAll(), m.journals.getAll(), m.reconciliations.getAll(), '2026-10-15');
        expect(result.bankStatus.find(b => b.id === bank.id)).toMatchObject({ balance: 200, outstanding: 0, lastReconciled: '2026-10-11' });
        expect(m.reconciliations.getAll()).toHaveLength(2);
    });
    it('bank commit failure leaves no GL-only entry and blocks uncertain retries for review', async () => {
        const before = m.state.read();
        const original = localStorage.setItem.bind(localStorage);
        vi.spyOn(localStorage, 'setItem').mockImplementation((key, value) => { if (key === 'htt:financial-snapshot:v1') throw new Error('quota'); original(key, value); });
        expect(() => m.banking.createTransaction(bankInput(), 'failed-deposit')).toThrow(/write failed/);
        expect(m.state.read()).toEqual(before);
        expect(m.banking.getTransactions()).toEqual([]);
        expect(m.journals.getAll()).toEqual(before.journals);
        expect(() => m.banking.createTransaction(bankInput(), 'failed-deposit')).toThrow(/blocked/);
    });
    it('rejects invalid calendar dates and payments before bill dates without effects', () => {
        const b = bill(); const before = m.state.read();
        expect(() => m.payments.create({ ...paymentDraft(b), paymentDate: '2026-02-30' })).toThrow(/valid/);
        expect(() => m.payments.create({ ...paymentDraft(b), paymentDate: '2026-10-01' })).toThrow(/precede/);
        expect(() => m.payments.create(paymentDraft(b, 0.001))).toThrow(/zero/);
        expect(m.state.read()).toEqual(before);
    });
});

describe('8B bank and recovery boundaries', () => {
    it('transfers conserve total cash and link exactly one GL entry after restart', async () => {
        const banks = m.banks.getAll().filter(b => b.active);
        const transfer = m.banking.createTransfer({ fromBankAccountId: banks[0].id, toBankAccountId: banks[1].id, transferDate: '2026-10-10', amount: 75, description: 'Cash transfer' }, 'transfer-1');
        const { calculateBankRegister } = await import('../banking/data/bankRegisterService');
        expect(calculateBankRegister(banks[0], m.journals.getAll(), '2026-10-15').closingBalance).toBe(-75);
        expect(calculateBankRegister(banks[1], m.journals.getAll(), '2026-10-15').closingBalance).toBe(75);
        vi.resetModules(); m = await modules();
        expect(m.banking.getTransfers()[0].id).toBe(transfer.id);
        expect(m.journals.getBySource('BANK_TRANSFER', transfer.id)).toHaveLength(1);
    });
    it('rejects foreign clearing IDs, out-of-balance statements, invalid dates and duplicate periods', () => {
        const bank = m.banks.getAll()[0];
        const input = { bankAccountId: bank.id, statementDate: '2026-10-10', statementBalance: 0, clearedTransactionIds: [] as string[] };
        expect(() => m.reconciliations.complete({ ...input, clearedTransactionIds: ['not-this-bank'] })).toThrow(/does not belong/);
        expect(() => m.reconciliations.complete({ ...input, statementBalance: 10 })).toThrow(/out by/);
        expect(() => m.reconciliations.complete({ ...input, statementDate: '2026-02-30' })).toThrow(/valid/);
        expect(m.reconciliations.getAll()).toEqual([]);
        m.reconciliations.complete(input);
        expect(() => m.reconciliations.complete(input)).toThrow(/after/);
        expect(m.reconciliations.getAll()).toHaveLength(1);
    });
    it('does not clear or publish a reconciliation whose persistence failed', () => {
        const bank = m.banks.getAll()[0];
        const before = m.state.read(); const notify = vi.fn(); m.reconciliations.subscribe(notify);
        vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('quota'); });
        expect(() => m.reconciliations.complete({ bankAccountId: bank.id, statementDate: '2026-10-10', statementBalance: 0, clearedTransactionIds: [] })).toThrow(/write failed/);
        expect(m.reconciliations.getAll()).toEqual([]);
        expect(m.state.read()).toEqual(before);
        expect(notify).not.toHaveBeenCalled();
    });
    it('blocks AP and bank posting while another financial operation remains unresolved', async () => {
        const b = bill();
        const { financialOperationJournal } = await import('../../lib/persistence/financialOperationJournal');
        financialOperationJournal.begin('uncertain-transfer', 'BANK_TRANSFER', 'pending');
        const before = m.state.read();
        expect(() => m.payments.create(paymentDraft(b))).toThrow(/blocked/);
        expect(() => m.banking.createTransaction(bankInput(), 'new-deposit')).toThrow(/blocked/);
        expect(m.state.read()).toEqual(before);
    });
    it('retains legacy snapshot content when adding the new AP and reconciliation slices', () => {
        const old = m.state.read();
        localStorage.setItem('htt:financial-snapshot:v1', JSON.stringify({ schemaVersion: 1, savedAt: '2026-10-15', data: { payments: old.payments, transactions: [], transfers: [], journals: [] } }));
        m.state.resetCacheForTests();
        expect(m.state.read()).toMatchObject({ payments: old.payments, supplierBills: [], reconciliations: [], supplierCredits: [] });
    });
    it('rejects malformed persisted AP instead of replacing it with empty seed data', () => {
        const raw = JSON.stringify({ schemaVersion: 1, savedAt: '2026-10-15', data: { ...m.state.read(), supplierPayments: [{ id: 'broken', amount: 'invalid' }] } });
        localStorage.setItem('htt:financial-snapshot:v1', raw); m.state.resetCacheForTests();
        expect(() => m.state.read()).toThrow(/blocked/);
        expect(localStorage.getItem('htt:financial-snapshot:v1')).toBe(raw);
    });
});

describe('8B sales financial integration', () => {
    it('records and reverses a real customer payment with matching bank and AR/GL effects', async () => {
        const { salesRepository } = await import('../sales/data/salesRepository');
        const { paymentRepository } = await import('../sales/data/paymentRepository');
        const { initializeSalesAccounting } = await import('../accounting/data/salesAccountingBootstrap');
        const { customerRepository } = await import('../contacts/data/customerRepository');
        const { creditNoteRepository } = await import('../sales/data/creditNoteRepository');
        const { calculateAccountsReceivableGlReconciliation } = await import('../accounting/data/accountsReceivableGlReconciliationService');
        initializeSalesAccounting();
        const invoice = salesRepository.getAll().find(d => d.type === 'INVOICE' && d.status !== 'VOID' && d.status !== 'DRAFT' && d.amountDue > 0);
        if (!invoice || invoice.type !== 'INVOICE') throw new Error('No open seeded invoice');
        const reconcile = () => calculateAccountsReceivableGlReconciliation({ customers: customerRepository.getAll(), documents: salesRepository.getAll(), payments: paymentRepository.getAll(), creditNotes: creditNoteRepository.getAll(), creditAllocations: creditNoteRepository.getAllAllocations(), accounts: m.accounts.getAll(), journalEntries: m.journals.getAll(), asOfDate: '2026-10-15' });
        const before = reconcile();
        expect(before.difference).toBe(0);
        const payment = salesRepository.recordInvoicePayment({ invoiceId: invoice.id, paymentDate: '2026-10-15', amount: 10, method: 'BANK_TRANSFER', bankAccountId: m.banks.getAll()[0].id, operationId: '8B-customer-payment' });
        expect(m.journals.getBySource('CUSTOMER_PAYMENT', payment.id)).toHaveLength(1);
        expect(reconcile().arSubledgerBalance).toBeCloseTo(before.arSubledgerBalance - 10, 2);
        expect(reconcile().difference).toBe(before.difference);
        salesRepository.reverseInvoicePayment(payment.id, 'Customer refund correction');
        expect(reconcile().arSubledgerBalance).toBe(before.arSubledgerBalance);
        expect(reconcile().difference).toBe(before.difference);
        expect(paymentRepository.getById(payment.id)?.status).toBe('REVERSED');
        const { calculateFinanceControls } = await import('../accounting/data/financeControlsService');
        const { calculateAccountsPayableGlReconciliation } = await import('../accounting/data/accountsPayableGlReconciliationService');
        const ap = calculateAccountsPayableGlReconciliation({ suppliers: m.suppliers.getAll(), bills: [], payments: [], credits: [], creditAllocations: [], accounts: m.accounts.getAll(), journalEntries: m.journals.getAll(), asOfDate: '2026-10-15' });
        const controls = calculateFinanceControls({ accounts: m.accounts.getAll(), journalEntries: m.journals.getAll(), bankAccounts: m.banks.getAll(), arReconciliation: reconcile(), apReconciliation: ap, asOfDate: '2026-10-15' });
        expect(controls.controls.filter(c => c.status === 'FAIL')).toEqual([]);
        expect(controls.bankControls.filter(c => c.status === 'FAIL')).toEqual([]);
        expect(salesRepository.getById(invoice.id)).toMatchObject({ amountDue: invoice.amountDue });
        vi.resetModules();
        const { salesRepository: restoredSales } = await import('../sales/data/salesRepository');
        const { paymentRepository: restoredPayments } = await import('../sales/data/paymentRepository');
        expect(restoredPayments.getById(payment.id)?.status).toBe('REVERSED');
        expect(restoredSales.getById(invoice.id)).toMatchObject({ amountDue: invoice.amountDue });
    });
    it('does not silently reconstruct a missing restored sales or AP journal on startup', async () => {
        const b = bill(); const journal = m.journals.getBySource('SUPPLIER_BILL', b.id)[0];
        m.state.update('journals', m.state.read().journals.filter(j => j.id !== journal.id));
        vi.resetModules(); m = await modules();
        const log = vi.spyOn(console, 'error').mockImplementation(() => {});
        const { initializeSalesAccounting } = await import('../accounting/data/salesAccountingBootstrap');
        const { initializePurchasesAccounting } = await import('../accounting/data/purchasesAccountingBootstrap');
        const before = m.journals.getAll();
        initializeSalesAccounting(); initializePurchasesAccounting();
        expect(m.journals.getAll()).toEqual(before);
        expect(m.bills.getById(b.id)).toBeDefined();
        expect(log).toHaveBeenCalled();
    });
});

describe('8B restored bill lifecycle', () => {
    it('restores PO, receipt and matching evidence so an unpaid bill can be voided after restart', async () => {
        const b = bill();
        const original = m.journals.getBySource('SUPPLIER_BILL', b.id)[0];
        vi.resetModules(); m = await modules();
        expect(m.po.getById(b.purchaseOrderId)).toBeDefined();
        expect(m.receipts.getByPurchaseOrder(b.purchaseOrderId)).toHaveLength(1);
        const voided = m.bills.markVoid(b.id, 'Supplier bill cancelled');
        expect(voided.status).toBe('VOID');
        expect(m.journals.getById(original.id)?.status).toBe('REVERSED');
        const { supplierBillReceiptMatchRepository } = await import('../purchases/data/supplierBillReceiptMatchRepository');
        expect(supplierBillReceiptMatchRepository.getByBill(b.id).every(match => match.status === 'REVERSED')).toBe(true);
        expect(m.po.getById(b.purchaseOrderId)?.lines[0].billedQuantity).toBe(0);
        vi.resetModules(); m = await modules();
        expect(m.bills.getById(b.id)?.status).toBe('VOID');
        expect(m.journals.getById(original.id)?.status).toBe('REVERSED');
    });
});

describe('8B reversal failure isolation', () => {
    it('restores payment, bill and original journal if reversal cannot be saved', () => {
        const b = bill(); const payment = m.payments.create(paymentDraft(b));
        const before = m.state.read();
        vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('quota'); });
        expect(() => m.payments.reverse(payment.id, 'Correction reversal')).toThrow(/write failed/);
        expect(m.state.read()).toEqual(before);
        expect(m.payments.getById(payment.id)?.status).toBe('POSTED');
        expect(m.bills.getById(b.id)?.totals.amountPaid).toBe(50);
        expect(m.journals.getBySource('SUPPLIER_PAYMENT', payment.id)[0].status).toBe('POSTED');
    });
    it('restores all credit allocation balances if the allocation commit fails', () => {
        const b = bill();
        const credit = m.credits.create({ sourceSupplierBillId: b.id, supplierCreditNumber: '8B-FAIL-ALLOC', creditDate: '2026-10-10', reason: 'Adjustment', lines: [{ supplierBillLineId: b.lines[0].id, quantity: 1, unitCost: 20 }] });
        const before = m.state.read();
        vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('quota'); });
        expect(() => m.credits.applyToBill({ supplierCreditId: credit.id, supplierBillId: b.id, allocationDate: '2026-10-11', amount: credit.totals.total })).toThrow(/write failed/);
        expect(m.state.read()).toEqual(before);
        expect(m.credits.getAllAllocations()).toEqual([]);
        expect(m.credits.getById(credit.id)?.amountAvailable).toBe(credit.totals.total);
        expect(m.bills.getById(b.id)?.totals.amountCredited).toBe(0);
    });
    it('recognizes an AP payment retry after restart without duplicate cash or GL effects', async () => {
        const b = bill(); const draft = paymentDraft(b); const payment = m.payments.create(draft);
        vi.resetModules(); m = await modules();
        const retry = m.payments.create(draft);
        expect(retry.id).toBe(payment.id);
        expect(m.payments.getAll()).toHaveLength(1);
        expect(m.bills.getById(b.id)?.totals.amountPaid).toBe(50);
        expect(m.journals.getBySource('SUPPLIER_PAYMENT', payment.id)).toHaveLength(1);
    });
});
