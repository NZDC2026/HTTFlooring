import {
    useMemo,
    useSyncExternalStore,
} from "react";

import {
    purchaseOrderRepository,
} from "./purchaseOrderRepository";

export function usePurchaseOrders() {
    return useSyncExternalStore(
        purchaseOrderRepository.subscribe,
        purchaseOrderRepository.getSnapshot,
        purchaseOrderRepository.getSnapshot,
    );
}

export function usePurchaseOrder(
    purchaseOrderId:
        | string
        | undefined,
) {
    const purchaseOrders =
        usePurchaseOrders();

    return useMemo(
        () => {
            if (
                !purchaseOrderId
            ) {
                return undefined;
            }

            return purchaseOrders.find(
                (
                    purchaseOrder,
                ) =>
                    purchaseOrder.id ===
                    purchaseOrderId,
            );
        },
        [
            purchaseOrders,
            purchaseOrderId,
        ],
    );
}

export function useSupplierPurchaseOrders(
    supplierId:
        | string
        | undefined,
) {
    const purchaseOrders =
        usePurchaseOrders();

    return useMemo(
        () => {
            if (!supplierId) {
                return [];
            }

            return purchaseOrders.filter(
                (
                    purchaseOrder,
                ) =>
                    purchaseOrder.supplierId ===
                    supplierId,
            );
        },
        [
            purchaseOrders,
            supplierId,
        ],
    );
}