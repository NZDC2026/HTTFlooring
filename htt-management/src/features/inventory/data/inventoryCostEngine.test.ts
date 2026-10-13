import {
    beforeEach,
    describe,
    expect,
    it,
} from "vitest";

import {
    receiveInventoryCost,
    issueInventoryCost,
    restoreInventoryCost,
} from "./inventoryCostEngine";

import {
    inventoryCostBalanceRepository,
} from "./inventoryCostBalanceRepository";

import {
    inventoryCostMovementRepository,
} from "./inventoryCostMovementRepository";

import {
    mockProducts,
} from "./mockProducts";

import {
    inventorySiteRepository,
} from "./inventorySiteRepository";

const product =
    mockProducts[0];

const sites =
    inventorySiteRepository.getAll();

const siteId =
    sites[0].id;

const secondSiteId =
    sites[1]?.id;

const productId =
    product.id;

const unitId =
    product.baseUnitId;

const occurredAt =
    "2026-10-01";

let referenceCounter =
    0;

function nextReference() {
    referenceCounter += 1;

    return `6JB-${referenceCounter}`;
}

function receive(
    quantity: number,
    transactionUnitCost: number,
    targetSiteId = siteId,
) {
    const reference =
        nextReference();

    return receiveInventoryCost({
        siteId: targetSiteId,
        productId,
        unitId,

        quantity,
        transactionUnitCost,

        referenceType: "GOODS_RECEIPT",
        referenceId: reference,
        referenceNumber: reference,

        inventoryMovementId:
            `physical-${reference}`,

        occurredAt,
    });
}

function issue(
    quantity: number,
    targetSiteId = siteId,
) {
    const reference =
        nextReference();

    return issueInventoryCost({
        siteId: targetSiteId,
        productId,
        unitId,

        quantity,

        referenceType: "SALE",
        referenceId: reference,
        referenceNumber: reference,

        inventoryMovementId:
            `physical-${reference}`,

        occurredAt,
    });
}

function restore(
    quantityBase: number,
    unitCostBase: number,
    inventoryValue: number,
) {
    const reference =
        nextReference();

    return restoreInventoryCost({
        siteId,
        productId,

        quantityBase,
        unitCostBase,
        inventoryValue,

        referenceType: "SALE",
        referenceId: reference,
        referenceNumber: reference,

        inventoryMovementId:
            `physical-${reference}`,

        occurredAt: "2026-10-08",
    });
}

function getBalance(
    targetSiteId = siteId,
) {
    return inventoryCostBalanceRepository
        .requireBalance(
            targetSiteId,
            productId,
        );
}

function expectBalance(
    quantity: number,
    value: number,
    averageCost: number,
) {
    const balance =
        getBalance();

    expect(
        balance.quantityOnHand,
    ).toBeCloseTo(quantity, 4);

    expect(
        balance.inventoryValue,
    ).toBeCloseTo(value, 2);

    expect(
        balance.averageCostPerBaseUnit,
    ).toBeCloseTo(averageCost, 4);
}

beforeEach(() => {
    inventoryCostBalanceRepository.clear();

    inventoryCostMovementRepository.clear();

    referenceCounter = 0;
});

