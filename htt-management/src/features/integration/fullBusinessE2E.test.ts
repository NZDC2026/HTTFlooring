import { installQuoteTestStorage } from "../sales/data/testQuoteLocalStorage";
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

type PurchaseOrderRepository =
    typeof import("../purchases/data/purchaseOrderRepository")[
    "purchaseOrderRepository"
    ];

type GoodsReceiptRepository =
    typeof import("../purchases/data/goodsReceiptRepository")[
    "goodsReceiptRepository"
    ];

type SalesRepository =
    typeof import("../sales/data/salesRepository")[
    "salesRepository"
    ];

type FulfilmentRepository =
    typeof import("../sales/data/salesFulfilmentRepository")[
    "salesFulfilmentRepository"
    ];

type StockRepository =
    typeof import("../inventory/data/stockRepository")[
    "stockRepository"
    ];

type CostBalanceRepository =
    typeof import("../inventory/data/inventoryCostBalanceRepository")[
    "inventoryCostBalanceRepository"
    ];

type CostMovementRepository =
    typeof import("../inventory/data/inventoryCostMovementRepository")[
    "inventoryCostMovementRepository"
    ];

type JournalRepository =
    typeof import("../accounting/data/journalEntryRepository")[
    "journalEntryRepository"
    ];

type AccountRepository =
    typeof import("../accounting/data/accountRepository")[
    "accountRepository"
    ];

type ValuationService =
    typeof import("../inventory/data/inventoryValuationService")[
    "calculateInventoryValuation"
    ];

type ProfitAndLossService =
    typeof import("../accounting/data/profitAndLossService")[
    "calculateProfitAndLoss"
    ];

let purchaseOrderRepository: PurchaseOrderRepository;
let goodsReceiptRepository: GoodsReceiptRepository;

let salesRepository: SalesRepository;
let salesFulfilmentRepository: FulfilmentRepository;

let stockRepository: StockRepository;

let inventoryCostBalanceRepository: CostBalanceRepository;
let inventoryCostMovementRepository: CostMovementRepository;

let journalEntryRepository: JournalRepository;
let accountRepository: AccountRepository;

let calculateInventoryValuation: ValuationService;
let calculateProfitAndLoss: ProfitAndLossService;

let productId: string;
let unitId: string;
let siteId: string;
let supplierId: string;

const dates = {
    purchase: "2026-10-01",
    receipt1: "2026-10-02",
    receipt2: "2026-10-03",
    sales: "2026-10-04",
    fulfilment: "2026-10-05",
    void: "2026-10-06",
};

beforeEach(async () => {
    installQuoteTestStorage();
    vi.resetModules();

    const [
        purchaseModule,
        receiptModule,
        salesModule,
        fulfilmentModule,
        stockModule,
        balanceModule,
        movementModule,
        journalModule,
        accountModule,
        valuationModule,
        profitModule,
        productsModule,
        sitesModule,
        suppliersModule,
    ] = await Promise.all([
        import("../purchases/data/purchaseOrderRepository"),
        import("../purchases/data/goodsReceiptRepository"),

        import("../sales/data/salesRepository"),
        import("../sales/data/salesFulfilmentRepository"),

        import("../inventory/data/stockRepository"),
        import("../inventory/data/inventoryCostBalanceRepository"),
        import("../inventory/data/inventoryCostMovementRepository"),

        import("../accounting/data/journalEntryRepository"),
        import("../accounting/data/accountRepository"),

        import("../inventory/data/inventoryValuationService"),
        import("../accounting/data/profitAndLossService"),

        import("../inventory/data/mockProducts"),
        import("../inventory/data/inventorySiteRepository"),
        import("../contacts/data/supplierRepository"),
    ]);

    purchaseOrderRepository =
        purchaseModule.purchaseOrderRepository;

    goodsReceiptRepository =
        receiptModule.goodsReceiptRepository;

    salesRepository =
        salesModule.salesRepository;

    salesFulfilmentRepository =
        fulfilmentModule.salesFulfilmentRepository;

    stockRepository =
        stockModule.stockRepository;

    inventoryCostBalanceRepository =
        balanceModule.inventoryCostBalanceRepository;

    inventoryCostMovementRepository =
        movementModule.inventoryCostMovementRepository;

    journalEntryRepository =
        journalModule.journalEntryRepository;

    accountRepository =
        accountModule.accountRepository;

    calculateInventoryValuation =
        valuationModule.calculateInventoryValuation;

    calculateProfitAndLoss =
        profitModule.calculateProfitAndLoss;

    const product =
        productsModule.mockProducts.find(
            (item) => item.id === "prod_001",
        );

    if (!product) {
        throw new Error("Test product was not found.");
    }

    productId = product.id;
    unitId = product.baseUnitId;

    const site =
        sitesModule.inventorySiteRepository.getActive()[0];

    if (!site) {
        throw new Error("Active inventory site was not found.");
    }

    siteId = site.id;

    const supplier =
        suppliersModule.supplierRepository
            .getAll()
            .find((item) => item.status === "ACTIVE");

    if (!supplier) {
        throw new Error("Active supplier was not found.");
    }

    supplierId = supplier.id;
});

