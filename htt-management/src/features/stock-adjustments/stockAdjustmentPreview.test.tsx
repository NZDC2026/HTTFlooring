import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
vi.mock('../security/securityClient',()=>({useSecurity:()=>({session:{user:{id:'sample-admin',displayName:'Admin',roles:['ADMIN']}}})}));
import { adjustmentSamples, StockAdjustmentForm, StockAdjustmentHistory } from './StockAdjustments';
import { mockProducts } from '../inventory/data/mockProducts';
import { stockAdjustmentRepository } from './stockAdjustmentRepository';
describe('adjustment read-only previews',()=>{
 it('shows pending/completed operators and quantities without adding records',()=>{
  const before=stockAdjustmentRepository.getAll().length,rows=adjustmentSamples(mockProducts,mockProducts[0].id);
  const html=renderToStaticMarkup(<MemoryRouter><StockAdjustmentHistory rows={rows} onOpen={()=>{}}/></MemoryRouter>);
  expect(html).toContain('Draft · Pending');expect(html).toContain('Posted · Completed');expect(html).toContain('Jamie');expect(html).toContain('Morgan');expect(stockAdjustmentRepository.getAll()).toHaveLength(before);
 });
 it('previews batch adjustments globally and a single product from its detail page',()=>{
  expect(adjustmentSamples(mockProducts)[0].lines.length).toBeGreaterThan(1);expect(adjustmentSamples(mockProducts,mockProducts[0].id)[0].lines).toHaveLength(1);
 });
 it('uses the same read-only form for a current-product Sample',()=>{
  const row=adjustmentSamples(mockProducts,mockProducts[0].id)[0];
  const html=renderToStaticMarkup(<MemoryRouter><StockAdjustmentForm row={row} sample onClose={()=>{}} onSaved={()=>{}}/></MemoryRouter>);
  expect(html).toContain('Sample · Read-only preview');expect(html).toContain('View completed example');expect(html).not.toContain('Post Adjustment</button>');expect(html).not.toContain('Save Draft</button>');
 });
});
