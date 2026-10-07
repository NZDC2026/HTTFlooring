export type SupplierStatementEntryType =
    | "BILL"
    | "PAYMENT"
    | "PAYMENT_REVERSAL";

export interface SupplierStatementEntry {
    id: string;

    date: string;

    type:
    SupplierStatementEntryType;

    reference: string;

    description: string;

    supplierBillId?: string;
    supplierPaymentId?: string;

    debit: number;
    credit: number;

    balance: number;
}

export interface SupplierStatement {
    supplierId: string;

    fromDate: string;
    toDate: string;

    openingBalance: number;

    totalDebits: number;
    totalCredits: number;

    closingBalance: number;

    entries:
    SupplierStatementEntry[];
}