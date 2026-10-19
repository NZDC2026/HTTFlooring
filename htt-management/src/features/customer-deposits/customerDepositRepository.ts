import { useSyncExternalStore } from 'react';
import { z } from 'zod';
import { registerRepository } from '../security/repositoryHost';
import { trustedAuthorization } from '../security/trustedAuthorization';
import { customerRepository } from '../contacts/data/customerRepository';
import { salesRepository } from '../sales/data/salesRepository';
import { paymentRepository } from '../sales/data/paymentRepository';
import { accountRepository } from '../accounting/data/accountRepository';
import { journalEntryRepository } from '../accounting/data/journalEntryRepository';
import { bankAccountRepository } from '../banking/data/bankAccountRepository';
import { assertJournalUncleared } from '../finance-closure/settlementRepository';
import { assertCurrentCrossModuleWriteSafe } from '../integration/crossModuleWriteGate';
import { assertPostingPeriod } from '../accounting/data/accountingPeriodRepository';
import { requireDateKey } from '../../lib/businessDate';
const m = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const text = z.string().trim().min(1).max(200), date = text.refine(v => { try { requireDateKey(v); return true; } catch { return false; } }), amount = z.number().finite().positive().refine(n => m(n) === n), reason = z.string().trim().min(3).max(2000), reference = z.string().trim().max(500).default('');
const receiptInput = z.object({ operationId: text, customerId: text, date, bankAccountId: text, amount, reference, reason }).strict();
const applicationInput = z.object({ operationId: text, depositId: text, invoiceId: text, date, amount, reference, reason }).strict();
const refundInput = z.object({ operationId: text, depositId: text, bankAccountId: text, date, amount, reference, reason }).strict();
const meta = { id: text, fingerprint: z.string(), journalId: text, status: z.enum(['POSTED', 'REVERSED']), createdBy: text, createdAt: text, reversalDate: date.optional(), reversalReason: reason.optional(), reversedBy: text.optional() };
const receiptSchema = receiptInput.extend({ ...meta, liabilityAccountId: text }).strict();
const applicationSchema = applicationInput.extend({ ...meta, paymentId: text }).strict();
const refundSchema = refundInput.extend(meta).strict();
const stateSchema = z.object({ deposits: z.array(receiptSchema), applications: z.array(applicationSchema), refunds: z.array(refundSchema), settings: z.array(z.object({ id: text, liabilityAccountId: text }).strict()).max(1) }).strict();
export type CustomerDeposit = z.infer<typeof receiptSchema>;
export type DepositApplication = z.infer<typeof applicationSchema>;
export type DepositRefund = z.infer<typeof refundSchema>;
export type DepositState = z.infer<typeof stateSchema>;
let state: DepositState = { deposits: [], applications: [], refunds: [], settings: [] }, version = 0;
const listeners = new Set<() => void>(), emit = () => { version++; listeners.forEach(f => f()); };
export function useCustomerDeposits() { useSyncExternalStore(f => { listeners.add(f); return () => { listeners.delete(f); }; }, () => version, () => version); return state; }
function row(id: string) { const d = state.deposits.find(d => d.id === id); if (!d) throw new Error('Customer deposit not found.'); return d; }
function balance(id: string) { const d = row(id); return d.status === 'REVERSED' ? 0 : m(d.amount - state.applications.filter(a => a.depositId === id && a.status === 'POSTED').reduce((n, a) => n + a.amount, 0) - state.refunds.filter(r => r.depositId === id && r.status === 'POSTED').reduce((n, r) => n + r.amount, 0)); }
export function depositBalanceAt(deposits: DepositState, customerId: string, asOfDate: string) {
    requireDateKey(asOfDate); const active = (r: { date: string; reversalDate?: string }) => r.date <= asOfDate && (!r.reversalDate || r.reversalDate > asOfDate);
    const ids = new Set(deposits.deposits.filter(d => d.customerId === customerId && active(d)).map(d => d.id));
    return m(deposits.deposits.filter(d => ids.has(d.id)).reduce((n, d) => n + d.amount, 0) - deposits.applications.filter(a => ids.has(a.depositId) && active(a)).reduce((n, a) => n + a.amount, 0) - deposits.refunds.filter(r => ids.has(r.depositId) && active(r)).reduce((n, r) => n + r.amount, 0));
}
function assertHistory(s: DepositState, id: string) {
    const d = s.deposits.find(d => d.id === id)!; const events = new Map<string, number>();
    const add = (day: string, amount: number) => events.set(day, m((events.get(day) ?? 0) + amount));
    add(d.date, d.amount); if (d.reversalDate) add(d.reversalDate, -d.amount);
    for (const r of [...s.applications, ...s.refunds].filter(r => r.depositId === id)) { if (r.date < d.date || r.reversalDate && r.reversalDate < r.date) throw new Error('Deposit event dates are invalid.'); add(r.date, -r.amount); if (r.reversalDate) add(r.reversalDate, r.amount); }
    let held = 0; for (const [, delta] of [...events].sort(([a], [b]) => a.localeCompare(b))) { held = m(held + delta); if (held < 0) throw new Error('Deposit would be overdrawn on a historical date.'); }
}
function once<T extends { operationId: string }>(input: T) {
    const fingerprint = JSON.stringify(input), prior = [...state.deposits, ...state.applications, ...state.refunds].find(r => r.operationId === input.operationId);
    if (prior && prior.fingerprint !== fingerprint) throw new Error('Operation ID already used with different deposit data.'); return { prior, fingerprint };
}
function liability(accountId: string) { const a = accountRepository.requireById(accountId); if (!a.active || a.type !== 'LIABILITY' || a.systemRole || a.allowManualPosting) throw new Error('Use the dedicated active deposit liability account.'); return a; }
function bank(id: string, date: string) { const b = bankAccountRepository.requireById(id), a = accountRepository.requireById(b.glAccountId); if (!b.active || date < b.openingBalanceDate || !a.active || a.type !== 'ASSET') throw new Error('Use an active bank account and a date after its opening balance.'); return b; }
function posting(date: string) { requireDateKey(date); assertPostingPeriod(date); assertCurrentCrossModuleWriteSafe(); }
function metaFor(fingerprint: string, journalId: string, id = crypto.randomUUID()) { return { id, fingerprint, journalId, status: 'POSTED' as const, createdBy: trustedAuthorization.require('sales.payment').userId, createdAt: new Date().toISOString() }; }
export const customerDepositRepository = {
    setupDefaults() {
        trustedAuthorization.require('accounting.post'); if (state.settings[0]) return state.settings[0];
        let code = 2290; while (accountRepository.getAll().some(a => a.code === String(code))) code++;
        const account = accountRepository.create({ code: String(code), name: 'Customer deposits held', type: 'LIABILITY', active: true, allowManualPosting: false });
        const settings = { id: crypto.randomUUID(), liabilityAccountId: account.id }; state.settings = [settings]; emit(); return settings;
    },
    balance(id: string) { trustedAuthorization.require('sales.read'); return balance(id); },
    receive(raw: unknown): CustomerDeposit {
        trustedAuthorization.require('sales.payment'); const input = receiptInput.parse(raw), { prior, fingerprint } = once(input); if (prior) return prior as CustomerDeposit;
        posting(input.date); const customer = customerRepository.getById(input.customerId); if (!customer || customer.status === 'INACTIVE') throw new Error('Choose an active customer.'); const config = state.settings[0]; if (!config) throw new Error('Configure the deposit liability account first.'); liability(config.liabilityAccountId); const b = bank(input.bankAccountId, input.date), id = crypto.randomUUID();
        const j = journalEntryRepository.post({ journalDate: input.date, description: 'Customer deposit received: ' + input.reference, reference: input.reference, sourceType: 'CUSTOMER_DEPOSIT', sourceId: id, lines: [{ accountId: b.glAccountId, debit: input.amount, credit: 0 }, { accountId: config.liabilityAccountId, debit: 0, credit: input.amount }] });
        const d: CustomerDeposit = { ...input, ...metaFor(fingerprint, j.id, id), liabilityAccountId: config.liabilityAccountId }; state.deposits = [...state.deposits, d]; emit(); return d;
    },
    apply(raw: unknown): DepositApplication {
        trustedAuthorization.require('sales.payment'); const input = applicationInput.parse(raw), { prior, fingerprint } = once(input); if (prior) return prior as DepositApplication;
        posting(input.date); const d = row(input.depositId); if (d.status !== 'POSTED' || input.date < d.date || input.amount > balance(d.id)) throw new Error('Deposit date or available balance is insufficient.'); liability(d.liabilityAccountId);
        const invoice = salesRepository.getAll().find(i => i.id === input.invoiceId && i.type === 'INVOICE'); if (!invoice || invoice.type !== 'INVOICE' || invoice.customerId !== d.customerId || ['VOID', 'DRAFT'].includes(invoice.status) || input.date < invoice.documentDate) throw new Error('Choose an issued invoice for the same customer.');
        const current = salesRepository.recalculateInvoiceBalance(invoice.id); if (input.amount > current.amountDue) throw new Error('Deposit application exceeds invoice amount due.'); const id = crypto.randomUUID(), paymentId = 'deposit-payment:' + id;
        paymentRepository.recordDepositSettlement({ id: paymentId, depositId: d.id, applicationId: id, customerId: d.customerId, invoiceId: invoice.id, paymentDate: input.date, bankAccountId: d.bankAccountId, amount: input.amount, reference: input.reference || 'Deposit applied ' + d.reference });
        const j = journalEntryRepository.post({ journalDate: input.date, description: 'Customer deposit applied to ' + invoice.documentNumber, reference: input.reference, sourceType: 'CUSTOMER_PAYMENT', sourceId: paymentId, lines: [{ accountId: d.liabilityAccountId, debit: input.amount, credit: 0 }, { accountId: accountRepository.requireBySystemRole('ACCOUNTS_RECEIVABLE').id, debit: 0, credit: input.amount }] });
        const a: DepositApplication = { ...input, ...metaFor(fingerprint, j.id, id), paymentId }; state.applications = [...state.applications, a]; assertHistory(state, d.id); salesRepository.recalculateInvoiceBalance(invoice.id); emit(); return a;
    },
    refund(raw: unknown): DepositRefund {
        trustedAuthorization.require('sales.payment'); const input = refundInput.parse(raw), { prior, fingerprint } = once(input); if (prior) return prior as DepositRefund;
        posting(input.date); const d = row(input.depositId); if (d.status !== 'POSTED' || input.date < d.date || input.amount > balance(d.id)) throw new Error('Refund exceeds the available deposit.'); liability(d.liabilityAccountId); const b = bank(input.bankAccountId, input.date), id = crypto.randomUUID();
        const j = journalEntryRepository.post({ journalDate: input.date, description: 'Unused customer deposit refunded', reference: input.reference, sourceType: 'CUSTOMER_DEPOSIT_REFUND', sourceId: id, lines: [{ accountId: d.liabilityAccountId, debit: input.amount, credit: 0 }, { accountId: b.glAccountId, debit: 0, credit: input.amount }] });
        const r: DepositRefund = { ...input, ...metaFor(fingerprint, j.id, id) }; state.refunds = [...state.refunds, r]; assertHistory(state, d.id); emit(); return r;
    },
    reverse(raw: unknown) {
        const actor = trustedAuthorization.require('sales.payment'), input = z.object({ entity: z.enum(['deposits', 'applications', 'refunds']), id: text, reversalDate: date, reason }).strict().parse(raw), r = state[input.entity].find(r => r.id === input.id); if (!r) throw new Error('Deposit record not found.'); if (r.status === 'REVERSED') return r;
        posting(input.reversalDate); if (input.reversalDate < r.date) throw new Error('Deposit reversal cannot precede its original date.');
        const depositId = input.entity === 'deposits' ? r.id : (r as DepositApplication | DepositRefund).depositId;
        if (input.entity === 'deposits' && [...state.applications, ...state.refunds].some(a => a.depositId === r.id && a.status === 'POSTED')) throw new Error('Reverse deposit applications and refunds before reversing its receipt.');
        assertJournalUncleared(r.journalId); journalEntryRepository.reverse({ journalEntryId: r.journalId, reversalDate: input.reversalDate, reason: input.reason });
        const next = { ...r, status: 'REVERSED' as const, reversalDate: input.reversalDate, reversalReason: input.reason, reversedBy: actor.userId }; (state[input.entity] as any[]) = state[input.entity].map(r => r.id === input.id ? next : r);
        if (input.entity === 'applications') { const a = r as DepositApplication; paymentRepository.reverseDepositSettlement(a.paymentId, input.reversalDate, input.reason); salesRepository.recalculateInvoiceBalance(a.invoiceId); }
        assertHistory(state, depositId); emit(); return next;
    },
};
registerRepository('customerDeposits', { repository: customerDepositRepository, read: 'sales.read', commands: { setupDefaults: 'accounting.post', balance: 'sales.read', receive: 'sales.payment', apply: 'sales.payment', refund: 'sales.payment', reverse: 'sales.payment' }, snapshot: () => state, restore: v => { state = v; }, publish: emit, validate: (raw, snapshots) => {
    const saved = stateSchema.parse(raw), s = snapshots as Record<string, any>, ops = new Set<string>();
    for (const config of saved.settings) { const account = s.accounts.accounts.find((a: any) => a.id === config.liabilityAccountId); if (!account || account.type !== 'LIABILITY' || account.systemRole || account.allowManualPosting) throw new Error('Invalid deposit liability mapping.'); }
    const aggregate = (lines: { accountId: string; debit: number; credit: number }[]) => { const map = new Map<string, number>(); for (const l of lines) map.set(l.accountId, m((map.get(l.accountId) ?? 0) + l.debit - l.credit)); return JSON.stringify([...map].filter(([, n]) => n).sort(([a], [b]) => a.localeCompare(b))); };
    for (const entity of ['deposits', 'applications', 'refunds'] as const) for (const r of saved[entity]) {
        const schema = entity === 'deposits' ? receiptInput : entity === 'applications' ? applicationInput : refundInput; const input = schema.parse(JSON.parse(r.fingerprint));
        if (ops.has(r.operationId) || JSON.stringify(input) !== r.fingerprint || Object.keys(input).some(k => (input as any)[k] !== (r as any)[k]) || r.status === 'REVERSED' && (!r.reversalDate || !r.reversalReason || !r.reversedBy || r.reversalDate < r.date) || r.status === 'POSTED' && r.reversalDate) throw new Error('Deposit request or reversal metadata mismatch.'); ops.add(r.operationId);
        const d = entity === 'deposits' ? r as CustomerDeposit : saved.deposits.find(d => d.id === (r as DepositApplication | DepositRefund).depositId); if (!d || !s.customers.customers.some((c: any) => c.id === d.customerId) || !saved.settings.some(c => c.liabilityAccountId === d.liabilityAccountId)) throw new Error('Deposit customer or receipt reference is missing.');
        let source = 'CUSTOMER_DEPOSIT', sourceId = r.id, expected: { accountId: string; debit: number; credit: number }[];
        if (entity === 'applications') {
            const a = r as DepositApplication, p = s.customerPayments.payments.find((p: any) => p.id === a.paymentId), invoice = s.sales.invoices.find((i: any) => i.id === a.invoiceId && i.customerId === d.customerId);
            if (!invoice || a.date < invoice.documentDate || ['DRAFT','VOID'].includes(invoice.status) && a.status === 'POSTED' || !p || p.depositApplicationId !== a.id || p.depositId !== d.id || p.invoiceId !== a.invoiceId || p.customerId !== d.customerId || p.amount !== a.amount || p.paymentDate !== a.date || p.bankAccountId !== d.bankAccountId || p.method !== 'OTHER' || p.status !== (a.status === 'POSTED' ? 'RECEIVED' : 'REVERSED') || a.status === 'REVERSED' && p.reversedAt !== a.reversalDate) throw new Error('Deposit application payment does not match its invoice.');
            source = 'CUSTOMER_PAYMENT'; sourceId = a.paymentId; const ar = s.accounts.accounts.find((a: any) => a.systemRole === 'ACCOUNTS_RECEIVABLE'); expected = [{ accountId: d.liabilityAccountId, debit: r.amount, credit: 0 }, { accountId: ar.id, debit: 0, credit: r.amount }];
        } else { const b = s.bankAccounts.bankAccounts.find((b: any) => b.id === (r as CustomerDeposit | DepositRefund).bankAccountId); if (!b) throw new Error('Deposit bank account is missing.'); source = entity === 'refunds' ? 'CUSTOMER_DEPOSIT_REFUND' : 'CUSTOMER_DEPOSIT'; expected = entity === 'refunds' ? [{ accountId: d.liabilityAccountId, debit: r.amount, credit: 0 }, { accountId: b.glAccountId, debit: 0, credit: r.amount }] : [{ accountId: b.glAccountId, debit: r.amount, credit: 0 }, { accountId: d.liabilityAccountId, debit: 0, credit: r.amount }]; }
        const j = s.journals.journalEntries.find((j: any) => j.id === r.journalId); if (!j || j.sourceType !== source || j.sourceId !== sourceId || j.journalDate !== r.date || aggregate(j.lines) !== aggregate(expected) || j.status !== (r.status === 'POSTED' ? 'POSTED' : 'REVERSED')) throw new Error('Deposit journal does not match its source.');
        if (r.status === 'REVERSED') { const rev = s.journals.journalEntries.find((j: any) => j.id === r.journalId && j.reversalJournalEntryId)?.reversalJournalEntryId, reversed = s.journals.journalEntries.find((j: any) => j.id === rev); if (!reversed || reversed.reversedJournalEntryId !== j.id || reversed.journalDate !== r.reversalDate || aggregate(reversed.lines) !== aggregate(expected.map(l => ({ ...l, debit: l.credit, credit: l.debit })))) throw new Error('Deposit reversal journal mismatch.'); }
    }
    const ids = [...saved.deposits,...saved.applications,...saved.refunds].map(r=>r.id); if(new Set(ids).size!==ids.length) throw new Error('Duplicate deposit record ID.');
    for(const j of s.journals.journalEntries) if(!j.reversedJournalEntryId && ['CUSTOMER_DEPOSIT','CUSTOMER_DEPOSIT_REFUND'].includes(j.sourceType) && ![...saved.deposits,...saved.refunds].some(r=>r.journalId===j.id)) throw new Error('Orphan deposit journal.');
    for (const d of saved.deposits) { assertHistory(saved, d.id); if(d.status==='REVERSED' && [...saved.applications,...saved.refunds].some(a=>a.depositId===d.id && (a.status==='POSTED'||a.reversalDate!>d.reversalDate!))) throw new Error('Reversed deposit has later consumption.'); }
    for (const p of s.customerPayments.payments) if (p.depositApplicationId && !saved.applications.some(a => a.id === p.depositApplicationId && a.paymentId === p.id && a.depositId === p.depositId)) throw new Error('Orphan deposit settlement payment.');
} });
