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
    BankTransaction[] = [];

let bankTransfers:
    BankTransfer[] = [];

function emitChange() {
    listeners.forEach(
        (listener) =>
            listener(),
    );
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
    ): BankTransaction {
        validateDate(
            input.transactionDate,
        );

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

        bankTransactions = [
            transaction,
            ...bankTransactions,
        ];

        emitChange();

        return transaction;
    },

    createTransfer(
        input:
            CreateBankTransferInput,
    ): BankTransfer {
        validateDate(
            input.transferDate,
        );

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

        bankTransfers = [
            transfer,
            ...bankTransfers,
        ];

        emitChange();

        return transfer;
    },
};