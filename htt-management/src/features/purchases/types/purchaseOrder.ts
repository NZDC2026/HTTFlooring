import type { PurchaseCharges,PurchaseChargeDraft,PurchaseAttachment } from '../data/purchaseOrderExtras';
import type { EtaChange } from "../../incoming-shipments/shipmentEta";
import type { FxSnapshot } from "../../currency/currency";
import type { PurchaseDefaults } from '../../purchase-settings/purchaseDefaults';
export type PurchaseOrderStatus =
    | "QUOTATION"
    | "DRAFT"
    | "APPROVED"
    | "SENT"
    | "PARTIALLY_RECEIVED"
    | "RECEIVED"
    | "CANCELLED"
    | "BILLED";

export interface PurchaseOrderLine {
    priceUnit?:"M2";
    coveragePerUnit?:number;
    grossUnitCost?: number;
    taxCollectedAccountId?: string;
    taxPaidAccountId?: string;
    taxReport?: string;
    taxCode?: string;
    taxRate?: number;
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
    quotationNumber?: string;
    quotationConvertedAt?: string;
    quotationConvertedBy?: string;
    charges?:PurchaseCharges;
    originalCharges?:PurchaseCharges;
    attachments?:PurchaseAttachment[];
    etaHistory?: EtaChange[];
    originalLines?: PurchaseOrderLine[];
    fx?: FxSnapshot;
    purchaseDefaults?: PurchaseDefaults;
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
    priceUnit?:"M2";
    priceBasis?: "Inclusive" | "Exclusive";
    productId: string;
    unitId: string;

    orderedQuantity: number;
    unitCost: number;
}

export interface PurchaseOrderDraft {
    charges?:PurchaseChargeDraft;
    attachments?:PurchaseAttachment[];
    fx?: FxSnapshot;
    supplierId: string;

    orderDate: string;
    expectedDeliveryDate?: string;

    supplierReference?: string;
    notes?: string;

    lines: PurchaseOrderLineDraft[];
}