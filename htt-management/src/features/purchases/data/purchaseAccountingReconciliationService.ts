import type { Account } from "../../accounting/types/account";
import type { JournalEntry } from "../../accounting/types/journalEntry";
import type { InventoryCostMovement } from "../../inventory/types/inventoryCost";
import type { GoodsReceipt } from "../types/goodsReceipt";
import type { SupplierBillReceiptMatch } from "../types/supplierBillReceiptMatch";
import { calculateInventoryGlReconciliation } from "../../inventory/data/inventoryGlReconciliationService";
import { calculateGrniOutstandingReport } from "./grniOutstandingReportService";

const money = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export type PurchaseReconciliationStatus = "MATCHED" | "DIFFERENCE";
export interface PurchaseReconciliationLine {
  accountId: string; accountCode: string; accountName: string;
  subledger: number; generalLedger: number; difference: number;
  status: PurchaseReconciliationStatus;
}
export interface PurchaseAccountingReconciliation {
  asOfDate: string;
  inventory: PurchaseReconciliationLine;
  grni: PurchaseReconciliationLine;
  ppv: PurchaseReconciliationLine;
  reconciled: boolean;
  historicalMatchingWarning: string;
}
export interface PurchaseAccountingReconciliationInput {
  asOfDate: string;
  accounts: Account[];
  journalEntries: JournalEntry[];
  costMovements: InventoryCostMovement[];
  receipts: GoodsReceipt[];
  matches: SupplierBillReceiptMatch[];
}
export function calculatePurchaseAccountingReconciliation(input: PurchaseAccountingReconciliationInput): PurchaseAccountingReconciliation {
  const { asOfDate, accounts, journalEntries, costMovements, receipts, matches } = input;
  const requireAccount = (role: Account["systemRole"]) => {
    const account = accounts.find(a => a.systemRole === role);
    if (!account) throw new Error(`Missing accounting control account: ${role}`);
    return account;
  };
  const inventoryAccount = requireAccount("INVENTORY");
  const grniAccount = requireAccount("GRNI");
  const ppvAccount = requireAccount("PURCHASE_PRICE_VARIANCE");
  if (inventoryAccount.type !== "ASSET" || grniAccount.type !== "LIABILITY" || ppvAccount.type !== "EXPENSE") {
    throw new Error("Purchase reconciliation control account types are invalid.");
  }
  const inventoryResult = calculateInventoryGlReconciliation({ accounts, journalEntries, costMovements, asOfDate });
  const grniResult = calculateGrniOutstandingReport({
    filters: { asOfDate }, receipts, matches, journals: journalEntries, grniAccountId: grniAccount.id,
  });
  // The PPV subledger is derived independently from FIFO allocation records.
  // Journal GL balances include both original and reversal postings up to the as-of date.
  const ppvSubledger = money(matches.filter(m =>
    (m.accountingDate ?? m.createdAt.slice(0, 10)) <= asOfDate &&
    (!(m.reversalAccountingDate ?? m.reversedAt?.slice(0, 10)) || (m.reversalAccountingDate ?? m.reversedAt!.slice(0, 10)) > asOfDate) &&
    (m.status === "ACTIVE" || Boolean(m.reversedAt))
  ).reduce((sum, m) => sum + m.priceVariance, 0));
  const ppvGl = money(journalEntries.filter(j => j.journalDate <= asOfDate)
    .flatMap(j => j.lines).filter(l => l.accountId === ppvAccount.id)
    .reduce((sum, l) => sum + l.debit - l.credit, 0));
  const line = (account: Account, subledger: number, generalLedger: number): PurchaseReconciliationLine => {
    const difference = money(subledger - generalLedger);
    return { accountId: account.id, accountCode: account.code, accountName: account.name,
      subledger: money(subledger), generalLedger: money(generalLedger), difference,
      status: difference === 0 ? "MATCHED" : "DIFFERENCE" };
  };
  const inventory = line(inventoryAccount, inventoryResult.subledgerInventoryValue, inventoryResult.glInventoryBalance);
  const grni = line(grniAccount, grniResult.totals.outstandingValue, grniResult.glCreditBalance);
  const ppv = line(ppvAccount, ppvSubledger, ppvGl);
  return { asOfDate, inventory, grni, ppv,
    reconciled: [inventory, grni, ppv].every(row => row.status === "MATCHED"),
    historicalMatchingWarning: "Legacy FIFO matches without accounting dates use createdAt/reversedAt; historical reports may differ from GL for those records.",
  };
}
