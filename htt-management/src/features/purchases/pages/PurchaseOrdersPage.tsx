import {
    ArrowRight,
    Banknote,
    Boxes,
    FileMinus2,
    FileText,
    Plus,
    ReceiptText,
    Scale,
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
    useAccountsPayable,
} from "../data/useAccountsPayable";

import {
    useGoodsReceipts,
} from "../data/useGoodsReceipts";

import {
    usePurchaseOrders,
} from "../data/usePurchaseOrders";

import {
    useSupplierBills,
} from "../data/useSupplierBills";

import {
    useSupplierCredits,
} from "../data/useSupplierCredits";

import {
    useSupplierPayments,
} from "../data/useSupplierPayments";

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

            header:
                "PO Number",

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

            header:
                "Supplier",

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

            header:
                "Status",

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

            header:
                "Total",

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

    const goodsReceipts =
        useGoodsReceipts();

    const supplierBills =
        useSupplierBills();

    const supplierPayments =
        useSupplierPayments();

    const supplierCredits =
        useSupplierCredits();

    const accountsPayable =
        useAccountsPayable(
            getToday(),
        );

    const drafts =
        purchaseOrders.filter(
            (
                purchaseOrder,
            ) =>
                purchaseOrder.status ===
                "DRAFT",
        ).length;

    const openOrders =
        purchaseOrders.filter(
            (
                purchaseOrder,
            ) =>
                [
                    "APPROVED",
                    "SENT",
                    "PARTIALLY_RECEIVED",
                    "RECEIVED",
                ].includes(
                    purchaseOrder.status,
                ),
        ).length;

    const activeBills =
        supplierBills.filter(
            (bill) =>
                bill.status !==
                "VOID",
        );

    const outstandingBills =
        activeBills.filter(
            (bill) =>
                bill.totals
                    .amountDue >
                0,
        ).length;

    const postedPayments =
        supplierPayments.filter(
            (payment) =>
                payment.status ===
                "POSTED",
        );

    const activeCredits =
        supplierCredits.filter(
            (credit) =>
                credit.status !==
                "VOID",
        );

    const availableCredits =
        activeCredits.reduce(
            (
                total,
                credit,
            ) =>
                total +
                credit.amountAvailable,
            0,
        );

    const totalOrderValue =
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
            <div className="mb-7 flex items-start justify-between gap-6">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        Operations
                    </p>

                    <h1 className="font-display text-[34px] leading-tight">
                        Purchases
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
                        Manage
                        purchase
                        orders,
                        receiving,
                        supplier
                        bills,
                        payments,
                        credits and
                        accounts
                        payable.
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

            <div className="mb-6 grid grid-cols-4 gap-4">
                <Summary
                    label="Open orders"
                    value={
                        openOrders
                    }
                    detail={`${drafts} draft`}
                />

                <Summary
                    label="Goods receipts"
                    value={
                        goodsReceipts.length
                    }
                    detail="Recorded receipts"
                />

                <Summary
                    label="Outstanding bills"
                    value={
                        outstandingBills
                    }
                    detail={`${activeBills.length} active bills`}
                />

                <Summary
                    label="Net accounts payable"
                    value={formatMoney(
                        accountsPayable
                            .totalOutstanding,
                    )}
                    detail={`${accountsPayable.outstandingBillCount} open bills`}
                />
            </div>

            <div className="mb-7 grid grid-cols-4 gap-4">
                <NavigationCard
                    icon={
                        ReceiptText
                    }
                    label="Accounts Payable"
                    description="Review outstanding supplier bills and current payable balances."
                    value={formatMoney(
                        accountsPayable
                            .totalOutstanding,
                    )}
                    onClick={() =>
                        navigate(
                            "/purchases/payables",
                        )
                    }
                />

                <NavigationCard
                    icon={
                        Banknote
                    }
                    label="Supplier Payments"
                    description="Record payments and review posted supplier payment activity."
                    value={`${postedPayments.length} posted`}
                    onClick={() =>
                        navigate(
                            "/purchases/payments/new",
                        )
                    }
                />

                <NavigationCard
                    icon={
                        FileMinus2
                    }
                    label="Supplier Credits"
                    description="Supplier credits are created from their source supplier bill."
                    value={formatMoney(
                        availableCredits,
                    )}
                    onClick={() =>
                        navigate(
                            "/purchases/payables",
                        )
                    }
                />

                <NavigationCard
                    icon={
                        Scale
                    }
                    label="AP Reconciliation"
                    description="Reconcile net AP against supplier accounts, aging and statements."
                    value={
                        accountsPayable
                            .supplierCount >
                            0
                            ? `${accountsPayable.supplierCount} suppliers`
                            : "No balances"
                    }
                    onClick={() =>
                        navigate(
                            "/purchases/payables/reconciliation",
                        )
                    }
                />
            </div>

            <div className="mb-7 grid grid-cols-3 gap-4">
                <QuickLink
                    icon={
                        Boxes
                    }
                    title="Receiving"
                    description={`${goodsReceipts.length} goods receipts recorded`}
                    onClick={() =>
                        navigate(
                            "/purchases",
                        )
                    }
                />

                <QuickLink
                    icon={
                        FileText
                    }
                    title="Aged Payables"
                    description="Review gross supplier bill balances by due-date aging."
                    onClick={() =>
                        navigate(
                            "/reports/aged-payables",
                        )
                    }
                />

                <QuickLink
                    icon={
                        ReceiptText
                    }
                    title="Supplier Bills"
                    description={`${activeBills.length} active bills · ${outstandingBills} outstanding`}
                    onClick={() =>
                        navigate(
                            "/purchases/payables",
                        )
                    }
                />
            </div>

            <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                        Purchase
                        Orders
                    </div>

                    <h2 className="mt-1 font-display text-2xl">
                        Order
                        activity
                    </h2>
                </div>

                <div className="text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                        Active order
                        value
                    </div>

                    <div className="money mt-1 text-sm font-semibold text-[var(--color-primary)]">
                        {formatMoney(
                            totalOrderValue,
                        )}
                    </div>
                </div>
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
    detail,
}: {
    label: string;
    value:
    | string
    | number;
    detail: string;
}) {
    return (
        <div className="rounded-xl border border-[var(--color-border)] bg-white px-5 py-4">
            <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                {label}
            </div>

            <div className="mt-2 font-display text-2xl">
                {value}
            </div>

            <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                {detail}
            </div>
        </div>
    );
}

