import { assertCurrentCrossModuleWriteSafe } from '../integration/crossModuleWriteGate';
import { useSyncExternalStore } from 'react';
import { z } from 'zod';
import { registerRepository } from '../security/repositoryHost';
import { requireDateKey } from '../../lib/businessDate';
import { salesRepository } from '../sales/data/salesRepository';
import { paymentRepository } from '../sales/data/paymentRepository';
import { creditNoteRepository } from '../sales/data/creditNoteRepository';
import { supplierCreditRepository } from '../purchases/data/supplierCreditRepository';
import { journalEntryRepository } from '../accounting/data/journalEntryRepository';
import { accountRepository } from '../accounting/data/accountRepository';
import { bankAccountRepository } from '../banking/data/bankAccountRepository';
import { bankReconciliationRepository } from '../banking/data/bankReconciliationRepository';
const money = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const id = z.string().trim().min(1).max(200), amount = z.number().finite().positive().refine(n => money(n) === n, 'Use cents precision');
const receiptInput = z.object({ operationId: id, customerId: id, paymentDate: id, bankAccountId: id, reference: z.string().max(500).optional(), allocations: z.array(z.object({ invoiceId: id, amount }).strict()).min(1).max(500) }).strict();
const refundInput = z.object({ operationId: id, creditId: id, paymentDate: id, bankAccountId: id, amount, reference: z.string().max(500).optional() }).strict();
export type Receipt = {
    id: string;
    fingerprint: string;
    operationId: string;
    customerId: string;
    paymentDate: string;
    bankAccountId: string;
    amount: number;
    reference?: string;
    paymentIds: string[];
    status: 'POSTED' | 'REVERSED';
    reversalDate?: string;
};
export type Refund = {
    id: string;
    fingerprint: string;
    operationId: string;
    creditId: string;
    contactId: string;
    paymentDate: string;
    bankAccountId: string;
    amount: number;
    reference?: string;
    journalEntryId: string;
    status: 'POSTED' | 'REVERSED';
    reversalDate?: string;
};
let receipts: Receipt[] = [], customerRefunds: Refund[] = [], supplierRefunds: Refund[] = [];
let version = 0;
const listeners = new Set<() => void>();
const emit = () => { version++; listeners.forEach(f => f()); };
export function useSettlements() { useSyncExternalStore(fn => { listeners.add(fn); return () => { listeners.delete(fn); }; }, () => version, () => version); return { receipts, customerRefunds, supplierRefunds }; }
function retry<T extends {
    operationId: string;
    fingerprint: string;
}>(rows: T[], operationId: string, raw: unknown) { const fingerprint = JSON.stringify(raw), old = rows.find(r => r.operationId === operationId); if (old && old.fingerprint !== fingerprint)
    throw new Error('Operation ID was already used with different data.'); return { old, fingerprint }; }
function bank(id: string, date: string) { requireDateKey(date, 'Payment date'); const b = bankAccountRepository.requireById(id); if (!b.active || date < b.openingBalanceDate)
    throw new Error('Bank is inactive or payment precedes its opening date.'); const gl = accountRepository.requireById(b.glAccountId); if (!gl.active || gl.type !== 'ASSET')
    throw new Error('Invalid bank ledger account.'); return b; }
export function assertJournalUncleared(journalId: string) { if (bankReconciliationRepository.getAll().some(r => r.clearedTransactionIds.some(id => id.startsWith(journalId + ':'))))
    throw new Error('A reconciled bank entry cannot be reversed here.'); }
function refundCredit(kind: 'customer' | 'supplier', creditId: string) { const c = kind === 'customer' ? creditNoteRepository.getById(creditId) : supplierCreditRepository.getById(creditId); if (!c || c.status === 'VOID' || c.status === 'DRAFT')
    throw new Error('An issued credit is required.'); return c; }
