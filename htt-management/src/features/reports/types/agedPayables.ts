import type {
    PayableAgingBuckets,
} from "../../purchases/types/accountsPayable";

export interface AgedPayablesRow {
    supplierId: string;
    supplierCode: string;
    supplierName: string;

    aging:
    PayableAgingBuckets;

    grossOutstanding: number;
    unallocatedCredit: number;

    totalOutstanding: number;
    overdueAmount: number;

    outstandingBillCount: number;
    overdueBillCount: number;
}

export interface AgedPayablesReport {
    asOfDate: string;

    aging:
    PayableAgingBuckets;

    grossOutstanding: number;
    unallocatedCredit: number;

    totalOutstanding: number;
    totalOverdue: number;

    supplierCount: number;
    overdueSupplierCount: number;

    rows:
    AgedPayablesRow[];
}