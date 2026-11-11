import {OutstandingDispatch} from './OutstandingDispatch';
import {PendingQuotesOrders} from './PendingQuotesOrders';
import {FloatingQuickActions} from './FloatingQuickActions';
import {businessDateKey} from '../../../lib/businessDate';
import {dashboardLink} from './dashboardLink';
import {useState,useSyncExternalStore} from 'react';
import {orderStockShortages} from '../data/orderStockShortages';
import {salesFulfilmentRepository} from '../../sales/data/salesFulfilmentRepository';
import {Link} from 'react-router-dom';
import {Truck,Package,ClipboardCheck,Layers,Ship,CalendarDays,ChevronRight,TriangleAlert} from 'lucide-react';
import {taskSamples} from '../../task-hub/taskHubModel';
import {useTaskHub} from '../../task-hub/useTaskHub';
import {useSalesDocuments} from '../../sales/data/useSalesDocuments';
import {salesOverviewMetrics} from '../../sales/data/salesOverviewMetrics';
import {useFinanceOverview} from '../data/useFinanceOverview';
import {useProducts} from '../../business-workspace/productRepository';
import {useInventoryStockRows} from '../../inventory/data/useInventory';
import {useSuppliers} from '../../contacts/data/useSuppliers';
import {useCustomers} from '../../contacts/data/useCustomers';
import './reception-dashboard.css';
const tasks='/tasks',incoming='/purchases/incoming-shipments';
export function dashboardPickupPeriod(from:string,to:string,today:string){
 if(from===today&&to===today)return 'Today’s';
 const format=(date:string,year=false)=>new Date(date+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',...(year?{year:'numeric' as const}:{}),timeZone:'UTC'});
 return from===to?format(from,true):format(from,from.slice(0,4)!==to.slice(0,4))+'–'+format(to,from.slice(0,4)!==to.slice(0,4));
}
export function ReceptionDashboard({sample,date,from,site,showReceivables=true,showFollowups=true}:{sample:boolean;date:string;from:string;site:string;showReceivables?:boolean;showFollowups?:boolean}){
 const hub=useTaskHub(),docs=useSalesDocuments(),finance=useFinanceOverview(date),products=useProducts(),stock=useInventoryStockRows(),suppliers=useSuppliers(),customers=useCustomers();
 const fulfilments=useSyncExternalStore(salesFulfilmentRepository.subscribe,salesFulfilmentRepository.getSnapshot,salesFulfilmentRepository.getSnapshot);
 const [allShortages,setAllShortages]=useState(false);
 const shortageRows=sample?[{id:'sample-short-1',orderId:'sample-1',number:'SO-SAMPLE-000001',customerId:'cus_001',expected:date,product:'Engineered Oak 190mm',unit:'m²',required:100,available:60,shortage:40},{id:'sample-short-2',orderId:'sample-2',number:'SO-SAMPLE-000002',customerId:'cus_002',expected:date,product:'Hybrid Flooring 8mm',unit:'m²',required:75,available:50,shortage:25},{id:'sample-short-3',orderId:'sample-3',number:'SO-SAMPLE-000003',customerId:'cus_003',expected:date,product:'Laminate 12mm',unit:'m²',required:120,available:90,shortage:30}]:orderStockShortages(docs,products,stock,fulfilments,site).filter(r=>!r.expected||(r.expected>=from&&r.expected<=date));
 const link=(path:string,filters:Record<string,string>={})=>dashboardLink(path,from,date,sample,site,filters);
 const awaiting=salesOverviewMetrics(docs,date).awaiting;
 const shipments=suppliers.flatMap(s=>s.shipments??[]).filter(s=>!['Arrived','Cancelled','Draft'].includes(s.status)&&s.lines.some(l=>l.received<l.quantity)&&(site==='ALL'||s.siteId===site)&&s.eta>=from&&s.eta<=date);
 const pickups=awaiting.filter(d=>d.awaitingCollection&&!!d.expectedDispatchDate&&d.expectedDispatchDate>=from&&d.expectedDispatchDate<=date);
 const deliveries=awaiting.filter(d=>d.deliveryBooked&&!!d.expectedDispatchDate&&d.expectedDispatchDate>=from&&d.expectedDispatchDate<=date);
 const orders=docs.filter(d=>d.type==='SALES_ORDER'&&d.documentDate>=from&&d.documentDate<=date);
 const today=businessDateKey(new Date().toISOString());
 const [taskType,setTaskType]=useState('All');
 const followupTasks=(sample?taskSamples(today,''):hub.rows).filter(t=>!['Completed','Cancelled','Inactive'].includes(t.status));
 const followups=followupTasks.filter(t=>taskType==='All'||t.type===taskType).sort((a,b)=>a.due.localeCompare(b.due));
 const taskLink=(extra:Record<string,string>={})=>dashboardLink(tasks,'','',sample,site,{tab:'Open Actions',taskScope:'all',type:taskType,...extra});
 const dispatchedOrders=new Set(fulfilments.filter(f=>f.status==='ACTIVE'&&f.fulfilmentDate===today&&(site==='ALL'||f.siteId===site)).map(f=>f.salesOrderId));
 const pickupTitle=dashboardPickupPeriod(from,date,today)+' Pickups',deliveryTitle=dashboardPickupPeriod(from,date,today)+' Deliveries';
 const cards=[{title:pickupTitle,n:sample?12:pickups.length,icon:<Truck/>,tone:'green',to:link('/sales',{special:'pickup'})},{title:deliveryTitle,n:sample?8:deliveries.length,icon:<Truck/>,tone:'blue',to:link('/sales',{special:'delivery'})},{title:'Awaiting Dispatch',n:sample?5:awaiting.length,icon:<Package/>,tone:'amber',to:link('/sales',{special:'awaiting'})},{title:'Orders',n:sample?2:orders.length,icon:<ClipboardCheck/>,tone:'purple',to:link('/sales',{tab:'SALES_ORDER'})},{title:'Overdue Amount',n:new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD'}).format(sample?8420:finance.overdueReceivables),icon:<Layers/>,tone:'red',to:link('/sales/invoice-reminders',{filter:'Overdue'})},{title:'Dispatched Today',n:sample?1:dispatchedOrders.size,icon:<Truck/>,tone:'green',to:dashboardLink('/sales',today,today,sample,site,{special:'dispatched'})}];
 return <div className="reception-view">
 <div className="reception-metrics">{cards.filter(c=>showReceivables||c.title!=='Overdue Amount').map(c=><Link key={c.title} to={c.to} className={'reception-metric '+c.tone}>{c.icon}<h3>{c.title}</h3><strong>{c.n}</strong><ChevronRight size={20}/><small>{sample?['3 pending confirmation','2 scheduled','1 urgent','All orders','3 invoices','1 dispatched order'][cards.indexOf(c)]:c.title==='Dispatched Today'?'Dispatched orders · Today':c.title==='Overdue Amount'?`${finance.overdueInvoiceCount} overdue invoices`:c.title===pickupTitle?`${pickups.length} pickups`:c.title===deliveryTitle?`${deliveries.length} scheduled`:c.title==='Awaiting Dispatch'?'Orders not yet dispatched':'View details →'}</small></Link>)}</div>
 <div className="reception-top-row">
 {showFollowups&&<section className="reception-panel"><h2><ClipboardCheck/>Task Follow up {sample&&<small>Sample</small>}<Link to={taskLink()}>View all ({followups.length}) →</Link></h2><div className="dashboard-task-layout"><nav>{[['All','All Tasks'],['Sample','Sample Delivery'],['Follow-up','Quote Follow-up'],['Payment','Payment Follow-up'],['Enquiry','Product Enquiry'],['Complaint','Customer Complaint'],['Site Visit','Site Visits'],['Delivery','Delivery'],['Other','Other']].map(([key,label])=><button type="button" className={taskType===key?'selected':''} onClick={()=>setTaskType(key)} key={key}>{label}<b>{followupTasks.filter(t=>key==='All'||t.type===key).length}</b></button>)}</nav><div className="reception-shortage-scroll"><table><thead><tr>{['Task / Follow-up','Customer','Due Date','Assigned','Status'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{followups.slice(0,5).map(t=><tr key={t.id}><td><Link to={taskLink({task:t.id})}>{t.name}</Link></td><td>{t.account}</td><td><em className={t.due&&t.due.slice(0,10)<today?'overdue':t.due.slice(0,10)===today?'scheduled':'neutral'}>{!t.due?'No due date':t.due.slice(0,10)<today?'Overdue':t.due.slice(0,10)===today?'Today':new Date(t.due.slice(0,10)+'T12:00:00').toLocaleDateString('en-AU',{day:'numeric',month:'short'})}</em></td><td title={t.ownerName}><span className="task-owner-avatar">{t.ownerName.replace(/^Sample /,'').split(' ').map(n=>n[0]).join('').slice(0,2)}</span></td><td><em className={t.status==='Open'?'follow-up':'delayed'}>{t.status}</em></td></tr>)}</tbody></table>{!followups.length&&<p className="reception-empty">No open tasks in this category.</p>}</div></div></section>}

 </div><OutstandingDispatch documents={docs} fulfilments={fulfilments} products={products} customers={customers} sample={sample} date={date} link={link}/><div className="reception-bottom-row">
 <PendingQuotesOrders documents={docs} fulfilments={fulfilments} customers={customers} sample={sample} from={from} to={date} link={link}/>
 <section className="reception-panel"><h2><Ship/>Incoming Shipments<Link to={link(incoming,{open:'1'})}>View all →</Link></h2><div className="reception-shipping"><div className="reception-ship-art" aria-label="Container ship illustration"><Ship size={70}/><div>▰ ▰ ▰<br/>▰ ▰ ▰ ▰</div></div><div><b><strong>{sample?2:shipments.length}</strong> Containers</b><small>{sample?'Arriving this week':'Open incoming shipments'}</small></div>{(sample||shipments.some(s=>s.eta<date))&&<em className="overdue">{sample?1:shipments.filter(s=>s.eta<date).length} delayed</em>}</div>{(sample?[{id:'a',eta:'2026-11-16',delayed:false},{id:'b',eta:'2026-11-20',delayed:true}]:shipments.slice(0,3).map(s=>({id:s.id,eta:s.eta,delayed:s.eta<date}))).map(s=><Link className="reception-eta" to={link(incoming,{shipment:sample?(s.id==='a'?'sample-1':'sample-2'):s.id})} key={s.id}><CalendarDays size={16}/><span>ETA {new Date(s.eta+'T12:00:00').toLocaleDateString('en-AU',{day:'2-digit',month:'short',year:'numeric'})}</span><small>1 container</small><em className={s.delayed?'delayed':'scheduled'}>{s.delayed?'Delayed':'On track'}</em></Link>)}{!sample&&!shipments.length&&<p className="reception-empty">No incoming shipments.</p>}</section>
 </div><section id="dashboard-stock-shortages" className="reception-panel reception-shortages"><h2><TriangleAlert/>Stock Alert – Insufficient Quantity {sample&&<small>Sample</small>}<span>{new Set(shortageRows.map(r=>r.orderId)).size} orders</span><button type="button" onClick={()=>setAllShortages(!allShortages)}>{allShortages?'Show less':'View All'} →</button></h2><p>Customer orders with insufficient stock, prioritised by Expected Date. Incoming shipments are excluded.</p><div className="reception-shortage-scroll"><table><thead><tr>{['Order No.','Customer','Expected Date','Item (Shortage)','Required Qty','Available Qty','Shortage'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{(allShortages?shortageRows:shortageRows.slice(0,5)).map(r=><tr key={r.id}><td><Link to={sample?link('/sales',{special:'awaiting'}):link('/sales/orders/'+r.orderId)}>{r.number}</Link></td><td>{sample?['ABC Flooring','Richmond Timber Floors','Carlton Flooring Co.'][shortageRows.indexOf(r)]:customers.find(c=>c.id===r.customerId)?.businessName??'Customer'}</td><td>{r.expected?new Date(r.expected+'T12:00:00').toLocaleDateString('en-AU'):'Not scheduled'}</td><td>{r.product}</td>{[r.required,r.available,r.shortage].map((n,i)=><td key={i} className={i===2?'shortage-value':''}>{n.toLocaleString('en-AU',{maximumFractionDigits:4})} {r.unit}</td>)}</tr>)}</tbody></table>{!shortageRows.length&&<p className="reception-empty">No stock shortages for customer orders in the selected dates.</p>}</div></section><FloatingQuickActions from={from} to={date} sample={sample} site={site}/>{sample&&<p className="reception-sample-note">Sample · Read-only task and partial dispatch previews; no live records are changed.</p>}
 </div>;
}
