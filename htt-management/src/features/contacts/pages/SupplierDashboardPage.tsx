import { shipmentStatus } from "../../incoming-shipments/shipmentModel";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Truck, ClipboardList, TriangleAlert, Clock, Layers, Ship, ChartNoAxesColumnIncreasing } from "lucide-react";
import { useSuppliers } from "../data/useSuppliers";
import { useSupplierBills } from "../../purchases/data/useSupplierBills";
import { useSupplierPayments } from "../../purchases/data/useSupplierPayments";
import { useSupplierCredits, useSupplierCreditAllocations } from "../../purchases/data/useSupplierCredits";
import { usePurchaseOrders } from "../../purchases/data/usePurchaseOrders";
import { calculateSupplierAccountsPayable } from "../../purchases/data/accountsPayableService";
import { businessDateKey, fiscalYearStart } from "../../../lib/businessDate";
import { businessSettings } from "../../business-workspace/configurationState";
import { incomingStatuses } from "../../incoming-shipments/shipmentEta";
import { shipmentAlerts } from "../../incoming-shipments/shipmentAlerts";
import { usePermission } from "../../security/usePermission";

const panel = "rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-sm";
const tile = "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4";
export function SupplierDashboardPage() {
    const suppliers=useSuppliers(), bills=useSupplierBills(), payments=useSupplierPayments();
    const credits=useSupplierCredits(), allocations=useSupplierCreditAllocations(), orders=usePurchaseOrders();
    const canRead=usePermission("purchases.read"), canCreate=usePermission("contacts.write");
    const [sample,setSample]=useState(false);
    const today=businessDateKey(new Date().toISOString()), start=fiscalYearStart(today);
    const money=(value:number)=>new Intl.NumberFormat("en-AU",{style:"currency",currency:businessSettings().currency}).format(value);
    const dated=(offset:number)=>{const d=new Date(`${today}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10);};
    const actualRows=suppliers.map(s=>{
        const ap=calculateSupplierAccountsPayable(s,bills,payments,credits,allocations,today);
        return {id:s.id,name:s.businessName,outstanding:ap.totalOutstanding,overdue:ap.overdueAmount,
            purchases:bills.filter(b=>b.supplierId===s.id&&b.status!=="VOID"&&b.billDate>=start&&b.billDate<=today).reduce((n,b)=>n+b.totals.total,0)};
    });
    const rows=sample?[
        {id:"sample-1",name:"Sample Melbourne Flooring",purchases:286420,outstanding:48375,overdue:12000},
        {id:"sample-2",name:"Sample Oak Timber Supply",purchases:184600,outstanding:36200,overdue:0},
        {id:"sample-3",name:"Sample Timber Export",purchases:162350,outstanding:24800,overdue:8400},
    ]:actualRows;
    const paidYtd=sample?468500:payments.filter(p=>p.status==="POSTED"&&!p.prepaymentApplicationId&&p.paymentDate>=start&&p.paymentDate<=today).reduce((sum,p)=>sum+p.amount,0);
    const outstanding=rows.reduce((n,s)=>n+s.outstanding,0), overdue=rows.reduce((n,s)=>n+s.overdue,0), ytd=rows.reduce((n,s)=>n+s.purchases,0);
    const savedShipments=suppliers.flatMap(s=>(s.shipments??[]).map(shipment=>({supplier:s.businessName,shipment})));
    const linkedOrders=new Set(savedShipments.filter(s=>s.shipment.status!=='Cancelled').flatMap(s=>s.shipment.lines.map(l=>l.purchaseOrderId)));
    const incoming=orders.filter(o=>incomingStatuses.some(s=>s===o.status)&&!linkedOrders.has(o.id));
    const alerts=shipmentAlerts(incoming,today);
    const shipments=sample?[
        {id:"sample-po-1",number:"PO-SAMPLE-021",supplier:"Sample Timber Export",eta:dated(12),status:"In transit"},
        {id:"sample-po-2",number:"PO-SAMPLE-022",supplier:"Sample Oak Timber Supply",eta:dated(3),status:"Arriving soon"},
        {id:"sample-po-3",number:"PO-SAMPLE-023",supplier:"Sample Melbourne Flooring",eta:dated(-2),status:"Delayed"},
    ]:[...incoming.map(o=>({id:o.id,number:o.purchaseOrderNumber,supplier:o.supplierName,eta:o.expectedDeliveryDate||"Not set",status:alerts.find(a=>a.id===o.id)?.overdue?"Delayed":alerts.some(a=>a.id===o.id)?"Arriving soon":"In transit"})),...savedShipments.filter(({shipment:s})=>!['Received','Draft','Cancelled'].includes(shipmentStatus(s,today))).map(({supplier,shipment:s})=>({id:s.id,number:s.number,supplier,eta:s.eta,status:s.eta<today?'Delayed':shipmentStatus(s,today)==='Arriving Soon'?'Arriving soon':'In transit'}))];
    const activity=sample?[
        {id:"s1",title:"Task · Confirm vessel ETA",text:"Sample Timber Export · Jamie · Purchasing · Agency confirmation pending",date:today,status:"Open",path:""},
        {id:"s2",title:"Note · Dispatch confirmed",text:"Sample Melbourne Flooring · Alex · Purchasing · Oak flooring is ready for dispatch",date:dated(-1),status:"Open",path:""},
        {id:"s3",title:"Reply · Packing list received",text:"Sample Melbourne Flooring · Jamie · Purchasing · Packing list checked",date:dated(-1),status:"Open",path:""},
        {id:"s4",title:"Task · Check delivery documents",text:"Sample Oak Timber Supply · Completed by Jamie · Purchasing",date:dated(-2),status:"Completed",path:""},
    ]:suppliers.flatMap(s=>[
        ...(s.activities??[]).map(a=>({id:a.id,title:`${a.kind} · ${a.text}`,text:`${s.businessName} · ${a.actorName}${a.due?` · Due ${a.due}`:""}`,date:a.completion?.at??a.at,status:a.completion?"Completed":"Open",path:`/contacts/suppliers/${s.id}`})),
        ...(s.activities??[]).flatMap(a=>a.replies.map(r=>({id:r.id,title:`Reply · ${r.text}`,text:`${s.businessName} · ${r.actorName}`,date:r.at,status:a.completion?"Completed":"Open",path:`/contacts/suppliers/${s.id}`}))),
        ...(s.notes?[{id:`profile-${s.id}`,title:"Supplier profile note",text:`${s.businessName} · ${s.notes}`,date:s.updatedAt,status:"Note",path:`/contacts/suppliers/${s.id}`}]:[]),
    ]).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
    function heading(title:string,path:string,label:string,Icon:typeof Users) {return <div className="mb-4 flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 font-display text-xl"><Icon size={19}/>{title}</h2><Link className="text-xs text-[var(--color-primary)] underline" to={path}>{label} →</Link></div>;}
    if(!canRead) return <div className={panel}>Purchases access is required to view the supplier dashboard.</div>;
    return <div className="space-y-4 pb-8">
        <header className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-widest text-[var(--color-accent)]">Contacts</p><h1 className="font-display text-3xl">Suppliers</h1><p className="mt-1 text-sm text-[var(--color-text-secondary)]">Suppliers, purchases, shipments and payments · {businessSettings().currency}</p></div><div className="flex gap-2"><Link className={tile} to="/contacts/suppliers">View suppliers</Link>{canCreate&&<Link className="rounded-xl bg-[var(--color-primary)] px-4 py-3 text-white" to="/contacts/suppliers/new">+ New supplier</Link>}</div></header>
        <label className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"><input type="checkbox" checked={sample} onChange={e=>setSample(e.target.checked)}/>Show Sample dashboard · Read-only synthetic preview; excluded from live records and reminders.</label>
        {sample&&<p className="text-sm font-semibold text-amber-800">Sample · All figures and activity below are illustrative.</p>}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
            {label:"Total suppliers",value:sample?"3":String(suppliers.length),Icon:Users},
            {label:"Active suppliers",value:sample?"3":String(suppliers.filter(s=>s.status==="ACTIVE").length),Icon:Truck},
            {label:"Outstanding (AP)",value:money(outstanding),Icon:ClipboardList},
            {label:"Overdue (AP)",value:money(overdue),Icon:TriangleAlert},
        ].map(({label,value,Icon})=>{
            const content=<><Icon size={26}/><div><p className="text-xs">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div></>;
            const className=`${panel} flex items-center gap-4 ${label==="Overdue (AP)"?"text-red-700 bg-red-50":""}`;
            const filter=label==="Active suppliers"?"active":label==="Outstanding (AP)"?"outstanding":label==="Overdue (AP)"?"overdue":"all";
            const query=new URLSearchParams();if(filter!=="all")query.set("filter",filter);if(sample)query.set("sample","1");
            return <Link key={label} to={`/contacts/suppliers${query.size?`?${query}`:""}`} aria-label={`${label} — view supplier list`} className={`${className} transition hover:border-[var(--color-primary)] hover:shadow-md focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]`}>{content}</Link>;
        })}</div>
        <div className="grid items-start gap-4 xl:grid-cols-2">
            <section className={panel}>{heading("Recent Activities · Notes & Tasks","/contacts/suppliers","View suppliers",Clock)}<div className="divide-y divide-[var(--color-border)]">{activity.map(a=>{const content=<><div className="min-w-0"><p className="line-clamp-2 text-sm font-semibold">{a.title}</p><p className="mt-1 line-clamp-2 text-xs text-[var(--color-text-secondary)]">{a.text}</p></div><div className="shrink-0 text-right"><span className={`rounded-full px-2 py-1 text-[10px] ${a.status==="Completed"?"bg-green-50 text-green-700":"bg-orange-50 text-orange-700"}`}>{a.status}</span><p className="mt-2 text-[11px] text-[var(--color-text-muted)]">{a.date.slice(0,10)}</p></div></>;return sample?<div key={a.id} className="flex justify-between gap-3 py-3">{content}</div>:<Link key={a.id} to={a.path} className="flex justify-between gap-3 rounded py-3 hover:bg-[var(--color-surface-muted)]">{content}</Link>;})}{!activity.length&&<p className="text-sm text-[var(--color-text-muted)]">No supplier notes or tasks. Add them in a supplier’s details, or enable Sample above to preview.</p>}</div></section>
            <section className={panel}>{heading("Accounts Payable Summary","/reports/aged-payables","View AP details",Layers)}<div className="grid gap-3 sm:grid-cols-2">{[{label:"Outstanding",value:outstanding},{label:"Overdue",value:overdue},{label:"Total Purchases (YTD)",value:ytd},{label:"Total Payable (YTD)",value:paidYtd}].map(m=><div className={`${tile} ${m.label==="Overdue"?"text-red-700":""}`} key={m.label}><p className="text-xs">{m.label}</p><p className="mt-2 text-xl font-semibold">{money(m.value)}</p></div>)}</div><p className="mt-3 text-[11px] text-[var(--color-text-muted)]">YTD: {start} – {today} · Purchases: non-void bills incl. GST. Total Payable: actual bill payments this year, excluding reversed payments. Business currency.</p></section>
            <section className={panel}>{heading("Incoming Shipments","/purchases/incoming-shipments","View all shipments",Ship)}<div className="mb-3 grid grid-cols-3 gap-2">{["In transit","Arriving soon","Delayed"].map(s=><div key={s} className={`${tile} ${s==="Delayed"?"text-red-700":""}`}><p className="text-xs">{s}</p><p className="text-xl font-semibold">{shipments.filter(r=>r.status===s).length}</p></div>)}</div><div className="divide-y divide-[var(--color-border)]">{shipments.slice(0,5).map(s=><div key={s.id} className="flex items-center justify-between gap-2 py-3"><div><p className="text-xs font-semibold">{s.number} · {s.supplier}</p><p className="mt-1 text-xs text-[var(--color-text-muted)]">ETA: {s.eta}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] ${s.status==="Delayed"?"bg-red-50 text-red-700":s.status==="Arriving soon"?"bg-amber-50 text-amber-800":"bg-blue-50 text-blue-800"}`}>{s.status}</span></div>)}{!shipments.length&&<p className="text-sm text-[var(--color-text-muted)]">No incoming shipments.</p>}</div><p className="mt-2 text-[11px] text-[var(--color-text-muted)]">Arriving soon: within 7 days. Received and cancelled orders are excluded.</p></section>
            <section className={panel}>{heading("Top Suppliers (YTD Purchases)","/contacts/suppliers","View all suppliers",ChartNoAxesColumnIncreasing)}<div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-[var(--color-surface-muted)]"><tr>{["Supplier","Purchases (YTD)","Outstanding","Overdue"].map(h=><th key={h} className="p-2">{h}</th>)}</tr></thead><tbody>{[...rows].sort((a,b)=>b.purchases-a.purchases).slice(0,5).map(r=><tr key={r.id} className="border-b border-[var(--color-border)]"><td className="p-2">{sample?r.name:<Link className="underline" to={`/contacts/suppliers/${r.id}`}>{r.name}</Link>}</td><td className="p-2 tabular-nums">{money(r.purchases)}</td><td className="p-2 tabular-nums">{money(r.outstanding)}</td><td className={`p-2 tabular-nums ${r.overdue>0?"text-red-700":""}`}>{money(r.overdue)}</td></tr>)}</tbody></table>{!rows.length&&<p className="py-3 text-sm text-[var(--color-text-muted)]">No suppliers recorded.</p>}</div></section>
        </div>
    </div>;
}
