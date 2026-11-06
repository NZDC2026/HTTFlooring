import { useSuppliers } from "../../contacts/data/useSuppliers";
import { shipmentStatus } from "../../incoming-shipments/shipmentModel";
import { usePurchaseOrders } from "../../purchases/data/usePurchaseOrders";
import { shipmentAlerts, shipmentAlertTiming } from "../../incoming-shipments/shipmentAlerts";
import { usePermission } from "../../security/usePermission";
import { businessDateKey } from "../../../lib/businessDate";
import { useState } from "react";
import { useSecurity } from "../../security/securityClient";
import { Bell, ChevronRight } from "lucide-react";
import {businessSettings} from '../../business-workspace/configurationState';
import { useWorkspaceRecords } from '../../business-workspace/workspaceRepository';
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui/Card";
import { useFinanceOverview } from "../data/useFinanceOverview";
const fmt = (n: number) => new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" }).format(n);
export function TasksCard() {
 const today = new Date().toLocaleDateString("en-CA", {timeZone:businessSettings().timezone});
 const data = useFinanceOverview(today);
 const orders = usePurchaseOrders();
 const canReadPurchases = usePermission("purchases.read");
 const suppliers=useSuppliers();
 const savedShipments=suppliers.flatMap(s=>(s.shipments??[]).map(shipment=>({supplier:s.businessName,shipment})));
 const linkedOrders=new Set(savedShipments.filter(s=>s.shipment.status!=='Cancelled').flatMap(s=>s.shipment.lines.map(l=>l.purchaseOrderId)));
 const shipments = canReadPurchases ? [
     ...shipmentAlerts(orders.filter(o=>!linkedOrders.has(o.id)), today),
     ...savedShipments.filter(({shipment:s})=>!['Received','Cancelled','Draft'].includes(shipmentStatus(s,today))).flatMap(({supplier,shipment:s})=>{const days=Math.round((Date.parse(s.eta)-Date.parse(today))/86400000);return days<=7?[{id:s.id,number:s.number,supplier,eta:s.eta,days,overdue:days<0}]:[]}),
 ].sort((a,b)=>a.days-b.days) : [];
 const [showShipmentSample, setShowShipmentSample] = useState(true);
 const sampleDate = (days: number) => {
     const date = new Date(`${today}T12:00:00Z`);
     date.setUTCDate(date.getUTCDate() + days);
     return businessDateKey(date.toISOString().slice(0, 10));
 };
 const { session } = useSecurity();
 const [deliveryScope, setDeliveryScope] = useState<"mine" | "team">("mine");
 const records = useWorkspaceRecords("tasks");
 const hasDeliveries = records.some(task => task.orderId && task.status !== "Completed");
 const followups = records.filter(task => !["Completed", "Inactive"].includes(task.status) &&
     (task.orderId ? deliveryScope === "team" || task.owner === session?.user.id : task.due <= today));
 const tasks = [
 ...followups.map(t=>({title:t.name,description:t.orderId ? `${t.deliveryAt.replace('T',' ')} · ${t.ownerName} · ${t.deliveryAddress}` : `${t.due<today?'Overdue':'Due today'} · ${t.due} · ${t.priority}`,path:t.orderId ? `/sales/orders/${t.orderId}` : `/tasks/${t.id}`,active:true})),
  {title:`${data.overdueInvoiceCount} overdue invoices`, description:`${fmt(data.overdueReceivables)} requires follow-up`, path:"/sales", active:data.overdueInvoiceCount>0},
  {title:`${data.bankReviewCount} bank accounts require evidence review`,description:"Saved reconciliation evidence is invalid or incomplete",path:"/banking",active:data.bankReviewCount>0},
  {title:`${data.unreconciledCount} ${data.bankReviewCount ? "bank rows without verified clearing" : "uncleared bank transactions"}`, description:"Review outstanding bank activity", path:"/banking", active:data.unreconciledCount>0},
  {title:"Overdue supplier payments", description:`${fmt(data.overduePayables)} overdue`, path:"/purchases", active:data.overduePayables>0},
 ];
 const activeTasks = tasks.filter(task => task.active);
 return <Card><CardContent className="px-3 py-2.5">
     <div className="flex items-center gap-2.5">
         <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]"><Bell size={15} aria-hidden="true"/></span>
         <h2 className="text-sm font-semibold">Tasks &amp; Alerts</h2>
         {hasDeliveries && <select aria-label="Delivery task scope" value={deliveryScope}
             className="ml-auto rounded border border-[var(--color-border)] px-1 py-0.5 text-xs"
             onChange={event => setDeliveryScope(event.target.value === "team" ? "team" : "mine")}>
             <option value="mine">My deliveries</option>
             <option value="team">Team deliveries</option>
         </select>}
         <span className="ml-auto rounded-full bg-[var(--color-surface-muted)] px-2 py-0.5 text-xs tabular-nums">{activeTasks.length + shipments.length}</span>
     </div>
     <div className="mt-1 max-h-28 overflow-y-auto divide-y divide-[var(--color-border)]">
         {activeTasks.length ? activeTasks.map(task => <Link key={task.path + task.title} to={task.path} className="flex items-center justify-between gap-3 rounded px-1 py-1 hover:bg-[var(--color-surface-muted)]">
             <div className="min-w-0">
                 <p className="text-xs font-medium">{task.title}</p>
                 <p className="text-[11px] text-[var(--color-text-secondary)]">{task.description}</p>
             </div>
             <ChevronRight size={15} className="shrink-0 text-[var(--color-text-muted)]" aria-hidden="true"/>
         </Link>) : <p className="py-2 text-sm text-[var(--color-text-secondary)]">No tasks or alerts in this view.</p>}
     </div>
 {canReadPurchases && <section className="mt-2 border-t border-[var(--color-border)] pt-2" aria-label="Incoming shipment reminders">
     <div className="flex items-center justify-between gap-2">
         <h3 className="text-xs font-semibold">Incoming Shipment <span className="text-[var(--color-text-muted)]">({shipments.length})</span></h3>
         <Link to="/purchases/incoming-shipments" className="text-[11px] underline">View shipments →</Link>
     </div>
     <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">ETA within 7 days or overdue · Update ETA after confirming with your agency.</p>
     <div className="mt-1 max-h-40 overflow-y-auto divide-y divide-[var(--color-border)]">
         {shipments.map(item => <Link key={item.id} to="/purchases/incoming-shipments" className="flex items-center justify-between gap-2 rounded px-1 py-2 hover:bg-[var(--color-surface-muted)]">
             <div><p className={`text-xs font-semibold ${item.overdue ? "text-red-700" : "text-orange-700"}`}>{item.number} · {shipmentAlertTiming(item.days)}</p>
             <p className="text-[11px] text-[var(--color-text-secondary)]">{item.supplier} · ETA {item.eta}</p></div><ChevronRight size={14}/>
         </Link>)}
         {!shipments.length && <p className="py-2 text-[11px] text-[var(--color-text-secondary)]">No incoming shipments due within 7 days or overdue.</p>}
     </div>
     <label className="mt-1 flex items-center gap-2 text-[11px]"><input type="checkbox" checked={showShipmentSample} onChange={event => setShowShipmentSample(event.target.checked)}/>Show Sample shipment reminders</label>
     {showShipmentSample && <div className="mt-2 space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[11px]">
         <p className="font-semibold text-amber-900">Sample · Read-only preview</p>
         <div><p className="font-semibold text-orange-700">Sample · PO-SAMPLE-021 · Due in 3 days</p><p>Sample Timber Export · ETA {sampleDate(3)}</p></div>
         <div><p className="font-semibold text-red-700">Sample · PO-SAMPLE-022 · 2 days overdue</p><p>Sample Flooring Supply · ETA {sampleDate(-2)}</p></div>
         <div><p className="font-semibold text-green-700">Sample · PO-SAMPLE-019 · Received</p><p>Sample Oak Imports · Received {sampleDate(-1)} · Reminder cleared</p></div>
         <p className="text-amber-900">Samples are excluded from live alerts and notifications.</p>
     </div>}
 </section>}
 </CardContent></Card>;
}
