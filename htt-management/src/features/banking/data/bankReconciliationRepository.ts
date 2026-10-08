import type {
    BankReconciliation,
    CompleteBankReconciliationInput,
} from "../types/bankReconciliation";

import {
    bankAccountRepository,
} from "./bankAccountRepository";

import {
    journalEntryRepository,
} from "../../accounting/data/journalEntryRepository";

import {
    calculateBankRegister,
} from "./bankRegisterService";

import {
    calculateBankReconciliation,
} from "./bankReconciliationService";

type Listener =
    () => void;

const listeners =
    new Set<Listener>();

let reconciliations:
    BankReconciliation[] = [];

function emitChange() {
    listeners.forEach(
        (listener) =>
            listener(),
    );
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
            "Statement date must use YYYY-MM-DD format.",
        );
    }
}

function createId() {
    return `bankrec_${Date.now()}_${Math.random()
        .toString(36)
        .slice(
            2,
            8,
        )}`;
}

function createNumber(
    statementDate:
        string,
) {
    const year =
        statementDate.slice(
            0,
            4,
        );

    return `BREC-${year}-${String(
        reconciliations.length +
        1,
    ).padStart(
        4,
        "0",
    )}`;
}

function getCompletedClearedIds(
    bankAccountId:
        string,
) {
    const ids =
        new Set<string>();

    for (
        const reconciliation
        of reconciliations
    ) {
        if (
            reconciliation.bankAccountId !==
            bankAccountId
        ) {
            continue;
        }

        for (
            const transactionId
            of reconciliation
                .clearedTransactionIds
        ) {
            ids.add(
                transactionId,
            );
        }
    }

    return ids;
}

export const bankReconciliationRepository =
{
    subscribe(
        listener:
            Listener,
    ) {
        listeners.add(
            listener,
        );

        return () => {
            listeners.delete(
                listener,
            );
        };
    },

    getSnapshot():
        BankReconciliation[] {
        return reconciliations;
    },

    getAll() {
        return reconciliations;
    },

    getByBankAccount(
        bankAccountId:
            string,
    ) {
        return reconciliations
            .filter(
                (
                    reconciliation,
                ) =>
                    reconciliation.bankAccountId ===
                    bankAccountId,
            )
            .sort(
                (
                    first,
                    second,
                ) =>
                    second.statementDate.localeCompare(
                        first.statementDate,
                    ),
            );
    },

    getLatestByBankAccount(
        bankAccountId:
            string,
    ) {
        return this
            .getByBankAccount(
                bankAccountId,
            )[0];
    },

    getClearedTransactionIds(
        bankAccountId:
            string,
    ) {
        return getCompletedClearedIds(
            bankAccountId,
        );
    },

    complete(
        input:
            CompleteBankReconciliationInput,
    ): BankReconciliation {
        validateDate(
            input.statementDate,
        );

        if (
            !Number.isFinite(
                input.statementBalance,
            )
        ) {
            throw new Error(
                "Statement balance must be a valid amount.",
            );
        }

        const bankAccount =
            bankAccountRepository
                .requireById(
                    input.bankAccountId,
                );

        const latest =
            this.getLatestByBankAccount(
                bankAccount.id,
            );

        if (
            latest &&
            input.statementDate <=
            latest.statementDate
        ) {
            throw new Error(
                `Statement date must be after the last reconciled date ${latest.statementDate}.`,
            );
        }

        const register =
            calculateBankRegister(
                bankAccount,
                journalEntryRepository
                    .getAll(),
                input.statementDate,
            );

        const availableIds =
            new Set(
                register.transactions.map(
                    (
                        transaction,
                    ) =>
                        transaction.id,
                ),
            );

        const previouslyCleared =
            getCompletedClearedIds(
                bankAccount.id,
            );

        const newClearedIds =
            Array.from(
                new Set(
                    input.clearedTransactionIds,
                ),
            ).filter(
                (transactionId) =>
                    !previouslyCleared.has(
                        transactionId,
                    ),
            );

        for (
            const transactionId
            of newClearedIds
        ) {
            if (
                !availableIds.has(
                    transactionId,
                )
            ) {
                throw new Error(
                    "A selected transaction does not belong to this bank register or statement period.",
                );
            }
        }

        const allClearedForCalculation =
            new Set<string>([
                ...previouslyCleared,
                ...newClearedIds,
            ]);

        const calculation =
            calculateBankReconciliation(
                register,
                roundCurrency(
                    input.statementBalance,
                ),
                Array.from(
                    allClearedForCalculation,
                ),
            );

        if (
            !calculation.reconciled
        ) {
            throw new Error(
                `Bank reconciliation is out by ${calculation.difference.toFixed(
                    2,
                )}.`,
            );
        }

        const reconciliation:
            BankReconciliation = {
            id:
                createId(),

            reconciliationNumber:
                createNumber(
                    input.statementDate,
                ),

            bankAccountId:
                bankAccount.id,

            statementDate:
                input.statementDate,

            statementBalance:
                roundCurrency(
                    input.statementBalance,
                ),

            bookBalance:
                calculation.bookBalance,

            outstandingDeposits:
                calculation
                    .outstandingDeposits,

            outstandingPayments:
                calculation
                    .outstandingPayments,

            adjustedStatementBalance:
                calculation
                    .adjustedStatementBalance,

            difference:
                calculation.difference,

            clearedTransactionIds:
                newClearedIds,

            status:
                "COMPLETED",

            reconciledAt:
                new Date()
                    .toISOString(),
        };

        reconciliations = [
            reconciliation,
            ...reconciliations,
        ];

        emitChange();

        return reconciliation;
    },
};