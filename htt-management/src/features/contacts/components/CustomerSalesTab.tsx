import {
    useMemo,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
    Banknote,
    ClipboardList,
    FileCheck2,
    FileText,
    Plus,
    ReceiptText,
    Search,
    ShoppingCart,
} from "lucide-react";

import type { Customer } from "../types/customer";

import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

import { QuoteForm } from "../../sales/components/QuoteForm";
import {
    CustomerAgingSummary,
} from "../../sales/components/CustomerAgingSummary";
import {
    OutstandingInvoiceList,
} from "../../sales/components/OutstandingInvoiceList";
import {
    AccountsReceivableReconciliation,
} from "../../sales/components/AccountsReceivableReconciliation";

import {
    useCustomerAccountsReceivable,
} from "../../sales/data/useAccountsReceivable";
import { useCustomerSalesDocuments } from "../../sales/data/useSalesDocuments";
import { useCustomerPayments } from "../../sales/data/usePayments";
import {
    useCreditNotes,
} from "../../sales/data/useCreditNotes";
import {
    useAccountsReceivableReconciliation,
} from "../../sales/data/useAccountsReceivableReconciliation";

import type {
    Invoice,
    SalesDocument,
    SalesDocumentStatus,
} from "../../sales/types/salesDocument";
import type { Payment } from "../../sales/types/payment";

type SalesFilter =
    | "ALL"
    | "QUOTE"
    | "SALES_ORDER"
    | "INVOICE"
    | "PAYMENT";

type SalesHistoryItem =
    | {
        kind: "DOCUMENT";
        date: string;
        sortDate: string;
        document: SalesDocument;
    }
    | {
        kind: "PAYMENT";
        date: string;
        sortDate: string;
        payment: Payment;
    };

interface CustomerSalesTabProps {
    customer: Customer;
}

