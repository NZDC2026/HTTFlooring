import { Link } from "react-router-dom";
import { useSyncExternalStore } from "react";
import { businessSettings } from "../../business-workspace/configurationState";
import { useCustomerSalesDocuments } from "../../sales/data/useSalesDocuments";
import { useCustomerAccountsReceivable } from "../../sales/data/useAccountsReceivable";
import { salesFulfilmentRepository } from "../../sales/data/salesFulfilmentRepository";
import { isStockLine } from "../../inventory/data/itemTypes";
import type { Customer } from "../types/customer";

export function CustomerOverviewSales({ customer }: { customer: Customer }) {
    const documents = useCustomerSalesDocuments(customer.id);
    const ar = useCustomerAccountsReceivable(customer);
    const fulfilments = useSyncExternalStore(salesFulfilmentRepository.subscribe, salesFulfilmentRepository.getSnapshot, salesFulfilmentRepository.getSnapshot);
    const orders = documents.filter(document => document.type === "SALES_ORDER").sort((a, b) => b.documentDate.localeCompare(a.documentDate) || b.createdAt.localeCompare(a.createdAt));
    const money = (value: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: businessSettings().currency }).format(value);
    const deliveries = orders.map(order => {
        const stockLines = order.lines.filter(isStockLine);
        const active = fulfilments.filter(item => item.salesOrderId === order.id && item.status === "ACTIVE");
        const quantities = stockLines.map(line => ({ ordered: line.quantity, shipped: active.flatMap(item => item.lines).filter(item => item.salesOrderLineId === line.id).reduce((sum, item) => sum + item.fulfilledQuantity, 0) }));
        const delivery = order.status === "CANCELLED" ? "Cancelled" : stockLines.length === 0 ? "No shipment required" : quantities.every(item => item.shipped >= item.ordered - 0.000001) ? "Shipped" : quantities.some(item => item.shipped > 0) ? "Partially shipped" : "Not shipped";
        return { order, delivery };
    });
    return <section className="mb-6 space-y-4" aria-label="Customer sales summary">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
                { label: "Outstanding invoices", value: money(ar.totalOutstanding), detail: `${ar.outstandingInvoiceCount} invoices` },
                { label: "Overdue", value: money(ar.overdueAmount), detail: `${ar.overdueInvoiceCount} overdue invoices` },
                { label: "Credit limit", value: money(ar.creditLimit), detail: "Approved customer credit limit" },
                { label: "Available credit", value: money(ar.availableCredit), detail: "Remaining credit based on current account balance" },
                { label: "Unallocated credits", value: money(ar.unallocatedCredit), detail: "Unused credit note balance" },
                { label: "Net account balance", value: money(ar.netAccountBalance), detail: "Outstanding invoices less unallocated credits" },
                { label: "Shipped orders", value: deliveries.filter(item => item.delivery === "Shipped").length, detail: "Fully shipped" },
                { label: "Awaiting shipment", value: deliveries.filter(item => ["Not shipped", "Partially shipped"].includes(item.delivery)).length, detail: "Includes partially shipped orders" },
            ].map(item => <div key={item.label} className="rounded-xl border border-[var(--color-border)] bg-white p-4"><p className="text-xs text-[var(--color-text-secondary)]">{item.label}</p><p className="mt-2 text-2xl font-semibold">{item.value}</p><p className="mt-1 text-xs text-[var(--color-text-muted)]">{item.detail}</p></div>)}
        </div>
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 p-4"><h2 className="font-display text-xl">Recent orders</h2><Link className="text-sm underline" to={`/contacts/customers/${customer.id}/sales`}>View all sales &amp; overdue invoices →</Link></div>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-[var(--color-surface-muted)]"><tr>{["Order", "Date", "Promised date", "Shipment", "Order status", "Total"].map(label => <th key={label} className="whitespace-nowrap px-4 py-3 font-medium">{label}</th>)}</tr></thead><tbody>
                {deliveries.slice(0, 5).map(({ order, delivery }) => <tr key={order.id} className="border-t border-[var(--color-border)]"><td className="px-4 py-3"><Link className="underline" to={`/sales/orders/${order.id}`}>{order.documentNumber}</Link></td><td className="whitespace-nowrap px-4 py-3">{order.documentDate}</td><td className="px-4 py-3">{order.requestedDeliveryDate || "—"}</td><td className="whitespace-nowrap px-4 py-3">{delivery}</td><td className="px-4 py-3">{order.status.replaceAll("_", " ")}</td><td className="whitespace-nowrap px-4 py-3">{money(order.totals.total)}</td></tr>)}
                {!orders.length && <tr><td colSpan={6} className="p-4 text-[var(--color-text-muted)]">No orders recorded for this customer.</td></tr>}
            </tbody></table></div>
        </div>
    </section>;
}
