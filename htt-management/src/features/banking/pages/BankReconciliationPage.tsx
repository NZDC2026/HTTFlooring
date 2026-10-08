import {
    useMemo,
    useState,
    useSyncExternalStore,
} from "react";

import {
    ArrowLeft,
    CheckCircle2,
    Scale,
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

import {
    bankReconciliationRepository,
} from "../data/bankReconciliationRepository";

import {
    calculateBankReconciliation,
} from "../data/bankReconciliationService";

export function BankReconciliationPage() {
    const navigate =
        useNavigate();

    const {
        bankAccountId,
    } = useParams();

    const reconciliations =
        useSyncExternalStore(
            bankReconciliationRepository
                .subscribe,
            bankReconciliationRepository
                .getSnapshot,
            bankReconciliationRepository
                .getSnapshot,
        );

    const bankAccount =
        useBankAccount(
            bankAccountId,
        );

    const latestReconciliation =
        useMemo(
            () => {
                if (
                    !bankAccountId
                ) {
                    return undefined;
                }

                return reconciliations
                    .filter(
                        (
                            reconciliation,
                        ) =>
                            reconciliation.bankAccountId ===
                            bankAccountId,
                    )
                    .sort(
                        (
                            first,
                            second,
                        ) =>
                            second.statementDate.localeCompare(
                                first.statementDate,
                            ),
                    )[0];
            },
            [
                reconciliations,
                bankAccountId,
            ],
        );

    const [
        statementDate,
        setStatementDate,
    ] = useState(
        getToday(),
    );

    const [
        statementBalance,
        setStatementBalance,
    ] = useState(
        "",
    );

    const [
        selectedIds,
        setSelectedIds,
    ] =
        useState<Set<string>>(
            () =>
                new Set(),
        );

    const [
        error,
        setError,
    ] =
        useState<string | null>(
            null,
        );

    const [
        success,
        setSuccess,
    ] =
        useState<string | null>(
            null,
        );

    const register =
        useBankRegister(
            bankAccountId,
            statementDate,
        );

    const previouslyClearedIds =
        useMemo(
            () => {
                if (
                    !bankAccountId
                ) {
                    return new Set<string>();
                }

                const ids =
                    new Set<string>();

                for (
                    const reconciliation
                    of reconciliations
                ) {
                    if (
                        reconciliation.bankAccountId !==
                        bankAccountId
                    ) {
                        continue;
                    }

                    for (
                        const id
                        of reconciliation
                            .clearedTransactionIds
                    ) {
                        ids.add(
                            id,
                        );
                    }
                }

                return ids;
            },
            [
                reconciliations,
                bankAccountId,
            ],
        );

    const calculation =
        useMemo(
            () => {
                if (
                    !register
                ) {
                    return undefined;
                }

                const allCleared =
                    new Set<string>([
                        ...previouslyClearedIds,
                        ...selectedIds,
                    ]);

                return calculateBankReconciliation(
                    register,
                    Number(
                        statementBalance ||
                        0,
                    ),
                    Array.from(
                        allCleared,
                    ),
                );
            },
            [
                register,
                statementBalance,
                previouslyClearedIds,
                selectedIds,
            ],
        );

    if (
        !bankAccount ||
        !register ||
        !calculation
    ) {
        return (
            <Navigate
                to="/banking"
                replace
            />
        );
    }

    const resolvedBankAccountId = bankAccount.id;

    const availableTransactions =
        register.transactions.filter(
            (transaction) =>
                !previouslyClearedIds.has(
                    transaction.id,
                ),
        );

    function toggleTransaction(
        transactionId:
            string,
    ) {
        setSelectedIds(
            (
                current,
            ) => {
                const next =
                    new Set(
                        current,
                    );

                if (
                    next.has(
                        transactionId,
                    )
                ) {
                    next.delete(
                        transactionId,
                    );
                } else {
                    next.add(
                        transactionId,
                    );
                }

                return next;
            },
        );

        setError(
            null,
        );

        setSuccess(
            null,
        );
    }

    function handleComplete() {
        setError(
            null,
        );

        setSuccess(
            null,
        );

        try {
            if (
                statementBalance.trim() ===
                ""
            ) {
                throw new Error(
                    "Statement balance is required.",
                );
            }

            const result =
                bankReconciliationRepository
                    .complete(
                        {
                            bankAccountId:
                                resolvedBankAccountId,

                            statementDate,

                            statementBalance:
                                Number(
                                    statementBalance,
                                ),

                            clearedTransactionIds:
                                Array.from(
                                    selectedIds,
                                ),
                        },
                    );

            setSelectedIds(
                new Set(),
            );

            setSuccess(
                `${result.reconciliationNumber} completed successfully.`,
            );
        } catch (
        caughtError
        ) {
            setError(
                caughtError instanceof
                    Error
                    ? caughtError.message
                    : "Unable to complete bank reconciliation.",
            );
        }
    }

    return (
        <div className="pb-8">
            <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                    navigate(
                        `/banking/accounts/${bankAccount.id}`,
                    )
                }
                className="mb-5"
            >
                <ArrowLeft
                    size={
                        15
                    }
                />

                Bank Register
            </Button>

            <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        Banking
                    </p>

                    <h1 className="font-display text-3xl font-semibold text-[var(--color-primary)]">
                        Bank Reconciliation
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        {
                            bankAccount.name
                        }
                        {" · "}
                        {
                            bankAccount.accountNumber
                        }
                    </p>
                </div>

                {latestReconciliation && (
                    <div className="text-sm text-[var(--color-text-secondary)]">
                        Last reconciled:{" "}
                        <span className="font-medium text-[var(--color-text-primary)]">
                            {
                                latestReconciliation.statementDate
                            }
                        </span>
                    </div>
                )}
            </div>

            <Card>
                <CardContent>
                    <div className="grid gap-5 md:grid-cols-2">
                        <Field
                            label="Statement Date"
                        >
                            <Input
                                type="date"
                                value={
                                    statementDate
                                }
                                onChange={(
                                    event,
                                ) => {
                                    setStatementDate(
                                        event
                                            .target
                                            .value,
                                    );

                                    setSelectedIds(
                                        new Set(),
                                    );

                                    setError(
                                        null,
                                    );

                                    setSuccess(
                                        null,
                                    );
                                }}
                            />
                        </Field>

                        <Field
                            label="Statement Closing Balance"
                        >
                            <Input
                                type="number"
                                step="0.01"
                                value={
                                    statementBalance
                                }
                                onChange={(
                                    event,
                                ) => {
                                    setStatementBalance(
                                        event
                                            .target
                                            .value,
                                    );

                                    setError(
                                        null,
                                    );

                                    setSuccess(
                                        null,
                                    );
                                }}
                                placeholder="0.00"
                            />
                        </Field>
                    </div>
                </CardContent>
            </Card>

            <div className="my-6 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                <SummaryCard
                    label="Statement Balance"
                    value={
                        formatMoney(
                            Number(
                                statementBalance ||
                                0,
                            ),
                        )
                    }
                />

                <SummaryCard
                    label="Outstanding Deposits"
                    value={
                        formatMoney(
                            calculation
                                .outstandingDeposits,
                        )
                    }
                />

                <SummaryCard
                    label="Outstanding Payments"
                    value={
                        formatMoney(
                            calculation
                                .outstandingPayments,
                        )
                    }
                />

                <SummaryCard
                    label="Adjusted Statement"
                    value={
                        formatMoney(
                            calculation
                                .adjustedStatementBalance,
                        )
                    }
                />

                <SummaryCard
                    label="Book Balance"
                    value={
                        formatMoney(
                            calculation
                                .bookBalance,
                        )
                    }
                />

                <Card>
                    <CardContent>
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                            Difference
                        </p>

                        <p className="mt-2 font-display text-2xl font-semibold text-[var(--color-primary)]">
                            {formatMoney(
                                calculation
                                    .difference,
                            )}
                        </p>

                        <div className="mt-2">
                            <Badge
                                variant={
                                    calculation.reconciled
                                        ? "success"
                                        : "neutral"
                                }
                            >
                                {calculation.reconciled
                                    ? "Reconciled"
                                    : "Out of Balance"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent>
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                            <Scale
                                size={
                                    19
                                }
                            />
                        </div>

                        <div>
                            <h2 className="font-display text-xl font-semibold text-[var(--color-primary)]">
                                Statement Transactions
                            </h2>

                            <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
                                Tick each
                                book
                                transaction
                                that appears
                                on the bank
                                statement.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[var(--color-background-subtle)]">
                                    <Header>
                                        Cleared
                                    </Header>

                                    <Header>
                                        Date
                                    </Header>

                                    <Header>
                                        Journal
                                    </Header>

                                    <Header>
                                        Description
                                    </Header>

                                    <Header align="right">
                                        Money In
                                    </Header>

                                    <Header align="right">
                                        Money Out
                                    </Header>
                                </tr>
                            </thead>

                            <tbody>
                                {availableTransactions.length ===
                                    0 ? (
                                    <tr>
                                        <td
                                            colSpan={
                                                6
                                            }
                                            className="px-4 py-10 text-center text-sm text-[var(--color-text-muted)]"
                                        >
                                            No
                                            unreconciled
                                            transactions
                                            exist through
                                            this statement
                                            date.
                                        </td>
                                    </tr>
                                ) : (
                                    availableTransactions.map(
                                        (
                                            transaction,
                                        ) => {
                                            const checked =
                                                selectedIds.has(
                                                    transaction.id,
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        transaction.id
                                                    }
                                                    className="border-b border-[var(--color-border)] last:border-b-0"
                                                >
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                checked
                                                            }
                                                            onChange={() =>
                                                                toggleTransaction(
                                                                    transaction.id,
                                                                )
                                                            }
                                                            className="h-4 w-4"
                                                        />
                                                    </td>

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
                                                </tr>
                                            );
                                        },
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex flex-col gap-4 border-t border-[var(--color-border)] pt-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                Selected{" "}
                                <span className="font-semibold text-[var(--color-text-primary)]">
                                    {
                                        selectedIds.size
                                    }
                                </span>{" "}
                                transaction
                                {
                                    selectedIds.size ===
                                        1
                                        ? ""
                                        : "s"
                                }
                                .
                            </p>

                            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                                Difference must
                                be $0.00 before
                                reconciliation
                                can be
                                completed.
                            </p>
                        </div>

                        <Button
                            onClick={
                                handleComplete
                            }
                            disabled={
                                !calculation
                                    .reconciled ||
                                statementBalance.trim() ===
                                ""
                            }
                        >
                            <CheckCircle2
                                size={
                                    16
                                }
                            />

                            Complete Reconciliation
                        </Button>
                    </div>

                    {error && (
                        <div className="mt-5 rounded-lg border border-[var(--color-danger)] px-4 py-3 text-sm text-[var(--color-danger)]">
                            {
                                error
                            }
                        </div>
                    )}

                    {success && (
                        <div className="mt-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-primary)]">
                            {
                                success
                            }
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children:
    React.ReactNode;
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
    label: string;
    value: string;
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