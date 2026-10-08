import {
    useState,
} from "react";

interface VoidSupplierCreditDialogProps {
    creditNumber: string;

    total: number;

    onCancel:
    () => void;

    onVoid:
    (
        reason: string,
    ) => void;
}

export function VoidSupplierCreditDialog({
    creditNumber,
    total,
    onCancel,
    onVoid,
}: VoidSupplierCreditDialogProps) {
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

        onVoid(
            trimmedReason,
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6">
            <div className="w-full max-w-[520px] rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-xl">
                <div className="border-b border-[var(--color-border)] px-6 py-5">
                    <h2 className="font-display text-2xl">
                        Void
                        Supplier
                        Credit
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                        Void{" "}
                        {
                            creditNumber
                        }{" "}
                        for{" "}
                        {formatMoney(
                            total,
                        )}
                        .
                    </p>
                </div>

                <form
                    onSubmit={
                        handleSubmit
                    }
                >
                    <div className="space-y-5 px-6 py-5">
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-800">
                            This
                            supplier
                            credit
                            will
                            remain
                            in
                            accounting
                            history,
                            but
                            it
                            will
                            no
                            longer
                            be
                            available
                            for
                            allocation.
                            This
                            action
                            requires
                            all
                            active
                            allocations
                            to
                            be
                            reversed
                            first.
                        </div>

                        <div>
                            <label
                                htmlFor="supplier-credit-void-reason"
                                className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]"
                            >
                                Void
                                Reason
                            </label>

                            <textarea
                                id="supplier-credit-void-reason"
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
                                placeholder="Why is this supplier credit being voided?"
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
                                ? "Voiding..."
                                : "Void Supplier Credit"}
                        </button>
                    </div>
                </form>
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