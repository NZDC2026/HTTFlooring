import type { ReportPresentation } from '../report-settings/reportPresentation';
import type {BrandLogo} from '../branding/brandingState';
import { requireDateKey } from '../../lib/businessDate';
import { calculateProfitAndLoss } from '../accounting/data/profitAndLossService';
import { calculateBalanceSheet } from '../accounting/data/balanceSheetService';
import { calculateTrialBalance } from '../accounting/data/trialBalanceService';
import { calculateCashReport } from '../cash-reports/cashReportService';
import { calculateNetAnalysis } from '../net-analysis/netAnalysisService';
import { salesAnalysisSources, purchaseAnalysisSources } from '../net-analysis/analysisSources';
import type { Account } from '../accounting/types/account';
import type { JournalEntry } from '../accounting/types/journalEntry';
import type { BankAccount } from '../banking/types/bankAccount';
import type { SalesDocument } from '../sales/types/salesDocument';
import type { CreditNote } from '../sales/types/creditNote';
import type { SupplierBill } from '../purchases/types/supplierBill';
import type { SupplierCredit } from '../purchases/types/supplierCredit';
export const reportPackTitles = ['Profit & loss', 'Balance sheet', 'Trial balance', 'Cash flow', 'Net sales', 'Net purchases'] as const;
export type ReportPackTitle = typeof reportPackTitles[number];
export function parseReportSelection(value: string): ReportPackTitle[] {
    const names = value.split(',').map(v => v.trim());
    if (!names.length || names.length > reportPackTitles.length || names.some(v => !v))
        throw new Error('Select one to six supported reports.');
    const keys = names.map(n => reportPackTitles.find(t => t.toLowerCase() === n.toLowerCase()));
    if (keys.some(k => !k))
        throw new Error(`Supported reports: ${reportPackTitles.join(', ')}.`);
    if (new Set(keys).size !== keys.length)
        throw new Error('Each report may appear only once in a pack.');
    return keys as ReportPackTitle[];
}
export type ReportPackSources = {
    accounts: Account[];
    journals: JournalEntry[];
    banks: BankAccount[];
    documents: SalesDocument[];
    customerCredits: CreditNote[];
    customers: {
        id: string;
        businessName: string;
    }[];
    bills: SupplierBill[];
    supplierCredits: SupplierCredit[];
    company: {
        presentation?:ReportPresentation;
        logo?:BrandLogo;
        name: string;
        currency: string;
        timezone: string;
    };
};
export type ReportPackSection = {
    title: ReportPackTitle;
    description: string;
    path: string;
    columns: string[];
    rows: (string | number)[][];
    totals: {
        label: string;
        value: number;
    }[];
    warnings: string[];
};
export type PreparedReportPack = {
    id: string;
    configId: string;
    configRevision: string;
    name: string;
    cover: string;
    introduction: string;
    from: string;
    to: string;
    company: ReportPackSources['company'];
    generatedAt: string;
    generatedBy: string;
    sourceSignature: string;
    sections: ReportPackSection[];
};
export const reportSourceSignature = (sources: ReportPackSources) => JSON.stringify(sources);
export function buildReportPack(config: {
    id: string;
    revision: string;
    name: string;
    cover?: string;
    introduction?: string;
    periodStart: string;
    periodEnd: string;
    reports: string;
}, sources: ReportPackSources, context: {
    id: string;
    generatedAt: string;
    generatedBy: string;
}): PreparedReportPack {
    requireDateKey(config.periodStart, 'From date');
    requireDateKey(config.periodEnd, 'To date');
    if (config.periodStart > config.periodEnd)
        throw new Error('From date must not exceed To date.');
    const selected = parseReportSelection(config.reports), from = config.periodStart, to = config.periodEnd;
    const sections: ReportPackSection[] = selected.map(title => {
        if (title === 'Profit & loss') {
            const r = calculateProfitAndLoss(sources.accounts, sources.journals, from, to);
            return { title, description: `Accrual general ledger activity from ${from} to ${to}.`, path: '/accounting/profit-and-loss', columns: ['Group', 'Code', 'Account', 'Amount'], rows: [...r.revenue.map(a => ['Revenue', a.accountCode, a.accountName, a.amount]), ...r.expenses.map(a => ['Expense', a.accountCode, a.accountName, a.amount])], totals: [{ label: 'Revenue', value: r.totalRevenue }, { label: 'Expenses', value: r.totalExpenses }, { label: 'Net profit', value: r.netProfit }], warnings: [] };
        }
        if (title === 'Balance sheet') {
            const r = calculateBalanceSheet(sources.accounts, sources.journals, to);
            return { title, description: `Accrual general ledger balances as at ${to}, including current earnings.`, path: '/accounting/balance-sheet', columns: ['Group', 'Code', 'Account', 'Amount'], rows: [...r.assets.map(a => ['Asset', a.accountCode, a.accountName, a.amount]), ...r.liabilities.map(a => ['Liability', a.accountCode, a.accountName, a.amount]), ...r.equity.map(a => ['Equity', a.accountCode, a.accountName, a.amount]), ['Equity', '', 'Current earnings', r.currentEarnings]], totals: [{ label: 'Assets', value: r.totalAssets }, { label: 'Liabilities and equity', value: r.totalLiabilitiesAndEquity }, { label: 'Difference', value: r.difference }], warnings: r.balanced ? [] : ['Balance sheet is not balanced. Review the general ledger before using this pack.'] };
        }
        if (title === 'Trial balance') {
            const r = calculateTrialBalance(sources.accounts, sources.journals, from, to);
            return { title, description: `Accrual opening balances and period movements from ${from} to ${to}.`, path: '/accounting/trial-balance', columns: ['Code', 'Account', 'Opening Dr', 'Opening Cr', 'Period Dr', 'Period Cr', 'Closing Dr', 'Closing Cr'], rows: r.rows.map(a => [a.accountCode, a.accountName, a.openingDebit, a.openingCredit, a.periodDebit, a.periodCredit, a.closingDebit, a.closingCredit]), totals: [{ label: 'Opening debit', value: r.totalOpeningDebit }, { label: 'Opening credit', value: r.totalOpeningCredit }, { label: 'Period debit', value: r.totalPeriodDebit }, { label: 'Period credit', value: r.totalPeriodCredit }, { label: 'Closing debit', value: r.totalClosingDebit }, { label: 'Closing credit', value: r.totalClosingCredit }, { label: 'Difference', value: r.difference }], warnings: r.balanced ? [] : ['Trial balance has a difference. Review the general ledger before using this pack.'] };
        }
        if (title === 'Cash flow') {
            const r = calculateCashReport({ bankAccounts: sources.banks, journalEntries: sources.journals, from, to, currency: sources.company.currency });
            const foreign = [...new Set(sources.banks.filter(b => b.currency !== sources.company.currency).map(b => b.currency))];
            return { title, description: `Cash basis · bank ledger working paper in ${sources.company.currency}. Selected-bank transfers are netted per journal. Opening adjustments are included separately. Operating/investing/financing classification requires accountant review.`, path: '/reports/cash-flow', columns: ['Activity', 'Money in', 'Money out', 'Net'], rows: r.groups.map(g => [g.category, g.moneyIn, g.moneyOut, g.net]), totals: [{ label: 'Opening', value: r.opening }, { label: 'Net movement', value: r.net }, { label: 'Closing', value: r.closing }, { label: 'Reconciliation difference', value: r.difference }], warnings: [...r.warnings, ...(foreign.length ? [`Other bank currencies excluded (no FX conversion): ${foreign.join(', ')}.`] : []), ...(r.difference !== 0 ? ['Bank cash movement does not reconcile.'] : [])] };
        }
        const purchasing = title === 'Net purchases', sourcesForReport = purchasing ? purchaseAnalysisSources(sources.bills, sources.supplierCredits) : salesAnalysisSources(sources.documents, sources.customerCredits, sources.customers), r = calculateNetAnalysis(sourcesForReport, { from, to });
        return { title, description: 'Accrual document activity: original invoices/bills less credits and dated void corrections. Opening balances, settlements and manual GL adjustments are excluded. This is not profit, recognized inventory expense or outstanding AR/AP.', path: purchasing ? '/reports/purchase-analysis' : '/reports/sales-analysis', columns: ['Contact ID', 'Contact', 'Before tax', 'Tax', 'Gross'], rows: r.parties.map(p => [p.id, p.name, p.subtotal, p.tax, p.total]), totals: [{ label: 'Before tax', value: r.totals.subtotal }, { label: 'Tax', value: r.totals.tax }, { label: 'Gross', value: r.totals.total }], warnings: [] };
    });
    return structuredClone({ ...context, configId: config.id, configRevision: config.revision, name: config.name, cover: config.cover || config.name, introduction: config.introduction ?? '', from, to, company: sources.company, sourceSignature: reportSourceSignature(sources), sections });
}
