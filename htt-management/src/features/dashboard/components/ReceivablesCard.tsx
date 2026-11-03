import { businessSettings } from '../../business-workspace/configurationState';
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui/Card";
import { useFinanceOverview } from "../data/useFinanceOverview";

export function OutstandingAgeingCard({ title, description, total, overdueCount, ageing }: {
    title: string;
    description: string;
    total: number;
    overdueCount: number;
    ageing: { label: string; amount: number; percentage: number }[];
}) {
    const currency = new Intl.NumberFormat("en-AU", { style: "currency", currency: businessSettings().currency });
    return <Card><CardContent>
        <div className="flex justify-between gap-3">
            <h2 className="font-display text-xl">{title}</h2>
            <Link to="/reports" className="text-sm text-[var(--color-primary)]">View reports →</Link>
        </div>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">{description}</p>
        <div className="money mt-6 text-3xl font-semibold">{currency.format(total)}</div>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">Total outstanding · {overdueCount} overdue</p>
        <div className="mt-6 space-y-3">
            {ageing.map(item => <div key={item.label}>
                <div className="flex justify-between gap-2 text-xs"><span>{item.label}</span><span>{currency.format(item.amount)} · {item.percentage}%</span></div>
                <div className="mt-1 h-2 rounded-full bg-[var(--color-surface-muted)]">
                    <div className="h-2 rounded-full bg-[var(--color-primary)]" style={{ width: `${Math.max(0, Math.min(100, item.percentage))}%` }}/>
                </div>
            </div>)}
        </div>
    </CardContent></Card>;
}

export function ReceivablesCard() {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: businessSettings().timezone });
    const data = useFinanceOverview(today);
    return <OutstandingAgeingCard title="Accounts Receivable" description="Outstanding issued customer invoices" total={data.receivables} overdueCount={data.overdueInvoiceCount} ageing={data.ageing}/>;
}
