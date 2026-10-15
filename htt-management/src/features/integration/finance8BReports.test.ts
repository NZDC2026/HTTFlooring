import { describe, expect, it } from 'vitest';
import { calculateFinanceOverview } from '../dashboard/data/financeOverview';
import { calculateInvoiceBalanceAsAt } from '../sales/data/invoiceBalanceAsAtService';
import { calculateCustomerAccountsReceivable } from '../sales/data/accountsReceivableService';
import { buildAgedReceivablesReport } from '../reports/data/agedReceivablesService';
import { businessDateKey, requireDateKey } from '../../lib/businessDate';
import { auditFinancialConsistency } from '../../lib/persistence/financialConsistencyAudit';
import type { Invoice } from '../sales/types/salesDocument';
import type { Payment } from '../sales/types/payment';
import type { Customer } from '../contacts/types/customer';
import type { JournalEntry } from '../accounting/types/journalEntry';

const invoice = { id: 'invoice', type: 'INVOICE', status: 'PAID', customerId: 'customer', documentDate: '2026-10-01', dueDate: '2026-10-08', totals: { total: 100 }, amountDue: 0 } as Invoice;
const payment = { id: 'payment', invoiceId: 'invoice', customerId: 'customer', status: 'REVERSED', paymentDate: '2026-10-10', amount: 100, reversedAt: '2026-10-14T11:30:00Z' } as Payment;
const customer = { id: 'customer', businessName: 'Inactive with debt', status: 'INACTIVE', creditLimit: 1000 } as Customer;
describe('8B historical report agreement', () => {
    it('uses the NZ business date across a UTC-midnight boundary', () => {
        expect(businessDateKey(payment.reversedAt!)).toBe('2026-10-15');
        expect(calculateInvoiceBalanceAsAt(invoice, [payment], [], '2026-10-14').amountDue).toBe(0);
        expect(calculateInvoiceBalanceAsAt(invoice, [payment], [], '2026-10-15').amountDue).toBe(100);
    });
    it.each(['2026-10-09', '2026-10-14', '2026-10-15'])('Dashboard, AR and ageing agree on %s', date => {
        const overview = calculateFinanceOverview([invoice], [], [], [], [], date, { payments: [payment], creditAllocations: [], supplierPayments: [], supplierCreditAllocations: [] });
        const ar = calculateCustomerAccountsReceivable(customer, [invoice], [payment], [], [], date);
        const report = buildAgedReceivablesReport({ customers: [customer], documents: [invoice], payments: [payment], creditAllocations: [], creditNotes: [], asOfDate: date });
        expect(overview.receivables).toBe(ar.totalOutstanding);
        expect(report.totalOutstanding).toBe(ar.totalOutstanding);
    });
    it('excludes drafts from every receivables calculation', () => {
        const draft = { ...invoice, status: 'DRAFT' as const, amountDue: 100 };
        expect(calculateInvoiceBalanceAsAt(draft, [], [], '2026-10-15').amountDue).toBe(0);
        expect(buildAgedReceivablesReport({ customers: [customer], documents: [draft], payments: [], creditAllocations: [], creditNotes: [], asOfDate: '2026-10-15' }).totalOutstanding).toBe(0);
    });
    it('retains a subsequently voided invoice in its historical period', () => {
        const voided = { ...invoice, status: 'VOID' as const, voidedAt: '2026-10-14T11:30:00Z' };
        const activity = { payments: [], creditAllocations: [], supplierPayments: [], supplierCreditAllocations: [] };
        expect(calculateFinanceOverview([voided], [], [], [], [], '2026-10-14', activity).receivables).toBe(100);
        expect(calculateFinanceOverview([voided], [], [], [], [], '2026-10-15', activity).receivables).toBe(0);
    });
    it.each(['2026-02-30', '2026-13-01', 'not-a-date'])('rejects invalid reporting date %s', date => {
        expect(() => requireDateKey(date)).toThrow(/valid/);
        expect(() => calculateFinanceOverview([], [], [], [], [], date)).toThrow(/valid/);
    });
    it('surfaces orphan GL and unbalanced journal lines in the read-only audit', () => {
        const journal = { id: 'orphan', sourceType: 'BANK_TRANSACTION', sourceId: 'missing', lines: [{ debit: 10, credit: 0 }], totalDebit: 10, totalCredit: 0 } as JournalEntry;
        expect(auditFinancialConsistency({ transactions: [], transfers: [], payments: [], journals: [journal] }).map(i => i.code)).toEqual(expect.arrayContaining(['ORPHAN_JOURNAL', 'UNBALANCED_JOURNAL']));
    });
});
