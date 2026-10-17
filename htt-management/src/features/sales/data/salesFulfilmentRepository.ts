import { registerRepository } from "../../security/repositoryHost";
import {
    salesRepository,
} from "./salesRepository";

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
    issueInventoryCost,
    restoreInventoryCost,
} from "../../inventory/data/inventoryCostEngine";

import {
    inventoryCostMovementRepository,
} from "../../inventory/data/inventoryCostMovementRepository";

import {
    inventoryAccountingPostingService,
} from "../../accounting/data/inventoryAccountingPostingService";

import {
    roundInventoryQuantity,
    roundInventoryValue,
} from "../../inventory/data/inventoryCostCalculations";

import type {
    SalesFulfilment,
    SalesFulfilmentDraft,
    SalesFulfilmentLine,
    VoidSalesFulfilmentInput,
} from "../types/salesFulfilment";

type Listener =
    () => void;

const listeners =
    new Set<Listener>();

let fulfilments:
    SalesFulfilment[] =
    [];

let snapshot:
    SalesFulfilment[] =
    fulfilments;

function emitChange() {
    snapshot =
        fulfilments;

    listeners.forEach(
        (
            listener,
        ) =>
            listener(),
    );
}

function createFulfilmentNumber() {
    const year =
        new Date()
            .getFullYear();

    const prefix =
        `SF-${year}-`;

    const numbers =
        fulfilments
            .filter(
                (
                    fulfilment,
                ) =>
                    fulfilment
                        .fulfilmentNumber
                        .startsWith(
                            prefix,
                        ),
            )
            .map(
                (
                    fulfilment,
                ) =>
                    Number.parseInt(
                        fulfilment
                            .fulfilmentNumber
                            .slice(
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
        5,
        "0",
    )}`;
}

function getFulfilledQuantity(
    salesOrderId:
        string,

    salesOrderLineId:
        string,
) {
    return roundInventoryQuantity(
        fulfilments
            .filter(
                (
                    fulfilment,
                ) =>
                    fulfilment.salesOrderId ===
                    salesOrderId &&
                    fulfilment.status ===
                    "ACTIVE",
            )
            .flatMap(
                (
                    fulfilment,
                ) =>
                    fulfilment.lines,
            )
            .filter(
                (
                    line,
                ) =>
                    line.salesOrderLineId ===
                    salesOrderLineId,
            )
            .reduce(
                (
                    total,
                    line,
                ) =>
                    total +
                    line.fulfilledQuantity,
                0,
            ),
    );
}

function updateSalesOrderFulfilmentStatus(
    salesOrderId:
        string,
) {
    const document =
        salesRepository.getById(
            salesOrderId,
        );

    if (
        !document ||
        document.type !==
        "SALES_ORDER"
    ) {
        throw new Error(
            "Sales order was not found.",
        );
    }

    const fulfilledQuantities =
        document.lines.map(
            (
                line,
            ) =>
                getFulfilledQuantity(
                    document.id,
                    line.id,
                ),
        );

    const hasAnyFulfilment =
        fulfilledQuantities.some(
            (
                quantity,
            ) =>
                quantity >
                0,
        );

    const fullyFulfilled =
        document.lines.every(
            (
                line,
                index,
            ) =>
                fulfilledQuantities[
                index
                ] >=
                roundInventoryQuantity(
                    line.quantity,
                ),
        );

    salesRepository
        .setFulfilmentStatus(
            document.id,

            fullyFulfilled
                ? "FULFILLED"
                : hasAnyFulfilment
                    ? "PARTIALLY_FULFILLED"
                    : "CONFIRMED",
        );
}

function requireOriginalIssueMovements(
    fulfilment:
        SalesFulfilment,
) {
    const movements =
        inventoryCostMovementRepository
            .getByReference(
                "SALE",
                fulfilment.id,
            )
            .filter(
                (
                    movement,
                ) =>
                    movement.movementType ===
                    "ISSUE",
            );

    if (
        movements.length !==
        fulfilment.lines.length
    ) {
        throw new Error(
            `Inventory costing for sales fulfilment ${fulfilment.fulfilmentNumber} is incomplete.`,
        );
    }

    return movements;
}

export const salesFulfilmentRepository =
{
    subscribe(
        listener:
            Listener,
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
        SalesFulfilment[] {
        return snapshot;
    },

    getAll():
        SalesFulfilment[] {
        return snapshot;
    },

    getById(
        fulfilmentId:
            string,
    ) {
        return fulfilments.find(
            (
                fulfilment,
            ) =>
                fulfilment.id ===
                fulfilmentId,
        );
    },

    getBySalesOrder(
        salesOrderId:
            string,
    ) {
        return fulfilments.filter(
            (
                fulfilment,
            ) =>
                fulfilment.salesOrderId ===
                salesOrderId,
        );
    },

    getFulfilledQuantity,

    getRemainingQuantity(
        salesOrderId:
            string,

        salesOrderLineId:
            string,
    ) {
        const document =
            salesRepository.getById(
                salesOrderId,
            );

        if (
            !document ||
            document.type !==
            "SALES_ORDER"
        ) {
            throw new Error(
                "Sales order was not found.",
            );
        }

        const line =
            document.lines.find(
                (
                    item,
                ) =>
                    item.id ===
                    salesOrderLineId,
            );

        if (!line) {
            throw new Error(
                "Sales order line was not found.",
            );
        }

        return roundInventoryQuantity(
            line.quantity -
            getFulfilledQuantity(
                salesOrderId,
                salesOrderLineId,
            ),
        );
    },

    create(
        draft:
            SalesFulfilmentDraft,
    ) {
        const document =
            salesRepository.getById(
                draft.salesOrderId,
            );

        if (
            !document ||
            document.type !==
            "SALES_ORDER"
        ) {
            throw new Error(
                "Sales order was not found.",
            );
        }

        const order =
            document;

        if (
            order.status !==
            "CONFIRMED" &&
            order.status !==
            "PARTIALLY_FULFILLED" && order.status!=="INVOICED"
        ) {
            throw new Error(
                "Only a confirmed or partially fulfilled sales order can be fulfilled.",
            );
        }

        if(order.status==='INVOICED'&&!order.invoiceIds.some(id=>{const d=salesRepository.getById(id);return d?.type==='INVOICE'&&d.status!=='VOID';}))throw new Error('This order has no active invoice; do not fulfil a void invoice.');
        const site =
            inventorySiteRepository
                .getById(
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
                "Inventory site is inactive.",
            );
        }

        if (
            Number.isNaN(
                Date.parse(
                    draft.fulfilmentDate,
                ),
            )
        ) {
            throw new Error(
                "Fulfilment date is invalid.",
            );
        }

        const positiveLines =
            draft.lines.filter(
                (
                    line,
                ) =>
                    Number.isFinite(
                        line.fulfilledQuantity,
                    ) &&
                    line.fulfilledQuantity >
                    0,
            );

        if (
            positiveLines.length ===
            0
        ) {
            throw new Error(
                "At least one fulfilment quantity must be greater than zero.",
            );
        }

        const seenLineIds =
            new Set<string>();

        const preparedLines =
            positiveLines.map(
                (
                    draftLine,
                ) => {
                    if (
                        seenLineIds.has(
                            draftLine.salesOrderLineId,
                        )
                    ) {
                        throw new Error(
                            "A sales order line cannot appear more than once in the same fulfilment.",
                        );
                    }

                    seenLineIds.add(
                        draftLine.salesOrderLineId,
                    );

                    const orderLine =
                        order.lines.find(
                            (
                                line,
                            ) =>
                                line.id ===
                                draftLine.salesOrderLineId,
                        );

                    if (!orderLine) {
                        throw new Error(
                            "Sales order line was not found.",
                        );
                    }

                    const product =
                        getProductById(
                            orderLine.productId,
                        );

                    if (!product) {
                        throw new Error(
                            `Product ${orderLine.sku} was not found.`,
                        );
                    }

                    const unit =
                        getProductUnit(
                            orderLine.productId,
                            orderLine.unitId,
                        );

                    if (!unit) {
                        throw new Error(
                            `Unit ${orderLine.unitSymbol} was not found.`,
                        );
                    }

                    if (!unit.active) {
                        throw new Error(
                            `Unit ${orderLine.unitSymbol} is inactive.`,
                        );
                    }

                    const fulfilledQuantity =
                        roundInventoryQuantity(
                            draftLine.fulfilledQuantity,
                        );

                    const alreadyFulfilled =
                        getFulfilledQuantity(
                            order.id,
                            orderLine.id,
                        );

                    const remainingQuantity =
                        roundInventoryQuantity(
                            orderLine.quantity -
                            alreadyFulfilled,
                        );

                    if (
                        fulfilledQuantity >
                        remainingQuantity
                    ) {
                        throw new Error(
                            `Fulfilment quantity for ${orderLine.sku} exceeds the remaining sales order quantity.`,
                        );
                    }

                    const fulfilledBaseQuantity =
                        roundInventoryQuantity(
                            fulfilledQuantity *
                            unit.conversionToBase,
                        );

                    const stockBalance =
                        stockRepository
                            .getBalance(
                                site.id,
                                orderLine.productId,
                            );

                    if (
                        !stockBalance ||
                        stockBalance.quantityOnHand <
                        fulfilledBaseQuantity
                    ) {
                        throw new Error(
                            `Insufficient stock for ${orderLine.sku} at ${site.name}.`,
                        );
                    }

                    return {
                        orderLine,
                        product,
                        unit,
                        fulfilledQuantity,
                        fulfilledBaseQuantity,
                    };
                },
            );

        const requiredByProduct =
            new Map<
                string,
                number
            >();

        for (
            const prepared of
            preparedLines
        ) {
            const current =
                requiredByProduct.get(
                    prepared.orderLine.productId,
                ) ??
                0;

            requiredByProduct.set(
                prepared.orderLine.productId,
                roundInventoryQuantity(
                    current +
                    prepared.fulfilledBaseQuantity,
                ),
            );
        }

        for (
            const [
                productId,
                requiredQuantity,
            ] of
            requiredByProduct
        ) {
            const stockBalance =
                stockRepository
                    .getBalance(
                        site.id,
                        productId,
                    );

            if (
                !stockBalance ||
                stockBalance.quantityOnHand <
                requiredQuantity
            ) {
                const product =
                    getProductById(
                        productId,
                    );

                throw new Error(
                    `Insufficient stock for ${product?.sku ?? productId} at ${site.name}.`,
                );
            }
        }

        const now =
            new Date()
                .toISOString();

        const fulfilmentId =
            `sf_${crypto.randomUUID()}`;

        const fulfilmentNumber =
            createFulfilmentNumber();

        const fulfilmentLines:
            SalesFulfilmentLine[] =
            preparedLines.map(
                (
                    prepared,
                ) => ({
                    id:
                        `sfl_${crypto.randomUUID()}`,

                    salesOrderLineId:
                        prepared.orderLine.id,

                    productId:
                        prepared.orderLine.productId,

                    unitId:
                        prepared.orderLine.unitId,

                    sku:
                        prepared.orderLine.sku,

                    description:
                        prepared.orderLine.description,

                    unitSymbol:
                        prepared.orderLine.unitSymbol,

                    fulfilledQuantity:
                        prepared.fulfilledQuantity,

                    conversionToBase:
                        prepared.unit.conversionToBase,

                    fulfilledBaseQuantity:
                        prepared.fulfilledBaseQuantity,
                }),
            );

        const fulfilment:
            SalesFulfilment =
        {
            id:
                fulfilmentId,

            fulfilmentNumber,

            salesOrderId:
                order.id,

            salesOrderNumber:
                order.documentNumber,

            customerId:
                order.customerId,

            siteId:
                site.id,

            fulfilmentDate:
                draft.fulfilmentDate,

            status:
                "ACTIVE",

            lines:
                fulfilmentLines,

            notes:
                draft.notes,

            createdAt:
                now,
        };

        for (
            const line of
            fulfilment.lines
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

            const inventoryMovement =
                inventoryMovementRepository
                    .create({
                        movementType:
                            "SALE",

                        siteId:
                            site.id,

                        productId:
                            line.productId,

                        baseUnitId:
                            product.baseUnitId,

                        quantityBase:
                            roundInventoryQuantity(
                                -line.fulfilledBaseQuantity,
                            ),

                        transactionUnitId:
                            line.unitId,

                        transactionUnitSymbol:
                            line.unitSymbol,

                        transactionQuantity:
                            roundInventoryQuantity(
                                -line.fulfilledQuantity,
                            ),

                        conversionToBase:
                            line.conversionToBase,

                        referenceType:
                            "SALES_FULFILMENT",

                        referenceId:
                            fulfilment.id,

                        referenceNumber:
                            fulfilment.fulfilmentNumber,

                        salesOrderId:
                            order.id,

                        salesOrderNumber:
                            order.documentNumber,

                        occurredAt:
                            draft.fulfilmentDate,

                        notes:
                            `Sales fulfilment ${fulfilment.fulfilmentNumber}`,
                    });

            issueInventoryCost({
                siteId:
                    site.id,

                productId:
                    line.productId,

                unitId:
                    line.unitId,

                quantity:
                    line.fulfilledQuantity,

                movementType:
                    "ISSUE",

                referenceType:
                    "SALE",

                referenceId:
                    fulfilment.id,

                referenceNumber:
                    fulfilment.fulfilmentNumber,

                inventoryMovementId:
                    inventoryMovement.id,

                occurredAt:
                    draft.fulfilmentDate,

                notes:
                    `Sales fulfilment ${fulfilment.fulfilmentNumber}`,
            });

            stockRepository.issue({
                siteId:
                    site.id,

                productId:
                    line.productId,

                baseUnitId:
                    product.baseUnitId,

                quantityBase:
                    line.fulfilledBaseQuantity,
            });
        }

        inventoryAccountingPostingService
            .postSalesFulfilment(
                fulfilment,
            );

        fulfilments = [
            fulfilment,
            ...fulfilments,
        ];

        emitChange();

        updateSalesOrderFulfilmentStatus(
            order.id,
        );

        return fulfilment;
    },

    void(
        input:
            VoidSalesFulfilmentInput,
    ) {
        const fulfilment =
            fulfilments.find(
                (
                    item,
                ) =>
                    item.id ===
                    input.fulfilmentId,
            );

        if (!fulfilment) {
            throw new Error(
                "Sales fulfilment was not found.",
            );
        }

        if (
            fulfilment.status ===
            "VOIDED"
        ) {
            throw new Error(
                "Sales fulfilment has already been voided.",
            );
        }

        if (
            Number.isNaN(
                Date.parse(
                    input.voidDate,
                ),
            )
        ) {
            throw new Error(
                "Fulfilment void date is invalid.",
            );
        }

        if (
            input.voidDate <
            fulfilment.fulfilmentDate
        ) {
            throw new Error(
                "Fulfilment void date cannot be earlier than the fulfilment date.",
            );
        }

        const reason =
            input.reason.trim();

        if (
            reason.length <
            3
        ) {
            throw new Error(
                "Fulfilment void reason must contain at least 3 characters.",
            );
        }

        const order =
            salesRepository.getById(
                fulfilment.salesOrderId,
            );

        if (
            !order ||
            order.type !==
            "SALES_ORDER"
        ) {
            throw new Error(
                "Sales order was not found.",
            );
        }

        /**
         * 6J-E10
         *
         * An invoiced sales order cannot have
         * its fulfilment voided directly.
         *
         * This validation must happen before
         * any inventory, costing or GL mutation.
         */
        if (
            order.status === "INVOICED" && (order.invoiceIds.some(id=>{const d=salesRepository.getById(id);return d?.type==='INVOICE'&&d.status!=='VOID';}))
        ) {
            throw new Error(
                "Cannot void a sales fulfilment for an invoiced sales order.",
            );
        }

        if (
            order.status !== "CONFIRMED" &&
            order.status !== "PARTIALLY_FULFILLED" &&
            order.status !== "FULFILLED" && order.status!=='INVOICED'
        ) {
            throw new Error(
                `Cannot void a sales fulfilment when the sales order status is ${order.status}.`,
            );
        }

        const originalIssues =
            requireOriginalIssueMovements(
                fulfilment,
            );

        /*
         * 6J-E09
         *
         * Resolve every fulfilment line to
         * a unique original ISSUE movement.
         *
         * A cost movement must never be
         * reused by multiple fulfilment lines.
         *
         * All matching happens before any
         * inventory or accounting mutation.
         */
        const usedIssueIds =
            new Set<string>();

        const preparedReturns =
            fulfilment.lines.map(
                (
                    line,
                ) => {
                    const product =
                        getProductById(
                            line.productId,
                        );

                    if (!product) {
                        throw new Error(
                            `Product ${line.sku} was not found.`,
                        );
                    }

                    const originalIssue =
                        originalIssues.find(
                            (
                                movement,
                            ) =>
                                !usedIssueIds.has(
                                    movement.id,
                                ) &&
                                movement.siteId ===
                                fulfilment.siteId &&
                                movement.productId ===
                                line.productId &&
                                Math.abs(
                                    movement.quantityBase,
                                ) ===
                                line.fulfilledBaseQuantity,
                        );

                    if (!originalIssue) {
                        throw new Error(
                            `Unique original inventory cost issue for ${line.sku} was not found.`,
                        );
                    }

                    usedIssueIds.add(
                        originalIssue.id,
                    );

                    return {
                        line,
                        product,
                        originalIssue,
                    };
                },
            );

        /*
         * Reverse the original COGS journal
         * before marking the fulfilment
         * voided.
         *
         * Zero-cost fulfilments correctly
         * return undefined here.
         */
        inventoryAccountingPostingService
            .reverseSalesFulfilment({
                fulfilment,

                reversalDate:
                    input.voidDate,

                reason,
            });

        for (
            const prepared of
            preparedReturns
        ) {
            const {
                line,
                product,
                originalIssue,
            } =
                prepared;

            const inventoryMovement =
                inventoryMovementRepository
                    .create({
                        movementType:
                            "RETURN_IN",

                        siteId:
                            fulfilment.siteId,

                        productId:
                            line.productId,

                        baseUnitId:
                            product.baseUnitId,

                        quantityBase:
                            line.fulfilledBaseQuantity,

                        transactionUnitId:
                            line.unitId,

                        transactionUnitSymbol:
                            line.unitSymbol,

                        transactionQuantity:
                            line.fulfilledQuantity,

                        conversionToBase:
                            line.conversionToBase,

                        referenceType:
                            "SALES_FULFILMENT_VOID",

                        referenceId:
                            fulfilment.id,

                        referenceNumber:
                            fulfilment.fulfilmentNumber,

                        salesOrderId:
                            fulfilment.salesOrderId,

                        salesOrderNumber:
                            fulfilment.salesOrderNumber,

                        occurredAt:
                            input.voidDate,

                        notes:
                            `Void sales fulfilment ${fulfilment.fulfilmentNumber}: ${reason}`,
                    });

            restoreInventoryCost({
                siteId:
                    fulfilment.siteId,

                productId:
                    line.productId,

                quantityBase:
                    line.fulfilledBaseQuantity,

                unitCostBase:
                    originalIssue.unitCostBase,

                inventoryValue:
                    roundInventoryValue(
                        Math.abs(
                            originalIssue.valueChange,
                        ),
                    ),

                referenceType:
                    "SALE",

                referenceId:
                    fulfilment.id,

                referenceNumber:
                    fulfilment.fulfilmentNumber,

                inventoryMovementId:
                    inventoryMovement.id,

                occurredAt:
                    input.voidDate,

                notes:
                    `Void sales fulfilment ${fulfilment.fulfilmentNumber}: ${reason}`,
            });

            stockRepository.receive({
                siteId:
                    fulfilment.siteId,

                productId:
                    line.productId,

                baseUnitId:
                    product.baseUnitId,

                quantityBase:
                    line.fulfilledBaseQuantity,
            });
        }

        const updated:
            SalesFulfilment =
        {
            ...fulfilment,

            status:
                "VOIDED",

            voidedAt:
                new Date()
                    .toISOString(),

            voidDate:
                input.voidDate,

            voidReason:
                reason,
        };

        fulfilments =
            fulfilments.map(
                (
                    item,
                ) =>
                    item.id ===
                        updated.id
                        ? updated
                        : item,
            );

        emitChange();

        updateSalesOrderFulfilmentStatus(
            fulfilment.salesOrderId,
        );

        return updated;
    },
};
registerRepository("fulfilments", {
    repository: salesFulfilmentRepository, read: "inventory.read",
    commands: {"if": null, "create": "inventory.adjust", "void": "inventory.adjust"},
    snapshot: () => ({ fulfilments }),
    restore: value => { fulfilments = value.fulfilments; snapshot = fulfilments; },
    publish: () => listeners.forEach(listener => listener()),
});
