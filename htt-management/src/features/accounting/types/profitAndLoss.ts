export interface ProfitAndLossAccountRow {
    accountId: string;

    accountCode: string;
    accountName: string;

    amount: number;
}

export interface ProfitAndLoss {
    fromDate: string;
    toDate: string;

    revenue:
    ProfitAndLossAccountRow[];

    expenses:
    ProfitAndLossAccountRow[];

    totalRevenue: number;

    totalExpenses: number;

    netProfit: number;
}