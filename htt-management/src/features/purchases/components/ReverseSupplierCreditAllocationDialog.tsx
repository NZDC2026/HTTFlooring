import {
    useState,
} from "react";

import type {
    SupplierCreditAllocation,
} from "../types/supplierCredit";

interface ReverseSupplierCreditAllocationDialogProps {
    allocation:
    SupplierCreditAllocation;

    onCancel:
    () => void;

    onReverse:
    (
        reason: string,
    ) => void;
}

export function ReverseSupplierCreditAllocationDialog({
    allocation,
    onCancel,
    onReverse,
}: ReverseSupplierCreditAllocationDialogProps) {
    const [
        reason,
        setReason,
    ] =
        useState("");

    const [
        submitting,
        setSubmitting,
    ] =
        useState(false);

    function handleSubmit(
        event:
            React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const trimmedReason =
            reason.trim();

        if (
            trimmedReason.length <
            3
        ) {
            return;
        }

        setSubmitting(
            true,
        );

        onReverse(
            trimmedReason,
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6">
            <div className="w-full max-w-[520px] rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-xl">
                <div className="border-b border-[var(--color-border)] px-6 py-5">
                    <h2 className="font-display text-2xl">
                        Reverse
                        Credit
                        Allocation
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                        Reverse{" "}
                        {formatMoney(
                            allocation.amount,
                        )}{" "}
                        allocated
                        to{" "}
                        {
                            allocation.supplierBillNumber
                        }
                        .
                    </p>
                </div>

                <form
                    onSubmit={
                        handleSubmit
                    }
                >
                    <div className="space-y-5 px-6 py-5">
                        <div className="grid grid-cols-2 gap-4">
                            <Summary
                                label="Allocation"
                                value={
                                    allocation.allocationNumber
                                }
                            />

                            <Summary
                                label="Amount"
                                value={formatMoney(
                                    allocation.amount,
                                )}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="allocation-reversal-reason"
                                className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]"
                            >
                                Reversal
                                Reason
                            </label>

                            <textarea
                                id="allocation-reversal-reason"
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
                                rows={
                                    4
                                }
                                placeholder="Why is this allocation being reversed?"
                                className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                            />

                            <p className="mt-1.5 text-[10px] text-[var(--color-text-muted)]">
                                At
                                least
                                3
                                characters
                                are
                                required.
                            </p>
                        </div>

                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
                            Reversing
                            this
                            allocation
                            will
                            restore
                            the
                            supplier
                            credit
                            balance
                            and
                            increase
                            the
                            supplier
                            bill
                            amount
                            due.
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-[var(--color-border)] px-6 py-4">
                        <button
                            type="button"
                            disabled={
                                submitting
                            }
                            onClick={
                                onCancel
                            }
                            className="h-10 rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-text-secondary)] disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                submitting ||
                                reason
                                    .trim()
                                    .length <
                                3
                            }
                            className="h-10 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting
                                ? "Reversing..."
                                : "Reverse Allocation"}
                        </button>
                    </div>
                </form>
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
        <div className="rounded-lg bg-[var(--color-surface-muted)] px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                {label}
            </div>

            <div className="mt-1 text-sm font-semibold">
                {value}
            </div>
        </div>
    );
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