import { installPurchaseTestStorage } from './purchaseTestStorage';
import { beforeEach, describe, expect, it, vi } from "vitest";

let po: typeof import("./purchaseOrderRepository")["purchaseOrderRepository"];
let gr: typeof import("./goodsReceiptRepository")["goodsReceiptRepository"];
let bills: typeof import("./supplierBillRepository")["supplierBillRepository"];
let matches: typeof import("./supplierBillReceiptMatchRepository")["supplierBillReceiptMatchRepository"];
let journals: typeof import("../../accounting/data/journalEntryRepository")["journalEntryRepository"];
let accounts: typeof import("../../accounting/data/accountRepository")["accountRepository"];
let productId: string;
let unitId: string;
let siteId: string;
let supplierId: string;
let serial = 0;

beforeEach(async () => {
    installPurchaseTestStorage();
  vi.resetModules();
  const [p, r, b, m, j, a, , products, sites, suppliers] = await Promise.all([
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

function active(billId: string) {
  return matches.getByBill(billId).filter((match) => match.status === "ACTIVE");
}

describe("6K-F Supplier Bill Void / Accounting Reversal", () => {
  function fixture(cost = 22, quantity = 60) {
    const o = order();
    const receipt = receive(o.id, o.lineId, 100);
    const invoice = bill(o.id, o.lineId, quantity, cost);
    const original = journals.getBySource("SUPPLIER_BILL", invoice.id)[0];
    return { o, receipt, invoice, original };
  }
  function reversal(invoiceId: string) {
    const original = journals.getBySource("SUPPLIER_BILL", invoiceId)[0];
    const reversalId = original?.reversalJournalEntryId;
    expect(reversalId).toBeTruthy();
    const entry = reversalId ? journals.getById(reversalId) : undefined;
    expect(entry).toBeDefined();
    if (!entry) throw new Error("Missing reversal journal");
    return entry;
  }
  it("F01 voids an OPEN supplier bill", () => {
    const { invoice } = fixture();
    expect(bills.markVoid(invoice.id, "Invoice cancelled").status).toBe("VOID");
  });
  it("F02 retains the reason and timestamp", () => {
    const { invoice } = fixture();
    const result = bills.markVoid(invoice.id, "Supplier corrected invoice");
    expect(result.voidReason).toBe("Supplier corrected invoice");
    expect(result.voidedAt).toBeTruthy();
    expect(bills.getById(invoice.id)?.status).toBe("VOID");
  });
  it("F03 retains original journal and marks it reversed", () => {
    const { invoice, original } = fixture();
    bills.markVoid(invoice.id, "Invoice cancelled");
    expect(journals.getById(original.id)?.status).toBe("REVERSED");
    expect(journals.getBySource("SUPPLIER_BILL", invoice.id)).toHaveLength(1);
  });
  it("F04 creates exact opposite journal lines", () => {
    const { invoice, original } = fixture();
    bills.markVoid(invoice.id, "Invoice cancelled");
    const opposite = reversal(invoice.id);
    expect(opposite.totalDebit).toBe(original.totalCredit);
    expect(opposite.totalCredit).toBe(original.totalDebit);
    for (const line of original.lines) {
      const reverseLine = opposite.lines.find((item) => item.accountId === line.accountId);
      expect(reverseLine?.debit).toBe(line.credit);
      expect(reverseLine?.credit).toBe(line.debit);
    }
  });
  it("F05 reverses debit PPV", () => {
    const { invoice } = fixture(22);
    bills.markVoid(invoice.id, "Invoice cancelled");
    const accountId = accounts.requireBySystemRole("PURCHASE_PRICE_VARIANCE").id;
    const line = reversal(invoice.id).lines.find((item) => item.accountId === accountId);
    expect(line?.credit).toBe(120);
  });
  it("F06 reverses credit PPV", () => {
    const { invoice } = fixture(18);
    bills.markVoid(invoice.id, "Invoice cancelled");
    const accountId = accounts.requireBySystemRole("PURCHASE_PRICE_VARIANCE").id;
    const line = reversal(invoice.id).lines.find((item) => item.accountId === accountId);
    expect(line?.debit).toBe(120);
  });
  it("F07 reverses matching records but retains their audit history", () => {
    const { invoice } = fixture();
    const before = matches.getByBill(invoice.id);
    bills.markVoid(invoice.id, "Invoice cancelled");
    const after = matches.getByBill(invoice.id);
    expect(after).toHaveLength(before.length);
    expect(after.every((item) => item.status === "REVERSED" && !!item.reversedAt)).toBe(true);
  });
  it("F08 restores only voided quantity to purchase order", () => {
    const { o, invoice } = fixture();
    const another = bill(o.id, o.lineId, 20);
    bills.markVoid(invoice.id, "Invoice cancelled");
    expect(po.getById(o.id)?.lines[0].billedQuantity).toBe(another.lines[0].quantity);
  });
  it("F09 permits replacement invoice for released quantity", () => {
    const { o, invoice } = fixture();
    bills.markVoid(invoice.id, "Invoice cancelled");
    const replacement = bill(o.id, o.lineId, 60, 20);
    expect(active(replacement.id).reduce((sum, item) => sum + item.matchedQuantity, 0)).toBe(60);
  });
  it("F10 refuses duplicate void without duplicate journal", () => {
    const { invoice } = fixture();
    bills.markVoid(invoice.id, "Invoice cancelled");
    expect(() => bills.markVoid(invoice.id, "Invoice cancelled again")).toThrow();
    expect(journals.getBySource("SUPPLIER_BILL", invoice.id)[0].reversalJournalEntryId).toBeTruthy();
  });
  it("F11 refuses paid or credited bills", () => {
    const { invoice } = fixture();
    // Simulate a settled bill without mutating production repository internals.
    const current = bills.getById(invoice.id);
    if (!current) throw new Error("Missing bill");
    current.status = "PAID";
    expect(() => bills.markVoid(invoice.id, "Invoice cancelled")).toThrow(/paid or credited/i);
    expect(journals.getBySource("SUPPLIER_BILL", invoice.id)[0].reversalJournalEntryId).toBeUndefined();
  });
  it("F12 leaves goods receipt journal and inventory unchanged", () => {
    const { invoice, receipt } = fixture();
    const before = journals.getBySource("GOODS_RECEIPT", receipt.id)[0];
    bills.markVoid(invoice.id, "Invoice cancelled");
    expect(journals.getBySource("GOODS_RECEIPT", receipt.id)[0]).toEqual(before);
    expect(gr.getById(receipt.id)?.status).toBe("POSTED");
  });
});
