import {
    useMemo,
    useState,
} from "react";

import {
    ArrowLeft,
    CalendarDays,
    CreditCard,
    FileText,
    ReceiptText,
    RotateCcw,
    Ban,
} from "lucide-react";

import {
    Navigate,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    Badge,
} from "../../../components/ui/Badge";

import {
    Button,
} from "../../../components/ui/Button";

import {
    customerRepository,
} from "../../contacts/data/customerRepository";

import {
    ApplyCreditForm,
    type ApplyCreditValues,
} from "../components/ApplyCreditForm";

import {
    AccountingReasonDialog,
} from "../components/AccountingReasonDialog";

import {
    salesRepository,
} from "../data/salesRepository";

import {
    useCreditAllocations,
    useCreditNotes,
} from "../data/useCreditNotes";

import {
    useSalesDocuments,
} from "../data/useSalesDocuments";

import type {
    Invoice,
} from "../types/salesDocument";

export function CreditNoteDetailPage() {
    const {
        creditNoteId,
    } = useParams<{
        creditNoteId: string;
    }>();

    const navigate =
        useNavigate();

    const creditNotes =
        useCreditNotes();

    const allocations =
        useCreditAllocations();

    const documents =
        useSalesDocuments();

    const [
        applyOpen,
        setApplyOpen,
    ] = useState(false);

    const [
        reverseAllocationId,
        setReverseAllocationId,
    ] = useState<
        string | null
    >(null);

    const [
        voidOpen,
        setVoidOpen,
    ] = useState(false);

    const [
        actionError,
        setActionError,
    ] = useState<
        string | null
    >(null);

    const creditNote =
        useMemo(
            () =>
                creditNotes.find(
                    (item) =>
                        item.id ===
                        creditNoteId,
                ),
            [
                creditNotes,
                creditNoteId,
            ],
        );

    const creditAllocations =
        useMemo(
            () =>
                allocations
                    .filter(
                        (allocation) =>
                            allocation.creditNoteId ===
                            creditNoteId,
                    )
                    .sort(
                        (a, b) =>
                            b.allocationDate.localeCompare(
                                a.allocationDate,
                            ),
                    ),
            [
                allocations,
                creditNoteId,
            ],
        );

    if (!creditNote) {
        return (
            <Navigate
                to="/sales"
                replace
            />
        );
    }

    const resolvedCreditNoteId = creditNote.id;

    const customer =
        customerRepository.getById(
            creditNote.customerId,
        );

    const sourceInvoice =
        documents.find(
            (
                document,
            ): document is Invoice =>
                document.type ===
                "INVOICE" &&
                document.id ===
                creditNote.sourceInvoiceId,
        );

    const customerInvoices =
        documents.filter(
            (
                document,
            ): document is Invoice =>
                document.type ===
                "INVOICE" &&
                document.customerId ===
                creditNote.customerId,
        );

    const activeAllocations =
        creditAllocations.filter(
            (allocation) =>
                allocation.status ===
                "APPLIED",
        );

    const canVoid =
        creditNote.status !==
        "VOID" &&
        creditNote.status !==
        "DRAFT" &&
        activeAllocations.length ===
        0;

    const canApply =
        creditNote.status !==
        "VOID" &&
        creditNote.status !==
        "DRAFT" &&
        creditNote.amountAvailable >
        0;

    function handleApplyCredit(
        values:
            ApplyCreditValues,
    ) {
        setActionError(null);

        try {
            salesRepository.applyCreditToInvoice({
                creditNoteId:
                    resolvedCreditNoteId,

                invoiceId:
                    values.invoiceId,

                allocationDate:
                    values.allocationDate,

                amount:
                    values.amount,
            });

            setApplyOpen(
                false,
            );
        } catch (error) {
            setActionError(
                error instanceof
                    Error
                    ? error.message
                    : "Unable to apply credit.",
            );
        }
    }

    function handleReverseAllocation(
        reason: string,
    ) {
        if (
            !reverseAllocationId
        ) {
            return;
        }

        setActionError(null);

        try {
            salesRepository
                .reverseCreditAllocation({
                    allocationId:
                        reverseAllocationId,

                    reason,
                });

            setReverseAllocationId(
                null,
            );
        } catch (error) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : "Unable to reverse credit allocation.",
            );
        }
    }

    function handleVoidCreditNote(
        reason: string,
    ) {
        setActionError(null);

        try {
            salesRepository
                .voidCreditNote({
                    creditNoteId:
                        resolvedCreditNoteId,

                    reason,
                });

            setVoidOpen(
                false,
            );
        } catch (error) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : "Unable to void credit note.",
            );
        }
    }

    return (
        <div className="mx-auto w-full max-w-[1600px]">
            <button
                type="button"
                onClick={() =>
                    navigate(
                        sourceInvoice
                            ? `/sales/invoices/${sourceInvoice.id}`
                            : `/contacts/customers/${creditNote.customerId}/sales`,
                    )
                }
                className="mb-5 flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-text)]"
            >
                <ArrowLeft
                    size={14}
                />

                {sourceInvoice
                    ? `Back to ${sourceInvoice.documentNumber}`
                    : "Back to Customer Sales"}
            </button>

            <div className="mb-6 flex items-start justify-between gap-6">
                <div>
                    <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent)]/10">
                            <ReceiptText
                                size={18}
                                className="text-[var(--color-accent)]"
                            />
                        </div>

                        <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                                Credit Note
                            </div>

                            <h1 className="font-display text-2xl font-semibold">
                                {
                                    creditNote.creditNoteNumber
                                }
                            </h1>
                        </div>

                        <CreditStatusBadge
                            status={
                                creditNote.status
                            }
                        />
                    </div>

                    <p className="text-sm text-[var(--color-text-secondary)]">
                        {customer?.businessName ??
                            "Unknown customer"}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {creditNote.status !==
                        "VOID" &&
                        creditNote.status !==
                        "DRAFT" && (
                            <Button
                                variant="danger"
                                disabled={
                                    !canVoid
                                }
                                title={
                                    canVoid
                                        ? "Void credit note"
                                        : "Reverse all active allocations before voiding this credit note"
                                }
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

                                Void Credit Note
                            </Button>
                        )}

                    {canApply && (
                        <Button
                            onClick={() => {
                                setActionError(
                                    null,
                                );

                                setApplyOpen(
                                    true,
                                );
                            }}
                        >
                            <CreditCard
                                size={15}
                            />

                            Apply Credit
                        </Button>
                    )}
                </div>
            </div>

            {actionError && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {
                        actionError
                    }
                </div>
            )}

            <div className="mb-5 grid grid-cols-4 gap-4">
                <MetricCard
                    label="Credit Total"
                    value={formatMoney(
                        creditNote.totals.total,
                    )}
                />

                <MetricCard
                    label="Applied"
                    value={formatMoney(
                        creditNote.amountApplied,
                    )}
                />

                <MetricCard
                    label="Available Credit"
                    value={formatMoney(
                        creditNote.amountAvailable,
                    )}
                    emphasis
                />

                <MetricCard
                    label="Credit Date"
                    value={formatDate(
                        creditNote.creditDate,
                    )}
                />
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-5">
                <div className="space-y-5">
                    <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                        <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-5 py-4">
                            <FileText
                                size={15}
                                className="text-[var(--color-accent)]"
                            />

                            <h2 className="text-sm font-semibold">
                                Credit Lines
                            </h2>
                        </div>

                        <div className="grid grid-cols-[120px_minmax(0,1fr)_90px_120px_120px] gap-4 bg-[var(--color-background-subtle)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--color-text-muted)]">
                            <div>
                                SKU
                            </div>

                            <div>
                                Description
                            </div>

                            <div className="text-right">
                                Qty
                            </div>

                            <div className="text-right">
                                Unit Price
                            </div>

                            <div className="text-right">
                                Total
                            </div>
                        </div>

                        {creditNote.lines.map(
                            (line) => (
                                <div
                                    key={
                                        line.id
                                    }
                                    className="grid grid-cols-[120px_minmax(0,1fr)_90px_120px_120px] items-center gap-4 border-t border-[var(--color-border)] px-5 py-4"
                                >
                                    <div className="font-mono text-xs text-[var(--color-text-secondary)]">
                                        {
                                            line.sku
                                        }
                                    </div>

                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-medium">
                                            {
                                                line.description
                                            }
                                        </div>

                                        <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                            {
                                                line.unitSymbol
                                            }
                                        </div>
                                    </div>

                                    <div className="text-right text-sm">
                                        {
                                            line.quantity
                                        }
                                    </div>

                                    <div className="money text-right text-sm">
                                        {formatMoney(
                                            line.unitPrice,
                                        )}
                                    </div>

                                    <div className="money text-right text-sm font-semibold">
                                        {formatMoney(
                                            line.lineTotal,
                                        )}
                                    </div>
                                </div>
                            ),
                        )}

                        <div className="flex justify-end border-t border-[var(--color-border)] bg-[var(--color-background-subtle)] px-5 py-5">
                            <div className="w-[300px] space-y-2">
                                <MoneyRow
                                    label="Subtotal"
                                    value={
                                        creditNote.totals.subtotal
                                    }
                                />

                                <MoneyRow
                                    label="GST"
                                    value={
                                        creditNote.totals.taxAmount
                                    }
                                />

                                <div className="border-t border-[var(--color-border)] pt-3">
                                    <MoneyRow
                                        label="Credit Total"
                                        value={
                                            creditNote.totals.total
                                        }
                                        strong
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Credit Allocations
                                </h2>

                                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                    Applications
                                    of this credit
                                    to outstanding
                                    invoices.
                                </p>
                            </div>

                            <span className="text-xs text-[var(--color-text-muted)]">
                                {
                                    creditAllocations.length
                                }{" "}
                                allocation
                                {creditAllocations.length ===
                                    1
                                    ? ""
                                    : "s"}
                            </span>
                        </div>

                        {creditAllocations.length ===
                            0 ? (
                            <div className="px-5 py-8 text-center text-sm text-[var(--color-text-muted)]">
                                No credit has
                                been applied yet.
                            </div>
                        ) : (
                            <div>
                                {creditAllocations.map(
                                    (
                                        allocation,
                                    ) => {
                                        const invoice =
                                            documents.find(
                                                (
                                                    document,
                                                ) =>
                                                    document.type ===
                                                    "INVOICE" &&
                                                    document.id ===
                                                    allocation.invoiceId,
                                            );

                                        const reversed =
                                            allocation.status ===
                                            "REVERSED";

                                        return (
                                            <div
                                                key={
                                                    allocation.id
                                                }
                                                className="grid grid-cols-[150px_130px_minmax(0,1fr)_140px_110px] items-center gap-4 border-t border-[var(--color-border)] px-5 py-4 first:border-t-0"
                                            >
                                                <div>
                                                    <div
                                                        className={[
                                                            "font-mono text-xs font-semibold",

                                                            reversed
                                                                ? "text-[var(--color-text-muted)] line-through"
                                                                : "",
                                                        ].join(
                                                            " ",
                                                        )}
                                                    >
                                                        {
                                                            allocation.allocationNumber
                                                        }
                                                    </div>

                                                    <div className="mt-1">
                                                        <Badge
                                                            variant={
                                                                reversed
                                                                    ? "danger"
                                                                    : "success"
                                                            }
                                                        >
                                                            {
                                                                allocation.status
                                                            }
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="text-xs text-[var(--color-text-secondary)]">
                                                    {formatDate(
                                                        allocation.allocationDate,
                                                    )}

                                                    {allocation.reversedAt && (
                                                        <div className="mt-1 text-[10px] text-[var(--color-danger)]">
                                                            Reversed{" "}
                                                            {formatDateTime(
                                                                allocation.reversedAt,
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/sales/invoices/${allocation.invoiceId}`,
                                                        )
                                                    }
                                                    className="min-w-0 text-left"
                                                >
                                                    <div className="truncate text-sm font-medium transition hover:text-[var(--color-accent)]">
                                                        {invoice?.documentNumber ??
                                                            allocation.invoiceId}
                                                    </div>

                                                    {allocation.reversalReason && (
                                                        <div className="mt-1 truncate text-[10px] text-[var(--color-text-muted)]">
                                                            {
                                                                allocation.reversalReason
                                                            }
                                                        </div>
                                                    )}
                                                </button>

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

                                                <div className="flex justify-end">
                                                    {!reversed &&
                                                        creditNote.status !==
                                                        "VOID" && (
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setActionError(
                                                                        null,
                                                                    );

                                                                    setReverseAllocationId(
                                                                        allocation.id,
                                                                    );
                                                                }}
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
                    </section>
                </div>

                <div className="space-y-5">
                    <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
                        <h2 className="text-sm font-semibold">
                            Credit Details
                        </h2>

                        <div className="mt-5 space-y-4">
                            <DetailRow
                                label="Customer"
                                value={
                                    customer?.businessName ??
                                    "Unknown customer"
                                }
                            />

                            <DetailRow
                                label="Credit Date"
                                value={formatDate(
                                    creditNote.creditDate,
                                )}
                            />

                            <DetailRow
                                label="Reason"
                                value={
                                    creditNote.reason
                                }
                            />

                            <DetailRow
                                label="Status"
                                value={
                                    creditNote.status
                                }
                            />

                            {creditNote.issuedAt && (
                                <DetailRow
                                    label="Issued"
                                    value={formatDateTime(
                                        creditNote.issuedAt,
                                    )}
                                />
                            )}

                            {creditNote.voidedAt && (
                                <>
                                    <DetailRow
                                        label="Voided"
                                        value={formatDateTime(
                                            creditNote.voidedAt,
                                        )}
                                    />

                                    <DetailRow
                                        label="Void Reason"
                                        value={
                                            creditNote.voidReason ??
                                            "—"
                                        }
                                    />
                                </>
                            )}
                        </div>
                    </section>

                    <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
                        <div className="flex items-center gap-2">
                            <CalendarDays
                                size={15}
                                className="text-[var(--color-accent)]"
                            />

                            <h2 className="text-sm font-semibold">
                                Source Invoice
                            </h2>
                        </div>

                        {sourceInvoice ? (
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/sales/invoices/${sourceInvoice.id}`,
                                    )
                                }
                                className="mt-4 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background-subtle)] p-4 text-left transition hover:border-[var(--color-accent)]"
                            >
                                <div className="font-mono text-sm font-semibold text-[var(--color-accent)]">
                                    {
                                        sourceInvoice.documentNumber
                                    }
                                </div>

                                <div className="mt-2 flex items-center justify-between text-xs">
                                    <span className="text-[var(--color-text-muted)]">
                                        Invoice Total
                                    </span>

                                    <span className="money font-medium">
                                        {formatMoney(
                                            sourceInvoice.totals.total,
                                        )}
                                    </span>
                                </div>

                                <div className="mt-2 flex items-center justify-between text-xs">
                                    <span className="text-[var(--color-text-muted)]">
                                        Amount Due
                                    </span>

                                    <span className="money font-semibold">
                                        {formatMoney(
                                            sourceInvoice.amountDue,
                                        )}
                                    </span>
                                </div>
                            </button>
                        ) : (
                            <p className="mt-4 text-sm text-[var(--color-text-muted)]">
                                Source invoice
                                is unavailable.
                            </p>
                        )}
                    </section>
                </div>
            </div>

            {applyOpen && (
                <ApplyCreditForm
                    creditNote={
                        creditNote
                    }
                    invoices={
                        customerInvoices
                    }
                    onCancel={() =>
                        setApplyOpen(
                            false,
                        )
                    }
                    onSubmit={
                        handleApplyCredit
                    }
                />
            )}

            {reverseAllocationId && (
                <AccountingReasonDialog
                    title="Reverse Credit Allocation"
                    description="The allocated credit will be removed from the invoice and returned to the available balance of this credit note."
                    confirmLabel="Reverse Allocation"
                    onCancel={() =>
                        setReverseAllocationId(
                            null,
                        )
                    }
                    onConfirm={
                        handleReverseAllocation
                    }
                />
            )}

            {voidOpen && (
                <AccountingReasonDialog
                    title="Void Credit Note"
                    description="This will reverse the customer credit. The credit note will remain in the accounting history and cannot be applied again."
                    confirmLabel="Void Credit Note"
                    danger
                    onCancel={() =>
                        setVoidOpen(
                            false,
                        )
                    }
                    onConfirm={
                        handleVoidCreditNote
                    }
                />
            )}
        </div>
    );
}

function MetricCard({
    label,
    value,
    emphasis = false,
}: {
    label: string;
    value: string;
    emphasis?: boolean;
}) {
    return (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-xs)]">
            <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                {label}
            </div>

            <div
                className={`money mt-2 text-xl font-semibold ${emphasis
                    ? "text-[var(--color-accent)]"
                    : ""
                    }`}
            >
                {value}
            </div>
        </div>
    );
}

function MoneyRow({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: number;
    strong?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-5">
            <span
                className={
                    strong
                        ? "text-sm font-semibold"
                        : "text-xs text-[var(--color-text-secondary)]"
                }
            >
                {label}
            </span>

            <span
                className={
                    strong
                        ? "money text-base font-semibold"
                        : "money text-sm"
                }
            >
                {formatMoney(
                    value,
                )}
            </span>
        </div>
    );
}

function DetailRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <div className="text-[10px] uppercase tracking-[0.05em] text-[var(--color-text-muted)]">
                {label}
            </div>

            <div className="mt-1 text-sm font-medium">
                {value}
            </div>
        </div>
    );
}

function CreditStatusBadge({
    status,
}: {
    status:
    | "DRAFT"
    | "ISSUED"
    | "FULLY_APPLIED"
    | "VOID";
}) {
    if (
        status ===
        "FULLY_APPLIED"
    ) {
        return (
            <Badge variant="success">
                Fully Applied
            </Badge>
        );
    }

    if (
        status ===
        "VOID"
    ) {
        return (
            <Badge variant="danger">
                Void
            </Badge>
        );
    }

    if (
        status ===
        "DRAFT"
    ) {
        return (
            <Badge variant="neutral">
                Draft
            </Badge>
        );
    }

    return (
        <Badge variant="warning">
            Issued
        </Badge>
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

function formatDate(
    value: string,
) {
    return new Intl.DateTimeFormat(
        "en-AU",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        },
    ).format(
        new Date(
            `${value}T00:00:00`,
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