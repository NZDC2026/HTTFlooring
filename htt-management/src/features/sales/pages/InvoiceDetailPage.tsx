import {
    useState,
} from "react";

import {
    ArrowLeft,
    Banknote,
    Ban,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileMinus2,
    FileText,
    ReceiptText,
    RotateCcw,
} from "lucide-react";

import {
    Navigate,
    useNavigate,
    useParams,
} from "react-router-dom";

import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";

import { customerRepository } from "../../contacts/data/customerRepository";

import {
    PaymentAllocationForm,
    type PaymentAllocationValues,
} from "../components/PaymentAllocationForm";

import {
    PaymentReversalForm,
} from "../components/PaymentReversalForm";

import {
    InvoiceVoidForm,
} from "../components/InvoiceVoidForm";

import {
    CreateCreditNoteForm,
    type CreateCreditNoteValues,
} from "../components/CreateCreditNoteForm";

import { salesRepository } from "../data/salesRepository";

import {
    useInvoicePayments,
} from "../data/usePayments";

import {
    useInvoice,
    useSalesDocument,
} from "../data/useSalesDocuments";

import {
    useCreditNotes,
    useInvoiceCreditAllocations,
    useInvoiceCreditNotes,
} from "../data/useCreditNotes";

import type {
    Payment,
    PaymentMethod,
} from "../types/payment";

import type {
    InvoiceStatus,
    SalesPriceSource,
} from "../types/salesDocument";

