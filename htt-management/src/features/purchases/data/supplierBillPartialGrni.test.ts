import { beforeEach, describe, expect, it, vi } from "vitest";

let po: typeof import("./purchaseOrderRepository")["purchaseOrderRepository"];
let gr: typeof import("./goodsReceiptRepository")["goodsReceiptRepository"];
let bills: typeof import("./supplierBillRepository")["supplierBillRepository"];
let matches: typeof import("./supplierBillReceiptMatchRepository")["supplierBillReceiptMatchRepository"];
let journals: typeof import("../../accounting/data/journalEntryRepository")["journalEntryRepository"];
let accounts: typeof import("../../accounting/data/accountRepository")["accountRepository"];
let posting: typeof import("../../accounting/data/purchasesAccountingPostingService")["purchasesAccountingPostingService"];
let productId: string;
let unitId: string;
let siteId: string;
let supplierId: string;
let serial = 0;

beforeEach(async () => {
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
  gr = r.goodsReceiptRepository;
  bills = b.supplierBillRepository;
  matches = m.supplierBillReceiptMatchRepository;
  journals = j.journalEntryRepository;
  accounts = a.accountRepository;
  posting = s.purchasesAccountingPostingService;
  const product = products.mockProducts.find((item) => item.id === "prod_001");
  const site = sites.inventorySiteRepository.getActive()[0];
  const supplier = suppliers.supplierRepository.getAll().find((item) => item.status === "ACTIVE");
  if (!product || !site || !supplier) throw new Error("Missing purchase test fixture");
  productId = product.id;
  unitId = product.baseUnitId;
  siteId = site.id;
  supplierId = supplier.id;
  serial = 0;
});

function order(quantity = 100, unitCost = 20) {
  const result = po.create({ supplierId, orderDate: "2026-10-01", lines: [{ productId, unitId, orderedQuantity: quantity, unitCost }] });
  po.approve(result.id);
  po.send(result.id);
  const lineId = po.getById(result.id)?.lines[0]?.id;
  if (!lineId) throw new Error("Missing PO line");
  return { id: result.id, lineId };
}

function receive(orderId: string, lineId: string, quantity: number, date = "2026-10-02") {
  return gr.create({ purchaseOrderId: orderId, siteId, receiptDate: date, lines: [{ purchaseOrderLineId: lineId, receivedQuantity: quantity }] });
}

function bill(orderId: string, lineId: string, quantity: number, unitCost = 20) {
  serial += 1;
  return bills.create({ purchaseOrderId: orderId, supplierInvoiceNumber: `D6-${serial}`, billDate: "2026-10-09", dueDate: "2026-11-09", lines: [{ purchaseOrderLineId: lineId, quantity, unitCost }] });
}

function roleAmount(sourceType: "GOODS_RECEIPT" | "SUPPLIER_BILL", sourceId: string, role: Parameters<typeof accounts.requireBySystemRole>[0]) {
  const accountId = accounts.requireBySystemRole(role).id;
  const entries = journals.getBySource(sourceType, sourceId);
  expect(entries).toHaveLength(1);
  return Math.round(entries[0].lines.filter((line) => line.accountId === accountId).reduce((sum, line) => sum + line.debit - line.credit, 0) * 100) / 100;
}

function active(billId: string) {
  return matches.getByBill(billId).filter((match) => match.status === "ACTIVE");
}

