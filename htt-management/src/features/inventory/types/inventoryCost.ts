export type InventoryCostingMethod =
    "MOVING_WEIGHTED_AVERAGE";

export interface InventoryCostBalance {
    siteId: string;

    productId: string;

    baseUnitId: string;

    /**
     * Quantity represented by this
     * costing balance in base units.
     */
    quantityOnHand: number;

    /**
     * Moving weighted average cost
     * for one base unit.
     */
    averageCostPerBaseUnit: number;

    /**
     * Total inventory value.
     *
     * quantityOnHand *
     * averageCostPerBaseUnit
     */
    inventoryValue: number;

    costingMethod:
    InventoryCostingMethod;

    updatedAt: string;
}

export type InventoryCostMovementType =
    | "RECEIPT"
    | "ISSUE"
    | "ADJUSTMENT_IN"
    | "ADJUSTMENT_OUT"
    | "RETURN_IN"
    | "RETURN_OUT"
    | "TRANSFER_IN"
    | "TRANSFER_OUT";

export interface InventoryCostMovement {
    id: string;

    costMovementNumber: string;

    movementType:
    InventoryCostMovementType;

    siteId: string;

    productId: string;

    baseUnitId: string;

    /**
     * Signed base-unit quantity.
     *
     * Positive = stock value entering.
     * Negative = stock value leaving.
     */
    quantityBase: number;

    /**
     * Cost applied to one base unit
     * for this movement.
     */
    unitCostBase: number;

    /**
     * Signed inventory value movement.
     *
     * quantityBase * unitCostBase
     */
    valueChange: number;

    /**
     * Cost position after this movement.
     */
    quantityAfter: number;

    averageCostAfter: number;

    inventoryValueAfter: number;

    referenceType:
    | "CUSTOMER_RETURN"
    | "CUSTOMER_RETURN_VOID"
    | "SUPPLIER_RETURN"
    | "SUPPLIER_RETURN_VOID"
    | "GOODS_RECEIPT"
    | "SALE"
    | "MANUAL"
    | "TRANSFER";

    referenceId?: string;
    referenceNumber?: string;

    inventoryMovementId?: string;

    occurredAt: string;

    notes?: string;

    createdAt: string;
}