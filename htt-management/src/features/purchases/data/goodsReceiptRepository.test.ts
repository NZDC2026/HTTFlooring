import { installPurchaseTestStorage } from './purchaseTestStorage';
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import type {
    PurchaseOrder,
} from "../types/purchaseOrder";

import type {
    Product,
} from "../../inventory/types/product";

import type {
    InventorySite,
} from "../../inventory/types/inventorySite";

import type {
    Supplier,
} from "../../contacts/types/supplier";

/**
 * Repository module types.
 *
 * These are type-only references.
 * They do not initialize repository singletons.
 */
type GoodsReceiptRepositoryModule =
    typeof import("./goodsReceiptRepository");

type PurchaseOrderRepositoryModule =
    typeof import("./purchaseOrderRepository");

type InventoryMovementRepositoryModule =
    typeof import(
    "../../inventory/data/inventoryMovementRepository"
    );

type InventoryCostMovementRepositoryModule =
    typeof import(
    "../../inventory/data/inventoryCostMovementRepository"
    );

type InventoryCostBalanceRepositoryModule =
    typeof import(
    "../../inventory/data/inventoryCostBalanceRepository"
    );

type StockRepositoryModule =
    typeof import(
    "../../inventory/data/stockRepository"
    );

type MockProductsModule =
    typeof import(
    "../../inventory/data/mockProducts"
    );

type InventorySiteRepositoryModule =
    typeof import(
    "../../inventory/data/inventorySiteRepository"
    );

type SupplierRepositoryModule =
    typeof import(
    "../../contacts/data/supplierRepository"
    );

/**
 * Repositories are assigned fresh instances
 * before every test.
 */
let goodsReceiptRepository:
    GoodsReceiptRepositoryModule["goodsReceiptRepository"];

let purchaseOrderRepository:
    PurchaseOrderRepositoryModule["purchaseOrderRepository"];

let inventoryMovementRepository:
    InventoryMovementRepositoryModule["inventoryMovementRepository"];

let inventoryCostMovementRepository:
    InventoryCostMovementRepositoryModule["inventoryCostMovementRepository"];

let inventoryCostBalanceRepository:
    InventoryCostBalanceRepositoryModule["inventoryCostBalanceRepository"];

let stockRepository:
    StockRepositoryModule["stockRepository"];

let mockProducts:
    MockProductsModule["mockProducts"];

let inventorySiteRepository:
    InventorySiteRepositoryModule["inventorySiteRepository"];

let supplierRepository:
    SupplierRepositoryModule["supplierRepository"];

/**
 * Test fixtures.
 */
let product: Product;

let baseUnit:
    Product["units"][number];

let boxUnit:
    Product["units"][number];

let site: InventorySite;

let supplier: Supplier;

const orderDate =
    "2026-10-01";

const receiptDate =
    "2026-10-02";

/**
 * Reset the complete module graph before each test.
 *
 * Important:
 * All repositories must be imported AFTER
 * vi.resetModules().
 *
 * This ensures Goods Receipt, Purchase Order,
 * Stock and Inventory Cost repositories
 * share the same fresh module instances.
 */
