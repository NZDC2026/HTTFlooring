import {
    supplierRepository,
} from "../../contacts/data/supplierRepository";

import {
    supplierBillRepository,
} from "./supplierBillRepository";

import type {
    SupplierPayment,
    SupplierPaymentAllocation,
    SupplierPaymentDraft,
} from "../types/supplierPayment";

type Listener = () => void;

const listeners =
    new Set<Listener>();

let supplierPayments:
    SupplierPayment[] = [];

function emitChange() {
    listeners.forEach(
        (listener) =>
            listener(),
    );
}

export const supplierPaymentRepository =
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
        SupplierPayment[] {
        return supplierPayments;
    },

    getAll():
        SupplierPayment[] {
        return supplierPayments;
    },

    getById(
        supplierPaymentId:
            string,
    ) {
        return supplierPayments.find(
            (payment) =>
                payment.id ===
                supplierPaymentId,
        );
    },

    getBySupplier(
        supplierId:
            string,
    ) {
        return supplierPayments.filter(
            (payment) =>
                payment.supplierId ===
                supplierId,
        );
    },

    getByBill(
        supplierBillId:
            string,
    ) {
        return supplierPayments.filter(
            (payment) =>
                payment.allocations.some(
                    (allocation) =>
                        allocation.supplierBillId ===
                        supplierBillId,
                ),
        );
    },

    create(
        draft:
            SupplierPaymentDraft,
    ): SupplierPayment {
        const supplier =
            supplierRepository.getById(
                draft.supplierId,
            );

        if (!supplier) {
            throw new Error(
                "Supplier was not found.",
            );
        }

        if (
            !draft.paymentDate
        ) {
            throw new Error(
                "Payment date is required.",
            );
        }

        if (
            !draft.method
        ) {
            throw new Error(
                "Payment method is required.",
            );
        }

        const positiveAllocations =
            draft.allocations.filter(
                (allocation) =>
                    Number.isFinite(
                        allocation.amount,
                    ) &&
                    allocation.amount >
                    0,
            );

        if (
            positiveAllocations.length ===
            0
        ) {
            throw new Error(
                "Allocate the payment to at least one supplier bill.",
            );
        }

        const seenBillIds =
            new Set<string>();

        const allocations:
            SupplierPaymentAllocation[] =
            positiveAllocations.map(
                (
                    draftAllocation,
                ) => {
                    if (
                        seenBillIds.has(
                            draftAllocation.supplierBillId,
                        )
                    ) {
                        throw new Error(
                            "A supplier bill cannot appear more than once in the same payment.",
                        );
                    }

                    seenBillIds.add(
                        draftAllocation.supplierBillId,
                    );

                    const bill =
                        supplierBillRepository.getById(
                            draftAllocation.supplierBillId,
                        );

                    if (!bill) {
                        throw new Error(
                            "Supplier bill was not found.",
                        );
                    }

                    if (
                        bill.supplierId !==
                        supplier.id
                    ) {
                        throw new Error(
                            "All payment allocations must belong to the selected supplier.",
                        );
                    }

                    if (
                        bill.status ===
                        "VOID"
                    ) {
                        throw new Error(
                            `${bill.billNumber} is void and cannot receive a payment.`,
                        );
                    }

                    if (
                        bill.status ===
                        "PAID" ||
                        bill.totals
                            .amountDue <=
                        0
                    ) {
                        throw new Error(
                            `${bill.billNumber} is already fully paid.`,
                        );
                    }

                    const amount =
                        roundCurrency(
                            draftAllocation.amount,
                        );

                    if (
                        amount >
                        bill.totals
                            .amountDue
                    ) {
                        throw new Error(
                            `${bill.billNumber} cannot be paid more than ${formatMoney(
                                bill.totals
                                    .amountDue,
                            )}.`,
                        );
                    }

                    return {
                        id:
                            `supplier_payment_allocation_${crypto.randomUUID()}`,

                        supplierBillId:
                            bill.id,

                        billNumber:
                            bill.billNumber,

                        supplierInvoiceNumber:
                            bill.supplierInvoiceNumber,

                        amount,
                    };
                },
            );

        const amount =
            roundCurrency(
                allocations.reduce(
                    (
                        total,
                        allocation,
                    ) =>
                        total +
                        allocation.amount,
                    0,
                ),
            );

        if (
            amount <= 0
        ) {
            throw new Error(
                "Payment amount must be greater than zero.",
            );
        }

        /**
         * All validations above complete before
         * either repository is mutated.
         */
        for (
            const allocation of
            allocations
        ) {
            supplierBillRepository.applyPayment(
                allocation.supplierBillId,
                allocation.amount,
            );
        }

        const now =
            new Date().toISOString();

        const payment:
            SupplierPayment = {
            id:
                `supplier_payment_${crypto.randomUUID()}`,

            paymentNumber:
                createPaymentNumber(
                    draft.paymentDate,
                ),

            supplierId:
                supplier.id,

            supplierCode:
                supplier.code,

            supplierName:
                supplier.businessName,

            paymentDate:
                draft.paymentDate,

            amount,

            method:
                draft.method,

            reference:
                normalizeOptional(
                    draft.reference,
                ),

            notes:
                normalizeOptional(
                    draft.notes,
                ),

            allocations,

            status:
                "POSTED",

            createdAt:
                now,

            updatedAt:
                now,
        };

        supplierPayments = [
            payment,
            ...supplierPayments,
        ];

        emitChange();

        return payment;
    },

    reverse(
        supplierPaymentId:
            string,
        reason: string,
    ): SupplierPayment {
        const payment =
            supplierPayments.find(
                (item) =>
                    item.id ===
                    supplierPaymentId,
            );

        if (!payment) {
            throw new Error(
                "Supplier payment was not found.",
            );
        }

        if (
            payment.status ===
            "REVERSED"
        ) {
            throw new Error(
                "This supplier payment has already been reversed.",
            );
        }

        const normalizedReason =
            reason.trim();

        if (
            normalizedReason.length <
            3
        ) {
            throw new Error(
                "A reversal reason of at least 3 characters is required.",
            );
        }

        /**
         * Validate every allocation before
         * changing any bill.
         */
        for (
            const allocation of
            payment.allocations
        ) {
            const bill =
                supplierBillRepository.getById(
                    allocation.supplierBillId,
                );

            if (!bill) {
                throw new Error(
                    `${allocation.billNumber} was not found.`,
                );
            }

            if (
                bill.status ===
                "VOID"
            ) {
                throw new Error(
                    `${allocation.billNumber} is void. The payment cannot be reversed.`,
                );
            }

            if (
                bill.totals
                    .amountPaid <
                allocation.amount
            ) {
                throw new Error(
                    `${allocation.billNumber} does not contain enough paid value to reverse this payment.`,
                );
            }
        }

        for (
            const allocation of
            payment.allocations
        ) {
            supplierBillRepository.reversePayment(
                allocation.supplierBillId,
                allocation.amount,
            );
        }

        const now =
            new Date().toISOString();

        const updated:
            SupplierPayment = {
            ...payment,

            status:
                "REVERSED",

            reversedAt:
                now,

            reversalReason:
                normalizedReason,

            updatedAt:
                now,
        };

        supplierPayments =
            supplierPayments.map(
                (item) =>
                    item.id ===
                        supplierPaymentId
                        ? updated
                        : item,
            );

        emitChange();

        return updated;
    },
};

function createPaymentNumber(
    paymentDate: string,
) {
    const year =
        paymentDate.slice(
            0,
            4,
        );

    const prefix =
        `SPAY-${year}-`;

    const numbers =
        supplierPayments
            .filter(
                (payment) =>
                    payment.paymentNumber.startsWith(
                        prefix,
                    ),
            )
            .map(
                (payment) =>
                    Number.parseInt(
                        payment.paymentNumber.slice(
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

function formatMoney(
    value: number,
) {
    return new Intl.NumberFormat(
        "en-AU",
        {
            style:
                "currency",

            currency:
                "AUD",
        },
    ).format(value);
}