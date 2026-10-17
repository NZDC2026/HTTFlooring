import { isStockProduct } from './itemTypes';
import {
    getProductById,
    getProductUnit,
} from "./mockProducts";

import {
    inventoryCostBalanceRepository,
} from "./inventoryCostBalanceRepository";

import {
    inventoryCostMovementRepository,
} from "./inventoryCostMovementRepository";

import {
    productCostingRepository,
} from "./productCostingRepository";

import {
    calculateBaseUnitCost,
    calculateIncomingInventoryValue,
    calculateInventoryIssueValue,
    calculateMovingWeightedAverage,
    roundInventoryCost,
    roundInventoryQuantity,
    roundInventoryValue,
} from "./inventoryCostCalculations";

import type {
    InventoryCostBalance,
    InventoryCostMovement,
} from "../types/inventoryCost";

interface CostReferenceInput {
    referenceType:
    InventoryCostMovement[
    "referenceType"
    ];

    referenceId?: string;

    referenceNumber?: string;

    inventoryMovementId?: string;

    occurredAt: string;

    notes?: string;
}

export interface ReceiveInventoryCostInput
    extends CostReferenceInput {
    siteId: string;

    productId: string;

    /**
     * Unit used by the source
     * transaction.
     */
    unitId: string;

    /**
     * Positive quantity in the
     * transaction unit.
     */
    quantity: number;

    /**
     * Cost for one transaction unit.
     */
    transactionUnitCost: number;

    movementType?:
    | "RECEIPT"
    | "ADJUSTMENT_IN"
    | "RETURN_IN"
    | "TRANSFER_IN";
}

export interface IssueInventoryCostInput
    extends CostReferenceInput {
    siteId: string;

    productId: string;

    /**
     * Unit used by the source
     * transaction.
     */
    unitId: string;

    /**
     * Positive quantity in the
     * transaction unit.
     */
    quantity: number;

    movementType?:
    | "ISSUE"
    | "ADJUSTMENT_OUT"
    | "RETURN_OUT"
    | "TRANSFER_OUT";
}

export interface InventoryCostEngineResult {
    movement:
    InventoryCostMovement;

    balance:
    InventoryCostBalance;
}

function requirePositiveQuantity(
    quantity:
        number,
) {
    if (
        !Number.isFinite(
            quantity,
        ) ||
        quantity <=
        0
    ) {
        throw new Error(
            "Inventory cost quantity must be greater than zero.",
        );
    }
}

function requireValidOccurredAt(
    occurredAt:
        string,
) {
    const timestamp =
        Date.parse(
            occurredAt,
        );

    if (
        Number.isNaN(
            timestamp,
        )
    ) {
        throw new Error(
            "Inventory cost movement date is invalid.",
        );
    }
}

function requireCostingContext(
    productId:
        string,

    unitId:
        string,
) {
    const product =
        getProductById(
            productId,
        );

    if (!product) {
        throw new Error(
            "Product was not found.",
        );
    }

    if(!isStockProduct(product))throw new Error('Non-stock/service items cannot move inventory value.');
    const policy =
        productCostingRepository
            .requireByProductId(
                productId,
            );

    if (!policy.active) {
        throw new Error(
            "Product costing is inactive.",
        );
    }

    if (
        policy.costingMethod !==
        "MOVING_WEIGHTED_AVERAGE"
    ) {
        throw new Error(
            "Unsupported inventory costing method.",
        );
    }

    if (
        policy.baseUnitId !==
        product.baseUnitId
    ) {
        throw new Error(
            "Product costing base unit does not match the product base unit.",
        );
    }

    const unit =
        getProductUnit(
            productId,
            unitId,
        );

    if (!unit) {
        throw new Error(
            "Product unit was not found.",
        );
    }

    if (!unit.active) {
        throw new Error(
            "Product unit is inactive.",
        );
    }

    if (
        !Number.isFinite(
            unit.conversionToBase,
        ) ||
        unit.conversionToBase <=
        0
    ) {
        throw new Error(
            "Product unit conversion must be greater than zero.",
        );
    }

    return {
        product,
        policy,
        unit,
    };
}

