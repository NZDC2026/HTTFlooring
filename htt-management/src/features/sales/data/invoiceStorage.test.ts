import { beforeEach, describe, expect, it, vi } from "vitest";
import { INVOICE_STORAGE_KEY, loadSalesDocuments, persistSalesDocuments } from "./invoiceStorage";
import type { Invoice, Quote, SalesOrder } from "../types/salesDocument";

let store: Map<string, string>;
let fail: boolean;
beforeEach(() => {
    store = new Map(); fail = false;
    vi.stubGlobal("window", { localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => { if (fail) throw new Error("quota"); store.set(key, value); },
    }});
});
const base = { documentDate: "2026-10-14", createdAt: "2026-10-14", updatedAt: "2026-10-14", customerId: "c1", lines: [], totals: { subtotal: 100, taxAmount: 15, total: 115 } };
const quote = { ...base, id: "q1", type: "QUOTE", status: "CONVERTED", convertedSalesOrderId: "o1", documentNumber: "QU-1" } as Quote;
const order = { ...base, id: "o1", type: "SALES_ORDER", status: "INVOICED", sourceQuoteId: "q1", invoiceIds: ["i1"], documentNumber: "SO-1" } as SalesOrder;
const invoice = { ...base, id: "i1", type: "INVOICE", status: "ISSUED", sourceSalesOrderId: "o1", documentNumber: "INV-1", dueDate: "2026-11-14", amountPaid: 0, amountDue: 115 } as Invoice;
const state = { quotes: [quote], salesOrders: [order], invoices: [invoice] };
describe("invoice/order business snapshot", () => {
    it("round trips linked invoice and order in one versioned write", () => {
        persistSalesDocuments(state);
        expect(loadSalesDocuments()).toMatchObject({ status: "ok", data: state });
    });
    it("rejects invoice without order backlink", () => {
        expect(() => persistSalesDocuments({ ...state, salesOrders: [{ ...order, invoiceIds: [] }] })).toThrow("relationships");
    });
    it("does not overwrite malformed storage", () => {
        store.set(INVOICE_STORAGE_KEY, "{bad");
        expect(() => persistSalesDocuments(state)).toThrow("unavailable or invalid");
        expect(store.get(INVOICE_STORAGE_KEY)).toBe("{bad");
    });
    it("does not change storage on write failure", () => {
        fail = true;
        expect(() => persistSalesDocuments(state)).toThrow("Failed to persist");
        expect(store.has(INVOICE_STORAGE_KEY)).toBe(false);
    });
});
