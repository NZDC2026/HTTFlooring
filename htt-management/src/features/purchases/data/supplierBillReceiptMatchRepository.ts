import type { SupplierBillReceiptMatch } from "../types/supplierBillReceiptMatch";

let matches: SupplierBillReceiptMatch[] = [];

export const supplierBillReceiptMatchRepository = {
    getAll(): SupplierBillReceiptMatch[] { return [...matches]; },
    getByBill(billId: string): SupplierBillReceiptMatch[] {
        return matches.filter((match) => match.supplierBillId === billId);
    },
    saveForBill(billId: string, allocations: SupplierBillReceiptMatch[]): void {
        if (matches.some((match) => match.supplierBillId === billId)) {
            throw new Error("Receipt matches already exist for this supplier bill.");
        }
        if (!allocations.length || allocations.some((match) =>
            match.supplierBillId !== billId || match.status !== "ACTIVE")) {
            throw new Error("Invalid supplier bill receipt matches.");
        }
        matches = [...matches, ...allocations];
    },
    reverseForBill(billId: string, reason: string): void {
        const reversedAt = new Date().toISOString();
        matches = matches.map((match) =>
            match.supplierBillId === billId && match.status === "ACTIVE"
                ? { ...match, status: "REVERSED" as const, reversedAt, reversalReason: reason }
                : match,
        );
    },
};
