import {it,expect,vi,afterEach} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {purchasePostingOperationRepository} from '../data/purchasePostingOperationRepository';
import {PurchasePostingAlerts} from './PurchasePostingAlerts';
vi.mock('../../security/usePermission',()=>({usePermission:()=>true}));
afterEach(()=>vi.restoreAllMocks());
it('keeps exceptions visible and links to source documents without exposing the retired audit page',()=>{vi.spyOn(purchasePostingOperationRepository,'getAll').mockReturnValue([
 {key:'bad',kind:'SUPPLIER_BILL',sourceId:'bill-1',status:'RECOVERY_REQUIRED',completedSteps:[],updatedAt:'2026-11-09',error:'Interrupted posting'},
 {key:'good',kind:'GOODS_RECEIPT',sourceId:'receipt-1',status:'POSTED',completedSteps:[],updatedAt:'2026-11-09'},
]);const html=renderToStaticMarkup(<MemoryRouter><PurchasePostingAlerts/></MemoryRouter>);expect(html).toContain('requires attention (1)');expect(html).toContain('/purchases/bills/bill-1');expect(html).toContain('Interrupted posting');expect(html).not.toContain('/reports/purchase-posting-audit');expect(html).not.toContain('receipt-1');expect(html).toContain('Sample');expect(html).toContain('Exception resolved');});
