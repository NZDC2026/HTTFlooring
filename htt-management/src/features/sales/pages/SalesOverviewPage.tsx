import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Eye, FileText, ReceiptText, Search, ShoppingCart, X } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "../../../components/ui/Badge";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { DemoTable, TableEmptyRow, TableAction } from "../../../components/ui/DemoTable";
import { Button } from "../../../components/ui/Button";
import { customerRepository } from "../../contacts/data/customerRepository";
import { useSalesDocuments } from "../data/useSalesDocuments";
import type { SalesDocument, SalesDocumentType } from "../types/salesDocument";

type Tab = "ALL" | SalesDocumentType;
const tabs: { value: Tab; label: string }[] = [
    { value: "ALL", label: "All documents" },
    { value: "QUOTE", label: "Quotes" },
    { value: "SALES_ORDER", label: "Sales orders" },
    { value: "INVOICE", label: "Invoices" },
];

export function getSalesDocumentPath(document: SalesDocument): string {
    if (document.type === "QUOTE") return `/sales/quotes/${document.id}`;
    if (document.type === "SALES_ORDER") return `/sales/orders/${document.id}`;
    return `/sales/invoices/${document.id}`;
}

export function SalesOverviewPage() {
    const documents = useSalesDocuments();
    const [tab, setTab] = useState<Tab>("ALL");
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("ALL");
    const [preview, setPreview] = useState<SalesDocument | null>(null);
    useEffect(() => {
        if (!preview) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setPreview(null);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [preview]);
    const currency = useMemo(() => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }), []);
    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return documents.filter((document) => {
            if (tab !== "ALL" && document.type !== tab) return false;
            if (status !== "ALL" && document.status !== status) return false;
            const customer = customerRepository.getById(document.customerId);
            return !needle || [document.documentNumber, customer?.businessName ?? "", document.customerReference ?? ""]
                .some((text) => text.toLowerCase().includes(needle));
        }).sort((a, b) => b.documentDate.localeCompare(a.documentDate));
    }, [documents, query, status, tab]);
    const statuses = [...new Set(documents.filter((d) => tab === "ALL" || d.type === tab).map((d) => d.status))].sort();
    const counts = { quotes: documents.filter((d) => d.type === "QUOTE").length, orders: documents.filter((d) => d.type === "SALES_ORDER").length, invoices: documents.filter((d) => d.type === "INVOICE").length };

    return (
        <div className="space-y-6 pb-8">
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">Sales workspace</p>
                    <h1 className="mt-1 font-display text-3xl">Sales overview</h1>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Explore quotes, customer orders and invoices in one place.</p>
                </div>
                <Badge variant="info">Demo data · AUD</Badge>
            </header>

            <div className="grid gap-4 md:grid-cols-3">
                {[
                    { label: "Quotes", value: counts.quotes, icon: FileText, tab: "QUOTE" as Tab },
                    { label: "Sales orders", value: counts.orders, icon: ShoppingCart, tab: "SALES_ORDER" as Tab },
                    { label: "Invoices", value: counts.invoices, icon: ReceiptText, tab: "INVOICE" as Tab },
                ].map(({ label, value, icon: Icon, tab: nextTab }) => (
                    <button key={label} type="button" onClick={() => { setTab(nextTab); setStatus("ALL"); }} className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-white p-5 text-left shadow-sm transition hover:shadow-md">
                        <div><p className="text-sm text-[var(--color-text-secondary)]">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>
                        <Icon size={24} className="text-[var(--color-accent)]" />
                    </button>
                ))}
            </div>

            <section className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-sm">
                <div className="flex flex-wrap gap-2 border-b border-[var(--color-border)] p-4">
                    {tabs.map((item) => <button key={item.value} type="button" onClick={() => { setTab(item.value); setStatus("ALL"); }} className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === item.value ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]"}`}>{item.label}</button>)}
                </div>
                <div className="flex flex-wrap items-center gap-3 p-4">
                    <label className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2"><Search size={16} className="text-[var(--color-text-muted)]" /><input aria-label="Search sales documents" className="w-full bg-transparent text-sm outline-none" placeholder="Search number or customer" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
                    <select aria-label="Filter status" value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm"><option value="ALL">All statuses</option>{statuses.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select>
                    <span className="text-xs text-[var(--color-text-muted)]">{filtered.length} records</span>
                </div>
                <div className="overflow-x-auto"><DemoTable><thead className="bg-[var(--color-surface-muted)] text-xs uppercase tracking-wide text-[var(--color-text-secondary)]"><tr><th className="px-5 py-3">Document</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Total (AUD)</th><th className="px-5 py-3">Actions</th></tr></thead><tbody>{filtered.map((document) => <tr key={`${document.type}-${document.id}`} className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]"><td className="px-5 py-4"><Link to={getSalesDocumentPath(document)} className="font-semibold text-[var(--color-primary)] hover:underline">{document.documentNumber}</Link><div className="mt-1 text-xs text-[var(--color-text-muted)]">{document.type.replaceAll("_", " ")}</div></td><td className="px-5 py-4">{customerRepository.getById(document.customerId)?.businessName ?? "Unknown customer"}</td><td className="px-5 py-4">{document.documentDate}</td><td className="px-5 py-4"><StatusBadge status={document.status} /></td><td className="px-5 py-4 text-right font-medium">{currency.format(document.totals.total)}</td><td className="px-5 py-4"><TableAction><Button variant="ghost" size="sm" aria-label={`Preview ${document.documentNumber}`} title="Quick preview" onClick={() => setPreview(document)}><Eye size={16} /> Preview</Button><Link aria-label={`Open ${document.documentNumber}`} title="Open full details" to={getSalesDocumentPath(document)}><ArrowRight size={17} /></Link></TableAction></td></tr>)}{filtered.length === 0 && <TableEmptyRow colSpan={6} title="No matching sales documents" description="Try changing the search or status filter." />}</tbody></DemoTable></div>
            </section>
            {preview && <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setPreview(null); }}>
                <section role="dialog" aria-modal="true" aria-label="Sales document preview" aria-describedby="sales-preview-description" className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                    <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase text-[var(--color-text-muted)]">{preview.type.replaceAll("_", " ")}</p><h2 className="mt-1 font-display text-2xl">{preview.documentNumber}</h2></div><button type="button" aria-label="Close preview" onClick={() => setPreview(null)}><X size={20} /></button></div>
                    <p id="sales-preview-description" className="sr-only">Read-only sales document summary. Press Escape to close.</p><dl className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-[var(--color-text-muted)]">Customer</dt><dd className="mt-1 font-semibold">{customerRepository.getById(preview.customerId)?.businessName ?? "Unknown customer"}</dd></div><div><dt className="text-[var(--color-text-muted)]">Status</dt><dd className="mt-1">{preview.status.replaceAll("_", " ")}</dd></div><div><dt className="text-[var(--color-text-muted)]">Document date</dt><dd className="mt-1">{preview.documentDate}</dd></div><div><dt className="text-[var(--color-text-muted)]">Total incl. GST</dt><dd className="mt-1 font-semibold">{currency.format(preview.totals.total)}</dd></div></dl>
                    <div className="mt-6 flex justify-end gap-3"><button type="button" className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm" onClick={() => setPreview(null)}>Close</button><Link className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white" to={getSalesDocumentPath(preview)} onClick={() => setPreview(null)}>Full details <ArrowRight size={15} /></Link></div>
                </section>
            </div>}
        </div>
    );
}
