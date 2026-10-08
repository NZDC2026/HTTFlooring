export interface CustomerArGlReconciliationRow {
    customerId: string;

    customerCode: string;

    customerName: string;

    subledgerBalance: number;
}

export interface AccountsReceivableGlReconciliation {
    asOfDate: string;

    customerBalances:
    CustomerArGlReconciliationRow[];

    arSubledgerBalance: number;

    glAccountsReceivableBalance: number;

    difference: number;

    reconciled: boolean;
}