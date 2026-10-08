import type {
    SupplierBill,
} from "../types/supplierBill";

import type {
    SupplierPayment,
} from "../types/supplierPayment";

import type {
    SupplierCreditAllocation,
} from "../types/supplierCredit";

export interface SupplierBillBalanceAsAt {
    total: number;

    amountPaid: number;
    amountCredited: number;

    amountDue: number;
}

export function calculateSupplierBillBalanceAsAt(
    bill: SupplierBill,
    payments: SupplierPayment[],
    creditAllocations:
        SupplierCreditAllocation[],
    asOfDate: string,
): SupplierBillBalanceAsAt {
    if (
        bill.billDate >
        asOfDate
    ) {
        return {
            total: 0,
            amountPaid: 0,
            amountCredited: 0,
            amountDue: 0,
        };
    }

    if (
        bill.status ===
        "VOID" &&
        bill.voidedAt &&
        toDateKey(
            bill.voidedAt,
        ) <= asOfDate
    ) {
        return {
            total: 0,
            amountPaid: 0,
            amountCredited: 0,
            amountDue: 0,
        };
    }

    const amountPaid =
        roundCurrency(
            payments.reduce(
                (
                    total,
                    payment,
                ) => {
                    if (
                        payment.supplierId !==
                        bill.supplierId ||
                        payment.paymentDate >
                        asOfDate
                    ) {
                        return total;
                    }

                    /*
                     * A reversed payment existed
                     * until its reversal date.
                     */
                    if (
                        payment.status ===
                        "REVERSED" &&
                        payment.reversedAt &&
                        toDateKey(
                            payment.reversedAt,
                        ) <= asOfDate
                    ) {
                        return total;
                    }

                    const allocated =
                        payment.allocations
                            .filter(
                                (
                                    allocation,
                                ) =>
                                    allocation.supplierBillId ===
                                    bill.id,
                            )
                            .reduce(
                                (
                                    amount,
                                    allocation,
                                ) =>
                                    amount +
                                    allocation.amount,
                                0,
                            );

                    return (
                        total +
                        allocated
                    );
                },
                0,
            ),
        );

    const amountCredited =
        roundCurrency(
            creditAllocations.reduce(
                (
                    total,
                    allocation,
                ) => {
                    if (
                        allocation.supplierBillId !==
                        bill.id ||
                        allocation.allocationDate >
                        asOfDate
                    ) {
                        return total;
                    }

                    /*
                     * A reversed allocation was
                     * active until its reversal
                     * date.
                     */
                    if (
                        allocation.status ===
                        "REVERSED" &&
                        allocation.reversedAt &&
                        toDateKey(
                            allocation.reversedAt,
                        ) <= asOfDate
                    ) {
                        return total;
                    }

                    return (
                        total +
                        allocation.amount
                    );
                },
                0,
            ),
        );

    const total =
        roundCurrency(
            bill.totals.total,
        );

    return {
        total,

        amountPaid,

        amountCredited,

        amountDue:
            roundCurrency(
                Math.max(
                    0,
                    total -
                    amountPaid -
                    amountCredited,
                ),
            ),
    };
}

function toDateKey(
    value: string,
) {
    const date =
        new Date(
            value,
        );

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return value.slice(
            0,
            10,
        );
    }

    const parts =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone:
                    "Pacific/Auckland",

                year:
                    "numeric",

                month:
                    "2-digit",

                day:
                    "2-digit",
            },
        ).formatToParts(
            date,
        );

    const year =
        parts.find(
            (part) =>
                part.type ===
                "year",
        )?.value;

    const month =
        parts.find(
            (part) =>
                part.type ===
                "month",
        )?.value;

    const day =
        parts.find(
            (part) =>
                part.type ===
                "day",
        )?.value;

    if (
        !year ||
        !month ||
        !day
    ) {
        return value.slice(
            0,
            10,
        );
    }

    return `${year}-${month}-${day}`;
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