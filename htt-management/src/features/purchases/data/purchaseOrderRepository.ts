import { etaChangeInput, etaHistorySchema, incomingStatuses } from "../../incoming-shipments/shipmentEta";
import { trustedAuthorization } from "../../security/trustedAuthorization";
import { validateFx } from "../../currency/currency";
import { purchaseDefaults, purchaseDefaultsSchema } from '../../purchase-settings/purchaseDefaults';
import { visibleDocuments } from '../../document-recycle/recycleState';
import { configuredNumber, businessSettings, taxSnapshot, exclusivePrice } from '../../business-workspace/configurationState';
import { assertProductQuantity } from '../../business-workspace/productRules';
import { activeTaxRate } from '../../business-workspace/configurationState';
import { registerRepository } from "../../security/repositoryHost";
import { financialStateStorage } from "../../../lib/persistence/financialStateStorage";
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


import type {
    PurchaseOrder,
    PurchaseOrderDraft,
    PurchaseOrderLine,
} from "../types/purchaseOrder";

type Listener = () => void;

const listeners =
    new Set<Listener>();

let purchaseOrders:
    PurchaseOrder[] = financialStateStorage.read().purchaseOrders;

financialStateStorage.onRollback(() => { purchaseOrders = financialStateStorage.read().purchaseOrders; });
function emitChange() {
    try { financialStateStorage.update("purchaseOrders", purchaseOrders); }
    catch (error) { purchaseOrders = financialStateStorage.read().purchaseOrders; throw error; }
    listeners.forEach(listener => financialStateStorage.notify(listener));
}

function createId(
    prefix: string,
) {
    return `${prefix}_${crypto.randomUUID()}`;
}

