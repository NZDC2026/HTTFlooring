export interface BalanceSheetAccountRow {
    accountId: string;

    accountCode: string;
    accountName: string;

    amount: number;
}

export interface BalanceSheet {
    asOfDate: string;

    assets:
    BalanceSheetAccountRow[];

    liabilities:
    BalanceSheetAccountRow[];

    equity:
    BalanceSheetAccountRow[];

    totalAssets: number;

    totalLiabilities: number;

    postedEquity: number;

    currentEarnings: number;

    totalEquity: number;

    totalLiabilitiesAndEquity:
    number;

    difference: number;

    balanced: boolean;
}