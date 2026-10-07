export interface AgingBuckets {
    current: number;
    days1To30: number;
    days31To60: number;
    days61To90: number;
    days90Plus: number;
}

export interface CustomerAccountsReceivable {
    customerId: string;

    /**
     * Gross outstanding balance of invoices
     * after payments and applied credits.
     */
    totalOutstanding: number;

    /**
     * Customer credit that has been issued
     * but has not yet been allocated.
     */
    unallocatedCredit: number;

    /**
     * Customer-level receivable position.
     *
     * invoice AR - unallocated customer credit
     */
    netAccountBalance: number;

    overdueAmount: number;

    creditLimit: number;
    availableCredit: number;

    aging: AgingBuckets;

    outstandingInvoiceCount: number;
    overdueInvoiceCount: number;
}