import { useMemo, useState } from "react";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Search,
} from "lucide-react";

import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type ColumnDef,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table";

import { cn } from "../../lib/cn";
import { Input } from "../ui/Input";
import { DataTablePagination } from "./DataTablePagination";
import type {
    DataTablePaginationConfig,
    DataTableSearchConfig,
} from "./types";

interface DataTableProps<TData> {
    data: TData[];
    columns: ColumnDef<TData, unknown>[];

    search?: DataTableSearchConfig<TData>;
    pagination?: DataTablePaginationConfig;

    emptyTitle?: string;
    emptyDescription?: string;

    onRowClick?: (row: TData) => void;
}

export function DataTable<TData>({
    data,
    columns,
    search,
    pagination,
    emptyTitle = "No results found",
    emptyDescription = "Try adjusting your search or filters.",
    onRowClick,
}: DataTableProps<TData>) {
    const [sorting, setSorting] =
        useState<SortingState>([]);

    const [query, setQuery] = useState("");

    const filteredData = useMemo(() => {
        if (!query.trim()) {
            return data;
        }

        const normalizedQuery =
            query.trim().toLowerCase();

        if (search?.filterFn) {
            return data.filter((row) =>
                search.filterFn?.(row, normalizedQuery),
            );
        }

        return data.filter((row) =>
            JSON.stringify(row)
                .toLowerCase()
                .includes(normalizedQuery),
        );
    }, [data, query, search]);

    const table = useReactTable({
        data: filteredData,
        columns,

        state: {
            sorting,
        },

        onSortingChange: setSorting,

        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel:
            getPaginationRowModel(),

        initialState: {
            pagination: {
                pageSize: pagination?.pageSize ?? 10,
            },
        },
    });

    return (
        <div
            className="
        overflow-hidden
        rounded-[var(--radius-card)]
        border border-[var(--color-border)]
        bg-white
        shadow-[var(--shadow-xs)]
      "
        >
            {search && (
                <div className="flex items-center border-b border-[var(--color-border)] px-4 py-3">
                    <div className="relative w-[320px]">
                        <Search
                            size={15}
                            className="
                absolute left-3 top-1/2
                -translate-y-1/2
                text-[var(--color-text-muted)]
              "
                        />

                        <Input
                            value={query}
                            onChange={(event) => {
                                setQuery(event.target.value);
                                table.setPageIndex(0);
                            }}
                            placeholder={
                                search.placeholder ??
                                "Search..."
                            }
                            className="h-9 pl-9"
                        />
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        {table
                            .getHeaderGroups()
                            .map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(
                                        (header) => {
                                            const canSort =
                                                header.column.getCanSort();

                                            const sorted =
                                                header.column.getIsSorted();

                                            return (
                                                <th
                                                    key={header.id}
                                                    className="
                            h-10
                            border-b border-[var(--color-border)]
                            bg-[var(--color-background-subtle)]
                            px-4 text-left
                            text-[11px] font-semibold
                            uppercase tracking-[0.06em]
                            text-[var(--color-text-muted)]
                          "
                                                >
                                                    {header.isPlaceholder ? null : (
                                                        <button
                                                            type="button"
                                                            disabled={!canSort}
                                                            onClick={
                                                                canSort
                                                                    ? header.column.getToggleSortingHandler()
                                                                    : undefined
                                                            }
                                                            className={cn(
                                                                "inline-flex items-center gap-1.5",
                                                                canSort &&
                                                                "cursor-pointer hover:text-[var(--color-text-primary)]",
                                                            )}
                                                        >
                                                            {flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext(),
                                                            )}

                                                            {canSort &&
                                                                (sorted === "asc" ? (
                                                                    <ArrowUp size={12} />
                                                                ) : sorted ===
                                                                    "desc" ? (
                                                                    <ArrowDown size={12} />
                                                                ) : (
                                                                    <ArrowUpDown
                                                                        size={12}
                                                                        className="opacity-40"
                                                                    />
                                                                ))}
                                                        </button>
                                                    )}
                                                </th>
                                            );
                                        },
                                    )}
                                </tr>
                            ))}
                    </thead>

                    <tbody>
                        {table.getRowModel().rows.length >
                            0 ? (
                            table
                                .getRowModel()
                                .rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        onClick={() =>
                                            onRowClick?.(row.original)
                                        }
                                        className={cn(
                                            "border-b border-[var(--color-border)] last:border-b-0",
                                            "transition-colors",
                                            onRowClick &&
                                            "cursor-pointer hover:bg-[var(--color-surface-hover)]",
                                        )}
                                    >
                                        {row
                                            .getVisibleCells()
                                            .map((cell) => (
                                                <td
                                                    key={cell.id}
                                                    className="
                            h-[52px] px-4
                            text-[13px]
                            text-[var(--color-text-primary)]
                          "
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef
                                                            .cell,
                                                        cell.getContext(),
                                                    )}
                                                </td>
                                            ))}
                                    </tr>
                                ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="h-48 text-center"
                                >
                                    <div className="font-medium">
                                        {emptyTitle}
                                    </div>

                                    <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                                        {emptyDescription}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && (
                <DataTablePagination table={table} />
            )}
        </div>
    );
}