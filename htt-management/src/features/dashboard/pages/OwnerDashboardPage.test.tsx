import {it,expect,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
const identity=vi.hoisted(()=>({roles:['ADMIN']}));
vi.mock('../../security/securityClient',()=>({useSecurity:()=>({session:{user:{id:'test',username:'Ray',roles:identity.roles}}})}));
import {OwnerDashboardPage,dashboardAccess,sampleDashboardAccess,dashboardRoleFocus,unallocatedPaymentSummary,AccountsOverviewRow} from './OwnerDashboardPage';
const render=(path='/dashboard?sample=1')=>renderToStaticMarkup(<MemoryRouter initialEntries={[path]}><OwnerDashboardPage/></MemoryRouter>);
it('defaults to the new operations layout with live data and isolated sample coverage',()=>{
 identity.roles=['ADMIN'];const live=render('/dashboard'),sample=render();
 for(const html of [live,sample])for(const label of ['Outstanding Dispatch','Tasks &amp; Follow-ups','Quick Actions'])expect(html).toContain(label);
 expect(live).not.toContain('Today’s To-Do');expect(sample).toContain('SO-SAMPLE-10432');
 expect(live).not.toContain('685,420');expect(live).not.toContain('View detailed summaries');
});
it('hides financial figures and customer follow-ups from warehouse users',()=>{
 identity.roles=['WAREHOUSE'];const html=render();
 for(const label of ['MTD Sales','Gross Profit','Cash Balance','Outstanding AR','GST Payable','Tasks &amp; Follow-ups','View detailed summaries'])expect(html).not.toContain(label);
 expect(html).toContain('Warehouse Dashboard');expect(html).toContain('Incoming Shipments');
});
it('sales/reception permissions expose receivables but not profit or bank balances',()=>{
 const access=dashboardAccess({userId:'sales',roles:['SALES'],authenticated:true});expect(access.receivables).toBe(true);expect(access.financial).toBe(false);expect(access.cash).toBe(false);expect(dashboardAccess(null).financial).toBe(false);
});

it('sample roles model the four views without changing real permissions',()=>{
 expect(sampleDashboardAccess('Admin').financial).toBe(true);
 expect(sampleDashboardAccess('Accounts').financial).toBe(false);
 expect(sampleDashboardAccess('Accounts',true).financial).toBe(true);
 expect(sampleDashboardAccess('Reception').receivables).toBe(true);
 expect(sampleDashboardAccess('Reception').cash).toBe(false);
 expect(sampleDashboardAccess('Warehouse').followups).toBe(false);
 expect(sampleDashboardAccess('Warehouse').inventory).toBe(true);
 expect(dashboardAccess({userId:'warehouse',roles:['WAREHOUSE'],authenticated:true}).financial).toBe(false);
 identity.roles=['ADMIN'];expect(render()).toContain('Sample dashboard role');
});

it('renders reception operations and the reference operation panels without owner financials',()=>{
 identity.roles=['SALES'];const html=render();
 for(const label of ["Outstanding Dispatch",'Tasks &amp; Follow-ups','Incoming Shipments','Quick Actions','Quotes &amp; Orders – Pending','Containers','delayed'])expect(html).toContain(label);
 for(const label of ['Gross Profit','Cash Balance','Finance Summary'])expect(html).not.toContain(label);
 expect(html).toContain('reception-task-scopes');expect(html).toContain('All Tasks');expect(html).toContain('Task / Follow-up');expect(html).toContain('taskScope=all');expect(html).not.toContain('Open Orders Status');expect(html).toContain('Dispatched Today');expect(html).not.toContain('Exceptions &amp; Alerts');expect(html).toContain('aria-expanded="false"');expect(html).not.toContain('Not Dispatched');
});
it('carries the dashboard range and explicit filters on every operational drill-down',()=>{
 identity.roles=['ADMIN'];const html=render('/dashboard?sample=1');
 const links=[...html.matchAll(/href="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&')).filter(h=>h.includes('dashboard=1'));
 expect(links.length).toBeGreaterThan(15);
 for(const link of links){const p=new URLSearchParams(link.split('?')[1]);if(p.has('taskScope')||p.has('queue')){expect(p.get('from')).toBe('');expect(p.get('to')).toBe('');}else{expect(p.get('from')).toMatch(/^\d{4}-\d{2}-\d{2}$/);expect(p.get('to')).toMatch(/^\d{4}-\d{2}-\d{2}$/);}expect(p.get('sample')).toBe('1');}
 for(const filter of ['special=pickup','special=delivery','special=awaiting','tab=SALES_ORDER','filter=Overdue','open=1'])expect(links.some(link=>link.includes(filter))).toBe(true);
});

it('floating quick actions retain all destinations and date context',async()=>{
 const {quickActions,FloatingQuickActions}=await import('./FloatingQuickActions');
 const {dashboardLink}=await import('./dashboardLink');
 expect(quickActions).toHaveLength(10);
 expect(quickActions).toEqual(expect.arrayContaining([
 expect.objectContaining({name:'Create Return/Credit',path:'/sales/credit-returns'}),
 expect.objectContaining({name:'All Order Search',path:'/sales',filter:{tab:'SALES_ORDER'}}),
 expect.objectContaining({name:'Send Invoice/Statement',path:'/sales/invoice-reminders',filter:{filter:'All'}}),
 ]));
 for(const action of quickActions){const url=dashboardLink(action.path,'2026-11-01','2026-11-11',true,'ALL',action.filter);expect(url).toContain('from=2026-11-01');expect(url).toContain('to=2026-11-11');expect(url).toContain('sample=1');}
 const html=renderToStaticMarkup(<MemoryRouter><FloatingQuickActions from="2026-11-01" to="2026-11-11" sample={true} site="ALL"/></MemoryRouter>);
 expect(html).toContain('Quick Actions');expect(html).toContain('aria-expanded="false"');expect(html).not.toContain('fqa-panel');
});

it('shows overdue money and system-generated operations in the retained dashboard style',()=>{
 identity.roles=['ADMIN'];const html=render('/dashboard?sample=1');
 expect(html).toContain('Overdue Amount');expect(html).toContain('$8,420.00');expect(html).toContain('3 invoices');
 expect(html).not.toContain('Today’s To-Do');expect(html).toContain('Task / Follow-up');
 expect(html).toContain('reception-metric red');expect(html).toContain('Sample · Read-only task and partial dispatch previews');
});

it('defaults to today and labels pickup/delivery ranges explicitly',async()=>{
 identity.roles=['ADMIN'];
 const html=render('/dashboard');
 expect(html).toContain('htt-date-preset-label">Today');
 expect(html).toContain('Today’s Pickups');expect(html).toContain('Today’s Deliveries');
 const {dashboardPickupPeriod}=await import('./ReceptionDashboard');
 expect(dashboardPickupPeriod('2026-11-11','2026-11-13','2026-11-11')).toBe('11 Nov–13 Nov');
 expect(dashboardPickupPeriod('2026-11-10','2026-11-10','2026-11-11')).toBe('10 Nov 2026');
 expect(dashboardPickupPeriod('2026-12-31','2027-01-02','2026-11-11')).toBe('31 Dec 2026–2 Jan 2027');
});

it('labels dispatched ranges and preserves them in the sales drill-down',async()=>{
 const {ReceptionDashboard}=await import('./ReceptionDashboard');
 const html=renderToStaticMarkup(<MemoryRouter><ReceptionDashboard sample={true} from="2026-11-01" date="2026-11-30" site="ALL"/></MemoryRouter>);
 expect(html).toContain('Dispatched 1 Nov–30 Nov');
 expect(html).toContain('Dispatched orders · 1 Nov–30 Nov');
 const links=[...html.matchAll(/href="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&'));
 const dispatched=links.find(h=>h.includes('special=dispatched'))!;
 expect(dispatched).toContain('from=2026-11-01');expect(dispatched).toContain('to=2026-11-30');
});

it('filters dated sample metrics and calculates balances as of the selected end date',async()=>{
 const {dashboardSampleMetrics:metrics}=await import('./ReceptionDashboard');
 expect(metrics('2026-11-12','2026-11-12','2026-11-12')).toMatchObject({pickup:12,delivery:8,orders:2,dispatched:1,overdue:8420});
 expect(metrics('2026-11-11','2026-11-11','2026-11-12')).toMatchObject({pickup:7,delivery:5,orders:4,dispatched:3,overdue:6200});
 expect(metrics('2026-11-11','2026-11-12','2026-11-12')).toMatchObject({pickup:19,delivery:13,orders:6,dispatched:4});
 expect(metrics('2025-01-01','2025-01-02','2026-11-12')).toMatchObject({pickup:0,orders:0,overdue:0});
});

it('places operational panels above the selected-period financial section without duplicating them',()=>{
 identity.roles=['ADMIN'];
 for(const html of [render('/dashboard'),render('/dashboard?sample=1')]){
  const scope=html.indexOf('class="owner-scope"');
  for(const label of ['Tasks &amp; Follow-ups','Outstanding Dispatch','Quotes &amp; Orders – Pending','Incoming Shipments','Stock Alert – Insufficient Quantity']){
   expect(html.indexOf(label)).toBeGreaterThan(-1);expect(html.indexOf(label)).toBeLessThan(scope);
   expect(html.split(label)).toHaveLength(label==='Tasks &amp; Follow-ups'?3:2);
  }
 }
});

it('shares the operational base across all role previews with focused warehouse and reception additions',()=>{
 identity.roles=['ADMIN'];
 for(const role of ['Admin','Accounts','Warehouse','Reception']){
  const html=render('/dashboard?sample=1&sampleRole='+role);
  for(const label of ['Outstanding Dispatch','Incoming Shipments','Quotes &amp; Orders – Pending','Stock Alert – Insufficient Quantity','Quick Actions'])expect(html).toContain(label);
  expect(html).toContain('SO-SAMPLE-10432');
  if(role==='Warehouse'){
   expect(html).toContain('Receiving Priorities');expect(html).toContain('Inventory Alerts');
   for(const label of ['Overdue Amount','Outstanding AR','Gross Profit','Cash Balance','Customer Follow-up Priorities','Tasks &amp; Follow-ups','Today’s To-Do'])expect(html).not.toContain(label);
  }else if(role==='Reception'){
   expect(html).toContain('Tasks &amp; Follow-ups');
   for(const label of ['Reception · Customers &amp; Follow-ups','Customer Follow-up Priorities','Completed This Week','Outstanding AR','Overdue AR','dashboard-role-extras'])expect(html).not.toContain(label);
   for(const label of ['Receiving Priorities','Gross Profit','Cash Balance','Today’s To-Do'])expect(html).not.toContain(label);
  }else{
   expect(html).not.toContain('dashboard-role-extras');if(role==='Admin')for(const label of ['Tasks &amp; Approvals','Sales (Selected Period)','Sales &amp; Purchases Trend','Inventory Alerts','Finance Summary','Today’s To-Do'])expect(html).not.toContain(label);
  }
 }
});
it('applies warehouse and reception priorities to real roles while preserving combined financial roles',()=>{
 expect(dashboardRoleFocus(['WAREHOUSE'],null)).toBe('Warehouse');
 expect(dashboardRoleFocus(['SALES'],null)).toBe('Reception');
 expect(dashboardRoleFocus(['ADMIN','WAREHOUSE'],null)).toBeNull();
 expect(dashboardRoleFocus(['ACCOUNTANT','SALES'],null)).toBeNull();
 identity.roles=['WAREHOUSE'];expect(render('/dashboard')).toContain('Receiving Priorities');
 identity.roles=['SALES'];for(const html of [render('/dashboard'),render('/dashboard?sample=1&sampleRole=Reception')]){expect(html).toContain('Tasks &amp; Follow-ups');expect(html).toContain('Outstanding Dispatch');for(const label of ['Customer Follow-up Priorities','Outstanding AR','Overdue AR','dashboard-role-extras'])expect(html).not.toContain(label);}
 // Preview selection cannot change the live account view when Sample is off.
 expect(render('/dashboard?sampleRole=Warehouse')).not.toContain('Receiving Priorities');
});

it('adds Accounts payment review cards and removes only the requested legacy panels',()=>{
 identity.roles=['ADMIN'];const html=render('/dashboard?sample=1&sampleRole=Accounts');
 for(const label of ['Unallocated Payments','Unreconciled (Bank)','$28,600','$12,480','Accounts Receivable – Aging','Outstanding Dispatch','Tasks &amp; Follow-ups'])expect(html).toContain(label);
 for(const label of ['Inventory Alerts','Outstanding AR','Overdue AR','Tasks &amp; Approvals','Today’s To-Do'])expect(html).not.toContain(label);
 expect(render('/dashboard?sample=1&sampleRole=Admin')).not.toContain('Unallocated Payments');
 identity.roles=['ACCOUNTANT'];const live=render('/dashboard');expect(live).toContain('Unallocated Payments');expect(live).toContain('Unreconciled (Bank)');expect(live).not.toContain('$28,600');
 identity.roles=['WAREHOUSE'];expect(render('/dashboard')).not.toContain('Unreconciled (Bank)');
});
it('counts remaining customer receipts as at the end date, including dated applications, refunds and reversals',()=>{
 const state={deposits:[{id:'d',customerId:'c',date:'2026-11-01',amount:100},{id:'future',customerId:'c',date:'2026-12-01',amount:200}],applications:[{depositId:'d',date:'2026-11-02',amount:60,reversalDate:'2026-11-04'}],refunds:[{depositId:'d',date:'2026-11-03',amount:40}],settings:[]} as unknown as import('../../customer-deposits/customerDepositRepository').DepositState;
 expect(unallocatedPaymentSummary(state,'2026-11-01')).toEqual({count:1,amount:100});
 expect(unallocatedPaymentSummary(state,'2026-11-03')).toEqual({count:0,amount:0});
 expect(unallocatedPaymentSummary(state,'2026-11-04')).toEqual({count:1,amount:60});
});

it('adds the populated payment follow-up panel to Accounts only and applies the compact Accounts layout',()=>{
 identity.roles=['ADMIN'];const html=render('/dashboard?sample=1&sampleRole=Accounts');
 for(const text of ['accounts-dashboard','Payment Follow-up – Customers (Unpaid)','ABC Flooring Pty Ltd','Promised to Pay','Not Contacted','Due Soon','Followed Up','Search payment follow-up customer','Add Follow-up'])expect(html).toContain(text);
 expect(render('/dashboard?sample=1&sampleRole=Admin')).not.toContain('Payment Follow-up – Customers (Unpaid)');
});

it('places Accounts review cards immediately after operational metrics and before task panels',()=>{
 identity.roles=['ADMIN'];const html=render('/dashboard?sample=1&sampleRole=Accounts');
 expect(html.indexOf('accounts-overview-row')).toBeGreaterThan(html.indexOf('reception-metrics'));
 expect(html.indexOf('Unallocated Payments')).toBeLessThan(html.indexOf('Tasks &amp; Follow-ups'));
 expect(html.indexOf('Unreconciled (Bank)')).toBeLessThan(html.indexOf('Tasks &amp; Follow-ups'));
 expect(html.split('Unallocated Payments')).toHaveLength(2);
 expect(render('/dashboard?sample=1&sampleRole=Admin')).not.toContain('accounts-overview-row');
});
it('groups all six authorized Accounts metrics together without duplicating financial detail panels',()=>{
 const html=renderToStaticMarkup(<MemoryRouter><AccountsOverviewRow sample from="2026-11-01" to="2026-11-12" financial cash tax/></MemoryRouter>);
 for(const label of ['Unallocated Payments','Unreconciled (Bank)','Sales (Selected Period)','Gross Profit','Gross Margin','Cash Balance'])expect(html).toContain(label);
 for(const label of ['Sales &amp; Purchases Trend','Finance Summary'])expect(html).not.toContain(label);
 expect(html).toContain('with-financial');expect(html).toContain('Sample · Read-only');
});

it('orders Accounts dashboard sections like the reference in both sample and live views',()=>{
 for(const [roles,path] of [[['ADMIN'],'/dashboard?sample=1&sampleRole=Accounts'],[['ACCOUNTANT'],'/dashboard']] as const){
  identity.roles=[...roles];const html=render(path);
  const sections=['reception-metrics','accounts-overview-row','Payment Follow-up – Customers (Unpaid)','Accounts Receivable – Aging','Tasks &amp; Follow-ups','Outstanding Dispatch','Quotes &amp; Orders – Pending','Incoming Shipments','Stock Alert – Insufficient Quantity'];
  const positions=sections.map(s=>html.indexOf(s));for(let i=0;i<positions.length;i++){expect(positions[i],sections[i]).toBeGreaterThan(-1);if(i)expect(positions[i],sections[i]).toBeGreaterThan(positions[i-1]);}
  expect(html.match(/class="ar-aging"/g)).toHaveLength(1);expect(html.match(/class="payment-followups"/g)).toHaveLength(1);
 }
 identity.roles=['ADMIN'];const admin=render('/dashboard?sample=1&sampleRole=Admin');expect(admin).not.toContain('Payment Follow-up – Customers (Unpaid)');
});

it('adds the six-tile Admin financial summary directly below operations without changing other roles',()=>{
 identity.roles=['ADMIN'];
 for(const path of ['/dashboard','/dashboard?sample=1&sampleRole=Admin']){
  const html=render(path),position=html.indexOf('class="admin-financial-summary"');
  expect(position).toBeLessThan(html.indexOf('reception-metrics'));expect(position).toBeLessThan(html.indexOf('Tasks &amp; Follow-ups'));
  for(const label of ['Total Sales (YTD)','Total Purchases (YTD)','Gross Profit (YTD)','Cash at Bank'])expect(html).toContain(label);
 }
 const sample=render('/dashboard?sample=1&sampleRole=Admin');for(const value of ['$3,520,000','$2,410,000','$1,110,000','$468,200','$392,600','$785,300','31.5%','3 Bank Accounts','Sample · Read-only · Admin financial summary'])expect(sample).toContain(value);
 for(const role of ['Accounts','Reception','Warehouse'])expect(render('/dashboard?sample=1&sampleRole='+role)).not.toContain('class="admin-financial-summary"');
 identity.roles=['ACCOUNTANT'];expect(render('/dashboard')).not.toContain('class="admin-financial-summary"');
});

it('shows Admin team management and exception review after financial cards without duplicating the existing task hub',()=>{
 identity.roles=['ADMIN'];const html=render('/dashboard?sample=1&sampleRole=Admin');
 const financial=html.indexOf('class="admin-financial-summary"'),team=html.indexOf('Team tasks &amp; follow-ups'),approvals=html.indexOf('Approvals &amp; Holds – Exceptions Management'),tasks=html.indexOf('class="admin-unified-followups"');
 expect(financial).toBeLessThan(team);expect(team).toBeLessThan(tasks);expect(tasks).toBeLessThan(approvals);
 expect(html).toContain('role="tablist" aria-label="Operations workspace"');expect(html).toContain('Operations workspace');expect(html).toMatch(/aria-labelledby="[^"]+-approvals-tab" hidden=""/);expect(html).not.toContain('class="admin-task-tabs"');expect(html.match(/class="admin-task-panel admin-unified-tasks"/g)).toHaveLength(1);expect(html).toContain('Search dashboard tasks');expect(html).not.toContain('FOLLOW-UP FILTERS');expect(html).not.toContain('class="reception-panel dashboard-followups"');
 for(const label of ['Confirm 3 customer pickups','Schedule 2 delivery bookings','Process 4 new sales orders','Supplier Payment – Bostik (INV-66021)','CN-10056 – ABC Flooring','Pending Items','Approve','Reject','Sample · Review history'])expect(html).toContain(label);
 expect(html.match(/class="admin-task-panel admin-unified-tasks"/g)).toHaveLength(1);expect(html.match(/class="admin-approval-panel"/g)).toHaveLength(1);
 for(const role of ['Accounts','Warehouse','Reception'])expect(render('/dashboard?sample=1&sampleRole='+role)).not.toContain('class="admin-operations-panels"');
 identity.roles=['ADMIN'];expect(render('/dashboard')).toContain('Operations workspace');
 identity.roles=['ACCOUNTANT'];expect(render('/dashboard')).not.toContain('class="admin-operations-panels"');
});

it('adds Inventory overview and Sales Performance only to Admin with read-only samples and date context',()=>{
 identity.roles=['ADMIN'];const html=render('/dashboard?sample=1&sampleRole=Admin');
 for(const label of ['Inventory overview','Sales Performance','60+ days without sales','Expense','1-year sales history','$2.18M','$186.4K','1,268','26 SKUs','8 SKUs','34 SKUs','4 open orders affected by shortages'])expect(html).toContain(label);
 expect(html.indexOf('class="admin-financial-summary"')).toBeLessThan(html.indexOf('class="admin-insights"'));
 expect(html.indexOf('class="admin-insights"')).toBeLessThan(html.indexOf('class="admin-operations-panels"'));
 for(const role of ['Accounts','Reception','Warehouse'])expect(render('/dashboard?sample=1&sampleRole='+role)).not.toContain('class="admin-insights"');
});

it('orders Admin modules as financials, performance and inventory, operations, shortages, dispatch and pending documents',()=>{
 identity.roles=['ADMIN'];const html=render('/dashboard?sample=1&sampleRole=Admin');
 const sections=['class="admin-financial-summary"','class="admin-sales-performance"','class="admin-inventory-overview"','class="reception-metrics"','class="admin-operations-panels"','id="dashboard-stock-shortages"','Outstanding Dispatch','Quotes &amp; Orders – Pending','Incoming Shipments'];
 for(let i=1;i<sections.length;i++)expect(html.indexOf(sections[i])).toBeGreaterThan(html.indexOf(sections[i-1]));
});
