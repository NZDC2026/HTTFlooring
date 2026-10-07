export type StatementEntryType =
    | "INVOICE"
    | "PAYMENT"
    | "PAYMENT_REVERSAL";

export interface StatementEntry {
    id: string;

    date: string;

    type: StatementEntryType;

    reference: string;

    description: string;

    invoiceId?: string;
    paymentId?: string;

    debit: number;
    credit: number;

    balance: number;
}

export interface CustomerStatement {
    customerId: string;

    fromDate: string;
    toDate: string;

    openingBalance: number;

    totalDebits: number;
    totalCredits: number;

    closingBalance: number;

    entries: StatementEntry[];
}