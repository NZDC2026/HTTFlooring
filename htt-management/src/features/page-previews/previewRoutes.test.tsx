import { TimesheetsPage } from '../payroll/pages/PayrollPages';
import { configurationRows } from '../business-workspace/configurationState';
import { configurationHistory } from '../business-workspace/workspaceRepository';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
const identity = vi.hoisted(() => ({ roles: ['ADMIN'] }));
vi.mock('../security/securityClient', () => ({ useSecurity: () => ({ session: { user: { id: 'preview-test', roles: identity.roles } } }) }));
import { additionalRoutes } from './previewRoutes';
import { previewModules } from './catalog';
describe('management preview route coverage', () => {
 const paths = additionalRoutes.map(r => '/' + r.path!.replace(':previewId', 'sample-1'));
 it('uses unique route patterns', () => { expect(new Set(paths).size).toBe(paths.length); });
 it.each(paths)('renders %s with its own workspace and no error fallback', path => {
  const router = createMemoryRouter(additionalRoutes, { initialEntries: [path] });
  const html = renderToStaticMarkup(<RouterProvider router={router} />);
  expect(html).toMatch(/Workspace preview|Local business data|Management page directory/);
  expect(html).not.toContain('Unexpected Application Error');
  expect(html).not.toContain('Interactive sample');
  expect(html).not.toContain('Workspace preview');
  expect(html).not.toContain('No local page configured');
  expect(html).not.toContain('Your role does not have access');
  if (path.endsWith('/sample-1')) expect(html).not.toContain('Sample not found');
  router.dispose();
 });
 it('defines list, new, detail and edit coverage for each new register', () => {
  for (const m of previewModules) for (const suffix of ['', '/new', '/sample-1', '/sample-1/edit']) expect(paths).toContain(m.path + suffix);
 });
});

