import { reportSettings } from '../report-settings/reportPresentation';
import { preferredReportCurrency } from '../report-settings/reportPresentation';
import { reportNumber } from '../report-settings/reportPresentation';
import { ReportContext } from '../report-settings/ReportContext';
import { useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { bankAccountRepository } from '../banking/data/bankAccountRepository';
import { journalEntryRepository } from '../accounting/data/journalEntryRepository';
import { BusinessFrame } from '../business-workspace/MasterDataPages';
import { businessSettings } from '../business-workspace/configurationState';
import { businessDateKey, fiscalYearStart } from '../../lib/businessDate';
import { Panel, Field, SampleTable, Cell, fieldClass, buttonClass } from '../prototype/PrototypeUI';
import { csvText, downloadSample } from '../page-previews/previewModel';
import { calculateCashReport } from './cashReportService';
export function CashReportsPage({ banking = false }: {
    banking?: boolean;
}) {
    const banks = useSyncExternalStore(bankAccountRepository.subscribe, bankAccountRepository.getSnapshot, bankAccountRepository.getSnapshot);
    const journals = useSyncExternalStore(journalEntryRepository.subscribe, journalEntryRepository.getSnapshot, journalEntryRepository.getSnapshot);
    const today = businessDateKey(new Date().toISOString());
    const [from, setFrom] = useState(fiscalYearStart(today)), [to, setTo] = useState(today);
    const currencies = [...new Set(banks.map(b => b.currency))].sort();
    const [currency, setCurrency] = useState(() => preferredReportCurrency(businessSettings().currency,currencies));
    const [bankId, setBankId] = useState(''), [page, setPage] = useState(0);
    let report: ReturnType<typeof calculateCashReport> | undefined, error = '';
    try {
        report = calculateCashReport({ bankAccounts: banks, journalEntries: journals, from, to, currency, bankIds: bankId ? [bankId] : undefined });
    }
    catch (e) {
        error = e instanceof Error ? e.message : 'Report could not be calculated.';
    }
    const count = report?.details.length ?? 0, lastPage = Math.max(0, Math.ceil(count / 50) - 1), currentPage = Math.min(page, lastPage);
    const money = (n: number) => `${currency} ${reportNumber(n)}`;
    const exportReport = () => {
        if (!report)
            return;
        const r = report;
        downloadSample(`${banking ? 'banking-summary' : 'cash-flow'}-${from}-${to}.csv`, csvText([
            ['Report header', reportSettings().header], ['Basis','Cash'], ['Bank ledger report', from, to, currency, bankId ? banks.find(b => b.id === bankId)!.name : 'All accounts in currency'],
            ['Opening', reportNumber(r.opening)], ['Net movement', reportNumber(r.net)], ['Closing', reportNumber(r.closing)], ['Reconciliation difference', reportNumber(r.difference)],
            ['Activity groups (internal selected-bank transfers netted per journal)'], ['Activity', 'Money in', 'Money out', 'Net'],
            ...r.groups.map(g => [g.category, reportNumber(g.moneyIn), reportNumber(g.moneyOut), reportNumber(g.net)]),
            ['Account balances (gross movements include transfers and setup adjustments)'], ['Account', 'Active', 'Opening', 'Money in', 'Money out', 'Closing', 'Difference'],
            ...r.accounts.map(a => [a.name, a.active ? 'Yes' : 'No', reportNumber(a.opening), reportNumber(a.moneyIn), reportNumber(a.moneyOut), reportNumber(a.closing), reportNumber(a.difference)]),
            ['Ledger detail (all pages, gross bank lines)'], ['Date', 'Account', 'Journal', 'Source', 'Activity', 'Description', 'Money in', 'Money out'],
            ...r.details.map(d => [d.date, d.bankName, d.journalNumber ?? 'Bank setup', d.sourceType, d.category, d.description, reportNumber(d.moneyIn), reportNumber(d.moneyOut)]),
            ['Review notes'], ...r.warnings.map(w => [w]),
            ['Bank ledger working paper. Opening adjustments are not cash receipts. No statutory activity classification is inferred.'],
        ]));
    };
    return <BusinessFrame title={banking ? 'Banking summary' : 'Cash flow · bank ledger'}><ReportContext basis="Cash" currency={currency}/>
        <p className="rounded-lg border bg-slate-50 p-3 text-sm">Dated bank ledger movements, including receipts, payments, refunds, statement categorisations, manual journals and reversals. Opening adjustments are shown separately. Activity groups follow document sources; other movements require review. This working paper covers configured bank accounts in the selected currency.</p>
        <Panel title="Report filters"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="From"><input className={fieldClass} type="date" required value={from} onChange={e => { setFrom(e.target.value); setPage(0); }}/></Field>
            <Field label="To"><input className={fieldClass} type="date" required value={to} onChange={e => { setTo(e.target.value); setPage(0); }}/></Field>
            <Field label="Currency"><select className={fieldClass} value={currency} onChange={e => { setCurrency(e.target.value); setBankId(''); setPage(0); }}>{[...new Set([...currencies, currency])].map(c => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Bank account"><select className={fieldClass} value={bankId} onChange={e => { setBankId(e.target.value); setPage(0); }}><option value="">All accounts in currency</option>{banks.filter(b => b.currency === currency).map(b => <option key={b.id} value={b.id}>{b.name}{b.active ? '' : ' (inactive)'}</option>)}</select></Field>
        </div><button className={buttonClass} disabled={!report} onClick={exportReport}>Export report CSV</button>{error && <p role="alert" className="mt-3 text-red-700">{error}</p>}</Panel>
        {report && <><Panel title={`${from} → ${to} · ${currency}`}><div className="grid gap-4 md:grid-cols-4">{[['Opening balance', report.opening], ['Net movement', report.net], ['Closing balance', report.closing], ['Reconciliation difference', report.difference]].map(([label, value]) => <div key={label}><p className="text-sm text-slate-500">{label}</p><p className="text-lg font-semibold">{money(Number(value))}</p></div>)}</div><p className="mt-3 text-sm">Opening + net movement = closing. All configured accounts, including inactive accounts, remain available. Bank setup balances are dated adjustments; no activity before an account opening date is included.</p>{report.warnings.map(w => <p key={w} className="mt-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">{w}</p>)}{!report.accounts.length && <p className="mt-3">No bank accounts match this selection.</p>}</Panel>
        {!banking && <Panel title="Cash movements by source"><SampleTable headers={['Activity', 'Money in', 'Money out', 'Net']}>{report.groups.map(g => <tr key={g.category}><Cell>{g.category}</Cell><Cell>{money(g.moneyIn)}</Cell><Cell>{money(g.moneyOut)}</Cell><Cell>{money(g.net)}</Cell></tr>)}</SampleTable><p className="mt-3 text-sm">Transfers between selected accounts are netted within each journal. Transfers across the selection remain visible. Opening adjustments and unclassified movements are included so balances reconcile. Operating, investing and financing classifications require accountant review.</p></Panel>}
        <Panel title="Account balances"><SampleTable headers={['Account', 'Opening', 'Money in', 'Money out', 'Closing', 'Difference']} empty={!report.accounts.length}>{report.accounts.map(a => <tr key={a.bankId}><Cell><Link className="underline" to={`/banking/accounts/${a.bankId}`}>{a.name}</Link>{!a.active && <p className="text-xs">Inactive</p>}</Cell><Cell>{money(a.opening)}</Cell><Cell>{money(a.moneyIn)}</Cell><Cell>{money(a.moneyOut)}</Cell><Cell>{money(a.closing)}</Cell><Cell>{money(a.difference)}</Cell></tr>)}</SampleTable><p className="mt-3 text-sm">Account movements are gross and include both sides of transfers and dated setup adjustments.</p></Panel>
        <Panel title={`Ledger detail · ${count} bank lines`}><SampleTable headers={['Date', 'Account', 'Journal / source', 'Activity / description', 'Money in', 'Money out']} empty={!count}>{report.details.slice(currentPage * 50, (currentPage + 1) * 50).map(d => <tr key={d.id}><Cell>{d.date}</Cell><Cell>{d.bankName}</Cell><Cell>{d.journalId ? <Link className="underline" to={`/accounting/journals/${d.journalId}`}>{d.journalNumber}</Link> : 'Bank setup'}<p className="text-xs">{d.sourceType}</p></Cell><Cell>{d.category}<p className="text-xs">{d.description}</p></Cell><Cell>{money(d.moneyIn)}</Cell><Cell>{money(d.moneyOut)}</Cell></tr>)}</SampleTable><div className="mt-3 flex items-center gap-3"><button className={buttonClass} disabled={!currentPage} onClick={() => setPage(currentPage - 1)}>Previous</button><span>Page {currentPage + 1} of {lastPage + 1}</span><button className={buttonClass} disabled={currentPage >= lastPage} onClick={() => setPage(currentPage + 1)}>Next</button></div><p className="mt-3 text-sm">Original and reversing entries remain on their own posting dates. CSV includes all detail pages.</p></Panel></>}
    </BusinessFrame>;
}
