import {
    CircleDollarSign,
    CreditCard,
    ReceiptText,
    WalletCards,
} from "lucide-react";

import type {
    CustomerAccountsReceivable,
} from "../types/accountsReceivable";

interface CustomerAgingSummaryProps {
    accountsReceivable:
    CustomerAccountsReceivable;
}

export function CustomerAgingSummary({
    accountsReceivable,
}: CustomerAgingSummaryProps) {
    const ar =
        accountsReceivable;

    return (
        <div className="mb-5 space-y-4">
            <div>
                <div className="mb-3 flex items-end justify-between">
                    <div>
                        <h3 className="text-sm font-semibold">
                            Accounts Receivable
                        </h3>

                        <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                            Current customer
                            balance and credit
                            exposure.
                        </p>
                    </div>

                    <div className="text-[11px] text-[var(--color-text-muted)]">
                        {
                            ar.outstandingInvoiceCount
                        }{" "}
                        outstanding{" "}
                        {ar.outstandingInvoiceCount ===
                            1
                            ? "invoice"
                            : "invoices"}
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    <AccountCard
                        icon={
                            CircleDollarSign
                        }
                        label="Invoice AR"
                        value={formatMoney(
                            ar.totalOutstanding,
                        )}
                        detail={`${ar.outstandingInvoiceCount} outstanding ${ar.outstandingInvoiceCount ===
                            1
                            ? "invoice"
                            : "invoices"
                            }`}
                    />

                    <AccountCard
                        icon={
                            WalletCards
                        }
                        label="Unallocated Credits"
                        value={formatMoney(
                            ar.unallocatedCredit,
                        )}
                        detail="Available customer credit"
                        credit={
                            ar.unallocatedCredit >
                            0
                        }
                    />

                    <AccountCard
                        icon={
                            CircleDollarSign
                        }
                        label="Net Account Balance"
                        value={formatMoney(
                            ar.netAccountBalance,
                        )}
                        detail={
                            ar.netAccountBalance <
                                0
                                ? "Customer is in credit"
                                : "Net amount owing"
                        }
                        credit={
                            ar.netAccountBalance <
                            0
                        }
                    />

                    <AccountCard
                        icon={
                            CreditCard
                        }
                        label="Available Credit"
                        value={formatMoney(
                            ar.availableCredit,
                        )}
                        detail={`Limit ${formatMoney(
                            ar.creditLimit,
                        )}`}
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                    <div className="flex items-center gap-2">
                        <ReceiptText
                            size={15}
                            className="text-[var(--color-accent)]"
                        />

                        <div>
                            <h3 className="text-sm font-semibold">
                                Aged Receivables
                            </h3>

                            <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                Outstanding
                                balances grouped
                                by invoice due
                                date.
                            </p>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="money text-sm font-semibold text-[var(--color-primary)]">
                            {formatMoney(
                                ar.totalOutstanding,
                            )}
                        </div>

                        <div
                            className={[
                                "mt-1 text-[10px]",
                                ar.overdueAmount >
                                    0
                                    ? "text-[var(--color-danger)]"
                                    : "text-[var(--color-text-muted)]",
                            ].join(" ")}
                        >
                            {ar.overdueAmount >
                                0
                                ? `${formatMoney(
                                    ar.overdueAmount,
                                )} overdue`
                                : "No overdue balance"}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-5 divide-x divide-[var(--color-border)]">
                    <AgingBucket
                        label="Current"
                        value={
                            ar.aging
                                .current
                        }
                    />

                    <AgingBucket
                        label="1–30 Days"
                        value={
                            ar.aging
                                .days1To30
                        }
                        overdue
                    />

                    <AgingBucket
                        label="31–60 Days"
                        value={
                            ar.aging
                                .days31To60
                        }
                        overdue
                    />

                    <AgingBucket
                        label="61–90 Days"
                        value={
                            ar.aging
                                .days61To90
                        }
                        overdue
                    />

                    <AgingBucket
                        label="90+ Days"
                        value={
                            ar.aging
                                .days90Plus
                        }
                        overdue
                    />
                </div>
            </div>
        </div>
    );
}

function AccountCard({
    icon: Icon,
    label,
    value,
    detail,
    danger = false,
    credit = false,
}: {
    icon:
    typeof CircleDollarSign;

    label: string;
    value: string;
    detail?: string;
    danger?: boolean;
    credit?: boolean;
}) {
    return (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white px-5 py-4 shadow-[var(--shadow-xs)]">
            <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-secondary)]">
                    {label}
                </span>

                <Icon
                    size={15}
                    className={
                        danger
                            ? "text-[var(--color-danger)]"
                            : credit
                                ? "text-[var(--color-accent)]"
                                : "text-[var(--color-text-muted)]"
                    }
                />
            </div>

            <div
                className={[
                    "money mt-3 text-xl font-semibold",

                    danger
                        ? "text-[var(--color-danger)]"
                        : credit
                            ? "text-[var(--color-accent)]"
                            : "text-[var(--color-primary)]",
                ].join(" ")}
            >
                {value}
            </div>

            {detail && (
                <div className="mt-2 text-[10px] text-[var(--color-text-muted)]">
                    {detail}
                </div>
            )}
        </div>
    );
}

function AgingBucket({
    label,
    value,
    overdue = false,
}: {
    label: string;
    value: number;
    overdue?: boolean;
}) {
    const hasBalance =
        value > 0;

    return (
        <div className="px-5 py-5">
            <div className="text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                {label}
            </div>

            <div
                className={[
                    "money mt-3 text-lg font-semibold",
                    overdue &&
                        hasBalance
                        ? "text-[var(--color-danger)]"
                        : "text-[var(--color-primary)]",
                ].join(" ")}
            >
                {formatMoney(
                    value,
                )}
            </div>
        </div>
    );
}

function formatMoney(
    value: number,
) {
    return value.toLocaleString(
        "en-AU",
        {
            style: "currency",
            currency: "AUD",
            minimumFractionDigits: 2,
        },
    );
}