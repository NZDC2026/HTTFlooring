export type InventoryMovementType =
    | "GOODS_RECEIPT"
    | "ADJUSTMENT_IN"
    | "ADJUSTMENT_OUT"
    | "SALE"
    | "RETURN_IN"
    | "RETURN_OUT"
    | "TRANSFER_IN"
    | "TRANSFER_OUT";

export interface InventoryMovement {
    id: string;

    movementNumber: string;

    movementType: InventoryMovementType;

    siteId: string;

    productId: string;

    /**
     * Inventory ledger is always stored
     * in the product's base unit.
     */
    baseUnitId: string;

    quantityBase: number;

    /**
     * Original transaction quantity.
     */
    transactionUnitId: string;
    transactionUnitSymbol: string;
    transactionQuantity: number;
    conversionToBase: number;

    referenceType:
    | "GOODS_RECEIPT"
    | "MANUAL";

    referenceId?: string;
    referenceNumber?: string;

    purchaseOrderId?: string;
    purchaseOrderNumber?: string;

    occurredAt: string;

    notes?: string;

    createdAt: string;
}