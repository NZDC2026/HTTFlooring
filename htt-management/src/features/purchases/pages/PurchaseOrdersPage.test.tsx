import { describe,it,expect,vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
vi.mock('../../security/usePermission',()=>({usePermission:()=>true}));
import { PurchaseOrdersPage } from './PurchaseOrdersPage';
describe('purchase register layout',()=>{
 it('renders commitment metrics, receiving filters and a populated sample entry point',()=>{vi.stubGlobal('window',{location:{hash:'#/purchases',pathname:'/'}});const html=renderToStaticMarkup(<MemoryRouter><PurchaseOrdersPage/></MemoryRouter>);expect(html).toContain('Outstanding PO Value');expect(html).toContain('Receiving Status');expect(html).toContain('Received / Ordered');expect(html).toContain('Progress');expect(html).toContain('Sample');expect(html).not.toContain('Receipts (GRN)');vi.unstubAllGlobals();});
});
