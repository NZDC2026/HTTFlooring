import {
    useMemo,
    useState,
} from "react";

import {
    AlertCircle,
    Minus,
    Plus,
    ReceiptText,
    X,
} from "lucide-react";

import {
    Button,
} from "../../../components/ui/Button";

import {
    calculateDocumentTotals,
    calculateSalesLine,
} from "../data/salesCalculations";

import type {
    Invoice,
    SalesDocumentLine,
} from "../types/salesDocument";

export interface CreateCreditNoteValues {
    creditDate: string;
    reason: string;
    lines: SalesDocumentLine[];
}

interface Props {
    invoice: Invoice;

    onCancel: () => void;

    onSubmit: (
        values: CreateCreditNoteValues,
    ) => void;
}

interface CreditLineState {
    line: SalesDocumentLine;
    selected: boolean;
    quantity: number;
}

export function CreateCreditNoteForm({
    invoice,
    onCancel,
    onSubmit,
}: Props) {
    const [
        creditDate,
        setCreditDate,
    ] = useState(
        getToday(),
    );

    const [
        reason,
        setReason,
    ] = useState("");

    const [
        error,
        setError,
    ] = useState<
        string | null
    >(null);

    const [
        creditLines,
        setCreditLines,
    ] = useState<
        CreditLineState[]
    >(() =>
        invoice.lines.map(
            (line) => ({
                line,
                selected: true,
                quantity:
                    line.quantity,
            }),
        ),
    );

    const selectedLines =
        useMemo<
            SalesDocumentLine[]
        >(
            () =>
                creditLines
                    .filter(
                        (item) =>
                            item.selected &&
                            item.quantity >
                            0,
                    )
                    .map(
                        (item) => {
                            const quantity =
                                item.quantity;

                            const calculation =
                                calculateSalesLine({
                                    quantity,

                                    standardUnitPrice:
                                        item.line
                                            .standardUnitPrice,

                                    unitPrice:
                                        item.line
                                            .unitPrice,
                                });

                            return {
                                ...item.line,

                                quantity,

                                ...calculation,
                            };
                        },
                    ),
            [creditLines],
        );

    const totals =
        useMemo(
            () =>
                calculateDocumentTotals(
                    selectedLines,
                ),
            [selectedLines],
        );

    function updateQuantity(
        index: number,
        quantity: number,
    ) {
        setCreditLines(
            (current) =>
                current.map(
                    (
                        item,
                        itemIndex,
                    ) => {
                        if (
                            itemIndex !==
                            index
                        ) {
                            return item;
                        }

                        const normalized =
                            Math.min(
                                item.line
                                    .quantity,
                                Math.max(
                                    0,
                                    quantity,
                                ),
                            );

                        return {
                            ...item,
                            quantity:
                                normalized,
                            selected:
                                normalized >
                                0,
                        };
                    },
                ),
        );
    }

    function toggleLine(
        index: number,
    ) {
        setCreditLines(
            (current) =>
                current.map(
                    (
                        item,
                        itemIndex,
                    ) =>
                        itemIndex ===
                            index
                            ? {
                                ...item,
                                selected:
                                    !item.selected,
                            }
                            : item,
                ),
        );
    }

    function handleSubmit() {
        setError(null);

        if (
            !creditDate
        ) {
            setError(
                "Credit date is required.",
            );

            return;
        }

        if (
            creditDate <
            invoice.documentDate
        ) {
            setError(
                "Credit date cannot be earlier than the invoice date.",
            );

            return;
        }

        if (
            reason.trim().length <
            3
        ) {
            setError(
                "Please enter a credit reason.",
            );

            return;
        }

        if (
            selectedLines.length ===
            0
        ) {
            setError(
                "Select at least one invoice line to credit.",
            );

            return;
        }

        onSubmit({
            creditDate,
            reason:
                reason.trim(),
            lines:
                selectedLines,
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-6">
            <div className="flex max-h-[90vh] w-full max-w-[920px] flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-xl">
                <div className="flex items-start justify-between border-b border-[var(--color-border)] px-6 py-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <ReceiptText
                                size={18}
                                className="text-[var(--color-accent)]"
                            />

                            <h2 className="text-base font-semibold">
                                Create Credit Note
                            </h2>
                        </div>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            Credit against{" "}
                            {
                                invoice.documentNumber
                            }
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={
                            onCancel
                        }
                        className="rounded-md p-1 text-[var(--color-text-muted)] transition hover:bg-[var(--color-background-subtle)] hover:text-[var(--color-text)]"
                    >
                        <X
                            size={18}
                        />
                    </button>
                </div>

                <div className="overflow-y-auto">
                    <div className="grid grid-cols-2 gap-5 border-b border-[var(--color-border)] px-6 py-5">
                        <label>
                            <span className="mb-2 block text-xs font-medium">
                                Credit Date
                            </span>

                            <input
                                type="date"
                                value={
                                    creditDate
                                }
                                min={
                                    invoice.documentDate
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setCreditDate(
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
                                Reason
                            </span>

                            <input
                                value={
                                    reason
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setReason(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="e.g. Returned material"
                                className="h-10 w-full rounded-lg border border-[var(--color-border)] px-3 text-sm outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
                            />
                        </label>
                    </div>

                    <div className="px-6 py-5">
                        <div className="mb-3">
                            <h3 className="text-sm font-semibold">
                                Credit Lines
                            </h3>

                            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                Select the
                                invoice lines
                                and quantity
                                being credited.
                            </p>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
                            <div className="grid grid-cols-[44px_minmax(0,1fr)_130px_120px_120px] gap-3 bg-[var(--color-background-subtle)] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--color-text-muted)]">
                                <div />

                                <div>
                                    Item
                                </div>

                                <div className="text-center">
                                    Credit Qty
                                </div>

                                <div className="text-right">
                                    Unit Price
                                </div>

                                <div className="text-right">
                                    Credit
                                </div>
                            </div>

                            {creditLines.map(
                                (
                                    item,
                                    index,
                                ) => {
                                    const line =
                                        item.line;

                                    const calculated =
                                        calculateSalesLine({
                                            quantity:
                                                item.selected
                                                    ? item.quantity
                                                    : 0,

                                            standardUnitPrice:
                                                line.standardUnitPrice,

                                            unitPrice:
                                                line.unitPrice,
                                        });

                                    return (
                                        <div
                                            key={
                                                line.id
                                            }
                                            className="grid grid-cols-[44px_minmax(0,1fr)_130px_120px_120px] items-center gap-3 border-t border-[var(--color-border)] px-4 py-4"
                                        >
                                            <div>
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        item.selected
                                                    }
                                                    onChange={() =>
                                                        toggleLine(
                                                            index,
                                                        )
                                                    }
                                                    className="h-4 w-4 accent-[var(--color-primary)]"
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-medium">
                                                    {
                                                        line.description
                                                    }
                                                </div>

                                                <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                                    Original
                                                    quantity:{" "}
                                                    {
                                                        line.quantity
                                                    }
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        !item.selected
                                                    }
                                                    onClick={() =>
                                                        updateQuantity(
                                                            index,
                                                            item.quantity -
                                                            1,
                                                        )
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-border)] disabled:opacity-40"
                                                >
                                                    <Minus
                                                        size={13}
                                                    />
                                                </button>

                                                <input
                                                    type="number"
                                                    min={
                                                        0
                                                    }
                                                    max={
                                                        line.quantity
                                                    }
                                                    step="0.01"
                                                    disabled={
                                                        !item.selected
                                                    }
                                                    value={
                                                        item.quantity
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        updateQuantity(
                                                            index,
                                                            Number(
                                                                event
                                                                    .target
                                                                    .value,
                                                            ),
                                                        )
                                                    }
                                                    className="h-8 w-14 rounded-md border border-[var(--color-border)] text-center text-xs outline-none disabled:opacity-40"
                                                />

                                                <button
                                                    type="button"
                                                    disabled={
                                                        !item.selected ||
                                                        item.quantity >=
                                                        line.quantity
                                                    }
                                                    onClick={() =>
                                                        updateQuantity(
                                                            index,
                                                            item.quantity +
                                                            1,
                                                        )
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-border)] disabled:opacity-40"
                                                >
                                                    <Plus
                                                        size={13}
                                                    />
                                                </button>
                                            </div>

                                            <div className="money text-right text-sm">
                                                {formatMoney(
                                                    line.unitPrice,
                                                )}
                                            </div>

                                            <div className="money text-right text-sm font-semibold">
                                                {formatMoney(
                                                    calculated.lineTotal,
                                                )}
                                            </div>
                                        </div>
                                    );
                                },
                            )}
                        </div>

                        <div className="mt-5 flex justify-end">
                            <div className="w-[320px] rounded-lg border border-[var(--color-border)] bg-[var(--color-background-subtle)] p-4">
                                <SummaryRow
                                    label="Subtotal"
                                    value={formatMoney(
                                        totals.subtotal,
                                    )}
                                />

                                <div className="mt-2">
                                    <SummaryRow
                                        label="GST"
                                        value={formatMoney(
                                            totals.taxAmount,
                                        )}
                                    />
                                </div>

                                <div className="mt-3 border-t border-[var(--color-border)] pt-3">
                                    <SummaryRow
                                        label="Credit Total"
                                        value={formatMoney(
                                            totals.total,
                                        )}
                                        strong
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                                <AlertCircle
                                    size={15}
                                    className="mt-0.5 shrink-0"
                                />

                                {
                                    error
                                }
                            </div>
                        )}
                    </div>
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
                        onClick={
                            handleSubmit
                        }
                        disabled={
                            selectedLines.length ===
                            0
                        }
                    >
                        <ReceiptText
                            size={14}
                        />

                        Create Credit Note
                    </Button>
                </div>
            </div>
        </div>
    );
}

function SummaryRow({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
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
                {value}
            </span>
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
            style:
                "currency",
            currency:
                "AUD",
        },
    ).format(value);
}