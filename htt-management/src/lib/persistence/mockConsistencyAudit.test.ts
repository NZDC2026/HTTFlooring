import { describe, expect, it } from "vitest";
import { auditMockReferences } from "./mockConsistencyAudit";

const empty = () => ({ customers: [], suppliers: [], sales: [], purchaseOrders: [] });

describe("Mock cross-repository integrity (read-only)", () => {
    it("accepts valid linked records", () => {
        expect(auditMockReferences({ customers: [{ id: "c" }], suppliers: [{ id: "s" }], sales: [{ id: "q", customerId: "c" }], purchaseOrders: [{ id: "p", supplierId: "s" }] })).toEqual([]);
    });
    it("detects orphaned sales customer references", () => {
        expect(auditMockReferences({ ...empty(), sales: [{ id: "q", customerId: "missing" }] })).toContainEqual({ code: "MISSING_CUSTOMER", repository: "sales", recordId: "q", referenceId: "missing" });
    });
    it("detects orphaned purchase order supplier references", () => {
        expect(auditMockReferences({ ...empty(), purchaseOrders: [{ id: "p", supplierId: "missing" }] })).toContainEqual({ code: "MISSING_SUPPLIER", repository: "purchaseOrders", recordId: "p", referenceId: "missing" });
    });
    it("detects duplicate IDs without mutating source", () => {
        const customers = [{ id: "c" }, { id: "c" }];
        expect(auditMockReferences({ ...empty(), customers })).toContainEqual({ code: "DUPLICATE_ID", repository: "customers", recordId: "c" });
        expect(customers).toHaveLength(2);
    });
});
