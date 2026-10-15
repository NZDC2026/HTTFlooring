import { Link } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui/Card";
import { useFinanceOverview } from "../data/useFinanceOverview";
const fmt = (n: number) => new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" }).format(n);
export function ReceivablesCard() {
 const today = new Date().toLocaleDateString("en-CA", {timeZone:"Pacific/Auckland"});
 const data = useFinanceOverview(today);
 return <Card><CardContent><div className="flex justify-between gap-3"><h2 className="font-display text-xl">Accounts Receivable</h2><Link to="/reports" className="text-sm text-[var(--color-primary)]">View reports →</Link></div><p className="mt-1 text-xs text-[var(--color-text-muted)]">Outstanding issued customer invoices</p><div className="money mt-6 text-3xl font-semibold">{fmt(data.receivables)}</div><p className="mt-1 text-xs text-[var(--color-text-muted)]">Total outstanding · {data.overdueInvoiceCount} overdue</p><div className="mt-6 space-y-3">{data.ageing.map(item => <div key={item.label}><div className="flex justify-between text-xs"><span>{item.label}</span><span>{fmt(item.amount)} · {item.percentage}%</span></div><div className="mt-1 h-2 rounded-full bg-[var(--color-surface-muted)]"><div className="h-2 rounded-full bg-[var(--color-primary)]" style={{width:`${Math.max(0,Math.min(100,item.percentage))}%`}} /></div></div>)}</div></CardContent></Card>;
}
