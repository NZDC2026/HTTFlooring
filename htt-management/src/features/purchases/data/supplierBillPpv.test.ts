import { installPurchaseTestStorage } from './purchaseTestStorage';
import { beforeEach, describe, expect, it, vi } from "vitest";

let po: typeof import("./purchaseOrderRepository")["purchaseOrderRepository"];
let receipts: typeof import("./goodsReceiptRepository")["goodsReceiptRepository"];
let bills: typeof import("./supplierBillRepository")["supplierBillRepository"];
let matches: typeof import("./supplierBillReceiptMatchRepository")["supplierBillReceiptMatchRepository"];
let journals: typeof import("../../accounting/data/journalEntryRepository")["journalEntryRepository"];
let accounts: typeof import("../../accounting/data/accountRepository")["accountRepository"];
let posting: typeof import("../../accounting/data/purchasesAccountingPostingService")["purchasesAccountingPostingService"];
let productId: string;
let unitId: string;
let siteId: string;
let supplierId: string;
let sequence = 0;

beforeEach(async () => {
    installPurchaseTestStorage();
  vi.resetModules();
  const [p, r, b, m, j, a, s, products, sites, suppliers] = await Promise.all([
    import("./purchaseOrderRepository"),
    import("./goodsReceiptRepository"),
    import("./supplierBillRepository"),
    import("./supplierBillReceiptMatchRepository"),
    import("../../accounting/data/journalEntryRepository"),
    import("../../accounting/data/accountRepository"),
    import("../../accounting/data/purchasesAccountingPostingService"),
    import("../../inventory/data/mockProducts"),
    import("../../inventory/data/inventorySiteRepository"),
    import("../../contacts/data/supplierRepository"),
  ]);
  po = p.purchaseOrderRepository;
  receipts = r.goodsReceiptRepository;
  bills = b.supplierBillRepository;
  matches = m.supplierBillReceiptMatchRepository;
  journals = j.journalEntryRepository;
  accounts = a.accountRepository;
  posting = s.purchasesAccountingPostingService;
  const product = products.mockProducts.find((item) => item.id === "prod_001");
  const site = sites.inventorySiteRepository.getActive()[0];
  const supplier = suppliers.supplierRepository.getAll().find((item) => item.status === "ACTIVE");
  if (!product || !site || !supplier) throw new Error("Missing PPV test fixture");
  productId = product.id;
  unitId = product.baseUnitId;
  siteId = site.id;
  supplierId = supplier.id;
  sequence = 0;
});

function order(quantity = 100, unitCost = 20) {
  const created = po.create({ supplierId, orderDate: "2026-10-01", lines: [{ productId, unitId, orderedQuantity: quantity, unitCost }] });
  po.approve(created.id);
  po.send(created.id);
  const lineId = po.getById(created.id)?.lines[0]?.id;
  if (!lineId) throw new Error("Missing PO line");
  return { id: created.id, lineId };
}

function receive(orderId: string, lineId: string, quantity: number, date = "2026-10-02") {
  return receipts.create({ purchaseOrderId: orderId, siteId, receiptDate: date, lines: [{ purchaseOrderLineId: lineId, receivedQuantity: quantity }] });
}

function bill(orderId: string, lineId: string, quantity: number, unitCost: number) {
  sequence += 1;
  return bills.create({ purchaseOrderId: orderId, supplierInvoiceNumber: `PPV-${sequence}`, billDate: "2026-10-09", dueDate: "2026-11-09", lines: [{ purchaseOrderLineId: lineId, quantity, unitCost }] });
}

function sourceJournal(sourceType: "GOODS_RECEIPT" | "SUPPLIER_BILL", sourceId: string) {
  const entries = journals.getBySource(sourceType, sourceId);
  expect(entries).toHaveLength(1);
  return entries[0];
}

function amount(sourceType: "GOODS_RECEIPT" | "SUPPLIER_BILL", sourceId: string, role: Parameters<typeof accounts.requireBySystemRole>[0]) {
  const accountId = accounts.requireBySystemRole(role).id;
  return Math.round(sourceJournal(sourceType, sourceId).lines.filter((line) => line.accountId === accountId).reduce((sum, line) => sum + line.debit - line.credit, 0) * 100) / 100;
}

function assertBalanced(billId: string) {
  const entry = sourceJournal("SUPPLIER_BILL", billId);
  const debit = Math.round(entry.lines.reduce((sum, line) => sum + line.debit, 0) * 100);
  const credit = Math.round(entry.lines.reduce((sum, line) => sum + line.credit, 0) * 100);
  expect(debit).toBe(credit);
}

