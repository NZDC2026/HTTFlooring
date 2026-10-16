import {businessDateKey} from '../../../lib/businessDate';
import {fiscalYearStart} from '../../../lib/businessDate';
import { businessSettings } from '../../business-workspace/configurationState';
import {
    useState,
} from "react";

import type {
    ReactNode,
} from "react";

import {
    ArrowLeft,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

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
    useProfitAndLoss,
} from "../data/useProfitAndLoss";

import type {
    ProfitAndLossAccountRow,
} from "../types/profitAndLoss";

export function ProfitAndLossPage() {
    const navigate =
        useNavigate();

    const today =
        getToday();

    const [
        fromDate,
        setFromDate,
    ] = useState(
        fiscalYearStart(today),
    );

    const [
        toDate,
        setToDate,
    ] = useState(
        today,
    );

    const report =
        useProfitAndLoss(
            fromDate,
            toDate,
        );

    const resultLabel =
        report.netProfit >
            0
            ? "Net Profit"
            : report.netProfit <
                0
                ? "Net Loss"
                : "Break Even";

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

            <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        Financial Reports
                    </p>

                    <h1 className="font-display text-3xl font-semibold text-[var(--color-primary)]">
                        Profit &amp; Loss
                    </h1>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
                        Review revenue,
                        expenses and net
                        profit or loss for
                        the selected
                        reporting period.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Field
                        label="From"
                    >
                        <Input
                            type="date"
                            value={
                                fromDate
                            }
                            onChange={(
                                event,
                            ) =>
                                setFromDate(
                                    event
                                        .target
                                        .value,
                                )
                            }
                        />
                    </Field>

                    <Field
                        label="To"
                    >
                        <Input
                            type="date"
                            value={
                                toDate
                            }
                            onChange={(
                                event,
                            ) =>
                                setToDate(
                                    event
                                        .target
                                        .value,
                                )
                            }
                        />
                    </Field>
                </div>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    label="Sales Revenue"
                    value={
                        formatMoney(
                            report.salesRevenue,
                        )
                    }
                />

                <SummaryCard
                    label="Cost of Goods Sold"
                    value={
                        formatMoney(
                            report.costOfGoodsSold,
                        )
                    }
                />

                <SummaryCard
                    label="Gross Profit"
                    value={
                        formatMoney(
                            report.grossProfit,
                        )
                    }
                />

                <SummaryCard
                    label="Gross Margin"
                    value={
                        report.grossMarginPercent ===
                            null
                            ? "—"
                            : `${report.grossMarginPercent.toFixed(
                                2,
                            )}%`
                    }
                />
            </div>

            <Card className="mb-6">
                <CardContent>
                    <div className="grid gap-5 md:grid-cols-4">
                        <ProfitMetric
                            label="Sales Revenue"
                            value={
                                report.salesRevenue
                            }
                        />

                        <ProfitMetric
                            label="COGS"
                            value={
                                report.costOfGoodsSold
                            }
                        />

                        <ProfitMetric
                            label="Gross Profit"
                            value={
                                report.grossProfit
                            }
                        />

                        <ProfitMetric
                            label="Operating Expenses"
                            value={
                                report.operatingExpenses
                            }
                        />
                    </div>

                    <div className="mt-5 border-t border-[var(--color-border)] pt-5">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                                    {resultLabel}
                                </p>

                                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                    Gross profit
                                    less operating
                                    expenses and
                                    other P&amp;L
                                    accounts.
                                </p>
                            </div>

                            <p className="font-display text-2xl font-semibold text-[var(--color-primary)]">
                                {formatMoney(
                                    report.netProfit,
                                )}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <div className="mb-6">
                        <h2 className="font-display text-xl font-semibold text-[var(--color-primary)]">
                            Income Statement
                        </h2>

                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                            {
                                report.fromDate
                            }
                            {" to "}
                            {
                                report.toDate
                            }
                        </p>
                    </div>

                    <StatementSection
                        title="Revenue"
                        rows={
                            report.revenue
                        }
                        totalLabel="Total Revenue"
                        total={
                            report.totalRevenue
                        }
                    />

                    <div className="my-7 border-t border-[var(--color-border)]" />

                    <StatementSection
                        title="Expenses"
                        rows={
                            report.expenses
                        }
                        totalLabel="Total Expenses"
                        total={
                            report.totalExpenses
                        }
                    />

                    <div className="mt-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-5">
                        <div className="flex items-center justify-between gap-5">
                            <div>
                                <p className="font-display text-xl font-semibold text-[var(--color-primary)]">
                                    {resultLabel}
                                </p>

                                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                                    Total Revenue
                                    minus Total
                                    Expenses
                                </p>
                            </div>

                            <p className="font-display text-2xl font-semibold tabular-nums text-[var(--color-primary)]">
                                {formatSignedMoney(
                                    report.netProfit,
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                        This report is
                        calculated directly
                        from general ledger
                        revenue and expense
                        journal lines for
                        the selected period.
                        Reversed journals
                        remain in the ledger
                        together with their
                        reversal entries so
                        the accounting audit
                        trail is preserved.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function StatementSection({
    title,
    rows,
    totalLabel,
    total,
}: {
    title:
    string;

    rows:
    ProfitAndLossAccountRow[];

    totalLabel:
    string;

    total:
    number;
}) {
    return (
        <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">
                {title}
            </h3>

            <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[var(--color-surface-muted)]">
                            <Header>
                                Code
                            </Header>

                            <Header>
                                Account
                            </Header>

                            <Header align="right">
                                Amount
                            </Header>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.length ===
                            0 ? (
                            <tr>
                                <td
                                    colSpan={
                                        3
                                    }
                                    className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]"
                                >
                                    No activity
                                    for this
                                    section
                                    during the
                                    selected
                                    period.
                                </td>
                            </tr>
                        ) : (
                            rows.map(
                                (
                                    row,
                                ) => (
                                    <tr
                                        key={
                                            row.accountId
                                        }
                                        className="border-b border-[var(--color-border)] last:border-b-0"
                                    >
                                        <td className="w-32 whitespace-nowrap px-4 py-3 font-medium text-[var(--color-primary)]">
                                            {
                                                row.accountCode
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-sm text-[var(--color-text-primary)]">
                                            {
                                                row.accountName
                                            }
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-[var(--color-text-primary)]">
                                            {formatMoney(
                                                row.amount,
                                            )}
                                        </td>
                                    </tr>
                                ),
                            )
                        )}
                    </tbody>

                    <tfoot>
                        <tr className="bg-[var(--color-surface-muted)]">
                            <td
                                colSpan={
                                    2
                                }
                                className="px-4 py-4 text-right text-sm font-semibold text-[var(--color-text-primary)]"
                            >
                                {totalLabel}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-right font-semibold tabular-nums text-[var(--color-text-primary)]">
                                {formatMoney(
                                    total,
                                )}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </section>
    );
}

function Field({
    label,
    children,
}: {
    label:
    string;

    children:
    ReactNode;
}) {
    return (
        <label className="block min-w-44">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                {label}
            </span>

            {children}
        </label>
    );
}

function ProfitMetric({
    label,
    value,
}: {
    label:
    string;

    value:
    number;
}) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                {label}
            </p>

            <p className="mt-2 font-display text-xl font-semibold">
                {formatMoney(
                    value,
                )}
            </p>
        </div>
    );
}

