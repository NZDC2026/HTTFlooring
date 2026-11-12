import {sidebarOwner,accountingSubmenuActive} from './navigationState';
import { useEffect, useRef, useState } from "react";
import {presentationPathEnabled} from '../features/security/optionalWorkflows';
import {businessSettings} from '../features/business-workspace/configurationState';
import {useWorkspaceRecords} from '../features/business-workspace/workspaceRepository';
import { useSecurity } from "../features/security/securityClient";
import { hasPermission, type Permission } from "../features/security/rbac";
import {
    BarChart3,
    Boxes,
    Building2,
    ChevronDown,
    ChevronRight,
    CircleDollarSign,
    ContactRound,
    FileText,
    Landmark,
    LayoutDashboard,
    Presentation,
    PackageCheck,
    ReceiptText,
    Settings,
    ShoppingCart,
    Ship,
    UsersRound,
    Trash2,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {createPortal} from "react-dom";
import { cn } from "../lib/cn";

const sections = [
    {
        label: "Overview",
        items: [
            { label: "Page directory", path: "/workspace", icon: LayoutDashboard },
            {
                label: "Dashboard",
                path: "/dashboard",
                icon: LayoutDashboard,
            },
            {
                label: "Customer Demo Journey",
                path: "/demo",
                icon: Presentation,
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
                label: "Credit / Return",
                path: "/sales/credit-returns",
                icon: ReceiptText,
            },
            {label:"Promotion",path:"/promotions",icon:Presentation},
            {label:"Procurement",path:"/procurement",icon:PackageCheck},
            {
                label: "Purchases",
                path: "/purchases",
                icon: ShoppingCart,
            },
            {
                label: "Incoming Shipment",
                path: "/purchases/incoming-shipments",
                icon: Ship,
            },
            {
                label: "Inventory",
                path: "/inventory",
                icon: Boxes,
            },
        ],
    },

    {
        label: "Account",
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
            {
                label: "Reports",
                path: "/reports",
                icon: BarChart3,
            },
        ],
    },

    {
        label: "Contacts",
        items: [
            {
                label: "Customers",
                path: "/contacts",
                icon: ContactRound,
            },
            {
                label: "Suppliers",
                path: "/contacts/supplier-dashboard",
                icon: PackageCheck,
            },
        ],
    },

    {
        label: "Work management",
        items: [
            {label:"Tasks",path:"/tasks",icon:LayoutDashboard},
            {label:"Import & export",path:"/tools/import-export",icon:FileText},
        ],
    },

    {
        label: "System",
        items: [
            { label: "Users", path: "/settings/employees", icon: UsersRound },
            { label: "Trash", path: "/settings/trash", icon: Trash2 },
            { label: "Personal preferences", path: "/settings/preferences", icon: Settings },
            {
                label: "Settings",
                path: "/settings",
                icon: Settings,
            },
        ],
    },
];

