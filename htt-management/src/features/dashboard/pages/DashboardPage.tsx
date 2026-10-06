import { Plus } from "lucide-react";

import { Button } from "../../../components/ui/Button";

import { BankReconciliationCard } from "../components/BankReconciliationCard";
import { MetricCard } from "../components/MetricCard";
import { PayablesCard } from "../components/PayablesCard";
import { ReceivablesCard } from "../components/ReceivablesCard";
import { RecentTransactions } from "../components/RecentTransactions";
import { RevenueChart } from "../components/RevenueChart";
import { TasksCard } from "../components/TasksCard";

import { dashboardMetrics } from "../data/mockDashboard";

export function DashboardPage() {
    return (
        <div className="pb-8">
            <div className="mb-7 flex items-start justify-between">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        Tuesday, 6 October
                    </p>

                    <h1 className="font-display text-[34px] leading-tight">
                        Welcome back, ABC Flooring
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Here&apos;s an overview of your business performance.
                    </p>
                </div>

                <Button variant="accent">
                    <Plus size={16} />
                    New transaction
                </Button>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {dashboardMetrics.map((metric) => (
                    <MetricCard
                        key={metric.label}
                        metric={metric}
                    />
                ))}
            </div>

            <div className="mt-4 grid grid-cols-[2fr_1fr] gap-4">
                <RevenueChart />
                <ReceivablesCard />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
                <PayablesCard />
                <BankReconciliationCard />
                <TasksCard />
            </div>

            <div className="mt-7">
                <RecentTransactions />
            </div>
        </div>
    );
}