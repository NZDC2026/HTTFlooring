import { createHash } from 'node:crypto';
import { z } from 'zod';
import { registerRepository, snapshotRepositories } from '../../src/features/security/repositoryHost';
import { trustedAuthorization } from '../../src/features/security/trustedAuthorization';
import { hasPermission, type VerifiedPrincipal } from '../../src/features/security/rbac';
import { kinds, sources, recycleHistory, restoreRecycleHistory, isRecycled, type RecycleKind, type RecycleEvent } from '../../src/features/document-recycle/recycleState';
const id = z.string().trim().min(1).max(200), token = z.string().regex(/^[a-f0-9]{64}$/);
const canonical = (v: any): any => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).filter(k => v[k] !== undefined).sort().map(k => [k, canonical(v[k])])) : v;
const hash = (v: unknown) => createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
const readPermission = (kind: RecycleKind) => kind === 'Purchase order' || kind === 'Expense bill draft' ? 'purchases.read' : 'sales.read';
const writePermission = (kind: RecycleKind) => kind === 'Quote' ? 'sales.write' : kind === 'Purchase order' ? 'purchases.write' : kind === 'Expense bill draft' ? 'purchases.bill' : 'sales.manage';
function records(kind: RecycleKind, snapshots: Record<string, any>) {
    const [repository, field] = sources[kind];
    return (snapshots[repository]?.[field] ?? []).filter((r: any) => kind === 'Sales order draft' ? r.kind === 'ORDER' : kind === 'Invoice draft' ? r.kind === 'INVOICE' : true);
}
function requireRecord(kind: RecycleKind, recordId: string, snapshots: Record<string, any>) {
    const row = records(kind, snapshots).find((r: any) => r.id === recordId);
    if (!row)
        throw new Error('Document was not found in the selected dataset.');
    return row;
}
function issues(kind: RecycleKind, row: any, snapshots: Record<string, any>) {
    const errors: string[] = [];
    if (row.status !== 'DRAFT' || row.documentId)
        errors.push('Only unapproved, unposted drafts can be recycled.');
    const contains = (v: unknown): boolean => v === row.id || (Array.isArray(v) ? v.some(contains) : !!v && typeof v === 'object' && Object.values(v).some(contains));
    const [own, field] = sources[kind];
    for (const [name, state] of Object.entries(snapshots)) {
        if (['documentRecycle', 'attachments', 'financialCache'].includes(name))
            continue;
        const other = name === own ? { ...state, [field]: state[field].filter((r: any) => r.id !== row.id) } : state;
        if (contains(other))
            errors.push(`Referenced by ${name}; retain this draft for its linked workflow.`);
    }
    return errors;
}
function list(principal: VerifiedPrincipal, snapshots = snapshotRepositories()) {
    return kinds.filter(k => hasPermission(principal, readPermission(k))).flatMap(kind => records(kind, snapshots).map((r: any) => {
        const last = recycleHistory().findLast(e => e.recordId === r.id);
        const supplier = kind === 'Purchase order' || kind === 'Expense bill draft', partyId = supplier ? r.supplierId ?? r.payload?.supplierId : r.customerId ?? r.payload?.customerId, party = (supplier ? (snapshots as any).suppliers?.suppliers : (snapshots as any).customers?.customers)?.find((p: any) => p.id === partyId)?.businessName ?? partyId ?? '';
        return { kind, party, reference: r.customerReference ?? r.payload?.customerReference ?? r.payload?.supplierInvoiceNumber ?? r.supplierReference ?? '', recordId: r.id, label: r.documentNumber ?? r.purchaseOrderNumber ?? `${r.kind} · ${r.id}`, date: r.documentDate ?? r.orderDate ?? r.payload?.documentDate ?? '', status: r.status, total: r.totals.total, token: hash({ record: r, lifecycle: last?.id ?? '' }), deleted: last?.action === 'Trashed', last, canWrite: hasPermission(principal, writePermission(kind)), issues: issues(kind, r, snapshots) };
    }));
}
const request = z.object({ operationId: id, action: z.enum(['Trashed', 'Recovered']), reason: z.string().trim().min(3).max(2000), records: z.array(z.object({ kind: z.enum(kinds), recordId: id, token }).strict()).min(1).max(100) }).strict();
const eventSchema = z.object({ id, operationId: id, fingerprint: token, kind: z.enum(kinds), recordId: id, action: z.enum(['Trashed', 'Recovered']), actorId: id, at: z.iso.datetime(), reason: z.string().trim().min(3).max(2000), recordToken: token, contentToken: token }).strict();
export const documentRecycleRepository = {
    list() { const p = trustedAuthorization.require('inventory.read'); return list(p); },
    detail(kind: RecycleKind, recordId: string) { kind = z.enum(kinds).parse(kind); trustedAuthorization.require('inventory.read'); trustedAuthorization.require(readPermission(kind)); return structuredClone(requireRecord(kind, id.parse(recordId), snapshotRepositories())); },
    change(raw: unknown) {
        const input = request.parse(raw), principal = trustedAuthorization.require('inventory.read');
        input.records.forEach(r => { trustedAuthorization.require(readPermission(r.kind)); trustedAuthorization.require(writePermission(r.kind)); });
        const fingerprint = hash({ input, actorId: principal.userId }), previous = recycleHistory().filter(e => e.operationId === input.operationId);
        if (previous.length) {
            if (previous[0].fingerprint !== fingerprint)
                throw new Error('Operation ID has different recycle data.');
            return structuredClone(previous);
        }
        const snapshots = snapshotRepositories(), seen = new Set<string>();
        for (const item of input.records) {
            if (seen.has(item.recordId))
                throw new Error('Select each document only once.');
            seen.add(item.recordId);
            const row = requireRecord(item.kind, item.recordId, snapshots);
            if (hash({ record: row, lifecycle: recycleHistory().findLast(e => e.recordId === item.recordId)?.id ?? '' }) !== item.token)
                throw new Error('Document changed. Refresh and review the selection again.');
            if (isRecycled(item.recordId) !== (input.action === 'Recovered'))
                throw new Error('Document recycle state changed. Refresh the selection.');
            const errors = issues(item.kind, row, snapshots);
            if (errors.length)
                throw new Error(errors.join(' '));
        }
        const at = new Date().toISOString(), events = input.records.map(item => ({ id: crypto.randomUUID(), operationId: input.operationId, fingerprint, kind: item.kind, recordId: item.recordId, action: input.action, actorId: principal.userId, at, reason: input.reason, recordToken: item.token, contentToken: hash(requireRecord(item.kind, item.recordId, snapshots)) }));
        restoreRecycleHistory([...recycleHistory(), ...events]);
        return structuredClone(events);
    }
};
registerRepository('documentRecycle', { repository: documentRecycleRepository, read: 'inventory.read', commands: { list: 'inventory.read', detail: 'inventory.read', change: 'inventory.read' }, snapshot: () => ({ history: recycleHistory() }), restore: v => restoreRecycleHistory(v.history), publish: () => { }, view: p => ({ history: recycleHistory().filter(e => hasPermission(p, readPermission(e.kind))) }), validate: (value, snapshots) => {
        const { history } = z.object({ history: z.array(eventSchema) }).strict().parse(value), ids = new Set<string>(), states = new Map<string, string>(), operations = new Map<string, RecycleEvent[]>();
        for (const event of history) {
            if (ids.has(event.id))
                throw new Error('Duplicate recycle event.');
            ids.add(event.id);
            const row = requireRecord(event.kind, event.recordId, snapshots);
            if ((states.get(event.recordId) ?? 'Recovered') === event.action)
                throw new Error('Invalid recycle lifecycle sequence.');
            const later = history.slice(history.indexOf(event) + 1).some(e => e.recordId === event.recordId);
            if (!later && event.action === 'Trashed' && (issues(event.kind, row, snapshots).length || hash(row) !== event.contentToken))
                throw new Error('Recycled document content or references changed.');
            states.set(event.recordId, event.action);
            operations.set(event.operationId, [...(operations.get(event.operationId) ?? []), event]);
        }
        for (const group of operations.values()) {
            const first = group[0], records = group.map(e => ({ kind: e.kind, recordId: e.recordId, token: e.recordToken }));
            if (new Set(records.map(r => r.recordId)).size !== records.length || group.some(e => e.fingerprint !== first.fingerprint || e.action !== first.action || e.actorId !== first.actorId || e.at !== first.at || e.reason !== first.reason) || hash({ input: { operationId: first.operationId, action: first.action, reason: first.reason, records }, actorId: first.actorId }) !== first.fingerprint)
                throw new Error('Invalid recycle operation receipt.');
        }
    } });