function validateExistingBalance(
    balance:
        InventoryCostBalance,

    baseUnitId:
        string,
) {
    if (
        balance.baseUnitId !==
        baseUnitId
    ) {
        throw new Error(
            "Inventory cost balance base unit does not match the product costing base unit.",
        );
    }

    if (
        balance.costingMethod !==
        "MOVING_WEIGHTED_AVERAGE"
    ) {
        throw new Error(
            "Inventory cost balance uses an unsupported costing method.",
        );
    }

    if (
        !Number.isFinite(
            balance.quantityOnHand,
        ) ||
        balance.quantityOnHand <
        0
    ) {
        throw new Error(
            "Inventory cost balance quantity is invalid.",
        );
    }

    if (
        !Number.isFinite(
            balance.averageCostPerBaseUnit,
        ) ||
        balance.averageCostPerBaseUnit <
        0
    ) {
        throw new Error(
            "Inventory cost balance average cost is invalid.",
        );
    }

    if (
        !Number.isFinite(
            balance.inventoryValue,
        ) ||
        balance.inventoryValue <
        0
    ) {
        throw new Error(
            "Inventory cost balance value is invalid.",
        );
    }

    const expectedValue =
        roundInventoryValue(
            balance.quantityOnHand *
            balance.averageCostPerBaseUnit,
        );

    const difference =
        Math.abs(
            roundInventoryValue(
                expectedValue -
                balance.inventoryValue,
            ),
        );

    /*
     * The balance stores inventory
     * value at currency precision while
     * average cost uses higher precision.
     * One cent tolerance prevents false
     * failures caused by rounding.
     */
    if (
        difference >
        0.01
    ) {
        throw new Error(
            "Inventory cost balance quantity, average cost and value are inconsistent.",
        );
    }
}

function ensureMovementNotAlreadyCosted(
    inventoryMovementId:
        string | undefined,
) {
    if (!inventoryMovementId) {
        return;
    }

    const existing =
        inventoryCostMovementRepository
            .getByInventoryMovementId(
                inventoryMovementId,
            );

    if (existing) {
        throw new Error(
            "Inventory movement has already been costed.",
        );
    }
}

function commitCostState({
    movement,
    balance,
}: {
    movement:
    InventoryCostMovement;

    balance:
    InventoryCostBalance;
}) {
    const currentMovements =
        inventoryCostMovementRepository
            .getAll();

    const currentBalances =
        inventoryCostBalanceRepository
            .getAll();

    const nextMovements = [
        movement,
        ...currentMovements,
    ];

    const balanceExists =
        currentBalances.some(
            (
                existing,
            ) =>
                existing.siteId ===
                balance.siteId &&
                existing.productId ===
                balance.productId,
        );

    const nextBalances =
        balanceExists
            ? currentBalances.map(
                (
                    existing,
                ) =>
                    existing.siteId ===
                        balance.siteId &&
                        existing.productId ===
                        balance.productId
                        ? balance
                        : existing,
            )
            : [
                balance,
                ...currentBalances,
            ];

    /*
     * Everything above this point is
     * validation/calculation only.
     *
     * Repository mutation starts here.
     */
    inventoryCostMovementRepository
        .replaceAll(
            nextMovements,
        );

    inventoryCostBalanceRepository
        .replaceAll(
            nextBalances,
        );
}

export function receiveInventoryCost(
    input:
        ReceiveInventoryCostInput,
): InventoryCostEngineResult {
    requirePositiveQuantity(
        input.quantity,
    );

    requireValidOccurredAt(
        input.occurredAt,
    );

    if (
        !Number.isFinite(
            input.transactionUnitCost,
        ) ||
        input.transactionUnitCost <
        0
    ) {
        throw new Error(
            "Transaction unit cost cannot be negative.",
        );
    }

    ensureMovementNotAlreadyCosted(
        input.inventoryMovementId,
    );

    const {
        policy,
        unit,
    } =
        requireCostingContext(
            input.productId,
            input.unitId,
        );

    const quantityBase =
        roundInventoryQuantity(
            input.quantity *
            unit.conversionToBase,
        );

    if (
        quantityBase <=
        0
    ) {
        throw new Error(
            "Base inventory quantity must be greater than zero.",
        );
    }

    const unitCostBase =
        calculateBaseUnitCost({
            transactionUnitCost:
                input.transactionUnitCost,

            conversionToBase:
                unit.conversionToBase,
        });

    const incomingInventoryValue =
        calculateIncomingInventoryValue({
            quantityBase,

            unitCostBase,
        });

    const existing =
        inventoryCostBalanceRepository
            .getBalance(
                input.siteId,
                input.productId,
            );

    if (existing) {
        validateExistingBalance(
            existing,
            policy.baseUnitId,
        );
    }

    const currentQuantity =
        existing?.quantityOnHand ??
        0;

    const currentInventoryValue =
        existing?.inventoryValue ??
        0;

    const next =
        calculateMovingWeightedAverage({
            currentQuantity,

            currentInventoryValue,

            incomingQuantity:
                quantityBase,

            incomingInventoryValue,
        });

    const now =
        new Date()
            .toISOString();

    const balance:
        InventoryCostBalance =
    {
        siteId:
            input.siteId,

        productId:
            input.productId,

        baseUnitId:
            policy.baseUnitId,

        quantityOnHand:
            next.quantityAfter,

        averageCostPerBaseUnit:
            next.averageCostAfter,

        inventoryValue:
            next.inventoryValueAfter,

        costingMethod:
            policy.costingMethod,

        updatedAt:
            now,
    };

    validateExistingBalance(
        balance,
        policy.baseUnitId,
    );

    const movement =
        inventoryCostMovementRepository
            .build({
                movementType:
                    input.movementType ??
                    "RECEIPT",

                siteId:
                    input.siteId,

                productId:
                    input.productId,

                baseUnitId:
                    policy.baseUnitId,

                quantityBase,

                unitCostBase,

                valueChange:
                    incomingInventoryValue,

                quantityAfter:
                    balance.quantityOnHand,

                averageCostAfter:
                    balance.averageCostPerBaseUnit,

                inventoryValueAfter:
                    balance.inventoryValue,

                referenceType:
                    input.referenceType,

                referenceId:
                    input.referenceId,

                referenceNumber:
                    input.referenceNumber,

                inventoryMovementId:
                    input.inventoryMovementId,

                occurredAt:
                    input.occurredAt,

                notes:
                    input.notes,
            });

    commitCostState({
        movement,
        balance,
    });

    return {
        movement,
        balance,
    };
}

