import { useMemo, useSyncExternalStore } from "react";
import { accountRepository } from "../../accounting/data/accountRepository";
import { journalEntryRepository } from "../../accounting/data/journalEntryRepository";
import { inventoryCostMovementRepository } from "../../inventory/data/inventoryCostMovementRepository";
import { goodsReceiptRepository } from "./goodsReceiptRepository";
import { supplierBillReceiptMatchRepository } from "./supplierBillReceiptMatchRepository";
import { calculatePurchaseAccountingReconciliation } from "./purchaseAccountingReconciliationService";
export function usePurchaseAccountingReconciliation(asOfDate: string) {
  const accounts = useSyncExternalStore(accountRepository.subscribe, accountRepository.getSnapshot, accountRepository.getSnapshot);
  const journalEntries = useSyncExternalStore(journalEntryRepository.subscribe, journalEntryRepository.getSnapshot, journalEntryRepository.getSnapshot);
  const costMovements = useSyncExternalStore(inventoryCostMovementRepository.subscribe, inventoryCostMovementRepository.getSnapshot, inventoryCostMovementRepository.getSnapshot);
  const receipts = useSyncExternalStore(goodsReceiptRepository.subscribe, goodsReceiptRepository.getSnapshot, goodsReceiptRepository.getSnapshot);
  const matches = useSyncExternalStore(supplierBillReceiptMatchRepository.subscribe, supplierBillReceiptMatchRepository.getSnapshot, supplierBillReceiptMatchRepository.getSnapshot);
  return useMemo(() => calculatePurchaseAccountingReconciliation({ asOfDate, accounts, journalEntries, costMovements, receipts, matches }), [asOfDate, accounts, journalEntries, costMovements, receipts, matches]);
}
