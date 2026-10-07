import {
    ArrowLeft,
    Ban,
    Check,
    FileText,
    PackageCheck,
    Pencil,
    Send,
} from "lucide-react";

import {
    Navigate,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    Button,
} from "../../../components/ui/Button";

import {
    PurchaseOrderStatusBadge,
} from "../components/PurchaseOrderStatusBadge";

import {
    purchaseOrderRepository,
} from "../data/purchaseOrderRepository";

import {
    usePurchaseOrder,
} from "../data/usePurchaseOrders";

import {
    usePurchaseOrderGoodsReceipts,
} from "../data/useGoodsReceipts";

import {
    usePurchaseOrderSupplierBills,
} from "../data/useSupplierBills";

export function PurchaseOrderDetailPage() {
    const navigate =
        useNavigate();

    const {
        purchaseOrderId,
    } = useParams();

    const purchaseOrder =
        usePurchaseOrder(
            purchaseOrderId,
        );

    const goodsReceipts =
        usePurchaseOrderGoodsReceipts(
            purchaseOrderId,
        );

    const supplierBills =
        usePurchaseOrderSupplierBills(
            purchaseOrderId,
        );

    if (!purchaseOrder) {
        return (
            <Navigate
                to="/purchases"
                replace
            />
        );
    }

    const resolvedPurchaseOrderId = purchaseOrder.id;

    function handleApprove() {
        try {
            purchaseOrderRepository.approve(
                resolvedPurchaseOrderId,
            );
        } catch (
        error
        ) {
            showError(
                error,
            );
        }
    }

    function handleSend() {
        try {
            purchaseOrderRepository.send(
                resolvedPurchaseOrderId,
            );
        } catch (
        error
        ) {
            showError(
                error,
            );
        }
    }

    function handleCancel() {
        const reason =
            window.prompt(
                "Enter cancellation reason:",
            );

        if (
            reason ===
            null
        ) {
            return;
        }

        try {
            purchaseOrderRepository.cancel(
                resolvedPurchaseOrderId,
                reason,
            );
        } catch (
        error
        ) {
            showError(
                error,
            );
        }
    }

    return (
        <div className="pb-8">
            <button
                type="button"
                onClick={() =>
                    navigate(
                        "/purchases",
                    )
                }
                className="mb-5 flex items-center gap-2 text-xs text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
            >
                <ArrowLeft
                    size={
                        14
                    }
                />

                Back to
                purchase
                orders
            </button>

            <div className="mb-7 flex items-start justify-between gap-5">
                <div>
                    <div className="mb-3 flex items-center gap-3">
                        <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                            {
                                purchaseOrder.purchaseOrderNumber
                            }
                        </span>

                        <PurchaseOrderStatusBadge
                            status={
                                purchaseOrder.status
                            }
                        />
                    </div>

                    <h1 className="font-display text-[34px] leading-tight">
                        {
                            purchaseOrder.supplierName
                        }
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Supplier{" "}
                        {
                            purchaseOrder.supplierCode
                        }
                    </p>
                </div>

                <div className="flex gap-2">
                    {purchaseOrder.status ===
                        "DRAFT" && (
                            <>
                                <Button
                                    variant="secondary"
                                    onClick={() =>
                                        navigate(
                                            `/purchases/${purchaseOrder.id}/edit`,
                                        )
                                    }
                                >
                                    <Pencil
                                        size={
                                            15
                                        }
                                    />
                                    Edit
                                </Button>

                                <Button
                                    variant="danger"
                                    onClick={
                                        handleCancel
                                    }
                                >
                                    <Ban
                                        size={
                                            15
                                        }
                                    />
                                    Cancel
                                </Button>

                                <Button
                                    variant="accent"
                                    onClick={
                                        handleApprove
                                    }
                                >
                                    <Check
                                        size={
                                            15
                                        }
                                    />
                                    Approve
                                </Button>
                            </>
                        )}

                    {purchaseOrder.status ===
                        "APPROVED" && (
                            <>
                                <Button
                                    variant="danger"
                                    onClick={
                                        handleCancel
                                    }
                                >
                                    <Ban
                                        size={
                                            15
                                        }
                                    />
                                    Cancel
                                </Button>

                                <Button
                                    variant="accent"
                                    onClick={
                                        handleSend
                                    }
                                >
                                    <Send
                                        size={
                                            15
                                        }
                                    />
                                    Mark as
                                    Sent
                                </Button>
                            </>
                        )}

                    {[
                        "SENT",
                        "PARTIALLY_RECEIVED",
                    ].includes(
                        purchaseOrder.status,
                    ) && (
                            <Button
                                variant="accent"
                                onClick={() =>
                                    navigate(
                                        `/purchases/${purchaseOrder.id}/receive`,
                                    )
                                }
                            >
                                <PackageCheck
                                    size={15}
                                />

                                Receive Goods
                            </Button>
                        )}

                    {[
                        "PARTIALLY_RECEIVED",
                        "RECEIVED",
                        "BILLED",
                    ].includes(
                        purchaseOrder.status,
                    ) &&
                        purchaseOrder.lines.some(
                            (line) =>
                                line.receivedQuantity >
                                line.billedQuantity,
                        ) && (
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    navigate(
                                        `/purchases/${purchaseOrder.id}/bill`,
                                    )
                                }
                            >
                                <FileText
                                    size={15}
                                />

                                Create Supplier Bill
                            </Button>
                        )}
                </div>
            </div>

            <div className="mb-5 grid grid-cols-4 gap-4">
                <Summary
                    label="Order Date"
                    value={
                        purchaseOrder.orderDate
                    }
                />

                <Summary
                    label="Expected Delivery"
                    value={
                        purchaseOrder.expectedDeliveryDate ??
                        "—"
                    }
                />

                <Summary
                    label="Supplier Reference"
                    value={
                        purchaseOrder.supplierReference ??
                        "—"
                    }
                />

                <Summary
                    label="Order Total"
                    value={formatMoney(
                        purchaseOrder
                            .totals
                            .total,
                    )}
                />
            </div>

            <div className="mb-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-display text-xl">
                            Receiving
                            Progress
                        </h2>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            Quantity
                            received
                            against this
                            purchase
                            order.
                        </p>
                    </div>

                    <div className="text-sm font-semibold">
                        {getReceivingProgress(
                            purchaseOrder,
                        )}
                        %
                    </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
                    <div
                        className="h-full rounded-full bg-[var(--color-primary)] transition-all"
                        style={{
                            width:
                                `${getReceivingProgress(
                                    purchaseOrder,
                                )}%`,
                        }}
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="border-b border-[var(--color-border)] px-5 py-4">
                    <h2 className="font-display text-xl">
                        Purchase
                        Order Lines
                    </h2>
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
                                    Ordered
                                </Header>

                                <Header align="right">
                                    Received
                                </Header>

                                <Header align="right">
                                    Billed
                                </Header>

                                <Header align="right">
                                    Billable
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
                            {purchaseOrder.lines.map(
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

                                        <td className="px-4 py-4 text-sm text-[var(--color-text-secondary)]">
                                            {
                                                line.unitSymbol
                                            }
                                        </td>

                                        <NumberCell
                                            value={
                                                line.orderedQuantity
                                            }
                                        />

                                        <NumberCell
                                            value={
                                                line.receivedQuantity
                                            }
                                        />

                                        <NumberCell
                                            value={
                                                line.billedQuantity
                                            }
                                        />

                                        <NumberCell
                                            value={
                                                Math.max(
                                                    0,
                                                    Math.round(
                                                        (
                                                            line.receivedQuantity -
                                                            line.billedQuantity +
                                                            Number.EPSILON
                                                        ) *
                                                        10000,
                                                    ) / 10000,
                                                )
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
                                        />
                                    </tr>
                                ),
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end border-t border-[var(--color-border)] px-5 py-5">
                    <div className="w-[300px] space-y-3">
                        <TotalRow
                            label="Subtotal"
                            value={
                                purchaseOrder
                                    .totals
                                    .subtotal
                            }
                        />

                        <TotalRow
                            label="GST"
                            value={
                                purchaseOrder
                                    .totals
                                    .taxAmount
                            }
                        />

                        <div className="border-t border-[var(--color-border)] pt-3">
                            <TotalRow
                                label="Total"
                                value={
                                    purchaseOrder
                                        .totals
                                        .total
                                }
                                strong
                            />
                        </div>
                    </div>
                </div>
            </div>

            {purchaseOrder.notes && (
                <div className="mt-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
                    <h2 className="font-display text-xl">
                        Notes
                    </h2>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--color-text-secondary)]">
                        {
                            purchaseOrder.notes
                        }
                    </p>
                </div>
            )}

            {purchaseOrder.status ===
                "CANCELLED" && (
                    <div className="mt-5 rounded-[var(--radius-card)] border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] p-5">
                        <div className="text-sm font-semibold text-[var(--color-danger)]">
                            Purchase
                            order
                            cancelled
                        </div>

                        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                            {
                                purchaseOrder.cancellationReason
                            }
                        </p>
                    </div>
                )}

            <div className="mt-5 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="border-b border-[var(--color-border)] px-5 py-4">
                    <h2 className="font-display text-xl">
                        Goods Receipt
                        History
                    </h2>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        Posted
                        deliveries
                        received
                        against this
                        purchase
                        order.
                    </p>
                </div>

                {goodsReceipts.length ===
                    0 ? (
                    <div className="px-5 py-10 text-center text-sm text-[var(--color-text-muted)]">
                        No goods have
                        been received
                        against this
                        purchase order.
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--color-border)]">
                        {goodsReceipts.map(
                            (receipt) => {
                                const totalUnits =
                                    receipt.lines.reduce(
                                        (
                                            total,
                                            line,
                                        ) =>
                                            total +
                                            line.receivedQuantity,
                                        0,
                                    );

                                return (
                                    <button
                                        key={
                                            receipt.id
                                        }
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/purchases/goods-receipts/${receipt.id}`,
                                            )
                                        }
                                        className="grid w-full grid-cols-[1.2fr_1fr_1.5fr_1fr_auto] items-center gap-4 px-5 py-4 text-left transition hover:bg-[var(--color-surface-muted)]"
                                    >
                                        <div>
                                            <div className="text-sm font-semibold text-[var(--color-primary)]">
                                                {
                                                    receipt.receiptNumber
                                                }
                                            </div>

                                            <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                                Posted
                                            </div>
                                        </div>

                                        <div className="text-sm">
                                            {
                                                receipt.receiptDate
                                            }
                                        </div>

                                        <div>
                                            <div className="text-sm font-medium">
                                                {
                                                    receipt.siteName
                                                }
                                            </div>

                                            <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                                {
                                                    receipt.siteCode
                                                }
                                            </div>
                                        </div>

                                        <div className="text-sm">
                                            {totalUnits.toLocaleString(
                                                "en-AU",
                                            )}{" "}
                                            received
                                        </div>

                                        <div className="text-xs font-medium text-[var(--color-primary)]">
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
                        Supplier Bill
                        History
                    </h2>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        Supplier
                        invoices matched
                        against received
                        quantities on this
                        purchase order.
                    </p>
                </div>

                {supplierBills.length ===
                    0 ? (
                    <div className="px-5 py-10 text-center text-sm text-[var(--color-text-muted)]">
                        No supplier
                        bills have been
                        created for this
                        purchase order.
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--color-border)]">
                        {supplierBills.map(
                            (bill) => (
                                <button
                                    key={
                                        bill.id
                                    }
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/purchases/bills/${bill.id}`,
                                        )
                                    }
                                    className="grid w-full grid-cols-[1fr_1.2fr_1fr_1fr_1fr_auto] items-center gap-4 px-5 py-4 text-left transition hover:bg-[var(--color-surface-muted)]"
                                >
                                    <div>
                                        <div className="text-sm font-semibold text-[var(--color-primary)]">
                                            {
                                                bill.billNumber
                                            }
                                        </div>

                                        <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                            {
                                                bill.status
                                            }
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm font-medium">
                                            {
                                                bill.supplierInvoiceNumber
                                            }
                                        </div>

                                        <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                            Supplier
                                            Invoice
                                        </div>
                                    </div>

                                    <div className="text-sm">
                                        {
                                            bill.billDate
                                        }
                                    </div>

                                    <div className="text-sm">
                                        Due{" "}
                                        {
                                            bill.dueDate
                                        }
                                    </div>

                                    <div className="text-right text-sm font-semibold">
                                        {formatMoney(
                                            bill.totals
                                                .amountDue,
                                        )}
                                    </div>

                                    <div className="text-xs font-medium text-[var(--color-primary)]">
                                        View →
                                    </div>
                                </button>
                            ),
                        )}
                    </div>
                )}
            </div>

            <div className="mt-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-xs text-[var(--color-text-secondary)]">
                Purchase order
                approval and sending
                do not affect
                inventory. Inventory
                is increased only
                when a Goods Receipt
                is posted. Accounts
                payable remains
                unaffected until a
                Supplier Bill is
                created.
            </div>
        </div>
    );
}