describe("6K-E6 Purchase Price Variance accounting", () => {
  it("E01 uses no PPV line when receipt and invoice costs agree", () => {
    const o = order(); receive(o.id, o.lineId, 100);
    const b = bill(o.id, o.lineId, 100, 20);
    expect(amount("SUPPLIER_BILL", b.id, "GRNI")).toBe(2000);
    expect(amount("SUPPLIER_BILL", b.id, "PURCHASE_PRICE_VARIANCE")).toBe(0);
    assertBalanced(b.id);
  });

  it("E02 debits PPV for a higher supplier invoice cost", () => {
    const o = order(); receive(o.id, o.lineId, 100);
    const b = bill(o.id, o.lineId, 100, 22);
    expect(amount("SUPPLIER_BILL", b.id, "GRNI")).toBe(2000);
    expect(amount("SUPPLIER_BILL", b.id, "PURCHASE_PRICE_VARIANCE")).toBe(200);
    expect(amount("SUPPLIER_BILL", b.id, "ACCOUNTS_PAYABLE")).toBe(-2420);
    assertBalanced(b.id);
  });

  it("E03 credits PPV for a lower supplier invoice cost", () => {
    const o = order(); receive(o.id, o.lineId, 100);
    const b = bill(o.id, o.lineId, 100, 18);
    expect(amount("SUPPLIER_BILL", b.id, "GRNI")).toBe(2000);
    expect(amount("SUPPLIER_BILL", b.id, "PURCHASE_PRICE_VARIANCE")).toBe(-200);
    expect(amount("SUPPLIER_BILL", b.id, "ACCOUNTS_PAYABLE")).toBe(-1980);
    assertBalanced(b.id);
  });

  it("E04 preserves FIFO across receipts when a later bill has PPV", () => {
    const o = order();
    const first = receive(o.id, o.lineId, 40, "2026-10-02");
    const second = receive(o.id, o.lineId, 60, "2026-10-03");
    const b = bill(o.id, o.lineId, 50, 22);
    expect(matches.getByBill(b.id).filter((m) => m.status === "ACTIVE").map((m) => [m.goodsReceiptId, m.matchedQuantity])).toEqual([[first.id, 40], [second.id, 10]]);
    expect(amount("SUPPLIER_BILL", b.id, "GRNI")).toBe(1000);
    expect(amount("SUPPLIER_BILL", b.id, "PURCHASE_PRICE_VARIANCE")).toBe(100);
  });

  it("E05 calculates PPV independently for multiple partial bills", () => {
    const o = order(); receive(o.id, o.lineId, 40);
    const first = bill(o.id, o.lineId, 25, 22);
    const second = bill(o.id, o.lineId, 15, 18);
    expect(amount("SUPPLIER_BILL", first.id, "PURCHASE_PRICE_VARIANCE")).toBe(50);
    expect(amount("SUPPLIER_BILL", second.id, "PURCHASE_PRICE_VARIANCE")).toBe(-30);
    expect(po.getById(o.id)?.lines[0]?.billedQuantity).toBe(40);
  });

  it("E06 calculates Australian GST from invoice rather than receipt cost", () => {
    const o = order(); receive(o.id, o.lineId, 100);
    const b = bill(o.id, o.lineId, 100, 22);
    expect(b.totals.taxAmount).toBe(220);
    expect(amount("SUPPLIER_BILL", b.id, "GST_RECEIVABLE")).toBe(220);
  });

  it("E07 clears original receipt GRNI even when the bill has PPV", () => {
    const o = order(); const r = receive(o.id, o.lineId, 100);
    const b = bill(o.id, o.lineId, 100, 22);
    expect(amount("GOODS_RECEIPT", r.id, "GRNI") + amount("SUPPLIER_BILL", b.id, "GRNI")).toBe(0);
  });

  it("E08 balances the journal for both PPV signs", () => {
    const o = order(); receive(o.id, o.lineId, 100);
    assertBalanced(bill(o.id, o.lineId, 50, 22).id);
    assertBalanced(bill(o.id, o.lineId, 50, 18).id);
  });

  it("E09 never debits Inventory when posting PPV", () => {
    const o = order(); const r = receive(o.id, o.lineId, 100);
    const b = bill(o.id, o.lineId, 100, 22);
    expect(amount("GOODS_RECEIPT", r.id, "INVENTORY")).toBe(2000);
    expect(amount("SUPPLIER_BILL", b.id, "INVENTORY")).toBe(0);
  });

  it("E10 is idempotent when the same PPV bill is posted again", () => {
    const o = order(); receive(o.id, o.lineId, 100);
    const b = bill(o.id, o.lineId, 100, 22);
    const original = sourceJournal("SUPPLIER_BILL", b.id);
    expect(posting.postSupplierBill(b).id).toBe(original.id);
    expect(journals.getBySource("SUPPLIER_BILL", b.id)).toHaveLength(1);
  });

  it("E11 rejects quantity beyond receipts even with a price difference", () => {
    const o = order(); receive(o.id, o.lineId, 40);
    expect(() => bill(o.id, o.lineId, 41, 22)).toThrow();
    expect(bills.getByPurchaseOrder(o.id)).toHaveLength(0);
    expect(matches.getAll()).toHaveLength(0);
    expect(po.getById(o.id)?.lines[0]?.billedQuantity).toBe(0);
  });

  it("E12 provisions an active expense PPV control account", () => {
    const ppv = accounts.requireBySystemRole("PURCHASE_PRICE_VARIANCE");
    expect(ppv.code).toBe("5150");
    expect(ppv.type).toBe("EXPENSE");
    expect(ppv.active).toBe(true);
    expect(ppv.allowManualPosting).toBe(false);
  });
});
