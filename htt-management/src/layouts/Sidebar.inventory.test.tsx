import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
const identity=vi.hoisted(()=>({roles:['ADMIN']}));
vi.mock('../features/security/securityClient',()=>({useSecurity:()=>({session:{user:{id:'navigation-test',roles:identity.roles}}})}));
import { Sidebar } from './Sidebar';
function render(path:string,roles=['ADMIN']){identity.roles=roles;return renderToStaticMarkup(<MemoryRouter initialEntries={[path]}><Sidebar/></MemoryRouter>);}
describe('Inventory submenu',()=>{
 it('expands with Sold and Bought links and highlights the current report',()=>{
  const html=render('/inventory/sold');expect(html).toContain('aria-label="Inventory submenu"');expect(html).toContain('href="/inventory/sold"');expect(html).toContain('href="/inventory/bought"');expect(html).toMatch(/aria-current="page"[^>]*href="\/inventory\/sold"|href="\/inventory\/sold"[^>]*aria-current="page"/);
 });
 it('expands on a direct Bought URL',()=>{const html=render('/inventory/bought');expect(html).toContain('aria-controls="sidebar-inventory-submenu"');expect(html).toMatch(/aria-current="page"[^>]*href="\/inventory\/bought"|href="\/inventory\/bought"[^>]*aria-current="page"/);});
 it('keeps purchase and sales submenu entries permission scoped',()=>{const html=render('/inventory',['SALES']);expect(html).not.toContain('href="/inventory/bought"');expect(html).toContain('href="/inventory/sold"');});
});
