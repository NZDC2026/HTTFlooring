import {sidebarOwner,pathWithin,accountingSubmenuActive} from './navigationState';
import { useEffect, useState } from "react";
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
import { NavLink, Link, useLocation } from "react-router-dom";

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
    const inSuppliers=owner==='/contacts/supplier-dashboard';
    const inCustomers=owner==='/contacts';
    const inInventory=pathname==='/inventory'||pathname.startsWith('/inventory/');
    const [expanded,setExpanded]=useState({customers:inCustomers,suppliers:inSuppliers,inventory:inInventory,accounting:pathWithin(pathname,'/accounting')});
    useEffect(()=>{if(inCustomers)setExpanded(value=>({...value,customers:true}));if(inSuppliers)setExpanded(value=>({...value,suppliers:true}));if(inInventory)setExpanded(value=>({...value,inventory:true}));if(owner==='/accounting')setExpanded(value=>({...value,accounting:true}));},[pathname,inCustomers,inSuppliers,inInventory,owner]);
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
                                    if(item.path==='/accounting'){
                                        const children=[['Overview','/accounting'],['Chart of Accounts','/accounting?view=accounts'],['Journal Entries','/accounting/journals'],['Bank Reconciliation','/banking'],['Period Closing','/accounting/periods'],['GST / BAS','/reports/tax-summary'],['Financial Reports','/reports?category=Financial']];
                                        const active=pathWithin(pathname,'/accounting');
                                        return <div key={item.path}><div className={cn('flex h-10 items-center rounded-lg text-[13px] font-medium',active?'bg-white/12 text-white':'text-white/65')}><NavLink to="/accounting" onClick={()=>setExpanded(v=>({...v,accounting:true}))} className="flex flex-1 items-center gap-3 py-2 pl-3"><Icon size={17}/><span>Accounting</span></NavLink><button type="button" aria-label={`${expanded.accounting?'Collapse':'Expand'} Accounting`} aria-expanded={expanded.accounting} onClick={()=>setExpanded(v=>({...v,accounting:!v.accounting}))} className="mr-1 grid size-8 place-items-center"><ChevronDown size={14} className={expanded.accounting?'rotate-180':''}/></button></div>{expanded.accounting&&<nav aria-label="Accounting submenu" className="ml-5 mt-1 border-l border-white/15 pl-3">{children.map(([label,path])=><Link key={label} to={path} className={cn('block rounded-lg px-3 py-2 text-xs',owner==='/accounting'&&accountingSubmenuActive(pathname,locationSearch,path)?'bg-white/10 font-semibold text-white':'text-white/60 hover:bg-white/7')}>{label}</Link>)}</nav>}</div>;
                                    }
                                    if(item.path==='/inventory'){
                                        const children=[{label:'Sold',path:'/inventory/sold',permission:'sales.read' as Permission},{label:'Bought',path:'/inventory/bought',permission:'purchases.read' as Permission},{label:'Damage Stock',path:'/inventory/damage',permission:'inventory.read' as Permission},{label:'Stock Adjustments',path:'/inventory/adjustments',permission:'inventory.read' as Permission}].filter(child=>hasPermission(principal,child.permission));
                                        return <div key={item.path}><div className={cn('group flex h-10 items-center rounded-lg text-[13px] font-medium transition',inInventory?'bg-white/12 text-white':'text-white/65 hover:bg-white/7 hover:text-white')}><NavLink to="/inventory" end onClick={()=>setExpanded(v=>({...v,inventory:true}))} className="flex min-w-0 flex-1 items-center gap-3 py-2 pl-3"><Icon size={17} strokeWidth={1.8} className={inInventory?'text-[var(--color-accent)]':'text-white/55'}/><span>Inventory</span></NavLink>{!!children.length&&<button type="button" aria-label={`${expanded.inventory?'Collapse':'Expand'} Inventory`} aria-expanded={expanded.inventory} aria-controls="sidebar-inventory-submenu" onClick={()=>setExpanded(v=>({...v,inventory:!v.inventory}))} className="mr-1 grid size-8 place-items-center rounded-md hover:bg-white/10"><ChevronDown size={14} className={cn('transition-transform',expanded.inventory?'rotate-180':'')}/></button>}</div>{expanded.inventory&&!!children.length&&<nav id="sidebar-inventory-submenu" aria-label="Inventory submenu" className="ml-5 mt-1 border-l border-white/15 pl-3">{children.map(child=><NavLink key={child.path} to={child.path} end className={({isActive})=>cn('block rounded-lg px-3 py-2 text-xs transition',isActive?'bg-white/10 font-semibold text-white':'text-white/60 hover:bg-white/7 hover:text-white')}>{child.label}</NavLink>)}</nav>}</div>;
                                    }
                                    if(item.path==='/contacts'||item.path==='/contacts/supplier-dashboard'){
                                        const key=item.path==='/contacts'?'customers':'suppliers';
                                        const active=key==='customers'?inCustomers:inSuppliers;
                                        const childPath=key==='customers'?'/contacts/list':'/contacts/suppliers';
                                        const childLabel=key==='customers'?'All Customers':'All Suppliers';
                                        const childAllowed=hasPermission(principal,'contacts.write');
                                        return <div key={item.path}>
                                            <div className={cn('group flex h-10 items-center rounded-lg text-[13px] font-medium transition',active?'bg-white/12 text-white':'text-white/65 hover:bg-white/7 hover:text-white')}>
                                                <NavLink to={item.path} end onClick={()=>setExpanded(value=>({...value,[key]:true}))} className="flex min-w-0 flex-1 items-center gap-3 py-2 pl-3">
                                                    <Icon size={17} strokeWidth={1.8} className={active?'text-[var(--color-accent)]':'text-white/55'}/><span>{item.label}</span>
                                                </NavLink>
                                                {childAllowed&&<button type="button" aria-label={`${expanded[key]?'Collapse':'Expand'} ${item.label}`} aria-expanded={expanded[key]} aria-controls={`sidebar-${key}-submenu`} onClick={()=>setExpanded(value=>({...value,[key]:!value[key]}))} className="mr-1 grid size-8 place-items-center rounded-md hover:bg-white/10"><ChevronDown size={14} className={cn('transition-transform',expanded[key]?'rotate-180':'')}/></button>}
                                            </div>
                                            {childAllowed&&expanded[key]&&<nav id={`sidebar-${key}-submenu`} aria-label={`${item.label} submenu`} className="ml-5 mt-1 border-l border-white/15 pl-3"><NavLink to={childPath} end className={({isActive})=>cn('block rounded-lg px-3 py-2 text-xs transition',isActive?'bg-white/10 font-semibold text-white':'text-white/60 hover:bg-white/7 hover:text-white')}>{childLabel}</NavLink></nav>}
                                        </div>;
                                    }

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
                                                                ? "text-[var(--color-accent)]"
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
