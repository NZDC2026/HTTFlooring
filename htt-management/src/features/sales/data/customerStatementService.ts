import type {
    Invoice,
    SalesDocument,
} from "../types/salesDocument";

import type {
    Payment,
} from "../types/payment";

import type {
    CustomerStatement,
    StatementEntry,
} from "../types/customerStatement";

interface BuildCustomerStatementInput {
    customerId: string;

    documents: SalesDocument[];

    payments: Payment[];

    fromDate: string;
    toDate: string;
}

interface PendingStatementEntry {
    id: string;

    date: string;

    sortDateTime: string;

    type:
    StatementEntry["type"];

    reference: string;

    description: string;

    invoiceId?: string;
    paymentId?: string;

    debit: number;
    credit: number;
}

export function buildCustomerStatement({
    customerId,
    documents,
    payments,
    fromDate,
    toDate,
}: BuildCustomerStatementInput): CustomerStatement {
    if (fromDate > toDate) {
        throw new Error(
            "Statement from date cannot be after to date.",
        );
    }

    const invoices =
        documents.filter(
            (
                document,
            ): document is Invoice =>
                document.type ===
                "INVOICE" &&
                document.customerId ===
                customerId &&
                document.status !==
                "VOID" &&
                document.documentDate <=
                toDate,
        );

    const invoiceMap =
        new Map(
            invoices.map(
                (invoice) => [
                    invoice.id,
                    invoice,
                ],
            ),
        );

    const allEntries:
        PendingStatementEntry[] =
        [];

    /*
     * INVOICES
     */
    for (
        const invoice of invoices
    ) {
        allEntries.push({
            id:
                `invoice-${invoice.id}`,

            date:
                invoice.documentDate,

            sortDateTime:
                `${invoice.documentDate}T00:00:00.000Z`,

            type:
                "INVOICE",

            reference:
                invoice.documentNumber,

            description:
                "Sales invoice",

            invoiceId:
                invoice.id,

            debit:
                roundCurrency(
                    invoice.totals.total,
                ),

            credit: 0,
        });
    }

    /*
     * PAYMENTS + REVERSALS
     */
    for (
        const payment of payments
    ) {
        if (
            payment.customerId !==
            customerId ||
            payment.paymentDate >
            toDate
        ) {
            continue;
        }

        const invoice =
            invoiceMap.get(
                payment.invoiceId,
            );

        const invoiceReference =
            invoice?.documentNumber;

        allEntries.push({
            id:
                `payment-${payment.id}`,

            date:
                payment.paymentDate,

            sortDateTime:
                payment.createdAt,

            type:
                "PAYMENT",

            reference:
                payment.paymentNumber,

            description:
                invoiceReference
                    ? `Payment received — ${invoiceReference}`
                    : "Payment received",

            invoiceId:
                payment.invoiceId,

            paymentId:
                payment.id,

            debit: 0,

            credit:
                roundCurrency(
                    payment.amount,
                ),
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
                        `payment-reversal-${payment.id}`,

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

                    invoiceId:
                        payment.invoiceId,

                    paymentId:
                        payment.id,

                    debit:
                        roundCurrency(
                            payment.amount,
                        ),

                    credit: 0,
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
                        entry.debit -
                        entry.credit,
                    0,
                ),
        );

    /*
     * PERIOD ACTIVITY
     */
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
        StatementEntry[] =
        periodEntries.map(
            (entry) => {
                runningBalance =
                    roundCurrency(
                        runningBalance +
                        entry.debit -
                        entry.credit,
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

                    invoiceId:
                        entry.invoiceId,

                    paymentId:
                        entry.paymentId,

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
            totalDebits -
            totalCredits,
        );

    return {
        customerId,

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

function compareEntries(
    a: PendingStatementEntry,
    b: PendingStatementEntry,
) {
    const dateCompare =
        a.date.localeCompare(
            b.date,
        );

    if (
        dateCompare !== 0
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
    return Math.round(
        (value +
            Number.EPSILON) *
        100,
    ) / 100;
}