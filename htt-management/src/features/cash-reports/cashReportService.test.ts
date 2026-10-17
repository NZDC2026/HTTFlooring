import { describe, expect, it } from 'vitest';
import { calculateCashReport, cashCategories } from './cashReportService';
import { calculateBankRegister } from '../banking/data/bankRegisterService';
import type { BankAccount } from '../banking/types/bankAccount';
import type { JournalEntry, AccountingSourceType } from '../accounting/types/journalEntry';
const bank = (id = 'b1', patch: Partial<BankAccount> = {}): BankAccount => ({ id, name: id, bankName: 'Test', accountNumber: id, accountType: 'TRANSACTION', currency: 'AUD', glAccountId: 'gl-' + id, openingBalance: 0, openingBalanceDate: '2026-01-01', active: true, createdAt: '', updatedAt: '', ...patch });
let sequence = 0;
function journal(date: string, source: AccountingSourceType, lines: [
    string,
    number,
    number
][], patch: Partial<JournalEntry> = {}): JournalEntry {
    const id = 'j' + (++sequence);
    return { id, journalNumber: id, journalDate: date, sourceType: source, status: 'POSTED', description: source, lines: lines.map(([accountId, debit, credit], i) => ({ id: id + ':' + i, accountId, accountCode: accountId, accountName: accountId, debit, credit })), totalDebit: lines.reduce((s, l) => s + l[1], 0), totalCredit: lines.reduce((s, l) => s + l[2], 0), createdAt: date, updatedAt: date, postedAt: date, ...patch };
}
const report = (bankAccounts: BankAccount[], journalEntries: JournalEntry[], patch: Partial<Parameters<typeof calculateCashReport>[0]> = {}) => calculateCashReport({ bankAccounts, journalEntries, from: '2026-10-01', to: '2026-10-31', currency: 'AUD', ...patch });
describe('bank ledger cash report', () => {
    it('reconciles dated receipts, payments, both refunds and manual cash journals in cents', () => {
        const entries = [journal('2026-09-30', 'CUSTOMER_PAYMENT', [['gl-b1', 10, 0], ['ar', 0, 10]]), journal('2026-10-01', 'CUSTOMER_PAYMENT', [['gl-b1', 110.01, 0], ['ar', 0, 110.01]]), journal('2026-10-02', 'SUPPLIER_PAYMENT', [['gl-b1', 0, 50.02], ['ap', 50.02, 0]]), journal('2026-10-03', 'CUSTOMER_REFUND', [['gl-b1', 0, 10], ['ar', 10, 0]]), journal('2026-10-04', 'SUPPLIER_REFUND', [['gl-b1', 5, 0], ['ap', 0, 5]]), journal('2026-10-05', 'MANUAL_JOURNAL', [['gl-b1', 0, 0.01], ['fee', 0.01, 0]]), journal('2026-11-01', 'CUSTOMER_PAYMENT', [['gl-b1', 500, 0], ['ar', 0, 500]])];
        const r = report([bank('b1', { openingBalance: 20 })], entries);
        expect(r).toMatchObject({ opening: 30, net: 54.98, closing: 84.98, difference: 0 });
        expect(r.details).toHaveLength(5);
        expect(r.groups[0].moneyIn).toBe(110.01);
        expect(r.groups[2].moneyOut).toBe(50.02);
        expect(r.warnings[0]).toContain('classification review');
        expect(r.accounts[0].closing).toBe(calculateBankRegister(bank('b1', { openingBalance: 20 }), entries, '2026-10-31').closingBalance);
    });
    it('keeps a reversed original in its historic period and dates the reversal independently', () => {
        const original = journal('2026-09-25', 'CUSTOMER_PAYMENT', [['gl-b1', 100, 0], ['ar', 0, 100]], { status: 'REVERSED', reversalJournalEntryId: 'rev' });
        const reversal = journal('2026-10-03', 'CUSTOMER_PAYMENT', [['gl-b1', 0, 100], ['ar', 100, 0]], { id: 'rev', reversedJournalEntryId: original.id });
        const entries = [original, reversal];
        expect(report([bank()], entries, { from: '2026-09-01', to: '2026-09-30' })).toMatchObject({ opening: 0, net: 100, closing: 100 });
        expect(report([bank()], entries)).toMatchObject({ opening: 100, net: -100, closing: 0, difference: 0 });
        expect(report([bank()], entries).groups[0].moneyOut).toBe(100);
    });
    it('includes explicit customer and supplier payment reversal source types', () => {
        const r = report([bank()], [journal('2026-10-02', 'CUSTOMER_PAYMENT_REVERSAL', [['gl-b1', 0, 10], ['ar', 10, 0]]), journal('2026-10-03', 'SUPPLIER_PAYMENT_REVERSAL', [['gl-b1', 20, 0], ['ap', 0, 20]])]);
        expect(r.groups[0].moneyOut).toBe(10);
        expect(r.groups[2].moneyIn).toBe(20);
        expect(r.net).toBe(10);
    });
    it('nets internal transfers in cash groups while retaining gross account and detail lines', () => {
        const r = report([bank(), bank('b2', { active: false })], [journal('2026-10-02', 'BANK_TRANSFER', [['gl-b1', 0, 75], ['gl-b2', 75, 0]])]);
        expect(r).toMatchObject({ opening: 0, net: 0, closing: 0, grossIn: 75, grossOut: 75 });
        expect(r.groups[5]).toMatchObject({ moneyIn: 0, moneyOut: 0, net: 0 });
        expect(r.details).toHaveLength(2);
        expect(r.accounts[1]).toMatchObject({ active: false, closing: 75 });
    });
    it('shows transfers crossing the selected boundary without netting separate opposite transactions', () => {
        const entries = [journal('2026-10-02', 'BANK_TRANSFER', [['gl-b1', 0, 75], ['gl-b2', 75, 0]]), journal('2026-10-03', 'BANK_TRANSFER', [['gl-b1', 25, 0], ['gl-b2', 0, 25]])];
        const r = report([bank(), bank('b2')], entries, { bankIds: ['b1'] });
        expect(r.groups[5]).toMatchObject({ moneyIn: 25, moneyOut: 75, net: -50 });
        expect(r).toMatchObject({ closing: -50, difference: 0 });
    });
    it('shows ledger opening journals as adjustments and never calls them receipts', () => {
        const r = report([bank()], [journal('2026-10-01', 'OPENING_BALANCE', [['gl-b1', 100, 0], ['equity', 0, 100]])]);
        expect(r.groups[4].moneyIn).toBe(100);
        expect(r.groups[0].moneyIn).toBe(0);
        expect(r).toMatchObject({ opening: 0, closing: 100, difference: 0 });
    });
    it('recognizes dated bank setup opening balances exactly once including negatives', () => {
        const banks = [bank('b1', { openingBalance: 10, openingBalanceDate: '2026-10-02' }), bank('b2', { openingBalance: -3, openingBalanceDate: '2026-10-02' })];
        const r = report(banks, []);
        expect(r).toMatchObject({ opening: 0, net: 7, closing: 7, difference: 0 });
        expect(r.groups[4]).toMatchObject({ moneyIn: 10, moneyOut: 3 });
        expect(report(banks, [], { from: '2026-10-03' })).toMatchObject({ opening: 7, net: 0, closing: 7, difference: 0 });
    });
    it('does not bring future setup balances into an earlier report', () => {
        expect(report([bank('b1', { openingBalance: 900, openingBalanceDate: '2026-11-01' })], [])).toMatchObject({ opening: 0, closing: 0, net: 0, details: [] });
    });
    it('isolates currencies and rejects an explicit mixed-currency selection', () => {
        const banks = [bank(), bank('usd', { currency: 'USD', openingBalance: 40 })];
        expect(report(banks, []).accounts).toHaveLength(1);
        expect(report(banks, [], { currency: 'USD' }).closing).toBe(40);
        expect(() => report(banks, [], { bankIds: ['b1', 'usd'] })).toThrow(/currency/);
    });
    it('blocks ambiguous duplicate GL mappings even when one bank is selected', () => {
        expect(() => report([bank(), bank('b2', { glAccountId: 'gl-b1' })], [], { bankIds: ['b1'] })).toThrow(/Duplicate bank GL/);
    });
    it('validates invalid dates, date ranges, duplicate IDs and unknown selections', () => {
        for (const patch of [{ from: '' }, { to: '2026-02-30' }, { from: '2026-11-01' }, { bankIds: ['missing'] }, { bankIds: ['b1', 'b1'] }, { currency: '' }])
            expect(() => report([bank()], [], patch)).toThrow();
        expect(() => report([bank(), bank()], [])).toThrow(/Duplicate bank account/);
        const j = journal('2026-10-01', 'MANUAL_JOURNAL', [['gl-b1', 1, 0], ['equity', 0, 1]]);
        expect(() => report([bank()], [j, j])).toThrow(/Duplicate journal/);
    });
    it('includes bank statement splits once, with a review category and source drilldown', () => {
        const j = journal('2026-10-03', 'BANK_STATEMENT', [['gl-b1', 0, 110], ['expense1', 60, 0], ['expense2', 40, 0], ['tax', 10, 0]]);
        const r = report([bank()], [j]);
        expect(r.details).toHaveLength(1);
        expect(r.details[0]).toMatchObject({ journalId: j.id, moneyOut: 110, category: cashCategories[6] });
        expect(r.closing).toBe(-110);
    });
    it('ignores noncash journals and warns about pre-opening ledger lines', () => {
        const entries = [journal('2026-10-02', 'CUSTOMER_INVOICE', [['ar', 100, 0], ['sales', 0, 100]]), journal('2025-12-31', 'MANUAL_JOURNAL', [['gl-b1', 10, 0], ['equity', 0, 10]])];
        const r = report([bank()], entries);
        expect(r).toMatchObject({ net: 0, closing: 0, details: [] });
        expect(r.warnings[0]).toContain('precedes');
    });
    it('has stable date ordering, no input mutation and a reconciled empty selection', () => {
        const entries = [journal('2026-10-03', 'CUSTOMER_PAYMENT', [['gl-b1', 1, 0], ['ar', 0, 1]]), journal('2026-10-01', 'CUSTOMER_PAYMENT', [['gl-b1', 2, 0], ['ar', 0, 2]])];
        const before = structuredClone(entries), r = report([bank()], entries);
        expect(r.details.map(d => d.date)).toEqual(['2026-10-01', '2026-10-03']);
        expect(entries).toEqual(before);
        expect(report([bank()], entries, { bankIds: [] })).toMatchObject({ accounts: [], opening: 0, closing: 0, difference: 0 });
    });
});
