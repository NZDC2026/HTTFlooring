import type {
    AccountingSourceType,
    JournalEntryStatus,
} from "../../accounting/types/journalEntry";

export interface BankRegisterTransaction {
    id: string;

    bankAccountId: string;

    journalEntryId: string;
    journalNumber: string;

    transactionDate: string;

    description: string;

    reference?: string;

    sourceType:
    AccountingSourceType;

    sourceId?: string;

    journalStatus:
    JournalEntryStatus;

    moneyIn: number;

    moneyOut: number;

    runningBalance: number;
}

export interface BankRegisterSummary {
    bankAccountId: string;

    asOfDate: string;

    openingBalance: number;

    moneyIn: number;

    moneyOut: number;

    closingBalance: number;

    transactionCount: number;

    transactions:
    BankRegisterTransaction[];
}