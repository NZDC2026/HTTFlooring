import { describe, expect, it } from "vitest";
import { calculatePurchaseAccountingReconciliation } from "../purchases/data/purchaseAccountingReconciliationService";
import type { Account } from "../accounting/types/account";
import type { JournalEntry } from "../accounting/types/journalEntry";
import type { GoodsReceipt } from "../purchases/types/goodsReceipt";
import type { SupplierBillReceiptMatch } from "../purchases/types/supplierBillReceiptMatch";
import type { InventoryCostMovement } from "../inventory/types/inventoryCost";
import { mockProducts } from "../inventory/data/mockProducts";
import { inventorySiteRepository } from "../inventory/data/inventorySiteRepository";

const findTestProduct = () => {
  const product = mockProducts.find(
    (item) => item.id === "prod_001",
  );

  if (!product) {
    throw new Error(
      "6K-I requires seeded product prod_001.",
    );
  }

  return product;
};

const testProduct = findTestProduct();
const testSite = inventorySiteRepository.getActive()[0];
if (!testProduct || !testSite) {
  throw new Error("6K-I requires seeded product prod_001 and an active inventory site.");
}


// 6K-I: Cross-ledger integration using realistic, deterministic posted documents.
// The fixtures are immutable snapshots: this suite does not exercise repository writes.
const accounts: Account[] = ([
  ["inventory", "INVENTORY", "ASSET"],
  ["grni", "GRNI", "LIABILITY"],
  ["ppv", "PURCHASE_PRICE_VARIANCE", "EXPENSE"],
  ["gst", "GST_RECEIVABLE", "ASSET"],
  ["ap", "ACCOUNTS_PAYABLE", "LIABILITY"],
] as const).map(([id, systemRole, type]) => ({
  id, code: id, name: id, systemRole, type, active: true,
  allowManualPosting: false, createdAt: "2026-10-01", updatedAt: "2026-10-01",
}));

