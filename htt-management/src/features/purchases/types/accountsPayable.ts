export interface PayableAgingBuckets {
    current: number;
    days1To30: number;
    days31To60: number;
    days61To90: number;
    days90Plus: number;
}

export interface SupplierAccountsPayable {
    supplierId: string;

    /**
     * Outstanding Supplier Bill balances after
     * payments and allocated supplier credits.
     */
    grossOutstanding: number;

    /**
     * Supplier Credit that has been issued but
     * has not yet been allocated to a bill.
     */
    unallocatedCredit: number;

    /**
     * grossOutstanding - unallocatedCredit
     */
    totalOutstanding: number;

    overdueAmount: number;

    aging: PayableAgingBuckets;

    outstandingBillCount: number;
    overdueBillCount: number;
}

export interface AccountsPayableSummary {
    grossOutstanding: number;

    unallocatedCredit: number;

    totalOutstanding: number;

    overdueAmount: number;

    supplierCount: number;
    overdueSupplierCount: number;

    outstandingBillCount: number;
    overdueBillCount: number;

    aging: PayableAgingBuckets;
}