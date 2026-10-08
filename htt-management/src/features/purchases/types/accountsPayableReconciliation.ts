export interface SupplierPayableReconciliationRow {
    supplierId: string;
    supplierCode: string;
    supplierName: string;

    grossBillBalance: number;
    unallocatedCredit: number;

    netBillBalance: number;

    accountBalance: number;
    agedPayablesBalance: number;
    statementBalance: number;

    difference: number;

    balanced: boolean;
}

export interface AccountsPayableReconciliation {
    asOfDate: string;

    grossOutstandingSupplierBills: number;

    unallocatedSupplierCredits: number;

    outstandingSupplierBills: number;

    supplierAccountBalances: number;
    agedPayablesTotal: number;
    supplierStatementBalances: number;

    accountDifference: number;
    agedPayablesDifference: number;
    statementDifference: number;

    balanced: boolean;

    supplierCount: number;
    mismatchCount: number;

    rows: SupplierPayableReconciliationRow[];
}