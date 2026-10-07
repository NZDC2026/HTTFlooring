import type {
    Customer,
} from "../../contacts/types/customer";

import type {
    Invoice,
    SalesDocument,
} from "../types/salesDocument";

import type {
    Payment,
} from "../types/payment";

import type {
    CreditAllocation,
    CreditNote,
} from "../types/creditNote";

import type {
    AccountsReceivableReconciliation,
    CreditNoteReconciliationIssue,
    InvoiceReconciliationIssue,
} from "../types/accountsReceivableReconciliation";

import {
    calculateCustomerAccountsReceivable,
} from "./accountsReceivableService";

import {
    calculateInvoiceBalanceAsAt,
} from "./invoiceBalanceAsAtService";

import {
    calculateCreditNoteBalanceAsAt,
} from "./creditNoteBalanceAsAtService";

import {
    buildCustomerStatement,
} from "./customerStatementService";

interface ReconcileAccountsReceivableInput {
    customer: Customer;

    documents: SalesDocument[];

    payments: Payment[];

    creditNotes: CreditNote[];

    creditAllocations:
    CreditAllocation[];

    asOfDate?: string;
}

export function reconcileAccountsReceivable({
    customer,
    documents,
    payments,
    creditNotes,
    creditAllocations,
    asOfDate = getToday(),
}: ReconcileAccountsReceivableInput): AccountsReceivableReconciliation {
    const customerDocuments =
        documents.filter(
            (document) =>
                document.customerId ===
                customer.id,
        );

    const customerPayments =
        payments.filter(
            (payment) =>
                payment.customerId ===
                customer.id,
        );

    const customerCreditNotes =
        creditNotes.filter(
            (creditNote) =>
                creditNote.customerId ===
                customer.id,
        );

    const customerAllocations =
        creditAllocations.filter(
            (allocation) =>
                allocation.customerId ===
                customer.id,
        );

    /*
     * ACCOUNT LEVEL
     */
    const ar =
        calculateCustomerAccountsReceivable(
            customer,
            customerDocuments,
            customerPayments,
            customerAllocations,
            customerCreditNotes,
            asOfDate,
        );

    /*
     * A statement from the beginning of the
     * accounting timeline gives us the complete
     * closing balance as at the selected date.
     */
    const statement =
        buildCustomerStatement({
            customerId:
                customer.id,

            documents:
                customerDocuments,

            payments:
                customerPayments,

            creditNotes:
                customerCreditNotes,

            fromDate:
                "1900-01-01",

            toDate:
                asOfDate,
        });

    const accountDifference =
        roundCurrency(
            statement.closingBalance -
            ar.netAccountBalance,
        );

    /*
     * INVOICE LEVEL
     *
     * Current stored snapshot must equal the
     * transaction-derived current balance.
     *
     * Historical dates are not compared against
     * current stored snapshots.
     */
    const invoiceIssues:
        InvoiceReconciliationIssue[] =
        [];

    const isCurrentDate =
        asOfDate ===
        getToday();

    if (
        isCurrentDate
    ) {
        const invoices =
            customerDocuments.filter(
                (
                    document,
                ): document is Invoice =>
                    document.type ===
                    "INVOICE",
            );

        for (
            const invoice of invoices
        ) {
            const expected =
                calculateInvoiceBalanceAsAt(
                    invoice,
                    customerPayments,
                    customerAllocations,
                    asOfDate,
                );

            const actualAmountPaid =
                roundCurrency(
                    invoice.amountPaid,
                );

            const actualAmountDue =
                roundCurrency(
                    invoice.amountDue,
                );

            const paidDifference =
                roundCurrency(
                    actualAmountPaid -
                    expected.amountPaid,
                );

            const dueDifference =
                roundCurrency(
                    actualAmountDue -
                    expected.amountDue,
                );

            if (
                !isZero(
                    paidDifference,
                ) ||
                !isZero(
                    dueDifference,
                )
            ) {
                invoiceIssues.push({
                    type:
                        "INVOICE_BALANCE_MISMATCH",

                    invoiceId:
                        invoice.id,

                    reference:
                        invoice.documentNumber,

                    expectedAmountPaid:
                        expected.amountPaid,

                    actualAmountPaid,

                    expectedAmountDue:
                        expected.amountDue,

                    actualAmountDue,

                    difference:
                        dueDifference,
                });
            }
        }
    }

    /*
     * CREDIT NOTE LEVEL
     */
    const creditNoteIssues:
        CreditNoteReconciliationIssue[] =
        [];

    if (
        isCurrentDate
    ) {
        for (
            const creditNote of
            customerCreditNotes
        ) {
            const expected =
                calculateCreditNoteBalanceAsAt(
                    creditNote,
                    customerAllocations,
                    asOfDate,
                );

            const actualApplied =
                roundCurrency(
                    creditNote.amountApplied,
                );

            const actualAvailable =
                roundCurrency(
                    creditNote.amountAvailable,
                );

            /*
             * VOID and DRAFT notes should have no
             * current available accounting balance.
             */
            const expectedApplied =
                expected.isEffective
                    ? expected.amountApplied
                    : 0;

            const expectedAvailable =
                expected.isEffective
                    ? expected.amountAvailable
                    : 0;

            const appliedDifference =
                roundCurrency(
                    actualApplied -
                    expectedApplied,
                );

            const availableDifference =
                roundCurrency(
                    actualAvailable -
                    expectedAvailable,
                );

            if (
                !isZero(
                    appliedDifference,
                ) ||
                !isZero(
                    availableDifference,
                )
            ) {
                creditNoteIssues.push({
                    type:
                        "CREDIT_NOTE_BALANCE_MISMATCH",

                    creditNoteId:
                        creditNote.id,

                    reference:
                        creditNote.creditNoteNumber,

                    expectedAmountApplied:
                        expectedApplied,

                    actualAmountApplied:
                        actualApplied,

                    expectedAmountAvailable:
                        expectedAvailable,

                    actualAmountAvailable:
                        actualAvailable,

                    difference:
                        availableDifference,
                });
            }
        }
    }

    const accountBalanced =
        isZero(
            accountDifference,
        );

    const invoicesBalanced =
        invoiceIssues.length ===
        0;

    const creditNotesBalanced =
        creditNoteIssues.length ===
        0;

    return {
        customerId:
            customer.id,

        asOfDate,

        invoiceAr:
            ar.totalOutstanding,

        unallocatedCredit:
            ar.unallocatedCredit,

        calculatedNetAccountBalance:
            ar.netAccountBalance,

        statementClosingBalance:
            statement.closingBalance,

        accountDifference,

        invoicesBalanced,

        creditNotesBalanced,

        accountBalanced,

        balanced:
            accountBalanced &&
            invoicesBalanced &&
            creditNotesBalanced,

        invoiceIssues,

        creditNoteIssues,
    };
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

function roundCurrency(
    value: number,
) {
    return Math.round(
        (value +
            Number.EPSILON) *
        100,
    ) / 100;
}