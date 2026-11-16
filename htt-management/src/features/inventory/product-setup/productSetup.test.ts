import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildNewProduct, generateProductSku, newProductForm, productPhotoSchema, productFormPrices } from './productSetup';
const photo={id:'test-photo',kind:'installed' as const,name:'Synthetic installed.png',mime:'image/png' as const,data:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jD1sAAAAASUVORK5CYII='};
describe('new product form',()=>{
 it('keeps packaging independent of dimensions and stores prices per selling unit',()=>{
  const p=buildNewProduct(newProductForm(true),true,'synthetic-product');
  expect(p.status).toBe('INACTIVE');expect(p.setup?.lifecycle).toBe('DRAFT');expect(p.reorderPoint).toBe(70.28);expect(p.targetStock).toBe(210.84);
  expect(p.units[1].conversionToBase).toBe(1.757);expect(p.units[1].basePrice).toBe(87.6743);expect(p.units[0].tradePrice).toBe(54.9);expect(p.units[0].vipPrice).toBe(46.9);
  expect(p.description).not.toContain('25');expect(p.setup?.warrantyYears).toBe(25);expect(p.setup?.prices.vvip.installer).toBe(49.5);
  expect(buildNewProduct(newProductForm(true),false).referenceCostPrice).toBeUndefined();
 });
 it('rejects incomplete dimensions, invalid thresholds, negative prices and invalid photos',()=>{
  for(const patch of [{coverage:'0'},{length:''},{restock:'10'},{sku:' '},{prices:{...newProductForm(true).prices,normal:{store:'-1',installer:'',customer:''}}}])expect(()=>buildNewProduct({...newProductForm(true),...patch})).toThrow();
  expect(productPhotoSchema.parse(photo)).toEqual(photo);
  expect(()=>productPhotoSchema.parse({...photo,data:btoa('<svg onload="alert(1)">')})).toThrow();
  expect(()=>productPhotoSchema.parse({...photo,mime:'image/jpeg'})).toThrow();
  expect(()=>buildNewProduct({...newProductForm(true),photos:[photo,{...photo}]})).toThrow();
 });
 it('uses one level discount against each own Normal price and follows Normal changes',()=>{
  const f={...newProductForm(true),pricingMode:'DISCOUNT' as const};
  const prices=productFormPrices(f);
  expect(prices.vip).toEqual({store:'46.91',installer:'51.61',customer:'63.83'});
  expect(prices.vvip).toEqual({store:'44.41',installer:'48.86',customer:'60.43'});
  expect(prices.container).toEqual({store:'38.92',installer:'42.82',customer:'52.96'});
  f.prices.normal.installer='60';expect(productFormPrices(f).vip.installer).toBe('56.40');
  f.prices.normal.customer='';expect(productFormPrices(f).vip.customer).toBe('46.91');
  f.levelDiscounts.vip='100';expect(productFormPrices(f).vip.store).toBe('0.00');
  f.levelDiscounts.vip='101';expect(()=>buildNewProduct(f)).toThrow(/discounts/);
 });
 it('persists calculated prices, per-level discounts and the margin cost preference',()=>{
  const p=buildNewProduct({...newProductForm(true),pricingMode:'DISCOUNT'});
  expect(p.setup?.marginCostSource).toBe('AVERAGE');expect(p.setup?.pricingMode).toBe('DISCOUNT');expect(p.setup?.levelDiscounts).toEqual({vip:6,vvip:11,container:22});
  expect(p.units[0].vipPrice).toBe(46.91);expect(p.units[1].vipPrice).toBeCloseTo(46.91*1.757,6);
  expect(p.referenceCostPrice).toBeUndefined();
 });
 it('generates a unique SKU without altering the entered name',()=>{
  const f=newProductForm(true),sku=generateProductSku(f,[]);expect(generateProductSku(f,[sku.toLowerCase()])).toBe(`${sku}-2`);expect(f.name).toBe('Bonita Natural Oak Hybrid');
 });
});

describe('trusted new-product workflow',()=>{
 let root:string,host:InstanceType<typeof import('../../../../electron/security/businessHost').BusinessHost>,security:InstanceType<typeof import('../../../../electron/security/localSecurity').LocalSecurity>;
 const admin={username:'setup.admin',displayName:'Synthetic Product Admin',password:'Product-test-password-4821'};
 const cmd=(repository:string,method:string,...args:unknown[])=>host.command({repository,method,args}).result as any;
 const raw=()=>host.exportBackup().repositories as any;
 beforeEach(async()=>{vi.resetModules();vi.stubGlobal('__HTT_MAIN_HOST__',true);vi.stubGlobal('window',undefined);vi.stubGlobal('localStorage',undefined);root=mkdtempSync(join(tmpdir(),'htt-new-product-'));const {LocalSecurity}=await import('../../../../electron/security/localSecurity'),{BusinessHost}=await import('../../../../electron/security/businessHost');security=new LocalSecurity(join(root,'security.json'));security.setup(admin);host=new BusinessHost(join(root,'business.json'),security);await host.initialize();});
 afterEach(()=>{vi.unstubAllGlobals();rmSync(root,{recursive:true,force:true});});
 it('persists a draft, photo groups and specifications without changing stock or ledgers; detects duplicate SKUs',async()=>{
  const before=raw(),p=buildNewProduct({...newProductForm(true),photos:[photo]});const saved=cmd('products','save',p);
  expect(saved.setup.photos[0]).toEqual(photo);expect(raw().stock).toEqual(before.stock);expect(raw().costMovements).toEqual(before.costMovements);expect(raw().journals).toEqual(before.journals);
  expect(()=>cmd('products','save',{...p,id:'different',sku:p.sku.toLowerCase()})).toThrow(/Duplicate/);
  const {BusinessHost}=await import('../../../../electron/security/businessHost');host=new BusinessHost(join(root,'business.json'),security);await host.initialize();
  expect(raw().products.products.find((v:any)=>v.id===p.id).setup.photos).toEqual([photo]);
  const persisted=raw().products.products.find((v:any)=>v.id===p.id);expect(cmd('products','save',{...persisted,status:'ACTIVE'},persisted.revision).setup.lifecycle).toBe('ACTIVE');
  const active=raw().products.products.find((v:any)=>v.id===p.id);cmd('products','save',{...active,status:'INACTIVE'},active.revision);
  const c=raw().customers.customers[0];expect(()=>cmd('sales','createQuote',{customerId:c.id,documentDate:'2026-11-16',lines:[{productId:p.id,unitId:p.baseUnitId,quantity:1}]})).toThrow(/inactive/);
 });
 it('uses new prices in real quotes, enforces floor approval and retains existing role restrictions',()=>{
  const p=cmd('products','save',buildNewProduct({...newProductForm(true),status:'ACTIVE',pricingMode:'DISCOUNT',photos:[photo]}));
  const customer=cmd('customers','create',{tradingName:'',abn:'',email:'',phone:'',website:'',businessName:'Synthetic New Product Retailer',businessType:'Flooring Retailer',status:'ACTIVE',creditLimit:10000,paymentTermsDays:30,paymentTermsType:'DAYS',contacts:[],locations:[]});
  const quote=(unitId=p.baseUnitId,unitPrice?:number)=>cmd('sales','createQuote',{customerId:customer.id,documentDate:'2026-11-16',lines:[{productId:p.id,unitId,quantity:1,...(unitPrice===undefined?{}:{unitPrice})}]});
  expect(quote().lines[0].unitPrice).toBe(49.9);cmd('customers','setPricingTier',customer.id,'VIP');expect(quote().lines[0].unitPrice).toBe(46.91);expect(quote(p.measureUnitId).lines[0].unitPrice).toBeCloseTo(46.91*1.757,6);
  cmd('customers','setPricingTier',customer.id,'STANDARD');
  security.createUser({username:'setup.sales',displayName:'Synthetic Sales',password:'Product-sales-password-4821',roles:['SALES']});security.createUser({username:'setup.warehouse',displayName:'Synthetic Warehouse',password:'Product-warehouse-password-4821',roles:['WAREHOUSE']});
  security.logout();security.login({username:'setup.sales',password:'Product-sales-password-4821'});
  expect(()=>cmd('products','save',buildNewProduct({...newProductForm(true),sku:'SALES-DENIED'}))).toThrow(/inventory.adjust/);
  expect(()=>quote(p.baseUnitId,35)).toThrow(/promotions.margin/);expect(()=>quote(p.measureUnitId,36*1.757-.01)).toThrow(/promotions.margin/);expect(quote(p.baseUnitId,36).lines[0].unitPrice).toBe(36);
  security.logout();security.login({username:'setup.warehouse',password:'Product-warehouse-password-4821'});
  expect(()=>cmd('products','save',buildNewProduct({...newProductForm(true),sku:'COST-DENIED',cost:'28.50'}))).toThrow(/inventory.cost.read/);
  expect(cmd('products','save',buildNewProduct({...newProductForm(true),sku:'WAREHOUSE-DRAFT'},false)).referenceCostPrice).toBeUndefined();
  security.logout();security.login(admin);expect(quote(p.baseUnitId,35).lines[0].unitPrice).toBe(35);
 });
});
