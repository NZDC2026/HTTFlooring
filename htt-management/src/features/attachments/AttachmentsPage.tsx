import {usePermission} from '../security/usePermission';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { attachmentClient, useAttachments, selectAttachment, exportAttachment } from './attachmentClient';
import { targetKinds, type AttachmentTarget, type AttachmentDocument } from './attachmentModel';
import { BusinessFrame } from '../business-workspace/MasterDataPages';
import { Panel, Field, SampleTable, Cell, fieldClass, buttonClass } from '../prototype/PrototypeUI';
export function AttachmentsPage({ mode = 'library', documentId }: { mode?: 'library' | 'upload' | 'detail'; documentId?: string }) {
    const navigate = useNavigate();
    const purchaseWrite=usePermission('purchases.write'),accountingRead=usePermission('accounting.read'),purchaseOutputAccess=purchaseWrite||accountingRead;
    const { documents, history } = useAttachments(), [query, setQuery] = useState(''), [filter, setFilter] = useState('Active'), [kind, setKind] = useState('All'), [page, setPage] = useState(0), [targets, setTargets] = useState<ReturnType<typeof attachmentClient.targets>>([]), [targetQuery, setTargetQuery] = useState(''), [targetKey, setTargetKey] = useState(''), [title, setTitle] = useState(''), [reason, setReason] = useState(''), [editTitle, setEditTitle] = useState(() => documents.find(d => d.id === documentId)?.title ?? ''), [error, setError] = useState(''), [notice, setNotice] = useState(''), [preview, setPreview] = useState<{
        name: string;
        mime: string;
        content: string;
    }>();
    const selected = documents.find(d => d.id === documentId), visible = documents.filter(d => (filter === 'All' || (filter === 'Recycle bin' ? !!d.deletedAt : !d.deletedAt)) && (kind === 'All' || d.target.kind === kind) && [d.title, d.targetLabel, ...d.versions.map(v => v.name)].join(' ').toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id)), last = Math.max(0, Math.ceil(visible.length / 50) - 1), current = Math.min(page, last), target = targets.find(t => t.kind + ':' + t.id === targetKey), matches = targets.filter(t => t.canWrite && [t.kind, t.label].join(' ').toLowerCase().includes(targetQuery.toLowerCase()));
    const action = (fn: () => void) => {
        try {
            fn();
            setError('');
        }
        catch (e) {
            setError((e as Error).message);
        }
    };
    useEffect(() => { setEditTitle(selected?.title ?? ''); }, [selected?.id, selected?.title]);
    useEffect(() => {
        if (mode !== 'upload') return;
        try { setTargets(attachmentClient.targets()); }
        catch (e) { setError((e as Error).message); }
    }, [mode]);
    const change = (type: 'Renamed' | 'Trashed' | 'Recovered' | 'Restored version', versionId?: string) => action(() => { attachmentClient.change({ operationId: crypto.randomUUID(), id: selected!.id, expectedRevision: selected!.revision, action: type, reason, ...(type === 'Renamed' ? { title: editTitle } : {}), ...(versionId ? { versionId } : {}) }); setReason(''); setPreview(undefined); setNotice('Attachment change saved.'); });
    const upload = (existing?: AttachmentDocument) => action(() => {
        const link = existing?.target ?? (target && { kind: target.kind, id: target.id });
        if (!link)
            throw new Error('Choose a business object.');
        if (!reason.trim() || !existing && !title.trim())
            throw new Error('Enter a title and change reason.');
        const before = new Set(attachmentClient.getSnapshot().documents.map(d => d.id));
        const saved = selectAttachment({ operationId: crypto.randomUUID(), ...(existing ? { id: existing.id } : {}), expectedRevision: existing?.revision ?? 0, target: link as AttachmentTarget, title: existing?.title ?? title, reason });
        if (saved) {
            setNotice(existing ? 'New file version saved.' : 'File content saved and linked to the business object.');
            setReason('');
            setPreview(undefined);
            if (!existing) {
                const created = attachmentClient.getSnapshot().documents.find(d => !before.has(d.id));
                if (created) navigate('/documents/' + encodeURIComponent(created.id));
            }
        }
    });
    function show(versionId: string) {
        action(() => {
            const file = attachmentClient.read({ id: selected!.id, versionId });
            if (!['image/png', 'image/jpeg', 'text/plain', 'text/csv'].includes(file.mime))
                throw new Error('Export this PDF or Office version to view it in your preferred viewer.');
            setPreview(file);
        });
    }
    return <BusinessFrame title={mode === 'upload' ? 'Upload business document' : mode === 'detail' ? 'Document details' : 'Business attachments & versions'}><nav aria-label="Document centre navigation" className="flex flex-wrap gap-3"><Link className={buttonClass} to="/documents">Document library</Link><Link className={buttonClass} to="/documents/upload">Upload document</Link><Link className={buttonClass} to="/documents/templates">Templates</Link><Link className={buttonClass} to="/documents/capture">Bill capture review</Link><Link className={buttonClass} to="/documents/delivery">Sales document preparation</Link>{purchaseOutputAccess&&<Link className={buttonClass} to="/documents/purchase-output">Purchase orders & remittances</Link>}</nav><p>Files are saved in this local business profile and included in business backups. Access follows the linked business object. Keep all versions, recover deleted attachments, and export any version. Maximum 10 MB per file, 100 versions per attachment and 50 MB total including versions and recycle bin.</p>{error && <p role="alert" className="my-3 rounded border border-red-300 p-3 whitespace-pre-wrap text-red-700">{error}</p>}{notice && <p role="status" className="my-3 rounded border p-3">{notice}</p>}
 {mode === 'library' && <Panel title="Attachment register"><div className="flex flex-wrap gap-3"><input aria-label="Find business attachments" className={fieldClass} placeholder="Title, linked object or version filename" value={query} onChange={e => { setQuery(e.target.value); setPage(0); }}/><select aria-label="Attachment state" className={fieldClass} value={filter} onChange={e => { setFilter(e.target.value); setPage(0); }}>{['Active', 'Recycle bin', 'All'].map(v => <option key={v}>{v}</option>)}</select><select aria-label="Attachment object type" className={fieldClass} value={kind} onChange={e => { setKind(e.target.value); setPage(0); }}>{['All', ...targetKinds].map(v => <option key={v}>{v}</option>)}</select></div><p className="my-3">{visible.length} matching attachments</p><SampleTable headers={['Document', 'Business link', 'Current file', 'Versions', 'State', 'Updated']} empty={!visible.length}>{visible.slice(current * 50, current * 50 + 50).map(d => { const v = d.versions.find(v => v.id === d.currentVersionId)!; return <tr key={d.id}><Cell><Link className="underline" to={'/documents/' + encodeURIComponent(d.id)}>{d.title}</Link></Cell><Cell>{d.target.kind} · {d.targetLabel}</Cell><Cell>{v.name} · {v.size.toLocaleString()} bytes</Cell><Cell>{d.versions.length}</Cell><Cell>{d.deletedAt ? 'Recycle bin' : 'Active'}</Cell><Cell>{d.updatedAt}</Cell></tr>; })}</SampleTable><div className="my-3 flex gap-3"><button className={buttonClass} disabled={!current} onClick={() => setPage(current - 1)}>Previous attachments</button><span>Page {current + 1} of {last + 1}</span><button className={buttonClass} disabled={current === last} onClick={() => setPage(current + 1)}>Next attachments</button></div></Panel>}
 {mode === 'upload' && <Panel title="Add a linked file"><button className={buttonClass} onClick={() => action(() => { setTargets(attachmentClient.targets()); setTargetKey(''); })}>Refresh available business links</button><div className="mt-3 grid gap-3 md:grid-cols-2"><Field label="Find business object"><input className={fieldClass} placeholder="Object type, number, name or code" value={targetQuery} onChange={e => { setTargetQuery(e.target.value); setTargetKey(''); }}/></Field><Field label="Business object"><select className={fieldClass} value={targetKey} onChange={e => setTargetKey(e.target.value)}><option value="">Choose a writable object</option>{matches.slice(0, 100).map(t => <option key={t.kind + ':' + t.id} value={t.kind + ':' + t.id}>{t.kind} · {t.label}</option>)}</select></Field><Field label="Document title"><input className={fieldClass} maxLength={200} value={title} onChange={e => setTitle(e.target.value)}/></Field></div><p className="my-3 text-sm">Showing {Math.min(matches.length, 100)} of {matches.length} writable links; narrow the search if needed. PDF, PNG, JPEG, UTF-8 CSV/TXT, DOCX and XLSX are supported.</p><Field label="File or version change reason"><textarea className={fieldClass} rows={3} maxLength={2000} value={reason} onChange={e => setReason(e.target.value)}/></Field><button className={`${buttonClass} mt-3`} disabled={!target || !title.trim() || !reason.trim()} onClick={() => upload()}>Choose file & save attachment</button></Panel>}
 {mode === 'detail' && !selected && <Panel title="Document not found"><p>The document is unavailable or outside your access. Open the document library to select an accessible file.</p><Link className={buttonClass} to="/documents">Back to document library</Link></Panel>}
 {mode === 'detail' && selected && <Panel title={`Attachment: ${selected.title}`}><p>{selected.target.kind} · {selected.targetLabel} · Revision {selected.revision} · {selected.deletedAt ? 'Recycle bin' : 'Active'}</p>{selected.targetPath && <Link className="underline" to={selected.targetPath}>Open linked business record</Link>}{selected.canWrite && <div className="my-3"><Field label="Attachment maintenance reason"><textarea className={fieldClass} rows={3} maxLength={2000} value={reason} onChange={e => setReason(e.target.value)}/></Field></div>}<SampleTable headers={['Version', 'File', 'Size', 'SHA-256', 'Recorded by / time', 'Actions']}>{[...selected.versions].reverse().map(v => <tr key={v.id}><Cell>v{v.number}{v.id === selected.currentVersionId ? ' · Current' : ''}{v.restoredFrom ? ' · Restored' : ''}</Cell><Cell>{v.name}</Cell><Cell>{v.size.toLocaleString()} bytes</Cell><Cell><span className="break-all text-xs">{v.sha256}</span></Cell><Cell>{v.createdBy} · {v.createdAt}</Cell><Cell><div className="flex flex-wrap gap-2">{['image/png', 'image/jpeg', 'text/plain', 'text/csv'].includes(v.mime) && <button className={buttonClass} onClick={() => show(v.id)}>Preview v{v.number}</button>}<button className={buttonClass} onClick={() => action(() => {
                    if (exportAttachment(selected.id, v.id))
                        setNotice('Selected file version exported.');
                })}>Export v{v.number}</button>{selected.canWrite && !selected.deletedAt && v.id !== selected.currentVersionId && <button disabled={!reason.trim()} className={buttonClass} onClick={() => change('Restored version', v.id)}>Restore v{v.number} as new version</button>}</div></Cell></tr>)}</SampleTable>{preview && <div className="my-3 rounded border p-3"><h3>{preview.name}</h3>{!preview.mime.startsWith('image/') && <p className="text-sm">Text preview shows at most 200,000 characters. Export the version for the full file.</p>}{preview.mime.startsWith('image/') ? <img className="max-h-[600px] max-w-full object-contain" alt={preview.name} src={`data:${preview.mime};base64,${preview.content}`}/> : <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap break-words">{new TextDecoder().decode(Uint8Array.from(atob(preview.content), c => c.charCodeAt(0))).slice(0, 200000)}</pre>}<button className={buttonClass} onClick={() => setPreview(undefined)}>Close preview</button></div>}<p className="my-3 text-sm">PDF and Office versions are exported for viewing. Restoring a version appends a copy; it preserves every previous version. Use the attachment maintenance reason for version, title and recycle actions.</p>{selected.canWrite && <div className="my-3 flex flex-wrap items-end gap-3">{!selected.deletedAt && <><Field label="Rename document title"><input className={fieldClass} maxLength={200} value={editTitle} onChange={e => setEditTitle(e.target.value)}/></Field><button className={buttonClass} disabled={!reason.trim() || !editTitle.trim()} onClick={() => change('Renamed')}>Save document title</button><button className={buttonClass} disabled={!reason.trim()} onClick={() => upload(selected)}>Upload next version</button></>}<button className={buttonClass} disabled={!reason.trim()} onClick={() => change(selected.deletedAt ? 'Recovered' : 'Trashed')}>{selected.deletedAt ? 'Recover attachment' : 'Move attachment to recycle bin'}</button></div>}<h3 className="my-3">Attachment audit history</h3><SampleTable headers={['Revision', 'Action', 'Actor', 'Time', 'Reason']}>{history.filter(h => h.documentId === selected.id).map(h => <tr key={h.id}><Cell>{h.revision}</Cell><Cell>{h.action}</Cell><Cell>{h.actorId}</Cell><Cell>{h.at}</Cell><Cell>{h.reason}</Cell></tr>)}</SampleTable></Panel>}
 </BusinessFrame>;
}
