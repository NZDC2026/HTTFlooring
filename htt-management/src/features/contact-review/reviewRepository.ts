import { z } from 'zod';
import { useSyncExternalStore } from 'react';
import { customerRepository } from '../contacts/data/customerRepository';
import { customerFormSchema, locationFormSchema, contactFormSchema } from '../contacts/schemas/customerSchemas';
import { registerRepository } from '../security/repositoryHost';
import { trustedAuthorization } from '../security/trustedAuthorization';
import { reviewKinds, reviewSources, valuesSchema, draftValues, duplicateCandidates, reviewMasterSignature, type ReviewKind, type Values } from './reviewModel';
const text = z.string().trim().min(1).max(200), reason = z.string().trim().max(2000), timestamp = z.string().refine(v => { const d = new Date(v); return Number.isFinite(d.getTime()) && d.toISOString() === v; });
const intake = z.object({ operationId: text, kind: z.enum(reviewKinds), customerId: z.string().max(200).default(''), values: valuesSchema, source: z.enum(reviewSources).default('Manual'), externalId: z.string().trim().max(200).default(''), sourceReference: z.string().trim().max(500).default('') }).strict();
const event = z.object({ id: text, action: text, actorId: text, at: timestamp, reason, data: z.string().max(2000000) }).strict();
const decision = z.object({ action: z.enum(['Approve new', 'Link existing', 'Reject']), actorId: text, at: timestamp, reason, fingerprint: z.string().max(10000), customerId: z.string(), targetId: z.string(), snapshot: z.unknown() }).strict();
const rowSchema = intake.extend({ id: text, state: z.enum(['Pending', 'Approved', 'Linked', 'Rejected']), revision: z.number().int().positive(), createdBy: text, createdAt: timestamp, updatedAt: timestamp, creationFingerprint: z.string().max(100000), history: z.array(event).min(1), decision: decision.optional() }).strict();
export type ReviewDraft = z.infer<typeof rowSchema>;
let drafts: ReviewDraft[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(f => f());
function actor() { const p = trustedAuthorization.require('contacts.write'); trustedAuthorization.require('sales.read'); return p.userId; }
const now = () => new Date().toISOString();
function stamp(old: ReviewDraft) {
    const at = now();
    if (at < old.updatedAt)
        throw new Error('System clock precedes the last review update. Correct it before continuing.');
    return at;
}
const log = (action: string, actorId: string, at: string, why = '', data: unknown = {}) => ({ id: crypto.randomUUID(), action, actorId, at, reason: why, data: JSON.stringify(data) });
function get(id: string) {
    const row = drafts.find(r => r.id === id);
    if (!row)
        throw new Error('Review draft not found.');
    return row;
}
function expected(old: ReviewDraft, revision: number) {
    if (old.revision !== revision)
        throw new Error('Review draft changed. Reload before continuing.');
}
function put(row: ReviewDraft) { drafts = [...drafts.filter(d => d.id !== row.id), row]; emit(); return row; }
function normalize(raw: unknown) {
    const input = intake.parse(raw);
    input.values = draftValues(input.kind, input.values);
    if (input.kind === 'Customer' && input.customerId)
        throw new Error('Customer drafts must not have a parent customer.');
    if (input.customerId && !customerRepository.getById(input.customerId))
        throw new Error('Parent customer was not found.');
    return input;
}
function fullValues(kind: ReviewKind, values: Values) { return kind === 'Customer' ? customerFormSchema.strict().parse(values) : kind === 'Branch' ? locationFormSchema.strict().parse(values) : contactFormSchema.strict().parse(values); }
function target(kind: ReviewKind, customerId: string, targetId: string) {
    const c = customerRepository.getById(kind === 'Customer' ? targetId : customerId);
    if (!c)
        throw new Error('Choose an existing customer.');
    const entity = kind === 'Customer' ? c : kind === 'Branch' ? c.locations.find(l => l.id === targetId) : c.contacts.find(l => l.id === targetId);
    if (!entity)
        throw new Error('The selected record does not belong to this customer or draft type.');
    return { customerId: c.id, targetId: entity.id, snapshot: structuredClone(entity) };
}
export const contactReviewRepository = { subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }, getSnapshot: () => drafts,
    create(raw: unknown) {
        const userId = actor(), input = normalize(raw), { operationId, ...body } = input, fingerprint = JSON.stringify(body), prior = drafts.find(d => d.operationId === operationId) || input.externalId && drafts.find(d => d.source === input.source && d.externalId === input.externalId);
        if (prior) {
            if (prior.creationFingerprint !== fingerprint)
                throw new Error('Operation or external source ID already contains different draft data.');
            return prior;
        }
        const at = now();
        return put({ ...input, id: crypto.randomUUID(), state: 'Pending', revision: 1, createdBy: userId, createdAt: at, updatedAt: at, creationFingerprint: fingerprint, history: [log('Received', userId, at, '', body)] });
    },
    importBatch(raw: unknown) {
        actor();
        const input = z.object({ operationId: text.max(150), drafts: z.array(intake.omit({ operationId: true })).min(1).max(100) }).strict().parse(raw);
        if (input.drafts.some(d => !d.externalId))
            throw new Error('Each imported draft requires a source external ID for safe retry.');
        return input.drafts.map((d, i) => contactReviewRepository.create({ ...d, operationId: input.operationId + ':' + i }));
    },
    update(raw: unknown) {
        const userId = actor(), input = z.object({ id: text, expectedRevision: z.number().int().positive(), customerId: z.string().max(200), values: valuesSchema }).strict().parse(raw), old = get(input.id);
        expected(old, input.expectedRevision);
        if (old.state !== 'Pending')
            throw new Error('Only pending drafts can be edited.');
        const inputValues = normalize({ operationId: old.operationId, kind: old.kind, customerId: input.customerId, values: input.values, source: old.source, externalId: old.externalId, sourceReference: old.sourceReference }), at = stamp(old);
        return put({ ...old, customerId: inputValues.customerId, values: inputValues.values, revision: old.revision + 1, updatedAt: at, history: [...old.history, log('Updated', userId, at, '', { customerId: inputValues.customerId, values: inputValues.values })] });
    },
    review(id: string) {
        trustedAuthorization.require('sales.read');
        const row = get(text.parse(id)), customers = customerRepository.getAll();
        let validationError = '';
        try {
            fullValues(row.kind, row.values);
            if (row.kind !== 'Customer' && !customers.some(c => c.id === row.customerId))
                throw new Error('Select the parent customer.');
        }
        catch (e) {
            validationError = (e as Error).message;
        }
        return { revision: row.revision, duplicates: duplicateCandidates(row, customers), masterSignature: reviewMasterSignature(customers), validationError };
    },
    decide(raw: unknown) {
        const userId = actor(), input = z.object({ id: text, expectedRevision: z.number().int().positive(), action: z.enum(['Approve new', 'Link existing', 'Reject']), reason, allowDuplicate: z.boolean().default(false), targetId: z.string().max(200).default(''), expectedMaster: z.string().max(25000000).optional() }).strict().parse(raw), old = get(input.id), fingerprint = JSON.stringify({ action: input.action, reason: input.reason, allowDuplicate: input.allowDuplicate, targetId: input.targetId });
        if (old.state !== 'Pending') {
            if (old.decision?.fingerprint === fingerprint)
                return old;
            throw new Error('This draft already has a different decision.');
        }
        expected(old, input.expectedRevision);
        const at = stamp(old);
        let resolved = { customerId: '', targetId: '', snapshot: null as unknown };
        if (input.action === 'Reject') {
            if (!input.reason)
                throw new Error('Explain why the draft is rejected.');
        }
        else {
            const customers = customerRepository.getAll();
            if (input.expectedMaster !== reviewMasterSignature(customers))
                throw new Error('Customer records changed. Refresh duplicate review before deciding.');
            if (input.action === 'Link existing') {
                if (!input.reason)
                    throw new Error('Explain why this existing record is the correct match.');
                resolved = target(old.kind, old.customerId, input.targetId);
            }
            else {
                const duplicates = duplicateCandidates(old, customers);
                if (duplicates.length && (!input.allowDuplicate || !input.reason))
                    throw new Error('Possible duplicates exist. Link an existing record or explicitly confirm a separate new record with a reason.');
                const values = fullValues(old.kind, old.values);
                if (old.kind === 'Customer') {
                    const created = customerRepository.create(values as z.infer<typeof customerFormSchema>);
                    resolved = { customerId: created.id, targetId: created.id, snapshot: structuredClone(created) };
                }
                else {
                    const c = customerRepository.getById(old.customerId);
                    if (!c || c.status === 'INACTIVE')
                        throw new Error('Select an available parent customer.');
                    const created = old.kind === 'Branch' ? customerRepository.addLocation(c.id, values as z.infer<typeof locationFormSchema>) : customerRepository.addContact(c.id, values as z.infer<typeof contactFormSchema>);
                    resolved = { customerId: c.id, targetId: created.id, snapshot: structuredClone(created) };
                }
            }
        }
        const result = { action: input.action, actorId: userId, at, reason: input.reason, fingerprint, ...resolved };
        return put({ ...old, state: input.action === 'Reject' ? 'Rejected' : input.action === 'Link existing' ? 'Linked' : 'Approved', revision: old.revision + 1, updatedAt: at, decision: result, history: [...old.history, log(input.action, userId, at, input.reason, result)] });
    },
    reopen(raw: unknown) {
        const userId = actor(), input = z.object({ id: text, expectedRevision: z.number().int().positive(), reason: reason.refine(Boolean, 'Explain why this draft is reopened.') }).strict().parse(raw), old = get(input.id);
        expected(old, input.expectedRevision);
        if (old.state !== 'Rejected')
            throw new Error('Only rejected drafts may be reopened.');
        const at = stamp(old), row = { ...old, state: 'Pending' as const, revision: old.revision + 1, updatedAt: at, history: [...old.history, log('Reopened', userId, at, input.reason)] };
        delete row.decision;
        return put(row);
    }
};
export const useContactReviews = () => useSyncExternalStore(contactReviewRepository.subscribe, contactReviewRepository.getSnapshot, contactReviewRepository.getSnapshot);
registerRepository('contactReviews', { repository: contactReviewRepository, read: 'sales.read', commands: { create: 'contacts.write', update: 'contacts.write', importBatch: 'contacts.write', review: 'sales.read', decide: 'contacts.write', reopen: 'contacts.write' }, snapshot: () => ({ drafts }), restore: v => { drafts = v.drafts; }, publish: emit, validate: (value, snapshots) => {
        const parsed = z.object({ drafts: z.array(rowSchema) }).strict().parse(value), customers = (snapshots.customers as {
            customers: import('../contacts/types/customer').Customer[];
        }).customers, operations = new Set<string>(), external = new Set<string>();
        for (const d of parsed.drafts) {
            const normalizedValues = draftValues(d.kind, d.values);
            if (Object.keys(normalizedValues).length !== Object.keys(d.values).length)
                throw new Error('Missing review draft fields.');
            if (operations.has(d.operationId) || d.externalId && external.has(d.source + ':' + d.externalId))
                throw new Error('Duplicate review intake identity.');
            operations.add(d.operationId);
            if (d.externalId)
                external.add(d.source + ':' + d.externalId);
            const received = JSON.parse(d.creationFingerprint);
            if (d.history[0].data !== d.creationFingerprint)
                throw new Error('Review source history is inconsistent.');
            if (received.kind !== d.kind || received.source !== d.source || received.externalId !== d.externalId || received.sourceReference !== d.sourceReference)
                throw new Error('Review intake provenance is inconsistent.');
            if (d.history.length !== d.revision || new Set(d.history.map(h => h.id)).size !== d.history.length || d.history[0].action !== 'Received' || d.history[0].actorId !== d.createdBy || d.history[0].at !== d.createdAt || d.updatedAt < d.createdAt)
                throw new Error('Invalid review history.');
            let historyState = 'Pending', previousAt = d.createdAt;
            for (const [index, h] of d.history.entries()) {
                if (h.at < previousAt || h.at > d.updatedAt)
                    throw new Error('Invalid review event time.');
                previousAt = h.at;
                const payload = JSON.parse(h.data);
                if (!payload || typeof payload !== 'object' || Array.isArray(payload))
                    throw new Error('Invalid review event payload.');
                if (index === 0)
                    continue;
                if (h.action === 'Updated') {
                    if (historyState !== 'Pending')
                        throw new Error('Invalid review edit history.');
                }
                else if (h.action === 'Reopened') {
                    if (historyState !== 'Rejected' || !h.reason)
                        throw new Error('Invalid review reopen history.');
                    historyState = 'Pending';
                }
                else if (['Approve new', 'Link existing', 'Reject'].includes(h.action)) {
                    if (historyState !== 'Pending')
                        throw new Error('Invalid repeated review decision.');
                    historyState = h.action === 'Reject' ? 'Rejected' : h.action === 'Link existing' ? 'Linked' : 'Approved';
                }
                else
                    throw new Error('Unknown review history action.');
            }
            if (historyState !== d.state || d.history.at(-1)!.at !== d.updatedAt)
                throw new Error('Review history does not match current state.');
            if (d.kind === 'Customer' && d.customerId || d.customerId && !customers.some(c => c.id === d.customerId))
                throw new Error('Review parent customer is invalid.');
            if ((d.state === 'Pending') !== !d.decision)
                throw new Error('Review state and decision are inconsistent.');
            if (d.decision) {
                const action = d.state === 'Rejected' ? 'Reject' : d.state === 'Linked' ? 'Link existing' : 'Approve new';
                const fingerprint = z.object({ action: z.enum(['Approve new', 'Link existing', 'Reject']), reason, allowDuplicate: z.boolean(), targetId: z.string() }).strict().parse(JSON.parse(d.decision.fingerprint));
                const last = d.history.at(-1)!;
                if (fingerprint.action !== action || fingerprint.reason !== d.decision.reason || fingerprint.targetId !== (action === 'Link existing' ? d.decision.targetId : '') || last.actorId !== d.decision.actorId || last.at !== d.decision.at || last.reason !== d.decision.reason || JSON.stringify(JSON.parse(last.data)) !== JSON.stringify(d.decision))
                    throw new Error('Review decision audit is inconsistent.');
                if (d.decision.action !== action)
                    throw new Error('Invalid review decision.');
                if (action !== 'Reject') {
                    const c = customers.find(c => c.id === d.decision!.customerId), entity = d.kind === 'Customer' ? c : d.kind === 'Branch' ? c?.locations.find(l => l.id === d.decision!.targetId) : c?.contacts.find(l => l.id === d.decision!.targetId);
                    if (!entity || entity.id !== d.decision.targetId || d.kind !== 'Customer' && c!.id !== d.customerId || (d.decision.snapshot as {
                        id?: string;
                    })?.id !== entity.id)
                        throw new Error('Invalid resolved review reference.');
                    if (action === 'Approve new')
                        fullValues(d.kind, d.values);
                }
                else if (!d.decision.reason || d.decision.customerId || d.decision.targetId)
                    throw new Error('Invalid rejection.');
            }
        }
    } });
