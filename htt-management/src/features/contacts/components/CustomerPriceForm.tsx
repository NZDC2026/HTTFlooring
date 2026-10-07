import { useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";

import {
    Controller,
    useForm,
    useWatch,
} from "react-hook-form";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

import { FormField } from "./FormField";

import { mockProducts } from "../../inventory/data/mockProducts";

import {
    customerPriceFormSchema,
    customerPricingMethods,
    type CustomerPriceFormValues,
} from "../schemas/customerPricingSchemas";

import type { CustomerPrice } from "../types/customerPricing";

interface CustomerPriceFormProps {
    customerPrice?: CustomerPrice;

    onSubmit: (
        values: CustomerPriceFormValues,
    ) => void | Promise<void>;

    onCancel: () => void;
}

export function CustomerPriceForm({
    customerPrice,
    onSubmit,
    onCancel,
}: CustomerPriceFormProps) {
    const {
        register,
        control,
        handleSubmit,
        setValue,
        setError,

        formState: {
            errors,
            isSubmitting,
            isDirty,
        },
    } = useForm<CustomerPriceFormValues>({
        resolver: zodResolver(
            customerPriceFormSchema,
        ),

        defaultValues: {
            productId:
                customerPrice?.productId ?? "",

            unitId:
                customerPrice?.unitId ?? "",

            pricingMethod:
                customerPrice?.pricingMethod ??
                "FIXED_PRICE",

            fixedPrice:
                customerPrice?.fixedPrice,

            discountPercent:
                customerPrice?.discountPercent,

            effectiveFrom:
                customerPrice?.effectiveFrom ??
                getToday(),

            effectiveTo:
                customerPrice?.effectiveTo ?? "",

            active:
                customerPrice?.active ?? true,
        },
    });

    const productId = useWatch({
        control,
        name: "productId",
    });

    const unitId = useWatch({
        control,
        name: "unitId",
    });

    const pricingMethod = useWatch({
        control,
        name: "pricingMethod",
    });

    const fixedPrice = useWatch({
        control,
        name: "fixedPrice",
    });

    const discountPercent = useWatch({
        control,
        name: "discountPercent",
    });

    const selectedProduct =
        useMemo(
            () =>
                mockProducts.find(
                    (product) =>
                        product.id === productId,
                ),
            [productId],
        );

    const availableUnits =
        useMemo(
            () =>
                selectedProduct?.units.filter(
                    (unit) => unit.active,
                ) ?? [],
            [selectedProduct],
        );

    const selectedUnit =
        availableUnits.find(
            (unit) => unit.id === unitId,
        );

    const basePrice =
        selectedUnit?.basePrice;

    const previewPrice =
        calculatePreviewPrice({
            basePrice,
            pricingMethod,
            fixedPrice,
            discountPercent,
        });

    function handleProductChange(
        value: string,
    ) {
        setValue(
            "productId",
            value,
            {
                shouldDirty: true,
                shouldValidate: true,
            },
        );

        const product =
            mockProducts.find(
                (item) => item.id === value,
            );

        const firstUnit =
            product?.units.find(
                (unit) => unit.active,
            );

        setValue(
            "unitId",
            firstUnit?.id ?? "",
            {
                shouldDirty: true,
                shouldValidate: true,
            },
        );
    }

    async function submit(
        values: CustomerPriceFormValues,
    ) {
        try {
            await onSubmit(values);
        } catch (error) {
            setError("root", {
                type: "manual",

                message:
                    error instanceof Error
                        ? error.message
                        : "Unable to save customer price",
            });
        }
    }

    return (
        <form
            onSubmit={handleSubmit(submit)}
            noValidate
        >
            <div className="space-y-6">
                <section>
                    <h3 className="text-sm font-semibold">
                        Product
                    </h3>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        Select the product and selling
                        unit this customer price applies
                        to.
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-5">
                        <FormField
                            label="Product"
                            required
                            error={
                                errors.productId?.message
                            }
                        >
                            <select
                                value={productId}
                                onChange={(event) =>
                                    handleProductChange(
                                        event.target.value,
                                    )
                                }
                                className={selectClassName}
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
                                    .map((product) => (
                                        <option
                                            key={product.id}
                                            value={product.id}
                                        >
                                            {product.sku} —{" "}
                                            {product.name}
                                        </option>
                                    ))}
                            </select>
                        </FormField>

                        <FormField
                            label="Selling Unit"
                            required
                            error={
                                errors.unitId?.message
                            }
                        >
                            <Controller
                                control={control}
                                name="unitId"
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        disabled={
                                            !selectedProduct
                                        }
                                        className={
                                            selectClassName
                                        }
                                    >
                                        <option value="">
                                            {selectedProduct
                                                ? "Select unit"
                                                : "Select a product first"}
                                        </option>

                                        {availableUnits.map(
                                            (unit) => (
                                                <option
                                                    key={unit.id}
                                                    value={unit.id}
                                                >
                                                    {unit.name} (
                                                    {unit.symbol})
                                                </option>
                                            ),
                                        )}
                                    </select>
                                )}
                            />
                        </FormField>
                    </div>

                    {selectedProduct &&
                        selectedUnit && (
                            <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg bg-[var(--color-background-subtle)] p-4">
                                <PreviewValue
                                    label="SKU"
                                    value={
                                        selectedProduct.sku
                                    }
                                />

                                <PreviewValue
                                    label="Base price"
                                    value={formatMoney(
                                        selectedUnit.basePrice,
                                    )}
                                />

                                <PreviewValue
                                    label="Per"
                                    value={
                                        selectedUnit.symbol
                                    }
                                />
                            </div>
                        )}
                </section>

                <div className="border-t border-[var(--color-border)]" />

                <section>
                    <h3 className="text-sm font-semibold">
                        Pricing
                    </h3>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        Set either a fixed customer price
                        or a discount from the standard
                        selling price.
                    </p>

                    <div className="mt-4">
                        <FormField
                            label="Pricing Method"
                            required
                            error={
                                errors.pricingMethod?.message
                            }
                        >
                            <Controller
                                control={control}
                                name="pricingMethod"
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        className={
                                            selectClassName
                                        }
                                    >
                                        {customerPricingMethods.map(
                                            (method) => (
                                                <option
                                                    key={method}
                                                    value={method}
                                                >
                                                    {getPricingMethodLabel(
                                                        method,
                                                    )}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                )}
                            />
                        </FormField>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-5">
                        {pricingMethod ===
                            "FIXED_PRICE" ? (
                            <FormField
                                label="Customer Price"
                                required
                                error={
                                    errors.fixedPrice
                                        ?.message
                                }
                            >
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">
                                        $
                                    </span>

                                    <Input
                                        {...register(
                                            "fixedPrice",
                                            {
                                                setValueAs: (
                                                    value,
                                                ) =>
                                                    value === ""
                                                        ? undefined
                                                        : Number(
                                                            value,
                                                        ),
                                            },
                                        )}
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        className="pl-7"
                                        placeholder="0.00"
                                    />
                                </div>
                            </FormField>
                        ) : (
                            <FormField
                                label="Discount"
                                required
                                error={
                                    errors.discountPercent
                                        ?.message
                                }
                            >
                                <div className="relative">
                                    <Input
                                        {...register(
                                            "discountPercent",
                                            {
                                                setValueAs: (
                                                    value,
                                                ) =>
                                                    value === ""
                                                        ? undefined
                                                        : Number(
                                                            value,
                                                        ),
                                            },
                                        )}
                                        type="number"
                                        min={0}
                                        max={100}
                                        step="0.01"
                                        className="pr-8"
                                        placeholder="0"
                                    />

                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">
                                        %
                                    </span>
                                </div>
                            </FormField>
                        )}

                        <FormField
                            label="Effective Price"
                            description="Calculated preview only."
                        >
                            <div className="flex h-10 items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-background-subtle)] px-3 text-sm font-semibold">
                                {previewPrice !==
                                    undefined
                                    ? formatMoney(
                                        previewPrice,
                                    )
                                    : "—"}

                                {selectedUnit && (
                                    <span className="ml-1 font-normal text-[var(--color-text-muted)]">
                                        /{" "}
                                        {selectedUnit.symbol}
                                    </span>
                                )}
                            </div>
                        </FormField>
                    </div>

                    {basePrice !== undefined &&
                        previewPrice !==
                        undefined && (
                            <PricePreview
                                basePrice={basePrice}
                                customerPrice={
                                    previewPrice
                                }
                                unit={
                                    selectedUnit?.symbol ??
                                    ""
                                }
                            />
                        )}
                </section>

                <div className="border-t border-[var(--color-border)]" />

                <section>
                    <h3 className="text-sm font-semibold">
                        Effective Period
                    </h3>

                    <div className="mt-4 grid grid-cols-2 gap-5">
                        <FormField
                            label="Effective From"
                            required
                            error={
                                errors.effectiveFrom
                                    ?.message
                            }
                        >
                            <Input
                                {...register(
                                    "effectiveFrom",
                                )}
                                type="date"
                            />
                        </FormField>

                        <FormField
                            label="Effective To"
                            error={
                                errors.effectiveTo
                                    ?.message
                            }
                            description="Leave blank if there is no expiry date."
                        >
                            <Input
                                {...register(
                                    "effectiveTo",
                                )}
                                type="date"
                            />
                        </FormField>
                    </div>

                    <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-subtle)] p-4">
                        <input
                            {...register("active")}
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
                        />

                        <div>
                            <div className="text-sm font-medium">
                                Active customer price
                            </div>

                            <div className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                                Active prices can be used by
                                quotes, orders and invoices.
                            </div>
                        </div>
                    </label>
                </section>

                {errors.root?.message && (
                    <div className="rounded-lg border border-[var(--color-danger)]/20 bg-[var(--color-danger-soft)] px-4 py-3 text-xs text-[var(--color-danger)]">
                        {errors.root.message}
                    </div>
                )}
            </div>

            <div className="mt-7 flex items-center justify-between border-t border-[var(--color-border)] pt-5">
                <span className="text-[11px] text-[var(--color-text-muted)]">
                    {isDirty
                        ? "You have unsaved changes."
                        : customerPrice
                            ? "Update this customer price."
                            : "Create a customer-specific price."}
                </span>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        variant="accent"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Saving..."
                            : customerPrice
                                ? "Save changes"
                                : "Add customer price"}
                    </Button>
                </div>
            </div>
        </form>
    );
}

