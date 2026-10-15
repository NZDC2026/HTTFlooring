import { beforeEach, describe, expect, it, vi } from "vitest";
import { CREDIT_NOTE_STORAGE_KEY, loadCreditNoteState, persistCreditNoteState } from "./creditNoteStorage";
import type { CreditAllocation, CreditNote } from "../types/creditNote";
let store: Map<string, string>;
let fail = false;
beforeEach(() => {
    store = new Map(); fail = false;
    vi.stubGlobal("window", { localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => { if (fail) throw Error("quota"); store.set(key, value); },
    }});
});
const note: CreditNote = { id: "cn1", creditNoteNumber: "CN-1", customerId: "c1", sourceInvoiceId: "i1", creditDate: "2026-10-14", status: "ISSUED", reason: "return", lines: [], totals: { subtotal: 100, taxAmount: 15, total: 115 }, amountApplied: 0, amountAvailable: 115, createdAt: "now", updatedAt: "now" };
const allocation: CreditAllocation = { id: "a1", allocationNumber: "CA-1", customerId: "c1", creditNoteId: "cn1", invoiceId: "i1", allocationDate: "2026-10-14", amount: 25, status: "APPLIED", createdAt: "now", updatedAt: "now" };
describe("credit note durable local snapshot", () => {
    it("round trips note and allocation in one write", () => {
        const data = { creditNotes: [{ ...note, amountApplied: 25, amountAvailable: 90 }], allocations: [allocation] };
        persistCreditNoteState(data);
        expect(loadCreditNoteState()).toMatchObject({ status: "ok", data });
    });
    it("rejects missing credit note allocation relationship", () => {
        expect(() => persistCreditNoteState({ creditNotes: [note], allocations: [allocation] })).toThrow("relationships");
    });
    it("preserves corrupt storage", () => {
        store.set(CREDIT_NOTE_STORAGE_KEY, "{broken");
        expect(() => persistCreditNoteState({ creditNotes: [note], allocations: [] })).toThrow("unavailable or invalid");
        expect(store.get(CREDIT_NOTE_STORAGE_KEY)).toBe("{broken");
    });
    it("fails closed on storage write error", () => {
        fail = true;
        expect(() => persistCreditNoteState({ creditNotes: [note], allocations: [] })).toThrow("Failed to persist");
        expect(store.has(CREDIT_NOTE_STORAGE_KEY)).toBe(false);
    });
});
