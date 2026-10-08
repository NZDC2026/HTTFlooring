import {
    useMemo,
    useSyncExternalStore,
} from "react";

import {
    bankAccountRepository,
} from "./bankAccountRepository";

import {
    calculateBankRegister,
} from "./bankRegisterService";

import {
    useJournalEntries,
} from "../../accounting/data/useAccounting";

export function useBankAccounts() {
    return useSyncExternalStore(
        bankAccountRepository.subscribe,
        bankAccountRepository.getSnapshot,
        bankAccountRepository.getSnapshot,
    );
}

export function useBankAccount(
    bankAccountId:
        | string
        | undefined,
) {
    const bankAccounts =
        useBankAccounts();

    return useMemo(
        () => {
            if (
                !bankAccountId
            ) {
                return undefined;
            }

            return bankAccounts.find(
                (bankAccount) =>
                    bankAccount.id ===
                    bankAccountId,
            );
        },
        [
            bankAccounts,
            bankAccountId,
        ],
    );
}

export function useBankRegister(
    bankAccountId:
        | string
        | undefined,

    asOfDate:
        string,
) {
    const bankAccount =
        useBankAccount(
            bankAccountId,
        );

    const journalEntries =
        useJournalEntries();

    return useMemo(
        () => {
            if (
                !bankAccount
            ) {
                return undefined;
            }

            return calculateBankRegister(
                bankAccount,
                journalEntries,
                asOfDate,
            );
        },
        [
            bankAccount,
            journalEntries,
            asOfDate,
        ],
    );
}