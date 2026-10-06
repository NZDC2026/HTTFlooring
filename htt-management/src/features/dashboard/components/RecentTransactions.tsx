import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { DataTable } from "../../../components/data-table/DataTable";

import {
    recentTransactions,
    type DashboardTransaction,
} from "../data/mockDashboard";

const statusVariant = {
    Paid: "success",
    Sent: "info",
    Overdue: "danger",
    Pending: "warning",
} as const;

const columns: ColumnDef<
    DashboardTransaction,
    unknown
>[] = [
        {
            accessorKey: "date",
            header: "Date",
        },
        {
            accessorKey: "reference",
            header: "Reference",
            cell: ({ row }) => (
                <span className="font-medium text-[var(--color-primary)]">
                    {row.original.reference}
                </span>
            ),
        },
        {
            accessorKey: "contact",
            header: "Contact",
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => (
                <span className="text-[var(--color-text-secondary)]">
                    {row.original.type}
                </span>
            ),
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => (
                <div className="money text-right font-medium">
                    $
                    {row.original.amount.toLocaleString(
                        "en-AU",
                        {
                            minimumFractionDigits: 2,
                        },
                    )}
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge
                    variant={
                        statusVariant[row.original.status]
                    }
                >
                    {row.original.status}
                </Badge>
            ),
        },
        {
            id: "actions",
            enableSorting: false,
            header: "",
            cell: () => (
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <MoreHorizontal size={15} />
                    </Button>
                </div>
            ),
        },
    ];

export function RecentTransactions() {
    return (
        <section>
            <div className="mb-3 flex items-end justify-between">
                <div>
                    <h2 className="font-display text-xl">
                        Recent Transactions
                    </h2>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        Latest activity across your business
                    </p>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                >
                    View all transactions
                </Button>
            </div>

            <DataTable
                data={recentTransactions}
                columns={columns}
                search={{
                    placeholder:
                        "Search transactions...",
                    filterFn: (row, query) =>
                        row.reference
                            .toLowerCase()
                            .includes(query) ||
                        row.contact
                            .toLowerCase()
                            .includes(query) ||
                        row.type
                            .toLowerCase()
                            .includes(query) ||
                        row.status
                            .toLowerCase()
                            .includes(query),
                }}
                pagination={{
                    pageSize: 5,
                }}
                onRowClick={(transaction) => {
                    console.log(
                        "Transaction selected:",
                        transaction,
                    );
                }}
            />
        </section>
    );
}