function PreviewValue({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                {label}
            </div>

            <div className="mt-1 text-xs font-medium">
                {value}
            </div>
        </div>
    );
}

function PricePreview({
    basePrice,
    customerPrice,
    unit,
}: {
    basePrice: number;
    customerPrice: number;
    unit: string;
}) {
    const saving =
        basePrice - customerPrice;

    const percentage =
        basePrice > 0
            ? (saving / basePrice) * 100
            : 0;

    return (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-white px-4 py-3">
            <div>
                <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                    Price preview
                </div>

                <div className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    Standard {formatMoney(basePrice)} /{" "}
                    {unit}
                </div>
            </div>

            <div className="text-right">
                <div className="money text-sm font-semibold text-[var(--color-primary)]">
                    {formatMoney(customerPrice)} /{" "}
                    {unit}
                </div>

                <div
                    className={
                        saving >= 0
                            ? "mt-1 text-[11px] text-[var(--color-success)]"
                            : "mt-1 text-[11px] text-[var(--color-warning)]"
                    }
                >
                    {saving >= 0
                        ? `Save ${formatMoney(
                            saving,
                        )} (${percentage.toFixed(
                            1,
                        )}%)`
                        : `${formatMoney(
                            Math.abs(saving),
                        )} above standard`}
                </div>
            </div>
        </div>
    );
}

