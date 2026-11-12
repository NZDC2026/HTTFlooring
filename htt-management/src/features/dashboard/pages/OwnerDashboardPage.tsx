import {useCustomerDeposits,depositBalanceAt,type DepositState} from '../../customer-deposits/customerDepositRepository';
import {Link2} from 'lucide-react';
import {AdminInsights} from '../components/AdminInsights';
import {AdminOperationsPanels} from '../components/AdminOperationsPanels';
import {AdminFinancialSummary} from '../components/AdminFinancialSummary';
import {PaymentFollowups} from '../components/PaymentFollowups';
import {ReceivablesAging} from '../components/ReceivablesAging';
import {DateRangePicker,dateRangePreset} from '../../../components/date-range/DateRangePicker';
import {useEffect,useState,type ReactNode} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {BarChart3,Database,Percent,Users,TriangleAlert,Landmark,Layers,ClipboardCheck,ChevronRight,Truck,PackageCheck} from 'lucide-react';
import {useSecurity} from '../../security/securityClient';
import {hasPermission,type VerifiedPrincipal} from '../../security/rbac';
import {businessSettings} from '../../business-workspace/configurationState';
import {businessDateKey} from '../../../lib/businessDate';
import {useAccounts,useJournalEntries} from '../../accounting/data/useAccounting';
import {calculateProfitAndLoss} from '../../accounting/data/profitAndLossService';
import {useBankAccounts} from '../../banking/data/useBanking';
import {calculateBankRegister} from '../../banking/data/bankRegisterService';
import {useFinanceOverview} from '../data/useFinanceOverview';
import {dashboardGst} from '../data/dashboardObligations';
import {useSalesDocuments} from '../../sales/data/useSalesDocuments';
import {salesOverviewMetrics} from '../../sales/data/salesOverviewMetrics';
import {usePurchaseOrders} from '../../purchases/data/usePurchaseOrders';
import {useSupplierBills} from '../../purchases/data/useSupplierBills';
import {useProducts} from '../../business-workspace/productRepository';
import {useInventoryStockRows} from '../../inventory/data/useInventory';
import {useSuppliers} from '../../contacts/data/useSuppliers';
import {dashboardLink} from './dashboardLink';
import {useTaskHub} from '../../task-hub/useTaskHub';
import './owner-dashboard.css';
import {ReceptionDashboard} from './ReceptionDashboard';
import './dashboard-density.css';

