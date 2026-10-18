import { z } from 'zod';
import { useSyncExternalStore } from 'react';
import { registerRepository } from '../security/repositoryHost';
import { trustedAuthorization } from '../security/trustedAuthorization';
import { customerRepository } from '../contacts/data/customerRepository';
import { workspaceRepositories } from '../business-workspace/workspaceRepository';
import { requireDateKey } from '../../lib/businessDate';
const text = z.string().trim().min(1).max(200), note = z.string().trim().min(1).max(4000), date = z.string().refine(v => { try {
    requireDateKey(v);
    return true;
}
catch {
    return false;
} }, 'Use a valid YYYY-MM-DD date.'), timestamp = z.string().refine(v => { const d = new Date(v); return Number.isFinite(d.getTime()) && d.toISOString() === v; }, 'Invalid visit timestamp.');
const createSchema = z.object({ operationId: text, name: text, customerId: text, locationId: text.optional(), plannedDate: date, locationNote: z.string().trim().max(500).default('') }).strict();
const followupSchema = z.object({ name: text, due: date, priority: z.enum(['Low', 'Normal', 'High']), notes: note }).strict();
const finishSchema = z.object({ id: text, expectedRevision: z.number().int().positive(), outcome: note, followup: followupSchema.optional() }).strict();
const historySchema = z.object({ id: text, action: text, actorId: text, at: timestamp, note: z.string().optional() }).strict();
const visitSchema = z.object({ id: text, operationId: text, creationFingerprint: z.string().min(1).max(3000), name: text, customerId: text, customerName: text, locationId: text.optional(), locationName: z.string().max(200).optional(), locationNote: z.string().max(500), plannedDate: date, status: z.enum(['Planned', 'Checked in', 'Completed', 'Cancelled']), revision: z.number().int().positive(), ownerId: text, createdAt: timestamp, updatedAt: timestamp, checkInAt: timestamp.optional(), checkInBy: text.optional(), checkOutAt: timestamp.optional(), checkOutBy: text.optional(), outcome: note.optional(), completionFingerprint: z.string().optional(), followupTaskId: text.optional(), history: z.array(historySchema).min(1) }).strict();
export type Visit = z.infer<typeof visitSchema>;
let visits: Visit[] = [], version = 0;
const listeners = new Set<() => void>();
const emit = () => { version++; listeners.forEach(f => f()); };
const actor = () => trustedAuthorization.require('sales.write').userId, now = () => new Date().toISOString();
const log = (action: string, actorId: string, at: string, note?: string) => ({ id: crypto.randomUUID(), action, actorId, at, ...(note ? { note } : {}) });
function get(id: string) { const row = visits.find(v => v.id === id); if (!row)
    throw new Error('Visit not found.'); return row; }
function expected(row: Visit, revision: number) { if (row.revision !== revision)
    throw new Error('Visit changed. Reload before continuing.'); }
function stamp(row: Visit) { const at = now(); if (at < row.updatedAt)
    throw new Error('System clock precedes the last visit update. Correct the clock before continuing.'); return at; }
function put(row: Visit) { visits = [...visits.filter(v => v.id !== row.id), row]; emit(); return row; }
function activeCustomer(id: string, locationId?: string) { const customer = customerRepository.getById(id); if (!customer || customer.status === 'INACTIVE')
    throw new Error('Choose an available customer.'); if (locationId && !customer.locations.some(l => l.id === locationId))
    throw new Error('Choose a location belonging to the selected customer.'); return customer; }
