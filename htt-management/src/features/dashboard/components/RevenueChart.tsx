import type { calculateDashboardBasis } from "../data/dashboardBasis";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { businessSettings } from "../../business-workspace/configurationState";
import type { DashboardBasis, DashboardBreakdown } from "../data/dashboardBasis";
import type { MonthlyFinancialData } from "../data/mockDashboard";

const lastYearColor = "#d0008f";
const thisYearColor = "#a45bff";

export function RevenueChart({ months = 6, data, basis = "cash", includeGst = true, breakdown, monthlyTotals }: { months?: 1 | 3 | 6; data: MonthlyFinancialData[]; basis?: DashboardBasis; includeGst?: boolean; breakdown?: DashboardBreakdown; monthlyTotals?: ReturnType<typeof calculateDashboardBasis>["monthlyTotals"] }) {
    const [showSample, setShowSample] = useState(true);
    const [expanded, setExpanded] = useState({ revenue: true, expenses: false });
    const totals = monthlyTotals?.slice(-months).reduce((sum, item) => ({ cashReceived: sum.cashReceived + item.cashReceived, cashSpent: sum.cashSpent + item.cashSpent, invoiceCount: sum.invoiceCount + item.invoiceCount, invoiceAmount: sum.invoiceAmount + item.invoiceAmount, billCount: sum.billCount + item.billCount, billAmount: sum.billAmount + item.billAmount, wagesAndSuper: sum.wagesAndSuper + item.wagesAndSuper }), { cashReceived: 0, cashSpent: 0, invoiceCount: 0, invoiceAmount: 0, billCount: 0, billAmount: 0, wagesAndSuper: 0 });
    const money = (value: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: businessSettings().currency }).format(value);
    return <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <span>{showSample ? "Sample comparison: generated last-year figures are shown where historical figures are zero. One sample current-year expense is included when recorded expenses are zero. Sample GST: 10%." : "Showing recorded data only."}</span>
            <label className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap"><input type="checkbox" checked={showSample} onChange={event => setShowSample(event.target.checked)}/>Show sample comparison data</label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
        {([{ title: basis === "cash" ? "Cash received" : "Accounts receivable", current: "revenue", prior: "lastYearRevenue" }, { title: basis === "cash" ? "Cash paid" : "Accounts payable", current: "expenses", prior: "lastYearExpenses" }] as const).map(({ title, current, prior }) => {
            const isSample = showSample && data.every(item => !item[prior]);
            const isCurrentSample = showSample && current === "expenses" && data.every(item => !item.expenses);
            const comparisonData = data.map((item, index) => {
                const seasonal = [1850, 2300, 1975, 2650, 3100, 2450][index % 6];
                const net = current === "revenue" ? seasonal : seasonal * 0.62;
                const amount = net * (basis === "cash" ? 1.35 : 1) * (includeGst ? 1.1 : 1);
                const currentAmount = 1680 * (basis === "cash" ? 1.35 : 1) * (includeGst ? 1.1 : 1);
                return { ...item,
                    ...(isSample ? { [prior]: Math.round(amount * 100) / 100 } : {}),
                    ...(isCurrentSample && index === data.length - 1 ? { expenses: Math.round(currentAmount * 100) / 100 } : {}),
                };
            }).slice(-months);
            const details = current === "revenue" ? breakdown?.invoices : breakdown?.bills;
            const noun = current === "revenue" ? "invoices" : "bills";
            const lastYearLabel = isSample ? "Last year (sample)" : "Last year";
            const thisYearLabel = isCurrentSample ? "This year (sample)" : "This year";
            const currentTotal = comparisonData.reduce((sum, item) => sum + item[current], 0);
            return <section key={title} aria-label={`${title} year comparison`} className={`flex min-w-0 flex-col rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-sm ${expanded.revenue === expanded.expenses ? "self-stretch" : "self-start"}`}>
                <h2 className="flex flex-wrap items-center gap-2 text-base font-semibold">{title}{isCurrentSample && <span title="Includes a sample current-year expense" className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium leading-4 text-amber-900">Sample</span>}</h2>
                <p className="mt-3 text-2xl font-semibold tabular-nums">{money(currentTotal)}</p>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{months === 1 ? "Selected month" : `Selected ${months} months`} · {businessSettings().currency}</p>
                <div className="mt-5 h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barGap={6}>
                            <CartesianGrid vertical={false} stroke="#e7e2da" strokeDasharray="4 5" />
                            <XAxis dataKey="month" axisLine={{ stroke: "#d8d4ce" }} tickLine={false} tick={{ fill: "#777d78", fontSize: 11 }} />
                            <YAxis orientation="right" width={62} axisLine={false} tickLine={false} tick={{ fill: "#777d78", fontSize: 11 }} tickFormatter={value => new Intl.NumberFormat("en", { notation: "compact", style: "currency", currency: businessSettings().currency, maximumFractionDigits: 1 }).format(value)} />
                            <Tooltip formatter={value => typeof value === "number" ? money(value) : value} contentStyle={{ border: "1px solid #ddd7cd", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "#f6f3f8" }} />
                            <Bar dataKey={prior} name={lastYearLabel} fill={lastYearColor} maxBarSize={72} />
                            <Bar dataKey={current} name={thisYearLabel} fill={thisYearColor} maxBarSize={72} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--color-text-secondary)]">
                    {[{ label: lastYearLabel, color: lastYearColor }, { label: thisYearLabel, color: thisYearColor }].map(item => <span key={item.label} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }}/>{item.label}</span>)}
                </div>
                {details && expanded[current] && <div id={`dashboard-${current}-breakdown`} className="mt-5 border-t border-[var(--color-border)] pt-4">
                    <h3 className="text-sm text-[var(--color-text-muted)]">{current === "revenue" ? "Income totals" : "Expense totals"}</h3>
                    {totals && <dl className="mt-4 space-y-4 text-sm md:min-h-[128px]">
                        <div className="flex justify-between gap-3"><dt>{current === "revenue" ? "Cash received" : "Cash spent"}</dt><dd className="font-medium tabular-nums">{money(current === "revenue" ? totals.cashReceived : totals.cashSpent)}</dd></div>
                        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3"><dt className="text-violet-600">{current === "revenue" ? "Invoices" : "Bills"}</dt><dd className="text-xs tabular-nums">{current === "revenue" ? totals.invoiceCount : totals.billCount}</dd><dd className="font-medium tabular-nums">{money(current === "revenue" ? totals.invoiceAmount : totals.billAmount)}</dd></div>
                        {current === "expenses" && <>
                            <div className="flex justify-between gap-3"><dt>Wages and Super</dt><dd className="font-medium tabular-nums">{money(totals.wagesAndSuper)}</dd></div>
                            <div className="flex justify-between gap-3"><dt>Inventory adjustment</dt><dd title="Separate inventory adjustment amount is not available">—</dd></div>
                        </>}
                    </dl>}
                    <h3 className="mt-7 text-sm text-[var(--color-text-muted)]">In progress</h3>
                    <dl className="mt-4 space-y-4 text-sm">
                        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3"><dt className="text-violet-600">Open {noun}</dt><dd className="text-xs tabular-nums">{details.openCount}</dd><dd className="text-right font-medium tabular-nums">{money(details.openAmount)}</dd></div>
                        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3"><dt className="text-violet-600">Overdue {noun}</dt><dd className="text-xs tabular-nums text-[var(--color-danger)]">{details.overdueCount}</dd><dd className="text-right font-medium tabular-nums text-[var(--color-danger)]">{money(details.overdueAmount)}</dd></div>
                    </dl>
                    <p className="mt-4 text-[11px] text-[var(--color-text-muted)]">Recorded data · {includeGst ? "Incl. GST" : "Excl. GST"}. Totals cover selected {months} {months === 1 ? "month" : "months"}; open balances cover all dates as at {breakdown?.asOf}. Open includes overdue. Samples excluded.</p>
                </div>}
                {details && <button
                    type="button"
                    aria-expanded={expanded[current]}
                    aria-controls={`dashboard-${current}-breakdown`}
                    aria-label={`${expanded[current] ? "Collapse" : "Expand"} ${title} breakdown`}
                    onClick={() => setExpanded(previous => ({ ...previous, [current]: !previous[current] }))}
                    className="mt-4 flex w-full items-center justify-center rounded-md py-2 text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                >
                    {expanded[current] ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                </button>}
            </section>;
        })}
        </div>
    </div>;
}