function calculatePreviewPrice({
    basePrice,
    pricingMethod,
    fixedPrice,
    discountPercent,
}: {
    basePrice: number | undefined;

    pricingMethod:
    | "FIXED_PRICE"
    | "DISCOUNT_PERCENT";

    fixedPrice:
    | number
    | undefined;

    discountPercent:
    | number
    | undefined;
}) {
    if (basePrice === undefined) {
        return undefined;
    }

    if (
        pricingMethod ===
        "FIXED_PRICE"
    ) {
        return fixedPrice;
    }

    if (
        discountPercent === undefined
    ) {
        return undefined;
    }

    return (
        basePrice *
        (1 - discountPercent / 100)
    );
}

function getPricingMethodLabel(
    method:
        | "FIXED_PRICE"
        | "DISCOUNT_PERCENT",
) {
    switch (method) {
        case "FIXED_PRICE":
            return "Fixed customer price";

        case "DISCOUNT_PERCENT":
            return "Discount from standard price";
    }
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

function getToday() {
    const date = new Date();

    const year =
        date.getFullYear();

    const month = String(
        date.getMonth() + 1,
    ).padStart(2, "0");

    const day = String(
        date.getDate(),
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

const selectClassName = [
    "h-10 w-full rounded-lg",
    "border border-[var(--color-border)]",
    "bg-white px-3",
    "text-sm text-[var(--color-text-primary)]",
    "outline-none transition",
    "disabled:cursor-not-allowed",
    "disabled:bg-[var(--color-surface-muted)]",
    "disabled:text-[var(--color-text-muted)]",
    "hover:border-[var(--color-border-strong)]",
    "focus:border-[var(--color-primary)]",
    "focus:ring-2",
    "focus:ring-[var(--color-primary-soft)]",
].join(" ");