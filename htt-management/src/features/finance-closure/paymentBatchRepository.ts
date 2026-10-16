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
    } const payments = [...groups].map(([supplierId, allocations]) => supplierPaymentRepository.create({ operationId: 'batch:' + row.id + ':' + supplierId, supplierId, paymentDate: row.paymentDate, bankAccountId: row.bankAccountId, reference: row.reference, method: 'BANK_TRANSFER', allocations })); return save({ ...row, status: 'POSTED', paymentIds: payments.map(p => p.id), history: [...row.history, event('Payments recorded')] }); },
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
registerRepository('paymentBatches', { repository: paymentBatchRepository, read: 'banking.read', commands: { create: 'purchases.payment', approve: 'accounting.post', post: 'purchases.payment', cancel: 'purchases.payment', reverse: 'purchases.payment' }, snapshot: () => ({ batches }), restore: v => { batches = v.batches; }, validate: (value, snapshots) => { const state = z.object({ batches: z.array(inputSchema.extend({ id, fingerprint: z.string(), status: z.enum(['DRAFT', 'APPROVED', 'POSTED', 'REVERSED', 'CANCELLED']), createdBy: id, approvedBy: id.optional(), paymentIds: z.array(id), history: z.array(z.object({ action: id, actor: id, at: id, reason: z.string().optional() })) })) }).strict().parse(value); const payments = (snapshots.supplierPayments as {
        supplierPayments: {
            id: string;
            status: string;
            amount: number;
            bankAccountId: string;
        }[];
    }).supplierPayments; for (const row of state.batches) {
        if (!['POSTED', 'REVERSED'].includes(row.status))
            continue;
        const linked = row.paymentIds.map(id => payments.find(p => p.id === id));
        if (!linked.length || linked.some(p => !p || p.bankAccountId !== row.bankAccountId || p.status !== (row.status === 'REVERSED' ? 'REVERSED' : 'POSTED')) || money(linked.reduce((s, p) => s + (p?.amount ?? 0), 0)) !== money(row.allocations.reduce((s, p) => s + p.amount, 0)))
            throw new Error('Batch payment relationships are invalid.');
        if (row.paymentIds.some(id => !((snapshots.journals as {
            journalEntries: {
                sourceType: string;
                sourceId?: string;
            }[];
        }).journalEntries.some(j => j.sourceType === 'SUPPLIER_PAYMENT' && j.sourceId === id))))
            throw new Error('A batch payment journal is missing.');
    } }, publish: emit });
