import {it,expect,vi,afterEach} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {purchasePostingOperationRepository} from '../data/purchasePostingOperationRepository';
import {PurchasePostingAlerts,PurchaseReconciliationNotice} from './PurchasePostingAlerts';
import type {PurchaseAccountingReconciliation} from '../data/purchaseAccountingReconciliationService';
vi.mock('../../security/usePermission',()=>({usePermission:()=>true}));
afterEach(()=>vi.restoreAllMocks());
it('keeps exceptions visible and links to source documents without exposing the retired audit page',()=>{vi.spyOn(purchasePostingOperationRepository,'getAll').mockReturnValue([
 {key:'bad',kind:'SUPPLIER_BILL',sourceId:'bill-1',status:'RECOVERY_REQUIRED',completedSteps:[],updatedAt:'2026-11-09',error:'Interrupted posting'},
 {key:'good',kind:'GOODS_RECEIPT',sourceId:'receipt-1',status:'POSTED',completedSteps:[],updatedAt:'2026-11-09'},
]);const html=renderToStaticMarkup(<MemoryRouter><PurchasePostingAlerts/></MemoryRouter>);expect(html).toContain('requires attention (1)');expect(html).toContain('/purchases/bills/bill-1');expect(html).toContain('Interrupted posting');expect(html).not.toContain('/reports/purchase-posting-audit');expect(html).not.toContain('receipt-1');expect(html).toContain('Sample');expect(html).toContain('Exception resolved');});

it('shows reconciliation differences and failed validation, and clears resolved alerts',()=>{
 const row={accountId:'inventory',accountCode:'1300',accountName:'Inventory',subledger:120,generalLedger:0,difference:120,status:'DIFFERENCE' as const};
 const result:PurchaseAccountingReconciliation={asOfDate:'2026-11-09',inventory:row,grni:{...row,accountId:'grni',status:'MATCHED',difference:0},ppv:{...row,accountId:'ppv',status:'MATCHED',difference:0},reconciled:false,historicalMatchingWarning:''};
 const render=(props:Parameters<typeof PurchaseReconciliationNotice>[0])=>renderToStaticMarkup(<MemoryRouter><PurchaseReconciliationNotice {...props}/></MemoryRouter>);
 expect(render({result})).toContain('1300 · Inventory');expect(render({result})).toContain('120.00');expect(render({result})).not.toContain('/reports/purchase-accounting-reconciliation');
 expect(render({error:'Missing accounting control account: GRNI'})).toContain('Validation could not complete');
 expect(render({result:{...result,reconciled:true}})).toBe('');
});
