import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import type {
    InventoryCostMovement,
} from "../types/inventoryCost";

type CostEngineModule =
    typeof import("./inventoryCostEngine");

type CostMovementRepository =
    typeof import("./inventoryCostMovementRepository")[
    "inventoryCostMovementRepository"
    ];

type CostBalanceRepository =
    typeof import("./inventoryCostBalanceRepository")[
    "inventoryCostBalanceRepository"
    ];

type ValuationService =
    typeof import("./inventoryValuationService")[
    "calculateInventoryValuation"
    ];

let receiveInventoryCost:
    CostEngineModule["receiveInventoryCost"];

let issueInventoryCost:
    CostEngineModule["issueInventoryCost"];

let restoreInventoryCost:
    CostEngineModule["restoreInventoryCost"];

let inventoryCostMovementRepository:
    CostMovementRepository;

let inventoryCostBalanceRepository:
    CostBalanceRepository;

let calculateInventoryValuation:
    ValuationService;

let productId: string;
let unitId: string;
let siteId: string;
let secondSiteId: string;

let referenceCounter = 0;

const dates = {
    firstReceipt: "2026-10-01",
    secondReceipt: "2026-10-02",
    firstIssue: "2026-10-03",
    secondIssue: "2026-10-04",
    void: "2026-10-05",
};

beforeEach(async () => {
    vi.resetModules();

    const [
        engineModule,
        movementModule,
        balanceModule,
        valuationModule,
        productsModule,
        sitesModule,
    ] = await Promise.all([
        import("./inventoryCostEngine"),
        import("./inventoryCostMovementRepository"),
        import("./inventoryCostBalanceRepository"),
        import("./inventoryValuationService"),
        import("./mockProducts"),
        import("./inventorySiteRepository"),
    ]);

    receiveInventoryCost =
        engineModule.receiveInventoryCost;

    issueInventoryCost =
        engineModule.issueInventoryCost;

    restoreInventoryCost =
        engineModule.restoreInventoryCost;

    inventoryCostMovementRepository =
        movementModule.inventoryCostMovementRepository;

    inventoryCostBalanceRepository =
        balanceModule.inventoryCostBalanceRepository;

    calculateInventoryValuation =
        valuationModule.calculateInventoryValuation;

    const product =
        productsModule.mockProducts.find(
            (item) => item.id === "prod_001",
        );

    if (!product) {
        throw new Error(
            "6J-F test product prod_001 was not found.",
        );
    }

    productId = product.id;
    unitId = product.baseUnitId;

    const sites =
        sitesModule.inventorySiteRepository.getActive();

    if (sites.length < 2) {
        throw new Error(
            "6J-F requires at least two active inventory sites.",
        );
    }

    siteId = sites[0].id;
    secondSiteId = sites[1].id;

    referenceCounter = 0;
});

function nextReference() {
    referenceCounter += 1;

    return `6JF-${referenceCounter}`;
}

function receive(
    quantity: number,
    unitCost: number,
    occurredAt: string,
    targetSiteId = siteId,
) {
    const referenceId = nextReference();

    return receiveInventoryCost({
        siteId: targetSiteId,
        productId,
        unitId,

        quantity,
        transactionUnitCost: unitCost,

        referenceType: "GOODS_RECEIPT",
        referenceId,
        referenceNumber: referenceId,

        inventoryMovementId:
            `physical-${referenceId}`,

        occurredAt,
    });
}

function issue(
    quantity: number,
    occurredAt: string,
    targetSiteId = siteId,
) {
    const referenceId = nextReference();

    return issueInventoryCost({
        siteId: targetSiteId,
        productId,
        unitId,

        quantity,

        referenceType: "SALE",
        referenceId,
        referenceNumber: referenceId,

        inventoryMovementId:
            `physical-${referenceId}`,

        occurredAt,
    });
}

function restore(
    originalIssue: ReturnType<
        CostEngineModule["issueInventoryCost"]
    >,
    occurredAt: string,
) {
    const referenceId = nextReference();

    return restoreInventoryCost({
        siteId,
        productId,

        quantityBase:
            Math.abs(
                originalIssue.movement.quantityBase,
            ),

        unitCostBase:
            originalIssue.movement.unitCostBase,

        inventoryValue:
            Math.abs(
                originalIssue.movement.valueChange,
            ),

        referenceType: "SALE",
        referenceId,
        referenceNumber: referenceId,

        inventoryMovementId:
            `physical-${referenceId}`,

        occurredAt,
    });
}

function valuation(asOfDate: string) {
    return calculateInventoryValuation(
        inventoryCostMovementRepository.getAll(),
        asOfDate,
    );
}

function seedTwoReceipts() {
    receive(
        100,
        20,
        dates.firstReceipt,
    );

    receive(
        100,
        30,
        dates.secondReceipt,
    );
}

function expectValuation(
    asOfDate: string,
    quantity: number,
    value: number,
    averageCost: number,
) {
    const report = valuation(asOfDate);

    expect(report.asOfDate).toBe(asOfDate);
    expect(report.rows).toHaveLength(1);

    const row = report.rows[0];

    expect(row.siteId).toBe(siteId);
    expect(row.productId).toBe(productId);

    expect(row.quantityOnHand).toBeCloseTo(
        quantity,
        4,
    );

    expect(row.inventoryValue).toBeCloseTo(
        value,
        2,
    );

    expect(row.averageCostPerBaseUnit).toBeCloseTo(
        averageCost,
        4,
    );

    expect(report.totalQuantity).toBeCloseTo(
        quantity,
        4,
    );

    expect(report.totalInventoryValue).toBeCloseTo(
        value,
        2,
    );

    expect(report.siteCount).toBe(1);
    expect(report.productCount).toBe(1);

    return report;
}

