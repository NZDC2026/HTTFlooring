export type SupplierCreditStatus =
    | "ISSUED"
    | "FULLY_APPLIED"
    | "VOID";

export interface SupplierCreditLine {
    id: string;

    purchaseOrderLineId?: string;
    supplierBillLineId?: string;

    productId?: string;
    unitId?: string;

    sku?: string;
    description: string;
    unitSymbol?: string;

    quantity: number;
    unitCost: number;

    lineSubtotal: number;
    taxAmount: number;
    lineTotal: number;
}

export interface SupplierCreditTotals {
    subtotal: number;
    taxAmount: number;
    total: number;
}

export interface SupplierCredit {
    id: string;

    creditNumber: string;

    /**
     * Supplier's own credit-note/reference number.
     */
    supplierCreditNumber: string;

    supplierId: string;
    supplierCode: string;
    supplierName: string;

    /**
     * The Supplier Bill that originally caused
     * this credit.
     *
     * A credit may later be allocated against
     * another bill belonging to the same supplier.
     */
    sourceSupplierBillId: string;
    sourceSupplierBillNumber: string;

    creditDate: string;

    status: SupplierCreditStatus;

    reason: string;

    lines: SupplierCreditLine[];

    totals: SupplierCreditTotals;

    /**
     * Allocation summary.
     *
     * Allocation history itself is stored in
     * SupplierCreditAllocation records.
     */
    amountApplied: number;
    amountAvailable: number;

    issuedAt: string;

    createdAt: string;
    updatedAt: string;

    voidedAt?: string;
    voidReason?: string;
}

export type SupplierCreditAllocationStatus =
    | "APPLIED"
    | "REVERSED";

export interface SupplierCreditAllocation {
    id: string;

    allocationNumber: string;

    supplierId: string;

    supplierCreditId: string;

    supplierBillId: string;
    supplierBillNumber: string;

    allocationDate: string;

    amount: number;

    status:
    SupplierCreditAllocationStatus;

    createdAt: string;
    updatedAt: string;

    reversedAt?: string;
    reversalReason?: string;
}

export interface SupplierCreditLineDraft {
    supplierBillLineId: string;

    quantity: number;

    unitCost: number;
}

export interface SupplierCreditDraft {
    sourceSupplierBillId: string;

    supplierCreditNumber: string;

    creditDate: string;

    reason: string;

    lines: SupplierCreditLineDraft[];
}