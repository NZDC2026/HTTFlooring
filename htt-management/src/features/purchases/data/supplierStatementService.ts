import type {
    SupplierBill,
} from "../types/supplierBill";

import type {
    SupplierPayment,
} from "../types/supplierPayment";

import type {
    SupplierStatement,
    SupplierStatementEntry,
    SupplierStatementEntryType,
} from "../types/supplierStatement";

import type {
    SupplierCredit,
} from "../types/supplierCredit";

interface BuildSupplierStatementInput {
    supplierId: string;

    bills: SupplierBill[];

    payments:
    SupplierPayment[];

    credits:
    SupplierCredit[];

    fromDate: string;
    toDate: string;
}

interface PendingStatementEntry {
    id: string;

    date: string;

    sortDateTime: string;

    type:
    SupplierStatementEntry["type"];

    reference: string;

    description: string;

    supplierBillId?: string;
    supplierPaymentId?: string;
    supplierCreditId?: string;

    debit: number;
    credit: number;
}

export function buildSupplierStatement({
    supplierId,
    bills,
    payments,
    credits,
    fromDate,
    toDate,
}: BuildSupplierStatementInput): SupplierStatement {
    if (
        fromDate >
        toDate
    ) {
        throw new Error(
            "Statement from date cannot be after to date.",
        );
    }

    const allEntries:
        PendingStatementEntry[] =
        [];

    for (
        const bill of
        bills
    ) {
        if (
            bill.supplierId !==
            supplierId ||
            bill.billDate >
            toDate
        ) {
            continue;
        }

        /*
         * Original Supplier Bill remains in
         * accounting history even after Void.
         */
        allEntries.push({
            id:
                `supplier-bill-${bill.id}`,

            date:
                bill.billDate,

            sortDateTime:
                bill.createdAt,

            type:
                "BILL",

            reference:
                bill.billNumber,

            description:
                bill.supplierInvoiceNumber
                    ? `Supplier bill — ${bill.supplierInvoiceNumber}`
                    : "Supplier bill",

            supplierBillId:
                bill.id,

            debit: 0,

            credit:
                roundCurrency(
                    bill.totals
                        .total,
                ),
        });

        /*
         * Void reverses the Supplier Bill on the
         * actual void date.
         *
         * Original Bill:
         *     Credit / AP increases
         *
         * Bill Void:
         *     Debit / AP decreases
         */
        if (
            bill.status ===
            "VOID" &&
            bill.voidedAt
        ) {
            const voidDate =
                toDateKey(
                    bill.voidedAt,
                );

            if (
                voidDate <=
                toDate
            ) {
                allEntries.push({
                    id:
                        `supplier-bill-void-${bill.id}`,

                    date:
                        voidDate,

                    sortDateTime:
                        bill.voidedAt,

                    type:
                        "BILL_VOID",

                    reference:
                        `${bill.billNumber} VOID`,

                    description:
                        bill.voidReason
                            ? `Supplier bill void — ${bill.voidReason}`
                            : "Supplier bill void",

                    supplierBillId:
                        bill.id,

                    debit:
                        roundCurrency(
                            bill.totals
                                .total,
                        ),

                    credit: 0,
                });
            }
        }
    }

    /*
     * SUPPLIER PAYMENTS
     *
     * Payment reduces Accounts Payable.
     *
     * Debit:
     *     We owe the supplier less.
     *
     * A REVERSED payment still existed
     * historically on its payment date.
     * Therefore the original payment stays
     * in the statement and the reversal
     * creates the opposite accounting entry
     * on the reversal date.
     */
    for (
        const payment of
        payments
    ) {
        if (
            payment.supplierId !==
            supplierId ||
            payment.paymentDate >
            toDate
        ) {
            continue;
        }

        allEntries.push({
            id:
                `supplier-payment-${payment.id}`,

            date:
                payment.paymentDate,

            sortDateTime:
                payment.createdAt,

            type:
                "PAYMENT",

            reference:
                payment.paymentNumber,

            description:
                buildPaymentDescription(
                    payment,
                ),

            supplierPaymentId:
                payment.id,

            debit:
                roundCurrency(
                    payment.amount,
                ),

            credit: 0,
        });

        if (
            payment.status ===
            "REVERSED" &&
            payment.reversedAt
        ) {
            const reversalDate =
                toDateKey(
                    payment.reversedAt,
                );

            if (
                reversalDate <=
                toDate
            ) {
                allEntries.push({
                    id:
                        `supplier-payment-reversal-${payment.id}`,

                    date:
                        reversalDate,

                    sortDateTime:
                        payment.reversedAt,

                    type:
                        "PAYMENT_REVERSAL",

                    reference:
                        `${payment.paymentNumber} REV`,

                    description:
                        payment.reversalReason
                            ? `Payment reversal — ${payment.reversalReason}`
                            : "Payment reversal",

                    supplierPaymentId:
                        payment.id,

                    debit: 0,

                    credit:
                        roundCurrency(
                            payment.amount,
                        ),
                });
            }
        }
    }

    /*
     * SUPPLIER CREDITS
     *
     * Issuing Supplier Credit immediately reduces
     * the overall Accounts Payable balance.
     *
     * Debit = we owe the supplier less.
     *
     * Credit allocation is deliberately NOT added
     * to the statement because allocation only
     * assigns existing credit to a bill.
     */
    for (
        const credit of
        credits
    ) {
        if (
            credit.supplierId !==
            supplierId ||
            credit.creditDate >
            toDate
        ) {
            continue;
        }

        allEntries.push({
            id:
                `supplier-credit-${credit.id}`,

            date:
                credit.creditDate,

            sortDateTime:
                credit.issuedAt,

            type:
                "SUPPLIER_CREDIT",

            reference:
                credit.creditNumber,

            description:
                credit.reason
                    ? `Supplier credit — ${credit.reason}`
                    : "Supplier credit",

            supplierCreditId:
                credit.id,

            debit:
                roundCurrency(
                    credit.totals.total,
                ),

            credit: 0,
        });

        /*
         * VOID restores Accounts Payable on the
         * actual void date.
         */
        if (
            credit.status ===
            "VOID" &&
            credit.voidedAt
        ) {
            const voidDate =
                toDateKey(
                    credit.voidedAt,
                );

            if (
                voidDate <=
                toDate
            ) {
                allEntries.push({
                    id:
                        `supplier-credit-void-${credit.id}`,

                    date:
                        voidDate,

                    sortDateTime:
                        credit.voidedAt,

                    type:
                        "SUPPLIER_CREDIT_VOID",

                    reference:
                        `${credit.creditNumber} VOID`,

                    description:
                        credit.voidReason
                            ? `Supplier credit void — ${credit.voidReason}`
                            : "Supplier credit void",

                    supplierCreditId:
                        credit.id,

                    debit: 0,

                    credit:
                        roundCurrency(
                            credit.totals.total,
                        ),
                });
            }
        }
    }

    allEntries.sort(
        compareEntries,
    );

    /*
     * OPENING BALANCE
     *
     * Everything strictly before fromDate.
     *
     * AP direction:
     *
     * Credit increases payable.
     * Debit decreases payable.
     */
    const openingBalance =
        roundCurrency(
            allEntries
                .filter(
                    (entry) =>
                        entry.date <
                        fromDate,
                )
                .reduce(
                    (
                        balance,
                        entry,
                    ) =>
                        balance +
                        entry.credit -
                        entry.debit,
                    0,
                ),
        );

    const periodEntries =
        allEntries.filter(
            (entry) =>
                entry.date >=
                fromDate &&
                entry.date <=
                toDate,
        );

    let runningBalance =
        openingBalance;

    const statementEntries:
        SupplierStatementEntry[] =
        periodEntries.map(
            (entry) => {
                runningBalance =
                    roundCurrency(
                        runningBalance +
                        entry.credit -
                        entry.debit,
                    );

                return {
                    id:
                        entry.id,

                    date:
                        entry.date,

                    type:
                        entry.type,

                    reference:
                        entry.reference,

                    description:
                        entry.description,

                    supplierBillId:
                        entry.supplierBillId,

                    supplierPaymentId:
                        entry.supplierPaymentId,

                    supplierCreditId:
                        entry.supplierCreditId,

                    debit:
                        entry.debit,

                    credit:
                        entry.credit,

                    balance:
                        runningBalance,
                };
            },
        );

    const totalDebits =
        roundCurrency(
            statementEntries.reduce(
                (
                    total,
                    entry,
                ) =>
                    total +
                    entry.debit,
                0,
            ),
        );

    const totalCredits =
        roundCurrency(
            statementEntries.reduce(
                (
                    total,
                    entry,
                ) =>
                    total +
                    entry.credit,
                0,
            ),
        );

    const closingBalance =
        roundCurrency(
            openingBalance +
            totalCredits -
            totalDebits,
        );

    return {
        supplierId,

        fromDate,
        toDate,

        openingBalance,

        totalDebits,

        totalCredits,

        closingBalance,

        entries:
            statementEntries,
    };
}

