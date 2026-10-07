import {
    useState,
} from "react";

import {
    ArrowLeft,
    CalendarDays,
    Check,
    CheckCircle2,
    FileCheck2,
    Pencil,
    ReceiptText,
    Send,
    ShoppingCart,
    X,
} from "lucide-react";

import {
    Navigate,
    useNavigate,
    useParams,
} from "react-router-dom";

import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";

import { customerRepository } from "../../contacts/data/customerRepository";

import { QuoteEditForm } from "../components/QuoteEditForm";

import { salesRepository } from "../data/salesRepository";

import {
    useQuote,
    useSalesDocument,
} from "../data/useSalesDocuments";

import type {
    QuoteStatus,
    SalesPriceSource,
} from "../types/salesDocument";

export function QuoteDetailPage() {
    const {
        quoteId,
    } = useParams<{
        quoteId: string;
    }>();

    const navigate =
        useNavigate();

    const quote =
        useQuote(
            quoteId,
        );

    const [editing, setEditing] =
        useState(false);

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

    const convertedOrder =
        useSalesDocument(
            quote
                ?.convertedSalesOrderId,
        );

    if (!quote) {
        return (
            <Navigate
                to="/sales"
                replace
            />
        );
    }

    const resolvedQuoteId = quote.id;

    const customer =
        customerRepository.getById(
            quote.customerId,
        );

    const customerName =
        customer?.businessName ??
        "Unknown customer";

    function runAction(
        action: () => void,
    ) {
        setActionError(null);
        setActionLoading(true);

        try {
            action();
        } catch (error) {
            setActionError(
                error instanceof
                    Error
                    ? error.message
                    : "Unable to update quote.",
            );
        } finally {
            setActionLoading(
                false,
            );
        }
    }

    function handleSend() {
        runAction(() => {
            salesRepository.sendQuote(
                resolvedQuoteId,
            );
        });
    }

    function handleAccept() {
        runAction(() => {
            salesRepository.acceptQuote(
                resolvedQuoteId,
            );
        });
    }

    function handleDecline() {
        runAction(() => {
            salesRepository.declineQuote(
                resolvedQuoteId,
            );
        });
    }

    function handleConvert() {
        runAction(() => {
            salesRepository.convertQuoteToOrder(
                resolvedQuoteId,
            );
        });
    }

    if (editing) {
        return (
            <QuoteEditForm
                quote={quote}
                customerName={
                    customerName
                }
                onCancel={() =>
                    setEditing(
                        false,
                    )
                }
                onSaved={() =>
                    setEditing(
                        false,
                    )
                }
            />
        );
    }

    return (
        <div className="mx-auto w-full max-w-[1600px]">
            <button
                type="button"
                onClick={() =>
                    navigate(
                        `/contacts/customers/${quote.customerId}/sales`,
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
                                quote.documentNumber
                            }
                        </span>

                        <QuoteStatusBadge
                            status={
                                quote.status
                            }
                        />
                    </div>

                    <h1 className="font-display text-3xl">
                        Quote
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        {customerName}
                    </p>
                </div>

                <QuoteActions
                    status={
                        quote.status
                    }
                    loading={
                        actionLoading
                    }
                    onEdit={() =>
                        setEditing(
                            true,
                        )
                    }
                    onSend={
                        handleSend
                    }
                    onAccept={
                        handleAccept
                    }
                    onDecline={
                        handleDecline
                    }
                    onConvert={
                        handleConvert
                    }
                />
            </div>

            {actionError && (
                <div className="mb-5 flex items-start gap-3 rounded-lg border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 px-4 py-3 text-sm text-[var(--color-danger)]">
                    <X
                        size={16}
                        className="mt-0.5 shrink-0"
                    />

                    {actionError}
                </div>
            )}

            <LifecycleBanner
                status={
                    quote.status
                }
                convertedOrderNumber={
                    convertedOrder?.type ===
                        "SALES_ORDER"
                        ? convertedOrder.documentNumber
                        : undefined
                }
                onBackToSales={() =>
                    navigate(
                        `/contacts/customers/${quote.customerId}/sales`,
                    )
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
                    label="Document Date"
                    value={formatDate(
                        quote.documentDate,
                    )}
                />

                <InfoCard
                    label="Expiry Date"
                    value={
                        quote.expiryDate
                            ? formatDate(
                                quote.expiryDate,
                            )
                            : "No expiry"
                    }
                />

                <InfoCard
                    label="Reference"
                    value={
                        quote.customerReference ??
                        "—"
                    }
                />
            </div>

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
                    <div>
                        <h2 className="text-sm font-semibold">
                            Quote Lines
                        </h2>

                        <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                            Saved pricing
                            snapshot for this
                            quote.
                        </p>
                    </div>

                    <div className="text-xs text-[var(--color-text-muted)]">
                        {
                            quote.lines
                                .length
                        }{" "}
                        {quote.lines
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

                {quote.lines.map(
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
                        {quote.notes ||
                            "No notes for this quote."}
                    </p>
                </div>

                <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-xs)]">
                    <div className="mb-4 flex items-center gap-2">
                        <ReceiptText
                            size={16}
                            className="text-[var(--color-accent)]"
                        />

                        <h2 className="text-sm font-semibold">
                            Quote Total
                        </h2>
                    </div>

                    <div className="space-y-3 text-sm">
                        <TotalRow
                            label="Subtotal"
                            value={formatMoney(
                                quote.totals
                                    .subtotal,
                            )}
                        />

                        <TotalRow
                            label="GST"
                            value={formatMoney(
                                quote.totals
                                    .taxAmount,
                            )}
                        />

                        <div className="border-t border-[var(--color-border)] pt-3">
                            <TotalRow
                                label="Total"
                                value={formatMoney(
                                    quote.totals
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
                    quote.updatedAt,
                )}
            </div>
        </div>
    );
}

function QuoteActions({
    status,
    loading,
    onEdit,
    onSend,
    onAccept,
    onDecline,
    onConvert,
}: {
    status: QuoteStatus;
    loading: boolean;

    onEdit: () => void;
    onSend: () => void;
    onAccept: () => void;
    onDecline: () => void;
    onConvert: () => void;
}) {
    if (
        status === "DRAFT"
    ) {
        return (
            <div className="flex items-center gap-3">
                <Button
                    variant="secondary"
                    onClick={
                        onEdit
                    }
                    disabled={
                        loading
                    }
                >
                    <Pencil
                        size={15}
                    />
                    Edit Quote
                </Button>

                <Button
                    onClick={
                        onSend
                    }
                    disabled={
                        loading
                    }
                >
                    <Send
                        size={15}
                    />
                    Send Quote
                </Button>
            </div>
        );
    }

    if (
        status === "SENT"
    ) {
        return (
            <div className="flex items-center gap-3">
                <Button
                    variant="danger"
                    onClick={
                        onDecline
                    }
                    disabled={
                        loading
                    }
                >
                    <X
                        size={15}
                    />
                    Decline
                </Button>

                <Button
                    onClick={
                        onAccept
                    }
                    disabled={
                        loading
                    }
                >
                    <Check
                        size={15}
                    />
                    Accept
                </Button>
            </div>
        );
    }

    if (
        status === "ACCEPTED"
    ) {
        return (
            <Button
                onClick={
                    onConvert
                }
                disabled={
                    loading
                }
            >
                <ShoppingCart
                    size={15}
                />
                Convert to Sales Order
            </Button>
        );
    }

    return null;
}

function LifecycleBanner({
    status,
    convertedOrderNumber,
    onBackToSales,
}: {
    status: QuoteStatus;

    convertedOrderNumber?:
    string;

    onBackToSales: () => void;
}) {
    if (
        status === "DRAFT"
    ) {
        return (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-white px-4 py-3">
                <FileCheck2
                    size={17}
                    className="mt-0.5 shrink-0 text-[var(--color-text-muted)]"
                />

                <div>
                    <div className="text-sm font-medium">
                        Draft quote
                    </div>

                    <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                        This quote can still
                        be edited. Send it
                        when it is ready for
                        the customer.
                    </div>
                </div>
            </div>
        );
    }

    if (
        status === "SENT"
    ) {
        return (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-white px-4 py-3">
                <Send
                    size={17}
                    className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                />

                <div>
                    <div className="text-sm font-medium">
                        Quote sent
                    </div>

                    <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                        Record the
                        customer's response
                        by accepting or
                        declining this quote.
                    </div>
                </div>
            </div>
        );
    }

    if (
        status === "ACCEPTED"
    ) {
        return (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-[var(--color-success)]/20 bg-[var(--color-success)]/5 px-4 py-3">
                <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-[var(--color-success)]"
                />

                <div>
                    <div className="text-sm font-medium">
                        Quote accepted
                    </div>

                    <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                        The agreed pricing
                        is locked into this
                        quote and can now be
                        converted to a sales
                        order.
                    </div>
                </div>
            </div>
        );
    }

    if (
        status === "DECLINED"
    ) {
        return (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 px-4 py-3">
                <X
                    size={17}
                    className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                />

                <div>
                    <div className="text-sm font-medium">
                        Quote declined
                    </div>

                    <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                        This quote is closed
                        and can no longer be
                        edited or converted.
                    </div>
                </div>
            </div>
        );
    }

    if (
        status === "EXPIRED"
    ) {
        return (
            <div className="mb-5 rounded-lg border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 px-4 py-3">
                <div className="text-sm font-medium">
                    Quote expired
                </div>

                <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                    This quote is closed and
                    cannot be converted.
                </div>
            </div>
        );
    }

    return (
        <div className="mb-5 flex items-center justify-between gap-6 rounded-lg border border-[var(--color-success)]/20 bg-[var(--color-success)]/5 px-4 py-3">
            <div className="flex items-start gap-3">
                <ShoppingCart
                    size={17}
                    className="mt-0.5 shrink-0 text-[var(--color-success)]"
                />

                <div>
                    <div className="text-sm font-medium">
                        Converted to Sales
                        Order
                    </div>

                    <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {convertedOrderNumber
                            ? `Created ${convertedOrderNumber}. The quote pricing snapshot was preserved.`
                            : "The quote has been converted and its pricing snapshot was preserved."}
                    </div>
                </div>
            </div>

            <Button
                variant="secondary"
                size="sm"
                onClick={
                    onBackToSales
                }
            >
                View Sales History
            </Button>
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

function QuoteStatusBadge({
    status,
}: {
    status: QuoteStatus;
}) {
    const variant =
        status === "ACCEPTED" ||
            status === "CONVERTED"
            ? "success"
            : status === "SENT"
                ? "info"
                : status ===
                    "DECLINED" ||
                    status ===
                    "EXPIRED"
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