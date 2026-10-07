import {
    ArrowLeft,
    RotateCcw,
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
    supplierPaymentRepository,
} from "../data/supplierPaymentRepository";

import {
    useSupplierPayment,
} from "../data/useSupplierPayments";

export function SupplierPaymentDetailPage() {
    const navigate =
        useNavigate();

    const {
        supplierPaymentId,
    } = useParams();

    const payment =
        useSupplierPayment(
            supplierPaymentId,
        );

    const [
        reversalReason,
        setReversalReason,
    ] = useState("");

    const [
        showReverse,
        setShowReverse,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState<
        string | null
    >(null);

    if (!payment) {
        return (
            <Navigate
                to="/purchases/payables"
                replace
            />
        );
    }

    const resolvedPaymentId =
        payment.id;

    function handleReverse() {
        try {
            setError(
                null,
            );

            supplierPaymentRepository.reverse(
                resolvedPaymentId,
                reversalReason,
            );

            setShowReverse(
                false,
            );

            setReversalReason(
                "",
            );
        } catch (
        caught
        ) {
            setError(
                caught instanceof
                    Error
                    ? caught.message
                    : "Unable to reverse supplier payment.",
            );
        }
    }

    return (
        <div className="pb-8">
            <button
                type="button"
                onClick={() =>
                    navigate(
                        `/contacts/suppliers/${payment.supplierId}`,
                    )
                }
                className="mb-5 flex items-center gap-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            >
                <ArrowLeft
                    size={14}
                />
                Back to{" "}
                {
                    payment.supplierName
                }
            </button>

            <div className="mb-7 flex items-start justify-between gap-5">
                <div>
                    <div className="mb-3 flex items-center gap-3">
                        <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                            {
                                payment.paymentNumber
                            }
                        </span>

                        <PaymentStatus
                            status={
                                payment.status
                            }
                        />
                    </div>

                    <h1 className="font-display text-[34px] leading-tight">
                        Supplier Payment
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        {
                            payment.supplierName
                        }
                    </p>
                </div>

                {payment.status ===
                    "POSTED" && (
                        <button
                            type="button"
                            onClick={() =>
                                setShowReverse(
                                    true,
                                )
                            }
                            className="flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 hover:bg-red-50"
                        >
                            <RotateCcw
                                size={15}
                            />
                            Reverse Payment
                        </button>
                    )}
            </div>

            {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-5 grid grid-cols-5 gap-4">
                <Summary
                    label="Payment Date"
                    value={
                        payment.paymentDate
                    }
                />

                <Summary
                    label="Method"
                    value={formatMethod(
                        payment.method,
                    )}
                />

                <Summary
                    label="Reference"
                    value={
                        payment.reference ??
                        "—"
                    }
                />

                <Summary
                    label="Allocations"
                    value={String(
                        payment.allocations
                            .length,
                    )}
                />

                <Summary
                    label="Payment Total"
                    value={formatMoney(
                        payment.amount,
                    )}
                    emphasis
                />
            </div>

            {payment.status ===
                "REVERSED" && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-5 py-4">
                        <div className="text-sm font-semibold text-red-800">
                            Payment
                            Reversed
                        </div>

                        <div className="mt-1 text-xs text-red-700">
                            {payment.reversalReason ??
                                "No reversal reason recorded."}
                        </div>

                        {payment.reversedAt && (
                            <div className="mt-2 text-[10px] text-red-600">
                                {
                                    payment.reversedAt
                                }
                            </div>
                        )}
                    </div>
                )}

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="border-b border-[var(--color-border)] px-5 py-4">
                    <h2 className="font-display text-xl">
                        Bill Allocations
                    </h2>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        Bills affected by
                        this supplier
                        payment.
                    </p>
                </div>

                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                            <Header>
                                Bill
                            </Header>

                            <Header>
                                Supplier
                                Invoice
                            </Header>

                            <Header align="right">
                                Allocation
                            </Header>

                            <Header />
                        </tr>
                    </thead>

                    <tbody>
                        {payment.allocations.map(
                            (
                                allocation,
                            ) => (
                                <tr
                                    key={
                                        allocation.id
                                    }
                                    className="border-b border-[var(--color-border)] last:border-b-0"
                                >
                                    <td className="px-4 py-4 text-sm font-semibold text-[var(--color-primary)]">
                                        {
                                            allocation.billNumber
                                        }
                                    </td>

                                    <td className="px-4 py-4 text-sm">
                                        {
                                            allocation.supplierInvoiceNumber
                                        }
                                    </td>

                                    <td className="money px-4 py-4 text-right text-sm font-semibold">
                                        {formatMoney(
                                            allocation.amount,
                                        )}
                                    </td>

                                    <td className="px-4 py-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/purchases/bills/${allocation.supplierBillId}`,
                                                )
                                            }
                                            className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
                                        >
                                            View Bill
                                            →
                                        </button>
                                    </td>
                                </tr>
                            ),
                        )}
                    </tbody>
                </table>
            </div>

            {payment.notes && (
                <div className="mt-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
                    <h2 className="font-display text-xl">
                        Notes
                    </h2>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--color-text-secondary)]">
                        {
                            payment.notes
                        }
                    </p>
                </div>
            )}

            {showReverse && (
                <div className="mt-5 rounded-[var(--radius-card)] border border-red-200 bg-white p-5 shadow-[var(--shadow-xs)]">
                    <h2 className="font-display text-xl">
                        Reverse Payment
                    </h2>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Reversal restores
                        every allocation
                        to its supplier
                        bill and preserves
                        this payment for
                        audit history.
                    </p>

                    <label className="mt-4 block">
                        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">
                            Reversal Reason
                        </span>

                        <textarea
                            value={
                                reversalReason
                            }
                            onChange={(
                                event,
                            ) =>
                                setReversalReason(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            rows={3}
                            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-3 text-sm outline-none focus:border-red-400"
                        />
                    </label>

                    <div className="mt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                setShowReverse(
                                    false,
                                )
                            }
                            className="h-10 rounded-lg border border-[var(--color-border)] px-4 text-sm font-medium"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={
                                handleReverse
                            }
                            className="h-10 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800"
                        >
                            Confirm
                            Reversal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function PaymentStatus({
    status,
}: {
    status:
    | "POSTED"
    | "REVERSED";
}) {
    return (
        <span
            className={[
                "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                status ===
                    "POSTED"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700",
            ].join(" ")}
        >
            {status}
        </span>
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
                className={
                    emphasis
                        ? "money mt-2 font-display text-xl"
                        : "mt-2 text-sm font-semibold"
                }
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
    children?:
    React.ReactNode;
    align?:
    | "left"
    | "right";
}) {
    return (
        <th
            className={[
                "h-10 px-4 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]",
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

function formatMethod(
    method: string,
) {
    return method
        .split("_")
        .map(
            (part) =>
                part.charAt(
                    0,
                ) +
                part
                    .slice(
                        1,
                    )
                    .toLowerCase(),
        )
        .join(" ");
}

function formatMoney(
    value: number,
) {
    return new Intl.NumberFormat(
        "en-AU",
        {
            style: "currency",
            currency: "AUD",
        },
    ).format(value);
}