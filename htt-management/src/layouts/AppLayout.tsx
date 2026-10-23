import { useSecurity } from '../features/security/securityClient';
import { personalPreferenceStore } from '../features/settings/data/personalPreferences';
import { usePersonalPreferences } from '../features/settings/data/usePersonalPreferences';
import { recordSearchReturnPath } from '../features/record-search/recordSearchService';
import {useWorkspaceRecords} from '../features/business-workspace/workspaceRepository';
import {businessSettings} from '../features/business-workspace/configurationState';
import { useEffect } from 'react';
import { RouteAccess } from "../features/security/SecurityGate";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

import { FeedbackHost } from "../components/ui/FeedbackHost";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
    useWorkspaceRecords('settings');
    const { session } = useSecurity();
    const preferences = usePersonalPreferences(session?.user.id ?? '');
    useEffect(() => { const changed = (e: StorageEvent) => personalPreferenceStore().invalidate(e.key); window.addEventListener('storage', changed); return () => window.removeEventListener('storage', changed); }, []);
    const location = useLocation(), searchReturn = recordSearchReturnPath(location.state);
    useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); }, [location.pathname]);
    const isDemoVisit = new URLSearchParams(location.search).get("demo") === "1";
    return (
        <div data-workspace-density={preferences.density.toLowerCase()} data-reduce-motion={preferences.reduceMotion ? "true" : "false"} className="min-h-screen bg-[var(--color-background)]">
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
                            <span className="inline-flex items-center gap-2 font-medium"><Compass size={16} /> Customer presentation · Current local profile</span>
                            <Link to="/demo" className="inline-flex items-center gap-2 font-semibold text-[var(--color-primary)] hover:underline"><ArrowLeft size={15} /> Back to demo journey</Link>
                        </div>
                    )}
                    <div className="mb-4 flex flex-wrap items-center gap-2 text-xs" role="status" aria-label="Application environment">
                        <span className="rounded-md border border-sky-200 bg-sky-50 px-2 py-1 font-semibold text-sky-900">Local desktop</span>
                        <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 font-medium text-amber-900">Local business data · Optional external services</span>
                    </div>
                    {searchReturn && location.pathname !== '/search/records' && <Link className="mb-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm underline" to={searchReturn}><ArrowLeft size={15}/>Back to record search</Link>}
                    <p className="mb-3 text-xs text-slate-500">{businessSettings().companyName} · {businessSettings().currency}</p><RouteAccess><Outlet /></RouteAccess>
                </div>
            </main>
        </div>
    );
}