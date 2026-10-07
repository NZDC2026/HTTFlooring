import {
    useMemo,
    useSyncExternalStore,
} from "react";

import {
    goodsReceiptRepository,
} from "./goodsReceiptRepository";

export function useGoodsReceipts() {
    return useSyncExternalStore(
        goodsReceiptRepository.subscribe,
        goodsReceiptRepository.getSnapshot,
        goodsReceiptRepository.getSnapshot,
    );
}

export function useGoodsReceipt(
    goodsReceiptId:
        | string
        | undefined,
) {
    const receipts =
        useGoodsReceipts();

    return useMemo(
        () => {
            if (
                !goodsReceiptId
            ) {
                return undefined;
            }

            return receipts.find(
                (receipt) =>
                    receipt.id ===
                    goodsReceiptId,
            );
        },
        [
            receipts,
            goodsReceiptId,
        ],
    );
}

export function usePurchaseOrderGoodsReceipts(
    purchaseOrderId:
        | string
        | undefined,
) {
    const receipts =
        useGoodsReceipts();

    return useMemo(
        () => {
            if (
                !purchaseOrderId
            ) {
                return [];
            }

            return receipts.filter(
                (receipt) =>
                    receipt.purchaseOrderId ===
                    purchaseOrderId,
            );
        },
        [
            receipts,
            purchaseOrderId,
        ],
    );
}