import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
let root: string, security: InstanceType<typeof import('../../../electron/security/localSecurity').LocalSecurity>, host: InstanceType<typeof import('../../../electron/security/businessHost').BusinessHost>;
const admin = { username: 'documents.admin', displayName: 'Document acceptance', password: 'Documents-test-password-4821' };
async function restart() { vi.resetModules(); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.login(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); }
beforeEach(async () => { vi.resetModules(); vi.stubGlobal('__HTT_MAIN_HOST__', true); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined); root = mkdtempSync(join(tmpdir(), 'htt-direct-docs-')); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.setup(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); rmSync(root, { recursive: true, force: true }); });
const cmd = (repository: string, method: string, ...args: unknown[]) => host.command({ repository, method, args }).result as any;
const state = (key: string) => host.view().repositories[key] as any;
const raw = () => host.exportBackup().repositories as any;



async function reconciliationInput(date='2026-10-18'){
 const bank=state('bankAccounts').bankAccounts.find((b:any)=>b.id==='bank_001'),{calculateBankRegister}=await import('../banking/data/bankRegisterService'),register=calculateBankRegister(bank,state('journals').journalEntries,date);
 return {bankAccountId:bank.id,statementDate:date,statementBalance:register.closingBalance,clearedTransactionIds:register.transactions.map(t=>t.id)};
}

