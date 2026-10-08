import {
    useMemo,
    useState,
} from "react";

import type {
    SupplierBill,
} from "../types/supplierBill";

interface ApplySupplierCreditFormProps {
    creditDate: string;

    amountAvailable: number;

    bills: SupplierBill[];

    onCancel: () => void;

    onApply: (
        values: {
            supplierBillId: string;
            allocationDate: string;
            amount: number;
        },
    ) => void;
}

export function ApplySupplierCreditForm({
    creditDate,
    amountAvailable,
    bills,
    onCancel,
    onApply,
}: ApplySupplierCreditFormProps) {
    const eligibleBills =
        useMemo(
            () =>
                bills.filter(
                    (bill) =>
                        bill.status !==
                        "VOID" &&
                        bill.totals
                            .amountDue >
                        0,
                ),
            [
                bills,
            ],
        );

    const [
        supplierBillId,
        setSupplierBillId,
    ] =
        useState(
            eligibleBills[0]?.id ??
            "",
        );

    const [
        allocationDate,
        setAllocationDate,
    ] =
        useState(
            getToday() <
                creditDate
                ? creditDate
                : getToday(),
        );

    const [
        amount,
        setAmount,
    ] =
        useState("");

    const selectedBill =
        useMemo(
            () =>
                eligibleBills.find(
                    (bill) =>
                        bill.id ===
                        supplierBillId,
                ),
            [
                eligibleBills,
                supplierBillId,
            ],
        );

    const maximumAmount =
        selectedBill
            ? Math.min(
                amountAvailable,
                selectedBill.totals
                    .amountDue,
            )
            : 0;

    function useMaximum() {
        setAmount(
            maximumAmount.toFixed(
                2,
            ),
        );
    }

    function handleSubmit(
        event:
            React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (
            !supplierBillId
        ) {
            return;
        }

        const numericAmount =
            Number(
                amount,
            );

        if (
            !Number.isFinite(
                numericAmount,
            ) ||
            numericAmount <=
            0
        ) {
            return;
        }

        onApply({
            supplierBillId,

            allocationDate,

            amount:
                numericAmount,
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6">
            <div className="w-full max-w-[560px] rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-xl">
                <div className="border-b border-[var(--color-border)] px-6 py-5">
                    <h2 className="font-display text-2xl">
                        Apply
                        Supplier
                        Credit
                    </h2>

                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        Allocate
                        available
                        supplier
                        credit to
                        an
                        outstanding
                        supplier
                        bill.
                    </p>
                </div>

                <form
                    onSubmit={
                        handleSubmit
                    }
                >
                    <div className="space-y-5 px-6 py-5">
                        <div>
                            <div className="mb-1.5 text-xs font-semibold text-[var(--color-text-secondary)]">
                                Supplier
                                Bill
                            </div>

                            <select
                                value={
                                    supplierBillId
                                }
                                onChange={(
                                    event,
                                ) => {
                                    setSupplierBillId(
                                        event
                                            .target
                                            .value,
                                    );

                                    setAmount(
                                        "",
                                    );
                                }}
                                className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                            >
                                {eligibleBills.length ===
                                    0 && (
                                        <option value="">
                                            No
                                            outstanding
                                            bills
                                        </option>
                                    )}

                                {eligibleBills.map(
                                    (
                                        bill,
                                    ) => (
                                        <option
                                            key={
                                                bill.id
                                            }
                                            value={
                                                bill.id
                                            }
                                        >
                                            {
                                                bill.billNumber
                                            }{" "}
                                            —{" "}
                                            {
                                                bill.supplierInvoiceNumber
                                            }{" "}
                                            —{" "}
                                            {formatMoney(
                                                bill
                                                    .totals
                                                    .amountDue,
                                            )}
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>

                        {selectedBill && (
                            <div className="grid grid-cols-2 gap-4">
                                <Summary
                                    label="Bill Amount Due"
                                    value={formatMoney(
                                        selectedBill
                                            .totals
                                            .amountDue,
                                    )}
                                />

                                <Summary
                                    label="Credit Available"
                                    value={formatMoney(
                                        amountAvailable,
                                    )}
                                />
                            </div>
                        )}

                        <div>
                            <div className="mb-1.5 text-xs font-semibold text-[var(--color-text-secondary)]">
                                Allocation
                                Date
                            </div>

                            <input
                                type="date"
                                min={
                                    creditDate
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
                                className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                            />
                        </div>

                        <div>
                            <div className="mb-1.5 flex items-center justify-between">
                                <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                                    Amount
                                </span>

                                <button
                                    type="button"
                                    onClick={
                                        useMaximum
                                    }
                                    disabled={
                                        !selectedBill
                                    }
                                    className="text-xs font-semibold text-[var(--color-primary)] disabled:opacity-40"
                                >
                                    Use
                                    maximum{" "}
                                    {formatMoney(
                                        maximumAmount,
                                    )}
                                </button>
                            </div>

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
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="0.00"
                                className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-[var(--color-border)] px-6 py-4">
                        <button
                            type="button"
                            onClick={
                                onCancel
                            }
                            className="h-10 rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-text-secondary)]"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                !selectedBill ||
                                maximumAmount <=
                                0
                            }
                            className="h-10 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Apply
                            Credit
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

            <div className="money mt-1 text-sm font-semibold">
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