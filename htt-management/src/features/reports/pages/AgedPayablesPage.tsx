import {
    AlertTriangle,
    ArrowUpRight,
    CalendarDays,
    CircleDollarSign,
    Clock3,
    Search,
    Users,
} from "lucide-react";

import {
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    useAgedPayables,
} from "../data/useAgedPayables";

import type {
    AgedPayablesRow,
} from "../types/agedPayables";

type ReportFilter =
    | "ALL"
    | "OVERDUE";

export function AgedPayablesPage() {
    const navigate =
        useNavigate();

    const [
        asOfDate,
        setAsOfDate,
    ] = useState(
        getToday(),
    );

    const [
        search,
        setSearch,
    ] = useState(
        "",
    );

    const [
        filter,
        setFilter,
    ] = useState<ReportFilter>(
        "ALL",
    );

    const report =
        useAgedPayables(
            asOfDate,
        );

    const rows =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            return report.rows.filter(
                (row) => {
                    if (
                        filter ===
                        "OVERDUE" &&
                        row.overdueAmount <=
                        0
                    ) {
                        return false;
                    }

                    if (!query) {
                        return true;
                    }

                    return (
                        row.supplierName
                            .toLowerCase()
                            .includes(
                                query,
                            ) ||
                        row.supplierCode
                            .toLowerCase()
                            .includes(
                                query,
                            )
                    );
                },
            );
        }, [
            report.rows,
            search,
            filter,
        ]);

    const overduePercentage =
        report.totalOutstanding >
            0
            ? (
                (report.totalOverdue /
                    report.totalOutstanding) *
                100
            ).toFixed(1)
            : "0.0";

    return (
        <div className="mx-auto w-full max-w-[1600px]">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">
                        Reports
                    </div>

                    <h1 className="font-display text-3xl text-[var(--color-primary)]">
                        Aged Payables
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
                        Review outstanding
                        supplier balances by
                        invoice due date.
                    </p>
                </div>

                <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">
                        <CalendarDays
                            size={12}
                        />

                        As At Date
                    </span>

                    <input
                        type="date"
                        value={
                            asOfDate
                        }
                        max={
                            getToday()
                        }
                        onChange={(
                            event,
                        ) =>
                            setAsOfDate(
                                event
                                    .target
                                    .value,
                            )
                        }
                        className="h-10 rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
                    />
                </label>
            </div>

            <div className="mb-5 grid grid-cols-4 gap-4">
                <MetricCard
                    icon={
                        CircleDollarSign
                    }
                    label="Total Payables"
                    value={formatMoney(
                        report.totalOutstanding,
                    )}
                    detail={`${report.supplierCount} suppliers with outstanding balances`}
                />

                <MetricCard
                    icon={
                        AlertTriangle
                    }
                    label="Overdue"
                    value={formatMoney(
                        report.totalOverdue,
                    )}
                    detail={`${report.overdueSupplierCount} suppliers overdue`}
                    danger={
                        report.totalOverdue >
                        0
                    }
                />

                <MetricCard
                    icon={
                        Clock3
                    }
                    label="Overdue %"
                    value={`${overduePercentage}%`}
                    detail="Of total Payables"
                    danger={
                        report.totalOverdue >
                        0
                    }
                />

                <MetricCard
                    icon={
                        Users
                    }
                    label="Suppliers"
                    value={String(
                        report.supplierCount,
                    )}
                    detail="With open payables"
                />
            </div>

            <div className="mb-5 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="border-b border-[var(--color-border)] px-5 py-4">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold">
                                Aging Summary
                            </h2>

                            <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                Outstanding
                                Payables grouped
                                by days past due.
                            </p>
                        </div>

                        <div className="money text-sm font-semibold text-[var(--color-primary)]">
                            {formatMoney(
                                report.totalOutstanding,
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-5 overflow-hidden rounded-lg border border-[var(--color-border)]">
                        <AgingSummaryCell
                            label="Current"
                            value={
                                report
                                    .aging
                                    .current
                            }
                        />

                        <AgingSummaryCell
                            label="1–30 Days"
                            value={
                                report
                                    .aging
                                    .days1To30
                            }
                            overdue
                        />

                        <AgingSummaryCell
                            label="31–60 Days"
                            value={
                                report
                                    .aging
                                    .days31To60
                            }
                            overdue
                        />

                        <AgingSummaryCell
                            label="61–90 Days"
                            value={
                                report
                                    .aging
                                    .days61To90
                            }
                            overdue
                        />

                        <AgingSummaryCell
                            label="90+ Days"
                            value={
                                report
                                    .aging
                                    .days90Plus
                            }
                            overdue
                            last
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4">
                    <div>
                        <h2 className="text-sm font-semibold">
                            Supplier Balances
                        </h2>

                        <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                            Click a supplier to
                            review outstanding
                            invoices and account
                            activity.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex overflow-hidden rounded-lg border border-[var(--color-border)]">
                            <FilterButton
                                active={
                                    filter ===
                                    "ALL"
                                }
                                onClick={() =>
                                    setFilter(
                                        "ALL",
                                    )
                                }
                            >
                                All
                            </FilterButton>

                            <FilterButton
                                active={
                                    filter ===
                                    "OVERDUE"
                                }
                                onClick={() =>
                                    setFilter(
                                        "OVERDUE",
                                    )
                                }
                            >
                                Overdue Only
                            </FilterButton>
                        </div>

                        <div className="relative w-[260px]">
                            <Search
                                size={14}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                            />

                            <input
                                type="search"
                                value={
                                    search
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setSearch(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="Search supplier..."
                                className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-[minmax(220px,1fr)_130px_130px_130px_130px_130px_150px_36px] gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">
                    <div>
                        Supplier
                    </div>

                    <div className="text-right">
                        Current
                    </div>

                    <div className="text-right">
                        1–30
                    </div>

                    <div className="text-right">
                        31–60
                    </div>

                    <div className="text-right">
                        61–90
                    </div>

                    <div className="text-right">
                        90+
                    </div>

                    <div className="text-right">
                        Total
                    </div>

                    <div />
                </div>

                {rows.length ===
                    0 ? (
                    <div className="px-6 py-14 text-center">
                        <div className="text-sm font-medium">
                            No Payables found
                        </div>

                        <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                            No supplier balances
                            match the current
                            filters.
                        </div>
                    </div>
                ) : (
                    rows.map(
                        (row) => (
                            <SupplierRow
                                key={
                                    row.supplierId
                                }
                                row={
                                    row
                                }
                                onOpen={() =>
                                    navigate(
                                        `/contacts/suppliers/${row.supplierId}/sales`,
                                    )
                                }
                            />
                        ),
                    )
                )}

                {rows.length >
                    0 && (
                        <div className="grid grid-cols-[minmax(220px,1fr)_130px_130px_130px_130px_130px_150px_36px] gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-4">
                            <div className="text-sm font-semibold">
                                Total
                            </div>

                            <MoneyCell
                                value={sumRows(
                                    rows,
                                    "current",
                                )}
                            />

                            <MoneyCell
                                value={sumRows(
                                    rows,
                                    "days1To30",
                                )}
                                overdue
                            />

                            <MoneyCell
                                value={sumRows(
                                    rows,
                                    "days31To60",
                                )}
                                overdue
                            />

                            <MoneyCell
                                value={sumRows(
                                    rows,
                                    "days61To90",
                                )}
                                overdue
                            />

                            <MoneyCell
                                value={sumRows(
                                    rows,
                                    "days90Plus",
                                )}
                                overdue
                            />

                            <div className="money whitespace-nowrap text-right text-sm font-semibold text-[var(--color-primary)]">
                                {formatMoney(
                                    rows.reduce(
                                        (
                                            total,
                                            row,
                                        ) =>
                                            total +
                                            row.totalOutstanding,
                                        0,
                                    ),
                                )}
                            </div>

                            <div />
                        </div>
                    )}
            </div>

            <div className="mt-3 text-[10px] text-[var(--color-text-muted)]">
                Balances are reconstructed
                from invoices, payments and
                payment reversals as at the
                selected date.
            </div>
        </div>
    );
}

function SupplierRow({
    row,
    onOpen,
}: {
    row:
    AgedPayablesRow;

    onOpen:
    () => void;
}) {
    return (
        <button
            type="button"
            onClick={
                onOpen
            }
            className="grid w-full grid-cols-[minmax(220px,1fr)_130px_130px_130px_130px_130px_150px_36px] items-center gap-3 border-b border-[var(--color-border)] px-5 py-4 text-left transition last:border-b-0 hover:bg-[var(--color-surface-hover)]"
        >
            <div className="min-w-0">
                <div className="truncate text-sm font-semibold">
                    {
                        row.supplierName
                    }
                </div>

                <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
                    <span className="font-mono">
                        {
                            row.supplierCode
                        }
                    </span>

                    <span>
                        {
                            row.outstandingBillCount
                        }{" "}
                        open{" "}
                        {row.outstandingBillCount ===
                            1
                            ? "invoice"
                            : "invoices"}
                    </span>
                </div>
            </div>

            <MoneyCell
                value={
                    row.aging
                        .current
                }
            />

            <MoneyCell
                value={
                    row.aging
                        .days1To30
                }
                overdue
            />

            <MoneyCell
                value={
                    row.aging
                        .days31To60
                }
                overdue
            />

            <MoneyCell
                value={
                    row.aging
                        .days61To90
                }
                overdue
            />

            <MoneyCell
                value={
                    row.aging
                        .days90Plus
                }
                overdue
            />

            <div className="money whitespace-nowrap text-right text-sm font-semibold text-[var(--color-primary)]">
                {formatMoney(
                    row.totalOutstanding,
                )}
            </div>

            <ArrowUpRight
                size={14}
                className="text-[var(--color-text-muted)]"
            />
        </button>
    );
}

function MetricCard({
    icon: Icon,
    label,
    value,
    detail,
    danger = false,
}: {
    icon:
    typeof CircleDollarSign;

    label: string;
    value: string;
    detail: string;
    danger?: boolean;
}) {
    return (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
            <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-secondary)]">
                    {label}
                </span>

                <Icon
                    size={16}
                    className={
                        danger
                            ? "text-[var(--color-danger)]"
                            : "text-[var(--color-text-muted)]"
                    }
                />
            </div>

            <div
                className={[
                    "money mt-3 text-2xl font-semibold",
                    danger
                        ? "text-[var(--color-danger)]"
                        : "text-[var(--color-primary)]",
                ].join(" ")}
            >
                {value}
            </div>

            <div className="mt-2 text-[10px] text-[var(--color-text-muted)]">
                {detail}
            </div>
        </div>
    );
}

function AgingSummaryCell({
    label,
    value,
    overdue = false,
    last = false,
}: {
    label: string;
    value: number;
    overdue?: boolean;
    last?: boolean;
}) {
    return (
        <div
            className={[
                "px-5 py-4",
                last
                    ? ""
                    : "border-r border-[var(--color-border)]",
            ].join(" ")}
        >
            <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                {label}
            </div>

            <div
                className={[
                    "money mt-2 text-lg font-semibold",
                    overdue &&
                        value > 0
                        ? "text-[var(--color-danger)]"
                        : "text-[var(--color-primary)]",
                ].join(" ")}
            >
                {formatMoney(
                    value,
                )}
            </div>
        </div>
    );
}

function FilterButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children:
    React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={
                onClick
            }
            className={[
                "h-9 px-3 text-xs font-medium transition",
                active
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-white text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]",
            ].join(" ")}
        >
            {children}
        </button>
    );
}

function MoneyCell({
    value,
    overdue = false,
}: {
    value: number;
    overdue?: boolean;
}) {
    return (
        <div
            className={[
                "money whitespace-nowrap text-right text-xs",
                overdue &&
                    value > 0
                    ? "font-semibold text-[var(--color-danger)]"
                    : "text-[var(--color-text-primary)]",
            ].join(" ")}
        >
            {value > 0
                ? formatMoney(
                    value,
                )
                : "—"}
        </div>
    );
}

function sumRows(
    rows:
        AgedPayablesRow[],
    bucket:
        keyof AgedPayablesRow["aging"],
) {
    return rows.reduce(
        (
            total,
            row,
        ) =>
            total +
            row.aging[
            bucket
            ],
        0,
    );
}

function formatMoney(
    value: number,
) {
    return value.toLocaleString(
        "en-AU",
        {
            style: "currency",
            currency: "AUD",
            minimumFractionDigits: 2,
        },
    );
}

function getToday() {
    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() +
            1,
        ).padStart(
            2,
            "0",
        );

    const day =
        String(
            now.getDate(),
        ).padStart(
            2,
            "0",
        );

    return `${year}-${month}-${day}`;
}