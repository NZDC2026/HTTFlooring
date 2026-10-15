import { beforeEach, describe, expect, it, vi } from "vitest";
import { QUOTE_STORAGE_KEY, isQuoteList, loadQuotes, persistQuotes } from "./quoteStorage";
let store: Map<string, string>;
let fail = false;
beforeEach(() => {
    store = new Map(); fail = false;
    vi.stubGlobal("window", { localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => { if (fail) throw new Error("quota"); store.set(key, value); },
    }});
});
const quote = { id: "q1", type: "QUOTE" as const, status: "DRAFT" as const, documentNumber: "QU-2026-0001", customerId: "c1", documentDate: "2026-10-14", createdAt: "2026-10-14", updatedAt: "2026-10-14", lines: [], totals: { subtotal: 0, taxAmount: 0, total: 0 } };
describe("quote storage", () => {
    it("persists and restores quotes", () => { persistQuotes([quote]); expect(loadQuotes()).toMatchObject({ status: "ok", data: [quote] }); });
    it("rejects invalid documents", () => { expect(isQuoteList([{ ...quote, type: "INVOICE" }])).toBe(false); expect(isQuoteList([{ ...quote, totals: { ...quote.totals, total: Infinity } }])).toBe(false); });
    it("does not overwrite corrupted storage", () => { store.set(QUOTE_STORAGE_KEY, "{bad"); expect(() => persistQuotes([quote])).toThrow(); expect(store.get(QUOTE_STORAGE_KEY)).toBe("{bad"); });
    it("fails closed when storage write fails", () => { fail = true; expect(() => persistQuotes([quote])).toThrow("Failed to persist"); expect(store.has(QUOTE_STORAGE_KEY)).toBe(false); });
});