beforeEach(async () => {
    installPurchaseTestStorage();
    vi.resetModules();

    const [
        goodsReceiptModule,
        purchaseOrderModule,
        inventoryMovementModule,
        inventoryCostMovementModule,
        inventoryCostBalanceModule,
        stockModule,
        productsModule,
        sitesModule,
        suppliersModule,
    ] = await Promise.all([
        import("./goodsReceiptRepository"),

        import("./purchaseOrderRepository"),

        import(
            "../../inventory/data/inventoryMovementRepository"
        ),

        import(
            "../../inventory/data/inventoryCostMovementRepository"
        ),

        import(
            "../../inventory/data/inventoryCostBalanceRepository"
        ),

        import(
            "../../inventory/data/stockRepository"
        ),

        import(
            "../../inventory/data/mockProducts"
        ),

        import(
            "../../inventory/data/inventorySiteRepository"
        ),

        import(
            "../../contacts/data/supplierRepository"
        ),
    ]);

    goodsReceiptRepository =
        goodsReceiptModule.goodsReceiptRepository;

    purchaseOrderRepository =
        purchaseOrderModule.purchaseOrderRepository;

    inventoryMovementRepository =
        inventoryMovementModule.inventoryMovementRepository;

    inventoryCostMovementRepository =
        inventoryCostMovementModule.inventoryCostMovementRepository;

    inventoryCostBalanceRepository =
        inventoryCostBalanceModule.inventoryCostBalanceRepository;

    stockRepository =
        stockModule.stockRepository;

    mockProducts =
        productsModule.mockProducts;

    inventorySiteRepository =
        sitesModule.inventorySiteRepository;

    supplierRepository =
        suppliersModule.supplierRepository;

    /**
     * Select fixtures from the freshly loaded modules.
     */
    product =
        mockProducts.find(
            (item) =>
                item.id === "prod_001",
        )!;

    baseUnit =
        product.units.find(
            (unit) =>
                unit.isBaseUnit,
        )!;

    boxUnit =
        product.units.find(
            (unit) =>
                unit.code === "BOX",
        )!;

    site =
        inventorySiteRepository.getActive()[0];

    supplier =
        supplierRepository
            .getAll()
            .find(
                (item) =>
                    item.status === "ACTIVE",
            )!;
});

/**
 * Create a real Purchase Order through
 * the production repository.
 */
function createPurchaseOrder(
    quantity = 100,
    unitCost = 20,
    unitId = baseUnit.id,
): PurchaseOrder {
    return purchaseOrderRepository.create({
        supplierId:
            supplier.id,

        orderDate,

        lines: [
            {
                productId:
                    product.id,

                unitId,

                orderedQuantity:
                    quantity,

                unitCost,
            },
        ],
    });
}

/**
 * Follow the real PO lifecycle:
 *
 * DRAFT → APPROVED → SENT
 */
function createSentPurchaseOrder(
    quantity = 100,
    unitCost = 20,
    unitId = baseUnit.id,
) {
    const order =
        createPurchaseOrder(
            quantity,
            unitCost,
            unitId,
        );

    purchaseOrderRepository.approve(
        order.id,
    );

    purchaseOrderRepository.send(
        order.id,
    );

    return purchaseOrderRepository.getById(
        order.id,
    )!;
}

function receive(
    order: PurchaseOrder,
    quantity: number,
) {
    return goodsReceiptRepository.create({
        purchaseOrderId:
            order.id,

        siteId:
            site.id,

        receiptDate,

        lines: [
            {
                purchaseOrderLineId:
                    order.lines[0].id,

                receivedQuantity:
                    quantity,
            },
        ],
    });
}

function getStockQuantity() {
    return (
        stockRepository.getBalance(
            site.id,
            product.id,
        )?.quantityOnHand ?? 0
    );
}

function getCostBalance() {
    return inventoryCostBalanceRepository.getBalance(
        site.id,
        product.id,
    );
}

