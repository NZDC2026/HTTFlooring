import {
    useMemo,
    useSyncExternalStore,
} from "react";

import {
    accountRepository,
} from "../../accounting/data/accountRepository";

import {
    journalEntryRepository,
} from "../../accounting/data/journalEntryRepository";

import {
    inventoryCostMovementRepository,
} from "./inventoryCostMovementRepository";

import {
    calculateInventoryGlReconciliation,
} from "./inventoryGlReconciliationService";

export function useInventoryGlReconciliation(
    asOfDate:
        string,
) {
    const accounts =
        useSyncExternalStore(
            accountRepository.subscribe,
            accountRepository.getSnapshot,
            accountRepository.getSnapshot,
        );

    const journalEntries =
        useSyncExternalStore(
            journalEntryRepository.subscribe,
            journalEntryRepository.getSnapshot,
            journalEntryRepository.getSnapshot,
        );

    const costMovements =
        useSyncExternalStore(
            inventoryCostMovementRepository.subscribe,
            inventoryCostMovementRepository.getSnapshot,
            inventoryCostMovementRepository.getSnapshot,
        );

    return useMemo(
        () =>
            calculateInventoryGlReconciliation({
                accounts,

                journalEntries,

                costMovements,

                asOfDate,
            }),
        [
            accounts,
            journalEntries,
            costMovements,
            asOfDate,
        ],
    );
}