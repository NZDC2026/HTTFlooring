import {
    useState,
    type FormEvent,
    type ReactNode,
} from "react";

import {
    Banknote,
    X,
} from "lucide-react";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

import type {
    PaymentMethod,
} from "../types/payment";

export interface PaymentAllocationValues {
    paymentDate: string;

    amount: number;

    method: PaymentMethod;

    reference?: string;
    notes?: string;
}

interface PaymentAllocationFormProps {
    invoiceNumber: string;

    amountDue: number;

    onCancel: () => void;

    onSubmit: (
        values:
            PaymentAllocationValues,
    ) => void;
}

export function PaymentAllocationForm({
    invoiceNumber,
    amountDue,
    onCancel,
    onSubmit,
}: PaymentAllocationFormProps) {
    const [
        paymentDate,
        setPaymentDate,
    ] = useState(
        getToday(),
    );

    const [
        amount,
        setAmount,
    ] = useState(
        amountDue.toFixed(2),
    );

    const [
        method,
        setMethod,
    ] = useState<PaymentMethod>(
        "BANK_TRANSFER",
    );

    const [
        reference,
        setReference,
    ] = useState("");

    const [
        notes,
        setNotes,
    ] = useState("");

    const [
        error,
        setError,
    ] = useState<
        string | null
    >(null);

    function handleSubmit(
        event:
            FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError(null);

        const numericAmount =
            Number(amount);

        if (
            !Number.isFinite(
                numericAmount,
            ) ||
            numericAmount <= 0
        ) {
            setError(
                "Payment amount must be greater than zero.",
            );

            return;
        }

        if (
            numericAmount >
            amountDue
        ) {
            setError(
                "Payment amount cannot exceed the invoice amount due.",
            );

            return;
        }

        if (!paymentDate) {
            setError(
                "Payment date is required.",
            );

            return;
        }

        onSubmit({
            paymentDate,

            amount:
                numericAmount,

            method,

            reference:
                reference.trim() ||
                undefined,

            notes:
                notes.trim() ||
                undefined,
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6">
            <div className="w-full max-w-[560px] overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-xl">
                <div className="flex items-start justify-between border-b border-[var(--color-border)] px-6 py-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
                            <Banknote
                                size={18}
                                className="text-[var(--color-primary)]"
                            />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold">
                                Allocate Payment
                            </h2>

                            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                {
                                    invoiceNumber
                                }
                                {" · "}
                                Amount due{" "}
                                {formatMoney(
                                    amountDue,
                                )}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={
                            onCancel
                        }
                        className="rounded-md p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]"
                    >
                        <X
                            size={17}
                        />
                    </button>
                </div>

                <form
                    onSubmit={
                        handleSubmit
                    }
                >
                    <div className="space-y-5 px-6 py-6">
                        {error && (
                            <div className="rounded-lg border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 px-4 py-3 text-sm text-[var(--color-danger)]">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <Field
                                label="Payment Date"
                                required
                            >
                                <Input
                                    type="date"
                                    value={
                                        paymentDate
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setPaymentDate(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />
                            </Field>

                            <Field
                                label="Amount"
                                required
                            >
                                <Input
                                    type="number"
                                    min="0.01"
                                    max={
                                        amountDue
                                    }
                                    step="0.01"
                                    value={
                                        amount
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setAmount(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />
                            </Field>
                        </div>

                        <Field
                            label="Payment Method"
                            required
                        >
                            <select
                                value={
                                    method
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setMethod(
                                        event
                                            .target
                                            .value as PaymentMethod,
                                    )
                                }
                                className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none transition hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                            >
                                <option value="BANK_TRANSFER">
                                    Bank Transfer
                                </option>

                                <option value="CARD">
                                    Card
                                </option>

                                <option value="CASH">
                                    Cash
                                </option>

                                <option value="CHEQUE">
                                    Cheque
                                </option>

                                <option value="OTHER">
                                    Other
                                </option>
                            </select>
                        </Field>

                        <Field label="Reference">
                            <Input
                                value={
                                    reference
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setReference(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="e.g. BANK-071026-ABC"
                            />
                        </Field>

                        <Field label="Notes">
                            <textarea
                                value={
                                    notes
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setNotes(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                rows={3}
                                placeholder="Optional payment notes..."
                                className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                            />
                        </Field>

                        <button
                            type="button"
                            onClick={() =>
                                setAmount(
                                    amountDue.toFixed(
                                        2,
                                    ),
                                )
                            }
                            className="text-xs font-medium text-[var(--color-primary)] hover:underline"
                        >
                            Pay full amount{" "}
                            {formatMoney(
                                amountDue,
                            )}
                        </button>
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
                            type="submit"
                        >
                            <Banknote
                                size={15}
                            />
                            Allocate Payment
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Field({
    label,
    required = false,
    children,
}: {
    label: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <label className="block">
            <div className="mb-2 text-xs font-medium text-[var(--color-text-secondary)]">
                {label}

                {required && (
                    <span className="ml-1 text-[var(--color-danger)]">
                        *
                    </span>
                )}
            </div>

            {children}
        </label>
    );
}

function getToday() {
    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1,
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
    return value.toLocaleString(
        "en-AU",
        {
            style: "currency",
            currency: "AUD",
            minimumFractionDigits: 2,
        },
    );
}