import { describe, expect, it } from "vitest";
import { calculateGrniOutstandingReport } from "./grniOutstandingReportService";
import type { GoodsReceipt } from "../types/goodsReceipt";
import type { SupplierBillReceiptMatch } from "../types/supplierBillReceiptMatch";
import type { JournalEntry, AccountingSourceType } from "../../accounting/types/journalEntry";
import type { GrniOutstandingFilters } from "../types/grniOutstandingReport";

const ACCOUNT = "grni-account";
const AS_OF = "2026-10-14";

function receipt(id: string, date: string, quantity: number, unitCost = 20, supplierId = "supplier-1", siteId = "site-1"): GoodsReceipt {
  return {
    id, receiptNumber: `GR-${id}`, purchaseOrderId: "po-1", purchaseOrderNumber: "PO-001",
    supplierId, supplierCode: supplierId, supplierName: `Supplier ${supplierId}`,
    siteId, siteCode: siteId, siteName: `Site ${siteId}`,
    receiptDate: date, status: "POSTED", postedAt: `${date}T09:00:00Z`, createdAt: `${date}T09:00:00Z`,
    lines: [{ id: `line-${id}`, purchaseOrderLineId: "po-line-1", productId: "product-1", unitId: "sqm",
      sku: "SKU-1", description: "Flooring", unitSymbol: "m²", receivedQuantity: quantity,
      conversionToBase: 1, receivedBaseQuantity: quantity, unitCost }],
  };
}

function match(id: string, receiptId: string, quantity: number, cost: number, created = "2026-10-10", reversed?: string, billUnitCost = 20): SupplierBillReceiptMatch {
  return {
    id, supplierBillId: `bill-${id}`, supplierBillLineId: `bill-line-${id}`,
    goodsReceiptId: receiptId, goodsReceiptLineId: `line-${receiptId}`,
    purchaseOrderId: "po-1", purchaseOrderLineId: "po-line-1", productId: "product-1",
    matchedQuantity: quantity, matchedBaseQuantity: quantity, receiptUnitCost: cost,
    matchedReceiptValue: Math.round(quantity * cost * 100) / 100,
    billUnitCost, matchedBillValue: Math.round(quantity * billUnitCost * 100) / 100,
    priceVariance: Math.round(quantity * (billUnitCost - cost) * 100) / 100,
    status: reversed ? "REVERSED" : "ACTIVE", createdAt: `${created}T10:00:00Z`,
    ...(reversed ? { reversedAt: `${reversed}T10:00:00Z`, reversalReason: "Void" } : {}),
  };
}

function journal(id: string, date: string, debit: number, credit: number, sourceType: AccountingSourceType = "GOODS_RECEIPT"): JournalEntry {
  return {
    id, journalNumber: `J-${id}`, journalDate: date, description: id, sourceType,
    sourceId: id, status: "POSTED", createdAt: `${date}T12:00:00Z`, updatedAt: `${date}T12:00:00Z`, postedAt: `${date}T12:00:00Z`,
    lines: [{ id: `jl-${id}`, accountId: ACCOUNT, accountCode: "2050", accountName: "GRNI", debit, credit }],
    totalDebit: Math.max(debit, credit), totalCredit: Math.max(debit, credit),
  };
}

function report(receipts: GoodsReceipt[], matches: SupplierBillReceiptMatch[] = [], journals: JournalEntry[] = [], filters: Partial<GrniOutstandingFilters> = {}) {
  return calculateGrniOutstandingReport({ filters: { asOfDate: AS_OF, ...filters }, receipts, matches, journals, grniAccountId: ACCOUNT });
}

