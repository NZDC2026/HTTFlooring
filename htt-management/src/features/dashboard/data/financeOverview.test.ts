import { describe, expect, it } from "vitest";
import { calculateFinanceOverview } from "./financeOverview";
import type { Invoice } from "../../sales/types/salesDocument";
import type { SupplierBill } from "../../purchases/types/supplierBill";
const today = "2026-10-15";
describe("finance overview", () => {
    it("does not report nonexistent receivables or payables", () => {
        const result = calculateFinanceOverview([], [], [], [], [], today);
        expect(result.receivables).toBe(0);
        expect(result.payables).toBe(0);
        expect(result.unreconciledCount).toBe(0);
        expect(result.ageing.every(row => row.amount === 0)).toBe(true);
    });
    it("excludes draft and void invoices and ages outstanding amounts", () => {
        const base = { type: "INVOICE", documentDate: "2026-09-01", dueDate: "2026-10-10", amountDue: 150, status: "ISSUED" } as Invoice;
        const result = calculateFinanceOverview([base, { ...base, status: "DRAFT", amountDue: 999 }, { ...base, status: "VOID", amountDue: 999 }], [], [], [], [], today);
        expect(result.receivables).toBe(150);
        expect(result.overdueInvoiceCount).toBe(1);
        expect(result.ageing[1].amount).toBe(150);
    });
    it("excludes voided supplier bills from outstanding payables", () => {
        const bill = { status: "VOID", billDate: "2026-10-01", dueDate: "2026-10-10", totals: { amountDue: 300 } } as unknown as SupplierBill;
        const result = calculateFinanceOverview([], [bill], [], [], [], today);
        expect(result.payables).toBe(0);
        expect(result.overduePayables).toBe(0);
    });
    it("separates overdue bills from bills due in the next seven days", () => {
        const bill = { status: "POSTED", billDate: "2026-10-01", dueDate: "2026-10-16", totals: { amountDue: 200 } } as unknown as SupplierBill;
        const result = calculateFinanceOverview([], [bill, { ...bill, dueDate: "2026-10-14", totals: { ...bill.totals, amountDue: 50 } }], [], [], [], today);
        expect(result.payables).toBe(250);
        expect(result.dueThisWeek).toBe(200);
        expect(result.overduePayables).toBe(50);
    });
});
