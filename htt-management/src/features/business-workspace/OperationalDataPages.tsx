import { useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { salesRepository } from '../sales/data/salesRepository';
import { supplierBillRepository } from '../purchases/data/supplierBillRepository';
import { bankTransactionRepository } from '../banking/data/bankTransactionRepository';
import { bankAccountRepository } from '../banking/data/bankAccountRepository';
import { customerRepository } from '../contacts/data/customerRepository';
import { Panel, Field, SampleTable, Cell, fieldClass, buttonClass } from '../prototype/PrototypeUI';
import { csvText, downloadSample } from '../page-previews/previewModel';
import { BusinessFrame } from './MasterDataPages';
import { configurationRows } from './configurationState';
export type OperationalRow = {
    id: string;
    date: string;
    number: string;
    contact: string;
    status: string;
    net: number;
    tax: number;
    total: number;
    path: string;
};
export function filterOperationalRows(rows: OperationalRow[], from: string, to: string, query: string) { return rows.filter(r => (!from || r.date >= from) && (!to || r.date <= to) && `${r.number} ${r.contact} ${r.status}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.date.localeCompare(a.date) || a.number.localeCompare(b.number)); }
export function operationalRows(kind: string): OperationalRow[] {
    if (kind === 'sales-report')
        return salesRepository.getAll().filter(d => d.type === 'INVOICE' && !['VOID', 'DRAFT'].includes(d.status)).map(d => ({ id: d.id, date: d.documentDate, number: d.documentNumber, contact: customerRepository.getById(d.customerId)?.businessName ?? d.customerId, status: d.status, net: d.totals.subtotal, tax: d.totals.taxAmount, total: d.totals.total, path: `/sales/invoices/${d.id}` }));
    if (kind === 'purchases-report')
        return supplierBillRepository.getAll().filter(d => d.status !== 'VOID').map(d => ({ id: d.id, date: d.billDate, number: d.billNumber, contact: d.supplierName, status: d.status, net: d.totals.subtotal, tax: d.totals.taxAmount, total: d.totals.total, path: `/purchases/bills/${d.id}` }));
    return bankTransactionRepository.getTransactions().map(d => ({ id: d.id, date: d.transactionDate, number: d.transactionNumber, contact: d.description, status: d.direction, net: d.direction === 'MONEY_IN' ? d.amount : -d.amount, tax: 0, total: d.direction === 'MONEY_IN' ? d.amount : -d.amount, path: `/banking/accounts/${d.bankAccountId}` }));
}
export function ConnectedOperationalReport({ kind }: {
    kind: string;
}) {
    useSyncExternalStore(salesRepository.subscribe, salesRepository.getSnapshot, salesRepository.getSnapshot);
    useSyncExternalStore(supplierBillRepository.subscribe, supplierBillRepository.getSnapshot, supplierBillRepository.getSnapshot);
    useSyncExternalStore(bankTransactionRepository.subscribe, bankTransactionRepository.getTransactionsSnapshot, bankTransactionRepository.getTransactionsSnapshot);
    const [from, setFrom] = useState(''), [to, setTo] = useState(''), [query, setQuery] = useState('');
    const invalid = Boolean(from && to && from > to), rows = invalid ? [] : filterOperationalRows(operationalRows(kind), from, to, query), bank = kind === 'banking-report';
    const title = kind === 'sales-report' ? 'Sales invoice analysis' : kind === 'purchases-report' ? 'Supplier bill analysis' : 'Bank transaction analysis';
    return <BusinessFrame title={title}><p className="rounded-lg border bg-slate-50 p-3 text-sm">{bank ? 'Posted manual money-in / money-out transactions. Customer receipts, supplier payments, bank transfers and opening balances are reported in the existing bank account ledger. This is not a cash-flow statement.' : 'Document-date analysis of ' + (kind === 'sales-report' ? 'issued sales invoices' : 'non-void supplier bills') + '. Credit notes are separate documents and are excluded from these invoice totals. Use AR/AP and GL reports for reconciled balances.'}</p><Panel title="Filters"><div className="grid gap-4 md:grid-cols-3"><Field label="From"><input className={fieldClass} type="date" value={from} onChange={e => setFrom(e.target.value)}/></Field><Field label="To"><input className={fieldClass} type="date" value={to} onChange={e => setTo(e.target.value)}/></Field><Field label="Search"><input className={fieldClass} value={query} onChange={e => setQuery(e.target.value)}/></Field></div>{invalid && <p role="alert">End date must be on or after start date.</p>}<button className={buttonClass} disabled={invalid} onClick={() => downloadSample(`${kind}.csv`, csvText([['Date', 'Document', 'Contact / description', 'Status', 'Net', 'Tax', 'Total'], ...rows.map(r => [r.date, r.number, r.contact, r.status, String(r.net), String(r.tax), String(r.total)])]))}>Export filtered CSV</button></Panel><Panel title={`${rows.length} documents · total ${rows.reduce((sum, r) => sum + r.total, 0).toFixed(2)}`}><SampleTable headers={['Date', 'Document', 'Contact / description', 'Status', 'Net', ...(bank ? [] : ['Tax']), 'Total']} empty={!rows.length}>{rows.map(r => <tr key={r.id}><Cell>{r.date}</Cell><Cell><Link className="underline" to={r.path}>{r.number}</Link></Cell><Cell>{r.contact}</Cell><Cell>{r.status}</Cell><Cell>{r.net.toFixed(2)}</Cell>{!bank && <Cell>{r.tax.toFixed(2)}</Cell>}<Cell>{r.total.toFixed(2)}</Cell></tr>)}</SampleTable></Panel></BusinessFrame>;
}
export function matchBankRules(input: {
    description?: string;
    payee?: string;
    reference?: string;
}) {
    return (configurationRows['bank-rules'] ?? []).filter(r => r.status === 'Active' && r.enabled !== 'No').filter(r => { const source = (input[r.field.toLowerCase() as keyof typeof input] ?? '').toLowerCase(), value = r.value.toLowerCase(); return r.operator === 'Equals' ? source === value : r.operator === 'Starts with' ? source.startsWith(value) : source.includes(value); }).sort((a, b) => a.id.localeCompare(b.id));
}
export function ConnectedBankWorkbench() {
    useSyncExternalStore(bankTransactionRepository.subscribe, bankTransactionRepository.getTransactionsSnapshot, bankTransactionRepository.getTransactionsSnapshot);
    const [query, setQuery] = useState(''), rows = bankTransactionRepository.getTransactions().filter(r => `${r.description} ${r.reference ?? ''}`.toLowerCase().includes(query.toLowerCase()));
    return <BusinessFrame title="Bank rule review"><p className="rounded-lg border bg-slate-50 p-3 text-sm">Review saved rules against posted bank transactions. Matches are suggestions and do not rewrite posted journals. Bank statement import, splitting and automatic posting are not connected yet.</p><Panel title="Posted transactions"><input className={fieldClass} aria-label="Find bank transactions" placeholder="Description or reference" value={query} onChange={e => setQuery(e.target.value)}/><SampleTable headers={['Date', 'Bank', 'Description', 'Amount', 'Matching rules']} empty={!rows.length}>{rows.map(r => <tr key={r.id}><Cell>{r.transactionDate}</Cell><Cell><Link className="underline" to={`/banking/accounts/${r.bankAccountId}`}>{bankAccountRepository.getById(r.bankAccountId)?.name ?? r.bankAccountId}</Link></Cell><Cell>{r.description}</Cell><Cell>{r.amount.toFixed(2)}</Cell><Cell>{matchBankRules({ description: r.description, reference: r.reference }).map(rule => <Link key={rule.id} className="mr-2 underline" to={`/banking/rules/${rule.id}`}>{rule.name}</Link>)}</Cell></tr>)}</SampleTable></Panel></BusinessFrame>;
}
