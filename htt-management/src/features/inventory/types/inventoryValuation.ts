export interface InventoryValuationRow {
    siteId: string;
    siteCode: string;
    siteName: string;

    productId: string;
    sku: string;
    productName: string;

    baseUnitId: string;
    baseUnitSymbol: string;

    quantityOnHand: number;

    averageCostPerBaseUnit: number;

    inventoryValue: number;

    lastMovementAt?: string;
}

export interface InventoryValuationReport {
    asOfDate: string;

    rows:
    InventoryValuationRow[];

    totalQuantity: number;

    totalInventoryValue: number;

    siteCount: number;

    productCount: number;
}