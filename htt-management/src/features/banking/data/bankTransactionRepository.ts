import { registerRepository } from "../../security/repositoryHost";
import { assertCurrentCrossModuleWriteSafe } from "../../integration/crossModuleWriteGate";
import { requireDateKey } from "../../../lib/businessDate";
import { financialStateStorage } from "../../../lib/persistence/financialStateStorage";
import { financialOperationJournal } from "../../../lib/persistence/financialOperationJournal";
import type {
    BankTransaction,
    BankTransfer,
    CreateBankTransactionInput,
    CreateBankTransferInput,
} from "../types/bankTransaction";

import {
    bankAccountRepository,
} from "./bankAccountRepository";

import {
    accountRepository,
} from "../../accounting/data/accountRepository";

import {
    journalEntryRepository,
} from "../../accounting/data/journalEntryRepository";

type Listener =
    () => void;

const listeners =
    new Set<Listener>();

let bankTransactions:
    BankTransaction[] = financialStateStorage.read().transactions;

let bankTransfers:
    BankTransfer[] = financialStateStorage.read().transfers;

financialStateStorage.onRollback(() => {
    const state = financialStateStorage.read();
    bankTransactions = state.transactions;
    bankTransfers = state.transfers;
});
function emitChange() {
    listeners.forEach(listener => financialStateStorage.notify(listener));
}

function normalizeRequired(
    value:
        string,

    label:
        string,
) {
    const normalized =
        value.trim();

    if (!normalized) {
        throw new Error(
            `${label} is required.`,
        );
    }

    return normalized;
}

function normalizeOptional(
    value:
        string
        | undefined,
) {
    const normalized =
        value?.trim();

    return normalized
        ? normalized
        : undefined;
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
            "Date must use YYYY-MM-DD format.",
        );
    }
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

function createId(
    prefix:
        string,
) {
    return `${prefix}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(
            2,
            8,
        )}`;
}

function createNumber(
    prefix:
        string,

    date:
        string,

    sequence:
        number,
) {
    const year =
        date.slice(
            0,
            4,
        );

    return `${prefix}-${year}-${String(
        sequence,
    ).padStart(
        4,
        "0",
    )}`;
}

