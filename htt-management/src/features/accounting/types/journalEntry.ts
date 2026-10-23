export type JournalEntryStatus =
    | "POSTED"
    | "REVERSED";

export type AccountingSourceType =
    | "YEAR_END_CLOSE"
    | "OPENING_BALANCE"
    | "MANUAL_JOURNAL"
    | "GOODS_RECEIPT"
    | "CUSTOMER_INVOICE"
    | "CUSTOMER_PAYMENT"
    | "CUSTOMER_PAYMENT_REVERSAL"
    | "CREDIT_NOTE"
    | "CREDIT_NOTE_VOID"
    | "INVOICE_VOID"
    | "SALES_FULFILMENT"
    | "SUPPLIER_BILL"
    | "SUPPLIER_BILL_VOID"
    | "SUPPLIER_PAYMENT"
    | "SUPPLIER_PAYMENT_REVERSAL"
    | "SUPPLIER_CREDIT"
    | "SUPPLIER_CREDIT_VOID"
    | "BANK_TRANSACTION"
    | "BANK_TRANSFER"
    | "CUSTOMER_REFUND"
    | "SUPPLIER_REFUND"
    | "CUSTOMER_RETURN"
    | "SUPPLIER_PREPAYMENT"
    | "SUPPLIER_PREPAYMENT_REFUND"
    | "CUSTOMER_DEPOSIT"
    | "CUSTOMER_DEPOSIT_REFUND"
    | "SUPPLIER_RETURN"
    | "SUPPLIER_CREDIT_RECLASS"
    | "BANK_STATEMENT"
    | "PAYROLL"
    | "PAYROLL_PAYMENT";

export interface JournalLine {
    id: string;

    accountId: string;
    accountCode: string;
    accountName: string;

    description?: string;

    debit: number;
    credit: number;
}

export interface JournalEntry {
    bankDuplicateCorrection?: { canonicalJournalId: string; operationId: string };
    id: string;

    journalNumber: string;

    journalDate: string;

    description: string;

    reference?: string;

    sourceType:
    AccountingSourceType;

    sourceId?: string;

    status:
    JournalEntryStatus;

    lines:
    JournalLine[];

    totalDebit: number;
    totalCredit: number;

    createdAt: string;
    updatedAt: string;

    postedAt: string;

    reversedAt?: string;
    reversalReason?: string;

    reversalJournalEntryId?: string;
    reversedJournalEntryId?: string;
}

export interface JournalLineDraft {
    accountId: string;

    description?: string;

    debit: number;
    credit: number;
}

export interface JournalEntryDraft {
    journalDate: string;

    description: string;

    reference?: string;

    sourceType:
    AccountingSourceType;

    sourceId?: string;

    lines:
    JournalLineDraft[];
}

export interface ReverseJournalEntryInput {
    journalEntryId: string;

    reversalDate: string;

    reason: string;
}