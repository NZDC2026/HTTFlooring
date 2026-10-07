import {
    useMemo,
    useSyncExternalStore,
} from "react";

import { paymentRepository } from "./paymentRepository";

export function usePayments() {
    return useSyncExternalStore(
        paymentRepository.subscribe,
        paymentRepository.getSnapshot,
        paymentRepository.getSnapshot,
    );
}

export function useCustomerPayments(
    customerId:
        | string
        | undefined,
) {
    const payments =
        usePayments();

    return useMemo(() => {
        if (!customerId) {
            return [];
        }

        return payments
            .filter(
                (payment) =>
                    payment.customerId ===
                    customerId,
            )
            .sort(
                (a, b) =>
                    b.paymentDate.localeCompare(
                        a.paymentDate,
                    ),
            );
    }, [
        payments,
        customerId,
    ]);
}

export function useInvoicePayments(
    invoiceId:
        | string
        | undefined,
) {
    const payments =
        usePayments();

    return useMemo(() => {
        if (!invoiceId) {
            return [];
        }

        return payments
            .filter(
                (payment) =>
                    payment.invoiceId ===
                    invoiceId,
            )
            .sort(
                (a, b) => {
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
    }, [
        payments,
        invoiceId,
    ]);
}