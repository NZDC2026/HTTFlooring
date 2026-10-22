import { resolvePricingInstant, validatePricingSnapshot } from './pricingInstant';
import { visibleDocuments } from '../../document-recycle/recycleState';
import { validateLineItemType } from '../../inventory/data/itemTypes';
import { validateAreaSnapshot } from './areaPacks';
import { validateRecipientSnapshot } from './salesRecipients';
import { salesRecipient } from './salesRecipients';
import { assertSourceNotReconciled } from '../../banking/data/reconciliationLock';
import { businessSettings, configuredNumber } from '../../business-workspace/configurationState';
import { registerRepository, snapshotRepositories } from "../../security/repositoryHost";
import { requireDateKey, businessDateKey } from "../../../lib/businessDate";
import { assertCurrentCrossModuleWriteSafe } from '../../integration/crossModuleWriteGate';
import { loadSalesDocuments, persistSalesDocuments } from "./invoiceStorage";
import { loadQuotes, persistQuotes } from "./quoteStorage";
import { loadQuoteOrders, persistQuoteOrders } from "./salesOrderStorage";
import { journalEntryRepository } from "../../accounting/data/journalEntryRepository";
import { financialOperationJournal } from "../../../lib/persistence/financialOperationJournal";
import { assertCurrentSalesWriteSafety } from "./salesWriteSafetyGate";
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
} from "./salesCalculations";


import { paymentRepository } from "./paymentRepository";

import {
    salesAccountingPostingService,
} from "../../accounting/data/salesAccountingPostingService";

type Listener = () => void;

const listeners =
    new Set<Listener>();

const initialDocumentRead = loadSalesDocuments();
const initialQuoteOrderRead = loadQuoteOrders();
const initialQuoteRead = loadQuotes();
let quotes: Quote[] = initialDocumentRead.status === "ok"
    ? structuredClone(initialDocumentRead.data.quotes)
    : initialQuoteOrderRead.status === "ok"
    ? structuredClone(initialQuoteOrderRead.data.quotes)
    : initialQuoteRead.status === "ok"
        ? structuredClone(initialQuoteRead.data)
        : structuredClone(mockQuotes);

function commitQuotes(next: Quote[]): void {
    if (initialDocumentRead.status === "ok" || loadSalesDocuments().status !== "empty") {
        persistSalesDocuments({ quotes: next, salesOrders, invoices });
    } else if (initialQuoteOrderRead.status === "ok" || loadQuoteOrders().status !== "empty") {
        persistQuoteOrders({ quotes: next, salesOrders });
    } else {
        persistQuotes(next);
    }
    quotes = next;
    emitChange();
}

let salesOrders: SalesOrder[] = initialDocumentRead.status === "ok"
    ? structuredClone(initialDocumentRead.data.salesOrders)
    : initialQuoteOrderRead.status === "ok"
    ? structuredClone(initialQuoteOrderRead.data.salesOrders)
    : structuredClone(mockSalesOrders);

let invoices: Invoice[] = initialDocumentRead.status === "ok"
    ? structuredClone(initialDocumentRead.data.invoices)
    : structuredClone(mockInvoices);

function commitInvoices(next: Invoice[]): void {
    persistSalesDocuments({ quotes, salesOrders, invoices: next });
    invoices = next;
    emitChange();
}