function buildPaymentDescription(
    payment:
        SupplierPayment,
) {
    if (
        payment.allocations.length ===
        1
    ) {
        return `Supplier payment — ${payment.allocations[0].billNumber}`;
    }

    return `Supplier payment — ${payment.allocations.length} bills`;
}

function compareEntries(
    a: PendingStatementEntry,
    b: PendingStatementEntry,
) {
    const dateCompare =
        a.date.localeCompare(
            b.date,
        );

    if (
        dateCompare !==
        0
    ) {
        return dateCompare;
    }

    const typeOrder:
        Record<
            SupplierStatementEntryType,
            number
        > = {
        BILL: 10,
        PAYMENT: 20,
        SUPPLIER_CREDIT: 30,
        PAYMENT_REVERSAL: 40,
        SUPPLIER_CREDIT_VOID: 50,
        BILL_VOID: 60,
    };

    const typeCompare =
        typeOrder[
        a.type
        ] -
        typeOrder[
        b.type
        ];

    if (
        typeCompare !==
        0
    ) {
        return typeCompare;
    }

    const timeCompare =
        a.sortDateTime.localeCompare(
            b.sortDateTime,
        );

    if (
        timeCompare !==
        0
    ) {
        return timeCompare;
    }

    return a.id.localeCompare(
        b.id,
    );
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