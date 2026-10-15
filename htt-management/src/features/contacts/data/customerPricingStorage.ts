/** Versioned persistence for non-ledger customer-specific price rules. */
import { canWriteMockRepository, readMockRepository, writeMockRepository } from "../../../lib/persistence/mockRepositoryStorage";
import type { CustomerPrice } from "../types/customerPricing";

export const CUSTOMER_PRICING_STORAGE_KEY = "htt.mock.contacts.customerPricing.v1";

export function isCustomerPriceList(value: unknown): value is CustomerPrice[] {
    return Array.isArray(value) && value.every((item: unknown) => {
        if (!item || typeof item !== "object") return false;
        const p = item as Record<string, unknown>;
        if (!["id", "customerId", "productId", "unitId", "effectiveFrom", "createdAt", "updatedAt"].every(k => typeof p[k] === "string" && (p[k] as string).length > 0)) return false;
        if (p.pricingMethod !== "FIXED_PRICE" && p.pricingMethod !== "DISCOUNT_PERCENT") return false;
        if (typeof p.active !== "boolean") return false;
        if (p.effectiveTo !== undefined && typeof p.effectiveTo !== "string") return false;
        if (p.fixedPrice !== undefined && (typeof p.fixedPrice !== "number" || !Number.isFinite(p.fixedPrice) || p.fixedPrice < 0)) return false;
        if (p.discountPercent !== undefined && (typeof p.discountPercent !== "number" || !Number.isFinite(p.discountPercent) || p.discountPercent < 0 || p.discountPercent > 100)) return false;
        return p.pricingMethod === "FIXED_PRICE" ? typeof p.fixedPrice === "number" : typeof p.discountPercent === "number";
    });
}

export function loadCustomerPrices(): ReturnType<typeof readMockRepository<CustomerPrice[]>> {
    return readMockRepository(CUSTOMER_PRICING_STORAGE_KEY, isCustomerPriceList);
}

export function persistCustomerPrices(prices: CustomerPrice[]): void {
    const current = loadCustomerPrices();
    if (current.status === "invalid" || !canWriteMockRepository(CUSTOMER_PRICING_STORAGE_KEY)) {
        throw new Error("Customer pricing storage is unavailable or invalid; changes were not saved.");
    }
    if (!writeMockRepository(CUSTOMER_PRICING_STORAGE_KEY, prices)) {
        throw new Error("Failed to persist customer pricing; changes were not applied.");
    }
}
