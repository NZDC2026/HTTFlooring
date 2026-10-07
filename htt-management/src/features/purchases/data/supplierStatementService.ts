import type {
    SupplierBill,
} from "../types/supplierBill";

import type {
    SupplierPayment,
} from "../types/supplierPayment";

import type {
    SupplierStatement,
    SupplierStatementEntry,
} from "../types/supplierStatement";

interface BuildSupplierStatementInput {
    supplierId: string;

    bills: SupplierBill[];

    payments:
    SupplierPayment[];

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

    debit: number;
    credit: number;
}

export function buildSupplierStatement({
    supplierId,
    bills,
    payments,
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

    /*
     * SUPPLIER BILLS
     *
     * Supplier Bill creates Accounts Payable.
     *
     * Credit:
     *     We owe the supplier more.
     *
     * Current Supplier Bill implementation
     * does not yet expose a bill-void
     * lifecycle event/date.
     *
     * Therefore VOID bills are excluded
     * from the statement.
     */
    for (
        const bill of
        bills
    ) {
        if (
            bill.supplierId !==
            supplierId ||
            bill.billDate >
            toDate ||
            bill.status ===
            "VOID"
        ) {
            continue;
        }

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

    return a.sortDateTime.localeCompare(
        b.sortDateTime,
    );
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
    return (
        Math.round(
            (value +
                Number.EPSILON) *
            100,
        ) / 100
    );
}