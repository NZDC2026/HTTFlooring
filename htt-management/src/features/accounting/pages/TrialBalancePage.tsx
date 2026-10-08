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
    useTrialBalance,
} from "../data/useTrialBalance";

export function TrialBalancePage() {
    const navigate =
        useNavigate();

    const today =
        getToday();

    const [
        fromDate,
        setFromDate,
    ] = useState(
        `${today.slice(
            0,
            4,
        )}-01-01`,
    );

    const [
        toDate,
        setToDate,
    ] = useState(
        today,
    );

    const trialBalance =
        useTrialBalance(
            fromDate,
            toDate,
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
                        Accounting
                    </p>

                    <h1 className="font-display text-3xl font-semibold text-[var(--color-primary)]">
                        Trial Balance
                    </h1>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
                        Review opening
                        balances, period
                        movements and
                        closing debit or
                        credit balances
                        for every general
                        ledger account.
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

            <div className="mb-6 grid gap-4 md:grid-cols-4">
                <SummaryCard
                    label="Closing Debits"
                    value={
                        formatMoney(
                            trialBalance
                                .totalClosingDebit,
                        )
                    }
                />

                <SummaryCard
                    label="Closing Credits"
                    value={
                        formatMoney(
                            trialBalance
                                .totalClosingCredit,
                        )
                    }
                />

                <SummaryCard
                    label="Difference"
                    value={
                        formatMoney(
                            Math.abs(
                                trialBalance
                                    .difference,
                            ),
                        )
                    }
                />

                <Card>
                    <CardContent>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                                    Status
                                </p>

                                <p className="mt-2 font-display text-xl font-semibold text-[var(--color-primary)]">
                                    {trialBalance
                                        .balanced
                                        ? "Balanced"
                                        : "Out of Balance"}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                                {trialBalance
                                    .balanced ? (
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
                                    trialBalance
                                        .balanced
                                        ? "success"
                                        : "neutral"
                                }
                            >
                                {trialBalance
                                    .balanced
                                    ? "Debits = Credits"
                                    : "Review Required"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent>
                    <div className="mb-5">
                        <h2 className="font-display text-xl font-semibold text-[var(--color-primary)]">
                            General Ledger Balances
                        </h2>

                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                            Period{" "}
                            {
                                trialBalance.fromDate
                            }{" "}
                            to{" "}
                            {
                                trialBalance.toDate
                            }.
                        </p>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                        <table className="w-full min-w-[1100px] border-collapse">
                            <thead>
                                <tr className="bg-[var(--color-surface-muted)]">
                                    <Header>
                                        Code
                                    </Header>

                                    <Header>
                                        Account
                                    </Header>

                                    <Header>
                                        Type
                                    </Header>

                                    <Header align="right">
                                        Opening Debit
                                    </Header>

                                    <Header align="right">
                                        Opening Credit
                                    </Header>

                                    <Header align="right">
                                        Period Debit
                                    </Header>

                                    <Header align="right">
                                        Period Credit
                                    </Header>

                                    <Header align="right">
                                        Closing Debit
                                    </Header>

                                    <Header align="right">
                                        Closing Credit
                                    </Header>
                                </tr>
                            </thead>

                            <tbody>
                                {trialBalance
                                    .rows.length ===
                                    0 ? (
                                    <tr>
                                        <td
                                            colSpan={
                                                9
                                            }
                                            className="px-4 py-12 text-center text-sm text-[var(--color-text-muted)]"
                                        >
                                            No
                                            general
                                            ledger
                                            activity
                                            exists
                                            for this
                                            period.
                                        </td>
                                    </tr>
                                ) : (
                                    trialBalance.rows.map(
                                        (
                                            row,
                                        ) => (
                                            <tr
                                                key={
                                                    row.accountId
                                                }
                                                className="border-b border-[var(--color-border)] last:border-b-0"
                                            >
                                                <td className="whitespace-nowrap px-4 py-3 font-medium text-[var(--color-primary)]">
                                                    {
                                                        row.accountCode
                                                    }
                                                </td>

                                                <td className="min-w-56 px-4 py-3 text-sm font-medium text-[var(--color-text-primary)]">
                                                    {
                                                        row.accountName
                                                    }
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                                                    {formatAccountType(
                                                        row.accountType,
                                                    )}
                                                </td>

                                                <MoneyCell
                                                    value={
                                                        row.openingDebit
                                                    }
                                                />

                                                <MoneyCell
                                                    value={
                                                        row.openingCredit
                                                    }
                                                />

                                                <MoneyCell
                                                    value={
                                                        row.periodDebit
                                                    }
                                                />

                                                <MoneyCell
                                                    value={
                                                        row.periodCredit
                                                    }
                                                />

                                                <MoneyCell
                                                    value={
                                                        row.closingDebit
                                                    }
                                                    strong
                                                />

                                                <MoneyCell
                                                    value={
                                                        row.closingCredit
                                                    }
                                                    strong
                                                />
                                            </tr>
                                        ),
                                    )
                                )}
                            </tbody>

                            <tfoot>
                                <tr className="bg-[var(--color-surface-muted)]">
                                    <td
                                        colSpan={
                                            3
                                        }
                                        className="px-4 py-4 text-right text-sm font-semibold text-[var(--color-text-primary)]"
                                    >
                                        Totals
                                    </td>

                                    <TotalCell
                                        value={
                                            trialBalance
                                                .totalOpeningDebit
                                        }
                                    />

                                    <TotalCell
                                        value={
                                            trialBalance
                                                .totalOpeningCredit
                                        }
                                    />

                                    <TotalCell
                                        value={
                                            trialBalance
                                                .totalPeriodDebit
                                        }
                                    />

                                    <TotalCell
                                        value={
                                            trialBalance
                                                .totalPeriodCredit
                                        }
                                    />

                                    <TotalCell
                                        value={
                                            trialBalance
                                                .totalClosingDebit
                                        }
                                    />

                                    <TotalCell
                                        value={
                                            trialBalance
                                                .totalClosingCredit
                                        }
                                    />
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="mt-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                        Closing debit
                        balances must equal
                        closing credit
                        balances. Reversed
                        journals remain in
                        the ledger together
                        with their reversal
                        entries so the
                        accounting audit
                        trail is preserved.
                    </div>
                </CardContent>
            </Card>
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

function MoneyCell({
    value,
    strong =
    false,
}: {
    value:
    number;

    strong?:
    boolean;
}) {
    return (
        <td
            className={
                strong
                    ? "whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-[var(--color-text-primary)]"
                    : "whitespace-nowrap px-4 py-3 text-right tabular-nums text-[var(--color-text-secondary)]"
            }
        >
            {value ===
                0
                ? "—"
                : formatMoney(
                    value,
                )}
        </td>
    );
}

function TotalCell({
    value,
}: {
    value:
    number;
}) {
    return (
        <td className="whitespace-nowrap px-4 py-4 text-right font-semibold tabular-nums text-[var(--color-text-primary)]">
            {formatMoney(
                value,
            )}
        </td>
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
                "AUD",
        },
    ).format(
        value,
    );
}

function formatAccountType(
    value:
        string,
) {
    return value
        .toLowerCase()
        .replace(
            /(^|_)(\w)/g,
            (
                _match,
                separator:
                    string,
                letter:
                    string,
            ) =>
                `${separator ? " " : ""}${letter.toUpperCase()}`,
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