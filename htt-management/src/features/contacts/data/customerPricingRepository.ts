import { promotionalPrice } from '../../business-workspace/configurationState';
import { registerRepository } from "../../security/repositoryHost";
import { loadCustomerPrices, persistCustomerPrices } from "./customerPricingStorage";
import { mockCustomerPrices } from "./mockCustomerPrices";

import {
    getProductById,
    getProductUnit,
} from "../../inventory/data/mockProducts";

import type {
    CustomerPrice,
    ResolvedCustomerPrice,
} from "../types/customerPricing";

import type { CustomerPriceFormValues } from "../schemas/customerPricingSchemas";

type Listener = () => void;

const listeners = new Set<Listener>();

const storedCustomerPrices = loadCustomerPrices();
let customerPrices: CustomerPrice[] =
    storedCustomerPrices.status === "ok" ? storedCustomerPrices.data : structuredClone(mockCustomerPrices);

/**
 * Represents the final price that Sales should use.
 *
 * source:
 * - CUSTOMER_PRICE = customer-specific pricing rule
 * - STANDARD_PRICE = product unit base price
 */
export interface ResolvedSellingPrice {
    customerId: string;
    productId: string;
    unitId: string;
    date: string;

    source:
    | "CUSTOMER_PRICE"
    | "STANDARD_PRICE"
    | "PROMOTIONAL_PRICE";

    basePrice: number;
    effectivePrice: number;

    discountAmount: number;
    discountPercent: number;

    customerPrice?: CustomerPrice;
    promotionId?: string;
}

function emitChange() {
    listeners.forEach((listener) => {
        listener();
    });
}

function createId(prefix: string) {
    return `${prefix}_${crypto.randomUUID()}`;
}

function normalizeOptionalDate(
    value: string,
): string | undefined {
    const normalized = value.trim();

    return normalized || undefined;
}

function validateProductUnit(
    productId: string,
    unitId: string,
) {
    const product =
        getProductById(productId);

    if (!product) {
        throw new Error(
            `Product ${productId} was not found`,
        );
    }

    const unit = product.units.find(
        (item) => item.id === unitId,
    );

    if (!unit) {
        throw new Error(
            `Unit ${unitId} does not belong to product ${productId}`,
        );
    }

    if (!unit.active) {
        throw new Error(
            "The selected product unit is inactive",
        );
    }

    return {
        product,
        unit,
    };
}

/**
 * YYYY-MM-DD strings can be compared directly because
 * they are lexicographically sortable.
 *
 * Undefined end dates are treated as infinity.
 */
function doDateRangesOverlap(
    startA: string,
    endA: string | undefined,
    startB: string,
    endB: string | undefined,
) {
    const effectiveEndA =
        endA ?? "9999-12-31";

    const effectiveEndB =
        endB ?? "9999-12-31";

    return (
        startA <= effectiveEndB &&
        startB <= effectiveEndA
    );
}

/**
 * Prevent overlapping active customer pricing rules
 * for the same:
 *
 * Customer + Product + Unit
 */
function ensureNoPricingOverlap({
    customerId,
    productId,
    unitId,
    effectiveFrom,
    effectiveTo,
    ignorePriceId,
}: {
    customerId: string;
    productId: string;
    unitId: string;
    effectiveFrom: string;
    effectiveTo?: string;
    ignorePriceId?: string;
}) {
    const overlappingRule =
        customerPrices.find((price) => {
            if (
                price.id === ignorePriceId
            ) {
                return false;
            }

            if (!price.active) {
                return false;
            }

            if (
                price.customerId !==
                customerId ||
                price.productId !==
                productId ||
                price.unitId !== unitId
            ) {
                return false;
            }

            return doDateRangesOverlap(
                effectiveFrom,
                effectiveTo,
                price.effectiveFrom,
                price.effectiveTo,
            );
        });

    if (overlappingRule) {
        const existingRange =
            formatDateRange(
                overlappingRule.effectiveFrom,
                overlappingRule.effectiveTo,
            );

        throw new Error(
            `This pricing period overlaps an existing active customer price (${existingRange}).`,
        );
    }
}

