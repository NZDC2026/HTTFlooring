import type {
    BankAccount,
} from "../types/bankAccount";

import {
    accountRepository,
} from "../../accounting/data/accountRepository";

type Listener =
    () => void;

const listeners =
    new Set<Listener>();

const now =
    "2026-10-08T00:00:00.000Z";

let bankAccounts:
    BankAccount[] = [
        {
            id:
                "bank_001",

            name:
                "Operating Account",

            bankName:
                "Business Bank",

            accountNumber:
                "•••• 1000",

            accountType:
                "TRANSACTION",

            currency:
                "AUD",

            glAccountId:
                "acc_1000",

            openingBalance:
                0,

            openingBalanceDate:
                "2026-01-01",

            active:
                true,

            createdAt:
                now,

            updatedAt:
                now,
        },
        {
            id:
                "bank_002",

            name:
                "Savings Account",

            bankName:
                "Business Bank",

            accountNumber:
                "•••• 1010",

            accountType:
                "SAVINGS",

            currency:
                "AUD",

            glAccountId:
                "acc_1010",

            openingBalance:
                0,

            openingBalanceDate:
                "2026-01-01",

            active:
                true,

            createdAt:
                now,

            updatedAt:
                now,
        },
    ];

function emitChange() {
    listeners.forEach(
        (listener) =>
            listener(),
    );
}

function validateBankAccount(
    bankAccount:
        BankAccount,
) {
    const glAccount =
        accountRepository.getById(
            bankAccount.glAccountId,
        );

    if (!glAccount) {
        throw new Error(
            `GL account ${bankAccount.glAccountId} for bank account ${bankAccount.name} was not found.`,
        );
    }

    if (
        glAccount.type !==
        "ASSET"
    ) {
        throw new Error(
            `Bank account ${bankAccount.name} must be linked to an Asset GL account.`,
        );
    }

    if (
        !glAccount.active
    ) {
        throw new Error(
            `GL account ${glAccount.code} linked to bank account ${bankAccount.name} is inactive.`,
        );
    }
}

for (
    const bankAccount
    of bankAccounts
) {
    validateBankAccount(
        bankAccount,
    );
}

export const bankAccountRepository =
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
        BankAccount[] {
        return bankAccounts;
    },

    getAll():
        BankAccount[] {
        return bankAccounts;
    },

    getById(
        bankAccountId:
            string,
    ) {
        return bankAccounts.find(
            (bankAccount) =>
                bankAccount.id ===
                bankAccountId,
        );
    },

    getByGlAccountId(
        glAccountId:
            string,
    ) {
        return bankAccounts.find(
            (bankAccount) =>
                bankAccount.glAccountId ===
                glAccountId,
        );
    },

    requireById(
        bankAccountId:
            string,
    ): BankAccount {
        const bankAccount =
            bankAccounts.find(
                (item) =>
                    item.id ===
                    bankAccountId,
            );

        if (!bankAccount) {
            throw new Error(
                "Bank account was not found.",
            );
        }

        return bankAccount;
    },

    setActive(
        bankAccountId:
            string,

        active:
            boolean,
    ) {
        const current =
            this.requireById(
                bankAccountId,
            );

        if (
            current.active ===
            active
        ) {
            return current;
        }

        const updated:
            BankAccount = {
            ...current,

            active,

            updatedAt:
                new Date()
                    .toISOString(),
        };

        bankAccounts =
            bankAccounts.map(
                (bankAccount) =>
                    bankAccount.id ===
                        bankAccountId
                        ? updated
                        : bankAccount,
            );

        emitChange();

        return updated;
    },
};