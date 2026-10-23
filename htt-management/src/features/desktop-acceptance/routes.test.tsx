import {writeFileSync} from 'node:fs';
import {it,expect,vi,afterAll} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {createMemoryRouter,RouterProvider,Outlet} from 'react-router-dom';
import {roles,hasPermission} from '../security/rbac';
import {Sidebar} from '../../layouts/Sidebar';
const identity=vi.hoisted(()=>({roles:['ADMIN']}));
vi.mock('../security/securityClient',()=>({useSecurity:()=>({initialized:true,session:{user:{id:'desktop-acceptance',displayName:'Synthetic acceptance',roles:identity.roles}}})}));
vi.mock('../../layouts/AppLayout',async()=>{const {RouteAccess}=await import('../security/SecurityGate');return {AppLayout:()=> <RouteAccess><Outlet/></RouteAccess>};});
vi.mock('react-router-dom',async original=>{const module=await original<typeof import('react-router-dom')>();return {...module,Navigate:({to}:{to:string})=><div data-redirect={to}>Redirect to {to}</div>};});
vi.mock('react',async original=>{const module=await original<typeof import('react')>();return {...module,useSyncExternalStore:(subscribe:any,get:any,server:any)=>module.useSyncExternalStore(subscribe,get,server??get)};});
import {appRoutes} from '../../app/routes';
import type {RouteObject} from 'react-router-dom';
function paths(rows:RouteObject[],parent=''):string[]{return rows.flatMap(r=>{const path=(parent+'/'+(r.path??'')).replace(/\/+/g,'/');return r.children?paths(r.children,path):r.index?[]:[path];});}
const observations:{role:string;pattern:string;path:string;state:string}[]=[];
afterAll(()=>{const target=process.env.HTT_ROUTE_EVIDENCE;if(target){if(!target.startsWith('/private/tmp/')&&!target.startsWith('/tmp/'))throw new Error('Use a temporary evidence file.');writeFileSync(target,JSON.stringify(observations,null,2));}});
export const patterns=paths(appRoutes).filter(p=>p!=='/*');
for(const role of roles)for(const pattern of patterns){
 const path=pattern.replace(/:[A-Za-z]+/g,'missing-acceptance-record');
 it(`${role} ${pattern}: register/form or explicit missing/denied state`,()=>{identity.roles=[role];const router=createMemoryRouter(appRoutes,{initialEntries:[path]});try{const html=renderToStaticMarkup(<RouterProvider router={router}/>);observations.push({role,pattern,path,state:html.includes('Your role does not have access')?'denied':html.includes('data-redirect=')?'redirect':/not found|No matching|No .*record|No .*configured/i.test(html)?'empty-or-missing':'rendered'});expect(html.trim().length).toBeGreaterThan(20);expect(html).not.toContain('Unexpected Application Error');expect(html).not.toContain('Application error');expect(html).not.toContain('No local page configured');expect(html).not.toContain('Interactive sample');}finally{router.dispose();identity.roles=['ADMIN'];}});
}

for(const role of roles)it(`${role}: menu and banking write controls follow authority`,()=>{identity.roles=[role];const p={userId:'acceptance',authenticated:true as const,roles:[role]};const router=createMemoryRouter([{path:'/',element:<Sidebar/>}]);try{const html=renderToStaticMarkup(<RouterProvider router={router}/>);expect(html.includes('href="/accounting/periods"')).toBe(hasPermission(p,'accounting.read'));}finally{router.dispose();}for(const path of ['/banking','/banking/transactions/new','/banking/transfers/new','/banking/accounts/acceptance-account/reconcile']){const r=createMemoryRouter(appRoutes,{initialEntries:[path]});try{const html=renderToStaticMarkup(<RouterProvider router={r}/>);if(path.endsWith('/reconcile')){if(!hasPermission(p,'banking.reconcile'))expect(html).toContain('Your role does not have access');}else if(hasPermission(p,'banking.read')&&!hasPermission(p,'banking.write')){if(path==='/banking'){expect(html).not.toContain('Transfer Money');expect(html).not.toContain('New Transaction');}else expect(html).toContain('Your role does not have access');}}finally{r.dispose();}}identity.roles=['ADMIN'];});
