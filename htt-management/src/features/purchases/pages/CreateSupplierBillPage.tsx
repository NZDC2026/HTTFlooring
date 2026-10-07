import {
    useMemo,
    useState,
} from "react";

import {
    ArrowLeft,
    FileText,
} from "lucide-react";

import {
    Navigate,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    Button,
} from "../../../components/ui/Button";

import {
    Input,
} from "../../../components/ui/Input";

import {
    usePurchaseOrder,
} from "../data/usePurchaseOrders";

import {
    supplierBillRepository,
} from "../data/supplierBillRepository";

import {
    calculateSupplierBillLine,
} from "../utils/supplierBillCalculations";

import {
    PurchaseOrderStatusBadge,
} from "../components/PurchaseOrderStatusBadge";

export function CreateSupplierBillPage() {
    const navigate =
        useNavigate();

    const {
        purchaseOrderId,
    } = useParams();

    const purchaseOrder =
        usePurchaseOrder(
            purchaseOrderId,
        );

    const [
        supplierInvoiceNumber,
        setSupplierInvoiceNumber,
    ] = useState("");

    const [
        billDate,
        setBillDate,
    ] = useState(
        getToday(),
    );

    const [
        dueDate,
        setDueDate,
    ] = useState("");

    const [
        notes,
        setNotes,
    ] = useState("");

    const [
        quantities,
        setQuantities,
    ] = useState<
        Record<string, string>
    >({});

    const [
        unitCosts,
        setUnitCosts,
    ] = useState<
        Record<string, string>
    >({});

    const [
        error,
        setError,
    ] = useState<
        string | null
    >(null);

    const billableLines =
        useMemo(() => {
            if (!purchaseOrder) {
                return [];
            }

            return purchaseOrder.lines.filter(
                (line) =>
                    roundQuantity(
                        line.receivedQuantity -
                        line.billedQuantity,
                    ) > 0,
            );
        }, [purchaseOrder]);

    const preview =
        useMemo(() => {
            let subtotal = 0;
            let taxAmount = 0;
            let total = 0;

            for (
                const line of
                billableLines
            ) {
                const quantity =
                    Number(
                        quantities[
                        line.id
                        ] ?? 0,
                    );

                const unitCost =
                    Number(
                        unitCosts[
                        line.id
                        ] ??
                        line.unitCost,
                    );

                if (
                    !Number.isFinite(
                        quantity,
                    ) ||
                    quantity <= 0 ||
                    !Number.isFinite(
                        unitCost,
                    ) ||
                    unitCost < 0
                ) {
                    continue;
                }

                const calculated =
                    calculateSupplierBillLine(
                        {
                            quantity,
                            unitCost,
                        },
                    );

                subtotal +=
                    calculated.lineSubtotal;

                taxAmount +=
                    calculated.taxAmount;

                total +=
                    calculated.lineTotal;
            }

            return {
                subtotal:
                    roundMoney(
                        subtotal,
                    ),

                taxAmount:
                    roundMoney(
                        taxAmount,
                    ),

                total:
                    roundMoney(
                        total,
                    ),
            };
        }, [
            billableLines,
            quantities,
            unitCosts,
        ]);

    if (!purchaseOrder) {
        return (
            <Navigate
                to="/purchases"
                replace
            />
        );
    }

    if (
        ![
            "PARTIALLY_RECEIVED",
            "RECEIVED",
            "BILLED",
        ].includes(
            purchaseOrder.status,
        )
    ) {
        return (
            <Navigate
                to={`/purchases/${purchaseOrder.id}`}
                replace
            />
        );
    }

    const resolvedPurchaseOrderId =
        purchaseOrder.id;

    function setQuantity(
        lineId: string,
        value: string,
    ) {
        setQuantities(
            (current) => ({
                ...current,
                [lineId]:
                    value,
            }),
        );

        setError(null);
    }

    function setUnitCost(
        lineId: string,
        value: string,
    ) {
        setUnitCosts(
            (current) => ({
                ...current,
                [lineId]:
                    value,
            }),
        );

        setError(null);
    }

    function billAllAvailable() {
        const nextQuantities:
            Record<
                string,
                string
            > = {};

        const nextCosts:
            Record<
                string,
                string
            > = {};

        for (
            const line of
            billableLines
        ) {
            nextQuantities[
                line.id
            ] = String(
                roundQuantity(
                    line.receivedQuantity -
                    line.billedQuantity,
                ),
            );

            nextCosts[
                line.id
            ] = String(
                line.unitCost,
            );
        }

        setQuantities(
            nextQuantities,
        );

        setUnitCosts(
            (current) => ({
                ...nextCosts,
                ...current,
            }),
        );

        setError(null);
    }

    function handleBillDateChange(
        value: string,
    ) {
        setBillDate(value);

        if (
            !value ||
            !purchaseOrder
        ) {
            return;
        }

        setDueDate(
            addDays(
                value,
                30,
            ),
        );
    }

    function handleCreateBill() {
        setError(null);

        if (
            !supplierInvoiceNumber.trim()
        ) {
            setError(
                "Supplier invoice number is required.",
            );

            return;
        }

        if (!billDate) {
            setError(
                "Bill date is required.",
            );

            return;
        }

        if (!dueDate) {
            setError(
                "Due date is required.",
            );

            return;
        }

        const lines =
            billableLines
                .map(
                    (line) => ({
                        purchaseOrderLineId:
                            line.id,

                        quantity:
                            Number(
                                quantities[
                                line.id
                                ] ?? 0,
                            ),

                        unitCost:
                            Number(
                                unitCosts[
                                line.id
                                ] ??
                                line.unitCost,
                            ),
                    }),
                )
                .filter(
                    (line) =>
                        Number.isFinite(
                            line.quantity,
                        ) &&
                        line.quantity >
                        0,
                );

        if (
            lines.length ===
            0
        ) {
            setError(
                "Enter a bill quantity for at least one line.",
            );

            return;
        }

        for (
            const line of
            billableLines
        ) {
            const raw =
                quantities[
                line.id
                ];

            if (
                raw ===
                undefined ||
                raw.trim() ===
                ""
            ) {
                continue;
            }

            const quantity =
                Number(raw);

            const billable =
                roundQuantity(
                    line.receivedQuantity -
                    line.billedQuantity,
                );

            if (
                !Number.isFinite(
                    quantity,
                ) ||
                quantity < 0
            ) {
                setError(
                    `${line.description}: bill quantity is invalid.`,
                );

                return;
            }

            if (
                quantity >
                billable
            ) {
                setError(
                    `${line.description}: maximum billable quantity is ${billable} ${line.unitSymbol}.`,
                );

                return;
            }

            const unitCost =
                Number(
                    unitCosts[
                    line.id
                    ] ??
                    line.unitCost,
                );

            if (
                !Number.isFinite(
                    unitCost,
                ) ||
                unitCost < 0
            ) {
                setError(
                    `${line.description}: unit cost is invalid.`,
                );

                return;
            }
        }

        try {
            const bill =
                supplierBillRepository.create(
                    {
                        purchaseOrderId:
                            resolvedPurchaseOrderId,

                        supplierInvoiceNumber:
                            supplierInvoiceNumber.trim(),

                        billDate,

                        dueDate,

                        notes:
                            notes.trim() ||
                            undefined,

                        lines,
                    },
                );

            navigate(
                `/purchases/bills/${bill.id}`,
                {
                    replace:
                        true,
                },
            );
        } catch (caught) {
            setError(
                caught instanceof
                    Error
                    ? caught.message
                    : "Unable to create supplier bill.",
            );
        }
    }

    return (
        <div className="pb-8">
            <button
                type="button"
                onClick={() =>
                    navigate(
                        `/purchases/${purchaseOrder.id}`,
                    )
                }
                className="mb-5 flex items-center gap-2 text-xs text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
            >
                <ArrowLeft
                    size={14}
                />

                Back to purchase
                order
            </button>

            <div className="mb-7 flex items-start justify-between gap-5">
                <div>
                    <div className="mb-3 flex items-center gap-3">
                        <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                            {
                                purchaseOrder.purchaseOrderNumber
                            }
                        </span>

                        <PurchaseOrderStatusBadge
                            status={
                                purchaseOrder.status
                            }
                        />
                    </div>

                    <h1 className="font-display text-[34px] leading-tight">
                        Create Supplier Bill
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        {
                            purchaseOrder.supplierName
                        }
                    </p>
                </div>

                <Button
                    variant="secondary"
                    onClick={
                        billAllAvailable
                    }
                >
                    <FileText
                        size={15}
                    />

                    Bill all available
                </Button>
            </div>

            {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
                <h2 className="font-display text-xl">
                    Bill Details
                </h2>

                <div className="mt-5 grid grid-cols-3 gap-5">
                    <Field
                        label="Supplier Invoice Number"
                        required
                    >
                        <Input
                            value={
                                supplierInvoiceNumber
                            }
                            onChange={(
                                event,
                            ) =>
                                setSupplierInvoiceNumber(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            placeholder="e.g. INV-93821"
                        />
                    </Field>

                    <Field
                        label="Bill Date"
                        required
                    >
                        <Input
                            type="date"
                            value={
                                billDate
                            }
                            onChange={(
                                event,
                            ) =>
                                handleBillDateChange(
                                    event
                                        .target
                                        .value,
                                )
                            }
                        />
                    </Field>

                    <Field
                        label="Due Date"
                        required
                    >
                        <Input
                            type="date"
                            value={
                                dueDate
                            }
                            onChange={(
                                event,
                            ) =>
                                setDueDate(
                                    event
                                        .target
                                        .value,
                                )
                            }
                        />
                    </Field>
                </div>
            </div>

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="border-b border-[var(--color-border)] px-5 py-4">
                    <h2 className="font-display text-xl">
                        PO / Receipt Matching
                    </h2>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        Bills can only
                        be entered
                        against
                        quantities
                        already
                        received.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--color-border)] bg-[var(--color-background-subtle)]">
                                <Header>
                                    Product
                                </Header>

                                <Header>
                                    Unit
                                </Header>

                                <Header align="right">
                                    Ordered
                                </Header>

                                <Header align="right">
                                    Received
                                </Header>

                                <Header align="right">
                                    Already Billed
                                </Header>

                                <Header align="right">
                                    Billable
                                </Header>

                                <Header>
                                    Bill Now
                                </Header>

                                <Header>
                                    Unit Cost
                                </Header>

                                <Header align="right">
                                    Line Total
                                </Header>
                            </tr>
                        </thead>

                        <tbody>
                            {billableLines.map(
                                (line) => {
                                    const billable =
                                        roundQuantity(
                                            line.receivedQuantity -
                                            line.billedQuantity,
                                        );

                                    const quantity =
                                        Number(
                                            quantities[
                                            line.id
                                            ] ??
                                            0,
                                        );

                                    const unitCost =
                                        Number(
                                            unitCosts[
                                            line.id
                                            ] ??
                                            line.unitCost,
                                        );

                                    const lineTotal =
                                        Number.isFinite(
                                            quantity,
                                        ) &&
                                            quantity >
                                            0 &&
                                            Number.isFinite(
                                                unitCost,
                                            )
                                            ? calculateSupplierBillLine(
                                                {
                                                    quantity,
                                                    unitCost,
                                                },
                                            )
                                                .lineTotal
                                            : 0;

                                    return (
                                        <tr
                                            key={
                                                line.id
                                            }
                                            className="border-b border-[var(--color-border)] last:border-b-0"
                                        >
                                            <td className="min-w-[220px] px-4 py-4">
                                                <div className="font-medium">
                                                    {
                                                        line.description
                                                    }
                                                </div>

                                                <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                                    {
                                                        line.sku
                                                    }
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 text-sm">
                                                {
                                                    line.unitSymbol
                                                }
                                            </td>

                                            <NumberCell
                                                value={
                                                    line.orderedQuantity
                                                }
                                            />

                                            <NumberCell
                                                value={
                                                    line.receivedQuantity
                                                }
                                            />

                                            <NumberCell
                                                value={
                                                    line.billedQuantity
                                                }
                                            />

                                            <td className="px-4 py-4 text-right text-sm font-semibold">
                                                {
                                                    billable
                                                }
                                            </td>

                                            <td className="w-[150px] px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        min={
                                                            0
                                                        }
                                                        max={
                                                            billable
                                                        }
                                                        step="0.01"
                                                        value={
                                                            quantities[
                                                            line.id
                                                            ] ??
                                                            ""
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            setQuantity(
                                                                line.id,
                                                                event
                                                                    .target
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder="0"
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setQuantity(
                                                                line.id,
                                                                String(
                                                                    billable,
                                                                ),
                                                            )
                                                        }
                                                        className="text-[10px] font-semibold text-[var(--color-primary)] hover:underline"
                                                    >
                                                        All
                                                    </button>
                                                </div>
                                            </td>

                                            <td className="w-[150px] px-4 py-3">
                                                <Input
                                                    type="number"
                                                    min={
                                                        0
                                                    }
                                                    step="0.01"
                                                    value={
                                                        unitCosts[
                                                        line.id
                                                        ] ??
                                                        String(
                                                            line.unitCost,
                                                        )
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        setUnitCost(
                                                            line.id,
                                                            event
                                                                .target
                                                                .value,
                                                        )
                                                    }
                                                />
                                            </td>

                                            <td className="px-4 py-4 text-right text-sm font-semibold">
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

                {billableLines.length ===
                    0 && (
                        <div className="px-5 py-10 text-center text-sm text-[var(--color-text-muted)]">
                            There are no
                            received
                            quantities
                            available to
                            bill.
                        </div>
                    )}
            </div>

            <div className="mt-5 grid grid-cols-[1fr_360px] gap-5">
                <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
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
                            className="min-h-[120px] w-full resize-y rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                            placeholder="Supplier bill notes..."
                        />
                    </Field>
                </div>

                <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
                    <h2 className="font-display text-xl">
                        Bill Summary
                    </h2>

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
                            label="Total"
                            value={
                                preview.total
                            }
                            strong
                        />
                    </div>
                </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
                <Button
                    variant="secondary"
                    onClick={() =>
                        navigate(
                            `/purchases/${purchaseOrder.id}`,
                        )
                    }
                >
                    Cancel
                </Button>

                <Button
                    variant="accent"
                    disabled={
                        billableLines.length ===
                        0
                    }
                    onClick={
                        handleCreateBill
                    }
                >
                    <FileText
                        size={15}
                    />

                    Create Supplier Bill
                </Button>
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
            <div className="mb-1.5 text-xs font-medium">
                {label}

                {required && (
                    <span className="ml-1 text-red-600">
                        *
                    </span>
                )}
            </div>

            {children}
        </label>
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

function NumberCell({
    value,
}: {
    value: number;
}) {
    return (
        <td className="px-4 py-4 text-right text-sm">
            {value.toLocaleString(
                "en-AU",
                {
                    maximumFractionDigits:
                        4,
                },
            )}
        </td>
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
        <div className="mt-3 flex items-center justify-between">
            <span
                className={
                    strong
                        ? "font-semibold"
                        : "text-sm text-[var(--color-text-secondary)]"
                }
            >
                {label}
            </span>

            <span
                className={
                    strong
                        ? "font-display text-xl"
                        : "text-sm font-medium"
                }
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

function roundQuantity(
    value: number,
) {
    return (
        Math.round(
            (value +
                Number.EPSILON) *
            10000,
        ) / 10000
    );
}

function roundMoney(
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

function addDays(
    date: string,
    days: number,
) {
    const [
        year,
        month,
        day,
    ] = date
        .split("-")
        .map(Number);

    const result =
        new Date(
            year,
            month - 1,
            day,
        );

    result.setDate(
        result.getDate() +
        days,
    );

    return [
        result.getFullYear(),
        String(
            result.getMonth() +
            1,
        ).padStart(
            2,
            "0",
        ),
        String(
            result.getDate(),
        ).padStart(
            2,
            "0",
        ),
    ].join("-");
}