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

                receivedQuantity:
                    0,

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