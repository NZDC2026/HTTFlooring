import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
vi.mock('../security/securityClient',()=>({useSecurity:()=>({session:{user:{id:'status-preview',roles:['ADMIN']}}})}));
import { ProductBusinessPage } from './MasterDataPages';
describe('product header status',()=>{
 it('places one status selector above the form and associates it with the save form',()=>{
  const html=renderToStaticMarkup(<MemoryRouter><ProductBusinessPage mode="new"/></MemoryRouter>);
  expect(html.indexOf('aria-label="Product status"')).toBeLessThan(html.indexOf('<form'));
  expect(html).toContain('form="product-editor-form"');
  expect(html).toContain('id="product-editor-form"');
  expect(html.match(/aria-label="Product status"/g)).toHaveLength(1);
  expect(html).toContain('value="ACTIVE"');expect(html).toContain('value="INACTIVE"');
 });
});
