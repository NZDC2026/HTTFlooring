import { useEffect, useState, useSyncExternalStore } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSecurity } from '../security/securityClient';
import { BusinessFrame } from '../business-workspace/MasterDataPages';
import { Panel, Field, SampleTable, Cell, fieldClass, buttonClass } from '../prototype/PrototypeUI';
import { customerRepository } from '../contacts/data/customerRepository';
import { supplierRepository } from '../contacts/data/supplierRepository';
import { productRepository } from '../business-workspace/productRepository';
import { salesRepository } from '../sales/data/salesRepository';
import { creditNoteRepository } from '../sales/data/creditNoteRepository';
import { purchaseOrderRepository } from '../purchases/data/purchaseOrderRepository';
import { supplierBillRepository } from '../purchases/data/supplierBillRepository';
import { supplierCreditRepository } from '../purchases/data/supplierCreditRepository';
import { journalEntryRepository } from '../accounting/data/journalEntryRepository';
import { searchBusinessRecords, availableRecordTypes } from './recordSearchService';
function useRecords<T>(repo: {
    subscribe: (listener: () => void) => () => void;
    getSnapshot: () => T;
}) { return useSyncExternalStore(repo.subscribe, repo.getSnapshot, repo.getSnapshot); }
export function RecordSearchPage() {
    const { session } = useSecurity(), principal = session && { userId: session.user.id, roles: session.user.roles, authenticated: true as const };
    const sources = { customers: useRecords(customerRepository), suppliers: useRecords(supplierRepository), products: useRecords(productRepository), sales: useRecords(salesRepository), customerCredits: useRecords(creditNoteRepository), purchaseOrders: useRecords(purchaseOrderRepository), bills: useRecords(supplierBillRepository), supplierCredits: useRecords(supplierCreditRepository), journals: useRecords(journalEntryRepository) };
    const [params, setParams] = useSearchParams(), query = params.get('q') ?? '', type = params.get('type') ?? 'All', status = params.get('status') ?? 'All', from = params.get('from') ?? '', to = params.get('to') ?? '';
    const [text, setText] = useState(query);
    useEffect(() => setText(query), [query]);
    const update = (key: string, value: string) => {
        const next = new URLSearchParams(params);
        if (value && !((key === 'type' || key === 'status') && value === 'All'))
            next.set(key, value);
        else
            next.delete(key);
        if (key !== 'page')
            next.delete('page');
        if (key === 'type')
            next.delete('status');
        setParams(next, { replace: true });
    };
    let result: ReturnType<typeof searchBusinessRecords> | undefined, error = '';
    try {
        result = searchBusinessRecords(sources, principal, { query, type, status, from, to, page: Number(params.get('page') ?? 1) });
    }
    catch (e) {
        error = (e as Error).message;
    }
    return <BusinessFrame title="Business record search"><p className="text-sm">Search current local records by number, name, reference or status. Only records permitted by your role are included. Dates filter dated transactions; contacts and products are excluded when a date is set.</p><Panel title="Find records"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><form className="flex items-end gap-2" onSubmit={e => { e.preventDefault(); update('q', text); }}><Field label="Search text"><input autoFocus className={fieldClass} maxLength={500} placeholder="Number, name or reference" value={text} onChange={e => setText(e.target.value)}/></Field><button className={buttonClass}>Search</button></form><Field label="Record type"><select className={fieldClass} value={type} onChange={e => update('type', e.target.value)}><option>All</option>{availableRecordTypes(principal).map(t => <option key={t}>{t}</option>)}</select></Field><Field label="Status"><select className={fieldClass} value={status} onChange={e => update('status', e.target.value)}><option>All</option>{[...new Set([...(result?.statuses ?? []), ...(status !== 'All' ? [status] : [])])].map(s => <option key={s}>{s}</option>)}</select></Field><Field label="From date"><input type="date" className={fieldClass} value={from} onChange={e => update('from', e.target.value)}/></Field><Field label="To date"><input type="date" className={fieldClass} value={to} onChange={e => update('to', e.target.value)}/></Field></div><button className={`${buttonClass} mt-4`} onClick={() => { setText(''); setParams({}, { replace: true }); }}>Clear search</button></Panel>{error ? <p role="alert" className="rounded-lg border border-red-300 p-3 text-red-700">{error}</p> : result && <Panel title={`${result.total} matching records`}><SampleTable dataset={{id:'record-search',scope:'all-filtered',permission:'inventory.read',rows:result.allRows.map(r=>({id:r.key,cells:[r.type,r.number,r.name,r.reference,r.status.replaceAll('_',' '),r.date||'—']}))}} headers={['Type', 'Number / code', 'Name', 'Reference', 'Status', 'Date']} empty={!result.rows.length}>{result.rows.map(r => <tr key={r.key}><Cell>{r.type}</Cell><Cell>{r.path ? <Link className="underline" to={r.path} state={{ recordSearch: '/search/records' + (params.size ? '?' + params.toString() : '') }}>{r.number}</Link> : <span title="Contact detail requires contact management permission">{r.number}</span>}</Cell><Cell>{r.name}</Cell><Cell>{r.reference}</Cell><Cell>{r.status.replaceAll('_', ' ')}</Cell><Cell>{r.date || '—'}</Cell></tr>)}</SampleTable><div className="mt-4 flex items-center gap-4"><button className={buttonClass} disabled={result.page <= 1} onClick={() => update('page', String(result!.page - 1))}>Previous</button><span>Page {result.page} of {result.pages}</span><button className={buttonClass} disabled={result.page >= result.pages} onClick={() => update('page', String(result!.page + 1))}>Next</button></div></Panel>}<p className="text-xs text-slate-500">Includes customers, suppliers, products, quotations, sales orders, invoices, credits, purchase orders, supplier bills and journals. Unposted managed entry drafts remain in their draft registers. Search filters stay in this page’s address for returning from a source record.</p></BusinessFrame>;
}