function buildPricingFields(
    values: CustomerPriceFormValues,
) {
    if (
        values.pricingMethod ===
        "FIXED_PRICE"
    ) {
        return {
            fixedPrice: values.fixedPrice,
            discountPercent: undefined,
        };
    }

    return {
        fixedPrice: undefined,
        discountPercent:
            values.discountPercent,
    };
}

function resolveCustomerPriceRule(
    customerPrice: CustomerPrice,
): ResolvedCustomerPrice | undefined {
    const unit = getProductUnit(
        customerPrice.productId,
        customerPrice.unitId,
    );

    if (!unit) {
        return undefined;
    }

    const basePrice =
        unit.basePrice;

    let effectivePrice =
        basePrice;

    if (
        customerPrice.pricingMethod ===
        "FIXED_PRICE" &&
        customerPrice.fixedPrice !==
        undefined
    ) {
        effectivePrice =
            customerPrice.fixedPrice;
    }

    if (
        customerPrice.pricingMethod ===
        "DISCOUNT_PERCENT" &&
        customerPrice.discountPercent !==
        undefined
    ) {
        effectivePrice =
            basePrice *
            (1 -
                customerPrice.discountPercent /
                100);
    }

    const discountAmount =
        basePrice - effectivePrice;

    const discountPercent =
        basePrice > 0
            ? (discountAmount /
                basePrice) *
            100
            : 0;

    return {
        customerPrice,
        basePrice,
        effectivePrice,
        discountAmount,
        discountPercent,
    };
}

