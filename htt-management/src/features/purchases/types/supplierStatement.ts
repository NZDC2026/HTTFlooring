export type SupplierStatementEntryType =
    | "BILL"
    | "BILL_VOID"
    | "PAYMENT"
    | "PAYMENT_REVERSAL"
    | "SUPPLIER_CREDIT"
    | "SUPPLIER_CREDIT_VOID";

export interface SupplierStatementEntry {
    id: string;

    date: string;

    type:
    SupplierStatementEntryType;

    reference: string;

    description: string;

    supplierBillId?: string;
    supplierPaymentId?: string;
    supplierCreditId?: string;

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