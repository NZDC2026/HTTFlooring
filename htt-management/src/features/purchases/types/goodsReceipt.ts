export type GoodsReceiptStatus =
    "POSTED";

export interface GoodsReceiptLine {
    id: string;

    purchaseOrderLineId: string;

    productId: string;
    unitId: string;

    /**
     * Product / unit snapshots.
     */
    sku: string;
    description: string;
    unitSymbol: string;

    receivedQuantity: number;

    conversionToBase: number;

    receivedBaseQuantity: number;

    /**
     * Purchase cost snapshot.
     *
     * This is the cost of one transaction
     * unit at the time the goods are received.
     *
     * Historical inventory costing must not
     * depend on the purchase order being
     * changed later.
     */
    unitCost: number;
}

export interface GoodsReceipt {
    id: string;

    receiptNumber: string;

    purchaseOrderId: string;
    purchaseOrderNumber: string;

    supplierId: string;
    supplierCode: string;
    supplierName: string;

    siteId: string;
    siteCode: string;
    siteName: string;

    receiptDate: string;

    status: GoodsReceiptStatus;

    supplierDeliveryReference?: string;

    notes?: string;

    lines: GoodsReceiptLine[];

    postedAt: string;
    createdAt: string;
}

export interface GoodsReceiptLineDraft {
    purchaseOrderLineId:
    string;

    receivedQuantity:
    number;
}

export interface GoodsReceiptDraft {
    purchaseOrderId:
    string;

    siteId:
    string;

    receiptDate:
    string;

    supplierDeliveryReference?:
    string;

    notes?:
    string;

    lines:
    GoodsReceiptLineDraft[];
}