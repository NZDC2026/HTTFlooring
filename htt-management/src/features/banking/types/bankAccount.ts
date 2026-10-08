export type BankAccountType =
    | "TRANSACTION"
    | "SAVINGS"
    | "CREDIT_CARD"
    | "OTHER";

export interface BankAccount {
    id: string;

    name: string;

    bankName: string;

    accountNumber: string;

    accountType:
    BankAccountType;

    currency: string;

    glAccountId: string;

    openingBalance: number;

    openingBalanceDate: string;

    active: boolean;

    createdAt: string;
    updatedAt: string;
}