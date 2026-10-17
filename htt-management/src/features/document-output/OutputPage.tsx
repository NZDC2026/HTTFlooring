import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BusinessFrame } from '../business-workspace/MasterDataPages';
import { Panel, Field, SampleTable, Cell, fieldClass, buttonClass } from '../prototype/PrototypeUI';
import { Notice } from '../page-previews/PreviewWorkspace';
import { salesRepository } from '../sales/data/salesRepository';
import { creditNoteRepository } from '../sales/data/creditNoteRepository';
import { usePermission } from '../security/usePermission';
import { getOutputTemplates, outputRepository, outputKinds, sourceDocument, usePreparedOutputs, type OutputKind } from './outputRepository';
import { outputFileName, renderOutputHtml } from './outputHtml';
export function OutputPage() {
    const records = usePreparedOutputs(), canPrepare = usePermission('documents.prepare'), [search] = useSearchParams(), [kind, setKind] = useState<OutputKind>(outputKinds.includes(search.get('kind') as OutputKind) ? search.get('kind') as OutputKind : 'INVOICE'), [sourceId, setSourceId] = useState(search.get('sourceId') ?? ''), [templateId, setTemplateId] = useState(''), [selectedId, setSelectedId] = useState(''), [operationId, setOperationId] = useState(() => crypto.randomUUID()), [error, setError] = useState(''), frame = useRef<HTMLIFrameElement>(null);
    const sources = kind === 'CREDIT_NOTE' ? creditNoteRepository.getAll().map(c => ({ ...c, documentNumber: c.creditNoteNumber })) : salesRepository.getAll().filter(d => d.type === kind);
    const source = sources.find(d => d.id === sourceId), selected = records.find(a => a.id === selectedId), templates = getOutputTemplates().filter(t => t.kind === ({ QUOTE: 'Quotation', SALES_ORDER: 'Sales order', INVOICE: 'Invoice', CREDIT_NOTE: 'Credit note' }[kind]));
    let stale = false;
    try {
        stale = !!selected && sourceDocument(selected.kind, selected.sourceId).updatedAt !== selected.sourceUpdatedAt;
    }
    catch {
        stale = !!selected;
    }
    const prepared = records.find(a => a.operationId === operationId);
    function prepare(newVersion = false) {
        if (!source)
            return;
        if (!newVersion && prepared) {
            setSelectedId(prepared.id);
            return;
        }
        const nextOperationId = newVersion ? crypto.randomUUID() : operationId;
        setOperationId(nextOperationId);
        try {
            const a = outputRepository.prepare({ operationId: nextOperationId, kind, sourceId, expectedUpdatedAt: source.updatedAt, templateId: templateId || undefined });
            setSelectedId(a.id);
            setError('');
        }
        catch (e) {
            setError((e as Error).message);
        }
    }
    function download() {
        if (!selected)
            return;
        const url = URL.createObjectURL(new Blob([renderOutputHtml(selected)], { type: 'text/html;charset=utf-8' })), a = document.createElement('a');
        a.href = url;
        a.download = outputFileName(selected);
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
    return <BusinessFrame title="Sales document preparation" actions={<Link className={buttonClass} to="/sales">Sales</Link>}><Notice error>{error}</Notice><Notice>Prepare an immutable local copy, then print or save the HTML file. Your print dialog may offer Save as PDF. Email text is prepared for review; no email is sent and no delivery status is claimed.</Notice><Panel title="Prepare a version"><div className="grid gap-4 md:grid-cols-3"><Field label="Document type"><select className={fieldClass} value={kind} onChange={e => { setKind(e.target.value as OutputKind); setSourceId(''); setTemplateId(''); setOperationId(crypto.randomUUID()); }}>{outputKinds.map(k => <option key={k} value={k}>{k.replaceAll('_', ' ')}</option>)}</select></Field><Field label="Source document"><select className={fieldClass} value={sourceId} onChange={e => { setSourceId(e.target.value); setOperationId(crypto.randomUUID()); }}><option value="">Select source…</option>{sources.map(s => <option key={s.id} value={s.id}>{s.documentNumber} · {s.status}</option>)}</select></Field><Field label="Template"><select className={fieldClass} value={templateId} onChange={e => { setTemplateId(e.target.value); setOperationId(crypto.randomUUID()); }}><option value="">Standard sales document</option>{templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field></div>{source && <p className="my-3 text-sm">{source.documentNumber} · {source.status} · Source updated {source.updatedAt}. Store and recipient are taken from this source's saved snapshot.</p>}{canPrepare && <div className="flex gap-3"><button className={buttonClass} disabled={!source} onClick={() => prepare()}>{prepared ? 'View prepared version' : 'Prepare local version'}</button>{prepared && <button className={buttonClass} disabled={!source} onClick={() => prepare(true)}>Prepare another version</button>}</div>}{!canPrepare && <p className="text-sm">Your role may view prepared versions but cannot create them.</p>}<p className="mt-3 text-xs text-slate-500">Use Prepare another version to refresh a source or template. Previous versions remain in history. Templates support {'{{documentNumber}}, {{customerName}}, {{companyName}}, {{currency}}, {{total}}, {{documentDate}}, {{dueDate}}, {{store}}, {{accountingContact}}'}.</p></Panel>{selected && <><Panel title={`${selected.documentNumber} · saved version`}><p className="text-sm">Prepared {selected.preparedAt} · {selected.status} · Template {selected.template.name} revision {selected.template.revision}</p>{stale && <Notice>Source changed after this version was prepared. This copy retains the old status, balance and content. Prepare a new version when you need updated information.</Notice>}<div className="my-4 flex gap-3"><button className={buttonClass} onClick={download}>Download printable HTML</button><button className={buttonClass} onClick={() => frame.current?.contentWindow?.print()}>Print / Save as PDF</button></div><iframe ref={frame} title={`Printable ${selected.documentNumber}`} className="h-[720px] w-full rounded border bg-white" sandbox="allow-same-origin allow-modals" srcDoc={renderOutputHtml(selected)}/></Panel><Panel title="Email preparation — not sent"><p className="mb-3 text-sm">To: {selected.recipient?.accountingEmail ?? 'No accounting email recorded on the source. Correct the source draft or use your approved delivery process.'}</p><Field label="Subject"><input readOnly className={fieldClass} value={selected.subject}/></Field><Field label="Body"><textarea readOnly rows={6} className={fieldClass} value={selected.body}/></Field><p className="mt-2 text-xs text-slate-500">Attach the exported document manually in your email application. Printing or downloading does not mark the source as sent.</p></Panel></>}<Panel title="Prepared version history"><SampleTable headers={['Document', 'Status at preparation', 'Prepared', 'Template', 'Actor', '']} empty={!records.length}>{records.map(a => <tr key={a.id}><Cell>{a.documentNumber}<p className="text-xs">{a.kind}</p></Cell><Cell>{a.status}</Cell><Cell>{a.preparedAt}</Cell><Cell>{a.template.name} · {a.template.revision}</Cell><Cell>{a.preparedBy}</Cell><Cell><button className={buttonClass} onClick={() => setSelectedId(a.id)}>View version</button></Cell></tr>)}</SampleTable></Panel></BusinessFrame>;
}
