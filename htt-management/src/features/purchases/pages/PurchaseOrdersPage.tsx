import {
    Plus,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import type {
    ColumnDef,
} from "@tanstack/react-table";

import {
    DataTable,
} from "../../../components/data-table/DataTable";

import {
    Button,
} from "../../../components/ui/Button";

import {
    PurchaseOrderStatusBadge,
} from "../components/PurchaseOrderStatusBadge";

import {
    usePurchaseOrders,
} from "../data/usePurchaseOrders";

import type {
    PurchaseOrder,
} from "../types/purchaseOrder";

const columns:
    ColumnDef<
        PurchaseOrder,
        unknown
    >[] = [
        {
            accessorKey:
                "purchaseOrderNumber",

            header: "PO Number",

            cell: ({
                row,
            }) => (
                <span className="font-medium text-[var(--color-primary)]">
                    {
                        row
                            .original
                            .purchaseOrderNumber
                    }
                </span>
            ),
        },

        {
            accessorKey:
                "supplierName",

            header: "Supplier",

            cell: ({
                row,
            }) => (
                <div>
                    <div className="font-medium">
                        {
                            row
                                .original
                                .supplierName
                        }
                    </div>

                    <div className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                        {
                            row
                                .original
                                .supplierCode
                        }
                    </div>
                </div>
            ),
        },

        {
            accessorKey:
                "orderDate",

            header:
                "Order Date",
        },

        {
            accessorKey:
                "expectedDeliveryDate",

            header:
                "Expected",

            cell: ({
                row,
            }) =>
                row
                    .original
                    .expectedDeliveryDate ??
                "—",
        },

        {
            accessorKey:
                "status",

            header: "Status",

            cell: ({
                row,
            }) => (
                <PurchaseOrderStatusBadge
                    status={
                        row
                            .original
                            .status
                    }
                />
            ),
        },

        {
            id: "total",

            header: "Total",

            accessorFn: (
                row,
            ) =>
                row.totals
                    .total,

            cell: ({
                row,
            }) => (
                <div className="money text-right font-medium">
                    {formatMoney(
                        row
                            .original
                            .totals
                            .total,
                    )}
                </div>
            ),
        },
    ];

export function PurchaseOrdersPage() {
    const navigate =
        useNavigate();

    const purchaseOrders =
        usePurchaseOrders();

    const drafts =
        purchaseOrders.filter(
            (
                purchaseOrder,
            ) =>
                purchaseOrder.status ===
                "DRAFT",
        ).length;

    const open =
        purchaseOrders.filter(
            (
                purchaseOrder,
            ) =>
                [
                    "APPROVED",
                    "SENT",
                    "PARTIALLY_RECEIVED",
                ].includes(
                    purchaseOrder.status,
                ),
        ).length;

    const totalValue =
        purchaseOrders
            .filter(
                (
                    purchaseOrder,
                ) =>
                    purchaseOrder.status !==
                    "CANCELLED",
            )
            .reduce(
                (
                    total,
                    purchaseOrder,
                ) =>
                    total +
                    purchaseOrder
                        .totals
                        .total,
                0,
            );

    return (
        <div className="pb-8">
            <div className="mb-7 flex items-start justify-between">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        Operations
                    </p>

                    <h1 className="font-display text-[34px] leading-tight">
                        Purchase
                        Orders
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Manage
                        supplier
                        orders and
                        purchasing
                        commitments.
                    </p>
                </div>

                <Button
                    variant="accent"
                    onClick={() =>
                        navigate(
                            "/purchases/new",
                        )
                    }
                >
                    <Plus
                        size={
                            16
                        }
                    />

                    New purchase
                    order
                </Button>
            </div>

            <div className="mb-4 grid grid-cols-4 gap-4">
                <Summary
                    label="Purchase orders"
                    value={
                        purchaseOrders.length
                    }
                />

                <Summary
                    label="Draft"
                    value={
                        drafts
                    }
                />

                <Summary
                    label="Open orders"
                    value={
                        open
                    }
                />

                <Summary
                    label="Order value"
                    value={formatMoney(
                        totalValue,
                    )}
                />
            </div>

            <DataTable
                data={
                    purchaseOrders
                }
                columns={
                    columns
                }
                search={{
                    placeholder:
                        "Search PO, supplier or reference...",

                    filterFn: (
                        purchaseOrder,
                        query,
                    ) =>
                        [
                            purchaseOrder.purchaseOrderNumber,
                            purchaseOrder.supplierName,
                            purchaseOrder.supplierCode,
                            purchaseOrder.supplierReference ??
                            "",
                            purchaseOrder.status,
                        ]
                            .join(
                                " ",
                            )
                            .toLowerCase()
                            .includes(
                                query,
                            ),
                }}
                pagination={{
                    pageSize:
                        10,
                }}
                onRowClick={(
                    purchaseOrder,
                ) =>
                    navigate(
                        `/purchases/${purchaseOrder.id}`,
                    )
                }
            />
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

            <div className="mt-2 font-display text-2xl">
                {value}
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
            style:
                "currency",

            currency:
                "AUD",
        },
    );
}