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




function setupBrand(){
 const products=raw().products.products.slice(0,2),c=raw().customers.customers[0];
 for(const p of products)cmd('products','save',{...p,brand:'MTF Brand Test'},p.revision??0);
 return {products,c};
}
async function preview(c:any,from='2026-11-01',to='2026-11-30'){
 const {brandPricePreview}=await import('./brandCustomerPricing');
 return brandPricePreview(raw().products.products,raw().customerPrices.customerPrices,c.id,{brand:'MTF Brand Test',unitCode:'M2',effectiveFrom:from,effectiveTo:to});
}
const apply=(c:any,signature:string,replaceExisting=false)=>cmd('customerPrices','applyBrandPrice',c.id,{brand:'MTF Brand Test',unitCode:'M2',price:20,effectiveFrom:'2026-11-01',effectiveTo:'2026-11-30',replaceExisting,expectedSignature:signature});
it('bulk applies only the selected brand and unit to the current customer while preserving existing specials',async()=>{
 const {c,products}=setupBrand(),before=raw().customerPrices.customerPrices,plan=await preview(c);
 expect(plan.rows).toHaveLength(2);expect(apply(c,plan.signature)).toEqual({applied:1,skipped:1});
 const after=raw().customerPrices.customerPrices;
 expect(after.filter((r:any)=>r.customerId!==c.id)).toEqual(before.filter((r:any)=>r.customerId!==c.id));
 const quote=cmd('sales','createQuote',{customerId:c.id,documentDate:'2026-11-06',lines:products.map((p:any)=>({productId:p.id,unitId:p.baseUnitId,quantity:1}))});
 expect(quote.lines.map((l:any)=>l.unitPrice)).toEqual([62.5,20]);
 const boxes=after.filter((r:any)=>r.unitId===products[1].units[1].id);expect(boxes).toEqual(before.filter((r:any)=>r.unitId===products[1].units[1].id));
});
it('replacement splits existing price dates and survives restart without repricing old documents',async()=>{
 const {c,products}=setupBrand();const quote=(date:string)=>cmd('sales','createQuote',{customerId:c.id,documentDate:date,lines:[{productId:products[0].id,unitId:products[0].baseUnitId,quantity:1}]});
 const old=quote('2026-11-06'),plan=await preview(c);expect(apply(c,plan.signature,true).applied).toBe(2);
 expect(quote('2026-10-31').lines[0].unitPrice).toBe(62.5);expect(quote('2026-11-01').lines[0].unitPrice).toBe(20);expect(quote('2026-11-30').lines[0].unitPrice).toBe(20);expect(quote('2026-12-01').lines[0].unitPrice).toBe(62.5);
 expect(raw().sales.quotes.find((r:any)=>r.id===old.id).lines[0].unitPrice).toBe(62.5);
 const {BusinessHost}=await import('../../../../electron/security/businessHost');host=new BusinessHost(join(root,'business.json'),security);await host.initialize();expect(quote('2026-11-15').lines[0].unitPrice).toBe(20);
});
it('rejects a stale preview and invalid dates or prices without partial changes',async()=>{
 const {c}=setupBrand(),plan=await preview(c);apply(c,plan.signature);
 const before=JSON.stringify(raw().customerPrices);
 expect(()=>apply(c,plan.signature,true)).toThrow(/changed/);expect(JSON.stringify(raw().customerPrices)).toBe(before);
 const fresh=await preview(c);
 expect(()=>cmd('customerPrices','applyBrandPrice',c.id,{brand:'MTF Brand Test',unitCode:'M2',price:-1,effectiveFrom:'2026-11-01',effectiveTo:'2026-11-30',replaceExisting:true,expectedSignature:fresh.signature})).toThrow();
 expect(()=>cmd('customerPrices','applyBrandPrice',c.id,{brand:'MTF Brand Test',unitCode:'M2',price:20,effectiveFrom:'2026-02-30',effectiveTo:'',replaceExisting:true,expectedSignature:fresh.signature})).toThrow();
 expect(JSON.stringify(raw().customerPrices)).toBe(before);
});