function Summary({
    label,
    value,
}: {
    label: string;
    value:
    | string
    | number;
}) {
    return (
        <div className="rounded-xl border border-[var(--color-border)] bg-white px-5 py-4">
            <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                {label}
            </div>

            <div className="mt-2 text-sm font-semibold">
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
}: {
    value: number;
}) {
    return (
        <td className="money whitespace-nowrap px-4 py-4 text-right text-sm">
            {formatMoney(
                value,
            )}
        </td>
    );
}

function TotalRow({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: number;
    strong?: boolean;
}) {
    return (
        <div
            className={[
                "flex justify-between",

                strong
                    ? "text-base font-semibold"
                    : "text-sm",
            ].join(" ")}
        >
            <span className="text-[var(--color-text-secondary)]">
                {label}
            </span>

            <span className="money">
                {formatMoney(
                    value,
                )}
            </span>
        </div>
    );
}

function formatMoney(
    value: number,
) {
    return value.toLocaleString(
        "en-AU",
        {
            style:
                "currency",

            currency:
                "AUD",
        },
    );
}

function showError(
    error: unknown,
) {
    window.alert(
        error instanceof
            Error
            ? error.message
            : "Unable to update purchase order.",
    );
}

function getReceivingProgress(
    purchaseOrder: {
        lines: Array<{
            orderedQuantity:
            number;

            receivedQuantity:
            number;
        }>;
    },
) {
    const ordered =
        purchaseOrder.lines.reduce(
            (
                total,
                line,
            ) =>
                total +
                line.orderedQuantity,
            0,
        );

    if (ordered <= 0) {
        return 0;
    }

    const received =
        purchaseOrder.lines.reduce(
            (
                total,
                line,
            ) =>
                total +
                line.receivedQuantity,
            0,
        );

    return Math.min(
        100,
        Math.round(
            (received /
                ordered) *
            100,
        ),
    );
}