function SummaryCard({
    label,
    value,
}: {
    label:
    string;

    value:
    string;
}) {
    return (
        <Card>
            <CardContent>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                    {label}
                </p>

                <p className="mt-2 font-display text-xl font-semibold text-[var(--color-primary)]">
                    {value}
                </p>
            </CardContent>
        </Card>
    );
}

function Header({
    children,
    align =
    "left",
}: {
    children:
    ReactNode;

    align?:
    "left"
    | "right";
}) {
    return (
        <th
            className={
                align ===
                    "right"
                    ? "border-b border-[var(--color-border)] px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]"
                    : "border-b border-[var(--color-border)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]"
            }
        >
            {children}
        </th>
    );
}

function formatMoney(
    value:
        number,
) {
    return new Intl.NumberFormat(
        "en-AU",
        {
            style:
                "currency",

            currency:
                businessSettings().currency,
        },
    ).format(
        value,
    );
}

function formatSignedMoney(
    value:
        number,
) {
    if (
        value ===
        0
    ) {
        return formatMoney(
            0,
        );
    }

    if (
        value >
        0
    ) {
        return formatMoney(
            value,
        );
    }

    return `(${formatMoney(
        Math.abs(
            value,
        ),
    )})`;
}

function getToday() {
    return businessDateKey(new Date().toISOString());
}