function commitOrderDocuments(nextOrders: SalesOrder[], nextQuotes: Quote[] = quotes): void {
    if (initialDocumentRead.status === "ok" || loadSalesDocuments().status !== "empty") {
        persistSalesDocuments({ quotes: nextQuotes, salesOrders: nextOrders, invoices });
    } else {
        persistQuoteOrders({ quotes: nextQuotes, salesOrders: nextOrders });
    }
    salesOrders = nextOrders;
    quotes = nextQuotes;
    emitChange();
}

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
    createManagedOrder(input: {draftId:string;recipient?:import("../types/salesDocument").SalesRecipientSnapshot;customerId:string;documentDate:string;customerReference?:string;notes?:string;lines:SalesDocumentLine[];totals:Invoice['totals']}):SalesOrder {
        const prior=salesOrders.find(o=>o.managedDraftId===input.draftId);if(prior)return prior;
        const now=new Date().toISOString(),order:SalesOrder={id:createId('order'),managedDraftId:input.draftId,type:'SALES_ORDER',status:'CONFIRMED',documentNumber:getNextDocumentNumber('SO',salesOrders.map(o=>o.documentNumber)),customerId:input.customerId,recipient:structuredClone(input.recipient),documentDate:input.documentDate,customerReference:input.customerReference,notes:input.notes,lines:structuredClone(input.lines),totals:structuredClone(input.totals),invoiceIds:[],createdAt:now,updatedAt:now};
        commitOrderDocuments([order,...salesOrders]);return order;
    },
    createManagedInvoice(input: {draftId:string;recipient?:import("../types/salesDocument").SalesRecipientSnapshot;customerId:string;documentDate:string;dueDate:string;customerReference?:string;notes?:string;lines:SalesDocumentLine[];totals:Invoice['totals']}):Invoice {
        const prior=invoices.find(i=>i.managedDraftId===input.draftId);if(prior)return prior;
        const order=salesRepository.createManagedOrder(input),now=new Date().toISOString();
        const invoice:Invoice={id:createId('invoice'),managedDraftId:input.draftId,type:'INVOICE',status:'ISSUED',documentNumber:getNextDocumentNumber('INV',invoices.map(i=>i.documentNumber)),customerId:input.customerId,recipient:structuredClone(input.recipient),documentDate:input.documentDate,dueDate:input.dueDate,sourceSalesOrderId:order.id,customerReference:input.customerReference,notes:input.notes,lines:structuredClone(input.lines),totals:structuredClone(input.totals),amountPaid:0,amountDue:input.totals.total,createdAt:now,updatedAt:now};
        const nextOrders=salesOrders.map(o=>o.id===order.id?{...o,status:'INVOICED' as const,invoiceIds:[...o.invoiceIds,invoice.id],updatedAt:now}:o);
        persistSalesDocuments({quotes,salesOrders:nextOrders,invoices:[invoice,...invoices]});salesOrders=nextOrders;invoices=[invoice,...invoices];emitChange();salesAccountingPostingService.postInvoice(invoice);return invoice;
    },
    cancelManagedOrder(id:string,reason:string):SalesOrder {
        const order=salesOrders.find(o=>o.id===id);if(!order?.managedDraftId)throw new Error('Managed order not found.');
        if(order.status==='CANCELLED')return order;
        if(order.invoiceIds.some(id=>invoices.some(i=>i.id===id&&i.status!=='VOID')))throw new Error('Void active invoices before cancelling the order.');
        if(order.status==='PARTIALLY_FULFILLED'||order.status==='FULFILLED'||order.fulfilmentStatus==='PARTIALLY_FULFILLED'||order.fulfilmentStatus==='FULFILLED')throw new Error('Reverse active fulfilments before cancelling the order.');
        if(reason.trim().length<3)throw new Error('Cancellation reason is required.');
        const result={...order,status:'CANCELLED' as const,notes:(order.notes??'')+'\nCancelled: '+reason.trim(),updatedAt:new Date().toISOString()};commitOrderDocuments(salesOrders.map(o=>o.id===id?result:o));return result;
    },
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
        return visibleDocuments(snapshot);
    },

    getAll():
        SalesDocument[] {
        return visibleDocuments(snapshot);
    },

    getById(
        documentId: string,
    ):
        | SalesDocument
        | undefined {
        return visibleDocuments(snapshot).find(
            (document) =>
                document.id ===
                documentId,
        );
    },

    getByCustomer(
        customerId: string,
    ): SalesDocument[] {
        return visibleDocuments(snapshot).filter(
            (document) =>
                document.customerId ===
                customerId,
        );
    },

    getQuotesByCustomer(
        customerId: string,
    ): Quote[] {
        return visibleDocuments(quotes).filter(
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

        const pricingContext = resolvePricingInstant(draft.documentDate, draft.pricingAt);
        const lines =
            draft.lines.map(
                (line) =>
                    buildSalesLine({
                        customerId:
                            draft.customerId,

                        documentDate:
                            draft.documentDate,

                        pricingContext,
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

            recipient: salesRecipient(draft.customerId, draft),
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

        commitQuotes([quote, ...quotes]);

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

        const prior = existing.lines.find(l => l.pricingAt);
        const pricingContext = resolvePricingInstant(draft.documentDate, draft.pricingAt ?? (draft.documentDate === existing.documentDate ? prior?.pricingAt : undefined), draft.documentDate === existing.documentDate && (!draft.pricingAt || draft.pricingAt === prior?.pricingAt) ? prior?.pricingTimezone : undefined);
        const lines: SalesDocumentLine[] = draft.lines.map(line => {
            const built = buildSalesLine({ customerId: existing.customerId, documentDate: draft.documentDate, pricingContext,
                draft: { productId: line.productId, unitId: line.unitId, quantity: line.quantity, requestedArea: line.requestedArea,
                    unitPrice: line.priceSource === 'MANUAL' ? line.unitPrice : undefined, priceBasis: 'Exclusive' } });
            return { ...built, id: existing.lines.find(l => l.id === line.lineId)?.id ?? built.id };
        });

        const updated: Quote = {
            ...existing,
            recipient: draft.locationId === undefined && draft.accountingContactId === undefined ? existing.recipient : salesRecipient(existing.customerId,draft),

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

        commitQuotes(quotes.map(
                (quote) =>
                    quote.id ===
                        quoteId
                        ? updated
                        : quote,
            ));

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

        commitQuotes(quotes.map(
                (item) =>
                    item.id ===
                        quoteId
                        ? updated
                        : item,
            ));

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

        commitQuotes(quotes.map(
                (item) =>
                    item.id ===
                        quoteId
                        ? updated
                        : item,
            ));

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

        commitQuotes(quotes.map(
                (item) =>
                    item.id ===
                        quoteId
                        ? updated
                        : item,
            ));

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

            recipient: structuredClone(quote.recipient),
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

        const nextOrders = [order, ...salesOrders];
        const nextQuotes: Quote[] = quotes.map(item => item.id === quote.id
            ? { ...item, status: "CONVERTED", convertedSalesOrderId: order.id, updatedAt: now }
            : item);
        // One durable write contains both sides of the conversion.
        // Do not mutate memory or emit notifications until it succeeds.
        commitOrderDocuments(nextOrders, nextQuotes);

        return order;
    },

    setFulfilmentStatus(
        orderId:
            string,

        status:
            | "CONFIRMED"
            | "PARTIALLY_FULFILLED"
            | "FULFILLED",
    ): SalesOrder {
        const order =
            salesOrders.find(
                (
                    item,
                ) =>
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
            "CONFIRMED" &&
            order.status !==
            "PARTIALLY_FULFILLED" &&
            order.status !==
            "FULFILLED" && order.status!=="INVOICED"
        ) {
            throw new Error(
                "Sales order fulfilment status cannot be changed from its current state.",
            );
        }

        const updated:
            SalesOrder =
        {
            ...order,

            status: order.status==='INVOICED'?'INVOICED':status,
            fulfilmentStatus:status,

            updatedAt:
                new Date()
                    .toISOString(),
        };

        const nextOrders = salesOrders.map(item => item.id === orderId ? updated : item);
        commitOrderDocuments(nextOrders);

        return updated;
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
            "CONFIRMED" &&
            order.status !==
            "PARTIALLY_FULFILLED" &&
            order.status !==
            "FULFILLED"
        ) {
            throw new Error(
                "Only a confirmed or fulfilled sales order can be invoiced",
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

            managedDraftId:order.managedDraftId,
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

            recipient: structuredClone(order.recipient),
            customerId:
                order.customerId,

            documentDate,

            dueDate:
                addDays(
                    documentDate,
                    Number(businessSettings().terms),
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

        const nextInvoices = [invoice, ...invoices];
        const nextOrders: SalesOrder[] = salesOrders.map(item => item.id === order.id
            ? { ...item, status: "INVOICED", invoiceIds: [...item.invoiceIds, invoice.id], updatedAt: now }
            : item);
        // Save both sides of the business relationship before publishing in-memory state.
        // GL posting below is a separate boundary; a crash between these steps requires review.
        persistSalesDocuments({ quotes, salesOrders: nextOrders, invoices: nextInvoices });
        invoices = nextInvoices;
        salesOrders = nextOrders;
        emitChange();

        salesAccountingPostingService
            .postInvoice(
                invoice,
            );

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

        const seen = new Set<string>();
        const lines = input.lines.map(request => {
            const source = invoice.lines.find(line => line.id === request.id);
            if (!source || seen.has(source.id)) throw new Error('Select each original invoice line only once.');
            seen.add(source.id);
            if (!Number.isFinite(request.quantity) || request.quantity <= 0) throw new Error('Credit quantity must be finite and greater than zero.');
            if (source.areaPerPack && !Number.isInteger(request.quantity)) throw new Error('Area-based lines must be credited in whole packs.');
            const credited = creditNoteRepository.getByInvoice(invoice.id).filter(c => c.status !== 'VOID').flatMap(c => c.lines).filter(l => l.id === source.id).reduce((sum,l) => sum+l.quantity,0);
            if (request.quantity + credited > source.quantity + 1e-8) throw new Error('Credit quantity cannot exceed the original invoice quantity.');
            const taxRate = source.taxRate ?? (source.lineSubtotal ? source.taxAmount/source.lineSubtotal : 0.1);
            const priorLines=creditNoteRepository.getByInvoice(invoice.id).filter(c=>c.status!=='VOID').flatMap(c=>c.lines).filter(l=>l.id===source.id);
            const final=request.quantity+credited>=source.quantity-1e-8;
            const lineSubtotal=roundCurrency(final?source.lineSubtotal-priorLines.reduce((n,l)=>n+l.lineSubtotal,0):source.lineSubtotal*request.quantity/source.quantity);
            const taxAmount=roundCurrency(final?source.taxAmount-priorLines.reduce((n,l)=>n+l.taxAmount,0):source.taxAmount*request.quantity/source.quantity);
            return {...source,requestedArea:request.quantity===source.quantity?source.requestedArea:undefined,coveredArea:source.areaPerPack?Math.round(request.quantity*source.areaPerPack*1e8)/1e8:undefined,quantity:request.quantity,taxRate,lineSubtotal,taxAmount,lineTotal:roundCurrency(lineSubtotal+taxAmount)};
        });

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

            recipient: structuredClone(invoice.recipient),
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

        salesAccountingPostingService
            .postCreditNote(
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
            operationId?: string;
        },
    ): CreditAllocation {
        assertCurrentCrossModuleWriteSafe();
        assertCurrentSalesWriteSafety();
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

        const amountApplied =
            roundCurrency(
                currentCredit.amountApplied +
                amount,
            );

        const amountAvailable =
            roundCurrency(
                Math.max(
                    0,
                    currentCredit.totals.total - (currentCredit.amountRefunded ?? 0) -
                    amountApplied,
                ),
            );

        const allocationOperationId = input.operationId ?? `sales-credit-apply:${crypto.randomUUID()}`;
        const attempt = financialOperationJournal.begin(allocationOperationId, "SALES_CREDIT_APPLY",
            JSON.stringify({ creditNoteId: input.creditNoteId, invoiceId: input.invoiceId,
                allocationDate: input.allocationDate, amount }));
        if (attempt.status !== "started") throw new Error("Credit allocation was previously attempted; manual review required.");
        try {
            financialOperationJournal.bindResult(allocationOperationId, allocation.id);
            creditNoteRepository.commitAllocationAndCredit(allocation, {
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

            this.recalculateInvoiceBalance(invoice.id);
            financialOperationJournal.complete(allocationOperationId, allocation.id);
        } catch (error) {
            try { financialOperationJournal.flagForReview(allocationOperationId, "Credit allocation/balance uncertain; manual review required."); }
            catch { /* preserve original error */ }
            throw error;
        }
        return allocation;
    },

    reverseCreditAllocation(
        input: {
            allocationId: string;
            reason: string;
        },
    ): CreditAllocation {
        assertCurrentCrossModuleWriteSafe();
        assertCurrentSalesWriteSafety();
        const allocation =
            creditNoteRepository
                .getAllocationById(
                    input.allocationId,
                );

        if (!allocation) {
            throw new Error(
                `Credit allocation ${input.allocationId} was not found`,
            );
        }

        if (
            allocation.status ===
            "REVERSED"
        ) {
            throw new Error(
                "This credit allocation has already been reversed",
            );
        }

        const reason =
            input.reason.trim();

        if (
            reason.length < 3
        ) {
            throw new Error(
                "A reversal reason is required",
            );
        }

        const creditNote =
            creditNoteRepository.getById(
                allocation.creditNoteId,
            );

        if (!creditNote) {
            throw new Error(
                "Credit note was not found",
            );
        }

        if (
            creditNote.status ===
            "VOID"
        ) {
            throw new Error(
                "Allocations on a void credit note cannot be reversed here",
            );
        }

        const invoice =
            invoices.find(
                (item) =>
                    item.id ===
                    allocation.invoiceId,
            );

        if (!invoice) {
            throw new Error(
                "Allocated invoice was not found",
            );
        }

        if (
            invoice.status ===
            "VOID"
        ) {
            throw new Error(
                "Credit allocation cannot be reversed after the invoice has been voided",
            );
        }

        const now =
            new Date().toISOString();

        const reversedAllocation:
            CreditAllocation = {
            ...allocation,

            status:
                "REVERSED",

            reversedAt:
                now,

            reversalReason:
                reason,

            updatedAt:
                now,
        };

        /*
         * Recalculate the Credit Note from active
         * allocations instead of subtracting the
         * reversed amount manually.
         *
         * This keeps the snapshot correct even after
         * multiple allocations/reversals.
         */
        const activeAllocations =
            creditNoteRepository
                .getAllocationsByCreditNote(
                    creditNote.id,
                )
                .filter(
                    (item) =>
                        item.status === "APPLIED" && item.id !== reversedAllocation.id,
                );

        const amountApplied =
            roundCurrency(
                activeAllocations.reduce(
                    (
                        total,
                        item,
                    ) =>
                        total +
                        item.amount,
                    0,
                ),
            );

        const amountAvailable =
            roundCurrency(
                Math.max(
                    0,
                    creditNote.totals.total - (creditNote.amountRefunded ?? 0) -
                    amountApplied,
                ),
            );

        const reversalOperationId = `sales-credit-reversal:${allocation.id}`;
        const attempt = financialOperationJournal.begin(reversalOperationId, "SALES_CREDIT_REVERSAL", allocation.id);
        if (attempt.status !== "started") throw new Error("Credit allocation reversal previously attempted; manual review required.");
        try {
            financialOperationJournal.bindResult(reversalOperationId, allocation.id);
            creditNoteRepository.commitAllocationAndCredit(reversedAllocation, {
            ...creditNote,

            amountApplied,

            amountAvailable,

            status:
                amountAvailable === 0
                    ? "FULLY_APPLIED"
                    : "ISSUED",

            updatedAt:
                now,
        });

        /*
         * Reversed allocation no longer reduces
         * this invoice.
         */
            this.recalculateInvoiceBalance(invoice.id);
            financialOperationJournal.complete(reversalOperationId, allocation.id);
        } catch (error) {
            try { financialOperationJournal.flagForReview(reversalOperationId, "Credit reversal/balance uncertain; manual review required."); }
            catch { /* preserve original error */ }
            throw error;
        }
        return reversedAllocation;
    },

    voidCreditNote(
        input: {
            creditNoteId: string;
            reason: string;
            voidDate?: string;
        },
    ): CreditNote {
        const owned = snapshotRepositories().physicalCustomerReturns as { returns: { creditNoteId: string; status: string }[] } | undefined;
        if (owned?.returns.some(r => r.creditNoteId === input.creditNoteId && r.status === 'POSTED')) throw new Error('Reverse the linked physical customer return before voiding this credit.');
        if (input.voidDate) requireDateKey(input.voidDate, 'Credit reversal date');
        const creditNote =
            creditNoteRepository.getById(
                input.creditNoteId,
            );

        if (!creditNote) {
            throw new Error(
                `Credit note ${input.creditNoteId} was not found`,
            );
        }

        if (
            creditNote.status ===
            "VOID"
        ) {
            throw new Error(
                "This credit note has already been voided",
            );
        }

        if (
            creditNote.status ===
            "DRAFT"
        ) {
            throw new Error(
                "A draft credit note cannot be voided here",
            );
        }

        if (input.voidDate && ((creditNote.refundEvents ?? []).some(e => (e.reversalDate ?? e.date) > input.voidDate!) || creditNoteRepository.getAllocationsByCreditNote(creditNote.id).some(a => (a.reversedAt ? businessDateKey(a.reversedAt) : a.allocationDate) > input.voidDate!))) throw new Error('Credit reversal precedes later settlement activity.');
        if (input.voidDate && input.voidDate < creditNote.creditDate) throw new Error('Credit reversal date precedes credit date.');
        if ((creditNote.amountRefunded ?? 0) > 0) throw new Error('Reverse customer refunds before voiding the credit.');
        const reason =
            input.reason.trim();

        if (
            reason.length < 3
        ) {
            throw new Error(
                "A void reason is required",
            );
        }

        const activeAllocations =
            creditNoteRepository
                .getAllocationsByCreditNote(
                    creditNote.id,
                )
                .filter(
                    (allocation) =>
                        allocation.status ===
                        "APPLIED",
                );

        if (
            activeAllocations.length >
            0
        ) {
            throw new Error(
                "Reverse all active credit allocations before voiding this credit note",
            );
        }

        const now =
            new Date().toISOString();

        const voided:
            CreditNote = {
            ...creditNote,

            status:
                "VOID",

            /*
             * No active allocations remain, so the
             * credit was fully available immediately
             * before being voided.
             *
             * After voiding it is no longer available
             * customer credit.
             */
            amountApplied: 0,
            amountAvailable: 0,

            voidedAt:
                input.voidDate ?? now,

            voidReason:
                reason,

            updatedAt:
                now,
        };

        creditNoteRepository.update(
            voided,
        );

        salesAccountingPostingService
            .reverseCreditNote(
                voided,
            );

        return voided;
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

            bankAccountId:
            string;

            reference?:
            string;

            notes?:
            string;
            operationId?: string;
        },
    ): Payment {
        assertCurrentCrossModuleWriteSafe();
        assertCurrentSalesWriteSafety();
        // A completed operation must never create another payment or GL entry.
        if (input.operationId) {
            const previous = financialOperationJournal.list().find(item => item.operationId === input.operationId);
            if (previous) {
                if (previous.kind !== "CUSTOMER_PAYMENT") throw new Error("Operation ID belongs to another business action.");
                throw new Error(previous.state === "COMPLETED"
                    ? "Payment already recorded; refresh the invoice before submitting again."
                    : "Payment operation is unresolved; manual review is required before retry.");
            }
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

        requireDateKey(input.paymentDate, "Payment date");
        if (input.paymentDate < currentInvoice.documentDate) throw new Error("Payment date cannot precede the invoice date.");
        const paymentOperationId = input.operationId ?? `sales-payment:${crypto.randomUUID()}`;
        const payment =
            paymentRepository.create({
                operationId: paymentOperationId,
                deferOperationCompletion: true,
                customerId:
                    currentInvoice.customerId,

                invoiceId:
                    currentInvoice.id,

                paymentDate:
                    input.paymentDate,

                amount,

                method:
                    input.method,

                bankAccountId:
                    input.bankAccountId,

                reference:
                    input.reference,

                notes:
                    input.notes,
            });

        this.recalculateInvoiceBalance(
            currentInvoice.id,
        );

        try {
            salesAccountingPostingService.postPayment(payment);
            const linked = journalEntryRepository.getBySource("CUSTOMER_PAYMENT", payment.id)
                .filter(entry => !entry.reversedJournalEntryId);
            if (linked.length !== 1 || linked[0].status !== "POSTED") throw new Error("Payment GL posting could not be verified uniquely.");
            financialOperationJournal.complete(paymentOperationId, payment.id);
        } catch (error) {
            try { financialOperationJournal.flagForReview(paymentOperationId, "Payment or GL posting uncertain; manual review required."); }
            catch { /* preserve original failure */ }
            throw error;
        }

        return payment;
    },

    voidInvoice(
        invoiceId: string,
        reason: string,
    ): Invoice {
        assertCurrentCrossModuleWriteSafe();
        assertCurrentSalesWriteSafety();
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

        const activeCreditAllocations =
            creditNoteRepository
                .getAllocationsByInvoice(
                    invoice.id,
                )
                .filter(
                    (allocation) =>
                        allocation.status ===
                        "APPLIED",
                );

        if (
            activeCreditAllocations.length >
            0
        ) {
            throw new Error(
                "This invoice has applied credits. Reverse all active credit allocations before voiding the invoice.",
            );
        }

        if(invoice.managedDraftId&&creditNoteRepository.getByInvoice(invoice.id).some(c=>c.status!=='VOID'))throw new Error('Void source credits before voiding this direct invoice.');
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

        const operationId = `sales-invoice-void:${invoiceId}`;
        const attempt = financialOperationJournal.begin(operationId, "SALES_INVOICE_VOID", invoiceId);
        if (attempt.status !== "started") {
            throw new Error("Invoice void was previously attempted; inspect GL and operation journal before retrying.");
        }
        try {
            const originals = journalEntryRepository.getBySource("CUSTOMER_INVOICE", invoiceId)
                .filter(entry => !entry.reversedJournalEntryId);
            if (originals.length !== 1 || originals[0].status !== "POSTED") {
                throw new Error("Invoice original GL must be uniquely posted before voiding.");
            }
            financialOperationJournal.bindResult(operationId, invoiceId);
            salesAccountingPostingService.reverseInvoice(updated);
            const reversed = journalEntryRepository.getBySource("CUSTOMER_INVOICE", invoiceId)
                .filter(entry => !entry.reversedJournalEntryId);
            if (reversed.length !== 1 || reversed[0].status !== "REVERSED") {
                throw new Error("Invoice GL reversal could not be verified.");
            }
            commitInvoices(invoices.map(item => item.id === invoiceId ? updated : item));
            financialOperationJournal.complete(operationId, invoiceId);
        } catch (error) {
            try { financialOperationJournal.flagForReview(operationId, "Invoice void/GL state uncertain; manual review required."); }
            catch { /* preserve original error */ }
            throw error;
        }
        return updated;
    },

    reverseInvoicePayment(
        paymentId: string,
        reason: string,
    ): Payment {
        assertSourceNotReconciled('CUSTOMER_PAYMENT',paymentId);
        assertCurrentCrossModuleWriteSafe();
        assertCurrentSalesWriteSafety();
        if (paymentRepository.getById(paymentId)?.depositApplicationId) throw new Error('Reverse this settlement through customer deposits.');
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

        const reversalOperationId = `sales-payment-reversal:${paymentId}`;
        const attempt = financialOperationJournal.begin(reversalOperationId, "SALES_PAYMENT_REVERSAL", paymentId);
        if (attempt.status !== "started") throw new Error("Payment reversal previously attempted; manual review required.");
        try {
            financialOperationJournal.bindResult(reversalOperationId, paymentId);
            const reversedPayment = paymentRepository.reverse(paymentId, reason);
            salesAccountingPostingService.reversePayment(reversedPayment);
            const originals = journalEntryRepository.getBySource("CUSTOMER_PAYMENT", paymentId)
                .filter(entry => !entry.reversedJournalEntryId);
            if (originals.length !== 1 || originals[0].status !== "REVERSED") {
                throw new Error("Payment GL reversal could not be verified.");
            }
            this.recalculateInvoiceBalance(invoice.id);
            financialOperationJournal.complete(reversalOperationId, paymentId);
            return reversedPayment;
        } catch (error) {
            try { financialOperationJournal.flagForReview(reversalOperationId, "Payment reversal/GL state uncertain; manual review required."); }
            catch { /* preserve original error */ }
            throw error;
        }
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

        commitInvoices(invoices.map(item => item.id === invoiceId ? updated : item));

        // Balance recalculation must never reverse the original invoice GL.
        // GL reversal belongs to an explicit, audited invoice-void workflow.
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
    return configuredNumber(prefix, existingNumbers, businessDateKey(new Date().toISOString()).slice(0,4));
}

function getToday() {
    return businessDateKey(new Date().toISOString());
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
registerRepository("sales", {
    repository: salesRepository, read: "sales.read",
    commands: {"createManagedOrder":null,"createManagedInvoice":null,"cancelManagedOrder":null,"if": null, "emitChange": null, "persistSalesDocuments": null, "createQuote": "sales.write", "updateDraftQuote": "sales.write", "sendQuote": "sales.write", "acceptQuote": "sales.manage", "declineQuote": "sales.manage", "convertQuoteToOrder": "sales.manage", "setFulfilmentStatus": null, "createInvoiceFromOrder": "sales.manage", "createCreditNoteFromInvoice": "sales.payment", "applyCreditToInvoice": "sales.payment", "reverseCreditAllocation": "sales.payment", "voidCreditNote": "sales.payment", "recordInvoicePayment": "sales.payment", "voidInvoice": "sales.payment", "reverseInvoicePayment": "sales.payment", "recalculateInvoiceBalance": null},
    validate: (value,snapshots) => {
        const saved=value as {quotes:Quote[];salesOrders:SalesOrder[];invoices:Invoice[]};
        for (const d of [...saved.quotes,...saved.salesOrders,...saved.invoices]) {
            validateRecipientSnapshot(d.recipient);
            for (const l of d.lines) {validateAreaSnapshot(l); validatePricingSnapshot(l);validateLineItemType(l,(snapshots.products as {products:import("../../inventory/types/product").Product[]}).products.find(p=>p.id===l.productId));}
        }
    },
    snapshot: () => ({ quotes, salesOrders, invoices }),
    restore: value => { quotes = value.quotes; salesOrders = value.salesOrders; invoices = value.invoices; snapshot = buildSnapshot(); },
    publish: () => listeners.forEach(listener => listener()),
});

/** Main-owned reviewed recovery only; original lines, dates and GL remain untouched. */
export function applyReviewedInvoiceSummary(id:string, summary:Pick<Invoice,'amountPaid'|'amountDue'|'status'>):void {
    commitInvoices(invoices.map(i=>i.id===id?{...i,...summary}:i));
}

export function purgeQuoteRecords(ids: Set<string>) {
 if(quotes.some(r=>ids.has(r.id)&&r.status!=='DRAFT')) throw new Error('Only draft quotes may be purged.');
 commitQuotes(quotes.filter(r=>!ids.has(r.id)));
}
