import {
    useMemo,
    useState,
    type ReactNode,
} from "react";

import {
    AlertCircle,
    Plus,
    Trash2,
    X,
} from "lucide-react";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

import { mockProducts } from "../../inventory/data/mockProducts";

import { customerPricingRepository } from "../../contacts/data/customerPricingRepository";

import {
    calculateDocumentTotals,
    calculateSalesLine,
} from "../data/salesCalculations";

import { salesRepository } from "../data/salesRepository";

import type {
    Quote,
    QuoteLineUpdateDraft,
    SalesDocumentLine,
    SalesPriceSource,
} from "../types/salesDocument";

interface QuoteEditFormProps {
    quote: Quote;
    customerName: string;

    onCancel: () => void;
    onSaved: () => void;
}

interface EditLine {
    editorId: string;
    originalLineId?: string;

    productId: string;
    unitId: string;

    quantity: string;

    standardUnitPrice: number;
    unitPrice: string;

    priceSource: SalesPriceSource;
    customerPriceId?: string;
}

export function QuoteEditForm({
    quote,
    customerName,
    onCancel,
    onSaved,
}: QuoteEditFormProps) {
    const [
        documentDate,
        setDocumentDate,
    ] = useState(
        quote.documentDate,
    );

    const [
        expiryDate,
        setExpiryDate,
    ] = useState(
        quote.expiryDate ?? "",
    );

    const [
        customerReference,
        setCustomerReference,
    ] = useState(
        quote.customerReference ??
        "",
    );

    const [notes, setNotes] =
        useState(
            quote.notes ?? "",
        );

    const [lines, setLines] =
        useState<EditLine[]>(
            quote.lines.map(
                lineToEditor,
            ),
        );

    const [error, setError] =
        useState<string | null>(
            null,
        );

    const [saving, setSaving] =
        useState(false);

    const calculatedLines =
        useMemo(
            () =>
                lines.map(
                    calculateEditLine,
                ),
            [lines],
        );

    const totals =
        useMemo(
            () =>
                calculateDocumentTotals(
                    calculatedLines,
                ),
            [calculatedLines],
        );

    function updateLine(
        editorId: string,
        updater: (
            line: EditLine,
        ) => EditLine,
    ) {
        setLines((current) =>
            current.map((line) =>
                line.editorId ===
                    editorId
                    ? updater(
                        line,
                    )
                    : line,
            ),
        );

        setError(null);
    }

    function changeProduct(
        editorId: string,
        productId: string,
    ) {
        const product =
            mockProducts.find(
                (item) =>
                    item.id ===
                    productId,
            );

        const unit =
            product?.units.find(
                (item) =>
                    item.active &&
                    item.id ===
                    product.baseUnitId,
            ) ??
            product?.units.find(
                (item) =>
                    item.active,
            );

        if (
            !product ||
            !unit
        ) {
            updateLine(
                editorId,
                (line) => ({
                    ...line,
                    productId,
                    unitId: "",
                    standardUnitPrice:
                        0,
                    unitPrice: "0",
                    priceSource:
                        "STANDARD_PRICE",
                    customerPriceId:
                        undefined,
                }),
            );

            return;
        }

        const pricing =
            customerPricingRepository.resolvePrice(
                quote.customerId,
                product.id,
                unit.id,
                documentDate,
            );

        updateLine(
            editorId,
            (line) => ({
                ...line,

                productId:
                    product.id,

                unitId:
                    unit.id,

                standardUnitPrice:
                    pricing.basePrice,

                unitPrice:
                    String(
                        pricing.effectivePrice,
                    ),

                priceSource:
                    pricing.source,

                customerPriceId:
                    pricing.customerPrice
                        ?.id,
            }),
        );
    }

    function changeUnit(
        editorId: string,
        unitId: string,
    ) {
        const line =
            lines.find(
                (item) =>
                    item.editorId ===
                    editorId,
            );

        if (
            !line ||
            !line.productId ||
            !unitId
        ) {
            return;
        }

        const pricing =
            customerPricingRepository.resolvePrice(
                quote.customerId,
                line.productId,
                unitId,
                documentDate,
            );

        updateLine(
            editorId,
            (current) => ({
                ...current,

                unitId,

                standardUnitPrice:
                    pricing.basePrice,

                unitPrice:
                    String(
                        pricing.effectivePrice,
                    ),

                priceSource:
                    pricing.source,

                customerPriceId:
                    pricing.customerPrice
                        ?.id,
            }),
        );
    }

    function addLine() {
        setLines((current) => [
            ...current,
            {
                editorId:
                    crypto.randomUUID(),

                productId: "",
                unitId: "",

                quantity: "1",

                standardUnitPrice:
                    0,

                unitPrice: "0",

                priceSource:
                    "STANDARD_PRICE",
            },
        ]);
    }

    function removeLine(
        editorId: string,
    ) {
        setLines((current) =>
            current.filter(
                (line) =>
                    line.editorId !==
                    editorId,
            ),
        );
    }

    function handleSave() {
        setError(null);

        try {
            if (
                lines.length ===
                0
            ) {
                throw new Error(
                    "At least one quote line is required.",
                );
            }

            const updateLines:
                QuoteLineUpdateDraft[] =
                lines.map(
                    (line) => {
                        const quantity =
                            Number(
                                line.quantity,
                            );

                        const unitPrice =
                            Number(
                                line.unitPrice,
                            );

                        if (
                            !line.productId ||
                            !line.unitId
                        ) {
                            throw new Error(
                                "Select a product and unit for every quote line.",
                            );
                        }

                        if (
                            !Number.isFinite(
                                quantity,
                            ) ||
                            quantity <= 0
                        ) {
                            throw new Error(
                                "Quantity must be greater than zero.",
                            );
                        }

                        if (
                            !Number.isFinite(
                                unitPrice,
                            ) ||
                            unitPrice < 0
                        ) {
                            throw new Error(
                                "Unit price must be zero or greater.",
                            );
                        }

                        return {
                            lineId:
                                line.originalLineId,

                            productId:
                                line.productId,

                            unitId:
                                line.unitId,

                            quantity,

                            standardUnitPrice:
                                line.standardUnitPrice,

                            unitPrice,

                            priceSource:
                                line.priceSource,

                            customerPriceId:
                                line.customerPriceId,
                        };
                    },
                );

            setSaving(true);

            salesRepository.updateDraftQuote(
                quote.id,
                {
                    documentDate,

                    expiryDate:
                        expiryDate ||
                        undefined,

                    customerReference:
                        customerReference ||
                        undefined,

                    notes:
                        notes ||
                        undefined,

                    lines:
                        updateLines,
                },
            );

            onSaved();
        } catch (saveError) {
            setError(
                saveError instanceof
                    Error
                    ? saveError.message
                    : "Unable to update quote.",
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="mx-auto w-full max-w-[1600px]">
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="flex items-start justify-between border-b border-[var(--color-border)] px-6 py-5">
                    <div>
                        <div className="font-mono text-xs font-semibold text-[var(--color-accent)]">
                            {
                                quote.documentNumber
                            }
                        </div>

                        <h1 className="mt-2 font-display text-2xl">
                            Edit Quote
                        </h1>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            {
                                customerName
                            }
                        </p>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={
                            onCancel
                        }
                    >
                        <X
                            size={17}
                        />
                    </Button>
                </div>

                <div className="space-y-6 p-6">
                    {error && (
                        <div className="flex items-center gap-3 rounded-lg border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 px-4 py-3 text-xs text-[var(--color-danger)]">
                            <AlertCircle
                                size={
                                    16
                                }
                            />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-4 gap-4">
                        <Field label="Customer">
                            <Input
                                value={
                                    customerName
                                }
                                disabled
                            />
                        </Field>

                        <Field label="Document Date">
                            <Input
                                type="date"
                                value={
                                    documentDate
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setDocumentDate(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                            />
                        </Field>

                        <Field label="Expiry Date">
                            <Input
                                type="date"
                                value={
                                    expiryDate
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setExpiryDate(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                            />
                        </Field>

                        <Field label="Customer Reference">
                            <Input
                                value={
                                    customerReference
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setCustomerReference(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                            />
                        </Field>
                    </div>

                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Quote Lines
                                </h2>

                                <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                                    Existing
                                    prices remain
                                    unchanged
                                    unless you
                                    change the
                                    product, unit
                                    or unit price.
                                </p>
                            </div>

                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={
                                    addLine
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

                        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                            <div className="min-w-[1100px]">
                                <div className="grid grid-cols-[260px_150px_110px_140px_140px_120px_52px] gap-3 border-b border-[var(--color-border)] bg-[var(--color-background-subtle)] px-4 py-3 text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                                    <div>
                                        Product
                                    </div>
                                    <div>
                                        Unit
                                    </div>
                                    <div>
                                        Qty
                                    </div>
                                    <div>
                                        Standard
                                    </div>
                                    <div>
                                        Unit Price
                                    </div>
                                    <div>
                                        Source
                                    </div>
                                    <div />
                                </div>

                                {lines.map(
                                    (
                                        line,
                                    ) => (
                                        <EditLineRow
                                            key={
                                                line.editorId
                                            }
                                            line={
                                                line
                                            }
                                            onProductChange={(
                                                value,
                                            ) =>
                                                changeProduct(
                                                    line.editorId,
                                                    value,
                                                )
                                            }
                                            onUnitChange={(
                                                value,
                                            ) =>
                                                changeUnit(
                                                    line.editorId,
                                                    value,
                                                )
                                            }
                                            onQuantityChange={(
                                                value,
                                            ) =>
                                                updateLine(
                                                    line.editorId,
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,
                                                        quantity:
                                                            value,
                                                    }),
                                                )
                                            }
                                            onPriceChange={(
                                                value,
                                            ) =>
                                                updateLine(
                                                    line.editorId,
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,
                                                        unitPrice:
                                                            value,
                                                        priceSource:
                                                            "MANUAL",
                                                        customerPriceId:
                                                            undefined,
                                                    }),
                                                )
                                            }
                                            onRemove={() =>
                                                removeLine(
                                                    line.editorId,
                                                )
                                            }
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-[1fr_360px] gap-6">
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
                                rows={5}
                                className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                            />
                        </Field>

                        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background-subtle)] p-5">
                            <h2 className="text-sm font-semibold">
                                Quote Total
                            </h2>

                            <div className="mt-4 space-y-3">
                                <TotalRow
                                    label="Subtotal"
                                    value={formatMoney(
                                        totals.subtotal,
                                    )}
                                />

                                <TotalRow
                                    label="GST"
                                    value={formatMoney(
                                        totals.taxAmount,
                                    )}
                                />

                                <div className="border-t border-[var(--color-border)] pt-3">
                                    <TotalRow
                                        label="Total"
                                        value={formatMoney(
                                            totals.total,
                                        )}
                                        strong
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
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
                        onClick={
                            handleSave
                        }
                        disabled={
                            saving
                        }
                    >
                        {saving
                            ? "Saving..."
                            : "Save Changes"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function EditLineRow({
    line,
    onProductChange,
    onUnitChange,
    onQuantityChange,
    onPriceChange,
    onRemove,
}: {
    line: EditLine;
    onProductChange: (
        value: string,
    ) => void;
    onUnitChange: (
        value: string,
    ) => void;
    onQuantityChange: (
        value: string,
    ) => void;
    onPriceChange: (
        value: string,
    ) => void;
    onRemove: () => void;
}) {
    const product =
        mockProducts.find(
            (item) =>
                item.id ===
                line.productId,
        );

    const units =
        product?.units.filter(
            (unit) =>
                unit.active,
        ) ?? [];

    return (
        <div className="grid grid-cols-[260px_150px_110px_140px_140px_120px_52px] items-center gap-3 border-b border-[var(--color-border)] px-4 py-3 last:border-b-0">
            <select
                value={
                    line.productId
                }
                onChange={(event) =>
                    onProductChange(
                        event.target
                            .value,
                    )
                }
                className={
                    selectClassName
                }
            >
                <option value="">
                    Select product
                </option>

                {mockProducts
                    .filter(
                        (product) =>
                            product.status ===
                            "ACTIVE",
                    )
                    .map(
                        (product) => (
                            <option
                                key={
                                    product.id
                                }
                                value={
                                    product.id
                                }
                            >
                                {
                                    product.sku
                                }{" "}
                                —{" "}
                                {
                                    product.name
                                }
                            </option>
                        ),
                    )}
            </select>

            <select
                value={
                    line.unitId
                }
                onChange={(event) =>
                    onUnitChange(
                        event.target
                            .value,
                    )
                }
                className={
                    selectClassName
                }
            >
                {units.map(
                    (unit) => (
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

            <Input
                type="number"
                min="0"
                step="0.01"
                value={
                    line.quantity
                }
                onChange={(event) =>
                    onQuantityChange(
                        event.target
                            .value,
                    )
                }
            />

            <div className="money text-sm text-[var(--color-text-secondary)]">
                {formatMoney(
                    line.standardUnitPrice,
                )}
            </div>

            <Input
                type="number"
                min="0"
                step="0.01"
                value={
                    line.unitPrice
                }
                onChange={(event) =>
                    onPriceChange(
                        event.target
                            .value,
                    )
                }
                className="money"
            />

            <span className="text-xs text-[var(--color-text-secondary)]">
                {formatSource(
                    line.priceSource,
                )}
            </span>

            <button
                type="button"
                onClick={
                    onRemove
                }
                className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)]"
            >
                <Trash2
                    size={15}
                />
            </button>
        </div>
    );
}

function lineToEditor(
    line: SalesDocumentLine,
): EditLine {
    return {
        editorId:
            crypto.randomUUID(),

        originalLineId:
            line.id,

        productId:
            line.productId,

        unitId:
            line.unitId,

        quantity:
            String(
                line.quantity,
            ),

        standardUnitPrice:
            line.standardUnitPrice,

        unitPrice:
            String(
                line.unitPrice,
            ),

        priceSource:
            line.priceSource,

        customerPriceId:
            line.customerPriceId,
    };
}

function calculateEditLine(
    line: EditLine,
): SalesDocumentLine {
    const product =
        mockProducts.find(
            (item) =>
                item.id ===
                line.productId,
        );

    const unit =
        product?.units.find(
            (item) =>
                item.id ===
                line.unitId,
        );

    const quantity =
        Number(
            line.quantity,
        ) || 0;

    const unitPrice =
        Number(
            line.unitPrice,
        ) || 0;

    const calculated =
        calculateSalesLine({
            quantity,

            standardUnitPrice:
                line.standardUnitPrice,

            unitPrice,
        });

    return {
        id:
            line.originalLineId ??
            line.editorId,

        productId:
            line.productId,

        unitId:
            line.unitId,

        sku:
            product?.sku ??
            "",

        description:
            product?.name ??
            "",

        unitSymbol:
            unit?.symbol ??
            "",

        quantity,

        standardUnitPrice:
            line.standardUnitPrice,

        unitPrice,

        priceSource:
            line.priceSource,

        customerPriceId:
            line.customerPriceId,

        ...calculated,
    };
}

function Field({
    label,
    children,
}: {
    label: string;
    children:
    ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                {label}
            </span>

            {children}
        </label>
    );
}

function TotalRow({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div className="flex justify-between text-sm">
            <span>
                {label}
            </span>

            <span
                className={
                    strong
                        ? "money text-lg font-semibold"
                        : "money font-medium"
                }
            >
                {value}
            </span>
        </div>
    );
}

function formatSource(
    source: SalesPriceSource,
) {
    if (
        source ===
        "CUSTOMER_PRICE"
    ) {
        return "Customer";
    }

    if (
        source ===
        "STANDARD_PRICE"
    ) {
        return "Standard";
    }

    return "Manual";
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

const selectClassName =
    "h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]";