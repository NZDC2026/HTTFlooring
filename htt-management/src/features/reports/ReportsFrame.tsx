import type {ReactNode} from 'react';
import {Link,useLocation} from 'react-router-dom';
import {ChartNoAxesCombined,Lightbulb,ChevronRight} from 'lucide-react';
import {hasPermission} from '../security/rbac';
import {useSecurity} from '../security/securityClient';
import {reportCategories,reportLinks} from './reportNavigation';
import './reports-workspace.css';
export function ReportsFrame({children,category='Accounts (AR / AP)'}:{children:ReactNode;category?:string}){
 const {session}=useSecurity(),location=useLocation();
 const principal=session&&{userId:session.user.id,roles:session.user.roles,authenticated:true as const};
 const links=reportLinks.filter(r=>r.category===category&&hasPermission(principal,r.permission));
 const current=location.pathname+location.search;
 return <div className="reports-workspace"><h1>Reports</h1><nav className="reports-categories" aria-label="Report categories">{reportCategories.map(c=><Link className={c===category?'active':''} key={c} to={c==='Accounts (AR / AP)'?'/reports':'/reports?category='+encodeURIComponent(c)}>{c}</Link>)}</nav><div className="reports-layout"><nav className="reports-side reports-panel" aria-label="Report list"><h3>{category==='Accounts (AR / AP)'?'Accounts Reports':category}</h3>{links.map(l=><Link className={current===l.path?'active':''} key={l.name} to={l.path}>{l.name}</Link>)}</nav><main>{children}</main><aside className="reports-panel reports-quick"><h2><ChartNoAxesCombined size={20}/>Quick Reports</h2>{reportLinks.filter(l=>l.category==='Accounts (AR / AP)'&&l.name!=='Account Activity'&&hasPermission(principal,l.permission)).map(l=><Link key={l.name} className={current===l.path?'active':''} to={l.path}>{l.name}<ChevronRight size={16}/></Link>)}<section className="reports-tips"><h3><Lightbulb size={22}/>Tips</h3><ul><li>Ageing groups unpaid invoices by days past their due date.</li><li>Use Overdue Only to focus on accounts needing follow-up.</li><li>Select customers to review and email statements or invoices.</li>Exports use the selected report date and filters.</ul></section></aside></div></div>;
}
