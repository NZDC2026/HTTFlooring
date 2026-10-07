import {
    ArrowLeft,
    CalendarDays,
    FileText,
} from "lucide-react";

import {
    useState,
} from "react";

import {
    Navigate,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    supplierRepository,
} from "../../contacts/data/supplierRepository";

import {
    useSupplierStatement,
} from "../data/useSupplierStatement";

import type {
    SupplierStatementEntry,
} from "../types/supplierStatement";

export function SupplierStatementPage() {
    const navigate =
        useNavigate();

    const {
        supplierId,
    } = useParams<{
        supplierId: string;
    }>();

    const today =
        getToday();

    const [
        fromDate,
        setFromDate,
    ] = useState(
        getDefaultFromDate(),
    );

    const [
        toDate,
        setToDate,
    ] = useState(
        today,
    );

    const supplier =
        supplierId
            ? supplierRepository.getById(
                supplierId,
            )
            : undefined;

    const statement =
        useSupplierStatement(
            supplierId,
            fromDate,
            toDate,
        );

    if (
        !supplier ||
        !supplierId
    ) {
        return (
            <Navigate
                to="/contacts/suppliers"
                replace
            />
        );
    }

    if (!statement) {
        return null;
    }

    function openEntry(
        entry:
            SupplierStatementEntry,
    ) {
        if (
            entry.supplierBillId
        ) {
            navigate(
                `/purchases/bills/${entry.supplierBillId}`,
            );

            return;
        }

        if (
            entry.supplierPaymentId
        ) {
            navigate(
                `/purchases/payments/${entry.supplierPaymentId}`,
            );
        }
    }

    return (
        <div className="pb-8">
            <button
                type="button"
                onClick={() =>
                    navigate(
                        `/contacts/suppliers/${supplierId}`,
                    )
                }
                className="mb-5 flex items-center gap-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            >
                <ArrowLeft
                    size={14}
                />

                Back to{" "}
                {
                    supplier.businessName
                }
            </button>

            <div className="mb-7 flex items-end justify-between gap-5">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        Accounts Payable
                    </p>

                    <h1 className="font-display text-[34px] leading-tight">
                        Supplier Statement
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        {
                            supplier.businessName
                        }{" "}
                        ·{" "}
                        {
                            supplier.code
                        }
                    </p>
                </div>

                <div className="flex items-end gap-3">
                    <DateField
                        label="From"
                        value={
                            fromDate
                        }
                        max={
                            toDate
                        }
                        onChange={
                            setFromDate
                        }
                    />

                    <DateField
                        label="To"
                        value={
                            toDate
                        }
                        min={
                            fromDate
                        }
                        max={
                            today
                        }
                        onChange={
                            setToDate
                        }
                    />
                </div>
            </div>

            <div className="mb-5 grid grid-cols-4 gap-4">
                <MetricCard
                    label="Opening Balance"
                    value={
                        statement.openingBalance
                    }
                />

                <MetricCard
                    label="Bills / Credits"
                    value={
                        statement.totalCredits
                    }
                />

                <MetricCard
                    label="Payments / Debits"
                    value={
                        statement.totalDebits
                    }
                />

                <MetricCard
                    label="Closing Balance"
                    value={
                        statement.closingBalance
                    }
                    emphasis
                />
            </div>

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                    <div>
                        <h2 className="font-display text-xl">
                            Account Activity
                        </h2>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            {fromDate} to{" "}
                            {toDate}
                        </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                        <FileText
                            size={18}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                                <Header>
                                    Date
                                </Header>

                                <Header>
                                    Type
                                </Header>

                                <Header>
                                    Reference
                                </Header>

                                <Header>
                                    Description
                                </Header>

                                <Header align="right">
                                    Debit
                                </Header>

                                <Header align="right">
                                    Credit
                                </Header>

                                <Header align="right">
                                    Balance
                                </Header>
                            </tr>
                        </thead>

                        <tbody>
                            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/40">
                                <td
                                    colSpan={
                                        6
                                    }
                                    className="px-4 py-3 text-sm font-semibold"
                                >
                                    Opening
                                    Balance
                                </td>

                                <td className="money px-4 py-3 text-right text-sm font-semibold">
                                    {formatMoney(
                                        statement.openingBalance,
                                    )}
                                </td>
                            </tr>

                            {statement.entries.length ===
                                0 ? (
                                <tr>
                                    <td
                                        colSpan={
                                            7
                                        }
                                        className="px-5 py-12 text-center text-sm text-[var(--color-text-muted)]"
                                    >
                                        No
                                        supplier
                                        account
                                        activity
                                        in this
                                        period.
                                    </td>
                                </tr>
                            ) : (
                                statement.entries.map(
                                    (
                                        entry,
                                    ) => (
                                        <tr
                                            key={
                                                entry.id
                                            }
                                            onClick={() =>
                                                openEntry(
                                                    entry,
                                                )
                                            }
                                            className="cursor-pointer border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-muted)]"
                                        >
                                            <td className="whitespace-nowrap px-4 py-4 text-sm">
                                                {
                                                    entry.date
                                                }
                                            </td>

                                            <td className="px-4 py-4">
                                                <EntryBadge
                                                    type={
                                                        entry.type
                                                    }
                                                />
                                            </td>

                                            <td className="px-4 py-4 text-sm font-semibold text-[var(--color-primary)]">
                                                {
                                                    entry.reference
                                                }
                                            </td>

                                            <td className="px-4 py-4 text-sm text-[var(--color-text-secondary)]">
                                                {
                                                    entry.description
                                                }
                                            </td>

                                            <td className="money px-4 py-4 text-right text-sm">
                                                {entry.debit >
                                                    0
                                                    ? formatMoney(
                                                        entry.debit,
                                                    )
                                                    : "—"}
                                            </td>

                                            <td className="money px-4 py-4 text-right text-sm">
                                                {entry.credit >
                                                    0
                                                    ? formatMoney(
                                                        entry.credit,
                                                    )
                                                    : "—"}
                                            </td>

                                            <td className="money px-4 py-4 text-right text-sm font-semibold">
                                                {formatMoney(
                                                    entry.balance,
                                                )}
                                            </td>
                                        </tr>
                                    ),
                                )
                            )}

                            <tr className="border-t-2 border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                                <td
                                    colSpan={
                                        4
                                    }
                                    className="px-4 py-4 text-sm font-semibold"
                                >
                                    Closing
                                    Balance
                                </td>

                                <td className="money px-4 py-4 text-right text-sm font-semibold">
                                    {formatMoney(
                                        statement.totalDebits,
                                    )}
                                </td>

                                <td className="money px-4 py-4 text-right text-sm font-semibold">
                                    {formatMoney(
                                        statement.totalCredits,
                                    )}
                                </td>

                                <td className="money px-4 py-4 text-right font-display text-lg">
                                    {formatMoney(
                                        statement.closingBalance,
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-xs leading-5 text-[var(--color-text-secondary)]">
                Supplier bills
                increase Accounts
                Payable. Supplier
                payments reduce
                Accounts Payable.
                Reversed payments
                remain visible in
                the audit history
                and restore the
                payable balance.
            </div>
        </div>
    );
}

function DateField({
    label,
    value,
    min,
    max,
    onChange,
}: {
    label: string;
    value: string;
    min?: string;
    max?: string;
    onChange:
    (
        value: string,
    ) => void;
}) {
    return (
        <label>
            <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">
                <CalendarDays
                    size={12}
                />

                {label}
            </span>

            <input
                type="date"
                value={
                    value
                }
                min={
                    min
                }
                max={
                    max
                }
                onChange={(
                    event,
                ) =>
                    onChange(
                        event
                            .target
                            .value,
                    )
                }
                className="h-10 rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            />
        </label>
    );
}

function MetricCard({
    label,
    value,
    emphasis = false,
}: {
    label: string;
    value: number;
    emphasis?: boolean;
}) {
    return (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                {label}
            </div>

            <div
                className={[
                    "money mt-2 font-display text-2xl",
                    emphasis
                        ? "text-[var(--color-primary)]"
                        : "",
                ].join(
                    " ",
                )}
            >
                {formatMoney(
                    value,
                )}
            </div>
        </div>
    );
}

function Header({
    children,
    align = "left",
}: {
    children?:
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
            ].join(" ")}
        >
            {children}
        </th>
    );
}

function EntryBadge({
    type,
}: {
    type:
    SupplierStatementEntry["type"];
}) {
    const label =
        type ===
            "BILL"
            ? "Bill"
            : type ===
                "PAYMENT"
                ? "Payment"
                : "Reversal";

    const className =
        type ===
            "BILL"
            ? "bg-amber-50 text-amber-700"
            : type ===
                "PAYMENT"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700";

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${className}`}
        >
            {label}
        </span>
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

function getToday() {
    const now =
        new Date();

    return [
        now.getFullYear(),
        String(
            now.getMonth() +
            1,
        ).padStart(
            2,
            "0",
        ),
        String(
            now.getDate(),
        ).padStart(
            2,
            "0",
        ),
    ].join("-");
}

function getDefaultFromDate() {
    const now =
        new Date();

    return [
        now.getFullYear(),
        String(
            now.getMonth() +
            1,
        ).padStart(
            2,
            "0",
        ),
        "01",
    ].join("-");
}