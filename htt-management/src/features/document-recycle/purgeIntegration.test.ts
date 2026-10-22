import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
let root: string, security: InstanceType<typeof import('../../../electron/security/localSecurity').LocalSecurity>, host: InstanceType<typeof import('../../../electron/security/businessHost').BusinessHost>;
const admin = { username: 'documents.admin', displayName: 'Document acceptance', password: 'Documents-test-password-4821' };
async function restart() { vi.resetModules(); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.login(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); }
beforeEach(async () => { vi.resetModules(); vi.stubGlobal('__HTT_MAIN_HOST__', true); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined); root = mkdtempSync(join(tmpdir(), 'htt-purge-')); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.setup(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); rmSync(root, { recursive: true, force: true }); });
const cmd = (repository: string, method: string, ...args: unknown[]) => host.command({ repository, method, args }).result as any;
const state = (key: string) => host.view().repositories[key] as any;
function sales(kind: 'ORDER' | 'INVOICE' = 'INVOICE') { const product = state('products').products[0], customer = state('customers').customers[0]; return { kind, customerId: customer.id, documentDate: '2026-10-10', dueDate: '2026-11-10', customerReference: 'Direct example', lines: [{ productId: product.id, unitId: product.baseUnitId, quantity: 2, unitPrice: 100, priceBasis: 'Exclusive' as const }] }; }
function expense() { return { kind: 'EXPENSE' as const, supplierId: state('suppliers').suppliers[0].id, supplierInvoiceNumber: 'SERVICE-001', documentDate: '2026-10-10', dueDate: '2026-11-10', lines: [{ description: 'Installation service', accountId: state('accounts').accounts.find((a: any) => a.systemRole === 'OPERATING_EXPENSE').id, quantity: 2, unitCost: 55, taxCode: 'GST', priceBasis: 'Inclusive' as const }] }; }
async function role(name: 'SALES' | 'WAREHOUSE' | 'PURCHASING' | 'ACCOUNTANT' | 'FINANCE_ADMIN' | 'AUDITOR') { security.login(admin); const user = security.createUser({ username: 'documents.' + name.toLowerCase(), displayName: name, password: admin.password, roles: [name] }); security.login({ username: user.username, password: admin.password }); }
const list = () => cmd('documentRecycle', 'list') as any[];
const choice = (recordId: string) => { const r = list().find(r => r.recordId === recordId)!; return { kind: r.kind, recordId, token: r.token }; };
const change = (recordId: string, action = 'Trashed', patch = {}) => cmd('documentRecycle', 'change', { operationId: crypto.randomUUID(), action, reason: 'Reviewed duplicate draft', records: [choice(recordId)], ...patch });
function draft(kind: string) {
    if (kind === 'Quote')
        return cmd('sales', 'createQuote', { ...sales('ORDER'), kind: undefined });
    if (kind === 'Purchase order') {
        const p = state('products').products[0];
        return cmd('purchaseOrders', 'create', { supplierId: state('suppliers').suppliers[0].id, orderDate: '2026-10-10', lines: [{ productId: p.id, unitId: p.baseUnitId, orderedQuantity: 2, unitCost: 10 }] });
    }
    return cmd(kind === 'Expense bill draft' ? 'expenseBillDrafts' : 'managedSalesDocuments', 'save', { operationId: crypto.randomUUID(), payload: kind === 'Expense bill draft' ? expense() : sales(kind === 'Sales order draft' ? 'ORDER' : 'INVOICE') });
}
const preview=(ids:string[])=>cmd('documentRecycle','preparePurge',{records:ids.map(choice)});
const purgeInput=(p:any,patch={})=>({operationId:crypto.randomUUID(),records:p.rows.map(({kind,recordId,token}:any)=>({kind,recordId,token})),expectedDigest:p.digest,reason:'Verified obsolete duplicate draft',confirmation:p.confirmation,...patch});
const purge=(p:any,patch={})=>cmd('documentRecycle','purge',purgeInput(p,patch));
it.each(['Quote','Purchase order','Sales order draft','Invoice draft','Expense bill draft'])('permanently clears %s with a verified restorable backup and durable retry receipt',async kind=>{
 const row=draft(kind);change(row.id);const before=host.exportBackup(),p=preview([row.id]),input=purgeInput(p);
 expect(p.eligible).toBe(true);const result=cmd('documentRecycle','purge',input);
 expect(result[0].action).toBe('Purged');expect(list().some(r=>r.recordId===row.id)).toBe(false);
 expect(()=>cmd('documentRecycle','detail',kind,row.id)).toThrow(/not found/);
 const backup=result[0].purge.backup,text=readFileSync(join(root,'recycle-backups',backup.fileName),'utf8');
 expect(createHash('sha256').update(text).digest('hex')).toBe(backup.sha256);
 expect(JSON.parse(text).repositories).toEqual(before.repositories);
 expect(cmd('documentRecycle','purge',input)).toEqual(result);
 await restart();expect(cmd('documentRecycle','purge',input)).toEqual(result);
 expect(()=>cmd('documentRecycle','purge',{...input,reason:'Different purge request'})).toThrow(/different/);
 if(row.operationId) expect(()=>cmd(kind==='Expense bill draft'?'expenseBillDrafts':'managedSalesDocuments','save',{operationId:row.operationId,payload:row.payload})).toThrow(/purged/);
 const restore=host.prepareRestore(text);await host.restoreBackup(restore.token);
 await restart();expect(list().find(r=>r.recordId===row.id).deleted).toBe(true);
 expect(cmd('documentRecycle','detail',kind,row.id)).toEqual(row);
});
it('purges a five-dataset batch without changing accounting, inventory or other source documents',async()=>{
 const rows=['Quote','Purchase order','Sales order draft','Invoice draft','Expense bill draft'].map(draft);rows.forEach(r=>change(r.id));
 const before=host.exportBackup(),p=preview(rows.map(r=>r.id)),result=purge(p),after=host.exportBackup();
 expect(result).toHaveLength(5);expect(new Set(result.map((r:any)=>r.purge.backup.id)).size).toBe(1);
 for(const name of Object.keys(before.repositories).filter(n=>!['sales','purchaseOrders','managedSalesDocuments','expenseBillDrafts','documentRecycle','financialCache'].includes(n))) expect(after.repositories[name]).toEqual(before.repositories[name]);
 expect((after.repositories.financialCache as any).journals).toEqual((before.repositories.financialCache as any).journals);
 expect((after.repositories.financialCache as any).purchaseOrders.some((r:any)=>r.id===rows[1].id)).toBe(false);
 const nextQuote=draft('Quote'),nextPo=draft('Purchase order');
 expect(nextQuote.documentNumber).not.toBe(rows[0].documentNumber);expect(nextPo.purchaseOrderNumber).not.toBe(rows[1].purchaseOrderNumber);
 await restart();expect(list().some(r=>rows.some(old=>old.id===r.recordId))).toBe(false);
});
it.each(['SALES','WAREHOUSE','PURCHASING','ACCOUNTANT','FINANCE_ADMIN','AUDITOR'] as const)('denies permanent purge to %s including a finance administrator',async name=>{
 const row=draft('Quote');change(row.id);const p=preview([row.id]),input=purgeInput(p);await role(name);
 expect(()=>cmd('documentRecycle','preparePurge',{records:input.records})).toThrow(/Permission denied|ADMIN/);
 expect(()=>cmd('documentRecycle','purge',input)).toThrow(/Permission denied|ADMIN/);
 security.login(admin);expect(list().find(r=>r.recordId===row.id)).toBeDefined();
});
it('requires an exact confirmation, strict trusted fields, ten-character reason and a unique selection',()=>{
 const row=draft('Quote');change(row.id);const p=preview([row.id]);
 for(const patch of [{confirmation:'DELETE'},{reason:'short'},{actorId:'forged'},{backupPath:'/tmp/forged'}]) expect(()=>purge(p,patch)).toThrow();
 expect(()=>preview([row.id,row.id])).toThrow(/once/);
 expect(()=>cmd('documentRecycle','preparePurge',{records:[{...choice(row.id),kind:'Invoice draft'}]})).toThrow(/not found/);
 expect(list().find(r=>r.recordId===row.id)).toBeDefined();
});
it('requires trash and rejects stale lifecycle, content, unrelated changes and restarted previews',async()=>{
 const row=draft('Quote');expect(preview([row.id]).eligible).toBe(false);change(row.id);const p=preview([row.id]);
 change(row.id,'Recovered');change(row.id);expect(()=>purge(p)).toThrow(/changed/);
 const fresh=preview([row.id]);draft('Invoice draft');expect(()=>purge(fresh)).toThrow(/changed/);
 const restartPreview=preview([row.id]);await restart();expect(()=>purge(restartPreview)).toThrow(/preview/);
});
it('expires a prepared preview after five minutes',()=>{
 const row=draft('Quote');change(row.id);const p=preview([row.id]);const now=Date.now();vi.spyOn(Date,'now').mockReturnValue(now+300001);
 expect(()=>purge(p)).toThrow(/expired/);
});
it('blocks active, approved, posted and linked records from permanent purge',()=>{
 const q=draft('Quote'),po=draft('Purchase order'),d=draft('Invoice draft');cmd('sales','sendQuote',q.id);cmd('purchaseOrders','approve',po.id);const a=cmd('managedSalesDocuments','approve',d.id,d.revision);cmd('managedSalesDocuments','post',d.id,a.revision);
 for(const r of [q,po,d]) {const p=preview([r.id]);expect(p.eligible).toBe(false);expect(()=>purge(p)).toThrow();}
});
it('retains attachments and blocks the whole purge batch if any source has an attachment',()=>{
 const a=draft('Quote'),b=draft('Purchase order');
 cmd('attachments','upload',{operationId:'purge-attached',expectedRevision:0,target:{kind:'Quote',id:a.id},title:'Retained evidence',reason:'Verified source evidence',file:{name:'evidence.txt',content:Buffer.from('retain').toString('base64')}});
 change(a.id);change(b.id);const before=host.exportBackup(),p=preview([a.id,b.id]);expect(p.eligible).toBe(false);expect(p.rows[0].blockers.join(' ')).toMatch(/attachments/);expect(()=>purge(p)).toThrow(/attachments/);expect(host.exportBackup().repositories).toEqual(before.repositories);
});
it('blocks references encoded in operation journal JSON',async()=>{
 const row=draft('Invoice draft');change(row.id);
 const {financialOperationJournal}=await import('../../lib/persistence/financialOperationJournal');
 financialOperationJournal.begin('purge-linked-operation','CUSTOMER_PAYMENT',JSON.stringify({sourceDraftId:row.id}));
 const p=preview([row.id]);expect(p.eligible).toBe(false);expect(()=>purge(p)).toThrow(/journal/);
});
it('fails before removal when the backup destination cannot be created',()=>{
 const row=draft('Quote');change(row.id);const p=preview([row.id]),before=host.exportBackup();writeFileSync(join(root,'recycle-backups'),'blocked directory');
 expect(()=>purge(p)).toThrow();expect(host.exportBackup().repositories).toEqual(before.repositories);
});
it('rolls back every source and receipt when a later source mutation fails',async()=>{
 const a=draft('Quote'),b=draft('Purchase order');change(a.id);change(b.id);const p=preview([a.id,b.id]),before=host.exportBackup();
 const source=await import('../purchases/data/purchaseOrderRepository');vi.spyOn(source,'purgePurchaseOrderRecords').mockImplementation(()=>{throw new Error('Injected later-source failure');});
 expect(()=>purge(p)).toThrow(/Injected/);expect(host.exportBackup().repositories).toEqual(before.repositories);
 expect(readdirSync(join(root,'recycle-backups'))).toHaveLength(1);
 vi.restoreAllMocks();await restart();expect(list().filter(r=>r.recordId===a.id||r.recordId===b.id)).toHaveLength(2);
});
it('rejects corrupted purge receipts, source resurrection and identity reuse in restored snapshots',()=>{
 const row=draft('Quote');change(row.id);purge(preview([row.id]));const backup=host.exportBackup();
 const corruptions=[(b:any)=>b.repositories.sales.quotes.push(row),(b:any)=>delete b.repositories.documentRecycle.history.at(-1).purge,(b:any)=>b.repositories.documentRecycle.history.at(-1).purge.backup.sha256='forged',(b:any)=>b.repositories.documentRecycle.history.at(-1).contentToken='0'.repeat(64),(b:any)=>b.repositories.documentRecycle.history.at(-1).action='Recovered'];
 for(const corrupt of corruptions){const b=structuredClone(backup) as any;corrupt(b);delete b.checksum;b.checksum=createHash('sha256').update(JSON.stringify(b)).digest('hex');expect(()=>host.prepareRestore(JSON.stringify(b))).toThrow();}
});
it('rejects another administrator consuming a prepared approval',()=>{
 const row=draft('Quote');change(row.id);const p=preview([row.id]);
 const other=security.createUser({username:'purge.otheradmin',displayName:'Other admin',password:admin.password,roles:['ADMIN']});security.login({username:other.username,password:admin.password});
 expect(()=>purge(p)).toThrow(/preview/);
});
it('blocks writes after an unconfirmed pre-write failure and preserves all sources after restart',async()=>{
 const row=draft('Quote');change(row.id);const p=preview([row.id]),input=purgeInput(p),spy=vi.spyOn(host as any,'persist').mockImplementation(()=>{throw new Error('Injected commit failure');});
 expect(()=>cmd('documentRecycle','purge',input)).toThrow(/could not be confirmed/);spy.mockRestore();
 expect(()=>cmd('documentRecycle','purge',input)).toThrow(/restart/);
 await restart();expect(list().find(r=>r.recordId===row.id).deleted).toBe(true);
 expect(()=>cmd('documentRecycle','purge',input)).toThrow(/preview/);
 expect(purge(preview([row.id]))[0].action).toBe('Purged');
});
it('returns the persisted receipt after a durable commit with an uncertain acknowledgement',async()=>{
 const row=draft('Quote');change(row.id);const p=preview([row.id]),input=purgeInput(p),original=(host as any).persist.bind(host),spy=vi.spyOn(host as any,'persist').mockImplementation((id)=>{original(id);throw new Error('Injected post-write failure');});
 expect(()=>cmd('documentRecycle','purge',input)).toThrow(/could not be confirmed/);spy.mockRestore();await restart();
 const result=cmd('documentRecycle','purge',input);expect(result[0].action).toBe('Purged');expect(list().some(r=>r.recordId===row.id)).toBe(false);expect(readdirSync(join(root,'recycle-backups'))).toHaveLength(1);
});
it('rejects purge evidence relabelled as an older schema and migrates schema 24 without losing drafts',async()=>{
 const row=draft('Quote');change(row.id);const before=host.exportBackup() as any;before.schemaVersion=24;delete before.checksum;before.checksum=createHash('sha256').update(JSON.stringify(before)).digest('hex');writeFileSync(join(root,'business.json'),JSON.stringify(before));await restart();expect(host.exportBackup().schemaVersion).toBe(28);expect(list().find(r=>r.recordId===row.id).deleted).toBe(true);
 purge(preview([row.id]));const after=host.exportBackup() as any;after.schemaVersion=24;delete after.checksum;after.checksum=createHash('sha256').update(JSON.stringify(after)).digest('hex');expect(()=>host.prepareRestore(JSON.stringify(after))).toThrow(/schema 25/);
});
it('also blocks permanently clearing a source whose attachment is in attachment trash',()=>{
 const row=draft('Quote'),a=cmd('attachments','upload',{operationId:'deleted-evidence',expectedRevision:0,target:{kind:'Quote',id:row.id},title:'Deleted evidence',reason:'Verified source evidence',file:{name:'evidence.txt',content:Buffer.from('retain').toString('base64')}});
 cmd('attachments','change',{operationId:'trash-evidence',id:a.id,expectedRevision:a.revision,action:'Trashed',reason:'Retain removed evidence'});change(row.id);const p=preview([row.id]);expect(p.eligible).toBe(false);expect(()=>purge(p)).toThrow(/attachments/);
});
