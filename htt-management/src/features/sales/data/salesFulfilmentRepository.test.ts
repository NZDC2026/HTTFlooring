import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import type {
    SalesOrder,
} from "../types/salesDocument";

type SalesRepository =
    typeof import("./salesRepository")["salesRepository"];

type FulfilmentRepository =
    typeof import("./salesFulfilmentRepository")["salesFulfilmentRepository"];

type StockRepository =
    typeof import("../../inventory/data/stockRepository")["stockRepository"];

type InventoryMovementRepository =
    typeof import("../../inventory/data/inventoryMovementRepository")["inventoryMovementRepository"];

type CostBalanceRepository =
    typeof import("../../inventory/data/inventoryCostBalanceRepository")["inventoryCostBalanceRepository"];

type CostMovementRepository =
    typeof import("../../inventory/data/inventoryCostMovementRepository")["inventoryCostMovementRepository"];

type JournalRepository =
    typeof import("../../accounting/data/journalEntryRepository")["journalEntryRepository"];

type ReceiveInventoryCost =
    typeof import("../../inventory/data/inventoryCostEngine")["receiveInventoryCost"];

type Product =
    typeof import("../../inventory/data/mockProducts")["mockProducts"][number];

let salesRepository: SalesRepository;
let salesFulfilmentRepository: FulfilmentRepository;

let stockRepository: StockRepository;
let inventoryMovementRepository: InventoryMovementRepository;

let inventoryCostBalanceRepository: CostBalanceRepository;
let inventoryCostMovementRepository: CostMovementRepository;

let journalEntryRepository: JournalRepository;

let receiveInventoryCost: ReceiveInventoryCost;

let product: Product;

let siteId: string;
let productId: string;
let unitId: string;

const documentDate = "2026-10-01";
const fulfilmentDate = "2026-10-03";

let referenceCounter = 0;

/**
 * Reload the complete repository module graph
 * before every test.
 */
beforeEach(async () => {
    vi.resetModules();

    const [
        salesModule,
        fulfilmentModule,
        stockModule,
        inventoryMovementModule,
        costBalanceModule,
        costMovementModule,
        journalModule,
        costEngineModule,
        productsModule,
        siteModule,
    ] = await Promise.all([
        import("./salesRepository"),

        import("./salesFulfilmentRepository"),

        import("../../inventory/data/stockRepository"),

        import("../../inventory/data/inventoryMovementRepository"),

        import("../../inventory/data/inventoryCostBalanceRepository"),

        import("../../inventory/data/inventoryCostMovementRepository"),

        import("../../accounting/data/journalEntryRepository"),

        import("../../inventory/data/inventoryCostEngine"),

        import("../../inventory/data/mockProducts"),

        import("../../inventory/data/inventorySiteRepository"),
    ]);

    salesRepository =
        salesModule.salesRepository;

    salesFulfilmentRepository =
        fulfilmentModule.salesFulfilmentRepository;

    stockRepository =
        stockModule.stockRepository;

    inventoryMovementRepository =
        inventoryMovementModule.inventoryMovementRepository;

    inventoryCostBalanceRepository =
        costBalanceModule.inventoryCostBalanceRepository;

    inventoryCostMovementRepository =
        costMovementModule.inventoryCostMovementRepository;

    journalEntryRepository =
        journalModule.journalEntryRepository;

    receiveInventoryCost =
        costEngineModule.receiveInventoryCost;

    product =
        productsModule.mockProducts.find(
            (item) => item.id === "prod_001",
        )!;

    productId = product.id;
    unitId = product.baseUnitId;

    siteId =
        siteModule.inventorySiteRepository.getActive()[0].id;

    referenceCounter = 0;
});

/**
 * Create a confirmed sales order using
 * the real sales workflow:
 *
 * DRAFT QUOTE
 * → SENT
 * → ACCEPTED
 * → CONFIRMED SALES ORDER
 */