export const visitRepository = {
    subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }, getSnapshot: () => visits, getAll: () => visits,
    create(raw: unknown) { const userId = actor(), input = createSchema.parse(raw), fingerprint = JSON.stringify(input), prior = visits.find(v => v.operationId === input.operationId); if (prior) {
        if (prior.creationFingerprint !== fingerprint)
            throw new Error('Operation ID was used for different visit data.');
        return prior;
    } const customer = activeCustomer(input.customerId, input.locationId), at = now(), row: Visit = { ...input, id: crypto.randomUUID(), creationFingerprint: fingerprint, customerName: customer.businessName, ...(input.locationId ? { locationName: customer.locations.find(l => l.id === input.locationId)!.name } : {}), status: 'Planned', revision: 1, ownerId: userId, createdAt: at, updatedAt: at, history: [log('Planned', userId, at)] }; return put(row); },
    update(raw: unknown) { const userId = actor(), input = createSchema.omit({ operationId: true }).extend({ id: text, expectedRevision: z.number().int().positive() }).strict().parse(raw), old = get(input.id); expected(old, input.expectedRevision); if (old.status !== 'Planned')
        throw new Error('Only a planned visit can be edited.'); const customer = activeCustomer(input.customerId, input.locationId), at = stamp(old); const row = { ...old, name: input.name, customerId: input.customerId, customerName: customer.businessName, plannedDate: input.plannedDate, locationNote: input.locationNote, revision: old.revision + 1, updatedAt: at, history: [...old.history, log('Plan updated', userId, at, old.plannedDate + ' → ' + input.plannedDate)] }; delete row.locationId; delete row.locationName; if (input.locationId) {
        row.locationId = input.locationId;
        row.locationName = customer.locations.find(l => l.id === input.locationId)!.name;
    } return put(row); },
    checkIn(raw: unknown) { const userId = actor(), input = z.object({ id: text, expectedRevision: z.number().int().positive() }).strict().parse(raw), old = get(input.id); if (old.status === 'Checked in' && old.revision === input.expectedRevision + 1)
        return old; expected(old, input.expectedRevision); if (old.status !== 'Planned')
        throw new Error('Only a planned visit can be checked in.'); activeCustomer(old.customerId, old.locationId); const at = stamp(old); return put({ ...old, status: 'Checked in', revision: old.revision + 1, checkInAt: at, checkInBy: userId, updatedAt: at, history: [...old.history, log('Checked in', userId, at)] }); },
    finish(raw: unknown) { const userId = actor(), input = finishSchema.parse(raw), old = get(input.id), fingerprint = JSON.stringify({ outcome: input.outcome, followup: input.followup }); if (old.status === 'Completed') {
        if (old.completionFingerprint === fingerprint)
            return old;
        throw new Error('Visit is already completed with a different outcome.');
    } expected(old, input.expectedRevision); if (old.status !== 'Checked in')
        throw new Error('Check in before completing the visit.'); const at = stamp(old); if (at < old.checkInAt!)
        throw new Error('System clock precedes check-in. Correct the clock before completing.'); let taskId: string | undefined; if (input.followup) {
        const task = workspaceRepositories.tasks.save({ ...input.followup, customerId: old.customerId, owner: userId, status: 'Open' });
        taskId = task.id;
    } return put({ ...old, status: 'Completed', revision: old.revision + 1, checkOutAt: at, checkOutBy: userId, outcome: input.outcome, completionFingerprint: fingerprint, ...(taskId ? { followupTaskId: taskId } : {}), updatedAt: at, history: [...old.history, log('Completed', userId, at, input.outcome)] }); },
    cancel(raw: unknown) { const userId = actor(), input = z.object({ id: text, expectedRevision: z.number().int().positive(), reason: note }).strict().parse(raw), old = get(input.id); expected(old, input.expectedRevision); if (!['Planned', 'Checked in'].includes(old.status))
        throw new Error('Only an unfinished visit can be cancelled.'); const at = stamp(old); return put({ ...old, status: 'Cancelled', revision: old.revision + 1, updatedAt: at, history: [...old.history, log('Cancelled', userId, at, input.reason)] }); },
    addNote(raw: unknown) { const userId = actor(), input = z.object({ id: text, expectedRevision: z.number().int().positive(), note }).strict().parse(raw), old = get(input.id); expected(old, input.expectedRevision); const at = stamp(old); return put({ ...old, revision: old.revision + 1, updatedAt: at, history: [...old.history, log('Note added', userId, at, input.note)] }); }
};
export const useVisits = () => useSyncExternalStore(visitRepository.subscribe, visitRepository.getSnapshot, visitRepository.getSnapshot);
registerRepository('salesVisits', { repository: visitRepository, read: 'sales.read', commands: { create: 'sales.write', update: 'sales.write', checkIn: 'sales.write', finish: 'sales.write', cancel: 'sales.write', addNote: 'sales.write' }, snapshot: () => ({ visits }), restore: value => { visits = value.visits; }, publish: emit, validate: (value, snapshots) => { const parsed = z.object({ visits: z.array(visitSchema) }).strict().parse(value), s = snapshots as Record<string, any>, operations = new Set<string>(); for (const v of parsed.visits) {
        if (operations.has(v.operationId))
            throw new Error('Duplicate visit operation ID.');
        operations.add(v.operationId);
        const customer = s.customers.customers.find((c: any) => c.id === v.customerId);
        if (!customer || v.locationId && !v.locationName)
            throw new Error('Invalid visit customer/location reference.');
        if (v.history.length !== v.revision || new Set(v.history.map(h => h.id)).size !== v.history.length || v.updatedAt < v.createdAt)
            throw new Error('Invalid visit history.');
        const created = createSchema.parse(JSON.parse(v.creationFingerprint));
        if (created.operationId !== v.operationId || v.history[0].action !== 'Planned' || v.history[0].actorId !== v.ownerId || v.history[0].at !== v.createdAt)
            throw new Error('Visit creation fingerprint is inconsistent.');
        if (Boolean(v.checkInAt) !== Boolean(v.checkInBy) || Boolean(v.checkOutAt) !== Boolean(v.checkOutBy) || v.checkInAt && v.checkInAt < v.createdAt || v.checkOutAt && (!v.checkInAt || v.checkOutAt < v.checkInAt))
            throw new Error('Invalid visit check-in/out history.');
        if (v.status === 'Planned' && (v.checkInAt || v.checkOutAt) || v.status === 'Checked in' && (!v.checkInAt || v.checkOutAt) || v.status === 'Completed' && (!v.checkInAt || !v.checkOutAt || !v.outcome || !v.completionFingerprint) || v.status !== 'Completed' && (v.checkOutAt || v.outcome || v.followupTaskId || v.completionFingerprint))
            throw new Error('Visit state is inconsistent.');
        if (v.status === 'Completed') {
            const completion = z.object({ outcome: note, followup: followupSchema.optional() }).strict().parse(JSON.parse(v.completionFingerprint!));
            if (completion.outcome !== v.outcome || Boolean(completion.followup) !== Boolean(v.followupTaskId))
                throw new Error('Visit completion fingerprint is inconsistent.');
        }
        if (v.followupTaskId && !s.workspace_tasks.records.some((t: any) => t.id === v.followupTaskId && t.customerId === v.customerId))
            throw new Error('Visit follow-up task is missing or belongs to another customer.');
    } } });
