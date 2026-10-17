import { creditNoteRepository } from '../sales/data/creditNoteRepository';
import { supplierCreditRepository } from '../purchases/data/supplierCreditRepository';
import { analysisEvents } from '../net-analysis/netAnalysisService';
import { salesAnalysisSources, purchaseAnalysisSources } from '../net-analysis/analysisSources';
import { useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { salesRepository } from '../sales/data/salesRepository';
import { supplierBillRepository } from '../purchases/data/supplierBillRepository';
import { bankTransactionRepository } from '../banking/data/bankTransactionRepository';
import { bankAccountRepository } from '../banking/data/bankAccountRepository';
import { customerRepository } from '../contacts/data/customerRepository';
import { Panel, SampleTable, Cell, fieldClass } from '../prototype/PrototypeUI';
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
    if (kind === 'sales-report' || kind === 'purchases-report') {
        const sources = kind === 'sales-report' ? salesAnalysisSources(salesRepository.getAll(), creditNoteRepository.getAll(), customerRepository.getAll()) : purchaseAnalysisSources(supplierBillRepository.getAll(), supplierCreditRepository.getAll());
        return analysisEvents(sources).map(d => ({ id: d.eventId, date: d.date, number: d.number, contact: d.partyName, status: d.event, net: d.subtotal, tax: d.tax, total: d.total, path: d.path }));
    }
    return bankTransactionRepository.getTransactions().map(d => ({ id: d.id, date: d.transactionDate, number: d.transactionNumber, contact: d.description, status: d.direction, net: d.direction === 'MONEY_IN' ? d.amount : -d.amount, tax: 0, total: d.direction === 'MONEY_IN' ? d.amount : -d.amount, path: `/banking/accounts/${d.bankAccountId}` }));
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
