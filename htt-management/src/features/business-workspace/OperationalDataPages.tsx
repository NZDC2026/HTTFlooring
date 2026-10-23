// Legacy operational query adapters retained for regression; the routed workbench is BankClosurePage.
import { creditNoteRepository } from '../sales/data/creditNoteRepository';
import { supplierCreditRepository } from '../purchases/data/supplierCreditRepository';
import { analysisEvents } from '../net-analysis/netAnalysisService';
import { salesAnalysisSources, purchaseAnalysisSources } from '../net-analysis/analysisSources';
import { salesRepository } from '../sales/data/salesRepository';
import { supplierBillRepository } from '../purchases/data/supplierBillRepository';
import { bankTransactionRepository } from '../banking/data/bankTransactionRepository';
import { customerRepository } from '../contacts/data/customerRepository';
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
