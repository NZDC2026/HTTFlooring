export interface AgingBuckets {
    current: number;
    days1To30: number;
    days31To60: number;
    days61To90: number;
    days90Plus: number;
}

export interface CustomerAccountsReceivable {
    customerId: string;

    totalOutstanding: number;
    overdueAmount: number;

    creditLimit: number;
    availableCredit: number;

    aging: AgingBuckets;

    outstandingInvoiceCount: number;
    overdueInvoiceCount: number;
}