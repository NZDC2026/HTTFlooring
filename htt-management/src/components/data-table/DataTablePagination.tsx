import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import type { Table } from "@tanstack/react-table";

import { Button } from "../ui/Button";

interface DataTablePaginationProps<TData> {
    table: Table<TData>;
}

export function DataTablePagination<TData>({
    table,
}: DataTablePaginationProps<TData>) {
    const pageIndex = table.getState().pagination.pageIndex;
    const pageSize = table.getState().pagination.pageSize;
    const totalRows = table.getFilteredRowModel().rows.length;

    const start =
        totalRows === 0
            ? 0
            : pageIndex * pageSize + 1;

    const end = Math.min(
        (pageIndex + 1) * pageSize,
        totalRows,
    );

    return (
        <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3">
            <div className="text-xs text-[var(--color-text-muted)]">
                {start}–{end} of {totalRows}
            </div>

            <div className="flex flex-wrap items-center gap-2 print:hidden"><label className="text-xs">Rows per page <select aria-label="Rows per page" value={pageSize} onChange={e=>table.setPageSize(Number(e.target.value))}>{[...new Set([pageSize,10,25,50,100])].sort((a,b)=>a-b).map(n=><option key={n} value={n}>{n}</option>)}</select></label>
                <span className="mr-2 text-xs text-[var(--color-text-muted)]">
                    Page {pageIndex + 1} of{" "}
                    {Math.max(table.getPageCount(), 1)}
                </span>

                <Button
                    variant="secondary"
                    size="icon"
                    disabled={!table.getCanPreviousPage()}
                    onClick={() => table.previousPage()}
                    aria-label="Previous page"
                    className="h-8 w-8"
                >
                    <ChevronLeft size={15} />
                </Button>

                <Button
                    variant="secondary"
                    size="icon"
                    disabled={!table.getCanNextPage()}
                    onClick={() => table.nextPage()}
                    aria-label="Next page"
                    className="h-8 w-8"
                >
                    <ChevronRight size={15} />
                </Button>
            </div>
        </div>
    );
}