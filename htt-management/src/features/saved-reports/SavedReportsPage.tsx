import { reportSettings, reportNumber, legacyReportPresentation, preferredReportCurrency } from '../report-settings/reportPresentation';
import {savedReportHtml} from './savedReportHtml';
import {BrandImage} from '../branding/BrandingPanel';
import { useRef, useState, useSyncExternalStore } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { workspaceRepositories, useWorkspaceRecords, configurationHistory } from '../business-workspace/workspaceRepository';
import { businessSettings } from '../business-workspace/configurationState';
import { BusinessFrame } from '../business-workspace/MasterDataPages';
import { Panel, Field, SampleTable, Cell, fieldClass, buttonClass } from '../prototype/PrototypeUI';
import { downloadSample } from '../page-previews/previewModel';
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
import { reportPackSources } from '../report-packs/reportPackCommand';
import { reportSourceSignature } from '../report-packs/reportPackService';
import { savedDatasets, savedColumns, defaultSavedColumns, savedBasis, parseSavedReportConfiguration, savedReportCsv, type SavedDataset, type SavedReportFilters, type SavedReportResult } from './savedReportService';
function useSourceChanges() { useSyncExternalStore(accountRepository.subscribe, accountRepository.getSnapshot, accountRepository.getSnapshot); useSyncExternalStore(journalEntryRepository.subscribe, journalEntryRepository.getSnapshot, journalEntryRepository.getSnapshot); useSyncExternalStore(bankAccountRepository.subscribe, bankAccountRepository.getSnapshot, bankAccountRepository.getSnapshot); useSyncExternalStore(salesRepository.subscribe, salesRepository.getSnapshot, salesRepository.getSnapshot); useSyncExternalStore(creditNoteRepository.subscribe, creditNoteRepository.getSnapshot, creditNoteRepository.getSnapshot); useSyncExternalStore(supplierBillRepository.subscribe, supplierBillRepository.getSnapshot, supplierBillRepository.getSnapshot); useSyncExternalStore(supplierCreditRepository.subscribe, supplierCreditRepository.getSnapshot, supplierCreditRepository.getSnapshot); useSyncExternalStore(customerRepository.subscribe, customerRepository.getSnapshot, customerRepository.getSnapshot); useWorkspaceRecords('settings'); }
export function SavedReportsPage({ mode, id }: {
    mode: 'list' | 'new' | 'edit' | 'detail';
    id?: string;
}) {
    const records = useWorkspaceRecords('custom-reports'), row = records.find(r => r.id === id), repo = workspaceRepositories['custom-reports'], navigate = useNavigate(), { session } = useSecurity();
    const canWrite = hasPermission(session && { userId: session.user.id, roles: session.user.roles, authenticated: true }, 'accounting.post');
    useSourceChanges();
    const sources = reportPackSources(), today = businessDateKey(new Date().toISOString()), baseCurrency = businessSettings().currency;
    let parsed: ReturnType<typeof parseSavedReportConfiguration> | undefined, legacy = '';
    if (row) {
        try {
            parsed = parseSavedReportConfiguration({ dataset: row.dataset, columns: row.columns, basis: row.basis, filter: row.filter, favourite: row.favourite });
        }
        catch (e) {
            legacy = (e as Error).message;
        }
    }
    const [expected] = useState(row?.revision), [name, setName] = useState(row?.name ?? ''), [dataset, setDataset] = useState<SavedDataset>(parsed?.dataset ?? (savedDatasets.includes(row?.dataset as SavedDataset) ? row!.dataset as SavedDataset : reportSettings().basis==='Cash'?'Banking':'Sales'));
    const [columns, setColumns] = useState<string[]>(parsed?.columns.map(c => c.label) ?? defaultSavedColumns[dataset]);
    const [filters, setFilters] = useState<SavedReportFilters>(parsed?.filters ?? { from: fiscalYearStart(today), to: today, query: '', ...(dataset==='Banking'?{currency:preferredReportCurrency(baseCurrency,sources.banks.map(b=>b.currency))}:{}) });
    const [favourite, setFavourite] = useState(row?.favourite ?? 'No'), [error, setError] = useState(''), [query, setQuery] = useState(''), [onlyFavourite, setOnlyFavourite] = useState(false), [result, setResult] = useState<SavedReportResult>(), [page, setPage] = useState(0);
    const printFrame=useRef<HTMLIFrameElement>(null),[printReady,setPrintReady]=useState(false);const resultHeading = useRef<HTMLDivElement>(null), editing = mode === 'new' || mode === 'edit';
    if (id && !row)
        return <BusinessFrame title="Saved report not found"><Link className={buttonClass} to="/reports/saved">Back to register</Link></BusinessFrame>;
    const contacts = dataset === 'Sales' ? sources.customers.map(c => [c.id, c.businessName]) : [...new Map([...sources.bills, ...sources.supplierCredits].map(c => [c.supplierId, c.supplierName])).entries()];
    const stale = Boolean(result && (result.sourceSignature !== reportSourceSignature(sources) || result.configRevision !== row?.revision || row?.status !== 'Active'));
    const move = (index: number, offset: number) => { const next = [...columns], other = index + offset; if (other < 0 || other >= next.length)
        return; [next[index], next[other]] = [next[other], next[index]]; setColumns(next); };
    const run = () => { try {
        const report = repo.run({ id: row!.id, expectedRevision: row!.revision });
        setPrintReady(false);setResult(report);
        setPage(0);
        setError('');
    }
    catch (e) {
        setError((e as Error).message);
    } };
    const mutate = (action: 'status' | 'favourite') => { try {
        if (action === 'status')
            repo.setStatus(row!.id, row!.status === 'Active' ? 'Inactive' : 'Active', row!.revision);
        else
            repo.save({ ...row!, favourite: row!.favourite === 'Yes' ? 'No' : 'Yes' }, row!.revision);
        setError('');
    }
    catch (e) {
        setError((e as Error).message);
    } };
    const visible = records.filter(r => (!onlyFavourite || r.favourite === 'Yes') && `${r.name} ${r.dataset} ${r.status}`.toLowerCase().includes(query.toLowerCase()));
    const last = Math.max(0, Math.ceil((result?.rows.length ?? 0) / 50) - 1), current = Math.min(page, last);
    return <BusinessFrame title={mode === 'list' ? 'Saved & favourite reports' : editing ? `${mode === 'new' ? 'New' : 'Edit'} saved report` : row!.name} actions={mode === 'list' && canWrite ? <Link className={buttonClass} to="/reports/saved/new">New saved report</Link> : <Link className={buttonClass} to="/reports/saved">Back to register</Link>}>
        {error && <p role="alert" className="rounded-lg border border-red-300 p-3 text-sm text-red-700">{error}</p>}
        <p className="rounded-lg border bg-slate-50 p-3 text-sm">Save explicit dates, filters and ordered columns, then run against current local books. Favourites are shared business configurations. Saved definitions persist; export a result to retain that run.</p>
        {mode === 'list' ? <Panel title="Saved report register"><div className="mb-4 flex flex-wrap items-center gap-4"><input className={fieldClass} aria-label="Find saved reports" placeholder="Name, dataset or status" value={query} onChange={e => setQuery(e.target.value)}/><label className="flex items-center gap-2"><input type="checkbox" checked={onlyFavourite} onChange={e => setOnlyFavourite(e.target.checked)}/>Favourites only</label></div><SampleTable headers={['Name', 'Dataset', 'Basis', 'Favourite', 'Status']} empty={!visible.length}>{visible.map(r => <tr key={r.id}><Cell><Link className="underline" to={`/reports/saved/${r.id}`}>{r.name}</Link></Cell><Cell>{r.dataset}</Cell><Cell>{r.basis}</Cell><Cell>{r.favourite ?? 'No'}</Cell><Cell>{r.status}</Cell></tr>)}</SampleTable></Panel> : editing ? !canWrite ? <p role="alert">Your role may run saved reports but cannot edit definitions.</p> : <Panel title="Saved report definition"><form className="space-y-4" onSubmit={e => { e.preventDefault(); try {
            const saved = repo.save({ ...row, name, dataset, columns: columns.join(', '), basis: savedBasis(dataset), favourite, status: row?.status ?? 'Active', filter: JSON.stringify(filters) }, expected);
            navigate(`/reports/saved/${saved.id}`);
        }
        catch (e) {
            setError((e as Error).message);
        } }}>
            {legacy && <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">This older definition needs explicit filters and supported columns. Review the defaults below before saving. {legacy}</p>}
            <Field label="Name"><input className={fieldClass} required maxLength={200} value={name} onChange={e => setName(e.target.value)}/></Field><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Dataset"><select className={fieldClass} value={dataset} onChange={e => { const d = e.target.value as SavedDataset; setDataset(d); setColumns(defaultSavedColumns[d]); setFilters({ from: filters.from, to: filters.to, query: filters.query, ...(d === 'Banking' ? { currency: preferredReportCurrency(baseCurrency,sources.banks.map(b=>b.currency)) } : {}) }); }}>{savedDatasets.map(d => <option key={d}>{d}</option>)}</select></Field>
            <Field label="Basis"><input className={fieldClass} readOnly value={savedBasis(dataset)}/></Field><Field label="Favourite"><select className={fieldClass} value={favourite} onChange={e => setFavourite(e.target.value)}><option>No</option><option>Yes</option></select></Field>
            <Field label="From"><input className={fieldClass} required type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })}/></Field><Field label="To"><input className={fieldClass} required type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })}/></Field><Field label="Text search"><input className={fieldClass} maxLength={500} value={filters.query} onChange={e => setFilters({ ...filters, query: e.target.value })}/></Field>
            {(dataset === 'Sales' || dataset === 'Purchases') && <Field label={dataset === 'Sales' ? 'Customer' : 'Supplier'}><select className={fieldClass} value={filters.partyId ?? ''} onChange={e => setFilters({ ...filters, partyId: e.target.value || undefined })}><option value="">All contacts</option>{contacts.map(([id, name]) => <option key={id} value={id}>{name} · {id}</option>)}</select></Field>}
            {dataset === 'Banking' && <><Field label="Currency"><select className={fieldClass} value={filters.currency ?? baseCurrency} onChange={e => setFilters({ ...filters, currency: e.target.value, bankId: undefined })}>{[...new Set([baseCurrency, ...sources.banks.map(b => b.currency)])].map(c => <option key={c}>{c}</option>)}</select></Field><Field label="Bank account"><select className={fieldClass} value={filters.bankId ?? ''} onChange={e => setFilters({ ...filters, bankId: e.target.value || undefined })}><option value="">All banks in currency</option>{sources.banks.filter(b => b.currency === (filters.currency ?? baseCurrency)).map(b => <option key={b.id} value={b.id}>{b.name}{b.active ? '' : ' (inactive)'}</option>)}</select></Field></>}
            {dataset === 'General ledger' && <Field label="GL account"><select className={fieldClass} value={filters.accountId ?? ''} onChange={e => setFilters({ ...filters, accountId: e.target.value || undefined })}><option value="">All accounts</option>{sources.accounts.map(a => <option key={a.id} value={a.id}>{a.code} · {a.name}{a.active ? '' : ' (inactive)'}</option>)}</select></Field>}
            </div><fieldset><legend className="mb-2 font-medium">Columns</legend><div className="grid gap-3 md:grid-cols-3">{savedColumns[dataset].map(c => <label key={c.key} className="flex items-center gap-2"><input type="checkbox" checked={columns.includes(c.label)} onChange={e => setColumns(e.target.checked ? [...columns, c.label] : columns.filter(x => x !== c.label))}/>{c.label}</label>)}</div></fieldset><ol className="space-y-2">{columns.map((c, i) => <li key={c} className="flex flex-wrap items-center gap-3"><span>{i + 1}. {c}</span><button className={buttonClass} type="button" disabled={!i} aria-label={`Move ${c} up`} onClick={() => move(i, -1)}>Move up</button><button className={buttonClass} type="button" disabled={i === columns.length - 1} aria-label={`Move ${c} down`} onClick={() => move(i, 1)}>Move down</button></li>)}</ol><button className={buttonClass} disabled={!columns.length}>Save report definition</button></form></Panel> : <>
            <Panel title="Saved definition"><p>{row!.dataset} · {row!.basis} · {row!.status} · Revision {row!.revision} · Favourite: {row!.favourite ?? 'No'}</p><p className="my-2">Columns: {row!.columns}</p>{parsed && <p className="mb-3 text-sm">{parsed.filters.from} → {parsed.filters.to} · Search: {parsed.filters.query || 'All text'}{parsed.filters.partyId ? ` · Contact ${parsed.filters.partyId}` : ''}{parsed.filters.bankId ? ` · Bank ${parsed.filters.bankId}` : ''}{parsed.filters.accountId ? ` · Account ${parsed.filters.accountId}` : ''}{parsed.filters.currency ? ` · ${parsed.filters.currency}` : ''}</p>}{legacy && <p role="alert" className="my-3 text-sm text-amber-800">{legacy}</p>}<div className="flex flex-wrap gap-3"><button className={buttonClass} disabled={row!.status !== 'Active' || !!legacy} onClick={run}>{result ? 'Run refreshed result' : 'Run saved report'}</button>{canWrite && <><Link className={buttonClass} to={`/reports/saved/${id}/edit`}>Edit definition</Link><button className={buttonClass} onClick={() => mutate('favourite')}>{row!.favourite === 'Yes' ? 'Remove favourite' : 'Mark as favourite'}</button><button className={buttonClass} onClick={() => mutate('status')}>{row!.status === 'Active' ? 'Deactivate' : 'Activate'}</button></>}</div></Panel>
            {result && <div ref={resultHeading}><Panel title={`${result.name} · result`}><BrandImage logo={result.logo}/>{result.presentation?.header&&<p className="whitespace-pre-wrap break-words font-semibold">{result.presentation.header}</p>}<p>{result.company} · {result.currency} · {result.dataset} · {result.basis}</p><p className="mt-2 text-sm">{result.filters.from} → {result.filters.to} · Generated {result.generatedAt} · {result.rows.length} rows</p>{stale && <p role="status" className="my-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">Books or definition changed after this run. This result retains its earlier values. Run refreshed result to include current data.</p>}<div className="my-4 flex flex-wrap gap-4">{result.totals.map(t => <p key={t.label}><span className="text-sm text-slate-500">{t.label}</span><br /><strong>{result.currency} {reportNumber(t.value,result.presentation??legacyReportPresentation)}</strong></p>)}</div>{result.notes.map(n => <p key={n} className="my-2 text-sm">{n}</p>)}<button className={buttonClass} onClick={() => downloadSample(`saved-report-${result.configId}-${result.filters.from}-${result.filters.to}.csv`, savedReportCsv(result))}>Export result CSV</button><button className={buttonClass} onClick={()=>downloadSample(`saved-report-${result.id}.html`,savedReportHtml(result),'text/html')}>Download branded report HTML</button><button className={buttonClass} disabled={!printReady} onClick={()=>{const details=printFrame.current?.closest('details');if(details)details.open=true;requestAnimationFrame(()=>printFrame.current?.contentWindow?.print());}}>Print / Save report PDF</button><details><summary>Printable report preview</summary><iframe key={result.id} ref={printFrame} onLoad={()=>setPrintReady(true)} title="Printable saved report" className="h-[600px] w-full border bg-white" sandbox="allow-same-origin allow-modals" srcDoc={savedReportHtml(result)}/></details><SampleTable headers={[...result.columns.map(c => c.label), 'Source']} empty={!result.rows.length}>{result.rows.slice(current * 50, (current + 1) * 50).map(r => <tr key={r.id}>{r.cells.map((v, i) => <Cell key={result.columns[i].key}>{result.columns[i].numeric ? reportNumber(Number(v),result.presentation??legacyReportPresentation) : v}</Cell>)}<Cell><Link className="underline" to={r.path}>Open source</Link></Cell></tr>)}</SampleTable><div className="mt-3 flex items-center gap-3"><button className={buttonClass} disabled={!current} onClick={() => setPage(current - 1)}>Previous</button><span>Page {current + 1} of {last + 1}</span><button className={buttonClass} disabled={current >= last} onClick={() => setPage(current + 1)}>Next</button></div><p className="mt-3 text-xs">Text search covers supported source fields, including hidden columns. Monetary totals describe the full filtered dataset even when amount columns are hidden. CSV exports every result page. Leaving this page discards the preview; definitions and run audit persist.</p></Panel></div>}
            <Panel title="Definition history"><SampleTable headers={['Action', 'Actor', 'Time']} empty={!(configurationHistory['custom-reports'] ?? []).some(r => r.recordId === id)}>{(configurationHistory['custom-reports'] ?? []).filter(r => r.recordId === id).map(r => <tr key={r.id}><Cell>{r.name}</Cell><Cell>{r.actorId}</Cell><Cell>{r.createdAt}</Cell></tr>)}</SampleTable></Panel></>}
    </BusinessFrame>;
}
