import {
    AlertCircle,
    CalendarClock,
} from "lucide-react";

import {
    Card,
    CardContent,
} from "../../../components/ui/Card";

export function PayablesCard() {
    return (
        <Card>
            <CardContent>
                <h2 className="font-display text-xl">
                    Accounts Payable
                </h2>

                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Supplier bills and upcoming payments
                </p>

                <div className="money mt-6 text-3xl font-semibold tracking-tight">
                    $42,180
                </div>

                <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Total outstanding
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-[var(--color-warning-soft)] p-3">
                        <CalendarClock
                            size={16}
                            className="text-[var(--color-warning)]"
                        />

                        <div className="money mt-3 text-lg font-semibold">
                            $18,420
                        </div>

                        <div className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
                            Due this week
                        </div>
                    </div>

                    <div className="rounded-lg bg-[var(--color-danger-soft)] p-3">
                        <AlertCircle
                            size={16}
                            className="text-[var(--color-danger)]"
                        />

                        <div className="money mt-3 text-lg font-semibold">
                            $4,820
                        </div>

                        <div className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
                            Overdue
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}