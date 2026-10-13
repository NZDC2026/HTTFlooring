export interface InventoryGlReconciliation {
    asOfDate: string;

    inventoryAccountId: string;

    inventoryAccountCode: string;

    inventoryAccountName: string;

    subledgerInventoryValue: number;

    glInventoryBalance: number;

    difference: number;

    reconciled: boolean;

    valuationLineCount: number;

    siteCount: number;

    productCount: number;
}