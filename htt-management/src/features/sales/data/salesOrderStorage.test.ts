import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadQuoteOrders, persistQuoteOrders, SALES_ORDER_STORAGE_KEY } from "./salesOrderStorage";
import type { Quote, SalesOrder } from "../types/salesDocument";
let items: Map<string, string>;
let fail = false;
beforeEach(() => {
    items = new Map(); fail = false;
    vi.stubGlobal("window", { localStorage: {
        getItem: (key: string) => items.get(key) ?? null,
        setItem: (key: string, value: string) => { if (fail) throw new Error("quota"); items.set(key, value); },
    }});
});
const quote = { id: "q1", type: "QUOTE", status: "CONVERTED", convertedSalesOrderId: "o1", documentNumber: "QU-1", customerId: "c1", documentDate: "2026-10-14", createdAt: "2026-10-14", updatedAt: "2026-10-14", lines: [], totals: { subtotal: 0, taxAmount: 0, total: 0 } } as Quote;
const order = { id: "o1", type: "SALES_ORDER", status: "CONFIRMED", sourceQuoteId: "q1", documentNumber: "SO-1", customerId: "c1", documentDate: "2026-10-14", createdAt: "2026-10-14", updatedAt: "2026-10-14", invoiceIds: [], lines: [], totals: { subtotal: 0, taxAmount: 0, total: 0 } } as SalesOrder;
describe("quote/order atomic snapshot", () => {
    it("persists both sides of a conversion in one key", () => {
        persistQuoteOrders({ quotes: [quote], salesOrders: [order] });
        expect(loadQuoteOrders()).toMatchObject({ status: "ok", data: { quotes: [quote], salesOrders: [order] } });
    });
    it("rejects orphan converted quotes", () => {
        expect(() => persistQuoteOrders({ quotes: [quote], salesOrders: [] })).toThrow("relationship");
    });
    it("does not overwrite corrupt state", () => {
        items.set(SALES_ORDER_STORAGE_KEY, "{bad");
        expect(() => persistQuoteOrders({ quotes: [quote], salesOrders: [order] })).toThrow("unavailable or invalid");
        expect(items.get(SALES_ORDER_STORAGE_KEY)).toBe("{bad");
    });
    it("does not write partial state on storage failure", () => {
        fail = true;
        expect(() => persistQuoteOrders({ quotes: [quote], salesOrders: [order] })).toThrow("Failed to persist");
        expect(items.has(SALES_ORDER_STORAGE_KEY)).toBe(false);
    });
});
