import { z } from 'zod';
import { createHash } from 'node:crypto';
import { registerRepository, snapshotRepositories } from '../../src/features/security/repositoryHost';
import { trustedAuthorization } from '../../src/features/security/trustedAuthorization';
import { type VerifiedPrincipal } from '../../src/features/security/rbac';
import { targetRows, targetSchema, targetSpecs, MAX_LIBRARY_BYTES, MAX_FILE_BYTES, type AttachmentTarget } from '../../src/features/attachments/attachmentModel';
import { verifyAttachmentFile, attachmentBytes } from './attachmentFiles';
const id = z.string().trim().min(1).max(200), reason = z.string().trim().min(1).max(2000), timestamp = z.string().refine(v => { const d = new Date(v); return Number.isFinite(d.getTime()) && d.toISOString() === v; });
const version = z.object({ id, number: z.number().int().positive(), name: id, mime: id, size: z.number().int().positive().max(MAX_FILE_BYTES), sha256: z.string().regex(/^[a-f0-9]{64}$/), content: z.string().max(14000000), createdAt: timestamp, createdBy: id, restoredFrom: id.optional() }).strict();
const document = z.object({ id, title: z.string().trim().min(1).max(200), target: targetSchema, revision: z.number().int().positive(), currentVersionId: id, versions: z.array(version).min(1).max(100), createdAt: timestamp, createdBy: id, updatedAt: timestamp, updatedBy: id, deletedAt: timestamp.optional(), deletedBy: id.optional() }).strict();
type Document = z.infer<typeof document>;
const outcome = (d: Document) => ({ title: d.title, deleted: !!d.deletedAt, currentVersionId: d.currentVersionId, versionsCount: d.versions.length });
const historyRow = z.object({ id, documentId: id, operationId: id, action: z.enum(['Uploaded', 'Added version', 'Restored version', 'Renamed', 'Trashed', 'Recovered']), actorId: id, at: timestamp, revision: z.number().int().positive(), reason, versionId: id.optional(), fingerprint: z.string().regex(/^[a-f0-9]{64}$/), after: z.object({ title: id, deleted: z.boolean(), currentVersionId: id, versionsCount: z.number().int().positive() }).strict() }).strict();
let documents: Document[] = [], history: z.infer<typeof historyRow>[] = [];
function principal() { return trustedAuthorization.require('inventory.read'); }
const references = () => snapshotRepositories([...new Set(Object.values(targetSpecs).map(s => s.repository))]);
function available(target: AttachmentTarget, p: VerifiedPrincipal | null, snapshots = references()) { return targetRows(snapshots, p).find(r => r.kind === target.kind && r.id === target.id); }
function access(target: AttachmentTarget, write = false) {
    const p = principal(), row = available(target, p);
    if (!row)
        throw new Error('Business link was not found or access is denied.');
    if (write && !row.canWrite)
        throw new Error('Permission denied: attachment maintenance requires the linked object write permission.');
    return p.userId;
}
function get(value: string, write = false) {
    const d = documents.find(d => d.id === id.parse(value));
    if (!d)
        throw new Error('Attachment not found or access denied.');
    access(d.target, write);
    return d;
}
const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const strip = (d: Document, p: VerifiedPrincipal | null) => { const link = available(d.target, p)!; return { ...d, targetLabel: link.label, targetPath: link.path, canWrite: link.canWrite, versions: d.versions.map(({ content: _content, ...v }) => v) }; };
function expected(d: Document, n: number) {
    if (d.revision !== n)
        throw new Error('Attachment changed. Refresh before continuing.');
}
function checkClock(d: Document, at: string) {
    if (at < d.updatedAt)
        throw new Error('System clock precedes the last attachment change.');
}
function capacity(extra: number) {
    if (documents.flatMap(d => d.versions).reduce((n, v) => n + v.size, 0) + extra > MAX_LIBRARY_BYTES)
        throw new Error('Local attachment library exceeds 50 MB including versions and trash. Export/archive the business profile before adding more files.');
}
function replay(operationId: string, fingerprint: string) {
    const h = history.find(h => h.operationId === operationId);
    if (!h)
        return;
    const d = get(h.documentId, true);
    if (h.fingerprint !== fingerprint)
        throw new Error('Operation ID already has different attachment data.');
    return strip(d, trustedAuthorization.current());
}
function put(d: Document, action: z.infer<typeof historyRow>['action'], operationId: string, fingerprint: string, why: string, versionId?: string) { documents = [...documents.filter(v => v.id !== d.id), d]; history = [...history, { id: crypto.randomUUID(), documentId: d.id, operationId, fingerprint, action, actorId: d.updatedBy, at: d.updatedAt, revision: d.revision, reason: why, ...(versionId ? { versionId } : {}), after: outcome(d) }]; return strip(d, trustedAuthorization.current()); }
export const attachmentRepository = {
    targets() { return targetRows(references(), principal()); },
    checkTarget(raw: unknown) { const target = targetSchema.parse(raw); access(target, true); return true; },
    upload(raw: unknown) {
        const input = z.object({ operationId: id, id: id.optional(), expectedRevision: z.number().int().nonnegative(), target: targetSchema, title: id, reason, file: z.object({ name: id, content: z.string().max(14000000) }).strict() }).strict().parse(raw), user = access(input.target, true), file = verifyAttachmentFile(input.file.name, input.file.content), fingerprint = hash({ ...input, file: { name: file.name, sha256: file.sha256 } }), prior = replay(input.operationId, fingerprint);
        if (prior)
            return prior;
        const old = input.id ? get(input.id, true) : undefined;
        if (old) {
            expected(old, input.expectedRevision);
            if (JSON.stringify(old.target) !== JSON.stringify(input.target))
                throw new Error('An attachment retains its original business link.');
            if (old.deletedAt)
                throw new Error('Recover the attachment before adding a version.');
            if (old.versions.some(v => v.sha256 === file.sha256))
                throw new Error('These file bytes already exist in this attachment. Use version restore instead.');
            if (old.versions.length >= 100)
                throw new Error('An attachment supports at most 100 versions.');
        }
        else if (input.expectedRevision !== 0)
            throw new Error('A new attachment requires revision zero.');
        if (!old && documents.some(d => !d.deletedAt && d.target.kind === input.target.kind && d.target.id === input.target.id && d.versions.some(v => v.sha256 === file.sha256)))
            throw new Error('This file already exists on the selected business object. Open its existing attachment.');
        capacity(file.size);
        const at = new Date().toISOString();
        if (old)
            checkClock(old, at);
        const v = { ...file, id: crypto.randomUUID(), number: (old?.versions.length ?? 0) + 1, createdAt: at, createdBy: user }, d: Document = { ...(old ?? { id: crypto.randomUUID(), target: input.target, createdAt: at, createdBy: user }), title: old?.title ?? input.title, currentVersionId: v.id, versions: [...(old?.versions ?? []), v], revision: (old?.revision ?? 0) + 1, updatedAt: at, updatedBy: user };
        return put(d, old ? 'Added version' : 'Uploaded', input.operationId, fingerprint, input.reason, v.id);
    },
    change(raw: unknown) {
        const input = z.object({ operationId: id, id, expectedRevision: z.number().int().positive(), action: z.enum(['Renamed', 'Trashed', 'Recovered', 'Restored version']), reason, title: id.optional(), versionId: id.optional() }).strict().parse(raw), old = get(input.id, true), fingerprint = hash(input), prior = replay(input.operationId, fingerprint);
        if (prior)
            return prior;
        expected(old, input.expectedRevision);
        const user = access(old.target, true), at = new Date().toISOString();
        checkClock(old, at);
        const d = { ...old, versions: [...old.versions], revision: old.revision + 1, updatedBy: user, updatedAt: at };
        let versionId: string | undefined;
        if (input.action === 'Trashed') {
            if (old.deletedAt)
                throw new Error('Attachment is already in the recycle bin.');
            d.deletedAt = at;
            d.deletedBy = user;
        }
        else if (input.action === 'Recovered') {
            if (!old.deletedAt)
                throw new Error('Attachment is not in the recycle bin.');
            delete d.deletedAt;
            delete d.deletedBy;
        }
        else {
            if (old.deletedAt)
                throw new Error('Recover the attachment before editing.');
            if (input.action === 'Renamed') {
                if (!input.title)
                    throw new Error('Enter a document title.');
                d.title = input.title;
            }
            else {
                const source = old.versions.find(v => v.id === input.versionId);
                if (!source)
                    throw new Error('Version not found.');
                if (source.id === old.currentVersionId)
                    throw new Error('That version is already current.');
                if (old.versions.length >= 100)
                    throw new Error('An attachment supports at most 100 versions.');
                capacity(source.size);
                attachmentBytes(source);
                const v = { ...source, id: crypto.randomUUID(), number: old.versions.length + 1, createdAt: at, createdBy: user, restoredFrom: source.id };
                d.versions.push(v);
                d.currentVersionId = v.id;
                versionId = v.id;
            }
        }
        return put(d, input.action, input.operationId, fingerprint, input.reason, versionId);
    },
    read(raw: unknown) {
        const input = z.object({ id, versionId: id }).strict().parse(raw), d = get(input.id), v = d.versions.find(v => v.id === input.versionId);
        if (!v)
            throw new Error('Version not found.');
        attachmentBytes(v);
        return { ...v };
    }
};
registerRepository('attachments', { repository: attachmentRepository, read: 'inventory.read', commands: { targets: 'inventory.read', checkTarget: 'inventory.read', upload: 'inventory.read', change: 'inventory.read', read: 'inventory.read' }, snapshot: () => ({ documents, history }), restore: v => { documents = v.documents; history = v.history; }, publish: () => { }, view: p => { const visible = documents.filter(d => available(d.target, p)); return { documents: visible.map(d => strip(d, p)), history: history.filter(h => visible.some(d => d.id === h.documentId)).map(({ fingerprint: _fingerprint, ...h }) => h) }; }, validate: (raw, snapshots) => {
        const data = z.object({ documents: z.array(document), history: z.array(historyRow) }).strict().parse(raw), operations = new Set<string>();
        let bytes = 0;
        for (const d of data.documents) {
            const spec = targetSpecs[d.target.kind];
            if (!(snapshots[spec.repository] as any)?.[spec.collection]?.some((r: any) => r.id === d.target.id))
                throw new Error('Invalid attachment business reference.');
            if (!!d.deletedAt !== !!d.deletedBy)
                throw new Error('Invalid attachment recycle metadata.');
            const ids = new Set<string>();
            for (const [i, v] of d.versions.entries()) {
                attachmentBytes(v);
                bytes += v.size;
                if (ids.has(v.id) || v.number !== i + 1 || v.createdAt < d.createdAt || v.createdAt > d.updatedAt)
                    throw new Error('Invalid attachment version history.');
                if (v.restoredFrom && (!ids.has(v.restoredFrom) || d.versions.find(p => p.id === v.restoredFrom)?.sha256 !== v.sha256 || d.versions.find(p => p.id === v.restoredFrom)?.name !== v.name))
                    throw new Error('Invalid restored attachment version.');
                ids.add(v.id);
            }
            if (!ids.has(d.currentVersionId))
                throw new Error('Invalid current attachment version.');
            const events = data.history.filter(h => h.documentId === d.id);
            if (events.length !== d.revision || events[0].action !== 'Uploaded' || events[0].actorId !== d.createdBy || events[0].at !== d.createdAt)
                throw new Error('Invalid attachment audit history.');
            let previousAt = d.createdAt, count = 0, deleted = false, current = '', previousTitle = '';
            for (const [i, h] of events.entries()) {
                if (h.revision !== i + 1 || h.at < previousAt || h.at > d.updatedAt)
                    throw new Error('Invalid attachment audit ordering.');
                previousAt = h.at;
                if (i > 0 && h.action !== 'Renamed' && h.after.title !== previousTitle)
                    throw new Error('Attachment title changed without a rename event.');
                previousTitle = h.after.title;
                if (!['Uploaded', 'Added version', 'Restored version'].includes(h.action) && h.versionId)
                    throw new Error('Unexpected attachment version reference.');
                if (['Uploaded', 'Added version', 'Restored version'].includes(h.action)) {
                    if (deleted || h.action === 'Uploaded' && i !== 0)
                        throw new Error('Invalid attachment version event.');
                    const v = d.versions[count++];
                    if (!v || v.id !== h.versionId || v.createdBy !== h.actorId || v.createdAt !== h.at || !!v.restoredFrom !== (h.action === 'Restored version'))
                        throw new Error('Attachment version differs from its audit.');
                    current = v.id;
                }
                else if (h.action === 'Trashed') {
                    if (deleted)
                        throw new Error('Repeated attachment trash event.');
                    deleted = true;
                }
                else if (h.action === 'Recovered') {
                    if (!deleted)
                        throw new Error('Invalid attachment recovery event.');
                    deleted = false;
                }
                else if (deleted)
                    throw new Error('Deleted attachment cannot be renamed.');
                if (h.after.versionsCount !== count || h.after.currentVersionId !== current || h.after.deleted !== deleted)
                    throw new Error('Attachment audit outcome is inconsistent.');
            }
            const last = events.at(-1)!;
            if (count !== d.versions.length || last.actorId !== d.updatedBy || last.at !== d.updatedAt || JSON.stringify(last.after) !== JSON.stringify(outcome(d)))
                throw new Error('Attachment metadata differs from audit.');
            if (d.deletedAt && (d.deletedAt !== last.at || d.deletedBy !== last.actorId))
                throw new Error('Attachment deletion differs from audit.');
        }
        for (const h of data.history) {
            if (operations.has(h.operationId) || !data.documents.some(d => d.id === h.documentId))
                throw new Error('Invalid attachment operation identity.');
            operations.add(h.operationId);
        }
        if (bytes > MAX_LIBRARY_BYTES)
            throw new Error('Attachment library exceeds 50 MB.');
    } });