describe("6J-C Goods Receipt Integration", () => {
    it("C01 creates a posted goods receipt", () => {
        const order = createSentPurchaseOrder();
        const receipt = receive(order, 100);

        expect(receipt.status).toBe("POSTED");
        expect(receipt.purchaseOrderId).toBe(order.id);
        expect(receipt.lines).toHaveLength(1);
        expect(receipt.lines[0].receivedQuantity).toBe(100);

        expect(
            goodsReceiptRepository.getById(receipt.id),
        ).toBeDefined();
    });

    it("C02 updates PO after partial receipt", () => {
        const order = createSentPurchaseOrder();

        receive(order, 40);

        const updated =
            purchaseOrderRepository.getById(order.id)!;

        expect(updated.status).toBe("PARTIALLY_RECEIVED");
        expect(updated.lines[0].receivedQuantity).toBe(40);
    });

    it("C03 completes PO after remaining receipt", () => {
        const order = createSentPurchaseOrder();

        receive(order, 40);
        receive(order, 60);

        const updated =
            purchaseOrderRepository.getById(order.id)!;

        expect(updated.status).toBe("RECEIVED");
        expect(updated.lines[0].receivedQuantity).toBe(100);
    });

    it("C04 increases physical stock", () => {
        const order = createSentPurchaseOrder();

        receive(order, 100);

        expect(getStockQuantity()).toBe(100);
    });

    it("C05 increases inventory cost balance", () => {
        const order = createSentPurchaseOrder();

        receive(order, 100);

        const balance = getCostBalance();

        expect(balance).toBeDefined();
        expect(balance!.quantityOnHand).toBe(100);
        expect(balance!.inventoryValue).toBe(2000);
        expect(balance!.averageCostPerBaseUnit).toBe(20);
    });

    it("C06 links cost movement to physical movement", () => {
        const order = createSentPurchaseOrder();
        const receipt = receive(order, 100);

        const physicalMovements =
            inventoryMovementRepository.getByReference(
                "GOODS_RECEIPT",
                receipt.id,
            );

        const costMovements =
            inventoryCostMovementRepository.getByReference(
                "GOODS_RECEIPT",
                receipt.id,
            );

        expect(physicalMovements).toHaveLength(1);
        expect(costMovements).toHaveLength(1);

        expect(costMovements[0].inventoryMovementId).toBe(
            physicalMovements[0].id,
        );

        expect(costMovements[0].quantityBase).toBe(100);
        expect(costMovements[0].valueChange).toBe(2000);
    });

    it("C07 rejects over-receipt without changing balances", () => {
        const order = createSentPurchaseOrder();

        receive(order, 80);

        const stockBefore = getStockQuantity();
        const costBefore = structuredClone(getCostBalance());

        const movementCountBefore =
            inventoryCostMovementRepository.getAll().length;

        expect(() => receive(order, 30)).toThrow();

        expect(getStockQuantity()).toBe(stockBefore);
        expect(getCostBalance()).toEqual(costBefore);

        expect(
            inventoryCostMovementRepository.getAll(),
        ).toHaveLength(movementCountBefore);
    });

    it("C08 rejects receipt for draft PO", () => {
        const order = createPurchaseOrder();

        expect(() => receive(order, 20)).toThrow();

        expect(getStockQuantity()).toBe(0);
    });

    it("C09 rejects duplicate PO lines", () => {
        const order = createSentPurchaseOrder();
        const lineId = order.lines[0].id;

        expect(() =>
            goodsReceiptRepository.create({
                purchaseOrderId: order.id,
                siteId: site.id,
                receiptDate,
                lines: [
                    {
                        purchaseOrderLineId: lineId,
                        receivedQuantity: 20,
                    },
                    {
                        purchaseOrderLineId: lineId,
                        receivedQuantity: 20,
                    },
                ],
            }),
        ).toThrow();

        expect(getStockQuantity()).toBe(0);
    });

    it("C10 converts box quantities into base units", () => {
        const order = createSentPurchaseOrder(
            10,
            50,
            boxUnit.id,
        );

        const receipt = receive(order, 10);

        const expectedBaseQuantity =
            10 * boxUnit.conversionToBase;

        expect(
            receipt.lines[0].receivedBaseQuantity,
        ).toBeCloseTo(expectedBaseQuantity, 4);

        expect(getStockQuantity()).toBeCloseTo(
            expectedBaseQuantity,
            4,
        );

        const cost = getCostBalance();

        expect(cost!.quantityOnHand).toBeCloseTo(
            expectedBaseQuantity,
            4,
        );

        expect(cost!.inventoryValue).toBe(500);

        expect(cost!.averageCostPerBaseUnit).toBeCloseTo(
            500 / expectedBaseQuantity,
            4,
        );
    });
});