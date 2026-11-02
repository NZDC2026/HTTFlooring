import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { businessSettings } from "../../business-workspace/configurationState";
import type { DashboardBasis } from "../data/dashboardBasis";
import type { MonthlyFinancialData } from "../data/mockDashboard";

const lastYearColor = "#d0008f";
const thisYearColor = "#a45bff";

export function RevenueChart({ months = 6, data, basis = "cash", includeGst = true }: { months?: 1 | 3 | 6; data: MonthlyFinancialData[]; basis?: DashboardBasis; includeGst?: boolean }) {
    const period = data.slice(-months);
    const money = (value: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: businessSettings().currency }).format(value);
    return <div className="grid gap-4 md:grid-cols-2">
        {([{ title: basis === "cash" ? "Cash received" : "Accounts receivable", current: "revenue", prior: "lastYearRevenue" }, { title: basis === "cash" ? "Cash paid" : "Accounts payable", current: "expenses", prior: "lastYearExpenses" }] as const).map(({ title, current, prior }) => {
            const currentTotal = period.reduce((sum, item) => sum + item[current], 0);
            const priorTotal = period.reduce((sum, item) => sum + (item[prior] ?? 0), 0);
            return <section key={title} aria-label={`${title} year comparison`} className="min-w-0 rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold">{title}</h2>
                <p className="mt-3 text-2xl font-semibold tabular-nums">{money(currentTotal)}</p>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{months === 1 ? "Selected month" : `Selected ${months} months`} · {businessSettings().currency}</p>
                <div className="mt-5 h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={period} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barGap={6}>
                            <CartesianGrid vertical={false} stroke="#e7e2da" strokeDasharray="4 5" />
                            <XAxis dataKey="month" axisLine={{ stroke: "#d8d4ce" }} tickLine={false} tick={{ fill: "#777d78", fontSize: 11 }} />
                            <YAxis orientation="right" width={62} axisLine={false} tickLine={false} tick={{ fill: "#777d78", fontSize: 11 }} tickFormatter={value => new Intl.NumberFormat("en", { notation: "compact", style: "currency", currency: businessSettings().currency, maximumFractionDigits: 1 }).format(value)} />
                            <Tooltip formatter={value => typeof value === "number" ? money(value) : value} contentStyle={{ border: "1px solid #ddd7cd", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "#f6f3f8" }} />
                            <Bar dataKey={prior} name="Last year" fill={lastYearColor} maxBarSize={72} />
                            <Bar dataKey={current} name="This year" fill={thisYearColor} maxBarSize={72} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--color-text-secondary)]">
                    {[{ label: "Last year", color: lastYearColor }, { label: "This year", color: thisYearColor }].map(item => <span key={item.label} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }}/>{item.label}</span>)}
                </div>
                <dl className="mt-5 space-y-3 border-t border-[var(--color-border)] pt-4 text-sm">
                    <div className="flex flex-wrap justify-between gap-2"><dt className="text-[var(--color-text-secondary)]">This year total</dt><dd className="font-medium tabular-nums">{money(currentTotal)}</dd></div>
                    <div className="flex flex-wrap justify-between gap-2"><dt className="text-[var(--color-text-secondary)]">Last year total</dt><dd className="font-medium tabular-nums">{money(priorTotal)}</dd></div>
                </dl>
                <p className="mt-4 text-xs text-[var(--color-text-muted)]">{basis === "cash" ? "Actual cash movements" : "Unpaid balances"} · {includeGst ? "Incl. GST" : "Excl. GST"} · Same period last year</p>
            </section>;
        })}
    </div>;
}
