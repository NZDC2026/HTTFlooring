import {
    AlertTriangle,
    CalendarDays,
    CircleDollarSign,
    FileText,
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
    useSupplierBills,
} from "../data/useSupplierBills";

import {
    useAccountsPayable,
} from "../data/useAccountsPayable";

import {
    SupplierBillStatusBadge,
} from "../components/SupplierBillStatusBadge";

export function AccountsPayablePage() {
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
    ] = useState("");

    const [
        filter,
        setFilter,
    ] = useState<
        "ALL" | "OVERDUE"
    >("ALL");

    const bills =
        useSupplierBills();

    const summary =
        useAccountsPayable(
            asOfDate,
        );

    const outstandingBills =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            return bills
                .filter(
                    (bill) =>
                        bill.status !==
                        "VOID" &&
                        bill.billDate <=
                        asOfDate &&
                        bill.totals
                            .amountDue >
                        0,
                )
                .filter(
                    (bill) => {
                        const overdue =
                            bill.dueDate <
                            asOfDate;

                        if (
                            filter ===
                            "OVERDUE" &&
                            !overdue
                        ) {
                            return false;
                        }

                        if (!query) {
                            return true;
                        }

                        return [
                            bill.billNumber,
                            bill.supplierInvoiceNumber,
                            bill.supplierName,
                            bill.supplierCode,
                            bill.purchaseOrderNumber,
                        ]
                            .join(" ")
                            .toLowerCase()
                            .includes(
                                query,
                            );
                    },
                )
                .sort(
                    (a, b) =>
                        a.dueDate.localeCompare(
                            b.dueDate,
                        ),
                );
        }, [
            bills,
            asOfDate,
            search,
            filter,
        ]);

    return (
        <div className="pb-8">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        Finance
                    </p>

                    <h1 className="font-display text-[34px] leading-tight">
                        Accounts Payable
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Review supplier
                        balances and
                        outstanding bills.
                    </p>
                </div>

                <div className="flex items-end gap-3">
                    <label>
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
                                    event.target
                                        .value,
                                )
                            }
                            className="h-10 rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                        />
                    </label>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/purchases/payables/reconciliation",
                                )
                            }
                            className="h-10 rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)]"
                        >
                            Reconcile AP
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/purchases/payments/new",
                                )
                            }
                            className="h-10 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white"
                        >
                            Record Payment
                        </button>
                    </div>
                </div>
            </div>

            <div className="mb-5 grid grid-cols-4 gap-4">
                <MetricCard
                    icon={
                        CircleDollarSign
                    }
                    label="Total Payable"
                    value={formatMoney(
                        summary.totalOutstanding,
                    )}
                    detail={`${summary.outstandingBillCount} outstanding bills`}
                />

                <MetricCard
                    icon={
                        AlertTriangle
                    }
                    label="Overdue"
                    value={formatMoney(
                        summary.overdueAmount,
                    )}
                    detail={`${summary.overdueBillCount} overdue bills`}
                    danger={
                        summary.overdueAmount >
                        0
                    }
                />

                <MetricCard
                    icon={
                        Users
                    }
                    label="Suppliers Owed"
                    value={String(
                        summary.supplierCount,
                    )}
                    detail={`${summary.overdueSupplierCount} suppliers overdue`}
                />

                <MetricCard
                    icon={
                        FileText
                    }
                    label="Current"
                    value={formatMoney(
                        summary.aging
                            .current,
                    )}
                    detail="Not yet overdue"
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
                                supplier balances
                                grouped by due
                                date.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/reports/aged-payables",
                                )
                            }
                            className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
                        >
                            View Aged
                            Payables →
                        </button>
                    </div>

                    <div className="grid grid-cols-5 overflow-hidden rounded-lg border border-[var(--color-border)]">
                        <AgingCell
                            label="Current"
                            value={
                                summary.aging
                                    .current
                            }
                        />

                        <AgingCell
                            label="1–30 Days"
                            value={
                                summary.aging
                                    .days1To30
                            }
                            overdue
                        />

                        <AgingCell
                            label="31–60 Days"
                            value={
                                summary.aging
                                    .days31To60
                            }
                            overdue
                        />

                        <AgingCell
                            label="61–90 Days"
                            value={
                                summary.aging
                                    .days61To90
                            }
                            overdue
                        />

                        <AgingCell
                            label="90+ Days"
                            value={
                                summary.aging
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
                            Outstanding Bills
                        </h2>

                        <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                            Supplier bills
                            contributing to
                            Accounts Payable.
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
                                Overdue
                            </FilterButton>
                        </div>

                        <div className="relative w-[260px]">
                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                            />

                            <input
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
                                placeholder="Search bills..."
                                className="h-9 w-full rounded-lg border border-[var(--color-border)] bg-white pl-9 pr-3 text-xs outline-none focus:border-[var(--color-primary)]"
                            />
                        </div>
                    </div>
                </div>

                {outstandingBills.length ===
                    0 ? (
                    <div className="px-5 py-12 text-center text-sm text-[var(--color-text-muted)]">
                        No outstanding
                        supplier bills.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                                    <Header>
                                        Bill
                                    </Header>
                                    <Header>
                                        Supplier
                                    </Header>
                                    <Header>
                                        Supplier Invoice
                                    </Header>
                                    <Header>
                                        Due Date
                                    </Header>
                                    <Header>
                                        Status
                                    </Header>
                                    <Header align="right">
                                        Total
                                    </Header>
                                    <Header align="right">
                                        Paid
                                    </Header>
                                    <Header align="right">
                                        Due
                                    </Header>
                                </tr>
                            </thead>

                            <tbody>
                                {outstandingBills.map(
                                    (bill) => {
                                        const overdue =
                                            bill.dueDate <
                                            asOfDate;

                                        return (
                                            <tr
                                                key={
                                                    bill.id
                                                }
                                                onClick={() =>
                                                    navigate(
                                                        `/purchases/bills/${bill.id}`,
                                                    )
                                                }
                                                className="cursor-pointer border-b border-[var(--color-border)] transition last:border-b-0 hover:bg-[var(--color-surface-muted)]"
                                            >
                                                <td className="px-4 py-4 text-sm font-semibold text-[var(--color-primary)]">
                                                    {
                                                        bill.billNumber
                                                    }
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="text-sm font-medium">
                                                        {
                                                            bill.supplierName
                                                        }
                                                    </div>

                                                    <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                                        {
                                                            bill.supplierCode
                                                        }
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4 text-sm">
                                                    {
                                                        bill.supplierInvoiceNumber
                                                    }
                                                </td>

                                                <td className="px-4 py-4 text-sm">
                                                    <span
                                                        className={
                                                            overdue
                                                                ? "font-semibold text-red-700"
                                                                : ""
                                                        }
                                                    >
                                                        {
                                                            bill.dueDate
                                                        }
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <SupplierBillStatusBadge
                                                        status={
                                                            bill.status
                                                        }
                                                    />
                                                </td>

                                                <MoneyCell
                                                    value={
                                                        bill.totals
                                                            .total
                                                    }
                                                />

                                                <MoneyCell
                                                    value={
                                                        bill.totals
                                                            .amountPaid
                                                    }
                                                />

                                                <MoneyCell
                                                    value={
                                                        bill.totals
                                                            .amountDue
                                                    }
                                                    strong
                                                />
                                            </tr>
                                        );
                                    },
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function MetricCard({
    icon: Icon,
    label,
    value,
    detail,
    danger = false,
}: {
    icon: React.ComponentType<{
        size?: number;
    }>;
    label: string;
    value: string;
    detail: string;
    danger?: boolean;
}) {
    return (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                        {label}
                    </div>

                    <div
                        className={[
                            "money mt-2 text-2xl font-semibold",
                            danger
                                ? "text-red-700"
                                : "text-[var(--color-primary)]",
                        ].join(" ")}
                    >
                        {value}
                    </div>

                    <div className="mt-2 text-[10px] text-[var(--color-text-muted)]">
                        {detail}
                    </div>
                </div>

                <Icon
                    size={18}
                />
            </div>
        </div>
    );
}

function AgingCell({
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
                "px-4 py-4",
                !last
                    ? "border-r border-[var(--color-border)]"
                    : "",
            ].join(" ")}
        >
            <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                {label}
            </div>

            <div
                className={[
                    "money mt-2 text-sm font-semibold",
                    overdue &&
                        value > 0
                        ? "text-red-700"
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
                    : "bg-white text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]",
            ].join(" ")}
        >
            {children}
        </button>
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

function formatMoney(
    value: number,
) {
    return new Intl.NumberFormat(
        "en-AU",
        {
            style: "currency",
            currency: "AUD",
        },
    ).format(value);
}

function getToday() {
    const now =
        new Date();

    return [
        now.getFullYear(),
        String(
            now.getMonth() +
            1,
        ).padStart(
            2,
            "0",
        ),
        String(
            now.getDate(),
        ).padStart(
            2,
            "0",
        ),
    ].join("-");
}