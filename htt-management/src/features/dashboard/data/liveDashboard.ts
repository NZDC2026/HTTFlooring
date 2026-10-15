import type { Account } from "../../accounting/types/account";
import type { JournalEntry } from "../../accounting/types/journalEntry";
import type { BankAccount } from "../../banking/types/bankAccount";
import { calculateBankRegister } from "../../banking/data/bankRegisterService";
import { calculateProfitAndLoss } from "../../accounting/data/profitAndLossService";
import type { DashboardMetric, MonthlyFinancialData } from "./mockDashboard";

const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function buildLiveDashboard(accounts: Account[], journals: JournalEntry[], today: string, bankAccounts: BankAccount[] = []) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(today) || Number.isNaN(Date.parse(`${today}T00:00:00Z`))) {
        throw new Error("Dashboard date must be a valid YYYY-MM-DD date.");
    }
    const start = `${today.slice(0, 7)}-01`;
    const year = Number(today.slice(0, 4));
    const month = Number(today.slice(5, 7));
    const periods = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(Date.UTC(year, month - 6 + i, 1));
        const from = date.toISOString().slice(0, 10);
        const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).toISOString().slice(0, 10);
        const to = end > today ? today : end;
        const pnl = calculateProfitAndLoss(accounts, journals, from, to);
        return { month: date.toLocaleString("en-NZ", { month: "short", timeZone: "UTC" }), revenue: pnl.totalRevenue, expenses: pnl.totalExpenses, profit: pnl.netProfit };
    });
    const current = calculateProfitAndLoss(accounts, journals, start, today);
    const configuredGlIds = new Set(bankAccounts.map(account => account.glAccountId));
    const otherCashIds = new Set(accounts.filter(account => !configuredGlIds.has(account.id) && (account.systemRole === "BANK" || (account.type === "ASSET" && /bank|cash/i.test(account.name)))).map(account => account.id));
    const configuredCash = bankAccounts.reduce((sum, bank) => {
        if (bank.openingBalanceDate > today) return sum;
        return sum + calculateBankRegister(bank, journals, today).closingBalance;
    }, 0);
    const otherCash = journals.filter(j => j.journalDate <= today).flatMap(j => j.lines).filter(line => otherCashIds.has(line.accountId)).reduce((sum, line) => sum + line.debit - line.credit, 0);
    const cash = round(configuredCash + otherCash);
    const fmt = (n: number) => new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" }).format(n);
    const previous = periods[4];
    const change = (value: number, prior: number) => prior === 0 ? 0 : Math.round(((value - prior) / Math.abs(prior)) * 1000) / 10;
    const metrics: DashboardMetric[] = [
        { label: "Revenue", value: fmt(current.totalRevenue), change: change(current.totalRevenue, previous.revenue), description: "Compared with last month" },
        { label: "Expenses", value: fmt(current.totalExpenses), change: change(current.totalExpenses, previous.expenses), description: "Compared with last month" },
        { label: "Net Profit", value: fmt(current.netProfit), change: change(current.netProfit, previous.profit), description: "Compared with last month" },
        { label: "Cash Balance", value: fmt(cash), change: 0, description: "Bank register balances including configured opening balances" },
    ];
    const chart: MonthlyFinancialData[] = periods.map(({ month, revenue, expenses }) => ({ month, revenue, expenses }));
    return { metrics, chart };
}
