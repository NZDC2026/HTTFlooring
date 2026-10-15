import { registerRepository } from "../../security/repositoryHost";
import { financialStateStorage } from "../../../lib/persistence/financialStateStorage";
import type { SupplierBillReceiptMatch } from "../types/supplierBillReceiptMatch";

let matches: SupplierBillReceiptMatch[] = financialStateStorage.read().receiptMatches;
financialStateStorage.onRollback(() => { matches = financialStateStorage.read().receiptMatches; });
const listeners = new Set<() => void>();
const emitChange = () => {
    try { financialStateStorage.update("receiptMatches", matches); }
    catch (error) { matches = financialStateStorage.read().receiptMatches; throw error; }
    listeners.forEach(listener => financialStateStorage.notify(listener));
};

export const supplierBillReceiptMatchRepository = {
    getAll(): SupplierBillReceiptMatch[] { return [...matches]; },
    subscribe(listener: () => void): () => void { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getSnapshot(): SupplierBillReceiptMatch[] { return matches; },
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
        emitChange();
    },
    reverseForBill(billId: string, reason: string, reversalAccountingDate = new Date().toISOString().slice(0, 10)): void {
        const reversedAt = new Date().toISOString();
        matches = matches.map((match) =>
            match.supplierBillId === billId && match.status === "ACTIVE"
                ? { ...match, status: "REVERSED" as const, reversedAt, reversalAccountingDate, reversalReason: reason }
                : match,
        );
        emitChange();
    },
};

registerRepository("receiptMatches", {
    repository: supplierBillReceiptMatchRepository, read: "purchases.read",
    commands: {"catch": null, "saveForBill": null, "reverseForBill": null},
    snapshot: () => ({ matches }),
    restore: value => { matches = value.matches;  },
    publish: () => listeners.forEach(listener => listener()),
});
