import {
    useMemo,
    useSyncExternalStore,
} from "react";

import {
    supplierBillRepository,
} from "./supplierBillRepository";

export function useSupplierBills() {
    return useSyncExternalStore(
        supplierBillRepository.subscribe,
        supplierBillRepository.getSnapshot,
        supplierBillRepository.getSnapshot,
    );
}

export function useSupplierBill(
    supplierBillId:
        | string
        | undefined,
) {
    const bills =
        useSupplierBills();

    return useMemo(
        () => {
            if (
                !supplierBillId
            ) {
                return undefined;
            }

            return bills.find(
                (bill) =>
                    bill.id ===
                    supplierBillId,
            );
        },
        [
            bills,
            supplierBillId,
        ],
    );
}

export function usePurchaseOrderSupplierBills(
    purchaseOrderId:
        | string
        | undefined,
) {
    const bills =
        useSupplierBills();

    return useMemo(
        () => {
            if (
                !purchaseOrderId
            ) {
                return [];
            }

            return bills.filter(
                (bill) =>
                    bill.purchaseOrderId ===
                    purchaseOrderId,
            );
        },
        [
            bills,
            purchaseOrderId,
        ],
    );
}

export function useSupplierSupplierBills(
    supplierId:
        | string
        | undefined,
) {
    const bills =
        useSupplierBills();

    return useMemo(
        () => {
            if (!supplierId) {
                return [];
            }

            return bills.filter(
                (bill) =>
                    bill.supplierId ===
                    supplierId,
            );
        },
        [
            bills,
            supplierId,
        ],
    );
}