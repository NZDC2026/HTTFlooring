import {
    ArrowLeft,
    PackageCheck,
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
    useGoodsReceipt,
} from "../data/useGoodsReceipts";

import {
    useInventoryMovements,
} from "../../inventory/data/useInventory";

export function GoodsReceiptDetailPage() {
    const navigate =
        useNavigate();

    const {
        goodsReceiptId,
    } = useParams();

    const receipt =
        useGoodsReceipt(
            goodsReceiptId,
        );

    const inventoryMovements =
        useInventoryMovements();

    if (!receipt) {
        return (
            <Navigate
                to="/purchases"
                replace
            />
        );
    }

    const resolvedReceiptId = receipt.id;

    const receiptMovements =
        inventoryMovements.filter(
            (movement) =>
                movement.referenceType ===
                "GOODS_RECEIPT" &&
                movement.referenceId ===
                resolvedReceiptId,
        );

    return (
        <div className="pb-8">
            <button
                type="button"
                onClick={() =>
                    navigate(
                        `/purchases/${receipt.purchaseOrderId}`,
                    )
                }
                className="mb-5 flex items-center gap-2 text-xs text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
            >
                <ArrowLeft
                    size={14}
                />

                Back to{" "}
                {
                    receipt.purchaseOrderNumber
                }
            </button>

            <div className="mb-7 flex items-start justify-between">
                <div>
                    <div className="mb-3 flex items-center gap-3">
                        <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                            {
                                receipt.receiptNumber
                            }
                        </span>

                        <Badge variant="success">
                            Posted
                        </Badge>
                    </div>

                    <h1 className="font-display text-[34px] leading-tight">
                        Goods Receipt
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        {
                            receipt.supplierName
                        }
                    </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                    <PackageCheck
                        size={21}
                    />
                </div>
            </div>

            <div className="mb-5 grid grid-cols-4 gap-4">
                <Summary
                    label="Purchase Order"
                    value={
                        receipt.purchaseOrderNumber
                    }
                />

                <Summary
                    label="Receipt Date"
                    value={
                        receipt.receiptDate
                    }
                />

                <Summary
                    label="Receiving Site"
                    value={`${receipt.siteCode} — ${receipt.siteName}`}
                />

                <Summary
                    label="Delivery Reference"
                    value={
                        receipt.supplierDeliveryReference ??
                        "—"
                    }
                />
            </div>

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="border-b border-[var(--color-border)] px-5 py-4">
                    <h2 className="font-display text-xl">
                        Received Items
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
                                    Received
                                </Header>

                                <Header align="right">
                                    Conversion
                                </Header>

                                <Header align="right">
                                    Base Qty
                                </Header>
                            </tr>
                        </thead>

                        <tbody>
                            {receipt.lines.map(
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
                                                line.receivedQuantity
                                            }
                                        />

                                        <td className="px-4 py-4 text-right text-sm text-[var(--color-text-secondary)]">
                                            ×{" "}
                                            {
                                                line.conversionToBase
                                            }
                                        </td>

                                        <NumberCell
                                            value={
                                                line.receivedBaseQuantity
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

            <div className="mt-5 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="border-b border-[var(--color-border)] px-5 py-4">
                    <h2 className="font-display text-xl">
                        Inventory
                        Movements
                    </h2>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        Inventory
                        ledger entries
                        created when
                        this receipt
                        was posted.
                    </p>
                </div>

                <div className="divide-y divide-[var(--color-border)]">
                    {receiptMovements.map(
                        (movement) => {
                            const line =
                                receipt.lines.find(
                                    (
                                        receiptLine,
                                    ) =>
                                        receiptLine.productId ===
                                        movement.productId &&
                                        receiptLine.unitId ===
                                        movement.transactionUnitId,
                                );

                            return (
                                <div
                                    key={
                                        movement.id
                                    }
                                    className="grid grid-cols-[1fr_1.5fr_1fr_1fr] items-center gap-4 px-5 py-4"
                                >
                                    <div>
                                        <div className="text-sm font-semibold text-[var(--color-primary)]">
                                            {
                                                movement.movementNumber
                                            }
                                        </div>

                                        <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                            GOODS_RECEIPT
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm font-medium">
                                            {line?.description ??
                                                movement.productId}
                                        </div>

                                        <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                            {line?.sku ??
                                                ""}
                                        </div>
                                    </div>

                                    <div className="text-right text-sm">
                                        {
                                            movement.transactionQuantity
                                        }{" "}
                                        {
                                            movement.transactionUnitSymbol
                                        }
                                    </div>

                                    <div className="text-right text-sm font-semibold">
                                        +
                                        {
                                            movement.quantityBase
                                        }{" "}
                                        base units
                                    </div>
                                </div>
                            );
                        },
                    )}
                </div>
            </div>

            {receipt.notes && (
                <div className="mt-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
                    <h2 className="font-display text-xl">
                        Notes
                    </h2>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--color-text-secondary)]">
                        {
                            receipt.notes
                        }
                    </p>
                </div>
            )}

            <div className="mt-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-xs text-[var(--color-text-secondary)]">
                This receipt has
                been posted to
                inventory. Posted
                goods receipts are
                historical inventory
                records and cannot
                be edited.
            </div>
        </div>
    );
}

function Summary({
    label,
    value,
}: {
    label: string;
    value: string;
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