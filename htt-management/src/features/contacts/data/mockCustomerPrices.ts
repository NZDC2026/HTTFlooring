import type { CustomerPrice } from "../types/customerPricing";

export const mockCustomerPrices: CustomerPrice[] =
    [
        {
            id: "cprice_001",

            customerId: "cus_001",

            productId: "prod_001",
            unitId: "unit_001_m2",

            pricingMethod: "FIXED_PRICE",

            fixedPrice: 62.5,

            effectiveFrom: "2026-01-01",

            active: true,

            createdAt:
                "2026-01-01T00:00:00.000Z",

            updatedAt:
                "2026-01-01T00:00:00.000Z",
        },

        {
            id: "cprice_002",

            customerId: "cus_001",

            productId: "prod_002",
            unitId: "unit_002_box",

            pricingMethod:
                "DISCOUNT_PERCENT",

            discountPercent: 8,

            effectiveFrom: "2026-01-01",

            active: true,

            createdAt:
                "2026-01-01T00:00:00.000Z",

            updatedAt:
                "2026-01-01T00:00:00.000Z",
        },

        {
            id: "cprice_003",

            customerId: "cus_002",

            productId: "prod_003",
            unitId: "unit_003_m2",

            pricingMethod:
                "DISCOUNT_PERCENT",

            discountPercent: 12.5,

            effectiveFrom: "2026-03-01",

            active: true,

            createdAt:
                "2026-03-01T00:00:00.000Z",

            updatedAt:
                "2026-03-01T00:00:00.000Z",
        },
    ];