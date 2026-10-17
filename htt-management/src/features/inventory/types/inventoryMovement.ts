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
    | "SUPPLIER_RETURN"
    | "SUPPLIER_RETURN_VOID"
    | "GOODS_RECEIPT"
    | "SALES_FULFILMENT"
    | "SALES_FULFILMENT_VOID"
    | "MANUAL";

    referenceId?: string;
    referenceNumber?: string;

    purchaseOrderId?: string;
    purchaseOrderNumber?: string;

    salesOrderId?: string;
    salesOrderNumber?: string;

    occurredAt: string;

    notes?: string;

    createdAt: string;
}