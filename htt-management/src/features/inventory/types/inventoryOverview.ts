export interface InventoryStockRow {
    key: string;

    siteId: string;
    siteCode: string;
    siteName: string;

    productId: string;
    sku: string;
    productName: string;
    category: string;

    baseUnitId: string;
    baseUnitSymbol: string;

    quantityOnHand: number;
}

export interface InventoryMovementRow {
    id: string;

    movementNumber: string;
    movementType: string;

    occurredAt: string;

    siteId: string;
    siteCode: string;
    siteName: string;

    productId: string;
    sku: string;
    productName: string;

    baseUnitSymbol: string;
    quantityBase: number;

    transactionUnitSymbol: string;
    transactionQuantity: number;

    referenceType: string;
    referenceId?: string;
    referenceNumber?: string;

    purchaseOrderId?: string;
    purchaseOrderNumber?: string;
}