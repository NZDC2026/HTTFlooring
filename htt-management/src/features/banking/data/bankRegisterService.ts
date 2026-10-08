import type {
    JournalEntry,
} from "../../accounting/types/journalEntry";

import type {
    BankAccount,
} from "../types/bankAccount";

import type {
    BankRegisterSummary,
    BankRegisterTransaction,
} from "../types/bankRegister";

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

export function calculateBankRegister(
    bankAccount:
        BankAccount,

    journalEntries:
        JournalEntry[],

    asOfDate:
        string,
): BankRegisterSummary {
    validateDate(
        bankAccount.openingBalanceDate,
        "Opening balance date",
    );

    validateDate(
        asOfDate,
        "As-at date",
    );

    const relevantRows =
        journalEntries
            .filter(
                (entry) =>
                    entry.journalDate >=
                    bankAccount.openingBalanceDate &&
                    entry.journalDate <=
                    asOfDate,
            )
            .flatMap(
                (entry) =>
                    entry.lines
                        .filter(
                            (line) =>
                                line.accountId ===
                                bankAccount.glAccountId,
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
                                second.entry
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
                                second.entry
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
        roundCurrency(
            bankAccount.openingBalance,
        );

    let moneyIn =
        0;

    let moneyOut =
        0;

    const transactions:
        BankRegisterTransaction[] =
        relevantRows.map(
            ({
                entry,
                line,
            }) => {
                const transactionMoneyIn =
                    roundCurrency(
                        line.debit,
                    );

                const transactionMoneyOut =
                    roundCurrency(
                        line.credit,
                    );

                moneyIn =
                    roundCurrency(
                        moneyIn +
                        transactionMoneyIn,
                    );

                moneyOut =
                    roundCurrency(
                        moneyOut +
                        transactionMoneyOut,
                    );

                runningBalance =
                    roundCurrency(
                        runningBalance +
                        transactionMoneyIn -
                        transactionMoneyOut,
                    );

                return {
                    id:
                        `${entry.id}:${line.id}`,

                    bankAccountId:
                        bankAccount.id,

                    journalEntryId:
                        entry.id,

                    journalNumber:
                        entry.journalNumber,

                    transactionDate:
                        entry.journalDate,

                    description:
                        entry.description,

                    reference:
                        entry.reference,

                    sourceType:
                        entry.sourceType,

                    sourceId:
                        entry.sourceId,

                    journalStatus:
                        entry.status,

                    moneyIn:
                        transactionMoneyIn,

                    moneyOut:
                        transactionMoneyOut,

                    runningBalance,
                };
            },
        );

    return {
        bankAccountId:
            bankAccount.id,

        asOfDate,

        openingBalance:
            roundCurrency(
                bankAccount.openingBalance,
            ),

        moneyIn,

        moneyOut,

        closingBalance:
            runningBalance,

        transactionCount:
            transactions.length,

        transactions,
    };
}