describe('preview access boundaries', () => {
 function render(path: string, roles: string[]) { identity.roles = roles; const router = createMemoryRouter(additionalRoutes, { initialEntries: [path] }); try { return renderToStaticMarkup(<RouterProvider router={router} />); } finally { router.dispose(); identity.roles = ['ADMIN']; } }
 it('renders independent purchase settings with role-scoped controls',()=>{const purchasing=render('/settings/purchases',['PURCHASING']);expect(purchasing).toContain('Purchase settings');expect(purchasing).toContain('Preferred payment method');expect(purchasing).not.toContain('Save purchase settings');const admin=render('/settings/purchases',['ADMIN']);expect(admin).toContain('Save purchase settings');expect(admin).not.toContain('Save financial settings');expect(render('/settings/purchases',['SALES'])).toContain('Your role does not have access');});
 it('hides product cost fields and the cost column option for sales users', () => { expect(render('/inventory/products/sample-1', ['SALES'])).not.toContain('Buying cost'); expect(render('/inventory/products/sample-1/edit', ['SALES'])).not.toContain('Buying cost'); expect(render('/inventory/products', ['SALES'])).not.toContain('Buying cost'); });
 it('denies a direct payroll preview URL to sales roles', () => { expect(render('/payroll/pay-items', ['SALES'])).toContain('Your role does not have access'); });
 it('shows main-backed recovery and restricts permanent purge controls to ADMIN', () => { for (const role of ['AUDITOR', 'ADMIN']) { const html = render('/sales/recycle-bin', [role]); expect(html).toContain('Recover selected documents'); expect(html).not.toContain('Purge selected samples'); if(role==='ADMIN') {expect(html).toContain('Preview permanent purge');expect(html).toContain('recycle-backups');} else {expect(html).not.toContain('Preview permanent purge');} } });
 it('shows recurring automation policy and keeps bank generation and financial actions role-scoped', () => {
  const admin=render('/automation/recurring',['ADMIN']);expect(admin).toContain('Local due-date automation');expect(admin).toContain('Recurring error queue');expect(admin).toContain('Enable BANK automatic drafts');expect(admin).toContain('Save recurring bank template');
  const audit=render('/automation/recurring',['AUDITOR']);expect(audit).toContain('Recurring error queue');expect(audit).not.toContain('Enable INVOICE automatic drafts');expect(audit).not.toContain('Scan enabled types now');expect(audit).not.toContain('Save recurring bank template');
  const purchasing=render('/automation/recurring',['PURCHASING']);expect(purchasing).toContain('Enable EXPENSE automatic drafts');expect(purchasing).not.toContain('Enable INVOICE automatic drafts');expect(purchasing).not.toContain('Recurring bank transaction templates');
 });
 it('renders compound bank rule management and scopes classification writes to bank writers',()=>{
  const admin=render('/banking/rules',['ADMIN']);expect(admin).toContain('Preview bank classification');expect(admin).toContain('Classification audit');expect(admin).toContain('Save selected classifications');
  const auditor=render('/banking/rules',['AUDITOR']);expect(auditor).toContain('Preview bank classification');expect(auditor).not.toContain('Save selected classifications');expect(auditor).not.toContain('New bank rule');
  const form=render('/banking/rules/new',['ADMIN']);expect(form).toContain('Add condition');expect(form).toContain('Automatically classify new imports');expect(form).toContain('Priority (0 first, 999 last)');
  const savedRows=configurationRows['bank-rules'],savedHistory=configurationHistory['bank-rules'];try{const row={id:'history-rule',name:'Office history',status:'Active',revision:'1',createdAt:'2026-10-22T00:00:00Z',updatedAt:'2026-10-22T00:00:00Z',field:'Description',operator:'Contains',value:'Office',accountId:'account-history',taxCode:'GST'};configurationRows['bank-rules']=[row];configurationHistory['bank-rules']=[{id:'history-event',name:'Created',status:'Active',revision:'1',recordId:row.id,actorId:'trusted-admin',createdAt:'2026-10-22T00:00:00Z',updatedAt:'2026-10-22T00:00:00Z',after:JSON.stringify(row)}];const detail=render('/banking/rules/history-rule',['ADMIN']);expect(detail).toContain('Rule change history');expect(detail).toContain('trusted-admin');expect(detail).toContain('Description Contains Office');}finally{configurationRows['bank-rules']=savedRows;configurationHistory['bank-rules']=savedHistory;}
 });
 it('uses the CommBank default and keeps bank instruction configuration and payroll data role scoped',()=>{
  expect(render('/workspace',['ADMIN'])).toMatch(/Bank instruction files<span[^>]*>Open local business data/);const admin=render('/banking/instruction-files',['ADMIN']);expect(admin).toContain('Bank instruction files');expect(admin).toContain('value="CBA" selected=""');expect(admin).toContain('Payroll net wages');expect(admin).toContain('Save reviewed payer profile');expect(admin).toContain('Existing downloaded copies are not revoked');
  const audit=render('/banking/instruction-files',['AUDITOR']);expect(audit).toContain('Instruction batches and audit');expect(audit).not.toContain('Save reviewed payer profile');expect(audit).not.toContain('Payroll net wages');expect(render('/banking/instruction-files',['SALES'])).toContain('Your role does not have access');
 });
 it('offers authorized payroll project hours and explains frozen project report ownership',()=>{
  function renderHours(roles:string[]){identity.roles=roles;const router=createMemoryRouter([{path:'/payroll/timesheets',element:<TimesheetsPage/>}],{initialEntries:['/payroll/timesheets']});try{return renderToStaticMarkup(<RouterProvider router={router}/>);}finally{router.dispose();identity.roles=['ADMIN'];}}const hours=renderHours(['ADMIN']);expect(hours).toContain('Timesheet project');expect(hours).toContain('Frozen project');expect(hours).toContain('Salary costs are split by approved recorded hours');expect(renderHours(['AUDITOR'])).toContain('Your role does not have access');const jobs=render('/accounting/jobs',['ADMIN']);expect(jobs).toContain('Payroll project costs are inherited from frozen pay-run hours');
 });
 it('shows local PNG branding settings and restricts upload and selection controls to financial writers',()=>{const admin=render('/settings/financial',['ADMIN']);expect(admin).toContain('Company branding image');expect(admin).toContain('Upload company PNG');expect(admin).toContain('Use no logo for future outputs');const audit=render('/settings/financial',['AUDITOR']);expect(audit).toContain('Company branding image');expect(audit).not.toContain('Upload company PNG');expect(audit).not.toContain('Use no logo for future outputs');});
 it('restricts payroll pages and directory links to payroll authority', () => { for(const path of ['/payroll/transmissions','/payroll/pay-items','/payroll/filing','/settings/payroll','/reports/payroll-summary']) {expect(render(path,['AUDITOR'])).toContain('Your role does not have access');expect(render(path,['ACCOUNTANT'])).not.toContain('Your role does not have access');} expect(render('/workspace',['AUDITOR'])).not.toContain('Payroll filing'); });
 it('filters directory links by the signed-in role', () => { const html = render('/workspace', ['WAREHOUSE']); expect(html).toContain('Products &amp; services'); expect(html).not.toContain('Payroll filing'); expect(html).not.toContain('Linked accounts'); });
});
