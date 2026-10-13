import { useGoodsReceipts } from "../../purchases/data/useGoodsReceipts";
import { useSupplierBills } from "../../purchases/data/useSupplierBills";
import { ArrowRight, CheckCircle2, Compass, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../../../components/ui/Badge";
import { Card, CardContent } from "../../../components/ui/Card";
import { mockQuotes, mockSalesOrders, mockInvoices } from "../../sales/data/mockSalesDocuments";
import { mockPurchaseOrders } from "../../purchases/data/mockPurchaseOrders";

const salesQuote = mockQuotes[0];
const salesOrder = mockSalesOrders.find((order) => order.id === salesQuote?.convertedSalesOrderId) ?? mockSalesOrders[0];
const salesInvoice = mockInvoices.find((invoice) => salesOrder?.invoiceIds.includes(invoice.id)) ?? mockInvoices[0];
const purchaseOrder = mockPurchaseOrders[0];

type DemoStep = { title: string; detail: string; path: string; action: string; note?: string };
const flows: { title: string; subtitle: string; steps: DemoStep[] }[] = [
    {
        title: "Sales · Quote to Invoice",
        subtitle: "Show a connected customer sales journey using existing sample documents.",
        steps: [
            { title: "Sales workspace", detail: "Search and filter quotes, orders and invoices.", path: "/sales", action: "Browse sales" },
            ...(salesQuote ? [{ title: `Quote ${salesQuote.documentNumber}`, detail: "Review product pricing and the linked order.", path: `/sales/quotes/${salesQuote.id}`, action: "Open quote" }] : []),
            ...(salesOrder ? [{ title: `Order ${salesOrder.documentNumber}`, detail: "Review fulfilment and the invoice relationship.", path: `/sales/orders/${salesOrder.id}`, action: "Open order" }] : []),
            ...(salesInvoice ? [{ title: `Invoice ${salesInvoice.documentNumber}`, detail: "Show totals, GST and invoice status.", path: `/sales/invoices/${salesInvoice.id}`, action: "Open invoice" }] : []),
        ],
    },
    {
        title: "Purchasing · Order to Accounting",
        subtitle: "Demonstrate procurement, stock receiving and finance controls.",
        steps: [
            { title: "Purchase orders", detail: "Browse purchasing records and supplier details.", path: "/purchases", action: "Browse orders" },
            ...(purchaseOrder ? [{ title: `Purchase order ${purchaseOrder.purchaseOrderNumber}`, detail: "Inspect ordered, received and billed quantities.", path: `/purchases/${purchaseOrder.id}`, action: "Open PO" }] : []),
            { title: "Stock movements", detail: "Open Inventory and switch to Movements.", path: "/inventory?tab=movements", action: "Open movements" },
            { title: "GRNI report", detail: "Review goods received but not yet invoiced.", path: "/reports/grni-outstanding", action: "Open GRNI" },
            { title: "Posting audit", detail: "Review operation history; recovery actions remain restricted.", path: "/reports/purchase-posting-audit", action: "Open audit" },
        ],
    },
    {
        title: "Operations · Business Workspace",
        subtitle: "Walk through representative screens without submitting real transactions.",
        steps: [
            { title: "Banking", detail: "Explore accounts and reconciliation.", path: "/banking", action: "Open banking" },
            { title: "Payroll", detail: "Preview employee pay runs; no payroll is processed.", path: "/payroll", action: "Open payroll" },
            { title: "Documents", detail: "Search sample document metadata and view details.", path: "/documents", action: "Open documents" },
            { title: "Settings", detail: "Explore company, roles, preferences and integration status.", path: "/settings", action: "Open settings" },
        ],
    },
];

export function CustomerDemoPage() {
    const receipts = useGoodsReceipts();
    const bills = useSupplierBills();
    const linkedReceipt = receipts.find((receipt) => receipt.purchaseOrderId === purchaseOrder?.id);
    const linkedBill = bills.find((bill) => bill.purchaseOrderId === purchaseOrder?.id);
    const demoFlows = flows.map((flow, index) => index !== 1 ? flow : {
        ...flow,
        steps: [
            ...flow.steps.slice(0, 2),
            ...(linkedReceipt ? [{ title: `Goods receipt ${linkedReceipt.receiptNumber}`, detail: `Received at ${linkedReceipt.siteName} on ${linkedReceipt.receiptDate}.`, path: `/purchases/goods-receipts/${linkedReceipt.id}`, action: "Open receipt" }] : []),
            ...(linkedBill ? [{ title: `Supplier bill ${linkedBill.billNumber}`, detail: `Invoice ${linkedBill.supplierInvoiceNumber} · ${linkedBill.status}.`, path: `/purchases/bills/${linkedBill.id}`, action: "Open bill" }] : []),
            ...flow.steps.slice(2),
        ],
    });
    return <div className="space-y-6 pb-10">
        <header className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]"><Compass size={15} /> Guided walkthrough</p><h1 className="mt-2 font-display text-3xl">Customer demo journey</h1><p className="mt-2 text-sm text-[var(--color-text-secondary)]">Follow a structured walkthrough of HTT Flooring's ERP screens.</p></div>
            <Badge variant="info">DEMO · Mock data</Badge>
        </header>
        <div className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-sm"><Info size={18} className="mt-0.5 shrink-0" /><p>This is a presentation environment. Sample amounts and documents are illustrative. Payroll, file uploads, API connections and live payments are not enabled.</p></div>
        <div className="grid gap-5 lg:grid-cols-3">{demoFlows.map((flow, flowIndex) => <Card key={flow.title}><CardContent>
            <div className="flex items-center justify-between gap-2"><Badge variant="neutral">Flow {flowIndex + 1}</Badge><span className="text-xs text-[var(--color-text-muted)]">{flow.steps.length} stops</span></div>
            <h2 className="mt-4 font-display text-xl">{flow.title}</h2><p className="mt-2 min-h-12 text-sm text-[var(--color-text-secondary)]">{flow.subtitle}</p>
            <ol className="mt-5 space-y-3">{flow.steps.map((step, index) => <li key={`${flow.title}-${step.path}`} className="rounded-lg border border-[var(--color-border)] p-3"><div className="flex items-start gap-3"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-xs font-semibold text-[var(--color-primary)]">{index + 1}</div><div className="min-w-0 flex-1"><p className="font-semibold text-sm">{step.title}</p><p className="mt-1 text-xs text-[var(--color-text-secondary)]">{step.detail}</p><Link className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] hover:underline" to={`${step.path}${step.path.includes("?") ? "&" : "?"}demo=1`}>{step.action} <ArrowRight size={14} /></Link></div></div></li>)}</ol>
        </CardContent></Card>)}</div>
        <p className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]"><CheckCircle2 size={15} /> All walkthrough links use existing application routes. No background API calls are introduced by this page.</p>
    </div>;
}