type Posting = [string, number, number];
function entry(id: string, journalDate: string, sourceType: JournalEntry["sourceType"], postings: Posting[]): JournalEntry {
  const totalDebit = postings.reduce((n, p) => n + p[1], 0);
  const totalCredit = postings.reduce((n, p) => n + p[2], 0);
  expect(totalDebit).toBeCloseTo(totalCredit, 2);
  return {
    id, journalNumber: id, journalDate, sourceType, description: id,
    status: "POSTED", createdAt: `${journalDate}T12:00:00Z`,
    updatedAt: `${journalDate}T12:00:00Z`, postedAt: `${journalDate}T12:00:00Z`,
    totalDebit, totalCredit,
    lines: postings.map(([accountId, debit, credit], i) => ({
      id: `${id}-${i}`, accountId, accountCode: accountId, accountName: accountId, debit, credit,
    })),
  };
}
function receipt(id: string, day: string, quantity: number, unitCost: number): GoodsReceipt {
  return {
    id, receiptNumber: id, purchaseOrderId: "po", purchaseOrderNumber: "PO-1",
    supplierId: "supplier", supplierCode: "S", supplierName: "Supplier",
    siteId: testSite.id, siteCode: testSite.code, siteName: testSite.name,
    receiptDate: day, status: "POSTED", postedAt: `${day}T12:00:00Z`,
    createdAt: `${day}T12:00:00Z`, lines: [{
      id: `${id}-line`, purchaseOrderLineId: "po-line", productId: testProduct.id,
      unitId: testProduct.baseUnitId, sku: "FLOOR", description: "Flooring", unitSymbol: "m2",
      receivedQuantity: quantity, receivedBaseQuantity: quantity,
      conversionToBase: 1, unitCost,
    }],
  };
}
function movement(r: GoodsReceipt): InventoryCostMovement {
  const line = r.lines[0];
  const value = line.receivedBaseQuantity * line.unitCost;
  return {
    id: `cost-${r.id}`, costMovementNumber: `CM-${r.id}`, movementType: "RECEIPT",
    siteId: r.siteId, productId: line.productId, baseUnitId: line.unitId,
    quantityBase: line.receivedBaseQuantity, unitCostBase: line.unitCost,
    valueChange: value, quantityAfter: line.receivedBaseQuantity,
    averageCostAfter: line.unitCost, inventoryValueAfter: value,
    referenceType: "GOODS_RECEIPT", referenceId: r.id,
    occurredAt: `${r.receiptDate}T12:00:00Z`, createdAt: `${r.receiptDate}T12:00:00Z`,
  };
}
function match(r: GoodsReceipt, id: string, day: string, quantity: number, billUnitCost: number, reversedAt?: string): SupplierBillReceiptMatch {
  const cost = r.lines[0].unitCost;
  return {
    id, supplierBillId: id, supplierBillLineId: `${id}-line`,
    goodsReceiptId: r.id, goodsReceiptLineId: r.lines[0].id,
    purchaseOrderId: "po", purchaseOrderLineId: "po-line", productId: testProduct.id,
    matchedQuantity: quantity, matchedBaseQuantity: quantity,
    receiptUnitCost: cost, matchedReceiptValue: quantity * cost,
    billUnitCost, matchedBillValue: quantity * billUnitCost,
    priceVariance: quantity * (billUnitCost - cost),
    status: reversedAt ? "REVERSED" : "ACTIVE",
    createdAt: `${day}T12:00:00Z`,
    ...(reversedAt ? { reversedAt: `${reversedAt}T12:00:00Z`, reversalReason: "Void" } : {}),
  };
}
function grJournal(r: GoodsReceipt): JournalEntry {
  const amount = r.lines[0].receivedQuantity * r.lines[0].unitCost;
  return entry(`journal-${r.id}`, r.receiptDate, "GOODS_RECEIPT", [["inventory", amount, 0], ["grni", 0, amount]]);
}
function billJournal(m: SupplierBillReceiptMatch, day: string): JournalEntry {
  const gst = Math.round(m.matchedBillValue * 10) / 100;
  return entry(`journal-${m.id}`, day, "SUPPLIER_BILL", [
    ["grni", m.matchedReceiptValue, 0],
    ["ppv", Math.max(m.priceVariance, 0), Math.max(-m.priceVariance, 0)],
    ["gst", gst, 0], ["ap", 0, m.matchedBillValue + gst],
  ]);
}
function voidJournal(original: JournalEntry, day: string): JournalEntry {
  return entry(`void-${original.id}`, day, "SUPPLIER_BILL_VOID",
    original.lines.map(l => [l.accountId, l.credit, l.debit]));
}
function reconcile(input: {
  asOfDate?: string; receipts?: GoodsReceipt[]; matches?: SupplierBillReceiptMatch[];
  journalEntries?: JournalEntry[]; costMovements?: InventoryCostMovement[];
}) {
  return calculatePurchaseAccountingReconciliation({
    asOfDate: input.asOfDate ?? "2026-10-20", accounts,
    receipts: input.receipts ?? [], matches: input.matches ?? [],
    journalEntries: input.journalEntries ?? [], costMovements: input.costMovements ?? [],
  });
}
const r1 = receipt("GR-1", "2026-10-01", 10, 20);
const r2 = receipt("GR-2", "2026-10-03", 5, 24);
const m1 = match(r1, "BILL-1", "2026-10-05", 6, 22);
const m2 = match(r1, "BILL-2", "2026-10-08", 4, 18);
const m3 = match(r2, "BILL-3", "2026-10-10", 5, 24);
const receipts = [r1, r2];
const movements = receipts.map(movement);
const grJournals = receipts.map(grJournal);

