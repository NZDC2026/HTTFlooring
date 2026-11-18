import {describe,it,expect,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {sidebarActivePath,sidebarNavigation,sidebarWorkspaceRole} from './sidebarNavigation';
import {workspacePreviewRoles} from './workspacePreview';
import {Sidebar} from './Sidebar';
vi.mock('../features/security/securityClient',()=>({useSecurity:()=>({session:{user:{id:'sidebar-test',roles:['ADMIN']}}})}));
const full=['Dashboard','Sales','Customers','Marketing','Purchases','Suppliers','Inventory','Dispatch','Work','Sales performance','Tasks','Employees','Finance','Reports'];
const expected={Admin:full,Account:full,'Front desk':full.filter(x=>x!=='Employees'),Sales:full.filter(x=>!['Marketing','Dispatch','Employees','Finance'].includes(x)),Warehouse:full.filter(x=>!['Customers','Marketing','Employees','Finance'].includes(x))};
describe('reference role menus',()=>{
  it.each(workspacePreviewRoles)('%s Sample exactly matches the reference order and visibility',role=>{
    const groups=sidebarNavigation(role,true,null);
    expect(groups.flatMap(g=>g.items.map(i=>i.label))).toEqual(expected[role]);
    expect(groups.map(g=>g.label)).toEqual(['','Sell','Buy','Warehouse','Team','Money']);
  });
  it.each(['ADMIN','ACCOUNTANT','FINANCE_ADMIN','SALES','WAREHOUSE','PURCHASING','AUDITOR'])('%s live menu keeps verified authorization',role=>{
    const principal={userId:'test',roles:[role],authenticated:true as const};
    const menu=sidebarNavigation(sidebarWorkspaceRole(principal.roles),false,principal).flatMap(g=>g.items);
    if(role==='SALES'||role==='WAREHOUSE') for(const path of ['/accounting','/payroll/employees','/payroll/timesheets'])expect(menu.map(i=>i.path)).not.toContain(path);
    if(role==='SALES')expect(menu.map(i=>i.path)).not.toContain('/purchases');
  });
  it('does not allow an unauthenticated live menu',()=>expect(sidebarNavigation('Admin',false,null)).toEqual([]));
  it.each([
    ['/payroll','/accounting'],['/payroll/pay-runs/example','/accounting'],['/payroll/employees','/payroll/employees'],['/payroll/timesheets','/payroll/timesheets'],
    ['/reports/sales-analysis','/reports/sales-analysis'],['/reports/sales-analysis/detail','/reports/sales-analysis'],['/reports/aged-payables','/reports'],
    ['/inventory/scan','/inventory'],['/inventory/sales-dispatch','/inventory/sales-dispatch'],['/contacts/suppliers/example','/contacts/supplier-dashboard'],
  ])('keeps exactly one primary owner for %s',(path,active)=>expect(sidebarActivePath(path)).toBe(active));
  it('keeps Sample links isolated across workspace navigation',()=>{
    const html=renderToStaticMarkup(<MemoryRouter initialEntries={['/dashboard?sample=1']}><Sidebar/></MemoryRouter>);
    expect(html).toContain('href="/reports/sales-analysis?sample=1"');
    expect(html).toContain('href="/settings?sample=1"');
    expect(html).not.toContain('More workspaces');expect(html).not.toContain('>Scan<');
  });
});