export function CustomerSalesTab({
    customer,
}: CustomerSalesTabProps) {
    const navigate = useNavigate();

    const documents =
        useCustomerSalesDocuments(
            customer.id,
        );

    const payments =
        useCustomerPayments(
            customer.id,
        );

    const accountsReceivable =
        useCustomerAccountsReceivable(
            customer,
        );

    const reconciliation =
        useAccountsReceivableReconciliation(
            customer,
        );

    const allCreditNotes =
        useCreditNotes();

    const unallocatedCreditNotes =
        useMemo(
            () =>
                allCreditNotes
                    .filter(
                        (creditNote) =>
                            creditNote.customerId ===
                            customer.id &&
                            creditNote.status !==
                            "DRAFT" &&
                            creditNote.status !==
                            "VOID" &&
                            creditNote.amountAvailable >
                            0,
                    )
                    .sort(
                        (a, b) =>
                            b.creditDate.localeCompare(
                                a.creditDate,
                            ),
                    ),
            [
                allCreditNotes,
                customer.id,
            ],
        );

    const outstandingInvoices =
        useMemo(
            () =>
                documents.filter(
                    (
                        document,
                    ): document is Invoice =>
                        document.type ===
                        "INVOICE" &&
                        document.status !==
                        "VOID" &&
                        document.amountDue >
                        0,
                ),
            [
                documents,
            ],
        );

    const [filter, setFilter] =
        useState<SalesFilter>("ALL");

    const [search, setSearch] =
        useState("");

    const [
        creatingQuote,
        setCreatingQuote,
    ] = useState(false);

    const summary =
        useMemo(() => {
            const invoices =
                documents.filter(
                    (document) =>
                        document.type ===
                        "INVOICE",
                );

            const totalInvoiced =
                invoices.reduce(
                    (total, invoice) => {
                        if (
                            invoice.type ===
                            "INVOICE" &&
                            invoice.status ===
                            "VOID"
                        ) {
                            return total;
                        }

                        return (
                            total +
                            invoice.totals.total
                        );
                    },
                    0,
                );

            const paymentsReceived =
                payments.reduce(
                    (total, payment) =>
                        payment.status ===
                            "RECEIVED"
                            ? total +
                            payment.amount
                            : total,
                    0,
                );

            const openQuotes =
                documents.filter(
                    (document) =>
                        document.type ===
                        "QUOTE" &&
                        (
                            [
                                "DRAFT",
                                "SENT",
                                "ACCEPTED",
                            ] as const
                        ).includes(
                            document.status as
                            | "DRAFT"
                            | "SENT"
                            | "ACCEPTED",
                        ),
                ).length;

            return {
                totalInvoiced,

                accountBalance:
                    accountsReceivable.netAccountBalance,

                paymentsReceived,

                openQuotes,
            };
        }, [
            documents,
            payments,
            accountsReceivable.netAccountBalance,
        ]);

    const history =
        useMemo(() => {
            const documentItems:
                SalesHistoryItem[] =
                documents.map(
                    (document) => ({
                        kind: "DOCUMENT",
                        date:
                            document.documentDate,
                        sortDate:
                            document.documentDate,
                        document,
                    }),
                );

            const paymentItems:
                SalesHistoryItem[] =
                payments.map(
                    (payment) => ({
                        kind: "PAYMENT",
                        date:
                            payment.paymentDate,
                        sortDate:
                            payment.paymentDate,
                        payment,
                    }),
                );

            return [
                ...documentItems,
                ...paymentItems,
            ].sort(
                (a, b) =>
                    b.sortDate.localeCompare(
                        a.sortDate,
                    ),
            );
        }, [
            documents,
            payments,
        ]);

    const filteredHistory =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            return history.filter(
                (item) => {
                    if (
                        filter !== "ALL" &&
                        getHistoryType(
                            item,
                        ) !== filter
                    ) {
                        return false;
                    }

                    if (!query) {
                        return true;
                    }

                    const searchable =
                        item.kind ===
                            "DOCUMENT"
                            ? [
                                item.document
                                    .documentNumber,

                                item.document
                                    .customerReference ??
                                "",

                                item.document
                                    .notes ?? "",
                            ]
                            : [
                                item.payment
                                    .paymentNumber,

                                item.payment
                                    .reference ?? "",

                                item.payment
                                    .notes ?? "",
                            ];

                    return searchable
                        .join(" ")
                        .toLowerCase()
                        .includes(query);
                },
            );
        }, [
            history,
            filter,
            search,
        ]);

    return (
        <div>
            <div className="mb-5 flex items-start justify-between gap-5">
                <div>
                    <h2 className="font-display text-xl">
                        Sales History
                    </h2>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        Quotes, orders, invoices and
                        payments for{" "}
                        {customer.businessName}.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        onClick={() =>
                            navigate(
                                `/sales/statements/${customer.id}`,
                            )
                        }
                    >
                        <ClipboardList
                            size={15}
                        />

                        Customer Statement
                    </Button>

                    {!creatingQuote && (
                        <Button
                            onClick={() =>
                                setCreatingQuote(
                                    true,
                                )
                            }
                        >
                            <Plus
                                size={15}
                            />

                            New Quote
                        </Button>
                    )}
                </div>
            </div>

            <div className="mb-5 grid grid-cols-4 gap-4">
                <SummaryCard
                    icon={ReceiptText}
                    label="Total Invoiced"
                    value={formatMoney(
                        summary.totalInvoiced,
                    )}
                />

                <SummaryCard
                    icon={FileCheck2}
                    label="Outstanding"
                    value={formatMoney(
                        summary.accountBalance,
                    )}
                />

                <SummaryCard
                    icon={Banknote}
                    label="Payments Received"
                    value={formatMoney(
                        summary.paymentsReceived,
                    )}
                />

                <SummaryCard
                    icon={FileText}
                    label="Open Quotes"
                    value={summary.openQuotes.toString()}
                />
            </div>

            <CustomerAgingSummary
                accountsReceivable={
                    accountsReceivable
                }
            />

            <AccountsReceivableReconciliation
                reconciliation={
                    reconciliation
                }
            />

            {unallocatedCreditNotes.length >
                0 && (
                    <div className="mb-5 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                            <div>
                                <h3 className="text-sm font-semibold">
                                    Unallocated Credits
                                </h3>

                                <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                    Issued customer
                                    credits not yet fully
                                    applied to invoices.
                                </p>
                            </div>

                            <div className="money text-sm font-semibold text-[var(--color-accent)]">
                                -
                                {formatMoney(
                                    accountsReceivable.unallocatedCredit,
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-[150px_130px_minmax(0,1fr)_130px_130px_130px] gap-4 bg-[var(--color-background-subtle)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--color-text-muted)]">
                            <div>
                                Credit Note
                            </div>

                            <div>
                                Date
                            </div>

                            <div>
                                Reason
                            </div>

                            <div className="text-right">
                                Total
                            </div>

                            <div className="text-right">
                                Applied
                            </div>

                            <div className="text-right">
                                Available
                            </div>
                        </div>

                        {unallocatedCreditNotes.map(
                            (creditNote) => (
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
                                    className="grid w-full grid-cols-[150px_130px_minmax(0,1fr)_130px_130px_130px] items-center gap-4 border-t border-[var(--color-border)] px-5 py-4 text-left transition hover:bg-[var(--color-background-subtle)]"
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

                                    <div className="money text-right text-sm">
                                        {formatMoney(
                                            creditNote.amountApplied,
                                        )}
                                    </div>

                                    <div className="money text-right text-sm font-semibold text-[var(--color-accent)]">
                                        {formatMoney(
                                            creditNote.amountAvailable,
                                        )}
                                    </div>
                                </button>
                            ),
                        )}
                    </div>
                )}

            <OutstandingInvoiceList
                invoices={
                    outstandingInvoices
                }
                onOpenInvoice={(
                    invoiceId,
                ) =>
                    navigate(
                        `/sales/invoices/${invoiceId}`,
                    )
                }
            />

            {creatingQuote && (
                <div className="mb-5">
                    <QuoteForm
                        customerId={
                            customer.id
                        }
                        customerName={
                            customer.businessName
                        }
                        onCancel={() =>
                            setCreatingQuote(
                                false,
                            )
                        }
                        onSaved={() => {
                            setCreatingQuote(
                                false,
                            );

                            setFilter(
                                "QUOTE",
                            );

                            setSearch("");
                        }}
                    />
                </div>
            )}

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="flex items-center justify-between gap-5 border-b border-[var(--color-border)] px-5 py-4">
                    <div className="flex items-center gap-1 rounded-lg bg-[var(--color-background-subtle)] p-1">
                        <FilterButton
                            active={
                                filter === "ALL"
                            }
                            onClick={() =>
                                setFilter("ALL")
                            }
                        >
                            All
                        </FilterButton>

                        <FilterButton
                            active={
                                filter === "QUOTE"
                            }
                            onClick={() =>
                                setFilter(
                                    "QUOTE",
                                )
                            }
                        >
                            Quotes
                        </FilterButton>

                        <FilterButton
                            active={
                                filter ===
                                "SALES_ORDER"
                            }
                            onClick={() =>
                                setFilter(
                                    "SALES_ORDER",
                                )
                            }
                        >
                            Orders
                        </FilterButton>

                        <FilterButton
                            active={
                                filter ===
                                "INVOICE"
                            }
                            onClick={() =>
                                setFilter(
                                    "INVOICE",
                                )
                            }
                        >
                            Invoices
                        </FilterButton>

                        <FilterButton
                            active={
                                filter ===
                                "PAYMENT"
                            }
                            onClick={() =>
                                setFilter(
                                    "PAYMENT",
                                )
                            }
                        >
                            Payments
                        </FilterButton>
                    </div>

                    <div className="relative w-[320px]">
                        <Search
                            size={15}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                        />

                        <Input
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value,
                                )
                            }
                            placeholder="Search document or reference..."
                            className="pl-9"
                        />
                    </div>
                </div>

                {filteredHistory.length ===
                    0 ? (
                    <EmptyHistory
                        hasHistory={
                            history.length > 0
                        }
                    />
                ) : (
                    <>
                        <div className="grid grid-cols-[120px_minmax(180px,1fr)_140px_150px_minmax(160px,1fr)_140px] gap-4 border-b border-[var(--color-border)] bg-[var(--color-background-subtle)] px-5 py-3 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                            <div>Date</div>
                            <div>Document</div>
                            <div>Type</div>
                            <div>Status</div>
                            <div>
                                Reference
                            </div>
                            <div className="text-right">
                                Amount
                            </div>
                        </div>

                        {filteredHistory.map(
                            (item) =>
                                item.kind ===
                                    "DOCUMENT" ? (
                                    <DocumentRow
                                        key={`document-${item.document.id}`}
                                        document={
                                            item.document
                                        }
                                        onOpen={
                                            item.document.type ===
                                                "QUOTE"
                                                ? () =>
                                                    navigate(
                                                        `/sales/quotes/${item.document.id}`,
                                                    )
                                                : item.document.type ===
                                                    "SALES_ORDER"
                                                    ? () =>
                                                        navigate(
                                                            `/sales/orders/${item.document.id}`,
                                                        )
                                                    : item.document.type ===
                                                        "INVOICE"
                                                        ? () =>
                                                            navigate(
                                                                `/sales/invoices/${item.document.id}`,
                                                            )
                                                        : undefined
                                        }
                                    />
                                ) : (
                                    <PaymentRow
                                        key={`payment-${item.payment.id}`}
                                        payment={
                                            item.payment
                                        }
                                    />
                                ),
                        )}
                    </>
                )}

                {history.length > 0 && (
                    <div className="border-t border-[var(--color-border)] bg-[var(--color-background-subtle)] px-5 py-3 text-[11px] text-[var(--color-text-muted)]">
                        Showing{" "}
                        {
                            filteredHistory.length
                        }{" "}
                        of {history.length} sales
                        history items
                    </div>
                )}
            </div>
        </div>
    );
}