describe("6K-G6 GRNI Outstanding Report", () => {
  it("G01: unbilled receipt remains fully outstanding", () => {
    const result = report([receipt("1", "2026-10-01", 40)], [], [journal("gr1", "2026-10-01", 0, 800)]);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({ receivedQuantity: 40, matchedQuantity: 0, outstandingQuantity: 40, receivedValue: 800, outstandingValue: 800 });
    expect(result.difference).toBe(0);
  });

  it("G02: partial invoice clears only the FIFO matched receipt cost", () => {
    const result = report([receipt("1", "2026-10-01", 40)], [match("m1", "1", 25, 20)],
      [journal("gr1", "2026-10-01", 0, 800), journal("bill1", "2026-10-10", 500, 0, "SUPPLIER_BILL")]);
    expect(result.rows[0]).toMatchObject({ matchedQuantity: 25, outstandingQuantity: 15, matchedValue: 500, outstandingValue: 300 });
    expect(result.glCreditBalance).toBe(300);
    expect(result.difference).toBe(0);
  });

  it("G03: fully invoiced receipt is hidden by outstanding-only filter", () => {
    const r = receipt("1", "2026-10-01", 40);
    const m = match("m1", "1", 40, 20);
    expect(report([r], [m], [], { outstandingOnly: true }).rows).toHaveLength(0);
    expect(report([r], [m]).rows[0].outstandingValue).toBe(0);
  });

  it("G04: PPV changes bill amount but not GRNI receipt-cost clearing", () => {
    const result = report([receipt("1", "2026-10-01", 40)], [match("m1", "1", 25, 20, "2026-10-10", undefined, 22)],
      [journal("gr1", "2026-10-01", 0, 800), journal("bill1", "2026-10-10", 500, 0, "SUPPLIER_BILL")]);
    expect(result.rows[0].matchedValue).toBe(500);
    expect(result.totals.outstandingValue).toBe(300);
    expect(result.difference).toBe(0);
  });

  it("G05: void releases matches and restores GRNI on and after reversal date", () => {
    const r = receipt("1", "2026-10-01", 40);
    const m = match("m1", "1", 25, 20, "2026-10-05", "2026-10-12");
    const journals = [journal("gr1", "2026-10-01", 0, 800), journal("bill1", "2026-10-05", 500, 0, "SUPPLIER_BILL"), journal("void1", "2026-10-12", 0, 500, "SUPPLIER_BILL_VOID")];
    expect(report([r], [m], journals, { asOfDate: "2026-10-11" }).totals.outstandingValue).toBe(300);
    const after = report([r], [m], journals);
    expect(after.totals.outstandingValue).toBe(800);
    expect(after.difference).toBe(0);
  });

  it("G06: two receipt batches retain separate FIFO outstanding balances", () => {
    const receipts = [receipt("1", "2026-10-01", 40), receipt("2", "2026-10-02", 60, 22)];
    const matches = [match("m1", "1", 40, 20), match("m2", "2", 10, 22)];
    const result = report(receipts, matches);
    expect(result.rows.map(r => r.outstandingQuantity)).toEqual([0, 50]);
    expect(result.rows.map(r => r.outstandingValue)).toEqual([0, 1100]);
  });

  it("G07: aging boundaries use 0–30, 31–60, 61–90, 91+ days", () => {
    const day = (days: number) => new Date(Date.parse(`${AS_OF}T00:00:00Z`) - days * 86400000).toISOString().slice(0, 10);
    const receipts = [0, 30, 31, 60, 61, 90, 91].map((d, i) => receipt(String(i), day(d), 1));
    const result = report(receipts);
    expect(result.rows.map(r => r.agingBucket)).toEqual(["CURRENT", "CURRENT", "31_60", "31_60", "61_90", "61_90", "OVER_90"]);
    expect(result.aging).toEqual({ CURRENT: 40, "31_60": 40, "61_90": 40, OVER_90: 20 });
  });

  it("G08: historical cutoff excludes later receipts, matches and journals", () => {
    const receipts = [receipt("1", "2026-10-01", 40), receipt("2", "2026-10-12", 20)];
    const matches = [match("m1", "1", 25, 20, "2026-10-10")];
    const journals = [journal("gr1", "2026-10-01", 0, 800), journal("gr2", "2026-10-12", 0, 400), journal("bill1", "2026-10-10", 500, 0, "SUPPLIER_BILL")];
    const result = report(receipts, matches, journals, { asOfDate: "2026-10-05" });
    expect(result.rows).toHaveLength(1);
    expect(result.totals.outstandingValue).toBe(800);
    expect(result.glCreditBalance).toBe(800);
  });

  it("G09: supplier and site filters scope rows and disable whole-GL comparison", () => {
    const receipts = [receipt("1", "2026-10-01", 10, 20, "s1", "site1"), receipt("2", "2026-10-01", 20, 20, "s2", "site2")];
    const result = report(receipts, [], [], { supplierId: "s1", siteId: "site1" });
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].supplierId).toBe("s1");
    expect(Number.isNaN(result.difference)).toBe(true);
  });

  it("G10: PO, receipt and receipt-date filters apply together", () => {
    const receipts = [receipt("1", "2026-10-01", 10), receipt("2", "2026-10-05", 20)];
    const result = report(receipts, [], [], { purchaseOrderId: "po-1", goodsReceiptId: "2", receiptDateFrom: "2026-10-04", receiptDateTo: "2026-10-06" });
    expect(result.rows.map(r => r.goodsReceiptId)).toEqual(["2"]);
  });

  it("G11: full-scope GL discrepancy is visible, not silently adjusted", () => {
    const result = report([receipt("1", "2026-10-01", 10)], [], [journal("gr1", "2026-10-01", 0, 199)]);
    expect(result.totals.outstandingValue).toBe(200);
    expect(result.glCreditBalance).toBe(199);
    expect(result.difference).toBe(1);
  });

  it("G12: invalid dates are rejected", () => {
    expect(() => report([], [], [], { asOfDate: "2026-02-30" })).toThrow("Invalid GRNI as-of date");
    expect(() => report([], [], [], { receiptDateFrom: "invalid" })).toThrow("Invalid receipt start date");
    expect(() => report([], [], [], { receiptDateTo: "invalid" })).toThrow("Invalid receipt end date");
  });

  it("G13: overmatched receipt quantity is rejected", () => {
    expect(() => report([receipt("1", "2026-10-01", 10)], [match("m1", "1", 11, 20)])).toThrow("Overmatched receipt line");
  });

  it("G14: all receipt lines are included, including unit conversions", () => {
    const r = receipt("1", "2026-10-01", 2, 30);
    r.lines[0].conversionToBase = 3;
    r.lines[0].receivedBaseQuantity = 6;
    const result = report([r]);
    expect(result.rows[0].receivedValue).toBe(60);
    expect(result.rows[0].outstandingQuantity).toBe(2);
  });
});
