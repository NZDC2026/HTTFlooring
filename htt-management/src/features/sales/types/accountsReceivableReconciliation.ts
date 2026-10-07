export type ReconciliationIssueType =
    | "INVOICE_BALANCE_MISMATCH"
    | "CREDIT_NOTE_BALANCE_MISMATCH"
    | "ACCOUNT_BALANCE_MISMATCH";

export interface InvoiceReconciliationIssue {
    type:
    "INVOICE_BALANCE_MISMATCH";

    invoiceId: string;
    reference: string;

    expectedAmountPaid: number;
    actualAmountPaid: number;

    expectedAmountDue: number;
    actualAmountDue: number;

    difference: number;
}

export interface CreditNoteReconciliationIssue {
    type:
    "CREDIT_NOTE_BALANCE_MISMATCH";

    creditNoteId: string;
    reference: string;

    expectedAmountApplied: number;
    actualAmountApplied: number;

    expectedAmountAvailable: number;
    actualAmountAvailable: number;

    difference: number;
}

export interface AccountsReceivableReconciliation {
    customerId: string;

    asOfDate: string;

    invoiceAr: number;
    unallocatedCredit: number;

    calculatedNetAccountBalance:
    number;

    statementClosingBalance:
    number;

    accountDifference: number;

    invoicesBalanced: boolean;
    creditNotesBalanced: boolean;
    accountBalanced: boolean;

    balanced: boolean;

    invoiceIssues:
    InvoiceReconciliationIssue[];

    creditNoteIssues:
    CreditNoteReconciliationIssue[];
}