function updateRefundBalance(kind: 'customer' | 'supplier', creditId: string, events: {
    id: string;
    date: string;
    amount: number;
    reversalDate?: string;
}[]) { const credit = refundCredit(kind, creditId), amountRefunded = money(events.filter(e => !e.reversalDate).reduce((s, e) => s + e.amount, 0)), amountAvailable = money(credit.totals.total - credit.amountApplied - amountRefunded); if (amountAvailable < 0)
    throw new Error('Refund exceeds the unused credit.'); const next = { ...credit, refundEvents: events, amountRefunded, amountAvailable, status: amountAvailable === 0 ? 'FULLY_APPLIED' as const : 'ISSUED' as const, updatedAt: new Date().toISOString() }; if (kind === 'customer')
    creditNoteRepository.update(next as Parameters<typeof creditNoteRepository.update>[0]);
else
    supplierCreditRepository.update(next as Parameters<typeof supplierCreditRepository.update>[0]); }
function createRefund(kind: 'customer' | 'supplier', raw: z.input<typeof refundInput>) { assertCurrentCrossModuleWriteSafe(); const input = refundInput.parse(raw), rows = kind === 'customer' ? customerRefunds : supplierRefunds, { old, fingerprint } = retry(rows, input.operationId, input); if (old)
    return old; const credit = refundCredit(kind, input.creditId); const b = bank(input.bankAccountId, input.paymentDate); if (input.paymentDate < credit.creditDate || input.amount > credit.amountAvailable)
    throw new Error('Refund date/amount exceeds the available credit.'); const control = accountRepository.requireBySystemRole(kind === 'customer' ? 'ACCOUNTS_RECEIVABLE' : 'ACCOUNTS_PAYABLE'); const rowId = crypto.randomUUID(); const journal = journalEntryRepository.post({ journalDate: input.paymentDate, description: `${kind} refund ${input.reference ?? rowId}`, sourceType: kind === 'customer' ? 'CUSTOMER_REFUND' : 'SUPPLIER_REFUND', sourceId: rowId, reference: input.reference, lines: [{ accountId: control.id, debit: kind === 'customer' ? input.amount : 0, credit: kind === 'supplier' ? input.amount : 0 }, { accountId: b.glAccountId, debit: kind === 'supplier' ? input.amount : 0, credit: kind === 'customer' ? input.amount : 0 }] }); const row: Refund = { ...input, id: rowId, fingerprint, contactId: 'customerId' in credit ? credit.customerId : credit.supplierId, journalEntryId: journal.id, status: 'POSTED' }; updateRefundBalance(kind, credit.id, [...(credit.refundEvents ?? []), { id: row.id, date: row.paymentDate, amount: row.amount }]); if (kind === 'customer')
    customerRefunds = [...customerRefunds, row];
else
    supplierRefunds = [...supplierRefunds, row]; emit(); return row; }
function reverseRefund(kind: 'customer' | 'supplier', input: {
    id: string;
    reversalDate: string;
    reason: string;
}) { assertCurrentCrossModuleWriteSafe(); requireDateKey(input.reversalDate, 'Reversal date'); if (!input.reason?.trim() || input.reason.trim().length < 3)
    throw new Error('Enter a reversal reason.'); const rows = kind === 'customer' ? customerRefunds : supplierRefunds, row = rows.find(r => r.id === input.id); if (!row)
    throw new Error('Refund was not found.'); if (row.status === 'REVERSED')
    return row; if (input.reversalDate < row.paymentDate)
    throw new Error('Reversal cannot precede the refund.'); assertJournalUncleared(row.journalEntryId); journalEntryRepository.reverse({ journalEntryId: row.journalEntryId, reversalDate: input.reversalDate, reason: input.reason }); const credit = refundCredit(kind, row.creditId); updateRefundBalance(kind, credit.id, (credit.refundEvents ?? []).map(e => e.id === row.id ? { ...e, reversalDate: input.reversalDate } : e)); const next: Refund = { ...row, status: 'REVERSED', reversalDate: input.reversalDate }; if (kind === 'customer')
    customerRefunds = rows.map(r => r.id === row.id ? next : r);
else
    supplierRefunds = rows.map(r => r.id === row.id ? next : r); emit(); return next; }
