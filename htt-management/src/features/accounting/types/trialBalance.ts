import type {
    AccountType,
} from "./account";

export interface TrialBalanceRow {
    accountId: string;

    accountCode: string;
    accountName: string;

    accountType:
    AccountType;

    openingDebit: number;
    openingCredit: number;

    periodDebit: number;
    periodCredit: number;

    closingDebit: number;
    closingCredit: number;
}

export interface TrialBalance {
    fromDate: string;
    toDate: string;

    rows:
    TrialBalanceRow[];

    totalOpeningDebit: number;
    totalOpeningCredit: number;

    totalPeriodDebit: number;
    totalPeriodCredit: number;

    totalClosingDebit: number;
    totalClosingCredit: number;

    difference: number;

    balanced: boolean;
}