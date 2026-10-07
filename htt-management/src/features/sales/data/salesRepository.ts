import {
    mockInvoices,
    mockQuotes,
    mockSalesOrders,
} from "./mockSalesDocuments";

import type {
    Invoice,
    InvoiceStatus,
    Quote,
    QuoteUpdateDraft,
    SalesDocument,
    SalesDocumentDraft,
    SalesDocumentLine,
    SalesOrder,
} from "../types/salesDocument";

import type {
    Payment,
    PaymentMethod,
} from "../types/payment";

import type {
    CreditAllocation,
    CreditNote,
} from "../types/creditNote";

import {
    creditNoteRepository,
} from "./creditNoteRepository";

import {
    buildSalesLine,
} from "./salesPricingService";

import {
    calculateDocumentTotals,
    calculateSalesLine,
} from "./salesCalculations";

import {
    getProductById,
    getProductUnit,
} from "../../inventory/data/mockProducts";

import { paymentRepository } from "./paymentRepository";

type Listener = () => void;

const listeners =
    new Set<Listener>();

let quotes: Quote[] =
    structuredClone(mockQuotes);

let salesOrders: SalesOrder[] =
    structuredClone(mockSalesOrders);

let invoices: Invoice[] =
    structuredClone(mockInvoices);

let snapshot: SalesDocument[] =
    buildSnapshot();

function emitChange() {
    snapshot =
        buildSnapshot();

    listeners.forEach(
        (listener) =>
            listener(),
    );
}

function buildSnapshot():
    SalesDocument[] {
    return [
        ...quotes,
        ...salesOrders,
        ...invoices,
    ];
}

