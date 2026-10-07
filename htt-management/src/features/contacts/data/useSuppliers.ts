import {
    useSyncExternalStore,
} from "react";

import {
    supplierRepository,
} from "./supplierRepository";

export function useSuppliers() {
    return useSyncExternalStore(
        supplierRepository.subscribe,
        supplierRepository.getSnapshot,
        supplierRepository.getSnapshot,
    );
}

export function useSupplier(
    supplierId:
        | string
        | undefined,
) {
    const suppliers =
        useSuppliers();

    if (!supplierId) {
        return undefined;
    }

    return suppliers.find(
        (supplier) =>
            supplier.id ===
            supplierId,
    );
}