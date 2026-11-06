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



const address=(id:string,isPrimary=false)=>({id,name:'Store '+id,addressLine1:id==='geo'?'8 Demo Avenue':'22 Sample Road',addressLine2:'',suburb:id==='geo'?'Geelong':'Richmond',state:'VIC',postcode:id==='geo'?'3220':'3121',country:'Australia',phone:'03 9000 2100',isPrimary});
const input=()=>({businessName:'Multiple store customer',tradingName:'',abn:'',businessType:'Other',status:'ACTIVE',email:'accounts@example.com',phone:'03 9000 2100',website:'',creditLimit:50000,paymentTermsDays:30,paymentTermsType:'DAYS'});
it('creates billing and multiple delivery addresses with a default used in new document snapshots',async()=>{
 const billing={addressLine1:'10 Example Street',addressLine2:'',suburb:'Richmond',state:'VIC',postcode:'3121',country:'Australia'};
 const customer=cmd('customers','create',{...input(),billingAddress:billing,locations:[address('rich'),address('geo',true)]});
 expect(customer.primaryLocationId).toBe('geo');expect(customer.locations).toHaveLength(2);expect(customer.billingAddress.addressLine1).toBe('10 Example Street');
 const product=raw().products.products[0];const quoteInput={customerId:customer.id,documentDate:'2026-11-06',lines:[{productId:product.id,unitId:product.baseUnitId,quantity:1}]};
 const quote=cmd('sales','createQuote',quoteInput);expect(quote.recipient.locationId).toBe('geo');expect(quote.recipient.billingAddress).toContain('10 Example Street');expect(quote.recipient.deliveryAddress).toContain('8 Demo Avenue');
 const alternate=cmd('sales','createQuote',{...quoteInput,locationId:'rich'});expect(alternate.recipient.deliveryAddress).toContain('22 Sample Road');
 cmd('customers','update',customer.id,{...input(),billingAddress:{...billing,addressLine1:'99 Updated Street'},locations:[address('rich',true),address('geo')]});
 expect(raw().sales.quotes.find((q:any)=>q.id===quote.id).recipient.billingAddress).toContain('10 Example Street');
 const {BusinessHost}=await import('../../../../electron/security/businessHost');host=new BusinessHost(join(root,'business.json'),security);await host.initialize();
 const saved=raw().customers.customers.find((c:any)=>c.id===customer.id);expect(saved.primaryLocationId).toBe('rich');expect(saved.billingAddress.addressLine1).toBe('99 Updated Street');
 cmd('customers','update',customer.id,input());expect(raw().customers.customers.find((c:any)=>c.id===customer.id).locations).toHaveLength(2);
});
it('rejects multiple defaults or incomplete addresses and permits blank optional billing details',()=>{
 expect(()=>cmd('customers','create',{...input(),locations:[address('rich',true),address('geo',true)]})).toThrow();
 expect(()=>cmd('customers','create',{...input(),locations:[{...address('rich'),suburb:''}]})).toThrow();
 expect(()=>cmd('customers','create',{...input(),billingAddress:{addressLine1:'10 Example Street',suburb:'',state:'',postcode:'',country:''}})).toThrow();
 const c=cmd('customers','create',{...input(),billingAddress:{addressLine1:'',suburb:'',state:'',postcode:'',country:''},locations:[address('rich'),address('geo')]});expect(c.billingAddress).toBeUndefined();expect(c.primaryLocationId).toBe('rich');
});
