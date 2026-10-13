import { ArrowUpRight, FileText, Package, Receipt, TrendingUp, Users, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui/Card";

const shortcuts = [
    { label: "Sales overview", detail: "Quotes, orders & invoices", path: "/sales", icon: Receipt },
    { label: "Purchase orders", detail: "Receiving & supplier bills", path: "/purchases", icon: Package },
    { label: "Inventory", detail: "Stock levels & valuation", path: "/inventory", icon: TrendingUp },
    { label: "Customers", detail: "Accounts & contacts", path: "/contacts", icon: Users },
    { label: "Financial reports", detail: "Profit & loss", path: "/accounting/profit-and-loss", icon: Wallet },
    { label: "Documents", detail: "Business documents", path: "/documents", icon: FileText },
];

export function QuickAccessCard() {
    return <Card><CardContent>
        <h2 className="font-display text-xl">Quick Access</h2>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">Jump straight into your daily workflows</p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {shortcuts.map(({ label, detail, path, icon: Icon }) => <Link key={path} to={path} className="group flex items-center gap-3 rounded-lg border border-[var(--color-border)] p-3 transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]">
                <span className="rounded-lg bg-[var(--color-primary-soft)] p-2 text-[var(--color-primary)]"><Icon size={16}/></span>
                <span className="min-w-0 flex-1"><span className="block text-xs font-semibold">{label}</span><span className="block text-[11px] text-[var(--color-text-muted)]">{detail}</span></span>
                <ArrowUpRight size={14} className="text-[var(--color-text-muted)]" />
            </Link>)}
        </div>
    </CardContent></Card>;
}
