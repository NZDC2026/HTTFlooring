export interface PayableAgingBuckets {
    current: number;
    days1To30: number;
    days31To60: number;
    days61To90: number;
    days90Plus: number;
}

export interface SupplierAccountsPayable {
    supplierId: string;

    totalOutstanding: number;
    overdueAmount: number;

    aging: PayableAgingBuckets;

    outstandingBillCount: number;
    overdueBillCount: number;
}

export interface AccountsPayableSummary {
    totalOutstanding: number;
    overdueAmount: number;

    supplierCount: number;
    overdueSupplierCount: number;

    outstandingBillCount: number;
    overdueBillCount: number;

    aging: PayableAgingBuckets;
}