describe("6K-D6 Partial Receipt / Partial Bill / FIFO GRNI", () => {
  it("D601 allocates a partial bill to the first receipt", () => {
    const o = order();
    const r = receive(o.id, o.lineId, 40);
    const b = bill(o.id, o.lineId, 25);
    expect(active(b.id)).toHaveLength(1);
    expect(active(b.id)[0].goodsReceiptId).toBe(r.id);
    expect(active(b.id)[0].matchedQuantity).toBe(25);
    expect(roleAmount("SUPPLIER_BILL", b.id, "GRNI")).toBe(500);
    expect(roleAmount("SUPPLIER_BILL", b.id, "GST_RECEIVABLE")).toBe(b.totals.taxAmount);
    expect(roleAmount("SUPPLIER_BILL", b.id, "ACCOUNTS_PAYABLE")).toBe(-b.totals.total);
  });

  it("D602 allocates two bills without reusing previously matched quantity", () => {
    const o = order();
    const r = receive(o.id, o.lineId, 40);
    const first = bill(o.id, o.lineId, 25);
    const second = bill(o.id, o.lineId, 15);
    expect(active(first.id)[0].goodsReceiptId).toBe(r.id);
    expect(active(second.id)[0].goodsReceiptId).toBe(r.id);
    expect(active(second.id)[0].matchedQuantity).toBe(15);
    expect(roleAmount("GOODS_RECEIPT", r.id, "GRNI") + roleAmount("SUPPLIER_BILL", first.id, "GRNI") + roleAmount("SUPPLIER_BILL", second.id, "GRNI")).toBe(0);
    expect(po.getById(o.id)?.lines[0].billedQuantity).toBe(40);
  });

  it("D603 follows FIFO across two receipts and conserves GRNI", () => {
    const o = order();
    const firstReceipt = receive(o.id, o.lineId, 40, "2026-10-02");
    const secondReceipt = receive(o.id, o.lineId, 60, "2026-10-03");
    const firstBill = bill(o.id, o.lineId, 50);
    expect(active(firstBill.id).map((m) => [m.goodsReceiptId, m.matchedQuantity])).toEqual([[firstReceipt.id, 40], [secondReceipt.id, 10]]);
    expect(roleAmount("SUPPLIER_BILL", firstBill.id, "GRNI")).toBe(1000);
    const secondBill = bill(o.id, o.lineId, 50);
    expect(active(secondBill.id).map((m) => [m.goodsReceiptId, m.matchedQuantity])).toEqual([[secondReceipt.id, 50]]);
    const receiptGRNI = roleAmount("GOODS_RECEIPT", firstReceipt.id, "GRNI") + roleAmount("GOODS_RECEIPT", secondReceipt.id, "GRNI");
    const billGRNI = roleAmount("SUPPLIER_BILL", firstBill.id, "GRNI") + roleAmount("SUPPLIER_BILL", secondBill.id, "GRNI");
    expect(receiptGRNI + billGRNI).toBe(0);
  });

  it("D604 rejects billing beyond received quantity without mutation", () => {
    const o = order();
    receive(o.id, o.lineId, 40);
    expect(() => bill(o.id, o.lineId, 41)).toThrow();
    expect(bills.getByPurchaseOrder(o.id)).toHaveLength(0);
    expect(matches.getAll()).toHaveLength(0);
    expect(po.getById(o.id)?.lines[0].billedQuantity).toBe(0);
  });

  it("D605 rejects exceeding the remaining receipt balance", () => {
    const o = order();
    receive(o.id, o.lineId, 40);
    bill(o.id, o.lineId, 25);
    expect(() => bill(o.id, o.lineId, 16)).toThrow();
    expect(bills.getByPurchaseOrder(o.id)).toHaveLength(1);
    expect(matches.getAll().filter((m) => m.status === "ACTIVE").reduce((sum, m) => sum + m.matchedQuantity, 0)).toBe(25);
  });

  it("D606 rejects purchase price variance before posting", () => {
    const o = order();
    receive(o.id, o.lineId, 40);
    expect(() => bill(o.id, o.lineId, 25, 22)).toThrow(/price|variance/i);
    expect(po.getById(o.id)?.lines[0].billedQuantity).toBe(0);
    expect(matches.getAll()).toHaveLength(0);
  });

  it("D607 prevents duplicate invoice numbers for the same supplier", () => {
    const o = order();
    receive(o.id, o.lineId, 40);
    bill(o.id, o.lineId, 10);
    expect(() => bills.create({ purchaseOrderId: o.id, supplierInvoiceNumber: "D6-1", billDate: "2026-10-09", dueDate: "2026-11-09", lines: [{ purchaseOrderLineId: o.lineId, quantity: 10, unitCost: 20 }] })).toThrow(/invoice number|already/i);
    expect(bills.getByPurchaseOrder(o.id)).toHaveLength(1);
  });

  it("D608 refuses duplicate match persistence", () => {
    const o = order();
    receive(o.id, o.lineId, 40);
    const b = bill(o.id, o.lineId, 10);
    expect(() => matches.saveForBill(b.id, active(b.id))).toThrow(/already exist/i);
    expect(active(b.id)).toHaveLength(1);
  });

  it("D609 journal posting is idempotent", () => {
    const o = order();
    receive(o.id, o.lineId, 40);
    const b = bill(o.id, o.lineId, 10);
    const original = journals.getBySource("SUPPLIER_BILL", b.id)[0];
    expect(posting.postSupplierBill(b).id).toBe(original.id);
    expect(journals.getBySource("SUPPLIER_BILL", b.id)).toHaveLength(1);
  });

  it("D610 void releases allocations and preserves reversed audit records", () => {
    const o = order();
    receive(o.id, o.lineId, 40);
    const first = bill(o.id, o.lineId, 25);
    bills.markVoid(first.id, "Invoice cancelled");
    expect(matches.getByBill(first.id).every((m) => m.status === "REVERSED")).toBe(true);
    expect(po.getById(o.id)?.lines[0].billedQuantity).toBe(0);
    const replacement = bill(o.id, o.lineId, 40);
    expect(active(replacement.id).reduce((sum, m) => sum + m.matchedQuantity, 0)).toBe(40);
  });

  it("D611 does not debit Inventory again when billing", () => {
    const o = order();
    const r = receive(o.id, o.lineId, 40);
    const b = bill(o.id, o.lineId, 25);
    expect(roleAmount("GOODS_RECEIPT", r.id, "INVENTORY")).toBe(800);
    expect(roleAmount("SUPPLIER_BILL", b.id, "INVENTORY")).toBe(0);
  });

  it("D612 cannot bill an order before any goods have been received", () => {
    const o = order();
    expect(() => bill(o.id, o.lineId, 1)).toThrow();
    expect(matches.getAll()).toHaveLength(0);
  });
});
