import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

type SalesRepository =
    typeof import("./salesRepository")["salesRepository"];

type FulfilmentRepository =
    typeof import("./salesFulfilmentRepository")["salesFulfilmentRepository"];

type PurchaseOrderRepository =
    typeof import("../../purchases/data/purchaseOrderRepository")["purchaseOrderRepository"];

type GoodsReceiptRepository =
    typeof import("../../purchases/data/goodsReceiptRepository")["goodsReceiptRepository"];

type StockRepository =
    typeof import("../../inventory/data/stockRepository")["stockRepository"];

type CostBalanceRepository =
    typeof import("../../inventory/data/inventoryCostBalanceRepository")["inventoryCostBalanceRepository"];

type CostMovementRepository =
    typeof import("../../inventory/data/inventoryCostMovementRepository")["inventoryCostMovementRepository"];

type InventoryMovementRepository =
    typeof import("../../inventory/data/inventoryMovementRepository")["inventoryMovementRepository"];

type JournalRepository =
    typeof import("../../accounting/data/journalEntryRepository")["journalEntryRepository"];

let salesRepository: SalesRepository;
let salesFulfilmentRepository: FulfilmentRepository;

let purchaseOrderRepository: PurchaseOrderRepository;
let goodsReceiptRepository: GoodsReceiptRepository;

let stockRepository: StockRepository;
let inventoryCostBalanceRepository: CostBalanceRepository;
let inventoryCostMovementRepository: CostMovementRepository;
let inventoryMovementRepository: InventoryMovementRepository;

let journalEntryRepository: JournalRepository;

let productId: string;
let unitId: string;
let siteId: string;
let supplierId: string;

const orderDate = "2026-10-01";
const receiptDate = "2026-10-02";
const fulfilmentDate = "2026-10-03";
const voidDate = "2026-10-04";

beforeEach(async () => {
    vi.resetModules();

    const [
        salesModule,
        fulfilmentModule,
        purchaseOrderModule,
        goodsReceiptModule,
        stockModule,
        costBalanceModule,
        costMovementModule,
        inventoryMovementModule,
        journalModule,
        productsModule,
        sitesModule,
        suppliersModule,
    ] = await Promise.all([
        import("./salesRepository"),
        import("./salesFulfilmentRepository"),

        import("../../purchases/data/purchaseOrderRepository"),
        import("../../purchases/data/goodsReceiptRepository"),

        import("../../inventory/data/stockRepository"),
        import("../../inventory/data/inventoryCostBalanceRepository"),
        import("../../inventory/data/inventoryCostMovementRepository"),
        import("../../inventory/data/inventoryMovementRepository"),

        import("../../accounting/data/journalEntryRepository"),

        import("../../inventory/data/mockProducts"),
        import("../../inventory/data/inventorySiteRepository"),
        import("../../contacts/data/supplierRepository"),
    ]);

    salesRepository =
        salesModule.salesRepository;

    salesFulfilmentRepository =
        fulfilmentModule.salesFulfilmentRepository;

    purchaseOrderRepository =
        purchaseOrderModule.purchaseOrderRepository;

    goodsReceiptRepository =
        goodsReceiptModule.goodsReceiptRepository;

    stockRepository =
        stockModule.stockRepository;

    inventoryCostBalanceRepository =
        costBalanceModule.inventoryCostBalanceRepository;

    inventoryCostMovementRepository =
        costMovementModule.inventoryCostMovementRepository;

    inventoryMovementRepository =
        inventoryMovementModule.inventoryMovementRepository;

    journalEntryRepository =
        journalModule.journalEntryRepository;

    const product =
        productsModule.mockProducts.find(
            (item) => item.id === "prod_001",
        );

    if (!product) {
        throw new Error("Test product prod_001 was not found.");
    }

    productId = product.id;
    unitId = product.baseUnitId;

    const site =
        sitesModule.inventorySiteRepository.getActive()[0];

    if (!site) {
        throw new Error("No active inventory site.");
    }

    siteId = site.id;

    const supplier =
        suppliersModule.supplierRepository
            .getAll()
            .find((item) => item.status === "ACTIVE");

    if (!supplier) {
        throw new Error("No active supplier.");
    }

    supplierId = supplier.id;
});

/**
 * Create real stock through:
 *
 * Purchase Order
 * → Approve
 * → Send
 * → Goods Receipt
 *
 * This updates physical inventory and
 * inventory costing together.
 */
function receiveStock(
    quantity: number,
    unitCost: number,
) {
    const order = purchaseOrderRepository.create({
        supplierId,
        orderDate,

        lines: [
            {
                productId,
                unitId,
                orderedQuantity: quantity,
                unitCost,
            },
        ],
    });

    purchaseOrderRepository.approve(order.id);
    purchaseOrderRepository.send(order.id);

    const sentOrder =
        purchaseOrderRepository.getById(order.id)!;

    return goodsReceiptRepository.create({
        purchaseOrderId: sentOrder.id,
        siteId,
        receiptDate,

        lines: [
            {
                purchaseOrderLineId: sentOrder.lines[0].id,
                receivedQuantity: quantity,
            },
        ],
    });
}

