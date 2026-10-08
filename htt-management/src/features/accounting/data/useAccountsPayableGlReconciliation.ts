import {
    useMemo,
} from "react";

import {
    useSuppliers,
} from "../../contacts/data/useSuppliers";

import {
    useSupplierBills,
} from "../../purchases/data/useSupplierBills";

import {
    useSupplierPayments,
} from "../../purchases/data/useSupplierPayments";

import {
    useSupplierCredits,
    useSupplierCreditAllocations,
} from "../../purchases/data/useSupplierCredits";

import {
    useAccounts,
    useJournalEntries,
} from "./useAccounting";

import {
    calculateAccountsPayableGlReconciliation,
} from "./accountsPayableGlReconciliationService";

export function useAccountsPayableGlReconciliation(
    asOfDate:
        string,
) {
    const suppliers =
        useSuppliers();

    const bills =
        useSupplierBills();

    const payments =
        useSupplierPayments();

    const credits =
        useSupplierCredits();

    const creditAllocations =
        useSupplierCreditAllocations();

    const accounts =
        useAccounts();

    const journalEntries =
        useJournalEntries();

    return useMemo(
        () =>
            calculateAccountsPayableGlReconciliation({
                suppliers,

                bills,

                payments,

                credits,

                creditAllocations,

                accounts,

                journalEntries,

                asOfDate,
            }),
        [
            suppliers,
            bills,
            payments,
            credits,
            creditAllocations,
            accounts,
            journalEntries,
            asOfDate,
        ],
    );
}