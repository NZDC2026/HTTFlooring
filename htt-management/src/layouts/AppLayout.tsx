import { PageSamples } from "../features/sample-previews/PageSamples";
import { DeliveryReminder } from "../features/delivery-tasks/DeliveryTasks";
import {ModuleNavigation} from './ModuleNavigation';
import {presentationWorkflows} from '../features/security/optionalWorkflows';
import { useSecurity } from '../features/security/securityClient';
import { personalPreferenceStore } from '../features/settings/data/personalPreferences';
import { usePersonalPreferences } from '../features/settings/data/usePersonalPreferences';
import { recordSearchReturnPath } from '../features/record-search/recordSearchService';
import {useWorkspaceRecords} from '../features/business-workspace/workspaceRepository';
import {businessSettings} from '../features/business-workspace/configurationState';
import { useEffect, useRef, useState } from 'react';
import {WorkspaceBack,isPrimaryWorkspace} from './WorkspaceBack';
import {rememberListLocation,listReturnLocation} from './listReturnLocation';
import { RouteAccess } from "../features/security/SecurityGate";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

import { FeedbackHost } from "../components/ui/FeedbackHost";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
    const [navigationPath, setNavigationPath] = useState<string | null>(null);
    const pageContentRef=useRef<HTMLDivElement>(null);
    useWorkspaceRecords('settings');
    const { session } = useSecurity();
    const preferences = usePersonalPreferences(session?.user.id ?? '');
    useEffect(() => { const changed = (e: StorageEvent) => personalPreferenceStore().invalidate(e.key); window.addEventListener('storage', changed); return () => window.removeEventListener('storage', changed); }, []);
    const navigate=useNavigate();
    const location = useLocation(), searchReturn = recordSearchReturnPath(location.state);
    const previousPath=useRef(location.pathname);
    useEffect(()=>{const changed=previousPath.current!==location.pathname;previousPath.current=location.pathname;const restored=listReturnLocation(session?.user.id??'',location.pathname);if(changed&&!location.search&&restored!==location.pathname){navigate(restored,{replace:true});return;}rememberListLocation(session?.user.id??'',location.pathname,location.search);},[session?.user.id,location.pathname,location.search,navigate]);
    useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); }, [location.pathname]);
    const navigationOpen = navigationPath === location.pathname;
    const setNavigationOpen = (open: boolean) => setNavigationPath(open ? location.pathname : null);
    const primaryWorkspace=isPrimaryWorkspace(location.pathname);
    const isCustomerForm=location.pathname==='/contacts/customers/new'||/^\/contacts\/customers\/[^/]+\/edit$/.test(location.pathname);
    const reportsWorkspace=location.pathname.startsWith('/reports')||location.pathname==='/dashboard'||location.pathname==='/reports/aged-payables'||location.pathname==='/accounting'||location.pathname==='/banking'||location.pathname.startsWith('/banking/');
    const purchasesOverview=location.pathname==='/purchases'&&!new URLSearchParams(location.search).get('view')&&!new URLSearchParams(location.search).get('stage');
    const samplesAfterContent=purchasesOverview||reportsWorkspace||location.pathname==='/inventory'||isCustomerForm||/^\/contacts\/customers\/[^/]+\/(sales|pricing)$/.test(location.pathname);
    const isDemoVisit = new URLSearchParams(location.search).get("demo") === "1";
    return (
        <div data-workspace-density={preferences.density.toLowerCase()} data-reduce-motion={preferences.reduceMotion ? "true" : "false"} className="min-h-screen bg-[var(--color-background)]">
            <FeedbackHost />
            <DeliveryReminder/>
            <button className="htt-mobile-menu" aria-label={navigationOpen ? "Close navigation" : "Open navigation"} aria-expanded={navigationOpen} aria-controls="htt-main-navigation" onClick={() => setNavigationOpen(!navigationOpen)}>☰</button>
            {navigationOpen && <button className="htt-navigation-backdrop" aria-label="Close navigation" onClick={() => setNavigationOpen(false)} />}
            <div id="htt-main-navigation" className={navigationOpen ? "htt-navigation is-open" : "htt-navigation"} onKeyDown={event => { if(event.key === 'Escape') setNavigationOpen(false); }}><Sidebar /></div>
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
                    {presentationWorkflows.customerDemo && isDemoVisit && location.pathname !== "/demo" && (
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm">
                            <span className="inline-flex items-center gap-2 font-medium"><Compass size={16} /> Customer presentation · Current local profile</span>
                            {presentationWorkflows.customerDemo && <Link to="/demo" className="inline-flex items-center gap-2 font-semibold text-[var(--color-primary)] hover:underline"><ArrowLeft size={15} /> Back to demo journey</Link>}
                        </div>
                    )}
                    {!primaryWorkspace && searchReturn && location.pathname !== '/search/records' && <Link className="workspace-back" to={searchReturn}><ArrowLeft size={15}/>Back to record search</Link>}
                    {(!searchReturn||location.pathname==='/search/records')&&<WorkspaceBack contentRef={pageContentRef}/>}<div data-primary-workspace={primaryWorkspace?'true':undefined} ref={pageContentRef} onClickCapture={e=>{if(e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;const link=(e.target as Element).closest<HTMLAnchorElement>('a.workspace-back');if(!link)return;const target=link.hash.slice(1);if(!target.startsWith('/'))return;const restored=listReturnLocation(session?.user.id??'',target);if(restored!==target){e.preventDefault();e.stopPropagation();navigate(restored);}}}><p className="mb-3 text-xs text-slate-500">{businessSettings().companyName} · {businessSettings().currency}</p><RouteAccess>{!reportsWorkspace&&!purchasesOverview&&<ModuleNavigation/>}{!samplesAfterContent&&<PageSamples/>}<Outlet />{samplesAfterContent&&<div className="mt-4"><PageSamples/></div>}</RouteAccess></div>
                </div>
            </main>
        </div>
    );
}