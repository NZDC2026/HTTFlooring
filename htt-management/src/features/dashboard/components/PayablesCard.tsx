import {businessSettings} from '../../business-workspace/configurationState';
import { Card, CardContent } from "../../../components/ui/Card";
import { useFinanceOverview } from "../data/useFinanceOverview";
const fmt = (n: number) => new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" }).format(n);
export function PayablesCard() {
 const today = new Date().toLocaleDateString("en-CA", {timeZone:businessSettings().timezone});
 const data = useFinanceOverview(today);
 return <Card><CardContent><h2 className="font-display text-xl">Accounts Payable</h2><p className="mt-1 text-xs text-[var(--color-text-muted)]">Supplier bills and upcoming payments</p><div className="money mt-6 text-3xl font-semibold">{fmt(data.payables)}</div><p className="mt-1 text-xs text-[var(--color-text-muted)]">Total outstanding</p><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-lg bg-[var(--color-warning-soft)] p-3"><div className="money text-lg font-semibold">{fmt(data.dueThisWeek)}</div><p className="mt-2 text-xs">Due next 7 days</p></div><div className="rounded-lg bg-[var(--color-danger-soft)] p-3"><div className="money text-lg font-semibold">{fmt(data.overduePayables)}</div><p className="mt-2 text-xs">Overdue</p></div></div></CardContent></Card>;
}
