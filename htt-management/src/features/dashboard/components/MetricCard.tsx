import {
    ArrowDownRight,
    ArrowUpRight,
    Banknote,
    CircleDollarSign,
    TrendingUp,
    WalletCards,
} from "lucide-react";

import {
    Card,
    CardContent,
} from "../../../components/ui/Card";

import type { DashboardMetric } from "../data/mockDashboard";

const icons = {
    Revenue: TrendingUp,
    Expenses: WalletCards,
    "Net Profit": CircleDollarSign,
    "Cash Balance": Banknote,
};

interface MetricCardProps {
    metric: DashboardMetric;
}

export function MetricCard({
    metric,
}: MetricCardProps) {
    const Icon =
        icons[metric.label as keyof typeof icons] ??
        CircleDollarSign;

    const positive = metric.change >= 0;

    return (
        <Card>
            <CardContent>
                <div className="flex items-start justify-between">
                    <div
                        className="
              flex h-9 w-9 items-center justify-center
              rounded-lg
              bg-[var(--color-primary-soft)]
              text-[var(--color-primary)]
            "
                    >
                        <Icon size={17} />
                    </div>

                    <div
                        className={
                            positive
                                ? "flex items-center gap-1 text-xs font-medium text-[var(--color-success)]"
                                : "flex items-center gap-1 text-xs font-medium text-[var(--color-danger)]"
                        }
                    >
                        {positive ? (
                            <ArrowUpRight size={13} />
                        ) : (
                            <ArrowDownRight size={13} />
                        )}

                        {Math.abs(metric.change)}%
                    </div>
                </div>

                <div className="mt-5 text-xs font-medium text-[var(--color-text-secondary)]">
                    {metric.label}
                </div>

                <div className="money mt-1 text-[26px] font-semibold tracking-tight">
                    {metric.value}
                </div>

                <div className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                    {metric.description}
                </div>
            </CardContent>
        </Card>
    );
}