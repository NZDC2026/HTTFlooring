import { reportNumber, legacyReportPresentation, type ReportPresentation } from '../report-settings/reportPresentation';
import type {BrandLogo} from '../branding/brandingState';
import { z } from 'zod';
import { requireDateKey } from '../../lib/businessDate';
import { analysisEvents } from '../net-analysis/netAnalysisService';
import { salesAnalysisSources, purchaseAnalysisSources } from '../net-analysis/analysisSources';
import { calculateCashReport } from '../cash-reports/cashReportService';
import { reportSourceSignature, type ReportPackSources } from '../report-packs/reportPackService';
import { csvText } from '../page-previews/previewModel';
export const savedDatasets = ['Sales', 'Purchases', 'Banking', 'General ledger'] as const;
export type SavedDataset = typeof savedDatasets[number];
export type ReportColumn = {
    key: string;
    label: string;
    numeric?: boolean;
};
const column = (key: string, label: string, numeric = false): ReportColumn => ({ key, label, numeric });
const documentColumns = [column('date', 'Date'), column('number', 'Document'), column('contact', 'Contact'), column('partyId', 'Contact ID'), column('activity', 'Activity'), column('status', 'Current status'), column('net', 'Net', true), column('tax', 'Tax', true), column('gross', 'Gross', true)];
export const savedColumns: Record<SavedDataset, ReportColumn[]> = { Sales: documentColumns, Purchases: documentColumns, Banking: [column('date', 'Date'), column('bank', 'Bank'), column('journal', 'Journal'), column('description', 'Description'), column('source', 'Source'), column('category', 'Activity'), column('moneyIn', 'Money in', true), column('moneyOut', 'Money out', true), column('net', 'Net', true)], 'General ledger': [column('date', 'Date'), column('journal', 'Journal'), column('accountCode', 'Account code'), column('account', 'Account'), column('description', 'Description'), column('source', 'Source'), column('status', 'Current status'), column('debit', 'Debit', true), column('credit', 'Credit', true)] };
export const defaultSavedColumns: Record<SavedDataset, string[]> = { Sales: ['Date', 'Document', 'Contact', 'Activity', 'Net', 'Tax', 'Gross'], Purchases: ['Date', 'Document', 'Contact', 'Activity', 'Net', 'Tax', 'Gross'], Banking: ['Date', 'Bank', 'Journal', 'Money in', 'Money out', 'Net'], 'General ledger': ['Date', 'Journal', 'Account code', 'Account', 'Debit', 'Credit'] };
export const savedBasis = (dataset: SavedDataset) => dataset === 'Banking' ? 'Cash' : 'Accrual';
const filtersSchema = z.object({ from: z.string(), to: z.string(), query: z.string().max(500).default(''), partyId: z.string().max(200).optional(), bankId: z.string().max(200).optional(), accountId: z.string().max(200).optional(), currency: z.string().min(1).max(10).optional() }).strict();
export type SavedReportFilters = z.infer<typeof filtersSchema>;
export function parseSavedReportConfiguration(config: {
    dataset: string;
    columns: string;
    basis: string;
    filter?: string;
    favourite?: string;
}) {
    const dataset = z.enum(savedDatasets).parse(config.dataset);
    if (config.basis !== savedBasis(dataset))
        throw new Error(`${dataset} uses ${savedBasis(dataset)} basis. Cash-basis sales/purchase recognition is not available.`);
    if (config.favourite !== undefined && !['Yes', 'No'].includes(config.favourite))
        throw new Error('Favourite must be Yes or No.');
    let raw: unknown;
    try {
        raw = JSON.parse(config.filter ?? '');
    }
    catch {
        throw new Error('Legacy filter text is not executable. Edit and save explicit report dates and filters.');
    }
    const filters = filtersSchema.parse(raw);
    requireDateKey(filters.from, 'From date');
    requireDateKey(filters.to, 'To date');
    if (filters.from > filters.to)
        throw new Error('From date must not exceed To date.');
    if (dataset !== 'Sales' && dataset !== 'Purchases' && filters.partyId)
        throw new Error('Contact filters require Sales or Purchases.');
    if (dataset !== 'Banking' && (filters.bankId || filters.currency))
        throw new Error('Bank and currency filters require Banking.');
    if (dataset !== 'General ledger' && filters.accountId)
        throw new Error('Account filters require General ledger.');
    const names = config.columns.split(',').map(s => s.trim());
    const aliases: Record<string, string> = dataset === 'Sales' || dataset === 'Purchases' ? { customer: 'contact', supplier: 'contact', gst: 'tax', total: 'gross' } : {};
    const columns = names.map(n => savedColumns[dataset].find(c => c.label.toLowerCase() === n.toLowerCase() || c.key.toLowerCase() === (aliases[n.toLowerCase()] ?? n.toLowerCase())));
    if (!names.length || names.length > savedColumns[dataset].length || columns.some(c => !c) || new Set(columns.map(c => c?.key)).size !== columns.length)
        throw new Error(`Select distinct supported columns for ${dataset}: ${savedColumns[dataset].map(c => c.label).join(', ')}.`);
    return { dataset, filters, columns: columns as ReportColumn[] };
}
export type SavedReportResult = {
    id: string;
    configId: string;
    configRevision: string;
    name: string;
    dataset: SavedDataset;
    basis: string;
    filters: SavedReportFilters;
    currency: string;
    company: string;
    presentation?:ReportPresentation;
    logo?:BrandLogo;
    generatedAt: string;
    generatedBy: string;
    sourceSignature: string;
    columns: ReportColumn[];
    rows: {
        id: string;
        cells: (string | number)[];
        path: string;
    }[];
    totals: {
        label: string;
        value: number;
    }[];
    notes: string[];
};
type DataRow = {
    id: string;
    path: string;
    values: Record<string, string | number>;
};
const sum = (rows: DataRow[], key: string) => rows.reduce((s, r) => { const n = Number(r.values[key]), next = s + Math.round(n * 100); if (!Number.isFinite(n) || !Number.isSafeInteger(next))
    throw new Error('Report monetary total exceeds supported cents precision.'); return next; }, 0) / 100;
