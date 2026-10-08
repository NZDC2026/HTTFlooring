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
    useAccountsReceivableGlReconciliation,
} from "../data/useAccountsReceivableGlReconciliation";

export function AccountsReceivableGlReconciliationPage() {
    const navigate =
        useNavigate();

    const [
        asOfDate,
        setAsOfDate,
    ] = useState(
        getToday(),
    );

    const reconciliation =
        useAccountsReceivableGlReconciliation(
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
                            AR Reconciliation
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
                        Accounts Receivable
                        subledger with the
                        Accounts Receivable
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
                    label="AR Subledger"
                    value={
                        formatMoney(
                            reconciliation
                                .arSubledgerBalance,
                        )
                    }
                />

                <SummaryCard
                    label="GL Accounts Receivable"
                    value={
                        formatMoney(
                            reconciliation
                                .glAccountsReceivableBalance,
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
                                    ? "Accounts Receivable is reconciled."
                                    : "Accounts Receivable is out of balance."}
                            </p>

                            <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                                AR Subledger
                                minus GL
                                Accounts
                                Receivable
                                equals{" "}
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
                    <div className="mb-4">
                        <h2 className="font-display text-xl font-semibold text-[var(--color-primary)]">
                            Customer AR Balances
                        </h2>

                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                            Net customer
                            account balances
                            included in the
                            AR subledger as
                            at{" "}
                            {
                                reconciliation
                                    .asOfDate
                            }
                            .
                        </p>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[var(--color-background-subtle)]">
                                    <th className="border-b border-[var(--color-border)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                                        Customer
                                    </th>

                                    <th className="border-b border-[var(--color-border)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                                        Name
                                    </th>

                                    <th className="border-b border-[var(--color-border)] px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                                        Net AR
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {reconciliation
                                    .customerBalances
                                    .length ===
                                    0 ? (
                                    <tr>
                                        <td
                                            colSpan={
                                                3
                                            }
                                            className="px-4 py-10 text-center text-sm text-[var(--color-text-muted)]"
                                        >
                                            No customer
                                            AR balances
                                            exist as at
                                            this date.
                                        </td>
                                    </tr>
                                ) : (
                                    reconciliation
                                        .customerBalances
                                        .map(
                                            (
                                                row,
                                            ) => (
                                                <tr
                                                    key={
                                                        row.customerId
                                                    }
                                                    className="border-b border-[var(--color-border)] last:border-b-0"
                                                >
                                                    <td className="px-4 py-3 font-medium text-[var(--color-primary)]">
                                                        {
                                                            row.customerCode
                                                        }
                                                    </td>

                                                    <td className="px-4 py-3 text-sm text-[var(--color-text-primary)]">
                                                        {
                                                            row.customerName
                                                        }
                                                    </td>

                                                    <td className="px-4 py-3 text-right font-medium tabular-nums text-[var(--color-text-primary)]">
                                                        {formatMoney(
                                                            row.subledgerBalance,
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )
                                )}
                            </tbody>

                            <tfoot>
                                <tr className="bg-[var(--color-background-subtle)]">
                                    <td
                                        colSpan={
                                            2
                                        }
                                        className="px-4 py-3 text-right font-semibold text-[var(--color-text-primary)]"
                                    >
                                        AR Subledger
                                        Total
                                    </td>

                                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-[var(--color-text-primary)]">
                                        {formatMoney(
                                            reconciliation
                                                .arSubledgerBalance,
                                        )}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
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