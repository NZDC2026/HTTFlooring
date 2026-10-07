import {
    useMemo,
    useSyncExternalStore,
} from "react";

import { salesRepository } from "./salesRepository";

export function useSalesDocuments() {
    return useSyncExternalStore(
        salesRepository.subscribe,
        salesRepository.getSnapshot,
        salesRepository.getSnapshot,
    );
}

export function useCustomerSalesDocuments(
    customerId:
        | string
        | undefined,
) {
    const documents =
        useSalesDocuments();

    return useMemo(() => {
        if (!customerId) {
            return [];
        }

        return documents
            .filter(
                (document) =>
                    document.customerId ===
                    customerId,
            )
            .sort(
                (a, b) =>
                    b.documentDate.localeCompare(
                        a.documentDate,
                    ),
            );
    }, [
        documents,
        customerId,
    ]);
}

export function useSalesDocument(
    documentId:
        | string
        | undefined,
) {
    const documents =
        useSalesDocuments();

    return useMemo(() => {
        if (!documentId) {
            return undefined;
        }

        return documents.find(
            (document) =>
                document.id ===
                documentId,
        );
    }, [
        documents,
        documentId,
    ]);
}

export function useQuote(
    quoteId:
        | string
        | undefined,
) {
    const document =
        useSalesDocument(
            quoteId,
        );

    if (
        !document ||
        document.type !==
        "QUOTE"
    ) {
        return undefined;
    }

    return document;
}

export function useSalesOrder(
    orderId:
        | string
        | undefined,
) {
    const document =
        useSalesDocument(
            orderId,
        );

    if (
        !document ||
        document.type !==
        "SALES_ORDER"
    ) {
        return undefined;
    }

    return document;
}

export function useInvoice(
    invoiceId:
        | string
        | undefined,
) {
    const document =
        useSalesDocument(
            invoiceId,
        );

    if (
        !document ||
        document.type !==
        "INVOICE"
    ) {
        return undefined;
    }

    return document;
}