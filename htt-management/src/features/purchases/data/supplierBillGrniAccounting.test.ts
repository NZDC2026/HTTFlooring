import { beforeEach, describe, expect, it, vi } from "vitest";

let poRepo: typeof import("./purchaseOrderRepository")["purchaseOrderRepository"];
let receiptRepo: typeof import("./goodsReceiptRepository")["goodsReceiptRepository"];
let billRepo: typeof import("./supplierBillRepository")["supplierBillRepository"];
let journalRepo: typeof import("../../accounting/data/journalEntryRepository")["journalEntryRepository"];
let accountRepo: typeof import("../../accounting/data/accountRepository")["accountRepository"];
let costRepo: typeof import("../../inventory/data/inventoryCostBalanceRepository")["inventoryCostBalanceRepository"];
let posting: typeof import("../../accounting/data/purchasesAccountingPostingService")["purchasesAccountingPostingService"];
let productId: string;
let unitId: string;
let siteId: string;
let supplierId: string;
let invoiceSequence = 0;

beforeEach(async () => {
    vi.resetModules();
    const [po, receipt, bill, journal, account, cost, service, products, sites, suppliers] = await Promise.all([
        import("./purchaseOrderRepository"),
        import("./goodsReceiptRepository"),
        import("./supplierBillRepository"),
        import("../../accounting/data/journalEntryRepository"),
        import("../../accounting/data/accountRepository"),
        import("../../inventory/data/inventoryCostBalanceRepository"),
        import("../../accounting/data/purchasesAccountingPostingService"),
        import("../../inventory/data/mockProducts"),
        import("../../inventory/data/inventorySiteRepository"),
        import("../../contacts/data/supplierRepository"),
    ]);
    poRepo = po.purchaseOrderRepository;
    receiptRepo = receipt.goodsReceiptRepository;
    billRepo = bill.supplierBillRepository;
    journalRepo = journal.journalEntryRepository;
    accountRepo = account.accountRepository;
    costRepo = cost.inventoryCostBalanceRepository;
    posting = service.purchasesAccountingPostingService;
    const product = products.mockProducts.find((item) => item.id === "prod_001");
    const site = sites.inventorySiteRepository.getActive()[0];
    const supplier = suppliers.supplierRepository.getAll().find((item) => item.status === "ACTIVE");
    if (!product || !site || !supplier) throw new Error("6K-C test fixture is missing.");
    productId = product.id;
    unitId = product.baseUnitId;
    siteId = site.id;
    supplierId = supplier.id;
    invoiceSequence = 0;
});

function createReceivedOrder(quantity = 100, unitCost = 20) {
    const po = poRepo.create({
        supplierId,
        orderDate: "2026-10-01",
        lines: [{ productId, unitId, orderedQuantity: quantity, unitCost }],
    });
    poRepo.approve(po.id);
    poRepo.send(po.id);
    const line = poRepo.getById(po.id)?.lines[0];
    if (!line) throw new Error("PO line not found.");
    const receipt = receiptRepo.create({
        purchaseOrderId: po.id,
        siteId,
        receiptDate: "2026-10-02",
        lines: [{ purchaseOrderLineId: line.id, receivedQuantity: quantity }],
    });
    return { po, receipt, line };
}

function createBill(poId: string, lineId: string, quantity = 100, unitCost = 20) {
    invoiceSequence += 1;
    return billRepo.create({
        purchaseOrderId: poId,
        supplierInvoiceNumber: `TEST-GRNI-${invoiceSequence}`,
        billDate: "2026-10-03",
        dueDate: "2026-11-03",
        lines: [{ purchaseOrderLineId: lineId, quantity, unitCost }],
    });
}

function sourceJournal(sourceType: "GOODS_RECEIPT" | "SUPPLIER_BILL", sourceId: string) {
    const journals = journalRepo.getBySource(sourceType, sourceId);
    expect(journals).toHaveLength(1);
    return journals[0];
}

function amountForRole(
    journal: ReturnType<typeof sourceJournal>,
    role: Parameters<typeof accountRepo.requireBySystemRole>[0],
) {
    const accountId = accountRepo.requireBySystemRole(role).id;
    return journal.lines
        .filter((line) => line.accountId === accountId)
        .reduce((sum, line) => sum + line.debit - line.credit, 0);
}

