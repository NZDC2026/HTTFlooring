import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
let root: string, security: InstanceType<typeof import('../../../electron/security/localSecurity').LocalSecurity>, host: InstanceType<typeof import('../../../electron/security/businessHost').BusinessHost>;
const admin = { username: 'integration.admin', displayName: 'Integration admin', password: 'Integration-test-password-4821' };
async function restart() { vi.resetModules(); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.login(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); }
beforeEach(async () => { vi.resetModules(); vi.stubGlobal('__HTT_MAIN_HOST__', true); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined); root = mkdtempSync(join(tmpdir(), 'htt-business-integration-')); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.setup(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); rmSync(root, { recursive: true, force: true }); });
function command(repository: string, method: string, ...args: unknown[]) { return host.command({ repository, method, args }).result as any; }
function state(name: string) { return host.view().repositories[name] as any; }
describe('Procurement batches',()=>{
 it('persists linked orders and audit history without changing purchase or stock records',async()=>{
  const po=state('purchaseOrders').purchaseOrders[0];
  const before=JSON.stringify({orders:state('purchaseOrders'),stock:state('stock')});
  const batch=command('workspace_procurement','save',{name:'Oak shipment',status:'Open',links:JSON.stringify([{role:'Materials',orderId:po.id}]),notes:'Awaiting freight quotation',documents:JSON.stringify({materials:{container:'SAMPLE-CNTR'},freight:{masterBl:'MBL-123'},customs:{consignment:'CON-123'}})});
  expect(batch.code).toBe('PB-000001');
  expect(JSON.parse(batch.invoiceDrafts)).toHaveLength(3);
  const again=command('workspace_procurement','save',batch,batch.revision);expect(JSON.parse(again.invoiceDrafts).map((d:any)=>d.id)).toEqual(JSON.parse(batch.invoiceDrafts).map((d:any)=>d.id));batch.revision=again.revision;
  expect(()=>command('workspace_procurement','save',{...batch,status:'Completed'},batch.revision)).toThrow(/freight|customs|Link materials/i);
  expect(()=>command('workspace_procurement','save',{name:'Invalid',status:'Open',links:JSON.stringify([{role:'Materials',orderId:'missing'}])})).toThrow(/existing/i);
  expect(JSON.stringify({orders:state('purchaseOrders'),stock:state('stock')})).toBe(before);
  await restart();
  expect(state('workspace_procurement').records[0]).toMatchObject({code:'PB-000001',name:'Oak shipment'});
  expect(JSON.parse(state('workspace_procurement').records[0].documents).freight.masterBl).toBe('MBL-123');
  expect(state('workspace_procurement').history).toHaveLength(2);
 });
 it('requires approval, respects received-goods checks, and posts exactly one invoice on repeated requests',async()=>{
  const po=command('purchaseOrders','create',{supplierId:state('suppliers').suppliers[0].id,orderDate:'2026-11-01',lines:[{productId:state('products').products[0].id,unitId:state('products').products[0].baseUnitId,orderedQuantity:10,unitCost:20}]});
  command('purchaseOrders','approve',po.id);command('purchaseOrders','send',po.id);
  const raw={name:'Invoice draft test',status:'Open',links:JSON.stringify([{role:'Materials',orderId:po.id}]),documents:JSON.stringify({materials:{invoice:'PROC-DRAFT-101',invoiceDate:'2026-11-09',dueDate:'2026-12-09'},freight:{},customs:{}})};
  let batch=command('workspace_procurement','save',raw);const draft=JSON.parse(batch.invoiceDrafts)[0];
  expect(()=>command('workspace_procurement','reviewInvoice',batch.id,draft.id,'post',batch.revision)).toThrow(/approval/);
  const user=security.createUser({username:'proc.buyer',displayName:'Buyer',password:admin.password,roles:['PURCHASING']});security.login({username:user.username,password:admin.password});
  expect(()=>command('workspace_procurement','reviewInvoice',batch.id,draft.id,'approve',batch.revision)).toThrow(/Permission denied/);security.login(admin);
  batch=command('workspace_procurement','reviewInvoice',batch.id,draft.id,'approve',batch.revision);
  const before=JSON.stringify(state('supplierBills'));expect(()=>command('workspace_procurement','reviewInvoice',batch.id,draft.id,'post',batch.revision)).toThrow(/received goods/);expect(JSON.stringify(state('supplierBills'))).toBe(before);
  const {inventorySiteRepository}=await import('../inventory/data/inventorySiteRepository');command('goodsReceipts','create',{purchaseOrderId:po.id,siteId:inventorySiteRepository.getActive()[0].id,receiptDate:'2026-11-09',lines:[{purchaseOrderLineId:po.lines[0].id,receivedQuantity:10}]});
  batch=command('workspace_procurement','reviewInvoice',batch.id,draft.id,'post',batch.revision);expect(JSON.parse(batch.invoiceDrafts)[0].status).toBe('POSTED');
  command('workspace_procurement','reviewInvoice',batch.id,draft.id,'post',batch.revision);expect(state('supplierBills').supplierBills.filter((b:any)=>b.supplierInvoiceNumber==='PROC-DRAFT-101')).toHaveLength(1);
  const bill=state('supplierBills').supplierBills.find((b:any)=>b.supplierInvoiceNumber==='PROC-DRAFT-101');
  const reused=command('workspace_procurement','save',{name:'Reuse',status:'Open',links:JSON.stringify([{role:'Materials',orderId:'bill:'+bill.id}])});expect(JSON.parse(reused.invoiceDrafts).filter((d:any)=>d.role==='Materials')).toHaveLength(0);
 });
 it('creates exactly one draft per manually entered section, reuses existing invoices, and posts freight once',()=>{
  const supplierId=state('suppliers').suppliers[0].id;
  const documents=Object.fromEntries(['materials','freight','customs'].map((key,i)=>[key,{mode:'manual',invoice:'MANUAL-PROC-'+i,invoiceDate:'2026-11-09',dueDate:'2026-12-09',manual:JSON.stringify({supplierId,lines:[{description:key+' cost',quantity:2,unitSymbol:key==='materials'?'Box':'Charge',...(key==='materials'?{coveragePerUnit:2.166}:{}),unitCost:50,taxRate:.1}]})}]));
  const before=JSON.stringify({stock:state('stock'),bills:state('supplierBills'),journals:state('journals')});
  let batch=command('workspace_procurement','save',{name:'Three manual invoices',status:'Open',links:'[]',documents:JSON.stringify(documents)});
  expect(JSON.parse(batch.invoiceDrafts)).toHaveLength(3);expect(JSON.stringify({stock:state('stock'),bills:state('supplierBills'),journals:state('journals')})).toBe(before);
  const freight=JSON.parse(batch.invoiceDrafts).find((d:any)=>d.role==='Freight');
  batch=command('workspace_procurement','reviewInvoice',batch.id,freight.id,'approve',batch.revision);
  batch=command('workspace_procurement','reviewInvoice',batch.id,freight.id,'post',batch.revision);
  const billId=JSON.parse(batch.invoiceDrafts).find((d:any)=>d.id===freight.id).billId;
  expect(state('supplierBills').supplierBills.find((b:any)=>b.id===billId)).toMatchObject({supplierInvoiceNumber:'MANUAL-PROC-1',kind:'EXPENSE'});
  const mixedDocs={...documents,freight:{mode:'existing'}};
  const mixed=command('workspace_procurement','save',{name:'Mixed invoices',status:'Open',links:JSON.stringify([{role:'Freight',orderId:'bill:'+billId}]),documents:JSON.stringify(mixedDocs)});
  expect(JSON.parse(mixed.invoiceDrafts).map((d:any)=>d.role)).toEqual(['Materials','Customs Clearance']);
  const again=command('workspace_procurement','save',mixed,mixed.revision);expect(JSON.parse(again.invoiceDrafts).map((d:any)=>d.id)).toEqual(JSON.parse(mixed.invoiceDrafts).map((d:any)=>d.id));
 });
 it('migrates v35 without changing existing orders',async()=>{
  const original=state('purchaseOrders');
  const file=join(root,'business.json');const db=JSON.parse(readFileSync(file,'utf8'));
  db.schemaVersion=35;delete db.repositories.workspace_procurement;
  const {checksum,...body}=db;
  db.checksum=createHash('sha256').update(JSON.stringify(body)).digest('hex');
  writeFileSync(file,JSON.stringify(db));await restart();
  expect(state('workspace_procurement').records).toEqual([]);
  expect(state('purchaseOrders')).toEqual(original);
  expect(JSON.parse(readFileSync(file,'utf8')).schemaVersion).toBe(36);
 });
});
