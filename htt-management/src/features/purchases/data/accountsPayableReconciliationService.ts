import type {
    Supplier,
} from "../../contacts/types/supplier";

import type {
    SupplierBill,
} from "../types/supplierBill";

import type {
    SupplierPayment,
} from "../types/supplierPayment";

import type {
    SupplierCredit,
    SupplierCreditAllocation,
} from "../types/supplierCredit";

import type {
    AccountsPayableReconciliation,
    SupplierPayableReconciliationRow,
} from "../types/accountsPayableReconciliation";

import {
    calculateAccountsPayableSummary,
    calculateSupplierAccountsPayable,
} from "./accountsPayableService";

import {
    buildSupplierStatement,
} from "./supplierStatementService";

import {
    buildAgedPayablesReport,
} from "../../reports/data/agedPayablesService";

interface ReconcileAccountsPayableInput {
    suppliers: Supplier[];
    bills: SupplierBill[];
    payments: SupplierPayment[];
    credits: SupplierCredit[];
    creditAllocations:
    SupplierCreditAllocation[];
    asOfDate?: string;
}

export function reconcileAccountsPayable({
    suppliers,
    bills,
    payments,
    credits,
    creditAllocations,
    asOfDate = getToday(),
}: ReconcileAccountsPayableInput): AccountsPayableReconciliation {
    /*
     * CONTROL 1
     *
     * Accounts Payable summary.
     *
     * Gross Outstanding Bills
     * - Unallocated Supplier Credits
     * = Net Accounts Payable
     */
    const apSummary =
        calculateAccountsPayableSummary(
            suppliers,
            bills,
            payments,
            credits,
            creditAllocations,
            asOfDate,
        );

    /*
     * CONTROL 2
     *
     * Aged Payables uses the same historical
     * Supplier Bill and Supplier Credit balances.
     */
    const agedPayables =
        buildAgedPayablesReport({
            suppliers,
            bills,
            payments,
            credits,
            creditAllocations,
            asOfDate,
        });

    const rows:
        SupplierPayableReconciliationRow[] =
        suppliers
            .map(
                (
                    supplier,
                ) => {
                    const supplierBills =
                        bills.filter(
                            (
                                bill,
                            ) =>
                                bill.supplierId ===
                                supplier.id,
                        );

                    const supplierPayments =
                        payments.filter(
                            (
                                payment,
                            ) =>
                                payment.supplierId ===
                                supplier.id,
                        );

                    const supplierCredits =
                        credits.filter(
                            (
                                credit,
                            ) =>
                                credit.supplierId ===
                                supplier.id,
                        );

                    /*
                     * Supplier Account
                     *
                     * This returns:
                     *
                     * grossOutstanding
                     * unallocatedCredit
                     * totalOutstanding
                     */
                    const account =
                        calculateSupplierAccountsPayable(
                            supplier,
                            bills,
                            payments,
                            credits,
                            creditAllocations,
                            asOfDate,
                        );

                    /*
                     * Supplier Statement
                     *
                     * Supplier Credit issuance
                     * reduces AP.
                     *
                     * Supplier Credit Void
                     * restores AP.
                     *
                     * Allocation and Allocation
                     * Reversal do not create
                     * statement entries.
                     */
                    const statement =
                        buildSupplierStatement({
                            supplierId:
                                supplier.id,

                            bills:
                                supplierBills,

                            payments:
                                supplierPayments,

                            credits:
                                supplierCredits,

                            fromDate:
                                "1900-01-01",

                            toDate:
                                asOfDate,
                        });

                    /*
                     * Gross outstanding Supplier
                     * Bill balance after payments
                     * and allocated credits.
                     */
                    const grossBillBalance =
                        roundCurrency(
                            account.grossOutstanding,
                        );

                    /*
                     * Supplier Credit that exists
                     * but has not yet been applied
                     * to Supplier Bills.
                     */
                    const unallocatedCredit =
                        roundCurrency(
                            account.unallocatedCredit,
                        );

                    /*
                     * Net AP control:
                     *
                     * Gross Bills
                     * - Unallocated Credits
                     */
                    const netBillBalance =
                        roundCurrency(
                            grossBillBalance -
                            unallocatedCredit,
                        );

                    const accountBalance =
                        roundCurrency(
                            account.totalOutstanding,
                        );

                    const agedRow =
                        agedPayables.rows.find(
                            (
                                row,
                            ) =>
                                row.supplierId ===
                                supplier.id,
                        );

                    const agedPayablesBalance =
                        roundCurrency(
                            agedRow?.totalOutstanding ??
                            0,
                        );

                    const statementBalance =
                        roundCurrency(
                            statement.closingBalance,
                        );

                    const difference =
                        getMaximumDifference(
                            netBillBalance,
                            accountBalance,
                            agedPayablesBalance,
                            statementBalance,
                        );

                    return {
                        supplierId:
                            supplier.id,

                        supplierCode:
                            supplier.code,

                        supplierName:
                            supplier.businessName,

                        grossBillBalance,

                        unallocatedCredit,

                        netBillBalance,

                        accountBalance,

                        agedPayablesBalance,

                        statementBalance,

                        difference,

                        balanced:
                            isZero(
                                difference,
                            ),
                    };
                },
            )
            .filter(
                (
                    row,
                ) =>
                    row.grossBillBalance !==
                    0 ||
                    row.unallocatedCredit !==
                    0 ||
                    row.netBillBalance !==
                    0 ||
                    row.accountBalance !==
                    0 ||
                    row.agedPayablesBalance !==
                    0 ||
                    row.statementBalance !==
                    0,
            )
            .sort(
                (
                    a,
                    b,
                ) => {
                    /*
                     * Mismatches appear first.
                     */
                    if (
                        a.balanced !==
                        b.balanced
                    ) {
                        return a.balanced
                            ? 1
                            : -1;
                    }

                    /*
                     * Then largest absolute AP
                     * balances first.
                     */
                    return (
                        Math.abs(
                            b.netBillBalance,
                        ) -
                        Math.abs(
                            a.netBillBalance,
                        )
                    );
                },
            );

    /*
     * CONTROL TOTALS
     */

    const grossOutstandingSupplierBills =
        roundCurrency(
            apSummary.grossOutstanding,
        );

    const unallocatedSupplierCredits =
        roundCurrency(
            apSummary.unallocatedCredit,
        );

    const outstandingSupplierBills =
        roundCurrency(
            apSummary.totalOutstanding,
        );

    const supplierAccountBalances =
        roundCurrency(
            rows.reduce(
                (
                    total,
                    row,
                ) =>
                    total +
                    row.accountBalance,
                0,
            ),
        );

    const agedPayablesTotal =
        roundCurrency(
            agedPayables.totalOutstanding,
        );

    const supplierStatementBalances =
        roundCurrency(
            rows.reduce(
                (
                    total,
                    row,
                ) =>
                    total +
                    row.statementBalance,
                0,
            ),
        );

    /*
     * RECONCILIATION DIFFERENCES
     */

    const accountDifference =
        roundCurrency(
            supplierAccountBalances -
            outstandingSupplierBills,
        );

    const agedPayablesDifference =
        roundCurrency(
            agedPayablesTotal -
            outstandingSupplierBills,
        );

    const statementDifference =
        roundCurrency(
            supplierStatementBalances -
            outstandingSupplierBills,
        );

    const mismatchCount =
        rows.filter(
            (
                row,
            ) =>
                !row.balanced,
        ).length;

    const balanced =
        isZero(
            accountDifference,
        ) &&
        isZero(
            agedPayablesDifference,
        ) &&
        isZero(
            statementDifference,
        ) &&
        mismatchCount ===
        0;

    return {
        asOfDate,

        grossOutstandingSupplierBills,

        unallocatedSupplierCredits,

        outstandingSupplierBills,

        supplierAccountBalances,

        agedPayablesTotal,

        supplierStatementBalances,

        accountDifference,

        agedPayablesDifference,

        statementDifference,

        balanced,

        supplierCount:
            rows.length,

        mismatchCount,

        rows,
    };
}

function getMaximumDifference(
    ...values: number[]
) {
    if (
        values.length ===
        0
    ) {
        return 0;
    }

    const minimum =
        Math.min(
            ...values,
        );

    const maximum =
        Math.max(
            ...values,
        );

    return roundCurrency(
        maximum -
        minimum,
    );
}

function isZero(
    value: number,
) {
    return (
        Math.abs(
            value,
        ) < 0.005
    );
}

function roundCurrency(
    value: number,
) {
    return (
        Math.round(
            (
                value +
                Number.EPSILON
            ) *
            100,
        ) / 100
    );
}

function getToday() {
    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() +
            1,
        ).padStart(
            2,
            "0",
        );

    const day =
        String(
            now.getDate(),
        ).padStart(
            2,
            "0",
        );

    return `${year}-${month}-${day}`;
}