function DocumentRow({
    document,
    onOpen,
}: {
    document: SalesDocument;
    onOpen?: () => void;
}) {
    return (
        <div
            role={
                onOpen
                    ? "button"
                    : undefined
            }
            tabIndex={
                onOpen
                    ? 0
                    : undefined
            }
            onClick={
                onOpen
            }
            onKeyDown={(event) => {
                if (
                    onOpen &&
                    (
                        event.key ===
                        "Enter" ||
                        event.key === " "
                    )
                ) {
                    event.preventDefault();
                    onOpen();
                }
            }}
            className={[
                "grid grid-cols-[120px_minmax(180px,1fr)_140px_150px_minmax(160px,1fr)_140px]",
                "items-center gap-4 border-b border-[var(--color-border)] px-5 py-4 last:border-b-0",
                "hover:bg-[var(--color-surface-hover)]",
                onOpen
                    ? "cursor-pointer"
                    : "",
            ].join(" ")}
        >
            <div className="text-xs text-[var(--color-text-secondary)]">
                {formatDate(
                    document.documentDate,
                )}
            </div>

            <div>
                <div className="font-mono text-xs font-semibold text-[var(--color-primary)]">
                    {document.documentNumber}
                </div>

                <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                    {document.lines.length}{" "}
                    {document.lines.length ===
                        1
                        ? "line"
                        : "lines"}
                </div>
            </div>

            <DocumentType
                type={document.type}
            />

            <SalesStatusBadge
                status={document.status}
            />

            <div className="min-w-0">
                <div className="truncate text-xs">
                    {document.customerReference ??
                        "—"}
                </div>

                {document.notes && (
                    <div className="mt-1 truncate text-[10px] text-[var(--color-text-muted)]">
                        {document.notes}
                    </div>
                )}
            </div>

            <div className="money text-right text-sm font-semibold">
                {formatMoney(
                    document.totals.total,
                )}
            </div>
        </div>
    );
}

