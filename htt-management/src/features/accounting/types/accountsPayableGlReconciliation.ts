export interface AccountsPayableGlReconciliation {
    asOfDate: string;

    grossOutstanding: number;

    unallocatedCredit: number;

    apSubledgerBalance: number;

    glAccountsPayableBalance: number;

    difference: number;

    reconciled: boolean;
}