import {
    useMemo,
    useState,
} from "react";

import {
    ArrowLeft,
    RotateCcw,
} from "lucide-react";

import {
    Navigate,
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import {
    useSupplierBill,
} from "../data/useSupplierBills";

import {
    supplierCreditRepository,
} from "../data/supplierCreditRepository";

interface CreditLineState {
    supplierBillLineId: string;
    selected: boolean;
    quantity: string;
    unitCost: string;
}

export function CreateSupplierCreditPage() {
    const navigate =
        useNavigate();

    const [
        searchParams,
    ] =
        useSearchParams();

    const billId =
        searchParams.get(
            "billId",
        ) ??
        undefined;

    const bill =
        useSupplierBill(
            billId,
        );

    const [
        supplierCreditNumber,
        setSupplierCreditNumber,
    ] =
        useState("");

    const [
        creditDate,
        setCreditDate,
    ] =
        useState(
            getToday(),
        );

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

    const [
        submitting,
        setSubmitting,
    ] =
        useState(false);

    const [
        lines,
        setLines,
    ] =
        useState<
            CreditLineState[]
        >(() =>
            bill
                ? bill.lines.map(
                    (
                        line,
                    ) => ({
                        supplierBillLineId:
                            line.id,

                        selected:
                            false,

                        quantity:
                            String(
                                line.quantity,
                            ),

                        unitCost:
                            String(
                                line.unitCost,
                            ),
                    }),
                )
                : [],
        );

    const preview =
        useMemo(
            () => {
                if (!bill) {
                    return {
                        subtotal:
                            0,
                        taxAmount:
                            0,
                        total:
                            0,
                    };
                }

                let subtotal =
                    0;

                for (
                    const state of lines
                ) {
                    if (
                        !state.selected
                    ) {
                        continue;
                    }

                    const quantity =
                        Number(
                            state.quantity,
                        );

                    const unitCost =
                        Number(
                            state.unitCost,
                        );

                    if (
                        !Number.isFinite(
                            quantity,
                        ) ||
                        !Number.isFinite(
                            unitCost,
                        ) ||
                        quantity <=
                        0 ||
                        unitCost <
                        0
                    ) {
                        continue;
                    }

                    subtotal +=
                        quantity *
                        unitCost;
                }

                subtotal =
                    roundCurrency(
                        subtotal,
                    );

                const taxAmount =
                    roundCurrency(
                        subtotal *
                        0.1,
                    );

                return {
                    subtotal,
                    taxAmount,
                    total:
                        roundCurrency(
                            subtotal +
                            taxAmount,
                        ),
                };
            },
            [
                bill,
                lines,
            ],
        );

    if (!bill) {
        return (
            <Navigate
                to="/purchases"
                replace
            />
        );
    }

    if (
        bill.status ===
        "VOID"
    ) {
        return (
            <Navigate
                to={`/purchases/bills/${bill.id}`}
                replace
            />
        );
    }

    const resolvedBillId = bill.id;

    function updateLine(
        lineId: string,
        patch:
            Partial<CreditLineState>,
    ) {
        setLines(
            (
                current,
            ) =>
                current.map(
                    (
                        line,
                    ) =>
                        line
                            .supplierBillLineId ===
                            lineId
                            ? {
                                ...line,
                                ...patch,
                            }
                            : line,
                ),
        );
    }

    function selectAll() {
        setLines(
            (
                current,
            ) =>
                current.map(
                    (
                        line,
                    ) => ({
                        ...line,
                        selected:
                            true,
                    }),
                ),
        );
    }

    function clearAll() {
        setLines(
            (
                current,
            ) =>
                current.map(
                    (
                        line,
                    ) => ({
                        ...line,
                        selected:
                            false,
                    }),
                ),
        );
    }

    function handleSubmit() {
        setError(
            null,
        );

        const selectedLines =
            lines.filter(
                (
                    line,
                ) =>
                    line.selected,
            );

        if (
            selectedLines.length ===
            0
        ) {
            setError(
                "Select at least one bill line to credit.",
            );

            return;
        }

        try {
            setSubmitting(
                true,
            );

            const credit =
                supplierCreditRepository.create(
                    {
                        sourceSupplierBillId:
                            resolvedBillId,

                        supplierCreditNumber,

                        creditDate,

                        reason,

                        lines:
                            selectedLines.map(
                                (
                                    line,
                                ) => ({
                                    supplierBillLineId:
                                        line.supplierBillLineId,

                                    quantity:
                                        Number(
                                            line.quantity,
                                        ),

                                    unitCost:
                                        Number(
                                            line.unitCost,
                                        ),
                                }),
                            ),
                    },
                );

            navigate(
                `/purchases/credits/${credit.id}`,
            );
        } catch (
        caught
        ) {
            setError(
                caught instanceof
                    Error
                    ? caught.message
                    : "Unable to create supplier credit.",
            );

            setSubmitting(
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
                        `/purchases/bills/${bill.id}`,
                    )
                }
                className="mb-5 flex items-center gap-2 text-xs text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
            >
                <ArrowLeft
                    size={
                        14
                    }
                />

                Back to{" "}
                {
                    bill.billNumber
                }
            </button>

            <div className="mb-7 flex items-start justify-between gap-5">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        Accounts
                        Payable
                    </p>

                    <h1 className="font-display text-[34px] leading-tight">
                        Create
                        Supplier
                        Credit
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Issue a
                        supplier
                        credit
                        against{" "}
                        {
                            bill.billNumber
                        }
                        .
                    </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                    <RotateCcw
                        size={
                            21
                        }
                    />
                </div>
            </div>

            {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {
                        error
                    }
                </div>
            )}

            <div className="mb-5 grid grid-cols-4 gap-4">
                <Summary
                    label="Supplier"
                    value={
                        bill.supplierName
                    }
                />

                <Summary
                    label="Source Bill"
                    value={
                        bill.billNumber
                    }
                />

                <Summary
                    label="Supplier Invoice"
                    value={
                        bill.supplierInvoiceNumber
                    }
                />

                <Summary
                    label="Bill Total"
                    value={formatMoney(
                        bill.totals
                            .total,
                    )}
                />
            </div>

            <div className="mb-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
                <h2 className="font-display text-xl">
                    Credit
                    Details
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-4">
                    <Field
                        label="Supplier Credit Number"
                        required
                    >
                        <input
                            value={
                                supplierCreditNumber
                            }
                            onChange={(
                                event,
                            ) =>
                                setSupplierCreditNumber(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            placeholder="e.g. SCN-10482"
                            className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                        />
                    </Field>

                    <Field
                        label="Credit Date"
                        required
                    >
                        <input
                            type="date"
                            value={
                                creditDate
                            }
                            min={
                                bill.billDate
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
                            className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                        />
                    </Field>
                </div>

                <div className="mt-4">
                    <Field
                        label="Reason"
                        required
                    >
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
                            rows={
                                3
                            }
                            placeholder="Reason for supplier credit"
                            className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                        />
                    </Field>
                </div>
            </div>

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                    <div>
                        <h2 className="font-display text-xl">
                            Credit
                            Lines
                        </h2>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            Select
                            the
                            original
                            bill
                            lines
                            included
                            in this
                            supplier
                            credit.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={
                                clearAll
                            }
                            className="h-8 rounded-lg border border-[var(--color-border)] bg-white px-3 text-xs font-semibold text-[var(--color-text-secondary)]"
                        >
                            Clear
                        </button>

                        <button
                            type="button"
                            onClick={
                                selectAll
                            }
                            className="h-8 rounded-lg border border-[var(--color-border)] bg-white px-3 text-xs font-semibold text-[var(--color-primary)]"
                        >
                            Select
                            All
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                                <Header>
                                    Credit
                                </Header>

                                <Header>
                                    Product
                                </Header>

                                <Header>
                                    Unit
                                </Header>

                                <Header align="right">
                                    Original
                                    Qty
                                </Header>

                                <Header align="right">
                                    Credit
                                    Qty
                                </Header>

                                <Header align="right">
                                    Unit
                                    Cost
                                </Header>

                                <Header align="right">
                                    Total
                                </Header>
                            </tr>
                        </thead>

                        <tbody>
                            {bill.lines.map(
                                (
                                    billLine,
                                ) => {
                                    const state =
                                        lines.find(
                                            (
                                                line,
                                            ) =>
                                                line
                                                    .supplierBillLineId ===
                                                billLine.id,
                                        );

                                    if (
                                        !state
                                    ) {
                                        return null;
                                    }

                                    const quantity =
                                        Number(
                                            state.quantity,
                                        );

                                    const unitCost =
                                        Number(
                                            state.unitCost,
                                        );

                                    const lineTotal =
                                        state.selected &&
                                            Number.isFinite(
                                                quantity,
                                            ) &&
                                            Number.isFinite(
                                                unitCost,
                                            )
                                            ? roundCurrency(
                                                quantity *
                                                unitCost *
                                                1.1,
                                            )
                                            : 0;

                                    return (
                                        <tr
                                            key={
                                                billLine.id
                                            }
                                            className="border-b border-[var(--color-border)] last:border-b-0"
                                        >
                                            <td className="px-4 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        state.selected
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        updateLine(
                                                            billLine.id,
                                                            {
                                                                selected:
                                                                    event
                                                                        .target
                                                                        .checked,
                                                            },
                                                        )
                                                    }
                                                    className="h-4 w-4"
                                                />
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="text-sm font-semibold">
                                                    {
                                                        billLine.description
                                                    }
                                                </div>

                                                <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                                    {
                                                        billLine.sku
                                                    }
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 text-sm">
                                                {
                                                    billLine.unitSymbol
                                                }
                                            </td>

                                            <td className="px-4 py-4 text-right text-sm">
                                                {formatQuantity(
                                                    billLine.quantity,
                                                )}
                                            </td>

                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.0001"
                                                    disabled={
                                                        !state.selected
                                                    }
                                                    value={
                                                        state.quantity
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        updateLine(
                                                            billLine.id,
                                                            {
                                                                quantity:
                                                                    event
                                                                        .target
                                                                        .value,
                                                            },
                                                        )
                                                    }
                                                    className="ml-auto block h-9 w-28 rounded-lg border border-[var(--color-border)] bg-white px-2 text-right text-sm disabled:bg-[var(--color-surface-muted)]"
                                                />
                                            </td>

                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    disabled={
                                                        !state.selected
                                                    }
                                                    value={
                                                        state.unitCost
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        updateLine(
                                                            billLine.id,
                                                            {
                                                                unitCost:
                                                                    event
                                                                        .target
                                                                        .value,
                                                            },
                                                        )
                                                    }
                                                    className="ml-auto block h-9 w-28 rounded-lg border border-[var(--color-border)] bg-white px-2 text-right text-sm disabled:bg-[var(--color-surface-muted)]"
                                                />
                                            </td>

                                            <td className="money px-4 py-4 text-right text-sm font-semibold">
                                                {formatMoney(
                                                    lineTotal,
                                                )}
                                            </td>
                                        </tr>
                                    );
                                },
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-5 flex justify-end">
                <div className="w-[360px] rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
                    <MoneyRow
                        label="Subtotal"
                        value={
                            preview.subtotal
                        }
                    />

                    <MoneyRow
                        label="GST"
                        value={
                            preview.taxAmount
                        }
                    />

                    <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                        <MoneyRow
                            label="Credit Total"
                            value={
                                preview.total
                            }
                            strong
                        />
                    </div>

                    <button
                        type="button"
                        disabled={
                            submitting
                        }
                        onClick={
                            handleSubmit
                        }
                        className="mt-5 h-10 w-full rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting
                            ? "Issuing..."
                            : "Issue Supplier Credit"}
                    </button>
                </div>
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
    children:
    React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">
                {label}

                {required && (
                    <span className="text-red-600">
                        {" "}
                        *
                    </span>
                )}
            </span>

            {children}
        </label>
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
        <div className="rounded-xl border border-[var(--color-border)] bg-white px-5 py-4">
            <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                {label}
            </div>

            <div className="mt-2 text-sm font-semibold">
                {value}
            </div>
        </div>
    );
}

function Header({
    children,
    align = "left",
}: {
    children:
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

function MoneyRow({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: number;
    strong?: boolean;
}) {
    return (
        <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-[var(--color-text-secondary)]">
                {label}
            </span>

            <span
                className={[
                    "money text-sm",
                    strong
                        ? "font-display text-xl font-semibold"
                        : "font-semibold",
                ].join(" ")}
            >
                {formatMoney(
                    value,
                )}
            </span>
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

function formatQuantity(
    value: number,
) {
    return value.toLocaleString(
        "en-AU",
        {
            maximumFractionDigits:
                4,
        },
    );
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