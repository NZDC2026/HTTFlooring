import { useSyncExternalStore } from 'react';
import { z } from 'zod';
import { registerRepository } from '../security/repositoryHost';
import { trustedAuthorization } from '../security/trustedAuthorization';
import { supplierBillRepository } from '../purchases/data/supplierBillRepository';
import { supplierPaymentRepository } from '../purchases/data/supplierPaymentRepository';
import { bankAccountRepository } from '../banking/data/bankAccountRepository';
import { assertSourceNotReconciled } from '../banking/data/reconciliationLock';
import { requireDateKey } from '../../lib/businessDate';
import { assertCurrentCrossModuleWriteSafe } from '../integration/crossModuleWriteGate';
const money = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const id = z.string().trim().min(1).max(200);
const inputSchema = z.object({ operationId: id, paymentDate: id, bankAccountId: id, reference: z.string().max(500), allocations: z.array(z.object({ supplierBillId: id, amount: z.number().finite().positive().refine(n => money(n) === n) }).strict()).min(1).max(500) }).strict();
export type PaymentBatch = z.infer<typeof inputSchema> & {
    id: string;
    fingerprint: string;
    status: 'DRAFT' | 'APPROVED' | 'POSTED' | 'REVERSED' | 'CANCELLED';
    createdBy: string;
    approvedBy?: string;
    paymentIds: string[];
    history: {
        action: string;
        actor: string;
        at: string;
        reason?: string;
    }[];
};
let batches: PaymentBatch[] = [];
let version = 0;
const listeners = new Set<() => void>();
const emit = () => { version++; listeners.forEach(f => f()); };
export function usePaymentBatches() { useSyncExternalStore(fn => { listeners.add(fn); return () => { listeners.delete(fn); }; }, () => version, () => version); return batches; }
const actor = () => { const p = trustedAuthorization.current(); if (!p)
    throw new Error('A verified session is required.'); return p.userId; };
function event(action: string, reason?: string) { return { action, reason, actor: actor(), at: new Date().toISOString() }; }
function find(id: string) { const row = batches.find(b => b.id === id); if (!row)
    throw new Error('Payment batch was not found.'); return row; }
