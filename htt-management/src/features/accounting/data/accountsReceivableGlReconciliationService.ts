import type {
    Customer,
} from "../../contacts/types/customer";

import type {
    SalesDocument,
} from "../../sales/types/salesDocument";

import type {
    Payment,
} from "../../sales/types/payment";

import type {
    CreditAllocation,
    CreditNote,
} from "../../sales/types/creditNote";

import type {
    JournalEntry,
} from "../types/journalEntry";

import type {
    Account,
} from "../types/account";

import type {
    AccountsReceivableGlReconciliation,
    CustomerArGlReconciliationRow,
} from "../types/accountsReceivableGlReconciliation";

import {
    calculateCustomerAccountsReceivable,
} from "../../sales/data/accountsReceivableService";

import {
    calculateGeneralLedgerSummary,
} from "./generalLedgerService";

function roundCurrency(
    value: number,
) {
    return Math.round(
        (
            value +
            Number.EPSILON
        ) * 100,
    ) / 100;
}

interface CalculateAccountsReceivableGlReconciliationInput {
    customers:
    Customer[];

    documents:
    SalesDocument[];

    payments:
    Payment[];

    creditNotes:
    CreditNote[];

    creditAllocations:
    CreditAllocation[];

    accounts:
    Account[];

    journalEntries:
    JournalEntry[];

    asOfDate:
    string;
}

export function calculateAccountsReceivableGlReconciliation({
    customers,
    documents,
    payments,
    creditNotes,
    creditAllocations,
    accounts,
    journalEntries,
    asOfDate,
}: CalculateAccountsReceivableGlReconciliationInput):
    AccountsReceivableGlReconciliation {
    const customerBalances:
        CustomerArGlReconciliationRow[] =
        customers
            .map(
                (customer) => {
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

                    const customerCreditAllocations =
                        creditAllocations.filter(
                            (allocation) =>
                                allocation.customerId ===
                                customer.id,
                        );

                    const ar =
                        calculateCustomerAccountsReceivable(
                            customer,
                            customerDocuments,
                            customerPayments,
                            customerCreditAllocations,
                            customerCreditNotes,
                            asOfDate,
                        );

                    return {
                        customerId:
                            customer.id,

                        customerCode:
                            customer.id,

                        customerName:
                            customer.businessName,

                        subledgerBalance:
                            roundCurrency(
                                ar.netAccountBalance,
                            ),
                    };
                },
            )
            .filter(
                (row) =>
                    row.subledgerBalance !==
                    0,
            )
            .sort(
                (
                    first,
                    second,
                ) =>
                    first.customerCode.localeCompare(
                        second.customerCode,
                        undefined,
                        {
                            numeric:
                                true,
                        },
                    ),
            );

    const arSubledgerBalance =
        roundCurrency(
            customerBalances.reduce(
                (
                    total,
                    row,
                ) =>
                    total +
                    row.subledgerBalance,
                0,
            ),
        );

    const arAccount =
        accounts.find(
            (account) =>
                account.systemRole ===
                "ACCOUNTS_RECEIVABLE",
        );

    if (!arAccount) {
        throw new Error(
            "Accounts Receivable control account was not found.",
        );
    }

    const glSummary =
        calculateGeneralLedgerSummary(
            accounts,
            journalEntries,
            asOfDate,
        );

    const glAccountsReceivableBalance =
        roundCurrency(
            glSummary
                .accountBalances
                .find(
                    (balance) =>
                        balance.account.id ===
                        arAccount.id,
                )
                ?.balance ??
            0,
        );

    const difference =
        roundCurrency(
            arSubledgerBalance -
            glAccountsReceivableBalance,
        );

    return {
        asOfDate,

        customerBalances,

        arSubledgerBalance,

        glAccountsReceivableBalance,

        difference,

        reconciled:
            difference ===
            0,
    };
}