describe("6K-I Purchase Accounting cross-ledger E2E", () => {
  it("I01 receipts post inventory and leave GRNI outstanding", () => {
    const result = reconcile({ receipts, costMovements: movements, journalEntries: grJournals });
    expect(result.inventory.subledger).toBe(320);
    expect(result.grni.subledger).toBe(320);
    expect(result.reconciled).toBe(true);
  });
  it("I02 partial supplier billing clears GRNI at receipt cost", () => {
    const result = reconcile({ receipts, costMovements: movements, matches: [m1], journalEntries: [...grJournals, billJournal(m1, "2026-10-05")] });
    expect(result.grni.subledger).toBe(200);
    expect(result.ppv.subledger).toBe(12);
    expect(result.reconciled).toBe(true);
  });
  it("I03 FIFO allocations across receipts reconcile positive and negative PPV", () => {
    const matches = [m1, m2, m3];
    const result = reconcile({ receipts, costMovements: movements, matches, journalEntries: [...grJournals, ...matches.map(m => billJournal(m, m.createdAt.slice(0, 10)))] });
    expect(result.inventory.subledger).toBe(320);
    expect(result.grni.subledger).toBe(0);
    expect(result.ppv.subledger).toBe(4);
    expect(result.reconciled).toBe(true);
  });
  it("I04 a void reverses bill accounting, but does not reverse receipt inventory", () => {
    const reversed = match(r1, "BILL-1", "2026-10-05", 6, 22, "2026-10-12");
    const original = billJournal(reversed, "2026-10-05");
    const result = reconcile({ receipts: [r1], costMovements: [movement(r1)], matches: [reversed], journalEntries: [grJournal(r1), original, voidJournal(original, "2026-10-12")] });
    expect(result.inventory.subledger).toBe(200);
    expect(result.grni.subledger).toBe(200);
    expect(result.ppv.subledger).toBe(0);
    expect(result.reconciled).toBe(true);
  });
  it("I05 historical view before bill uses receipt-only balances", () => {
    const result = reconcile({ asOfDate: "2026-10-04", receipts, costMovements: movements, matches: [m1], journalEntries: [...grJournals, billJournal(m1, "2026-10-05")] });
    expect(result.grni.subledger).toBe(320);
    expect(result.ppv.subledger).toBe(0);
    expect(result.reconciled).toBe(true);
  });
  it("I06 historical view before void includes original supplier bill", () => {
    const reversed = match(r1, "BILL-1", "2026-10-05", 6, 22, "2026-10-12");
    const original = billJournal(reversed, "2026-10-05");
    const result = reconcile({ asOfDate: "2026-10-10", receipts: [r1], costMovements: [movement(r1)], matches: [reversed], journalEntries: [grJournal(r1), original, voidJournal(original, "2026-10-12")] });
    expect(result.grni.subledger).toBe(80);
    expect(result.ppv.subledger).toBe(12);
    expect(result.reconciled).toBe(true);
  });
  it("I07 missing goods receipt journal is detected in both control accounts", () => {
    const result = reconcile({ receipts: [r1], costMovements: [movement(r1)] });
    expect(result.inventory.difference).toBe(200);
    expect(result.grni.difference).toBe(200);
    expect(result.reconciled).toBe(false);
  });
  it("I08 missing PPV posting is detected independently of inventory", () => {
    const correct = billJournal(m1, "2026-10-05");
    const bad = { ...correct, lines: correct.lines.filter(l => l.accountId !== "ppv") };
    const result = reconcile({ receipts: [r1], costMovements: [movement(r1)], matches: [m1], journalEntries: [grJournal(r1), bad] });
    expect(result.inventory.status).toBe("MATCHED");
    expect(result.grni.status).toBe("MATCHED");
    expect(result.ppv.difference).toBe(12);
    expect(result.reconciled).toBe(false);
  });
  it("I09 missing supplier bill GRNI posting is detected", () => {
    const correct = billJournal(m1, "2026-10-05");
    const bad = { ...correct, lines: correct.lines.filter(l => l.accountId !== "grni") };
    const result = reconcile({ receipts: [r1], costMovements: [movement(r1)], matches: [m1], journalEntries: [grJournal(r1), bad] });
    expect(result.grni.difference).toBe(-120);
    expect(result.reconciled).toBe(false);
  });
  it("I10 invalid as-of date is rejected", () => {
    expect(() => reconcile({ asOfDate: "2026-02-30" })).toThrow();
  });
});
