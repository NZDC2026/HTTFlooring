import {
    useState,
} from "react";

import {
    AlertTriangle,
    Ban,
} from "lucide-react";

import {
    Button,
} from "../../../components/ui/Button";

interface VoidSupplierBillDialogProps {
    billNumber: string;

    onCancel:
    () => void;

    onVoid:
    (
        reason: string,
    ) => void;
}

export function VoidSupplierBillDialog({
    billNumber,
    onCancel,
    onVoid,
}: VoidSupplierBillDialogProps) {
    const [
        reason,
        setReason,
    ] =
        useState("");

    const [
        error,
        setError,
    ] =
        useState<
            string | null
        >(null);

    function handleSubmit() {
        const normalizedReason =
            reason.trim();

        if (
            normalizedReason.length <
            3
        ) {
            setError(
                "Please enter a reason for voiding this supplier bill.",
            );

            return;
        }

        setError(
            null,
        );

        onVoid(
            normalizedReason,
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-6">
            <div className="w-full max-w-[520px] overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-xl">
                <div className="border-b border-[var(--color-border)] px-6 py-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-danger)]/10">
                            <Ban
                                size={
                                    18
                                }
                                className="text-[var(--color-danger)]"
                            />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold">
                                Void
                                Supplier
                                Bill
                            </h2>

                            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                {
                                    billNumber
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-5 px-6 py-5">
                    <div className="flex items-start gap-3 rounded-lg border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 px-4 py-3">
                        <AlertTriangle
                            size={
                                16
                            }
                            className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                        />

                        <div>
                            <div className="text-sm font-medium">
                                This
                                action
                                reverses
                                the
                                Supplier
                                Bill.
                            </div>

                            <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                                The
                                bill
                                will
                                no
                                longer
                                contribute
                                to
                                current
                                Accounts
                                Payable.
                                Its
                                original
                                accounting
                                history
                                will
                                remain,
                                and
                                the
                                Purchase
                                Order
                                billed
                                quantities
                                will
                                be
                                restored
                                so
                                a
                                corrected
                                bill
                                can
                                be
                                entered.
                            </p>
                        </div>
                    </div>

                    <label className="block">
                        <span className="mb-2 block text-xs font-medium">
                            Void
                            Reason
                        </span>

                        <textarea
                            value={
                                reason
                            }
                            onChange={(
                                event,
                            ) => {
                                setReason(
                                    event
                                        .target
                                        .value,
                                );

                                if (
                                    error
                                ) {
                                    setError(
                                        null,
                                    );
                                }
                            }}
                            rows={
                                4
                            }
                            autoFocus
                            placeholder="Enter the reason this supplier bill is being voided..."
                            className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
                        />
                    </label>

                    {error && (
                        <div className="text-xs text-[var(--color-danger)]">
                            {
                                error
                            }
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
                        variant="danger"
                        onClick={
                            handleSubmit
                        }
                    >
                        <Ban
                            size={
                                14
                            }
                        />

                        Void
                        Supplier
                        Bill
                    </Button>
                </div>
            </div>
        </div>
    );
}