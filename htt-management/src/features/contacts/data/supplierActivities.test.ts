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

const supplier=()=>raw().suppliers.suppliers[0];
const request=(patch:any={})=>({supplierId:supplier().id,operationId:crypto.randomUUID(),kind:'Task',text:'Confirm vessel ETA with agency',due:'2026-11-10',...patch});
it('records trusted authors, replies and completion durably with retry protection',async()=>{
 const input=request(),a=cmd('suppliers','addActivity',input);
 expect(a.actorId).toBe(security.principal()?.userId);
 expect(cmd('suppliers','addActivity',input).id).toBe(a.id);
 const reply={supplierId:supplier().id,activityId:a.id,operationId:crypto.randomUUID(),action:'reply',text:'Agency confirmed revised arrival'};
 cmd('suppliers','activityAction',reply);cmd('suppliers','activityAction',reply);
 cmd('suppliers','activityAction',{...reply,operationId:crypto.randomUUID(),action:'complete',text:'Handled'});
 expect(supplier().activities[0].replies).toHaveLength(1);
 expect(supplier().activities[0].completion.actorId).toBe(a.actorId);
 expect(()=>cmd('suppliers','activityAction',{...reply,operationId:crypto.randomUUID()})).toThrow(/already completed/);
 const {BusinessHost}=await import('../../../../electron/security/businessHost');host=new BusinessHost(join(root,'business.json'),security);await host.initialize();
 expect(supplier().activities[0].completion.text).toBe('Handled');
});
it('requires task due dates, rejects forged actors, and denies auditor writes',()=>{
 expect(()=>cmd('suppliers','addActivity',request({due:undefined}))).toThrow();
 expect(()=>cmd('suppliers','addActivity',request({actorId:'forged'}))).toThrow();
 const a=cmd('suppliers','addActivity',request({kind:'Note',due:undefined}));
 expect(a.kind).toBe('Note');
 const deniedRequest=request();
 const u=security.createUser({username:'supplier.audit',displayName:'Supplier audit',password:admin.password,roles:['AUDITOR']});security.login({username:u.username,password:admin.password});
 expect(()=>cmd('suppliers','addActivity',deniedRequest)).toThrow(/Permission denied/);
 expect((host.view().repositories.suppliers as any).suppliers[0].activities).toHaveLength(1);
});
it('persists supplier order references and rejects documents from another supplier',async()=>{
 const order=(raw().purchaseOrders.purchaseOrders as any[])[0];
 if(!order)throw Error('Fixture requires a purchase order');
 const input=request({supplierId:order.supplierId,documentType:'Order',documentId:order.id});
 const saved=cmd('suppliers','addActivity',input);
 expect(saved.documentId).toBe(order.id);
 const other=raw().suppliers.suppliers.find((s:any)=>s.id!==order.supplierId);
 expect(()=>cmd('suppliers','addActivity',{...input,supplierId:other.id,operationId:crypto.randomUUID()})).toThrow(/belong/);
 const {BusinessHost}=await import('../../../../electron/security/businessHost');host=new BusinessHost(join(root,'business.json'),security);await host.initialize();
 expect(raw().suppliers.suppliers.find((s:any)=>s.id===order.supplierId).activities[0].documentId).toBe(order.id);
});
it('saves customer tasks linked to sales documents and rejects mismatched customer or type',async()=>{
 const sales=raw().sales,order=sales.salesOrders[0],invoice=sales.invoices[0];
 for(const [documentType,doc] of [['Order',order],['Invoice',invoice]] as const){
  if(!doc)throw Error('Fixture requires sales order and invoice');
  const input={name:'Document follow-up '+documentType,customerId:doc.customerId,owner:security.principal()!.userId,due:'2026-11-10',priority:'Normal',notes:'Confirm with customer',status:'Open',documentType,documentId:doc.id};
  const task=cmd('workspace_tasks','save',input);
  expect(task.documentId).toBe(doc.id);
  const other=raw().customers.customers.find((c:any)=>c.id!==doc.customerId);
  expect(()=>cmd('workspace_tasks','save',{...input,customerId:other.id})).toThrow(/belong/);
  expect(()=>cmd('workspace_tasks','save',{...input,documentType:documentType==='Order'?'Invoice':'Order'})).toThrow(/belong/);
 }
 const {BusinessHost}=await import('../../../../electron/security/businessHost');host=new BusinessHost(join(root,'business.json'),security);await host.initialize();
 expect(raw().workspace_tasks.records.filter((r:any)=>r.documentId)).toHaveLength(2);
});
