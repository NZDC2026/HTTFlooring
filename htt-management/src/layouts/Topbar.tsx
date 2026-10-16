import { useSecurity, logout } from "../features/security/securityClient";
import { useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import {
    Bell,
    CircleHelp,
    Search,
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
    "/purchases": "Purchases",
    "/inventory": "Inventory",
    "/banking": "Banking",
    "/accounting": "Accounting",
    "/payroll": "Payroll",
    "/reports": "Reports",
    "/contacts": "Contacts",
    "/documents": "Documents",
    "/settings": "Settings",
};

export function Topbar() {
    const { session } = useSecurity();
    const location = useLocation(), navigate = useNavigate();
    useEffect(() => { const shortcut = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); navigate('/search'); } }; window.addEventListener('keydown', shortcut); return () => window.removeEventListener('keydown', shortcut); }, [navigate]);

    let pageTitle =
        pageNames[location.pathname] ??
        Object.entries(pageNames).find(([path]) => location.pathname.startsWith(path + "/"))?.[1] ?? "HTT Management";

    if (
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
            <h1 className="text-sm font-semibold">
                {pageTitle}
            </h1>

            <div className="ml-auto flex items-center gap-2">
                <button
                    onClick={() => navigate('/search')}
                    className="
            mr-2 flex h-9 w-[280px] items-center gap-2
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

                    <span className="flex-1">
                        Search anything...
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

                <Link to="/settings/security" className="ml-1 rounded px-2 py-1.5 text-sm">{session?.user.displayName ?? "Signed out"}<span className="ml-2 text-xs text-slate-500">{session?.user.roles.join(", ")}</span></Link>
                <button className="rounded border px-3 py-1.5 text-xs" onClick={logout}>Sign out</button>
            </div>
        </header>
    );
}
