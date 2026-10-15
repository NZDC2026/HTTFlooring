/** Single-write Quote/Sales Order snapshot for conversion and order status updates.
 * Legacy quote-only storage is read when no combined snapshot exists.
 */
import { canWriteMockRepository, readMockRepository, writeMockRepository } from "../../../lib/persistence/mockRepositoryStorage";
import { isQuoteList, loadQuotes } from "./quoteStorage";
import type { Quote, SalesOrder } from "../types/salesDocument";

export const SALES_ORDER_STORAGE_KEY = "htt.mock.sales.quote-orders.v1";

export type QuoteOrderState = { quotes: Quote[]; salesOrders: SalesOrder[] };

export function isSalesOrderList(value: unknown): value is SalesOrder[] {
    return Array.isArray(value) && value.every((item: unknown) => {
        if (!item || typeof item !== "object") return false;
        const order = item as Record<string, unknown>;
        if (order.type !== "SALES_ORDER" || !["CONFIRMED", "PARTIALLY_FULFILLED", "FULFILLED", "INVOICED", "CANCELLED"].includes(String(order.status))) return false;
        if (!["id", "documentNumber", "customerId", "documentDate", "createdAt", "updatedAt"].every(k => typeof order[k] === "string" && (order[k] as string).length > 0)) return false;
        if (!Array.isArray(order.invoiceIds) || !order.invoiceIds.every(id => typeof id === "string")) return false;
        if (!Array.isArray(order.lines) || !order.totals || typeof order.totals !== "object") return false;
        const totals = order.totals as Record<string, unknown>;
        return ["subtotal", "taxAmount", "total"].every(k => typeof totals[k] === "number" && Number.isFinite(totals[k]));
    });
}

export function isQuoteOrderState(value: unknown): value is QuoteOrderState {
    if (!value || typeof value !== "object") return false;
    const state = value as Record<string, unknown>;
    if (!isQuoteList(state.quotes) || !isSalesOrderList(state.salesOrders)) return false;
    const orders = state.salesOrders;
    const quotes = state.quotes;
    const ids = new Set<string>();
    for (const order of orders) {
        if (ids.has(order.id)) return false;
        ids.add(order.id);
    }
    return quotes.every(q => q.status !== "CONVERTED" ||
        (typeof q.convertedSalesOrderId === "string" && orders.some(o => o.id === q.convertedSalesOrderId && o.sourceQuoteId === q.id)));
}

export function loadQuoteOrders() {
    return readMockRepository(SALES_ORDER_STORAGE_KEY, isQuoteOrderState);
}

export function persistQuoteOrders(state: QuoteOrderState): void {
    if (!isQuoteOrderState(state)) throw new Error("Quote/order relationship is invalid; changes were not applied.");
    const combined = loadQuoteOrders();
    const legacy = loadQuotes();
    if (combined.status === "invalid" || combined.status === "unavailable" || legacy.status === "invalid" || legacy.status === "unavailable" || !canWriteMockRepository(SALES_ORDER_STORAGE_KEY))
        throw new Error("Quote/order storage is unavailable or invalid; changes were not applied.");
    if (!writeMockRepository(SALES_ORDER_STORAGE_KEY, state))
        throw new Error("Failed to persist quote/order state; changes were not applied.");
}
