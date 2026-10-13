import { journalEntryRepository } from "../../accounting/data/journalEntryRepository";
import { purchasePostingOperationRepository, type PurchasePostingOperation } from "./purchasePostingOperationRepository";

export type PurchasePostingAuditRow = PurchasePostingOperation & {
  sourcePath: string;
  journals: { id: string; number: string; status: string; date: string }[];
  needsAttention: boolean;
};

export function purchasePostingSourcePath(kind: PurchasePostingOperation["kind"], id: string): string {
  const encoded = encodeURIComponent(id);
  return kind === "GOODS_RECEIPT" ? `/purchases/goods-receipts/${encoded}` : `/purchases/bills/${encoded}`;
}

export const purchasePostingAuditService = {
  list(): PurchasePostingAuditRow[] {
    const journals = journalEntryRepository.getAll();
    return purchasePostingOperationRepository.getAll().map(operation => ({
      ...operation,
      sourcePath: purchasePostingSourcePath(operation.kind, operation.sourceId),
      journals: journals.filter(journal =>
        journal.sourceId === operation.sourceId &&
        (operation.kind === "GOODS_RECEIPT"
          ? journal.sourceType === "GOODS_RECEIPT"
          : journal.sourceType === "SUPPLIER_BILL" || journal.sourceType === "SUPPLIER_BILL_VOID")
      ).map(journal => ({ id: journal.id, number: journal.journalNumber, status: journal.status, date: journal.journalDate })),
      needsAttention: operation.status === "FAILED" || operation.status === "RECOVERY_REQUIRED",
    })).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
};
