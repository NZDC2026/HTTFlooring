import {
    useMemo,
} from "react";

import {
    useAccounts,
    useJournalEntries,
} from "./useAccounting";

import {
    calculateTrialBalance,
} from "./trialBalanceService";

export function useTrialBalance(
    fromDate:
        string,

    toDate:
        string,
) {
    const accounts =
        useAccounts();

    const journalEntries =
        useJournalEntries();

    return useMemo(
        () =>
            calculateTrialBalance(
                accounts,
                journalEntries,
                fromDate,
                toDate,
            ),
        [
            accounts,
            journalEntries,
            fromDate,
            toDate,
        ],
    );
}