function seedInventory() {
    receiveStock(100, 20);
    receiveStock(100, 30);
}

/**
 * Create a confirmed Sales Order.
 */
function createOrder(quantity = 100) {
    const quote = salesRepository.createQuote({
        customerId: "cus_001",
        documentDate: orderDate,

        lines: [
            {
                productId,
                unitId,
                quantity,
                unitPrice: 40,
            },
        ],
    });

    salesRepository.sendQuote(quote.id);
    salesRepository.acceptQuote(quote.id);

    return salesRepository.convertQuoteToOrder(quote.id);
}

function fulfil(
    orderId: string,
    orderLineId: string,
    quantity: number,
) {
    return salesFulfilmentRepository.create({
        salesOrderId: orderId,
        siteId,
        fulfilmentDate,

        lines: [
            {
                salesOrderLineId: orderLineId,
                fulfilledQuantity: quantity,
            },
        ],
    });
}

function voidFulfilment(
    fulfilmentId: string,
    date = voidDate,
    reason = "Customer cancelled delivery",
) {
    return salesFulfilmentRepository.void({
        fulfilmentId,
        voidDate: date,
        reason,
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

function costMovements(fulfilmentId: string) {
    return inventoryCostMovementRepository.getByReference(
        "SALE",
        fulfilmentId,
    );
}

function physicalReturns(fulfilmentId: string) {
    return inventoryMovementRepository.getByReference(
        "SALES_FULFILMENT_VOID",
        fulfilmentId,
    );
}

function journals(fulfilmentId: string) {
    return journalEntryRepository.getBySource(
        "SALES_FULFILMENT",
        fulfilmentId,
    );
}

describe("6J-E Fulfilment Void / Reversal Integration", () => {
    it("E01 marks fulfilment as VOIDED", () => {
        seedInventory();

        const order = createOrder();

        const fulfilment = fulfil(
            order.id,
            order.lines[0].id,
            40,
        );

        const result = voidFulfilment(fulfilment.id);

        expect(result.status).toBe("VOIDED");
        expect(result.voidDate).toBe(voidDate);
        expect(result.voidReason).toBe(
            "Customer cancelled delivery",
        );

        expect(
            salesFulfilmentRepository.getById(
                fulfilment.id,
            )?.status,
        ).toBe("VOIDED");
    });

    it("E02 restores physical inventory", () => {
        seedInventory();

        const order = createOrder();

        const fulfilment = fulfil(
            order.id,
            order.lines[0].id,
            40,
        );

        expect(stockQuantity()).toBe(160);

        voidFulfilment(fulfilment.id);

        expect(stockQuantity()).toBe(200);

        const returns = physicalReturns(fulfilment.id);

        expect(returns).toHaveLength(1);
        expect(returns[0].movementType).toBe("RETURN_IN");
        expect(returns[0].quantityBase).toBe(40);
    });

    it("E03 restores original historical cost", () => {
        seedInventory();

        const order = createOrder();

        const fulfilment = fulfil(
            order.id,
            order.lines[0].id,
            40,
        );

        const originalIssue =
            costMovements(fulfilment.id).find(
                (movement) =>
                    movement.movementType === "ISSUE",
            );

        expect(originalIssue).toBeDefined();
        expect(originalIssue!.unitCostBase).toBe(25);
        expect(originalIssue!.valueChange).toBe(-1000);

        voidFulfilment(fulfilment.id);

        const balance = costBalance();

        expect(balance?.quantityOnHand).toBe(200);
        expect(balance?.inventoryValue).toBe(5000);
        expect(balance?.averageCostPerBaseUnit).toBe(25);

        const restored =
            costMovements(fulfilment.id).filter(
                (movement) =>
                    movement.movementType === "RETURN_IN",
            );

        expect(restored).toHaveLength(1);
        expect(restored[0].quantityBase).toBe(40);
        expect(restored[0].valueChange).toBe(1000);
        expect(restored[0].unitCostBase).toBe(25);
    });

    it("E04 reverses original COGS journal", () => {
        seedInventory();

        const order = createOrder();

        const fulfilment = fulfil(
            order.id,
            order.lines[0].id,
            40,
        );

        const original = journals(fulfilment.id)[0];

        expect(original).toBeDefined();

        const originalDebit = original.lines.reduce(
            (sum, line) => sum + line.debit,
            0,
        );

        expect(originalDebit).toBe(1000);

        voidFulfilment(fulfilment.id);

        const updatedOriginal =
            journalEntryRepository.getById(original.id);

        expect(updatedOriginal?.status).toBe("REVERSED");

        const reversalId =
            updatedOriginal?.reversalJournalEntryId;

        expect(reversalId).toBeDefined();

        const reversal =
            journalEntryRepository.getById(reversalId!);

        expect(reversal).toBeDefined();

        const reversalDebit = reversal!.lines.reduce(
            (sum, line) => sum + line.debit,
            0,
        );

        const reversalCredit = reversal!.lines.reduce(
            (sum, line) => sum + line.credit,
            0,
        );

        expect(reversalDebit).toBe(1000);
        expect(reversalCredit).toBe(1000);

        // The reversal must swap the original debit/credit.
        for (const originalLine of original.lines) {
            const reversedLine = reversal!.lines.find(
                (line) =>
                    line.accountId === originalLine.accountId,
            );

            expect(reversedLine).toBeDefined();

            expect(reversedLine!.debit).toBe(
                originalLine.credit,
            );

            expect(reversedLine!.credit).toBe(
                originalLine.debit,
            );
        }
    });

    it("E05 recalculates sales order fulfilment status", () => {
        seedInventory();

        const order = createOrder(100);

        const first = fulfil(
            order.id,
            order.lines[0].id,
            40,
        );

        const second = fulfil(
            order.id,
            order.lines[0].id,
            60,
        );

        expect(
            salesRepository.getById(order.id)?.status,
        ).toBe("FULFILLED");

        voidFulfilment(second.id);

        expect(
            salesRepository.getById(order.id)?.status,
        ).toBe("PARTIALLY_FULFILLED");

        expect(
            salesFulfilmentRepository.getRemainingQuantity(
                order.id,
                order.lines[0].id,
            ),
        ).toBe(60);

        expect(stockQuantity()).toBe(160);
        expect(costBalance()?.inventoryValue).toBe(4000);

        voidFulfilment(first.id);

        expect(
            salesRepository.getById(order.id)?.status,
        ).toBe("CONFIRMED");

        expect(
            salesFulfilmentRepository.getRemainingQuantity(
                order.id,
                order.lines[0].id,
            ),
        ).toBe(100);

        expect(stockQuantity()).toBe(200);
        expect(costBalance()?.inventoryValue).toBe(5000);
    });

    it("E06 rejects duplicate void without duplicate restoration", () => {
        seedInventory();

        const order = createOrder();

        const fulfilment = fulfil(
            order.id,
            order.lines[0].id,
            40,
        );

        voidFulfilment(fulfilment.id);

        const stockBefore = stockQuantity();
        const costBefore = structuredClone(costBalance());
        const journalCountBefore =
            journalEntryRepository.getAll().length;

        expect(() =>
            voidFulfilment(fulfilment.id),
        ).toThrow();

        expect(stockQuantity()).toBe(stockBefore);
        expect(costBalance()).toEqual(costBefore);

        expect(
            journalEntryRepository.getAll(),
        ).toHaveLength(journalCountBefore);

        expect(physicalReturns(fulfilment.id)).toHaveLength(1);
    });

    it("E07 rejects void date earlier than fulfilment date", () => {
        seedInventory();

        const order = createOrder();

        const fulfilment = fulfil(
            order.id,
            order.lines[0].id,
            40,
        );

        const stockBefore = stockQuantity();
        const costBefore = structuredClone(costBalance());

        expect(() =>
            voidFulfilment(
                fulfilment.id,
                "2026-10-02",
            ),
        ).toThrow();

        expect(stockQuantity()).toBe(stockBefore);
        expect(costBalance()).toEqual(costBefore);
        expect(physicalReturns(fulfilment.id)).toHaveLength(0);

        expect(
            salesFulfilmentRepository.getById(
                fulfilment.id,
            )?.status,
        ).toBe("ACTIVE");
    });

    it("E08 rejects invalid void reason", () => {
        seedInventory();

        const order = createOrder();

        const fulfilment = fulfil(
            order.id,
            order.lines[0].id,
            40,
        );

        const stockBefore = stockQuantity();
        const costBefore = structuredClone(costBalance());

        expect(() =>
            voidFulfilment(
                fulfilment.id,
                voidDate,
                "x",
            ),
        ).toThrow();

        expect(stockQuantity()).toBe(stockBefore);
        expect(costBalance()).toEqual(costBefore);
        expect(physicalReturns(fulfilment.id)).toHaveLength(0);
    });

    it("E09 restores each original cost issue exactly once", () => {
        seedInventory();

        /*
         * Create two sales order lines
         * for the same product and quantity.
         */
        const quote = salesRepository.createQuote({
            customerId: "cus_001",
            documentDate: orderDate,

            lines: [
                {
                    productId,
                    unitId,
                    quantity: 20,
                    unitPrice: 40,
                },
                {
                    productId,
                    unitId,
                    quantity: 20,
                    unitPrice: 40,
                },
            ],
        });

        salesRepository.sendQuote(quote.id);
        salesRepository.acceptQuote(quote.id);

        const order =
            salesRepository.convertQuoteToOrder(
                quote.id,
            );

        const fulfilment =
            salesFulfilmentRepository.create({
                salesOrderId: order.id,
                siteId,
                fulfilmentDate,

                lines: [
                    {
                        salesOrderLineId:
                            order.lines[0].id,

                        fulfilledQuantity: 20,
                    },
                    {
                        salesOrderLineId:
                            order.lines[1].id,

                        fulfilledQuantity: 20,
                    },
                ],
            });

        const originalIssues =
            inventoryCostMovementRepository
                .getByReference(
                    "SALE",
                    fulfilment.id,
                )
                .filter(
                    (movement) =>
                        movement.movementType ===
                        "ISSUE",
                );

        expect(originalIssues).toHaveLength(2);

        const originalIssueValue =
            originalIssues.reduce(
                (sum, movement) =>
                    sum +
                    Math.abs(
                        movement.valueChange,
                    ),
                0,
            );

        expect(originalIssueValue).toBe(1000);

        expect(stockQuantity()).toBe(160);
        expect(costBalance()?.inventoryValue).toBe(4000);

        voidFulfilment(fulfilment.id);

        const restoredMovements =
            inventoryCostMovementRepository
                .getByReference(
                    "SALE",
                    fulfilment.id,
                )
                .filter(
                    (movement) =>
                        movement.movementType ===
                        "RETURN_IN",
                );

        expect(restoredMovements).toHaveLength(2);

        const restoredQuantity =
            restoredMovements.reduce(
                (sum, movement) =>
                    sum +
                    movement.quantityBase,
                0,
            );

        const restoredValue =
            restoredMovements.reduce(
                (sum, movement) =>
                    sum +
                    movement.valueChange,
                0,
            );

        expect(restoredQuantity).toBe(40);

        expect(restoredValue).toBe(
            originalIssueValue,
        );

        expect(stockQuantity()).toBe(200);

        expect(
            costBalance()?.quantityOnHand,
        ).toBe(200);

        expect(
            costBalance()?.inventoryValue,
        ).toBe(5000);
    });

    it("E10 rejects void for invoiced sales order without side effects", () => {
        seedInventory();

        const order =
            createOrder(100);

        const fulfilment =
            fulfil(
                order.id,
                order.lines[0].id,
                100,
            );

        expect(
            salesRepository.getById(order.id)?.status,
        ).toBe("FULFILLED");

        /*
         * Create invoice from the
         * fulfilled sales order.
         */
        salesRepository.createInvoiceFromOrder(
            order.id,
        );

        expect(
            salesRepository.getById(order.id)?.status,
        ).toBe("INVOICED");

        /*
         * Capture all relevant state
         * before attempting void.
         */
        const stockBefore =
            stockQuantity();

        const costBefore =
            structuredClone(
                costBalance(),
            );

        const costMovementsBefore =
            inventoryCostMovementRepository
                .getAll()
                .length;

        const physicalMovementsBefore =
            inventoryMovementRepository
                .getAll()
                .length;

        const journalsBefore =
            structuredClone(
                journalEntryRepository.getAll(),
            );

        /*
         * Voiding an invoiced order
         * must fail before any mutation.
         */
        expect(() =>
            voidFulfilment(
                fulfilment.id,
            ),
        ).toThrow(
            "Cannot void a sales fulfilment for an invoiced sales order.",
        );

        /*
         * Physical inventory unchanged.
         */
        expect(
            stockQuantity(),
        ).toBe(stockBefore);

        /*
         * Inventory cost unchanged.
         */
        expect(
            costBalance(),
        ).toEqual(costBefore);

        /*
         * No new cost movements.
         */
        expect(
            inventoryCostMovementRepository
                .getAll(),
        ).toHaveLength(
            costMovementsBefore,
        );

        /*
         * No new physical movements.
         */
        expect(
            inventoryMovementRepository
                .getAll(),
        ).toHaveLength(
            physicalMovementsBefore,
        );

        /*
         * No GL journal reversal.
         */
        expect(
            journalEntryRepository.getAll(),
        ).toEqual(
            journalsBefore,
        );

        /*
         * Fulfilment remains ACTIVE.
         */
        expect(
            salesFulfilmentRepository
                .getById(
                    fulfilment.id,
                )?.status,
        ).toBe("ACTIVE");

        /*
         * Sales order remains INVOICED.
         */
        expect(
            salesRepository
                .getById(
                    order.id,
                )?.status,
        ).toBe("INVOICED");

        /*
         * No return movements.
         */
        expect(
            physicalReturns(
                fulfilment.id,
            ),
        ).toHaveLength(0);
    });
});