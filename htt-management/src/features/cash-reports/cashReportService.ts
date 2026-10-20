import type { BankAccount } from '../banking/types/bankAccount';
import type { JournalEntry } from '../accounting/types/journalEntry';
import { calculateBankRegister } from '../banking/data/bankRegisterService';
import { requireDateKey } from '../../lib/businessDate';
export const cashCategories = ['Customer receipts & reversals', 'Customer refunds & reversals', 'Supplier payments & reversals', 'Supplier refunds & reversals', 'Bank opening adjustments', 'Transfers across selection', 'Other bank movements / review'] as const;
export type CashCategory = typeof cashCategories[number];
export type CashReportDetail = {
    id: string;
    bankId: string;
    bankName: string;
    date: string;
    journalId?: string;
    journalNumber?: string;
    description: string;
    sourceType: string;
    category: CashCategory;
    moneyIn: number;
    moneyOut: number;
};
export type CashBankSummary = {
    bankId: string;
    name: string;
    active: boolean;
    opening: number;
    moneyIn: number;
    moneyOut: number;
    closing: number;
    difference: number;
};
const cents = (n: number) => Math.round(n * 100);
const amount = (n: number) => n / 100;
function category(entry: JournalEntry): CashCategory {
    switch (entry.sourceType) {
        case 'CUSTOMER_DEPOSIT':
        case 'CUSTOMER_PAYMENT':
        case 'CUSTOMER_PAYMENT_REVERSAL': return cashCategories[0];
        case 'CUSTOMER_DEPOSIT_REFUND':
        case 'CUSTOMER_REFUND': return cashCategories[1];
        case 'SUPPLIER_PREPAYMENT':
        case 'SUPPLIER_PAYMENT':
        case 'SUPPLIER_PAYMENT_REVERSAL': return cashCategories[2];
        case 'SUPPLIER_PREPAYMENT_REFUND':
        case 'SUPPLIER_REFUND': return cashCategories[3];
        case 'OPENING_BALANCE': return cashCategories[4];
        case 'BANK_TRANSFER': return cashCategories[5];
        default: return cashCategories[6];
    }
}
/** Uses the same dated originals and reversals as the bank register. A REVERSED original remains history. */
export function calculateCashReport(input: {
    bankAccounts: BankAccount[];
    journalEntries: JournalEntry[];
    from: string;
    to: string;
    currency: string;
    bankIds?: string[];
}) {
    requireDateKey(input.from, 'From date');
    requireDateKey(input.to, 'To date');
    if (input.from > input.to)
        throw new Error('From date must not exceed To date.');
    if (!input.currency.trim())
        throw new Error('Select a currency.');
    const byId = new Map(input.bankAccounts.map(b => [b.id, b]));
    if (byId.size !== input.bankAccounts.length)
        throw new Error('Duplicate bank account IDs require review.');
    if (input.bankIds && (new Set(input.bankIds).size !== input.bankIds.length || input.bankIds.some(id => !byId.has(id))))
        throw new Error('Invalid bank account selection.');
    const banks = input.bankAccounts.filter(b => (!input.bankIds || input.bankIds.includes(b.id)) && b.currency === input.currency);
    if (input.bankIds?.some(id => byId.get(id)!.currency !== input.currency))
        throw new Error('Selected banks must use the report currency.');
    // A duplicated mapping would count the same cash twice, even if only one mapped bank is selected.
    for (const bank of banks) {
        if (input.bankAccounts.filter(b => b.glAccountId === bank.glAccountId).length !== 1)
            throw new Error('Duplicate bank GL mappings require review before reporting.');
        requireDateKey(bank.openingBalanceDate, 'Bank opening date');
    }
    const journalById = new Map(input.journalEntries.map(j => [j.id, j]));
    if (journalById.size !== input.journalEntries.length)
        throw new Error('Duplicate journal IDs require review.');
    const warnings: string[] = [];
    const details: CashReportDetail[] = [];
    const accounts: CashBankSummary[] = banks.map(bank => {
        if (bank.openingBalanceDate > input.to)
            return { bankId: bank.id, name: bank.name, active: bank.active, opening: 0, moneyIn: 0, moneyOut: 0, closing: 0, difference: 0 };
        if (input.journalEntries.some(j => j.journalDate < bank.openingBalanceDate && j.journalDate <= input.to && j.lines.some(l => l.accountId === bank.glAccountId && (l.debit || l.credit))))
            warnings.push(`${bank.name}: ledger activity precedes the bank opening date and is excluded, matching the bank register. Review its opening setup.`);
        const register = calculateBankRegister(bank, input.journalEntries, input.to);
        let opening = bank.openingBalanceDate < input.from ? cents(bank.openingBalance) : 0, moneyIn = 0, moneyOut = 0;
        if (bank.openingBalanceDate >= input.from && bank.openingBalance !== 0) {
            const value = cents(bank.openingBalance);
            details.push({ id: `setup:${bank.id}`, bankId: bank.id, bankName: bank.name, date: bank.openingBalanceDate, description: 'Bank setup opening balance (not a cash receipt)', sourceType: 'BANK_SETUP', category: cashCategories[4], moneyIn: amount(Math.max(value, 0)), moneyOut: amount(Math.max(-value, 0)) });
            moneyIn += Math.max(value, 0);
            moneyOut += Math.max(-value, 0);
        }
        for (const row of register.transactions) {
            if (row.transactionDate < input.from) {
                opening += cents(row.moneyIn) - cents(row.moneyOut);
                continue;
            }
            const entry = journalById.get(row.journalEntryId)!;
            // Explicit reversal source types are categorized directly; generic reversals preserve their original type.
            details.push({ id: row.id, bankId: bank.id, bankName: bank.name, date: row.transactionDate, journalId: entry.id, journalNumber: entry.journalNumber, description: entry.description, sourceType: entry.sourceType, category: category(entry), moneyIn: row.moneyIn, moneyOut: row.moneyOut });
            moneyIn += cents(row.moneyIn);
            moneyOut += cents(row.moneyOut);
        }
        const closing = cents(register.closingBalance);
        return { bankId: bank.id, name: bank.name, active: bank.active, opening: amount(opening), moneyIn: amount(moneyIn), moneyOut: amount(moneyOut), closing: amount(closing), difference: amount(opening + moneyIn - moneyOut - closing) };
    });
    const grouped = new Map(cashCategories.map(name => [name, { category: name, moneyIn: 0, moneyOut: 0, net: 0 }]));
    const transfers = new Map<string, number>();
    for (const row of details) {
        if (row.category === cashCategories[5]) {
            const key = row.journalId!;
            transfers.set(key, (transfers.get(key) ?? 0) + cents(row.moneyIn) - cents(row.moneyOut));
            continue;
        }
        const group = grouped.get(row.category)!;
        group.moneyIn += cents(row.moneyIn);
        group.moneyOut += cents(row.moneyOut);
    }
    for (const net of transfers.values()) {
        const group = grouped.get(cashCategories[5])!;
        group.moneyIn += Math.max(net, 0);
        group.moneyOut += Math.max(-net, 0);
    }
    const groups = [...grouped.values()].map(g => ({ category: g.category, moneyIn: amount(g.moneyIn), moneyOut: amount(g.moneyOut), net: amount(g.moneyIn - g.moneyOut) }));
    const sum = (key: 'opening' | 'closing' | 'moneyIn' | 'moneyOut') => amount(accounts.reduce((s, a) => s + cents(a[key]), 0));
    const opening = sum('opening'), closing = sum('closing'), net = amount(groups.reduce((s, g) => s + cents(g.net), 0));
    const reviewCount = details.filter(d => d.category === cashCategories[6]).length;
    if (reviewCount)
        warnings.push(`${reviewCount} bank ledger line(s) need activity classification review. They are included in totals.`);
    details.sort((a, b) => a.date.localeCompare(b.date) || (a.journalNumber ?? '').localeCompare(b.journalNumber ?? '') || a.id.localeCompare(b.id));
    return { from: input.from, to: input.to, currency: input.currency, accounts, groups, details, warnings, opening, closing, net, grossIn: sum('moneyIn'), grossOut: sum('moneyOut'), difference: amount(cents(opening) + cents(net) - cents(closing)) };
}
