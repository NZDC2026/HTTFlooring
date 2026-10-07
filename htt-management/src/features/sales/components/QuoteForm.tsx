import {
    useMemo,
    useState,
    type ReactNode,
} from "react";

import {
    AlertCircle,
    Plus,
    RotateCcw,
    Trash2,
    X,
} from "lucide-react";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

import { mockProducts } from "../../inventory/data/mockProducts";

import { customerPricingRepository } from "../../contacts/data/customerPricingRepository";

import { calculateSalesLine } from "../data/salesCalculations";
import { salesRepository } from "../data/salesRepository";

import type {
    SalesLineDraft,
    SalesPriceSource,
} from "../types/salesDocument";

interface QuoteFormProps {
    customerId: string;
    customerName: string;
    onCancel: () => void;
    onSaved: () => void;
}

interface QuoteLineEditor {
    id: string;

    productId: string;
    unitId: string;

    quantity: string;
    unitPrice: string;

    priceSource?: SalesPriceSource;
    standardUnitPrice?: number;
    customerPriceId?: string;

    manualPrice: boolean;
}

interface PreviewLine {
    editorId: string;

    productId: string;
    unitId: string;

    productName: string;
    sku: string;
    unitSymbol: string;

    quantity: number;

    standardUnitPrice: number;
    unitPrice: number;

    priceSource: SalesPriceSource;

    discountAmount: number;
    discountPercent: number;

    lineSubtotal: number;
    taxAmount: number;
    lineTotal: number;
}

