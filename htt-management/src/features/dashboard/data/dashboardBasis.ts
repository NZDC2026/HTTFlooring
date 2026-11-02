import type { Account } from "../../accounting/types/account";
import type { JournalEntry } from "../../accounting/types/journalEntry";
import type { BankAccount } from "../../banking/types/bankAccount";
import type { SalesDocument } from "../../sales/types/salesDocument";
import type { SupplierBill } from "../../purchases/types/supplierBill";
import type { FinanceOverviewActivity } from "./financeOverview";
import type { MonthlyFinancialData, DashboardMetric } from "./mockDashboard";
import { calculateInvoiceBalanceAsAt } from "../../sales/data/invoiceBalanceAsAtService";
import { calculateSupplierBillBalanceAsAt } from "../../purchases/data/supplierBillBalanceAsAtService";
import { calculateBankRegister } from "../../banking/data/bankRegisterService";

export type DashboardBasis = "cash" | "accrual";
export interface DashboardBasisInput extends FinanceOverviewActivity {
    accounts: Account[]; journals: JournalEntry[]; banks: BankAccount[];
    documents: SalesDocument[]; bills: SupplierBill[];
    date: string; basis: DashboardBasis; includeGst: boolean; currency: string;
}
const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const netRatio = (totals: { subtotal: number; total: number }) => totals.total ? totals.subtotal / totals.total : 1;

export function calculateDashboardBasis(input: DashboardBasisInput) {
    const { accounts, journals, banks, documents, bills, date, basis, includeGst, currency } = input;
    const configured = new Set(banks.map(bank => bank.glAccountId));
    const otherCash = new Set(accounts.filter(account => !configured.has(account.id) && (account.systemRole === "BANK" || account.type === "ASSET" && /bank|cash/i.test(account.name))).map(account => account.id));
    const cashMovements = new Map<string, number>();
    const add = (id: string, value: number) => cashMovements.set(id, (cashMovements.get(id) ?? 0) + value);
    for (const bank of banks) {
        if (bank.openingBalanceDate > date) continue;
        for (const row of calculateBankRegister(bank, journals, date).transactions) {
            if (!row.correctionOnly) add(row.journalEntryId, row.moneyIn - row.moneyOut);
        }
    }
    for (const journal of journals.filter(journal => journal.journalDate <= date)) {
        for (const line of journal.lines.filter(line => otherCash.has(line.accountId))) add(journal.id, line.debit - line.credit);
    }
    const cash = journals.filter(journal => !["OPENING_BALANCE", "BANK_TRANSFER"].includes(journal.sourceType)).map(journal => {
        let value = cashMovements.get(journal.id) ?? 0;
        if (!includeGst && Math.abs(value) > 0.000001) {
            const payment = input.payments.find(payment => payment.id === journal.sourceId && ["CUSTOMER_PAYMENT", "CUSTOMER_PAYMENT_REVERSAL"].includes(journal.sourceType));
            const invoice = payment && documents.find(document => document.type === "INVOICE" && document.id === payment.invoiceId);
            const supplierPayment = input.supplierPayments.find(payment => payment.id === journal.sourceId && ["SUPPLIER_PAYMENT", "SUPPLIER_PAYMENT_REVERSAL"].includes(journal.sourceType));
            if (invoice) value *= netRatio(invoice.totals);
            else if (supplierPayment && supplierPayment.amount) {
                const gst = supplierPayment.allocations.reduce((sum, allocation) => {
                    const bill = bills.find(bill => bill.id === allocation.supplierBillId);
                    return sum + (bill ? allocation.amount * (1 - netRatio(bill.totals)) : 0);
                }, 0);
                value *= 1 - gst / supplierPayment.amount;
            } else {
                const taxIds = new Set(accounts.filter(account => ["GST_PAYABLE", "GST_RECEIVABLE"].includes(account.systemRole ?? "")).map(account => account.id));
                value += journal.lines.filter(line => taxIds.has(line.accountId)).reduce((sum, line) => sum + line.debit - line.credit, 0);
            }
        }
        return { date: journal.journalDate, amount: round(value) };
    });
    function totals(from: string, to: string, asOf: string) {
        if (basis === "cash") {
            const rows = cash.filter(row => row.date >= from && row.date <= asOf);
            return { revenue: round(rows.reduce((sum, row) => sum + Math.max(row.amount, 0), 0)), expenses: round(rows.reduce((sum, row) => sum + Math.max(-row.amount, 0), 0)) };
        }
        const revenue = documents.filter(document => document.type === "INVOICE" && document.documentDate >= from && document.documentDate <= to).reduce((sum, document) => {
            if (document.type !== "INVOICE") return sum;
            const balance = calculateInvoiceBalanceAsAt(document, input.payments, input.creditAllocations, asOf);
            return sum + Math.max(0, balance.amountDue) * (includeGst ? 1 : netRatio(document.totals));
        }, 0);
        const expenses = bills.filter(bill => bill.dueDate >= from && bill.dueDate <= to && !(bill.status === "VOID" && !bill.voidedAt)).reduce((sum, bill) => {
            const balance = calculateSupplierBillBalanceAsAt(bill, input.supplierPayments, input.supplierCreditAllocations, asOf);
            return sum + Math.max(0, balance.amountDue) * (includeGst ? 1 : netRatio(bill.totals));
        }, 0);
        return { revenue: round(revenue), expenses: round(expenses) };
    }
    const year = Number(date.slice(0, 4)), month = Number(date.slice(5, 7));
    function period(y: number, m: number, day?: number) {
        const from = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
        const last = new Date(Date.UTC(y, m + 1, 0));
        const to = last.toISOString().slice(0, 10);
        const asOf = day ? new Date(Date.UTC(y, m, Math.min(day, last.getUTCDate()))).toISOString().slice(0, 10) : to;
        return totals(from, to, asOf);
    }
    const chart: MonthlyFinancialData[] = Array.from({ length: 6 }, (_, index) => {
        const d = new Date(Date.UTC(year, month - 6 + index, 1));
        const day = index === 5 ? Number(date.slice(8, 10)) : undefined;
        const current = period(d.getUTCFullYear(), d.getUTCMonth(), day);
        const prior = period(d.getUTCFullYear() - 1, d.getUTCMonth(), day);
        return { month: d.toLocaleString("en", { month: "short", timeZone: "UTC" }), ...current, lastYearRevenue: prior.revenue, lastYearExpenses: prior.expenses };
    });
    const current = chart[5], previous = chart[4];
    const money = (n: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency }).format(n);
    const change = (n: number, prior: number) => prior ? round((n - prior) / Math.abs(prior) * 100) : 0;
    const tax = includeGst ? "Incl. GST" : "Excl. GST";
    const metrics: DashboardMetric[] = [
        { label: basis === "cash" ? "Cash received" : "Accounts receivable", value: money(current.revenue), change: change(current.revenue, previous.revenue), description: `${tax} · ${basis === "cash" ? "By receipt date" : "Unpaid invoice balances by invoice date"}` },
        { label: basis === "cash" ? "Cash paid" : "Accounts payable", value: money(current.expenses), change: change(current.expenses, previous.expenses), description: `${tax} · ${basis === "cash" ? "By payment date" : "Unpaid bills due in selected month"}` },
        { label: basis === "cash" ? "Net cash flow" : "Net receivables / payables", value: money(round(current.revenue - current.expenses)), change: change(current.revenue - current.expenses, previous.revenue - previous.expenses), description: basis === "cash" ? "Cash received less cash paid" : "Selected-period receivables less payables" },
    ];
    return { metrics, chart };
}