async function period(){return cmd('accountingPeriods','create',{name:'Bank evidence close',startDate:'2026-10-01',endDate:'2026-10-18',reason:'Verify bank clearing and dated GL before close'});}
async function completed(){const input=await reconciliationInput();return cmd('bankReconciliations','complete',input,'bank-evidence-statement');}
const bankBlockers=(p:any)=>cmd('accountingPeriods','preflight',p.id).blockers.filter((b:any)=>b.code.startsWith('BANK_'));
it('closes and reopens only after saved bank chain and GL agree, without changing journals or clearing',async()=>{
 await completed();const p=await period(),before=structuredClone(raw());expect(bankBlockers(p)).toEqual([]);expect(cmd('accountingPeriods','close',{id:p.id,reason:'Verified all bank clearing against dated ledger'}).status).toBe('CLOSED');expect(cmd('accountingPeriods','reopen',{id:p.id,reason:'Reopen to verify preserved bank close evidence'}).status).toBe('OPEN');expect(raw().journals).toEqual(before.journals);expect(raw().bankReconciliations).toEqual(before.bankReconciliations);await restart();expect(bankBlockers(p)).toEqual([]);
});
it.each(['bookBalance','outstandingDeposits','outstandingPayments','adjustedStatementBalance','difference','statementBalance','missing-row','unknown-row','reused-row','status'])('blocks a zero-label close when %s reconciliation proof is wrong',async mode=>{
 await completed();const p=await period(),{restoreRepositories,snapshotRepositories}=await import('./repositoryHost'),original=structuredClone(state('bankReconciliations')),bad=structuredClone(original),r=bad.reconciliations[0];
 if(['bookBalance','outstandingDeposits','outstandingPayments','adjustedStatementBalance','difference','statementBalance'].includes(mode))r[mode]+=1;
 if(mode==='missing-row')r.clearedTransactionIds=[];if(mode==='unknown-row')r.clearedTransactionIds.push('unknown:line');if(mode==='reused-row')r.clearedTransactionIds.push(r.clearedTransactionIds[0]);if(mode==='status')r.status='INVALID';
 restoreRepositories({bankReconciliations:bad});const before=structuredClone(snapshotRepositories());expect(bankBlockers(p).some((b:any)=>b.code==='BANK_RECONCILIATION_INVALID')).toBe(true);expect(()=>cmd('accountingPeriods','close',{id:p.id,reason:'Attempt close despite corrupted bank clearing'})).toThrow(/cannot close/);expect(snapshotRepositories()).toEqual(before);restoreRepositories({bankReconciliations:original});expect(bankBlockers(p)).toEqual([]);
});
it('rechecks earlier statements instead of trusting a later completed zero-difference result',async()=>{
 cmd('bankReconciliations','complete',await reconciliationInput('2026-10-10'),'first-bank-evidence');await completed();const p=await period();cmd('accountingPeriods','create',{name:'Next bank period',startDate:'2026-10-19',endDate:'2026-10-31',reason:'Allow next dated bank evidence verification'});const {restoreRepositories}=await import('./repositoryHost'),bad=structuredClone(state('bankReconciliations'));bad.reconciliations.find((r:any)=>r.statementDate==='2026-10-10').bookBalance+=10;restoreRepositories({bankReconciliations:bad});expect(bankBlockers(p).some((b:any)=>b.code==='BANK_RECONCILIATION_INVALID')).toBe(true);
 expect(()=>cmd('bankReconciliations','complete',awaitedInput(),'later-statement')).toThrow(/Existing bank reconciliation evidence/);
 function awaitedInput(){return{bankAccountId:'bank_001',statementDate:'2026-10-19',statementBalance:3000,clearedTransactionIds:[]};}
});
it('refuses reversed rows in a new statement and rolls back the whole attempted reconciliation',async()=>{
 const bank=state('bankAccounts').bankAccounts[0],offset=state('accounts').accounts.find((a:any)=>a.systemRole==='OPERATING_EXPENSE'),j=cmd('journals','post',{journalDate:'2026-10-10',description:'Manual bank correction',sourceType:'MANUAL_JOURNAL',lines:[{accountId:bank.glAccountId,debit:10,credit:0},{accountId:offset.id,debit:0,credit:10}]});cmd('journals','reverse',{journalEntryId:j.id,reversalDate:'2026-10-11',reason:'Correct mistaken manual bank posting'});const input=await reconciliationInput(),before=structuredClone(raw());expect(()=>cmd('bankReconciliations','complete',input,'reversed-clearing-attempt')).toThrow(/selected transaction/);expect(raw()).toEqual(before);
});
it('preserves historical reconciliation when a fully linked reversal is posted after that statement',async()=>{
 const bank=state('bankAccounts').bankAccounts[0],offset=state('accounts').accounts.find((a:any)=>a.systemRole==='OPERATING_EXPENSE'),j=cmd('journals','post',{journalDate:'2026-10-10',description:'Later reversed manual bank posting',sourceType:'MANUAL_JOURNAL',lines:[{accountId:bank.glAccountId,debit:10,credit:0},{accountId:offset.id,debit:0,credit:10}]});cmd('bankReconciliations','complete',await reconciliationInput('2026-10-11'),'before-reversal-statement');cmd('journals','reverse',{journalEntryId:j.id,reversalDate:'2026-10-19',reason:'Correct bank posting in a subsequent period'});cmd('bankReconciliations','complete',await reconciliationInput('2026-10-18'),'historical-post-reversal-statement');const p=await period();expect(bankBlockers(p)).toEqual([]);await restart();expect(bankBlockers(p)).toEqual([]);cmd('accountingPeriods','create',{name:'Next open period',startDate:'2026-10-19',endDate:'2026-10-31',reason:'Allow subsequent reversal statement verification'});expect(cmd('bankReconciliations','complete',await reconciliationInput('2026-10-20'),'next-after-reversal-statement').status).toBe('COMPLETED');
});
it('detects cross-statement repeated clearing and preserves a valid covering statement after the close date',async()=>{
 const first=cmd('bankReconciliations','complete',await reconciliationInput('2026-10-10'),'first-covering');cmd('bankReconciliations','complete',await reconciliationInput('2026-10-19'),'next-covering');const p=await period();expect(bankBlockers(p)).toEqual([]);const {restoreRepositories}=await import('./repositoryHost'),bad=structuredClone(state('bankReconciliations'));bad.reconciliations.find((r:any)=>r.statementDate==='2026-10-19').clearedTransactionIds=first.clearedTransactionIds;restoreRepositories({bankReconciliations:bad});expect(bankBlockers(p).some((b:any)=>b.code==='BANK_RECONCILIATION_INVALID')).toBe(true);
});
