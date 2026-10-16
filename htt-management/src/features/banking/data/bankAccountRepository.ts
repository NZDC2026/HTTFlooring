import { z } from 'zod';
import { requireDateKey } from '../../../lib/businessDate';
import { journalEntryRepository } from '../../accounting/data/journalEntryRepository';
import { registerRepository } from "../../security/repositoryHost";
import type {
    BankAccount,
} from "../types/bankAccount";

import {
    accountRepository,
} from "../../accounting/data/accountRepository";

import { readMockRepository, writeMockRepository, canWriteMockRepository } from "../../../lib/persistence/mockRepositoryStorage";

const BANK_ACCOUNT_STORAGE_KEY = "htt.mock.banking.accounts.v1";
function isBankAccountArray(value: unknown): value is BankAccount[] {
    return Array.isArray(value) && value.every((item) =>
        item !== null && typeof item === "object" &&
        typeof item.id === "string" && typeof item.name === "string" &&
        typeof item.bankName === "string" && typeof item.accountNumber === "string" &&
        ["TRANSACTION", "SAVINGS", "CREDIT_CARD", "OTHER"].includes(item.accountType) &&
        typeof item.currency === "string" && typeof item.glAccountId === "string" &&
        typeof item.openingBalance === "number" && Number.isFinite(item.openingBalance) &&
        typeof item.openingBalanceDate === "string" && typeof item.active === "boolean" &&
        typeof item.createdAt === "string" && typeof item.updatedAt === "string"
    ) && new Set(value.map((item) => item.id)).size === value.length;
}

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

// Restore only independently editable bank-account metadata. Never persist
// transactions, reconciliations, balances, ledger or posting state here.
const storedBankAccounts = readMockRepository(BANK_ACCOUNT_STORAGE_KEY, isBankAccountArray);
if (storedBankAccounts.status === "ok") {
    // Do not load broken GL references from disk.
    if (storedBankAccounts.data.every((account) => {
        const gl = accountRepository.getById(account.glAccountId);
        return gl?.type === "ASSET" && gl.active;
    })) bankAccounts = storedBankAccounts.data;
}

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

    save(raw: {id?:string;name:string;bankName:string;accountNumber:string;accountType:BankAccount['accountType'];currency:string;glAccountId:string;openingBalanceDate:string;active:boolean},expectedUpdatedAt?:string): BankAccount {
        const input=z.object({id:z.string().optional(),name:z.string().trim().min(1).max(180),bankName:z.string().trim().min(1).max(180),accountNumber:z.string().trim().min(1).max(100),accountType:z.enum(['TRANSACTION','SAVINGS','CREDIT_CARD','OTHER']),currency:z.enum(['AUD','NZD']),glAccountId:z.string().min(1),openingBalanceDate:z.string(),active:z.boolean()}).strict().parse(raw);
        requireDateKey(input.openingBalanceDate,'Opening date');if(bankAccounts[0]&&input.currency!==bankAccounts[0].currency)throw new Error('This profile uses one base currency; foreign-currency bank accounts are not supported.');const existing=bankAccounts.find(a=>a.id===input.id);
        if(existing&&existing.updatedAt!==expectedUpdatedAt)throw new Error('Bank account changed; reload before editing.');
        if(!existing&&input.id)throw new Error('Bank account was not found.');
        if(bankAccounts.some(a=>a.id!==existing?.id&&a.glAccountId===input.glAccountId))throw new Error('Each bank account needs its own GL account.');
        const gl=accountRepository.requireById(input.glAccountId);if(!gl.active||gl.type!=='ASSET'||gl.systemRole&&gl.systemRole!=='BANK')throw new Error('Choose an active bank Asset account.');
        const used=existing&&journalEntryRepository.getAll().some(j=>j.lines.some(l=>l.accountId===existing.glAccountId));
        if(used&&(existing.glAccountId!==input.glAccountId||existing.openingBalanceDate!==input.openingBalanceDate||existing.currency!==input.currency))throw new Error('A used bank account cannot change its ledger, currency or opening date.');
        const timestamp=new Date(Math.max(Date.now(),existing?Date.parse(existing.updatedAt)+1:0)).toISOString(),account:BankAccount={...input,id:existing?.id??crypto.randomUUID(),openingBalance:existing?.openingBalance??0,createdAt:existing?.createdAt??timestamp,updatedAt:timestamp};
        validateBankAccount(account);bankAccounts=[...bankAccounts.filter(a=>a.id!==account.id),account];emitChange();return account;
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

        if (canWriteMockRepository(BANK_ACCOUNT_STORAGE_KEY)) {
            writeMockRepository(BANK_ACCOUNT_STORAGE_KEY, bankAccounts);
        }
        emitChange();

        return updated;
    },
};
registerRepository("bankAccounts", {
    repository: bankAccountRepository, read: "banking.read",
    commands: {"if": null, "validateBankAccount": null, "setActive": "banking.write", "save": "banking.write"},
    snapshot: () => ({ bankAccounts }),
    restore: value => { bankAccounts = value.bankAccounts;  },
    publish: () => listeners.forEach(listener => listener()),
});
