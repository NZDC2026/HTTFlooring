import type {
    Invoice,
    SalesDocument,
} from "../types/salesDocument";

import type {
    Payment,
} from "../types/payment";

import type {
    CreditNote,
} from "../types/creditNote";

import type {
    CustomerStatement,
    StatementEntry,
} from "../types/customerStatement";

interface BuildCustomerStatementInput {
    customerId: string;

    documents: SalesDocument[];

    payments: Payment[];

    creditNotes: CreditNote[];

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
    creditNoteId?: string;

    debit: number;
    credit: number;
}

export function buildCustomerStatement({
    customerId,
    documents,
    payments,
    creditNotes,
    fromDate,
    toDate,
}: BuildCustomerStatementInput): CustomerStatement {
    if (fromDate > toDate) {
        throw new Error(
            "Statement from date cannot be after to date.",
        );
    }

    /*
     * IMPORTANT:
     *
     * Do NOT filter current VOID status here.
     *
     * A currently void invoice may still have existed
     * historically before its void date.
     */
    const invoices =
        documents.filter(
            (
                document,
            ): document is Invoice =>
                document.type ===
                "INVOICE" &&
                document.customerId ===
                customerId &&
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

    const customerCreditNotes =
        creditNotes.filter(
            (creditNote) =>
                creditNote.customerId ===
                customerId &&
                creditNote.creditDate <=
                toDate &&
                creditNote.status !==
                "DRAFT",
        );

    const allEntries:
        PendingStatementEntry[] =
        [];

    /*
     * INVOICES
     *
     * Invoice creates Accounts Receivable.
     *
     * Debit:
     *     Customer owes us more.
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

        /*
         * INVOICE VOID
         *
         * Do not delete the historical invoice.
         *
         * Instead reverse the original invoice on
         * the actual void date.
         */
        if (
            invoice.voidedAt
        ) {
            const voidDate =
                toDateKey(
                    invoice.voidedAt,
                );

            if (
                voidDate <=
                toDate
            ) {
                allEntries.push({
                    id:
                        `invoice-void-${invoice.id}`,

                    date:
                        voidDate,

                    sortDateTime:
                        invoice.voidedAt,

                    type:
                        "INVOICE_VOID",

                    reference:
                        `${invoice.documentNumber} VOID`,

                    description:
                        invoice.voidReason
                            ? `Invoice void — ${invoice.voidReason}`
                            : "Invoice void",

                    invoiceId:
                        invoice.id,

                    debit: 0,

                    credit:
                        roundCurrency(
                            invoice.totals.total,
                        ),
                });
            }
        }
    }

    /*
     * PAYMENTS + PAYMENT REVERSALS
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

        /*
         * A reversed payment still existed
         * historically before the reversal.
         *
         * Therefore:
         *
         * Payment date  -> Credit
         * Reversal date -> Debit
         */
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

    /*
     * CREDIT NOTES
     *
     * A Credit Note creates customer credit
     * immediately when issued.
     *
     * It therefore reduces the customer's
     * overall Accounts Receivable balance.
     *
     * IMPORTANT:
     *
     * Credit allocations are deliberately NOT
     * added to this statement.
     *
     * Allocation only assigns existing customer
     * credit to an invoice. Adding allocation
     * here would double-count the credit.
     */
    for (
        const creditNote of
        customerCreditNotes
    ) {
        allEntries.push({
            id:
                `credit-note-${creditNote.id}`,

            date:
                creditNote.creditDate,

            sortDateTime:
                creditNote.issuedAt ??
                creditNote.createdAt,

            type:
                "CREDIT_NOTE",

            reference:
                creditNote.creditNoteNumber,

            description:
                creditNote.reason
                    ? `Credit note — ${creditNote.reason}`
                    : "Credit note",

            invoiceId:
                creditNote.sourceInvoiceId,

            creditNoteId:
                creditNote.id,

            debit: 0,

            credit:
                roundCurrency(
                    creditNote.totals.total,
                ),
        });

        /*
         * CREDIT NOTE VOID
         *
         * Same historical model as payment
         * reversal and invoice void.
         *
         * Original credit remains on its original
         * date and is reversed on the void date.
         */
        if (
            creditNote.voidedAt
        ) {
            const voidDate =
                toDateKey(
                    creditNote.voidedAt,
                );

            if (
                voidDate <=
                toDate
            ) {
                allEntries.push({
                    id:
                        `credit-note-void-${creditNote.id}`,

                    date:
                        voidDate,

                    sortDateTime:
                        creditNote.voidedAt,

                    type:
                        "CREDIT_NOTE_VOID",

                    reference:
                        `${creditNote.creditNoteNumber} VOID`,

                    description:
                        creditNote.voidReason
                            ? `Credit note void — ${creditNote.voidReason}`
                            : "Credit note void",

                    invoiceId:
                        creditNote.sourceInvoiceId,

                    creditNoteId:
                        creditNote.id,

                    debit:
                        roundCurrency(
                            creditNote.totals.total,
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
     *
     * This means invoices, payments,
     * reversals, credit notes and voids all
     * participate in historical opening balance.
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

                    creditNoteId:
                        entry.creditNoteId,

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

    /*
     * ISO timestamps give deterministic ordering
     * when multiple accounting events happen on
     * the same date.
     */
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