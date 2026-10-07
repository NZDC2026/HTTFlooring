import type {
    AgingBuckets,
} from "../../sales/types/accountsReceivable";

export interface AgedReceivablesRow {
    customerId: string;
    customerCode: string;
    customerName: string;

    aging: AgingBuckets;

    totalOutstanding: number;
    overdueAmount: number;

    outstandingInvoiceCount: number;
    overdueInvoiceCount: number;
}

export interface AgedReceivablesReport {
    asOfDate: string;

    aging: AgingBuckets;

    totalOutstanding: number;
    totalOverdue: number;

    customerCount: number;
    overdueCustomerCount: number;

    rows: AgedReceivablesRow[];
}