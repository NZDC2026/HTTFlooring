import {it,expect,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
const identity=vi.hoisted(()=>({roles:['ADMIN']}));
vi.mock('../../security/securityClient',()=>({useSecurity:()=>({session:{user:{id:'test',username:'Ray',roles:identity.roles}}})}));
import {OwnerDashboardPage,dashboardAccess,sampleDashboardAccess} from './OwnerDashboardPage';
const render=(path='/dashboard?sample=1')=>renderToStaticMarkup(<MemoryRouter initialEntries={[path]}><OwnerDashboardPage/></MemoryRouter>);
it('defaults to the new operations layout with live data and isolated sample coverage',()=>{
 identity.roles=['ADMIN'];const live=render('/dashboard'),sample=render();
 for(const html of [live,sample])for(const label of ['Outstanding Dispatch','Tasks &amp; Follow-ups','Quick Actions'])expect(html).toContain(label);
 expect(live).not.toContain('Today’s To-Do');expect(sample).toContain('SO-SAMPLE-10432');
 expect(live).not.toContain('685,420');expect(live).toContain('/reports/summaries');
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
 for(const link of links){const p=new URLSearchParams(link.split('?')[1]);if(p.has('taskScope')){expect(p.get('from')).toBe('');expect(p.get('to')).toBe('');}else{expect(p.get('from')).toMatch(/^\d{4}-\d{2}-\d{2}$/);expect(p.get('to')).toMatch(/^\d{4}-\d{2}-\d{2}$/);}expect(p.get('sample')).toBe('1');}
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
