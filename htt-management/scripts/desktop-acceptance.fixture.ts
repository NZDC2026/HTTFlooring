import {it,vi} from 'vitest';
import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
// Opt-in fixture generator; normal runs only check that no business profile is requested.
it('keeps native acceptance seeding opt-in and outside the business profile',async()=>{
 const target=process.env.HTT_ACCEPTANCE_PROFILE;if(!target)throw new Error('Set HTT_ACCEPTANCE_PROFILE to a fresh temporary profile.');
 if(!target.startsWith(tmpdir())&&!target.startsWith('/private/tmp/'))throw new Error('Use an isolated temporary acceptance profile.');
 const root=join(target,'local-security');if(existsSync(root))throw new Error('Use a fresh acceptance profile.');mkdirSync(root,{recursive:true});
 vi.resetModules();vi.stubGlobal('__HTT_MAIN_HOST__',true);vi.stubGlobal('window',undefined);vi.stubGlobal('localStorage',undefined);
 const {LocalSecurity}=await import('../electron/security/localSecurity'),{BusinessHost}=await import('../electron/security/businessHost');
 const security=new LocalSecurity(join(root,'security-v1.json'));security.setup({username:'qa.admin',displayName:'Synthetic ADMIN',password:'Desktop-Acceptance-4821'});const host=new BusinessHost(join(root,'business-v1.json'),security);await host.initialize();
 for(const role of ['FINANCE_ADMIN','ACCOUNTANT','SALES','WAREHOUSE','PURCHASING','AUDITOR'] as const)security.createUser({username:'qa.'+role.toLowerCase(),displayName:'Synthetic '+role,password:'Desktop-Acceptance-4821',roles:[role]});
 const cmd=(repository:string,method:string,...args:unknown[])=>host.command({repository,method,args}).result as any;
 cmd('payroll','setupDefaults',{operationId:crypto.randomUUID(),reason:'Synthetic desktop acceptance defaults'});
 const state=host.view().repositories as any, earning=state.payroll.items.find((i:any)=>i.code==='SAL');
 cmd('payroll','saveEmployee',{operationId:crypto.randomUUID(),reason:'Synthetic acceptance employee',expectedRevision:0,values:{code:'QA-EMP',name:'Synthetic Acceptance Employee',position:'Installer',email:'qa@example.test',startDate:'2026-07-01',endDate:'',status:'Active',basis:'Salary',rate:1000,earningItemId:earning.id,bankAccount:'123-456 123456789',taxIdentifier:'123456789',annualOpening:80,personalOpening:40}});
 writeFileSync(join(target,'baseline-business.json'),JSON.stringify(host.exportBackup()));
 vi.unstubAllGlobals();
},30000);
