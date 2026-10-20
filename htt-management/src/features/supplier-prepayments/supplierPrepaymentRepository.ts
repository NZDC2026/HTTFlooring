import { useSyncExternalStore } from 'react';
import { z } from 'zod';
import { registerRepository } from '../security/repositoryHost';
import { trustedAuthorization } from '../security/trustedAuthorization';
import { supplierRepository } from '../contacts/data/supplierRepository';
import { supplierBillRepository } from '../purchases/data/supplierBillRepository';
import { supplierPaymentRepository } from '../purchases/data/supplierPaymentRepository';
import { accountRepository } from '../accounting/data/accountRepository';
import { journalEntryRepository } from '../accounting/data/journalEntryRepository';
import { bankAccountRepository } from '../banking/data/bankAccountRepository';
import { assertJournalUncleared } from '../finance-closure/settlementRepository';
import { assertCurrentCrossModuleWriteSafe } from '../integration/crossModuleWriteGate';
import { assertPostingPeriod } from '../accounting/data/accountingPeriodRepository';
import { requireDateKey } from '../../lib/businessDate';
const m = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const text = z.string().trim().min(1).max(200), date = text.refine(v => { try { requireDateKey(v); return true; } catch { return false; } }), amount = z.number().finite().positive().refine(n => m(n) === n), reason = z.string().trim().min(3).max(2000), reference = z.string().trim().max(500).default('');
const receiptInput = z.object({ operationId: text, supplierId: text, date, bankAccountId: text, amount, reference, reason }).strict();
const applicationInput = z.object({ operationId: text, prepaymentId: text, supplierBillId: text, date, amount, reference, reason }).strict();
const refundInput = z.object({ operationId: text, prepaymentId: text, bankAccountId: text, date, amount, reference, reason }).strict();
const meta = { id: text, fingerprint: z.string(), journalId: text, status: z.enum(['POSTED', 'REVERSED']), createdBy: text, createdAt: text, reversalDate: date.optional(), reversalReason: reason.optional(), reversedBy: text.optional() };
const receiptSchema = receiptInput.extend({ ...meta, assetAccountId: text }).strict();
const applicationSchema = applicationInput.extend({ ...meta, paymentId: text }).strict();
const refundSchema = refundInput.extend(meta).strict();
const stateSchema = z.object({ prepayments: z.array(receiptSchema), applications: z.array(applicationSchema), refunds: z.array(refundSchema), settings: z.array(z.object({ id: text, assetAccountId: text }).strict()).max(1) }).strict();
export type SupplierPrepayment = z.infer<typeof receiptSchema>;
export type PrepaymentApplication = z.infer<typeof applicationSchema>;
export type PrepaymentRefund = z.infer<typeof refundSchema>;
export type PrepaymentState = z.infer<typeof stateSchema>;
let state: PrepaymentState = { prepayments: [], applications: [], refunds: [], settings: [] }, version = 0;
const listeners = new Set<() => void>(), emit = () => { version++; listeners.forEach(f => f()); };
export function useSupplierPrepayments() { useSyncExternalStore(f => { listeners.add(f); return () => { listeners.delete(f); }; }, () => version, () => version); return state; }
function row(id: string) { const d = state.prepayments.find(d => d.id === id); if (!d) throw new Error('Supplier prepayment not found.'); return d; }
function balance(id: string) { const d = row(id); return d.status === 'REVERSED' ? 0 : m(d.amount - state.applications.filter(a => a.prepaymentId === id && a.status === 'POSTED').reduce((n, a) => n + a.amount, 0) - state.refunds.filter(r => r.prepaymentId === id && r.status === 'POSTED').reduce((n, r) => n + r.amount, 0)); }
export function prepaymentBalanceAt(prepayments: PrepaymentState, supplierId: string, asOfDate: string) {
    requireDateKey(asOfDate); const active = (r: { date: string; reversalDate?: string }) => r.date <= asOfDate && (!r.reversalDate || r.reversalDate > asOfDate);
    const ids = new Set(prepayments.prepayments.filter(d => d.supplierId === supplierId && active(d)).map(d => d.id));
    return m(prepayments.prepayments.filter(d => ids.has(d.id)).reduce((n, d) => n + d.amount, 0) - prepayments.applications.filter(a => ids.has(a.prepaymentId) && active(a)).reduce((n, a) => n + a.amount, 0) - prepayments.refunds.filter(r => ids.has(r.prepaymentId) && active(r)).reduce((n, r) => n + r.amount, 0));
}
function assertHistory(s: PrepaymentState, id: string) {
    const d = s.prepayments.find(d => d.id === id)!; const events = new Map<string, number>();
    const add = (day: string, amount: number) => events.set(day, m((events.get(day) ?? 0) + amount));
    add(d.date, d.amount); if (d.reversalDate) add(d.reversalDate, -d.amount);
    for (const r of [...s.applications, ...s.refunds].filter(r => r.prepaymentId === id)) { if (r.date < d.date || r.reversalDate && r.reversalDate < r.date) throw new Error('Prepayment event dates are invalid.'); add(r.date, -r.amount); if (r.reversalDate) add(r.reversalDate, r.amount); }
    let held = 0; for (const [, delta] of [...events].sort(([a], [b]) => a.localeCompare(b))) { held = m(held + delta); if (held < 0) throw new Error('Prepayment would be overdrawn on a historical date.'); }
}
function once<T extends { operationId: string }>(input: T) {
    const fingerprint = JSON.stringify(input), prior = [...state.prepayments, ...state.applications, ...state.refunds].find(r => r.operationId === input.operationId);
    if (prior && prior.fingerprint !== fingerprint) throw new Error('Operation ID already used with different prepayment data.'); return { prior, fingerprint };
}
function asset(accountId: string) { const a = accountRepository.requireById(accountId); if (!a.active || a.type !== 'ASSET' || a.systemRole || a.allowManualPosting) throw new Error('Use the dedicated active prepayment asset account.'); return a; }
function bank(id: string, date: string) { const b = bankAccountRepository.requireById(id), a = accountRepository.requireById(b.glAccountId); if (!b.active || date < b.openingBalanceDate || !a.active || a.type !== 'ASSET') throw new Error('Use an active bank account and a date after its opening balance.'); return b; }
function posting(date: string) { requireDateKey(date); assertPostingPeriod(date); assertCurrentCrossModuleWriteSafe(); }
function metaFor(fingerprint: string, journalId: string, id = crypto.randomUUID()) { return { id, fingerprint, journalId, status: 'POSTED' as const, createdBy: trustedAuthorization.require('purchases.payment').userId, createdAt: new Date().toISOString() }; }
export const supplierPrepaymentRepository = {
    setupDefaults() {
        trustedAuthorization.require('accounting.post'); if (state.settings[0]) return state.settings[0];
        let code = 1390; while (accountRepository.getAll().some(a => a.code === String(code))) code++;
        const account = accountRepository.create({ code: String(code), name: 'Supplier prepayments paid', type: 'ASSET', active: true, allowManualPosting: false });
        const settings = { id: crypto.randomUUID(), assetAccountId: account.id }; state.settings = [settings]; emit(); return settings;
    },
    balance(id: string) { trustedAuthorization.require('purchases.read'); return balance(id); },
    pay(raw: unknown): SupplierPrepayment {
        trustedAuthorization.require('purchases.payment'); const input = receiptInput.parse(raw), { prior, fingerprint } = once(input); if (prior) return prior as SupplierPrepayment;
        posting(input.date); const supplier = supplierRepository.getById(input.supplierId); if (!supplier || supplier.status === 'INACTIVE') throw new Error('Choose an active supplier.'); const config = state.settings[0]; if (!config) throw new Error('Configure the prepayment asset account first.'); asset(config.assetAccountId); const b = bank(input.bankAccountId, input.date), id = crypto.randomUUID();
        const j = journalEntryRepository.post({ journalDate: input.date, description: 'Supplier prepayment paid: ' + input.reference, reference: input.reference, sourceType: 'SUPPLIER_PREPAYMENT', sourceId: id, lines: [{ accountId: b.glAccountId, debit: 0 , credit: input.amount}, { accountId: config.assetAccountId, debit: input.amount , credit: 0}] });
        const d: SupplierPrepayment = { ...input, ...metaFor(fingerprint, j.id, id), assetAccountId: config.assetAccountId }; state.prepayments = [...state.prepayments, d]; emit(); return d;
    },
    apply(raw: unknown): PrepaymentApplication {
        trustedAuthorization.require('purchases.payment'); const input = applicationInput.parse(raw), { prior, fingerprint } = once(input); if (prior) return prior as PrepaymentApplication;
        posting(input.date); const d = row(input.prepaymentId); if (d.status !== 'POSTED' || input.date < d.date || input.amount > balance(d.id)) throw new Error('Prepayment date or available balance is insufficient.'); asset(d.assetAccountId);
        const bill = supplierBillRepository.getById(input.supplierBillId); if (!bill || bill.supplierId !== d.supplierId || ['VOID', 'DRAFT'].includes(bill.status) || input.date < bill.billDate) throw new Error('Choose an issued bill for the same supplier.');
        if (input.amount > bill.totals.amountDue) throw new Error('Prepayment application exceeds bill amount due.'); const id = crypto.randomUUID(), paymentId = 'prepayment-payment:' + id;
        supplierPaymentRepository.recordPrepaymentSettlement({ id: paymentId, prepaymentId: d.id, applicationId: id, supplierId: d.supplierId, supplierBillId: bill.id, paymentDate: input.date, bankAccountId: d.bankAccountId, amount: input.amount, reference: input.reference || 'Prepayment applied ' + d.reference });
        const j = journalEntryRepository.post({ journalDate: input.date, description: 'Supplier prepayment applied to ' + bill.billNumber, reference: input.reference, sourceType: 'SUPPLIER_PAYMENT', sourceId: paymentId, lines: [{ accountId: d.assetAccountId, debit: 0 , credit: input.amount}, { accountId: accountRepository.requireBySystemRole('ACCOUNTS_PAYABLE').id, debit: input.amount , credit: 0}] });
        const a: PrepaymentApplication = { ...input, ...metaFor(fingerprint, j.id, id), paymentId }; state.applications = [...state.applications, a]; assertHistory(state, d.id); emit(); return a;
    },
    refund(raw: unknown): PrepaymentRefund {
        trustedAuthorization.require('purchases.payment'); const input = refundInput.parse(raw), { prior, fingerprint } = once(input); if (prior) return prior as PrepaymentRefund;
        posting(input.date); const d = row(input.prepaymentId); if (d.status !== 'POSTED' || input.date < d.date || input.amount > balance(d.id)) throw new Error('Refund exceeds the available prepayment.'); asset(d.assetAccountId); const b = bank(input.bankAccountId, input.date), id = crypto.randomUUID();
        const j = journalEntryRepository.post({ journalDate: input.date, description: 'Unused supplier prepayment returned', reference: input.reference, sourceType: 'SUPPLIER_PREPAYMENT_REFUND', sourceId: id, lines: [{ accountId: d.assetAccountId, debit: 0 , credit: input.amount}, { accountId: b.glAccountId, debit: input.amount , credit: 0}] });
        const r: PrepaymentRefund = { ...input, ...metaFor(fingerprint, j.id, id) }; state.refunds = [...state.refunds, r]; assertHistory(state, d.id); emit(); return r;
    },
    reverse(raw: unknown) {
        const actor = trustedAuthorization.require('purchases.payment'), input = z.object({ entity: z.enum(['prepayments', 'applications', 'refunds']), id: text, reversalDate: date, reason }).strict().parse(raw), r = state[input.entity].find(r => r.id === input.id); if (!r) throw new Error('Prepayment record not found.'); if (r.status === 'REVERSED') return r;
        posting(input.reversalDate); if (input.reversalDate < r.date) throw new Error('Prepayment reversal cannot precede its original date.');
        const prepaymentId = input.entity === 'prepayments' ? r.id : (r as PrepaymentApplication | PrepaymentRefund).prepaymentId;
        if (input.entity === 'prepayments' && [...state.applications, ...state.refunds].some(a => a.prepaymentId === r.id && a.status === 'POSTED')) throw new Error('Reverse prepayment applications and refunds before reversing its receipt.');
        assertJournalUncleared(r.journalId); journalEntryRepository.reverse({ journalEntryId: r.journalId, reversalDate: input.reversalDate, reason: input.reason });
        const next = { ...r, status: 'REVERSED' as const, reversalDate: input.reversalDate, reversalReason: input.reason, reversedBy: actor.userId }; (state[input.entity] as any[]) = state[input.entity].map(r => r.id === input.id ? next : r);
        if (input.entity === 'applications') { const a = r as PrepaymentApplication; supplierPaymentRepository.reversePrepaymentSettlement(a.paymentId, input.reversalDate, input.reason); }
        assertHistory(state, prepaymentId); emit(); return next;
    },
};
registerRepository('supplierPrepayments', { repository: supplierPrepaymentRepository, read: 'purchases.read', commands: { setupDefaults: 'accounting.post', balance: 'purchases.read', pay: 'purchases.payment', apply: 'purchases.payment', refund: 'purchases.payment', reverse: 'purchases.payment' }, snapshot: () => state, restore: v => { state = v; }, publish: emit, validate: (raw, snapshots) => {
    const saved = stateSchema.parse(raw), s = snapshots as Record<string, any>, ops = new Set<string>();
    for (const config of saved.settings) { const account = s.accounts.accounts.find((a: any) => a.id === config.assetAccountId); if (!account || account.type !== 'ASSET' || account.systemRole || account.allowManualPosting) throw new Error('Invalid prepayment asset mapping.'); }
    const aggregate = (lines: { accountId: string; debit: number; credit: number }[]) => { const map = new Map<string, number>(); for (const l of lines) map.set(l.accountId, m((map.get(l.accountId) ?? 0) + l.debit - l.credit)); return JSON.stringify([...map].filter(([, n]) => n).sort(([a], [b]) => a.localeCompare(b))); };
    for (const entity of ['prepayments', 'applications', 'refunds'] as const) for (const r of saved[entity]) {
        const schema = entity === 'prepayments' ? receiptInput : entity === 'applications' ? applicationInput : refundInput; const input = schema.parse(JSON.parse(r.fingerprint));
        if (ops.has(r.operationId) || JSON.stringify(input) !== r.fingerprint || Object.keys(input).some(k => (input as any)[k] !== (r as any)[k]) || r.status === 'REVERSED' && (!r.reversalDate || !r.reversalReason || !r.reversedBy || r.reversalDate < r.date) || r.status === 'POSTED' && r.reversalDate) throw new Error('Prepayment request or reversal metadata mismatch.'); ops.add(r.operationId);
        const d = entity === 'prepayments' ? r as SupplierPrepayment : saved.prepayments.find(d => d.id === (r as PrepaymentApplication | PrepaymentRefund).prepaymentId); if (!d || !s.suppliers.suppliers.some((c: any) => c.id === d.supplierId) || !saved.settings.some(c => c.assetAccountId === d.assetAccountId)) throw new Error('Prepayment supplier or receipt reference is missing.');
        let source = 'SUPPLIER_PREPAYMENT', sourceId = r.id, expected: { accountId: string; debit: number; credit: number }[];
        if (entity === 'applications') {
            const a = r as PrepaymentApplication, p = s.supplierPayments.supplierPayments.find((p: any) => p.id === a.paymentId), bill = s.supplierBills.supplierBills.find((i: any) => i.id === a.supplierBillId && i.supplierId === d.supplierId);
            if (!bill || a.date < bill.billDate || ['DRAFT','VOID'].includes(bill.status) && a.status === 'POSTED' || !p || p.prepaymentApplicationId !== a.id || p.prepaymentId !== d.id || p.allocations.length !== 1 || p.allocations[0].supplierBillId !== a.supplierBillId || p.allocations[0].amount !== a.amount || p.supplierId !== d.supplierId || p.amount !== a.amount || p.paymentDate !== a.date || p.bankAccountId !== d.bankAccountId || p.method !== 'OTHER' || p.status !== (a.status === 'POSTED' ? 'POSTED' : 'REVERSED') || a.status === 'REVERSED' && p.reversedAt !== a.reversalDate) throw new Error('Prepayment application payment does not match its bill.');
            source = 'SUPPLIER_PAYMENT'; sourceId = a.paymentId; const ar = s.accounts.accounts.find((a: any) => a.systemRole === 'ACCOUNTS_PAYABLE'); expected = [{ accountId: d.assetAccountId, debit: 0 , credit: r.amount}, { accountId: ar.id, debit: r.amount , credit: 0}];
        } else { const b = s.bankAccounts.bankAccounts.find((b: any) => b.id === (r as SupplierPrepayment | PrepaymentRefund).bankAccountId); if (!b) throw new Error('Prepayment bank account is missing.'); source = entity === 'refunds' ? 'SUPPLIER_PREPAYMENT_REFUND' : 'SUPPLIER_PREPAYMENT'; expected = entity === 'refunds' ? [{ accountId: d.assetAccountId, debit: 0 , credit: r.amount}, { accountId: b.glAccountId, debit: r.amount , credit: 0}] : [{ accountId: b.glAccountId, debit: 0 , credit: r.amount}, { accountId: d.assetAccountId, debit: r.amount , credit: 0}]; }
        const j = s.journals.journalEntries.find((j: any) => j.id === r.journalId); if (!j || j.lines.length !== 2 || j.sourceType !== source || j.sourceId !== sourceId || j.journalDate !== r.date || aggregate(j.lines) !== aggregate(expected) || j.status !== (r.status === 'POSTED' ? 'POSTED' : 'REVERSED')) throw new Error('Prepayment journal does not match its source.');
        if (r.status === 'REVERSED') { const rev = s.journals.journalEntries.find((j: any) => j.id === r.journalId && j.reversalJournalEntryId)?.reversalJournalEntryId, reversed = s.journals.journalEntries.find((j: any) => j.id === rev); if (!reversed || reversed.lines.length !== 2 || reversed.sourceType !== source || reversed.reversedJournalEntryId !== j.id || reversed.journalDate !== r.reversalDate || aggregate(reversed.lines) !== aggregate(expected.map(l => ({ ...l, debit: l.credit, credit: l.debit})))) throw new Error('Prepayment reversal journal mismatch.'); }
    }
    const ids = [...saved.prepayments,...saved.applications,...saved.refunds].map(r=>r.id); if(new Set(ids).size!==ids.length) throw new Error('Duplicate prepayment record ID.');
    for(const j of s.journals.journalEntries) if(!j.reversedJournalEntryId && ['SUPPLIER_PREPAYMENT','SUPPLIER_PREPAYMENT_REFUND'].includes(j.sourceType) && ![...saved.prepayments,...saved.refunds].some(r=>r.journalId===j.id)) throw new Error('Orphan prepayment journal.');
    for (const d of saved.prepayments) { assertHistory(saved, d.id); if(d.status==='REVERSED' && [...saved.applications,...saved.refunds].some(a=>a.prepaymentId===d.id && (a.status==='POSTED'||a.reversalDate!>d.reversalDate!))) throw new Error('Reversed prepayment has later consumption.'); }
    for (const p of s.supplierPayments.supplierPayments) if (p.prepaymentApplicationId && !saved.applications.some(a => a.id === p.prepaymentApplicationId && a.paymentId === p.id && a.prepaymentId === p.prepaymentId)) throw new Error('Orphan prepayment settlement payment.');
} });