describe(
    "6J-F Inventory Valuation Integration",
    () => {
        it("F01 returns an empty report without movements", () => {
            const report = valuation("2026-10-01");

            expect(report.rows).toHaveLength(0);
            expect(report.totalQuantity).toBe(0);
            expect(report.totalInventoryValue).toBe(0);
            expect(report.siteCount).toBe(0);
            expect(report.productCount).toBe(0);
        });

        it("F02 values inventory after the first receipt", () => {
            receive(
                100,
                20,
                dates.firstReceipt,
            );

            expectValuation(
                dates.firstReceipt,
                100,
                2000,
                20,
            );
        });

        it("F03 calculates moving average after two receipts", () => {
            seedTwoReceipts();

            expectValuation(
                dates.secondReceipt,
                200,
                5000,
                25,
            );
        });

        it("F04 values inventory after partial issue", () => {
            seedTwoReceipts();

            issue(
                40,
                dates.firstIssue,
            );

            expectValuation(
                dates.firstIssue,
                160,
                4000,
                25,
            );
        });

        it("F05 values inventory after two issues", () => {
            seedTwoReceipts();

            issue(
                40,
                dates.firstIssue,
            );

            issue(
                60,
                dates.secondIssue,
            );

            expectValuation(
                dates.secondIssue,
                100,
                2500,
                25,
            );
        });

        it("F06 preserves historical valuation after later transactions", () => {
            seedTwoReceipts();

            issue(
                40,
                dates.firstIssue,
            );

            issue(
                60,
                dates.secondIssue,
            );

            expectValuation(
                dates.firstReceipt,
                100,
                2000,
                20,
            );

            expectValuation(
                dates.secondReceipt,
                200,
                5000,
                25,
            );

            expectValuation(
                dates.firstIssue,
                160,
                4000,
                25,
            );

            expectValuation(
                dates.secondIssue,
                100,
                2500,
                25,
            );
        });

        it("F07 restores historical issue cost after void", () => {
            seedTwoReceipts();

            issue(
                40,
                dates.firstIssue,
            );

            const secondIssue = issue(
                60,
                dates.secondIssue,
            );

            restore(
                secondIssue,
                dates.void,
            );

            expectValuation(
                dates.secondIssue,
                100,
                2500,
                25,
            );

            const report = expectValuation(
                dates.void,
                160,
                4000,
                25,
            );

            expect(
                report.rows[0].lastMovementAt,
            ).toBe(dates.void);
        });

        it("F08 separates sites and aggregates report totals", () => {
            receive(
                100,
                20,
                dates.firstReceipt,
                siteId,
            );

            receive(
                50,
                30,
                dates.firstReceipt,
                secondSiteId,
            );

            const report = valuation(
                dates.firstReceipt,
            );

            expect(report.rows).toHaveLength(2);

            expect(report.siteCount).toBe(2);
            expect(report.productCount).toBe(1);

            expect(report.totalQuantity).toBe(150);
            expect(report.totalInventoryValue).toBe(3500);

            const firstRow = report.rows.find(
                (row) => row.siteId === siteId,
            );

            const secondRow = report.rows.find(
                (row) => row.siteId === secondSiteId,
            );

            expect(firstRow?.quantityOnHand).toBe(100);
            expect(firstRow?.inventoryValue).toBe(2000);
            expect(firstRow?.averageCostPerBaseUnit).toBe(20);

            expect(secondRow?.quantityOnHand).toBe(50);
            expect(secondRow?.inventoryValue).toBe(1500);
            expect(secondRow?.averageCostPerBaseUnit).toBe(30);
        });

        it("F09 sorts movements by occurredAt before valuation", () => {
            seedTwoReceipts();

            issue(
                40,
                dates.firstIssue,
            );

            const movements =
                inventoryCostMovementRepository.getAll();

            const reversedMovements:
                InventoryCostMovement[] =
                [...movements].reverse();

            const report =
                calculateInventoryValuation(
                    reversedMovements,
                    dates.firstIssue,
                );

            expect(report.rows).toHaveLength(1);
            expect(report.totalQuantity).toBe(160);
            expect(report.totalInventoryValue).toBe(4000);
            expect(
                report.rows[0].averageCostPerBaseUnit,
            ).toBe(25);
        });

        it("F10 rejects invalid valuation date format", () => {
            expect(() =>
                valuation("2026/10/01"),
            ).toThrow();

            expect(() =>
                valuation("invalid-date"),
            ).toThrow();

            expect(() =>
                valuation("2026-10"),
            ).toThrow();
        });

        it("F11 excludes movements after the valuation date", () => {
            seedTwoReceipts();

            issue(
                40,
                dates.firstIssue,
            );

            const report = valuation(
                dates.firstReceipt,
            );

            expect(report.rows).toHaveLength(1);
            expect(report.totalQuantity).toBe(100);
            expect(report.totalInventoryValue).toBe(2000);
        });

        it("F12 matches current cost balance at latest date", () => {
            seedTwoReceipts();

            issue(
                40,
                dates.firstIssue,
            );

            issue(
                60,
                dates.secondIssue,
            );

            const report = valuation(
                dates.secondIssue,
            );

            const balance =
                inventoryCostBalanceRepository.getBalance(
                    siteId,
                    productId,
                );

            expect(balance).toBeDefined();
            expect(report.rows).toHaveLength(1);

            expect(
                report.rows[0].quantityOnHand,
            ).toBeCloseTo(
                balance!.quantityOnHand,
                4,
            );

            expect(
                report.rows[0].inventoryValue,
            ).toBeCloseTo(
                balance!.inventoryValue,
                2,
            );

            expect(
                report.rows[0].averageCostPerBaseUnit,
            ).toBeCloseTo(
                balance!.averageCostPerBaseUnit,
                4,
            );
        });
    },
);