function createPurchaseOrderNumber(
    orderDate: string,
) {
 return configuredNumber('PO',purchaseOrders.map(r=>r.purchaseOrderNumber),orderDate.slice(0,4));
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

            assertProductQuantity(draftLine.productId,draftLine.unitId,draftLine.orderedQuantity,'buy');
        if (product.buyEnabled === false) throw new Error("Product is not available for purchasing.");
            const taxCode = product.taxCode ?? businessSettings().gstCode, taxRate = activeTaxRate(taxCode);
            const calculated =
                calculatePurchaseOrderLine(
                    {
                        taxRate,
                        inclusiveLineTotal:(draftLine.priceBasis??businessSettings().basis)==='Inclusive'?Math.round(draftLine.orderedQuantity*draftLine.unitCost*100)/100:undefined,
                        orderedQuantity:
                            draftLine.orderedQuantity,

                        unitCost:
                            exclusivePrice(draftLine.unitCost,taxRate,draftLine.priceBasis),
                    },
                );

            return {
                id:
                    createId(
                        "pol",
                    ),
                ...taxSnapshot(taxCode),grossUnitCost:(draftLine.priceBasis??businessSettings().basis)==='Inclusive'?draftLine.unitCost:undefined,

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
                    exclusivePrice(draftLine.unitCost,taxRate,draftLine.priceBasis),

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
        return visibleDocuments(purchaseOrders);
    },

    getAll():
        PurchaseOrder[] {
        return visibleDocuments(purchaseOrders);
    },

    getById(
        purchaseOrderId: string,
    ) {
        return visibleDocuments(purchaseOrders).find(
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
        return visibleDocuments(purchaseOrders).filter(
            (
                purchaseOrder,
            ) =>
                purchaseOrder.supplierId ===
                supplierId,
        );
    },

    updateEta(raw: unknown): PurchaseOrder {
        const actor=trustedAuthorization.require("purchases.write");
        const input=etaChangeInput.parse(raw);
        const old=purchaseOrders.find(order=>order.id===input.id);
        if(!old) throw new Error("Purchase order not found.");
        const prior=purchaseOrders.flatMap(order=>(order.etaHistory??[]).map(event=>({order,event})))
            .find(entry=>entry.event.operationId===input.operationId);
        if(prior) {
            if(prior.order.id!==input.id || prior.event.eta!==input.eta || prior.event.reason!==input.reason)
                throw new Error("This operation ID was used for a different ETA update.");
            return old;
        }
        if(!incomingStatuses.some(status=>status===old.status))
            throw new Error("ETA can be updated for approved, sent or partially received purchase orders.");
        if((old.etaHistory?.length??0)!==input.expectedRevision)
            throw new Error("ETA changed. Reopen the editor and review the latest date.");
        if(input.eta<old.orderDate) throw new Error("ETA cannot precede the purchase order date.");
        if(input.eta===old.expectedDeliveryDate) throw new Error("Choose a different ETA.");
        const at=new Date().toISOString();
        if(at<old.updatedAt) throw new Error("System clock precedes the last order update.");
        const updated:PurchaseOrder={...old,expectedDeliveryDate:input.eta,updatedAt:at,
            etaHistory:[...(old.etaHistory??[]),{
                operationId:input.operationId,previousEta:old.expectedDeliveryDate||undefined,eta:input.eta,
                reason:input.reason,actorId:actor.userId,actorName:actor.displayName||actor.userId,at,
            }]};
        purchaseOrders=purchaseOrders.map(order=>order.id===old.id?updated:order);
        emitChange();
        return updated;
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

        const fx = draft.fx ? validateFx(draft.fx,businessSettings().currency) : undefined;
        if (!fx && supplier.currency !== businessSettings().currency) throw new Error("Choose the purchase currency and exchange rate.");
        const lines =
            buildLines(
                draft.fx ? {...draft,lines:draft.lines.map(line=>({...line,unitCost:line.unitCost*draft.fx!.rate}))} : draft,
            );

        const originalLines = fx ? buildLines(draft).map((line,index)=>({...line,id:lines[index].id})) : undefined;
        const now =
            new Date().toISOString();

        const purchaseOrder:
            PurchaseOrder =
        {
            id:
                createId(
                    "po",
                ),

            fx:fx ? {...fx,baseAmount:calculatePurchaseOrderTotals(lines).total,originalAmount:calculatePurchaseOrderTotals(originalLines!).total} : undefined,
            originalLines,
            purchaseDefaults: purchaseDefaults(supplier),
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

        const fx = draft.fx ? validateFx(draft.fx,businessSettings().currency) : existing.fx;
        const lines =
            buildLines(
                draft.fx ? {...draft,lines:draft.lines.map(line=>({...line,unitCost:line.unitCost*draft.fx!.rate}))} : draft,
            );

        const originalLines = fx ? buildLines(draft.fx ? draft : {...draft,lines:draft.lines.map(line=>({...line,unitCost:line.unitCost/fx.rate}))}).map((line,index)=>({...line,id:lines[index].id})) : undefined;
        const updated:
            PurchaseOrder =
        {
            ...existing,
            fx:fx ? {...fx,baseAmount:calculatePurchaseOrderTotals(lines).total,originalAmount:calculatePurchaseOrderTotals(originalLines!).total} : undefined,
            originalLines,

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

    reverseSupplierBill(
        purchaseOrderId: string,

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
            billedLines.length ===
            0
        ) {
            throw new Error(
                "At least one supplier bill line is required.",
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

        /*
         * Validate every line before mutating
         * the Purchase Order.
         */
        for (
            const billedLine of
            billedLines
        ) {
            const purchaseOrderLine =
                existing.lines.find(
                    (line) =>
                        line.id ===
                        billedLine.purchaseOrderLineId,
                );

            if (
                !purchaseOrderLine
            ) {
                throw new Error(
                    "Purchase order bill line was not found.",
                );
            }

            if (
                billedLine.billedQuantity >
                purchaseOrderLine.billedQuantity
            ) {
                throw new Error(
                    `${purchaseOrderLine.description} does not contain enough billed quantity to reverse this supplier bill.`,
                );
            }
        }

        const updatedLines =
            existing.lines.map(
                (line) => {
                    const billedQuantity =
                        billedByLineId.get(
                            line.id,
                        );

                    if (
                        billedQuantity ===
                        undefined
                    ) {
                        return line;
                    }

                    return {
                        ...line,

                        billedQuantity:
                            roundQuantity(
                                Math.max(
                                    0,
                                    line.billedQuantity -
                                    billedQuantity,
                                ),
                            ),
                    };
                },
            );

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
            PurchaseOrder = {
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
registerRepository("purchaseOrders", {
    validate: value => {
        const etaOperations=new Set<string>();
        for(const row of (value as {purchaseOrders:PurchaseOrder[]}).purchaseOrders) {
            if(row.etaHistory) {
                let previous: string | undefined;
                let lastAt="";
                row.etaHistory.forEach((raw,index)=>{
                    const event=etaHistorySchema.parse(raw);
                    if(etaOperations.has(event.operationId) || index>0 && event.previousEta!==previous || event.at<lastAt || event.at<row.createdAt || event.at>row.updatedAt || event.eta<row.orderDate || event.previousEta===event.eta)
                        throw new Error("Invalid ETA history.");
                    etaOperations.add(event.operationId);previous=event.eta;lastAt=event.at;
                });
                if(row.etaHistory.length && previous!==row.expectedDeliveryDate) throw new Error("ETA does not match its history.");
            }
            if(row.purchaseDefaults!==undefined) purchaseDefaultsSchema.parse(row.purchaseDefaults);
            if(row.fx) validateFx(row.fx);
            if(row.originalLines) {
                if(!row.fx || row.originalLines.length!==row.lines.length ||
                    calculatePurchaseOrderTotals(row.originalLines).total!==row.fx.originalAmount ||
                    row.totals.total!==row.fx.baseAmount) throw new Error("Invalid original-currency order totals.");
                row.originalLines.forEach((line,index)=>{
                    const base=row.lines[index];
                    if(line.id!==base.id || line.productId!==base.productId || line.unitId!==base.unitId ||
                        line.orderedQuantity!==base.orderedQuantity || !Number.isFinite(line.unitCost) || line.unitCost<0 ||
                        Math.abs(line.unitCost*row.fx!.rate-base.unitCost)>Math.max(0.000001,row.fx!.rate*0.00000001))
                        throw new Error("Original purchase costs do not match the saved conversion.");
                });
            }
        }
    },
    repository: purchaseOrderRepository, read: "purchases.read",
    commands: {"updateEta":"purchases.write", "catch": null, "if": null, "create": "purchases.write", "updateDraft": "purchases.write", "approve": "purchases.write", "send": "purchases.write", "recordGoodsReceipt": null, "recordSupplierBill": null, "reverseSupplierBill": null, "emitChange": null, "return": null, "cancel": "purchases.write"},
    snapshot: () => ({ purchaseOrders }),
    restore: value => { purchaseOrders = (value as {purchaseOrders:PurchaseOrder[]}).purchaseOrders;  },
    publish: () => listeners.forEach(listener => listener()),
});

export function purgePurchaseOrderRecords(ids: Set<string>) {
 if(purchaseOrders.some(r=>ids.has(r.id)&&r.status!=='DRAFT')) throw new Error('Only draft purchase orders may be purged.');
 purchaseOrders=purchaseOrders.filter(r=>!ids.has(r.id)); emitChange();
}
