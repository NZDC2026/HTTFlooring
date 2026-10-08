import {
    useMemo,
} from "react";

import {
    ArrowRight,
    Building2,
    Landmark,
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
    useBankAccounts,
} from "../data/useBanking";

import {
    useJournalEntries,
} from "../../accounting/data/useAccounting";

import {
    calculateBankRegister,
} from "../data/bankRegisterService";

export function BankingPage() {
    const navigate =
        useNavigate();

    const bankAccounts =
        useBankAccounts();

    const journalEntries =
        useJournalEntries();

    const today =
        getToday();

    const rows =
        useMemo(
            () =>
                bankAccounts
                    .map(
                        (
                            bankAccount,
                        ) => {
                            const register =
                                calculateBankRegister(
                                    bankAccount,
                                    journalEntries,
                                    today,
                                );

                            return {
                                bankAccount,
                                register,
                            };
                        },
                    )
                    .sort(
                        (
                            first,
                            second,
                        ) =>
                            first.bankAccount.name.localeCompare(
                                second.bankAccount.name,
                            ),
                    ),
            [
                bankAccounts,
                journalEntries,
                today,
            ],
        );

    const totalBalance =
        rows.reduce(
            (
                total,
                row,
            ) =>
                total +
                row.register
                    .closingBalance,
            0,
        );

    return (
        <div className="pb-8">
            <div className="mb-7">
                <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                    Finance
                </p>

                <h1 className="font-display text-3xl font-semibold text-[var(--color-primary)]">
                    Banking
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
                    Review bank
                    accounts and the
                    accounting
                    transactions that
                    make up each bank
                    register.
                </p>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-3">
                <SummaryCard
                    label="Bank Accounts"
                    value={
                        String(
                            bankAccounts
                                .length,
                        )
                    }
                />

                <SummaryCard
                    label="Active Accounts"
                    value={
                        String(
                            bankAccounts
                                .filter(
                                    (
                                        account,
                                    ) =>
                                        account.active,
                                )
                                .length,
                        )
                    }
                />

                <SummaryCard
                    label="Total Bank Balance"
                    value={
                        formatMoney(
                            totalBalance,
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
                                Bank Accounts
                            </h2>

                            <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
                                Each bank
                                account is
                                linked to a
                                general ledger
                                account.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
                        {rows.map(
                            ({
                                bankAccount,
                                register,
                            }) => (
                                <div
                                    key={
                                        bankAccount.id
                                    }
                                    className="flex flex-col gap-4 border-b border-[var(--color-border)] px-4 py-4 last:border-b-0 md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 text-[var(--color-primary)]">
                                            <Building2
                                                size={
                                                    18
                                                }
                                            />
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-semibold text-[var(--color-text-primary)]">
                                                    {
                                                        bankAccount.name
                                                    }
                                                </span>

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

                                            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
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
                                    </div>

                                    <div className="flex items-center justify-between gap-6 md:justify-end">
                                        <div className="text-right">
                                            <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                                                Balance
                                            </p>

                                            <p className="mt-1 font-display text-xl font-semibold tabular-nums text-[var(--color-primary)]">
                                                {formatMoney(
                                                    register
                                                        .closingBalance,
                                                )}
                                            </p>
                                        </div>

                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() =>
                                                navigate(
                                                    `/banking/accounts/${bankAccount.id}`,
                                                )
                                            }
                                        >
                                            View Register

                                            <ArrowRight
                                                size={
                                                    14
                                                }
                                            />
                                        </Button>
                                    </div>
                                </div>
                            ),
                        )}
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