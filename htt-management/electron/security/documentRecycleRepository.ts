import { createDocumentPurgeBackup } from './documentPurgeBackup';
import { purgeQuoteRecords } from '../../src/features/sales/data/salesRepository';
import { purgePurchaseOrderRecords } from '../../src/features/purchases/data/purchaseOrderRepository';
import { purgeManagedDraftRecords } from '../../src/features/direct-documents/managedDocumentRepository';
import { financialStateStorage } from '../../src/lib/persistence/financialStateStorage';
import { financialOperationJournal } from '../../src/lib/persistence/financialOperationJournal';
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
const baseEventSchema = z.object({ id, operationId: id, fingerprint: token, kind: z.enum(kinds), recordId: id, action: z.enum(['Trashed', 'Recovered', 'Purged']), actorId: id, at: z.iso.datetime(), reason: z.string().trim().min(3).max(2000), recordToken: token, contentToken: token }).strict();
const selection = z.array(z.object({kind:z.enum(kinds),recordId:id,token}).strict()).min(1).max(100);
const purgeRequest = z.object({operationId:id,records:selection,expectedDigest:token,reason:z.string().trim().min(10).max(2000),confirmation:z.string()}).strict();
const backupSchema = z.object({id:z.uuid(),fileName:z.string().regex(/^pre-purge-[a-f0-9-]+\.json$/),sha256:token,createdAt:z.iso.datetime()}).strict().refine(v=>v.fileName===`pre-purge-${v.id}.json`,'Backup filename and identity must match.');
const purgeSchema = z.object({previewDigest:token,confirmation:z.string(),backup:backupSchema,label:id,reservedNumber:id.optional(),creationOperationId:id.optional()}).strict();
const eventSchema=baseEventSchema.extend({purge:purgeSchema.optional()});
const prepared = new Map<string,{actor:string;expires:number;evidence:string}>();
function requireAdmin() {
    const p=trustedAuthorization.require('users.manage');
    if(!p.roles.includes('ADMIN')) throw new Error('Only an ADMIN may permanently purge documents.');
    return p;
}
function containsReference(value:unknown, recordId:string):boolean {
    if(typeof value==='string') {
        if(value===recordId || value.startsWith(recordId+':')) return true;
        if((value.startsWith('{')||value.startsWith('['))&&value.length<50_000_000) {try{return containsReference(JSON.parse(value),recordId);}catch{/* ordinary text */}}
        return false;
    }
    return Array.isArray(value)?value.some(v=>containsReference(v,recordId)):!!value&&typeof value==='object'&&Object.values(value).some(v=>containsReference(v,recordId));
}
function purgeIssues(kind:RecycleKind,row:any,snapshots:Record<string,any>) {
    const errors=issues(kind,row,snapshots), [own,field]=sources[kind];
    for(const [name,state] of Object.entries(snapshots)) {
        if(name==='documentRecycle') continue;
        let other:any=state;
        if(name===own) other={...state,[field]:state[field].filter((r:any)=>r.id!==row.id)};
        if(name==='financialCache'&&kind==='Purchase order') {
            const copy=state.purchaseOrders?.find((r:any)=>r.id===row.id);
            if(!copy||hash(copy)!==hash(row)) errors.push('Purchase order cache does not match its source.');
            other={...state,purchaseOrders:state.purchaseOrders.filter((r:any)=>r.id!==row.id)};
        }
        if(containsReference(other,row.id)) errors.push(`Referenced by ${name}; permanent purge is blocked.`);
    }
    if(containsReference(financialOperationJournal.list(),row.id)) errors.push('Referenced by the financial operation journal.');
    return [...new Set(errors)];
}
function inspectPurge(records:z.infer<typeof selection>,snapshots:Record<string,any>) {
    if(new Set(records.map(r=>r.recordId)).size!==records.length) throw new Error('Select each document only once.');
    return records.map(item=>{
        const row=requireRecord(item.kind,item.recordId,snapshots),last=recycleHistory().findLast(e=>e.recordId===item.recordId);
        if(hash({record:row,lifecycle:last?.id??''})!==item.token) throw new Error('Document changed. Refresh the selection.');
        const blockers=purgeIssues(item.kind,row,snapshots);
        if(last?.action!=='Trashed') blockers.push('Move this draft to the recycle bin before permanent purge.');
        return {...item,label:row.documentNumber??row.purchaseOrderNumber??`${row.kind} · ${row.id}`,blockers};
    });
}
function evidence(records:z.infer<typeof selection>,snapshots:Record<string,unknown>) {return hash({records,snapshots,operations:financialOperationJournal.list()});}
export const documentRecycleRepository = {
    preparePurge(raw:unknown) {
        const principal=requireAdmin(),input=z.object({records:selection}).strict().parse(raw),snapshots=snapshotRepositories();
        const rows=inspectPurge(input.records,snapshots),digest=hash({nonce:crypto.randomUUID(),actor:principal.userId,evidence:evidence(input.records,snapshots)}),expires=Date.now()+300_000;
        // Bound memory and never carry a prepared approval across a process restart.
        for(const [key,value] of prepared) if(value.expires<Date.now()) prepared.delete(key);
        if(prepared.size>=100) prepared.delete(prepared.keys().next().value!);
        prepared.set(digest,{actor:principal.userId,expires,evidence:evidence(input.records,snapshots)});
        return {digest,expiresAt:new Date(expires).toISOString(),rows,confirmation:`PURGE ${rows.length} DRAFTS`,eligible:rows.every(r=>!r.blockers.length)};
    },
    purge(raw:unknown) {
        const principal=requireAdmin(),input=purgeRequest.parse(raw),fingerprint=hash({input,actorId:principal.userId}),previous=recycleHistory().filter(e=>e.operationId===input.operationId);
        if(previous.length) {if(previous[0].fingerprint!==fingerprint) throw new Error('Operation ID has different purge data.');return structuredClone(previous);}
        const snapshots=snapshotRepositories(),approval=prepared.get(input.expectedDigest);
        if(!approval||approval.actor!==principal.userId||approval.expires<Date.now()||approval.evidence!==evidence(input.records,snapshots)) throw new Error('Purge preview expired or data changed. Prepare a fresh preview.');
        const rows=inspectPurge(input.records,snapshots);
        if(input.confirmation!==`PURGE ${rows.length} DRAFTS`) throw new Error('Type the exact permanent purge confirmation.');
        if(rows.some(r=>r.blockers.length)) throw new Error(rows.flatMap(r=>r.blockers).join(' '));
        const backup=backupSchema.parse(createDocumentPurgeBackup()),at=new Date().toISOString();
        const events:RecycleEvent[]=rows.map(item=>{
            const row=requireRecord(item.kind,item.recordId,snapshots);
            return {id:crypto.randomUUID(),operationId:input.operationId,fingerprint,kind:item.kind,recordId:item.recordId,action:'Purged',actorId:principal.userId,at,reason:input.reason,recordToken:item.token,contentToken:hash(row),purge:{previewDigest:input.expectedDigest,confirmation:input.confirmation,backup,label:item.label,...(row.documentNumber||row.purchaseOrderNumber?{reservedNumber:row.documentNumber??row.purchaseOrderNumber}:{}),...(row.operationId?{creationOperationId:row.operationId}:{})}};
        });
        const ids=(kind:RecycleKind)=>new Set(rows.filter(r=>r.kind===kind).map(r=>r.recordId));
        financialStateStorage.transaction(()=>{
            if(ids('Quote').size) purgeQuoteRecords(ids('Quote'));
            if(ids('Purchase order').size) purgePurchaseOrderRecords(ids('Purchase order'));
            const managed=new Set([...ids('Sales order draft'),...ids('Invoice draft'),...ids('Expense bill draft')]);
            if(managed.size) purgeManagedDraftRecords(managed);
            restoreRecycleHistory([...recycleHistory(),...events]);
        });
        return structuredClone(events);
    },
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
registerRepository('documentRecycle', { repository: documentRecycleRepository, read: 'inventory.read', commands: { list: 'inventory.read', detail: 'inventory.read', change: 'inventory.read', preparePurge:'users.manage', purge:'users.manage' }, snapshot: () => ({ history: recycleHistory() }), restore: v => restoreRecycleHistory(v.history), publish: () => { }, view: p => ({ history: recycleHistory().filter(e => hasPermission(p, readPermission(e.kind))) }), validate: (value, snapshots) => {
        const { history } = z.object({ history: z.array(eventSchema) }).strict().parse(value), ids = new Set<string>(), states = new Map<string, string>(), operations = new Map<string, RecycleEvent[]>();
        for (const event of history) {
            if (ids.has(event.id))
                throw new Error('Duplicate recycle event.');
            ids.add(event.id);
            const final=history.findLast(e=>e.recordId===event.recordId)!;
            if(history.some(e=>e.recordId===event.recordId&&e.kind!==event.kind)) throw new Error('Recycle document kind changed.');
            const row = final.action==='Purged'?undefined:requireRecord(event.kind, event.recordId, snapshots);
            if(states.get(event.recordId)==='Purged'||(event.action==='Purged'&&states.get(event.recordId)!=='Trashed')) throw new Error('Invalid permanent purge lifecycle.');
            if(event.action==='Purged') {
                if(event.reason.trim().length<10) throw new Error('Permanent purge reason is too short.');
                if(!event.purge||records(event.kind,snapshots).some((r:any)=>r.id===event.recordId)) throw new Error('Purged source must be absent and its backup receipt retained.');
                const prior=history.slice(0,history.indexOf(event)).findLast(e=>e.recordId===event.recordId);
                if(prior?.contentToken!==event.contentToken) throw new Error('Purge content receipt changed.');
                for(const [name,state] of Object.entries(snapshots)) if(name!=='documentRecycle'&&containsReference(state,event.recordId)) throw new Error('Purged document still has references.');
                const all=kinds.flatMap(k=>records(k,snapshots));
                if(all.some((r:any)=>(event.purge?.creationOperationId&&r.operationId===event.purge.creationOperationId)||(event.purge?.reservedNumber&&(r.documentNumber===event.purge.reservedNumber||r.purchaseOrderNumber===event.purge.reservedNumber)))) throw new Error('Purged document identity was reused.');
            } else if(event.purge) throw new Error('Unexpected permanent purge receipt.');
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
            if (new Set(records.map(r => r.recordId)).size !== records.length || group.some(e => e.fingerprint !== first.fingerprint || e.action !== first.action || e.actorId !== first.actorId || e.at !== first.at || e.reason !== first.reason) || hash({ input: first.action==='Purged'?{operationId:first.operationId,records,expectedDigest:first.purge?.previewDigest,reason:first.reason,confirmation:first.purge?.confirmation}:{ operationId: first.operationId, action: first.action, reason: first.reason, records }, actorId: first.actorId }) !== first.fingerprint || (first.action==='Purged' && (first.purge?.confirmation!==`PURGE ${records.length} DRAFTS` || group.some(e=>hash(e.purge?.backup)!==hash(first.purge?.backup)||e.purge?.previewDigest!==first.purge?.previewDigest||e.purge?.confirmation!==first.purge?.confirmation))))
                throw new Error('Invalid recycle operation receipt.');
        }
    } });
