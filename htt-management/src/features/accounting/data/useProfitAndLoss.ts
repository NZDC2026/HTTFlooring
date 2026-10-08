import {
    useMemo,
} from "react";

import {
    useAccounts,
    useJournalEntries,
} from "./useAccounting";

import {
    calculateProfitAndLoss,
} from "./profitAndLossService";

export function useProfitAndLoss(
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
            calculateProfitAndLoss(
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