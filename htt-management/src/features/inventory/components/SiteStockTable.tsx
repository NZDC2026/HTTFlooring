import type {
    ColumnDef,
} from "@tanstack/react-table";

import {
    DataTable,
} from "../../../components/data-table/DataTable";

import type {
    InventoryStockRow,
} from "../types/inventoryOverview";

const columns:
    ColumnDef<
        InventoryStockRow,
        unknown
    >[] = [
        {
            accessorKey:
                "sku",

            header: "SKU",

            cell: ({
                row,
            }) => (
                <span className="font-medium text-[var(--color-primary)]">
                    {
                        row.original
                            .sku
                    }
                </span>
            ),
        },

        {
            accessorKey:
                "productName",

            header: "Product",

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
                                .category
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
                    <div className="text-sm">
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
            id: "onHand",

            header:
                "On Hand",

            accessorFn: (
                row,
            ) =>
                row.quantityOnHand,

            cell: ({
                row,
            }) => (
                <div className="text-right">
                    <span className="font-semibold">
                        {formatQuantity(
                            row.original
                                .quantityOnHand,
                        )}
                    </span>

                    <span className="ml-1 text-xs text-[var(--color-text-muted)]">
                        {
                            row.original
                                .baseUnitSymbol
                        }
                    </span>
                </div>
            ),
        },
    ];

interface Props {
    rows:
    InventoryStockRow[];
}

export function SiteStockTable({
    rows,
}: Props) {
    return (
        <DataTable
            data={rows}
            columns={
                columns
            }
            search={{
                placeholder:
                    "Search SKU, product, category or site...",

                filterFn: (
                    row,
                    query,
                ) =>
                    [
                        row.sku,
                        row.productName,
                        row.category,
                        row.siteName,
                        row.siteCode,
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