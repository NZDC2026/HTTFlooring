import { mockPayments } from "./mockPayments";

import type {
    Payment,
    PaymentMethod,
} from "../types/payment";

import {
    bankAccountRepository,
} from "../../banking/data/bankAccountRepository";

type Listener = () => void;

const listeners =
    new Set<Listener>();

let payments: Payment[] =
    structuredClone(
        mockPayments,
    );

function emitChange() {
    listeners.forEach(
        (listener) =>
            listener(),
    );
}

function createId() {
    return `payment_${crypto.randomUUID()}`;
}

function getNextPaymentNumber() {
    const year =
        new Date().getFullYear();

    const prefix =
        `PAY-${year}-`;

    const numbers =
        payments
            .map(
                (payment) =>
                    payment.paymentNumber,
            )
            .filter(
                (number) =>
                    number.startsWith(
                        prefix,
                    ),
            )
            .map((number) =>
                Number(
                    number.slice(
                        prefix.length,
                    ),
                ),
            )
            .filter(
                (number) =>
                    Number.isFinite(
                        number,
                    ),
            );

    const next =
        numbers.length > 0
            ? Math.max(
                ...numbers,
            ) + 1
            : 1;

    return `${prefix}${String(
        next,
    ).padStart(4, "0")}`;
}

export interface CreatePaymentInput {
    customerId: string;

    invoiceId: string;

    paymentDate: string;

    amount: number;

    method: PaymentMethod;

    bankAccountId: string;

    reference?: string;
    notes?: string;
}

export const paymentRepository = {
    subscribe(
        listener: Listener,
    ) {
        listeners.add(listener);

        return () => {
            listeners.delete(
                listener,
            );
        };
    },

    getSnapshot():
        Payment[] {
        return payments;
    },

    getAll():
        Payment[] {
        return payments;
    },

    getById(
        paymentId: string,
    ) {
        return payments.find(
            (payment) =>
                payment.id ===
                paymentId,
        );
    },

    getByCustomer(
        customerId: string,
    ) {
        return payments.filter(
            (payment) =>
                payment.customerId ===
                customerId,
        );
    },

    getByInvoice(
        invoiceId: string,
    ) {
        return payments.filter(
            (payment) =>
                payment.invoiceId ===
                invoiceId,
        );
    },

    create(
        input:
            CreatePaymentInput,
    ): Payment {
        if (
            !input.customerId
        ) {
            throw new Error(
                "Customer is required",
            );
        }

        if (
            !input.invoiceId
        ) {
            throw new Error(
                "Invoice is required",
            );
        }

        if (
            !input.paymentDate
        ) {
            throw new Error(
                "Payment date is required",
            );
        }

        if (
            !input.bankAccountId
        ) {
            throw new Error(
                "Bank account is required",
            );
        }

        const bankAccount =
            bankAccountRepository.getById(
                input.bankAccountId,
            );

        if (!bankAccount) {
            throw new Error(
                "Bank account was not found",
            );
        }

        if (
            !bankAccount.active
        ) {
            throw new Error(
                "The selected bank account is inactive",
            );
        }

        if (
            !Number.isFinite(
                input.amount,
            ) ||
            input.amount <= 0
        ) {
            throw new Error(
                "Payment amount must be greater than zero",
            );
        }

        const now =
            new Date().toISOString();

        const payment:
            Payment = {
            id: createId(),

            paymentNumber:
                getNextPaymentNumber(),

            customerId:
                input.customerId,

            invoiceId:
                input.invoiceId,

            paymentDate:
                input.paymentDate,

            amount:
                roundCurrency(
                    input.amount,
                ),

            method:
                input.method,

            bankAccountId:
                bankAccount.id,

            reference:
                normalizeOptional(
                    input.reference,
                ),

            notes:
                normalizeOptional(
                    input.notes,
                ),

            status:
                "RECEIVED",

            createdAt: now,
            updatedAt: now,
        };

        payments = [
            payment,
            ...payments,
        ];

        emitChange();

        return payment;
    },

    reverse(
        paymentId: string,
        reason: string,
    ): Payment {
        const payment =
            payments.find(
                (item) =>
                    item.id ===
                    paymentId,
            );

        if (!payment) {
            throw new Error(
                `Payment ${paymentId} was not found`,
            );
        }

        if (
            payment.status ===
            "REVERSED"
        ) {
            throw new Error(
                "This payment has already been reversed",
            );
        }

        const normalizedReason =
            reason.trim();

        if (
            normalizedReason.length <
            3
        ) {
            throw new Error(
                "A reversal reason is required",
            );
        }

        const now =
            new Date().toISOString();

        const updated:
            Payment = {
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

        payments =
            payments.map(
                (item) =>
                    item.id ===
                        paymentId
                        ? updated
                        : item,
            );

        emitChange();

        return updated;
    },

    getReceivedByInvoice(
        invoiceId: string,
    ): Payment[] {
        return payments.filter(
            (payment) =>
                payment.invoiceId ===
                invoiceId &&
                payment.status ===
                "RECEIVED",
        );
    },
};

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
    return Math.round(
        (value +
            Number.EPSILON) *
        100,
    ) / 100;
}