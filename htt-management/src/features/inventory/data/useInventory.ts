import {
    useMemo,
    useSyncExternalStore,
} from "react";

import {
    inventoryMovementRepository,
} from "./inventoryMovementRepository";

import {
    stockRepository,
} from "./stockRepository";

import {
    getInventoryMovementRows,
    getInventoryStockRows,
} from "./inventoryOverviewService";

export function useInventoryMovements() {
    return useSyncExternalStore(
        inventoryMovementRepository.subscribe,
        inventoryMovementRepository.getSnapshot,
        inventoryMovementRepository.getSnapshot,
    );
}

export function useStockBalances() {
    return useSyncExternalStore(
        stockRepository.subscribe,
        stockRepository.getSnapshot,
        stockRepository.getSnapshot,
    );
}

export function useInventoryStockRows() {
    const balances =
        useStockBalances();

    return useMemo(
        () =>
            getInventoryStockRows(),
        [balances],
    );
}

export function useInventoryMovementRows() {
    const movements =
        useInventoryMovements();

    return useMemo(
        () =>
            getInventoryMovementRows(),
        [movements],
    );
}