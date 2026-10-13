import { Link, Outlet, useLocation } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

import { FeedbackHost } from "../components/ui/FeedbackHost";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
    const location = useLocation();
    const isDemoVisit = new URLSearchParams(location.search).get("demo") === "1";
    return (
        <div className="min-h-screen bg-[var(--color-background)]">
            <FeedbackHost />
            <Sidebar />
            <Topbar />

            <main
                className="
          min-h-screen
          pl-[var(--sidebar-width)]
          pt-[var(--topbar-height)]
        "
            >
                <div
                    className="
            mx-auto
            max-w-[var(--page-max-width)]
            p-6
          "
                >
                    {isDemoVisit && location.pathname !== "/demo" && (
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm">
                            <span className="inline-flex items-center gap-2 font-medium"><Compass size={16} /> Customer presentation · Sample data</span>
                            <Link to="/demo" className="inline-flex items-center gap-2 font-semibold text-[var(--color-primary)] hover:underline"><ArrowLeft size={15} /> Back to demo journey</Link>
                        </div>
                    )}
                    <Outlet />
                </div>
            </main>
        </div>
    );
}