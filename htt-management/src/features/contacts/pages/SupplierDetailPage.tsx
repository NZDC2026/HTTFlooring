import {
    ArrowLeft,
    Building2,
    Mail,
    MapPin,
    Pencil,
    Phone,
} from "lucide-react";

import {
    useMemo,
    useState,
} from "react";

import {
    Navigate,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    Button,
} from "../../../components/ui/Button";

import {
    Card,
    CardContent,
} from "../../../components/ui/Card";

import {
    SupplierStatusBadge,
} from "../components/SupplierStatusBadge";

import {
    useSupplier,
} from "../data/useSuppliers";

import {
    usePurchaseOrders,
} from "../../purchases/data/usePurchaseOrders";

import {
    useSupplierSupplierBills,
} from "../../purchases/data/useSupplierBills";

import {
    useSupplierAccountsPayable,
} from "../../purchases/data/useAccountsPayable";

import {
    useSupplierPaymentsBySupplier,
} from "../../purchases/data/useSupplierPayments";

import {
    SupplierBillStatusBadge,
} from "../../purchases/components/SupplierBillStatusBadge";

type SupplierTab =
    | "overview"
    | "purchases"
    | "bills"
    | "payments"
    | "account";

export function SupplierDetailPage() {
    const navigate =
        useNavigate();

    const {
        supplierId,
    } = useParams();

    const [
        activeTab,
        setActiveTab,
    ] = useState<SupplierTab>(
        "overview",
    );

    const supplier =
        useSupplier(
            supplierId,
        );

    const purchaseOrders =
        usePurchaseOrders();

    const bills =
        useSupplierSupplierBills(
            supplierId,
        );

    const payments =
        useSupplierPaymentsBySupplier(
            supplierId,
        );

    const asOfDate =
        getToday();

    const payable =
        useSupplierAccountsPayable(
            supplierId,
            asOfDate,
        );

    const supplierPurchaseOrders =
        useMemo(
            () =>
                purchaseOrders
                    .filter(
                        (purchaseOrder) =>
                            purchaseOrder.supplierId ===
                            supplierId,
                    )
                    .sort(
                        (a, b) =>
                            b.orderDate.localeCompare(
                                a.orderDate,
                            ),
                    ),
            [
                purchaseOrders,
                supplierId,
            ],
        );

    if (!supplier) {
        return (
            <Navigate
                to="/contacts/suppliers"
                replace
            />
        );
    }

    return (
        <div className="pb-8">
            <button
                type="button"
                onClick={() =>
                    navigate(
                        "/contacts/suppliers",
                    )
                }
                className="mb-5 flex items-center gap-2 text-xs text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
            >
                <ArrowLeft
                    size={14}
                />
                Back to suppliers
            </button>

            <div className="mb-7 flex items-start justify-between">
                <div>
                    <div className="mb-3 flex items-center gap-3">
                        <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                            {
                                supplier.code
                            }
                        </span>

                        <SupplierStatusBadge
                            status={
                                supplier.status
                            }
                        />
                    </div>

                    <h1 className="font-display text-[34px] leading-tight">
                        {
                            supplier.businessName
                        }
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        {supplier.tradingName ??
                            "Supplier account"}
                    </p>
                </div>

                <Button
                    variant="secondary"
                    onClick={() =>
                        navigate(
                            `/contacts/suppliers/${supplier.id}/edit`,
                        )
                    }
                >
                    <Pencil
                        size={15}
                    />
                    Edit supplier
                </Button>
            </div>

            <div className="mb-6 flex gap-1 border-b border-[var(--color-border)]">
                <Tab
                    active={
                        activeTab ===
                        "overview"
                    }
                    onClick={() =>
                        setActiveTab(
                            "overview",
                        )
                    }
                >
                    Overview
                </Tab>

                <Tab
                    active={
                        activeTab ===
                        "purchases"
                    }
                    onClick={() =>
                        setActiveTab(
                            "purchases",
                        )
                    }
                >
                    Purchases
                </Tab>

                <Tab
                    active={
                        activeTab ===
                        "bills"
                    }
                    onClick={() =>
                        setActiveTab(
                            "bills",
                        )
                    }
                >
                    Bills
                </Tab>

                <Tab
                    active={
                        activeTab ===
                        "payments"
                    }
                    onClick={() =>
                        setActiveTab(
                            "payments",
                        )
                    }
                >
                    Payments
                </Tab>

                <Tab
                    active={
                        activeTab ===
                        "account"
                    }
                    onClick={() =>
                        setActiveTab(
                            "account",
                        )
                    }
                >
                    Account
                </Tab>
            </div>

            {activeTab ===
                "overview" && (
                    <OverviewTab
                        supplier={
                            supplier
                        }
                        payable={
                            payable
                        }
                    />
                )}

            {activeTab ===
                "purchases" && (
                    <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                        <SectionHeader
                            title="Purchase Orders"
                            description="Purchase orders raised for this supplier."
                        />

                        {supplierPurchaseOrders.length ===
                            0 ? (
                            <EmptyState>
                                No purchase
                                orders for this
                                supplier.
                            </EmptyState>
                        ) : (
                            <div className="divide-y divide-[var(--color-border)]">
                                {supplierPurchaseOrders.map(
                                    (
                                        purchaseOrder,
                                    ) => (
                                        <button
                                            key={
                                                purchaseOrder.id
                                            }
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/purchases/${purchaseOrder.id}`,
                                                )
                                            }
                                            className="grid w-full grid-cols-[1.2fr_1fr_1fr_1fr_auto] items-center gap-4 px-5 py-4 text-left transition hover:bg-[var(--color-surface-muted)]"
                                        >
                                            <div>
                                                <div className="text-sm font-semibold text-[var(--color-primary)]">
                                                    {
                                                        purchaseOrder.purchaseOrderNumber
                                                    }
                                                </div>

                                                <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                                    {
                                                        purchaseOrder.status
                                                    }
                                                </div>
                                            </div>

                                            <div className="text-sm">
                                                {
                                                    purchaseOrder.orderDate
                                                }
                                            </div>

                                            <div className="text-sm">
                                                {purchaseOrder.expectedDeliveryDate ??
                                                    "—"}
                                            </div>

                                            <div className="money text-right text-sm font-semibold">
                                                {formatMoney(
                                                    purchaseOrder
                                                        .totals
                                                        .total,
                                                )}
                                            </div>

                                            <div className="text-xs font-medium text-[var(--color-primary)]">
                                                View →
                                            </div>
                                        </button>
                                    ),
                                )}
                            </div>
                        )}
                    </div>
                )}

            {activeTab ===
                "bills" && (
                    <BillsTab
                        bills={
                            bills
                        }
                        onOpen={(
                            billId,
                        ) =>
                            navigate(
                                `/purchases/bills/${billId}`,
                            )
                        }
                    />
                )}

            {activeTab ===
                "payments" && (
                    <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                            <div>
                                <h2 className="font-display text-xl">
                                    Supplier
                                    Payments
                                </h2>

                                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                    Posted and
                                    reversed
                                    payments for
                                    this supplier.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/purchases/payments/new?supplierId=${supplier.id}`,
                                    )
                                }
                                className="h-9 rounded-lg bg-[var(--color-primary)] px-3 text-xs font-semibold text-white"
                            >
                                Record Payment
                            </button>
                        </div>

                        {payments.length ===
                            0 ? (
                            <EmptyState>
                                No supplier
                                payments have
                                been recorded.
                            </EmptyState>
                        ) : (
                            <div className="divide-y divide-[var(--color-border)]">
                                {payments.map(
                                    (
                                        payment,
                                    ) => (
                                        <button
                                            key={
                                                payment.id
                                            }
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/purchases/payments/${payment.id}`,
                                                )
                                            }
                                            className="grid w-full grid-cols-[1fr_1fr_1fr_1fr_auto] items-center gap-4 px-5 py-4 text-left transition hover:bg-[var(--color-surface-muted)]"
                                        >
                                            <div>
                                                <div className="text-sm font-semibold text-[var(--color-primary)]">
                                                    {
                                                        payment.paymentNumber
                                                    }
                                                </div>

                                                <div
                                                    className={[
                                                        "mt-1 text-[10px] font-semibold",
                                                        payment.status ===
                                                            "REVERSED"
                                                            ? "text-red-700"
                                                            : "text-emerald-700",
                                                    ].join(
                                                        " ",
                                                    )}
                                                >
                                                    {
                                                        payment.status
                                                    }
                                                </div>
                                            </div>

                                            <div className="text-sm">
                                                {
                                                    payment.paymentDate
                                                }
                                            </div>

                                            <div className="text-sm">
                                                {
                                                    payment.method
                                                }
                                            </div>

                                            <div className="money text-right text-sm font-semibold">
                                                {formatMoney(
                                                    payment.amount,
                                                )}
                                            </div>

                                            <div className="text-xs font-semibold text-[var(--color-primary)]">
                                                View →
                                            </div>
                                        </button>
                                    ),
                                )}
                            </div>
                        )}
                    </div>
                )}

            {activeTab ===
                "account" && (
                    <AccountTab
                        bills={
                            bills
                        }
                        payable={
                            payable
                        }
                        payments={
                            payments
                        }
                        onOpenBill={(
                            billId,
                        ) =>
                            navigate(
                                `/purchases/bills/${billId}`,
                            )
                        }
                        onOpenPayment={(
                            paymentId,
                        ) =>
                            navigate(
                                `/purchases/payments/${paymentId}`,
                            )
                        }
                        onOpenStatement={() =>
                            navigate(
                                `/purchases/statements/${supplier.id}`,
                            )
                        }
                        onOpenPayables={() =>
                            navigate(
                                "/purchases/payables",
                            )
                        }
                    />
                )}
        </div>
    );
}

function OverviewTab({
    supplier,
    payable,
}: {
    supplier: NonNullable<
        ReturnType<
            typeof useSupplier
        >
    >;
    payable:
    ReturnType<
        typeof useSupplierAccountsPayable
    >;
}) {
    return (
        <div className="grid grid-cols-[1.4fr_1fr] gap-5">
            <Card>
                <CardContent>
                    <SectionTitle>
                        Supplier Details
                    </SectionTitle>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        <Detail
                            label="Business Name"
                            value={
                                supplier.businessName
                            }
                        />

                        <Detail
                            label="Trading Name"
                            value={
                                supplier.tradingName
                            }
                        />

                        <Detail
                            label="ABN"
                            value={
                                supplier.abn
                            }
                        />

                        <Detail
                            label="Currency"
                            value={
                                supplier.currency
                            }
                        />

                        <Detail
                            label="Payment Terms"
                            value={`${supplier.paymentTermsDays} days`}
                        />

                        <Detail
                            label="GST Registered"
                            value={
                                supplier.taxRegistered
                                    ? "Yes"
                                    : "No"
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <SectionTitle>
                        Contact
                    </SectionTitle>

                    <div className="space-y-4">
                        <ContactRow
                            icon={
                                Building2
                            }
                            value={
                                supplier.contactName
                            }
                        />

                        <ContactRow
                            icon={
                                Mail
                            }
                            value={
                                supplier.email
                            }
                        />

                        <ContactRow
                            icon={
                                Phone
                            }
                            value={
                                supplier.phone
                            }
                        />

                        <ContactRow
                            icon={
                                MapPin
                            }
                            value={formatAddress(
                                supplier,
                            )}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <SectionTitle>
                        Notes
                    </SectionTitle>

                    <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--color-text-secondary)]">
                        {supplier.notes ??
                            "No notes have been added."}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <SectionTitle>
                        Accounts Payable
                    </SectionTitle>

                    <div className="grid grid-cols-2 gap-3">
                        <AccountMetric
                            label="Outstanding"
                            value={formatMoney(
                                payable?.totalOutstanding ??
                                0,
                            )}
                        />

                        <AccountMetric
                            label="Overdue"
                            value={formatMoney(
                                payable?.overdueAmount ??
                                0,
                            )}
                            danger={
                                (payable?.overdueAmount ??
                                    0) >
                                0
                            }
                        />

                        <AccountMetric
                            label="Open Bills"
                            value={String(
                                payable?.outstandingBillCount ??
                                0,
                            )}
                        />

                        <AccountMetric
                            label="Overdue Bills"
                            value={String(
                                payable?.overdueBillCount ??
                                0,
                            )}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function BillsTab({
    bills,
    onOpen,
}: {
    bills: ReturnType<
        typeof useSupplierSupplierBills
    >;
    onOpen: (
        billId: string,
    ) => void;
}) {
    const sortedBills =
        [...bills].sort(
            (a, b) =>
                b.billDate.localeCompare(
                    a.billDate,
                ),
        );

    return (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
            <SectionHeader
                title="Supplier Bills"
                description="Supplier invoices entered against purchase orders."
            />

            {sortedBills.length ===
                0 ? (
                <EmptyState>
                    No supplier
                    bills have been
                    entered.
                </EmptyState>
            ) : (
                <div className="divide-y divide-[var(--color-border)]">
                    {sortedBills.map(
                        (bill) => (
                            <button
                                key={
                                    bill.id
                                }
                                type="button"
                                onClick={() =>
                                    onOpen(
                                        bill.id,
                                    )
                                }
                                className="grid w-full grid-cols-[1fr_1.2fr_1fr_1fr_1fr_auto] items-center gap-4 px-5 py-4 text-left transition hover:bg-[var(--color-surface-muted)]"
                            >
                                <div>
                                    <div className="text-sm font-semibold text-[var(--color-primary)]">
                                        {
                                            bill.billNumber
                                        }
                                    </div>

                                    <div className="mt-1">
                                        <SupplierBillStatusBadge
                                            status={
                                                bill.status
                                            }
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm font-medium">
                                        {
                                            bill.supplierInvoiceNumber
                                        }
                                    </div>

                                    <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                        Supplier
                                        invoice
                                    </div>
                                </div>

                                <div className="text-sm">
                                    {
                                        bill.billDate
                                    }
                                </div>

                                <div className="text-sm">
                                    Due{" "}
                                    {
                                        bill.dueDate
                                    }
                                </div>

                                <div className="money text-right text-sm font-semibold">
                                    {formatMoney(
                                        bill.totals
                                            .amountDue,
                                    )}
                                </div>

                                <div className="text-xs font-medium text-[var(--color-primary)]">
                                    View →
                                </div>
                            </button>
                        ),
                    )}
                </div>
            )}
        </div>
    );
}

function AccountTab({
    bills,
    payable,
    payments,
    onOpenBill,
    onOpenPayment,
    onOpenStatement,
    onOpenPayables,
}: {
    bills: ReturnType<
        typeof useSupplierSupplierBills
    >;
    payable:
    ReturnType<
        typeof useSupplierAccountsPayable
    >;
    payments: ReturnType<
        typeof useSupplierPaymentsBySupplier
    >;
    onOpenBill: (
        billId: string,
    ) => void;
    onOpenPayment: (
        paymentId: string,
    ) => void;
    onOpenStatement: () => void;
    onOpenPayables: () => void;
}) {
    const activeBills =
        bills
            .filter(
                (bill) =>
                    bill.status !==
                    "VOID" &&
                    bill.totals
                        .amountDue >
                    0,
            )
            .sort(
                (a, b) =>
                    a.dueDate.localeCompare(
                        b.dueDate,
                    ),
            );

    return (
        <div className="space-y-5">
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={
                        onOpenStatement
                    }
                    className="h-10 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-primary-dark)]"
                >
                    View Statement
                </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <AccountMetric
                    label="Outstanding"
                    value={formatMoney(
                        payable?.totalOutstanding ??
                        0,
                    )}
                />

                <AccountMetric
                    label="Current"
                    value={formatMoney(
                        payable?.aging
                            .current ??
                        0,
                    )}
                />

                <AccountMetric
                    label="Overdue"
                    value={formatMoney(
                        payable?.overdueAmount ??
                        0,
                    )}
                    danger={
                        (payable?.overdueAmount ??
                            0) >
                        0
                    }
                />

                <AccountMetric
                    label="Open Bills"
                    value={String(
                        payable?.outstandingBillCount ??
                        0,
                    )}
                />
            </div>

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                    <div>
                        <h2 className="text-sm font-semibold">
                            Outstanding
                            Supplier Bills
                        </h2>

                        <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                            Open AP
                            obligations for
                            this supplier.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={
                            onOpenPayables
                        }
                        className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
                    >
                        Accounts
                        Payable →
                    </button>
                </div>

                {activeBills.length ===
                    0 ? (
                    <EmptyState>
                        This supplier
                        has no
                        outstanding
                        balance.
                    </EmptyState>
                ) : (
                    <div className="divide-y divide-[var(--color-border)]">
                        {activeBills.map(
                            (bill) => (
                                <button
                                    key={
                                        bill.id
                                    }
                                    type="button"
                                    onClick={() =>
                                        onOpenBill(
                                            bill.id,
                                        )
                                    }
                                    className="grid w-full grid-cols-[1fr_1.2fr_1fr_1fr_auto] items-center gap-4 px-5 py-4 text-left transition hover:bg-[var(--color-surface-muted)]"
                                >
                                    <div className="text-sm font-semibold text-[var(--color-primary)]">
                                        {
                                            bill.billNumber
                                        }
                                    </div>

                                    <div className="text-sm">
                                        {
                                            bill.supplierInvoiceNumber
                                        }
                                    </div>

                                    <div className="text-sm">
                                        Due{" "}
                                        {
                                            bill.dueDate
                                        }
                                    </div>

                                    <div className="money text-right text-sm font-semibold">
                                        {formatMoney(
                                            bill.totals
                                                .amountDue,
                                        )}
                                    </div>

                                    <div className="text-xs font-medium text-[var(--color-primary)]">
                                        View →
                                    </div>
                                </button>
                            ),
                        )}
                    </div>
                )}
            </div>

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <SectionHeader
                    title="Payment Activity"
                    description="Supplier payment audit history."
                />

                {payments.length ===
                    0 ? (
                    <EmptyState>
                        No payment
                        activity.
                    </EmptyState>
                ) : (
                    <div className="divide-y divide-[var(--color-border)]">
                        {payments.map(
                            (payment) => (
                                <button
                                    key={
                                        payment.id
                                    }
                                    type="button"
                                    onClick={() =>
                                        onOpenPayment(
                                            payment.id,
                                        )
                                    }
                                    className="grid w-full grid-cols-[1fr_1fr_1fr_auto] items-center gap-4 px-5 py-4 text-left hover:bg-[var(--color-surface-muted)]"
                                >
                                    <div className="text-sm font-semibold text-[var(--color-primary)]">
                                        {
                                            payment.paymentNumber
                                        }
                                    </div>

                                    <div className="text-sm">
                                        {
                                            payment.paymentDate
                                        }
                                    </div>

                                    <div
                                        className={
                                            payment.status ===
                                                "REVERSED"
                                                ? "text-sm font-semibold text-red-700 line-through"
                                                : "money text-sm font-semibold"
                                        }
                                    >
                                        {formatMoney(
                                            payment.amount,
                                        )}
                                    </div>

                                    <div className="text-xs font-semibold text-[var(--color-primary)]">
                                        View →
                                    </div>
                                </button>
                            ),
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function Tab({
    children,
    active,
    onClick,
}: {
    children:
    React.ReactNode;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={
                onClick
            }
            className={[
                "relative px-4 py-3 text-xs font-medium transition",
                active
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
            ].join(" ")}
        >
            {children}

            {active && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[var(--color-accent)]" />
            )}
        </button>
    );
}

function SectionHeader({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="border-b border-[var(--color-border)] px-5 py-4">
            <h2 className="font-display text-xl">
                {title}
            </h2>

            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                {description}
            </p>
        </div>
    );
}

function SectionTitle({
    children,
}: {
    children:
    React.ReactNode;
}) {
    return (
        <h2 className="mb-5 font-display text-xl">
            {children}
        </h2>
    );
}

function Detail({
    label,
    value,
}: {
    label: string;
    value?:
    | string
    | number;
}) {
    return (
        <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                {label}
            </div>

            <div className="mt-1.5 text-sm">
                {value ??
                    "—"}
            </div>
        </div>
    );
}

function ContactRow({
    icon: Icon,
    value,
}: {
    icon: React.ComponentType<{
        size?: number;
    }>;
    value?: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <Icon
                size={15}
            />

            <div className="text-sm">
                {value ??
                    "—"}
            </div>
        </div>
    );
}

function AccountMetric({
    label,
    value,
    danger = false,
}: {
    label: string;
    value: string;
    danger?: boolean;
}) {
    return (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">
                {label}
            </div>

            <div
                className={[
                    "money mt-2 text-lg font-semibold",
                    danger
                        ? "text-red-700"
                        : "text-[var(--color-primary)]",
                ].join(" ")}
            >
                {value}
            </div>
        </div>
    );
}

function EmptyState({
    children,
}: {
    children:
    React.ReactNode;
}) {
    return (
        <div className="px-5 py-12 text-center text-sm text-[var(--color-text-muted)]">
            {children}
        </div>
    );
}

function formatAddress(
    supplier: {
        addressLine1?: string;
        addressLine2?: string;
        suburb?: string;
        state?: string;
        postcode?: string;
        country: string;
    },
) {
    return [
        supplier.addressLine1,
        supplier.addressLine2,
        supplier.suburb,
        supplier.state,
        supplier.postcode,
        supplier.country,
    ]
        .filter(Boolean)
        .join(", ");
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