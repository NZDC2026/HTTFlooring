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
 it('hides product cost fields and the cost column option for sales users', () => { expect(render('/inventory/products/sample-1', ['SALES'])).not.toContain('Buying cost'); expect(render('/inventory/products/sample-1/edit', ['SALES'])).not.toContain('Buying cost'); expect(render('/inventory/products', ['SALES'])).not.toContain('Buying cost'); });
 it('denies a direct payroll preview URL to sales roles', () => { expect(render('/payroll/pay-items', ['SALES'])).toContain('Your role does not have access'); });
 it('uses the real recoverable document lifecycle without permanent purge', () => { for (const role of ['AUDITOR', 'ADMIN']) { const html = render('/sales/recycle-bin', [role]); expect(html).toContain('Recover selected documents'); expect(html).not.toContain('Purge selected samples'); } });
 it('restricts payroll pages and directory links to payroll authority', () => { for(const path of ['/payroll/pay-items','/payroll/filing','/settings/payroll','/reports/payroll-summary']) {expect(render(path,['AUDITOR'])).toContain('Your role does not have access');expect(render(path,['ACCOUNTANT'])).not.toContain('Your role does not have access');} expect(render('/workspace',['AUDITOR'])).not.toContain('Payroll filing'); });
 it('filters directory links by the signed-in role', () => { const html = render('/workspace', ['WAREHOUSE']); expect(html).toContain('Products &amp; services'); expect(html).not.toContain('Payroll filing'); expect(html).not.toContain('Linked accounts'); });
});
