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

    /**
     * Revenue specifically posted to the
     * SALES_REVENUE system account.
     */
    salesRevenue: number;

    /**
     * Expense specifically posted to the
     * COST_OF_GOODS_SOLD system account.
     */
    costOfGoodsSold: number;

    grossProfit: number;

    /**
     * Gross profit as a percentage of
     * Sales Revenue.
     *
     * Null when Sales Revenue is zero,
     * because a meaningful margin cannot
     * be calculated.
     */
    grossMarginPercent:
    number | null;

    /**
     * Expenses excluding COGS.
     */
    operatingExpenses: number;

    totalExpenses: number;

    netProfit: number;
}