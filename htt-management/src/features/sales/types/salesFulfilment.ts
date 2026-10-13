export type SalesFulfilmentStatus =
    | "ACTIVE"
    | "VOIDED";

export interface SalesFulfilmentLine {
    id: string;

    salesOrderLineId: string;

    productId: string;
    unitId: string;

    sku: string;
    description: string;
    unitSymbol: string;

    fulfilledQuantity: number;

    conversionToBase: number;

    fulfilledBaseQuantity: number;
}

export interface SalesFulfilment {
    id: string;

    fulfilmentNumber: string;

    salesOrderId: string;

    salesOrderNumber: string;

    customerId: string;

    siteId: string;

    fulfilmentDate: string;

    status:
    SalesFulfilmentStatus;

    lines:
    SalesFulfilmentLine[];

    notes?: string;

    createdAt: string;

    voidedAt?: string;
    voidDate?: string;
    voidReason?: string;
}

export interface SalesFulfilmentLineDraft {
    salesOrderLineId: string;

    fulfilledQuantity: number;
}

export interface SalesFulfilmentDraft {
    salesOrderId: string;

    siteId: string;

    fulfilmentDate: string;

    lines:
    SalesFulfilmentLineDraft[];

    notes?: string;
}

export interface VoidSalesFulfilmentInput {
    fulfilmentId: string;

    voidDate: string;

    reason: string;
}