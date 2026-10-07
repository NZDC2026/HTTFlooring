export type CustomerPricingMethod =
    | "FIXED_PRICE"
    | "DISCOUNT_PERCENT";

export interface CustomerPrice {
    id: string;

    customerId: string;

    productId: string;

    unitId: string;

    pricingMethod: CustomerPricingMethod;

    /**
     * Used when pricingMethod === FIXED_PRICE.
     */
    fixedPrice?: number;

    /**
     * Used when pricingMethod === DISCOUNT_PERCENT.
     *
     * Example:
     * 10 = 10% discount from base price.
     */
    discountPercent?: number;

    effectiveFrom: string;

    effectiveTo?: string;

    active: boolean;

    createdAt: string;
    updatedAt: string;
}

export interface ResolvedCustomerPrice {
    customerPrice: CustomerPrice;

    basePrice: number;

    effectivePrice: number;

    discountAmount: number;

    discountPercent: number;
}