describe(
    "6J-B Inventory Cost Engine Integration",
    () => {
        it(
            "B01 receives initial inventory",
            () => {
                const result =
                    receive(100, 20);

                expectBalance(
                    100,
                    2000,
                    20,
                );

                expect(
                    result.movement.movementType,
                ).toBe("RECEIPT");

                expect(
                    result.movement.quantityBase,
                ).toBe(100);

                expect(
                    result.movement.valueChange,
                ).toBe(2000);

                expect(
                    inventoryCostMovementRepository
                        .getAll(),
                ).toHaveLength(1);
            },
        );

        it(
            "B02 calculates moving weighted average",
            () => {
                receive(100, 20);

                receive(100, 30);

                expectBalance(
                    200,
                    5000,
                    25,
                );

                expect(
                    inventoryCostMovementRepository
                        .getAll(),
                ).toHaveLength(2);
            },
        );

        it(
            "B03 issues inventory using current average cost",
            () => {
                receive(100, 20);

                receive(100, 30);

                const result =
                    issue(40);

                expectBalance(
                    160,
                    4000,
                    25,
                );

                expect(
                    result.movement.quantityBase,
                ).toBe(-40);

                expect(
                    result.movement.valueChange,
                ).toBe(-1000);

                expect(
                    result.movement.unitCostBase,
                ).toBe(25);
            },
        );

        it(
            "B04 supports multiple partial issues",
            () => {
                receive(100, 20);

                receive(100, 30);

                issue(40);

                const secondIssue =
                    issue(60);

                expectBalance(
                    100,
                    2500,
                    25,
                );

                expect(
                    secondIssue.movement.valueChange,
                ).toBe(-1500);
            },
        );

        it(
            "B05 restores exact historical issue cost",
            () => {
                receive(100, 20);

                receive(100, 30);

                issue(40);

                const originalIssue =
                    issue(60);

                const restored =
                    restore(
                        60,
                        originalIssue.movement.unitCostBase,
                        Math.abs(
                            originalIssue.movement.valueChange,
                        ),
                    );

                expectBalance(
                    160,
                    4000,
                    25,
                );

                expect(
                    restored.movement.movementType,
                ).toBe("RETURN_IN");

                expect(
                    restored.movement.quantityBase,
                ).toBe(60);

                expect(
                    restored.movement.valueChange,
                ).toBe(1500);
            },
        );

        it(
            "B06 rejects issuing more than available",
            () => {
                receive(100, 20);

                const beforeBalance =
                    structuredClone(
                        getBalance(),
                    );

                const beforeMovements =
                    inventoryCostMovementRepository
                        .getAll()
                        .length;

                expect(() =>
                    issue(101),
                ).toThrow();

                expect(
                    getBalance(),
                ).toEqual(beforeBalance);

                expect(
                    inventoryCostMovementRepository
                        .getAll(),
                ).toHaveLength(
                    beforeMovements,
                );
            },
        );

        it(
            "B07 rejects duplicate physical movement costing",
            () => {
                const reference =
                    nextReference();

                const input = {
                    siteId,
                    productId,
                    unitId,

                    quantity: 100,
                    transactionUnitCost: 20,

                    referenceType:
                        "GOODS_RECEIPT" as const,

                    referenceId: reference,

                    inventoryMovementId:
                        "physical-duplicate-test",

                    occurredAt,
                };

                receiveInventoryCost(input);

                const beforeBalance =
                    structuredClone(
                        getBalance(),
                    );

                expect(() =>
                    receiveInventoryCost(input),
                ).toThrow();

                expect(
                    getBalance(),
                ).toEqual(beforeBalance);

                expect(
                    inventoryCostMovementRepository
                        .getAll(),
                ).toHaveLength(1);
            },
        );

        it(
            "B08 keeps inventory costing separate by site",
            () => {
                if (!secondSiteId) {
                    throw new Error(
                        "6J-B08 requires at least two inventory sites.",
                    );
                }

                receive(
                    100,
                    20,
                    siteId,
                );

                receive(
                    100,
                    30,
                    secondSiteId,
                );

                const firstBalance =
                    getBalance(siteId);

                const secondBalance =
                    getBalance(secondSiteId);

                expect(
                    firstBalance.quantityOnHand,
                ).toBe(100);

                expect(
                    firstBalance.inventoryValue,
                ).toBe(2000);

                expect(
                    secondBalance.quantityOnHand,
                ).toBe(100);

                expect(
                    secondBalance.inventoryValue,
                ).toBe(3000);

                expect(
                    secondBalance.averageCostPerBaseUnit,
                ).toBe(30);
            },
        );

        it(
            "B09 clears inventory value after full issue",
            () => {
                receive(100, 20);

                issue(100);

                expectBalance(
                    0,
                    0,
                    0,
                );
            },
        );

        it(
            "B10 keeps movement totals consistent with balance",
            () => {
                receive(100, 20);

                receive(100, 30);

                issue(40);

                issue(60);

                const movements =
                    inventoryCostMovementRepository
                        .getBySiteAndProduct(
                            siteId,
                            productId,
                        );

                const totalQuantity =
                    movements.reduce(
                        (total, movement) =>
                            total +
                            movement.quantityBase,
                        0,
                    );

                const totalValue =
                    movements.reduce(
                        (total, movement) =>
                            total +
                            movement.valueChange,
                        0,
                    );

                const balance =
                    getBalance();

                expect(
                    totalQuantity,
                ).toBeCloseTo(
                    balance.quantityOnHand,
                    4,
                );

                expect(
                    totalValue,
                ).toBeCloseTo(
                    balance.inventoryValue,
                    2,
                );

                expect(
                    movements,
                ).toHaveLength(4);
            },
        );
    },
);