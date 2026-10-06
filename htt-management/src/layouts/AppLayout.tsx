import { Outlet } from "react-router-dom";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
    return (
        <div className="min-h-screen bg-[var(--color-background)]">
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
                    <Outlet />
                </div>
            </main>
        </div>
    );
}