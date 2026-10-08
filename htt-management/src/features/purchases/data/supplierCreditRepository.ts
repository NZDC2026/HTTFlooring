import {
    supplierBillRepository,
} from "./supplierBillRepository";

import {
    purchasesAccountingPostingService,
} from "../../accounting/data/purchasesAccountingPostingService";

import type {
    SupplierCredit,
    SupplierCreditAllocation,
    SupplierCreditDraft,
    SupplierCreditLine,
} from "../types/supplierCredit";

type Listener = () => void;

const listeners =
    new Set<Listener>();

let supplierCredits:
    SupplierCredit[] =
    [];

let allocations:
    SupplierCreditAllocation[] =
    [];

let supplierCreditSnapshot:
    SupplierCredit[] =
    [];

let allocationSnapshot:
    SupplierCreditAllocation[] =
    [];

function emitChange() {
    supplierCreditSnapshot = [
        ...supplierCredits,
    ];

    allocationSnapshot = [
        ...allocations,
    ];

    listeners.forEach(
        (listener) =>
            listener(),
    );
}

export const supplierCreditRepository =
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
        SupplierCredit[] {
        return supplierCreditSnapshot;
    },

    getAllocationSnapshot():
        SupplierCreditAllocation[] {
        return allocationSnapshot;
    },

    getAll():
        SupplierCredit[] {
        return supplierCreditSnapshot;
    },

    getAllAllocations():
        SupplierCreditAllocation[] {
        return allocationSnapshot;
    },

    getById(
        supplierCreditId:
            string,
    ) {
        return supplierCredits.find(
            (credit) =>
                credit.id ===
                supplierCreditId,
        );
    },

    getBySupplier(
        supplierId:
            string,
    ) {
        return supplierCredits.filter(
            (credit) =>
                credit.supplierId ===
                supplierId,
        );
    },

    getBySourceBill(
        supplierBillId:
            string,
    ) {
        return supplierCredits.filter(
            (credit) =>
                credit
                    .sourceSupplierBillId ===
                supplierBillId,
        );
    },

    getAllocationById(
        allocationId:
            string,
    ) {
        return allocations.find(
            (allocation) =>
                allocation.id ===
                allocationId,
        );
    },

    getAllocationsByCredit(
        supplierCreditId:
            string,
    ) {
        return allocations.filter(
            (allocation) =>
                allocation
                    .supplierCreditId ===
                supplierCreditId,
        );
    },

    getAllocationsByBill(
        supplierBillId:
            string,
    ) {
        return allocations.filter(
            (allocation) =>
                allocation
                    .supplierBillId ===
                supplierBillId,
        );
    },

    create(
        draft:
            SupplierCreditDraft,
    ): SupplierCredit {
        const sourceBill =
            supplierBillRepository.getById(
                draft.sourceSupplierBillId,
            );

        if (!sourceBill) {
            throw new Error(
                "Source supplier bill was not found.",
            );
        }

        if (
            sourceBill.status ===
            "VOID"
        ) {
            throw new Error(
                "A supplier credit cannot be created from a void supplier bill.",
            );
        }

        const supplierCreditNumber =
            draft.supplierCreditNumber.trim();

        if (
            supplierCreditNumber.length ===
            0
        ) {
            throw new Error(
                "Supplier credit number is required.",
            );
        }

        const duplicateReference =
            supplierCredits.some(
                (credit) =>
                    credit.supplierId ===
                    sourceBill.supplierId &&
                    credit.status !==
                    "VOID" &&
                    credit.supplierCreditNumber
                        .toLowerCase() ===
                    supplierCreditNumber
                        .toLowerCase(),
            );

        if (
            duplicateReference
        ) {
            throw new Error(
                "This supplier credit number already exists for the supplier.",
            );
        }

        if (
            !isDateKey(
                draft.creditDate,
            )
        ) {
            throw new Error(
                "A valid credit date is required.",
            );
        }

        if (
            draft.creditDate <
            sourceBill.billDate
        ) {
            throw new Error(
                "Credit date cannot be earlier than the source supplier bill date.",
            );
        }

        const reason =
            draft.reason.trim();

        if (
            reason.length < 3
        ) {
            throw new Error(
                "A supplier credit reason is required.",
            );
        }

        if (
            draft.lines.length ===
            0
        ) {
            throw new Error(
                "A supplier credit must contain at least one line.",
            );
        }

        const sourceLinesById =
            new Map(
                sourceBill.lines.map(
                    (line) => [
                        line.id,
                        line,
                    ],
                ),
            );

        const duplicateLineIds =
            new Set<string>();

        const lines:
            SupplierCreditLine[] =
            draft.lines.map(
                (
                    draftLine,
                    index,
                ) => {
                    const sourceLine =
                        sourceLinesById.get(
                            draftLine
                                .supplierBillLineId,
                        );

                    if (
                        !sourceLine
                    ) {
                        throw new Error(
                            "A supplier credit line does not belong to the source supplier bill.",
                        );
                    }

                    if (
                        duplicateLineIds.has(
                            sourceLine.id,
                        )
                    ) {
                        throw new Error(
                            `${sourceLine.description} appears more than once in the supplier credit.`,
                        );
                    }

                    duplicateLineIds.add(
                        sourceLine.id,
                    );

                    const quantity =
                        roundQuantity(
                            draftLine.quantity,
                        );

                    if (
                        !Number.isFinite(
                            quantity,
                        ) ||
                        quantity <= 0
                    ) {
                        throw new Error(
                            `${sourceLine.description} credit quantity must be greater than zero.`,
                        );
                    }

                    if (
                        quantity >
                        sourceLine.quantity
                    ) {
                        throw new Error(
                            `${sourceLine.description} credit quantity cannot exceed the source bill quantity.`,
                        );
                    }

                    const unitCost =
                        roundCurrency(
                            draftLine.unitCost,
                        );

                    if (
                        !Number.isFinite(
                            unitCost,
                        ) ||
                        unitCost < 0
                    ) {
                        throw new Error(
                            `${sourceLine.description} unit cost cannot be negative.`,
                        );
                    }

                    if (
                        unitCost >
                        sourceLine.unitCost
                    ) {
                        throw new Error(
                            `${sourceLine.description} credit unit cost cannot exceed the source bill unit cost.`,
                        );
                    }

                    const lineSubtotal =
                        roundCurrency(
                            quantity *
                            unitCost,
                        );

                    const taxAmount =
                        roundCurrency(
                            lineSubtotal *
                            0.1,
                        );

                    const lineTotal =
                        roundCurrency(
                            lineSubtotal +
                            taxAmount,
                        );

                    return {
                        id:
                            createId(
                                `supplier-credit-line-${index + 1}`,
                            ),

                        purchaseOrderLineId:
                            sourceLine
                                .purchaseOrderLineId,

                        supplierBillLineId:
                            sourceLine.id,

                        productId:
                            sourceLine.productId,

                        unitId:
                            sourceLine.unitId,

                        sku:
                            sourceLine.sku,

                        description:
                            sourceLine.description,

                        unitSymbol:
                            sourceLine.unitSymbol,

                        quantity,

                        unitCost,

                        lineSubtotal,

                        taxAmount,

                        lineTotal,
                    };
                },
            );

        const subtotal =
            roundCurrency(
                lines.reduce(
                    (
                        total,
                        line,
                    ) =>
                        total +
                        line.lineSubtotal,
                    0,
                ),
            );

        const taxAmount =
            roundCurrency(
                lines.reduce(
                    (
                        total,
                        line,
                    ) =>
                        total +
                        line.taxAmount,
                    0,
                ),
            );

        const total =
            roundCurrency(
                subtotal +
                taxAmount,
            );

        if (
            total <= 0
        ) {
            throw new Error(
                "Supplier credit total must be greater than zero.",
            );
        }

        const existingCredits =
            supplierCredits.filter(
                (credit) =>
                    credit
                        .sourceSupplierBillId ===
                    sourceBill.id &&
                    credit.status !==
                    "VOID",
            );

        const alreadyCredited =
            roundCurrency(
                existingCredits.reduce(
                    (
                        sum,
                        credit,
                    ) =>
                        sum +
                        credit.totals
                            .total,
                    0,
                ),
            );

        if (
            roundCurrency(
                alreadyCredited +
                total,
            ) >
            roundCurrency(
                sourceBill.totals
                    .total,
            )
        ) {
            throw new Error(
                "Total supplier credits cannot exceed the source supplier bill total.",
            );
        }

        const now =
            new Date().toISOString();

        const credit:
            SupplierCredit = {
            id:
                createId(
                    "supplier-credit",
                ),

            creditNumber:
                createCreditNumber(
                    draft.creditDate,
                ),

            supplierCreditNumber,

            supplierId:
                sourceBill.supplierId,

            supplierCode:
                sourceBill.supplierCode,

            supplierName:
                sourceBill.supplierName,

            sourceSupplierBillId:
                sourceBill.id,

            sourceSupplierBillNumber:
                sourceBill.billNumber,

            creditDate:
                draft.creditDate,

            status:
                "ISSUED",

            reason,

            lines,

            totals: {
                subtotal,
                taxAmount,
                total,
            },

            amountApplied:
                0,

            amountAvailable:
                total,

            issuedAt:
                now,

            createdAt:
                now,

            updatedAt:
                now,
        };

        supplierCredits = [
            credit,
            ...supplierCredits,
        ];

        emitChange();

        purchasesAccountingPostingService
            .postSupplierCredit(
                credit,
            );

        return credit;
    },

    applyToBill(
        input: {
            supplierCreditId: string;
            supplierBillId: string;
            allocationDate: string;
            amount: number;
        },
    ): SupplierCreditAllocation {
        const credit =
            supplierCredits.find(
                (item) =>
                    item.id ===
                    input.supplierCreditId,
            );

        if (!credit) {
            throw new Error(
                "Supplier credit was not found.",
            );
        }

        if (
            credit.status ===
            "VOID"
        ) {
            throw new Error(
                "A void supplier credit cannot be allocated.",
            );
        }

        if (
            credit.amountAvailable <=
            0
        ) {
            throw new Error(
                "This supplier credit has no available balance.",
            );
        }

        const bill =
            supplierBillRepository.getById(
                input.supplierBillId,
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
                "Credit cannot be allocated to a void supplier bill.",
            );
        }

        if (
            bill.totals.amountDue <=
            0
        ) {
            throw new Error(
                `${bill.billNumber} has no outstanding balance.`,
            );
        }

        if (
            credit.supplierId !==
            bill.supplierId
        ) {
            throw new Error(
                "Supplier credit and supplier bill must belong to the same supplier.",
            );
        }

        if (
            !isDateKey(
                input.allocationDate,
            )
        ) {
            throw new Error(
                "A valid allocation date is required.",
            );
        }

        if (
            input.allocationDate <
            credit.creditDate
        ) {
            throw new Error(
                "Allocation date cannot be earlier than the supplier credit date.",
            );
        }

        if (
            input.allocationDate <
            bill.billDate
        ) {
            throw new Error(
                "Allocation date cannot be earlier than the supplier bill date.",
            );
        }

        const amount =
            roundCurrency(
                input.amount,
            );

        if (
            !Number.isFinite(
                amount,
            ) ||
            amount <= 0
        ) {
            throw new Error(
                "Credit allocation amount must be greater than zero.",
            );
        }

        if (
            amount >
            credit.amountAvailable
        ) {
            throw new Error(
                "Credit allocation cannot exceed the available supplier credit.",
            );
        }

        if (
            amount >
            bill.totals.amountDue
        ) {
            throw new Error(
                "Credit allocation cannot exceed the supplier bill amount due.",
            );
        }

        /*
         * Validate everything before mutating either
         * Supplier Bill or Supplier Credit.
         */
        const now =
            new Date().toISOString();

        const allocation:
            SupplierCreditAllocation = {
            id:
                createId(
                    "supplier-credit-allocation",
                ),

            allocationNumber:
                createAllocationNumber(
                    input.allocationDate,
                ),

            supplierId:
                credit.supplierId,

            supplierCreditId:
                credit.id,

            supplierBillId:
                bill.id,

            supplierBillNumber:
                bill.billNumber,

            allocationDate:
                input.allocationDate,

            amount,

            status:
                "APPLIED",

            createdAt:
                now,

            updatedAt:
                now,
        };

        /*
         * Bill mutation occurs only after all
         * validations have passed.
         */
        supplierBillRepository.applyCredit(
            bill.id,
            amount,
        );

        const amountApplied =
            roundCurrency(
                credit.amountApplied +
                amount,
            );

        const amountAvailable =
            roundCurrency(
                Math.max(
                    0,
                    credit.totals.total -
                    amountApplied,
                ),
            );

        const updatedCredit:
            SupplierCredit = {
            ...credit,

            amountApplied,

            amountAvailable,

            status:
                amountAvailable <=
                    0
                    ? "FULLY_APPLIED"
                    : "ISSUED",

            updatedAt:
                now,
        };

        allocations = [
            allocation,
            ...allocations,
        ];

        supplierCredits =
            supplierCredits.map(
                (item) =>
                    item.id ===
                        credit.id
                        ? updatedCredit
                        : item,
            );

        emitChange();

        return allocation;
    },

    reverseAllocation(
        input: {
            allocationId: string;
            reversalReason: string;
        },
    ): SupplierCreditAllocation {
        const allocation =
            allocations.find(
                (item) =>
                    item.id ===
                    input.allocationId,
            );

        if (!allocation) {
            throw new Error(
                "Supplier credit allocation was not found.",
            );
        }

        if (
            allocation.status ===
            "REVERSED"
        ) {
            throw new Error(
                "This supplier credit allocation has already been reversed.",
            );
        }

        const reversalReason =
            input.reversalReason.trim();

        if (
            reversalReason.length <
            3
        ) {
            throw new Error(
                "A reversal reason is required.",
            );
        }

        const credit =
            supplierCredits.find(
                (item) =>
                    item.id ===
                    allocation.supplierCreditId,
            );

        if (!credit) {
            throw new Error(
                "Supplier credit was not found.",
            );
        }

        if (
            credit.status ===
            "VOID"
        ) {
            throw new Error(
                "An allocation belonging to a void supplier credit cannot be reversed.",
            );
        }

        const bill =
            supplierBillRepository.getById(
                allocation.supplierBillId,
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
                "An allocation against a void supplier bill cannot be reversed.",
            );
        }

        if (
            allocation.amount >
            bill.totals.amountCredited
        ) {
            throw new Error(
                "The supplier bill does not contain enough credited value to reverse this allocation.",
            );
        }

        if (
            allocation.amount >
            credit.amountApplied
        ) {
            throw new Error(
                "The supplier credit does not contain enough applied value to reverse this allocation.",
            );
        }

        /*
         * All validation is completed before
         * either the bill or credit is mutated.
         */
        const now =
            new Date().toISOString();

        supplierBillRepository.reverseCredit(
            bill.id,
            allocation.amount,
        );

        const amountApplied =
            roundCurrency(
                Math.max(
                    0,
                    credit.amountApplied -
                    allocation.amount,
                ),
            );

        const amountAvailable =
            roundCurrency(
                Math.max(
                    0,
                    credit.totals.total -
                    amountApplied,
                ),
            );

        const updatedCredit:
            SupplierCredit = {
            ...credit,

            amountApplied,

            amountAvailable,

            status:
                amountAvailable <=
                    0
                    ? "FULLY_APPLIED"
                    : "ISSUED",

            updatedAt:
                now,
        };

        const reversedAllocation:
            SupplierCreditAllocation = {
            ...allocation,

            status:
                "REVERSED",

            reversedAt:
                now,

            reversalReason,

            updatedAt:
                now,
        };

        supplierCredits =
            supplierCredits.map(
                (item) =>
                    item.id ===
                        credit.id
                        ? updatedCredit
                        : item,
            );

        allocations =
            allocations.map(
                (item) =>
                    item.id ===
                        allocation.id
                        ? reversedAllocation
                        : item,
            );

        emitChange();

        return reversedAllocation;
    },

    voidCredit(
        input: {
            supplierCreditId: string;
            reason: string;
        },
    ): SupplierCredit {
        const credit =
            supplierCredits.find(
                (item) =>
                    item.id ===
                    input.supplierCreditId,
            );

        if (!credit) {
            throw new Error(
                "Supplier credit was not found.",
            );
        }

        if (
            credit.status ===
            "VOID"
        ) {
            throw new Error(
                "This supplier credit has already been voided.",
            );
        }

        const reason =
            input.reason.trim();

        if (
            reason.length < 3
        ) {
            throw new Error(
                "A void reason is required.",
            );
        }

        const activeAllocations =
            allocations.filter(
                (allocation) =>
                    allocation.supplierCreditId ===
                    credit.id &&
                    allocation.status ===
                    "APPLIED",
            );

        if (
            activeAllocations.length >
            0
        ) {
            throw new Error(
                "Reverse all active credit allocations before voiding this supplier credit.",
            );
        }

        /*
         * No active allocation may remain before
         * the supplier credit is voided.
         *
         * Allocation reversals restore the bill
         * balances first. Voiding the credit then
         * removes the remaining supplier credit
         * from future use while preserving its
         * accounting history.
         */
        const now =
            new Date().toISOString();

        const voided:
            SupplierCredit = {
            ...credit,

            status:
                "VOID",

            amountApplied:
                0,

            amountAvailable:
                0,

            voidedAt:
                now,

            voidReason:
                reason,

            updatedAt:
                now,
        };

        supplierCredits =
            supplierCredits.map(
                (item) =>
                    item.id ===
                        credit.id
                        ? voided
                        : item,
            );

        emitChange();

        purchasesAccountingPostingService
            .reverseSupplierCredit(
                voided,
            );

        return voided;
    },

    updateAllocation(
        updated:
            SupplierCreditAllocation,
    ) {
        const exists =
            allocations.some(
                (item) =>
                    item.id ===
                    updated.id,
            );

        if (!exists) {
            throw new Error(
                `Supplier credit allocation ${updated.id} was not found.`,
            );
        }

        allocations =
            allocations.map(
                (item) =>
                    item.id ===
                        updated.id
                        ? updated
                        : item,
            );

        emitChange();

        return updated;
    },

    update(
        updated:
            SupplierCredit,
    ) {
        const exists =
            supplierCredits.some(
                (credit) =>
                    credit.id ===
                    updated.id,
            );

        if (!exists) {
            throw new Error(
                `Supplier credit ${updated.id} was not found.`,
            );
        }

        supplierCredits =
            supplierCredits.map(
                (credit) =>
                    credit.id ===
                        updated.id
                        ? updated
                        : credit,
            );

        emitChange();

        return updated;
    },
};

function createAllocationNumber(
    allocationDate: string,
) {
    const year =
        allocationDate.slice(
            0,
            4,
        );

    const prefix =
        `SCA-${year}-`;

    const numbers =
        allocations
            .filter(
                (
                    allocation,
                ) =>
                    allocation.allocationNumber.startsWith(
                        prefix,
                    ),
            )
            .map(
                (
                    allocation,
                ) =>
                    Number.parseInt(
                        allocation.allocationNumber.slice(
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

function createCreditNumber(
    creditDate: string,
) {
    const year =
        creditDate.slice(
            0,
            4,
        );

    const prefix =
        `SC-${year}-`;

    const numbers =
        supplierCredits
            .filter(
                (credit) =>
                    credit.creditNumber.startsWith(
                        prefix,
                    ),
            )
            .map(
                (credit) =>
                    Number.parseInt(
                        credit.creditNumber.slice(
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

function createId(
    prefix: string,
) {
    return `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;
}

function isDateKey(
    value: string,
) {
    return /^\d{4}-\d{2}-\d{2}$/.test(
        value,
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