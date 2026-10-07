export type PurchaseOrderStatus =
    | "DRAFT"
    | "APPROVED"
    | "SENT"
    | "PARTIALLY_RECEIVED"
    | "RECEIVED"
    | "CANCELLED"
    | "BILLED";

export interface PurchaseOrderLine {
    id: string;

    productId: string;
    unitId: string;

    /**
     * Product snapshot.
     *
     * Historical purchase orders must not change
     * when Product master data changes later.
     */
    sku: string;
    description: string;
    unitSymbol: string;

    orderedQuantity: number;
    receivedQuantity: number;
    billedQuantity: number;
    unitCost: number;

    lineSubtotal: number;
    taxAmount: number;
    lineTotal: number;
}

export interface PurchaseOrderTotals {
    subtotal: number;
    taxAmount: number;
    total: number;
}

export interface PurchaseOrder {
    id: string;

    purchaseOrderNumber: string;

    supplierId: string;

    /**
     * Supplier snapshot.
     */
    supplierCode: string;
    supplierName: string;

    orderDate: string;
    expectedDeliveryDate?: string;

    status: PurchaseOrderStatus;

    supplierReference?: string;
    notes?: string;

    lines: PurchaseOrderLine[];

    totals: PurchaseOrderTotals;

    approvedAt?: string;
    sentAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;

    createdAt: string;
    updatedAt: string;
}

export interface PurchaseOrderLineDraft {
    productId: string;
    unitId: string;

    orderedQuantity: number;
    unitCost: number;
}

export interface PurchaseOrderDraft {
    supplierId: string;

    orderDate: string;
    expectedDeliveryDate?: string;

    supplierReference?: string;
    notes?: string;

    lines: PurchaseOrderLineDraft[];
}