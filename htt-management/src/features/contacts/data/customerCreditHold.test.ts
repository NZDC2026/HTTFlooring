import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let root: string, security: InstanceType<typeof import('../../../../electron/security/localSecurity').LocalSecurity>, host: InstanceType<typeof import('../../../../electron/security/businessHost').BusinessHost>;
const admin = { username: 'payroll.admin', displayName: 'Payroll acceptance', password: 'Payroll-test-password-4821' };
beforeEach(async () => { vi.resetModules(); vi.stubGlobal('__HTT_MAIN_HOST__', true); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined); root = mkdtempSync(join(tmpdir(), 'htt-payroll-')); const { LocalSecurity } = await import('../../../../electron/security/localSecurity'), { BusinessHost } = await import('../../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.setup(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); });
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); rmSync(root, { recursive: true, force: true }); });
const cmd = (repository: string, method: string, ...args: unknown[]) => host.command({ repository, method, args }).result as any;
const raw = () => host.exportBackup().repositories as any;




function customerValues(c:any,patch:any={}){return {businessName:c.businessName,tradingName:c.tradingName??'',abn:c.abn??'',businessType:c.businessType,status:c.status,email:c.email??'',phone:c.phone??'',website:c.website??'',creditLimit:c.creditLimit,paymentTermsDays:c.paymentTermsDays,paymentTermsType:c.paymentTermsType??'DAYS',...patch};}
it('persists independent credit hold and internal notes without changing status or overwriting note threads',async()=>{
 const c=raw().customers.customers[0];
 cmd('customers','update',c.id,customerValues(c,{creditHold:true,internalNotes:'Confirm unloading access with the store manager.'}));
 const {BusinessHost}=await import('../../../../electron/security/businessHost');host=new BusinessHost(join(root,'business.json'),security);await host.initialize();
 const saved=raw().customers.customers.find((x:any)=>x.id===c.id);expect(saved.creditHold).toBe(true);expect(saved.status).toBe(c.status);expect(saved.internalNotes).toContain('unloading');expect(saved.notes).toEqual(c.notes);
 cmd('customers','update',c.id,customerValues(saved));expect(raw().customers.customers.find((x:any)=>x.id===c.id).creditHold).toBe(true);
});
it('blocks quote conversion while on credit hold and allows it after release',()=>{
 const c=raw().customers.customers[0],p=raw().products.products[0];
 const quote=cmd('sales','createQuote',{customerId:c.id,documentDate:'2026-11-06',lines:[{productId:p.id,unitId:p.baseUnitId,quantity:1}]});
 cmd('sales','sendQuote',quote.id);cmd('sales','acceptQuote',quote.id);
 const before=raw().sales.salesOrders.length;
 cmd('customers','update',c.id,customerValues(c,{creditHold:true}));
 expect(()=>cmd('sales','convertQuoteToOrder',quote.id)).toThrow(/Credit On Hold/);expect(raw().sales.salesOrders).toHaveLength(before);
 cmd('customers','update',c.id,customerValues(c,{creditHold:false}));expect(cmd('sales','convertQuoteToOrder',quote.id).customerId).toBe(c.id);
});
it('rechecks credit hold before posting an already-approved direct order',()=>{
 const c=raw().customers.customers[0],p=raw().products.products[0];
 const draft=cmd('managedSalesDocuments','save',{operationId:crypto.randomUUID(),payload:{kind:'ORDER',customerId:c.id,documentDate:'2026-11-06',lines:[{productId:p.id,unitId:p.baseUnitId,quantity:1,unitPrice:100,priceBasis:'Exclusive'}]}});
 const approved=cmd('managedSalesDocuments','approve',draft.id,draft.revision);
 cmd('customers','update',c.id,customerValues(c,{creditHold:true}));
 const before=raw().sales.salesOrders.length;
 expect(()=>cmd('managedSalesDocuments','post',approved.id,approved.revision)).toThrow(/Credit On Hold/);expect(raw().sales.salesOrders).toHaveLength(before);
});

it('also treats the Credit On Hold status as an order hold without the separate switch',()=>{
 const c=raw().customers.customers[0],p=raw().products.products[0];
 const quote=cmd('sales','createQuote',{customerId:c.id,documentDate:'2026-11-06',lines:[{productId:p.id,unitId:p.baseUnitId,quantity:1}]});
 cmd('sales','sendQuote',quote.id);cmd('sales','acceptQuote',quote.id);
 cmd('customers','update',c.id,customerValues(c,{status:'ON_HOLD',creditHold:false}));
 expect(()=>cmd('sales','convertQuoteToOrder',quote.id)).toThrow(/Credit On Hold/);
});
