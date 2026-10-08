import type {
    Account,
} from "../types/account";

import type {
    JournalEntry,
} from "../types/journalEntry";

import type {
    GeneralLedgerAccountBalance,
    GeneralLedgerSummary,
    GeneralLedgerTransaction,
} from "../types/generalLedger";

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

function validateAsOfDate(
    value: string,
) {
    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
            value,
        )
    ) {
        throw new Error(
            "As-at date must use YYYY-MM-DD format.",
        );
    }
}

function calculateNaturalBalance(
    account:
        Account,

    totalDebit:
        number,

    totalCredit:
        number,
) {
    if (
        account.type ===
        "ASSET" ||
        account.type ===
        "EXPENSE"
    ) {
        return roundCurrency(
            totalDebit -
            totalCredit,
        );
    }

    return roundCurrency(
        totalCredit -
        totalDebit,
    );
}

export function calculateGeneralLedgerSummary(
    accounts:
        Account[],

    journalEntries:
        JournalEntry[],

    asOfDate:
        string,
): GeneralLedgerSummary {
    validateAsOfDate(
        asOfDate,
    );

    const relevantEntries =
        journalEntries.filter(
            (entry) =>
                entry.journalDate <=
                asOfDate,
        );

    const accountBalances:
        GeneralLedgerAccountBalance[] =
        accounts
            .map(
                (account) => {
                    let totalDebit =
                        0;

                    let totalCredit =
                        0;

                    for (
                        const entry
                        of relevantEntries
                    ) {
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

                            totalDebit =
                                roundCurrency(
                                    totalDebit +
                                    line.debit,
                                );

                            totalCredit =
                                roundCurrency(
                                    totalCredit +
                                    line.credit,
                                );
                        }
                    }

                    return {
                        account,

                        totalDebit,

                        totalCredit,

                        balance:
                            calculateNaturalBalance(
                                account,
                                totalDebit,
                                totalCredit,
                            ),
                    };
                },
            )
            .sort(
                (
                    first,
                    second,
                ) =>
                    first.account.code.localeCompare(
                        second
                            .account
                            .code,
                        undefined,
                        {
                            numeric:
                                true,
                        },
                    ),
            );

    const totalDebit =
        roundCurrency(
            relevantEntries.reduce(
                (
                    total,
                    entry,
                ) =>
                    total +
                    entry.totalDebit,
                0,
            ),
        );

    const totalCredit =
        roundCurrency(
            relevantEntries.reduce(
                (
                    total,
                    entry,
                ) =>
                    total +
                    entry.totalCredit,
                0,
            ),
        );

    return {
        asOfDate,

        totalDebit,
        totalCredit,

        balanced:
            totalDebit ===
            totalCredit,

        accountBalances,
    };
}

export function getGeneralLedgerTransactions(
    account:
        Account,

    journalEntries:
        JournalEntry[],

    asOfDate:
        string,
): GeneralLedgerTransaction[] {
    validateAsOfDate(
        asOfDate,
    );

    const rows =
        journalEntries
            .filter(
                (entry) =>
                    entry.journalDate <=
                    asOfDate,
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
                        second
                            .line
                            .id,
                    );
                },
            );

    let runningBalance =
        0;

    return rows.map(
        ({
            entry,
            line,
        }) => {
            if (
                account.type ===
                "ASSET" ||
                account.type ===
                "EXPENSE"
            ) {
                runningBalance =
                    roundCurrency(
                        runningBalance +
                        line.debit -
                        line.credit,
                    );
            } else {
                runningBalance =
                    roundCurrency(
                        runningBalance +
                        line.credit -
                        line.debit,
                    );
            }

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

                accountId:
                    line.accountId,

                accountCode:
                    line.accountCode,

                accountName:
                    line.accountName,

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
}