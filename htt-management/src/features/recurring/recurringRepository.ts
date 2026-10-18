import { useSyncExternalStore } from 'react';
import { z } from 'zod';
import { registerRepository } from '../security/repositoryHost';
import { trustedAuthorization } from '../security/trustedAuthorization';
import { managedSalesRepository, expenseDraftRepository, parseManagedPayload, type ManagedDraft, type SalesPayload, type ExpensePayload } from '../direct-documents/managedDocumentRepository';
import { businessDateKey, requireDateKey } from '../../lib/businessDate';
import { occurrenceDate, addDays, frequencies, type Frequency } from './recurringDates';
export type RecurringKind = 'INVOICE' | 'EXPENSE';
export type Schedule = {
    id: string;
    name: string;
    kind: RecurringKind;
    status: 'Active' | 'Paused' | 'Ended';
    revision: number;
    operationId: string;
    creationFingerprint: string;
    sourceDraftId: string;
    payload: SalesPayload | ExpensePayload;
    frequency: Frequency;
    firstDate: string;
    nextDate: string;
    endDate: string;
    occurrence: number;
    termsDays: number;
    createdAt: string;
    updatedAt: string;
};
export type RecurringRun = {
    id: string;
    scheduleId: string;
    date: string;
    draftId: string;
    actorId: string;
    createdAt: string;
};
const text = z.string().trim().min(1).max(200), date = z.string().refine(v => { try {
    requireDateKey(v);
    return true;
}
catch {
    return false;
} }, 'Use a valid YYYY-MM-DD date.');
const newSchema = z.object({ operationId: text, name: text, sourceDraftId: text, frequency: z.enum(frequencies), firstDate: date, endDate: date }).strict(), editSchema = z.object({ id: text, expectedRevision: z.number().int().positive(), name: text, endDate: date }).strict();
const timestamp = z.string().refine(v => Number.isFinite(Date.parse(v)), 'Invalid timestamp.');
const scheduleSchema = z.object({ id: text, name: text, kind: z.enum(['INVOICE', 'EXPENSE']), status: z.enum(['Active', 'Paused', 'Ended']), revision: z.number().int().positive(), operationId: text, creationFingerprint: z.string().min(1).max(2000), sourceDraftId: text, payload: z.unknown(), frequency: z.enum(frequencies), firstDate: date, nextDate: date, endDate: date, occurrence: z.number().int().nonnegative(), termsDays: z.number().int().nonnegative(), createdAt: timestamp, updatedAt: timestamp }).strict();
const runSchema = z.object({ id: text, scheduleId: text, date, draftId: text, actorId: text, createdAt: timestamp }).strict();
let revision = 0;
const listeners = new Set<() => void>();
const emit = () => { revision++; listeners.forEach(f => f()); };
const stores: Record<RecurringKind, {
    schedules: Schedule[];
    runs: RecurringRun[];
}> = { INVOICE: { schedules: [], runs: [] }, EXPENSE: { schedules: [], runs: [] } };
const permission = (kind: RecurringKind) => kind === 'INVOICE' ? 'sales.manage' : 'purchases.bill';
const drafts = (kind: RecurringKind) => kind === 'INVOICE' ? managedSalesRepository : expenseDraftRepository;
const now = () => new Date().toISOString();
function snapshotPayload(source: ManagedDraft): SalesPayload | ExpensePayload { if (source.payload.kind === 'EXPENSE')
    return { ...structuredClone(source.payload), lines: source.payload.lines.map((l, i) => ({ ...l, unitCost: (source.lines[i] as import('../purchases/types/supplierBill').SupplierBillLine).unitCost, priceBasis: 'Exclusive' as const })) }; return { ...structuredClone(source.payload), lines: source.payload.lines.map((l, i) => ({ ...l, unitPrice: (source.lines[i] as import('../sales/types/salesDocument').SalesDocumentLine).unitPrice, priceBasis: 'Exclusive' as const })) }; }
