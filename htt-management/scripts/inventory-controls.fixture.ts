import {it,vi} from 'vitest';
import {mkdirSync,existsSync,writeFileSync} from 'node:fs';
import {isAbsolute,join,relative} from 'node:path';
import {tmpdir} from 'node:os';
it('creates only an explicitly requested fresh temporary inventory-control acceptance profile',async()=>{
 const target=process.env.HTT_ACCEPTANCE_PROFILE,kind=process.env.HTT_G17_CASE;
 if(!target||!['healthy','difference','missing-account'].includes(kind??''))throw new Error('Specify a fresh temporary HTT_ACCEPTANCE_PROFILE and HTT_G17_CASE.');
 if(!isAbsolute(target)||!['/private/tmp',tmpdir()].some(base=>{const r=relative(base,target);return r!==''&&!r.startsWith('..')&&!isAbsolute(r);}))throw new Error('Temporary acceptance profile required.');
 const root=join(target,'local-security');if(existsSync(root))throw new Error('Refusing existing profile.');mkdirSync(root,{recursive:true});
 vi.resetModules();vi.stubGlobal('__HTT_MAIN_HOST__',true);vi.stubGlobal('window',undefined);vi.stubGlobal('localStorage',undefined);
 const {LocalSecurity}=await import('../electron/security/localSecurity'),{BusinessHost}=await import('../electron/security/businessHost');
 const security=new LocalSecurity(join(root,'security-v1.json'));security.setup({username:'qa.admin',displayName:'Synthetic G17 Administrator',password:'Desktop-Acceptance-4821'});const host=new BusinessHost(join(root,'business-v1.json'),security);await host.initialize();
 if(kind==='difference'){
  const {receiveInventoryCost}=await import('../src/features/inventory/data/inventoryCostEngine'),{mockProducts}=await import('../src/features/inventory/data/mockProducts'),{inventorySiteRepository}=await import('../src/features/inventory/data/inventorySiteRepository');
  const product=mockProducts[0];receiveInventoryCost({siteId:inventorySiteRepository.getActive()[0].id,productId:product.id,unitId:product.baseUnitId,quantity:5,transactionUnitCost:20,referenceType:'MANUAL',referenceId:'g17-synthetic-gap',inventoryMovementId:'g17-synthetic-gap',occurredAt:'2026-09-15T00:00:00Z'});
 }
 if(kind==='missing-account'){
  const {snapshotRepositories,restoreRepositories}=await import('../src/features/security/repositoryHost');const s=snapshotRepositories() as any;s.accounts.accounts=s.accounts.accounts.filter((a:any)=>a.systemRole!=='INVENTORY');restoreRepositories(s);
 }
 host.command({repository:'accountingPeriods',method:'create',args:[{name:'Synthetic G17 period',startDate:'2026-09-01',endDate:'2026-09-30',reason:'Synthetic inventory control acceptance only'}]});
 writeFileSync(join(target,'baseline-business.json'),JSON.stringify(host.exportBackup()));writeFileSync(join(target,'acceptance-case.json'),JSON.stringify({kind,synthetic:true}));vi.unstubAllGlobals();
},30000);
