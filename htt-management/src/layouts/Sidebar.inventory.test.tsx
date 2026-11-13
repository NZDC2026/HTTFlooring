import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
const identity=vi.hoisted(()=>({roles:['ADMIN']}));
vi.mock('../features/security/securityClient',()=>({useSecurity:()=>({session:{user:{id:'navigation-test',roles:identity.roles}}})}));
import { Sidebar } from './Sidebar';
function render(path:string,roles=['ADMIN']){identity.roles=roles;return renderToStaticMarkup(<MemoryRouter initialEntries={[path]}><Sidebar/></MemoryRouter>);}
describe('Inventory navigation flyout',()=>{
 it.each(['/inventory/sold','/inventory/bought'])('keeps Inventory active on %s without opening the flyout automatically',path=>{
  const html=render(path);expect(html).toContain('aria-label="Open Inventory submenu"');expect(html).toContain('aria-controls="sidebar-flyout-Inventory"');expect(html).toMatch(/aria-current="page"[^>]*href="\/inventory"|href="\/inventory"[^>]*aria-current="page"/);expect(html).toContain('aria-expanded="false"');
 });
 it('uses the shared light sidebar and preserves the permitted Inventory entry',()=>{const html=render('/inventory',['SALES']);expect(html).toContain('htt-sidebar');expect(html).toContain('href="/inventory"');expect(html).not.toContain('href="/purchases"');});
});