export function dashboardAccess(principal:VerifiedPrincipal|null){
 return {aging:!!principal?.authenticated&&principal.roles.includes('ACCOUNTANT'),financial:hasPermission(principal,'accounting.read'),cash:hasPermission(principal,'banking.read'),receivables:hasPermission(principal,'sales.read'),inventory:hasPermission(principal,'inventory.read'),purchases:hasPermission(principal,'purchases.read'),followups:hasPermission(principal,'sales.read'),tax:hasPermission(principal,'accounting.read')};
}
export type SampleDashboardRole='Admin'|'Accounts'|'Reception'|'Warehouse';
export function sampleDashboardAccess(role:SampleDashboardRole,sensitive=false){
 const financial=role==='Admin'||(role==='Accounts'&&sensitive);
 return {aging:role==='Accounts',financial,cash:financial,tax:financial,receivables:role!=='Warehouse',inventory:true,purchases:role==='Admin'||role==='Accounts',followups:role!=='Warehouse'};
}
const money=(n:number)=>new Intl.NumberFormat('en-AU',{style:'currency',currency:businessSettings().currency,maximumFractionDigits:0}).format(n);
function Metric({icon,title,value,detail,tone='blue',to}:{icon:ReactNode;title:string;value:string;detail:string;tone?:string;to:string}){
 return <Link to={to} className={'owner-metric '+tone}><span className="owner-metric-icon">{icon}</span><div><h3>{title}</h3><strong>{value}</strong><small>{detail}</small></div></Link>;
}
function Panel({title,icon,children}:{title:string;icon:ReactNode;children:ReactNode}){return <section className="owner-panel"><h2>{icon}{title}</h2>{children}</section>;}
function Row({name,value,to,tone=''}:{name:string;value:string|number;to:string;tone?:string}){return <Link className="owner-row" to={to}><span>{name}</span><b className={tone}>{value}</b><ChevronRight size={16}/></Link>;}
function periodEnd(month:string,today:string){const [y,m]=month.split('-').map(Number);return month===today.slice(0,7)?today:new Date(Date.UTC(y,m,0)).toISOString().slice(0,10);}
function FinancialOverview({sample,from,to,cash,tax,part='all'}:{sample:boolean;from:string;to:string;cash:boolean;tax:boolean;part?:'all'|'metrics'|'details'}){
 const accounts=useAccounts(),journals=useJournalEntries(),banks=useBankAccounts(),bills=useSupplierBills();
 const month=to.slice(0,7),today=to,pnl=calculateProfitAndLoss(accounts,journals,from,to),finance=useFinanceOverview(to);
 const [year,m]=month.split('-').map(Number),days=(Date.parse(to)-Date.parse(from))/86400000+1,priorTo=new Date(Date.parse(from)-86400000).toISOString().slice(0,10),priorFrom=new Date(Date.parse(from)-days*86400000).toISOString().slice(0,10);
 const prior=calculateProfitAndLoss(accounts,journals,priorFrom,priorTo);
 const delta=(v:number,p:number)=>p===0?'No prior-period comparison':`${v>=p?'+':''}${((v-p)/Math.abs(p)*100).toFixed(1)}% vs previous period`;
 const balance=banks.filter(b=>b.openingBalanceDate<=to).reduce((s,b)=>s+calculateBankRegister(b,journals,to).closingBalance,0);
 const gst=dashboardGst(accounts,journals,to,from).net;
 const periods=Array.from({length:Math.max(1,(year-Number(from.slice(0,4)))*12+m-Number(from.slice(5,7))+1)},(_,i)=>{const date=new Date(Date.UTC(Number(from.slice(0,4)),Number(from.slice(5,7))-1+i,1)),a=date.toISOString().slice(0,10)<from?from:date.toISOString().slice(0,10),z=periodEnd(a.slice(0,7),today);return {label:date.toLocaleString('en-AU',{month:'short',timeZone:'UTC'}),sales:sample?[470000,530000,480000,590000,685420,600000][i%6]:calculateProfitAndLoss(accounts,journals,a,z).salesRevenue,purchases:sample?[300000,350000,310000,390000,460000,400000][i%6]:bills.filter(b=>b.status!=='VOID'&&b.billDate>=a&&b.billDate<=z).reduce((s,b)=>s+b.totals.subtotal,0)};});
 const max=Math.max(1,...periods.flatMap(p=>[p.sales,p.purchases])),ceiling=Math.ceil(max/(10**Math.floor(Math.log10(max))))*(10**Math.floor(Math.log10(max)));
 return <>
 {part!=='details'&&<>
 <div className="owner-metrics owner-financial-metrics">
 <Metric icon={<BarChart3/>} title="Sales (Selected Period)" value={money(sample?685420:pnl.salesRevenue)} detail={sample?'+12.6% vs previous period':delta(pnl.salesRevenue,prior.salesRevenue)} to="/sales"/>
 <Metric icon={<Database/>} title="Gross Profit" value={money(sample?171355:pnl.grossProfit)} detail={sample?'+14.8% vs previous period':delta(pnl.grossProfit,prior.grossProfit)} tone="mint" to="/accounting/profit-and-loss"/>
 <Metric icon={<Percent/>} title="Gross Margin" value={sample?'25.0%':pnl.grossMarginPercent===null?'—':pnl.grossMarginPercent.toFixed(1)+'%'} detail={sample?'+0.5 pp vs previous period':prior.grossMarginPercent===null||pnl.grossMarginPercent===null?'No prior-period comparison':`${(pnl.grossMarginPercent-prior.grossMarginPercent).toFixed(1)} pp vs previous period`} tone="mint" to="/accounting/profit-and-loss"/>
 </div>
 {cash&&<div className="owner-cash"><Metric icon={<Landmark/>} title="Cash Balance" value={money(sample?452780:balance)} detail={`${sample?2:banks.length} bank accounts · company-wide`} to="/banking"/></div>}
 </>}
 {part!=='metrics'&&<>
 <div className="owner-trend"><Panel title="Sales & Purchases Trend" icon={<BarChart3 size={20}/>}><div className="owner-legend"><span>● Sales (ex. GST)</span><span>● Purchases (ex. GST)</span></div><div className="owner-chart"><div className="owner-yaxis">{[4,3,2,1,0].map(n=><span key={n}>{money(ceiling*n/4)}</span>)}</div><div className="owner-plot">{periods.map(p=><div className="owner-chart-group" key={p.label}><div className="owner-bars"><i title={`${p.label} Sales: ${money(p.sales)}`} style={{height:Math.max(0,p.sales)/ceiling*100+'%'}}/><i title={`${p.label} Purchases: ${money(p.purchases)}`} style={{height:Math.max(0,p.purchases)/ceiling*100+'%'}}/></div><small>{p.label}</small></div>)}</div></div></Panel></div>
 <div className="owner-finance"><Panel title="Finance Summary" icon={<Database size={21}/>}><Row name="Accounts Receivable" value={money(sample?176880:finance.receivables)} to="/reports"/><Row name="Accounts Payable" value={money(sample?132650:finance.payables)} to="/purchases/payables"/><Row name="Net Receivable / Payable" value={money(sample?44230:finance.receivables-finance.payables)} to="/reports" tone="positive"/>{tax&&<Row name={'GST Payable ('+month+')'} value={money(sample?12940:gst)} to="/reports/tax-summary"/>}</Panel></div>
 </>}
 </>;
}
function ReceivablesOverview({sample,today}:{sample:boolean;today:string}){
 const finance=useFinanceOverview(today);
 return <div className="owner-ar owner-metrics"><Metric icon={<Users/>} title="Outstanding AR" value={money(sample?176880:finance.receivables)} detail={sample?'64 open invoices':`${finance.ageing.reduce((n,b)=>n+b.amount,0)>0?'Open invoices':'No open balances'} · as at today`} tone="rose" to="/reports"/><Metric icon={<TriangleAlert/>} title="Overdue AR" value={money(sample?29430:finance.overdueReceivables)} detail={sample?'8 customers':`${finance.overdueInvoiceCount} overdue invoices · as at today`} tone="red" to="/sales/invoice-reminders"/></div>;
}
function InventoryAlerts({sample,site}:{sample:boolean;site:string}){
 const products=useProducts(),stocks=useInventoryStockRows();
 const quantities=products.filter(p=>p.status==='ACTIVE'&&(!p.itemType||p.itemType==='STOCK')).map(p=>({p,qty:stocks.filter(s=>s.productId===p.id&&(site==='ALL'||s.siteId===site)).reduce((n,s)=>n+s.quantityOnHand,0)}));
 const out=quantities.filter(r=>r.qty<=0).length,low=quantities.filter(r=>r.qty>0&&r.qty<=(r.p.reorderPoint??0)).length,below=quantities.filter(r=>r.qty<(r.p.reorderPoint??0)).length;
 return <div className="owner-inventory"><Panel title="Inventory Alerts" icon={<Layers size={22}/>}><Row name="🔴  Out of Stock" value={`${sample?6:out} SKUs`} to={`/inventory?stock=out&site=${site}`}/><Row name="🟠  Low Stock" value={`${sample?18:low} SKUs`} to={`/inventory?stock=low&site=${site}`}/><Row name="🔵  Below Reorder Level" value={`${sample?12:below} SKUs`} to={`/inventory?stock=low&site=${site}`}/><Row name="Stock Available" value={`${sample?42:quantities.filter(r=>r.qty>0).length} SKUs`} to="/inventory"/></Panel></div>;
}
function Operations({sample,today,site,followups,purchases}:{sample:boolean;today:string;site:string;followups:boolean;purchases:boolean}){
 const docs=useSalesDocuments(),suppliers=useSuppliers(),hub=useTaskHub(),orders=usePurchaseOrders();
 const awaiting=salesOverviewMetrics(docs,today).awaiting;
 const pickups=awaiting.filter(d=>d.awaitingCollection).length,deliveries=awaiting.filter(d=>d.deliveryBooked&&d.expectedDispatchDate===today).length;
 const incoming=suppliers.flatMap(s=>s.shipments??[]).filter(s=>!['Arrived','Cancelled','Draft'].includes(s.status)&&(site==='ALL'||s.siteId===site));
 const open=hub.rows.filter(t=>!['Completed','Inactive','Cancelled'].includes(t.status));
 return <><div className="owner-tasks"><Panel title="Tasks & Approvals" icon={<ClipboardCheck size={21}/>}>
 {purchases&&<Row name="Pending Purchase Approvals" value={sample?3:orders.filter(o=>o.status==='DRAFT').length} to="/purchases" tone="count-red"/>}
 {followups&&<><Row name="Credit Notes to Approve" value={sample?2:open.filter(t=>/credit note/i.test(t.name)).length} to="/sales/credit-returns" tone="count-amber"/><Row name="Customer Credit Limit Review" value={sample?1:open.filter(t=>/credit limit/i.test(t.name)).length} to="/tasks" tone="count-amber"/></>}<Row name="Stock Adjustments (Review)" value={sample?4:open.filter(t=>/stock adjustment/i.test(t.name)).length} to="/inventory/adjustments" tone="count-amber"/>{followups&&<Row name="Customer Follow-ups" value={sample?5:open.filter(t=>t.type==='Follow-up').length} to="/tasks" tone="count-amber"/>}
 <Row name="Open Tasks" value={sample?12:open.length} to="/tasks" tone="count-amber"/><Row name="Completed Tasks" value={sample?7:hub.rows.filter(t=>t.status==='Completed').length} to="/tasks" tone="positive"/>
 </Panel></div><div className="owner-operations"><Panel title="Today’s To-Do" icon={<Truck size={22}/>}><div className="owner-operation-grid"><Row name="Today's Pickups" value={sample?4:pickups} to="/inventory/sales-dispatch"/><Row name="Today's Deliveries" value={sample?6:deliveries} to="/inventory/sales-dispatch"/><Row name="Awaiting Dispatch" value={sample?9:awaiting.length} to="/inventory/sales-dispatch"/><Row name="Incoming Shipments" value={sample?3:incoming.length} to="/purchases/incoming-shipments"/></div></Panel></div></>;
}
export function unallocatedPaymentSummary(state:DepositState,date:string){
 const balances=state.deposits.map(d=>depositBalanceAt({...state,deposits:[d]},d.customerId,date)).filter(n=>n>0);
 return {count:balances.length,amount:Math.round(balances.reduce((n,v)=>n+v,0)*100)/100};
}
function AccountsPaymentCards({sample,date,bankAllowed}:{sample:boolean;date:string;bankAllowed:boolean}){
 const deposits=useCustomerDeposits(),finance=useFinanceOverview(date),unallocated=unallocatedPaymentSummary(deposits,date);
 const count=sample?2:unallocated.count,amount=sample?28600:unallocated.amount;
 const bankCount=sample?2:finance.unreconciledCount,bankAmount=sample?12480:finance.bankStatus.reduce((n,b)=>n+b.outstandingAmount,0);
 return <section className="accounts-payment-cards" aria-label={sample?"Sample · Read-only · Accounts payment review":"Accounts payment review"}><Link className="accounts-payment-card unallocated" to={dashboardLink('/sales/customer-deposits','','',sample,'ALL',{asOfDate:date})}><Link2/><div><h3>Unallocated Payments</h3><strong>{count}</strong><b>{money(amount)}</b></div></Link>{bankAllowed&&<Link className="accounts-payment-card unreconciled" to={dashboardLink('/banking/reconciliation','','',sample,'ALL',{asOfDate:date})}><Landmark/><div><h3>Unreconciled (Bank)</h3><strong>{bankCount}</strong><b>{money(bankAmount)}</b>{!sample&&finance.bankReviewCount>0&&<small>Reconciliation evidence requires review ({finance.bankReviewCount} accounts).</small>}</div></Link>}</section>;
}
export function dashboardRoleFocus(roles:readonly string[],preview:SampleDashboardRole|null):'Warehouse'|'Reception'|null{
 if(preview)return preview==='Warehouse'||preview==='Reception'?preview:null;
 if(roles.some(r=>['ADMIN','FINANCE_ADMIN','ACCOUNTANT','AUDITOR'].includes(r)))return null;
 return roles.includes('WAREHOUSE')?'Warehouse':roles.includes('SALES')?'Reception':null;
}
export function AccountsOverviewRow({sample,from,to,financial,cash,tax}:{sample:boolean;from:string;to:string;financial:boolean;cash:boolean;tax:boolean}){
 return <div className={'accounts-overview-row'+(financial?' with-financial':'')} aria-label="Accounts overview metrics"><AccountsPaymentCards sample={sample} date={to} bankAllowed={sample||cash}/>{financial&&<FinancialOverview sample={sample} from={from} to={to} cash={cash} tax={tax} part="metrics"/>}</div>;
}
function WarehouseDashboardExtras({sample,from,to,site}:{sample:boolean;from:string;to:string;site:string}){
 const suppliers=useSuppliers();
 const shipments=suppliers.flatMap(s=>s.shipments??[]).filter(s=>!['Arrived','Cancelled','Draft'].includes(s.status)&&s.lines.some(l=>l.received<l.quantity)&&(site==='ALL'||s.siteId===site));
 const link=(path:string,filters:Record<string,string>={})=>dashboardLink(path,from,to,sample,site,filters);
 return <section className="dashboard-role-extras" aria-label="Warehouse priorities"><h2>Warehouse · Stock &amp; Receiving{sample&&<small>Sample · Read-only</small>}</h2><div className="dashboard-role-panels">
 <InventoryAlerts sample={sample} site={site}/><Panel title="Receiving Priorities" icon={<Truck/>}>
 <Row name="Open Incoming Shipments" value={sample?2:shipments.length} to={link('/purchases/incoming-shipments',{open:'1'})}/>
 <Row name="Arrivals in Selected Period" value={sample?2:shipments.filter(s=>s.eta>=from&&s.eta<=to).length} to={link('/purchases/incoming-shipments',{open:'1'})}/>
 <Row name="Overdue Arrivals" value={sample?1:shipments.filter(s=>s.eta&&s.eta<to).length} to={link('/purchases/incoming-shipments',{open:'1'})} tone="count-amber"/>
 <Link className="owner-row" to={link('/inventory/sales-dispatch')}>Open Dispatch Workspace <ChevronRight size={16}/></Link>
 <Link className="owner-row" to={link('/inventory/adjustments')}>Review Stock Adjustments <ChevronRight size={16}/></Link>
 </Panel>
 </div></section>;
}
export function OwnerDashboardPage(){
 const [params]=useSearchParams();
 const {session}=useSecurity(),principal=session&&{userId:session.user.id,roles:session.user.roles,authenticated:true as const},liveAccess=dashboardAccess(principal);
 const [today,setToday]=useState(()=>businessDateKey(new Date().toISOString()));
 const [datePreset,setDatePreset]=useState<string|undefined>('Today'),[customRange,setCustomRange]=useState(()=>dateRangePreset('Today',today));
 const range=datePreset?dateRangePreset(datePreset,today):customRange;
 useEffect(()=>{const refresh=()=>setToday(businessDateKey(new Date().toISOString()));const timer=window.setInterval(refresh,30000);window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);return()=>{window.clearInterval(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};},[]);
 const [site]=useState('ALL'),[sample,setSample]=useState(params.get('sample')==='1');
 const [previewRole,setPreviewRole]=useState<SampleDashboardRole|null>(()=>sample&&['Admin','Accounts','Reception','Warehouse'].includes(params.get('sampleRole')??'')?params.get('sampleRole') as SampleDashboardRole:null),[sensitive,setSensitive]=useState(false);
 const access=sample&&previewRole?sampleDashboardAccess(previewRole,sensitive):liveAccess;
 const owner=session?.user.roles.includes('ADMIN'),title=sample&&previewRole?(previewRole==='Admin'?'Owner Dashboard':previewRole+' Dashboard'):owner?'Owner Dashboard':access.financial?'Accounts Dashboard':session?.user.roles.includes('WAREHOUSE')?'Warehouse Dashboard':'Team Dashboard';
 const reception=!sample||!previewRole||previewRole==='Reception';
 const focus=dashboardRoleFocus(session?.user.roles??[],sample?previewRole:null);
 const accounts=sample&&previewRole?previewRole==='Accounts':!session?.user.roles.includes('ADMIN')&&!!session?.user.roles.some(r=>['ACCOUNTANT','FINANCE_ADMIN'].includes(r));
 const adminSummary=sample&&previewRole?previewRole==='Admin':!!owner;
 const name=session?.user.displayName||session?.user.username||'Team';
 return <div className={'owner-dashboard'+(accounts?' accounts-dashboard':'')+(!access.financial?' owner-operational-view':'')+(reception?' reception-mode':'')}><header className="owner-banner"><h1>{title}</h1><span>{businessSettings().companyName}</span></header><div className="owner-welcome"><div><h2>Good morning, {name}</h2><p>{reception?'HTT Flooring · Front Desk Operations':'HTT Management · Business Overview'}</p></div><div className="owner-filters"><DateRangePicker from={range.from} to={range.to} allowEmpty={false} preset={datePreset} onChange={(next,preset)=>{setCustomRange(next);setDatePreset(preset);}}/></div></div>
 <label className="owner-sample"><input type="checkbox" checked={sample} onChange={e=>setSample(e.target.checked)}/>Sample · Populated dashboard preview · Pending and completed tasks · No live records or notifications are created.</label>
 {sample&&<div className="owner-sample-roles" aria-label="Sample role preview"><label>Sample role <select aria-label="Sample dashboard role" value={previewRole??''} onChange={e=>setPreviewRole(e.target.value as SampleDashboardRole||null)}><option value="">Current account view</option>{(['Admin','Accounts','Reception','Warehouse'] as const).map(role=><option key={role}>{role}</option>)}</select></label>{previewRole==='Accounts'&&<label><input type="checkbox" checked={sensitive} onChange={e=>setSensitive(e.target.checked)}/>Sample · Authorize financial totals, cash and GST</label>}<small>Sample display only · Your account permissions remain unchanged.</small></div>}
 <ReceptionDashboard sample={sample} date={range.to} from={range.from} site={site} showReceivables={access.receivables} showAging={!accounts&&reception&&access.aging} showFollowups={!adminSummary&&access.followups} shortagesFirst={adminSummary} beforeMetrics={adminSummary?<><AdminFinancialSummary sample={sample} date={range.to}/><AdminInsights sample={sample} from={range.from} to={range.to} site={site}/></>:undefined} afterMetrics={adminSummary?<><AdminOperationsPanels key={`${sample}:${today}`} sample={sample} today={today} site={site}/></>:accounts?<><AccountsOverviewRow sample={sample} from={range.from} to={range.to} financial={access.financial} cash={access.cash} tax={access.tax}/><PaymentFollowups sample={sample} date={range.to}/>{access.aging&&<ReceivablesAging sample={sample} date={range.to}/>}</>:undefined}/>
 <p className="owner-scope">Selected period: {range.from} – {range.to}. Balances and overdue status are as at the end date; stock shows current availability.</p>
 {focus==='Warehouse'&&<WarehouseDashboardExtras sample={sample} from={range.from} to={range.to} site={site}/>}
 {!adminSummary&&((!reception&&!focus)||accounts)&&<div className="owner-grid">{access.financial&&<FinancialOverview sample={sample} from={range.from} to={range.to} cash={access.cash} tax={access.tax} part={accounts?'details':'all'}/>}{!accounts&&access.receivables&&<ReceivablesOverview sample={sample} today={range.to}/>}{!accounts&&access.inventory&&<InventoryAlerts sample={sample} site={site}/>} {!accounts&&<Operations sample={sample} today={range.to} site={site} followups={access.followups} purchases={access.purchases}/>}</div>}
 {!adminSummary&&!accounts&&!reception&&access.aging&&<ReceivablesAging sample={sample} date={range.to}/>}
 {!adminSummary&&<footer className="owner-footer">{access.financial&&<Link to="/reports/summaries"><PackageCheck size={16}/>View detailed summaries</Link>}{sample&&<span>Sample · Synthetic figures, not business balances</span>}</footer>}</div>;
}
