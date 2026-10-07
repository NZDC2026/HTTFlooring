import { useMemo, useState } from "react";

import {
    CalendarDays,
    Pencil,
    Plus,
    Search,
    Tag,
} from "lucide-react";

import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";

import { mockProducts } from "../../inventory/data/mockProducts";

import { customerPricingRepository } from "../data/customerPricingRepository";
import { useCustomerPrices } from "../data/useCustomerPricing";

import type { Customer } from "../types/customer";
import type { CustomerPrice } from "../types/customerPricing";

interface CustomerPricingTabProps {
    customer: Customer;

    onAdd: () => void;

    onEdit: (
        customerPrice: CustomerPrice,
    ) => void;
}

export function CustomerPricingTab({
    customer,
    onAdd,
    onEdit,
}: CustomerPricingTabProps) {
    const customerPrices =
        useCustomerPrices(customer.id);

    const [search, setSearch] =
        useState("");

    const normalizedSearch =
        search.trim().toLowerCase();

    const rows = useMemo(() => {
        return customerPrices
            .map((customerPrice) => {
                const product =
                    mockProducts.find(
                        (item) =>
                            item.id ===
                            customerPrice.productId,
                    );

                const unit =
                    product?.units.find(
                        (item) =>
                            item.id ===
                            customerPrice.unitId,
                    );

                const resolved =
                    customerPricingRepository.resolve(
                        customerPrice,
                    );

                return {
                    customerPrice,
                    product,
                    unit,
                    resolved,
                };
            })
            .filter((row) => {
                if (!normalizedSearch) {
                    return true;
                }

                return [
                    row.product?.sku ?? "",
                    row.product?.name ?? "",
                    row.product?.category ?? "",
                    row.unit?.name ?? "",
                    row.unit?.symbol ?? "",
                    getPricingMethodLabel(
                        row.customerPrice.pricingMethod,
                    ),
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(normalizedSearch);
            });
    }, [
        customerPrices,
        normalizedSearch,
    ]);

    const activeCount =
        customerPrices.filter(
            (price) =>
                getPricingStatus(price) ===
                "ACTIVE",
        ).length;

    const scheduledCount =
        customerPrices.filter(
            (price) =>
                getPricingStatus(price) ===
                "SCHEDULED",
        ).length;

    const averageDiscount = (() => {
        const resolved =
            customerPrices
                .map((price) =>
                    customerPricingRepository.resolve(
                        price,
                    ),
                )
                .filter(
                    (
                        item,
                    ): item is NonNullable<
                        typeof item
                    > => Boolean(item),
                );

        if (resolved.length === 0) {
            return 0;
        }

        return (
            resolved.reduce(
                (total, item) =>
                    total +
                    item.discountPercent,
                0,
            ) / resolved.length
        );
    })();

    return (
        <div>
            <div className="mb-5 flex items-start justify-between">
                <div>
                    <h2 className="font-display text-xl">
                        Customer Pricing
                    </h2>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        Manage product and unit-specific
                        pricing for{" "}
                        {customer.businessName}.
                    </p>
                </div>

                <Button
                    variant="accent"
                    onClick={onAdd}
                >
                    <Plus size={15} />
                    Add customer price
                </Button>
            </div>

            <div className="mb-4 grid grid-cols-4 gap-4">
                <SummaryCard
                    label="Pricing rules"
                    value={customerPrices.length.toString()}
                />

                <SummaryCard
                    label="Active"
                    value={activeCount.toString()}
                />

                <SummaryCard
                    label="Scheduled"
                    value={scheduledCount.toString()}
                />

                <SummaryCard
                    label="Avg. discount"
                    value={`${averageDiscount.toFixed(
                        1,
                    )}%`}
                />
            </div>

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                    <div className="relative w-[340px]">
                        <Search
                            size={15}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                        />

                        <Input
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value,
                                )
                            }
                            placeholder="Search product, SKU or unit..."
                            className="pl-9"
                        />
                    </div>

                    <div className="text-xs text-[var(--color-text-muted)]">
                        {rows.length}{" "}
                        {rows.length === 1
                            ? "price"
                            : "prices"}
                    </div>
                </div>

                {rows.length === 0 ? (
                    customerPrices.length === 0 ? (
                        <EmptyPricing
                            onAdd={onAdd}
                        />
                    ) : (
                        <NoSearchResults />
                    )
                ) : (
                    <>
                        <div className="grid grid-cols-[minmax(240px,1.7fr)_100px_120px_130px_110px_150px_110px_44px] gap-4 border-b border-[var(--color-border)] bg-[var(--color-background-subtle)] px-5 py-3 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                            <div>Product</div>
                            <div>Unit</div>
                            <div className="text-right">
                                Standard
                            </div>
                            <div className="text-right">
                                Customer Price
                            </div>
                            <div className="text-right">
                                Discount
                            </div>
                            <div>Effective</div>
                            <div>Status</div>
                            <div />
                        </div>

                        {rows.map(
                            ({
                                customerPrice,
                                product,
                                unit,
                                resolved,
                            }) => {
                                const status =
                                    getPricingStatus(
                                        customerPrice,
                                    );

                                return (
                                    <div
                                        key={
                                            customerPrice.id
                                        }
                                        className="grid grid-cols-[minmax(240px,1.7fr)_100px_120px_130px_110px_150px_110px_44px] items-center gap-4 border-b border-[var(--color-border)] px-5 py-4 last:border-b-0 hover:bg-[var(--color-surface-hover)]"
                                    >
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-medium text-[var(--color-primary)]">
                                                {product?.name ??
                                                    "Unknown product"}
                                            </div>

                                            <div className="mt-1 flex items-center gap-2">
                                                <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                                                    {product?.sku ??
                                                        customerPrice.productId}
                                                </span>

                                                {product && (
                                                    <span className="text-[10px] text-[var(--color-text-muted)]">
                                                        {
                                                            product.category
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs font-medium">
                                                {unit?.symbol ??
                                                    "—"}
                                            </div>

                                            <div className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                                                {unit?.name ?? ""}
                                            </div>
                                        </div>

                                        <div className="money text-right text-xs text-[var(--color-text-secondary)]">
                                            {resolved
                                                ? formatMoney(
                                                    resolved.basePrice,
                                                )
                                                : "—"}
                                        </div>

                                        <div className="text-right">
                                            <div className="money text-sm font-semibold text-[var(--color-primary)]">
                                                {resolved
                                                    ? formatMoney(
                                                        resolved.effectivePrice,
                                                    )
                                                    : "—"}
                                            </div>

                                            <div className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                                                {getPricingMethodLabel(
                                                    customerPrice.pricingMethod,
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            {resolved ? (
                                                <div>
                                                    <div
                                                        className={
                                                            resolved.discountAmount >
                                                                0
                                                                ? "text-xs font-medium text-[var(--color-success)]"
                                                                : resolved.discountAmount <
                                                                    0
                                                                    ? "text-xs font-medium text-[var(--color-warning)]"
                                                                    : "text-xs text-[var(--color-text-muted)]"
                                                        }
                                                    >
                                                        {formatDiscount(
                                                            resolved.discountPercent,
                                                        )}
                                                    </div>

                                                    {resolved.discountAmount !==
                                                        0 && (
                                                            <div className="money mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                                                                {resolved.discountAmount >
                                                                    0
                                                                    ? "-"
                                                                    : "+"}
                                                                {formatMoney(
                                                                    Math.abs(
                                                                        resolved.discountAmount,
                                                                    ),
                                                                )}
                                                            </div>
                                                        )}
                                                </div>
                                            ) : (
                                                "—"
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <CalendarDays
                                                    size={12}
                                                    className="text-[var(--color-text-muted)]"
                                                />

                                                {
                                                    customerPrice.effectiveFrom
                                                }
                                            </div>

                                            <div className="mt-1 pl-[18px] text-[10px] text-[var(--color-text-muted)]">
                                                {customerPrice.effectiveTo
                                                    ? `to ${customerPrice.effectiveTo}`
                                                    : "No expiry"}
                                            </div>
                                        </div>

                                        <div>
                                            <PricingStatusBadge
                                                status={status}
                                            />
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                onEdit(
                                                    customerPrice,
                                                )
                                            }
                                            aria-label="Edit customer price"
                                        >
                                            <Pencil
                                                size={15}
                                            />
                                        </Button>
                                    </div>
                                );
                            },
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function SummaryCard({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white px-5 py-4 shadow-[var(--shadow-xs)]">
            <div className="text-xs text-[var(--color-text-secondary)]">
                {label}
            </div>

            <div className="money mt-2 text-xl font-semibold">
                {value}
            </div>
        </div>
    );
}

function EmptyPricing({
    onAdd,
}: {
    onAdd: () => void;
}) {
    return (
        <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                <Tag size={20} />
            </div>

            <h3 className="mt-4 text-sm font-medium">
                No customer pricing
            </h3>

            <p className="mx-auto mt-2 max-w-[400px] text-xs leading-5 text-[var(--color-text-muted)]">
                This customer currently uses standard
                product pricing. Add a pricing rule to
                create a fixed price or percentage
                discount.
            </p>

            <Button
                variant="secondary"
                className="mt-5"
                onClick={onAdd}
            >
                <Plus size={14} />
                Add customer price
            </Button>
        </div>
    );
}

function NoSearchResults() {
    return (
        <div className="px-6 py-12 text-center">
            <Search
                size={20}
                className="mx-auto text-[var(--color-text-muted)]"
            />

            <div className="mt-3 text-sm font-medium">
                No matching prices
            </div>

            <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                Try another product name, SKU or
                unit.
            </div>
        </div>
    );
}

type PricingStatus =
    | "ACTIVE"
    | "SCHEDULED"
    | "EXPIRED"
    | "INACTIVE";

function getPricingStatus(
    customerPrice: CustomerPrice,
): PricingStatus {
    if (!customerPrice.active) {
        return "INACTIVE";
    }

    const today = getToday();

    if (
        customerPrice.effectiveFrom >
        today
    ) {
        return "SCHEDULED";
    }

    if (
        customerPrice.effectiveTo &&
        customerPrice.effectiveTo <
        today
    ) {
        return "EXPIRED";
    }

    return "ACTIVE";
}

function PricingStatusBadge({
    status,
}: {
    status: PricingStatus;
}) {
    switch (status) {
        case "ACTIVE":
            return (
                <Badge variant="success">
                    Active
                </Badge>
            );

        case "SCHEDULED":
            return (
                <Badge variant="info">
                    Scheduled
                </Badge>
            );

        case "EXPIRED":
            return (
                <Badge variant="warning">
                    Expired
                </Badge>
            );

        case "INACTIVE":
            return (
                <Badge variant="neutral">
                    Inactive
                </Badge>
            );
    }
}

function getPricingMethodLabel(
    method:
        | "FIXED_PRICE"
        | "DISCOUNT_PERCENT",
) {
    switch (method) {
        case "FIXED_PRICE":
            return "Fixed price";

        case "DISCOUNT_PERCENT":
            return "Discount";
    }
}

function formatDiscount(
    value: number,
) {
    if (
        Math.abs(value) < 0.005
    ) {
        return "—";
    }

    if (value > 0) {
        return `${value.toFixed(1)}%`;
    }

    return `+${Math.abs(value).toFixed(
        1,
    )}%`;
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