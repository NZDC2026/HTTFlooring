import {
    useMemo,
    useSyncExternalStore,
} from "react";

import {
    accountRepository,
} from "./accountRepository";

import {
    journalEntryRepository,
} from "./journalEntryRepository";

import {
    calculateGeneralLedgerSummary,
    getGeneralLedgerTransactions,
} from "./generalLedgerService";

import type {
    AccountSystemRole,
} from "../types/account";

import type {
    AccountingSourceType,
} from "../types/journalEntry";

export function useAccounts() {
    return useSyncExternalStore(
        accountRepository.subscribe,
        accountRepository.getSnapshot,
        accountRepository.getSnapshot,
    );
}

export function useAccount(
    accountId:
        | string
        | undefined,
) {
    const accounts =
        useAccounts();

    return useMemo(
        () => {
            if (!accountId) {
                return undefined;
            }

            return accounts.find(
                (account) =>
                    account.id ===
                    accountId,
            );
        },
        [
            accounts,
            accountId,
        ],
    );
}

export function useAccountBySystemRole(
    systemRole:
        | AccountSystemRole
        | undefined,
) {
    const accounts =
        useAccounts();

    return useMemo(
        () => {
            if (!systemRole) {
                return undefined;
            }

            return accounts.find(
                (account) =>
                    account.systemRole ===
                    systemRole,
            );
        },
        [
            accounts,
            systemRole,
        ],
    );
}

export function useJournalEntries() {
    return useSyncExternalStore(
        journalEntryRepository.subscribe,
        journalEntryRepository.getSnapshot,
        journalEntryRepository.getSnapshot,
    );
}

export function useJournalEntry(
    journalEntryId:
        | string
        | undefined,
) {
    const entries =
        useJournalEntries();

    return useMemo(
        () => {
            if (
                !journalEntryId
            ) {
                return undefined;
            }

            return entries.find(
                (entry) =>
                    entry.id ===
                    journalEntryId,
            );
        },
        [
            entries,
            journalEntryId,
        ],
    );
}

export function useJournalEntriesBySource(
    sourceType:
        | AccountingSourceType
        | undefined,

    sourceId:
        | string
        | undefined,
) {
    const entries =
        useJournalEntries();

    return useMemo(
        () => {
            if (
                !sourceType ||
                !sourceId
            ) {
                return [];
            }

            return entries.filter(
                (entry) =>
                    entry.sourceType ===
                    sourceType &&
                    entry.sourceId ===
                    sourceId,
            );
        },
        [
            entries,
            sourceType,
            sourceId,
        ],
    );
}

export function useGeneralLedgerSummary(
    asOfDate:
        string,
) {
    const accounts =
        useAccounts();

    const journalEntries =
        useJournalEntries();

    return useMemo(
        () =>
            calculateGeneralLedgerSummary(
                accounts,
                journalEntries,
                asOfDate,
            ),
        [
            accounts,
            journalEntries,
            asOfDate,
        ],
    );
}

export function useGeneralLedgerTransactions(
    accountId:
        | string
        | undefined,

    asOfDate:
        string,
) {
    const account =
        useAccount(
            accountId,
        );

    const journalEntries =
        useJournalEntries();

    return useMemo(
        () => {
            if (!account) {
                return [];
            }

            return getGeneralLedgerTransactions(
                account,
                journalEntries,
                asOfDate,
            );
        },
        [
            account,
            journalEntries,
            asOfDate,
        ],
    );
}