export const bankTransactionRepository =
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

    getTransactionsSnapshot():
        BankTransaction[] {
        return bankTransactions;
    },

    getTransfersSnapshot():
        BankTransfer[] {
        return bankTransfers;
    },

    getTransactions() {
        return bankTransactions;
    },

    getTransfers() {
        return bankTransfers;
    },

    createTransaction(
        input:
            CreateBankTransactionInput,
        operationId?: string,
    ): BankTransaction {
        validateDate(input.transactionDate);
        requireDateKey(input.transactionDate, "Transaction date");
        if (!["MONEY_IN", "MONEY_OUT"].includes(input.direction)) throw new Error("Invalid bank transaction direction.");

        const amount =
            roundCurrency(
                input.amount,
            );

        if (
            !Number.isFinite(
                amount,
            ) ||
            amount <=
            0
        ) {
            throw new Error(
                "Amount must be greater than zero.",
            );
        }

        const description =
            normalizeRequired(
                input.description,
                "Description",
            );

        const bankAccount =
            bankAccountRepository
                .requireById(
                    input.bankAccountId,
                );

        if (
            !bankAccount.active
        ) {
            throw new Error(
                "The selected bank account is inactive.",
            );
        }

        if (input.transactionDate < bankAccount.openingBalanceDate) throw new Error("Transaction date cannot precede the bank opening balance date.");
        const bankGlAccount =
            accountRepository
                .requireById(
                    bankAccount.glAccountId,
                );

        if (
            !bankGlAccount.active
        ) {
            throw new Error(
                "The selected bank GL account is inactive.",
            );
        }

        const offsetAccount =
            accountRepository
                .requireById(
                    input.offsetAccountId,
                );

        if (
            !offsetAccount.active
        ) {
            throw new Error(
                "The offset account is inactive.",
            );
        }

        if (
            !offsetAccount
                .allowManualPosting
        ) {
            throw new Error(
                "The selected offset account does not allow manual posting.",
            );
        }

        if (
            offsetAccount.id ===
            bankGlAccount.id
        ) {
            throw new Error(
                "Bank and offset accounts must be different.",
            );
        }

        if (
            bankAccountRepository
                .getByGlAccountId(
                    offsetAccount.id,
                )
        ) {
            throw new Error(
                "Use Bank Transfer when moving money between bank accounts.",
            );
        }

        const transactionId =
            createId(
                "banktxn",
            );

        const transactionNumber =
            createNumber(
                "BTXN",
                input.transactionDate,
                bankTransactions.length +
                1,
            );

        const stableOperationId = operationId?.trim();
        if (operationId !== undefined && !stableOperationId) throw new Error("Operation ID cannot be empty");
        if (stableOperationId) {
            const attempt = financialOperationJournal.begin(stableOperationId, "BANK_TRANSACTION", JSON.stringify(input));
            if (attempt.status === "already_completed") {
                const existing = bankTransactions.find(item => item.id === attempt.operation.resultId);
                if (existing) return existing;
                throw new Error("Completed bank operation is not available in memory; manual review required.");
            }
            if (attempt.status === "needs_review") throw new Error("Bank operation requires manual review before retry.");
        }

        try {
        // Durable result identity precedes GL posting, so a GL-only crash is diagnosable.
        if (stableOperationId) financialOperationJournal.bindResult(stableOperationId, transactionId);
        const journal =
            journalEntryRepository.post(
                {
                    journalDate:
                        input.transactionDate,

                    description,

                    reference:
                        normalizeOptional(
                            input.reference,
                        ),

                    sourceType:
                        "BANK_TRANSACTION",

                    sourceId:
                        transactionId,

                    lines:
                        input.direction ===
                            "MONEY_IN"
                            ? [
                                {
                                    accountId:
                                        bankGlAccount.id,

                                    description,

                                    debit:
                                        amount,

                                    credit:
                                        0,
                                },
                                {
                                    accountId:
                                        offsetAccount.id,

                                    description,

                                    debit:
                                        0,

                                    credit:
                                        amount,
                                },
                            ]
                            : [
                                {
                                    accountId:
                                        offsetAccount.id,

                                    description,

                                    debit:
                                        amount,

                                    credit:
                                        0,
                                },
                                {
                                    accountId:
                                        bankGlAccount.id,

                                    description,

                                    debit:
                                        0,

                                    credit:
                                        amount,
                                },
                            ],
                },
            );

        const transaction:
            BankTransaction = {
            id:
                transactionId,

            transactionNumber,

            bankAccountId:
                bankAccount.id,

            transactionDate:
                input.transactionDate,

            direction:
                input.direction,

            amount,

            offsetAccountId:
                offsetAccount.id,

            description,

            reference:
                normalizeOptional(
                    input.reference,
                ),

            journalEntryId:
                journal.id,

            createdAt:
                new Date()
                    .toISOString(),
        };

        const nextTransactions = [transaction, ...bankTransactions];
        financialStateStorage.update("transactions", nextTransactions);
        bankTransactions = nextTransactions;

        emitChange();

        if (stableOperationId) {
            const linked = journalEntryRepository.getBySource("BANK_TRANSACTION", transactionId);
            if (linked.length !== 1 || linked[0].id !== journal.id) throw new Error("Bank GL posting could not be verified uniquely.");

        }
        return transaction;
        } catch (error) {
            if (stableOperationId) {
                try { financialOperationJournal.flagForReview(stableOperationId, "Bank operation outcome uncertain; inspect GL and bank records"); } catch { /* preserve original error */ }
            }
            throw error;
        }
    },

    createTransfer(
        input:
            CreateBankTransferInput,
        operationId?: string,
    ): BankTransfer {
        validateDate(input.transferDate);
        requireDateKey(input.transferDate, "Transfer date");

        const amount =
            roundCurrency(
                input.amount,
            );

        if (
            !Number.isFinite(
                amount,
            ) ||
            amount <=
            0
        ) {
            throw new Error(
                "Amount must be greater than zero.",
            );
        }

        const description =
            normalizeRequired(
                input.description,
                "Description",
            );

        if (
            input.fromBankAccountId ===
            input.toBankAccountId
        ) {
            throw new Error(
                "Transfer bank accounts must be different.",
            );
        }

        const fromBankAccount =
            bankAccountRepository
                .requireById(
                    input.fromBankAccountId,
                );

        const toBankAccount =
            bankAccountRepository
                .requireById(
                    input.toBankAccountId,
                );

        if (
            !fromBankAccount.active ||
            !toBankAccount.active
        ) {
            throw new Error(
                "Both bank accounts must be active.",
            );
        }

        if (
            fromBankAccount.currency !==
            toBankAccount.currency
        ) {
            throw new Error(
                "Bank transfers between different currencies are not supported yet.",
            );
        }

        if (input.transferDate < fromBankAccount.openingBalanceDate || input.transferDate < toBankAccount.openingBalanceDate) throw new Error("Transfer date cannot precede either bank opening balance date.");
        const fromGlAccount =
            accountRepository
                .requireById(
                    fromBankAccount.glAccountId,
                );

        const toGlAccount =
            accountRepository
                .requireById(
                    toBankAccount.glAccountId,
                );

        if (
            !fromGlAccount.active ||
            !toGlAccount.active
        ) {
            throw new Error(
                "Both bank GL accounts must be active.",
            );
        }

        if (
            fromGlAccount.id ===
            toGlAccount.id
        ) {
            throw new Error(
                "Transfer bank accounts must use different GL accounts.",
            );
        }

        const transferId =
            createId(
                "banktrf",
            );

        const transferNumber =
            createNumber(
                "BTRF",
                input.transferDate,
                bankTransfers.length +
                1,
            );

        const stableOperationId = operationId?.trim();
        if (operationId !== undefined && !stableOperationId) throw new Error("Operation ID cannot be empty");
        if (stableOperationId) {
            const attempt = financialOperationJournal.begin(stableOperationId, "BANK_TRANSFER", JSON.stringify(input));
            if (attempt.status === "already_completed") {
                const existing = bankTransfers.find(item => item.id === attempt.operation.resultId);
                if (existing) return existing;
                throw new Error("Completed bank operation is not available in memory; manual review required.");
            }
            if (attempt.status === "needs_review") throw new Error("Bank operation requires manual review before retry.");
        }

        try {
        if (stableOperationId) financialOperationJournal.bindResult(stableOperationId, transferId);
        const journal =
            journalEntryRepository.post(
                {
                    journalDate:
                        input.transferDate,

                    description,

                    reference:
                        normalizeOptional(
                            input.reference,
                        ),

                    sourceType:
                        "BANK_TRANSFER",

                    sourceId:
                        transferId,

                    lines: [
                        {
                            accountId:
                                toGlAccount.id,

                            description,

                            debit:
                                amount,

                            credit:
                                0,
                        },
                        {
                            accountId:
                                fromGlAccount.id,

                            description,

                            debit:
                                0,

                            credit:
                                amount,
                        },
                    ],
                },
            );

        const transfer:
            BankTransfer = {
            id:
                transferId,

            transferNumber,

            fromBankAccountId:
                fromBankAccount.id,

            toBankAccountId:
                toBankAccount.id,

            transferDate:
                input.transferDate,

            amount,

            description,

            reference:
                normalizeOptional(
                    input.reference,
                ),

            journalEntryId:
                journal.id,

            createdAt:
                new Date()
                    .toISOString(),
        };

        const nextTransfers = [transfer, ...bankTransfers];
        financialStateStorage.update("transfers", nextTransfers);
        bankTransfers = nextTransfers;

        emitChange();

        if (stableOperationId) {
            const linked = journalEntryRepository.getBySource("BANK_TRANSFER", transferId);
            if (linked.length !== 1 || linked[0].id !== journal.id) throw new Error("Transfer GL posting could not be verified uniquely.");

        }
        return transfer;
        } catch (error) {
            if (stableOperationId) {
                try { financialOperationJournal.flagForReview(stableOperationId, "Bank operation outcome uncertain; inspect GL and bank records"); } catch { /* preserve original error */ }
            }
            throw error;
        }
    },
};
const createTransactionUnit = bankTransactionRepository.createTransaction;
bankTransactionRepository.createTransaction = function (input, operationId) {
    assertCurrentCrossModuleWriteSafe();
    let result: ReturnType<typeof createTransactionUnit>;
    try {
        result = financialStateStorage.transaction(() => createTransactionUnit.call(bankTransactionRepository, input, operationId));
        if (operationId) financialOperationJournal.complete(operationId.trim(), result.id);
        return result;
    } catch (error) {
        if (operationId) {
            const operation = financialOperationJournal.list().find(op => op.operationId === operationId.trim());
            if (operation && operation.state !== "COMPLETED") {
                try { financialOperationJournal.flagForReview(operation.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry."); } catch { /* Preserve original failure. */ }
            }
        }
        throw error;
    }
};

const createTransferUnit = bankTransactionRepository.createTransfer;
bankTransactionRepository.createTransfer = function (input, operationId) {
    assertCurrentCrossModuleWriteSafe();
    let result: ReturnType<typeof createTransferUnit>;
    try {
        result = financialStateStorage.transaction(() => createTransferUnit.call(bankTransactionRepository, input, operationId));
        if (operationId) financialOperationJournal.complete(operationId.trim(), result.id);
        return result;
    } catch (error) {
        if (operationId) {
            const operation = financialOperationJournal.list().find(op => op.operationId === operationId.trim());
            if (operation && operation.state !== "COMPLETED") {
                try { financialOperationJournal.flagForReview(operation.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry."); } catch { /* Preserve original failure. */ }
            }
        }
        throw error;
    }
};

registerRepository("bankTransactions", {
    repository: bankTransactionRepository, read: "banking.read",
    commands: {"if": null, "createTransaction": "banking.write", "createTransfer": "banking.write", "assertCurrentCrossModuleWriteSafe": null},
    snapshot: () => ({ bankTransactions, bankTransfers }),
    restore: value => { bankTransactions = value.bankTransactions; bankTransfers = value.bankTransfers;  },
    publish: () => listeners.forEach(listener => listener()),
});
