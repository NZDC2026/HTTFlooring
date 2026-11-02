import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { businessSettings } from "../../business-workspace/configurationState";
import type { DashboardBasis } from "../data/dashboardBasis";
import type { MonthlyFinancialData } from "../data/mockDashboard";

const lastYearColor = "#d0008f";
const thisYearColor = "#a45bff";

export function RevenueChart({ months = 6, data, basis = "cash", includeGst = true }: { months?: 1 | 3 | 6; data: MonthlyFinancialData[]; basis?: DashboardBasis; includeGst?: boolean }) {
    const [showSample, setShowSample] = useState(true);
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
            const lastYearLabel = isSample ? "Last year (sample)" : "Last year";
            const thisYearLabel = isCurrentSample ? "This year (sample)" : "This year";
            const currentTotal = comparisonData.reduce((sum, item) => sum + item[current], 0);
            const priorTotal = comparisonData.reduce((sum, item) => sum + (item[prior] ?? 0), 0);
            return <section key={title} aria-label={`${title} year comparison`} className="min-w-0 rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold">{title}</h2>
                {isCurrentSample && <p className="mt-1 text-xs font-medium text-amber-800">Includes a sample current-year expense</p>}
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
                <dl className="mt-5 space-y-3 border-t border-[var(--color-border)] pt-4 text-sm">
                    <div className="flex flex-wrap justify-between gap-2"><dt className="text-[var(--color-text-secondary)]">{isCurrentSample ? "This year total (sample)" : "This year total"}</dt><dd className="font-medium tabular-nums">{money(currentTotal)}</dd></div>
                    <div className="flex flex-wrap justify-between gap-2"><dt className="text-[var(--color-text-secondary)]">{isSample ? "Last year total (sample)" : "Last year total"}</dt><dd className="font-medium tabular-nums">{money(priorTotal)}</dd></div>
                </dl>
                <p className="mt-4 text-xs text-[var(--color-text-muted)]">{basis === "cash" ? "Actual cash movements" : "Unpaid balances"} · {includeGst ? "Incl. GST" : "Excl. GST"} · Same period last year</p>
            </section>;
        })}
        </div>
    </div>;
}
