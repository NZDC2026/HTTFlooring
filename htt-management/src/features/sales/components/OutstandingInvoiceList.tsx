import {
    ArrowUpRight,
    Clock3,
    ReceiptText,
} from "lucide-react";

import type {
    Invoice,
} from "../types/salesDocument";

import {
    getDaysOverdue,
} from "../data/accountsReceivableService";

interface OutstandingInvoiceListProps {
    invoices: Invoice[];

    onOpenInvoice:
    (
        invoiceId:
            string,
    ) => void;
}

export function OutstandingInvoiceList({
    invoices,
    onOpenInvoice,
}: OutstandingInvoiceListProps) {
    const outstandingInvoices =
        invoices
            .filter(
                (invoice) =>
                    invoice.status !==
                    "VOID" &&
                    invoice.amountDue >
                    0,
            )
            .sort(
                (a, b) =>
                    a.dueDate.localeCompare(
                        b.dueDate,
                    ),
            );

    return (
        <div className="mb-5 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
                        <ReceiptText
                            size={16}
                            className="text-[var(--color-primary)]"
                        />
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold">
                            Outstanding Invoices
                        </h3>

                        <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                            Unpaid and partially
                            paid customer
                            invoices.
                        </p>
                    </div>
                </div>

                <div className="text-xs text-[var(--color-text-muted)]">
                    {
                        outstandingInvoices.length
                    }{" "}
                    outstanding
                </div>
            </div>

            {outstandingInvoices.length ===
                0 ? (
                <div className="px-6 py-10 text-center">
                    <div className="text-sm font-medium">
                        No outstanding
                        invoices
                    </div>

                    <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                        This customer has no
                        unpaid invoice balance.
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-[150px_130px_130px_150px_1fr_150px_36px] gap-4 border-b border-[var(--color-border)] bg-[var(--color-background-subtle)] px-5 py-3 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                        <div>
                            Invoice
                        </div>

                        <div>
                            Invoice Date
                        </div>

                        <div>
                            Due Date
                        </div>

                        <div>
                            Age
                        </div>

                        <div>
                            Status
                        </div>

                        <div className="text-right">
                            Amount Due
                        </div>

                        <div />
                    </div>

                    {outstandingInvoices.map(
                        (
                            invoice,
                        ) => (
                            <OutstandingInvoiceRow
                                key={
                                    invoice.id
                                }
                                invoice={
                                    invoice
                                }
                                onOpen={() =>
                                    onOpenInvoice(
                                        invoice.id,
                                    )
                                }
                            />
                        ),
                    )}
                </>
            )}
        </div>
    );
}

function OutstandingInvoiceRow({
    invoice,
    onOpen,
}: {
    invoice: Invoice;
    onOpen: () => void;
}) {
    const daysOverdue =
        getDaysOverdue(
            invoice.dueDate,
        );

    const overdue =
        daysOverdue > 0;

    return (
        <button
            type="button"
            onClick={
                onOpen
            }
            className="grid w-full grid-cols-[150px_130px_130px_150px_1fr_150px_36px] items-center gap-4 border-b border-[var(--color-border)] px-5 py-4 text-left transition last:border-b-0 hover:bg-[var(--color-background-subtle)]"
        >
            <div>
                <div className="font-mono text-xs font-semibold text-[var(--color-primary)]">
                    {
                        invoice.documentNumber
                    }
                </div>

                <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                    {
                        invoice.lines.length
                    }{" "}
                    {invoice.lines
                        .length ===
                        1
                        ? "line"
                        : "lines"}
                </div>
            </div>

            <div className="text-xs">
                {formatDate(
                    invoice.documentDate,
                )}
            </div>

            <div className="text-xs">
                {formatDate(
                    invoice.dueDate,
                )}
            </div>

            <div>
                {overdue ? (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-danger)]">
                        <Clock3
                            size={13}
                        />

                        {daysOverdue}{" "}
                        {daysOverdue ===
                            1
                            ? "day"
                            : "days"}{" "}
                        overdue
                    </div>
                ) : (
                    <span className="text-xs text-[var(--color-text-secondary)]">
                        Current
                    </span>
                )}
            </div>

            <div className="text-xs">
                {formatStatus(
                    invoice.status,
                )}
            </div>

            <div
                className={[
                    "money text-right text-sm font-semibold",
                    overdue
                        ? "text-[var(--color-danger)]"
                        : "text-[var(--color-primary)]",
                ].join(" ")}
            >
                {formatMoney(
                    invoice.amountDue,
                )}
            </div>

            <ArrowUpRight
                size={14}
                className="text-[var(--color-text-muted)]"
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