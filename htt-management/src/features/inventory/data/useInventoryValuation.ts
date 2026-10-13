import {
    useMemo,
    useSyncExternalStore,
} from "react";

import {
    inventoryCostMovementRepository,
} from "./inventoryCostMovementRepository";

import {
    calculateInventoryValuation,
} from "./inventoryValuationService";

export function useInventoryValuation(
    asOfDate:
        string,
) {
    const movements =
        useSyncExternalStore(
            inventoryCostMovementRepository.subscribe,
            inventoryCostMovementRepository.getSnapshot,
            inventoryCostMovementRepository.getSnapshot,
        );

    return useMemo(
        () =>
            calculateInventoryValuation(
                movements,
                asOfDate,
            ),
        [
            movements,
            asOfDate,
        ],
    );
}