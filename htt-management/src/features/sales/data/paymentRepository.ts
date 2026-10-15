import { registerRepository } from "../../security/repositoryHost";
import { requireDateKey } from "../../../lib/businessDate";
import { financialStateStorage } from "../../../lib/persistence/financialStateStorage";
import { financialOperationJournal } from "../../../lib/persistence/financialOperationJournal";

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
    financialStateStorage.read().payments;

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
    /** Stable ID supplied by the caller for retry protection. */
    operationId?: string;
    /** Caller posts GL before marking this operation completed. */
    deferOperationCompletion?: boolean;
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

        requireDateKey(input.paymentDate, "Payment date");
        if (input.paymentDate < bankAccount.openingBalanceDate) throw new Error("Payment date cannot precede the bank opening balance date.");
        if (roundCurrency(input.amount) <= 0) throw new Error("Payment amount rounds to zero.");
        const operationId = input.operationId?.trim();
        if (input.operationId !== undefined && !operationId) throw new Error("Operation ID cannot be empty");
        if (operationId) {
            const attempt = financialOperationJournal.begin(operationId, "CUSTOMER_PAYMENT", JSON.stringify({
                customerId: input.customerId, invoiceId: input.invoiceId, paymentDate: input.paymentDate,
                amount: roundCurrency(input.amount), method: input.method, bankAccountId: input.bankAccountId,
                reference: normalizeOptional(input.reference), notes: normalizeOptional(input.notes),
            }));
            if (attempt.status === "already_completed") {
                const existing = payments.find(p => p.id === attempt.operation.resultId);
                if (existing) return existing;
                throw new Error("Completed payment is not available in memory; manual review required.");
            }
            if (attempt.status === "needs_review") throw new Error("Payment operation requires manual review before retry.");
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

        // Bind the identity durably before writing the payment snapshot.
        if (operationId) financialOperationJournal.bindResult(operationId, payment.id);

        const nextPayments = [payment, ...payments];
        financialStateStorage.update("payments", nextPayments);
        payments = nextPayments;

        if (operationId && !input.deferOperationCompletion) {
            try { financialOperationJournal.complete(operationId, payment.id); }
            catch (error) {
                try { financialOperationJournal.flagForReview(operationId, "Payment created but completion could not be confirmed"); } catch { /* preserve original error */ }
                throw error;
            }
        }
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

        const nextPayments = payments.map(item => item.id === paymentId ? updated : item);
        financialStateStorage.update("payments", nextPayments);
        payments = nextPayments;

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
registerRepository("customerPayments", {
    repository: paymentRepository, read: "sales.read",
    commands: {"create": null, "reverse": null},
    snapshot: () => ({ payments }),
    restore: value => { payments = value.payments;  },
    publish: () => listeners.forEach(listener => listener()),
});
