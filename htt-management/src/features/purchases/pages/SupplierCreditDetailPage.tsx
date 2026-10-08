import {
    useMemo,
    useState,
} from "react";

import {
    ArrowLeft,
    Ban,
    RotateCcw,
} from "lucide-react";

import {
    Navigate,
    useNavigate,
    useParams,
} from "react-router-dom";

import type {
    SupplierCreditAllocation,
} from "../types/supplierCredit";

import {
    useSupplierCredit,
    useSupplierCreditAllocationsByCredit,
} from "../data/useSupplierCredits";

import {
    useSupplierBills,
} from "../data/useSupplierBills";

import {
    supplierCreditRepository,
} from "../data/supplierCreditRepository";

import {
    SupplierCreditStatusBadge,
} from "../components/SupplierCreditStatusBadge";

import {
    ApplySupplierCreditForm,
} from "../components/ApplySupplierCreditForm";

import {
    ReverseSupplierCreditAllocationDialog,
} from "../components/ReverseSupplierCreditAllocationDialog";

import {
    VoidSupplierCreditDialog,
} from "../components/VoidSupplierCreditDialog";

export function SupplierCreditDetailPage() {
    const navigate =
        useNavigate();

    const {
        supplierCreditId,
    } =
        useParams();

    const credit =
        useSupplierCredit(
            supplierCreditId,
        );

    const bills =
        useSupplierBills();

    const allocations =
        useSupplierCreditAllocationsByCredit(
            supplierCreditId,
        );

    const [
        applyOpen,
        setApplyOpen,
    ] =
        useState(false);

    const [
        actionError,
        setActionError,
    ] =
        useState<
            string | null
        >(null);

    const [
        reversingAllocation,
        setReversingAllocation,
    ] =
        useState<
            SupplierCreditAllocation | null
        >(null);

    const [
        voidOpen,
        setVoidOpen,
    ] =
        useState(false);

    const activeAllocations =
        useMemo(
            () =>
                allocations.filter(
                    (
                        allocation,
                    ) =>
                        allocation.status ===
                        "APPLIED",
                ),
            [
                allocations,
            ],
        );

    const hasActiveAllocations =
        activeAllocations.length >
        0;

    if (!credit) {
        return (
            <Navigate
                to="/purchases"
                replace
            />
        );
    }

    const resolvedCreditId =
        credit.id;

    const canVoid =
        credit.status !==
        "VOID" &&
        !hasActiveAllocations;

    const supplierBills =
        bills.filter(
            (bill) =>
                bill.supplierId ===
                credit.supplierId,
        );

    function handleApply(
        values: {
            supplierBillId: string;
            allocationDate: string;
            amount: number;
        },
    ) {
        setActionError(
            null,
        );

        try {
            supplierCreditRepository.applyToBill(
                {
                    supplierCreditId:
                        resolvedCreditId,

                    supplierBillId:
                        values.supplierBillId,

                    allocationDate:
                        values.allocationDate,

                    amount:
                        values.amount,
                },
            );

            setApplyOpen(
                false,
            );
        } catch (
        caught
        ) {
            setActionError(
                caught instanceof
                    Error
                    ? caught.message
                    : "Unable to apply supplier credit.",
            );
        }
    }

    function handleReverseAllocation(
        reason: string,
    ) {
        if (
            !reversingAllocation
        ) {
            return;
        }

        const resolvedAllocationId =
            reversingAllocation.id;

        setActionError(
            null,
        );

        try {
            supplierCreditRepository.reverseAllocation(
                {
                    allocationId:
                        resolvedAllocationId,

                    reversalReason:
                        reason,
                },
            );

            setReversingAllocation(
                null,
            );
        } catch (
        caught
        ) {
            setActionError(
                caught instanceof
                    Error
                    ? caught.message
                    : "Unable to reverse supplier credit allocation.",
            );
        }
    }

    function handleVoidCredit(
        reason: string,
    ) {
        setActionError(
            null,
        );

        try {
            supplierCreditRepository.voidCredit(
                {
                    supplierCreditId:
                        resolvedCreditId,

                    reason,
                },
            );

            setVoidOpen(
                false,
            );
        } catch (
        caught
        ) {
            setActionError(
                caught instanceof
                    Error
                    ? caught.message
                    : "Unable to void supplier credit.",
            );
        }
    }

    return (
        <div className="pb-8">
            <button
                type="button"
                onClick={() =>
                    navigate(
                        `/purchases/bills/${credit.sourceSupplierBillId}`,
                    )
                }
                className="mb-5 flex items-center gap-2 text-xs text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
            >
                <ArrowLeft
                    size={
                        14
                    }
                />

                Back to{" "}
                {
                    credit.sourceSupplierBillNumber
                }
            </button>

            <div className="mb-7 flex items-start justify-between">
                <div>
                    <div className="mb-3 flex items-center gap-3">
                        <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                            {
                                credit.creditNumber
                            }
                        </span>

                        <SupplierCreditStatusBadge
                            status={
                                credit.status
                            }
                        />
                    </div>

                    <h1 className="font-display text-[34px] leading-tight">
                        Supplier
                        Credit
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        {
                            credit.supplierName
                        }
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {credit.status !==
                        "VOID" && (
                            <button
                                type="button"
                                disabled={
                                    !canVoid
                                }
                                title={
                                    canVoid
                                        ? "Void supplier credit"
                                        : "Reverse all active allocations before voiding this supplier credit"
                                }
                                onClick={() => {
                                    setActionError(
                                        null,
                                    );

                                    setVoidOpen(
                                        true,
                                    );
                                }}
                                className="flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Ban
                                    size={
                                        15
                                    }
                                />

                                Void
                                Credit
                            </button>
                        )}

                    {credit.status !==
                        "VOID" &&
                        credit.amountAvailable >
                        0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    setActionError(
                                        null,
                                    );

                                    setApplyOpen(
                                        true,
                                    );
                                }}
                                className="h-10 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-primary-dark)]"
                            >
                                Apply
                                Credit
                            </button>
                        )}

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                        <RotateCcw
                            size={
                                21
                            }
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

            <div className="mb-5 grid grid-cols-5 gap-4">
                <Summary
                    label="Supplier Credit No."
                    value={
                        credit.supplierCreditNumber
                    }
                />

                <Summary
                    label="Source Bill"
                    value={
                        credit.sourceSupplierBillNumber
                    }
                />

                <Summary
                    label="Credit Date"
                    value={
                        credit.creditDate
                    }
                />

                <Summary
                    label="Applied"
                    value={formatMoney(
                        credit.amountApplied,
                    )}
                />

                <Summary
                    label="Available"
                    value={formatMoney(
                        credit.amountAvailable,
                    )}
                    emphasis
                />
            </div>

            {credit.status ===
                "VOID" && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-5 py-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-red-800">
                            <Ban
                                size={
                                    15
                                }
                            />

                            Supplier
                            Credit
                            Voided
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-5 text-xs">
                            <div>
                                <div className="font-semibold uppercase tracking-[0.05em] text-red-500">
                                    Voided
                                    At
                                </div>

                                <div className="mt-1 text-red-800">
                                    {credit.voidedAt
                                        ? formatDateTime(
                                            credit.voidedAt,
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
                                    {credit.voidReason ??
                                        "—"}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="border-b border-[var(--color-border)] px-5 py-4">
                    <h2 className="font-display text-xl">
                        Credit
                        Lines
                    </h2>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        Original
                        supplier
                        bill lines
                        included
                        in this
                        credit.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
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
                                    Unit
                                    Cost
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
                            {credit.lines.map(
                                (
                                    line,
                                ) => (
                                    <tr
                                        key={
                                            line.id
                                        }
                                        className="border-b border-[var(--color-border)] last:border-b-0"
                                    >
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-semibold">
                                                {
                                                    line.description
                                                }
                                            </div>

                                            <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                                {line.sku ??
                                                    "—"}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-sm">
                                            {line.unitSymbol ??
                                                "—"}
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
                <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
                    <h2 className="font-display text-xl">
                        Reason
                    </h2>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--color-text-secondary)]">
                        {
                            credit.reason
                        }
                    </p>
                </div>

                <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
                    <h2 className="font-display text-xl">
                        Credit
                        Summary
                    </h2>

                    <MoneyRow
                        label="Subtotal"
                        value={
                            credit.totals
                                .subtotal
                        }
                    />

                    <MoneyRow
                        label="GST"
                        value={
                            credit.totals
                                .taxAmount
                        }
                    />

                    <MoneyRow
                        label="Credit Total"
                        value={
                            credit.totals
                                .total
                        }
                    />

                    <MoneyRow
                        label="Applied"
                        value={
                            credit.amountApplied
                        }
                    />

                    <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                        <MoneyRow
                            label="Available"
                            value={
                                credit.amountAvailable
                            }
                            strong
                        />
                    </div>
                </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="border-b border-[var(--color-border)] px-5 py-4">
                    <h2 className="font-display text-xl">
                        Allocation
                        History
                    </h2>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        Supplier
                        bills that
                        have received
                        this credit.
                    </p>
                </div>

                {allocations.length ===
                    0 ? (
                    <div className="px-5 py-10 text-center text-sm text-[var(--color-text-muted)]">
                        No credit
                        allocations
                        recorded.
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--color-border)]">
                        {allocations.map(
                            (
                                allocation,
                            ) => (
                                <div
                                    key={
                                        allocation.id
                                    }
                                    className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-center gap-4 px-5 py-4"
                                >
                                    <div>
                                        <div className="text-sm font-semibold text-[var(--color-primary)]">
                                            {
                                                allocation.allocationNumber
                                            }
                                        </div>

                                        <div
                                            className={[
                                                "mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                                                allocation.status ===
                                                    "APPLIED"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-red-50 text-red-700",
                                            ].join(
                                                " ",
                                            )}
                                        >
                                            {
                                                allocation.status
                                            }
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/purchases/bills/${allocation.supplierBillId}`,
                                                )
                                            }
                                            className="text-left text-sm font-semibold text-[var(--color-primary)] hover:underline"
                                        >
                                            {
                                                allocation.supplierBillNumber
                                            }
                                        </button>

                                        {allocation.status ===
                                            "REVERSED" &&
                                            allocation.reversalReason && (
                                                <div className="mt-1 max-w-[220px] text-[10px] text-[var(--color-text-muted)]">
                                                    {
                                                        allocation.reversalReason
                                                    }
                                                </div>
                                            )}
                                    </div>

                                    <div className="text-sm">
                                        {
                                            allocation.allocationDate
                                        }
                                    </div>

                                    <div className="money text-right text-sm font-semibold">
                                        {formatMoney(
                                            allocation.amount,
                                        )}
                                    </div>

                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/purchases/bills/${allocation.supplierBillId}`,
                                                )
                                            }
                                            className="text-xs font-semibold text-[var(--color-primary)]"
                                        >
                                            View
                                            Bill →
                                        </button>

                                        {allocation.status ===
                                            "APPLIED" &&
                                            credit.status !==
                                            "VOID" && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActionError(
                                                            null,
                                                        );

                                                        setReversingAllocation(
                                                            allocation,
                                                        );
                                                    }}
                                                    className="h-8 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-700 hover:bg-red-50"
                                                >
                                                    Reverse
                                                </button>
                                            )}
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                )}

                {activeAllocations.length >
                    0 && (
                        <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-3 text-xs text-[var(--color-text-secondary)]">
                            Active
                            allocations:{" "}
                            {
                                activeAllocations.length
                            }
                        </div>
                    )}
            </div>

            <div className="mt-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-xs leading-5 text-[var(--color-text-secondary)]">
                Applying
                supplier
                credit to a
                bill reduces
                that bill's
                outstanding
                balance.
                Credit
                allocation
                does not
                represent a
                new supplier
                payment.
            </div>

            {applyOpen && (
                <ApplySupplierCreditForm
                    creditDate={
                        credit.creditDate
                    }
                    amountAvailable={
                        credit.amountAvailable
                    }
                    bills={
                        supplierBills
                    }
                    onCancel={() =>
                        setApplyOpen(
                            false,
                        )
                    }
                    onApply={
                        handleApply
                    }
                />
            )}

            {reversingAllocation && (
                <ReverseSupplierCreditAllocationDialog
                    allocation={
                        reversingAllocation
                    }
                    onCancel={() =>
                        setReversingAllocation(
                            null,
                        )
                    }
                    onReverse={
                        handleReverseAllocation
                    }
                />
            )}

            {voidOpen && (
                <VoidSupplierCreditDialog
                    creditNumber={
                        credit.creditNumber
                    }
                    total={
                        credit.totals.total
                    }
                    onCancel={() =>
                        setVoidOpen(
                            false,
                        )
                    }
                    onVoid={
                        handleVoidCredit
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
                "money px-4 py-4 text-right text-sm",
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
        <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-[var(--color-text-secondary)]">
                {label}
            </span>

            <span
                className={[
                    "money text-sm",
                    strong
                        ? "font-display text-xl font-semibold"
                        : "font-semibold",
                ].join(" ")}
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