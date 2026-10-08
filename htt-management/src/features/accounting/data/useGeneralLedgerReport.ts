import {
    useMemo,
} from "react";

import {
    useAccount,
    useJournalEntries,
} from "./useAccounting";

import {
    calculateGeneralLedgerReport,
} from "./generalLedgerReportService";

export function useGeneralLedgerReport(
    accountId:
        string
        | undefined,

    fromDate:
        string,

    toDate:
        string,
) {
    const account =
        useAccount(
            accountId,
        );

    const journalEntries =
        useJournalEntries();

    return useMemo(
        () => {
            if (
                !account
            ) {
                return undefined;
            }

            return calculateGeneralLedgerReport(
                account,
                journalEntries,
                fromDate,
                toDate,
            );
        },
        [
            account,
            journalEntries,
            fromDate,
            toDate,
        ],
    );
}