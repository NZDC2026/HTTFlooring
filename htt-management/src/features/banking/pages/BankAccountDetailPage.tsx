import {
    useState,
} from "react";

import {
    ArrowLeft,
    Landmark,
} from "lucide-react";

import {
    Navigate,
    useNavigate,
    useParams,
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
    useBankAccount,
    useBankRegister,
} from "../data/useBanking";

export function BankAccountDetailPage() {
    const navigate =
        useNavigate();

    const {
        bankAccountId,
    } = useParams();

    const [
        asOfDate,
        setAsOfDate,
    ] = useState(
        getToday(),
    );

    const bankAccount =
        useBankAccount(
            bankAccountId,
        );

    const register =
        useBankRegister(
            bankAccountId,
            asOfDate,
        );

    if (
        !bankAccount ||
        !register
    ) {
        return (
            <Navigate
                to="/banking"
                replace
            />
        );
    }

    return (
        <div className="pb-8">
            <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                    navigate(
                        "/banking",
                    )
                }
                className="mb-5"
            >
                <ArrowLeft
                    size={
                        15
                    }
                />

                Banking
            </Button>

            <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        Bank Register
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="font-display text-3xl font-semibold text-[var(--color-primary)]">
                            {
                                bankAccount.name
                            }
                        </h1>

                        <Badge
                            variant={
                                bankAccount.active
                                    ? "success"
                                    : "neutral"
                            }
                        >
                            {bankAccount.active
                                ? "Active"
                                : "Inactive"}
                        </Badge>
                    </div>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        {
                            bankAccount.bankName
                        }
                        {" · "}
                        {
                            bankAccount.accountNumber
                        }
                        {" · "}
                        {
                            bankAccount.currency
                        }
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

            <div className="mb-6 grid gap-4 md:grid-cols-4">
                <SummaryCard
                    label="Opening Balance"
                    value={
                        formatMoney(
                            register
                                .openingBalance,
                        )
                    }
                />

                <SummaryCard
                    label="Money In"
                    value={
                        formatMoney(
                            register
                                .moneyIn,
                        )
                    }
                />

                <SummaryCard
                    label="Money Out"
                    value={
                        formatMoney(
                            register
                                .moneyOut,
                        )
                    }
                />

                <SummaryCard
                    label="Closing Balance"
                    value={
                        formatMoney(
                            register
                                .closingBalance,
                        )
                    }
                />
            </div>

            <Card>
                <CardContent>
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                            <Landmark
                                size={
                                    19
                                }
                            />
                        </div>

                        <div>
                            <h2 className="font-display text-xl font-semibold text-[var(--color-primary)]">
                                Transactions
                            </h2>

                            <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
                                {
                                    register.transactionCount
                                }{" "}
                                bank register
                                transaction
                                {
                                    register.transactionCount ===
                                        1
                                        ? ""
                                        : "s"
                                }{" "}
                                through{" "}
                                {
                                    asOfDate
                                }
                                .
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[var(--color-background-subtle)]">
                                    <TableHeader>
                                        Date
                                    </TableHeader>

                                    <TableHeader>
                                        Journal
                                    </TableHeader>

                                    <TableHeader>
                                        Description
                                    </TableHeader>

                                    <TableHeader>
                                        Reference
                                    </TableHeader>

                                    <TableHeader align="right">
                                        Money In
                                    </TableHeader>

                                    <TableHeader align="right">
                                        Money Out
                                    </TableHeader>

                                    <TableHeader align="right">
                                        Balance
                                    </TableHeader>
                                </tr>
                            </thead>

                            <tbody>
                                {register
                                    .transactions
                                    .length ===
                                    0 ? (
                                    <tr>
                                        <td
                                            colSpan={
                                                7
                                            }
                                            className="px-4 py-10 text-center text-sm text-[var(--color-text-muted)]"
                                        >
                                            No bank
                                            transactions
                                            exist through
                                            this date.
                                        </td>
                                    </tr>
                                ) : (
                                    register
                                        .transactions
                                        .map(
                                            (
                                                transaction,
                                            ) => (
                                                <tr
                                                    key={
                                                        transaction.id
                                                    }
                                                    className="border-b border-[var(--color-border)] last:border-b-0"
                                                >
                                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                                                        {
                                                            transaction.transactionDate
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

                                                    <td className="min-w-64 px-4 py-3 text-sm text-[var(--color-text-primary)]">
                                                        {
                                                            transaction.description
                                                        }
                                                    </td>

                                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                                                        {
                                                            transaction.reference ??
                                                            "—"
                                                        }
                                                    </td>

                                                    <MoneyCell
                                                        value={
                                                            transaction.moneyIn
                                                        }
                                                    />

                                                    <MoneyCell
                                                        value={
                                                            transaction.moneyOut
                                                        }
                                                    />

                                                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-[var(--color-primary)]">
                                                        {formatMoney(
                                                            transaction.runningBalance,
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )
                                )}
                            </tbody>
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

function TableHeader({
    children,
    align =
    "left",
}: {
    children:
    React.ReactNode;

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
        <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-[var(--color-text-primary)]">
            {value ===
                0
                ? "—"
                : formatMoney(
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