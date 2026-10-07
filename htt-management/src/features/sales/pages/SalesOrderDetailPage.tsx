import {
    useState,
} from "react";

import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    FileText,
    ReceiptText,
    ShoppingCart,
} from "lucide-react";

import {
    Navigate,
    useNavigate,
    useParams,
} from "react-router-dom";

import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";

import { customerRepository } from "../../contacts/data/customerRepository";

import { salesRepository } from "../data/salesRepository";

import {
    useSalesDocument,
    useSalesOrder,
} from "../data/useSalesDocuments";

import type {
    SalesOrderStatus,
    SalesPriceSource,
} from "../types/salesDocument";

export function SalesOrderDetailPage() {
    const {
        orderId,
    } = useParams<{
        orderId: string;
    }>();

    const navigate =
        useNavigate();

    const order =
        useSalesOrder(
            orderId,
        );

    const [
        actionError,
        setActionError,
    ] = useState<
        string | null
    >(null);

    const [
        actionLoading,
        setActionLoading,
    ] = useState(false);

    const sourceQuote =
        useSalesDocument(
            order?.sourceQuoteId,
        );

    const invoiceId =
        order?.invoiceIds[0];

    const invoice =
        useSalesDocument(
            invoiceId,
        );

    if (!order) {
        return (
            <Navigate
                to="/sales"
                replace
            />
        );
    }

    const resolvedOrderId =
        order.id;

    const customer =
        customerRepository.getById(
            order.customerId,
        );

    const customerName =
        customer?.businessName ??
        "Unknown customer";

    function handleCreateInvoice() {
        setActionError(null);
        setActionLoading(true);

        try {
            salesRepository.createInvoiceFromOrder(
                resolvedOrderId,
            );
        } catch (error) {
            setActionError(
                error instanceof
                    Error
                    ? error.message
                    : "Unable to create invoice.",
            );
        } finally {
            setActionLoading(
                false,
            );
        }
    }

    return (
        <div className="mx-auto w-full max-w-[1600px]">
            <button
                type="button"
                onClick={() =>
                    navigate(
                        `/contacts/customers/${order.customerId}/sales`,
                    )
                }
                className="mb-6 flex items-center gap-2 text-sm text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
            >
                <ArrowLeft
                    size={15}
                />

                Back to customer sales
            </button>

            <div className="mb-6 flex items-start justify-between gap-6">
                <div>
                    <div className="mb-2 flex items-center gap-3">
                        <span className="font-mono text-xs font-semibold tracking-[0.08em] text-[var(--color-accent)]">
                            {
                                order.documentNumber
                            }
                        </span>

                        <OrderStatusBadge
                            status={
                                order.status
                            }
                        />
                    </div>

                    <h1 className="font-display text-3xl">
                        Sales Order
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        {customerName}
                    </p>
                </div>

                {order.status ===
                    "CONFIRMED" &&
                    order.invoiceIds
                        .length ===
                    0 && (
                        <Button
                            onClick={
                                handleCreateInvoice
                            }
                            disabled={
                                actionLoading
                            }
                        >
                            <ReceiptText
                                size={15}
                            />

                            {actionLoading
                                ? "Creating..."
                                : "Create Invoice"}
                        </Button>
                    )}
            </div>

            {actionError && (
                <div className="mb-5 rounded-lg border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 px-4 py-3 text-sm text-[var(--color-danger)]">
                    {actionError}
                </div>
            )}

            <OrderLifecycleBanner
                status={
                    order.status
                }
                invoiceNumber={
                    invoice?.type ===
                        "INVOICE"
                        ? invoice.documentNumber
                        : undefined
                }
            />

            <div className="mb-5 grid grid-cols-4 gap-4">
                <InfoCard
                    label="Customer"
                    value={
                        customerName
                    }
                />

                <InfoCard
                    label="Order Date"
                    value={formatDate(
                        order.documentDate,
                    )}
                />

                <InfoCard
                    label="Requested Delivery"
                    value={
                        order.requestedDeliveryDate
                            ? formatDate(
                                order.requestedDeliveryDate,
                            )
                            : "Not specified"
                    }
                />

                <InfoCard
                    label="Reference"
                    value={
                        order.customerReference ??
                        "—"
                    }
                />
            </div>

            {sourceQuote?.type ===
                "QUOTE" && (
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/sales/quotes/${sourceQuote.id}`,
                            )
                        }
                        className="mb-5 flex w-full items-center justify-between rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white px-5 py-4 text-left shadow-[var(--shadow-xs)] transition hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-background-subtle)]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-surface-muted)]">
                                <FileText
                                    size={16}
                                    className="text-[var(--color-primary)]"
                                />
                            </div>

                            <div>
                                <div className="text-xs text-[var(--color-text-muted)]">
                                    Source Quote
                                </div>

                                <div className="mt-1 font-mono text-sm font-semibold text-[var(--color-primary)]">
                                    {
                                        sourceQuote.documentNumber
                                    }
                                </div>
                            </div>
                        </div>

                        <div className="text-xs text-[var(--color-text-secondary)]">
                            View quote →
                        </div>
                    </button>
                )}

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
                    <div>
                        <h2 className="text-sm font-semibold">
                            Order Lines
                        </h2>

                        <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                            Agreed pricing
                            snapshot carried
                            forward from the
                            sales document.
                        </p>
                    </div>

                    <div className="text-xs text-[var(--color-text-muted)]">
                        {
                            order.lines
                                .length
                        }{" "}
                        {order.lines
                            .length ===
                            1
                            ? "line"
                            : "lines"}
                    </div>
                </div>

                <div className="grid grid-cols-[minmax(260px,1.5fr)_100px_100px_130px_130px_120px_140px] gap-4 border-b border-[var(--color-border)] bg-[var(--color-background-subtle)] px-6 py-3 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                    <div>
                        Product
                    </div>

                    <div>
                        Unit
                    </div>

                    <div className="text-right">
                        Qty
                    </div>

                    <div className="text-right">
                        Standard
                    </div>

                    <div className="text-right">
                        Unit Price
                    </div>

                    <div>
                        Source
                    </div>

                    <div className="text-right">
                        Total
                    </div>
                </div>

                {order.lines.map(
                    (line) => (
                        <div
                            key={
                                line.id
                            }
                            className="grid grid-cols-[minmax(260px,1.5fr)_100px_100px_130px_130px_120px_140px] items-center gap-4 border-b border-[var(--color-border)] px-6 py-4 last:border-b-0"
                        >
                            <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-[var(--color-primary)]">
                                    {
                                        line.description
                                    }
                                </div>

                                <div className="mt-1 font-mono text-[10px] text-[var(--color-text-muted)]">
                                    {
                                        line.sku
                                    }
                                </div>
                            </div>

                            <div className="text-xs">
                                {
                                    line.unitSymbol
                                }
                            </div>

                            <div className="text-right text-sm">
                                {
                                    line.quantity
                                }
                            </div>

                            <div className="money text-right text-sm text-[var(--color-text-secondary)]">
                                {formatMoney(
                                    line.standardUnitPrice,
                                )}
                            </div>

                            <div className="money text-right text-sm font-semibold">
                                {formatMoney(
                                    line.unitPrice,
                                )}
                            </div>

                            <PriceSourceBadge
                                source={
                                    line.priceSource
                                }
                            />

                            <div className="money text-right text-sm font-semibold">
                                {formatMoney(
                                    line.lineTotal,
                                )}

                                <div className="mt-1 text-[10px] font-normal text-[var(--color-text-muted)]">
                                    inc GST
                                </div>
                            </div>
                        </div>
                    ),
                )}
            </div>

            <div className="mt-5 grid grid-cols-[1fr_380px] gap-5">
                <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-xs)]">
                    <h2 className="text-sm font-semibold">
                        Notes
                    </h2>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--color-text-secondary)]">
                        {order.notes ||
                            "No notes for this sales order."}
                    </p>
                </div>

                <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-xs)]">
                    <div className="mb-4 flex items-center gap-2">
                        <ShoppingCart
                            size={16}
                            className="text-[var(--color-accent)]"
                        />

                        <h2 className="text-sm font-semibold">
                            Order Total
                        </h2>
                    </div>

                    <div className="space-y-3 text-sm">
                        <TotalRow
                            label="Subtotal"
                            value={formatMoney(
                                order.totals
                                    .subtotal,
                            )}
                        />

                        <TotalRow
                            label="GST"
                            value={formatMoney(
                                order.totals
                                    .taxAmount,
                            )}
                        />

                        <div className="border-t border-[var(--color-border)] pt-3">
                            <TotalRow
                                label="Total"
                                value={formatMoney(
                                    order.totals
                                        .total,
                                )}
                                strong
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
                <CalendarDays
                    size={13}
                />

                Last updated{" "}
                {formatDateTime(
                    order.updatedAt,
                )}
            </div>
        </div>
    );
}

function OrderLifecycleBanner({
    status,
    invoiceNumber,
}: {
    status: SalesOrderStatus;
    invoiceNumber?: string;
}) {
    if (
        status ===
        "CONFIRMED"
    ) {
        return (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-white px-4 py-3">
                <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-[var(--color-success)]"
                />

                <div>
                    <div className="text-sm font-medium">
                        Confirmed sales order
                    </div>

                    <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                        This order is ready
                        to be invoiced.
                    </div>
                </div>
            </div>
        );
    }

    if (
        status === "INVOICED"
    ) {
        return (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-[var(--color-success)]/20 bg-[var(--color-success)]/5 px-4 py-3">
                <ReceiptText
                    size={17}
                    className="mt-0.5 shrink-0 text-[var(--color-success)]"
                />

                <div>
                    <div className="text-sm font-medium">
                        Sales order invoiced
                    </div>

                    <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {invoiceNumber
                            ? `Created ${invoiceNumber}.`
                            : "An invoice has been created from this order."}
                    </div>
                </div>
            </div>
        );
    }

    if (
        status === "CANCELLED"
    ) {
        return (
            <div className="mb-5 rounded-lg border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 px-4 py-3">
                <div className="text-sm font-medium">
                    Sales order cancelled
                </div>

                <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                    This order cannot be
                    invoiced.
                </div>
            </div>
        );
    }

    return (
        <div className="mb-5 rounded-lg border border-[var(--color-border)] bg-white px-4 py-3">
            <div className="text-sm font-medium">
                {formatStatus(
                    status,
                )}
            </div>

            <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                No invoice action is
                available for this order
                status yet.
            </div>
        </div>
    );
}

function InfoCard({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white px-5 py-4 shadow-[var(--shadow-xs)]">
            <div className="text-xs text-[var(--color-text-secondary)]">
                {label}
            </div>

            <div className="mt-2 truncate text-sm font-semibold">
                {value}
            </div>
        </div>
    );
}

function OrderStatusBadge({
    status,
}: {
    status: SalesOrderStatus;
}) {
    const variant =
        status ===
            "CONFIRMED" ||
            status ===
            "FULFILLED" ||
            status ===
            "INVOICED"
            ? "success"
            : status ===
                "PARTIALLY_FULFILLED"
                ? "warning"
                : status ===
                    "CANCELLED"
                    ? "danger"
                    : "neutral";

    return (
        <Badge variant={variant}>
            {formatStatus(
                status,
            )}
        </Badge>
    );
}

function PriceSourceBadge({
    source,
}: {
    source: SalesPriceSource;
}) {
    const label =
        source ===
            "CUSTOMER_PRICE"
            ? "Customer"
            : source ===
                "STANDARD_PRICE"
                ? "Standard"
                : "Manual";

    return (
        <span
            className={[
                "inline-flex w-fit rounded-full px-2.5 py-1",
                "text-[10px] font-medium",
                source ===
                    "CUSTOMER_PRICE"
                    ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                    : source ===
                        "MANUAL"
                        ? "bg-[var(--color-warning)]/15 text-[var(--color-warning)]"
                        : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]",
            ].join(" ")}
        >
            {label}
        </span>
    );
}

function TotalRow({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div className="flex items-center justify-between">
            <span
                className={
                    strong
                        ? "font-semibold"
                        : "text-[var(--color-text-secondary)]"
                }
            >
                {label}
            </span>

            <span
                className={
                    strong
                        ? "money text-lg font-semibold"
                        : "money font-medium"
                }
            >
                {value}
            </span>
        </div>
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

function formatDate(
    value: string,
) {
    const [
        year,
        month,
        day,
    ] = value
        .split("-")
        .map(Number);

    return new Intl.DateTimeFormat(
        "en-AU",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        },
    ).format(
        new Date(
            year,
            month - 1,
            day,
        ),
    );
}

function formatDateTime(
    value: string,
) {
    return new Intl.DateTimeFormat(
        "en-AU",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
    ).format(
        new Date(value),
    );
}

function formatStatus(
    value: string,
) {
    return value
        .toLowerCase()
        .split("_")
        .map(
            (word) =>
                word
                    .charAt(0)
                    .toUpperCase() +
                word.slice(1),
        )
        .join(" ");
}