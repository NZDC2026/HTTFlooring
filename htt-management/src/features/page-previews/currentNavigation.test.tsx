import {it,expect,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {createMemoryRouter,RouterProvider} from 'react-router-dom';
import {execFileSync} from 'node:child_process';
const identity=vi.hoisted(()=>({roles:['ADMIN']}));
vi.mock('../security/securityClient',()=>({useSecurity:()=>({session:{user:{id:'current-navigation',roles:identity.roles}}})}));
import {additionalRoutes} from './previewRoutes';
import {directoryEntries} from './directoryCatalog';
import {settingsForms} from './catalog';
function render(path:string,roles=['ADMIN']){identity.roles=roles;const router=createMemoryRouter(additionalRoutes,{initialEntries:[path]});try{return renderToStaticMarkup(<RouterProvider router={router}/>);}finally{router.dispose();identity.roles=['ADMIN'];}}
it('resolves every directory entry to one explicit registered route without duplicates or samples',()=>{expect(new Set(directoryEntries.map(x=>x.path)).size).toBe(directoryEntries.length);for(const item of directoryEntries){expect(additionalRoutes.filter(r=>'/'+r.path===item.path)).toHaveLength(1);const html=render(item.path);expect(html).not.toContain('No local page configured');expect(html).not.toContain('Workspace preview');expect(html).not.toContain('Unexpected Application Error');}});
it('uses the same settings permission metadata in directory and route guards',()=>{for(const setting of Object.values(settingsForms)){expect(directoryEntries.find(d=>d.path===setting.path)?.permission).toBe(setting.permission);}const purchasing=render('/workspace',['PURCHASING']);expect(purchasing).toContain('href="/settings/purchases"');expect(render('/settings/purchases',['PURCHASING'])).toContain('Preferred payment method');expect(render('/workspace',['SALES'])).not.toContain('href="/settings/purchases"');});
it('states actual local OCR, Australian payroll and external execution boundaries',()=>{const html=render('/workspace');expect(html).toContain('macOS English PDF/image recognition');expect(html).toContain('Australian payroll filing');expect(html).toContain('does not execute bank payment');expect(html).not.toContain('NZ Payday Filing');expect(html).not.toContain('Open sample workspace');expect(html).not.toContain('Find a preview page');});
it('keeps documentation links and legacy code isolation checked against the current source tree',()=>{const output=execFileSync(process.execPath,['scripts/current-guidance.mjs','--check'],{encoding:'utf8',timeout:20000});expect(output).toContain('Current guidance verified');});
