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
    InventoryMovementBadge,
} from "./InventoryMovementBadge";

import type {
    InventoryMovementType,
} from "../types/inventoryMovement";

import type {
    InventoryMovementRow,
} from "../types/inventoryOverview";

const columns:
    ColumnDef<
        InventoryMovementRow,
        unknown
    >[] = [
        {
            accessorKey:
                "movementNumber",

            header:
                "Movement",

            cell: ({
                row,
            }) => (
                <span className="font-medium text-[var(--color-primary)]">
                    {
                        row.original
                            .movementNumber
                    }
                </span>
            ),
        },

        {
            accessorKey:
                "occurredAt",

            header: "Date",
        },

        {
            accessorKey:
                "movementType",

            header: "Type",

            cell: ({
                row,
            }) => (
                <InventoryMovementBadge
                    type={
                        row.original
                            .movementType as InventoryMovementType
                    }
                />
            ),
        },

        {
            accessorKey:
                "productName",

            header:
                "Product",

            cell: ({
                row,
            }) => (
                <div>
                    <div className="font-medium">
                        {
                            row.original
                                .productName
                        }
                    </div>

                    <div className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                        {
                            row.original
                                .sku
                        }
                    </div>
                </div>
            ),
        },

        {
            accessorKey:
                "siteName",

            header: "Site",

            cell: ({
                row,
            }) => (
                <div>
                    <div>
                        {
                            row.original
                                .siteName
                        }
                    </div>

                    <div className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                        {
                            row.original
                                .siteCode
                        }
                    </div>
                </div>
            ),
        },

        {
            id: "transaction",

            header:
                "Transaction",

            cell: ({
                row,
            }) => (
                <div className="text-right">
                    <span className="font-medium">
                        {formatQuantity(
                            row.original
                                .transactionQuantity,
                        )}
                    </span>

                    <span className="ml-1 text-xs text-[var(--color-text-muted)]">
                        {
                            row.original
                                .transactionUnitSymbol
                        }
                    </span>
                </div>
            ),
        },

        {
            id: "baseQuantity",

            header:
                "Inventory Qty",

            cell: ({
                row,
            }) => (
                <div className="text-right font-semibold">
                    {formatSignedQuantity(
                        row.original
                            .quantityBase,
                    )}{" "}
                    <span className="text-xs font-normal text-[var(--color-text-muted)]">
                        {
                            row.original
                                .baseUnitSymbol
                        }
                    </span>
                </div>
            ),
        },

        {
            accessorKey:
                "referenceNumber",

            header:
                "Reference",

            cell: ({
                row,
            }) =>
                row.original
                    .referenceNumber ??
                "—",
        },
    ];

interface Props {
    rows:
    InventoryMovementRow[];
}

export function InventoryMovementTable({
    rows,
}: Props) {
    const navigate =
        useNavigate();

    function handleRowClick(
        row:
            InventoryMovementRow,
    ) {
        if (
            row.referenceType ===
            "GOODS_RECEIPT" &&
            row.referenceId
        ) {
            navigate(
                `/purchases/goods-receipts/${row.referenceId}`,
            );
        }
    }

    return (
        <DataTable
            data={rows}
            columns={
                columns
            }
            search={{
                placeholder:
                    "Search movement, product, SKU, site, PO or reference...",

                filterFn: (
                    row,
                    query,
                ) =>
                    [
                        row.movementNumber,
                        row.movementType,
                        row.productName,
                        row.sku,
                        row.siteName,
                        row.siteCode,
                        row.referenceNumber ??
                        "",
                        row.purchaseOrderNumber ??
                        "",
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
            onRowClick={
                handleRowClick
            }
        />
    );
}

function formatQuantity(
    value: number,
) {
    return value.toLocaleString(
        "en-AU",
        {
            maximumFractionDigits:
                4,
        },
    );
}

function formatSignedQuantity(
    value: number,
) {
    const formatted =
        Math.abs(
            value,
        ).toLocaleString(
            "en-AU",
            {
                maximumFractionDigits:
                    4,
            },
        );

    return value >= 0
        ? `+${formatted}`
        : `-${formatted}`;
}