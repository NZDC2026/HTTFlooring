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
import { RecentTransactions } from "../components/RecentTransactions";
import { RevenueChart } from "../components/RevenueChart";
import { TasksCard } from "../components/TasksCard";
import { dashboardMetrics } from "../data/mockDashboard";

export function DashboardPage() {
    const [chartMonths, setChartMonths] = useState<3 | 6>(6);
    return <div className="pb-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">Business overview · October 2026</p>
                <h1 className="font-display text-[clamp(26px,3vw,34px)] leading-tight">Welcome back, ABC Flooring</h1>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Your business performance, priorities and next steps in one place.</p>
            </div>
            <Link to="/demo"><Button variant="accent">Customer demo <ArrowRight size={16}/></Button></Link>
        </div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-xs">
            <span className="flex items-center gap-2 font-medium"><CalendarDays size={15}/> Demo reporting period: October 2026</span>
            <span className="text-[var(--color-text-secondary)]">Illustrative dashboard figures · Mock Data · Not live financial reporting</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardMetrics.map((metric) => <MetricCard key={metric.label} metric={metric}/>)}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
            <div className="min-w-0">
                <div className="mb-2 flex items-center justify-end gap-2 text-xs"><span className="text-[var(--color-text-muted)]">Chart range</span>
                    {([3,6] as const).map((months) => <button type="button" key={months} onClick={() => setChartMonths(months)} aria-pressed={chartMonths === months} className={`rounded-md border px-3 py-1.5 font-medium transition-colors ${chartMonths === months ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]" : "border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]"}`}>{months} months</button>)}
                </div>
                <RevenueChart months={chartMonths}/>
            </div>
            <div className="min-w-0 xl:pt-[34px]"><ReceivablesCard/></div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"><PayablesCard/><BankReconciliationCard/><TasksCard/></div>
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2"><InventoryHealthCard/><QuickAccessCard/></div>
        <div className="mt-7"><RecentTransactions/></div>
    </div>;
}
