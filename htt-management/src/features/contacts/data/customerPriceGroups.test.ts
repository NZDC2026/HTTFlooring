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
it('resolves A/B/C prices, restricts retailer tiers and persists prices and customer choice',async()=>{
 const c=raw().customers.customers[0],p=raw().products.products[0];
 cmd('products','save',{...p,units:p.units.map((u:any)=>({...u,basePrice:50,tradePrice:60,publicPrice:70,vipPrice:40,vvipPrice:35,containerPrice:30}))},p.revision??0);
 const make=(type:string)=>cmd('customers','create',customerValues(c,{businessName:'Synthetic '+type,businessType:type,creditHold:false,status:'ACTIVE',contacts:[],locations:[]}));
 const a=make('Flooring Retailer'),b=make('Builder'),end=make('End Customer');
 const quote=(id:string)=>cmd('sales','createQuote',{customerId:id,documentDate:'2026-11-06',lines:[{productId:p.id,unitId:p.baseUnitId,quantity:1}]});
 expect(quote(a.id).lines[0].unitPrice).toBe(50);expect(quote(b.id).lines[0].unitPrice).toBe(60);expect(quote(end.id).lines[0].unitPrice).toBe(70);
 for(const [tier,price] of [['VIP',40],['VVIP',35],['CONTAINER',30]] as const){cmd('customers','setPricingTier',a.id,tier);expect(quote(a.id).lines[0].unitPrice).toBe(price);}
 expect(()=>cmd('customers','setPricingTier',b.id,'VIP')).toThrow(/only available/);expect(()=>cmd('customers','setPricingTier',end.id,'CONTAINER')).toThrow(/only available/);
 const {BusinessHost}=await import('../../../../electron/security/businessHost');host=new BusinessHost(join(root,'business.json'),security);await host.initialize();
 expect(quote(a.id).lines[0].unitPrice).toBe(30);expect(quote(end.id).lines[0].unitPrice).toBe(70);
 cmd('customers','update',a.id,customerValues(a,{businessType:'Architect'}));expect(quote(a.id).lines[0].unitPrice).toBe(60);
});
it('fixed customer prices override the group tier and previously saved quotes keep their snapshot',()=>{
 const c=raw().customers.customers[0],p=raw().products.products[0];
 const old=cmd('sales','createQuote',{customerId:c.id,documentDate:'2026-11-06',lines:[{productId:p.id,unitId:p.baseUnitId,quantity:1}]});
 cmd('products','save',{...p,units:p.units.map((u:any)=>({...u,basePrice:50,tradePrice:60,publicPrice:70,vipPrice:40}))},p.revision??0);
 cmd('customers','setPricingTier',c.id,'VIP');
 const current=cmd('sales','createQuote',{customerId:c.id,documentDate:'2026-11-06',lines:[{productId:p.id,unitId:p.baseUnitId,quantity:1}]});
 expect(current.lines[0].unitPrice).toBe(62.5);expect(current.lines[0].priceSource).toBe('CUSTOMER_PRICE');
 expect(raw().sales.quotes.find((q:any)=>q.id===old.id).lines[0].unitPrice).toBe(old.lines[0].unitPrice);
});

it('does not invent an unset VIP price and accepts an explicit zero price',()=>{
 const c=raw().customers.customers[1],p=raw().products.products[0];
 cmd('customers','update',c.id,customerValues(c,{businessType:'Flooring Retailer'}));cmd('customers','setPricingTier',c.id,'VIP');
 const count=raw().sales.quotes.length;
 expect(()=>cmd('sales','createQuote',{customerId:c.id,documentDate:'2026-11-06',lines:[{productId:p.id,unitId:p.baseUnitId,quantity:1}]})).toThrow(/not been configured/);
 expect(raw().sales.quotes).toHaveLength(count);
 cmd('products','save',{...p,units:p.units.map((u:any)=>({...u,vipPrice:0}))},p.revision??0);
 expect(cmd('sales','createQuote',{customerId:c.id,documentDate:'2026-11-06',lines:[{productId:p.id,unitId:p.baseUnitId,quantity:1}]}).lines[0].unitPrice).toBe(0);
});
