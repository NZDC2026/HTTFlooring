import type {
    Account,
} from "../types/account";

import type {
    JournalEntry,
} from "../types/journalEntry";

import type {
    ProfitAndLoss,
    ProfitAndLossAccountRow,
} from "../types/profitAndLoss";

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

export function calculateProfitAndLoss(
    accounts:
        Account[],

    journalEntries:
        JournalEntry[],

    fromDate:
        string,

    toDate:
        string,
): ProfitAndLoss {
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

    const periodEntries =
        journalEntries.filter(
            (entry) =>
                entry.journalDate >=
                fromDate &&
                entry.journalDate <=
                toDate,
        );

    const revenue =
        calculateRows(
            accounts.filter(
                (account) =>
                    account.type ===
                    "REVENUE",
            ),
            periodEntries,
            "REVENUE",
        );

    const expenses =
        calculateRows(
            accounts.filter(
                (account) =>
                    account.type ===
                    "EXPENSE",
            ),
            periodEntries,
            "EXPENSE",
        );

    const totalRevenue =
        roundCurrency(
            revenue.reduce(
                (
                    total,
                    row,
                ) =>
                    total +
                    row.amount,
                0,
            ),
        );

    const totalExpenses =
        roundCurrency(
            expenses.reduce(
                (
                    total,
                    row,
                ) =>
                    total +
                    row.amount,
                0,
            ),
        );

    return {
        fromDate,
        toDate,

        revenue,
        expenses,

        totalRevenue,
        totalExpenses,

        netProfit:
            roundCurrency(
                totalRevenue -
                totalExpenses,
            ),
    };
}

function calculateRows(
    accounts:
        Account[],

    journalEntries:
        JournalEntry[],

    accountType:
        "REVENUE"
        | "EXPENSE",
): ProfitAndLossAccountRow[] {
    return accounts
        .map(
            (
                account,
            ) => {
                let debit =
                    0;

                let credit =
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

                        debit =
                            roundCurrency(
                                debit +
                                line.debit,
                            );

                        credit =
                            roundCurrency(
                                credit +
                                line.credit,
                            );
                    }
                }

                const amount =
                    accountType ===
                        "REVENUE"
                        ? roundCurrency(
                            credit -
                            debit,
                        )
                        : roundCurrency(
                            debit -
                            credit,
                        );

                return {
                    accountId:
                        account.id,

                    accountCode:
                        account.code,

                    accountName:
                        account.name,

                    amount,
                };
            },
        )
        .filter(
            (row) =>
                row.amount !==
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
}