describe("6K-C Supplier Bill GRNI Accounting", () => {
    it("C01 creates one posted Supplier Bill journal", () => {
        const { po, line } = createReceivedOrder();
        const bill = createBill(po.id, line.id);
        const journal = sourceJournal("SUPPLIER_BILL", bill.id);
        expect(journal.status).toBe("POSTED");
        expect(journal.journalDate).toBe(bill.billDate);
        expect(journal.sourceId).toBe(bill.id);
    });

    it("C02 debits GRNI for the actual receipt cost", () => {
        const { po, line } = createReceivedOrder();
        const bill = createBill(po.id, line.id);
        expect(amountForRole(sourceJournal("SUPPLIER_BILL", bill.id), "GRNI")).toBe(2000);
    });

    it("C03 debits GST Receivable", () => {
        const { po, line } = createReceivedOrder();
        const bill = createBill(po.id, line.id);
        expect(amountForRole(sourceJournal("SUPPLIER_BILL", bill.id), "GST_RECEIVABLE")).toBe(bill.totals.taxAmount);
    });

    it("C04 credits Accounts Payable and balances the journal", () => {
        const { po, line } = createReceivedOrder();
        const bill = createBill(po.id, line.id);
        const journal = sourceJournal("SUPPLIER_BILL", bill.id);
        expect(amountForRole(journal, "ACCOUNTS_PAYABLE")).toBe(-bill.totals.total);
        expect(journal.totalDebit).toBe(bill.totals.total);
        expect(journal.totalCredit).toBe(bill.totals.total);
    });

    it("C05 does not debit Inventory again on billing", () => {
        const { po, receipt, line } = createReceivedOrder();
        const receiptJournal = sourceJournal("GOODS_RECEIPT", receipt.id);
        expect(amountForRole(receiptJournal, "INVENTORY")).toBe(2000);
        const bill = createBill(po.id, line.id);
        expect(amountForRole(sourceJournal("SUPPLIER_BILL", bill.id), "INVENTORY")).toBe(0);
        expect(costRepo.getBalance(siteId, productId)?.inventoryValue).toBe(2000);
    });

    it("C06 is idempotent when the same bill is posted twice", () => {
        const { po, line } = createReceivedOrder();
        const bill = createBill(po.id, line.id);
        const original = sourceJournal("SUPPLIER_BILL", bill.id);
        const repeated = posting.postSupplierBill(bill);
        expect(repeated.id).toBe(original.id);
        expect(journalRepo.getBySource("SUPPLIER_BILL", bill.id)).toHaveLength(1);
    });

    it("C07 rejects an invoice price higher than receipt cost without changing billed quantity", () => {
        const { po, line } = createReceivedOrder();
        expect(() => createBill(po.id, line.id, 100, 22)).toThrow(/price differs|variance/i);
        expect(poRepo.getById(po.id)?.lines[0].billedQuantity).toBe(0);
        expect(billRepo.getByPurchaseOrder(po.id)).toHaveLength(0);
    });

    it("C08 rejects an invoice price lower than receipt cost without changing billed quantity", () => {
        const { po, line } = createReceivedOrder();
        expect(() => createBill(po.id, line.id, 100, 18)).toThrow(/price differs|variance/i);
        expect(poRepo.getById(po.id)?.lines[0].billedQuantity).toBe(0);
        expect(billRepo.getByPurchaseOrder(po.id)).toHaveLength(0);
    });

    it("C09 supports partial billing and multiple bills in 6K-D", () => {
        const { po, line } = createReceivedOrder();
        const first = createBill(po.id, line.id, 40, 20);
        const second = createBill(po.id, line.id, 60, 20);
        expect(poRepo.getById(po.id)?.lines[0].billedQuantity).toBe(100);
        expect(billRepo.getByPurchaseOrder(po.id)).toHaveLength(2);
        expect(amountForRole(sourceJournal("SUPPLIER_BILL", first.id), "GRNI")).toBe(800);
        expect(amountForRole(sourceJournal("SUPPLIER_BILL", second.id), "GRNI")).toBe(1200);
    });

    it("C10 clears GRNI after full receipt and billing", () => {
        const { po, receipt, line } = createReceivedOrder();
        const bill = createBill(po.id, line.id);
        const receiptJournal = sourceJournal("GOODS_RECEIPT", receipt.id);
        const billJournal = sourceJournal("SUPPLIER_BILL", bill.id);
        expect(amountForRole(receiptJournal, "GRNI")).toBe(-2000);
        expect(amountForRole(billJournal, "GRNI")).toBe(2000);
        expect(amountForRole(receiptJournal, "GRNI") + amountForRole(billJournal, "GRNI")).toBe(0);
        expect(amountForRole(receiptJournal, "INVENTORY") + amountForRole(billJournal, "INVENTORY")).toBe(2000);
        expect(costRepo.getBalance(siteId, productId)?.inventoryValue).toBe(2000);
    });
});