/**
 * Real Purchase Order → Goods Receipt.
 */
function purchaseAndReceive(
    quantity: number,
    unitCost: number,
    receiptDate: string,
) {
    const purchaseOrder =
        purchaseOrderRepository.create({
            supplierId,
            orderDate: dates.purchase,

            lines: [
                {
                    productId,
                    unitId,
                    orderedQuantity: quantity,
                    unitCost,
                },
            ],
        });

    purchaseOrderRepository.approve(
        purchaseOrder.id,
    );

    purchaseOrderRepository.send(
        purchaseOrder.id,
    );

    const sentOrder =
        purchaseOrderRepository.getById(
            purchaseOrder.id,
        );

    if (!sentOrder) {
        throw new Error("Purchase order was not found.");
    }

    const receipt =
        goodsReceiptRepository.create({
            purchaseOrderId: sentOrder.id,
            siteId,
            receiptDate,

            lines: [
                {
                    purchaseOrderLineId:
                        sentOrder.lines[0].id,

                    receivedQuantity: quantity,
                },
            ],
        });

    return {
        purchaseOrder: sentOrder,
        receipt,
    };
}

function seedInventory() {
    purchaseAndReceive(
        100,
        20,
        dates.receipt1,
    );

    purchaseAndReceive(
        100,
        30,
        dates.receipt2,
    );
}

/**
 * Real Quote → Sales Order.
 */
function createSalesOrder(
    quantity = 40,
    unitPrice = 40,
) {
    const quote =
        salesRepository.createQuote({
            customerId: "cus_001",
            documentDate: dates.sales,

            lines: [
                {
                    productId,
                    unitId,
                    quantity,
                    unitPrice,
                },
            ],
        });

    salesRepository.sendQuote(
        quote.id,
    );

    salesRepository.acceptQuote(
        quote.id,
    );

    return salesRepository.convertQuoteToOrder(
        quote.id,
    );
}

/**
 * Real Sales Fulfilment.
 */
function fulfilOrder(
    orderId: string,
    orderLineId: string,
    quantity: number,
) {
    return salesFulfilmentRepository.create({
        salesOrderId: orderId,
        siteId,
        fulfilmentDate: dates.fulfilment,

        lines: [
            {
                salesOrderLineId: orderLineId,
                fulfilledQuantity: quantity,
            },
        ],
    });
}

function stockQuantity() {
    return (
        stockRepository.getBalance(
            siteId,
            productId,
        )?.quantityOnHand ?? 0
    );
}

function costBalance() {
    return inventoryCostBalanceRepository.getBalance(
        siteId,
        productId,
    );
}

function costIssues(
    fulfilmentId: string,
) {
    return inventoryCostMovementRepository
        .getByReference(
            "SALE",
            fulfilmentId,
        )
        .filter(
            (movement) =>
                movement.movementType === "ISSUE",
        );
}

function getCogsJournal(
    fulfilmentId: string,
) {
    return journalEntryRepository.getBySource(
        "SALES_FULFILMENT",
        fulfilmentId,
    );
}

function getInvoiceJournal(
    invoiceId: string,
) {
    return journalEntryRepository.getBySource(
        "CUSTOMER_INVOICE",
        invoiceId,
    );
}

function valuation(
    asOfDate: string,
) {
    return calculateInventoryValuation(
        inventoryCostMovementRepository.getAll(),
        asOfDate,
    );
}

function profitAndLoss(
    fromDate: string,
    toDate: string,
) {
    return calculateProfitAndLoss(
        accountRepository.getAll(),
        journalEntryRepository.getAll(),
        fromDate,
        toDate,
    );
}

/**
 * Creates the complete business chain:
 *
 * PO → Receipt → Quote → Order
 * → Fulfilment → Invoice
 */
