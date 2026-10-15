import { Link } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui/Card";
import { useFinanceOverview } from "../data/useFinanceOverview";
const fmt = (n: number) => new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" }).format(n);
export function BankReconciliationCard() {
 const today = new Date().toLocaleDateString("en-CA", {timeZone:"Pacific/Auckland"});
 const data = useFinanceOverview(today);
 return <Card><CardContent><h2 className="font-display text-xl">Bank Reconciliation</h2><p className="mt-1 text-xs text-[var(--color-text-muted)]">{data.bankStatus.length} active bank accounts</p><div className="mt-5 space-y-3">{data.bankStatus.length === 0 ? <p className="text-sm">No active bank accounts configured.</p> : data.bankStatus.map(bank => <div key={bank.id} className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] pb-2"><div><p className="text-sm font-medium">{bank.name}</p><p className="text-xs text-[var(--color-text-muted)]">{bank.outstanding} uncleared · Last reconciliation: {bank.lastReconciled ?? "Never"}</p></div><span className="money text-sm font-semibold">{fmt(bank.balance)}</span></div>)}</div><p className="mt-3 text-sm">{data.unreconciledCount} transactions require reconciliation</p><Link to="/banking" className="mt-4 inline-block text-sm text-[var(--color-primary)]">Review bank accounts →</Link></CardContent></Card>;
}
