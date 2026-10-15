import { beforeEach, describe, expect, it, vi } from "vitest";
import { CUSTOMER_PRICING_STORAGE_KEY, isCustomerPriceList, loadCustomerPrices, persistCustomerPrices } from "./customerPricingStorage";

let values: Map<string, string>;
let failWrites = false;
beforeEach(() => {
    values = new Map();
    failWrites = false;
    vi.stubGlobal("window", { localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => { if (failWrites) throw new Error("quota"); values.set(key, value); },
    } });
});
const price = { id: "p1", customerId: "c1", productId: "pr1", unitId: "u1", pricingMethod: "FIXED_PRICE" as const, fixedPrice: 20, effectiveFrom: "2026-01-01", active: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" };

describe("customer pricing persistence", () => {
    it("roundtrips valid rules", () => {
        persistCustomerPrices([price]);
        expect(loadCustomerPrices()).toMatchObject({ status: "ok", data: [price] });
    });
    it("rejects malformed and unsupported price rules", () => {
        expect(isCustomerPriceList([{ ...price, discountPercent: Number.NaN }])).toBe(false);
        expect(isCustomerPriceList([{ ...price, pricingMethod: "UNKNOWN" }])).toBe(false);
    });
    it("preserves invalid saved data and blocks writes", () => {
        values.set(CUSTOMER_PRICING_STORAGE_KEY, "{bad");
        expect(() => persistCustomerPrices([price])).toThrow();
        expect(values.get(CUSTOMER_PRICING_STORAGE_KEY)).toBe("{bad");
    });
    it("throws on storage failure without claiming success", () => {
        failWrites = true;
        expect(() => persistCustomerPrices([price])).toThrow("Failed to persist");
        expect(values.has(CUSTOMER_PRICING_STORAGE_KEY)).toBe(false);
    });
});
