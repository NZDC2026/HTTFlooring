import type {
    Supplier,
} from "../../contacts/types/supplier";

import type {
    SupplierBill,
} from "../../purchases/types/supplierBill";

import type {
    SupplierPayment,
} from "../../purchases/types/supplierPayment";

import type {
    SupplierCredit,
    SupplierCreditAllocation,
} from "../../purchases/types/supplierCredit";

import type {
    Account,
} from "../types/account";

import type {
    JournalEntry,
} from "../types/journalEntry";

import type {
    AccountsPayableGlReconciliation,
} from "../types/accountsPayableGlReconciliation";

import {
    calculateAccountsPayableSummary,
} from "../../purchases/data/accountsPayableService";

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

interface CalculateAccountsPayableGlReconciliationInput {
    suppliers:
    Supplier[];

    bills:
    SupplierBill[];

    payments:
    SupplierPayment[];

    credits:
    SupplierCredit[];

    creditAllocations:
    SupplierCreditAllocation[];

    accounts:
    Account[];

    journalEntries:
    JournalEntry[];

    asOfDate:
    string;
}

export function calculateAccountsPayableGlReconciliation({
    suppliers,
    bills,
    payments,
    credits,
    creditAllocations,
    accounts,
    journalEntries,
    asOfDate,
}: CalculateAccountsPayableGlReconciliationInput):
    AccountsPayableGlReconciliation {
    const apSummary =
        calculateAccountsPayableSummary(
            suppliers,
            bills,
            payments,
            credits,
            creditAllocations,
            asOfDate,
        );

    const apAccount =
        accounts.find(
            (account) =>
                account.systemRole ===
                "ACCOUNTS_PAYABLE",
        );

    if (!apAccount) {
        throw new Error(
            "Accounts Payable control account was not found.",
        );
    }

    const glSummary =
        calculateGeneralLedgerSummary(
            accounts,
            journalEntries,
            asOfDate,
        );

    const glAccountsPayableBalance =
        roundCurrency(
            glSummary
                .accountBalances
                .find(
                    (balance) =>
                        balance.account.id ===
                        apAccount.id,
                )
                ?.balance ??
            0,
        );

    const apSubledgerBalance =
        roundCurrency(
            apSummary.totalOutstanding,
        );

    const difference =
        roundCurrency(
            apSubledgerBalance -
            glAccountsPayableBalance,
        );

    return {
        asOfDate,

        grossOutstanding:
            roundCurrency(
                apSummary.grossOutstanding,
            ),

        unallocatedCredit:
            roundCurrency(
                apSummary.unallocatedCredit,
            ),

        apSubledgerBalance,

        glAccountsPayableBalance,

        difference,

        reconciled:
            difference ===
            0,
    };
}