export function issueInventoryCost(
    input:
        IssueInventoryCostInput,
): InventoryCostEngineResult {
    requirePositiveQuantity(
        input.quantity,
    );

    requireValidOccurredAt(
        input.occurredAt,
    );

    ensureMovementNotAlreadyCosted(
        input.inventoryMovementId,
    );

    const {
        policy,
        unit,
    } =
        requireCostingContext(
            input.productId,
            input.unitId,
        );

    const quantityBase =
        roundInventoryQuantity(
            input.quantity *
            unit.conversionToBase,
        );

    if (
        quantityBase <=
        0
    ) {
        throw new Error(
            "Base inventory quantity must be greater than zero.",
        );
    }

    const existing =
        inventoryCostBalanceRepository
            .getBalance(
                input.siteId,
                input.productId,
            );

    if (!existing) {
        throw new Error(
            "Inventory cannot be issued because no cost balance exists.",
        );
    }

    validateExistingBalance(
        existing,
        policy.baseUnitId,
    );

    if (
        quantityBase >
        existing.quantityOnHand
    ) {
        throw new Error(
            "Inventory issue would create negative stock.",
        );
    }

    const unitCostBase =
        roundInventoryCost(
            existing.averageCostPerBaseUnit,
        );

    const issueValue =
        calculateInventoryIssueValue({
            quantityBase,

            averageCostPerBaseUnit:
                unitCostBase,
        });

    const quantityAfter =
        roundInventoryQuantity(
            existing.quantityOnHand -
            quantityBase,
        );

    /*
     * If all stock is issued, consume
     * the exact remaining inventory
     * value so no rounding residue is
     * left behind.
     */
    const isFullIssue =
        quantityAfter ===
        0;

    const valueChange =
        isFullIssue
            ? roundInventoryValue(
                -existing.inventoryValue,
            )
            : roundInventoryValue(
                -issueValue,
            );

    const inventoryValueAfter =
        isFullIssue
            ? 0
            : roundInventoryValue(
                existing.inventoryValue +
                valueChange,
            );

    if (
        inventoryValueAfter <
        0
    ) {
        throw new Error(
            "Inventory issue would create a negative inventory value.",
        );
    }

    const averageCostAfter =
        quantityAfter ===
            0
            ? 0
            : roundInventoryCost(
                inventoryValueAfter /
                quantityAfter,
            );

    const now =
        new Date()
            .toISOString();

    const balance:
        InventoryCostBalance =
    {
        ...existing,

        quantityOnHand:
            quantityAfter,

        averageCostPerBaseUnit:
            averageCostAfter,

        inventoryValue:
            inventoryValueAfter,

        updatedAt:
            now,
    };

    validateExistingBalance(
        balance,
        policy.baseUnitId,
    );

    const movement =
        inventoryCostMovementRepository
            .build({
                movementType:
                    input.movementType ??
                    "ISSUE",

                siteId:
                    input.siteId,

                productId:
                    input.productId,

                baseUnitId:
                    policy.baseUnitId,

                quantityBase:
                    roundInventoryQuantity(
                        -quantityBase,
                    ),

                unitCostBase,

                valueChange,

                quantityAfter:
                    balance.quantityOnHand,

                averageCostAfter:
                    balance.averageCostPerBaseUnit,

                inventoryValueAfter:
                    balance.inventoryValue,

                referenceType:
                    input.referenceType,

                referenceId:
                    input.referenceId,

                referenceNumber:
                    input.referenceNumber,

                inventoryMovementId:
                    input.inventoryMovementId,

                occurredAt:
                    input.occurredAt,

                notes:
                    input.notes,
            });

    commitCostState({
        movement,
        balance,
    });

    return {
        movement,
        balance,
    };
}

