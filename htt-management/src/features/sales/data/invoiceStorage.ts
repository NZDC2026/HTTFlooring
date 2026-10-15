/** Business-document snapshot only. GL posting remains a separate durable boundary. */
import { canWriteMockRepository, readMockRepository, writeMockRepository } from "../../../lib/persistence/mockRepositoryStorage";
import { isQuoteOrderState } from "./salesOrderStorage";
import type { Invoice, Quote, SalesOrder } from "../types/salesDocument";

export const INVOICE_STORAGE_KEY = "htt.mock.sales.documents.v1";
export type SalesDocumentState = { quotes: Quote[]; salesOrders: SalesOrder[]; invoices: Invoice[] };

export function isInvoiceList(value: unknown): value is Invoice[] {
    return Array.isArray(value) && value.every((item: unknown) => {
        if (!item || typeof item !== "object") return false;
        const invoice = item as Record<string, unknown>;
        if (invoice.type !== "INVOICE" || !["DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "OVERDUE", "VOID"].includes(String(invoice.status))) return false;
        if (!["id", "documentNumber", "customerId", "documentDate", "dueDate", "createdAt", "updatedAt"].every(k => typeof invoice[k] === "string" && (invoice[k] as string).length > 0)) return false;
        if (!Array.isArray(invoice.lines) || !invoice.totals || typeof invoice.totals !== "object") return false;
        const totals = invoice.totals as Record<string, unknown>;
        return ["subtotal", "taxAmount", "total"].every(k => typeof totals[k] === "number" && Number.isFinite(totals[k])) &&
            ["amountPaid", "amountDue"].every(k => typeof invoice[k] === "number" && Number.isFinite(invoice[k]) && (invoice[k] as number) >= 0);
    });
}

export function isSalesDocumentState(value: unknown): value is SalesDocumentState {
    if (!value || typeof value !== "object") return false;
    const state = value as Record<string, unknown>;
    const rawInvoices = state.invoices;
    if (!isQuoteOrderState(state) || !isInvoiceList(rawInvoices)) return false;
    const orders: SalesOrder[] = state.salesOrders;
    const invoices: Invoice[] = rawInvoices;
    const invoiceIds = new Set<string>();
    for (const invoice of invoices) {
        if (invoiceIds.has(invoice.id)) return false;
        invoiceIds.add(invoice.id);
        if (invoice.sourceSalesOrderId && !orders.some(order => order.id === invoice.sourceSalesOrderId && order.invoiceIds.includes(invoice.id))) return false;
    }
    return orders.every(order => order.invoiceIds.every(id => invoices.some(invoice => invoice.id === id && invoice.sourceSalesOrderId === order.id)));
}

export function loadSalesDocuments() {
    return readMockRepository(INVOICE_STORAGE_KEY, isSalesDocumentState);
}

export function persistSalesDocuments(state: SalesDocumentState): void {
    if (!isSalesDocumentState(state)) throw new Error("Sales document relationships are invalid; changes were not applied.");
    const current = loadSalesDocuments();
    if (current.status === "invalid" || current.status === "unavailable" || !canWriteMockRepository(INVOICE_STORAGE_KEY))
        throw new Error("Sales document storage is unavailable or invalid; changes were not applied.");
    if (!writeMockRepository(INVOICE_STORAGE_KEY, state))
        throw new Error("Failed to persist sales documents; changes were not applied.");
}
