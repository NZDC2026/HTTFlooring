import type {
    Invoice,
} from "../types/salesDocument";

import type {
    Payment,
} from "../types/payment";

import type {
    CreditAllocation,
} from "../types/creditNote";

export interface InvoiceBalanceAsAt {
    invoiceId: string;

    asOfDate: string;

    invoiceTotal: number;

    amountPaid: number;
    amountCredited: number;

    amountDue: number;

    appliedPaymentCount: number;
    appliedCreditCount: number;
}

export function calculateInvoiceBalanceAsAt(
    invoice: Invoice,
    payments: Payment[],
    creditAllocations:
        CreditAllocation[],
    asOfDate: string,
): InvoiceBalanceAsAt {
    /*
     * The invoice did not exist yet.
     */
    if (
        invoice.documentDate >
        asOfDate
    ) {
        return {
            invoiceId:
                invoice.id,

            asOfDate,

            invoiceTotal:
                roundCurrency(
                    invoice.totals.total,
                ),

            amountPaid: 0,

            amountCredited: 0,

            amountDue: 0,

            appliedPaymentCount: 0,

            appliedCreditCount: 0,
        };
    }

    /*
     * The invoice existed historically, but had
     * already been voided by the selected date.
     *
     * Example:
     *
     * Invoice date: 01 Sep
     * Void date:    10 Oct
     *
     * As At 09 Oct -> invoice still exists
     * As At 10 Oct -> invoice no longer contributes
     */
    if (
        invoice.voidedAt &&
        asOfDate >=
        toDateKey(
            invoice.voidedAt,
        )
    ) {
        return {
            invoiceId:
                invoice.id,

            asOfDate,

            invoiceTotal:
                roundCurrency(
                    invoice.totals.total,
                ),

            amountPaid: 0,

            amountCredited: 0,

            amountDue: 0,

            appliedPaymentCount: 0,

            appliedCreditCount: 0,
        };
    }

    const invoicePayments =
        payments.filter(
            (payment) =>
                payment.invoiceId ===
                invoice.id &&
                payment.customerId ===
                invoice.customerId &&
                payment.paymentDate <=
                asOfDate,
        );

    const effectivePayments =
        invoicePayments.filter(
            (payment) =>
                isPaymentEffectiveAsAt(
                    payment,
                    asOfDate,
                ),
        );

    const amountPaid =
        roundCurrency(
            effectivePayments.reduce(
                (
                    total,
                    payment,
                ) =>
                    total +
                    payment.amount,
                0,
            ),
        );

    const effectiveCreditAllocations =
        creditAllocations.filter(
            (allocation) =>
                allocation.invoiceId ===
                invoice.id &&
                allocation.customerId ===
                invoice.customerId &&
                allocation.allocationDate <=
                asOfDate &&
                isCreditAllocationEffectiveAsAt(
                    allocation,
                    asOfDate,
                ),
        );

    const amountCredited =
        roundCurrency(
            effectiveCreditAllocations.reduce(
                (
                    total,
                    allocation,
                ) =>
                    total +
                    allocation.amount,
                0,
            ),
        );

    const invoiceTotal =
        roundCurrency(
            invoice.totals.total,
        );

    const amountDue =
        roundCurrency(
            Math.max(
                0,
                invoiceTotal -
                amountPaid -
                amountCredited,
            ),
        );

    return {
        invoiceId:
            invoice.id,

        asOfDate,

        invoiceTotal,

        amountPaid,

        amountCredited,

        amountDue,

        appliedPaymentCount:
            effectivePayments.length,

        appliedCreditCount:
            effectiveCreditAllocations.length,
    };
}

export function isPaymentEffectiveAsAt(
    payment: Payment,
    asOfDate: string,
) {
    /*
     * Payment had not happened yet.
     */
    if (
        payment.paymentDate >
        asOfDate
    ) {
        return false;
    }

    /*
     * A currently RECEIVED payment is effective
     * for every date on/after paymentDate.
     */
    if (
        payment.status ===
        "RECEIVED"
    ) {
        return true;
    }

    /*
     * A REVERSED payment was still effective
     * before its reversal date.
     *
     * Example:
     *
     * Payment:  20 Sep
     * Reversal: 10 Oct
     *
     * As At 30 Sep -> payment counts
     * As At 10 Oct -> payment no longer counts
     */
    if (
        payment.status ===
        "REVERSED"
    ) {
        if (
            !payment.reversedAt
        ) {
            return false;
        }

        const reversalDate =
            toDateKey(
                payment.reversedAt,
            );

        return asOfDate <
            reversalDate;
    }

    return false;
}

export function isCreditAllocationEffectiveAsAt(
    allocation:
        CreditAllocation,

    asOfDate: string,
) {
    if (
        allocation.allocationDate >
        asOfDate
    ) {
        return false;
    }

    if (
        allocation.status ===
        "APPLIED"
    ) {
        return true;
    }

    if (
        allocation.status ===
        "REVERSED"
    ) {
        if (
            !allocation.reversedAt
        ) {
            return false;
        }

        return asOfDate <
            toDateKey(
                allocation.reversedAt,
            );
    }

    return false;
}

function toDateKey(
    value: string,
) {
    return value.slice(
        0,
        10,
    );
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