import type {
    Product,
    ProductUnit,
} from "../../inventory/types/product";

export type SalesDocumentType =
    | "QUOTE"
    | "SALES_ORDER"
    | "INVOICE";

export type QuoteStatus =
    | "DRAFT"
    | "SENT"
    | "ACCEPTED"
    | "DECLINED"
    | "EXPIRED"
    | "CONVERTED";

export type SalesOrderStatus =
    | "DRAFT"
    | "CONFIRMED"
    | "PARTIALLY_FULFILLED"
    | "FULFILLED"
    | "CANCELLED"
    | "INVOICED";

export type InvoiceStatus =
    | "DRAFT"
    | "ISSUED"
    | "PARTIALLY_PAID"
    | "PAID"
    | "OVERDUE"
    | "VOID";

export type SalesDocumentStatus =
    | QuoteStatus
    | SalesOrderStatus
    | InvoiceStatus;

export type SalesPriceSource =
    | "STANDARD_PRICE"
    | "CUSTOMER_PRICE"
    | "MANUAL";

export interface SalesDocumentLine {
    id: string;

    productId: string;
    unitId: string;

    /**
     * Snapshot values.
     *
     * These remain on the sales document even if
     * the Product master data changes later.
     */
    sku: string;
    description: string;
    unitSymbol: string;

    quantity: number;

    /**
     * Standard product price at the time the line
     * was priced.
     */
    standardUnitPrice: number;

    /**
     * Actual selling price stored on the document.
     */
    unitPrice: number;

    priceSource: SalesPriceSource;

    /**
     * Reference to the customer pricing rule that
     * produced the price, when applicable.
     */
    customerPriceId?: string;

    discountAmount: number;
    discountPercent: number;

    lineSubtotal: number;
    taxAmount: number;
    lineTotal: number;
}

export interface SalesDocumentTotals {
    subtotal: number;
    taxAmount: number;
    total: number;
}

interface SalesDocumentBase {
    id: string;

    documentNumber: string;

    customerId: string;

    documentDate: string;

    status: SalesDocumentStatus;

    customerReference?: string;
    notes?: string;

    lines: SalesDocumentLine[];

    totals: SalesDocumentTotals;

    createdAt: string;
    updatedAt: string;
}

export interface Quote
    extends SalesDocumentBase {
    type: "QUOTE";

    status: QuoteStatus;

    expiryDate?: string;

    convertedSalesOrderId?: string;
}

export interface SalesOrder
    extends SalesDocumentBase {
    type: "SALES_ORDER";

    status: SalesOrderStatus;

    requestedDeliveryDate?: string;

    sourceQuoteId?: string;

    invoiceIds: string[];
}

export interface Invoice
    extends SalesDocumentBase {
    type: "INVOICE";

    status: InvoiceStatus;

    dueDate: string;

    sourceSalesOrderId?: string;

    amountPaid: number;
    amountDue: number;
}

export type SalesDocument =
    | Quote
    | SalesOrder
    | Invoice;

export interface SalesLineDraft {
    productId: string;
    unitId: string;
    quantity: number;

    /**
     * Optional manual price override.
     *
     * When omitted, the Pricing Engine determines
     * the selling price.
     */
    unitPrice?: number;
}

export interface SalesDocumentDraft {
    customerId: string;
    documentDate: string;

    customerReference?: string;
    notes?: string;

    lines: SalesLineDraft[];
}

export interface QuoteLineUpdateDraft {
    lineId?: string;

    productId: string;
    unitId: string;
    quantity: number;

    standardUnitPrice: number;
    unitPrice: number;

    priceSource: SalesPriceSource;
    customerPriceId?: string;
}

export interface QuoteUpdateDraft {
    documentDate: string;
    expiryDate?: string;

    customerReference?: string;
    notes?: string;

    lines: QuoteLineUpdateDraft[];
}

export interface ProductSalesReference {
    product: Product;
    unit: ProductUnit;
}