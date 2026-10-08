import type {
    Account,
} from "./account";

import type {
    AccountingSourceType,
    JournalEntryStatus,
} from "./journalEntry";

export interface GeneralLedgerReportTransaction {
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

    lineDescription?: string;

    debit: number;
    credit: number;

    runningBalance: number;
}

export interface GeneralLedgerReport {
    account: Account;

    fromDate: string;
    toDate: string;

    openingBalance: number;

    periodDebit: number;
    periodCredit: number;

    closingBalance: number;

    transactions:
    GeneralLedgerReportTransaction[];
}