export function InvoiceDetailPage() {
    const {
        invoiceId,
    } = useParams<{
        invoiceId: string;
    }>();

    const navigate =
        useNavigate();

    const invoice =
        useInvoice(
            invoiceId,
        );

    const payments =
        useInvoicePayments(
            invoiceId,
        );

    const creditNotes =
        useInvoiceCreditNotes(
            invoiceId,
        );

    const allCreditNotes =
        useCreditNotes();

    const creditAllocations =
        useInvoiceCreditAllocations(
            invoiceId,
        );

    const [
        paymentOpen,
        setPaymentOpen,
    ] = useState(false);

    const [
        voidOpen,
        setVoidOpen,
    ] = useState(false);

    const [
        creditNoteOpen,
        setCreditNoteOpen,
    ] = useState(false);

    const [
        reversingPayment,
        setReversingPayment,
    ] = useState<
        Payment | null
    >(null);

    const [
        actionError,
        setActionError,
    ] = useState<
        string | null
    >(null);

    const sourceOrder =
        useSalesDocument(
            invoice?.sourceSalesOrderId,
        );

    if (!invoice) {
        return (
            <Navigate
                to="/sales"
                replace
            />
        );
    }

    const resolvedInvoiceId =
        invoice.id;

    const resolvedCustomerId =
        invoice.customerId;

    const customer =
        customerRepository.getById(
            resolvedCustomerId,
        );

    const customerName =
        customer?.businessName ??
        "Unknown customer";

    const canReceivePayment =
        invoice.status ===
        "ISSUED" ||
        invoice.status ===
        "PARTIALLY_PAID" ||
        invoice.status ===
        "OVERDUE";

    const activePayments =
        payments.filter(
            (payment) =>
                payment.status ===
                "RECEIVED",
        );

    function creditNotesById(
        creditNoteId: string,
    ) {
        return allCreditNotes.find(
            (creditNote) =>
                creditNote.id ===
                creditNoteId,
        );
    }

    const activeCreditAllocations =
        creditAllocations.filter(
            (allocation) =>
                allocation.status ===
                "APPLIED",
        );

    const amountCredited =
        roundCurrency(
            activeCreditAllocations.reduce(
                (
                    total,
                    allocation,
                ) =>
                    total +
                    allocation.amount,
                0,
            ),
        );

    const canVoid =
        invoice.status !==
        "VOID" &&
        invoice.status !==
        "DRAFT";

    const canCreateCreditNote =
        invoice.status !==
        "VOID" &&
        invoice.status !==
        "DRAFT";

    function handlePayment(
        values:
            PaymentAllocationValues,
    ) {
        setActionError(null);

        try {
            salesRepository.recordInvoicePayment({
                invoiceId:
                    resolvedInvoiceId,

                paymentDate:
                    values.paymentDate,

                amount:
                    values.amount,

                method:
                    values.method,

                bankAccountId:
                    values.bankAccountId,

                reference:
                    values.reference,

                notes:
                    values.notes,
            });

            setPaymentOpen(
                false,
            );
        } catch (error) {
            setActionError(
                error instanceof
                    Error
                    ? error.message
                    : "Unable to allocate payment.",
            );
        }
    }

    function handleReversePayment(
        reason: string,
    ) {
        if (
            !reversingPayment
        ) {
            return;
        }

        setActionError(null);

        try {
            salesRepository.reverseInvoicePayment(
                reversingPayment.id,
                reason,
            );

            setReversingPayment(
                null,
            );
        } catch (error) {
            setActionError(
                error instanceof
                    Error
                    ? error.message
                    : "Unable to reverse payment.",
            );
        }
    }

    function handleVoidInvoice(
        reason: string,
    ) {
        setActionError(
            null,
        );

        try {
            salesRepository.voidInvoice(
                resolvedInvoiceId,
                reason,
            );

            setVoidOpen(
                false,
            );
        } catch (error) {
            setVoidOpen(
                false,
            );

            setActionError(
                error instanceof
                    Error
                    ? error.message
                    : "Unable to void invoice.",
            );
        }
    }

    function handleCreateCreditNote(
        values:
            CreateCreditNoteValues,
    ) {
        setActionError(
            null,
        );

        try {
            const creditNote =
                salesRepository
                    .createCreditNoteFromInvoice({
                        invoiceId:
                            resolvedInvoiceId,

                        creditDate:
                            values.creditDate,

                        reason:
                            values.reason,

                        lines:
                            values.lines,
                    });

            setCreditNoteOpen(
                false,
            );

            navigate(
                `/sales/credit-notes/${creditNote.id}`,
            );
        } catch (error) {
            setActionError(
                error instanceof
                    Error
                    ? error.message
                    : "Unable to create credit note.",
            );
        }
    }

    return (
        <div className="mx-auto w-full max-w-[1600px]">
            <button
                type="button"
                onClick={() =>
                    navigate(
                        `/contacts/customers/${resolvedCustomerId}/sales`,
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
                                invoice.documentNumber
                            }
                        </span>

                        <InvoiceStatusBadge
                            status={
                                invoice.status
                            }
                        />
                    </div>

                    <h1 className="font-display text-3xl">
                        Invoice
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        {customerName}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {canCreateCreditNote && (
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setActionError(
                                    null,
                                );

                                setCreditNoteOpen(
                                    true,
                                );
                            }}
                        >
                            <FileMinus2
                                size={15}
                            />

                            Create Credit Note
                        </Button>
                    )}

                    {canVoid && (
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setActionError(
                                    null,
                                );

                                setVoidOpen(
                                    true,
                                );
                            }}
                        >
                            <Ban
                                size={15}
                            />

                            Void Invoice
                        </Button>
                    )}

                    {canReceivePayment && (
                        <Button
                            onClick={() => {
                                setActionError(
                                    null,
                                );

                                setPaymentOpen(
                                    true,
                                );
                            }}
                        >
                            <Banknote
                                size={15}
                            />

                            Allocate Payment
                        </Button>
                    )}
                </div>
            </div>

            {actionError && (
                <div className="mb-5 rounded-lg border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 px-4 py-3 text-sm text-[var(--color-danger)]">
                    {actionError}
                </div>
            )}

            {canVoid &&
                (
                    activePayments.length >
                    0 ||
                    activeCreditAllocations.length >
                    0
                ) && (
                    <div className="mb-5 flex items-start gap-3 rounded-lg border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 px-4 py-3">
                        <RotateCcw
                            size={16}
                            className="mt-0.5 shrink-0 text-[var(--color-warning)]"
                        />

                        <div>
                            <div className="text-sm font-medium">
                                Active allocations must be reversed before this invoice can be voided.
                            </div>

                            <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                                {activePayments.length >
                                    0 && (
                                        <span>
                                            {
                                                activePayments.length
                                            }{" "}
                                            active{" "}
                                            {activePayments.length ===
                                                1
                                                ? "payment"
                                                : "payments"}
                                        </span>
                                    )}

                                {activePayments.length >
                                    0 &&
                                    activeCreditAllocations.length >
                                    0 && (
                                        <span>
                                            {" "}
                                            and{" "}
                                        </span>
                                    )}

                                {activeCreditAllocations.length >
                                    0 && (
                                        <span>
                                            {
                                                activeCreditAllocations.length
                                            }{" "}
                                            active credit{" "}
                                            {activeCreditAllocations.length ===
                                                1
                                                ? "allocation"
                                                : "allocations"}
                                        </span>
                                    )}

                                {" "}must be reversed first.
                            </div>
                        </div>
                    </div>
                )}

            <InvoiceLifecycleBanner
                status={
                    invoice.status
                }
                amountDue={
                    invoice.amountDue
                }
            />

            {invoice.status ===
                "VOID" &&
                invoice.voidedAt && (
                    <div className="mb-5 rounded-[var(--radius-card)] border border-[var(--color-danger)]/20 bg-white px-5 py-4 shadow-[var(--shadow-xs)]">
                        <div className="flex items-start gap-3">
                            <Ban
                                size={16}
                                className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                            />

                            <div className="min-w-0">
                                <div className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-danger)]">
                                    Void Audit
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-[10px] text-[var(--color-text-muted)]">
                                            Voided At
                                        </div>

                                        <div className="mt-1 text-sm font-medium">
                                            {formatDateTime(
                                                invoice.voidedAt,
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[10px] text-[var(--color-text-muted)]">
                                            Reason
                                        </div>

                                        <div className="mt-1 text-sm font-medium">
                                            {invoice.voidReason ??
                                                "—"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            <div className="mb-5 grid grid-cols-4 gap-4">
                <InfoCard
                    label="Customer"
                    value={
                        customerName
                    }
                />

                <InfoCard
                    label="Invoice Date"
                    value={formatDate(
                        invoice.documentDate,
                    )}
                />

                <InfoCard
                    label="Due Date"
                    value={formatDate(
                        invoice.dueDate,
                    )}
                />

                <InfoCard
                    label="Reference"
                    value={
                        invoice.customerReference ??
                        "—"
                    }
                />
            </div>

            <div className="mb-5 grid grid-cols-4 gap-4">
                <MoneyCard
                    label="Invoice Total"
                    value={
                        invoice.totals.total
                    }
                    icon={
                        ReceiptText
                    }
                />

                <MoneyCard
                    label="Payments Received"
                    value={
                        invoice.amountPaid
                    }
                    icon={
                        CheckCircle2
                    }
                />

                <MoneyCard
                    label="Applied Credits"
                    value={
                        amountCredited
                    }
                    icon={
                        FileMinus2
                    }
                />

                <MoneyCard
                    label="Amount Due"
                    value={
                        invoice.amountDue
                    }
                    icon={
                        Clock3
                    }
                    strong
                />
            </div>

            {sourceOrder?.type ===
                "SALES_ORDER" && (
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/sales/orders/${sourceOrder.id}`,
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
                                    Source Sales Order
                                </div>

                                <div className="mt-1 font-mono text-sm font-semibold text-[var(--color-primary)]">
                                    {
                                        sourceOrder.documentNumber
                                    }
                                </div>
                            </div>
                        </div>

                        <div className="text-xs text-[var(--color-text-secondary)]">
                            View sales order →
                        </div>
                    </button>
                )}

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
                    <div>
                        <h2 className="text-sm font-semibold">
                            Invoice Lines
                        </h2>

                        <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                            Pricing snapshot
                            carried forward from
                            the sales order.
                        </p>
                    </div>

                    <div className="text-xs text-[var(--color-text-muted)]">
                        {
                            invoice.lines
                                .length
                        }{" "}
                        {invoice.lines
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

                {invoice.lines.map(
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

            {creditNotes.length >
                0 && (
                    <div className="mt-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileMinus2
                                    size={16}
                                    className="text-[var(--color-accent)]"
                                />

                                <h2 className="text-sm font-semibold">
                                    Credit Notes
                                </h2>
                            </div>

                            <div className="text-xs text-[var(--color-text-muted)]">
                                {
                                    creditNotes.length
                                }{" "}
                                {
                                    creditNotes.length ===
                                        1
                                        ? "credit note"
                                        : "credit notes"
                                }
                            </div>
                        </div>

                        <div className="divide-y divide-[var(--color-border)]">
                            {creditNotes.map(
                                (
                                    creditNote,
                                ) => (
                                    <button
                                        key={
                                            creditNote.id
                                        }
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/sales/credit-notes/${creditNote.id}`,
                                            )
                                        }
                                        className="grid w-full grid-cols-[150px_130px_1fr_140px_140px] items-center gap-4 py-3 text-left transition hover:bg-[var(--color-background-subtle)]"
                                    >
                                        <div className="font-mono text-xs font-semibold text-[var(--color-accent)]">
                                            {
                                                creditNote.creditNoteNumber
                                            }
                                        </div>

                                        <div className="text-xs text-[var(--color-text-secondary)]">
                                            {formatDate(
                                                creditNote.creditDate,
                                            )}
                                        </div>

                                        <div className="truncate text-sm">
                                            {
                                                creditNote.reason
                                            }
                                        </div>

                                        <div className="money text-right text-sm">
                                            {formatMoney(
                                                creditNote.totals.total,
                                            )}
                                        </div>

                                        <div className="text-right text-xs font-semibold">
                                            {
                                                creditNote.status
                                            }
                                        </div>
                                    </button>
                                ),
                            )}
                        </div>
                    </div>
                )}

            {creditAllocations.length >
                0 && (
                    <div className="mt-5 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-surface-muted)]">
                                    <FileMinus2
                                        size={16}
                                        className="text-[var(--color-accent)]"
                                    />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Applied Credits
                                    </h2>

                                    <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                                        Credit allocations applied to this invoice.
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="money text-sm font-semibold text-[var(--color-accent)]">
                                    {formatMoney(
                                        amountCredited,
                                    )}
                                </div>

                                <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                    Current applied credit
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-[150px_150px_130px_minmax(0,1fr)_140px_120px] gap-4 bg-[var(--color-background-subtle)] px-5 py-3 text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                            <div>
                                Allocation
                            </div>

                            <div>
                                Credit Note
                            </div>

                            <div>
                                Date
                            </div>

                            <div>
                                Details
                            </div>

                            <div className="text-right">
                                Amount
                            </div>

                            <div className="text-right">
                                Status
                            </div>
                        </div>

                        <div className="divide-y divide-[var(--color-border)]">
                            {creditAllocations.map(
                                (allocation) => {
                                    const allocationCreditNote =
                                        creditNotesById(
                                            allocation.creditNoteId,
                                        );

                                    const reversed =
                                        allocation.status ===
                                        "REVERSED";

                                    return (
                                        <button
                                            key={
                                                allocation.id
                                            }
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/sales/credit-notes/${allocation.creditNoteId}`,
                                                )
                                            }
                                            className="grid w-full grid-cols-[150px_150px_130px_minmax(0,1fr)_140px_120px] items-center gap-4 px-5 py-4 text-left transition hover:bg-[var(--color-background-subtle)]"
                                        >
                                            <div
                                                className={[
                                                    "font-mono text-xs font-semibold",

                                                    reversed
                                                        ? "text-[var(--color-text-muted)]"
                                                        : "text-[var(--color-primary)]",
                                                ].join(
                                                    " ",
                                                )}
                                            >
                                                {
                                                    allocation.allocationNumber
                                                }
                                            </div>

                                            <div className="font-mono text-xs font-semibold text-[var(--color-accent)]">
                                                {allocationCreditNote
                                                    ?.creditNoteNumber ??
                                                    "Credit Note"}
                                            </div>

                                            <div className="text-xs text-[var(--color-text-secondary)]">
                                                {formatDate(
                                                    allocation.allocationDate,
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                {reversed ? (
                                                    <>
                                                        <div className="text-xs font-medium text-[var(--color-danger)]">
                                                            Allocation reversed
                                                        </div>

                                                        {allocation.reversalReason && (
                                                            <div className="mt-1 truncate text-[10px] text-[var(--color-text-muted)]">
                                                                {
                                                                    allocation.reversalReason
                                                                }
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="text-xs text-[var(--color-text-secondary)]">
                                                        Applied to this invoice
                                                    </div>
                                                )}
                                            </div>

                                            <div
                                                className={[
                                                    "money text-right text-sm font-semibold",

                                                    reversed
                                                        ? "text-[var(--color-text-muted)] line-through"
                                                        : "",
                                                ].join(
                                                    " ",
                                                )}
                                            >
                                                {formatMoney(
                                                    allocation.amount,
                                                )}
                                            </div>

                                            <div className="text-right">
                                                <Badge
                                                    variant={
                                                        reversed
                                                            ? "danger"
                                                            : "success"
                                                    }
                                                >
                                                    {reversed
                                                        ? "Reversed"
                                                        : "Applied"}
                                                </Badge>
                                            </div>
                                        </button>
                                    );
                                },
                            )}
                        </div>
                    </div>
                )}

            <div className="mt-5 grid grid-cols-[1fr_380px] gap-5">
                <PaymentHistory
                    payments={
                        payments
                    }
                    allowReverse={
                        invoice.status !==
                        "VOID"
                    }
                    onReverse={
                        setReversingPayment
                    }
                />

                <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-xs)]">
                    <div className="mb-4 flex items-center gap-2">
                        <ReceiptText
                            size={16}
                            className="text-[var(--color-accent)]"
                        />

                        <h2 className="text-sm font-semibold">
                            Financial Summary
                        </h2>
                    </div>

                    <div className="space-y-3 text-sm">
                        <TotalRow
                            label="Subtotal"
                            value={formatMoney(
                                invoice.totals
                                    .subtotal,
                            )}
                        />

                        <TotalRow
                            label="GST"
                            value={formatMoney(
                                invoice.totals
                                    .taxAmount,
                            )}
                        />

                        <div className="border-t border-[var(--color-border)] pt-3">
                            <TotalRow
                                label="Total"
                                value={formatMoney(
                                    invoice.totals
                                        .total,
                                )}
                                strong
                            />
                        </div>

                        <div className="border-t border-[var(--color-border)] pt-3">
                            <TotalRow
                                label="Payments"
                                value={
                                    `-${formatMoney(
                                        invoice.amountPaid,
                                    )}`
                                }
                            />

                            <div className="mt-3">
                                <TotalRow
                                    label="Applied Credits"
                                    value={
                                        `-${formatMoney(
                                            amountCredited,
                                        )}`
                                    }
                                />
                            </div>

                            <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                                <TotalRow
                                    label="Amount Due"
                                    value={formatMoney(
                                        invoice.amountDue,
                                    )}
                                    strong
                                />
                            </div>
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
                    invoice.updatedAt,
                )}
            </div>

            {paymentOpen && (
                <PaymentAllocationForm
                    invoiceNumber={
                        invoice.documentNumber
                    }
                    amountDue={
                        invoice.amountDue
                    }
                    onCancel={() =>
                        setPaymentOpen(
                            false,
                        )
                    }
                    onSubmit={
                        handlePayment
                    }
                />
            )}

            {reversingPayment && (
                <PaymentReversalForm
                    payment={
                        reversingPayment
                    }
                    onCancel={() =>
                        setReversingPayment(
                            null,
                        )
                    }
                    onSubmit={
                        handleReversePayment
                    }
                />
            )}

            {voidOpen && (
                <InvoiceVoidForm
                    invoiceNumber={
                        invoice.documentNumber
                    }
                    onCancel={() =>
                        setVoidOpen(
                            false,
                        )
                    }
                    onSubmit={
                        handleVoidInvoice
                    }
                />
            )}

            {creditNoteOpen && (
                <CreateCreditNoteForm
                    invoice={
                        invoice
                    }
                    onCancel={() =>
                        setCreditNoteOpen(
                            false,
                        )
                    }
                    onSubmit={
                        handleCreateCreditNote
                    }
                />
            )}
        </div>
    );
}

function PaymentHistory({
    payments,
    allowReverse,
    onReverse,
}: {
    payments:
    Payment[];

    allowReverse:
    boolean;

    onReverse:
    (
        payment:
            Payment,
    ) => void;
}) {
    return (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
            <div className="border-b border-[var(--color-border)] px-6 py-4">
                <h2 className="text-sm font-semibold">
                    Payment History
                </h2>

                <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                    Complete payment and
                    reversal audit history
                    for this invoice.
                </p>
            </div>

            {payments.length ===
                0 ? (
                <div className="px-6 py-10 text-center text-sm text-[var(--color-text-muted)]">
                    No payments have been
                    received yet.
                </div>
            ) : (
                <div>
                    {payments.map(
                        (
                            payment,
                        ) => {
                            const reversed =
                                payment.status ===
                                "REVERSED";

                            return (
                                <div
                                    key={
                                        payment.id
                                    }
                                    className={[
                                        "grid grid-cols-[150px_1fr_150px_110px] items-center gap-4",
                                        "border-b border-[var(--color-border)] px-6 py-4 last:border-b-0",
                                        reversed
                                            ? "bg-[var(--color-background-subtle)] opacity-70"
                                            : "",
                                    ].join(
                                        " ",
                                    )}
                                >
                                    <div>
                                        <div
                                            className={[
                                                "font-mono text-xs font-semibold",
                                                reversed
                                                    ? "text-[var(--color-text-muted)] line-through"
                                                    : "text-[var(--color-primary)]",
                                            ].join(
                                                " ",
                                            )}
                                        >
                                            {
                                                payment.paymentNumber
                                            }
                                        </div>

                                        <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                            {formatDate(
                                                payment.paymentDate,
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-xs font-medium">
                                                {formatPaymentMethod(
                                                    payment.method,
                                                )}
                                            </div>

                                            <PaymentStatusBadge
                                                payment={
                                                    payment
                                                }
                                            />
                                        </div>

                                        <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                            {payment.reference ||
                                                "No reference"}
                                        </div>

                                        {reversed &&
                                            payment.reversalReason && (
                                                <div className="mt-2 text-[10px] text-[var(--color-danger)]">
                                                    Reversal:{" "}
                                                    {
                                                        payment.reversalReason
                                                    }
                                                </div>
                                            )}
                                    </div>

                                    <div
                                        className={[
                                            "money text-right text-sm font-semibold",
                                            reversed
                                                ? "text-[var(--color-text-muted)] line-through"
                                                : "text-[var(--color-success)]",
                                        ].join(
                                            " ",
                                        )}
                                    >
                                        {formatMoney(
                                            payment.amount,
                                        )}
                                    </div>

                                    <div className="flex justify-end">
                                        {!reversed &&
                                            allowReverse && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        onReverse(
                                                            payment,
                                                        )
                                                    }
                                                >
                                                    <RotateCcw
                                                        size={13}
                                                    />

                                                    Reverse
                                                </Button>
                                            )}
                                    </div>
                                </div>
                            );
                        },
                    )}
                </div>
            )}
        </div>
    );
}

function InvoiceLifecycleBanner({
    status,
    amountDue,
}: {
    status: InvoiceStatus;
    amountDue: number;
}) {
    if (
        status === "PAID"
    ) {
        return (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-[var(--color-success)]/20 bg-[var(--color-success)]/5 px-4 py-3">
                <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-[var(--color-success)]"
                />

                <div>
                    <div className="text-sm font-medium">
                        Invoice paid
                    </div>

                    <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                        This invoice has
                        been paid in full.
                    </div>
                </div>
            </div>
        );
    }

    if (
        status ===
        "PARTIALLY_PAID"
    ) {
        return (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 px-4 py-3">
                <Banknote
                    size={17}
                    className="mt-0.5 shrink-0 text-[var(--color-warning)]"
                />

                <div>
                    <div className="text-sm font-medium">
                        Partially paid
                    </div>

                    <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                        Remaining balance{" "}
                        {formatMoney(
                            amountDue,
                        )}
                        .
                    </div>
                </div>
            </div>
        );
    }

    if (
        status === "VOID"
    ) {
        return (
            <div className="mb-5 rounded-lg border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 px-4 py-3">
                <div className="text-sm font-medium">
                    Invoice void
                </div>

                <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Payments cannot be
                    allocated to this
                    invoice.
                </div>
            </div>
        );
    }

    if (
        status === "OVERDUE"
    ) {
        return (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 px-4 py-3">
                <Clock3
                    size={17}
                    className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                />

                <div>
                    <div className="text-sm font-medium">
                        Invoice overdue
                    </div>

                    <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                        Outstanding balance{" "}
                        {formatMoney(
                            amountDue,
                        )}
                        .
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-white px-4 py-3">
            <ReceiptText
                size={17}
                className="mt-0.5 shrink-0 text-[var(--color-primary)]"
            />

            <div>
                <div className="text-sm font-medium">
                    Invoice issued
                </div>

                <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Outstanding balance{" "}
                    {formatMoney(
                        amountDue,
                    )}
                    .
                </div>
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

function MoneyCard({
    label,
    value,
    icon: Icon,
    strong = false,
}: {
    label: string;
    value: number;
    icon:
    typeof ReceiptText;
    strong?: boolean;
}) {
    return (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white px-5 py-4 shadow-[var(--shadow-xs)]">
            <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-secondary)]">
                    {label}
                </span>

                <Icon
                    size={15}
                    className="text-[var(--color-text-muted)]"
                />
            </div>

            <div
                className={[
                    "money mt-3 text-xl font-semibold",
                    strong
                        ? "text-[var(--color-primary)]"
                        : "",
                ].join(" ")}
            >
                {formatMoney(
                    value,
                )}
            </div>
        </div>
    );
}

function InvoiceStatusBadge({
    status,
}: {
    status: InvoiceStatus;
}) {
    const variant =
        status === "PAID"
            ? "success"
            : status ===
                "PARTIALLY_PAID"
                ? "warning"
                : status ===
                    "OVERDUE" ||
                    status ===
                    "VOID"
                    ? "danger"
                    : status ===
                        "ISSUED"
                        ? "info"
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

function formatPaymentMethod(
    method:
        PaymentMethod,
) {
    switch (method) {
        case "BANK_TRANSFER":
            return "Bank Transfer";

        case "CASH":
            return "Cash";

        case "CARD":
            return "Card";

        case "CHEQUE":
            return "Cheque";

        case "OTHER":
            return "Other";
    }
}

function roundCurrency(
    value: number,
) {
    return (
        Math.round(
            (value +
                Number.EPSILON) *
            100,
        ) / 100
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

function PaymentStatusBadge({
    payment,
}: {
    payment: Payment;
}) {
    if (
        payment.status ===
        "REVERSED"
    ) {
        return (
            <Badge variant="danger">
                Reversed
            </Badge>
        );
    }

    return (
        <Badge variant="success">
            Received
        </Badge>
    );
}