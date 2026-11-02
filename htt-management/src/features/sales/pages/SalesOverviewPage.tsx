import { DataTable } from '../../../components/data-table/DataTable';
import { SalesDeliverySummary } from '../components/SalesDeliveryFields';
import {usePermission} from '../../security/usePermission';
import { businessSettings } from '../../business-workspace/configurationState';
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Eye, FileText, ReceiptText, Search, ShoppingCart, X } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "../../../components/ui/Badge";
import { StatusBadge } from "../../../components/ui/StatusBadge";
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
    const canManage=usePermission('sales.manage');
    const canReadCost=usePermission('inventory.cost.read');
    const documents = useSalesDocuments();
    const [tab, setTab] = useState<Tab>("ALL");
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("ALL");
    const [dateMode, setDateMode] = useState<"day" | "range">("day");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [preview, setPreview] = useState<SalesDocument | null>(null);
    useEffect(() => {
        if (!preview) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setPreview(null);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [preview]);
    const currency = useMemo(() => new Intl.NumberFormat("en-AU", { style: "currency", currency: businessSettings().currency }), []);
    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return documents.filter((document) => {
            if (tab !== "ALL" && document.type !== tab) return false;
            if (status !== "ALL" && document.status !== status) return false;
            if (dateMode === "day" && dateFrom && document.documentDate !== dateFrom) return false;
            if (dateMode === "range" && ((dateFrom && document.documentDate < dateFrom) || (dateTo && document.documentDate > dateTo))) return false;
            const customer = customerRepository.getById(document.customerId);
            return !needle || [document.recipient?.locationName, document.recipient?.accountingEmail, document.documentNumber, customer?.businessName ?? "", document.customerReference ?? ""]
                .some((text) => (text ?? '').toLowerCase().includes(needle));
        }).sort((a, b) => b.documentDate.localeCompare(a.documentDate));
    }, [documents, query, status, tab, dateMode, dateFrom, dateTo]);
    const filteredTotal = filtered.reduce((sum, document) => sum + Math.round(document.totals.total * 100), 0) / 100;
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
                <Badge variant="info">Local business · {businessSettings().currency}</Badge>
            </header>

            <nav aria-label="Sales actions" className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap">
                {[
                    ...(canManage ? [
                        { to: "/sales/drafts/orders/new", label: "New sales order" },
                        { to: "/sales/drafts/invoices/new", label: "New direct invoice" },
                    ] : []),
                    { to: "/sales/drafts/orders", label: "Order drafts" },
                    { to: "/sales/drafts/invoices", label: "Invoice drafts" },
                    { to: "/sales/customer-deposits", label: "Customer deposits" },
                    ...(canReadCost ? [{ to: "/sales/customer-returns", label: "Physical customer returns" }] : []),
                    { to: "/documents/delivery", label: "Document preparation" },
                ].map(({ to, label }) => (
                    <Link
                        key={to}
                        to={to}
                        className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                    >
                        {label}
                    </Link>
                ))}
            </nav>
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
                    <label className="flex items-center gap-2 text-sm">Type
                        <select aria-label="Filter type" value={tab} onChange={(event) => { setTab(event.target.value as Tab); setStatus("ALL"); }} className="h-10 rounded-lg border border-[var(--color-border)] bg-white px-3">
                            {tabs.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                        </select>
                    </label>
                    <label className="flex items-center gap-2 text-sm">Document date
                        <select aria-label="Date filter mode" value={dateMode} onChange={(event) => { setDateMode(event.target.value as "day" | "range"); setDateTo(""); }} className="h-10 rounded-lg border border-[var(--color-border)] bg-white px-3">
                            <option value="day">Single day</option><option value="range">Date range</option>
                        </select>
                    </label>
                    <input type="date" aria-label={dateMode === "day" ? "Document date" : "From date"} value={dateFrom} max={dateMode === "range" ? dateTo || undefined : undefined} onChange={(event) => setDateFrom(event.target.value)} className="h-10 rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm" />
                    {dateMode === "range" && <label className="flex items-center gap-2 text-sm">to <input type="date" aria-label="To date" value={dateTo} min={dateFrom || undefined} onChange={(event) => setDateTo(event.target.value)} className="h-10 rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm" /></label>}
                    <Button variant="secondary" onClick={() => { setQuery(""); setStatus("ALL"); setTab("ALL"); setDateFrom(""); setDateTo(""); setDateMode("day"); }}>Clear filters</Button>
                </div>
                <div aria-live="polite" className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm">
                    <span>{filtered.length} records · All filtered pages</span>
                    {tab === "ALL" && <span className="w-full text-xs text-[var(--color-text-secondary)]">{tabs.filter(item => item.value !== "ALL").map(item => `${item.label}: ${currency.format(filtered.filter(document => document.type === item.value).reduce((sum, document) => sum + Math.round(document.totals.total * 100), 0) / 100)}`).join(" · ")} · Combined document values, including linked quotes, orders and invoices.</span>}
                </div>
                <DataTable data={filtered} columns={[{accessorKey:'documentNumber',header:'Document',cell:({row})=><Link className="underline" to={getSalesDocumentPath(row.original)}>{row.original.documentNumber}</Link>},{accessorKey:'customerReference',header:'PO number',cell:({row})=>row.original.customerReference || '—'},{accessorKey:'type',header:'Type'},{id:'customer',accessorFn:d=>customerRepository.getById(d.customerId)?.businessName??'Unknown customer',header:'Customer'},{accessorKey:'documentDate',header:'Date'},{id:'promisedDate',accessorFn:document=>{const order=document.type==='SALES_ORDER'?document:document.type==='INVOICE'?documents.find(candidate=>candidate.type==='SALES_ORDER'&&candidate.id===document.sourceSalesOrderId):undefined;return order?.type==='SALES_ORDER'?order.requestedDeliveryDate??'':'';},header:'Promised date',cell:({getValue})=>getValue<string>()||'—'},{accessorKey:'status',header:'Status',cell:({row})=><StatusBadge status={row.original.status}/>},{id:'total',accessorFn:d=>d.totals.total,header:`Total (${businessSettings().currency})`,cell:({row})=>currency.format(row.original.totals.total)},{id:'actions',header:'Quick view',enableHiding:false,meta:{exportable:false},cell:({row})=><Button variant="ghost" size="sm" aria-label={`Preview ${row.original.documentNumber}`} onClick={()=>setPreview(row.original)}><Eye size={16}/> Preview</Button>}]} pagination={{pageSize:25}} capabilities={{id:'sales-documents',scope:'complete',permission:'sales.read',rowId:d=>d.type+'-'+d.id}}/>
                <div aria-live="polite" className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-4 text-sm">
                    <span className="text-[var(--color-text-secondary)]">
                        {dateMode === "day"
                            ? dateFrom || "All dates"
                            : `${dateFrom || "Beginning"} – ${dateTo || "Present"}`}
                        {" · "}{tabs.find(item => item.value === tab)?.label}{" · "}{filtered.length} records
                    </span>
                    <span className="font-semibold">Total ({businessSettings().currency})</span>
                    <span className="text-xl font-semibold tabular-nums text-[var(--color-primary)]">{currency.format(filteredTotal)}</span>
                </div>
            </section>
            {preview && <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setPreview(null); }}>
                <section role="dialog" aria-modal="true" aria-label="Sales document preview" aria-describedby="sales-preview-description" className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                    <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase text-[var(--color-text-muted)]">{preview.type.replaceAll("_", " ")}</p><h2 className="mt-1 font-display text-2xl">{preview.documentNumber}</h2></div><button type="button" aria-label="Close preview" onClick={() => setPreview(null)}><X size={20} /></button></div>
                    <p id="sales-preview-description" className="sr-only">Read-only sales document summary. Press Escape to close.</p><dl className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-[var(--color-text-muted)]">Customer</dt><dd className="mt-1 font-semibold">{customerRepository.getById(preview.customerId)?.businessName ?? "Unknown customer"}</dd></div><div><dt className="text-[var(--color-text-muted)]">Status</dt><dd className="mt-1">{preview.status.replaceAll("_", " ")}</dd></div><div><dt className="text-[var(--color-text-muted)]">Document date</dt><dd className="mt-1">{preview.documentDate}</dd></div><div><dt className="text-[var(--color-text-muted)]">Total incl. GST</dt><dd className="mt-1 font-semibold">{currency.format(preview.totals.total)}</dd></div></dl>
                    <SalesDeliverySummary recipient={preview.recipient}/><div className="mt-6 flex justify-end gap-3"><button type="button" className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm" onClick={() => setPreview(null)}>Close</button><Link className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white" to={getSalesDocumentPath(preview)} onClick={() => setPreview(null)}>Full details <ArrowRight size={15} /></Link></div>
                </section>
            </div>}
        </div>
    );
}
