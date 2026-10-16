import {businessSettings} from '../../business-workspace/configurationState';
import { useWorkspaceRecords } from '../../business-workspace/workspaceRepository';
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui/Card";
import { useFinanceOverview } from "../data/useFinanceOverview";
const fmt = (n: number) => new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" }).format(n);
export function TasksCard() {
 const today = new Date().toLocaleDateString("en-CA", {timeZone:businessSettings().timezone});
 const data = useFinanceOverview(today);
 const followups=useWorkspaceRecords('tasks').filter(t=>!['Completed','Inactive'].includes(t.status)&&t.due<=today);
 const tasks = [
 ...followups.map(t=>({title:t.name,description:`${t.due<today?'Overdue':'Due today'} · ${t.due} · ${t.priority}`,path:`/tasks/${t.id}`,active:true})),
  {title:`${data.overdueInvoiceCount} overdue invoices`, description:`${fmt(data.overdueReceivables)} requires follow-up`, path:"/sales", active:data.overdueInvoiceCount>0},
  {title:`${data.unreconciledCount} uncleared bank transactions`, description:"Review outstanding bank activity", path:"/banking", active:data.unreconciledCount>0},
  {title:"Overdue supplier payments", description:`${fmt(data.overduePayables)} overdue`, path:"/purchases", active:data.overduePayables>0},
 ];
 return <Card><CardContent><h2 className="font-display text-xl">Tasks &amp; Alerts</h2><p className="mt-1 text-xs text-[var(--color-text-muted)]">Items requiring your attention</p><div className="mt-5 divide-y divide-[var(--color-border)]">{tasks.filter(t=>t.active).length ? tasks.filter(t=>t.active).map(task=><Link key={task.title} to={task.path} className="block py-3"><p className="text-sm font-medium">{task.title}</p><p className="text-xs text-[var(--color-text-muted)]">{task.description}</p></Link>) : <p className="py-4 text-sm">No overdue finance tasks.</p>}</div></CardContent></Card>;
}
