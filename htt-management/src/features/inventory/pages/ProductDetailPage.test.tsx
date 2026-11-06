import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
const access=vi.hoisted(()=>({cost:true}));
vi.mock('../../security/usePermission',()=>({usePermission:(p:string)=>p==='inventory.cost.read'?access.cost:true}));
import { ProductDetailPage } from './ProductDetailPage';
describe('product details',()=>{
 it('opens populated read-only sample details without edit controls',()=>{
  const html=renderToStaticMarkup(<MemoryRouter><ProductDetailPage id="sample-0"/></MemoryRouter>);
  expect(html).toContain('AquaGlow Berlin Oak');expect(html).toContain('Product Information');expect(html).toContain('Units &amp; Prices');expect(html).toContain('Read-only');expect(html).not.toContain('Edit product');
 });
 it('hides inventory value and costs without cost permission',()=>{
  access.cost=false;
  try{const html=renderToStaticMarkup(<MemoryRouter><ProductDetailPage id="sample-0"/></MemoryRouter>);expect(html).not.toContain('Average Cost');expect(html).not.toContain('Current Value');expect(html).not.toContain('Last Purchase Price');}finally{access.cost=true;}
 });
 it('handles missing products with a return to inventory',()=>{
  const html=renderToStaticMarkup(<MemoryRouter><ProductDetailPage id="missing"/></MemoryRouter>);expect(html).toContain('Product not found');expect(html).toContain('Back to Inventory');
 });
});
