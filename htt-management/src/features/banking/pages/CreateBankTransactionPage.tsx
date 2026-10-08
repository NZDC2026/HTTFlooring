import {
    useMemo,
    useState,
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
    useAccounts,
} from "../../accounting/data/useAccounting";

import {
    useBankAccounts,
} from "../data/useBanking";

import {
    bankAccountRepository,
} from "../data/bankAccountRepository";

import {
    bankTransactionRepository,
} from "../data/bankTransactionRepository";

import type {
    BankTransactionDirection,
} from "../types/bankTransaction";

export function CreateBankTransactionPage() {
    const navigate =
        useNavigate();

    const bankAccounts =
        useBankAccounts();

    const accounts =
        useAccounts();

    const activeBankAccounts =
        useMemo(
            () =>
                bankAccounts.filter(
                    (bankAccount) =>
                        bankAccount.active,
                ),
            [
                bankAccounts,
            ],
        );

    const offsetAccounts =
        useMemo(
            () =>
                accounts.filter(
                    (account) =>
                        account.active &&
                        account.allowManualPosting &&
                        !bankAccountRepository
                            .getByGlAccountId(
                                account.id,
                            ),
                ),
            [
                accounts,
                bankAccounts,
            ],
        );

    const [
        bankAccountId,
        setBankAccountId,
    ] = useState(
        activeBankAccounts[0]
            ?.id ??
        "",
    );

    const [
        transactionDate,
        setTransactionDate,
    ] = useState(
        getToday(),
    );

    const [
        direction,
        setDirection,
    ] =
        useState<BankTransactionDirection>(
            "MONEY_OUT",
        );

    const [
        amount,
        setAmount,
    ] = useState(
        "",
    );

    const [
        offsetAccountId,
        setOffsetAccountId,
    ] = useState(
        offsetAccounts[0]
            ?.id ??
        "",
    );

    const [
        description,
        setDescription,
    ] = useState(
        "",
    );

    const [
        reference,
        setReference,
    ] = useState(
        "",
    );

    const [
        error,
        setError,
    ] =
        useState<string | null>(
            null,
        );

    function handleSubmit(
        event:
            React.FormEvent,
    ) {
        event.preventDefault();

        setError(
            null,
        );

        try {
            const transaction =
                bankTransactionRepository
                    .createTransaction(
                        {
                            bankAccountId,
                            transactionDate,
                            direction,

                            amount:
                                Number(
                                    amount,
                                ),

                            offsetAccountId,
                            description,
                            reference,
                        },
                    );

            navigate(
                `/accounting/journals/${transaction.journalEntryId}`,
            );
        } catch (
        caughtError
        ) {
            setError(
                caughtError instanceof
                    Error
                    ? caughtError.message
                    : "Unable to create bank transaction.",
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

            <div className="mb-7">
                <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                    Banking
                </p>

                <h1 className="font-display text-3xl font-semibold text-[var(--color-primary)]">
                    New Bank Transaction
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
                    Record money in or
                    money out directly
                    against an eligible
                    general ledger
                    account.
                </p>
            </div>

            <form
                onSubmit={
                    handleSubmit
                }
            >
                <Card>
                    <CardContent>
                        <div className="grid gap-5 md:grid-cols-2">
                            <Field
                                label="Bank Account"
                            >
                                <select
                                    value={
                                        bankAccountId
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setBankAccountId(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    className={inputClass}
                                >
                                    {activeBankAccounts.map(
                                        (
                                            bankAccount,
                                        ) => (
                                            <option
                                                key={
                                                    bankAccount.id
                                                }
                                                value={
                                                    bankAccount.id
                                                }
                                            >
                                                {
                                                    bankAccount.name
                                                }
                                                {" · "}
                                                {
                                                    bankAccount.accountNumber
                                                }
                                            </option>
                                        ),
                                    )}
                                </select>
                            </Field>

                            <Field
                                label="Date"
                            >
                                <Input
                                    type="date"
                                    value={
                                        transactionDate
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setTransactionDate(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />
                            </Field>

                            <Field
                                label="Direction"
                            >
                                <select
                                    value={
                                        direction
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setDirection(
                                            event
                                                .target
                                                .value as BankTransactionDirection,
                                        )
                                    }
                                    className={inputClass}
                                >
                                    <option value="MONEY_IN">
                                        Money In
                                    </option>

                                    <option value="MONEY_OUT">
                                        Money Out
                                    </option>
                                </select>
                            </Field>

                            <Field
                                label="Amount"
                            >
                                <Input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={
                                        amount
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setAmount(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="0.00"
                                />
                            </Field>

                            <Field
                                label="Offset Account"
                            >
                                <select
                                    value={
                                        offsetAccountId
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setOffsetAccountId(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    className={inputClass}
                                >
                                    {offsetAccounts.map(
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
                                label="Reference"
                            >
                                <Input
                                    value={
                                        reference
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setReference(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />
                            </Field>

                            <div className="md:col-span-2">
                                <Field
                                    label="Description"
                                >
                                    <Input
                                        value={
                                            description
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setDescription(
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        placeholder="e.g. Monthly bank fee"
                                    />
                                </Field>
                            </div>
                        </div>

                        {error && (
                            <div className="mt-5 rounded-lg border border-[var(--color-danger)] px-4 py-3 text-sm text-[var(--color-danger)]">
                                {
                                    error
                                }
                            </div>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    navigate(
                                        "/banking",
                                    )
                                }
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                            >
                                Post Transaction
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
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

const inputClass =
    "h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none transition hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]";

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