export function buildSavedReport(config: {
    id: string;
    revision: string;
    name: string;
    dataset: string;
    columns: string;
    basis: string;
    filter?: string;
    favourite?: string;
}, sources: ReportPackSources, context: {
    id: string;
    generatedAt: string;
    generatedBy: string;
}): SavedReportResult {
    const { dataset, filters, columns } = parseSavedReportConfiguration(config), query = filters.query.trim().toLowerCase();
    let rows: DataRow[] = [], totals: SavedReportResult['totals'] = [], notes: string[] = [], currency = sources.company.currency;
    if (dataset === 'Sales' || dataset === 'Purchases') {
        const docs = dataset === 'Sales' ? salesAnalysisSources(sources.documents, sources.customerCredits, sources.customers) : purchaseAnalysisSources(sources.bills, sources.supplierCredits);
        if (filters.partyId && !docs.some(d => d.partyId === filters.partyId) && !(dataset === 'Sales' && sources.customers.some(c => c.id === filters.partyId)))
            throw new Error('Selected contact is not available in this dataset.');
        const labels = { DOCUMENT: 'Original document', CREDIT: 'Credit note', VOID: 'Void reversal' };
        rows = analysisEvents(docs).filter(e => e.date >= filters.from && e.date <= filters.to && (!filters.partyId || e.partyId === filters.partyId)).map(e => ({ id: e.eventId, path: e.path, values: { date: e.date, number: e.number, contact: e.partyName, partyId: e.partyId, activity: labels[e.event], status: e.status.replaceAll('_', ' '), net: e.subtotal, tax: e.tax, gross: e.total } }));
        notes = ['Accrual document activity using saved totals, credits and dated void reversals. Drafts, quotes/orders, opening documents, settlements and manual GL adjustments are excluded.', 'Current status is shown for source context; it does not remove historical original or reversal events.'];
    }
    else if (dataset === 'Banking') {
        currency = filters.currency ?? sources.company.currency;
        const r = calculateCashReport({ bankAccounts: sources.banks, journalEntries: sources.journals, from: filters.from, to: filters.to, currency, bankIds: filters.bankId ? [filters.bankId] : undefined });
        rows = r.details.map(e => ({ id: e.id, path: e.journalId ? `/accounting/journals/${e.journalId}` : `/banking/accounts/${e.bankId}`, values: { date: e.date, bank: e.bankName, journal: e.journalNumber ?? 'Bank setup', description: e.description, source: e.sourceType, category: e.category, moneyIn: e.moneyIn, moneyOut: e.moneyOut, net: (Math.round(e.moneyIn * 100) - Math.round(e.moneyOut * 100)) / 100 } }));
        notes = ['Gross bank ledger lines, including dated reversals and opening adjustments. Internal transfer lines remain visible; their net cancels across selected accounts.', 'Totals below describe filtered lines, not an opening-to-closing cash reconciliation. Use Cash flow or Banking summary for reconciled balances.', ...r.warnings];
    }
    else {
        if (filters.accountId && !sources.accounts.some(a => a.id === filters.accountId))
            throw new Error('Selected GL account is not available.');
        rows = sources.journals.filter(j => j.journalDate >= filters.from && j.journalDate <= filters.to).flatMap(j => j.lines.filter(l => !filters.accountId || l.accountId === filters.accountId).map(l => ({ id: `${j.id}:${l.id}`, path: `/accounting/journals/${j.id}`, values: { date: j.journalDate, journal: j.journalNumber, accountCode: l.accountCode, account: l.accountName, description: [j.description, l.description, j.reference].filter(Boolean).join(' · '), source: j.sourceType, status: j.status, debit: l.debit, credit: l.credit } })));
        notes = ['Accrual GL lines on their posting dates, including reversed originals and dated reversing entries.', 'Filtered debit/credit totals may differ when an account or text filter selects only part of a journal.'];
    }
    rows = rows.filter(r => Object.values(r.values).join(' ').toLowerCase().includes(query)).sort((a, b) => String(a.values.date).localeCompare(String(b.values.date)) || a.id.localeCompare(b.id));
    totals = (dataset === 'Sales' || dataset === 'Purchases' ? [['Net', 'net'], ['Tax', 'tax'], ['Gross', 'gross']] : dataset === 'Banking' ? [['Money in', 'moneyIn'], ['Money out', 'moneyOut'], ['Net movement', 'net']] : [['Debit', 'debit'], ['Credit', 'credit']]).map(([label, key]) => ({ label, value: sum(rows, key) }));
    return structuredClone({ ...context, configId: config.id, configRevision: config.revision, name: config.name, dataset, basis: config.basis, filters, currency, company: sources.company.name, ...(sources.company.presentation?{presentation:sources.company.presentation}:{}), ...(sources.company.logo?{logo:sources.company.logo}:{}), sourceSignature: reportSourceSignature(sources), columns, rows: rows.map(r => ({ id: r.id, path: r.path, cells: columns.map(c => r.values[c.key]) })), totals, notes });
}
export function savedReportCsv(report: SavedReportResult): string { return numericSafeCsv([['Saved report', report.name], ['Company', report.company], ...(report.presentation?[['Report header',report.presentation.header],['Amount decimals',String(report.presentation.precision)]]:[]), ['Dataset', report.dataset], ['Basis', report.basis], ['Currency', report.currency], ['From', report.filters.from], ['To', report.filters.to], ['Query', report.filters.query], ['Contact ID', report.filters.partyId ?? ''], ['Bank ID', report.filters.bankId ?? ''], ['GL account ID', report.filters.accountId ?? ''], ['Generated', report.generatedAt], ['Actor', report.generatedBy], ['Configuration', report.configId, report.configRevision], ['Version', report.id], ...report.notes.map(n => ['Basis note', n]), [], report.columns.map(c => c.label), ...report.rows.map(r => r.cells.map((v, i) => report.columns[i].numeric ? Number(v) : String(v))), [], ['Filtered totals'], ...report.totals.map(t => [t.label, t.value])],report.presentation??legacyReportPresentation); }
function numericSafeCsv(rows: (string | number)[][],presentation:ReportPresentation): string { return rows.map(row => row.map(cell => { if (typeof cell === 'string')
    return csvText([[cell]]); if (!Number.isFinite(cell))
    throw new Error('Cannot export an invalid report amount.'); return `"${reportNumber(cell,presentation)}"`; }).join(',')).join('\r\n'); }