export function QuoteForm({
    customerId,
    customerName,
    onCancel,
    onSaved,
}: QuoteFormProps) {
    const [documentDate, setDocumentDate] =
        useState(getToday());

    const [expiryDate, setExpiryDate] =
        useState(
            addDays(
                getToday(),
                30,
            ),
        );

    const [
        customerReference,
        setCustomerReference,
    ] = useState("");

    const [notes, setNotes] =
        useState("");

    const [lines, setLines] =
        useState<QuoteLineEditor[]>([
            createEmptyLine(),
        ]);

    const [error, setError] =
        useState<string | null>(
            null,
        );

    const [saving, setSaving] =
        useState(false);

    const previewLines =
        useMemo(
            () =>
                lines
                    .map((line) =>
                        buildPreviewLine(
                            customerId,
                            documentDate,
                            line,
                        ),
                    )
                    .filter(
                        (
                            line,
                        ): line is PreviewLine =>
                            line !== null,
                    ),
            [
                lines,
                customerId,
                documentDate,
            ],
        );

    const totals =
        useMemo(() => {
            const subtotal =
                roundMoney(
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
                roundMoney(
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
                total: roundMoney(
                    subtotal +
                    taxAmount,
                ),
            };
        }, [previewLines]);

    function updateLine(
        lineId: string,
        updater: (
            line: QuoteLineEditor,
        ) => QuoteLineEditor,
    ) {
        setLines((current) =>
            current.map((line) =>
                line.id === lineId
                    ? updater(line)
                    : line,
            ),
        );

        setError(null);
    }

    function handleProductChange(
        lineId: string,
        productId: string,
    ) {
        const product =
            mockProducts.find(
                (item) =>
                    item.id ===
                    productId,
            );

        const defaultUnit =
            product?.units.find(
                (unit) =>
                    unit.active &&
                    unit.id ===
                    product.baseUnitId,
            ) ??
            product?.units.find(
                (unit) =>
                    unit.active,
            );

        updateLine(
            lineId,
            (line) => ({
                ...line,

                productId,

                unitId:
                    defaultUnit?.id ??
                    "",

                unitPrice: "",

                standardUnitPrice:
                    undefined,

                customerPriceId:
                    undefined,

                priceSource:
                    undefined,

                manualPrice: false,
            }),
        );
    }

    function handleUnitChange(
        lineId: string,
        unitId: string,
    ) {
        updateLine(
            lineId,
            (line) => ({
                ...line,

                unitId,

                unitPrice: "",

                standardUnitPrice:
                    undefined,

                customerPriceId:
                    undefined,

                priceSource:
                    undefined,

                manualPrice: false,
            }),
        );
    }

    function handleManualPriceChange(
        lineId: string,
        value: string,
    ) {
        updateLine(
            lineId,
            (line) => ({
                ...line,
                unitPrice: value,
                manualPrice: true,
                priceSource:
                    "MANUAL",
            }),
        );
    }

    function resetAutomaticPrice(
        lineId: string,
    ) {
        updateLine(
            lineId,
            (line) => ({
                ...line,
                unitPrice: "",
                manualPrice: false,
                priceSource:
                    undefined,
                customerPriceId:
                    undefined,
            }),
        );
    }

    function handleDocumentDateChange(
        value: string,
    ) {
        setDocumentDate(value);

        /*
         * Automatic pricing is resolved from
         * documentDate during preview/render.
         *
         * Manual price lines keep their manual
         * unitPrice and are therefore not
         * overwritten.
         */
        setError(null);
    }

    function addLine() {
        setLines((current) => [
            ...current,
            createEmptyLine(),
        ]);
    }

    function removeLine(
        lineId: string,
    ) {
        setLines((current) => {
            if (
                current.length === 1
            ) {
                return [
                    createEmptyLine(),
                ];
            }

            return current.filter(
                (line) =>
                    line.id !== lineId,
            );
        });

        setError(null);
    }

    function handleSave() {
        setError(null);

        if (!documentDate) {
            setError(
                "Document date is required.",
            );
            return;
        }

        if (
            expiryDate &&
            expiryDate <
            documentDate
        ) {
            setError(
                "Expiry date cannot be earlier than the document date.",
            );
            return;
        }

        const completedLines =
            lines.filter(
                (line) =>
                    line.productId ||
                    line.unitId ||
                    line.quantity.trim() ||
                    line.unitPrice.trim(),
            );

        if (
            completedLines.length ===
            0
        ) {
            setError(
                "Add at least one product to the quote.",
            );
            return;
        }

        try {
            const drafts: SalesLineDraft[] =
                completedLines.map(
                    (line) => {
                        if (
                            !line.productId
                        ) {
                            throw new Error(
                                "Select a product for every quote line.",
                            );
                        }

                        if (
                            !line.unitId
                        ) {
                            throw new Error(
                                "Select a selling unit for every quote line.",
                            );
                        }

                        const quantity =
                            Number(
                                line.quantity,
                            );

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
                            line.manualPrice
                        ) {
                            const manualPrice =
                                Number(
                                    line.unitPrice,
                                );

                            if (
                                !Number.isFinite(
                                    manualPrice,
                                ) ||
                                manualPrice <
                                0
                            ) {
                                throw new Error(
                                    "Manual unit price must be zero or greater.",
                                );
                            }

                            return {
                                productId:
                                    line.productId,

                                unitId:
                                    line.unitId,

                                quantity,

                                unitPrice:
                                    manualPrice,
                            };
                        }

                        return {
                            productId:
                                line.productId,

                            unitId:
                                line.unitId,

                            quantity,
                        };
                    },
                );

            setSaving(true);

            salesRepository.createQuote(
                {
                    customerId,

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

                    lines: drafts,
                },
            );

            onSaved();
        } catch (saveError) {
            setError(
                saveError instanceof
                    Error
                    ? saveError.message
                    : "Unable to save quote.",
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
            <div className="flex items-start justify-between gap-6 border-b border-[var(--color-border)] px-6 py-5">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="font-display text-xl">
                            New Quote
                        </h2>

                        <span className="rounded-full bg-[var(--color-primary-soft)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">
                            Draft
                        </span>
                    </div>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        Create a quote for{" "}
                        {customerName}.
                    </p>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onCancel}
                    aria-label="Close quote"
                >
                    <X size={17} />
                </Button>
            </div>

            <div className="space-y-6 p-6">
                {error && (
                    <div className="flex items-start gap-3 rounded-lg border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 px-4 py-3 text-xs text-[var(--color-danger)]">
                        <AlertCircle
                            size={16}
                            className="mt-0.5 shrink-0"
                        />

                        <span>
                            {error}
                        </span>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Field
                        label="Customer"
                    >
                        <Input
                            value={
                                customerName
                            }
                            disabled
                        />
                    </Field>

                    <Field
                        label="Document Date"
                        required
                    >
                        <Input
                            type="date"
                            value={
                                documentDate
                            }
                            onChange={(
                                event,
                            ) =>
                                handleDocumentDateChange(
                                    event
                                        .target
                                        .value,
                                )
                            }
                        />
                    </Field>

                    <Field
                        label="Expiry Date"
                    >
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

                    <Field
                        label="Customer Reference"
                    >
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
                            placeholder="PO / project / reference"
                        />
                    </Field>
                </div>

                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold">
                                Quote Lines
                            </h3>

                            <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                                Prices are
                                automatically
                                resolved using the
                                customer and document
                                date.
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
                                size={14}
                            />
                            Add line
                        </Button>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                        <div className="min-w-[1180px]">
                            <div className="grid grid-cols-[260px_130px_110px_145px_150px_120px_130px_52px] gap-3 border-b border-[var(--color-border)] bg-[var(--color-background-subtle)] px-4 py-3 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                                <div>
                                    Product
                                </div>
                                <div>
                                    Unit
                                </div>
                                <div>
                                    Quantity
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
                                <div className="text-right">
                                    Line Total
                                </div>
                                <div />
                            </div>

                            {lines.map(
                                (line) => (
                                    <QuoteLineRow
                                        key={
                                            line.id
                                        }
                                        line={
                                            line
                                        }
                                        customerId={
                                            customerId
                                        }
                                        documentDate={
                                            documentDate
                                        }
                                        onProductChange={(
                                            productId,
                                        ) =>
                                            handleProductChange(
                                                line.id,
                                                productId,
                                            )
                                        }
                                        onUnitChange={(
                                            unitId,
                                        ) =>
                                            handleUnitChange(
                                                line.id,
                                                unitId,
                                            )
                                        }
                                        onQuantityChange={(
                                            quantity,
                                        ) =>
                                            updateLine(
                                                line.id,
                                                (
                                                    current,
                                                ) => ({
                                                    ...current,
                                                    quantity,
                                                }),
                                            )
                                        }
                                        onManualPriceChange={(
                                            value,
                                        ) =>
                                            handleManualPriceChange(
                                                line.id,
                                                value,
                                            )
                                        }
                                        onResetPrice={() =>
                                            resetAutomaticPrice(
                                                line.id,
                                            )
                                        }
                                        onRemove={() =>
                                            removeLine(
                                                line.id,
                                            )
                                        }
                                    />
                                ),
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                    <Field label="Notes">
                        <textarea
                            value={notes}
                            onChange={(
                                event,
                            ) =>
                                setNotes(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            placeholder="Internal or customer-facing quote notes..."
                            rows={5}
                            className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                        />
                    </Field>

                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background-subtle)] p-5">
                        <h3 className="text-sm font-semibold">
                            Quote Total
                        </h3>

                        <div className="mt-4 space-y-3 text-sm">
                            <TotalRow
                                label="Subtotal"
                                value={formatMoney(
                                    totals.subtotal,
                                )}
                            />

                            <TotalRow
                                label="GST (10%)"
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

            <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border)] bg-[var(--color-background-subtle)] px-6 py-4">
                <Button
                    variant="secondary"
                    onClick={onCancel}
                    disabled={saving}
                >
                    Cancel
                </Button>

                <Button
                    onClick={
                        handleSave
                    }
                    disabled={saving}
                >
                    {saving
                        ? "Saving..."
                        : "Save Quote"}
                </Button>
            </div>
        </div>
    );
}

function QuoteLineRow({
    line,
    customerId,
    documentDate,
    onProductChange,
    onUnitChange,
    onQuantityChange,
    onManualPriceChange,
    onResetPrice,
    onRemove,
}: {
    line: QuoteLineEditor;

    customerId: string;
    documentDate: string;

    onProductChange: (
        productId: string,
    ) => void;

    onUnitChange: (
        unitId: string,
    ) => void;

    onQuantityChange: (
        quantity: string,
    ) => void;

    onManualPriceChange: (
        value: string,
    ) => void;

    onResetPrice: () => void;
    onRemove: () => void;
}) {
    const product =
        mockProducts.find(
            (item) =>
                item.id ===
                line.productId,
        );

    const activeUnits =
        product?.units.filter(
            (unit) =>
                unit.active,
        ) ?? [];

    const preview =
        buildPreviewLine(
            customerId,
            documentDate,
            line,
        );

    const automaticPrice =
        preview?.unitPrice;

    const displayedPrice =
        line.manualPrice
            ? line.unitPrice
            : automaticPrice !==
                undefined
                ? String(
                    automaticPrice,
                )
                : "";

    return (
        <div className="grid grid-cols-[260px_130px_110px_145px_150px_120px_130px_52px] items-center gap-3 border-b border-[var(--color-border)] px-4 py-3 last:border-b-0">
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
                className={selectClassName}
            >
                <option value="">
                    Select product
                </option>

                {mockProducts
                    .filter(
                        (item) =>
                            item.status ===
                            "ACTIVE",
                    )
                    .map(
                        (item) => (
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

            <select
                value={
                    line.unitId
                }
                disabled={
                    !product
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
                <option value="">
                    Unit
                </option>

                {activeUnits.map(
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
                placeholder="0"
            />

            <div>
                <div className="money text-sm">
                    {preview
                        ? formatMoney(
                            preview.standardUnitPrice,
                        )
                        : "—"}
                </div>

                <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                    ex GST
                </div>
            </div>

            <div>
                <div className="flex items-center gap-1.5">
                    <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                            displayedPrice
                        }
                        disabled={
                            !line.productId ||
                            !line.unitId
                        }
                        onChange={(
                            event,
                        ) =>
                            onManualPriceChange(
                                event
                                    .target
                                    .value,
                            )
                        }
                        className="money"
                    />

                    {line.manualPrice && (
                        <button
                            type="button"
                            onClick={
                                onResetPrice
                            }
                            title="Restore automatic price"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-primary)]"
                        >
                            <RotateCcw
                                size={
                                    14
                                }
                            />
                        </button>
                    )}
                </div>

                <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                    ex GST
                </div>
            </div>

            <PriceSource
                source={
                    preview?.priceSource
                }
            />

            <div className="money text-right text-sm font-semibold">
                {preview
                    ? formatMoney(
                        preview.lineTotal,
                    )
                    : "—"}

                {preview && (
                    <div className="mt-1 text-[10px] font-normal text-[var(--color-text-muted)]">
                        inc GST
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={onRemove}
                title="Remove line"
                className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-text-muted)] transition hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)]"
            >
                <Trash2
                    size={15}
                />
            </button>
        </div>
    );
}

function PriceSource({
    source,
}: {
    source:
    | SalesPriceSource
    | undefined;
}) {
    if (!source) {
        return (
            <span className="text-xs text-[var(--color-text-muted)]">
                —
            </span>
        );
    }

    const label =
        source ===
            "CUSTOMER_PRICE"
            ? "Customer"
            : source ===
                "STANDARD_PRICE"
                ? "Standard"
                : "Manual";

    return (
        <span
            className={[
                "inline-flex w-fit rounded-full px-2.5 py-1",
                "text-[10px] font-medium",
                source ===
                    "CUSTOMER_PRICE"
                    ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                    : source ===
                        "MANUAL"
                        ? "bg-[var(--color-warning)]/15 text-[var(--color-warning)]"
                        : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]",
            ].join(" ")}
        >
            {label}
        </span>
    );
}

function buildPreviewLine(
    customerId: string,
    documentDate: string,
    line: QuoteLineEditor,
): PreviewLine | null {
    if (
        !line.productId ||
        !line.unitId ||
        !documentDate
    ) {
        return null;
    }

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

    if (
        !product ||
        !unit
    ) {
        return null;
    }

    try {
        const resolved =
            customerPricingRepository.resolvePrice(
                customerId,
                product.id,
                unit.id,
                documentDate,
            );

        const quantityValue =
            Number(
                line.quantity,
            );

        const quantity =
            Number.isFinite(
                quantityValue,
            ) &&
                quantityValue > 0
                ? quantityValue
                : 0;

        let unitPrice =
            resolved.effectivePrice;

        let priceSource:
            SalesPriceSource =
            resolved.source;

        if (
            line.manualPrice
        ) {
            const manualPrice =
                Number(
                    line.unitPrice,
                );

            if (
                Number.isFinite(
                    manualPrice,
                ) &&
                manualPrice >= 0
            ) {
                unitPrice =
                    manualPrice;

                priceSource =
                    "MANUAL";
            }
        }

        const calculation =
            calculateSalesLine({
                quantity,

                standardUnitPrice:
                    resolved.basePrice,

                unitPrice,
            });

        return {
            editorId:
                line.id,

            productId:
                product.id,

            unitId:
                unit.id,

            productName:
                product.name,

            sku:
                product.sku,

            unitSymbol:
                unit.symbol,

            quantity,

            standardUnitPrice:
                resolved.basePrice,

            unitPrice,

            priceSource,

            discountAmount:
                calculation.discountAmount,

            discountPercent:
                calculation.discountPercent,

            lineSubtotal:
                calculation.lineSubtotal,

            taxAmount:
                calculation.taxAmount,

            lineTotal:
                calculation.lineTotal,
        };
    } catch {
        return null;
    }
}

function Field({
    label,
    required = false,
    children,
}: {
    label: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                {label}

                {required && (
                    <span className="ml-1 text-[var(--color-danger)]">
                        *
                    </span>
                )}
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
        <div className="flex items-center justify-between gap-6">
            <span
                className={
                    strong
                        ? "font-semibold"
                        : "text-[var(--color-text-secondary)]"
                }
            >
                {label}
            </span>

            <span
                className={[
                    "money",
                    strong
                        ? "text-lg font-semibold"
                        : "font-medium",
                ].join(" ")}
            >
                {value}
            </span>
        </div>
    );
}

function createEmptyLine():
    QuoteLineEditor {
    return {
        id: crypto.randomUUID(),

        productId: "",
        unitId: "",

        quantity: "1",
        unitPrice: "",

        manualPrice: false,
    };
}

function getToday() {
    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1,
        ).padStart(2, "0");

    const day =
        String(
            date.getDate(),
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function addDays(
    value: string,
    days: number,
) {
    const [
        year,
        month,
        day,
    ] = value
        .split("-")
        .map(Number);

    const date =
        new Date(
            year,
            month - 1,
            day,
        );

    date.setDate(
        date.getDate() +
        days,
    );

    const resultYear =
        date.getFullYear();

    const resultMonth =
        String(
            date.getMonth() + 1,
        ).padStart(2, "0");

    const resultDay =
        String(
            date.getDate(),
        ).padStart(2, "0");

    return `${resultYear}-${resultMonth}-${resultDay}`;
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

const selectClassName = [
    "h-10 w-full rounded-lg",
    "border border-[var(--color-border)]",
    "bg-white px-3",
    "text-sm text-[var(--color-text-primary)]",
    "outline-none transition",
    "hover:border-[var(--color-border-strong)]",
    "focus:border-[var(--color-primary)]",
    "focus:ring-2 focus:ring-[var(--color-primary-soft)]",
    "disabled:cursor-not-allowed",
    "disabled:bg-[var(--color-surface-muted)]",
    "disabled:opacity-70",
].join(" ");