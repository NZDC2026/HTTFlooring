/**
 * 6K-D1
 *
 * Supplier Bill / Goods Receipt Matching
 *
 * One Supplier Bill Line may match multiple
 * Goods Receipt Lines.
 *
 * One Goods Receipt Line may be matched
 * by multiple Supplier Bills.
 *
 * Matching quantities must never exceed
 * the original received quantity.
 */

export type SupplierBillReceiptMatchStatus =
    | "ACTIVE"
    | "REVERSED";

/**
 * One allocation between a Supplier Bill Line
 * and a Goods Receipt Line.
 */
export interface SupplierBillReceiptMatch {
    id: string;

    /**
     * Supplier Bill references.
     */
    supplierBillId: string;

    supplierBillLineId: string;

    /**
     * Goods Receipt references.
     */
    goodsReceiptId: string;

    goodsReceiptLineId: string;

    /**
     * Purchase Order references.
     */
    purchaseOrderId: string;

    purchaseOrderLineId: string;

    /**
     * Product reference.
     */
    productId: string;

    /**
     * Quantity in the transaction unit
     * of the Goods Receipt Line.
     */
    matchedQuantity: number;

    /**
     * Quantity converted to inventory
     * base units.
     */
    matchedBaseQuantity: number;

    /**
     * Snapshot of the original
     * Goods Receipt unit cost.
     */
    receiptUnitCost: number;

    /**
     * Inventory cost allocated to this match.
     *
     * This amount is used to clear GRNI.
     *
     * Dr GRNI = matchedReceiptValue
     */
    matchedReceiptValue: number;

    /**
     * Original Supplier Bill unit cost.
     *
     * Reserved for Purchase Price Variance
     * calculations in 6K-E.
     */
    billUnitCost: number;

    /**
     * Supplier invoice value allocated
     * to this match, excluding GST.
     */
    matchedBillValue: number;

    /**
     * Difference between invoice value
     * and receipt cost.
     *
     * Reserved for 6K-E.
     */
    priceVariance: number;

    status: SupplierBillReceiptMatchStatus;

    /** Business-effective posting date; legacy matches fall back to createdAt. */
    accountingDate?: string;

    /** Business-effective reversal date; legacy matches fall back to reversedAt. */
    reversalAccountingDate?: string;

    createdAt: string;

    reversedAt?: string;

    reversalReason?: string;
}

/**
 * Matching request generated from
 * Supplier Bill Line quantities.
 */
export interface SupplierBillReceiptMatchRequest {
    supplierBillId: string;

    supplierBillLineId: string;

    purchaseOrderId: string;

    purchaseOrderLineId: string;

    productId: string;

    quantity: number;

    billUnitCost: number;
}

/**
 * One available Goods Receipt Line.
 *
 * Used by the FIFO matching engine.
 */
export interface AvailableGoodsReceiptLine {
    goodsReceiptId: string;

    goodsReceiptLineId: string;

    purchaseOrderId: string;

    purchaseOrderLineId: string;

    productId: string;

    receiptDate: string;

    receivedQuantity: number;

    conversionToBase: number;

    receiptUnitCost: number;

    /**
     * Quantity already allocated to
     * active Supplier Bill matches.
     */
    matchedQuantity: number;

    /**
     * Quantity available for matching.
     */
    availableQuantity: number;
}

/**
 * Matching calculation result.
 *
 * This structure is calculated before
 * repository state is modified.
 */
export interface SupplierBillReceiptMatchingResult {
    supplierBillId: string;

    purchaseOrderId: string;

    matches: SupplierBillReceiptMatch[];

    totalMatchedQuantity: number;

    totalMatchedBaseQuantity: number;

    /**
     * Total GRNI amount to clear.
     */
    totalMatchedReceiptValue: number;

    /**
     * Total supplier invoice amount
     * excluding GST.
     */
    totalMatchedBillValue: number;

    /**
     * Purchase price variance.
     *
     * Must be zero during 6K-D.
     */
    totalPriceVariance: number;
}

/**
 * Outstanding GRNI for one
 * Goods Receipt Line.
 */
export interface GoodsReceiptLineGrniBalance {
    goodsReceiptId: string;

    goodsReceiptLineId: string;

    purchaseOrderId: string;

    purchaseOrderLineId: string;

    productId: string;

    receivedQuantity: number;

    matchedQuantity: number;

    outstandingQuantity: number;

    receivedValue: number;

    matchedValue: number;

    outstandingValue: number;
}