export const salesRepository = {
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
        SalesDocument[] {
        return snapshot;
    },

    getAll():
        SalesDocument[] {
        return snapshot;
    },

    getById(
        documentId: string,
    ):
        | SalesDocument
        | undefined {
        return snapshot.find(
            (document) =>
                document.id ===
                documentId,
        );
    },

    getByCustomer(
        customerId: string,
    ): SalesDocument[] {
        return snapshot.filter(
            (document) =>
                document.customerId ===
                customerId,
        );
    },

    getQuotesByCustomer(
        customerId: string,
    ): Quote[] {
        return quotes.filter(
            (quote) =>
                quote.customerId ===
                customerId,
        );
    },

    getOrdersByCustomer(
        customerId: string,
    ): SalesOrder[] {
        return salesOrders.filter(
            (order) =>
                order.customerId ===
                customerId,
        );
    },

    getInvoicesByCustomer(
        customerId: string,
    ): Invoice[] {
        return invoices.filter(
            (invoice) =>
                invoice.customerId ===
                customerId,
        );
    },

    createQuote(
        draft: SalesDocumentDraft & {
            expiryDate?: string;
        },
    ): Quote {
        validateDraft(draft);

        if (
            draft.expiryDate &&
            draft.expiryDate <
            draft.documentDate
        ) {
            throw new Error(
                "Quote expiry date cannot be earlier than the document date",
            );
        }

        const lines =
            draft.lines.map(
                (line) =>
                    buildSalesLine({
                        customerId:
                            draft.customerId,

                        documentDate:
                            draft.documentDate,

                        draft: line,
                    }),
            );

        const now =
            new Date().toISOString();

        const quote: Quote = {
            id: createId(
                "quote",
            ),

            type: "QUOTE",

            documentNumber:
                getNextDocumentNumber(
                    "QU",
                    quotes.map(
                        (item) =>
                            item.documentNumber,
                    ),
                ),

            customerId:
                draft.customerId,

            documentDate:
                draft.documentDate,

            expiryDate:
                draft.expiryDate,

            status: "DRAFT",

            customerReference:
                normalizeOptionalText(
                    draft.customerReference,
                ),

            notes:
                normalizeOptionalText(
                    draft.notes,
                ),

            lines,

            totals:
                calculateDocumentTotals(
                    lines,
                ),

            createdAt: now,
            updatedAt: now,
        };

        quotes = [
            quote,
            ...quotes,
        ];

        emitChange();

        return quote;
    },

    updateDraftQuote(
        quoteId: string,
        draft: QuoteUpdateDraft,
    ): Quote {
        const existing =
            quotes.find(
                (quote) =>
                    quote.id ===
                    quoteId,
            );

        if (!existing) {
            throw new Error(
                `Quote ${quoteId} was not found`,
            );
        }

        if (
            existing.status !==
            "DRAFT"
        ) {
            throw new Error(
                "Only draft quotes can be edited",
            );
        }

        if (!draft.documentDate) {
            throw new Error(
                "Document date is required",
            );
        }

        if (
            draft.expiryDate &&
            draft.expiryDate <
            draft.documentDate
        ) {
            throw new Error(
                "Quote expiry date cannot be earlier than the document date",
            );
        }

        if (
            draft.lines.length === 0
        ) {
            throw new Error(
                "At least one sales line is required",
            );
        }

        const lines:
            SalesDocumentLine[] =
            draft.lines.map(
                (line) => {
                    if (
                        line.quantity <= 0
                    ) {
                        throw new Error(
                            "Sales line quantity must be greater than zero",
                        );
                    }

                    if (
                        line.standardUnitPrice <
                        0 ||
                        line.unitPrice < 0
                    ) {
                        throw new Error(
                            "Sales prices cannot be negative",
                        );
                    }

                    const calculated =
                        calculateSalesLine({
                            quantity:
                                line.quantity,

                            standardUnitPrice:
                                line.standardUnitPrice,

                            unitPrice:
                                line.unitPrice,
                        });

                    const existingLine =
                        existing.lines.find(
                            (item) =>
                                item.id ===
                                line.lineId,
                        );

                    return {
                        id:
                            existingLine
                                ?.id ??
                            createId(
                                "line",
                            ),

                        productId:
                            line.productId,

                        unitId:
                            line.unitId,

                        sku:
                            getLineSnapshot(
                                line.productId,
                                line.unitId,
                            ).sku,

                        description:
                            getLineSnapshot(
                                line.productId,
                                line.unitId,
                            )
                                .description,

                        unitSymbol:
                            getLineSnapshot(
                                line.productId,
                                line.unitId,
                            )
                                .unitSymbol,

                        quantity:
                            line.quantity,

                        standardUnitPrice:
                            line.standardUnitPrice,

                        unitPrice:
                            line.unitPrice,

                        priceSource:
                            line.priceSource,

                        customerPriceId:
                            line.customerPriceId,

                        ...calculated,
                    };
                },
            );

        const updated: Quote = {
            ...existing,

            documentDate:
                draft.documentDate,

            expiryDate:
                draft.expiryDate,

            customerReference:
                normalizeOptionalText(
                    draft.customerReference,
                ),

            notes:
                normalizeOptionalText(
                    draft.notes,
                ),

            lines,

            totals:
                calculateDocumentTotals(
                    lines,
                ),

            updatedAt:
                new Date().toISOString(),
        };

        quotes =
            quotes.map(
                (quote) =>
                    quote.id ===
                        quoteId
                        ? updated
                        : quote,
            );

        emitChange();

        return updated;
    },

    sendQuote(
        quoteId: string,
    ): Quote {
        const quote =
            quotes.find(
                (item) =>
                    item.id ===
                    quoteId,
            );

        if (!quote) {
            throw new Error(
                `Quote ${quoteId} was not found`,
            );
        }

        if (
            quote.status !==
            "DRAFT"
        ) {
            throw new Error(
                "Only a draft quote can be sent",
            );
        }

        if (
            quote.lines.length === 0
        ) {
            throw new Error(
                "A quote must contain at least one line before it can be sent",
            );
        }

        const now =
            new Date().toISOString();

        const updated: Quote = {
            ...quote,

            status: "SENT",

            updatedAt: now,
        };

        quotes =
            quotes.map(
                (item) =>
                    item.id ===
                        quoteId
                        ? updated
                        : item,
            );

        emitChange();

        return updated;
    },

    acceptQuote(
        quoteId: string,
    ): Quote {
        const quote =
            quotes.find(
                (item) =>
                    item.id ===
                    quoteId,
            );

        if (!quote) {
            throw new Error(
                `Quote ${quoteId} was not found`,
            );
        }

        if (
            quote.status !==
            "SENT"
        ) {
            throw new Error(
                "Only a sent quote can be accepted",
            );
        }

        const now =
            new Date().toISOString();

        const updated: Quote = {
            ...quote,

            status: "ACCEPTED",

            updatedAt: now,
        };

        quotes =
            quotes.map(
                (item) =>
                    item.id ===
                        quoteId
                        ? updated
                        : item,
            );

        emitChange();

        return updated;
    },

    declineQuote(
        quoteId: string,
    ): Quote {
        const quote =
            quotes.find(
                (item) =>
                    item.id ===
                    quoteId,
            );

        if (!quote) {
            throw new Error(
                `Quote ${quoteId} was not found`,
            );
        }

        if (
            quote.status !==
            "SENT"
        ) {
            throw new Error(
                "Only a sent quote can be declined",
            );
        }

        const now =
            new Date().toISOString();

        const updated: Quote = {
            ...quote,

            status: "DECLINED",

            updatedAt: now,
        };

        quotes =
            quotes.map(
                (item) =>
                    item.id ===
                        quoteId
                        ? updated
                        : item,
            );

        emitChange();

        return updated;
    },

    convertQuoteToOrder(
        quoteId: string,
    ): SalesOrder {
        const quote =
            quotes.find(
                (item) =>
                    item.id ===
                    quoteId,
            );

        if (!quote) {
            throw new Error(
                `Quote ${quoteId} was not found`,
            );
        }

        if (
            quote.status !==
            "ACCEPTED"
        ) {
            throw new Error(
                "Only an accepted quote can be converted to a sales order",
            );
        }

        const now =
            new Date().toISOString();

        const order: SalesOrder =
        {
            id: createId(
                "order",
            ),

            type:
                "SALES_ORDER",

            documentNumber:
                getNextDocumentNumber(
                    "SO",
                    salesOrders.map(
                        (item) =>
                            item.documentNumber,
                    ),
                ),

            customerId:
                quote.customerId,

            documentDate:
                getToday(),

            status:
                "CONFIRMED",

            sourceQuoteId:
                quote.id,

            invoiceIds: [],

            customerReference:
                quote.customerReference,

            notes:
                quote.notes,

            /**
             * IMPORTANT:
             * Copy the existing priced lines.
             *
             * Do not call resolvePrice() again here.
             */
            lines:
                structuredClone(
                    quote.lines,
                ),

            totals:
                structuredClone(
                    quote.totals,
                ),

            createdAt: now,
            updatedAt: now,
        };

        salesOrders = [
            order,
            ...salesOrders,
        ];

        quotes =
            quotes.map(
                (item) =>
                    item.id ===
                        quote.id
                        ? {
                            ...item,

                            status:
                                "CONVERTED",

                            convertedSalesOrderId:
                                order.id,

                            updatedAt:
                                now,
                        }
                        : item,
            );

        emitChange();

        return order;
    },

    createInvoiceFromOrder(
        orderId: string,
    ): Invoice {
        const order =
            salesOrders.find(
                (item) =>
                    item.id ===
                    orderId,
            );

        if (!order) {
            throw new Error(
                `Sales order ${orderId} was not found`,
            );
        }

        if (
            order.status !==
            "CONFIRMED"
        ) {
            throw new Error(
                "Only a confirmed sales order can be invoiced",
            );
        }

        if (
            order.invoiceIds.length >
            0
        ) {
            throw new Error(
                "This sales order has already been invoiced",
            );
        }

        const now =
            new Date().toISOString();

        const documentDate =
            getToday();

        const invoice: Invoice =
        {
            id: createId(
                "invoice",
            ),

            type:
                "INVOICE",

            documentNumber:
                getNextDocumentNumber(
                    "INV",
                    invoices.map(
                        (item) =>
                            item.documentNumber,
                    ),
                ),

            customerId:
                order.customerId,

            documentDate,

            dueDate:
                addDays(
                    documentDate,
                    30,
                ),

            status:
                "ISSUED",

            sourceSalesOrderId:
                order.id,

            customerReference:
                order.customerReference,

            notes:
                order.notes,

            /**
             * Preserve the order's agreed pricing.
             */
            lines:
                structuredClone(
                    order.lines,
                ),

            totals:
                structuredClone(
                    order.totals,
                ),

            amountPaid: 0,

            amountDue:
                order.totals.total,

            createdAt: now,
            updatedAt: now,
        };

        invoices = [
            invoice,
            ...invoices,
        ];

        salesOrders =
            salesOrders.map(
                (item) =>
                    item.id ===
                        order.id
                        ? {
                            ...item,

                            status:
                                "INVOICED",

                            invoiceIds: [
                                ...item.invoiceIds,
                                invoice.id,
                            ],

                            updatedAt:
                                now,
                        }
                        : item,
            );

        emitChange();

        return invoice;
    },

    createCreditNoteFromInvoice(
        input: {
            invoiceId: string;

            creditDate: string;

            reason: string;

            lines:
            SalesDocumentLine[];
        },
    ): CreditNote {
        const invoice =
            invoices.find(
                (item) =>
                    item.id ===
                    input.invoiceId,
            );

        if (!invoice) {
            throw new Error(
                `Invoice ${input.invoiceId} was not found`,
            );
        }

        if (
            invoice.status ===
            "VOID"
        ) {
            throw new Error(
                "A credit note cannot be created from a void invoice",
            );
        }

        if (
            invoice.status ===
            "DRAFT"
        ) {
            throw new Error(
                "A credit note cannot be created from a draft invoice",
            );
        }

        const reason =
            input.reason.trim();

        if (
            reason.length < 3
        ) {
            throw new Error(
                "A credit reason is required",
            );
        }

        if (
            input.lines.length ===
            0
        ) {
            throw new Error(
                "A credit note must contain at least one line",
            );
        }

        if (
            input.creditDate <
            invoice.documentDate
        ) {
            throw new Error(
                "Credit date cannot be earlier than the invoice date",
            );
        }

        const lines =
            structuredClone(
                input.lines,
            );

        const totals =
            calculateDocumentTotals(
                lines,
            );

        if (
            totals.total <= 0
        ) {
            throw new Error(
                "Credit note total must be greater than zero",
            );
        }

        const existingCredits =
            creditNoteRepository
                .getByInvoice(
                    invoice.id,
                )
                .filter(
                    (creditNote) =>
                        creditNote.status !==
                        "VOID",
                );

        const alreadyCredited =
            roundCurrency(
                existingCredits.reduce(
                    (
                        total,
                        creditNote,
                    ) =>
                        total +
                        creditNote.totals.total,
                    0,
                ),
            );

        if (
            roundCurrency(
                alreadyCredited +
                totals.total,
            ) >
            roundCurrency(
                invoice.totals.total,
            )
        ) {
            throw new Error(
                "Total credit notes cannot exceed the original invoice total",
            );
        }

        const now =
            new Date().toISOString();

        const creditNote:
            CreditNote = {
            id:
                createId(
                    "credit-note",
                ),

            creditNoteNumber:
                getNextDocumentNumber(
                    "CN",
                    creditNoteRepository
                        .getAll()
                        .map(
                            (item) =>
                                item.creditNoteNumber,
                        ),
                ),

            customerId:
                invoice.customerId,

            sourceInvoiceId:
                invoice.id,

            creditDate:
                input.creditDate,

            status:
                "ISSUED",

            reason,

            lines,

            totals,

            amountApplied: 0,

            amountAvailable:
                totals.total,

            issuedAt:
                now,

            createdAt:
                now,

            updatedAt:
                now,
        };

        creditNoteRepository.create(
            creditNote,
        );

        return creditNote;
    },

    applyCreditToInvoice(
        input: {
            creditNoteId: string;

            invoiceId: string;

            allocationDate: string;

            amount: number;
        },
    ): CreditAllocation {
        const creditNote =
            creditNoteRepository.getById(
                input.creditNoteId,
            );

        if (!creditNote) {
            throw new Error(
                `Credit note ${input.creditNoteId} was not found`,
            );
        }

        const invoice =
            invoices.find(
                (item) =>
                    item.id ===
                    input.invoiceId,
            );

        if (!invoice) {
            throw new Error(
                `Invoice ${input.invoiceId} was not found`,
            );
        }

        if (
            creditNote.status ===
            "VOID"
        ) {
            throw new Error(
                "A void credit note cannot be applied",
            );
        }

        if (
            creditNote.status ===
            "DRAFT"
        ) {
            throw new Error(
                "A draft credit note cannot be applied",
            );
        }

        if (
            invoice.status ===
            "VOID"
        ) {
            throw new Error(
                "Credit cannot be applied to a void invoice",
            );
        }

        if (
            invoice.status ===
            "DRAFT"
        ) {
            throw new Error(
                "Credit cannot be applied to a draft invoice",
            );
        }

        if (
            creditNote.customerId !==
            invoice.customerId
        ) {
            throw new Error(
                "Credit note and invoice must belong to the same customer",
            );
        }

        if (
            input.allocationDate <
            creditNote.creditDate
        ) {
            throw new Error(
                "Allocation date cannot be earlier than the credit note date",
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
                "Credit amount must be greater than zero",
            );
        }

        const currentCredit =
            creditNoteRepository.getById(
                creditNote.id,
            );

        if (!currentCredit) {
            throw new Error(
                "Credit note was not found",
            );
        }

        if (
            amount >
            currentCredit.amountAvailable
        ) {
            throw new Error(
                "Credit amount cannot exceed the available credit",
            );
        }

        const currentInvoice =
            this.recalculateInvoiceBalance(
                invoice.id,
            );

        if (
            amount >
            currentInvoice.amountDue
        ) {
            throw new Error(
                "Credit amount cannot exceed the invoice amount due",
            );
        }

        const now =
            new Date().toISOString();

        const allocation:
            CreditAllocation = {
            id:
                createId(
                    "credit-allocation",
                ),

            allocationNumber:
                getNextDocumentNumber(
                    "CA",
                    creditNoteRepository
                        .getAllAllocations()
                        .map(
                            (item) =>
                                item.allocationNumber,
                        ),
                ),

            customerId:
                invoice.customerId,

            creditNoteId:
                currentCredit.id,

            invoiceId:
                invoice.id,

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

        creditNoteRepository
            .createAllocation(
                allocation,
            );

        const amountApplied =
            roundCurrency(
                currentCredit.amountApplied +
                amount,
            );

        const amountAvailable =
            roundCurrency(
                Math.max(
                    0,
                    currentCredit.totals.total -
                    amountApplied,
                ),
            );

        creditNoteRepository.update({
            ...currentCredit,

            amountApplied,

            amountAvailable,

            status:
                amountAvailable ===
                    0
                    ? "FULLY_APPLIED"
                    : "ISSUED",

            updatedAt:
                now,
        });

        this.recalculateInvoiceBalance(
            invoice.id,
        );

        return allocation;
    },

    recordInvoicePayment(
        input: {
            invoiceId: string;

            paymentDate:
            string;

            amount:
            number;

            method:
            PaymentMethod;

            reference?:
            string;

            notes?:
            string;
        },
    ): Payment {
        const invoice =
            invoices.find(
                (item) =>
                    item.id ===
                    input.invoiceId,
            );

        if (!invoice) {
            throw new Error(
                `Invoice ${input.invoiceId} was not found`,
            );
        }

        if (
            invoice.status ===
            "VOID"
        ) {
            throw new Error(
                "A void invoice cannot receive payments",
            );
        }

        if (
            invoice.status ===
            "DRAFT"
        ) {
            throw new Error(
                "A draft invoice cannot receive payments",
            );
        }

        if (
            invoice.status ===
            "PAID"
        ) {
            throw new Error(
                "This invoice has already been paid",
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
                "Payment amount must be greater than zero",
            );
        }

        /*
         * Recalculate before validation so
         * amountDue is derived from the
         * current Payment records.
         */
        const currentInvoice =
            this.recalculateInvoiceBalance(
                invoice.id,
            );

        if (
            amount >
            currentInvoice.amountDue
        ) {
            throw new Error(
                "Payment amount cannot exceed the invoice amount due",
            );
        }

        const payment =
            paymentRepository.create({
                customerId:
                    currentInvoice.customerId,

                invoiceId:
                    currentInvoice.id,

                paymentDate:
                    input.paymentDate,

                amount,

                method:
                    input.method,

                reference:
                    input.reference,

                notes:
                    input.notes,
            });

        this.recalculateInvoiceBalance(
            currentInvoice.id,
        );

        return payment;
    },

    voidInvoice(
        invoiceId: string,
        reason: string,
    ): Invoice {
        const invoice =
            invoices.find(
                (item) =>
                    item.id ===
                    invoiceId,
            );

        if (!invoice) {
            throw new Error(
                `Invoice ${invoiceId} was not found`,
            );
        }

        if (
            invoice.status ===
            "VOID"
        ) {
            throw new Error(
                "This invoice has already been voided",
            );
        }

        if (
            invoice.status ===
            "DRAFT"
        ) {
            throw new Error(
                "A draft invoice cannot be voided here",
            );
        }

        const normalizedReason =
            reason.trim();

        if (
            normalizedReason.length <
            3
        ) {
            throw new Error(
                "A void reason is required",
            );
        }

        /*
         * An invoice with active payments cannot be
         * voided because that would leave received
         * money attached to a void accounting document.
         *
         * Payments must be reversed first.
         */
        const receivedPayments =
            paymentRepository.getReceivedByInvoice(
                invoice.id,
            );

        if (
            receivedPayments.length >
            0
        ) {
            throw new Error(
                "This invoice has received payments. Reverse all active payments before voiding the invoice.",
            );
        }

        const now =
            new Date().toISOString();

        const updated:
            Invoice = {
            ...invoice,

            status:
                "VOID",

            /*
             * A void invoice no longer contributes
             * to the current accounts receivable.
             */
            amountPaid: 0,
            amountDue: 0,

            voidedAt:
                now,

            voidReason:
                normalizedReason,

            updatedAt:
                now,
        };

        invoices =
            invoices.map(
                (item) =>
                    item.id ===
                        invoiceId
                        ? updated
                        : item,
            );

        emitChange();

        return updated;
    },

    reverseInvoicePayment(
        paymentId: string,
        reason: string,
    ): Payment {
        const payment =
            paymentRepository.getById(
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

        const invoice =
            invoices.find(
                (item) =>
                    item.id ===
                    payment.invoiceId,
            );

        if (!invoice) {
            throw new Error(
                "The invoice linked to this payment was not found",
            );
        }

        if (
            invoice.status ===
            "VOID"
        ) {
            throw new Error(
                "Payments on a void invoice cannot be reversed here",
            );
        }

        const reversedPayment =
            paymentRepository.reverse(
                paymentId,
                reason,
            );

        this.recalculateInvoiceBalance(
            invoice.id,
        );

        return reversedPayment;
    },

    recalculateInvoiceBalance(
        invoiceId: string,
    ): Invoice {
        const invoice =
            invoices.find(
                (item) =>
                    item.id ===
                    invoiceId,
            );

        if (!invoice) {
            throw new Error(
                `Invoice ${invoiceId} was not found`,
            );
        }

        if (
            invoice.status ===
            "VOID"
        ) {
            return invoice;
        }

        const receivedPayments =
            paymentRepository.getReceivedByInvoice(
                invoiceId,
            );

        const appliedCredits =
            creditNoteRepository
                .getAllocationsByInvoice(
                    invoiceId,
                )
                .filter(
                    (allocation) =>
                        allocation.status ===
                        "APPLIED",
                );

        const amountPaid =
            roundCurrency(
                receivedPayments.reduce(
                    (
                        total,
                        payment,
                    ) =>
                        total +
                        payment.amount,
                    0,
                ),
            );

        const amountCredited =
            roundCurrency(
                appliedCredits.reduce(
                    (
                        total,
                        allocation,
                    ) =>
                        total +
                        allocation.amount,
                    0,
                ),
            );

        const amountDue =
            roundCurrency(
                Math.max(
                    0,
                    invoice.totals.total -
                    amountPaid -
                    amountCredited,
                ),
            );

        let status:
            InvoiceStatus;

        if (
            amountDue === 0
        ) {
            status = "PAID";
        } else if (
            amountPaid > 0 ||
            amountCredited > 0
        ) {
            status =
                "PARTIALLY_PAID";
        } else {
            status =
                isInvoiceOverdue(
                    invoice.dueDate,
                )
                    ? "OVERDUE"
                    : "ISSUED";
        }

        const updated:
            Invoice = {
            ...invoice,

            amountPaid,
            amountDue,
            status,

            updatedAt:
                new Date().toISOString(),
        };

        invoices =
            invoices.map(
                (item) =>
                    item.id ===
                        invoiceId
                        ? updated
                        : item,
            );

        emitChange();

        return updated;
    },
};

function validateDraft(
    draft: SalesDocumentDraft,
) {
    if (
        !draft.customerId
    ) {
        throw new Error(
            "Customer is required",
        );
    }

    if (
        !draft.documentDate
    ) {
        throw new Error(
            "Document date is required",
        );
    }

    if (
        draft.lines.length === 0
    ) {
        throw new Error(
            "At least one sales line is required",
        );
    }
}

function normalizeOptionalText(
    value:
        | string
        | undefined,
) {
    const normalized =
        value?.trim();

    return normalized ||
        undefined;
}

function createId(
    prefix: string,
) {
    return `${prefix}_${crypto.randomUUID()}`;
}

function getNextDocumentNumber(
    prefix: string,
    existingNumbers: string[],
) {
    const year =
        new Date().getFullYear();

    const sequence =
        existingNumbers.reduce(
            (
                highest,
                documentNumber,
            ) => {
                const match =
                    documentNumber.match(
                        /-(\d+)$/,
                    );

                if (!match) {
                    return highest;
                }

                const value =
                    Number(match[1]);

                return Math.max(
                    highest,
                    value,
                );
            },
            0,
        ) + 1;

    return `${prefix}-${year}-${String(
        sequence,
    ).padStart(4, "0")}`;
}

function getToday() {
    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1,
        ).padStart(2, "0");

    const day =
        String(
            date.getDate(),
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function addDays(
    value: string,
    days: number,
) {
    const [
        year,
        month,
        day,
    ] = value
        .split("-")
        .map(Number);

    const date =
        new Date(
            year,
            month - 1,
            day,
        );

    date.setDate(
        date.getDate() +
        days,
    );

    const resultYear =
        date.getFullYear();

    const resultMonth =
        String(
            date.getMonth() + 1,
        ).padStart(2, "0");

    const resultDay =
        String(
            date.getDate(),
        ).padStart(2, "0");

    return `${resultYear}-${resultMonth}-${resultDay}`;
}

function getLineSnapshot(
    productId: string,
    unitId: string,
) {
    const product =
        getProductById(
            productId,
        );

    if (!product) {
        throw new Error(
            `Product ${productId} was not found`,
        );
    }

    const unit =
        getProductUnit(
            productId,
            unitId,
        );

    if (!unit) {
        throw new Error(
            `Unit ${unitId} was not found for ${product.name}`,
        );
    }

    return {
        sku:
            product.sku,

        description:
            product.name,

        unitSymbol:
            unit.symbol,
    };
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

function isInvoiceOverdue(
    dueDate: string,
) {
    const today =
        getLocalDateKey(
            new Date(),
        );

    return dueDate <
        today;
}

function getLocalDateKey(
    date: Date,
) {
    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() +
            1,
        ).padStart(
            2,
            "0",
        );

    const day =
        String(
            date.getDate(),
        ).padStart(
            2,
            "0",
        );

    return `${year}-${month}-${day}`;
}