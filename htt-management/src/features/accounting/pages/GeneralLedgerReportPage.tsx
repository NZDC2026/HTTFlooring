import {
    useState,
} from "react";

import type {
    ReactNode,
} from "react";

import {
    ArrowLeft,
    BookOpen,
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
    useAccounts,
} from "../data/useAccounting";

import {
    useGeneralLedgerReport,
} from "../data/useGeneralLedgerReport";

export function GeneralLedgerReportPage() {
    const navigate =
        useNavigate();

    const accounts =
        useAccounts();

    const today =
        getToday();

    const [
        accountId,
        setAccountId,
    ] = useState(
        accounts[0]
            ?.id ??
        "",
    );

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

    const report =
        useGeneralLedgerReport(
            accountId,
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

            <div className="mb-7">
                <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                    Accounting
                </p>

                <h1 className="font-display text-3xl font-semibold text-[var(--color-primary)]">
                    General Ledger
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
                    Review opening
                    balance, journal
                    movements and
                    running balance for
                    an individual general
                    ledger account.
                </p>
            </div>

            <Card>
                <CardContent>
                    <div className="grid gap-5 md:grid-cols-3">
                        <Field
                            label="Account"
                        >
                            <select
                                value={
                                    accountId
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setAccountId(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                className={inputClass}
                            >
                                {accounts.map(
                                    (
                                        account,
                                    ) => (
                                        <option
                                            key={
                                                account.id
                                            }
                                            value={
                                                account.id
                                            }
                                        >
                                            {
                                                account.code
                                            }
                                            {" · "}
                                            {
                                                account.name
                                            }
                                        </option>
                                    ),
                                )}
                            </select>
                        </Field>

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
                </CardContent>
            </Card>

            {report ? (
                <>
                    <div className="my-6 grid gap-4 md:grid-cols-4">
                        <SummaryCard
                            label="Opening Balance"
                            value={
                                formatBalance(
                                    report.openingBalance,
                                    report.account.type,
                                )
                            }
                        />

                        <SummaryCard
                            label="Period Debits"
                            value={
                                formatMoney(
                                    report.periodDebit,
                                )
                            }
                        />

                        <SummaryCard
                            label="Period Credits"
                            value={
                                formatMoney(
                                    report.periodCredit,
                                )
                            }
                        />

                        <SummaryCard
                            label="Closing Balance"
                            value={
                                formatBalance(
                                    report.closingBalance,
                                    report.account.type,
                                )
                            }
                        />
                    </div>

                    <Card>
                        <CardContent>
                            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                                            <BookOpen
                                                size={
                                                    19
                                                }
                                            />
                                        </div>

                                        <div>
                                            <h2 className="font-display text-xl font-semibold text-[var(--color-primary)]">
                                                {
                                                    report
                                                        .account
                                                        .code
                                                }
                                                {" · "}
                                                {
                                                    report
                                                        .account
                                                        .name
                                                }
                                            </h2>

                                            <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
                                                {
                                                    report.fromDate
                                                }
                                                {" to "}
                                                {
                                                    report.toDate
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Badge
                                    variant={
                                        report
                                            .account
                                            .active
                                            ? "success"
                                            : "neutral"
                                    }
                                >
                                    {report
                                        .account
                                        .active
                                        ? "Active"
                                        : "Inactive"}
                                </Badge>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                                <table className="w-full min-w-[1200px] border-collapse">
                                    <thead>
                                        <tr className="bg-[var(--color-surface-muted)]">
                                            <Header>
                                                Date
                                            </Header>

                                            <Header>
                                                Journal
                                            </Header>

                                            <Header>
                                                Source
                                            </Header>

                                            <Header>
                                                Description
                                            </Header>

                                            <Header>
                                                Reference
                                            </Header>

                                            <Header align="right">
                                                Debit
                                            </Header>

                                            <Header align="right">
                                                Credit
                                            </Header>

                                            <Header align="right">
                                                Running Balance
                                            </Header>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/50">
                                            <td
                                                colSpan={
                                                    7
                                                }
                                                className="px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]"
                                            >
                                                Opening Balance
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-[var(--color-text-primary)]">
                                                {formatBalance(
                                                    report.openingBalance,
                                                    report.account.type,
                                                )}
                                            </td>
                                        </tr>

                                        {report
                                            .transactions
                                            .length ===
                                            0 ? (
                                            <tr>
                                                <td
                                                    colSpan={
                                                        8
                                                    }
                                                    className="px-4 py-12 text-center text-sm text-[var(--color-text-muted)]"
                                                >
                                                    No
                                                    journal
                                                    activity
                                                    exists
                                                    for this
                                                    account
                                                    during
                                                    the
                                                    selected
                                                    period.
                                                </td>
                                            </tr>
                                        ) : (
                                            report.transactions.map(
                                                (
                                                    transaction,
                                                ) => (
                                                    <tr
                                                        key={
                                                            transaction.lineId
                                                        }
                                                        className="border-b border-[var(--color-border)] last:border-b-0"
                                                    >
                                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                                                            {
                                                                transaction.journalDate
                                                            }
                                                        </td>

                                                        <td className="whitespace-nowrap px-4 py-3">
                                                            <button
                                                                type="button"
                                                                className="font-medium text-[var(--color-primary)] hover:underline"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/accounting/journals/${transaction.journalEntryId}`,
                                                                    )
                                                                }
                                                            >
                                                                {
                                                                    transaction.journalNumber
                                                                }
                                                            </button>
                                                        </td>

                                                        <td className="whitespace-nowrap px-4 py-3">
                                                            <Badge variant="neutral">
                                                                {formatSourceType(
                                                                    transaction.sourceType,
                                                                )}
                                                            </Badge>
                                                        </td>

                                                        <td className="min-w-64 px-4 py-3 text-sm text-[var(--color-text-primary)]">
                                                            {transaction.lineDescription ||
                                                                transaction.description}
                                                        </td>

                                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                                                            {transaction.reference ||
                                                                "—"}
                                                        </td>

                                                        <MoneyCell
                                                            value={
                                                                transaction.debit
                                                            }
                                                        />

                                                        <MoneyCell
                                                            value={
                                                                transaction.credit
                                                            }
                                                        />

                                                        <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-[var(--color-text-primary)]">
                                                            {formatBalance(
                                                                transaction.runningBalance,
                                                                report.account.type,
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
                                                    5
                                                }
                                                className="px-4 py-4 text-right text-sm font-semibold text-[var(--color-text-primary)]"
                                            >
                                                Period Totals
                                            </td>

                                            <TotalCell
                                                value={
                                                    report.periodDebit
                                                }
                                            />

                                            <TotalCell
                                                value={
                                                    report.periodCredit
                                                }
                                            />

                                            <td className="whitespace-nowrap px-4 py-4 text-right font-semibold tabular-nums text-[var(--color-text-primary)]">
                                                {formatBalance(
                                                    report.closingBalance,
                                                    report.account.type,
                                                )}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div className="mt-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                                Running balance
                                uses the natural
                                balance direction
                                of the selected
                                account. Asset and
                                expense accounts
                                increase with
                                debits; liability,
                                equity and revenue
                                accounts increase
                                with credits.
                            </div>
                        </CardContent>
                    </Card>
                </>
            ) : (
                <Card className="mt-6">
                    <CardContent>
                        <p className="py-10 text-center text-sm text-[var(--color-text-muted)]">
                            Select a general
                            ledger account to
                            view its activity.
                        </p>
                    </CardContent>
                </Card>
            )}
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
        <label className="block">
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
}: {
    value:
    number;
}) {
    return (
        <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-[var(--color-text-secondary)]">
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

function formatBalance(
    value:
        number,

    accountType:
        string,
) {
    if (
        value ===
        0
    ) {
        return formatMoney(
            0,
        );
    }

    const normalSide =
        accountType ===
            "ASSET" ||
            accountType ===
            "EXPENSE"
            ? "Dr"
            : "Cr";

    const oppositeSide =
        normalSide ===
            "Dr"
            ? "Cr"
            : "Dr";

    return `${formatMoney(
        Math.abs(
            value,
        ),
    )} ${value >
            0
            ? normalSide
            : oppositeSide
        }`;
}

function formatSourceType(
    value:
        string,
) {
    return value
        .toLowerCase()
        .replace(
            /_/g,
            " ",
        )
        .replace(
            /\b\w/g,
            (
                letter,
            ) =>
                letter.toUpperCase(),
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

const inputClass =
    "h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none transition hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]";