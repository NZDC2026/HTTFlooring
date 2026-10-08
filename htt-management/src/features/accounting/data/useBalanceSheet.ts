import {
    useMemo,
} from "react";

import {
    useAccounts,
    useJournalEntries,
} from "./useAccounting";

import {
    calculateBalanceSheet,
} from "./balanceSheetService";

export function useBalanceSheet(
    asOfDate:
        string,
) {
    const accounts =
        useAccounts();

    const journalEntries =
        useJournalEntries();

    return useMemo(
        () =>
            calculateBalanceSheet(
                accounts,
                journalEntries,
                asOfDate,
            ),
        [
            accounts,
            journalEntries,
            asOfDate,
        ],
    );
}