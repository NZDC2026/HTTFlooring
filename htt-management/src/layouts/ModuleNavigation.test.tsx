import {WorkspaceSearchPage} from './WorkspaceUtilityPages';
import {it,expect,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {createMemoryRouter,RouterProvider} from 'react-router-dom';
import {ModuleNavigation,moduleNavigationLinks} from './ModuleNavigation';
import {Sidebar} from './Sidebar';
import {RouteAccess} from '../features/security/SecurityGate';
import {directoryEntries} from '../features/page-previews/directoryCatalog';
import {landingFor,landingPages} from '../features/settings/data/personalPreferences';
const identity=vi.hoisted(()=>({roles:['ADMIN']}));
vi.mock('../features/security/securityClient',()=>({useSecurity:()=>({session:{user:{id:'formal-nav',roles:identity.roles}}})}));
const principal=(roles:string[])=>({userId:'formal-nav',authenticated:true as const,roles});
function render(path:string,node:React.ReactNode){const router=createMemoryRouter([{path:'*',element:node}],{initialEntries:[path]});try{return renderToStaticMarkup(<RouterProvider router={router}/>);}finally{router.dispose();}}
it('removes both presentation entries from the sidebar and keeps business utility entrances',()=>{identity.roles=['ADMIN'];const html=render('/dashboard',<Sidebar/>);expect(html).not.toContain('href="/workspace"');expect(html).not.toContain('href="/demo"');expect(html).toContain('href="/automation/recurring"');expect(html).toContain('href="/tasks"');expect(html).toContain('href="/tools/import-export"');});
it.each(['/workspace','/demo','/demo/anything','/Demo','/work%73pace'])('blocks direct presentation URL %s before rendering an operational child',path=>{identity.roles=['ADMIN'];const html=render(path,<RouteAccess><form><button>Original source preserved</button></form></RouteAccess>);expect(html).toContain('removed from the approved application scope');expect(html).not.toContain('<form');});
it('retains products, bank rules, communications and customer reviews through module navigation',()=>{const admin=principal(['ADMIN']);for(const [path,target] of [['/inventory','/inventory/products'],['/banking','/banking/rules'],['/documents','/documents/communications'],['/sales','/contacts/review']])expect(moduleNavigationLinks(path,admin).some(e=>e.path===target)).toBe(true);expect(render('/inventory',<ModuleNavigation/>)).toContain('More in Inventory');});
it('provides a module or primary entrance for every active directory business target',()=>{const admin=principal(['ADMIN']);for(const entry of directoryEntries){if(entry.path==='/search/records'){expect(render('/search',<WorkspaceSearchPage/>)).toContain('href="/search/records"');continue;}const root='/'+entry.path.split('/')[1];if(entry.path===root){expect(['/tasks']).toContain(root);continue;}expect(moduleNavigationLinks(root,admin).some(e=>e.path===entry.path),entry.path).toBe(true);}});
it('does not restore retired financial workflows or leak payroll and financial settings to sales users',()=>{const html=render('/banking',<ModuleNavigation/>);expect(html).not.toContain('/banking/instruction-files');expect(moduleNavigationLinks('/payroll',principal(['SALES']))).toEqual([]);expect(moduleNavigationLinks('/settings',principal(['SALES'])).some(e=>e.path==='/settings/financial')).toBe(false);});
it('falls back safely for a legacy directory landing preference without erasing saved preferences',()=>{expect(landingPages.some(e=>e.path==='/workspace')).toBe(false);expect(landingFor(principal(['ADMIN']),'/workspace')).toBe('/dashboard');expect(landingFor(principal(['SALES']),'/workspace')).toBe('/sales');});
