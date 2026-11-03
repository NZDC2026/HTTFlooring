import { TaxPayrollCards } from "../components/TaxPayrollCards";
import { useDashboardBasis } from "../data/useDashboardBasis";
import type { DashboardBasis } from "../data/dashboardBasis";
import {presentationWorkflows} from '../../security/optionalWorkflows';
import {businessSettings} from '../../business-workspace/configurationState';
import { useState } from "react";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { BankReconciliationCard } from "../components/BankReconciliationCard";
import { InventoryHealthCard } from "../components/InventoryHealthCard";
import { QuickAccessCard } from "../components/QuickAccessCard";
import { MetricCard } from "../components/MetricCard";
import { PayablesCard } from "../components/PayablesCard";
import { ReceivablesCard } from "../components/ReceivablesCard";
import { RevenueChart } from "../components/RevenueChart";
import { TasksCard } from "../components/TasksCard";
import { useAccounts, useJournalEntries } from "../../accounting/data/useAccounting";
import { buildLiveDashboard } from "../data/liveDashboard";
import { useBankAccounts } from "../../banking/data/useBanking";
import { useMemo } from "react";

export function DashboardPage() {
    const [basis, setBasis] = useState<DashboardBasis>("accrual");
    const [includeGst, setIncludeGst] = useState(true);
    const [chartMonths, setChartMonths] = useState<1 | 3 | 6>(6);
    const accounts = useAccounts();
    const journals = useJournalEntries();
    const bankAccounts = useBankAccounts();
    const today = new Date().toLocaleDateString("en-CA", { timeZone: businessSettings().timezone, year: "numeric", month: "2-digit", day: "2-digit" });
    const currentMonth = today.slice(0, 7);
    const [reportingPeriod, setReportingPeriod] = useState(currentMonth);
    const [reportYear, reportMonth] = reportingPeriod.split("-").map(Number);
    const reportingDate = reportingPeriod === currentMonth
        ? today
        : new Date(Date.UTC(reportYear, reportMonth, 0)).toISOString().slice(0, 10);
    const dashboard = useMemo(() => buildLiveDashboard(accounts, journals, reportingDate, bankAccounts), [accounts, journals, reportingDate, bankAccounts]);
    const basisDashboard = useDashboardBasis({ accounts, journals, banks: bankAccounts, date: reportingDate, basis, includeGst, currency: businessSettings().currency });
    return <div className="pb-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">Business overview · {reportingPeriod}</p>
                <h1 className="font-display text-[clamp(26px,3vw,34px)] leading-tight">Welcome back, {businessSettings().companyName}</h1>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Your business performance, priorities and next steps in one place.</p>
            </div>
            <div className="flex flex-wrap gap-2">
                {presentationWorkflows.customerDemo && <Link to="/demo"><Button variant="accent">Customer demo <ArrowRight size={16}/></Button></Link>}
            </div>
        </div>
        <QuickAccessCard compact/>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-xs">
            <div role="group" aria-label="Reporting period" className="flex flex-wrap items-center gap-2 font-medium">
                <CalendarDays size={15} aria-hidden="true"/>
                <span>Reporting period:</span>
                <select
                    aria-label="Reporting month"
                    value={reportingPeriod.slice(5, 7)}
                    onChange={(event) => setReportingPeriod(`${reportYear}-${event.target.value}`)}
                    className="h-9 rounded-lg border border-[var(--color-border)] bg-white px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                    {Array.from({ length: 12 }, (_, index) => {
                        const month = String(index + 1).padStart(2, "0");
                        return <option key={month} value={month} disabled={`${reportYear}-${month}` > currentMonth}>{new Date(Date.UTC(2026, index, 1)).toLocaleString("en", { month: "long", timeZone: "UTC" })}</option>;
                    })}
                </select>
                <select
                    aria-label="Reporting year"
                    value={reportYear}
                    onChange={(event) => {
                        const period = `${event.target.value}-${reportingPeriod.slice(5, 7)}`;
                        setReportingPeriod(period > currentMonth ? currentMonth : period);
                    }}
                    className="h-9 rounded-lg border border-[var(--color-border)] bg-white px-3 text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                    {Array.from({ length: Number(currentMonth.slice(0, 4)) - 1899 }, (_, index) => Number(currentMonth.slice(0, 4)) - index).map(year => <option key={year} value={year}>{year}</option>)}
                </select>
            </div>
            <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2">Accounting method
                    <select aria-label="Dashboard accounting method" value={basis} onChange={event => setBasis(event.target.value as DashboardBasis)} className="h-9 rounded-lg border border-[var(--color-border)] bg-white px-3">
                        <option value="cash">Cash · Actual receipts &amp; payments</option>
                        <option value="accrual">Accrual · Receivables &amp; payables</option>
                    </select>
                </label>
                <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" role="switch" checked={includeGst} onChange={event => setIncludeGst(event.target.checked)} className="accent-[var(--color-primary)]"/>Include GST in dashboard totals</label>
            </div>
        </div>
        <p className="mb-3 text-xs text-[var(--color-text-secondary)]">{basis === "cash" ? "Cash: actual money received and paid, excluding opening balances and transfers between cash accounts." : "Accrual: unpaid invoice balances by invoice date and unpaid purchase bills by due date. Current-month bill totals include bills due later this month."} {includeGst ? "Including GST." : "Excluding recorded GST."} Cash balance remains the actual bank balance. Dashboard choices do not change transaction or GST settings.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[...basisDashboard.metrics, dashboard.metrics[3]].map((metric) => <MetricCard key={metric.label} metric={metric}/>)}
        </div>
        <div className="mt-4 grid grid-cols-1 items-start gap-4 xl:grid-cols-[2fr_1fr]">
            <div className="min-w-0">
                <div className="mb-2 flex items-center justify-end gap-2 text-xs"><span className="text-[var(--color-text-muted)]">Chart range</span>
                    {([1,3,6] as const).map((months) => <button type="button" key={months} onClick={() => setChartMonths(months)} aria-pressed={chartMonths === months} className={`rounded-md border px-3 py-1.5 font-medium transition-colors ${chartMonths === months ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]" : "border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]"}`}>{months} {months === 1 ? "month" : "months"}</button>)}
                </div>
                <RevenueChart months={chartMonths} data={basisDashboard.chart} breakdown={basisDashboard.breakdown} monthlyTotals={basisDashboard.monthlyTotals} basis={basis} includeGst={includeGst}/>
                <div className="mt-4"><TaxPayrollCards date={reportingDate}/></div>
            </div>
            <div className="grid min-w-0 gap-4 xl:pt-[34px]">
                <ReceivablesCard/>
                <PayablesCard/>
                <BankReconciliationCard/>
                <TasksCard/>
                <InventoryHealthCard/>
            </div>
        </div>
    </div>;
}
