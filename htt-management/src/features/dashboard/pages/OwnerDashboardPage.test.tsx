import {it,expect,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
const identity=vi.hoisted(()=>({roles:['ADMIN']}));
vi.mock('../../security/securityClient',()=>({useSecurity:()=>({session:{user:{id:'test',username:'Ray',roles:identity.roles}}})}));
import {OwnerDashboardPage,dashboardAccess,sampleDashboardAccess} from './OwnerDashboardPage';
const render=()=>renderToStaticMarkup(<MemoryRouter initialEntries={['/dashboard?sample=1']}><OwnerDashboardPage/></MemoryRouter>);
it('renders populated, isolated owner preview and operational states',()=>{
 identity.roles=['ADMIN'];const html=render();
 for(const label of ['Owner Dashboard','685,420','171,355','25.0%','176,880','29,430','452,780','Sales &amp; Purchases Trend','Inventory Alerts','Tasks &amp; Approvals','Finance Summary','Completed Tasks','Today&#x27;s Pickups','Sample'])expect(html).toContain(label);
 expect(html).toContain('/reports/summaries');expect(html).toContain('/purchases/incoming-shipments');
});
it('hides financial figures and customer follow-ups from warehouse users',()=>{
 identity.roles=['WAREHOUSE'];const html=render();
 for(const label of ['MTD Sales','Gross Profit','Cash Balance','Outstanding AR','GST Payable','Customer Follow-ups','View detailed summaries'])expect(html).not.toContain(label);
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

it('renders reception operations and the three right-side panels without owner financials',()=>{
 identity.roles=['SALES'];const html=render();
 for(const label of ["Tasks (Selected Period)",'Customer Follow-ups','Incoming Shipments','Quick Access','Recent Activity','Inventory Quick Check','Open Orders Status','Containers','delayed'])expect(html).toContain(label);
 for(const label of ['Gross Profit','Cash Balance','Finance Summary'])expect(html).not.toContain(label);
 expect(html).toContain('/sales/drafts/invoices/new');expect(html).toContain('Sample complete');
});
