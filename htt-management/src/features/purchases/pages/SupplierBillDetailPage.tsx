import {
    useState,
} from "react";

import {
    ArrowLeft,
    Ban,
    FileText,
} from "lucide-react";

import {
    Navigate,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    useSupplierBill,
} from "../data/useSupplierBills";

import {
    useSupplierPaymentsByBill,
} from "../data/useSupplierPayments";

import {
    useSupplierCreditsByBill,
} from "../data/useSupplierCredits";

import {
    voidSupplierBill,
} from "../data/supplierBillVoidService";

import {
    SupplierBillStatusBadge,
} from "../components/SupplierBillStatusBadge";

import {
    VoidSupplierBillDialog,
} from "../components/VoidSupplierBillDialog";

export function SupplierBillDetailPage() {
    const navigate =
        useNavigate();

    const {
        supplierBillId,
    } = useParams();

    const bill =
        useSupplierBill(
            supplierBillId,
        );

    const payments =
        useSupplierPaymentsByBill(
            supplierBillId,
        );

    const credits =
        useSupplierCreditsByBill(
            supplierBillId,
        );

    const [
        voidOpen,
        setVoidOpen,
    ] =
        useState(false);

    const [
        actionError,
        setActionError,
    ] =
        useState<
            string | null
        >(null);

    if (!bill) {
        return (
            <Navigate
                to="/purchases"
                replace
            />
        );
    }

    const resolvedBillId =
        bill.id;

    function handleVoidBill(
        reason: string,
    ) {
        setActionError(
            null,
        );

        try {
            voidSupplierBill(
                resolvedBillId,
                reason,
            );

            setVoidOpen(
                false,
            );
        } catch (
        caught
        ) {
            setVoidOpen(
                false,
            );

            setActionError(
                caught instanceof
                    Error
                    ? caught.message
                    : "Unable to void supplier bill.",
            );
        }
    }

    return (
        <div className="pb-8">
            <button
                type="button"
                onClick={() =>
                    navigate(
                        `/purchases/${bill.purchaseOrderId}`,
                    )
                }
                className="mb-5 flex items-center gap-2 text-xs text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
            >
                <ArrowLeft
                    size={14}
                />

                Back to{" "}
                {
                    bill.purchaseOrderNumber
                }
            </button>

            <div className="mb-7 flex items-start justify-between">
                <div>
                    <div className="mb-3 flex items-center gap-3">
                        <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                            {
                                bill.billNumber
                            }
                        </span>

                        <SupplierBillStatusBadge
                            status={
                                bill.status
                            }
                        />
                    </div>

                    <h1 className="font-display text-[34px] leading-tight">
                        Supplier Bill
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        {
                            bill.supplierName
                        }
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {bill.status !==
                        "VOID" && (
                            <button
                                type="button"
                                onClick={() => {
                                    setActionError(
                                        null,
                                    );

                                    setVoidOpen(
                                        true,
                                    );
                                }}
                                className="flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 hover:bg-red-50"
                            >
                                <Ban
                                    size={
                                        15
                                    }
                                />

                                Void
                                Bill
                            </button>
                        )}

                    {bill.status !==
                        "VOID" && (
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/purchases/credits/new?billId=${bill.id}`,
                                    )
                                }
                                className="h-10 rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)]"
                            >
                                Create Credit
                            </button>
                        )}

                    {bill.status !==
                        "VOID" &&
                        bill.totals.amountDue >
                        0 && (
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/purchases/payments/new?supplierId=${bill.supplierId}&billId=${bill.id}`,
                                    )
                                }
                                className="h-10 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-primary-dark)]"
                            >
                                Record Payment
                            </button>
                        )}

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                        <FileText
                            size={21}
                        />
                    </div>
                </div>
            </div>

            {actionError && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {
                        actionError
                    }
                </div>
            )}

            {bill.status ===
                "VOID" && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-5 py-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-red-800">
                            <Ban
                                size={
                                    15
                                }
                            />

                            Supplier
                            Bill
                            Voided
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-5 text-xs">
                            <div>
                                <div className="font-semibold uppercase tracking-[0.05em] text-red-500">
                                    Voided
                                    At
                                </div>

                                <div className="mt-1 text-red-800">
                                    {bill.voidedAt
                                        ? formatDateTime(
                                            bill.voidedAt,
                                        )
                                        : "—"}
                                </div>
                            </div>

                            <div>
                                <div className="font-semibold uppercase tracking-[0.05em] text-red-500">
                                    Void
                                    Reason
                                </div>

                                <div className="mt-1 text-red-800">
                                    {bill.voidReason ??
                                        "—"}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            <div className="mb-5 grid grid-cols-5 gap-4">
                <Summary
                    label="Supplier Invoice"
                    value={
                        bill.supplierInvoiceNumber
                    }
                />

                <Summary
                    label="Purchase Order"
                    value={
                        bill.purchaseOrderNumber
                    }
                />

                <Summary
                    label="Bill Date"
                    value={
                        bill.billDate
                    }
                />

                <Summary
                    label="Due Date"
                    value={
                        bill.dueDate
                    }
                />

                <Summary
                    label="Amount Due"
                    value={formatMoney(
                        bill.totals
                            .amountDue,
                    )}
                    emphasis
                />
            </div>

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="border-b border-[var(--color-border)] px-5 py-4">
                    <h2 className="font-display text-xl">
                        Bill Lines
                    </h2>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        Quantities
                        matched against
                        received
                        purchase order
                        quantities.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--color-border)] bg-[var(--color-background-subtle)]">
                                <Header>
                                    Product
                                </Header>

                                <Header>
                                    Unit
                                </Header>

                                <Header align="right">
                                    Quantity
                                </Header>

                                <Header align="right">
                                    Unit Cost
                                </Header>

                                <Header align="right">
                                    Subtotal
                                </Header>

                                <Header align="right">
                                    GST
                                </Header>

                                <Header align="right">
                                    Total
                                </Header>
                            </tr>
                        </thead>

                        <tbody>
                            {bill.lines.map(
                                (line) => (
                                    <tr
                                        key={
                                            line.id
                                        }
                                        className="border-b border-[var(--color-border)] last:border-b-0"
                                    >
                                        <td className="px-4 py-4">
                                            <div className="font-medium">
                                                {
                                                    line.description
                                                }
                                            </div>

                                            <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                                {
                                                    line.sku
                                                }
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-sm">
                                            {
                                                line.unitSymbol
                                            }
                                        </td>

                                        <NumberCell
                                            value={
                                                line.quantity
                                            }
                                        />

                                        <MoneyCell
                                            value={
                                                line.unitCost
                                            }
                                        />

                                        <MoneyCell
                                            value={
                                                line.lineSubtotal
                                            }
                                        />

                                        <MoneyCell
                                            value={
                                                line.taxAmount
                                            }
                                        />

                                        <MoneyCell
                                            value={
                                                line.lineTotal
                                            }
                                            strong
                                        />
                                    </tr>
                                ),
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-5 grid grid-cols-[1fr_360px] gap-5">
                <div>
                    {bill.notes && (
                        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
                            <h2 className="font-display text-xl">
                                Notes
                            </h2>

                            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--color-text-secondary)]">
                                {
                                    bill.notes
                                }
                            </p>
                        </div>
                    )}
                </div>

                <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
                    <h2 className="font-display text-xl">
                        Accounts Payable
                    </h2>

                    <MoneyRow
                        label="Subtotal"
                        value={
                            bill.totals
                                .subtotal
                        }
                    />

                    <MoneyRow
                        label="GST"
                        value={
                            bill.totals
                                .taxAmount
                        }
                    />

                    <MoneyRow
                        label="Bill Total"
                        value={
                            bill.totals
                                .total
                        }
                    />

                    <MoneyRow
                        label="Paid"
                        value={
                            bill.totals
                                .amountPaid
                        }
                    />

                    <MoneyRow
                        label="Credited"
                        value={
                            bill.totals
                                .amountCredited
                        }
                    />

                    <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                        <MoneyRow
                            label="Amount Due"
                            value={
                                bill.totals
                                    .amountDue
                            }
                            strong
                        />
                    </div>
                </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="border-b border-[var(--color-border)] px-5 py-4">
                    <h2 className="font-display text-xl">
                        Payment History
                    </h2>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        Supplier payments
                        allocated to this
                        bill.
                    </p>
                </div>

                {payments.length ===
                    0 ? (
                    <div className="px-5 py-10 text-center text-sm text-[var(--color-text-muted)]">
                        No payments
                        recorded.
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--color-border)]">
                        {payments.map(
                            (payment) => {
                                const allocation =
                                    payment.allocations.find(
                                        (item) =>
                                            item.supplierBillId ===
                                            bill.id,
                                    );

                                return (
                                    <button
                                        key={
                                            payment.id
                                        }
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/purchases/payments/${payment.id}`,
                                            )
                                        }
                                        className="grid w-full grid-cols-[1fr_1fr_1fr_1fr_auto] items-center gap-4 px-5 py-4 text-left hover:bg-[var(--color-surface-muted)]"
                                    >
                                        <div>
                                            <div className="text-sm font-semibold text-[var(--color-primary)]">
                                                {
                                                    payment.paymentNumber
                                                }
                                            </div>

                                            <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                                {
                                                    payment.status
                                                }
                                            </div>
                                        </div>

                                        <div className="text-sm">
                                            {
                                                payment.paymentDate
                                            }
                                        </div>

                                        <div className="text-sm">
                                            {payment.reference ??
                                                "—"}
                                        </div>

                                        <div className="money text-right text-sm font-semibold">
                                            {formatMoney(
                                                allocation?.amount ??
                                                0,
                                            )}
                                        </div>

                                        <div className="text-xs font-semibold text-[var(--color-primary)]">
                                            View →
                                        </div>
                                    </button>
                                );
                            },
                        )}
                    </div>
                )}
            </div>

            <div className="mt-5 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="border-b border-[var(--color-border)] px-5 py-4">
                    <h2 className="font-display text-xl">
                        Supplier
                        Credit
                        History
                    </h2>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        Supplier
                        credits
                        issued from
                        this bill.
                    </p>
                </div>

                {credits.length ===
                    0 ? (
                    <div className="px-5 py-10 text-center text-sm text-[var(--color-text-muted)]">
                        No supplier
                        credits
                        recorded.
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--color-border)]">
                        {credits.map(
                            (
                                credit,
                            ) => (
                                <button
                                    key={
                                        credit.id
                                    }
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/purchases/credits/${credit.id}`,
                                        )
                                    }
                                    className="grid w-full grid-cols-[1fr_1fr_1fr_1fr_auto] items-center gap-4 px-5 py-4 text-left hover:bg-[var(--color-surface-muted)]"
                                >
                                    <div>
                                        <div className="text-sm font-semibold text-[var(--color-primary)]">
                                            {
                                                credit.creditNumber
                                            }
                                        </div>

                                        <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                            {
                                                credit.status
                                            }
                                        </div>
                                    </div>

                                    <div className="text-sm">
                                        {
                                            credit.supplierCreditNumber
                                        }
                                    </div>

                                    <div className="text-sm">
                                        {
                                            credit.creditDate
                                        }
                                    </div>

                                    <div className="money text-right text-sm font-semibold">
                                        {formatMoney(
                                            credit
                                                .totals
                                                .total,
                                        )}
                                    </div>

                                    <div className="text-xs font-semibold text-[var(--color-primary)]">
                                        View →
                                    </div>
                                </button>
                            ),
                        )}
                    </div>
                )}
            </div>

            <div className="mt-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-xs text-[var(--color-text-secondary)]">
                This supplier
                bill creates an
                Accounts Payable
                obligation. It does
                not change inventory,
                because inventory was
                already updated when
                the Goods Receipt was
                posted.
            </div>

            {voidOpen && (
                <VoidSupplierBillDialog
                    billNumber={
                        bill.billNumber
                    }
                    onCancel={() =>
                        setVoidOpen(
                            false,
                        )
                    }
                    onVoid={
                        handleVoidBill
                    }
                />
            )}
        </div>
    );
}

