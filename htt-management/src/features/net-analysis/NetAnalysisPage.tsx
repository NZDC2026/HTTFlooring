import { reportSettings } from '../report-settings/reportPresentation';
import { reportNumber } from '../report-settings/reportPresentation';
import { ReportContext } from '../report-settings/ReportContext';
import { useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { salesRepository } from '../sales/data/salesRepository';
import { creditNoteRepository } from '../sales/data/creditNoteRepository';
import { supplierBillRepository } from '../purchases/data/supplierBillRepository';
import { supplierCreditRepository } from '../purchases/data/supplierCreditRepository';
import { customerRepository } from '../contacts/data/customerRepository';
import { BusinessFrame } from '../business-workspace/MasterDataPages';
import { businessSettings } from '../business-workspace/configurationState';
import { businessDateKey, fiscalYearStart } from '../../lib/businessDate';
import { Panel, Field, SampleTable, Cell, fieldClass, buttonClass } from '../prototype/PrototypeUI';
import { csvText, downloadFile } from '../../lib/csv';
import { calculateNetAnalysis, type AnalysisEvent } from './netAnalysisService';
import { salesAnalysisSources, purchaseAnalysisSources } from './analysisSources';
const labels = { DOCUMENT: 'Original document', CREDIT: 'Credit note', VOID: 'Void reversal' };
export function NetAnalysisPage({ purchases = false }: {
    purchases?: boolean;
}) {
    const sales = useSyncExternalStore(salesRepository.subscribe, salesRepository.getSnapshot, salesRepository.getSnapshot);
    const customerCredits = useSyncExternalStore(creditNoteRepository.subscribe, creditNoteRepository.getSnapshot, creditNoteRepository.getSnapshot);
    const bills = useSyncExternalStore(supplierBillRepository.subscribe, supplierBillRepository.getSnapshot, supplierBillRepository.getSnapshot);
    const supplierCredits = useSyncExternalStore(supplierCreditRepository.subscribe, supplierCreditRepository.getSnapshot, supplierCreditRepository.getSnapshot);
    const customers = useSyncExternalStore(customerRepository.subscribe, customerRepository.getSnapshot, customerRepository.getSnapshot);
    const today = businessDateKey(new Date().toISOString()), currency = businessSettings().currency;
    const [from, setFrom] = useState(fiscalYearStart(today)), [to, setTo] = useState(today), [partyId, setPartyId] = useState(''), [query, setQuery] = useState(''), [event, setEvent] = useState<AnalysisEvent['event'] | 'ALL'>('ALL'), [page, setPage] = useState(0);
    const sources = purchases ? purchaseAnalysisSources(bills, supplierCredits) : salesAnalysisSources(sales, customerCredits, customers);
    const contacts = [...new Map(sources.map(d => [d.partyId, d.partyName])).entries()].sort((a, b) => a[1].localeCompare(b[1]) || a[0].localeCompare(b[0]));
    let report: ReturnType<typeof calculateNetAnalysis> | undefined, error = '';
    try {
        report = calculateNetAnalysis(sources, { from, to, partyId, query, event });
    }
    catch (e) {
        error = e instanceof Error ? e.message : 'Report could not be calculated.';
    }
    const current = Math.min(page, Math.max(0, Math.ceil((report?.events.length ?? 0) / 50) - 1)), last = Math.max(0, Math.ceil((report?.events.length ?? 0) / 50) - 1);
    const money = (n: number) => `${currency} ${reportNumber(n)}`;
    const exportReport = () => {
        if (!report)
            return;
        downloadFile(`${purchases ? 'net-purchases' : 'net-sales'}-${from}-${to}.csv`, csvText([
            ['Report header',reportSettings().header], ['Basis','Accrual'], [purchases ? 'Net purchase documents' : 'Net sales documents', from, to, currency], ['Contact ID', partyId || 'All'], ['Search', query], ['Activity', event],
            ['Filtered totals', reportNumber(report.totals.subtotal), reportNumber(report.totals.tax), reportNumber(report.totals.total)],
            ['Activity', 'Count', 'Before tax', 'Tax', 'Gross'], ...report.movements.map(m => [labels[m.type], String(m.count), reportNumber(m.subtotal), reportNumber(m.tax), reportNumber(m.total)]),
            ['Contact summary'], ['Contact ID', 'Contact', 'Source documents', 'Events', 'Before tax', 'Tax', 'Gross'], ...report.parties.map(p => [p.id, p.name, String(p.documents), String(p.events), reportNumber(p.subtotal), reportNumber(p.tax), reportNumber(p.total)]),
            ['All filtered detail pages'], ['Date', 'Activity', 'Document type', 'Document', 'Contact ID', 'Contact', 'Current source status', 'Before tax', 'Tax', 'Gross'], ...report.events.map(e => [e.date, labels[e.event], e.kind, e.number, e.partyId, e.partyName, e.status, reportNumber(e.subtotal), reportNumber(e.tax), reportNumber(e.total)]),
            ['Accrual document activity; original saved totals, dated credits and void reversals. Opening balances, cash settlements and non-document GL journals are excluded. Void timestamps follow the business timezone.'],
        ]));
    };
    return <BusinessFrame title={purchases ? 'Net purchase document analysis' : 'Net sales document analysis'}><ReportContext basis="Accrual"/>
        <p className="rounded-lg border bg-slate-50 p-3 text-sm">Original {purchases ? 'supplier bills' : 'issued sales invoices'} less credits, plus dated void corrections. Saved net, tax and gross amounts are retained; payment and credit allocation status do not change document activity. Opening balances and drafts are excluded. This is document activity, rather than {purchases ? 'recognized expenses' : 'profit'}, cash flow or AR/AP outstanding.</p>
        <Panel title="Report filters"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="From"><input className={fieldClass} type="date" required value={from} onChange={e => { setFrom(e.target.value); setPage(0); }}/></Field>
            <Field label="To"><input className={fieldClass} type="date" required value={to} onChange={e => { setTo(e.target.value); setPage(0); }}/></Field>
            <Field label={purchases ? 'Supplier' : 'Customer'}><select className={fieldClass} value={partyId} onChange={e => { setPartyId(e.target.value); setPage(0); }}><option value="">All contacts</option>{contacts.map(([id, name]) => <option key={id} value={id}>{name} · {id}</option>)}</select></Field>
            <Field label="Activity"><select className={fieldClass} value={event} onChange={e => { setEvent(e.target.value as typeof event); setPage(0); }}><option value="ALL">All activity</option>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field>
            <Field label="Search documents or contacts"><input className={fieldClass} value={query} onChange={e => { setQuery(e.target.value); setPage(0); }}/></Field>
        </div><button className={buttonClass} disabled={!report} onClick={exportReport}>Export filtered CSV</button>{error && <p role="alert" className="mt-3 text-red-700">{error}</p>}</Panel>
        {report && <><Panel title={`Filtered totals · ${from} → ${to}`}><div className="grid gap-4 md:grid-cols-3">{[['Before tax', report.totals.subtotal], ['Tax', report.totals.tax], ['Gross', report.totals.total]].map(([label, n]) => <div key={label}><p className="text-sm text-slate-500">{label}</p><p className="text-lg font-semibold">{money(Number(n))}</p></div>)}</div>{event !== 'ALL' && <p className="mt-3 text-sm">Only {labels[event].toLowerCase()} activity is selected. Choose All activity for the full net result.</p>}<SampleTable headers={['Activity', 'Events', 'Before tax', 'Tax', 'Gross']}>{report.movements.map(m => <tr key={m.type}><Cell>{labels[m.type]}</Cell><Cell>{m.count}</Cell><Cell>{money(m.subtotal)}</Cell><Cell>{money(m.tax)}</Cell><Cell>{money(m.total)}</Cell></tr>)}</SampleTable></Panel>
        <Panel title={purchases ? 'Supplier summary' : 'Customer summary'}><SampleTable headers={['Contact', 'Documents', 'Events', 'Before tax', 'Tax', 'Gross']} empty={!report.parties.length}>{report.parties.map(p => <tr key={p.id}><Cell>{p.name}<p className="text-xs">{p.id}</p></Cell><Cell>{p.documents}</Cell><Cell>{p.events}</Cell><Cell>{money(p.subtotal)}</Cell><Cell>{money(p.tax)}</Cell><Cell>{money(p.total)}</Cell></tr>)}</SampleTable><p className="mt-3 text-sm">Contacts group by ID. Sales names use the current customer register; supplier names retain document snapshots. Detail rows retain each source document and its current status.</p></Panel>
        <Panel title={`Document activity · ${report.events.length} events`}><SampleTable headers={['Activity date', 'Activity', 'Source document', 'Contact', 'Before tax', 'Tax', 'Gross']} empty={!report.events.length}>{report.events.slice(current * 50, (current + 1) * 50).map(e => <tr key={e.eventId}><Cell>{e.date}</Cell><Cell>{labels[e.event]}</Cell><Cell><Link className="underline" to={e.path}>{e.number}</Link><p className="text-xs">{e.kind} · Current: {e.status}</p></Cell><Cell>{e.partyName}</Cell><Cell>{money(e.subtotal)}</Cell><Cell>{money(e.tax)}</Cell><Cell>{money(e.total)}</Cell></tr>)}</SampleTable><div className="mt-3 flex items-center gap-3"><button className={buttonClass} disabled={!current} onClick={() => setPage(current - 1)}>Previous</button><span>Page {current + 1} of {last + 1}</span><button className={buttonClass} disabled={current >= last} onClick={() => setPage(current + 1)}>Next</button></div><p className="mt-3 text-sm">A void retains the original event and adds its opposite on the void date. Voiding a credit restores its amount as a positive event. All filtered pages are exported. Business timezone: {businessSettings().timezone}.</p></Panel></>}
    </BusinessFrame>;
}
