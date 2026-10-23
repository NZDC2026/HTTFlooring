import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {reportAsOf} from '../../../lib/reportAsOf';
let calculate:typeof import('./financeControlsService').calculateFinanceControls;
let accounts:import('../types/account').Account[];
let movement:import('../../inventory/types/inventoryCost').InventoryCostMovement;
let journal:import('../types/journalEntry').JournalEntry;
beforeEach(async()=>{
 vi.resetModules();
 const a=await import('./accountRepository'),products=await import('../../inventory/data/mockProducts'),sites=await import('../../inventory/data/inventorySiteRepository');
 accounts=structuredClone(a.accountRepository.getAll());
 const inventory=accounts.find(a=>a.systemRole==='INVENTORY')!,equity=accounts.find(a=>a.systemRole==='OWNERS_EQUITY')!;
 const product=products.mockProducts[0],site=sites.inventorySiteRepository.getActive()[0];
 movement={id:'g17-cost',costMovementNumber:'G17-1',movementType:'RECEIPT',siteId:site.id,productId:product.id,baseUnitId:product.baseUnitId,quantityBase:5,unitCostBase:20,valueChange:100,quantityAfter:5,averageCostAfter:20,inventoryValueAfter:100,referenceType:'GOODS_RECEIPT',referenceId:'g17-receipt',occurredAt:'2026-09-15T00:00:00Z',createdAt:'2026-09-15T00:00:00Z'};
 journal={id:'g17-journal',journalNumber:'G17-JE',journalDate:'2026-09-15',description:'Synthetic inventory',sourceType:'GOODS_RECEIPT',sourceId:'g17-receipt',status:'POSTED',lines:[{id:'inv',accountId:inventory.id,accountCode:inventory.code,accountName:inventory.name,debit:100,credit:0},{id:'eq',accountId:equity.id,accountCode:equity.code,accountName:equity.name,debit:0,credit:100}],totalDebit:100,totalCredit:100,createdAt:'2026-09-15T00:00:00Z',updatedAt:'2026-09-15T00:00:00Z',postedAt:'2026-09-15T00:00:00Z'};
 calculate=(await import('./financeControlsService')).calculateFinanceControls;
});
afterEach(()=>vi.restoreAllMocks());
function report(movements=[movement],journals=[journal],date='2026-09-30',selectedAccounts=accounts){return calculate({accounts:selectedAccounts,journalEntries:journals,bankAccounts:[],costMovements:movements,arReconciliation:{arSubledgerBalance:0,glAccountsReceivableBalance:0} as any,apReconciliation:{apSubledgerBalance:0,glAccountsPayableBalance:0} as any,asOfDate:date});}
it('adds exactly one dated inventory control and includes it in all totals',()=>{
 const before=structuredClone({accounts,movement,journal});const r=report();expect(r.controls.filter(c=>c.id==='inventory')).toHaveLength(1);expect(r.controls.find(c=>c.id==='inventory')).toMatchObject({leftValue:100,rightValue:100,difference:0,status:'PASS',route:'/inventory/reconciliation?asOf=2026-09-30'});expect(r).toMatchObject({totalControlCount:6,passedControlCount:6,failedControlCount:0,allPassed:true});expect({accounts,movement,journal}).toEqual(before);
});
it('fails overall when inventory differs even when all other controls pass',()=>{const r=report([movement],[]);expect(r.controls.filter(c=>c.status==='FAIL').map(c=>c.id)).toEqual(['inventory']);expect(r.controls.find(c=>c.id==='inventory')?.difference).toBe(100);expect(r).toMatchObject({passedControlCount:5,failedControlCount:1,allPassed:false});});
it('uses the same reporting cutoff for subledger and GL including future exclusions',()=>{expect(report([movement],[journal],'2026-09-14').controls.find(c=>c.id==='inventory')).toMatchObject({leftValue:0,rightValue:0,status:'PASS'});expect(report([movement],[{...journal,journalDate:'2026-10-01'}]).allPassed).toBe(false);expect(report([movement],[{...journal,journalDate:'2026-10-01'}],'2026-10-01').allPassed).toBe(true);});
it('keeps missing control accounts as failed/unavailable instead of an all-pass report',()=>{const r=report([],[],'2026-09-30',accounts.filter(a=>a.systemRole!=='INVENTORY'));expect(r.controls.find(c=>c.id==='inventory')).toMatchObject({status:'FAIL',unavailable:true});expect(r.allPassed).toBe(false);});
it('rejects equal-and-opposite duplicate cost IDs even if the apparent total is zero',()=>{const r=report([movement,{...movement,quantityBase:-5,valueChange:-100}],[]);expect(r.controls.find(c=>c.id==='inventory')).toMatchObject({status:'FAIL',unavailable:true});expect(r.allPassed).toBe(false);});
it.each([NaN,Infinity,-Infinity])('fails safely on non-finite inventory values %s',value=>{const r=report([{...movement,valueChange:value}],[]);expect(r.controls.find(c=>c.id==='inventory')).toMatchObject({status:'FAIL',unavailable:true});expect(r.allPassed).toBe(false);});
it('checks integrity of zero-ending positions rather than skipping missing master data',()=>{const r=report([{...movement,siteId:'missing',quantityBase:0,valueChange:0}],[]);expect(r.controls.find(c=>c.id==='inventory')).toMatchObject({status:'FAIL',unavailable:true});});
it('counts inventory failures together with existing bank failures',()=>{const r=calculate({accounts,journalEntries:[],bankAccounts:[{id:'bank',name:'Synthetic',glAccountId:accounts.find(a=>a.systemRole==='BANK')!.id,openingBalance:10,openingBalanceDate:'2026-01-01'} as any],costMovements:[movement],arReconciliation:{arSubledgerBalance:0,glAccountsReceivableBalance:0} as any,apReconciliation:{apSubledgerBalance:0,glAccountsPayableBalance:0} as any,asOfDate:'2026-09-30'});expect(r).toMatchObject({totalControlCount:7,passedControlCount:5,failedControlCount:2,allPassed:false});});
it('round-trips the review date and rejects malformed or impossible linked dates',()=>{expect(reportAsOf(new URL('https://example.test'+report().controls.find(c=>c.id==='inventory')!.route).searchParams.get('asOf'),'2026-10-23')).toEqual({date:'2026-09-30',invalid:false});for(const date of ['2026-02-30','','not-a-date'])expect(reportAsOf(date,'2026-10-23')).toEqual({date:'2026-10-23',invalid:true});});
