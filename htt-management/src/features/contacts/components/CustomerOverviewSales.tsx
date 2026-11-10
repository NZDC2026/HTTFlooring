import {useState} from 'react';
import { Link } from "react-router-dom";
import { useSyncExternalStore, type ReactNode } from "react";
import { WalletCards, TriangleAlert, CreditCard, Layers, ShoppingCart, Truck, Building2, UserRound, MapPin, Activity, Phone, Mail } from "lucide-react";
import { businessSettings } from "../../business-workspace/configurationState";
import { useCustomerSalesDocuments } from "../../sales/data/useSalesDocuments";
import { useCustomerAccountsReceivable } from "../../sales/data/useAccountsReceivable";
import { salesFulfilmentRepository } from "../../sales/data/salesFulfilmentRepository";
import { isStockLine } from "../../inventory/data/itemTypes";
import { paymentTermsLabel } from "../../payment-terms/paymentTerms";
import { CustomerStatusBadge } from "./CustomerStatusBadge";
import type { Customer } from "../types/customer";

function Panel({ title, icon: Icon, action, children }: {title:string;icon:typeof Building2;action?:ReactNode;children:ReactNode}) {
 return <section className="rounded-2xl border border-[#e7e1da] bg-white/90 p-5 shadow-[0_2px_5px_#233d2610]"><header className="mb-5 flex items-center justify-between gap-3"><h2 className="flex items-center gap-3 font-display text-[23px] font-bold"><Icon size={25} className="shrink-0 text-[#16632b]"/>{title}</h2>{action}</header>{children}</section>;
}
export function CustomerOverviewSales({ customer }: { customer: Customer }) {
 const documents = useCustomerSalesDocuments(customer.id);
 const ar = useCustomerAccountsReceivable(customer);
 const fulfilments = useSyncExternalStore(salesFulfilmentRepository.subscribe, salesFulfilmentRepository.getSnapshot, salesFulfilmentRepository.getSnapshot);
 const [sample,setSample]=useState(false);
 const base=`/contacts/customers/${customer.id}`;
 const money=(value:number)=>new Intl.NumberFormat("en-AU",{style:"currency",currency:businessSettings().currency}).format(value);
 const date=(value:string)=>new Date(`${value.slice(0,10)}T12:00:00`).toLocaleDateString("en-AU",{day:"2-digit",month:"short",year:"numeric"});
 const orders=documents.filter(d=>d.type==="SALES_ORDER").sort((a,b)=>b.documentDate.localeCompare(a.documentDate));
 const deliveries=orders.map(order=>{
  const lines=order.lines.filter(isStockLine);
  const active=fulfilments.filter(f=>f.salesOrderId===order.id&&f.status==="ACTIVE");
  const quantities=lines.map(l=>({ordered:l.quantity,shipped:active.flatMap(f=>f.lines).filter(f=>f.salesOrderLineId===l.id).reduce((s,f)=>s+f.fulfilledQuantity,0)}));
  const delivery=order.status==="CANCELLED"?"Cancelled":!lines.length?"No shipment required":quantities.every(q=>q.shipped>=q.ordered-0.000001)?"Shipped":quantities.some(q=>q.shipped>0)?"Partially shipped":"Not shipped";
  return {order,delivery};
 });
 const awaiting=deliveries.filter(d=>["Not shipped","Partially shipped"].includes(d.delivery));
 const open=orders.filter(o=>!["CANCELLED","FULFILLED"].includes(o.status));
 const link=(tab:string,label:string)=><Link className="whitespace-nowrap text-xs font-semibold text-[#155c29] hover:underline" to={`${base}/${tab}`}>{label} →</Link>;
 const contact=customer.contacts.find(c=>c.id===customer.primaryContactId)||customer.contacts.find(c=>c.isPrimary);
 const accountant=customer.contacts.find(c=>c.isAccounting);
 const location=customer.locations.find(l=>l.id===customer.primaryLocationId)||customer.locations.find(l=>l.isPrimary);
 const metrics=[
 {label:"Outstanding",icon:WalletCards,value:money(sample?2843.75:ar.totalOutstanding),detail:`${sample?1:ar.outstandingInvoiceCount} invoice(s)`,color:"#9a5016"},
 {label:"Overdue",icon:TriangleAlert,value:money(sample?2843.75:ar.overdueAmount),detail:`${sample?1:ar.overdueInvoiceCount} overdue invoice(s)`,color:"#ce2517",tint:"#fff5f2"},
 {label:"Credit Limit",icon:CreditCard,value:money(sample?50000:ar.creditLimit),detail:"",color:"#a35617"},
 {label:"Available Credit",icon:Layers,value:money(sample?47156.25:ar.availableCredit),detail:`(${Math.round((sample?47156.25:ar.availableCredit)/Math.max(1,sample?50000:ar.creditLimit)*100)}% available)`,color:"#18692e",tint:"#f0faf1"},
 {label:"Open Orders",icon:ShoppingCart,value:sample?1:open.length,detail:money(sample?5843.75:open.reduce((s,o)=>s+o.totals.total,0)),color:"#b27c18"},
 {label:"Awaiting Shipment",icon:Truck,value:sample?1:awaiting.length,detail:money(sample?5843.75:awaiting.reduce((s,d)=>s+d.order.totals.total,0)),color:"#b27c18"},
 ];
 const activity=sample?[
 {title:"Sales Order SO-SAMPLE-0001 created",detail:"20 Sep 2026 · $5,843.75",icon:ShoppingCart},
 {title:"Invoice INV-SAMPLE-0001 issued",detail:"02 Oct 2026 · $5,843.75",icon:WalletCards},
 {title:"Shipment scheduled",detail:"21 Sep 2026 · ETA 02 Oct 2026",icon:Truck},
 {title:"Follow-up note added",detail:"18 Sep 2026 · Confirmed delivery date",icon:Activity},
 ]:[...documents.map(d=>({title:`${d.type==="SALES_ORDER"?"Sales Order":d.type==="INVOICE"?"Invoice":"Quote"} ${d.documentNumber}`,detail:`${date(d.documentDate)} · ${money(d.totals.total)}`,icon:d.type==="SALES_ORDER"?ShoppingCart:WalletCards,at:d.createdAt})),...(customer.notes||[]).map(n=>({title:n.action==="reply"?"Note reply added":n.action==="resolve"?"Note resolved":"Follow-up note added",detail:`${date(n.createdAt)} · ${n.text}`,icon:Activity,at:n.createdAt}))].sort((a,b)=>b.at.localeCompare(a.at)).slice(0,5);
 const rows=sample?[{id:"sample",number:"SO-SAMPLE-0001",date:"20 Sep 2026",promised:"02 Oct 2026",status:"Invoiced",payment:"Partially paid",delivery:"Not shipped",total:5843.75}]:deliveries.slice(0,5).map(({order,delivery})=>({id:order.id,number:order.documentNumber,date:date(order.documentDate),promised:order.requestedDeliveryDate?date(order.requestedDeliveryDate):"—",status:order.status.replaceAll("_"," ").toLowerCase(),payment:"View invoice",delivery,total:order.totals.total}));
 return <div className="space-y-4">
 <label className="flex items-center gap-2 text-xs text-amber-800"><input type="checkbox" checked={sample} onChange={e=>setSample(e.target.checked)}/>Sample · Preview populated customer overview (read-only)</label>
 <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-6 xl:grid-cols-3">{metrics.map(m=><div key={m.label} style={{background:m.tint||"#fdfaf6"}} className="flex items-start gap-4 rounded-2xl border border-[#eae3da] p-5"><m.icon size={30} style={{color:m.color}} className="mt-1 shrink-0"/><div><p className="text-sm font-medium">{m.label}</p><p className="mt-1 whitespace-nowrap text-[26px] font-bold tracking-tight">{m.value}</p><p className="mt-1 text-sm">{m.detail||"\u00a0"}</p></div></div>)}</div>
 <div className="grid items-start gap-4 xl:grid-cols-[1.8fr_1fr]">
 <div className="space-y-4">
 <Panel title="Recent Orders" icon={ShoppingCart} action={link("sales","View All Orders")}><div className="-mx-5 overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-[#f8f5f0]"><tr>{["Order","Order Date","Promised Date","Order Status","Payment Status","Shipment Status","Total"].map(t=><th className="whitespace-nowrap px-3 py-4" key={t}>{t}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.id} className="border-t border-[#eee9e2]"><td className="whitespace-nowrap px-3 py-4 font-semibold text-[#155c29]">{sample?r.number:<Link className="underline" to={`/sales/orders/${r.id}`}>{r.number}</Link>}</td><td className="whitespace-nowrap p-3">{r.date}</td><td className="whitespace-nowrap p-3">{r.promised}</td><td className="p-3"><span className="rounded-xl bg-sky-100 px-3 py-2 capitalize text-sky-900">{r.status}</span></td><td className="p-3">{sample?<span className="whitespace-nowrap rounded-xl bg-red-50 p-2 text-red-800">{r.payment}</span>:link("sales",r.payment)}</td><td className="p-3"><span className="whitespace-nowrap rounded-xl bg-amber-50 p-2 text-amber-900">{r.delivery}</span></td><td className="whitespace-nowrap p-3 font-semibold">{money(r.total)}</td></tr>)}{!rows.length&&<tr><td colSpan={7} className="p-5 text-gray-500">No orders recorded.</td></tr>}</tbody></table></div></Panel>
 <div className="grid items-start gap-4 lg:grid-cols-[1fr_1.2fr]">
 <Panel title="Business Details" icon={Building2}>{[["Business Name",customer.businessName],["Trading Name",customer.tradingName],["ABN",customer.abn],["Business Type",customer.businessType],["Website",customer.website]].map(([label,value])=><div className="border-b border-[#eee9e2] py-3 last:border-0" key={label}><p className="mb-1 text-xs">{label}</p><p className="break-words text-sm font-semibold">{value||"—"}</p></div>)}</Panel>
 <div className="space-y-4"><Panel title="Account & Trading" icon={CreditCard}>{[["Payment Terms",paymentTermsLabel(customer)],["Credit Limit",money(sample?50000:ar.creditLimit)]].map(([label,value])=><div className="flex justify-between gap-3 border-b border-[#eee9e2] py-3 text-sm" key={label}><span>{label}</span><strong>{value}</strong></div>)}<div className="flex justify-between py-3 text-sm"><span>Account Status</span><CustomerStatusBadge status={customer.status}/></div><details className="text-xs text-gray-500"><summary>Credit balances</summary><p className="mt-2">Unallocated credits: {money(ar.unallocatedCredit)}</p><p>Net account balance: {money(ar.netAccountBalance)}</p></details></Panel>
 <Panel title="Primary Contact" icon={UserRound} action={link("contacts","View All Contacts")}><div className="mb-4 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50 font-semibold text-green-800">{contact?`${contact.firstName[0]||""}${contact.lastName[0]||""}`:"—"}</span><div><strong className="text-sm">{contact?`${contact.firstName} ${contact.lastName}`:"No primary contact"}</strong><p className="text-xs">{contact?.jobTitle}</p></div></div><div className="flex flex-wrap gap-4 text-xs"><span className="flex items-center gap-2"><Phone size={16}/>{contact?.mobile||contact?.phone||"—"}</span><span className="flex items-center gap-2 break-all"><Mail size={16}/>{contact?.email||"—"}</span></div></Panel></div></div></div>
 <div className="space-y-4"><Panel title="Recent Customer Activity" icon={Activity} action={link("activity","View All")}><div className="space-y-5">{activity.map((a,i)=><div className="relative flex gap-4" key={i}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#edf7ed] text-[#19612a]"><a.icon size={21}/></span><div><p className="text-sm font-semibold">{a.title}</p><p className="mt-1 line-clamp-2 text-sm text-gray-600">{a.detail}</p></div></div>)}{!activity.length&&<p className="text-sm text-gray-500">No recorded activity.</p>}</div></Panel>
 <Panel title="Default Delivery Address" icon={MapPin} action={link("locations","View All Locations")}><div className="min-h-36 space-y-2 text-sm"><strong>{location?.name||"No default delivery address"}</strong><p>{location?.addressLine1}</p>{location?.addressLine2&&<p>{location.addressLine2}</p>}<p>{location&&`${location.suburb}, ${location.state} ${location.postcode}`}</p><p>{location?.country}</p></div>{accountant&&<details className="mb-3 text-xs text-gray-500"><summary>Accountant Contact</summary><p className="mt-2">{accountant.firstName} {accountant.lastName} · {accountant.mobile||accountant.phone||"—"}</p><p>{accountant.email}</p></details>}{customer.billingAddress&&<details className="mt-3 text-xs text-gray-500"><summary>Billing address</summary><p className="mt-2">{[customer.billingAddress.addressLine1,customer.billingAddress.suburb,customer.billingAddress.state,customer.billingAddress.postcode].filter(Boolean).join(", ")}</p></details>}</Panel></div>
 </div></div>;
}