function NavigationCard({
    icon: Icon,
    label,
    description,
    value,
    onClick,
}: {
    icon: typeof ReceiptText;
    label: string;
    description: string;
    value: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={
                onClick
            }
            className="group rounded-xl border border-[var(--color-border)] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-xs)]"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                    <Icon
                        size={
                            17
                        }
                    />
                </div>

                <ArrowRight
                    size={
                        15
                    }
                    className="text-[var(--color-text-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                />
            </div>

            <div className="mt-4 text-sm font-semibold">
                {label}
            </div>

            <div className="mt-1 min-h-10 text-xs leading-5 text-[var(--color-text-secondary)]">
                {
                    description
                }
            </div>

            <div className="money mt-4 text-sm font-semibold text-[var(--color-primary)]">
                {value}
            </div>
        </button>
    );
}

function QuickLink({
    icon: Icon,
    title,
    description,
    onClick,
}: {
    icon: typeof Boxes;
    title: string;
    description: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={
                onClick
            }
            className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-white px-5 py-4 text-left transition hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-muted)]"
        >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                <Icon
                    size={
                        17
                    }
                />
            </div>

            <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">
                    {title}
                </div>

                <div className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    {
                        description
                    }
                </div>
            </div>

            <ArrowRight
                size={
                    15
                }
                className="shrink-0 text-[var(--color-text-muted)]"
            />
        </button>
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