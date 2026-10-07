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
    asOfDate?: string;
}

export function reconcileAccountsPayable({
    suppliers,
    bills,
    payments,
    asOfDate = getToday(),
}: ReconcileAccountsPayableInput): AccountsPayableReconciliation {
    /*
     * CONTROL 1
     *
     * Accounts Payable summary derived from
     * outstanding Supplier Bill balances.
     */
    const apSummary =
        calculateAccountsPayableSummary(
            suppliers,
            bills,
            asOfDate,
        );

    /*
     * CONTROL 2
     *
     * Aged Payables must reconcile to the
     * same Supplier Bill balances.
     */
    const agedPayables =
        buildAgedPayablesReport({
            suppliers,
            bills,
            asOfDate,
        });

    const rows:
        SupplierPayableReconciliationRow[] =
        suppliers
            .map(
                (supplier) => {
                    const supplierBills =
                        bills.filter(
                            (bill) =>
                                bill.supplierId ===
                                supplier.id,
                        );

                    const supplierPayments =
                        payments.filter(
                            (payment) =>
                                payment.supplierId ===
                                supplier.id,
                        );

                    /*
                     * Supplier Account balance.
                     *
                     * This is the account-level AP
                     * calculation used throughout
                     * the Supplier detail screen.
                     */
                    const account =
                        calculateSupplierAccountsPayable(
                            supplier,
                            bills,
                            asOfDate,
                        );

                    /*
                     * Supplier Statement from the
                     * beginning of the accounting
                     * timeline through today.
                     */
                    const statement =
                        buildSupplierStatement({
                            supplierId:
                                supplier.id,

                            bills:
                                supplierBills,

                            payments:
                                supplierPayments,

                            fromDate:
                                "1900-01-01",

                            toDate:
                                asOfDate,
                        });

                    /*
                     * Independent bill control.
                     *
                     * Current Supplier Bill
                     * amountDue is the AP source
                     * of truth.
                     */
                    const billBalance =
                        roundCurrency(
                            supplierBills
                                .filter(
                                    (bill) =>
                                        bill.status !==
                                        "VOID" &&
                                        bill.billDate <=
                                        asOfDate &&
                                        bill.totals
                                            .amountDue >
                                        0,
                                )
                                .reduce(
                                    (
                                        total,
                                        bill,
                                    ) =>
                                        total +
                                        bill.totals
                                            .amountDue,
                                    0,
                                ),
                        );

                    const agedRow =
                        agedPayables.rows.find(
                            (row) =>
                                row.supplierId ===
                                supplier.id,
                        );

                    const agedPayablesBalance =
                        roundCurrency(
                            agedRow?.totalOutstanding ??
                            0,
                        );

                    const accountBalance =
                        roundCurrency(
                            account.totalOutstanding,
                        );

                    const statementBalance =
                        roundCurrency(
                            statement.closingBalance,
                        );

                    const difference =
                        getMaximumDifference(
                            billBalance,
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

                        billBalance,

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
                (row) =>
                    row.billBalance !==
                    0 ||
                    row.accountBalance !==
                    0 ||
                    row.agedPayablesBalance !==
                    0 ||
                    row.statementBalance !==
                    0,
            )
            .sort(
                (a, b) => {
                    if (
                        a.balanced !==
                        b.balanced
                    ) {
                        return a.balanced
                            ? 1
                            : -1;
                    }

                    return b.billBalance -
                        a.billBalance;
                },
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

    const outstandingSupplierBills =
        roundCurrency(
            apSummary.totalOutstanding,
        );

    const agedPayablesTotal =
        roundCurrency(
            agedPayables.totalOutstanding,
        );

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
            (row) =>
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
            (value +
                Number.EPSILON) *
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