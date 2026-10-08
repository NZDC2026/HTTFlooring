import type {
    Account,
} from "../types/account";

import type {
    JournalEntry,
} from "../types/journalEntry";

import type {
    TrialBalance,
    TrialBalanceRow,
} from "../types/trialBalance";

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

function toDebitCreditBalance(
    debit:
        number,

    credit:
        number,
) {
    const net =
        roundCurrency(
            debit -
            credit,
        );

    if (
        net >=
        0
    ) {
        return {
            debit:
                net,

            credit:
                0,
        };
    }

    return {
        debit:
            0,

        credit:
            roundCurrency(
                Math.abs(
                    net,
                ),
            ),
    };
}

export function calculateTrialBalance(
    accounts:
        Account[],

    journalEntries:
        JournalEntry[],

    fromDate:
        string,

    toDate:
        string,
): TrialBalance {
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

    const rows:
        TrialBalanceRow[] =
        accounts
            .map(
                (
                    account,
                ) => {
                    let openingDebit =
                        0;

                    let openingCredit =
                        0;

                    let periodDebit =
                        0;

                    let periodCredit =
                        0;

                    for (
                        const entry
                        of journalEntries
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

                            if (
                                entry.journalDate <
                                fromDate
                            ) {
                                openingDebit =
                                    roundCurrency(
                                        openingDebit +
                                        line.debit,
                                    );

                                openingCredit =
                                    roundCurrency(
                                        openingCredit +
                                        line.credit,
                                    );

                                continue;
                            }

                            if (
                                entry.journalDate <=
                                toDate
                            ) {
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
                            }
                        }
                    }

                    const opening =
                        toDebitCreditBalance(
                            openingDebit,
                            openingCredit,
                        );

                    const closing =
                        toDebitCreditBalance(
                            roundCurrency(
                                openingDebit +
                                periodDebit,
                            ),

                            roundCurrency(
                                openingCredit +
                                periodCredit,
                            ),
                        );

                    return {
                        accountId:
                            account.id,

                        accountCode:
                            account.code,

                        accountName:
                            account.name,

                        accountType:
                            account.type,

                        openingDebit:
                            opening.debit,

                        openingCredit:
                            opening.credit,

                        periodDebit,

                        periodCredit,

                        closingDebit:
                            closing.debit,

                        closingCredit:
                            closing.credit,
                    };
                },
            )
            .filter(
                (
                    row,
                ) =>
                    row.openingDebit !==
                    0 ||
                    row.openingCredit !==
                    0 ||
                    row.periodDebit !==
                    0 ||
                    row.periodCredit !==
                    0 ||
                    row.closingDebit !==
                    0 ||
                    row.closingCredit !==
                    0,
            )
            .sort(
                (
                    first,
                    second,
                ) =>
                    first.accountCode.localeCompare(
                        second.accountCode,
                        undefined,
                        {
                            numeric:
                                true,
                        },
                    ),
            );

    const totalOpeningDebit =
        roundCurrency(
            rows.reduce(
                (
                    total,
                    row,
                ) =>
                    total +
                    row.openingDebit,
                0,
            ),
        );

    const totalOpeningCredit =
        roundCurrency(
            rows.reduce(
                (
                    total,
                    row,
                ) =>
                    total +
                    row.openingCredit,
                0,
            ),
        );

    const totalPeriodDebit =
        roundCurrency(
            rows.reduce(
                (
                    total,
                    row,
                ) =>
                    total +
                    row.periodDebit,
                0,
            ),
        );

    const totalPeriodCredit =
        roundCurrency(
            rows.reduce(
                (
                    total,
                    row,
                ) =>
                    total +
                    row.periodCredit,
                0,
            ),
        );

    const totalClosingDebit =
        roundCurrency(
            rows.reduce(
                (
                    total,
                    row,
                ) =>
                    total +
                    row.closingDebit,
                0,
            ),
        );

    const totalClosingCredit =
        roundCurrency(
            rows.reduce(
                (
                    total,
                    row,
                ) =>
                    total +
                    row.closingCredit,
                0,
            ),
        );

    const difference =
        roundCurrency(
            totalClosingDebit -
            totalClosingCredit,
        );

    return {
        fromDate,
        toDate,

        rows,

        totalOpeningDebit,
        totalOpeningCredit,

        totalPeriodDebit,
        totalPeriodCredit,

        totalClosingDebit,
        totalClosingCredit,

        difference,

        balanced:
            difference ===
            0,
    };
}