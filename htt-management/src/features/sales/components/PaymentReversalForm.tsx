import {
    useState,
    type FormEvent,
} from "react";

import {
    RotateCcw,
    X,
} from "lucide-react";

import { Button } from "../../../components/ui/Button";

import type {
    Payment,
} from "../types/payment";

interface PaymentReversalFormProps {
    payment: Payment;

    onCancel:
    () => void;

    onSubmit:
    (
        reason: string,
    ) => void;
}

export function PaymentReversalForm({
    payment,
    onCancel,
    onSubmit,
}: PaymentReversalFormProps) {
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

    function handleSubmit(
        event:
            FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const normalized =
            reason.trim();

        if (
            normalized.length <
            3
        ) {
            setError(
                "Please enter a reversal reason.",
            );

            return;
        }

        setError(null);

        onSubmit(
            normalized,
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6">
            <div className="w-full max-w-[520px] overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-xl">
                <div className="flex items-start justify-between border-b border-[var(--color-border)] px-6 py-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <RotateCcw
                                size={17}
                                className="text-[var(--color-danger)]"
                            />

                            <h2 className="text-lg font-semibold">
                                Reverse Payment
                            </h2>
                        </div>

                        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                            The payment will
                            remain in the audit
                            history and the
                            invoice balance will
                            be recalculated.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={
                            onCancel
                        }
                        className="rounded-md p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)]"
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
                        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background-subtle)] p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-mono text-xs font-semibold text-[var(--color-primary)]">
                                        {
                                            payment.paymentNumber
                                        }
                                    </div>

                                    <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                                        {
                                            payment.paymentDate
                                        }
                                    </div>
                                </div>

                                <div className="money text-lg font-semibold">
                                    {formatMoney(
                                        payment.amount,
                                    )}
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-lg border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 px-4 py-3 text-sm text-[var(--color-danger)]">
                                {error}
                            </div>
                        )}

                        <label className="block">
                            <div className="mb-2 text-xs font-medium text-[var(--color-text-secondary)]">
                                Reversal Reason

                                <span className="ml-1 text-[var(--color-danger)]">
                                    *
                                </span>
                            </div>

                            <textarea
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
                                rows={4}
                                autoFocus
                                placeholder="e.g. Payment entered with incorrect amount"
                                className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                            />
                        </label>

                        <div className="rounded-lg border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 px-4 py-3 text-xs leading-5 text-[var(--color-text-secondary)]">
                            Reversing this payment
                            may reopen the invoice
                            or change it from Paid
                            to Partially Paid.
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-[var(--color-border)] bg-[var(--color-background-subtle)] px-6 py-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={
                                onCancel
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            variant="danger"
                        >
                            <RotateCcw
                                size={15}
                            />

                            Reverse Payment
                        </Button>
                    </div>
                </form>
            </div>
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