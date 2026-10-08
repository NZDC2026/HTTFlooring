import type {
    Account,
} from "./account";

import type {
    AccountingSourceType,
    JournalEntryStatus,
} from "./journalEntry";

export interface GeneralLedgerTransaction {
    journalEntryId: string;
    journalNumber: string;
    journalDate: string;

    journalStatus:
    JournalEntryStatus;

    description: string;

    reference?: string;

    sourceType:
    AccountingSourceType;

    sourceId?: string;

    lineId: string;

    accountId: string;
    accountCode: string;
    accountName: string;

    lineDescription?: string;

    debit: number;
    credit: number;

    runningBalance: number;
}

export interface GeneralLedgerAccountBalance {
    account: Account;

    totalDebit: number;
    totalCredit: number;

    balance: number;
}

export interface GeneralLedgerSummary {
    asOfDate: string;

    totalDebit: number;
    totalCredit: number;

    balanced: boolean;

    accountBalances:
    GeneralLedgerAccountBalance[];
}