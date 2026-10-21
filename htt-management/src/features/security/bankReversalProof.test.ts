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




async function legacyReversal(mode:string){
 const bank=state('bankAccounts').bankAccounts.find((b:any)=>b.id==='bank_001'),offset=state('accounts').accounts.find((a:any)=>a.systemRole==='OPERATING_EXPENSE'),original=cmd('journals','post',{journalDate:'2026-10-10',description:'Bank receipt with legacy reversal evidence',sourceType:'MANUAL_JOURNAL',lines:[{accountId:bank.glAccountId,debit:10,credit:0},{accountId:offset.id,debit:0,credit:10}]}),reverse=cmd('journals','reverse',{journalEntryId:original.id,reversalDate:'2026-10-19',reason:'Reverse legacy receipt in subsequent bank statement'}),backup=host.exportBackup() as any;
 const journals=backup.repositories.journals.journalEntries,j=journals.find((j:any)=>j.id===original.id),r=journals.find((j:any)=>j.id===reverse.id);
 if(mode==='orphan')backup.repositories.journals.journalEntries=journals.filter((j:any)=>j.id!==original.id);
 if(mode==='wrong-owner-status')j.status='POSTED';
 if(mode==='wrong-source')r.sourceType='BANK_TRANSFER';
 if(mode==='shared-offset')journals.push({...structuredClone(j),id:'foreign-reversal-owner',journalNumber:'J-FOREIGN-OWNER'});
 backup.repositories.financialCache.journals=structuredClone(backup.repositories.journals.journalEntries);const {createHash}=await import('node:crypto');delete backup.checksum;backup.checksum=createHash('sha256').update(JSON.stringify(backup)).digest('hex');if(mode==='orphan'){const before=structuredClone(raw());expect(()=>host.prepareRestore(JSON.stringify(backup))).toThrow(/Reversal line does not match/);expect(raw()).toEqual(before);await restart();return {bank,original,reverse};}const prepared=host.prepareRestore(JSON.stringify(backup));await host.restoreBackup(prepared.token);await restart();return {bank,original,reverse};
}
it.each(['wrong-owner-status','wrong-source','shared-offset'])('preserves legacy %s evidence for review and blocks imported/manual clearing and close',async mode=>{
 const f=await legacyReversal(mode),journals=structuredClone(raw().journals),{calculateBankRegister}=await import('../banking/data/bankRegisterService'),register=calculateBankRegister(f.bank,state('journals').journalEntries,'2026-10-20'),row=register.transactions.find(r=>r.journalEntryId===f.reverse.id)!;expect(row.correctionIssue).toMatch(/requires review/);expect(row.correctionOnly).toBeFalsy();
 expect(cmd('bankStatements','candidates',{bankAccountId:f.bank.id,asOfDate:'2026-10-20'}).some((r:any)=>r.journalEntryId===f.reverse.id)).toBe(false);
 const {calculateCashReport}=await import('../cash-reports/cashReportService'),report=calculateCashReport({bankAccounts:[f.bank],journalEntries:state('journals').journalEntries,bankIds:[f.bank.id],currency:f.bank.currency,from:'2026-10-19',to:'2026-10-20'});expect(report.grossOut).toBe(10);expect(report.warnings.join(' ')).toMatch(/requires review/);
 cmd('bankStatements','importRows',{bankAccountId:f.bank.id,rows:[{date:'2026-10-19',description:'Legacy returned receipt',amount:-10,externalId:'INVALID-OFFSET'}]});const line=state('bankStatements').lines[0],before=structuredClone(raw());expect(()=>cmd('bankStatements','match',{id:line.id,ledgerIds:[row.id]})).toThrow();expect(()=>cmd('bankReconciliations','complete',{bankAccountId:f.bank.id,statementDate:'2026-10-20',statementBalance:register.closingBalance,clearedTransactionIds:register.transactions.filter(r=>!r.correctionIssue).map(r=>r.id)})).toThrow();expect(raw()).toEqual(before);
 const p=cmd('accountingPeriods','create',{name:'Legacy reversal review',startDate:'2026-10-01',endDate:'2026-10-20',reason:'Reject close without complete bank reversal evidence'});expect(cmd('accountingPeriods','preflight',p.id).blockers.some((b:any)=>b.code==='BANK_RECONCILIATION_INVALID')).toBe(true);expect(raw().journals).toEqual(journals);await restart();expect(calculateBankRegister(f.bank,state('journals').journalEntries,'2026-10-20').transactions.find(r=>r.id===row.id)?.correctionIssue).toMatch(/requires review/);
});

it('rejects an orphan offset backup without replacing the valid persisted journal pair',async()=>{const f=await legacyReversal('orphan');expect(state('journals').journalEntries.find((j:any)=>j.id===f.original.id).reversalJournalEntryId).toBe(f.reverse.id);const {bankJournalLifecycleIssues}=await import('../banking/data/bankJournalEvidence');expect(bankJournalLifecycleIssues(state('journals').journalEntries).size).toBe(0);});
async function financeControls(date='2026-10-20'){
 const {calculateFinanceControls}=await import('../accounting/data/financeControlsService'),{calculateAccountsReceivableGlReconciliation}=await import('../accounting/data/accountsReceivableGlReconciliationService'),{calculateAccountsPayableGlReconciliation}=await import('../accounting/data/accountsPayableGlReconciliationService'),s=raw(),common={accounts:s.accounts.accounts,journalEntries:s.journals.journalEntries,asOfDate:date};
 const ar=calculateAccountsReceivableGlReconciliation({...common,customers:s.customers.customers,documents:[...s.sales.quotes,...s.sales.salesOrders,...s.sales.invoices],payments:s.customerPayments.payments,creditNotes:s.customerCredits.creditNotes,creditAllocations:s.customerCredits.allocations}),ap=calculateAccountsPayableGlReconciliation({...common,suppliers:s.suppliers.suppliers,bills:s.supplierBills.supplierBills,payments:s.supplierPayments.supplierPayments,credits:s.supplierCredits.supplierCredits,creditAllocations:s.supplierCredits.allocations});return calculateFinanceControls({...common,bankAccounts:s.bankAccounts.bankAccounts,arReconciliation:ar,apReconciliation:ap});
}
it('does not show a zero-difference bank control as passed when its reversal evidence requires review',async()=>{
 const f=await legacyReversal('wrong-owner-status'),before=structuredClone(raw()),report=await financeControls(),bank=report.bankControls.find(b=>b.bankAccountId===f.bank.id)!;expect(bank.difference).toBe(0);expect(bank.status).toBe('FAIL');expect(bank.reviewRowCount).toBe(2);expect(report.allPassed).toBe(false);const earlier=(await financeControls('2026-10-09')).bankControls.find(b=>b.bankAccountId===f.bank.id)!;expect(earlier.reviewRowCount).toBe(0);expect(earlier.status).toBe('PASS');await restart();expect((await financeControls()).bankControls.find(b=>b.bankAccountId===f.bank.id)).toEqual(bank);expect(raw()).toEqual(before);
});

it('keeps a valid original and later reversal passing without changing bank balances',async()=>{const f=await legacyReversal('valid'),before=structuredClone(raw()),report=await financeControls(),bank=report.bankControls.find(b=>b.bankAccountId===f.bank.id)!;expect(bank).toMatchObject({difference:0,status:'PASS',reviewRowCount:0});expect(report.bankControls.filter(b=>b.status==='FAIL')).toEqual([]);expect(raw()).toEqual(before);});
