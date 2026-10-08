import {
    useState,
} from "react";

import type {
    ReactNode,
} from "react";

import {
    ArrowLeft,
    CheckCircle2,
    Scale,
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
    useBalanceSheet,
} from "../data/useBalanceSheet";

import type {
    BalanceSheetAccountRow,
} from "../types/balanceSheet";

export function BalanceSheetPage() {
    const navigate =
        useNavigate();

    const [
        asOfDate,
        setAsOfDate,
    ] = useState(
        getToday(),
    );

    const report =
        useBalanceSheet(
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

            <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        Financial Reports
                    </p>

                    <h1 className="font-display text-3xl font-semibold text-[var(--color-primary)]">
                        Balance Sheet
                    </h1>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
                        Review assets,
                        liabilities,
                        equity and current
                        earnings as at the
                        selected reporting
                        date.
                    </p>
                </div>

                <Field
                    label="As at"
                >
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
                </Field>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-4">
                <SummaryCard
                    label="Total Assets"
                    value={
                        formatMoney(
                            report.totalAssets,
                        )
                    }
                />

                <SummaryCard
                    label="Total Liabilities"
                    value={
                        formatMoney(
                            report.totalLiabilities,
                        )
                    }
                />

                <SummaryCard
                    label="Total Equity"
                    value={
                        formatMoney(
                            report.totalEquity,
                        )
                    }
                />

                <Card>
                    <CardContent>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                                    Difference
                                </p>

                                <p className="mt-2 font-display text-xl font-semibold text-[var(--color-primary)]">
                                    {formatMoney(
                                        Math.abs(
                                            report.difference,
                                        ),
                                    )}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                                {report.balanced ? (
                                    <CheckCircle2
                                        size={
                                            19
                                        }
                                    />
                                ) : (
                                    <Scale
                                        size={
                                            19
                                        }
                                    />
                                )}
                            </div>
                        </div>

                        <div className="mt-2">
                            <Badge
                                variant={
                                    report.balanced
                                        ? "success"
                                        : "neutral"
                                }
                            >
                                {report.balanced
                                    ? "Balanced"
                                    : "Out of Balance"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent>
                    <div className="mb-6">
                        <h2 className="font-display text-xl font-semibold text-[var(--color-primary)]">
                            Statement of Financial Position
                        </h2>

                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                            As at{" "}
                            {
                                report.asOfDate
                            }
                        </p>
                    </div>

                    <BalanceSection
                        title="Assets"
                        rows={
                            report.assets
                        }
                        totalLabel="Total Assets"
                        total={
                            report.totalAssets
                        }
                    />

                    <div className="my-8 border-t border-[var(--color-border)]" />

                    <BalanceSection
                        title="Liabilities"
                        rows={
                            report.liabilities
                        }
                        totalLabel="Total Liabilities"
                        total={
                            report.totalLiabilities
                        }
                    />

                    <div className="my-8 border-t border-[var(--color-border)]" />

                    <section>
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">
                            Equity
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
                                    {report.equity.map(
                                        (
                                            row,
                                        ) => (
                                            <BalanceRow
                                                key={
                                                    row.accountId
                                                }
                                                row={
                                                    row
                                                }
                                            />
                                        ),
                                    )}

                                    <tr className="border-b border-[var(--color-border)]">
                                        <td className="w-32 whitespace-nowrap px-4 py-3 font-medium text-[var(--color-primary)]">
                                            —
                                        </td>

                                        <td className="px-4 py-3 text-sm font-medium text-[var(--color-text-primary)]">
                                            Current Earnings
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-[var(--color-text-primary)]">
                                            {formatMoney(
                                                report.currentEarnings,
                                            )}
                                        </td>
                                    </tr>
                                </tbody>

                                <tfoot>
                                    <tr className="bg-[var(--color-surface-muted)]">
                                        <td
                                            colSpan={
                                                2
                                            }
                                            className="px-4 py-4 text-right text-sm font-semibold text-[var(--color-text-primary)]"
                                        >
                                            Total Equity
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4 text-right font-semibold tabular-nums text-[var(--color-text-primary)]">
                                            {formatMoney(
                                                report.totalEquity,
                                            )}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </section>

                    <div className="mt-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-5">
                        <div className="grid gap-5 md:grid-cols-3">
                            <EquationValue
                                label="Total Assets"
                                value={
                                    report.totalAssets
                                }
                            />

                            <EquationValue
                                label="Liabilities + Equity"
                                value={
                                    report.totalLiabilitiesAndEquity
                                }
                            />

                            <EquationValue
                                label="Difference"
                                value={
                                    Math.abs(
                                        report.difference,
                                    )
                                }
                            />
                        </div>

                        <div className="mt-5 flex items-center gap-2 border-t border-[var(--color-border)] pt-4">
                            <Badge
                                variant={
                                    report.balanced
                                        ? "success"
                                        : "neutral"
                                }
                            >
                                {report.balanced
                                    ? "Accounting Equation Balanced"
                                    : "Accounting Equation Out of Balance"}
                            </Badge>

                            <span className="text-sm text-[var(--color-text-secondary)]">
                                Assets =
                                Liabilities +
                                Equity
                            </span>
                        </div>
                    </div>

                    <div className="mt-5 rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                        Current Earnings
                        represents cumulative
                        revenue less cumulative
                        expenses through the
                        selected date. It is
                        presented within equity
                        because year-end closing
                        journals have not yet
                        transferred earnings to
                        Retained Earnings.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function BalanceSection({
    title,
    rows,
    totalLabel,
    total,
}: {
    title:
    string;

    rows:
    BalanceSheetAccountRow[];

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
                                    No balances
                                    exist in this
                                    section as at
                                    the selected
                                    date.
                                </td>
                            </tr>
                        ) : (
                            rows.map(
                                (
                                    row,
                                ) => (
                                    <BalanceRow
                                        key={
                                            row.accountId
                                        }
                                        row={
                                            row
                                        }
                                    />
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

function BalanceRow({
    row,
}: {
    row:
    BalanceSheetAccountRow;
}) {
    return (
        <tr className="border-b border-[var(--color-border)] last:border-b-0">
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
    );
}

function EquationValue({
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
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                {label}
            </p>

            <p className="mt-2 font-display text-xl font-semibold text-[var(--color-primary)]">
                {formatMoney(
                    value,
                )}
            </p>
        </div>
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
    if (
        value <
        0
    ) {
        return `(${new Intl.NumberFormat(
            "en-AU",
            {
                style:
                    "currency",

                currency:
                    "AUD",
            },
        ).format(
            Math.abs(
                value,
            ),
        )})`;
    }

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