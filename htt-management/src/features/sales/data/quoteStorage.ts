/** Local persistence for non-posting Quote operations only.
 * Conversion to Sales Order is deliberately excluded until both documents
 * can be committed consistently in the same storage transaction.
 */
import { canWriteMockRepository, readMockRepository, writeMockRepository } from "../../../lib/persistence/mockRepositoryStorage";
import type { Quote } from "../types/salesDocument";

export const QUOTE_STORAGE_KEY = "htt.mock.sales.quotes.v1";
const statuses = new Set(["DRAFT", "SENT", "ACCEPTED", "DECLINED", "EXPIRED", "CONVERTED"]);

export function isQuoteList(value: unknown): value is Quote[] {
    return Array.isArray(value) && value.every((entry: unknown) => {
        if (!entry || typeof entry !== "object") return false;
        const q = entry as Record<string, unknown>;
        if (q.type !== "QUOTE" || !statuses.has(String(q.status))) return false;
        if (!["id", "documentNumber", "customerId", "documentDate", "createdAt", "updatedAt"].every(k => typeof q[k] === "string" && (q[k] as string).length > 0)) return false;
        if (!Array.isArray(q.lines) || !q.totals || typeof q.totals !== "object") return false;
        const totals = q.totals as Record<string, unknown>;
        if (!["subtotal", "taxAmount", "total"].every(k => typeof totals[k] === "number" && Number.isFinite(totals[k]))) return false;
        return q.lines.every((line: unknown) => {
            if (!line || typeof line !== "object") return false;
            const l = line as Record<string, unknown>;
            return ["id", "productId", "unitId", "sku", "description", "unitSymbol"].every(k => typeof l[k] === "string") &&
                ["quantity", "unitPrice", "standardUnitPrice", "lineSubtotal", "taxAmount", "lineTotal", "discountAmount", "discountPercent"].every(k => typeof l[k] === "number" && Number.isFinite(l[k]));
        });
    });
}

export function loadQuotes() {
    return readMockRepository(QUOTE_STORAGE_KEY, isQuoteList);
}

export function persistQuotes(quotes: Quote[]): void {
    const current = loadQuotes();
    if (current.status === "invalid" || !canWriteMockRepository(QUOTE_STORAGE_KEY))
        throw new Error("Quote storage is unavailable or invalid; changes were not applied.");
    if (!writeMockRepository(QUOTE_STORAGE_KEY, quotes))
        throw new Error("Failed to persist quotes; changes were not applied.");
}
