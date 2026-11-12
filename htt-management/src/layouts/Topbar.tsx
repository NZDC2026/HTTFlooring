import {longestPageTitle} from './navigationState';
import { isWeb } from "../features/security/webBridge";
import { useSecurity, logout } from "../features/security/securityClient";
import { useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import {
    Bell,
    CircleHelp,
    Search,
    Download,
} from "lucide-react";
import { useLocation } from "react-router-dom";

const pageNames: Record<string, string> = {
    "/search": "Workspace search",
    "/help": "Help",
    "/notifications": "Notifications",
    "/reports/library": "Report library",
    "/demo": "Customer demo journey",
    "/dashboard": "Dashboard",
    "/sales": "Sales",
    "/sales/invoice-reminders": "Print/Email Invoice/statement",
    "/promotions": "Promotion",
    "/purchases/incoming-shipments": "Incoming Shipment",
    "/purchases": "Purchases",
    "/inventory": "Inventory",
    "/sales/credit-returns": "Customer Credit / Return",
    "/sales/customer-returns": "Customer Credit / Return",
    "/sales/credit-notes": "Customer Credit / Return",
    "/procurement": "Procurement",
    "/tasks": "Tasks & Action Centre",
    "/tools/import-export": "Import & Export",
    "/inventory/damage": "Damage Stock",
    "/inventory/adjustments": "Stock Adjustments",
    "/inventory/sold": "Inventory · Sold",
    "/inventory/bought": "Inventory · Bought",
    "/banking": "Banking",
    "/accounting": "Accounting",
    "/payroll": "Payroll",
    "/reports": "Reports",
    "/contacts": "Customers",
    "/documents": "Documents",
    "/settings": "Settings",
};

export function Topbar() {
    const { session } = useSecurity();
    const location = useLocation(), navigate = useNavigate();
    useEffect(() => { const shortcut = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if(location.pathname==='/sales')document.querySelector<HTMLInputElement>('input[aria-label="Search sales documents"]')?.focus();else navigate('/search'); } }; window.addEventListener('keydown', shortcut); return () => window.removeEventListener('keydown', shortcut); }, [navigate,location.pathname]);

    let pageTitle =
        pageNames[location.pathname] ??
        pageNames[longestPageTitle(location.pathname,pageNames)??''] ?? "HTT Management";

    if (location.pathname === '/sales/invoice-reminders') { const action=new URLSearchParams(location.search).get('action'); if(action==='print')pageTitle='Print Invoice/Statement';else if(action==='email')pageTitle='Email invoice/Statement'; }
    if (location.pathname === "/contacts/price-settings" || location.pathname === "/inventory/price-settings") pageTitle = "Price Settings";
    if (location.pathname === "/settings/employees") pageTitle = "Users";
    if (location.pathname === "/settings/trash") pageTitle = "Trash";
    if (location.pathname === "/contacts/supplier-dashboard") pageTitle = "Suppliers";
    if (location.pathname === "/contacts/suppliers" || location.pathname.startsWith("/contacts/suppliers/")) {
        pageTitle = "Suppliers";
    } else if (
        location.pathname ===
        "/contacts/customers/new"
    ) {
        pageTitle = "New Customer";
    } else if (
        location.pathname.startsWith(
            "/contacts/customers/",
        ) &&
        location.pathname.endsWith("/edit")
    ) {
        pageTitle = "Edit Customer";
    } else if (
        location.pathname.startsWith(
            "/contacts/customers/",
        )
    ) {
        pageTitle = "Customer";
    }

    return (
        <header
            className="
        fixed right-0 top-0 z-20
        flex h-[var(--topbar-height)]
        left-[var(--sidebar-width)]
        items-center
        border-b border-[var(--color-border)]
        bg-white/95 px-6
        backdrop-blur
      "
        >
            <h1 className="min-w-0 flex-1 truncate text-sm font-semibold">
                {pageTitle}
            </h1>

            <div className="ml-auto flex shrink-0 items-center gap-2">
                {isWeb && <a href="/downloads/index.html" aria-label="Download desktop app" title="Download desktop app" className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 text-sm hover:bg-[var(--color-surface-muted)]">
                    <Download size={15} aria-hidden="true"/>
                    <span className="hidden xl:inline">Download desktop app</span>
                </a>}
                <button
                    onClick={() => {if(location.pathname==='/sales')document.querySelector<HTMLInputElement>('input[aria-label="Search sales documents"]')?.focus();else navigate('/search');}}
                    aria-label="Search workspace"
                    className="
            mr-2 flex h-9 w-[180px] xl:w-[280px] items-center gap-2
            rounded-lg border border-[var(--color-border)]
            bg-[var(--color-background-subtle)]
            px-3 text-left
            text-xs text-[var(--color-text-muted)]
            transition
            hover:border-[var(--color-border-strong)]
            hover:bg-white
          "
                >
                    <Search size={15} />

                    <span className="min-w-0 flex-1 truncate whitespace-nowrap">
                        {location.pathname==='/sales'?'Search sales, orders, invoices, credits…':'Search anything...'}
                    </span>

                    <kbd
                        className="
              rounded border border-[var(--color-border)]
              bg-white px-1.5 py-0.5
              text-[10px] text-[var(--color-text-muted)]
            "
                    >
                        ⌘K
                    </kbd>
                </button>

                <Link to="/help" aria-label="Help" className="rounded-lg p-2 hover:bg-slate-100"><CircleHelp size={17} /></Link>
                <Link to="/notifications" aria-label="Notifications" className="rounded-lg p-2 hover:bg-slate-100"><Bell size={17} /></Link>

                <div className="ml-2 h-7 w-px bg-[var(--color-border)]" />

                <Link to="/settings/security" className="ml-1 max-w-[180px] truncate whitespace-nowrap rounded px-2 py-1.5 text-sm">{session?.user.displayName ?? "Signed out"}<span className="ml-2 text-xs text-slate-500">{session?.user.roles.join(", ")}</span></Link>
                <button className="shrink-0 whitespace-nowrap rounded border px-3 py-1.5 text-xs" onClick={logout}>Sign out</button>
            </div>
        </header>
    );
}