function PaymentRow({
    payment,
}: {
    payment: Payment;
}) {
    return (
        <div className="grid grid-cols-[120px_minmax(180px,1fr)_140px_150px_minmax(160px,1fr)_140px] items-center gap-4 border-b border-[var(--color-border)] px-5 py-4 last:border-b-0 hover:bg-[var(--color-surface-hover)]">
            <div className="text-xs text-[var(--color-text-secondary)]">
                {formatDate(
                    payment.paymentDate,
                )}
            </div>

            <div>
                <div className="font-mono text-xs font-semibold text-[var(--color-primary)]">
                    {payment.paymentNumber}
                </div>

                <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                    {getPaymentMethodLabel(
                        payment.method,
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium">
                <Banknote
                    size={14}
                    className="text-[var(--color-success)]"
                />

                Payment
            </div>

            <PaymentStatusBadge
                status={payment.status}
            />

            <div className="min-w-0">
                <div className="truncate text-xs">
                    {payment.reference ??
                        "—"}
                </div>

                {payment.notes && (
                    <div className="mt-1 truncate text-[10px] text-[var(--color-text-muted)]">
                        {payment.notes}
                    </div>
                )}
            </div>

            <div className="money text-right text-sm font-semibold text-[var(--color-success)]">
                -
                {formatMoney(
                    payment.amount,
                )}
            </div>
        </div>
    );
}

function DocumentType({
    type,
}: {
    type: SalesDocument["type"];
}) {
    switch (type) {
        case "QUOTE":
            return (
                <div className="flex items-center gap-2 text-xs font-medium">
                    <FileText
                        size={14}
                        className="text-[var(--color-text-secondary)]"
                    />
                    Quote
                </div>
            );

        case "SALES_ORDER":
            return (
                <div className="flex items-center gap-2 text-xs font-medium">
                    <ShoppingCart
                        size={14}
                        className="text-[var(--color-primary)]"
                    />
                    Sales Order
                </div>
            );

        case "INVOICE":
            return (
                <div className="flex items-center gap-2 text-xs font-medium">
                    <ReceiptText
                        size={14}
                        className="text-[var(--color-accent)]"
                    />
                    Invoice
                </div>
            );
    }
}

function SalesStatusBadge({
    status,
}: {
    status: SalesDocumentStatus;
}) {
    const variant =
        getSalesStatusVariant(
            status,
        );

    return (
        <div>
            <Badge variant={variant}>
                {formatStatus(status)}
            </Badge>
        </div>
    );
}

function PaymentStatusBadge({
    status,
}: {
    status: Payment["status"];
}) {
    return (
        <Badge
            variant={
                status === "RECEIVED"
                    ? "success"
                    : "neutral"
            }
        >
            {formatStatus(status)}
        </Badge>
    );
}

function SummaryCard({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof FileText;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white px-5 py-4 shadow-[var(--shadow-xs)]">
            <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-secondary)]">
                    {label}
                </span>

                <Icon
                    size={16}
                    className="text-[var(--color-text-muted)]"
                />
            </div>

            <div className="money mt-2 text-xl font-semibold">
                {value}
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
    children: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "rounded-md px-3 py-1.5",
                "text-xs font-medium",
                "transition",
                active
                    ? "bg-white text-[var(--color-primary)] shadow-[var(--shadow-xs)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
            ].join(" ")}
        >
            {children}
        </button>
    );
}

