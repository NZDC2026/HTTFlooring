export type SupplierBillStatus =
    | "OPEN"
    | "PARTIALLY_PAID"
    | "PAID"
    | "VOID";

export interface SupplierBillLine {
    id: string;

    purchaseOrderLineId: string;

    productId: string;
    unitId: string;

    sku: string;
    description: string;
    unitSymbol: string;

    quantity: number;

    unitCost: number;

    lineSubtotal: number;
    taxAmount: number;
    lineTotal: number;
}

export interface SupplierBillTotals {
    subtotal: number;
    taxAmount: number;
    total: number;

    amountPaid: number;
    amountCredited: number;
    amountDue: number;
}

export interface SupplierBill {
    id: string;

    billNumber: string;

    supplierInvoiceNumber: string;

    supplierId: string;
    supplierCode: string;
    supplierName: string;

    purchaseOrderId: string;
    purchaseOrderNumber: string;

    billDate: string;
    dueDate: string;

    status: SupplierBillStatus;

    lines: SupplierBillLine[];

    totals: SupplierBillTotals;

    notes?: string;

    createdAt: string;
    updatedAt: string;

    voidedAt?: string;
    voidReason?: string;
}

export interface SupplierBillLineDraft {
    purchaseOrderLineId: string;

    quantity: number;

    unitCost: number;
}

export interface SupplierBillDraft {
    purchaseOrderId: string;

    supplierInvoiceNumber: string;

    billDate: string;
    dueDate: string;

    notes?: string;

    lines: SupplierBillLineDraft[];
}