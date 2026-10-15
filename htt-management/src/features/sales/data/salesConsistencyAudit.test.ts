import { describe, expect, it } from "vitest";
import { auditSalesConsistency, type SalesAuditInput } from "./salesConsistencyAudit";
import type { Invoice, Quote, SalesOrder } from "../types/salesDocument";
import type { Payment } from "../types/payment";
import type { CreditNote, CreditAllocation } from "../types/creditNote";
import type { JournalEntry } from "../../accounting/types/journalEntry";
const base = { id: "", documentNumber: "", customerId: "c", documentDate: "2026-10-14", createdAt: "now", updatedAt: "now", lines: [], totals: { subtotal: 100, taxAmount: 15, total: 115 } };
const quote = { ...base, id: "q", type: "QUOTE", status: "CONVERTED", convertedSalesOrderId: "o" } as Quote;
const order = { ...base, id: "o", type: "SALES_ORDER", status: "INVOICED", sourceQuoteId: "q", invoiceIds: ["i"] } as SalesOrder;
const invoice = { ...base, id: "i", type: "INVOICE", status: "PARTIALLY_PAID", sourceSalesOrderId: "o", dueDate: "2026-11-14", amountPaid: 20, amountDue: 85 } as Invoice;
const payment = { id: "p", customerId: "c", invoiceId: "i", status: "RECEIVED", amount: 20 } as Payment;
const credit = { id: "cn", customerId: "c", sourceInvoiceId: "i", status: "ISSUED", amountApplied: 10, amountAvailable: 20, totals: { total: 30 } } as CreditNote;
const allocation = { id: "a", customerId: "c", creditNoteId: "cn", invoiceId: "i", status: "APPLIED", amount: 10 } as CreditAllocation;
const valid = (): SalesAuditInput => ({ quotes: [quote], salesOrders: [order], invoices: [{ ...invoice, amountDue: 85 }], payments: [payment], creditNotes: [credit], allocations: [allocation], journals: [] });
describe("Sales cross-boundary read-only audit", () => {
    it("accepts linked sales chain and balances", () => expect(auditSalesConsistency(valid())).toEqual([]));
    it("finds broken order/invoice references", () => {
        const data = valid();
        expect(auditSalesConsistency({ ...data, salesOrders: [{ ...order, invoiceIds: [] }] }).map(i => i.code)).toContain("INVOICE_ORDER_LINK");
    });
    it("finds invoice balance drift without mutating the input", () => {
        const data = valid();
        const before = JSON.stringify(data);
        expect(auditSalesConsistency({ ...data, invoices: [{ ...invoice, amountDue: 90 }] }).map(i => i.code)).toContain("INVOICE_DUE_MISMATCH");
        expect(JSON.stringify(data)).toBe(before);
    });
    it("detects duplicate GL posting sources", () => {
        const data = valid();
        const j = { id: "j1", sourceType: "CUSTOMER_INVOICE", sourceId: "i", status: "POSTED" } as JournalEntry;
        expect(auditSalesConsistency({ ...data, journals: [j, { ...j, id: "j2" }] }).map(i => i.code)).toContain("DUPLICATE_GL_SOURCE");
    });
    it("detects orphaned allocation and credit amount drift", () => {
        const data = valid();
        const codes = auditSalesConsistency({ ...data, allocations: [{ ...allocation, invoiceId: "missing" }] }).map(i => i.code);
        expect(codes).toContain("ALLOCATION_LINK");
        expect(codes).toContain("INVOICE_DUE_MISMATCH");
    });
    it("flags a reversed invoice journal while invoice remains active", () => {
        const j = { id: "j", sourceType: "CUSTOMER_INVOICE", sourceId: "i", status: "REVERSED" } as JournalEntry;
        expect(auditSalesConsistency({ ...valid(), journals: [j] }).map(i => i.code)).toContain("ACTIVE_INVOICE_GL_REVERSED");
    });
    it("flags a void invoice with active original GL", () => {
        const j = { id: "j", sourceType: "CUSTOMER_INVOICE", sourceId: "i", status: "POSTED" } as JournalEntry;
        expect(auditSalesConsistency({ ...valid(), invoices: [{ ...invoice, status: "VOID", amountPaid: 0, amountDue: 0 }], payments: [], allocations: [], creditNotes: [], journals: [j] }).map(i => i.code)).toContain("VOID_INVOICE_GL_ACTIVE");
    });
    it("flags reversed payment with active original GL", () => {
        const j = { id: "j", sourceType: "CUSTOMER_PAYMENT", sourceId: "p", status: "POSTED" } as JournalEntry;
        expect(auditSalesConsistency({ ...valid(), payments: [{ ...payment, status: "REVERSED" }], journals: [j] }).map(i => i.code)).toContain("REVERSED_PAYMENT_GL_ACTIVE");
    });
    it("flags received payment with reversed original GL", () => {
        const j = { id: "j", sourceType: "CUSTOMER_PAYMENT", sourceId: "p", status: "REVERSED" } as JournalEntry;
        expect(auditSalesConsistency({ ...valid(), journals: [j] }).map(i => i.code)).toContain("RECEIVED_PAYMENT_GL_REVERSED");
    });
    it("flags void credit with active original GL", () => {
        const j = { id: "j", sourceType: "CREDIT_NOTE", sourceId: "cn", status: "POSTED" } as JournalEntry;
        expect(auditSalesConsistency({ ...valid(), creditNotes: [{ ...credit, status: "VOID", amountApplied: 0, amountAvailable: 0 }], allocations: [], journals: [j] }).map(i => i.code)).toContain("VOID_CREDIT_GL_ACTIVE");
    });
    it("flags active credit with reversed original GL", () => {
        const j = { id: "j", sourceType: "CREDIT_NOTE", sourceId: "cn", status: "REVERSED" } as JournalEntry;
        expect(auditSalesConsistency({ ...valid(), journals: [j] }).map(i => i.code)).toContain("ACTIVE_CREDIT_GL_REVERSED");
    });
    it("flags orphaned posted journals", () => {
        const j = { id: "j", sourceType: "CUSTOMER_PAYMENT", sourceId: "missing", status: "POSTED" } as JournalEntry;
        expect(auditSalesConsistency({ ...valid(), journals: [j] }).map(i => i.code)).toContain("ORPHAN_PAYMENT_GL");
    });
    it("flags multiple original GL journals even when one was reversed", () => {
        const j = { id: "j", sourceType: "CUSTOMER_INVOICE", sourceId: "i", status: "POSTED" } as JournalEntry;
        expect(auditSalesConsistency({ ...valid(), journals: [j, { ...j, id: "j2", status: "REVERSED" }] }).map(i => i.code)).toContain("DUPLICATE_INVOICE_ORIGINAL_GL");
    });

});
