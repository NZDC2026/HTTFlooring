import type {
    BankRegisterSummary,
    BankRegisterTransaction,
} from "../types/bankRegister";

export interface BankReconciliationCalculation {
    bookBalance: number;

    clearedMoneyIn: number;
    clearedMoneyOut: number;

    outstandingDeposits: number;
    outstandingPayments: number;

    adjustedStatementBalance:
    number;

    difference: number;

    reconciled: boolean;
}

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

export function calculateBankReconciliation(
    register:
        BankRegisterSummary,

    statementBalance:
        number,

    clearedTransactionIds:
        string[],
): BankReconciliationCalculation {
    const clearedIds =
        new Set(
            clearedTransactionIds,
        );

    let clearedMoneyIn =
        0;

    let clearedMoneyOut =
        0;

    let outstandingDeposits =
        0;

    let outstandingPayments =
        0;

    for (
        const transaction
        of register.transactions
    ) {
        if (
            clearedIds.has(
                transaction.id,
            )
        ) {
            clearedMoneyIn =
                roundCurrency(
                    clearedMoneyIn +
                    transaction.moneyIn,
                );

            clearedMoneyOut =
                roundCurrency(
                    clearedMoneyOut +
                    transaction.moneyOut,
                );

            continue;
        }

        outstandingDeposits =
            roundCurrency(
                outstandingDeposits +
                transaction.moneyIn,
            );

        outstandingPayments =
            roundCurrency(
                outstandingPayments +
                transaction.moneyOut,
            );
    }

    const normalizedStatementBalance =
        roundCurrency(
            statementBalance,
        );

    const adjustedStatementBalance =
        roundCurrency(
            normalizedStatementBalance +
            outstandingDeposits -
            outstandingPayments,
        );

    const bookBalance =
        roundCurrency(
            register.closingBalance,
        );

    const difference =
        roundCurrency(
            adjustedStatementBalance -
            bookBalance,
        );

    return {
        bookBalance,

        clearedMoneyIn,
        clearedMoneyOut,

        outstandingDeposits,
        outstandingPayments,

        adjustedStatementBalance,

        difference,

        reconciled:
            difference ===
            0,
    };
}

export function getPreviouslyClearedTransactionIds(
    transactions:
        BankRegisterTransaction[],

    completedClearedIds:
        Set<string>,
) {
    return transactions
        .filter(
            (transaction) =>
                completedClearedIds.has(
                    transaction.id,
                ),
        )
        .map(
            (transaction) =>
                transaction.id,
        );
}