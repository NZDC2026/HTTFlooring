import type {
    Account,
} from "../types/account";

import type {
    JournalEntry,
} from "../types/journalEntry";

import type {
    GeneralLedgerReport,
    GeneralLedgerReportTransaction,
} from "../types/generalLedgerReport";

function roundCurrency(
    value:
        number,
) {
    return Math.round(
        (
            value +
            Number.EPSILON
        ) * 100,
    ) / 100;
}

function validateDate(
    value:
        string,

    label:
        string,
) {
    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
            value,
        )
    ) {
        throw new Error(
            `${label} must use YYYY-MM-DD format.`,
        );
    }
}

function calculateMovement(
    account:
        Account,

    debit:
        number,

    credit:
        number,
) {
    if (
        account.type ===
        "ASSET" ||
        account.type ===
        "EXPENSE"
    ) {
        return roundCurrency(
            debit -
            credit,
        );
    }

    return roundCurrency(
        credit -
        debit,
    );
}

export function calculateGeneralLedgerReport(
    account:
        Account,

    journalEntries:
        JournalEntry[],

    fromDate:
        string,

    toDate:
        string,
): GeneralLedgerReport {
    validateDate(
        fromDate,
        "From date",
    );

    validateDate(
        toDate,
        "To date",
    );

    if (
        fromDate >
        toDate
    ) {
        throw new Error(
            "From date cannot be after to date.",
        );
    }

    let openingBalance =
        0;

    for (
        const entry
        of journalEntries
    ) {
        if (
            entry.journalDate >=
            fromDate
        ) {
            continue;
        }

        for (
            const line
            of entry.lines
        ) {
            if (
                line.accountId !==
                account.id
            ) {
                continue;
            }

            openingBalance =
                roundCurrency(
                    openingBalance +
                    calculateMovement(
                        account,
                        line.debit,
                        line.credit,
                    ),
                );
        }
    }

    const periodRows =
        journalEntries
            .filter(
                (entry) =>
                    entry.journalDate >=
                    fromDate &&
                    entry.journalDate <=
                    toDate,
            )
            .flatMap(
                (entry) =>
                    entry.lines
                        .filter(
                            (line) =>
                                line.accountId ===
                                account.id,
                        )
                        .map(
                            (line) => ({
                                entry,
                                line,
                            }),
                        ),
            )
            .sort(
                (
                    first,
                    second,
                ) => {
                    const dateCompare =
                        first.entry
                            .journalDate
                            .localeCompare(
                                second
                                    .entry
                                    .journalDate,
                            );

                    if (
                        dateCompare !==
                        0
                    ) {
                        return dateCompare;
                    }

                    const createdCompare =
                        first.entry
                            .createdAt
                            .localeCompare(
                                second
                                    .entry
                                    .createdAt,
                            );

                    if (
                        createdCompare !==
                        0
                    ) {
                        return createdCompare;
                    }

                    return first.line.id.localeCompare(
                        second.line.id,
                    );
                },
            );

    let runningBalance =
        openingBalance;

    let periodDebit =
        0;

    let periodCredit =
        0;

    const transactions:
        GeneralLedgerReportTransaction[] =
        periodRows.map(
            ({
                entry,
                line,
            }) => {
                periodDebit =
                    roundCurrency(
                        periodDebit +
                        line.debit,
                    );

                periodCredit =
                    roundCurrency(
                        periodCredit +
                        line.credit,
                    );

                runningBalance =
                    roundCurrency(
                        runningBalance +
                        calculateMovement(
                            account,
                            line.debit,
                            line.credit,
                        ),
                    );

                return {
                    journalEntryId:
                        entry.id,

                    journalNumber:
                        entry.journalNumber,

                    journalDate:
                        entry.journalDate,

                    journalStatus:
                        entry.status,

                    description:
                        entry.description,

                    reference:
                        entry.reference,

                    sourceType:
                        entry.sourceType,

                    sourceId:
                        entry.sourceId,

                    lineId:
                        line.id,

                    lineDescription:
                        line.description,

                    debit:
                        line.debit,

                    credit:
                        line.credit,

                    runningBalance,
                };
            },
        );

    return {
        account,

        fromDate,
        toDate,

        openingBalance,

        periodDebit,
        periodCredit,

        closingBalance:
            runningBalance,

        transactions,
    };
}