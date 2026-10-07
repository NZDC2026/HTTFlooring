import {
    getProductById,
    getProductUnit,
} from "../../inventory/data/mockProducts";

import {
    inventorySiteRepository,
} from "../../inventory/data/inventorySiteRepository";

import {
    inventoryMovementRepository,
} from "../../inventory/data/inventoryMovementRepository";

import {
    stockRepository,
} from "../../inventory/data/stockRepository";

import {
    purchaseOrderRepository,
} from "./purchaseOrderRepository";

import type {
    GoodsReceipt,
    GoodsReceiptDraft,
    GoodsReceiptLine,
} from "../types/goodsReceipt";

type Listener = () => void;

const listeners =
    new Set<Listener>();

let goodsReceipts:
    GoodsReceipt[] =
    [];

function emitChange() {
    listeners.forEach(
        (listener) =>
            listener(),
    );
}

function roundQuantity(
    value: number,
) {
    return (
        Math.round(
            (value +
                Number.EPSILON) *
            10000,
        ) / 10000
    );
}

function createReceiptNumber(
    receiptDate: string,
) {
    const year =
        receiptDate.slice(
            0,
            4,
        );

    const prefix =
        `GR-${year}-`;

    const numbers =
        goodsReceipts
            .filter(
                (receipt) =>
                    receipt.receiptNumber.startsWith(
                        prefix,
                    ),
            )
            .map(
                (receipt) =>
                    Number.parseInt(
                        receipt.receiptNumber.slice(
                            prefix.length,
                        ),
                        10,
                    ),
            )
            .filter(
                Number.isFinite,
            );

    const next =
        Math.max(
            0,
            ...numbers,
        ) + 1;

    return `${prefix}${String(
        next,
    ).padStart(
        4,
        "0",
    )}`;
}

function normalizeOptional(
    value:
        | string
        | undefined,
) {
    const normalized =
        value?.trim();

    return normalized
        ? normalized
        : undefined;
}

