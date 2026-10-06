import {
    CheckCircle2,
    Landmark,
} from "lucide-react";

import { Button } from "../../../components/ui/Button";
import {
    Card,
    CardContent,
} from "../../../components/ui/Card";

export function BankReconciliationCard() {
    return (
        <Card>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-display text-xl">
                            Bank Reconciliation
                        </h2>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            Business Account •••• 4821
                        </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                        <Landmark size={17} />
                    </div>
                </div>

                <div className="mt-6 flex items-end justify-between">
                    <div>
                        <div className="money text-2xl font-semibold">
                            $128,420.40
                        </div>

                        <div className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                            Statement balance
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="money text-sm font-semibold text-[var(--color-danger)]">
                            $300.00
                        </div>

                        <div className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                            Difference
                        </div>
                    </div>
                </div>

                <div className="mt-5 flex items-center gap-2 rounded-lg bg-[var(--color-warning-soft)] p-3 text-xs">
                    <CheckCircle2
                        size={15}
                        className="text-[var(--color-warning)]"
                    />

                    18 transactions need attention
                </div>

                <Button
                    variant="secondary"
                    className="mt-4 w-full"
                >
                    Review transactions
                </Button>
            </CardContent>
        </Card>
    );
}