export const customerSettlementRepository = {
    recordReceipt(raw: z.input<typeof receiptInput>) { const input = receiptInput.parse(raw), { old, fingerprint } = retry(receipts, input.operationId, input); if (old)
        return old; bank(input.bankAccountId, input.paymentDate); if (new Set(input.allocations.map(a => a.invoiceId)).size !== input.allocations.length)
        throw new Error('Each invoice may only be allocated once.'); for (const a of input.allocations) {
        const invoice = salesRepository.getAll().find(d => d.id === a.invoiceId && d.type === 'INVOICE');
        if (!invoice || invoice.type !== 'INVOICE' || invoice.customerId !== input.customerId || input.paymentDate < invoice.documentDate || ['VOID', 'DRAFT'].includes(invoice.status) || a.amount > invoice.amountDue)
            throw new Error('Invalid invoice customer, date or outstanding amount.');
    } const payments = input.allocations.map((a, i) => salesRepository.recordInvoicePayment({ ...input, invoiceId: a.invoiceId, amount: a.amount, method: 'BANK_TRANSFER', operationId: input.operationId + ':' + i })); const row: Receipt = { ...input, id: crypto.randomUUID(), fingerprint, amount: money(payments.reduce((s, p) => s + p.amount, 0)), paymentIds: payments.map(p => p.id), status: 'POSTED' }; receipts = [...receipts, row]; emit(); return row; },
    reverseReceipt(input: {
        id: string;
        reason: string;
    }) { const row = receipts.find(r => r.id === input.id); if (!row)
        throw new Error('Receipt not found.'); if (row.status === 'REVERSED')
        return row; for (const id of row.paymentIds) {
        const p = paymentRepository.getById(id);
        if (!p || p.status !== 'RECEIVED')
            throw new Error('Receipt allocations changed; inspect individual payments first.');
        for (const j of journalEntryRepository.getBySource('CUSTOMER_PAYMENT', id))
            assertJournalUncleared(j.id);
    } for (const id of row.paymentIds)
        salesRepository.reverseInvoicePayment(id, input.reason); const next: Receipt = { ...row, status: 'REVERSED', reversalDate: new Date().toISOString().slice(0, 10) }; receipts = receipts.map(r => r.id === row.id ? next : r); emit(); return next; },
    createRefund: (input: z.input<typeof refundInput>) => createRefund('customer', input), reverseRefund: (input: {
        id: string;
        reversalDate: string;
        reason: string;
    }) => reverseRefund('customer', input),
};
export const supplierRefundRepository = { create: (input: z.input<typeof refundInput>) => createRefund('supplier', input), reverse: (input: {
        id: string;
        reversalDate: string;
        reason: string;
    }) => reverseRefund('supplier', input),
    repairLegacyCredits(input: {
        date: string;
        reason: string;
    }) { assertCurrentCrossModuleWriteSafe(); requireDateKey(input.date, 'Repair date'); if (input.reason?.trim().length < 3)
        throw new Error('Enter a repair reason.'); const results = []; for (const credit of supplierCreditRepository.getAll().filter(c => c.status !== 'VOID')) {
        if (input.date < credit.creditDate)
            continue;
        if (journalEntryRepository.getBySource('SUPPLIER_CREDIT_RECLASS', credit.id).length)
            continue;
        const original = journalEntryRepository.getBySource('SUPPLIER_CREDIT', credit.id).find(j => j.status === 'POSTED');
        if (!original)
            continue;
        const inventory = accountRepository.requireBySystemRole('INVENTORY'), variance = accountRepository.requireBySystemRole('PURCHASE_PRICE_VARIANCE');
        const value = money(original.lines.filter(l => l.accountId === inventory.id).reduce((s, l) => s + l.credit - l.debit, 0));
        if (value <= 0)
            continue;
        results.push(journalEntryRepository.post({ journalDate: input.date, description: `Supplier credit reclassification ${credit.creditNumber}: ${input.reason}`, sourceType: 'SUPPLIER_CREDIT_RECLASS', sourceId: credit.id, lines: [{ accountId: inventory.id, debit: value, credit: 0 }, { accountId: variance.id, debit: 0, credit: value }] }));
    } return results; }
};
const refundSchema = z.object({ id, operationId: id, fingerprint: id, creditId: id, contactId: id, paymentDate: id, bankAccountId: id, amount, journalEntryId: id, status: z.enum(['POSTED', 'REVERSED']), reference: z.string().optional(), reversalDate: z.string().optional() }).strict();
registerRepository('customerSettlements', { repository: customerSettlementRepository, read: 'sales.read', commands: { recordReceipt: 'sales.payment', reverseReceipt: 'sales.payment', createRefund: 'sales.payment', reverseRefund: 'sales.payment' }, snapshot: () => ({ receipts, refunds: customerRefunds }), restore: v => { receipts = v.receipts; customerRefunds = v.refunds; }, validate: (v, snapshots) => { validateSettlementReferences(v, snapshots, false); const x = v as {
        receipts: Receipt[];
        refunds: Refund[];
    }; z.array(refundSchema.extend({ fingerprint: z.string() })).parse(x.refunds); z.array(z.object({ id, operationId: id, paymentIds: z.array(id), amount, status: z.enum(['POSTED', 'REVERSED']) }).passthrough()).parse(x.receipts); }, publish: emit });
