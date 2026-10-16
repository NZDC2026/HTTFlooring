import { assertCurrentCrossModuleWriteSafe } from '../integration/crossModuleWriteGate';
import { assertPostingPeriod } from '../accounting/data/accountingPeriodRepository';
import { useSyncExternalStore } from 'react';
import { z } from 'zod';
import { registerRepository } from '../security/repositoryHost';
import { requireDateKey } from '../../lib/businessDate';
import { parseCsv } from '../page-previews/previewModel';
import { bankAccountRepository } from '../banking/data/bankAccountRepository';
import { bankReconciliationRepository } from '../banking/data/bankReconciliationRepository';
import { calculateBankRegister } from '../banking/data/bankRegisterService';
import { journalEntryRepository } from '../accounting/data/journalEntryRepository';
import { accountRepository } from '../accounting/data/accountRepository';
import { activeTaxRate, configurationRows, taxSnapshot } from '../business-workspace/configurationState';
import { assertJournalUncleared } from './settlementRepository';
const money = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const id = z.string().min(1).max(200);
export type StatementLine = {
    id: string;
    key: string;
    bankAccountId: string;
    date: string;
    description: string;
    reference: string;
    amount: number;
    externalId: string;
    status: 'UNMATCHED' | 'MATCHED' | 'POSTED' | 'IGNORED';
    ledgerIds: string[];
    journalEntryId?: string;
    fingerprint?: string;
    history: {
        action: string;
        date: string;
        reason?: string;
    }[];
};
let lines: StatementLine[] = [];
let version = 0;
const listeners = new Set<() => void>(), emit = () => { version++; listeners.forEach(f => f()); };
export function useStatementLines() { useSyncExternalStore(fn => { listeners.add(fn); return () => { listeners.delete(fn); }; }, () => version, () => version); return lines; }
function bank(bankAccountId: string) { const b = bankAccountRepository.requireById(bankAccountId); if (!b.active)
    throw new Error('Select an active bank account.'); return b; }
function line(id: string) { const l = lines.find(r => r.id === id); if (!l)
    throw new Error('Statement line was not found.'); return l; }
function unmatched(l: StatementLine) { if (l.status !== 'UNMATCHED')
    throw new Error('This line is already processed. Revert it before changing it.'); const latest = bankReconciliationRepository.getLatestByBankAccount(l.bankAccountId); if (latest && l.date <= latest.statementDate)
    throw new Error('Statement date is already reconciled.'); }
