import { useEffect, useState } from 'react';
import { BusinessFrame } from '../business-workspace/MasterDataPages';
import { Panel, Field, Cell, SampleTable, buttonClass, fieldClass } from '../prototype/PrototypeUI';
import { useSecurity } from '../security/securityClient';
import { hasPermission } from '../security/rbac';
import { kinds, recycleHistory } from './recycleState';
import { recycleClient, useRecycleVersion, type PurgePreview, type RecycleRow } from './recycleClient';
export function RecycleBinPage() {
    useRecycleVersion();
    const { session } = useSecurity(), principal = session ? { userId: session.user.id, roles: session.user.roles, authenticated: true as const } : null, identity = session?.user.id + ':' + session?.user.roles.join(','), readable = (r: RecycleRow) => hasPermission(principal, r.kind === 'Purchase order' || r.kind === 'Expense bill draft' ? 'purchases.read' : 'sales.read');
    const [rows, setRows] = useState<RecycleRow[]>([]), [state, setState] = useState('Recycle bin'), [kind, setKind] = useState('All'), [query, setQuery] = useState(''), [selected, setSelected] = useState<string[]>([]), [reason, setReason] = useState(''), [confirmed, setConfirmed] = useState(false), [operationId, setOperationId] = useState(() => crypto.randomUUID()), [error, setError] = useState(''), [notice, setNotice] = useState(''), [page, setPage] = useState(0), [detail, setDetail] = useState<{
        row: RecycleRow;
        value: unknown;
    }>();
    const admin=!!principal?.roles.includes('ADMIN'), [preview,setPreview]=useState<PurgePreview>(),[purgeConfirmation,setPurgeConfirmation]=useState('');
    function reset() { setPreview(undefined); setPurgeConfirmation(''); setSelected([]); setConfirmed(false); setOperationId(crypto.randomUUID()); setPage(0); setDetail(undefined); }
    function refresh() {
        try {
            setRows(recycleClient.list());
            setError('');
        }
        catch (e) {
            setError((e as Error).message);
        }
    }
    useEffect(() => { reset(); refresh(); }, [identity]);
    const matches = rows.filter(readable).filter(r => (state === 'Recycle bin' ? r.deleted : !r.deleted) && (kind === 'All' || kind === r.kind) && [r.label, r.recordId, r.date, r.party, r.reference].join(' ').toLowerCase().includes(query.toLowerCase())), last = Math.max(0, Math.ceil(matches.length / 50) - 1), current = Math.min(page, last), chosen = matches.filter(r => selected.includes(r.recordId)), canSubmit = !!chosen.length && chosen.length === selected.length && chosen.every(r => r.canWrite && !r.issues.length) && confirmed && reason.trim().length >= 3;
    function submit() {
        try {
            recycleClient.change({ operationId, action: state === 'Recycle bin' ? 'Recovered' : 'Trashed', reason, records: chosen.map(r => ({ kind: r.kind, recordId: r.recordId, token: r.token })) });
            setNotice(`${chosen.length} document(s) ${state === 'Recycle bin' ? 'recovered' : 'moved to the recycle bin'}.`);
            reset();
            setReason('');
            refresh();
        }
        catch (e) {
            setError((e as Error).message);
        }
    }
    const document = detail?.value as {
        status: string;
        notes?: string;
        payload?: {
            notes?: string;
        };
        lines: {
            id: string;
            description: string;
            quantity: number;
            unitSymbol: string;
            lineSubtotal: number;
            taxAmount: number;
            lineTotal: number;
        }[];
        totals: {
            subtotal: number;
            taxAmount: number;
            total: number;
        };
    } | undefined;
    return <BusinessFrame title="Document recycle bin"><p>Recoverable removal for draft quotes, purchase orders and sales order, invoice or expense entry drafts. Original documents and attachments are retained. Only unapproved, unposted drafts without linked workflows are eligible. Posted records use their existing void or reversal process.</p>{error && <p role="alert" className="my-3 whitespace-pre-wrap rounded border border-red-300 p-3 text-red-700">{error}</p>}{notice && <p role="status" className="my-3 rounded border p-3">{notice}</p>}
 <Panel title="Business documents"><div className="flex flex-wrap gap-3"><select aria-label="Document recycle state" className={fieldClass} value={state} onChange={e => { setState(e.target.value); reset(); }}>{['Recycle bin', 'Active documents'].map(s => <option key={s}>{s}</option>)}</select><select aria-label="Document recycle type" className={fieldClass} value={kind} onChange={e => { setKind(e.target.value); reset(); }}>{['All', ...kinds].map(k => <option key={k}>{k}</option>)}</select><input aria-label="Find recycle documents" className={fieldClass} value={query} placeholder="Document, party, reference or date" onChange={e => { setQuery(e.target.value); reset(); }}/><button className={buttonClass} onClick={() => { reset(); refresh(); }}>Refresh documents</button></div><p className="my-3">{matches.length} matching documents · up to 100 per batch. Read access and actions follow each document type.</p><SampleTable headers={['Select', 'Document', 'Date', 'Status / total', 'Eligibility', 'Last recycle action']} empty={!matches.length}>{matches.slice(current * 50, current * 50 + 50).map(r => <tr key={r.recordId}><Cell><input aria-label={`Select ${r.label}`} type="checkbox" disabled={!r.canWrite || !!r.issues.length || (!selected.includes(r.recordId) && selected.length >= 100)} checked={selected.includes(r.recordId)} onChange={e => { setPreview(undefined); setPurgeConfirmation(''); setSelected(e.target.checked ? [...selected, r.recordId] : selected.filter(id => id !== r.recordId)); setConfirmed(false); setOperationId(crypto.randomUUID()); }}/></Cell><Cell><button className="underline" onClick={() => {
                try {
                    setDetail({ row: r, value: recycleClient.detail(r.kind, r.recordId) });
                    setError('');
                }
                catch (e) {
                    setError((e as Error).message);
                }
            }}>{r.label}</button><p>{r.kind}</p><p>{r.party} {r.reference}</p></Cell><Cell>{r.date}</Cell><Cell>{r.status} · {r.total.toFixed(2)}</Cell><Cell>{!r.canWrite ? 'Read only' : r.issues.length ? r.issues.join(' ') : r.deleted ? 'Eligible for recovery' : 'Eligible for recycle bin'}</Cell><Cell>{r.last ? `${r.last.action} · ${r.last.actorId} · ${r.last.at} · ${r.last.reason}` : '—'}</Cell></tr>)}</SampleTable><div className="my-3 flex gap-3"><button className={buttonClass} disabled={!current} onClick={() => setPage(current - 1)}>Previous documents</button><span>Page {current + 1} of {last + 1}</span><button className={buttonClass} disabled={current === last} onClick={() => setPage(current + 1)}>Next documents</button></div></Panel>
 <Panel title="Selected document action"><p>{selected.length} selected. The entire batch is checked again before it is saved. A stale selection or invalid row rejects the whole batch.</p><Field label="Recycle or recovery reason"><textarea className={fieldClass} maxLength={2000} value={reason} onChange={e => { setReason(e.target.value); setConfirmed(false); setOperationId(crypto.randomUUID()); }}/></Field><label className="my-3 flex gap-2"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)}/>I reviewed the selected documents and reason.</label><button className={buttonClass} disabled={!canSubmit} onClick={submit}>{state === 'Recycle bin' ? 'Recover selected documents' : 'Move selected drafts to recycle bin'}</button><p className="mt-3 text-sm">Recovery keeps the same IDs, amounts, lines and draft status; normal approval and posting checks still apply.</p></Panel>
 {admin && state==='Recycle bin' && <Panel title="Administrator permanent purge"><p>Only the five draft types listed above can be permanently cleared. Linked workflows and all attachments, including deleted attachments, block purge. Posted invoices, orders and credit notes retain their void or reversal process.</p><p className="my-3">An automatic verified backup is saved to the desktop profile’s recycle-backups folder before any removal. Purged drafts cannot be recovered here; use Data protection to restore the complete pre-purge backup, then restart. Audit receipts and document numbers are retained.</p><button className={buttonClass} disabled={!chosen.length} onClick={()=>{try{setPreview(recycleClient.preparePurge({records:chosen.map(r=>({kind:r.kind,recordId:r.recordId,token:r.token}))}));setPurgeConfirmation('');setError('');}catch(e){setError((e as Error).message);}}}>Preview permanent purge</button>{preview && <div className="my-3 rounded border p-3"><p>Preview expires {preview.expiresAt}. Any business data change requires a fresh preview.</p><SampleTable headers={['Document','Purge eligibility']}>{preview.rows.map(r=><tr key={r.recordId}><Cell>{r.label} · {r.kind}</Cell><Cell>{r.blockers.length?r.blockers.join(' '):'Eligible; backup required before removal'}</Cell></tr>)}</SampleTable><Field label="Permanent purge reason (at least 10 characters)"><textarea className={fieldClass} value={reason} maxLength={2000} onChange={e=>setReason(e.target.value)}/></Field><Field label={`Type ${preview.confirmation} to confirm permanent removal`}><input className={fieldClass} value={purgeConfirmation} onChange={e=>setPurgeConfirmation(e.target.value)}/></Field><button className={buttonClass} disabled={!preview.eligible||reason.trim().length<10||purgeConfirmation!==preview.confirmation} onClick={()=>{try{const result=recycleClient.purge({operationId,records:preview.rows.map(r=>({kind:r.kind,recordId:r.recordId,token:r.token})),expectedDigest:preview.digest,reason,confirmation:purgeConfirmation}) as {purge?:{backup:{fileName:string}}}[];setNotice(`${result.length} draft(s) permanently purged. Verified backup: ${result[0]?.purge?.backup.fileName}`);reset();setReason('');refresh();}catch(e){setError((e as Error).message);}}}>Permanently purge selected drafts</button></div>}</Panel>}
 <Panel title="Permanent purge audit receipts"><SampleTable headers={['Document','Administrator / time','Reason','Verified backup']} empty={!recycleHistory().some(e=>e.action==='Purged')}>{recycleHistory().filter(e=>e.action==='Purged'&&hasPermission(principal,e.kind==='Purchase order'||e.kind==='Expense bill draft'?'purchases.read':'sales.read')).map(e=><tr key={e.id}><Cell>{e.purge?.label} · {e.kind}<p>{e.recordId}</p></Cell><Cell>{e.actorId} · {e.at}</Cell><Cell>{e.reason}</Cell><Cell>{e.purge?.backup.fileName}<p className="break-all">SHA-256 {e.purge?.backup.sha256}</p></Cell></tr>)}</SampleTable></Panel>
 {detail && readable(detail.row) && document && <Panel title={`Document details: ${detail.row.label}`}><p>{detail.row.kind} · {detail.row.date} · {document.status}</p><SampleTable headers={['Description', 'Quantity / unit', 'Net', 'Tax', 'Total']}>{document.lines.map((l, i) => <tr key={l.id ?? i}><Cell>{l.description}</Cell><Cell>{l.quantity} · {l.unitSymbol}</Cell><Cell>{l.lineSubtotal.toFixed(2)}</Cell><Cell>{l.taxAmount.toFixed(2)}</Cell><Cell>{l.lineTotal.toFixed(2)}</Cell></tr>)}</SampleTable><p className="my-3">Net {document.totals.subtotal.toFixed(2)} · Tax {document.totals.taxAmount.toFixed(2)} · Total {document.totals.total.toFixed(2)}</p><p className="whitespace-pre-wrap">{document.notes ?? document.payload?.notes}</p><h3 className="my-3">Recycle audit history</h3><SampleTable headers={['Action', 'Actor', 'Time', 'Reason']}>{recycleHistory().filter(e => e.recordId === detail.row.recordId).map(e => <tr key={e.id}><Cell>{e.action}</Cell><Cell>{e.actorId}</Cell><Cell>{e.at}</Cell><Cell>{e.reason}</Cell></tr>)}</SampleTable><button className={buttonClass} onClick={() => setDetail(undefined)}>Close document details</button></Panel>}
 </BusinessFrame>;
}
