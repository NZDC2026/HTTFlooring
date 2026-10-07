import {
    useMemo,
    useState,
} from "react";

import {
    AlertCircle,
    CreditCard,
    X,
} from "lucide-react";

import {
    Button,
} from "../../../components/ui/Button";

import type {
    CreditNote,
} from "../types/creditNote";

import type {
    Invoice,
} from "../types/salesDocument";

export interface ApplyCreditValues {
    invoiceId: string;
    allocationDate: string;
    amount: number;
}

interface Props {
    creditNote: CreditNote;
    invoices: Invoice[];

    onCancel: () => void;

    onSubmit: (
        values: ApplyCreditValues,
    ) => void;
}

export function ApplyCreditForm({
    creditNote,
    invoices,
    onCancel,
    onSubmit,
}: Props) {
    const eligibleInvoices =
        useMemo(
            () =>
                invoices.filter(
                    (invoice) =>
                        invoice.customerId ===
                        creditNote.customerId &&
                        invoice.status !==
                        "VOID" &&
                        invoice.status !==
                        "DRAFT" &&
                        invoice.amountDue >
                        0,
                ),
            [
                invoices,
                creditNote.customerId,
            ],
        );

    const [
        invoiceId,
        setInvoiceId,
    ] = useState(
        eligibleInvoices[0]?.id ??
        "",
    );

    const [
        allocationDate,
        setAllocationDate,
    ] = useState(
        getToday(),
    );

    const selectedInvoice =
        eligibleInvoices.find(
            (invoice) =>
                invoice.id ===
                invoiceId,
        );

    const maximumAmount =
        Math.min(
            creditNote.amountAvailable,
            selectedInvoice?.amountDue ??
            0,
        );

    const [
        amount,
        setAmount,
    ] = useState(
        maximumAmount,
    );

    const [
        error,
        setError,
    ] = useState<
        string | null
    >(null);

    function handleInvoiceChange(
        nextInvoiceId: string,
    ) {
        setInvoiceId(
            nextInvoiceId,
        );

        const invoice =
            eligibleInvoices.find(
                (item) =>
                    item.id ===
                    nextInvoiceId,
            );

        const nextMaximum =
            Math.min(
                creditNote.amountAvailable,
                invoice?.amountDue ??
                0,
            );

        setAmount(
            nextMaximum,
        );

        setError(null);
    }

    function handleSubmit() {
        setError(null);

        if (!invoiceId) {
            setError(
                "Select an invoice to apply this credit to.",
            );

            return;
        }

        if (
            !allocationDate
        ) {
            setError(
                "Allocation date is required.",
            );

            return;
        }

        if (
            allocationDate <
            creditNote.creditDate
        ) {
            setError(
                "Allocation date cannot be earlier than the credit note date.",
            );

            return;
        }

        if (
            !Number.isFinite(
                amount,
            ) ||
            amount <= 0
        ) {
            setError(
                "Credit amount must be greater than zero.",
            );

            return;
        }

        if (
            amount >
            maximumAmount
        ) {
            setError(
                "Credit amount exceeds the available credit or invoice balance.",
            );

            return;
        }

        onSubmit({
            invoiceId,
            allocationDate,
            amount,
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-6">
            <div className="w-full max-w-[560px] overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-xl">
                <div className="flex items-start justify-between border-b border-[var(--color-border)] px-6 py-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <CreditCard
                                size={18}
                                className="text-[var(--color-accent)]"
                            />

                            <h2 className="text-base font-semibold">
                                Apply Credit
                            </h2>
                        </div>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            {
                                creditNote.creditNoteNumber
                            }{" "}
                            · Available{" "}
                            {formatMoney(
                                creditNote.amountAvailable,
                            )}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={
                            onCancel
                        }
                        className="rounded-md p-1 text-[var(--color-text-muted)] transition hover:bg-[var(--color-background-subtle)]"
                    >
                        <X
                            size={18}
                        />
                    </button>
                </div>

                <div className="space-y-5 px-6 py-5">
                    {eligibleInvoices.length ===
                        0 ? (
                        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background-subtle)] px-4 py-5 text-sm text-[var(--color-text-secondary)]">
                            This customer has no
                            outstanding invoices
                            available for credit
                            allocation.
                        </div>
                    ) : (
                        <>
                            <label className="block">
                                <span className="mb-2 block text-xs font-medium">
                                    Invoice
                                </span>

                                <select
                                    value={
                                        invoiceId
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        handleInvoiceChange(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                                >
                                    {eligibleInvoices.map(
                                        (
                                            invoice,
                                        ) => (
                                            <option
                                                key={
                                                    invoice.id
                                                }
                                                value={
                                                    invoice.id
                                                }
                                            >
                                                {
                                                    invoice.documentNumber
                                                }{" "}
                                                —{" "}
                                                {formatMoney(
                                                    invoice.amountDue,
                                                )}{" "}
                                                due
                                            </option>
                                        ),
                                    )}
                                </select>
                            </label>

                            {selectedInvoice && (
                                <div className="grid grid-cols-2 gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-subtle)] p-4">
                                    <Summary
                                        label="Invoice Balance"
                                        value={formatMoney(
                                            selectedInvoice.amountDue,
                                        )}
                                    />

                                    <Summary
                                        label="Available Credit"
                                        value={formatMoney(
                                            creditNote.amountAvailable,
                                        )}
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <label>
                                    <span className="mb-2 block text-xs font-medium">
                                        Allocation
                                        Date
                                    </span>

                                    <input
                                        type="date"
                                        min={
                                            creditNote.creditDate
                                        }
                                        value={
                                            allocationDate
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setAllocationDate(
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        className="h-10 w-full rounded-lg border border-[var(--color-border)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                                    />
                                </label>

                                <label>
                                    <span className="mb-2 block text-xs font-medium">
                                        Amount
                                    </span>

                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        max={
                                            maximumAmount
                                        }
                                        value={
                                            amount
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setAmount(
                                                Number(
                                                    event
                                                        .target
                                                        .value,
                                                ),
                                            )
                                        }
                                        className="h-10 w-full rounded-lg border border-[var(--color-border)] px-3 text-right text-sm outline-none focus:border-[var(--color-primary)]"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setAmount(
                                                maximumAmount,
                                            )
                                        }
                                        className="mt-1 text-[11px] font-medium text-[var(--color-accent)]"
                                    >
                                        Apply maximum{" "}
                                        {formatMoney(
                                            maximumAmount,
                                        )}
                                    </button>
                                </label>
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                            <AlertCircle
                                size={15}
                                className="mt-0.5 shrink-0"
                            />

                            {error}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 border-t border-[var(--color-border)] bg-[var(--color-background-subtle)] px-6 py-4">
                    <Button
                        variant="secondary"
                        onClick={
                            onCancel
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        disabled={
                            eligibleInvoices.length ===
                            0 ||
                            maximumAmount <=
                            0
                        }
                        onClick={
                            handleSubmit
                        }
                    >
                        <CreditCard
                            size={14}
                        />

                        Apply Credit
                    </Button>
                </div>
            </div>
        </div>
    );
}

function Summary({
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

            <div className="money mt-1 text-sm font-semibold">
                {value}
            </div>
        </div>
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