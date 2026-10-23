import {beforeEach,it,expect,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
vi.mock('../../security/usePermission',()=>({usePermission:()=>true}));
vi.mock('react',async original=>{const r=await original<typeof import('react')>();return {...r,useSyncExternalStore:(subscribe:any,get:any,server:any)=>r.useSyncExternalStore(subscribe,get,server??get)};});
beforeEach(()=>vi.resetModules());
it('renders finance controls at the linked historical date',async()=>{
 const {FinanceControlsPage}=await import('./FinanceControlsPage');
 const html=renderToStaticMarkup(<MemoryRouter initialEntries={['/accounting/finance-controls?asOf=2026-09-30']}><FinanceControlsPage/></MemoryRouter>);
 expect(html).toContain('value="2026-09-30"');expect(html).toContain('Inventory Subledger');expect(html).not.toContain('Invalid reporting date');
});
it('renders unavailable amounts and a failed control when inventory cannot be checked',async()=>{
 const {FinanceControlsPage}=await import('./FinanceControlsPage'),{snapshotRepositories,restoreRepositories}=await import('../../security/repositoryHost');
 const state=snapshotRepositories() as any;state.accounts.accounts=state.accounts.accounts.filter((a:any)=>a.systemRole!=='INVENTORY');restoreRepositories(state);
 const html=renderToStaticMarkup(<MemoryRouter initialEntries={['/accounting/finance-controls?asOf=2026-09-30']}><FinanceControlsPage/></MemoryRouter>);
 expect(html).toContain('Inventory reconciliation could not be verified');expect(html.match(/Unavailable/g)).toHaveLength(3);expect(html).toContain('Review Required');
});
it('keeps a dated inventory review failure readable and rejects invalid query dates',async()=>{
 const {InventoryGlReconciliationPage}=await import('../../inventory/pages/InventoryGlReconciliationPage'),{snapshotRepositories,restoreRepositories}=await import('../../security/repositoryHost');
 const state=snapshotRepositories() as any;state.accounts.accounts=state.accounts.accounts.filter((a:any)=>a.systemRole!=='INVENTORY');restoreRepositories(state);
 const html=renderToStaticMarkup(<MemoryRouter initialEntries={['/inventory/reconciliation?asOf=2026-09-30']}><InventoryGlReconciliationPage/></MemoryRouter>);
 expect(html).toContain('could not be verified at 2026-09-30');expect(html).toContain('Balances are unavailable');
 const invalid=renderToStaticMarkup(<MemoryRouter initialEntries={['/inventory/reconciliation?asOf=2026-02-30']}><InventoryGlReconciliationPage/></MemoryRouter>);expect(invalid).toContain('Invalid reporting date in link');expect(invalid).not.toContain('value="2026-02-30"');
});