export interface RestoreInventoryCostInput
    extends CostReferenceInput {
    siteId: string;

    productId: string;

    /**
     * Positive quantity expressed in the
     * product base unit.
     */
    quantityBase: number;

    /**
     * Historical cost snapshot from the
     * original inventory issue.
     */
    unitCostBase: number;

    /**
     * Exact historical inventory value
     * that must be restored.
     */
    inventoryValue: number;
}

export function restoreInventoryCost(
    input:
        RestoreInventoryCostInput,
): InventoryCostEngineResult {
    requirePositiveQuantity(
        input.quantityBase,
    );

    requireValidOccurredAt(
        input.occurredAt,
    );

    ensureMovementNotAlreadyCosted(
        input.inventoryMovementId,
    );

    if (
        !Number.isFinite(
            input.unitCostBase,
        ) ||
        input.unitCostBase <
        0
    ) {
        throw new Error(
            "Restored inventory unit cost cannot be negative.",
        );
    }

    if (
        !Number.isFinite(
            input.inventoryValue,
        ) ||
        input.inventoryValue <
        0
    ) {
        throw new Error(
            "Restored inventory value cannot be negative.",
        );
    }

    const product =
        getProductById(
            input.productId,
        );

    if (!product) {
        throw new Error(
            "Product was not found.",
        );
    }

    if(!isStockProduct(product))throw new Error('Non-stock/service items cannot restore inventory value.');
    const policy =
        productCostingRepository
            .requireByProductId(
                input.productId,
            );

    if (!policy.active) {
        throw new Error(
            "Product costing is inactive.",
        );
    }

    if (
        policy.costingMethod !==
        "MOVING_WEIGHTED_AVERAGE"
    ) {
        throw new Error(
            "Unsupported inventory costing method.",
        );
    }

    if (
        policy.baseUnitId !==
        product.baseUnitId
    ) {
        throw new Error(
            "Product costing base unit does not match the product base unit.",
        );
    }

    const quantityBase =
        roundInventoryQuantity(
            input.quantityBase,
        );

    const unitCostBase =
        roundInventoryCost(
            input.unitCostBase,
        );

    const restoredValue =
        roundInventoryValue(
            input.inventoryValue,
        );

    const existing =
        inventoryCostBalanceRepository
            .getBalance(
                input.siteId,
                input.productId,
            );

    if (existing) {
        validateExistingBalance(
            existing,
            policy.baseUnitId,
        );
    }

    const currentQuantity =
        existing?.quantityOnHand ??
        0;

    const currentInventoryValue =
        existing?.inventoryValue ??
        0;

    const quantityAfter =
        roundInventoryQuantity(
            currentQuantity +
            quantityBase,
        );

    const inventoryValueAfter =
        roundInventoryValue(
            currentInventoryValue +
            restoredValue,
        );

    const averageCostAfter =
        quantityAfter ===
            0
            ? 0
            : roundInventoryCost(
                inventoryValueAfter /
                quantityAfter,
            );

    const now =
        new Date()
            .toISOString();

    const balance:
        InventoryCostBalance =
    {
        siteId:
            input.siteId,

        productId:
            input.productId,

        baseUnitId:
            policy.baseUnitId,

        quantityOnHand:
            quantityAfter,

        averageCostPerBaseUnit:
            averageCostAfter,

        inventoryValue:
            inventoryValueAfter,

        costingMethod:
            policy.costingMethod,

        updatedAt:
            now,
    };

    validateExistingBalance(
        balance,
        policy.baseUnitId,
    );

    const movement =
        inventoryCostMovementRepository
            .build({
                movementType:
                    "RETURN_IN",

                siteId:
                    input.siteId,

                productId:
                    input.productId,

                baseUnitId:
                    policy.baseUnitId,

                quantityBase,

                unitCostBase,

                valueChange:
                    restoredValue,

                quantityAfter:
                    balance.quantityOnHand,

                averageCostAfter:
                    balance.averageCostPerBaseUnit,

                inventoryValueAfter:
                    balance.inventoryValue,

                referenceType:
                    input.referenceType,

                referenceId:
                    input.referenceId,

                referenceNumber:
                    input.referenceNumber,

                inventoryMovementId:
                    input.inventoryMovementId,

                occurredAt:
                    input.occurredAt,

                notes:
                    input.notes,
            });

    commitCostState({
        movement,
        balance,
    });

    return {
        movement,
        balance,
    };
}