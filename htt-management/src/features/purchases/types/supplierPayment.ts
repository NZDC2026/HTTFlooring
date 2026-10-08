export type SupplierPaymentMethod =
    | "BANK_TRANSFER"
    | "CASH"
    | "CARD"
    | "CHEQUE"
    | "OTHER";

export type SupplierPaymentStatus =
    | "POSTED"
    | "REVERSED";

export interface SupplierPaymentAllocation {
    id: string;

    supplierBillId: string;

    billNumber: string;
    supplierInvoiceNumber: string;

    amount: number;
}

export interface SupplierPayment {
    id: string;

    paymentNumber: string;

    supplierId: string;
    supplierCode: string;
    supplierName: string;

    paymentDate: string;

    amount: number;

    method: SupplierPaymentMethod;

    bankAccountId: string;

    reference?: string;
    notes?: string;

    allocations: SupplierPaymentAllocation[];

    status: SupplierPaymentStatus;

    createdAt: string;
    updatedAt: string;

    reversedAt?: string;
    reversalReason?: string;
}

export interface SupplierPaymentAllocationDraft {
    supplierBillId: string;
    amount: number;
}

export interface SupplierPaymentDraft {
    supplierId: string;

    paymentDate: string;

    method: SupplierPaymentMethod;

    bankAccountId: string;

    reference?: string;
    notes?: string;

    allocations: SupplierPaymentAllocationDraft[];
}