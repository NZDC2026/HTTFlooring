import { describe, expect, it } from "vitest";
import { inspectSalesRecovery } from "./salesRecoveryInspection";
import type { SalesAuditInput } from "./salesConsistencyAudit";
import type { Invoice } from "../types/salesDocument";
import type { JournalEntry } from "../../accounting/types/journalEntry";

const invoice = {
    id: "invoice-1", type: "INVOICE", status: "VOID", documentNumber: "INV-1", customerId: "c",
    documentDate: "2026-10-14", dueDate: "2026-11-14", createdAt: "now", updatedAt: "now",
    lines: [], totals: { subtotal: 100, taxAmount: 15, total: 115 }, amountPaid: 0, amountDue: 0,
} as Invoice;
const journal = { id: "journal-1", sourceType: "CUSTOMER_INVOICE", sourceId: "invoice-1", status: "POSTED" } as JournalEntry;
const input = (): SalesAuditInput => ({ quotes: [], salesOrders: [], invoices: [invoice], payments: [], creditNotes: [], allocations: [], journals: [journal] });

describe("Sales recovery inspection is read-only and fail-closed", () => {
    it("identifies a void invoice with an active GL journal and recommends manual reconciliation", () => {
        const findings = inspectSalesRecovery(input());
        const issue = findings.find(item => item.code === "VOID_INVOICE_GL_ACTIVE");
        expect(issue?.severity).toBe("BLOCK");
        expect(issue?.action).toContain("manually");
        expect(issue?.automaticRepairAllowed).toBe(false);
    });
    it("does not mutate documents or journals", () => {
        const state = input();
        const before = JSON.stringify(state);
        inspectSalesRecovery(state);
        expect(JSON.stringify(state)).toBe(before);
    });
    it("returns no findings for empty consistent state", () => {
        expect(inspectSalesRecovery({ quotes: [], salesOrders: [], invoices: [], payments: [], creditNotes: [], allocations: [], journals: [] })).toEqual([]);
    });
});
