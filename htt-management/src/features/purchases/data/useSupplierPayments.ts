import {
    useMemo,
    useSyncExternalStore,
} from "react";

import {
    supplierPaymentRepository,
} from "./supplierPaymentRepository";

export function useSupplierPayments() {
    return useSyncExternalStore(
        supplierPaymentRepository.subscribe,
        supplierPaymentRepository.getSnapshot,
        supplierPaymentRepository.getSnapshot,
    );
}

export function useSupplierPayment(
    supplierPaymentId:
        | string
        | undefined,
) {
    const payments =
        useSupplierPayments();

    return useMemo(
        () => {
            if (
                !supplierPaymentId
            ) {
                return undefined;
            }

            return payments.find(
                (payment) =>
                    payment.id ===
                    supplierPaymentId,
            );
        },
        [
            payments,
            supplierPaymentId,
        ],
    );
}

export function useSupplierPaymentsBySupplier(
    supplierId:
        | string
        | undefined,
) {
    const payments =
        useSupplierPayments();

    return useMemo(
        () => {
            if (
                !supplierId
            ) {
                return [];
            }

            return payments
                .filter(
                    (payment) =>
                        payment.supplierId ===
                        supplierId,
                )
                .sort(
                    (
                        a,
                        b,
                    ) => {
                        const dateCompare =
                            b.paymentDate.localeCompare(
                                a.paymentDate,
                            );

                        if (
                            dateCompare !==
                            0
                        ) {
                            return dateCompare;
                        }

                        return b.createdAt.localeCompare(
                            a.createdAt,
                        );
                    },
                );
        },
        [
            payments,
            supplierId,
        ],
    );
}

export function useSupplierPaymentsByBill(
    supplierBillId:
        | string
        | undefined,
) {
    const payments =
        useSupplierPayments();

    return useMemo(
        () => {
            if (
                !supplierBillId
            ) {
                return [];
            }

            return payments
                .filter(
                    (payment) =>
                        payment.allocations.some(
                            (allocation) =>
                                allocation.supplierBillId ===
                                supplierBillId,
                        ),
                )
                .sort(
                    (
                        a,
                        b,
                    ) => {
                        const dateCompare =
                            b.paymentDate.localeCompare(
                                a.paymentDate,
                            );

                        if (
                            dateCompare !==
                            0
                        ) {
                            return dateCompare;
                        }

                        return b.createdAt.localeCompare(
                            a.createdAt,
                        );
                    },
                );
        },
        [
            payments,
            supplierBillId,
        ],
    );
}