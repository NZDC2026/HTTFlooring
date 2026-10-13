import {
    inventorySiteRepository,
} from "./inventorySiteRepository";

import {
    getProductById,
} from "./mockProducts";

import {
    roundInventoryCost,
    roundInventoryQuantity,
    roundInventoryValue,
} from "./inventoryCostCalculations";

import type {
    InventoryCostMovement,
} from "../types/inventoryCost";

import type {
    InventoryValuationReport,
    InventoryValuationRow,
} from "../types/inventoryValuation";

interface ValuationAccumulator {
    siteId: string;
    productId: string;
    baseUnitId: string;

    quantityOnHand: number;
    inventoryValue: number;

    lastMovementAt?: string;
}

function validateAsOfDate(
    asOfDate:
        string,
) {
    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
            asOfDate,
        )
    ) {
        throw new Error(
            "Inventory valuation date must use YYYY-MM-DD format.",
        );
    }

    const parsed =
        new Date(
            `${asOfDate}T00:00:00`,
        );

    if (
        Number.isNaN(
            parsed.getTime(),
        )
    ) {
        throw new Error(
            "Inventory valuation date is invalid.",
        );
    }
}

function getDateKey(
    value:
        string,
) {
    return value.slice(
        0,
        10,
    );
}

function compareMovements(
    left:
        InventoryCostMovement,

    right:
        InventoryCostMovement,
) {
    const occurredComparison =
        left.occurredAt.localeCompare(
            right.occurredAt,
        );

    if (
        occurredComparison !==
        0
    ) {
        return occurredComparison;
    }

    const createdComparison =
        left.createdAt.localeCompare(
            right.createdAt,
        );

    if (
        createdComparison !==
        0
    ) {
        return createdComparison;
    }

    return left.id.localeCompare(
        right.id,
    );
}

export function calculateInventoryValuation(
    movements:
        InventoryCostMovement[],

    asOfDate:
        string,
): InventoryValuationReport {
    validateAsOfDate(
        asOfDate,
    );

    const eligibleMovements =
        movements
            .filter(
                (
                    movement,
                ) =>
                    getDateKey(
                        movement.occurredAt,
                    ) <=
                    asOfDate,
            )
            .slice()
            .sort(
                compareMovements,
            );

    const positions =
        new Map<
            string,
            ValuationAccumulator
        >();

    for (
        const movement of
        eligibleMovements
    ) {
        const key =
            `${movement.siteId}:${movement.productId}`;

        const existing =
            positions.get(
                key,
            ) ?? {
                siteId:
                    movement.siteId,

                productId:
                    movement.productId,

                baseUnitId:
                    movement.baseUnitId,

                quantityOnHand:
                    0,

                inventoryValue:
                    0,
            };

        if (
            existing.baseUnitId !==
            movement.baseUnitId
        ) {
            throw new Error(
                `Inventory valuation base unit mismatch for product ${movement.productId}.`,
            );
        }

        const quantityOnHand =
            roundInventoryQuantity(
                existing.quantityOnHand +
                movement.quantityBase,
            );

        const inventoryValue =
            roundInventoryValue(
                existing.inventoryValue +
                movement.valueChange,
            );

        if (
            quantityOnHand <
            0
        ) {
            throw new Error(
                `Inventory valuation produced negative quantity for product ${movement.productId}.`,
            );
        }

        if (
            inventoryValue <
            0
        ) {
            throw new Error(
                `Inventory valuation produced negative value for product ${movement.productId}.`,
            );
        }

        positions.set(
            key,
            {
                ...existing,

                quantityOnHand,

                inventoryValue,

                lastMovementAt:
                    movement.occurredAt,
            },
        );
    }

    const rows:
        InventoryValuationRow[] =
        Array.from(
            positions.values(),
        )
            .filter(
                (
                    position,
                ) =>
                    position.quantityOnHand !==
                    0 ||
                    position.inventoryValue !==
                    0,
            )
            .map(
                (
                    position,
                ) => {
                    const site =
                        inventorySiteRepository
                            .getById(
                                position.siteId,
                            );

                    if (!site) {
                        throw new Error(
                            `Inventory site ${position.siteId} was not found.`,
                        );
                    }

                    const product =
                        getProductById(
                            position.productId,
                        );

                    if (!product) {
                        throw new Error(
                            `Inventory product ${position.productId} was not found.`,
                        );
                    }

                    const baseUnit =
                        product.units.find(
                            (
                                unit,
                            ) =>
                                unit.id ===
                                position.baseUnitId,
                        );

                    if (!baseUnit) {
                        throw new Error(
                            `Base unit ${position.baseUnitId} was not found for ${product.sku}.`,
                        );
                    }

                    const averageCostPerBaseUnit =
                        position.quantityOnHand ===
                            0
                            ? 0
                            : roundInventoryCost(
                                position.inventoryValue /
                                position.quantityOnHand,
                            );

                    return {
                        siteId:
                            site.id,

                        siteCode:
                            site.code,

                        siteName:
                            site.name,

                        productId:
                            product.id,

                        sku:
                            product.sku,

                        productName:
                            product.name,

                        baseUnitId:
                            baseUnit.id,

                        baseUnitSymbol:
                            baseUnit.symbol,

                        quantityOnHand:
                            position.quantityOnHand,

                        averageCostPerBaseUnit,

                        inventoryValue:
                            position.inventoryValue,

                        lastMovementAt:
                            position.lastMovementAt,
                    };
                },
            )
            .sort(
                (
                    left,
                    right,
                ) =>
                    left.siteCode.localeCompare(
                        right.siteCode,
                    ) ||
                    left.sku.localeCompare(
                        right.sku,
                    ),
            );

    const totalQuantity =
        roundInventoryQuantity(
            rows.reduce(
                (
                    total,
                    row,
                ) =>
                    total +
                    row.quantityOnHand,
                0,
            ),
        );

    const totalInventoryValue =
        roundInventoryValue(
            rows.reduce(
                (
                    total,
                    row,
                ) =>
                    total +
                    row.inventoryValue,
                0,
            ),
        );

    return {
        asOfDate,

        rows,

        totalQuantity,

        totalInventoryValue,

        siteCount:
            new Set(
                rows.map(
                    (
                        row,
                    ) =>
                        row.siteId,
                ),
            ).size,

        productCount:
            new Set(
                rows.map(
                    (
                        row,
                    ) =>
                        row.productId,
                ),
            ).size,
    };
}