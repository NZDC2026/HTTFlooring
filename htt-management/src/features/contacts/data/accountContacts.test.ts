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


const contact=(i:number)=>({id:'contact-'+i,firstName:'Sample Person '+i,lastName:'',phone:'0400 123 456',mobile:'0400 123 456',email:'person'+i+'@example.com',isPrimary:i===0,isAccounting:i===1});
function values(s:any){return {businessName:s.businessName,tradingName:s.tradingName??'',abn:s.abn??'',status:s.status,email:s.email??'',phone:s.phone??'',website:s.website??'',contactName:s.contactName??'',addressLine1:s.addressLine1??'',addressLine2:s.addressLine2??'',suburb:s.suburb??'',state:s.state??'',postcode:s.postcode??'',country:s.country,currency:s.currency,paymentTermsDays:s.paymentTermsDays,paymentTermsType:s.paymentTermsType??'DAYS',taxRegistered:s.taxRegistered,notes:s.notes??''};}
it('saves many supplier contacts, keeps landline separate and preserves contacts on legacy updates',async()=>{
 const supplier=raw().suppliers.suppliers[0],contacts=Array.from({length:30},(_,i)=>contact(i));
 const input={...values(supplier),phone:'03 9000 2100',website:'https://example.com',contacts};
 const updated=cmd('suppliers','update',supplier.id,input);
 expect(updated.contacts).toHaveLength(30);expect(updated.phone).toBe('03 9000 2100');expect(updated.contactName).toBe('Sample Person 0');
 cmd('suppliers','update',supplier.id,{...values(updated),status:'INACTIVE'});
 const {BusinessHost}=await import('../../../../electron/security/businessHost');host=new BusinessHost(join(root,'business.json'),security);await host.initialize();
 const saved=raw().suppliers.suppliers.find((s:any)=>s.id===supplier.id);expect(saved.contacts[1].isAccounting).toBe(true);expect(saved.contacts).toHaveLength(30);
 expect(()=>cmd('suppliers','update',supplier.id,{...values(saved),contacts:[{...contact(0),email:'invalid-email'}]})).toThrow();
 expect(raw().suppliers.suppliers.find((s:any)=>s.id===supplier.id).contacts).toHaveLength(30);
});
it('saves customer contacts and primary ID together without erasing them on old-style edits',async()=>{
 const c=raw().customers.customers[0];const data={businessName:c.businessName,tradingName:c.tradingName??'',abn:c.abn??'',businessType:c.businessType,status:c.status,email:c.email??'',phone:'03 9111 2222',website:'https://example.com',creditLimit:c.creditLimit,paymentTermsDays:c.paymentTermsDays,paymentTermsType:c.paymentTermsType??'DAYS'};
 const result=cmd('customers','update',c.id,{...data,contacts:[contact(0),contact(1),contact(2)]});
 expect(result.primaryContactId).toBe('contact-0');expect(result.contacts[1].isAccounting).toBe(true);
 cmd('customers','update',c.id,{...data,businessName:'Updated business'});
 const {BusinessHost}=await import('../../../../electron/security/businessHost');host=new BusinessHost(join(root,'business.json'),security);await host.initialize();
 expect(raw().customers.customers.find((x:any)=>x.id===c.id).contacts).toHaveLength(3);
 expect(()=>cmd('customers','update',c.id,{...data,contacts:[contact(0),{...contact(1),isPrimary:true}]})).toThrow();
});
it('creates customer and supplier accounts with multiple contacts immediately',()=>{
 const supplier=raw().suppliers.suppliers[0];
 const created=cmd('suppliers','create',{...values(supplier),businessName:'Multi contact supplier',currency:'AUD',contacts:[contact(0),contact(1)]});
 expect(created.contacts).toHaveLength(2);expect(created.contactName).toBe('Sample Person 0');
 const customer=cmd('customers','create',{businessName:'Multi contact customer',tradingName:'',abn:'',businessType:'Other',status:'ACTIVE',email:'',phone:'03 9000 1122',website:'https://example.com',creditLimit:1000,paymentTermsDays:30,paymentTermsType:'DAYS',contacts:[contact(0),contact(1)]});
 expect(customer.contacts).toHaveLength(2);expect(customer.primaryContactId).toBe('contact-0');
});
