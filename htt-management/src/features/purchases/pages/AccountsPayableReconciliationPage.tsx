import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    FileText,
    Scale,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import {
    useAccountsPayableReconciliation,
} from "../data/useAccountsPayableReconciliation";

export function AccountsPayableReconciliationPage() {
    const navigate =
        useNavigate();

    const reconciliation =
        useAccountsPayableReconciliation();

    return (
        <div className="pb-8">
            <button
                type="button"
                onClick={() =>
                    navigate(
                        "/purchases/payables",
                    )
                }
                className="mb-5 flex items-center gap-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            >
                <ArrowLeft
                    size={14}
                />

                Back to Accounts Payable
            </button>

            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        Finance Control
                    </p>

                    <h1 className="font-display text-[34px] leading-tight">
                        AP Reconciliation
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Cross-check supplier
                        bills, supplier
                        accounts, aged
                        payables and supplier
                        statements.
                    </p>
                </div>

                <div className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">
                        As At
                    </div>

                    <div className="mt-0.5 text-sm font-semibold">
                        {
                            reconciliation.asOfDate
                        }
                    </div>
                </div>
            </div>

            <div
                className={[
                    "mb-5 flex items-center justify-between rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-xs)]",

                    reconciliation.balanced
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-red-200 bg-red-50",
                ].join(
                    " ",
                )}
            >
                <div className="flex items-center gap-4">
                    <div
                        className={[
                            "flex h-11 w-11 items-center justify-center rounded-full",

                            reconciliation.balanced
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700",
                        ].join(
                            " ",
                        )}
                    >
                        {reconciliation.balanced ? (
                            <CheckCircle2
                                size={
                                    22
                                }
                            />
                        ) : (
                            <AlertTriangle
                                size={
                                    22
                                }
                            />
                        )}
                    </div>

                    <div>
                        <div
                            className={[
                                "font-display text-xl",

                                reconciliation.balanced
                                    ? "text-emerald-800"
                                    : "text-red-800",
                            ].join(
                                " ",
                            )}
                        >
                            {reconciliation.balanced
                                ? "RECONCILED"
                                : "NOT RECONCILED"}
                        </div>

                        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                            {reconciliation.balanced
                                ? "All Accounts Payable control balances agree."
                                : `${reconciliation.mismatchCount} supplier account(s) require investigation.`}
                        </p>
                    </div>
                </div>

                <Scale
                    size={
                        28
                    }
                    className="text-[var(--color-text-muted)]"
                />
            </div>

            <div className="mb-5 grid grid-cols-4 gap-4">
                <ControlCard
                    label="Outstanding Bills"
                    value={
                        reconciliation.outstandingSupplierBills
                    }
                    difference={
                        0
                    }
                />

                <ControlCard
                    label="Supplier Accounts"
                    value={
                        reconciliation.supplierAccountBalances
                    }
                    difference={
                        reconciliation.accountDifference
                    }
                />

                <ControlCard
                    label="Aged Payables"
                    value={
                        reconciliation.agedPayablesTotal
                    }
                    difference={
                        reconciliation.agedPayablesDifference
                    }
                />

                <ControlCard
                    label="Statement Control"
                    value={
                        reconciliation.supplierStatementBalances
                    }
                    difference={
                        reconciliation.statementDifference
                    }
                />
            </div>

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                    <div>
                        <h2 className="font-display text-xl">
                            Supplier Reconciliation
                        </h2>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            {
                                reconciliation.supplierCount
                            }{" "}
                            supplier account(s)
                            with AP activity
                        </p>
                    </div>

                    <FileText
                        size={
                            18
                        }
                        className="text-[var(--color-primary)]"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                                <Header>
                                    Supplier
                                </Header>

                                <Header align="right">
                                    Bills
                                </Header>

                                <Header align="right">
                                    Account
                                </Header>

                                <Header align="right">
                                    Aged AP
                                </Header>

                                <Header align="right">
                                    Statement
                                </Header>

                                <Header align="right">
                                    Difference
                                </Header>

                                <Header>
                                    Status
                                </Header>
                            </tr>
                        </thead>

                        <tbody>
                            {reconciliation.rows.length ===
                                0 ? (
                                <tr>
                                    <td
                                        colSpan={
                                            7
                                        }
                                        className="px-5 py-12 text-center text-sm text-[var(--color-text-muted)]"
                                    >
                                        No Accounts
                                        Payable activity
                                        to reconcile.
                                    </td>
                                </tr>
                            ) : (
                                reconciliation.rows.map(
                                    (
                                        row,
                                    ) => (
                                        <tr
                                            key={
                                                row.supplierId
                                            }
                                            className={[
                                                "border-b border-[var(--color-border)] last:border-b-0",

                                                row.balanced
                                                    ? ""
                                                    : "bg-red-50/40",
                                            ].join(
                                                " ",
                                            )}
                                        >
                                            <td className="px-4 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/contacts/suppliers/${row.supplierId}`,
                                                        )
                                                    }
                                                    className="text-left"
                                                >
                                                    <div className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
                                                        {
                                                            row.supplierName
                                                        }
                                                    </div>

                                                    <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                                                        {
                                                            row.supplierCode
                                                        }
                                                    </div>
                                                </button>
                                            </td>

                                            <MoneyCell
                                                value={
                                                    row.billBalance
                                                }
                                            />

                                            <MoneyCell
                                                value={
                                                    row.accountBalance
                                                }
                                            />

                                            <MoneyCell
                                                value={
                                                    row.agedPayablesBalance
                                                }
                                            />

                                            <MoneyCell
                                                value={
                                                    row.statementBalance
                                                }
                                            />

                                            <MoneyCell
                                                value={
                                                    row.difference
                                                }
                                                danger={
                                                    !row.balanced
                                                }
                                            />

                                            <td className="px-4 py-4">
                                                {row.balanced ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                                                        <CheckCircle2
                                                            size={
                                                                12
                                                            }
                                                        />

                                                        Balanced
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-700">
                                                        <AlertTriangle
                                                            size={
                                                                12
                                                            }
                                                        />

                                                        Mismatch
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ),
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-xs leading-5 text-[var(--color-text-secondary)]">
                Reconciliation compares
                current Supplier Bill
                balances against Supplier
                Account balances, Aged
                Payables and Supplier
                Statement closing balances.
                Historical reconciliation
                will be enabled after
                historical bill balances
                are transaction-derived.
            </div>
        </div>
    );
}

function ControlCard({
    label,
    value,
    difference,
}: {
    label: string;
    value: number;
    difference: number;
}) {
    const mismatch =
        Math.abs(
            difference,
        ) >= 0.005;

    return (
        <div
            className={[
                "rounded-[var(--radius-card)] border bg-white p-5 shadow-[var(--shadow-xs)]",

                mismatch
                    ? "border-red-200"
                    : "border-[var(--color-border)]",
            ].join(
                " ",
            )}
        >
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                {label}
            </div>

            <div className="money mt-2 font-display text-2xl">
                {formatMoney(
                    value,
                )}
            </div>

            <div
                className={[
                    "mt-2 text-xs",

                    mismatch
                        ? "font-semibold text-red-700"
                        : "text-[var(--color-text-muted)]",
                ].join(
                    " ",
                )}
            >
                {mismatch
                    ? `Difference ${formatMoney(
                        difference,
                    )}`
                    : "Difference $0.00"}
            </div>
        </div>
    );
}

function Header({
    children,
    align = "left",
}: {
    children:
    React.ReactNode;

    align?:
    | "left"
    | "right";
}) {
    return (
        <th
            className={[
                "h-10 whitespace-nowrap px-4 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]",

                align ===
                    "right"
                    ? "text-right"
                    : "text-left",
            ].join(
                " ",
            )}
        >
            {children}
        </th>
    );
}

function MoneyCell({
    value,
    danger = false,
}: {
    value: number;
    danger?: boolean;
}) {
    return (
        <td
            className={[
                "money whitespace-nowrap px-4 py-4 text-right text-sm",

                danger
                    ? "font-semibold text-red-700"
                    : "",
            ].join(
                " ",
            )}
        >
            {formatMoney(
                value,
            )}
        </td>
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
    ).format(value);
}