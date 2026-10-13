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

    const salesRevenueAccount =
        accounts.find(
            (
                account,
            ) =>
                account.systemRole ===
                "SALES_REVENUE",
        );

    if (!salesRevenueAccount) {
        throw new Error(
            "Sales Revenue system account was not found.",
        );
    }

    if (
        salesRevenueAccount.type !==
        "REVENUE"
    ) {
        throw new Error(
            "Sales Revenue system account must be a revenue account.",
        );
    }

    const cogsAccount =
        accounts.find(
            (
                account,
            ) =>
                account.systemRole ===
                "COST_OF_GOODS_SOLD",
        );

    if (!cogsAccount) {
        throw new Error(
            "Cost of Goods Sold system account was not found.",
        );
    }

    if (
        cogsAccount.type !==
        "EXPENSE"
    ) {
        throw new Error(
            "Cost of Goods Sold system account must be an expense account.",
        );
    }

    const salesRevenue =
        roundCurrency(
            revenue.find(
                (
                    row,
                ) =>
                    row.accountId ===
                    salesRevenueAccount.id,
            )
                ?.amount ??
            0,
        );

    const costOfGoodsSold =
        roundCurrency(
            expenses.find(
                (
                    row,
                ) =>
                    row.accountId ===
                    cogsAccount.id,
            )
                ?.amount ??
            0,
        );

    const grossProfit =
        roundCurrency(
            salesRevenue -
            costOfGoodsSold,
        );

    const grossMarginPercent =
        salesRevenue ===
            0
            ? null
            : Math.round(
                (
                    (
                        grossProfit /
                        salesRevenue
                    ) *
                    100 +
                    Number.EPSILON
                ) *
                100,
            ) /
            100;

    const operatingExpenses =
        roundCurrency(
            totalExpenses -
            costOfGoodsSold,
        );

    return {
        fromDate,
        toDate,

        revenue,
        expenses,

        totalRevenue,

        salesRevenue,
        costOfGoodsSold,
        grossProfit,
        grossMarginPercent,
        operatingExpenses,

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