function save(row: PaymentBatch) { batches = batches.map(b => b.id === row.id ? row : b); emit(); return row; }
function validate(input: z.infer<typeof inputSchema>) { requireDateKey(input.paymentDate, 'Payment date'); const b = bankAccountRepository.requireById(input.bankAccountId); if (!b.active || input.paymentDate < b.openingBalanceDate)
    throw new Error('Invalid paying bank account/date.'); if (new Set(input.allocations.map(a => a.supplierBillId)).size !== input.allocations.length)
    throw new Error('Select each bill only once.'); for (const allocation of input.allocations) {
    const bill = supplierBillRepository.getById(allocation.supplierBillId);
    if (!bill || bill.status === 'VOID' || allocation.amount > bill.totals.amountDue || input.paymentDate < bill.billDate)
        throw new Error('A bill amount, date or outstanding balance changed. Review the batch.');
} }
export const paymentBatchRepository = {
    create(raw: z.input<typeof inputSchema>) { const input = inputSchema.parse(raw), fingerprint = JSON.stringify(input), existing = batches.find(b => b.operationId === input.operationId); if (existing) {
        if (existing.fingerprint !== fingerprint)
            throw new Error('Operation ID was used with different batch data.');
        return existing;
    } validate(input); const row: PaymentBatch = { ...input, id: crypto.randomUUID(), fingerprint, status: 'DRAFT', createdBy: actor(), paymentIds: [], history: [event('Created')] }; batches = [...batches, row]; emit(); return row; },
    approve(id: string) { const row = find(id); if (row.status === 'APPROVED')
        return row; if (row.status !== 'DRAFT')
        throw new Error('Only a draft batch can be approved.'); validate(row); return save({ ...row, status: 'APPROVED', approvedBy: actor(), history: [...row.history, event('Approved')] }); },
    post(id: string) { const row = find(id); if (row.status === 'POSTED')
        return row; if (row.status !== 'APPROVED')
        throw new Error('Approve the batch before recording payments.'); assertCurrentCrossModuleWriteSafe(); validate(row); const groups = new Map<string, typeof row.allocations>(); for (const allocation of row.allocations) {
        const bill = supplierBillRepository.getById(allocation.supplierBillId)!;
        groups.set(bill.supplierId, [...(groups.get(bill.supplierId) ?? []), allocation]);
    } const payments = [...groups].map(([supplierId, allocations]) => supplierPaymentRepository.create({ operationId: 'batch:' + row.id + ':' + supplierId, supplierId, paymentDate: row.paymentDate, bankAccountId: row.bankAccountId, reference: row.reference, method: 'BANK_TRANSFER', allocations })); if (payments.some(p => p.status !== 'POSTED')) throw new Error('Batch payment is not posted. Inspect the prior operation before retrying.'); return save({ ...row, status: 'POSTED', paymentIds: payments.map(p => p.id), history: [...row.history, event('Payments recorded')] }); },
    cancel(input: {
        id: string;
        reason: string;
    }) { const row = find(input.id); if (!['DRAFT', 'APPROVED'].includes(row.status) || input.reason?.trim().length < 3)
        throw new Error('Only an unposted batch can be cancelled, with a reason.'); return save({ ...row, status: 'CANCELLED', history: [...row.history, event('Cancelled', input.reason)] }); },
    reverse(input: {
        id: string;
        reason: string;
    }) { const row = find(input.id); if (row.status === 'REVERSED')
        return row; if (row.status !== 'POSTED' || input.reason?.trim().length < 3)
        throw new Error('A posted batch and reversal reason are required.'); assertCurrentCrossModuleWriteSafe(); for (const id of row.paymentIds) {
        const payment = supplierPaymentRepository.getById(id);
        if (!payment || payment.status !== 'POSTED')
            throw new Error('Batch payments changed. Inspect before reversing.');
        assertSourceNotReconciled('SUPPLIER_PAYMENT', id);
    } for (const id of row.paymentIds)
        supplierPaymentRepository.reverse(id, input.reason); return save({ ...row, status: 'REVERSED', history: [...row.history, event('Reversed', input.reason)] }); }
};
registerRepository('paymentBatches', { repository: paymentBatchRepository, read: 'banking.read', commands: { create: 'purchases.payment', approve: 'accounting.post', post: 'purchases.payment', cancel: 'purchases.payment', reverse: 'purchases.payment' }, snapshot: () => ({ batches }), restore: v => { batches = v.batches; }, validate: (value, snapshots) => {
    const batchSchema = inputSchema.extend({ id, fingerprint: z.string(), status: z.enum(['DRAFT', 'APPROVED', 'POSTED', 'REVERSED', 'CANCELLED']), createdBy: id, approvedBy: id.optional(), paymentIds: z.array(id), history: z.array(z.object({ action: id, actor: id, at: id, reason: z.string().optional() }).strict()) }).strict();
    const state = z.object({ batches: z.array(batchSchema) }).strict().parse(value);
    const all = snapshots as Record<string, any>, payments = all.supplierPayments.supplierPayments as import('../purchases/types/supplierPayment').SupplierPayment[];
    const banks = all.bankAccounts.bankAccounts as { id: string }[], bills = all.supplierBills.supplierBills as { id: string; supplierId: string }[];
    const owned = new Set<string>();
    if (new Set(state.batches.map(b => b.id)).size !== state.batches.length || new Set(state.batches.map(b => b.operationId)).size !== state.batches.length)
        throw new Error('Duplicate payment batch identity or operation.');
    const allocationsKey = (rows: { supplierBillId: string; amount: number }[]) => JSON.stringify(rows.map(a => ({ supplierBillId: a.supplierBillId, amount: a.amount })).sort((a, b) => a.supplierBillId.localeCompare(b.supplierBillId)));
    for (const row of state.batches) {
        try { requireDateKey(row.paymentDate, 'Batch payment date'); } catch { throw new Error('Invalid payment batch date.'); }
        const input = { operationId: row.operationId, paymentDate: row.paymentDate, bankAccountId: row.bankAccountId, reference: row.reference, allocations: row.allocations };
        if (row.fingerprint !== JSON.stringify(input) || !banks.some(b => b.id === row.bankAccountId) || new Set(row.allocations.map(a => a.supplierBillId)).size !== row.allocations.length || row.allocations.some(a => !bills.some(b => b.id === a.supplierBillId)))
            throw new Error('Payment batch creation data or references are invalid.');
        const actions = row.history.map(h => h.action).join('|'), approved = row.history.find(h => h.action === 'Approved');
        const expectedActions: Record<PaymentBatch['status'], string[]> = { DRAFT: ['Created'], APPROVED: ['Created|Approved'], POSTED: ['Created|Approved|Payments recorded'], REVERSED: ['Created|Approved|Payments recorded|Reversed'], CANCELLED: ['Created|Cancelled', 'Created|Approved|Cancelled'] };
        if (!expectedActions[row.status].includes(actions) || row.createdBy !== row.history[0]?.actor || row.approvedBy !== approved?.actor || row.history.some(h => !Number.isFinite(Date.parse(h.at)) || ['Cancelled', 'Reversed'].includes(h.action) && (h.reason?.trim().length ?? 0) < 3))
            throw new Error('Payment batch lifecycle or approval history is invalid.');
        if (!['POSTED', 'REVERSED'].includes(row.status)) {
            if (row.paymentIds.length) throw new Error('An unposted batch cannot own supplier payments.');
            continue;
        }
        const groups = new Map<string, typeof row.allocations>();
        for (const allocation of row.allocations) {
            const supplierId = bills.find(b => b.id === allocation.supplierBillId)!.supplierId;
            groups.set(supplierId, [...(groups.get(supplierId) ?? []), allocation]);
        }
        if (row.paymentIds.length !== groups.size || new Set(row.paymentIds).size !== row.paymentIds.length)
            throw new Error('Payment batch supplier groups are incomplete or duplicated.');
        const seenSuppliers = new Set<string>();
        for (const paymentId of row.paymentIds) {
            const payment = payments.find(p => p.id === paymentId), expected = payment && groups.get(payment.supplierId);
            if (owned.has(paymentId) || !payment || !expected || seenSuppliers.has(payment.supplierId) || payment.operationId !== 'batch:' + row.id + ':' + payment.supplierId || payment.bankAccountId !== row.bankAccountId || payment.paymentDate !== row.paymentDate || payment.method !== 'BANK_TRANSFER' || (payment.reference ?? '') !== row.reference.trim() || payment.status !== (row.status === 'REVERSED' ? 'REVERSED' : 'POSTED') || allocationsKey(payment.allocations) !== allocationsKey(expected) || payment.amount !== money(expected.reduce((n, a) => n + a.amount, 0)))
                throw new Error('Payment batch payment relationships are invalid.');
            owned.add(paymentId); seenSuppliers.add(payment.supplierId);
            if (!all.journals.journalEntries.some((j: { sourceType: string; sourceId?: string }) => j.sourceType === 'SUPPLIER_PAYMENT' && j.sourceId === paymentId))
                throw new Error('A batch payment journal is missing.');
        }
    }
}, publish: emit });