function createConfirmedSalesOrder(
    quantity = 100,
): SalesOrder {
    const quote = salesRepository.createQuote({
        customerId: "cus_001",
        documentDate,

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

    return salesRepository.convertQuoteToOrder(
        quote.id,
    );
}

/**
 * Seed both physical inventory and cost inventory.
 *
 * Physical movement is created first,
 * then the same movement ID is used
 * for inventory costing.
 */
function receiveStock(
    quantity: number,
    unitCost: number,
) {
    referenceCounter += 1;

    const referenceId =
        `6JD-RECEIPT-${referenceCounter}`;

    const physical =
        inventoryMovementRepository.create({
            movementType: "GOODS_RECEIPT",

            siteId,
            productId,

            baseUnitId: unitId,

            quantityBase: quantity,

            transactionUnitId: unitId,
            transactionUnitSymbol: "m²",
            transactionQuantity: quantity,

            conversionToBase: 1,

            referenceType: "GOODS_RECEIPT",
            referenceId,
            referenceNumber: referenceId,

            occurredAt: documentDate,
        });

    stockRepository.receive({
        siteId,
        productId,

        baseUnitId: unitId,

        quantityBase: quantity,
    });

    receiveInventoryCost({
        siteId,
        productId,
        unitId,

        quantity,

        transactionUnitCost: unitCost,

        referenceType: "GOODS_RECEIPT",
        referenceId,
        referenceNumber: referenceId,

        inventoryMovementId: physical.id,

        occurredAt: documentDate,
    });
}

function seedInventory() {
    receiveStock(100, 20);
    receiveStock(100, 30);
}

function createFulfilment(
    order: SalesOrder,
    quantity: number,
) {
    return salesFulfilmentRepository.create({
        salesOrderId: order.id,

        siteId,

        fulfilmentDate,

        lines: [
            {
                salesOrderLineId: order.lines[0].id,
                fulfilledQuantity: quantity,
            },
        ],
    });
}

function getStockQuantity() {
    return (
        stockRepository.getBalance(
            siteId,
            productId,
        )?.quantityOnHand ?? 0
    );
}

function getCostBalance() {
    return inventoryCostBalanceRepository.getBalance(
        siteId,
        productId,
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

describe(
    "6J-D Sales Fulfilment Integration",
    () => {
        it(
            "D01 creates an active fulfilment",
            () => {
                seedInventory();

                const order =
                    createConfirmedSalesOrder();

                const fulfilment =
                    createFulfilment(order, 40);

                expect(fulfilment.status).toBe("ACTIVE");

                expect(fulfilment.salesOrderId).toBe(
                    order.id,
                );

                expect(fulfilment.lines).toHaveLength(1);

                expect(
                    fulfilment.lines[0].fulfilledQuantity,
                ).toBe(40);

                expect(
                    salesFulfilmentRepository.getById(
                        fulfilment.id,
                    ),
                ).toBeDefined();
            },
        );

        it(
            "D02 reduces physical stock and cost balance",
            () => {
                seedInventory();

                const order =
                    createConfirmedSalesOrder();

                createFulfilment(order, 40);

                expect(getStockQuantity()).toBe(160);

                const cost = getCostBalance();

                expect(cost).toBeDefined();

                expect(cost!.quantityOnHand).toBe(160);

                expect(cost!.inventoryValue).toBe(4000);

                expect(
                    cost!.averageCostPerBaseUnit,
                ).toBe(25);

                const updatedOrder =
                    salesRepository.getById(order.id);

                expect(updatedOrder?.status).toBe(
                    "PARTIALLY_FULFILLED",
                );
            },
        );

        it(
            "D03 posts Dr COGS and Cr Inventory",
            () => {
                seedInventory();

                const order =
                    createConfirmedSalesOrder();

                const fulfilment =
                    createFulfilment(order, 40);

                const journals =
                    getCogsJournal(fulfilment.id);

                expect(journals).toHaveLength(1);

                const journal = journals[0];

                expect(journal.sourceType).toBe(
                    "SALES_FULFILMENT",
                );

                expect(journal.sourceId).toBe(
                    fulfilment.id,
                );

                const totalDebit =
                    journal.lines.reduce(
                        (sum, line) =>
                            sum + line.debit,
                        0,
                    );

                const totalCredit =
                    journal.lines.reduce(
                        (sum, line) =>
                            sum + line.credit,
                        0,
                    );

                expect(totalDebit).toBe(1000);
                expect(totalCredit).toBe(1000);

                const debitLine =
                    journal.lines.find(
                        (line) => line.debit === 1000,
                    );

                const creditLine =
                    journal.lines.find(
                        (line) => line.credit === 1000,
                    );

                expect(debitLine).toBeDefined();
                expect(creditLine).toBeDefined();
            },
        );

        it(
            "D04 completes sales order after second fulfilment",
            () => {
                seedInventory();

                const order =
                    createConfirmedSalesOrder();

                const first =
                    createFulfilment(order, 40);

                const second =
                    createFulfilment(order, 60);

                expect(first.status).toBe("ACTIVE");
                expect(second.status).toBe("ACTIVE");

                expect(getStockQuantity()).toBe(100);

                const cost = getCostBalance();

                expect(cost!.quantityOnHand).toBe(100);
                expect(cost!.inventoryValue).toBe(2500);

                expect(
                    salesRepository.getById(order.id)?.status,
                ).toBe("FULFILLED");

                expect(
                    salesFulfilmentRepository.getRemainingQuantity(
                        order.id,
                        order.lines[0].id,
                    ),
                ).toBe(0);

                const firstJournal =
                    getCogsJournal(first.id);

                const secondJournal =
                    getCogsJournal(second.id);

                expect(firstJournal).toHaveLength(1);
                expect(secondJournal).toHaveLength(1);

                expect(
                    firstJournal[0].lines.reduce(
                        (sum, line) => sum + line.debit,
                        0,
                    ),
                ).toBe(1000);

                expect(
                    secondJournal[0].lines.reduce(
                        (sum, line) => sum + line.debit,
                        0,
                    ),
                ).toBe(1500);
            },
        );

        it(
            "D05 rejects fulfilment exceeding remaining order quantity",
            () => {
                seedInventory();

                const order =
                    createConfirmedSalesOrder();

                createFulfilment(order, 80);

                const stockBefore =
                    getStockQuantity();

                const costBefore =
                    structuredClone(getCostBalance());

                const journalCountBefore =
                    journalEntryRepository.getAll().length;

                expect(() =>
                    createFulfilment(order, 30),
                ).toThrow();

                expect(getStockQuantity()).toBe(
                    stockBefore,
                );

                expect(getCostBalance()).toEqual(
                    costBefore,
                );

                expect(
                    journalEntryRepository.getAll(),
                ).toHaveLength(journalCountBefore);
            },
        );

        it(
            "D06 rejects fulfilment when physical stock is insufficient",
            () => {
                receiveStock(20, 25);

                const order =
                    createConfirmedSalesOrder(100);

                expect(() =>
                    createFulfilment(order, 40),
                ).toThrow();

                expect(getStockQuantity()).toBe(20);

                expect(
                    getCostBalance()?.inventoryValue,
                ).toBe(500);

                expect(
                    getCogsJournal("non-existent"),
                ).toHaveLength(0);
            },
        );

        it(
            "D07 rejects duplicate sales order lines",
            () => {
                seedInventory();

                const order =
                    createConfirmedSalesOrder();

                const lineId = order.lines[0].id;

                expect(() =>
                    salesFulfilmentRepository.create({
                        salesOrderId: order.id,

                        siteId,

                        fulfilmentDate,

                        lines: [
                            {
                                salesOrderLineId: lineId,
                                fulfilledQuantity: 20,
                            },
                            {
                                salesOrderLineId: lineId,
                                fulfilledQuantity: 20,
                            },
                        ],
                    }),
                ).toThrow();

                expect(getStockQuantity()).toBe(200);

                expect(
                    salesFulfilmentRepository.getBySalesOrder(
                        order.id,
                    ),
                ).toHaveLength(0);
            },
        );

        it(
            "D08 links issue cost movements to physical movements",
            () => {
                seedInventory();

                const order =
                    createConfirmedSalesOrder();

                const fulfilment =
                    createFulfilment(order, 40);

                const physicalMovements =
                    inventoryMovementRepository.getByReference(
                        "SALES_FULFILMENT",
                        fulfilment.id,
                    );

                const costMovements =
                    inventoryCostMovementRepository.getByReference(
                        "SALE",
                        fulfilment.id,
                    );

                expect(physicalMovements).toHaveLength(1);
                expect(costMovements).toHaveLength(1);

                expect(
                    costMovements[0].inventoryMovementId,
                ).toBe(physicalMovements[0].id);

                expect(
                    physicalMovements[0].quantityBase,
                ).toBe(-40);

                expect(
                    costMovements[0].quantityBase,
                ).toBe(-40);

                expect(
                    costMovements[0].valueChange,
                ).toBe(-1000);

                expect(
                    costMovements[0].unitCostBase,
                ).toBe(25);
            },
        );
    },
);