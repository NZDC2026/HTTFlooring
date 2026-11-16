import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {applyProductPrices,priceUpdateSchema,priceValue,samplePriceProducts} from './priceUpdateModel';
describe('price preview model',()=>{
 it('changes only selected cells, converts selling units and retains unrelated prices',()=>{
  const p=samplePriceProducts()[0],next=applyProductPrices(p,[{cell:'normal.store',value:60},{cell:'vip.installer',value:48}], 'actor','operation','signature','2026-11-16T00:00:00Z');
  expect(next.units[0].basePrice).toBe(60);expect(next.units[1].basePrice).toBe(144);expect(next.units[1].tradePrice).toBeUndefined();expect(next.units[0].tradePrice).toBe(54.9);expect(priceValue(next,'vip.installer')).toBe(48);expect(next.priceHistory?.[0].changes).toHaveLength(2);
  expect(p.priceHistory).toBeUndefined();expect(p.units[0].basePrice).toBe(49.9);
 });
 it('accepts explicit zero, treats no-ops as unchanged and rejects invalid values',()=>{
  const p=samplePriceProducts()[0];expect(applyProductPrices(p,[{cell:'normal.store',value:49.9}],'a','o','s','t')).toBe(p);
  expect(priceValue(applyProductPrices(p,[{cell:'normal.store',value:0}],'a','o','s','t'),'normal.store')).toBe(0);
  for(const v of [-1,NaN,Infinity,1e10])expect(()=>priceUpdateSchema.parse({operationId:'o',products:[{id:'p',expectedRevision:0,prices:[{cell:'normal.store',value:v}]}]})).toThrow();
 });
});
describe('trusted atomic price updates',()=>{
 let root:string,host:InstanceType<typeof import('../../../../electron/security/businessHost').BusinessHost>,security:InstanceType<typeof import('../../../../electron/security/localSecurity').LocalSecurity>;
 const admin={username:'prices.admin',displayName:'Synthetic Pricing Admin',password:'Price-test-password-4821'};
 const cmd=(repository:string,method:string,...args:unknown[])=>host.command({repository,method,args}).result as any;
 const raw=()=>host.exportBackup().repositories as any;
 beforeEach(async()=>{vi.resetModules();vi.stubGlobal('__HTT_MAIN_HOST__',true);vi.stubGlobal('window',undefined);vi.stubGlobal('localStorage',undefined);root=mkdtempSync(join(tmpdir(),'htt-price-update-'));const {LocalSecurity}=await import('../../../../electron/security/localSecurity'),{BusinessHost}=await import('../../../../electron/security/businessHost');security=new LocalSecurity(join(root,'security.json'));security.setup(admin);host=new BusinessHost(join(root,'business.json'),security);await host.initialize();});
 afterEach(()=>{vi.unstubAllGlobals();rmSync(root,{recursive:true,force:true});});
 it('updates a batch atomically, records history, preserves stock and customer prices, and is idempotent after reload',async()=>{
  const products=samplePriceProducts().slice(0,2).map(p=>cmd('products','save',p)),before=raw();
  const input={operationId:crypto.randomUUID(),products:products.map((p:any)=>({id:p.id,expectedRevision:p.revision,prices:[{cell:'normal.store',value:60},{cell:'floor',value:35}]}))};
  expect(cmd('products','updatePrices',input)).toEqual({products:2,prices:4});
  for(const p of products){const saved=raw().products.products.find((r:any)=>r.id===p.id);expect(saved.priceHistory[0].actorId).toBe(security.principal()!.userId);expect(Date.parse(saved.priceHistory[0].at)).toBeGreaterThan(0);expect(saved.units[1].basePrice).toBe(144);expect(saved.units[1].tradePrice).toBeUndefined();expect(saved.priceFloor).toBe(35);}
  expect(raw().stock).toEqual(before.stock);expect(raw().journals).toEqual(before.journals);expect(raw().costMovements).toEqual(before.costMovements);expect(raw().customerPrices).toEqual(before.customerPrices);
  const after=raw().products;expect(cmd('products','updatePrices',input)).toEqual({products:2,prices:4});expect(raw().products).toEqual(after);
  const {BusinessHost}=await import('../../../../electron/security/businessHost');host=new BusinessHost(join(root,'business.json'),security);await host.initialize();expect(cmd('products','updatePrices',input)).toEqual({products:2,prices:4});expect(raw().products).toEqual(after);
  expect(()=>cmd('products','updatePrices',{...input,products:[{...input.products[0],prices:[{cell:'normal.store',value:61}]}]})).toThrow(/already been used/);
 });
 it('rejects stale, missing and duplicate products without partial updates',()=>{
  const [a,b]=samplePriceProducts().slice(0,2).map(p=>cmd('products','save',p));const before=raw().products;
  const row=(p:any)=>({id:p.id,expectedRevision:p.revision,prices:[{cell:'normal.store',value:70}]});
  for(const products of [[row(a),{...row(b),expectedRevision:0}],[row(a),{...row(b),id:'missing'}],[row(a),row(a)]]){expect(()=>cmd('products','updatePrices',{operationId:crypto.randomUUID(),products})).toThrow();expect(raw().products).toEqual(before);}
  expect(()=>cmd('products','save',{...a,priceHistory:[{operationId:'fake',actorId:'fake',at:'now',signature:'fake',changes:[{cell:'floor',after:1}]}]},a.revision)).toThrow(/history/);
 });
 it('keeps old quotes fixed, uses new catalogue prices and applies the new floor with existing permissions',()=>{
  const p=cmd('products','save',samplePriceProducts()[0]);const c=cmd('customers','create',{tradingName:'',abn:'',email:'',phone:'',website:'',businessName:'Synthetic Price Customer',businessType:'Flooring Retailer',status:'ACTIVE',creditLimit:10000,paymentTermsDays:30,paymentTermsType:'DAYS',contacts:[],locations:[]});
  const quote=(price?:number)=>cmd('sales','createQuote',{customerId:c.id,documentDate:'2026-11-16',lines:[{productId:p.id,unitId:p.baseUnitId,quantity:1,...(price===undefined?{}:{unitPrice:price})}]});
  const old=quote();cmd('products','updatePrices',{operationId:crypto.randomUUID(),products:[{id:p.id,expectedRevision:p.revision,prices:[{cell:'normal.store',value:60},{cell:'floor',value:35}]}]});expect(quote().lines[0].unitPrice).toBe(60);expect(raw().sales.quotes.find((q:any)=>q.id===old.id).lines[0].unitPrice).toBe(49.9);
  security.createUser({username:'prices.sales',displayName:'Synthetic Sales',password:'Price-sales-password-4821',roles:['SALES']});security.logout();security.login({username:'prices.sales',password:'Price-sales-password-4821'});
  expect(()=>cmd('products','updatePrices',{operationId:crypto.randomUUID(),products:[{id:p.id,expectedRevision:2,prices:[{cell:'normal.store',value:70}]}]})).toThrow(/inventory.adjust/);
  expect(()=>quote(34)).toThrow(/promotions.margin/);expect(quote(35).lines[0].unitPrice).toBe(35);
 });
});