export const customerPricingRepository = {
    subscribe(listener: Listener) {
        listeners.add(listener);

        return () => {
            listeners.delete(listener);
        };
    },

    getSnapshot(): CustomerPrice[] {
        return customerPrices;
    },

    getAll(): CustomerPrice[] {
        return customerPrices;
    },

    getById(
        priceId: string,
    ): CustomerPrice | undefined {
        return customerPrices.find(
            (price) =>
                price.id === priceId,
        );
    },

    getByCustomer(
        customerId: string,
    ): CustomerPrice[] {
        return customerPrices.filter(
            (price) =>
                price.customerId ===
                customerId,
        );
    },

    create(
        customerId: string,
        values: CustomerPriceFormValues,
    ): CustomerPrice {
        validateProductUnit(
            values.productId,
            values.unitId,
        );

        const effectiveTo =
            normalizeOptionalDate(
                values.effectiveTo,
            );

        if (values.active) {
            ensureNoPricingOverlap({
                customerId,
                productId:
                    values.productId,
                unitId: values.unitId,
                effectiveFrom:
                    values.effectiveFrom,
                effectiveTo,
            });
        }

        const now =
            new Date().toISOString();

        const pricingFields =
            buildPricingFields(values);

        const customerPrice: CustomerPrice =
        {
            id: createId("cprice"),

            customerId,

            productId:
                values.productId,

            unitId:
                values.unitId,

            pricingMethod:
                values.pricingMethod,

            ...pricingFields,

            effectiveFrom:
                values.effectiveFrom,

            effectiveTo,

            active:
                values.active,

            createdAt: now,
            updatedAt: now,
        };

        const nextPrices = [
            customerPrice,
            ...customerPrices,
        ];
        persistCustomerPrices(nextPrices);
        customerPrices = nextPrices;

        emitChange();

        return customerPrice;
    },

    update(
        priceId: string,
        values: CustomerPriceFormValues,
    ): CustomerPrice {
        const existing =
            customerPricingRepository.getById(
                priceId,
            );

        if (!existing) {
            throw new Error(
                `Customer price ${priceId} was not found`,
            );
        }

        validateProductUnit(
            values.productId,
            values.unitId,
        );

        const effectiveTo =
            normalizeOptionalDate(
                values.effectiveTo,
            );

        if (values.active) {
            ensureNoPricingOverlap({
                customerId:
                    existing.customerId,

                productId:
                    values.productId,

                unitId:
                    values.unitId,

                effectiveFrom:
                    values.effectiveFrom,

                effectiveTo,

                ignorePriceId:
                    priceId,
            });
        }

        const pricingFields =
            buildPricingFields(values);

        const updatedPrice: CustomerPrice =
        {
            ...existing,

            productId:
                values.productId,

            unitId:
                values.unitId,

            pricingMethod:
                values.pricingMethod,

            ...pricingFields,

            effectiveFrom:
                values.effectiveFrom,

            effectiveTo,

            active:
                values.active,

            updatedAt:
                new Date().toISOString(),
        };

        const nextPrices = customerPrices.map(
            (price) => price.id === priceId ? updatedPrice : price,
        );
        persistCustomerPrices(nextPrices);
        customerPrices = nextPrices;

        emitChange();

        return updatedPrice;
    },

    /**
     * Resolve one known CustomerPrice rule.
     *
     * Used mainly by the Customer Pricing UI.
     */
    resolve(
        customerPrice: CustomerPrice,
    ): ResolvedCustomerPrice | undefined {
        return resolveCustomerPriceRule(
            customerPrice,
        );
    },

    /**
     * Resolve the actual selling price for:
     *
     * Customer + Product + Unit + Date
     *
     * This is the function future Quote / Order /
     * Invoice code should use.
     *
     * Resolution:
     *
     * 1. Validate Product + Unit.
     * 2. Find an active customer-specific rule
     *    covering the requested date.
     * 3. Apply fixed price or discount.
     * 4. If no customer rule exists, return the
     *    product unit's standard/base price.
     */
    resolvePrice(customerId: string, productId: string, unitId: string, date: string): ResolvedSellingPrice {
        const base = customerPricingRepository.resolveBasePrice(customerId, productId, unitId, date.slice(0,10));
        const offer = promotionalPrice({customerId,productId,unitId,at:date,customerPrice:base.effectivePrice,basePrice:base.basePrice,hasCustomerPrice:base.source==='CUSTOMER_PRICE'});
        if (!offer.promotionId) return base;
        const discountAmount = Number((base.basePrice - offer.price).toFixed(2));
        return {...base,date,effectivePrice:offer.price,source:'PROMOTIONAL_PRICE',promotionId:offer.promotionId,discountAmount,discountPercent:base.basePrice ? Number((discountAmount/base.basePrice*100).toFixed(2)) : 0};
    },
    resolveBasePrice(
        customerId: string,
        productId: string,
        unitId: string,
        date: string,
    ): ResolvedSellingPrice {
        const { unit } =
            validateProductUnit(
                productId,
                unitId,
            );

        const customerPrice =
            customerPrices.find(
                (price) =>
                    price.customerId ===
                    customerId &&
                    price.productId ===
                    productId &&
                    price.unitId ===
                    unitId &&
                    price.active &&
                    isDateWithinRange(
                        date,
                        price.effectiveFrom,
                        price.effectiveTo,
                    ),
            );

        if (!customerPrice) {
            return {
                customerId,
                productId,
                unitId,
                date,

                source:
                    "STANDARD_PRICE",

                basePrice:
                    unit.basePrice,

                effectivePrice:
                    unit.basePrice,

                discountAmount: 0,
                discountPercent: 0,
            };
        }

        const resolved =
            resolveCustomerPriceRule(
                customerPrice,
            );

        if (!resolved) {
            throw new Error(
                "Unable to resolve customer pricing rule",
            );
        }

        return {
            customerId,
            productId,
            unitId,
            date,

            source:
                "CUSTOMER_PRICE",

            basePrice:
                resolved.basePrice,

            effectivePrice:
                resolved.effectivePrice,

            discountAmount:
                resolved.discountAmount,

            discountPercent:
                resolved.discountPercent,

            customerPrice,
        };
    },
};

function isDateWithinRange(
    date: string,
    effectiveFrom: string,
    effectiveTo?: string,
) {
    if (date < effectiveFrom) {
        return false;
    }

    if (
        effectiveTo &&
        date > effectiveTo
    ) {
        return false;
    }

    return true;
}

function formatDateRange(
    effectiveFrom: string,
    effectiveTo?: string,
) {
    return effectiveTo
        ? `${effectiveFrom} to ${effectiveTo}`
        : `${effectiveFrom} onwards`;
}
registerRepository("customerPrices", {
    repository: customerPricingRepository, read: "sales.read",
    commands: {"if": null, "return": null, "create": "contacts.write", "update": "contacts.write"},
    snapshot: () => ({ customerPrices }),
    restore: value => { customerPrices = value.customerPrices;  },
    publish: () => listeners.forEach(listener => listener()),
});