function Summary({
    label,
    value,
    emphasis = false,
}: {
    label: string;
    value: string;
    emphasis?: boolean;
}) {
    return (
        <div className="rounded-xl border border-[var(--color-border)] bg-white px-5 py-4">
            <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                {label}
            </div>

            <div
                className={[
                    "mt-2",

                    emphasis
                        ? "font-display text-xl"
                        : "text-sm font-semibold",
                ].join(" ")}
            >
                {value}
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
            ].join(" ")}
        >
            {children}
        </th>
    );
}

function NumberCell({
    value,
}: {
    value: number;
}) {
    return (
        <td className="px-4 py-4 text-right text-sm">
            {value.toLocaleString(
                "en-AU",
                {
                    maximumFractionDigits:
                        4,
                },
            )}
        </td>
    );
}

function MoneyCell({
    value,
    strong = false,
}: {
    value: number;
    strong?: boolean;
}) {
    return (
        <td
            className={[
                "px-4 py-4 text-right text-sm",

                strong
                    ? "font-semibold"
                    : "",
            ].join(" ")}
        >
            {formatMoney(
                value,
            )}
        </td>
    );
}

function MoneyRow({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: number;
    strong?: boolean;
}) {
    return (
        <div className="mt-3 flex items-center justify-between">
            <span
                className={
                    strong
                        ? "font-semibold"
                        : "text-sm text-[var(--color-text-secondary)]"
                }
            >
                {label}
            </span>

            <span
                className={
                    strong
                        ? "font-display text-xl"
                        : "text-sm font-medium"
                }
            >
                {formatMoney(
                    value,
                )}
            </span>
        </div>
    );
}

function formatDateTime(
    value: string,
) {
    return new Intl.DateTimeFormat(
        "en-AU",
        {
            dateStyle:
                "medium",

            timeStyle:
                "short",
        },
    ).format(
        new Date(
            value,
        ),
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