function save(l: StatementLine) { lines = lines.map(r => r.id === l.id ? l : r); emit(); return l; }
const ledger = (bankAccountId: string, date: string) => calculateBankRegister(bank(bankAccountId), journalEntryRepository.getAll(), date).transactions;
const inputRow = z.object({ date: id, description: z.string().trim().min(1).max(1000), amount: z.number().finite().refine(n => n !== 0 && money(n) === n, 'Enter a non-zero amount in cents'), reference: z.string().max(500).default(''), externalId: z.string().max(200).default('') }).strict();
export const bankStatementRepository = {
    importRows(raw: {
        bankAccountId: string;
        rows: z.input<typeof inputRow>[];
    }) { const input = z.object({ bankAccountId: id, rows: z.array(inputRow).min(1).max(10000) }).strict().parse(raw), b = bank(input.bankAccountId); let duplicates = 0; const next = [...lines], created: StatementLine[] = []; for (const r of input.rows) {
        requireDateKey(r.date, 'Statement date');
        if (r.date < b.openingBalanceDate)
            throw new Error('Statement predates the bank opening date.');
        const key = JSON.stringify([b.id, r.externalId || [r.date, r.amount, r.description.trim().toLowerCase(), r.reference.trim().toLowerCase()]]), previous = next.find(l => l.key === key);
        if (previous) {
            if (r.externalId && (previous.amount !== r.amount || previous.date !== r.date || previous.description !== r.description || previous.reference !== r.reference))
                throw new Error('Bank transaction ID conflicts with an existing row.');
            duplicates++;
            continue;
        }
        const latest = bankReconciliationRepository.getLatestByBankAccount(b.id);
        if (latest && r.date <= latest.statementDate)
            throw new Error('Cannot import new rows into a reconciled statement period.');
        const row: StatementLine = { ...r, id: crypto.randomUUID(), key, bankAccountId: b.id, status: 'UNMATCHED', ledgerIds: [], history: [{ action: 'Imported', date: new Date().toISOString() }] };
        next.push(row);
        created.push(row);
    } lines = next; emit(); return { created: created.length, duplicates }; },
    importCsv(input: {
        bankAccountId: string;
        csv: string;
        mapping?: Partial<Record<'date' | 'description' | 'amount' | 'reference' | 'id' | 'debit' | 'credit', string>>;
        dateFormat?: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
    }) {
        if (typeof input.csv !== 'string' || input.csv.length > 10000000)
            throw new Error('CSV exceeds the 10 MB limit.');
        const rows = parseCsv(input.csv.replace(/^\uFEFF/, '')), headers = rows.shift()?.map(h => h.trim().toLowerCase()) ?? [];
        if (rows.length > 10000)
            throw new Error('Import at most 10,000 rows at a time.');
        if (new Set(headers).size !== headers.length)
            throw new Error('CSV contains duplicate headers.');
        const defaults = { date: 'date', description: 'description', amount: 'amount', reference: 'reference', id: 'id', debit: '', credit: '' }, mapping = { ...defaults, ...input.mapping };
        for (const key of ['date', 'description'] as const)
            if (!headers.includes(mapping[key].toLowerCase()))
                throw new Error('Map the date and description columns.');
        const signed = !!mapping.amount && headers.includes(mapping.amount.toLowerCase());
        if (!signed && (!mapping.debit || !mapping.credit || !headers.includes(mapping.debit.toLowerCase()) || !headers.includes(mapping.credit.toLowerCase())))
            throw new Error('Map either a signed amount or both debit and credit columns.');
        const parseAmount = (value: string, line: number, allowBlank = false) => { let text = value.trim(); if (!text && allowBlank)
            return 0; if (/^\(.*\)$/.test(text))
            text = '-' + text.slice(1, -1); if (!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(text))
            throw new Error(`CSV row ${line} has an invalid amount.`); return Number(text.replaceAll(',', '')); };
        return bankStatementRepository.importRows({ bankAccountId: input.bankAccountId, rows: rows.filter(r => r.some(v => v.trim())).map((r, i) => {
                if (r.length !== headers.length)
                    throw new Error(`CSV row ${i + 2} has the wrong number of columns.`);
                const get = (key: keyof typeof mapping) => r[headers.indexOf(mapping[key].toLowerCase())]?.trim() ?? '';
                let date = get('date');
                if (input.dateFormat && input.dateFormat !== 'YYYY-MM-DD') {
                    const m = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(date);
                    if (!m)
                        throw new Error(`CSV row ${i + 2} has an invalid date.`);
                    date = m[3] + '-' + (input.dateFormat === 'DD/MM/YYYY' ? m[2] : m[1]).padStart(2, '0') + '-' + (input.dateFormat === 'DD/MM/YYYY' ? m[1] : m[2]).padStart(2, '0');
                }
                let amount: number;
                if (signed)
                    amount = parseAmount(get('amount'), i + 2);
                else {
                    const debit = parseAmount(get('debit'), i + 2, true), credit = parseAmount(get('credit'), i + 2, true);
                    if (debit < 0 || credit < 0 || debit && credit)
                        throw new Error(`CSV row ${i + 2} must have one positive debit or credit.`);
                    amount = money(credit - debit);
                }
                return { date, description: get('description'), amount, reference: get('reference'), externalId: get('id') };
            }) });
    },
    candidates(input: {
        bankAccountId: string;
        asOfDate: string;
    }) { requireDateKey(input.asOfDate, 'As-of date'); return ledger(input.bankAccountId, input.asOfDate).filter(r => r.journalStatus === 'POSTED' && !lines.some(l => l.ledgerIds.includes(r.id))); },
    match(input: {
        id: string;
        ledgerIds: string[];
    }) { const l = line(input.id); unmatched(l); if (!Array.isArray(input.ledgerIds) || !input.ledgerIds.length || new Set(input.ledgerIds).size !== input.ledgerIds.length)
        throw new Error('Select unique ledger entries.'); const candidates = bankStatementRepository.candidates({ bankAccountId: l.bankAccountId, asOfDate: l.date }); const selected = input.ledgerIds.map(id => candidates.find(r => r.id === id)); if (selected.some(r => !r) || money(selected.reduce((s, r) => s + r!.moneyIn - r!.moneyOut, 0)) !== l.amount)
        throw new Error('Selected bank entries must match this signed statement amount exactly.'); return save({ ...l, status: 'MATCHED', ledgerIds: [...input.ledgerIds], history: [...l.history, { action: 'Matched', date: new Date().toISOString() }] }); },
    suggestions(input: {
        id: string;
    }) { const l = line(input.id); return (configurationRows['bank-rules'] ?? []).filter(r => r.status === 'Active' && r.enabled !== 'No').filter(r => { const value = (r.field === 'Reference' ? l.reference : r.field === 'Description' ? l.description : '').toLowerCase(), test = r.value.toLowerCase(); return r.operator === 'Equals' ? value === test : r.operator === 'Starts with' ? value.startsWith(test) : value.includes(test); }); },
    post(input: {
        id: string;
        splits: {
            accountId: string;
            amount: number;
            taxCode: string;
        }[];
    }) { assertCurrentCrossModuleWriteSafe(); const l = line(input.id), fingerprint = JSON.stringify(input.splits); if (l.status === 'POSTED') {
        if (l.fingerprint !== fingerprint)
            throw new Error('Line was already posted with different categorisation.');
        return l;
    } unmatched(l); const splits = z.array(z.object({ accountId: id, amount: z.number().finite().positive().refine(n => money(n) === n), taxCode: id }).strict()).min(1).max(100).parse(input.splits); if (money(splits.reduce((s, p) => s + p.amount, 0)) !== Math.abs(l.amount))
        throw new Error('Split amounts must equal the statement total.'); const b = bank(l.bankAccountId), out = l.amount < 0; const offset = splits.flatMap(s => { const a = accountRepository.requireById(s.accountId); if (!a.active || !a.allowManualPosting || !['EXPENSE', 'REVENUE'].includes(a.type))
        throw new Error('Use an active manual expense/revenue account. Payments against AR/AP must be matched to their source documents.'); const rate = activeTaxRate(s.taxCode), net = money(s.amount / (1 + rate)), tax = money(s.amount - net); return [{ accountId: a.id, debit: out ? net : 0, credit: out ? 0 : net }, ...(tax ? [{ accountId: (out?taxSnapshot(s.taxCode).taxPaidAccountId:taxSnapshot(s.taxCode).taxCollectedAccountId)||accountRepository.requireBySystemRole(out ? 'GST_RECEIVABLE' : 'GST_PAYABLE').id, debit: out ? tax : 0, credit: out ? 0 : tax }] : [])]; }); const j = journalEntryRepository.post({ journalDate: l.date, description: l.description, reference: l.reference, sourceType: 'BANK_STATEMENT', sourceId: l.id + ':' + l.history.filter(h => h.action === 'Posted').length, lines: [{ accountId: b.glAccountId, debit: out ? 0 : l.amount, credit: out ? -l.amount : 0 }, ...offset] }); const ledgerIds = j.lines.filter(r => r.accountId === b.glAccountId).map(r => j.id + ':' + r.id); return save({ ...l, status: 'POSTED', journalEntryId: j.id, ledgerIds, fingerprint, history: [...l.history, { action: 'Posted', date: new Date().toISOString() }] }); },
    ignore(input: {
        id: string;
        reason: string;
    }) { const l = line(input.id); unmatched(l); if (input.reason?.trim().length < 3)
        throw new Error('Enter an exclusion reason.'); return save({ ...l, status: 'IGNORED', history: [...l.history, { action: 'Excluded', date: new Date().toISOString(), reason: input.reason }] }); },
    revert(input: {
        id: string;
        reversalDate: string;
        reason: string;
    }) { assertCurrentCrossModuleWriteSafe(); const l = line(input.id); requireDateKey(input.reversalDate, 'Reversal date'); if (input.reason?.trim().length < 3 || input.reversalDate < l.date)
        throw new Error('Enter a reason and a reversal date on or after the statement line.'); if (l.status === 'UNMATCHED')
        throw new Error('Line is already unmatched.'); for (const ledgerId of l.ledgerIds)
        assertJournalUncleared(ledgerId.split(':')[0]); const latest = bankReconciliationRepository.getLatestByBankAccount(l.bankAccountId); if (latest && l.date <= latest.statementDate)
        throw new Error('Reconciled statement lines cannot be reverted.'); if (l.status === 'POSTED' && l.journalEntryId)
        journalEntryRepository.reverse({ journalEntryId: l.journalEntryId, reversalDate: input.reversalDate, reason: input.reason }); return save({ ...l, status: 'UNMATCHED', ledgerIds: [], journalEntryId: undefined, fingerprint: undefined, history: [...l.history, { action: 'Reverted', date: input.reversalDate, reason: input.reason }] }); },
    reconcile(input: {
        bankAccountId: string;
        statementDate: string;
        statementBalance: number;
    }) { assertPostingPeriod(input.statementDate); assertCurrentCrossModuleWriteSafe(); requireDateKey(input.statementDate, 'Statement date'); if (!lines.some(l => l.bankAccountId === input.bankAccountId && l.date <= input.statementDate))
        throw new Error('Import the statement first.'); if (lines.some(l => l.bankAccountId === input.bankAccountId && l.date <= input.statementDate && l.status === 'UNMATCHED'))
        throw new Error('Process every statement line before completing reconciliation.'); const cleared = lines.filter(l => l.bankAccountId === input.bankAccountId && l.date <= input.statementDate).flatMap(l => l.ledgerIds); return bankReconciliationRepository.complete({ ...input, clearedTransactionIds: [...new Set([...bankReconciliationRepository.getClearedTransactionIds(input.bankAccountId), ...cleared])] }); }
};
const schema = z.object({ id, key: z.string(), bankAccountId: id, date: id, description: z.string(), reference: z.string(), amount: z.number().finite(), externalId: z.string(), status: z.enum(['UNMATCHED', 'MATCHED', 'POSTED', 'IGNORED']), ledgerIds: z.array(id), journalEntryId: z.string().optional(), fingerprint: z.string().optional(), history: z.array(z.object({ action: z.string(), date: z.string(), reason: z.string().optional() })) }).strict();
registerRepository('bankStatements', { repository: bankStatementRepository, read: 'banking.read', commands: { importRows: 'banking.write', importCsv: 'banking.write', candidates: 'banking.read', suggestions: 'banking.read', match: 'banking.write', post: 'banking.write', ignore: 'banking.write', revert: 'banking.write', reconcile: 'banking.reconcile' }, snapshot: () => ({ lines }), restore: v => { lines = v.lines; }, validate: v => { z.array(schema).parse((v as {
        lines: StatementLine[];
    }).lines); }, publish: emit });