registerRepository('supplierRefunds', { repository: supplierRefundRepository, read: 'purchases.read', commands: { create: 'purchases.payment', reverse: 'purchases.payment', repairLegacyCredits: 'accounting.recover' }, snapshot: () => ({ refunds: supplierRefunds }), restore: v => { supplierRefunds = v.refunds; }, validate: (v, snapshots) => { validateSettlementReferences(v, snapshots, true); z.array(refundSchema.extend({ fingerprint: z.string() })).parse((v as {
        refunds: Refund[];
    }).refunds); }, publish: emit });
function validateSettlementReferences(value: unknown, snapshots: Record<string, unknown>, supplier: boolean) {
    const state = value as {
        receipts?: Receipt[];
        refunds: Refund[];
    }, journals = (snapshots.journals as {
        journalEntries: {
            id: string;
            sourceType: string;
            sourceId?: string;
            status: string;
            totalDebit: number;
        }[];
    }).journalEntries;
    const credits = supplier ? (snapshots.supplierCredits as {
        supplierCredits: import('../purchases/types/supplierCredit').SupplierCredit[];
    }).supplierCredits : (snapshots.customerCredits as {
        creditNotes: import('../sales/types/creditNote').CreditNote[];
    }).creditNotes;
    const banks = (snapshots.bankAccounts as {
        bankAccounts: {
            id: string;
        }[];
    }).bankAccounts;
    for (const r of state.refunds) {
        const credit = credits.find(c => c.id === r.creditId), j = journals.find(j => j.id === r.journalEntryId), event = credit?.refundEvents?.find(e => e.id === r.id);
        if (!credit || r.contactId !== ('customerId' in credit ? credit.customerId : credit.supplierId) || !event || event.amount !== r.amount || event.date !== r.paymentDate || event.reversalDate !== r.reversalDate || !banks.some(b => b.id === r.bankAccountId) || !j || j.sourceId !== r.id || j.sourceType !== (supplier ? 'SUPPLIER_REFUND' : 'CUSTOMER_REFUND') || j.totalDebit !== r.amount || j.status !== (r.status === 'REVERSED' ? 'REVERSED' : 'POSTED'))
            throw new Error('Refund snapshot relationships are invalid.');
    }
    for (const c of credits) {
        const refunded = money(state.refunds.filter(r => r.creditId === c.id && r.status === 'POSTED').reduce((s, r) => s + r.amount, 0));
        if ((c.amountRefunded ?? 0) !== refunded)
            throw new Error('Credit refunded balance is invalid.');
    }
    for (const c of credits)
        for (const event of c.refundEvents ?? [])
            if (!state.refunds.some(r => r.id === event.id && r.creditId === c.id))
                throw new Error('Credit refund history has no settlement record.');
    if (!supplier) {
        const payments = (snapshots.customerPayments as {
            payments: {
                id: string;
                customerId: string;
                bankAccountId: string;
                amount: number;
                status: string;
            }[];
        }).payments;
        for (const r of state.receipts ?? []) {
            const rows = r.paymentIds.map(id => payments.find(p => p.id === id));
            if (new Set(r.paymentIds).size !== r.paymentIds.length || !rows.length || rows.some(p => !p || p.customerId !== r.customerId || p.bankAccountId !== r.bankAccountId || p.status !== (r.status === 'REVERSED' ? 'REVERSED' : 'RECEIVED')) || money(rows.reduce((s, p) => s + (p?.amount ?? 0), 0)) !== r.amount)
                throw new Error('Receipt allocation snapshot relationships are invalid.');
        }
    }
}