function completeBusinessFlow() {
    seedInventory();

    const order =
        createSalesOrder(40, 40);

    const fulfilment =
        fulfilOrder(
            order.id,
            order.lines[0].id,
            40,
        );

    const invoice =
        salesRepository.createInvoiceFromOrder(
            order.id,
        );

    return {
        order,
        fulfilment,
        invoice,
    };
}

describe(
    "6J-I Full Business E2E Integration",
    () => {
        it("I01 synchronizes physical and cost inventory after goods receipt", () => {
            purchaseAndReceive(
                100,
                20,
                dates.receipt1,
            );

            expect(stockQuantity()).toBe(100);

            expect(
                costBalance()?.quantityOnHand,
            ).toBe(100);

            expect(
                costBalance()?.inventoryValue,
            ).toBe(2000);

            expect(
                costBalance()?.averageCostPerBaseUnit,
            ).toBe(20);
        });

        it("I02 calculates moving average across real purchase receipts", () => {
            seedInventory();

            expect(stockQuantity()).toBe(200);

            expect(
                costBalance()?.quantityOnHand,
            ).toBe(200);

            expect(
                costBalance()?.inventoryValue,
            ).toBe(5000);

            expect(
                costBalance()?.averageCostPerBaseUnit,
            ).toBe(25);
        });

        it("I03 converts a real quote into a confirmed sales order", () => {
            const order =
                createSalesOrder();

            expect(order.status).toBe("CONFIRMED");

            expect(order.lines).toHaveLength(1);

            expect(
                order.lines[0].quantity,
            ).toBe(40);

            expect(
                order.lines[0].unitPrice,
            ).toBe(40);
        });

        it("I04 decreases physical inventory after fulfilment", () => {
            seedInventory();

            const order =
                createSalesOrder();

            const fulfilment =
                fulfilOrder(
                    order.id,
                    order.lines[0].id,
                    40,
                );

            expect(fulfilment.status).toBe("ACTIVE");

            expect(stockQuantity()).toBe(160);

            expect(
                salesRepository.getById(order.id)?.status,
            ).toBe("FULFILLED");
        });

        it("I05 issues inventory using real moving average cost", () => {
            seedInventory();

            const order =
                createSalesOrder();

            const fulfilment =
                fulfilOrder(
                    order.id,
                    order.lines[0].id,
                    40,
                );

            const issues =
                costIssues(fulfilment.id);

            expect(issues).toHaveLength(1);

            expect(
                issues[0].unitCostBase,
            ).toBe(25);

            expect(
                issues[0].valueChange,
            ).toBe(-1000);

            expect(
                costBalance()?.quantityOnHand,
            ).toBe(160);

            expect(
                costBalance()?.inventoryValue,
            ).toBe(4000);
        });

        it("I06 automatically posts COGS journal from fulfilment", () => {
            seedInventory();

            const order =
                createSalesOrder();

            const fulfilment =
                fulfilOrder(
                    order.id,
                    order.lines[0].id,
                    40,
                );

            const journals =
                getCogsJournal(
                    fulfilment.id,
                );

            expect(journals).toHaveLength(1);

            const journal = journals[0];

            expect(journal.status).toBe("POSTED");

            const cogsAccount =
                accountRepository.requireBySystemRole(
                    "COST_OF_GOODS_SOLD",
                );

            const inventoryAccount =
                accountRepository.requireBySystemRole(
                    "INVENTORY",
                );

            const cogsLine =
                journal.lines.find(
                    (line) =>
                        line.accountId === cogsAccount.id,
                );

            const inventoryLine =
                journal.lines.find(
                    (line) =>
                        line.accountId === inventoryAccount.id,
                );

            expect(cogsLine?.debit).toBe(1000);
            expect(cogsLine?.credit).toBe(0);

            expect(inventoryLine?.debit).toBe(0);
            expect(inventoryLine?.credit).toBe(1000);
        });

        it("I07 automatically posts revenue journal from customer invoice", () => {
            const {
                invoice,
            } = completeBusinessFlow();

            const journals =
                getInvoiceJournal(
                    invoice.id,
                );

            expect(journals).toHaveLength(1);

            const journal = journals[0];

            expect(journal.status).toBe("POSTED");

            const revenueAccount =
                accountRepository.requireBySystemRole(
                    "SALES_REVENUE",
                );

            const revenueLine =
                journal.lines.find(
                    (line) =>
                        line.accountId === revenueAccount.id,
                );

            expect(revenueLine).toBeDefined();

            expect(revenueLine?.debit).toBe(0);

            expect(revenueLine?.credit).toBe(1600);

            expect(invoice.totals.subtotal).toBe(1600);
        });

        it("I08 calculates gross profit from real fulfilment and invoice journals", () => {
            const {
                invoice,
            } = completeBusinessFlow();

            /*
             * Invoice date is generated by
             * the production Sales Repository.
             *
             * Use the actual document date
             * instead of assuming it is the
             * same as the fulfilment date.
             */
            const result =
                profitAndLoss(
                    dates.fulfilment,
                    invoice.documentDate,
                );

            expect(result.salesRevenue).toBe(1600);

            expect(result.costOfGoodsSold).toBe(1000);

            expect(result.grossProfit).toBe(600);

            expect(result.netProfit).toBe(600);
        });

        it("I09 calculates gross margin from real journals", () => {
            const {
                invoice,
            } = completeBusinessFlow();

            const result =
                profitAndLoss(
                    dates.fulfilment,
                    invoice.documentDate,
                );

            expect(
                result.grossMarginPercent,
            ).toBe(37.5);
        });

        it("I10 produces correct historical inventory valuation", () => {
            seedInventory();

            const order =
                createSalesOrder();

            fulfilOrder(
                order.id,
                order.lines[0].id,
                40,
            );

            const beforeSale =
                valuation(
                    dates.receipt2,
                );

            expect(
                beforeSale.totalQuantity,
            ).toBe(200);

            expect(
                beforeSale.totalInventoryValue,
            ).toBe(5000);

            const afterSale =
                valuation(
                    dates.fulfilment,
                );

            expect(
                afterSale.totalQuantity,
            ).toBe(160);

            expect(
                afterSale.totalInventoryValue,
            ).toBe(4000);
        });

        it("I11 supports partial fulfilments with cumulative COGS", () => {
            seedInventory();

            const order =
                createSalesOrder(100, 40);

            const first =
                fulfilOrder(
                    order.id,
                    order.lines[0].id,
                    40,
                );

            const second =
                fulfilOrder(
                    order.id,
                    order.lines[0].id,
                    60,
                );

            expect(stockQuantity()).toBe(100);

            expect(
                costBalance()?.inventoryValue,
            ).toBe(2500);

            const firstIssues =
                costIssues(first.id);

            const secondIssues =
                costIssues(second.id);

            expect(firstIssues).toHaveLength(1);
            expect(secondIssues).toHaveLength(1);

            expect(
                firstIssues[0].valueChange,
            ).toBe(-1000);

            expect(
                secondIssues[0].valueChange,
            ).toBe(-1500);

            const firstJournal =
                getCogsJournal(first.id)[0];

            const secondJournal =
                getCogsJournal(second.id)[0];

            expect(firstJournal).toBeDefined();
            expect(secondJournal).toBeDefined();

            expect(
                firstJournal.totalDebit +
                secondJournal.totalDebit,
            ).toBe(2500);

            expect(
                salesRepository.getById(order.id)?.status,
            ).toBe("FULFILLED");
        });

        it("I12 restores inventory and reverses COGS when fulfilment is voided", () => {
            seedInventory();

            const order =
                createSalesOrder();

            const fulfilment =
                fulfilOrder(
                    order.id,
                    order.lines[0].id,
                    40,
                );

            const originalJournal =
                getCogsJournal(
                    fulfilment.id,
                )[0];

            expect(originalJournal).toBeDefined();

            expect(stockQuantity()).toBe(160);

            salesFulfilmentRepository.void({
                fulfilmentId: fulfilment.id,
                voidDate: dates.void,
                reason: "Customer cancelled delivery",
            });

            expect(stockQuantity()).toBe(200);

            expect(
                costBalance()?.quantityOnHand,
            ).toBe(200);

            expect(
                costBalance()?.inventoryValue,
            ).toBe(5000);

            expect(
                salesFulfilmentRepository.getById(
                    fulfilment.id,
                )?.status,
            ).toBe("VOIDED");

            expect(
                salesRepository.getById(order.id)?.status,
            ).toBe("CONFIRMED");

            const reversedJournal =
                journalEntryRepository.getById(
                    originalJournal.id,
                );

            expect(
                reversedJournal?.status,
            ).toBe("REVERSED");
        });
    },
);