function EmptyHistory({
    hasHistory,
}: {
    hasHistory: boolean;
}) {
    return (
        <div className="px-6 py-14 text-center">
            <ReceiptText
                size={24}
                className="mx-auto text-[var(--color-text-muted)]"
            />

            <h3 className="mt-4 text-sm font-medium">
                {hasHistory
                    ? "No matching sales activity"
                    : "No sales history"}
            </h3>

            <p className="mx-auto mt-2 max-w-[420px] text-xs leading-5 text-[var(--color-text-muted)]">
                {hasHistory
                    ? "Try another filter or search term."
                    : "Quotes, sales orders, invoices and payments for this customer will appear here."}
            </p>
        </div>
    );
}

function getHistoryType(
    item: SalesHistoryItem,
): SalesFilter {
    if (
        item.kind === "PAYMENT"
    ) {
        return "PAYMENT";
    }

    return item.document.type;
}

function getSalesStatusVariant(
    status: SalesDocumentStatus,
):
    | "neutral"
    | "success"
    | "warning"
    | "danger"
    | "info" {
    switch (status) {
        case "ACCEPTED":
        case "FULFILLED":
        case "INVOICED":
        case "PAID":
            return "success";

        case "SENT":
        case "CONFIRMED":
        case "ISSUED":
            return "info";

        case "EXPIRED":
        case "PARTIALLY_FULFILLED":
        case "PARTIALLY_PAID":
        case "OVERDUE":
            return "warning";

        case "DECLINED":
        case "CANCELLED":
        case "VOID":
            return "danger";

        case "DRAFT":
        case "CONVERTED":
            return "neutral";
    }
}

function formatStatus(
    status: string,
) {
    return status
        .toLowerCase()
        .split("_")
        .map(
            (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1),
        )
        .join(" ");
}

function getPaymentMethodLabel(
    method: Payment["method"],
) {
    switch (method) {
        case "BANK_TRANSFER":
            return "Bank transfer";

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