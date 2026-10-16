/** Read-only cross-boundary sales audit. Never changes balances, documents or journals. */
import type { Quote, SalesOrder, Invoice } from "../types/salesDocument";
import type { Payment } from "../types/payment";
import type { CreditNote, CreditAllocation } from "../types/creditNote";
import type { JournalEntry } from "../../accounting/types/journalEntry";

export type SalesAuditIssue = {
    code: string;
    entityId: string;
    message: string;
    severity: "BLOCK" | "REVIEW";
};
export type SalesAuditInput = {
    quotes: readonly Quote[];
    salesOrders: readonly SalesOrder[];
    invoices: readonly Invoice[];
    payments: readonly Payment[];
    creditNotes: readonly CreditNote[];
    allocations: readonly CreditAllocation[];
    journals: readonly JournalEntry[];
};
const cents = (value: number) => Math.round(value * 100);

export function auditSalesConsistency(data: SalesAuditInput): SalesAuditIssue[] {
    const issues: SalesAuditIssue[] = [];
    const add = (code: string, entityId: string, message: string, severity: SalesAuditIssue["severity"] = "BLOCK") =>
        issues.push({ code, entityId, message, severity });
    const orders = new Map(data.salesOrders.map(order => [order.id, order]));
    const invoices = new Map(data.invoices.map(invoice => [invoice.id, invoice]));
    const credits = new Map(data.creditNotes.map(note => [note.id, note]));
    const checkUnique = (items: readonly { id: string }[], type: string) => {
        const seen = new Set<string>();
        for (const item of items) {
            if (seen.has(item.id)) add("DUPLICATE_ID", item.id, `Duplicate ${type} identifier`);
            seen.add(item.id);
        }
    };
    checkUnique(data.quotes, "Quote");
    checkUnique(data.salesOrders, "Sales Order");
    checkUnique(data.invoices, "Invoice");
    checkUnique(data.payments, "Payment");
    checkUnique(data.creditNotes, "Credit Note");
    checkUnique(data.allocations, "Credit Allocation");
    for (const quote of data.quotes) {
        if (quote.status === "CONVERTED" && (!quote.convertedSalesOrderId || orders.get(quote.convertedSalesOrderId)?.sourceQuoteId !== quote.id))
            add("QUOTE_ORDER_LINK", quote.id, "Converted quote is missing its linked order");
    }
    for (const order of data.salesOrders) {
        if (order.sourceQuoteId && !data.quotes.some(q => q.id === order.sourceQuoteId && q.convertedSalesOrderId === order.id))
            add("ORDER_QUOTE_LINK", order.id, "Sales order has no matching converted quote");
        for (const id of order.invoiceIds) {
            if (invoices.get(id)?.sourceSalesOrderId !== order.id)
                add("ORDER_INVOICE_LINK", order.id, `Order invoice ${id} is missing or has a different source order`);
        }
    }
    for (const invoice of data.invoices) {
        if (invoice.sourceSalesOrderId && !orders.get(invoice.sourceSalesOrderId)?.invoiceIds.includes(invoice.id))
            add("INVOICE_ORDER_LINK", invoice.id, "Invoice is not referenced by its source order");
        const received = data.payments.filter(p => p.invoiceId === invoice.id && p.status === "RECEIVED");
        const allocated = data.allocations.filter(a => a.invoiceId === invoice.id && a.status === "APPLIED");
        const paid = received.reduce((sum, p) => sum + cents(p.amount), 0);
        const credited = allocated.reduce((sum, a) => sum + cents(a.amount), 0);
        if (invoice.status !== "VOID") {
            if (cents(invoice.amountPaid) !== paid)
                add("INVOICE_PAID_MISMATCH", invoice.id, "Invoice amountPaid differs from received payments");
            if (cents(invoice.amountDue) !== Math.max(0, cents(invoice.totals.total) - paid - credited))
                add("INVOICE_DUE_MISMATCH", invoice.id, "Invoice amountDue differs from payments and applied credits");
            if (paid + credited > cents(invoice.totals.total))
                add("INVOICE_OVERALLOCATED", invoice.id, "Payments and credits exceed invoice total");
        } else if (received.length || allocated.length) {
            add("VOID_INVOICE_HAS_SETTLEMENT", invoice.id, "Voided invoice has active payments or allocations");
        }
    }
    // Cross-store recovery diagnostics: report inconsistencies; never auto-repost or auto-reverse.
    for (const invoice of data.invoices) {
        const originals = data.journals.filter(j => j.sourceType === "CUSTOMER_INVOICE" && j.sourceId === invoice.id && !j.reversedJournalEntryId);
        if (originals.some(j => j.status === "REVERSED") && invoice.status !== "VOID")
            add("ACTIVE_INVOICE_GL_REVERSED", invoice.id, "Active invoice has a reversed original GL journal");
        if (invoice.status === "VOID" && originals.some(j => j.status === "POSTED"))
            add("VOID_INVOICE_GL_ACTIVE", invoice.id, "Voided invoice still has an active original GL journal");
        if (originals.length > 1)
            add("DUPLICATE_INVOICE_ORIGINAL_GL", invoice.id, "More than one original invoice journal exists");
    }
    for (const payment of data.payments) {
        const originals = data.journals.filter(j => j.sourceType === "CUSTOMER_PAYMENT" && j.sourceId === payment.id && !j.reversedJournalEntryId);
        if (payment.status === "RECEIVED" && originals.some(j => j.status === "REVERSED"))
            add("RECEIVED_PAYMENT_GL_REVERSED", payment.id, "Received payment has a reversed GL journal");
        if (payment.status === "REVERSED" && originals.some(j => j.status === "POSTED"))
            add("REVERSED_PAYMENT_GL_ACTIVE", payment.id, "Reversed payment still has an active original GL journal");
        if (originals.length > 1)
            add("DUPLICATE_PAYMENT_ORIGINAL_GL", payment.id, "More than one original payment journal exists");
    }
    for (const note of data.creditNotes) {
        const originals = data.journals.filter(j => j.sourceType === "CREDIT_NOTE" && j.sourceId === note.id && !j.reversedJournalEntryId);
        if (note.status === "VOID" && originals.some(j => j.status === "POSTED"))
            add("VOID_CREDIT_GL_ACTIVE", note.id, "Voided credit note still has an active original GL journal");
        if (note.status !== "VOID" && originals.some(j => j.status === "REVERSED"))
            add("ACTIVE_CREDIT_GL_REVERSED", note.id, "Active credit note has a reversed original GL journal");
        if (originals.length > 1)
            add("DUPLICATE_CREDIT_ORIGINAL_GL", note.id, "More than one original credit journal exists");
    }
    for (const journal of data.journals) {
        if (journal.status !== "POSTED" || !journal.sourceId || journal.reversedJournalEntryId) continue;
        if (journal.sourceType === "CUSTOMER_INVOICE" && !invoices.has(journal.sourceId))
            add("ORPHAN_INVOICE_GL", journal.id, "Invoice GL journal has no matching business invoice");
        if (journal.sourceType === "CUSTOMER_PAYMENT" && !data.payments.some(p => p.id === journal.sourceId))
            add("ORPHAN_PAYMENT_GL", journal.id, "Payment GL journal has no matching payment");
        if (journal.sourceType === "CREDIT_NOTE" && !credits.has(journal.sourceId))
            add("ORPHAN_CREDIT_GL", journal.id, "Credit GL journal has no matching credit note");
    }
    for (const payment of data.payments) {
        const invoice = invoices.get(payment.invoiceId);
        if (!invoice || invoice.customerId !== payment.customerId)
            add("PAYMENT_INVOICE_LINK", payment.id, "Payment invoice missing or customer mismatch");
    }
    for (const note of data.creditNotes) {
        const invoice = invoices.get(note.sourceInvoiceId);
        if (!note.openingBalanceImportId && (!invoice || invoice.customerId !== note.customerId))
            add("CREDIT_SOURCE_LINK", note.id, "Credit note source invoice missing or customer mismatch");
        const active = data.allocations.filter(a => a.creditNoteId === note.id && a.status === "APPLIED");
        const applied = active.reduce((sum, a) => sum + cents(a.amount), 0);
        if (cents(note.amountApplied) !== applied)
            add("CREDIT_APPLIED_MISMATCH", note.id, "Credit note amountApplied differs from allocations");
        if (note.status === "VOID" ? (applied !== 0 || cents(note.amountAvailable) !== 0) : cents(note.amountAvailable) !== cents(note.totals.total) - applied - cents(note.amountRefunded ?? 0))
            add("CREDIT_AVAILABLE_MISMATCH", note.id, "Credit note amountAvailable is inconsistent");
    }
    for (const allocation of data.allocations) {
        const note = credits.get(allocation.creditNoteId);
        const invoice = invoices.get(allocation.invoiceId);
        if (!note || !invoice || note.customerId !== allocation.customerId || invoice.customerId !== allocation.customerId)
            add("ALLOCATION_LINK", allocation.id, "Credit allocation references missing or different-customer documents");
        if (allocation.status === "APPLIED" && note?.status === "VOID")
            add("VOID_CREDIT_ALLOCATED", allocation.id, "Allocation remains active on a void credit note");
    }
    // A source with more than one active posting is unsafe to retry automatically.
    const seenPostings = new Map<string, string>();
    for (const journal of data.journals) {
        if (journal.status !== "POSTED" || !journal.sourceId || !["CUSTOMER_INVOICE", "CUSTOMER_PAYMENT", "CREDIT_NOTE"].includes(journal.sourceType)) continue;
        const key = `${journal.sourceType}:${journal.sourceId}`;
        if (seenPostings.has(key)) add("DUPLICATE_GL_SOURCE", journal.id, `Multiple active GL journals for ${key}`);
        else seenPostings.set(key, journal.id);
    }
    return issues;
}
