export type BankReconciliationStatus =
    | "COMPLETED";

export interface BankReconciliation {
    id: string;

    reconciliationNumber: string;

    bankAccountId: string;

    statementDate: string;

    statementBalance: number;

    bookBalance: number;

    outstandingDeposits: number;

    outstandingPayments: number;

    adjustedStatementBalance: number;

    difference: number;

    clearedTransactionIds:
    string[];

    status:
    BankReconciliationStatus;

    reconciledAt: string;
}

export interface CompleteBankReconciliationInput {
    bankAccountId: string;

    statementDate: string;

    statementBalance: number;

    clearedTransactionIds:
    string[];
}