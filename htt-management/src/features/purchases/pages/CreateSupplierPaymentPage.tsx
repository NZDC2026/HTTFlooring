import {
    ArrowLeft,
    CheckCircle2,
    CreditCard,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import {
    useSuppliers,
} from "../../contacts/data/useSuppliers";

import {
    useSupplierBills,
} from "../data/useSupplierBills";

import {
    supplierPaymentRepository,
} from "../data/supplierPaymentRepository";

import type {
    SupplierPaymentMethod,
} from "../types/supplierPayment";

type AllocationMap =
    Record<string, string>;

export function CreateSupplierPaymentPage() {
    const navigate =
        useNavigate();

    const [
        searchParams,
    ] = useSearchParams();

    const suppliers =
        useSuppliers();

    const bills =
        useSupplierBills();

    const requestedSupplierId =
        searchParams.get(
            "supplierId",
        ) ?? "";

    const requestedBillId =
        searchParams.get(
            "billId",
        ) ?? "";

    const [
        supplierId,
        setSupplierId,
    ] = useState(
        requestedSupplierId,
    );

    const [
        paymentDate,
        setPaymentDate,
    ] = useState(
        getToday(),
    );

    const [
        method,
        setMethod,
    ] =
        useState<SupplierPaymentMethod>(
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
        allocations,
        setAllocations,
    ] =
        useState<AllocationMap>(
            {},
        );

    const [
        error,
        setError,
    ] = useState<
        string | null
    >(null);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const outstandingBills =
        useMemo(
            () =>
                bills
                    .filter(
                        (bill) =>
                            bill.supplierId ===
                            supplierId &&
                            bill.status !==
                            "VOID" &&
                            bill.status !==
                            "PAID" &&
                            bill.totals
                                .amountDue >
                            0,
                    )
                    .sort(
                        (a, b) =>
                            a.dueDate.localeCompare(
                                b.dueDate,
                            ),
                    ),
            [
                bills,
                supplierId,
            ],
        );

    useEffect(
        () => {
            setAllocations(
                {},
            );

            setError(
                null,
            );
        },
        [
            supplierId,
        ],
    );

    useEffect(
        () => {
            if (
                !requestedBillId ||
                !supplierId
            ) {
                return;
            }

            const bill =
                bills.find(
                    (item) =>
                        item.id ===
                        requestedBillId &&
                        item.supplierId ===
                        supplierId &&
                        item.status !==
                        "VOID" &&
                        item.status !==
                        "PAID" &&
                        item.totals
                            .amountDue >
                        0,
                );

            if (!bill) {
                return;
            }

            setAllocations(
                {
                    [bill.id]:
                        bill.totals.amountDue.toFixed(
                            2,
                        ),
                },
            );
        },
        [
            bills,
            requestedBillId,
            supplierId,
        ],
    );

    const paymentTotal =
        useMemo(
            () =>
                roundCurrency(
                    Object.values(
                        allocations,
                    ).reduce(
                        (
                            total,
                            value,
                        ) => {
                            const amount =
                                Number(
                                    value,
                                );

                            return Number.isFinite(
                                amount,
                            )
                                ? total +
                                amount
                                : total;
                        },
                        0,
                    ),
                ),
            [
                allocations,
            ],
        );

    const totalOutstanding =
        useMemo(
            () =>
                roundCurrency(
                    outstandingBills.reduce(
                        (
                            total,
                            bill,
                        ) =>
                            total +
                            bill.totals
                                .amountDue,
                        0,
                    ),
                ),
            [
                outstandingBills,
            ],
        );

    const remainingAfterPayment =
        roundCurrency(
            Math.max(
                0,
                totalOutstanding -
                paymentTotal,
            ),
        );

    function updateAllocation(
        billId: string,
        value: string,
    ) {
        setAllocations(
            (current) => ({
                ...current,
                [billId]:
                    value,
            }),
        );

        setError(
            null,
        );
    }

    function allocateBill(
        billId: string,
        amountDue: number,
    ) {
        setAllocations(
            (current) => ({
                ...current,
                [billId]:
                    amountDue.toFixed(
                        2,
                    ),
            }),
        );
    }

    function allocateAll() {
        const next:
            AllocationMap =
            {};

        for (
            const bill of
            outstandingBills
        ) {
            next[
                bill.id
            ] =
                bill.totals.amountDue.toFixed(
                    2,
                );
        }

        setAllocations(
            next,
        );
    }

    function clearAll() {
        setAllocations(
            {},
        );
    }

    function handleSubmit() {
        setError(
            null,
        );

        if (
            !supplierId
        ) {
            setError(
                "Select a supplier.",
            );
            return;
        }

        const draftAllocations =
            outstandingBills
                .map(
                    (bill) => ({
                        supplierBillId:
                            bill.id,
                        amount:
                            Number(
                                allocations[
                                bill.id
                                ] ??
                                0,
                            ),
                    }),
                )
                .filter(
                    (allocation) =>
                        Number.isFinite(
                            allocation.amount,
                        ) &&
                        allocation.amount >
                        0,
                );

        if (
            draftAllocations.length ===
            0
        ) {
            setError(
                "Allocate the payment to at least one supplier bill.",
            );
            return;
        }

        for (
            const allocation of
            draftAllocations
        ) {
            const bill =
                outstandingBills.find(
                    (item) =>
                        item.id ===
                        allocation.supplierBillId,
                );

            if (!bill) {
                continue;
            }

            if (
                allocation.amount >
                bill.totals
                    .amountDue
            ) {
                setError(
                    `${bill.billNumber} cannot be paid more than ${formatMoney(
                        bill.totals
                            .amountDue,
                    )}.`,
                );
                return;
            }
        }

        try {
            setSaving(
                true,
            );

            const payment =
                supplierPaymentRepository.create(
                    {
                        supplierId,
                        paymentDate,
                        method,
                        reference,
                        notes,
                        allocations:
                            draftAllocations,
                    },
                );

            navigate(
                `/purchases/payments/${payment.id}`,
            );
        } catch (
        caught
        ) {
            setError(
                caught instanceof
                    Error
                    ? caught.message
                    : "Unable to create supplier payment.",
            );
        } finally {
            setSaving(
                false,
            );
        }
    }

    return (
        <div className="pb-8">
            <button
                type="button"
                onClick={() =>
                    navigate(
                        "/purchases/payables",
                    )
                }
                className="mb-5 flex items-center gap-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            >
                <ArrowLeft
                    size={14}
                />
                Back to Accounts
                Payable
            </button>

            <div className="mb-7">
                <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                    Accounts Payable
                </p>

                <h1 className="font-display text-[34px] leading-tight">
                    Record Supplier
                    Payment
                </h1>

                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    Allocate one
                    payment across
                    outstanding bills
                    for the same
                    supplier.
                </p>
            </div>

            {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-[1fr_340px] gap-5">
                <div className="space-y-5">
                    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
                        <h2 className="font-display text-xl">
                            Payment Details
                        </h2>

                        <div className="mt-5 grid grid-cols-2 gap-4">
                            <Field
                                label="Supplier"
                            >
                                <select
                                    value={
                                        supplierId
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setSupplierId(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    disabled={
                                        Boolean(
                                            requestedSupplierId,
                                        )
                                    }
                                    className={inputClass}
                                >
                                    <option value="">
                                        Select
                                        supplier
                                    </option>

                                    {suppliers.map(
                                        (
                                            supplier,
                                        ) => (
                                            <option
                                                key={
                                                    supplier.id
                                                }
                                                value={
                                                    supplier.id
                                                }
                                            >
                                                {
                                                    supplier.businessName
                                                }
                                            </option>
                                        ),
                                    )}
                                </select>
                            </Field>

                            <Field
                                label="Payment Date"
                            >
                                <input
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
                                    className={inputClass}
                                />
                            </Field>

                            <Field
                                label="Payment Method"
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
                                                .value as SupplierPaymentMethod,
                                        )
                                    }
                                    className={inputClass}
                                >
                                    <option value="BANK_TRANSFER">
                                        Bank
                                        Transfer
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

                            <Field
                                label="Reference"
                            >
                                <input
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
                                    placeholder="Bank reference"
                                    className={inputClass}
                                />
                            </Field>
                        </div>

                        <div className="mt-4">
                            <Field
                                label="Notes"
                            >
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
                                    className={`${inputClass} py-3`}
                                />
                            </Field>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                            <div>
                                <h2 className="font-display text-xl">
                                    Bill
                                    Allocation
                                </h2>

                                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                    Enter how
                                    much of this
                                    payment applies
                                    to each bill.
                                </p>
                            </div>

                            {outstandingBills.length >
                                0 && (
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={
                                                clearAll
                                            }
                                            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-medium"
                                        >
                                            Clear
                                        </button>

                                        <button
                                            type="button"
                                            onClick={
                                                allocateAll
                                            }
                                            className="rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white"
                                        >
                                            Allocate
                                            All
                                        </button>
                                    </div>
                                )}
                        </div>

                        {!supplierId ? (
                            <Empty>
                                Select a
                                supplier to
                                view
                                outstanding
                                bills.
                            </Empty>
                        ) : outstandingBills.length ===
                            0 ? (
                            <Empty>
                                This supplier
                                has no
                                outstanding
                                bills.
                            </Empty>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                                            <Header>
                                                Bill
                                            </Header>

                                            <Header>
                                                Supplier
                                                Invoice
                                            </Header>

                                            <Header>
                                                Due
                                                Date
                                            </Header>

                                            <Header align="right">
                                                Outstanding
                                            </Header>

                                            <Header align="right">
                                                Allocate
                                            </Header>

                                            <Header />
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {outstandingBills.map(
                                            (
                                                bill,
                                            ) => (
                                                <tr
                                                    key={
                                                        bill.id
                                                    }
                                                    className="border-b border-[var(--color-border)] last:border-b-0"
                                                >
                                                    <td className="px-4 py-4 text-sm font-semibold text-[var(--color-primary)]">
                                                        {
                                                            bill.billNumber
                                                        }
                                                    </td>

                                                    <td className="px-4 py-4 text-sm">
                                                        {
                                                            bill.supplierInvoiceNumber
                                                        }
                                                    </td>

                                                    <td className="px-4 py-4 text-sm">
                                                        {
                                                            bill.dueDate
                                                        }
                                                    </td>

                                                    <td className="money px-4 py-4 text-right text-sm font-semibold">
                                                        {formatMoney(
                                                            bill
                                                                .totals
                                                                .amountDue,
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={
                                                                bill
                                                                    .totals
                                                                    .amountDue
                                                            }
                                                            step="0.01"
                                                            value={
                                                                allocations[
                                                                bill
                                                                    .id
                                                                ] ??
                                                                ""
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                updateAllocation(
                                                                    bill.id,
                                                                    event
                                                                        .target
                                                                        .value,
                                                                )
                                                            }
                                                            className="ml-auto block h-9 w-32 rounded-lg border border-[var(--color-border)] px-3 text-right text-sm outline-none focus:border-[var(--color-primary)]"
                                                        />
                                                    </td>

                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                allocateBill(
                                                                    bill.id,
                                                                    bill
                                                                        .totals
                                                                        .amountDue,
                                                                )
                                                            }
                                                            className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
                                                        >
                                                            All
                                                        </button>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <div className="sticky top-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
                        <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-surface-muted)]">
                            <CreditCard
                                size={19}
                            />
                        </div>

                        <h2 className="font-display text-xl">
                            Payment Summary
                        </h2>

                        <SummaryRow
                            label="Supplier AP"
                            value={
                                totalOutstanding
                            }
                        />

                        <SummaryRow
                            label="Payment Total"
                            value={
                                paymentTotal
                            }
                            strong
                        />

                        <SummaryRow
                            label="Remaining AP"
                            value={
                                remainingAfterPayment
                            }
                        />

                        <button
                            type="button"
                            disabled={
                                saving ||
                                paymentTotal <=
                                0
                            }
                            onClick={
                                handleSubmit
                            }
                            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <CheckCircle2
                                size={16}
                            />

                            {saving
                                ? "Posting..."
                                : `Post ${formatMoney(
                                    paymentTotal,
                                )} Payment`}
                        </button>

                        <p className="mt-3 text-[10px] leading-4 text-[var(--color-text-muted)]">
                            Payment total
                            equals the sum
                            of bill
                            allocations.
                            Unallocated
                            supplier
                            prepayments are
                            not supported.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children:
    React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">
                {label}
            </span>

            {children}
        </label>
    );
}

function Header({
    children,
    align = "left",
}: {
    children?:
    React.ReactNode;
    align?:
    | "left"
    | "right";
}) {
    return (
        <th
            className={[
                "h-10 whitespace-nowrap px-4 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]",
                align ===
                    "right"
                    ? "text-right"
                    : "text-left",
            ].join(" ")}
        >
            {children}
        </th>
    );
}

function SummaryRow({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: number;
    strong?: boolean;
}) {
    return (
        <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-secondary)]">
                {label}
            </span>

            <span
                className={
                    strong
                        ? "money font-display text-xl"
                        : "money text-sm font-semibold"
                }
            >
                {formatMoney(
                    value,
                )}
            </span>
        </div>
    );
}

function Empty({
    children,
}: {
    children:
    React.ReactNode;
}) {
    return (
        <div className="px-5 py-12 text-center text-sm text-[var(--color-text-muted)]">
            {children}
        </div>
    );
}

const inputClass =
    "h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:bg-[var(--color-surface-muted)]";

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

function roundCurrency(
    value: number,
) {
    return (
        Math.round(
            (value +
                Number.EPSILON) *
            100,
        ) / 100
    );
}

function getToday() {
    const now =
        new Date();

    return [
        now.getFullYear(),
        String(
            now.getMonth() +
            1,
        ).padStart(
            2,
            "0",
        ),
        String(
            now.getDate(),
        ).padStart(
            2,
            "0",
        ),
    ].join("-");
}