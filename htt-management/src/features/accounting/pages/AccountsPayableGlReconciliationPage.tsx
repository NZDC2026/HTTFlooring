import {
    useState,
} from "react";

import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import {
    Badge,
} from "../../../components/ui/Badge";

import {
    Button,
} from "../../../components/ui/Button";

import {
    Card,
    CardContent,
} from "../../../components/ui/Card";

import {
    Input,
} from "../../../components/ui/Input";

import {
    useAccountsPayableGlReconciliation,
} from "../data/useAccountsPayableGlReconciliation";

export function AccountsPayableGlReconciliationPage() {
    const navigate =
        useNavigate();

    const [
        asOfDate,
        setAsOfDate,
    ] = useState(
        getToday(),
    );

    const reconciliation =
        useAccountsPayableGlReconciliation(
            asOfDate,
        );

    return (
        <div className="pb-8">
            <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                    navigate(
                        "/accounting",
                    )
                }
                className="mb-5"
            >
                <ArrowLeft
                    size={
                        15
                    }
                />

                Accounting
            </Button>

            <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        Accounting Control
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="font-display text-3xl font-semibold text-[var(--color-primary)]">
                            AP Reconciliation
                        </h1>

                        <Badge
                            variant={
                                reconciliation.reconciled
                                    ? "success"
                                    : "warning"
                            }
                        >
                            {reconciliation.reconciled
                                ? "Reconciled"
                                : "Out of Balance"}
                        </Badge>
                    </div>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
                        Compare the
                        Accounts Payable
                        subledger with the
                        Accounts Payable
                        general ledger
                        control account.
                    </p>
                </div>

                <label className="block w-full lg:w-48">
                    <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                        As at
                    </span>

                    <Input
                        type="date"
                        value={
                            asOfDate
                        }
                        onChange={(
                            event,
                        ) =>
                            setAsOfDate(
                                event
                                    .target
                                    .value,
                            )
                        }
                    />
                </label>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-3">
                <SummaryCard
                    label="AP Subledger"
                    value={
                        formatMoney(
                            reconciliation
                                .apSubledgerBalance,
                        )
                    }
                />

                <SummaryCard
                    label="GL Accounts Payable"
                    value={
                        formatMoney(
                            reconciliation
                                .glAccountsPayableBalance,
                        )
                    }
                />

                <SummaryCard
                    label="Difference"
                    value={
                        formatMoney(
                            reconciliation
                                .difference,
                        )
                    }
                />
            </div>

            <Card className="mb-6">
                <CardContent>
                    <div className="flex items-start gap-3">
                        {reconciliation.reconciled ? (
                            <CheckCircle2
                                size={
                                    20
                                }
                                className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                            />
                        ) : (
                            <XCircle
                                size={
                                    20
                                }
                                className="mt-0.5 shrink-0 text-[var(--color-accent)]"
                            />
                        )}

                        <div>
                            <p className="font-medium text-[var(--color-text-primary)]">
                                {reconciliation.reconciled
                                    ? "Accounts Payable is reconciled."
                                    : "Accounts Payable is out of balance."}
                            </p>

                            <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                                AP Subledger
                                minus GL
                                Accounts
                                Payable equals{" "}
                                {formatMoney(
                                    reconciliation
                                        .difference,
                                )}
                                .
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <div className="mb-5">
                        <h2 className="font-display text-xl font-semibold text-[var(--color-primary)]">
                            AP Control Breakdown
                        </h2>

                        <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                            The AP control
                            balance is
                            outstanding
                            Supplier Bills
                            less unallocated
                            Supplier Credits
                            as at{" "}
                            {
                                reconciliation
                                    .asOfDate
                            }
                            .
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
                        <ControlRow
                            label="Gross Outstanding Supplier Bills"
                            value={
                                reconciliation
                                    .grossOutstanding
                            }
                        />

                        <ControlRow
                            label="Less: Unallocated Supplier Credits"
                            value={
                                -reconciliation
                                    .unallocatedCredit
                            }
                        />

                        <div className="flex items-center justify-between gap-4 bg-[var(--color-background-subtle)] px-4 py-4">
                            <span className="font-semibold text-[var(--color-text-primary)]">
                                Net AP Subledger
                            </span>

                            <span className="font-semibold tabular-nums text-[var(--color-primary)]">
                                {formatMoney(
                                    reconciliation
                                        .apSubledgerBalance,
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="mt-5 rounded-lg border border-[var(--color-border)] px-4 py-4">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-[var(--color-text-secondary)]">
                                2000 Accounts
                                Payable GL
                                Balance
                            </span>

                            <span className="font-semibold tabular-nums text-[var(--color-text-primary)]">
                                {formatMoney(
                                    reconciliation
                                        .glAccountsPayableBalance,
                                )}
                            </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-3">
                            <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                                Difference
                            </span>

                            <span className="font-semibold tabular-nums text-[var(--color-primary)]">
                                {formatMoney(
                                    reconciliation
                                        .difference,
                                )}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function SummaryCard({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <Card>
            <CardContent>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                    {label}
                </p>

                <p className="mt-2 font-display text-2xl font-semibold text-[var(--color-primary)]">
                    {value}
                </p>
            </CardContent>
        </Card>
    );
}

function ControlRow({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] px-4 py-4">
            <span className="text-sm text-[var(--color-text-secondary)]">
                {label}
            </span>

            <span className="font-medium tabular-nums text-[var(--color-text-primary)]">
                {formatMoney(
                    value,
                )}
            </span>
        </div>
    );
}

function formatMoney(
    value: number,
) {
    return new Intl.NumberFormat(
        "en-AU",
        {
            style:
                "currency",

            currency:
                "AUD",
        },
    ).format(
        value,
    );
}

function getToday() {
    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() +
            1,
        ).padStart(
            2,
            "0",
        );

    const day =
        String(
            now.getDate(),
        ).padStart(
            2,
            "0",
        );

    return `${year}-${month}-${day}`;
}