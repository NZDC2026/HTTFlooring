export type BankTransactionDirection =
    | "MONEY_IN"
    | "MONEY_OUT";

export interface BankTransaction {
    id: string;

    transactionNumber: string;

    bankAccountId: string;

    transactionDate: string;

    direction:
    BankTransactionDirection;

    amount: number;

    offsetAccountId: string;

    description: string;

    reference?: string;

    journalEntryId: string;

    createdAt: string;
}

export interface CreateBankTransactionInput {
    bankAccountId: string;

    transactionDate: string;

    direction:
    BankTransactionDirection;

    amount: number;

    offsetAccountId: string;

    description: string;

    reference?: string;
}

export interface BankTransfer {
    id: string;

    transferNumber: string;

    fromBankAccountId: string;
    toBankAccountId: string;

    transferDate: string;

    amount: number;

    description: string;

    reference?: string;

    journalEntryId: string;

    createdAt: string;
}

export interface CreateBankTransferInput {
    fromBankAccountId: string;
    toBankAccountId: string;

    transferDate: string;

    amount: number;

    description: string;

    reference?: string;
}