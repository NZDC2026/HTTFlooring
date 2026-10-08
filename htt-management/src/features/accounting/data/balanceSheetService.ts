import type {
    Account,
} from "../types/account";

import type {
    JournalEntry,
} from "../types/journalEntry";

import type {
    BalanceSheet,
    BalanceSheetAccountRow,
} from "../types/balanceSheet";

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
) {
    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
            value,
        )
    ) {
        throw new Error(
            "As of date must use YYYY-MM-DD format.",
        );
    }
}

function calculateAccountAmount(
    account:
        Account,

    journalEntries:
        JournalEntry[],
) {
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

function calculateRows(
    accounts:
        Account[],

    journalEntries:
        JournalEntry[],

    accountType:
        "ASSET"
        | "LIABILITY"
        | "EQUITY",
): BalanceSheetAccountRow[] {
    return accounts
        .filter(
            (account) =>
                account.type ===
                accountType,
        )
        .map(
            (
                account,
            ) => ({
                accountId:
                    account.id,

                accountCode:
                    account.code,

                accountName:
                    account.name,

                amount:
                    calculateAccountAmount(
                        account,
                        journalEntries,
                    ),
            }),
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

function sumRows(
    rows:
        BalanceSheetAccountRow[],
) {
    return roundCurrency(
        rows.reduce(
            (
                total,
                row,
            ) =>
                total +
                row.amount,
            0,
        ),
    );
}

export function calculateBalanceSheet(
    accounts:
        Account[],

    journalEntries:
        JournalEntry[],

    asOfDate:
        string,
): BalanceSheet {
    validateDate(
        asOfDate,
    );

    const entriesAsOfDate =
        journalEntries.filter(
            (entry) =>
                entry.journalDate <=
                asOfDate,
        );

    const assets =
        calculateRows(
            accounts,
            entriesAsOfDate,
            "ASSET",
        );

    const liabilities =
        calculateRows(
            accounts,
            entriesAsOfDate,
            "LIABILITY",
        );

    const equity =
        calculateRows(
            accounts,
            entriesAsOfDate,
            "EQUITY",
        );

    const revenueAccounts =
        accounts.filter(
            (account) =>
                account.type ===
                "REVENUE",
        );

    const expenseAccounts =
        accounts.filter(
            (account) =>
                account.type ===
                "EXPENSE",
        );

    const totalRevenue =
        roundCurrency(
            revenueAccounts.reduce(
                (
                    total,
                    account,
                ) =>
                    total +
                    calculateAccountAmount(
                        account,
                        entriesAsOfDate,
                    ),
                0,
            ),
        );

    const totalExpenses =
        roundCurrency(
            expenseAccounts.reduce(
                (
                    total,
                    account,
                ) =>
                    total +
                    calculateAccountAmount(
                        account,
                        entriesAsOfDate,
                    ),
                0,
            ),
        );

    const totalAssets =
        sumRows(
            assets,
        );

    const totalLiabilities =
        sumRows(
            liabilities,
        );

    const postedEquity =
        sumRows(
            equity,
        );

    const currentEarnings =
        roundCurrency(
            totalRevenue -
            totalExpenses,
        );

    const totalEquity =
        roundCurrency(
            postedEquity +
            currentEarnings,
        );

    const totalLiabilitiesAndEquity =
        roundCurrency(
            totalLiabilities +
            totalEquity,
        );

    const difference =
        roundCurrency(
            totalAssets -
            totalLiabilitiesAndEquity,
        );

    return {
        asOfDate,

        assets,
        liabilities,
        equity,

        totalAssets,

        totalLiabilities,

        postedEquity,

        currentEarnings,

        totalEquity,

        totalLiabilitiesAndEquity,

        difference,

        balanced:
            difference ===
            0,
    };
}