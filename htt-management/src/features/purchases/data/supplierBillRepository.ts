import {
    purchaseOrderRepository,
} from "./purchaseOrderRepository";

import {
    purchasesAccountingPostingService,
} from "../../accounting/data/purchasesAccountingPostingService";

import {
    calculateSupplierBillLine,
    calculateSupplierBillTotals,
} from "../utils/supplierBillCalculations";

import type {
    SupplierBill,
    SupplierBillDraft,
    SupplierBillLine,
} from "../types/supplierBill";

type Listener = () => void;

const listeners =
    new Set<Listener>();

let supplierBills:
    SupplierBill[] =
    [];

function emitChange() {
    listeners.forEach(
        (listener) =>
            listener(),
    );
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

function createBillNumber(
    billDate: string,
) {
    const year =
        billDate.slice(
            0,
            4,
        );

    const prefix =
        `BILL-${year}-`;

    const numbers =
        supplierBills
            .filter(
                (bill) =>
                    bill.billNumber.startsWith(
                        prefix,
                    ),
            )
            .map(
                (bill) =>
                    Number.parseInt(
                        bill.billNumber.slice(
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

export const supplierBillRepository =
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
        SupplierBill[] {
        return supplierBills;
    },

    getAll():
        SupplierBill[] {
        return supplierBills;
    },

    getById(
        supplierBillId:
            string,
    ) {
        return supplierBills.find(
            (bill) =>
                bill.id ===
                supplierBillId,
        );
    },

    getBySupplier(
        supplierId:
            string,
    ) {
        return supplierBills.filter(
            (bill) =>
                bill.supplierId ===
                supplierId,
        );
    },

    applyPayment(
        supplierBillId: string,
        amount: number,
    ): SupplierBill {
        const bill =
            supplierBills.find(
                (item) =>
                    item.id ===
                    supplierBillId,
            );

        if (!bill) {
            throw new Error(
                "Supplier bill was not found.",
            );
        }

        if (
            bill.status ===
            "VOID"
        ) {
            throw new Error(
                "A void supplier bill cannot receive a payment.",
            );
        }

        if (
            !Number.isFinite(
                amount,
            ) ||
            amount <= 0
        ) {
            throw new Error(
                "Payment allocation must be greater than zero.",
            );
        }

        const allocation =
            roundCurrency(
                amount,
            );

        if (
            allocation >
            bill.totals.amountDue
        ) {
            throw new Error(
                `${bill.billNumber} cannot be paid more than its outstanding balance.`,
            );
        }

        const amountPaid =
            roundCurrency(
                bill.totals
                    .amountPaid +
                allocation,
            );

        const amountDue =
            roundCurrency(
                Math.max(
                    0,
                    bill.totals
                        .total -
                    amountPaid -
                    bill.totals
                        .amountCredited,
                ),
            );

        const updated:
            SupplierBill = {
            ...bill,

            status:
                amountDue <= 0
                    ? "PAID"
                    : amountPaid > 0
                        ? "PARTIALLY_PAID"
                        : "OPEN",

            totals: {
                ...bill.totals,

                amountPaid,

                amountDue,
            },

            updatedAt:
                new Date().toISOString(),
        };

        supplierBills =
            supplierBills.map(
                (item) =>
                    item.id ===
                        supplierBillId
                        ? updated
                        : item,
            );

        emitChange();

        return updated;
    },

    reversePayment(
        supplierBillId: string,
        amount: number,
    ): SupplierBill {
        const bill =
            supplierBills.find(
                (item) =>
                    item.id ===
                    supplierBillId,
            );

        if (!bill) {
            throw new Error(
                "Supplier bill was not found.",
            );
        }

        if (
            bill.status ===
            "VOID"
        ) {
            throw new Error(
                "A payment cannot be reversed against a void supplier bill.",
            );
        }

        if (
            !Number.isFinite(
                amount,
            ) ||
            amount <= 0
        ) {
            throw new Error(
                "Payment reversal amount must be greater than zero.",
            );
        }

        const reversal =
            roundCurrency(
                amount,
            );

        if (
            reversal >
            bill.totals.amountPaid
        ) {
            throw new Error(
                `${bill.billNumber} does not contain enough paid value to reverse this allocation.`,
            );
        }

        const amountPaid =
            roundCurrency(
                Math.max(
                    0,
                    bill.totals
                        .amountPaid -
                    reversal,
                ),
            );

        const amountDue =
            roundCurrency(
                Math.max(
                    0,
                    bill.totals
                        .total -
                    amountPaid -
                    bill.totals
                        .amountCredited,
                ),
            );

        const updated:
            SupplierBill = {
            ...bill,

            status:
                amountDue <= 0
                    ? "PAID"
                    : amountPaid > 0
                        ? "PARTIALLY_PAID"
                        : "OPEN",

            totals: {
                ...bill.totals,

                amountPaid,

                amountDue,
            },

            updatedAt:
                new Date().toISOString(),
        };

        supplierBills =
            supplierBills.map(
                (item) =>
                    item.id ===
                        supplierBillId
                        ? updated
                        : item,
            );

        emitChange();

        return updated;
    },

    applyCredit(
        supplierBillId: string,
        amount: number,
    ): SupplierBill {
        const bill =
            supplierBills.find(
                (item) =>
                    item.id ===
                    supplierBillId,
            );

        if (!bill) {
            throw new Error(
                "Supplier bill was not found.",
            );
        }

        if (
            bill.status ===
            "VOID"
        ) {
            throw new Error(
                "A void supplier bill cannot receive a credit allocation.",
            );
        }

        if (
            !Number.isFinite(
                amount,
            ) ||
            amount <= 0
        ) {
            throw new Error(
                "Credit allocation must be greater than zero.",
            );
        }

        const allocation =
            roundCurrency(
                amount,
            );

        if (
            allocation >
            bill.totals.amountDue
        ) {
            throw new Error(
                `${bill.billNumber} cannot receive credit greater than its outstanding balance.`,
            );
        }

        const amountCredited =
            roundCurrency(
                bill.totals
                    .amountCredited +
                allocation,
            );

        const amountDue =
            roundCurrency(
                Math.max(
                    0,
                    bill.totals
                        .total -
                    bill.totals
                        .amountPaid -
                    amountCredited,
                ),
            );

        const updated:
            SupplierBill = {
            ...bill,

            status:
                amountDue <= 0
                    ? "PAID"
                    : bill.totals
                        .amountPaid >
                        0 ||
                        amountCredited >
                        0
                        ? "PARTIALLY_PAID"
                        : "OPEN",

            totals: {
                ...bill.totals,

                amountCredited,

                amountDue,
            },

            updatedAt:
                new Date().toISOString(),
        };

        supplierBills =
            supplierBills.map(
                (item) =>
                    item.id ===
                        supplierBillId
                        ? updated
                        : item,
            );

        emitChange();

        return updated;
    },

    reverseCredit(
        supplierBillId: string,
        amount: number,
    ): SupplierBill {
        const bill =
            supplierBills.find(
                (item) =>
                    item.id ===
                    supplierBillId,
            );

        if (!bill) {
            throw new Error(
                "Supplier bill was not found.",
            );
        }

        if (
            bill.status ===
            "VOID"
        ) {
            throw new Error(
                "A credit allocation cannot be reversed against a void supplier bill.",
            );
        }

        if (
            !Number.isFinite(
                amount,
            ) ||
            amount <= 0
        ) {
            throw new Error(
                "Credit reversal amount must be greater than zero.",
            );
        }

        const reversal =
            roundCurrency(
                amount,
            );

        if (
            reversal >
            bill.totals
                .amountCredited
        ) {
            throw new Error(
                `${bill.billNumber} does not contain enough credited value to reverse this allocation.`,
            );
        }

        const amountCredited =
            roundCurrency(
                Math.max(
                    0,
                    bill.totals
                        .amountCredited -
                    reversal,
                ),
            );

        const amountDue =
            roundCurrency(
                Math.max(
                    0,
                    bill.totals
                        .total -
                    bill.totals
                        .amountPaid -
                    amountCredited,
                ),
            );

        const updated:
            SupplierBill = {
            ...bill,

            status:
                amountDue <= 0
                    ? "PAID"
                    : bill.totals
                        .amountPaid >
                        0 ||
                        amountCredited >
                        0
                        ? "PARTIALLY_PAID"
                        : "OPEN",

            totals: {
                ...bill.totals,

                amountCredited,

                amountDue,
            },

            updatedAt:
                new Date().toISOString(),
        };

        supplierBills =
            supplierBills.map(
                (item) =>
                    item.id ===
                        supplierBillId
                        ? updated
                        : item,
            );

        emitChange();

        return updated;
    },

    markVoid(
        supplierBillId: string,
        reason: string,
    ): SupplierBill {
        const bill =
            supplierBills.find(
                (item) =>
                    item.id ===
                    supplierBillId,
            );

        if (!bill) {
            throw new Error(
                "Supplier bill was not found.",
            );
        }

        if (
            bill.status ===
            "VOID"
        ) {
            throw new Error(
                "This supplier bill has already been voided.",
            );
        }

        const normalizedReason =
            reason.trim();

        if (
            normalizedReason.length <
            3
        ) {
            throw new Error(
                "A void reason is required.",
            );
        }

        const now =
            new Date().toISOString();

        /*
         * Restore billed quantities on the
         * Purchase Order so the received goods
         * can be billed again.
         */
        purchaseOrderRepository.reverseSupplierBill(
            bill.purchaseOrderId,

            bill.lines.map(
                (line) => ({
                    purchaseOrderLineId:
                        line.purchaseOrderLineId,

                    billedQuantity:
                        line.quantity,
                }),
            ),
        );

        const voided:
            SupplierBill = {
            ...bill,

            status:
                "VOID",

            voidedAt:
                now,

            voidReason:
                normalizedReason,

            updatedAt:
                now,
        };

        supplierBills =
            supplierBills.map(
                (item) =>
                    item.id ===
                        supplierBillId
                        ? voided
                        : item,
            );

        emitChange();

        return voided;
    },

    getByPurchaseOrder(
        purchaseOrderId:
            string,
    ) {
        return supplierBills.filter(
            (bill) =>
                bill.purchaseOrderId ===
                purchaseOrderId,
        );
    },

    create(
        draft:
            SupplierBillDraft,
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
                "PARTIALLY_RECEIVED",
                "RECEIVED",
                "BILLED",
            ].includes(
                purchaseOrder.status,
            )
        ) {
            throw new Error(
                "Supplier bills can only be created for purchase orders with received goods.",
            );
        }

        const supplierInvoiceNumber =
            draft.supplierInvoiceNumber.trim();

        if (
            !supplierInvoiceNumber
        ) {
            throw new Error(
                "Supplier invoice number is required.",
            );
        }

        const duplicateInvoice =
            supplierBills.some(
                (bill) =>
                    bill.supplierId ===
                    purchaseOrder.supplierId &&
                    bill.supplierInvoiceNumber.toLowerCase() ===
                    supplierInvoiceNumber.toLowerCase() &&
                    bill.status !==
                    "VOID",
            );

        if (
            duplicateInvoice
        ) {
            throw new Error(
                "This supplier invoice number has already been entered.",
            );
        }

        if (
            !draft.billDate
        ) {
            throw new Error(
                "Bill date is required.",
            );
        }

        if (
            !draft.dueDate
        ) {
            throw new Error(
                "Due date is required.",
            );
        }

        if (
            draft.dueDate <
            draft.billDate
        ) {
            throw new Error(
                "Due date cannot be before bill date.",
            );
        }

        const positiveLines =
            draft.lines.filter(
                (line) =>
                    Number.isFinite(
                        line.quantity,
                    ) &&
                    line.quantity >
                    0,
            );

        if (
            positiveLines.length ===
            0
        ) {
            throw new Error(
                "Enter a bill quantity for at least one line.",
            );
        }

        const seenLineIds =
            new Set<string>();

        const lines:
            SupplierBillLine[] =
            positiveLines.map(
                (draftLine) => {
                    if (
                        seenLineIds.has(
                            draftLine.purchaseOrderLineId,
                        )
                    ) {
                        throw new Error(
                            "A purchase order line cannot appear more than once on the same bill.",
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

                    if (
                        !Number.isFinite(
                            draftLine.unitCost,
                        ) ||
                        draftLine.unitCost <
                        0
                    ) {
                        throw new Error(
                            `${purchaseOrderLine.description}: unit cost is invalid.`,
                        );
                    }

                    const billableQuantity =
                        roundQuantity(
                            purchaseOrderLine.receivedQuantity -
                            purchaseOrderLine.billedQuantity,
                        );

                    if (
                        billableQuantity <=
                        0
                    ) {
                        throw new Error(
                            `${purchaseOrderLine.description} has no received quantity available to bill.`,
                        );
                    }

                    if (
                        draftLine.quantity >
                        billableQuantity
                    ) {
                        throw new Error(
                            `${purchaseOrderLine.description} cannot bill more than ${billableQuantity} ${purchaseOrderLine.unitSymbol}.`,
                        );
                    }

                    const calculations =
                        calculateSupplierBillLine(
                            {
                                quantity:
                                    draftLine.quantity,

                                unitCost:
                                    draftLine.unitCost,
                            },
                        );

                    return {
                        id:
                            `bill_line_${crypto.randomUUID()}`,

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

                        quantity:
                            draftLine.quantity,

                        unitCost:
                            draftLine.unitCost,

                        ...calculations,
                    };
                },
            );

        const totals =
            calculateSupplierBillTotals(
                lines,
            );

        const now =
            new Date().toISOString();

        const bill:
            SupplierBill =
        {
            id:
                `bill_${crypto.randomUUID()}`,

            billNumber:
                createBillNumber(
                    draft.billDate,
                ),

            supplierInvoiceNumber,

            supplierId:
                purchaseOrder.supplierId,

            supplierCode:
                purchaseOrder.supplierCode,

            supplierName:
                purchaseOrder.supplierName,

            purchaseOrderId:
                purchaseOrder.id,

            purchaseOrderNumber:
                purchaseOrder.purchaseOrderNumber,

            billDate:
                draft.billDate,

            dueDate:
                draft.dueDate,

            status:
                "OPEN",

            lines,

            totals,

            notes:
                normalizeOptional(
                    draft.notes,
                ),

            createdAt:
                now,

            updatedAt:
                now,
        };

        /**
         * All validation is complete before
         * either repository is mutated.
         */
        purchaseOrderRepository.recordSupplierBill(
            purchaseOrder.id,

            lines.map(
                (line) => ({
                    purchaseOrderLineId:
                        line.purchaseOrderLineId,

                    billedQuantity:
                        line.quantity,
                }),
            ),
        );

        supplierBills = [
            bill,
            ...supplierBills,
        ];

        emitChange();

        purchasesAccountingPostingService
            .postSupplierBill(
                bill,
            );

        return bill;
    },
};

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

function roundCurrency(
    value: number,
) {
    return (
        Math.round(
            (value +
                Number.EPSILON) *
            100,
        ) / 100
    );
}