function make(kind: RecurringKind) {
    const state = () => stores[kind], get = (id: string) => { const row = state().schedules.find(r => r.id === id); if (!row)
        throw new Error('Recurring schedule not found.'); return row; }, expected = (row: Schedule, rev: number) => { if (row.revision !== rev)
        throw new Error('Schedule changed. Reload before continuing.'); };
    return { getAll: () => state().schedules, getRuns: () => state().runs,
        create(raw: unknown) { trustedAuthorization.require(permission(kind)); const input = newSchema.parse(raw), fingerprint = JSON.stringify(input), prior = state().schedules.find(r => r.operationId === input.operationId); if (prior) {
            if (prior.creationFingerprint !== fingerprint)
                throw new Error('Operation ID was used for a different recurring template.');
            return prior;
        } const source = drafts(kind).getAll().find(r => r.id === input.sourceDraftId); if (!source || source.kind !== kind || source.status === 'CANCELLED')
            throw new Error('Select an existing invoice or expense entry draft of the correct type.'); if (input.endDate < input.firstDate)
            throw new Error('End date must not precede first generation date.'); const payload = snapshotPayload(source), termsDays = Math.round((Date.parse(payload.dueDate! + 'T00:00:00Z') - Date.parse(payload.documentDate + 'T00:00:00Z')) / 86400000), at = now(); const row: Schedule = { ...input, id: crypto.randomUUID(), kind, status: 'Active', revision: 1, creationFingerprint: fingerprint, payload, termsDays, occurrence: 0, nextDate: input.firstDate, createdAt: at, updatedAt: at }; state().schedules = [...state().schedules, row]; emit(); return row; },
        update(raw: unknown) { trustedAuthorization.require(permission(kind)); const input = editSchema.parse(raw), old = get(input.id); expected(old, input.expectedRevision); if (input.endDate < old.firstDate || old.occurrence && input.endDate < state().runs.filter(r => r.scheduleId === old.id).map(r => r.date).sort().at(-1)!)
            throw new Error('End date cannot precede the schedule start or its last generated occurrence.'); const row = { ...old, name: input.name, endDate: input.endDate, status: old.nextDate > input.endDate ? 'Ended' as const : old.status === 'Ended' ? 'Paused' as const : old.status, revision: old.revision + 1, updatedAt: now() }; state().schedules = state().schedules.map(r => r.id === old.id ? row : r); emit(); return row; },
        setStatus(raw: unknown) { trustedAuthorization.require(permission(kind)); const input = z.object({ id: text, expectedRevision: z.number().int().positive(), status: z.enum(['Active', 'Paused']) }).strict().parse(raw), old = get(input.id); expected(old, input.expectedRevision); if (old.nextDate > old.endDate)
            throw new Error('Extend the end date before resuming this ended schedule.'); const row = { ...old, status: input.status, revision: old.revision + 1, updatedAt: now() }; state().schedules = state().schedules.map(r => r.id === old.id ? row : r); emit(); return row; },
        generate(raw: unknown) { trustedAuthorization.require(permission(kind)); const input = z.object({ id: text, expectedRevision: z.number().int().positive(), date }).strict().parse(raw), old = get(input.id); const prior = state().runs.find(r => r.scheduleId === old.id && r.date === input.date); if (prior)
            return { schedule: old, run: prior, draft: drafts(kind).getAll().find(d => d.id === prior.draftId) }; expected(old, input.expectedRevision); if (old.status !== 'Active')
            throw new Error('Activate the schedule before generating.'); if (input.date !== old.nextDate)
            throw new Error('Generate the next occurrence in order.'); if (input.date > businessDateKey(now()))
            throw new Error('This occurrence is not due yet.'); if (input.date > old.endDate)
            throw new Error('The schedule has ended.'); const nextDate = occurrenceDate(old.firstDate, old.frequency, old.occurrence + 1), payload = structuredClone(old.payload); payload.documentDate = input.date; payload.dueDate = addDays(input.date, old.termsDays); if (payload.kind === 'EXPENSE')
            payload.supplierInvoiceNumber = payload.supplierInvoiceNumber.slice(0, 170) + ' [' + input.date + ']'; const draft = drafts(kind).save({ operationId: 'recurring:' + old.id + ':' + input.date, payload }), at = now(), run: RecurringRun = { id: crypto.randomUUID(), scheduleId: old.id, date: input.date, draftId: draft.id, actorId: trustedAuthorization.current()!.userId, createdAt: at }, schedule: Schedule = { ...old, nextDate, occurrence: old.occurrence + 1, status: nextDate > old.endDate ? 'Ended' : 'Active', revision: old.revision + 1, updatedAt: at }; state().schedules = state().schedules.map(r => r.id === old.id ? schedule : r); state().runs = [...state().runs, run]; emit(); return { schedule, run, draft }; }
    };
}
export const recurringInvoiceRepository = make('INVOICE'), recurringExpenseRepository = make('EXPENSE');
export function useRecurring(kind: RecurringKind) { useSyncExternalStore(f => { listeners.add(f); return () => { listeners.delete(f); }; }, () => revision, () => revision); return stores[kind]; }
for (const kind of ['INVOICE', 'EXPENSE'] as const)
    registerRepository(kind === 'INVOICE' ? 'recurringInvoices' : 'recurringExpenses', { repository: kind === 'INVOICE' ? recurringInvoiceRepository : recurringExpenseRepository, read: kind === 'INVOICE' ? 'sales.read' : 'purchases.read', commands: { create: permission(kind), update: permission(kind), setStatus: permission(kind), generate: permission(kind) }, snapshot: () => structuredClone(stores[kind]), restore: value => { stores[kind] = value; }, publish: emit, validate: (value, snapshots) => { z.object({ schedules: z.array(scheduleSchema), runs: z.array(runSchema) }).strict().parse(value); const s = value as typeof stores[RecurringKind], all = snapshots as Record<string, any>; for (const r of s.schedules) {
            if (r.kind !== kind || !['Active', 'Paused', 'Ended'].includes(r.status) || !Number.isSafeInteger(r.revision) || r.revision < 1 || !Number.isSafeInteger(r.occurrence) || r.occurrence < 0 || !Number.isInteger(r.termsDays) || r.termsDays < 0 || r.payload.kind !== kind)
                throw new Error('Invalid recurring schedule.');
            newSchema.parse({ operationId: r.operationId, name: r.name, sourceDraftId: r.sourceDraftId, frequency: r.frequency, firstDate: r.firstDate, endDate: r.endDate });
            parseManagedPayload(r.payload);
            if (!r.id || !r.creationFingerprint || !Number.isFinite(Date.parse(r.createdAt)) || !Number.isFinite(Date.parse(r.updatedAt)))
                throw new Error('Invalid recurring identity or audit timestamps.');
            requireDateKey(r.payload.documentDate);
            requireDateKey(r.payload.dueDate!);
            if (r.payload.dueDate! < r.payload.documentDate || r.termsDays !== Math.round((Date.parse(r.payload.dueDate! + 'T00:00:00Z') - Date.parse(r.payload.documentDate + 'T00:00:00Z')) / 86400000))
                throw new Error('Invalid recurring payment terms.');
            if (r.payload.kind === 'EXPENSE') {
                if (!all.suppliers.suppliers.some((x: any) => x.id === (r.payload as ExpensePayload).supplierId) || r.payload.lines.some(l => !all.accounts.accounts.some((a: any) => a.id === l.accountId && a.type === 'EXPENSE')))
                    throw new Error('Recurring expense references are invalid.');
            }
            else {
                if (!all.customers.customers.some((x: any) => x.id === (r.payload as SalesPayload).customerId) || r.payload.lines.some(l => !all.products.products.some((p: any) => p.id === l.productId && p.units.some((u: any) => u.id === l.unitId))))
                    throw new Error('Recurring invoice references are invalid.');
            }
            if ((r.status === 'Ended') !== (r.nextDate > r.endDate))
                throw new Error('Recurring end status is inconsistent.');
            if (r.nextDate !== occurrenceDate(r.firstDate, r.frequency, r.occurrence) || r.endDate < r.firstDate)
                throw new Error('Invalid recurring dates.');
            const source = (kind === 'INVOICE' ? all.managedSalesDocuments : all.expenseBillDrafts).drafts.find((d: ManagedDraft) => d.id === r.sourceDraftId);
            if (!source || source.kind !== kind)
                throw new Error('Recurring template source is missing.');
            const history = s.runs.filter(x => x.scheduleId === r.id);
            if (history.length !== r.occurrence || new Set(history.map(x => x.date)).size !== history.length)
                throw new Error('Recurring run history does not match schedule.');
            for (let i = 0; i < history.length; i++)
                if (!history.some(x => x.date === occurrenceDate(r.firstDate, r.frequency, i)))
                    throw new Error('Recurring occurrences are incomplete.');
        } for (const run of s.runs) {
            const schedule = s.schedules.find(r => r.id === run.scheduleId), draft = (kind === 'INVOICE' ? all.managedSalesDocuments : all.expenseBillDrafts).drafts.find((d: ManagedDraft) => d.id === run.draftId);
            if (!schedule || !draft || draft.kind !== kind || draft.operationId !== 'recurring:' + schedule.id + ':' + run.date || !run.actorId || !Number.isFinite(Date.parse(run.createdAt)))
                throw new Error('Invalid recurring generated-draft reference.');
        } } });