export const goodsReceiptRepository =
{
    subscribe(
        listener: Listener,
    ) {
        listeners.add(
            listener,
        );

        return () => {
            listeners.delete(
                listener,
            );
        };
    },

    getSnapshot():
        GoodsReceipt[] {
        return goodsReceipts;
    },

    getAll():
        GoodsReceipt[] {
        return goodsReceipts;
    },

    getById(
        goodsReceiptId:
            string,
    ) {
        return goodsReceipts.find(
            (receipt) =>
                receipt.id ===
                goodsReceiptId,
        );
    },

    getByPurchaseOrder(
        purchaseOrderId:
            string,
    ) {
        return goodsReceipts.filter(
            (receipt) =>
                receipt.purchaseOrderId ===
                purchaseOrderId,
        );
    },

    create(
        draft:
            GoodsReceiptDraft,
    ) {
        const purchaseOrder =
            purchaseOrderRepository.getById(
                draft.purchaseOrderId,
            );

        if (!purchaseOrder) {
            throw new Error(
                "Purchase order was not found.",
            );
        }

        if (
            ![
                "SENT",
                "PARTIALLY_RECEIVED",
            ].includes(
                purchaseOrder.status,
            )
        ) {
            throw new Error(
                "Only sent or partially received purchase orders can receive goods.",
            );
        }

        const site =
            inventorySiteRepository.getById(
                draft.siteId,
            );

        if (!site) {
            throw new Error(
                "Inventory site was not found.",
            );
        }

        if (
            site.status !==
            "ACTIVE"
        ) {
            throw new Error(
                "Goods cannot be received into an inactive site.",
            );
        }

        if (
            !draft.receiptDate
        ) {
            throw new Error(
                "Receipt date is required.",
            );
        }

        const positiveLines =
            draft.lines.filter(
                (line) =>
                    Number.isFinite(
                        line.receivedQuantity,
                    ) &&
                    line.receivedQuantity >
                    0,
            );

        if (
            positiveLines.length ===
            0
        ) {
            throw new Error(
                "Enter a received quantity for at least one purchase order line.",
            );
        }

        const seenLineIds =
            new Set<string>();

        const receiptLines:
            GoodsReceiptLine[] =
            positiveLines.map(
                (draftLine) => {
                    if (
                        seenLineIds.has(
                            draftLine.purchaseOrderLineId,
                        )
                    ) {
                        throw new Error(
                            "A purchase order line cannot appear more than once in the same receipt.",
                        );
                    }

                    seenLineIds.add(
                        draftLine.purchaseOrderLineId,
                    );

                    const purchaseOrderLine =
                        purchaseOrder.lines.find(
                            (line) =>
                                line.id ===
                                draftLine.purchaseOrderLineId,
                        );

                    if (
                        !purchaseOrderLine
                    ) {
                        throw new Error(
                            "Purchase order line was not found.",
                        );
                    }

                    const remaining =
                        roundQuantity(
                            purchaseOrderLine.orderedQuantity -
                            purchaseOrderLine.receivedQuantity,
                        );

                    if (
                        remaining <=
                        0
                    ) {
                        throw new Error(
                            `${purchaseOrderLine.description} has already been fully received.`,
                        );
                    }

                    if (
                        draftLine.receivedQuantity >
                        remaining
                    ) {
                        throw new Error(
                            `${purchaseOrderLine.description} cannot receive more than ${remaining} ${purchaseOrderLine.unitSymbol}.`,
                        );
                    }

                    const product =
                        getProductById(
                            purchaseOrderLine.productId,
                        );

                    if (!product) {
                        throw new Error(
                            `Product ${purchaseOrderLine.sku} was not found.`,
                        );
                    }

                    const unit =
                        getProductUnit(
                            purchaseOrderLine.productId,
                            purchaseOrderLine.unitId,
                        );

                    if (!unit) {
                        throw new Error(
                            `Unit for ${purchaseOrderLine.description} was not found.`,
                        );
                    }

                    const receivedBaseQuantity =
                        roundQuantity(
                            draftLine.receivedQuantity *
                            unit.conversionToBase,
                        );

                    return {
                        id:
                            `grl_${crypto.randomUUID()}`,

                        purchaseOrderLineId:
                            purchaseOrderLine.id,

                        productId:
                            purchaseOrderLine.productId,

                        unitId:
                            purchaseOrderLine.unitId,

                        sku:
                            purchaseOrderLine.sku,

                        description:
                            purchaseOrderLine.description,

                        unitSymbol:
                            purchaseOrderLine.unitSymbol,

                        receivedQuantity:
                            draftLine.receivedQuantity,

                        conversionToBase:
                            unit.conversionToBase,

                        receivedBaseQuantity,
                    };
                },
            );

        const now =
            new Date().toISOString();

        const receipt:
            GoodsReceipt =
        {
            id:
                `gr_${crypto.randomUUID()}`,

            receiptNumber:
                createReceiptNumber(
                    draft.receiptDate,
                ),

            purchaseOrderId:
                purchaseOrder.id,

            purchaseOrderNumber:
                purchaseOrder.purchaseOrderNumber,

            supplierId:
                purchaseOrder.supplierId,

            supplierCode:
                purchaseOrder.supplierCode,

            supplierName:
                purchaseOrder.supplierName,

            siteId:
                site.id,

            siteCode:
                site.code,

            siteName:
                site.name,

            receiptDate:
                draft.receiptDate,

            status:
                "POSTED",

            supplierDeliveryReference:
                normalizeOptional(
                    draft.supplierDeliveryReference,
                ),

            notes:
                normalizeOptional(
                    draft.notes,
                ),

            lines:
                receiptLines,

            postedAt:
                now,

            createdAt:
                now,
        };

        /**
         * IMPORTANT:
         *
         * Validate everything above BEFORE any
         * repository mutation occurs.
         */

        for (
            const line of
            receipt.lines
        ) {
            const product =
                getProductById(
                    line.productId,
                );

            if (!product) {
                throw new Error(
                    `Product ${line.sku} was not found.`,
                );
            }

            inventoryMovementRepository.create(
                {
                    movementType:
                        "GOODS_RECEIPT",

                    siteId:
                        site.id,

                    productId:
                        line.productId,

                    baseUnitId:
                        product.baseUnitId,

                    quantityBase:
                        line.receivedBaseQuantity,

                    transactionUnitId:
                        line.unitId,

                    transactionUnitSymbol:
                        line.unitSymbol,

                    transactionQuantity:
                        line.receivedQuantity,

                    conversionToBase:
                        line.conversionToBase,

                    referenceType:
                        "GOODS_RECEIPT",

                    referenceId:
                        receipt.id,

                    referenceNumber:
                        receipt.receiptNumber,

                    purchaseOrderId:
                        purchaseOrder.id,

                    purchaseOrderNumber:
                        purchaseOrder.purchaseOrderNumber,

                    occurredAt:
                        draft.receiptDate,

                    notes:
                        `Goods receipt ${receipt.receiptNumber}`,
                },
            );

            stockRepository.receive(
                {
                    siteId:
                        site.id,

                    productId:
                        line.productId,

                    baseUnitId:
                        product.baseUnitId,

                    quantityBase:
                        line.receivedBaseQuantity,
                },
            );
        }

        purchaseOrderRepository.recordGoodsReceipt(
            purchaseOrder.id,
            receipt.lines.map(
                (line) => ({
                    purchaseOrderLineId:
                        line.purchaseOrderLineId,

                    receivedQuantity:
                        line.receivedQuantity,
                }),
            ),
        );

        goodsReceipts = [
            receipt,
            ...goodsReceipts,
        ];

        emitChange();

        return receipt;
    },
};