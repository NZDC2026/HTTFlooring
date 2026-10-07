import {
    useMemo,
    useState,
} from "react";

import {
    AlertCircle,
    Plus,
    Trash2,
} from "lucide-react";

import {
    Button,
} from "../../../components/ui/Button";

import {
    Input,
} from "../../../components/ui/Input";

import {
    mockProducts,
} from "../../inventory/data/mockProducts";

import {
    useSuppliers,
} from "../../contacts/data/useSuppliers";

import {
    calculatePurchaseOrderLine,
    roundPurchaseMoney,
} from "../data/purchaseOrderCalculations";

import type {
    PurchaseOrder,
    PurchaseOrderDraft,
} from "../types/purchaseOrder";

interface Props {
    purchaseOrder?: PurchaseOrder;

    onSave: (
        draft:
            PurchaseOrderDraft,
    ) => void;

    onCancel: () => void;
}

interface LineEditor {
    id: string;

    productId: string;
    unitId: string;

    orderedQuantity: string;
    unitCost: string;
}

export function PurchaseOrderForm({
    purchaseOrder,
    onSave,
    onCancel,
}: Props) {
    const suppliers =
        useSuppliers();

    const activeSuppliers =
        suppliers.filter(
            (supplier) =>
                supplier.status ===
                "ACTIVE" ||
                supplier.id ===
                purchaseOrder?.supplierId,
        );

    const [
        supplierId,
        setSupplierId,
    ] = useState(
        purchaseOrder?.supplierId ??
        "",
    );

    const [
        orderDate,
        setOrderDate,
    ] = useState(
        purchaseOrder?.orderDate ??
        getToday(),
    );

    const [
        expectedDeliveryDate,
        setExpectedDeliveryDate,
    ] = useState(
        purchaseOrder?.expectedDeliveryDate ??
        "",
    );

    const [
        supplierReference,
        setSupplierReference,
    ] = useState(
        purchaseOrder?.supplierReference ??
        "",
    );

    const [
        notes,
        setNotes,
    ] = useState(
        purchaseOrder?.notes ??
        "",
    );

    const [
        error,
        setError,
    ] = useState<
        string | null
    >(null);

    const [
        lines,
        setLines,
    ] = useState<
        LineEditor[]
    >(
        purchaseOrder
            ? purchaseOrder.lines.map(
                (
                    line,
                ) => ({
                    id:
                        line.id,

                    productId:
                        line.productId,

                    unitId:
                        line.unitId,

                    orderedQuantity:
                        String(
                            line.orderedQuantity,
                        ),

                    unitCost:
                        String(
                            line.unitCost,
                        ),
                }),
            )
            : [
                createEmptyLine(),
            ],
    );

    const previewLines =
        useMemo(
            () =>
                lines.map(
                    (
                        line,
                    ) => {
                        const product =
                            mockProducts.find(
                                (
                                    item,
                                ) =>
                                    item.id ===
                                    line.productId,
                            );

                        const unit =
                            product?.units.find(
                                (
                                    item,
                                ) =>
                                    item.id ===
                                    line.unitId,
                            );

                        const quantity =
                            Number(
                                line.orderedQuantity,
                            );

                        const unitCost =
                            Number(
                                line.unitCost,
                            );

                        const valid =
                            Boolean(
                                product &&
                                unit &&
                                Number.isFinite(
                                    quantity,
                                ) &&
                                quantity >
                                0 &&
                                Number.isFinite(
                                    unitCost,
                                ) &&
                                unitCost >=
                                0,
                            );

                        const calculated =
                            valid
                                ? calculatePurchaseOrderLine(
                                    {
                                        orderedQuantity:
                                            quantity,

                                        unitCost,
                                    },
                                )
                                : {
                                    lineSubtotal:
                                        0,

                                    taxAmount:
                                        0,

                                    lineTotal:
                                        0,
                                };

                        return {
                            editorId:
                                line.id,

                            product,
                            unit,

                            quantity,
                            unitCost,

                            valid,

                            ...calculated,
                        };
                    },
                ),
            [lines],
        );

    const totals =
        useMemo(
            () => {
                const subtotal =
                    roundPurchaseMoney(
                        previewLines.reduce(
                            (
                                total,
                                line,
                            ) =>
                                total +
                                line.lineSubtotal,
                            0,
                        ),
                    );

                const taxAmount =
                    roundPurchaseMoney(
                        previewLines.reduce(
                            (
                                total,
                                line,
                            ) =>
                                total +
                                line.taxAmount,
                            0,
                        ),
                    );

                return {
                    subtotal,
                    taxAmount,

                    total:
                        roundPurchaseMoney(
                            subtotal +
                            taxAmount,
                        ),
                };
            },
            [previewLines],
        );

    function updateLine(
        lineId: string,

        updater: (
            line:
                LineEditor,
        ) => LineEditor,
    ) {
        setLines(
            (
                current,
            ) =>
                current.map(
                    (
                        line,
                    ) =>
                        line.id ===
                            lineId
                            ? updater(
                                line,
                            )
                            : line,
                ),
        );

        setError(
            null,
        );
    }

    function handleProductChange(
        lineId: string,
        productId: string,
    ) {
        const product =
            mockProducts.find(
                (
                    item,
                ) =>
                    item.id ===
                    productId,
            );

        const defaultUnit =
            product?.units.find(
                (
                    unit,
                ) =>
                    unit.active &&
                    unit.id ===
                    product.baseUnitId,
            ) ??
            product?.units.find(
                (
                    unit,
                ) =>
                    unit.active,
            );

        updateLine(
            lineId,
            (
                line,
            ) => ({
                ...line,

                productId,

                unitId:
                    defaultUnit?.id ??
                    "",

                unitCost:
                    "",
            }),
        );
    }

    function removeLine(
        lineId: string,
    ) {
        if (
            lines.length ===
            1
        ) {
            setLines([
                createEmptyLine(),
            ]);

            return;
        }

        setLines(
            (
                current,
            ) =>
                current.filter(
                    (
                        line,
                    ) =>
                        line.id !==
                        lineId,
                ),
        );
    }

    function handleSave() {
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

        if (
            !orderDate
        ) {
            setError(
                "Order date is required.",
            );

            return;
        }

        if (
            expectedDeliveryDate &&
            expectedDeliveryDate <
            orderDate
        ) {
            setError(
                "Expected delivery date cannot be before the order date.",
            );

            return;
        }

        if (
            previewLines.length ===
            0 ||
            previewLines.some(
                (
                    line,
                ) =>
                    !line.valid,
            )
        ) {
            setError(
                "Complete every purchase order line with a product, unit, quantity and valid unit cost.",
            );

            return;
        }

        onSave({
            supplierId,

            orderDate,

            expectedDeliveryDate:
                expectedDeliveryDate ||
                undefined,

            supplierReference:
                supplierReference.trim() ||
                undefined,

            notes:
                notes.trim() ||
                undefined,

            lines:
                previewLines.map(
                    (
                        line,
                    ) => ({
                        productId:
                            line.product!
                                .id,

                        unitId:
                            line.unit!
                                .id,

                        orderedQuantity:
                            line.quantity,

                        unitCost:
                            line.unitCost,
                    }),
                ),
        });
    }

    return (
        <div className="space-y-5">
            {error && (
                <div className="flex items-start gap-3 rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
                    <AlertCircle
                        size={
                            17
                        }
                        className="mt-0.5 shrink-0"
                    />

                    {error}
                </div>
            )}

            <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
                <h2 className="font-display text-xl">
                    Purchase
                    Order Details
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-5">
                    <Field
                        label="Supplier"
                        required
                    >
                        <select
                            value={
                                supplierId
                            }
                            onChange={(
                                event,
                            ) => {
                                setSupplierId(
                                    event
                                        .target
                                        .value,
                                );

                                setError(
                                    null,
                                );
                            }}
                            className={
                                selectClassName
                            }
                        >
                            <option value="">
                                Select
                                supplier
                            </option>

                            {activeSuppliers.map(
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
                                            supplier.code
                                        }{" "}
                                        —{" "}
                                        {
                                            supplier.businessName
                                        }
                                    </option>
                                ),
                            )}
                        </select>
                    </Field>

                    <Field
                        label="Order Date"
                        required
                    >
                        <Input
                            type="date"
                            value={
                                orderDate
                            }
                            onChange={(
                                event,
                            ) =>
                                setOrderDate(
                                    event
                                        .target
                                        .value,
                                )
                            }
                        />
                    </Field>

                    <Field label="Expected Delivery">
                        <Input
                            type="date"
                            value={
                                expectedDeliveryDate
                            }
                            onChange={(
                                event,
                            ) =>
                                setExpectedDeliveryDate(
                                    event
                                        .target
                                        .value,
                                )
                            }
                        />
                    </Field>

                    <Field label="Supplier Reference">
                        <Input
                            value={
                                supplierReference
                            }
                            onChange={(
                                event,
                            ) =>
                                setSupplierReference(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            placeholder="Supplier quote or reference"
                        />
                    </Field>
                </div>
            </div>

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                    <div>
                        <h2 className="font-display text-xl">
                            Order
                            Lines
                        </h2>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            Enter the
                            supplier
                            cost
                            excluding
                            GST.
                        </p>
                    </div>

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                            setLines(
                                (
                                    current,
                                ) => [
                                        ...current,
                                        createEmptyLine(),
                                    ],
                            )
                        }
                    >
                        <Plus
                            size={
                                14
                            }
                        />
                        Add line
                    </Button>
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

                                <Header>
                                    Qty
                                </Header>

                                <Header>
                                    Unit
                                    Cost
                                </Header>

                                <Header align="right">
                                    Subtotal
                                </Header>

                                <Header align="right">
                                    GST
                                </Header>

                                <Header align="right">
                                    Total
                                </Header>

                                <Header>
                                    {""}
                                </Header>
                            </tr>
                        </thead>

                        <tbody>
                            {lines.map(
                                (
                                    line,
                                ) => {
                                    const product =
                                        mockProducts.find(
                                            (
                                                item,
                                            ) =>
                                                item.id ===
                                                line.productId,
                                        );

                                    const preview =
                                        previewLines.find(
                                            (
                                                item,
                                            ) =>
                                                item.editorId ===
                                                line.id,
                                        );

                                    return (
                                        <tr
                                            key={
                                                line.id
                                            }
                                            className="border-b border-[var(--color-border)] last:border-b-0"
                                        >
                                            <Cell className="min-w-[250px]">
                                                <select
                                                    value={
                                                        line.productId
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        handleProductChange(
                                                            line.id,
                                                            event
                                                                .target
                                                                .value,
                                                        )
                                                    }
                                                    className={
                                                        selectClassName
                                                    }
                                                >
                                                    <option value="">
                                                        Select
                                                        product
                                                    </option>

                                                    {mockProducts
                                                        .filter(
                                                            (
                                                                item,
                                                            ) =>
                                                                item.status ===
                                                                "ACTIVE",
                                                        )
                                                        .map(
                                                            (
                                                                item,
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    value={
                                                                        item.id
                                                                    }
                                                                >
                                                                    {
                                                                        item.sku
                                                                    }{" "}
                                                                    —{" "}
                                                                    {
                                                                        item.name
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                </select>
                                            </Cell>

                                            <Cell className="min-w-[130px]">
                                                <select
                                                    value={
                                                        line.unitId
                                                    }
                                                    disabled={
                                                        !product
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        updateLine(
                                                            line.id,
                                                            (
                                                                current,
                                                            ) => ({
                                                                ...current,

                                                                unitId:
                                                                    event
                                                                        .target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    className={
                                                        selectClassName
                                                    }
                                                >
                                                    <option value="">
                                                        Unit
                                                    </option>

                                                    {product?.units
                                                        .filter(
                                                            (
                                                                unit,
                                                            ) =>
                                                                unit.active,
                                                        )
                                                        .map(
                                                            (
                                                                unit,
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        unit.id
                                                                    }
                                                                    value={
                                                                        unit.id
                                                                    }
                                                                >
                                                                    {
                                                                        unit.name
                                                                    }{" "}
                                                                    (
                                                                    {
                                                                        unit.symbol
                                                                    }
                                                                    )
                                                                </option>
                                                            ),
                                                        )}
                                                </select>
                                            </Cell>

                                            <Cell className="w-[110px]">
                                                <Input
                                                    type="number"
                                                    min={
                                                        0
                                                    }
                                                    step="0.01"
                                                    value={
                                                        line.orderedQuantity
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        updateLine(
                                                            line.id,
                                                            (
                                                                current,
                                                            ) => ({
                                                                ...current,

                                                                orderedQuantity:
                                                                    event
                                                                        .target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                />
                                            </Cell>

                                            <Cell className="w-[130px]">
                                                <Input
                                                    type="number"
                                                    min={
                                                        0
                                                    }
                                                    step="0.01"
                                                    value={
                                                        line.unitCost
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        updateLine(
                                                            line.id,
                                                            (
                                                                current,
                                                            ) => ({
                                                                ...current,

                                                                unitCost:
                                                                    event
                                                                        .target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                />
                                            </Cell>

                                            <MoneyCell
                                                value={
                                                    preview?.lineSubtotal ??
                                                    0
                                                }
                                            />

                                            <MoneyCell
                                                value={
                                                    preview?.taxAmount ??
                                                    0
                                                }
                                            />

                                            <MoneyCell
                                                value={
                                                    preview?.lineTotal ??
                                                    0
                                                }
                                            />

                                            <Cell className="w-[55px]">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeLine(
                                                            line.id,
                                                        )
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-text-muted)] transition hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"
                                                >
                                                    <Trash2
                                                        size={
                                                            15
                                                        }
                                                    />
                                                </button>
                                            </Cell>
                                        </tr>
                                    );
                                },
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end border-t border-[var(--color-border)] px-5 py-5">
                    <div className="w-[300px] space-y-3">
                        <TotalRow
                            label="Subtotal"
                            value={
                                totals.subtotal
                            }
                        />

                        <TotalRow
                            label="GST"
                            value={
                                totals.taxAmount
                            }
                        />

                        <div className="border-t border-[var(--color-border)] pt-3">
                            <TotalRow
                                label="Total"
                                value={
                                    totals.total
                                }
                                strong
                            />
                        </div>
                    </div>
                </div>
            </div>

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
                        placeholder="Internal purchase order notes..."
                        className="min-h-[110px] w-full resize-y rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                    />
                </Field>
            </div>

            <div className="flex justify-end gap-3">
                <Button
                    variant="secondary"
                    onClick={
                        onCancel
                    }
                >
                    Cancel
                </Button>

                <Button
                    variant="accent"
                    onClick={
                        handleSave
                    }
                >
                    {purchaseOrder
                        ? "Save changes"
                        : "Create purchase order"}
                </Button>
            </div>
        </div>
    );
}

function createEmptyLine():
    LineEditor {
    return {
        id:
            crypto.randomUUID(),

        productId: "",
        unitId: "",

        orderedQuantity:
            "1",

        unitCost: "",
    };
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
                    <span className="ml-1 text-[var(--color-danger)]">
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
                "h-10 px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]",

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

function Cell({
    children,
    className = "",
}: {
    children:
    React.ReactNode;
    className?: string;
}) {
    return (
        <td
            className={`px-3 py-3 align-top ${className}`}
        >
            {children}
        </td>
    );
}

function MoneyCell({
    value,
}: {
    value: number;
}) {
    return (
        <td className="whitespace-nowrap px-3 py-3 text-right align-middle text-sm">
            {formatMoney(
                value,
            )}
        </td>
    );
}

function TotalRow({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: number;
    strong?: boolean;
}) {
    return (
        <div
            className={[
                "flex items-center justify-between",

                strong
                    ? "text-base font-semibold"
                    : "text-sm",
            ].join(" ")}
        >
            <span className="text-[var(--color-text-secondary)]">
                {label}
            </span>

            <span className="money">
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
    return value.toLocaleString(
        "en-AU",
        {
            style:
                "currency",

            currency:
                "AUD",
        },
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

const selectClassName =
    "h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--color-primary)] disabled:bg-[var(--color-surface-muted)]";