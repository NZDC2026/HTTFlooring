import {describe,it,expect,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
vi.mock('../features/security/securityClient',()=>({useSecurity:()=>({session:{user:{id:'sample-navigation',roles:['ADMIN']}}})}));
import {Sidebar} from './Sidebar';
import {sidebarOwner,longestPageTitle,navigationOwners,accountingSubmenuActive} from './navigationState';
describe('exclusive workspace navigation',()=>{
 it.each([
 ['/sales/credit-returns','/sales/credit-returns'],['/sales/customer-returns/new','/sales/credit-returns'],
 ['/sales/credit-notes/credit_1','/sales/credit-returns'],['/sales/invoices/invoice_1','/sales'],
 ['/purchases/incoming-shipments','/procurement'],['/purchases/po_1/edit','/purchases'],
 ['/contacts/price-settings','/contacts'],['/contacts/suppliers/sup_1','/contacts/supplier-dashboard'],
 ['/settings/employees','/settings/employees'],['/settings/trash','/settings/trash'],
 ['/settings/preferences','/settings/preferences'],['/settings/integrations/mail','/settings'],
 ['/inventory/sold','/inventory'],['/accounting/periods','/accounting'],
 ])('assigns %s to %s',(path,owner)=>expect(sidebarOwner(path+'?sample=1')).toBe(owner));
 it.each(['/sales/credit-returns','/sales/customer-returns/new','/purchases/incoming-shipments','/settings/employees','/settings/trash','/settings/preferences'])('renders exactly one current entry for %s',path=>{
 const html=renderToStaticMarkup(<MemoryRouter initialEntries={[path]}><Sidebar/></MemoryRouter>);
 expect(html.match(/aria-current="page"/g)).toHaveLength(1);
 expect(html).toContain(`href="${sidebarOwner(path)}"`);
 });
 it('requires a path boundary and unique navigation roots',()=>{expect(sidebarOwner('/sales-other')).toBeUndefined();expect(new Set(navigationOwners).size).toBe(navigationOwners.length);});
 it('uses the most specific page title independent of declaration order',()=>expect(longestPageTitle('/sales/credit-returns/123',{'/sales':'Sales','/sales/credit-returns':'Credit'})).toBe('/sales/credit-returns'));
});

it('retains submenu selection with filters and nested journal details',()=>{
 expect(accountingSubmenuActive('/accounting','?sample=1','/accounting')).toBe(true);
 expect(accountingSubmenuActive('/accounting','?view=accounts&sample=1','/accounting')).toBe(false);
 expect(accountingSubmenuActive('/accounting','?view=accounts&sample=1','/accounting?view=accounts')).toBe(true);
 expect(accountingSubmenuActive('/accounting/journals/123','','/accounting/journals')).toBe(true);
});
