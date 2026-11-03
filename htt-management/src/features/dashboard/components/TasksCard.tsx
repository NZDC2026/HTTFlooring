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
         <span className="ml-auto rounded-full bg-[var(--color-surface-muted)] px-2 py-0.5 text-xs tabular-nums">{activeTasks.length}</span>
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
 </CardContent></Card>;
}
