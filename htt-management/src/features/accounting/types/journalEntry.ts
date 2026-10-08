export type JournalEntryStatus =
    | "POSTED"
    | "REVERSED";

export type AccountingSourceType =
    | "MANUAL_JOURNAL"
    | "CUSTOMER_INVOICE"
    | "CUSTOMER_PAYMENT"
    | "CUSTOMER_PAYMENT_REVERSAL"
    | "CREDIT_NOTE"
    | "CREDIT_NOTE_VOID"
    | "INVOICE_VOID"
    | "SUPPLIER_BILL"
    | "SUPPLIER_BILL_VOID"
    | "SUPPLIER_PAYMENT"
    | "SUPPLIER_PAYMENT_REVERSAL"
    | "SUPPLIER_CREDIT"
    | "SUPPLIER_CREDIT_VOID"
    | "BANK_TRANSACTION"
    | "BANK_TRANSFER";

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