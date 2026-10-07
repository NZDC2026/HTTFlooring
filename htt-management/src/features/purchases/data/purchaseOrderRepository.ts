import {
    mockProducts,
} from "../../inventory/data/mockProducts";

import {
    supplierRepository,
} from "../../contacts/data/supplierRepository";

import {
    calculatePurchaseOrderLine,
    calculatePurchaseOrderTotals,
} from "./purchaseOrderCalculations";

import {
    mockPurchaseOrders,
} from "./mockPurchaseOrders";

import type {
    PurchaseOrder,
    PurchaseOrderDraft,
    PurchaseOrderLine,
} from "../types/purchaseOrder";

type Listener = () => void;

const listeners =
    new Set<Listener>();

let purchaseOrders:
    PurchaseOrder[] =
    structuredClone(
        mockPurchaseOrders,
    );

function emitChange() {
    listeners.forEach(
        (listener) =>
            listener(),
    );
}

function createId(
    prefix: string,
) {
    return `${prefix}_${crypto.randomUUID()}`;
}

function getYear(
    date: string,
) {
    return date.slice(
        0,
        4,
    );
}

function createPurchaseOrderNumber(
    orderDate: string,
) {
    const year =
        getYear(
            orderDate,
        );

    const pattern =
        new RegExp(
            `^PO-${year}-(\\d+)$`,
        );

    const numbers =
        purchaseOrders
            .map(
                (
                    purchaseOrder,
                ) => {
                    const match =
                        purchaseOrder.purchaseOrderNumber.match(
                            pattern,
                        );

                    return match
                        ? Number.parseInt(
                            match[1],
                            10,
                        )
                        : 0;
                },
            )
            .filter(
                Number.isFinite,
            );

    const nextNumber =
        Math.max(
            0,
            ...numbers,
        ) + 1;

    return `PO-${year}-${nextNumber
        .toString()
        .padStart(
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

function buildLines(
    draft: PurchaseOrderDraft,
): PurchaseOrderLine[] {
    if (
        draft.lines.length ===
        0
    ) {
        throw new Error(
            "Purchase order must contain at least one line.",
        );
    }

    return draft.lines.map(
        (
            draftLine,
        ) => {
            const product =
                mockProducts.find(
                    (
                        item,
                    ) =>
                        item.id ===
                        draftLine.productId,
                );

            if (!product) {
                throw new Error(
                    "Selected product was not found.",
                );
            }

            if (
                product.status !==
                "ACTIVE"
            ) {
                throw new Error(
                    `${product.name} is inactive.`,
                );
            }

            const unit =
                product.units.find(
                    (
                        item,
                    ) =>
                        item.id ===
                        draftLine.unitId,
                );

            if (!unit) {
                throw new Error(
                    `Selected unit for ${product.name} was not found.`,
                );
            }

            if (!unit.active) {
                throw new Error(
                    `${unit.name} is inactive.`,
                );
            }

            if (
                !Number.isFinite(
                    draftLine.orderedQuantity,
                ) ||
                draftLine.orderedQuantity <=
                0
            ) {
                throw new Error(
                    "Ordered quantity must be greater than zero.",
                );
            }

            if (
                !Number.isFinite(
                    draftLine.unitCost,
                ) ||
                draftLine.unitCost <
                0
            ) {
                throw new Error(
                    "Unit cost cannot be negative.",
                );
            }

            const calculated =
                calculatePurchaseOrderLine(
                    {
                        orderedQuantity:
                            draftLine.orderedQuantity,

                        unitCost:
                            draftLine.unitCost,
                    },
                );

            return {
                id:
                    createId(
                        "pol",
                    ),

                productId:
                    product.id,

                unitId:
                    unit.id,

                sku:
                    product.sku,

                description:
                    product.name,

                unitSymbol:
                    unit.symbol,

                orderedQuantity:
                    draftLine.orderedQuantity,

                receivedQuantity: 0,

                billedQuantity: 0,

                unitCost:
                    draftLine.unitCost,

                ...calculated,
            };
        },
    );
}

function validateSupplier(
    supplierId: string,
) {
    const supplier =
        supplierRepository.getById(
            supplierId,
        );

    if (!supplier) {
        throw new Error(
            "Selected supplier was not found.",
        );
    }

    if (
        supplier.status !==
        "ACTIVE"
    ) {
        throw new Error(
            "Inactive suppliers cannot be used for new purchase orders.",
        );
    }

    return supplier;
}

function validateDates(
    draft: PurchaseOrderDraft,
) {
    if (!draft.orderDate) {
        throw new Error(
            "Order date is required.",
        );
    }

    if (
        draft.expectedDeliveryDate &&
        draft.expectedDeliveryDate <
        draft.orderDate
    ) {
        throw new Error(
            "Expected delivery date cannot be before the order date.",
        );
    }
}

export const purchaseOrderRepository =
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
        PurchaseOrder[] {
        return purchaseOrders;
    },

    getAll():
        PurchaseOrder[] {
        return purchaseOrders;
    },

    getById(
        purchaseOrderId: string,
    ) {
        return purchaseOrders.find(
            (
                purchaseOrder,
            ) =>
                purchaseOrder.id ===
                purchaseOrderId,
        );
    },

    getBySupplier(
        supplierId: string,
    ) {
        return purchaseOrders.filter(
            (
                purchaseOrder,
            ) =>
                purchaseOrder.supplierId ===
                supplierId,
        );
    },

    create(
        draft: PurchaseOrderDraft,
    ) {
        validateDates(
            draft,
        );

        const supplier =
            validateSupplier(
                draft.supplierId,
            );

        const lines =
            buildLines(
                draft,
            );

        const now =
            new Date().toISOString();

        const purchaseOrder:
            PurchaseOrder =
        {
            id:
                createId(
                    "po",
                ),

            purchaseOrderNumber:
                createPurchaseOrderNumber(
                    draft.orderDate,
                ),

            supplierId:
                supplier.id,

            supplierCode:
                supplier.code,

            supplierName:
                supplier.businessName,

            orderDate:
                draft.orderDate,

            expectedDeliveryDate:
                normalizeOptional(
                    draft.expectedDeliveryDate,
                ),

            status:
                "DRAFT",

            supplierReference:
                normalizeOptional(
                    draft.supplierReference,
                ),

            notes:
                normalizeOptional(
                    draft.notes,
                ),

            lines,

            totals:
                calculatePurchaseOrderTotals(
                    lines,
                ),

            createdAt:
                now,

            updatedAt:
                now,
        };

        purchaseOrders = [
            purchaseOrder,
            ...purchaseOrders,
        ];

        emitChange();

        return purchaseOrder;
    },

    updateDraft(
        purchaseOrderId:
            string,

        draft:
            PurchaseOrderDraft,
    ) {
        const existing =
            purchaseOrderRepository.getById(
                purchaseOrderId,
            );

        if (!existing) {
            throw new Error(
                "Purchase order was not found.",
            );
        }

        if (
            existing.status !==
            "DRAFT"
        ) {
            throw new Error(
                "Only draft purchase orders can be edited.",
            );
        }

        validateDates(
            draft,
        );

        const supplier =
            validateSupplier(
                draft.supplierId,
            );

        const lines =
            buildLines(
                draft,
            );

        const updated:
            PurchaseOrder =
        {
            ...existing,

            supplierId:
                supplier.id,

            supplierCode:
                supplier.code,

            supplierName:
                supplier.businessName,

            orderDate:
                draft.orderDate,

            expectedDeliveryDate:
                normalizeOptional(
                    draft.expectedDeliveryDate,
                ),

            supplierReference:
                normalizeOptional(
                    draft.supplierReference,
                ),

            notes:
                normalizeOptional(
                    draft.notes,
                ),

            lines,

            totals:
                calculatePurchaseOrderTotals(
                    lines,
                ),

            updatedAt:
                new Date().toISOString(),
        };

        purchaseOrders =
            purchaseOrders.map(
                (
                    purchaseOrder,
                ) =>
                    purchaseOrder.id ===
                        existing.id
                        ? updated
                        : purchaseOrder,
            );

        emitChange();

        return updated;
    },

    approve(
        purchaseOrderId:
            string,
    ) {
        const existing =
            purchaseOrderRepository.getById(
                purchaseOrderId,
            );

        if (!existing) {
            throw new Error(
                "Purchase order was not found.",
            );
        }

        if (
            existing.status !==
            "DRAFT"
        ) {
            throw new Error(
                "Only draft purchase orders can be approved.",
            );
        }

        return updateStatus(
            existing,
            {
                status:
                    "APPROVED",

                approvedAt:
                    new Date().toISOString(),
            },
        );
    },

    send(
        purchaseOrderId:
            string,
    ) {
        const existing =
            purchaseOrderRepository.getById(
                purchaseOrderId,
            );

        if (!existing) {
            throw new Error(
                "Purchase order was not found.",
            );
        }

        if (
            existing.status !==
            "APPROVED"
        ) {
            throw new Error(
                "Only approved purchase orders can be sent.",
            );
        }

        return updateStatus(
            existing,
            {
                status:
                    "SENT",

                sentAt:
                    new Date().toISOString(),
            },
        );
    },

    recordGoodsReceipt(
        purchaseOrderId:
            string,

        receivedLines:
            Array<{
                purchaseOrderLineId:
                string;

                receivedQuantity:
                number;
            }>,
    ) {
        const existing =
            purchaseOrderRepository.getById(
                purchaseOrderId,
            );

        if (!existing) {
            throw new Error(
                "Purchase order was not found.",
            );
        }

        if (
            ![
                "SENT",
                "PARTIALLY_RECEIVED",
            ].includes(
                existing.status,
            )
        ) {
            throw new Error(
                "This purchase order cannot receive goods.",
            );
        }

        if (
            receivedLines.length ===
            0
        ) {
            throw new Error(
                "At least one received line is required.",
            );
        }

        const receivedByLineId =
            new Map<
                string,
                number
            >();

        for (
            const receivedLine of
            receivedLines
        ) {
            if (
                !Number.isFinite(
                    receivedLine.receivedQuantity,
                ) ||
                receivedLine.receivedQuantity <=
                0
            ) {
                throw new Error(
                    "Received quantity must be greater than zero.",
                );
            }

            if (
                receivedByLineId.has(
                    receivedLine.purchaseOrderLineId,
                )
            ) {
                throw new Error(
                    "Duplicate purchase order receipt line.",
                );
            }

            receivedByLineId.set(
                receivedLine.purchaseOrderLineId,
                receivedLine.receivedQuantity,
            );
        }

        const updatedLines =
            existing.lines.map(
                (line) => {
                    const receivedNow =
                        receivedByLineId.get(
                            line.id,
                        );

                    if (
                        receivedNow ===
                        undefined
                    ) {
                        return line;
                    }

                    const nextReceived =
                        Math.round(
                            (line.receivedQuantity +
                                receivedNow +
                                Number.EPSILON) *
                            10000,
                        ) / 10000;

                    if (
                        nextReceived >
                        line.orderedQuantity
                    ) {
                        throw new Error(
                            `${line.description} cannot be received above the ordered quantity.`,
                        );
                    }

                    return {
                        ...line,

                        receivedQuantity:
                            nextReceived,
                    };
                },
            );

        for (
            const receivedLine of
            receivedLines
        ) {
            const exists =
                existing.lines.some(
                    (line) =>
                        line.id ===
                        receivedLine.purchaseOrderLineId,
                );

            if (!exists) {
                throw new Error(
                    "Purchase order receipt line was not found.",
                );
            }
        }

        const fullyReceived =
            updatedLines.every(
                (line) =>
                    line.receivedQuantity >=
                    line.orderedQuantity,
            );

        const updated:
            PurchaseOrder =
        {
            ...existing,

            lines:
                updatedLines,

            status:
                fullyReceived
                    ? "RECEIVED"
                    : "PARTIALLY_RECEIVED",

            updatedAt:
                new Date().toISOString(),
        };

        purchaseOrders =
            purchaseOrders.map(
                (purchaseOrder) =>
                    purchaseOrder.id ===
                        existing.id
                        ? updated
                        : purchaseOrder,
            );

        emitChange();

        return updated;
    },

    recordSupplierBill(
        purchaseOrderId:
            string,

        billedLines:
            Array<{
                purchaseOrderLineId:
                string;

                billedQuantity:
                number;
            }>,
    ) {
        const existing =
            purchaseOrderRepository.getById(
                purchaseOrderId,
            );

        if (!existing) {
            throw new Error(
                "Purchase order was not found.",
            );
        }

        if (
            ![
                "PARTIALLY_RECEIVED",
                "RECEIVED",
                "BILLED",
            ].includes(
                existing.status,
            )
        ) {
            throw new Error(
                "This purchase order cannot be billed.",
            );
        }

        if (
            billedLines.length ===
            0
        ) {
            throw new Error(
                "At least one billed line is required.",
            );
        }

        const billedByLineId =
            new Map<
                string,
                number
            >();

        for (
            const billedLine of
            billedLines
        ) {
            if (
                !Number.isFinite(
                    billedLine.billedQuantity,
                ) ||
                billedLine.billedQuantity <=
                0
            ) {
                throw new Error(
                    "Billed quantity must be greater than zero.",
                );
            }

            if (
                billedByLineId.has(
                    billedLine.purchaseOrderLineId,
                )
            ) {
                throw new Error(
                    "Duplicate purchase order bill line.",
                );
            }

            billedByLineId.set(
                billedLine.purchaseOrderLineId,
                billedLine.billedQuantity,
            );
        }

        const updatedLines =
            existing.lines.map(
                (line) => {
                    const billedNow =
                        billedByLineId.get(
                            line.id,
                        );

                    if (
                        billedNow ===
                        undefined
                    ) {
                        return line;
                    }

                    const nextBilled =
                        roundQuantity(
                            line.billedQuantity +
                            billedNow,
                        );

                    if (
                        nextBilled >
                        line.receivedQuantity
                    ) {
                        throw new Error(
                            `${line.description} cannot be billed above the received quantity.`,
                        );
                    }

                    return {
                        ...line,

                        billedQuantity:
                            nextBilled,
                    };
                },
            );

        for (
            const billedLine of
            billedLines
        ) {
            const exists =
                existing.lines.some(
                    (line) =>
                        line.id ===
                        billedLine.purchaseOrderLineId,
                );

            if (!exists) {
                throw new Error(
                    "Purchase order bill line was not found.",
                );
            }
        }

        const fullyReceived =
            updatedLines.every(
                (line) =>
                    line.receivedQuantity >=
                    line.orderedQuantity,
            );

        const fullyBilled =
            updatedLines.every(
                (line) =>
                    line.billedQuantity >=
                    line.orderedQuantity,
            );

        const nextStatus:
            PurchaseOrder["status"] =
            fullyReceived &&
                fullyBilled
                ? "BILLED"
                : fullyReceived
                    ? "RECEIVED"
                    : "PARTIALLY_RECEIVED";

        const updated:
            PurchaseOrder =
        {
            ...existing,

            lines:
                updatedLines,

            status:
                nextStatus,

            updatedAt:
                new Date().toISOString(),
        };

        purchaseOrders =
            purchaseOrders.map(
                (purchaseOrder) =>
                    purchaseOrder.id ===
                        existing.id
                        ? updated
                        : purchaseOrder,
            );

        emitChange();

        return updated;
    },

    cancel(
        purchaseOrderId:
            string,

        reason: string,
    ) {
        const existing =
            purchaseOrderRepository.getById(
                purchaseOrderId,
            );

        if (!existing) {
            throw new Error(
                "Purchase order was not found.",
            );
        }

        if (
            ![
                "DRAFT",
                "APPROVED",
            ].includes(
                existing.status,
            )
        ) {
            throw new Error(
                "Only draft or approved purchase orders can be cancelled.",
            );
        }

        const normalizedReason =
            reason.trim();

        if (
            normalizedReason.length <
            3
        ) {
            throw new Error(
                "Cancellation reason is required.",
            );
        }

        return updateStatus(
            existing,
            {
                status:
                    "CANCELLED",

                cancelledAt:
                    new Date().toISOString(),

                cancellationReason:
                    normalizedReason,
            },
        );
    },
};

function updateStatus(
    existing: PurchaseOrder,

    changes:
        Partial<PurchaseOrder>,
) {
    const updated:
        PurchaseOrder =
    {
        ...existing,
        ...changes,

        updatedAt:
            new Date().toISOString(),
    };

    purchaseOrders =
        purchaseOrders.map(
            (
                purchaseOrder,
            ) =>
                purchaseOrder.id ===
                    existing.id
                    ? updated
                    : purchaseOrder,
        );

    emitChange();

    return updated;
}

function roundQuantity(
    value: number,
) {
    return (
        Math.round(
            (value + Number.EPSILON) *
            10000,
        ) / 10000
    );
}