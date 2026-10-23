import { DataTable } from '../../components/data-table/DataTable';
import { WorkspaceBulkAction } from '../business-workspace/WorkspaceBulkAction';
import { reportSettings } from '../report-settings/reportPresentation';
import { useRef, useState, useSyncExternalStore } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { workspaceRepositories, useWorkspaceRecords, configurationHistory } from '../business-workspace/workspaceRepository';
import { businessSettings } from '../business-workspace/configurationState';
import { BusinessFrame } from '../business-workspace/MasterDataPages';
import { Panel, Field, SampleTable, Cell, fieldClass, buttonClass } from '../prototype/PrototypeUI';
import { downloadFile } from '../../lib/csv';
import { useSecurity } from '../security/securityClient';
import { hasPermission } from '../security/rbac';
import { businessDateKey, fiscalYearStart } from '../../lib/businessDate';
import { accountRepository } from '../accounting/data/accountRepository';
import { journalEntryRepository } from '../accounting/data/journalEntryRepository';
import { bankAccountRepository } from '../banking/data/bankAccountRepository';
import { salesRepository } from '../sales/data/salesRepository';
import { creditNoteRepository } from '../sales/data/creditNoteRepository';
import { supplierBillRepository } from '../purchases/data/supplierBillRepository';
import { supplierCreditRepository } from '../purchases/data/supplierCreditRepository';
import { customerRepository } from '../contacts/data/customerRepository';
import { reportPackSources } from './reportPackCommand';
import { parseReportSelection, reportPackTitles, reportSourceSignature, type ReportPackTitle, type PreparedReportPack } from './reportPackService';
import { renderReportPackHtml, reportPackFileName, reportPackCsv } from './reportPackOutput';
function useSourceChanges() {
    useSyncExternalStore(accountRepository.subscribe, accountRepository.getSnapshot, accountRepository.getSnapshot);
    useSyncExternalStore(journalEntryRepository.subscribe, journalEntryRepository.getSnapshot, journalEntryRepository.getSnapshot);
    useSyncExternalStore(bankAccountRepository.subscribe, bankAccountRepository.getSnapshot, bankAccountRepository.getSnapshot);
    useSyncExternalStore(salesRepository.subscribe, salesRepository.getSnapshot, salesRepository.getSnapshot);
    useSyncExternalStore(creditNoteRepository.subscribe, creditNoteRepository.getSnapshot, creditNoteRepository.getSnapshot);
    useSyncExternalStore(supplierBillRepository.subscribe, supplierBillRepository.getSnapshot, supplierBillRepository.getSnapshot);
    useSyncExternalStore(supplierCreditRepository.subscribe, supplierCreditRepository.getSnapshot, supplierCreditRepository.getSnapshot);
    useSyncExternalStore(customerRepository.subscribe, customerRepository.getSnapshot, customerRepository.getSnapshot);
    useWorkspaceRecords('settings');
}
export function ReportPacksPage({ mode, id }: {
    mode: 'list' | 'new' | 'edit' | 'detail';
    id?: string;
}) {
    const rows = useWorkspaceRecords('report-packs'), row = rows.find(r => r.id === id), repo = workspaceRepositories['report-packs'], navigate = useNavigate(), { session } = useSecurity();
    const canWrite = hasPermission(session && { userId: session.user.id, roles: session.user.roles, authenticated: true }, 'accounting.post');
    const today = businessDateKey(new Date().toISOString());
    const [expected] = useState(row?.revision), [query, setQuery] = useState(''), [error, setError] = useState(''), [pack, setPack] = useState<PreparedReportPack>(), [frameReady, setFrameReady] = useState(false);
    const [draft, setDraft] = useState(() => ({ name: row?.name ?? '', periodStart: row?.periodStart ?? fiscalYearStart(today), periodEnd: row?.periodEnd ?? today, cover: row?.cover ?? '', introduction: row?.introduction ?? '' }));
    const [selected, setSelected] = useState<ReportPackTitle[]>(() => { try {
        return row ? parseReportSelection(row.reports) : reportSettings().basis==='Cash'?['Cash flow']:['Profit & loss', 'Balance sheet', 'Trial balance', 'Cash flow'];
    }
    catch {
        return [];
    } });
    const frame = useRef<HTMLIFrameElement>(null);
    useSourceChanges();
    const signature = reportSourceSignature(reportPackSources()), stale = Boolean(pack && (pack.sourceSignature !== signature || row?.revision !== pack.configRevision || row?.status !== 'Active'));
    const editing = mode === 'new' || mode === 'edit';
    if (id && !row)
        return <BusinessFrame title="Report pack not found"><Link className={buttonClass} to="/reports/packs">Back to register</Link></BusinessFrame>;
    const move = (index: number, offset: number) => { const next = [...selected], other = index + offset; if (other < 0 || other >= next.length)
        return; [next[index], next[other]] = [next[other], next[index]]; setSelected(next); };
    const generate = () => { try {
        const result = repo.generate({ id: row!.id, expectedRevision: row!.revision });
        setPack(result);
        setFrameReady(false);
        setError('');
    }
    catch (e) {
        setError((e as Error).message);
    } };
    return <BusinessFrame title={mode === 'list' ? 'Management report packs' : editing ? `${mode === 'new' ? 'New' : 'Edit'} report pack` : row!.name} actions={<>{mode === 'list' && canWrite ? <Link className={buttonClass} to="/reports/packs/new">New report pack</Link> : <Link className={buttonClass} to="/reports/packs">Back to register</Link>}</>}>
        {error && <p role="alert" className="rounded-lg border border-red-300 p-3 text-sm text-red-700">{error}</p>}
        <p className="rounded-lg border bg-slate-50 p-3 text-sm">Saved periods and report order generate a combined local management pack from current books. Generate, review and export a copy when ready. Configurations persist; generated previews are retained by exporting them.</p>
        {mode === 'list' ? <Panel title="Report pack register"><input className={fieldClass} aria-label="Find report packs" value={query} onChange={e => setQuery(e.target.value)} placeholder="Name, period or report"/><DataTable data={rows.filter(r => `${r.name} ${r.periodStart} ${r.periodEnd} ${r.reports}`.toLowerCase().includes(query.toLowerCase()))} columns={[{accessorKey:'name',header:'Name',cell:({row})=><Link className="underline" to={`/reports/packs/${row.original.id}`}>{row.original.name}</Link>},{id:'period',accessorFn:r=>`${r.periodStart} → ${r.periodEnd}`,header:'Period'},{accessorKey:'reports',header:'Reports'},{accessorKey:'status',header:'Status'}]} pagination={{pageSize:50}} capabilities={{id:'report-packs',scope:'complete',permission:'accounting.read',rowId:r=>r.id,selectionActions:selected=><WorkspaceBulkAction domain="report-packs" rows={selected}/>}}/></Panel> : editing ? !canWrite ? <p role="alert">Your role may generate saved packs but cannot edit their configuration.</p> : <Panel title="Pack configuration"><form className="space-y-4" onSubmit={e => { e.preventDefault(); try {
            if (!selected.length)
                throw new Error('Select at least one report.');
            const saved = repo.save({ ...row, ...draft, status: row?.status ?? 'Active', reports: selected.join(', ') }, expected);
            navigate(`/reports/packs/${saved.id}`);
        }
        catch (e) {
            setError((e as Error).message);
        } }}>
            <Field label="Name"><input className={fieldClass} required maxLength={200} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })}/></Field>
            <div className="grid gap-4 md:grid-cols-2"><Field label="From"><input className={fieldClass} required type="date" value={draft.periodStart} onChange={e => setDraft({ ...draft, periodStart: e.target.value })}/></Field><Field label="To"><input className={fieldClass} required type="date" value={draft.periodEnd} onChange={e => setDraft({ ...draft, periodEnd: e.target.value })}/></Field><Field label="Cover heading"><input className={fieldClass} maxLength={200} value={draft.cover} onChange={e => setDraft({ ...draft, cover: e.target.value })}/></Field><Field label="Cover note"><textarea className={fieldClass} rows={3} maxLength={4000} value={draft.introduction} onChange={e => setDraft({ ...draft, introduction: e.target.value })}/></Field></div>
            <fieldset><legend className="mb-2 text-sm font-medium">Included reports</legend><div className="grid gap-3 md:grid-cols-3">{reportPackTitles.map(t => <label key={t} className="flex items-center gap-2"><input type="checkbox" checked={selected.includes(t)} onChange={e => setSelected(e.target.checked ? [...selected, t] : selected.filter(x => x !== t))}/>{t}</label>)}</div></fieldset>
            <ol className="space-y-2">{selected.map((t, index) => <li key={t} className="flex flex-wrap items-center gap-3"><span>{index + 1}. {t}</span><button className={buttonClass} type="button" disabled={!index} aria-label={`Move ${t} up`} onClick={() => move(index, -1)}>Move up</button><button className={buttonClass} type="button" disabled={index === selected.length - 1} aria-label={`Move ${t} down`} onClick={() => move(index, 1)}>Move down</button></li>)}</ol>
            <p className="text-sm">Balance sheet uses the To date. Other sections use the selected period. Cash flow uses configured bank accounts in {businessSettings().currency}; it remains a bank ledger working paper.</p><button className={buttonClass} disabled={!selected.length}>Save report pack</button></form></Panel> : <><Panel title="Saved configuration"><p>{row!.periodStart} → {row!.periodEnd} · {row!.status} · Revision {row!.revision}</p><p className="my-3">{row!.reports}</p><div className="flex flex-wrap gap-3"><button className={buttonClass} disabled={row!.status !== 'Active'} onClick={generate}>{pack ? 'Generate refreshed copy' : 'Generate report pack'}</button>{canWrite && <><Link className={buttonClass} to={`/reports/packs/${id}/edit`}>Edit configuration</Link><button className={buttonClass} onClick={() => { try {
            repo.setStatus(row!.id, row!.status === 'Active' ? 'Inactive' : 'Active', row!.revision);
            setError('');
        }
        catch (e) {
            setError((e as Error).message);
        } }}>{row!.status === 'Active' ? 'Deactivate' : 'Activate'}</button></>}</div></Panel>
            {pack && <Panel title={`${pack.cover} · generated copy`}><p className="text-sm">{pack.company.name} · {pack.company.currency} · {pack.from} → {pack.to}</p><p className="mt-2 text-xs">Generated {pack.generatedAt} · Actor {pack.generatedBy} · Configuration revision {pack.configRevision}</p>{stale && <p role="status" className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">Books or configuration changed after generation. This copy keeps its earlier values. Generate a refreshed copy to include current data.</p>}<div className="my-4 flex flex-wrap gap-3"><button className={buttonClass} onClick={() => downloadFile(reportPackFileName(pack, 'csv'), reportPackCsv(pack))}>Download pack CSV</button><button className={buttonClass} onClick={() => downloadFile(reportPackFileName(pack, 'html'), renderReportPackHtml(pack), 'text/html')}>Download printable HTML</button><button className={buttonClass} disabled={!frameReady} onClick={() => { try {
                if (!frame.current?.contentWindow)
                    throw new Error('Print preview is not ready.');
                frame.current.contentWindow.print();
            }
            catch (e) {
                setError((e as Error).message);
            } }}>Print / Save as PDF</button></div>
            <nav aria-label="Included report sources" className="mb-4 flex flex-wrap gap-4">{pack.sections.map(s => <Link key={s.title} className="underline" to={s.path}>{s.title} source report</Link>)}</nav>{pack.sections.flatMap(s => s.warnings.map(w => <p key={s.title + w} className="my-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">{s.title}: {w}</p>))}<iframe key={pack.id} ref={frame} onLoad={() => setFrameReady(true)} title="Printable management report pack" className="h-[760px] w-full rounded border bg-white" sandbox="allow-same-origin allow-modals" srcDoc={renderReportPackHtml(pack)}/><p className="mt-3 text-xs">Generation is recorded in the local security audit. Exported files keep this generated version; leaving this page discards the in-memory preview.</p></Panel>}
            <Panel title="Configuration history"><SampleTable headers={['Action', 'Actor', 'Time']} empty={!(configurationHistory['report-packs'] ?? []).some(r => r.recordId === id)}>{(configurationHistory['report-packs'] ?? []).filter(r => r.recordId === id).map(r => <tr key={r.id}><Cell>{r.name}</Cell><Cell>{r.actorId}</Cell><Cell>{r.createdAt}</Cell></tr>)}</SampleTable></Panel></>}
    </BusinessFrame>;
}
