import {
    useMemo,
} from "react";

import {
    useAccounts,
    useJournalEntries,
} from "./useAccounting";

import {
    useBankAccounts,
} from "../../banking/data/useBanking";

import {
    useAccountsReceivableGlReconciliation,
} from "./useAccountsReceivableGlReconciliation";

import {
    useAccountsPayableGlReconciliation,
} from "./useAccountsPayableGlReconciliation";

import {
    calculateFinanceControls,
} from "./financeControlsService";

export function useFinanceControls(
    asOfDate:
        string,
) {
    const accounts =
        useAccounts();

    const journalEntries =
        useJournalEntries();

    const bankAccounts =
        useBankAccounts();

    const arReconciliation =
        useAccountsReceivableGlReconciliation(
            asOfDate,
        );

    const apReconciliation =
        useAccountsPayableGlReconciliation(
            asOfDate,
        );

    return useMemo(
        () =>
            calculateFinanceControls({
                accounts,

                journalEntries,

                bankAccounts,

                arReconciliation,

                apReconciliation,

                asOfDate,
            }),
        [
            accounts,
            journalEntries,
            bankAccounts,
            arReconciliation,
            apReconciliation,
            asOfDate,
        ],
    );
}