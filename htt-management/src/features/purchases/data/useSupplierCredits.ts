import {
    useMemo,
    useSyncExternalStore,
} from "react";

import {
    supplierCreditRepository,
} from "./supplierCreditRepository";

export function useSupplierCredits() {
    return useSyncExternalStore(
        supplierCreditRepository.subscribe,
        supplierCreditRepository.getSnapshot,
        supplierCreditRepository.getSnapshot,
    );
}

export function useSupplierCredit(
    supplierCreditId:
        | string
        | undefined,
) {
    const credits =
        useSupplierCredits();

    return useMemo(
        () => {
            if (
                !supplierCreditId
            ) {
                return undefined;
            }

            return credits.find(
                (credit) =>
                    credit.id ===
                    supplierCreditId,
            );
        },
        [
            credits,
            supplierCreditId,
        ],
    );
}

export function useSupplierCreditsBySupplier(
    supplierId:
        | string
        | undefined,
) {
    const credits =
        useSupplierCredits();

    return useMemo(
        () => {
            if (
                !supplierId
            ) {
                return [];
            }

            return credits.filter(
                (credit) =>
                    credit.supplierId ===
                    supplierId,
            );
        },
        [
            credits,
            supplierId,
        ],
    );
}

export function useSupplierCreditsByBill(
    supplierBillId:
        | string
        | undefined,
) {
    const credits =
        useSupplierCredits();

    return useMemo(
        () => {
            if (
                !supplierBillId
            ) {
                return [];
            }

            return credits.filter(
                (credit) =>
                    credit
                        .sourceSupplierBillId ===
                    supplierBillId,
            );
        },
        [
            credits,
            supplierBillId,
        ],
    );
}

export function useSupplierCreditAllocations() {
    return useSyncExternalStore(
        supplierCreditRepository.subscribe,
        supplierCreditRepository.getAllocationSnapshot,
        supplierCreditRepository.getAllocationSnapshot,
    );
}

export function useSupplierCreditAllocationsByCredit(
    supplierCreditId:
        | string
        | undefined,
) {
    const allocations =
        useSupplierCreditAllocations();

    return useMemo(
        () => {
            if (
                !supplierCreditId
            ) {
                return [];
            }

            return allocations.filter(
                (allocation) =>
                    allocation
                        .supplierCreditId ===
                    supplierCreditId,
            );
        },
        [
            allocations,
            supplierCreditId,
        ],
    );
}

export function useSupplierCreditAllocationsByBill(
    supplierBillId:
        | string
        | undefined,
) {
    const allocations =
        useSupplierCreditAllocations();

    return useMemo(
        () => {
            if (
                !supplierBillId
            ) {
                return [];
            }

            return allocations.filter(
                (allocation) =>
                    allocation
                        .supplierBillId ===
                    supplierBillId,
            );
        },
        [
            allocations,
            supplierBillId,
        ],
    );
}