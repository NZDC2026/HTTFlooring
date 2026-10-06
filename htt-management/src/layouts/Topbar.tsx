import {
    Bell,
    CircleHelp,
    Search,
} from "lucide-react";
import { useLocation } from "react-router-dom";

const pageNames: Record<string, string> = {
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
    const location = useLocation();

    const pageTitle =
        location.pathname.startsWith(
            "/contacts/customers/",
        )
            ? "Customer"
            : pageNames[location.pathname] ??
            "HTT Management";

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

                <TopbarButton>
                    <CircleHelp size={17} />
                </TopbarButton>

                <TopbarButton>
                    <Bell size={17} />
                </TopbarButton>

                <div className="ml-2 h-7 w-px bg-[var(--color-border)]" />

                <button className="ml-1 flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--color-surface-hover)]">
                    <div
                        className="
              flex h-8 w-8 items-center justify-center
              rounded-full bg-[var(--color-primary)]
              text-[11px] font-semibold text-white
            "
                    >
                        JS
                    </div>

                    <div className="text-left">
                        <div className="text-xs font-medium">
                            John Smith
                        </div>

                        <div className="text-[10px] text-[var(--color-text-muted)]">
                            Administrator
                        </div>
                    </div>
                </button>
            </div>
        </header>
    );
}

function TopbarButton({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <button
            className="
        flex h-9 w-9 items-center justify-center
        rounded-lg text-[var(--color-text-secondary)]
        transition
        hover:bg-[var(--color-surface-hover)]
        hover:text-[var(--color-text-primary)]
      "
        >
            {children}
        </button>
    );
}