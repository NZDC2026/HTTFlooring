import { matchesRule } from '../bank-rules/ruleConditions';
import {statementCorrectionEvidence} from '../banking/data/statementCorrectionEvidence';
import {bankJournalPostedAsAt,bankRowClearedBeforeLine} from '../banking/data/reconciliationChainEvidence';
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
    payee?: string;
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
function assertCurrentStatementBankDate(l: StatementLine) { if (l.date < bank(l.bankAccountId).openingBalanceDate) throw new Error('Statement predates the current bank opening date.'); }
function assertPriorCategorisationCorrections(lineId:string){const journals=journalEntryRepository.getAll(),proof=statementCorrectionEvidence(journals);if(journals.some(j=>j.sourceType==='BANK_STATEMENT'&&j.sourceId?.startsWith(lineId+':')&&proof.reviewIds.has(j.id)))throw new Error('Earlier categorisation correction requires reviewed recovery before changing this line again.');}
const inputRow = z.object({ date: id, description: z.string().trim().min(1).max(1000), amount: z.number().finite().refine(n => n !== 0 && money(n) === n, 'Enter a non-zero amount in cents'), reference: z.string().max(500).default(''), externalId: z.string().max(200).default(''), payee:z.string().trim().max(500).optional() }).strict();
export const bankStatementRepository = {
    importRows(raw: {
        bankAccountId: string;
        rows: z.input<typeof inputRow>[];
    }) { const input = z.object({ bankAccountId: id, rows: z.array(inputRow).min(1).max(10000) }).strict().parse(raw), b = bank(input.bankAccountId); let duplicates = 0; const next = [...lines], created: StatementLine[] = []; for (const r of input.rows) {
        requireDateKey(r.date, 'Statement date');
        if (r.date < b.openingBalanceDate)
            throw new Error('Statement predates the bank opening date.');
        const key = JSON.stringify([b.id, r.externalId || [r.date, r.amount, r.description.trim().toLowerCase(), r.reference.trim().toLowerCase(), ...(r.payee?[r.payee.trim().toLowerCase()]:[])]]), previous = next.find(l => l.key === key);
        if (previous) {
            if (r.externalId && (previous.amount !== r.amount || previous.date !== r.date || previous.description !== r.description || previous.reference !== r.reference || (previous.payee??'') !== (r.payee??'')))
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
        mapping?: Partial<Record<'date' | 'description' | 'amount' | 'reference' | 'id' | 'debit' | 'credit' | 'payee', string>>;
        dateFormat?: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
    }) {
        if (typeof input.csv !== 'string' || input.csv.length > 10000000)
            throw new Error('CSV exceeds the 10 MB limit.');
        const rows = parseCsv(input.csv.replace(/^\uFEFF/, '')), headers = rows.shift()?.map(h => h.trim().toLowerCase()) ?? [];
        if (rows.length > 10000)
            throw new Error('Import at most 10,000 rows at a time.');
        if (new Set(headers).size !== headers.length)
            throw new Error('CSV contains duplicate headers.');
        const defaults = { date: 'date', description: 'description', amount: 'amount', reference: 'reference', id: 'id', debit: '', credit: '', payee:'' }, mapping = { ...defaults, ...input.mapping };
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
                return { date, description: get('description'), amount, reference: get('reference'), externalId: get('id'), ...(mapping.payee?{payee:get('payee')}:{}) };
            }) });
    },
    candidates(input: {
        bankAccountId: string;
        asOfDate: string;
    }) { requireDateKey(input.asOfDate, 'As-of date'); const cleared=bankReconciliationRepository.getClearedTransactionIds(input.bankAccountId),journals=journalEntryRepository.getAll(),byId=new Map(journals.map(j=>[j.id,j])); return ledger(input.bankAccountId, input.asOfDate).filter(r => bankJournalPostedAsAt(byId.get(r.journalEntryId)!,journals,input.asOfDate) && !r.correctionOnly && !r.correctionIssue && !cleared.has(r.id) && !lines.some(l => l.ledgerIds.includes(r.id))); },
    match(input: {
        id: string;
        ledgerIds: string[];
    }) { const l = line(input.id); unmatched(l); assertCurrentStatementBankDate(l); if (!Array.isArray(input.ledgerIds) || !input.ledgerIds.length || new Set(input.ledgerIds).size !== input.ledgerIds.length)
        throw new Error('Select unique ledger entries.'); const cleared=bankReconciliationRepository.getClearedTransactionIds(l.bankAccountId); if(input.ledgerIds.some(id=>cleared.has(id)))throw new Error('Selected bank entries were already cleared by a completed reconciliation. Use the genuine source of this new statement line.'); const candidates = bankStatementRepository.candidates({ bankAccountId: l.bankAccountId, asOfDate: l.date }); const selected = input.ledgerIds.map(id => candidates.find(r => r.id === id)); if (selected.some(r => !r) || money(selected.reduce((s, r) => s + r!.moneyIn - r!.moneyOut, 0)) !== l.amount)
        throw new Error('Selected bank entries must match this signed statement amount exactly.'); return save({ ...l, status: 'MATCHED', ledgerIds: [...input.ledgerIds], history: [...l.history, { action: 'Matched', date: new Date().toISOString() }] }); },
    suggestions(input: {
        id: string;
    }) { const l = line(input.id); return (configurationRows['bank-rules'] ?? []).filter(r => r.status === 'Active' && r.enabled !== 'No').filter(r => matchesRule(r,l)).sort((a,b)=>Number(a.priority??100)-Number(b.priority??100)||a.id.localeCompare(b.id)); },
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
    } unmatched(l); assertCurrentStatementBankDate(l); assertPriorCategorisationCorrections(l.id); const splits = z.array(z.object({ accountId: id, amount: z.number().finite().positive().refine(n => money(n) === n), taxCode: id }).strict()).min(1).max(100).parse(input.splits); if (money(splits.reduce((s, p) => s + p.amount, 0)) !== Math.abs(l.amount))
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
        throw new Error('Line is already unmatched.'); const latest = bankReconciliationRepository.getLatestByBankAccount(l.bankAccountId); if (latest && l.date <= latest.statementDate)
        throw new Error('Reconciled statement lines cannot be reverted.');
        // Unmatching an unreconciled line changes only its association. Its old source may
        // already have been cleared manually; never reverse or release that historical clearing.
        if(l.status==='POSTED')assertPriorCategorisationCorrections(l.id);
        if(l.status==='POSTED'&&input.reversalDate!==l.date)throw new Error('Categorisation correction must reverse on the original statement date in an open period. It does not reverse an external payment.');
        if(l.status==='POSTED')for(const ledgerId of l.ledgerIds)assertJournalUncleared(ledgerId.split(':')[0]); if (l.status === 'POSTED' && l.journalEntryId)
        journalEntryRepository.reverse({ journalEntryId: l.journalEntryId, reversalDate: input.reversalDate, reason: input.reason }); return save({ ...l, status: 'UNMATCHED', ledgerIds: [], journalEntryId: undefined, fingerprint: undefined, history: [...l.history, { action: 'Reverted', date: input.reversalDate, reason: l.status==='MATCHED'?input.reason+' · Previous matched ledger rows: '+l.ledgerIds.join(', '):input.reason }] }); },
    reconcile(input: {
        bankAccountId: string;
        statementDate: string;
        statementBalance: number;
    }) { assertPostingPeriod(input.statementDate); assertCurrentCrossModuleWriteSafe(); requireDateKey(input.statementDate, 'Statement date'); if (!lines.some(l => l.bankAccountId === input.bankAccountId && l.date <= input.statementDate))
        throw new Error('Import the statement first.'); if (lines.some(l => l.bankAccountId === input.bankAccountId && l.date <= input.statementDate && l.status === 'UNMATCHED'))
        throw new Error('Process every statement line before completing reconciliation.'); const processed = lines.filter(l => l.bankAccountId === input.bankAccountId && l.date <= input.statementDate);
        const entries = ledger(input.bankAccountId, input.statementDate),journals=journalEntryRepository.getAll(),byId=new Map(journals.map(j=>[j.id,j]));
        for (const row of processed.filter(l => l.status === 'MATCHED' || l.status === 'POSTED')) {
            if(row.ledgerIds.some(id=>bankRowClearedBeforeLine(bankReconciliationRepository.getAll(),input.bankAccountId,id,row.date)))throw new Error('Statement match reuses a ledger row already cleared in an earlier statement. Unmatch this unreconciled line and select its genuine source.');
            const matched = row.ledgerIds.map(id => entries.find(e => e.id === id));
            if (!matched.length || matched.some(e => !e || !bankJournalPostedAsAt(byId.get(e.journalEntryId)!,journals,row.date) || e.correctionOnly || e.correctionIssue) || money(matched.reduce((n, e) => n + e!.moneyIn - e!.moneyOut, 0)) !== row.amount)
                throw new Error('Statement match is stale. Revert the statement line and review its ledger sources before reconciling.');
        }
        const cleared = processed.flatMap(l => l.ledgerIds); return bankReconciliationRepository.complete({ ...input, clearedTransactionIds: [...new Set([...bankReconciliationRepository.getClearedTransactionIds(input.bankAccountId), ...cleared])] }); }
};
const schema = z.object({ id, key: z.string(), bankAccountId: id, date: id, description: z.string(), reference: z.string(), amount: z.number().finite(), externalId: z.string(), payee:z.string().max(500).optional(), status: z.enum(['UNMATCHED', 'MATCHED', 'POSTED', 'IGNORED']), ledgerIds: z.array(id), journalEntryId: z.string().optional(), fingerprint: z.string().optional(), history: z.array(z.object({ action: z.string(), date: z.string(), reason: z.string().optional() })) }).strict();
registerRepository('bankStatements', { repository: bankStatementRepository, read: 'banking.read', commands: { importRows: 'banking.write', importCsv: 'banking.write', candidates: 'banking.read', suggestions: 'banking.read', match: 'banking.write', post: 'banking.write', ignore: 'banking.write', revert: 'banking.write', reconcile: 'banking.reconcile' }, snapshot: () => ({ lines }), restore: v => { lines = v.lines; }, validate: (value, snapshots) => {
    const parsed = z.object({ lines: z.array(schema) }).strict().parse(value), all = snapshots as Record<string, any>;
    const banks = all.bankAccounts.bankAccounts as { id: string; glAccountId: string }[];
    const journals = all.journals.journalEntries as import('../accounting/types/journalEntry').JournalEntry[];
    const used = new Set<string>(), journalById = new Map(journals.map(j => [j.id, j]));
    const ledgerById = new Map(journals.flatMap(journal => journal.lines.map(entry => [journal.id + ':' + entry.id, { journal, entry }] as const)));
    if (new Set(parsed.lines.map(l => l.key)).size !== parsed.lines.length) throw new Error('Duplicate bank statement import key.');
    for (const row of parsed.lines) {
        const account = banks.find(b => b.id === row.bankAccountId);
        if (!account) throw new Error('Bank statement account is missing.');
        try { requireDateKey(row.date); inputRow.parse({ date: row.date, description: row.description, amount: row.amount, reference: row.reference, externalId: row.externalId }); } catch { throw new Error('Invalid bank statement date, amount or metadata.'); }
        const expectedKey = JSON.stringify([row.bankAccountId, row.externalId || [row.date, row.amount, row.description.trim().toLowerCase(), row.reference.trim().toLowerCase(), ...(row.payee?[row.payee.trim().toLowerCase()]:[])]]);
        if (row.key !== expectedKey) throw new Error('Bank statement import identity does not match its data.');
        let status: StatementLine['status'] | undefined;
        for (const event of row.history) {
            if (!Number.isFinite(Date.parse(event.date))) throw new Error('Invalid bank statement history date.');
            if (!status && event.action === 'Imported') status = 'UNMATCHED';
            else if (status === 'UNMATCHED' && ['Matched', 'Posted', 'Excluded'].includes(event.action)) {
                if (event.action === 'Excluded' && (event.reason?.trim().length ?? 0) < 3) throw new Error('Bank statement exclusion has no reason.');
                status = event.action === 'Matched' ? 'MATCHED' : event.action === 'Posted' ? 'POSTED' : 'IGNORED';
            }
            else if (status && status !== 'UNMATCHED' && event.action === 'Reverted' && (event.reason?.trim().length ?? 0) >= 3) status = 'UNMATCHED';
            else throw new Error('Invalid bank statement lifecycle history.');
        }
        if (status !== row.status) throw new Error('Bank statement status does not match its history.');
        if (row.status === 'UNMATCHED' || row.status === 'IGNORED') {
            if (row.ledgerIds.length || row.journalEntryId || row.fingerprint) throw new Error('An unposted bank statement line cannot retain ledger links.');
            continue;
        }
        if (!row.ledgerIds.length || new Set(row.ledgerIds).size !== row.ledgerIds.length) throw new Error('Bank statement ledger links are missing or duplicated.');
        let total = 0;
        for (const ledgerId of row.ledgerIds) {
            const linked = ledgerById.get(ledgerId), journal = linked?.journal, entry = linked?.entry;
            if (used.has(ledgerId) || !journal || !entry || entry.accountId !== account.glAccountId || journal.journalDate > row.date) throw new Error('Bank statement ledger source is invalid or reused.');
            used.add(ledgerId); total = money(total + entry.debit - entry.credit);
        }
        if (total !== row.amount) throw new Error('Bank statement amount does not match its ledger links.');
        if (row.status === 'MATCHED') {
            // Old unmatched reversals remain loadable so users can revert and repair them.
            if (row.journalEntryId || row.fingerprint) throw new Error('Matched bank statements cannot claim categorisation journals.');
        }
        else {
            const journal = journalById.get(row.journalEntryId ?? ''), generation = row.history.filter(h => h.action === 'Posted').length - 1;
            const expectedIds = journal?.lines.filter(l => l.accountId === account.glAccountId).map(l => journal.id + ':' + l.id).sort();
            if (!journal || journal.status !== 'POSTED' || journal.sourceType !== 'BANK_STATEMENT' || journal.sourceId !== row.id + ':' + generation || journal.journalDate !== row.date || JSON.stringify(expectedIds) !== JSON.stringify([...row.ledgerIds].sort())) throw new Error('Bank statement categorisation journal does not match its source.');
            try {
                const splits = z.array(z.object({ accountId: id, amount: z.number().finite().positive().refine(n => money(n) === n), taxCode: id }).strict()).min(1).max(100).parse(JSON.parse(row.fingerprint ?? ''));
                if (money(splits.reduce((n, p) => n + p.amount, 0)) !== Math.abs(row.amount)) throw new Error('Wrong split total.');
            } catch { throw new Error('Bank statement categorisation fingerprint is invalid.'); }
        }
    }
}, publish: emit });
