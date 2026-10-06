import {
    BarChart3,
    Boxes,
    Building2,
    ChevronDown,
    CircleDollarSign,
    ContactRound,
    FileText,
    Landmark,
    LayoutDashboard,
    PackageCheck,
    ReceiptText,
    Settings,
    ShoppingCart,
    UsersRound,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "../lib/cn";

const sections = [
    {
        label: "Overview",
        items: [
            {
                label: "Dashboard",
                path: "/dashboard",
                icon: LayoutDashboard,
            },
        ],
    },

    {
        label: "Operations",
        items: [
            {
                label: "Sales",
                path: "/sales",
                icon: ReceiptText,
            },
            {
                label: "Purchases",
                path: "/purchases",
                icon: ShoppingCart,
            },
            {
                label: "Inventory",
                path: "/inventory",
                icon: Boxes,
            },
        ],
    },

    {
        label: "Finance",
        items: [
            {
                label: "Banking",
                path: "/banking",
                icon: Landmark,
            },
            {
                label: "Accounting",
                path: "/accounting",
                icon: CircleDollarSign,
            },
            {
                label: "Payroll",
                path: "/payroll",
                icon: UsersRound,
            },
        ],
    },

    {
        label: "Insights",
        items: [
            {
                label: "Reports",
                path: "/reports",
                icon: BarChart3,
            },
        ],
    },

    {
        label: "Management",
        items: [
            {
                label: "Contacts",
                path: "/contacts",
                icon: ContactRound,
            },
            {
                label: "Documents",
                path: "/documents",
                icon: FileText,
            },
        ],
    },

    {
        label: "System",
        items: [
            {
                label: "Settings",
                path: "/settings",
                icon: Settings,
            },
        ],
    },
];

export function Sidebar() {
    return (
        <aside
            className="
        fixed bottom-0 left-0 top-0 z-30
        flex w-[var(--sidebar-width)] flex-col
        bg-[var(--color-primary)]
        text-white
      "
        >
            <div className="flex h-20 items-center px-5">
                <div className="flex items-center gap-3">
                    <div
                        className="
              flex h-9 w-9 items-center justify-center
              rounded-lg border border-white/50
              text-xs font-semibold tracking-wide
            "
                    >
                        HT
                    </div>

                    <div>
                        <div className="text-sm font-semibold tracking-wide">
                            HTT
                        </div>

                        <div className="text-[10px] tracking-[0.18em] text-white/60">
                            MANAGEMENT
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-px bg-white/10" />

            <nav className="flex-1 overflow-y-auto px-3 py-5">
                <div className="space-y-6">
                    {sections.map((section) => (
                        <div key={section.label}>
                            <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                                {section.label}
                            </div>

                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            className={({ isActive }) =>
                                                cn(
                                                    "group flex h-10 items-center gap-3 rounded-lg px-3",
                                                    "text-[13px] font-medium transition",
                                                    isActive
                                                        ? "bg-white/12 text-white"
                                                        : "text-white/65 hover:bg-white/7 hover:text-white",
                                                )
                                            }
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    <Icon
                                                        size={17}
                                                        strokeWidth={1.8}
                                                        className={
                                                            isActive
                                                                ? "text-[var(--color-accent)]"
                                                                : "text-white/55 group-hover:text-white"
                                                        }
                                                    />

                                                    <span>{item.label}</span>
                                                </>
                                            )}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </nav>

            <div className="border-t border-white/10 p-3">
                <button
                    className="
            flex w-full items-center gap-3 rounded-lg
            p-3 text-left transition
            hover:bg-white/7
          "
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                        <Building2 size={17} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium">
                            ABC Flooring
                        </div>

                        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-white/45">
                            <PackageCheck size={11} />
                            Melbourne
                        </div>
                    </div>

                    <ChevronDown
                        size={14}
                        className="text-white/40"
                    />
                </button>
            </div>
        </aside>
    );
}