export function Sidebar() {
    useWorkspaceRecords('settings');
    const { session } = useSecurity();
    const { pathname, search: locationSearch } = useLocation();
    const owner=sidebarOwner(pathname);
    const principal = session && { userId: session.user.id, roles: session.user.roles, authenticated: true as const };
    const permissionForPath = (path: string): Permission | undefined => {
        if(path==='/tools/import-export')return 'inventory.read';
        if(path==='/promotions')return 'sales.read';
        if(path==='/procurement')return 'purchases.read';
        if(path==='/tasks'||path==='/sales/credit-returns')return 'sales.read';
        if(path==='/settings/employees')return 'users.manage';
        if(path==='/settings/trash')return 'users.manage';
        if (path.startsWith('/reports/purchase') || path.startsWith('/reports/grni') || path.startsWith('/purchases')) return 'purchases.read';
        if (path === '/payroll') return 'payroll.read';
        if (path === '/dashboard') return 'inventory.read';
        if (path.startsWith('/accounting')) return 'accounting.read';
        if (path === '/banking') return 'banking.read';
        if (path === '/sales' || path === '/demo' || path === '/reports') return 'sales.read';
        if (path === '/inventory') return 'inventory.read';
        if (path === '/contacts/supplier-dashboard') return 'purchases.read';
        if (path === '/contacts' || path === '/contacts/suppliers') return 'contacts.write';
    };
    const visibleSections = sections.map(section => ({ ...section, items: section.items.filter(item => presentationPathEnabled(item.path)).filter(item => !permissionForPath(item.path) || hasPermission(principal, permissionForPath(item.path)!)) })).filter(section => section.items.length);
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
                    <span className="htt-brand-symbol" aria-label="HTT brand mark"><i/><i/></span>

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
                    {visibleSections.map((section) => (
                        <div key={section.label}>
                            <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                                {section.label}
                            </div>

                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const children: {label:string;path:string;permission?:Permission}[]=item.path==='/sales'?[{label:'Print Invoice/Statement',path:'/sales/invoice-reminders?action=print'},{label:'Email invoice/Statement',path:'/sales/invoice-reminders?action=email'}]:item.path==='/accounting'?[
                                        {label:'Overview',path:'/accounting'},{label:'Chart of Accounts',path:'/accounting?view=accounts'},{label:'Journal Entries',path:'/accounting/journals'},{label:'Bank Reconciliation',path:'/banking',permission:'banking.read'},{label:'Period Closing',path:'/accounting/periods'},{label:'GST / BAS',path:'/reports/tax-summary',permission:'sales.read'},{label:'Financial Reports',path:'/reports?category=Financial',permission:'sales.read'}
                                    ]:item.path==='/inventory'?[
                                        {label:'Sold',path:'/inventory/sold',permission:'sales.read'},{label:'Bought',path:'/inventory/bought',permission:'purchases.read'},{label:'Damage Stock',path:'/inventory/damage',permission:'inventory.read'},{label:'Stock Adjustments',path:'/inventory/adjustments',permission:'inventory.read'}
                                    ]:item.path==='/contacts'?[{label:'All Customers',path:'/contacts/list',permission:'contacts.write'}]:item.path==='/contacts/supplier-dashboard'?[{label:'All Suppliers',path:'/contacts/suppliers',permission:'contacts.write'}]:[];
                                    const allowedChildren=children.filter(child=>!child.permission||hasPermission(principal,child.permission));
                                    if(allowedChildren.length)return <SidebarFlyout key={item.path} label={item.label} path={item.path} icon={Icon} active={owner===item.path} childrenItems={allowedChildren} pathname={pathname} search={locationSearch}/>;

                                    const active=owner===item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            aria-current={active ? "page" : undefined}
                                            className={cn(
                                                    "group flex h-10 items-center gap-3 rounded-lg px-3",
                                                    "text-[13px] font-medium transition",
                                                    active
                                                        ? "bg-white/12 text-white"
                                                        : "text-white/65 hover:bg-white/7 hover:text-white",
                                                )
                                            }
                                        >
                                            <Icon
                                                        size={17}
                                                        strokeWidth={1.8}
                                                        className={
                                                            active
                                                                ? "text-white"
                                                                : "text-white/55 group-hover:text-white"
                                                        }
                                                    />

                                                    <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </nav>

            <div className="border-t border-white/10 p-3">
                <Link to="/settings"
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
                            {businessSettings().companyName}
                        </div>

                        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-white/45">
                            <PackageCheck size={11} />
                            {businessSettings().currency} · {businessSettings().timezone}
                        </div>
                    </div>

                    <ChevronDown
                        size={14}
                        className="text-white/40"
                    />
                </Link>
            </div>
        </aside>
    );
}

function SidebarFlyout({label,path,icon:Icon,active,childrenItems,pathname,search}:{label:string;path:string;icon:typeof ReceiptText;active:boolean;childrenItems:{label:string;path:string}[];pathname:string;search:string}){
 const [position,setPosition]=useState<{left:number;top:number}|null>(null),anchor=useRef<HTMLDivElement>(null),panel=useRef<HTMLElement>(null),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const close=()=>{clearTimeout(timer.current);setPosition(null);};
 const open=()=>{clearTimeout(timer.current);const rect=anchor.current?.getBoundingClientRect();if(rect)setPosition({left:rect.right+10,top:Math.max(8,Math.min(rect.top,window.innerHeight-childrenItems.length*42-24))});};
 const leave=()=>{timer.current=setTimeout(close,180);};
 useEffect(()=>{close();},[pathname,search]);
 useEffect(()=>{if(!position)return;const dismiss=(event:MouseEvent)=>{if(!anchor.current?.contains(event.target as Node)&&!panel.current?.contains(event.target as Node))close();};const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){close();anchor.current?.querySelector('button')?.focus();}};const scroll=(event:Event)=>{if(!panel.current?.contains(event.target as Node))close();};document.addEventListener('mousedown',dismiss);document.addEventListener('keydown',escape);window.addEventListener('resize',close);window.addEventListener('scroll',scroll,true);return()=>{document.removeEventListener('mousedown',dismiss);document.removeEventListener('keydown',escape);window.removeEventListener('resize',close);window.removeEventListener('scroll',scroll,true);};},[position]);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 return <div ref={anchor} onMouseEnter={open} onMouseLeave={leave} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node)&&!panel.current?.contains(event.relatedTarget as Node))leave();}} className={cn('flex h-10 items-center rounded-lg text-[13px] font-medium transition',active||position?'bg-white/12 text-white':'text-white/65 hover:bg-white/7 hover:text-white')}>
 <Link to={path} aria-current={active?'page':undefined} className="flex min-w-0 flex-1 items-center gap-3 py-2 pl-3"><Icon size={17}/><span>{label}</span></Link>
 <button type="button" aria-label={`Open ${label} submenu`} aria-expanded={!!position} aria-controls={`sidebar-flyout-${label.replaceAll(' ','-')}`} onClick={()=>position?close():open()} onKeyDown={event=>{if(event.key==='ArrowRight'||event.key==='ArrowDown'){event.preventDefault();open();requestAnimationFrame(()=>panel.current?.querySelector('a')?.focus());}}} className="mr-1 grid size-8 place-items-center rounded-md hover:bg-white/10"><ChevronRight size={15}/></button>
 {position&&createPortal(<nav ref={panel} id={`sidebar-flyout-${label.replaceAll(' ','-')}`} aria-label={`${label} submenu`} onMouseEnter={()=>clearTimeout(timer.current)} onMouseLeave={leave} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node)&&!anchor.current?.contains(event.relatedTarget as Node))leave();}} style={{position:'fixed',left:position.left,top:position.top,zIndex:100,width:248,maxWidth:'calc(100vw - var(--sidebar-width) - 24px)',maxHeight:'calc(100vh - 16px)',overflowY:'auto',background:'white',color:'#17231f',border:'1px solid #e5e9e7',borderRadius:8,padding:'8px 0',boxShadow:'0 8px 28px #102c2026'}}>{childrenItems.map(child=>{const selected=path==='/accounting'?active&&accountingSubmenuActive(pathname,search,child.path):pathname===child.path.split('?')[0]&&(!child.path.includes('?')||new URLSearchParams(search).get('action')===new URLSearchParams(child.path.split('?')[1]).get('action'));return <Link key={child.path} to={child.path} onClick={close} className={cn('block px-4 py-3 text-[13px] transition hover:bg-emerald-50 focus:bg-emerald-50 focus:outline-none',selected?'bg-emerald-50 font-semibold text-emerald-800':'text-stone-800')}>{child.label}</Link>;})}</nav>,document.body)}
 </div>;
}
