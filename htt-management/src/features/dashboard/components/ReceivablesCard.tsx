import { ArrowRight } from "lucide-react";

import { Button } from "../../../components/ui/Button";
import {
    Card,
    CardContent,
} from "../../../components/ui/Card";

const ageing = [
    {
        label: "Current",
        value: "$52,000",
        percentage: 61,
    },
    {
        label: "1–30 days",
        value: "$18,000",
        percentage: 21,
    },
    {
        label: "31–60 days",
        value: "$8,400",
        percentage: 10,
    },
    {
        label: "60+ days",
        value: "$6,520",
        percentage: 8,
    },
];

export function ReceivablesCard() {
    return (
        <Card>
            <CardContent>
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="font-display text-xl">
                            Accounts Receivable
                        </h2>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            Outstanding customer invoices
                        </p>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                    >
                        View all
                        <ArrowRight size={14} />
                    </Button>
                </div>

                <div className="money mt-6 text-3xl font-semibold tracking-tight">
                    $84,920
                </div>

                <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Total outstanding
                </div>

                <div className="mt-6 space-y-4">
                    {ageing.map((item) => (
                        <div key={item.label}>
                            <div className="mb-1.5 flex items-center justify-between">
                                <span className="text-xs text-[var(--color-text-secondary)]">
                                    {item.label}
                                </span>

                                <span className="money text-xs font-semibold">
                                    {item.value}
                                </span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
                                <div
                                    className="h-full rounded-full bg-[var(--color-primary)]"
                                    style={{
                                        width: `${item.percentage}%`,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}