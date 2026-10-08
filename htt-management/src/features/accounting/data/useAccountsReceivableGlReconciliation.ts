import {
    useMemo,
} from "react";

import {
    useCustomers,
} from "../../contacts/data/useCustomers";

import {
    useSalesDocuments,
} from "../../sales/data/useSalesDocuments";

import {
    usePayments,
} from "../../sales/data/usePayments";

import {
    useCreditAllocations,
    useCreditNotes,
} from "../../sales/data/useCreditNotes";

import {
    useAccounts,
    useJournalEntries,
} from "./useAccounting";

import {
    calculateAccountsReceivableGlReconciliation,
} from "./accountsReceivableGlReconciliationService";

export function useAccountsReceivableGlReconciliation(
    asOfDate:
        string,
) {
    const customers =
        useCustomers();

    const documents =
        useSalesDocuments();

    const payments =
        usePayments();

    const creditNotes =
        useCreditNotes();

    const creditAllocations =
        useCreditAllocations();

    const accounts =
        useAccounts();

    const journalEntries =
        useJournalEntries();

    return useMemo(
        () =>
            calculateAccountsReceivableGlReconciliation({
                customers,

                documents,

                payments,

                creditNotes,

                creditAllocations,

                accounts,

                journalEntries,

                asOfDate,
            }),
        [
            customers,
            documents,
            payments,
            creditNotes,
            creditAllocations,
            accounts,
            journalEntries,
            asOfDate,
        ],
    );
}