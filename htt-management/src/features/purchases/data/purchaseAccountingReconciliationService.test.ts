import { describe, expect, it } from "vitest";
import { calculatePurchaseAccountingReconciliation } from "./purchaseAccountingReconciliationService";
import type { Account } from "../../accounting/types/account";
import type { JournalEntry } from "../../accounting/types/journalEntry";
import type { GoodsReceipt } from "../types/goodsReceipt";
import type { SupplierBillReceiptMatch } from "../types/supplierBillReceiptMatch";

const date = "2026-10-14";
const account = (id: string, systemRole: Account["systemRole"], type: Account["type"]): Account => ({ id, code: id, name: id, systemRole, type, active: true, allowManualPosting: false, createdAt: date, updatedAt: date });
const accounts: Account[] = [account("inventory", "INVENTORY", "ASSET"), account("grni", "GRNI", "LIABILITY"), account("ppv", "PURCHASE_PRICE_VARIANCE", "EXPENSE")];
const journal = (id: string, journalDate: string, lines: Array<[string, number, number]>, sourceType: JournalEntry["sourceType"] = "SUPPLIER_BILL"): JournalEntry => ({ id, journalNumber: id, journalDate, description: id, sourceType, status: "POSTED", createdAt: `${journalDate}T00:00:00Z`, updatedAt: `${journalDate}T00:00:00Z`, postedAt: `${journalDate}T00:00:00Z`, totalDebit: 0, totalCredit: 0, lines: lines.map(([accountId, debit, credit], i) => ({ id: `${id}-${i}`, accountId, accountCode: accountId, accountName: accountId, debit, credit })) });
const receipt: GoodsReceipt = { id: "r", receiptNumber: "GR1", purchaseOrderId: "po", purchaseOrderNumber: "PO1", supplierId: "s", supplierCode: "S", supplierName: "Supplier", siteId: "site", siteCode: "SITE", siteName: "Site", receiptDate: "2026-10-01", status: "POSTED", postedAt: "2026-10-01T00:00:00Z", createdAt: "2026-10-01T00:00:00Z", lines: [{ id: "rl", purchaseOrderLineId: "pol", productId: "p", unitId: "unit", sku: "SKU", description: "Flooring", unitSymbol: "m2", receivedQuantity: 10, receivedBaseQuantity: 10, conversionToBase: 1, unitCost: 20 }] };
const match = (priceVariance: number, reversedAt?: string): SupplierBillReceiptMatch => ({ id: "m", supplierBillId: "bill", supplierBillLineId: "bl", goodsReceiptId: "r", goodsReceiptLineId: "rl", purchaseOrderId: "po", purchaseOrderLineId: "pol", productId: "p", matchedQuantity: 10, matchedBaseQuantity: 10, receiptUnitCost: 20, matchedReceiptValue: 200, billUnitCost: 20 + priceVariance / 10, matchedBillValue: 200 + priceVariance, priceVariance, status: reversedAt ? "REVERSED" : "ACTIVE", createdAt: "2026-10-05T00:00:00Z", ...(reversedAt ? { reversedAt: `${reversedAt}T00:00:00Z`, reversalReason: "Void" } : {}) });
const gr = journal("gr", "2026-10-01", [["grni", 0, 200]], "GOODS_RECEIPT");
const bill = (ppv: number) => journal("bill", "2026-10-05", [["grni", 200, 0], ["ppv", Math.max(ppv, 0), Math.max(-ppv, 0)]]);
const reverse = (ppv: number) => journal("reverse", "2026-10-12", [["grni", 0, 200], ["ppv", Math.max(-ppv, 0), Math.max(ppv, 0)]], "SUPPLIER_BILL_VOID");
function run(opts: { asOfDate?: string; receipts?: GoodsReceipt[]; matches?: SupplierBillReceiptMatch[]; journals?: JournalEntry[]; accounts?: Account[] } = {}) {
  return calculatePurchaseAccountingReconciliation({ asOfDate: opts.asOfDate ?? date, accounts: opts.accounts ?? accounts, journalEntries: opts.journals ?? [], costMovements: [], receipts: opts.receipts ?? [], matches: opts.matches ?? [] });
}
describe("6K-H Purchase Accounting Reconciliation", () => {
  it("H01 zero balances reconcile", () => expect(run().reconciled).toBe(true));
  it("H02 unbilled GRNI matches credit GL", () => { const r = run({ receipts: [receipt], journals: [gr] }); expect(r.grni.subledger).toBe(200); expect(r.grni.status).toBe("MATCHED"); });
  it("H03 missing GRNI journal flags difference", () => expect(run({ receipts: [receipt] }).grni.difference).toBe(200));
  it("H04 fully billed GRNI clears", () => { const r = run({ receipts: [receipt], matches: [match(0)], journals: [gr, bill(0)] }); expect(r.grni.subledger).toBe(0); expect(r.grni.status).toBe("MATCHED"); });
  it("H05 positive PPV reconciles debit", () => { const r = run({ receipts: [receipt], matches: [match(20)], journals: [gr, bill(20)] }); expect(r.ppv.subledger).toBe(20); expect(r.ppv.status).toBe("MATCHED"); });
  it("H06 negative PPV reconciles credit", () => { const r = run({ receipts: [receipt], matches: [match(-20)], journals: [gr, bill(-20)] }); expect(r.ppv.subledger).toBe(-20); expect(r.ppv.status).toBe("MATCHED"); });
  it("H07 missing PPV journal flags difference", () => expect(run({ receipts: [receipt], matches: [match(20)], journals: [gr, bill(0)] }).ppv.difference).toBe(20));
  it("H08 void restores GRNI and reverses PPV", () => { const r = run({ receipts: [receipt], matches: [match(20, "2026-10-12")], journals: [gr, bill(20), reverse(20)] }); expect(r.grni.subledger).toBe(200); expect(r.ppv.subledger).toBe(0); expect(r.grni.status).toBe("MATCHED"); expect(r.ppv.status).toBe("MATCHED"); });
  it("H09 historical as-of before bill preserves GRNI", () => { const r = run({ asOfDate: "2026-10-03", receipts: [receipt], matches: [match(20)], journals: [gr, bill(20)] }); expect(r.grni.subledger).toBe(200); expect(r.ppv.subledger).toBe(0); });
  it("H10 historical as-of before reversal retains PPV", () => { const r = run({ asOfDate: "2026-10-10", receipts: [receipt], matches: [match(20, "2026-10-12")], journals: [gr, bill(20), reverse(20)] }); expect(r.ppv.subledger).toBe(20); expect(r.grni.subledger).toBe(0); });
  it("H11 missing control account is rejected", () => expect(() => run({ accounts: accounts.filter(a => a.systemRole !== "GRNI") })).toThrow(/GRNI/));
  it("H12 invalid date is rejected", () => expect(() => run({ asOfDate: "invalid" })).toThrow());
});
