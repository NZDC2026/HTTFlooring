import {financialStateStorage} from '../../src/lib/persistence/financialStateStorage';
import {createHash} from 'node:crypto';
import {z} from 'zod';
import {financialOperationJournal,type FinancialOperation} from '../../src/lib/persistence/financialOperationJournal';
import {snapshotRepositories} from '../../src/features/security/repositoryHost';
import {trustedAuthorization} from '../../src/features/security/trustedAuthorization';
import {runFinancialConsistencyAudit} from '../../src/lib/persistence/runFinancialConsistencyAudit';
import {bankTransactionRepository,restoreInterruptedBankRecord,relinkInterruptedBankJournal} from '../../src/features/banking/data/bankTransactionRepository';
import {bankAccountRepository} from '../../src/features/banking/data/bankAccountRepository';
import {accountRepository} from '../../src/features/accounting/data/accountRepository';
import {bankDuplicateCorrections,sameBankPosting} from '../../src/features/accounting/data/bankDuplicateCorrection';
import {journalEntryRepository,reverseDuplicateBankJournal} from '../../src/features/accounting/data/journalEntryRepository';
import {assertPostingPeriod} from '../../src/features/accounting/data/accountingPeriodRepository';
import {assertBankPostingDate} from '../../src/features/banking/data/reconciliationLock';
import {verifyBankClosureEvidence} from '../../src/features/banking/data/bankRecoveryEvidence';
import {requireDateKey} from '../../src/lib/businessDate';
import type {RepairPlan} from '../../src/features/financial-repair/repairContract';
import type {BankTransaction,BankTransfer} from '../../src/features/banking/types/bankTransaction';
import type {JournalEntry,JournalEntryDraft} from '../../src/features/accounting/types/journalEntry';
const id=z.string().trim().min(1).max(200),reference=z.string().trim().min(3).max(500),summary=z.string().trim().min(10).max(4000),digest=z.string().regex(/^[a-f0-9]{64}$/);
const previewSchema=z.object({operationId:id}).strict();
const proposeSchema=previewSchema.extend({expectedDigest:digest,reference,summary,businessChecked:z.literal(true),glChecked:z.literal(true),externalEvidenceChecked:z.literal(true)}).strict();
const executeSchema=previewSchema.extend({proposalId:id,expectedDigest:digest,approvalReference:reference,confirm:z.literal(true)}).strict();
const money=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
function canonical(v:unknown):unknown {if(Array.isArray(v))return v.map(canonical);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,value])=>[k,canonical(value)]));return v;}
const hash=(v:unknown)=>createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
function evidenceDigest(){return hash({business:snapshotRepositories(),operations:financialOperationJournal.list().map(({repairProposal:_proposal,...o})=>o)});}
function allReferences(value:unknown,target:string):boolean {if(typeof value==='string')return value===target||value.startsWith(target+':');if(Array.isArray(value))return value.some(v=>allReferences(v,target));return !!value&&typeof value==='object'&&Object.values(value).some(v=>allReferences(v,target));}
function parsedIntent(op:FinancialOperation){
 const base={amount:z.number().finite().positive(),description:z.string().trim().min(1).max(2000),reference:z.string().max(2000).optional()};
 const schema=op.kind==='BANK_TRANSACTION'?z.object({...base,bankAccountId:id,transactionDate:id,direction:z.enum(['MONEY_IN','MONEY_OUT']),offsetAccountId:id}).strict():z.object({...base,fromBankAccountId:id,toBankAccountId:id,transferDate:id}).strict();
 const input=schema.parse(JSON.parse(op.fingerprint));return {...input,amount:money(input.amount),description:input.description.trim(),reference:input.reference?.trim()||undefined};
}
type DetailedPlan={public:RepairPlan;record?:BankTransaction|BankTransfer;draft?:JournalEntryDraft;projectedJournal?:JournalEntry};
function buildPlan(operationId:string):DetailedPlan{
 const operations=financialOperationJournal.list(),op=operations.find(o=>o.operationId===operationId),p:RepairPlan={operationId,resultId:op?.resultId,evidenceDigest:evidenceDigest(),eligible:false,blockers:[],changes:[]},blocked=(reason:string):DetailedPlan=>{p.blockers.push(reason);return{public:p};};
 if(!op||op.state==='COMPLETED')return blocked('An unresolved operation is required.');
 if(!op.resultId?.trim())return blocked('No durable bound result identity. Absence of effects cannot be proved; use validated backup recovery.');
 if(!['BANK_TRANSACTION','BANK_TRANSFER'].includes(op.kind))return blocked('This operation kind has no targeted repair procedure. Existing verified closure or validated backup recovery remains available.');
 if(operations.some(o=>o.operationId!==op.operationId&&o.resultId===op.resultId))return blocked('Another operation claims this result.');
 let input:ReturnType<typeof parsedIntent>;try{input=parsedIntent(op);}catch{return blocked('Saved bank intent is invalid or unreadable.');}
 if(input.amount<=0)return blocked('Saved bank amount does not round to positive cents.');
 const transactions=bankTransactionRepository.getTransactions(),transfers=bankTransactionRepository.getTransfers(),journals=journalEntryRepository.getAll(),records=[...transactions,...transfers].filter(r=>r.id===op.resultId),source=journals.filter(j=>j.sourceType===op.kind&&j.sourceId===op.resultId),all=snapshotRepositories();
 if(journals.some(j=>j.sourceId===op.resultId&&j.sourceType!==op.kind))return blocked('A journal with another source kind claims this bound result.');
 const cache=financialStateStorage.read();
 if(JSON.stringify(cache.transactions)!==JSON.stringify(transactions)||JSON.stringify(cache.transfers)!==JSON.stringify(transfers)||JSON.stringify(cache.journals)!==JSON.stringify(journals))return blocked('Financial cache and source repositories disagree; restore a consistent snapshot first.');
 if(new Set(journals.map(j=>j.id)).size!==journals.length||records.length>1)return blocked('Duplicate bank or journal identities are ambiguous.');
 if(records.length===1&&source.length===2){
  const record=records[0],canonical=source.find(j=>j.id===record.journalEntryId),duplicate=source.find(j=>j.id!==record.journalEntryId);
  if(!canonical||!duplicate||canonical.status!=='POSTED'||duplicate.status!=='POSTED'||[canonical,duplicate].some(j=>j.bankDuplicateCorrection||j.reversedJournalEntryId||j.reversalJournalEntryId||j.reversedAt)||!sameBankPosting(canonical,duplicate))return blocked('Duplicate journals must be exact original postings with an unambiguous existing bank-record link.');
  // Match/reconciliation/foreign references make automatic duplicate selection unsafe.
  const foreign={...all};delete foreign.journals;delete foreign.financialCache;
  if(Object.values(foreign).some(v=>allReferences(v,duplicate.id))||operations.some(o=>allReferences(o,duplicate.id))||journals.some(j=>j.id!==duplicate.id&&allReferences(j,duplicate.id)))return blocked('The duplicate journal is referenced by matching, clearing or another source.');
  const date=canonical.journalDate;
  try{requireDateKey(date,'Duplicate financial date');assertPostingPeriod(date);assertBankPostingDate(date,duplicate.lines.map(l=>l.accountId));}catch(e){return blocked((e as Error).message);}
  if(duplicate.lines.some(l=>!accountRepository.getAll().find(a=>a.id===l.accountId)?.active)||bankAccountRepository.getAll().some(b=>duplicate.lines.some(l=>l.accountId===b.glAccountId)&&!b.active))return blocked('Duplicate correction requires active bank and GL accounts.');
  const syntheticId='duplicate-preview:'+op.operationId,now=new Date().toISOString();
  if(journals.some(j=>j.id===syntheticId))return blocked('Preview journal identity collision.');
  const reverse:JournalEntry={id:syntheticId,journalNumber:'Pending duplicate correction',journalDate:date,description:'Reversal of '+duplicate.journalNumber+': '+duplicate.description,reference:duplicate.reference,sourceType:duplicate.sourceType,status:'POSTED',lines:duplicate.lines.map((l,i)=>({...l,id:'duplicate-offset-'+i,debit:l.credit,credit:l.debit})),totalDebit:duplicate.totalCredit,totalCredit:duplicate.totalDebit,createdAt:now,updatedAt:now,postedAt:now,reversedJournalEntryId:duplicate.id};
  const corrected:JournalEntry={...duplicate,status:'REVERSED',reversalJournalEntryId:syntheticId,reversedAt:now,updatedAt:now,reversalReason:'Proposed duplicate correction',bankDuplicateCorrection:{canonicalJournalId:canonical.id,operationId:op.operationId}},projected={journals:[reverse,...journals.map(j=>j.id===duplicate.id?corrected:j)]},proof=verifyBankClosureEvidence(operationId,projected,false),issues=runFinancialConsistencyAudit(projected);
  if(bankDuplicateCorrections(projected.journals).invalid.length||proof.length||issues.length)return blocked('Exact duplicate correction cannot prove an isolated repair: '+[...proof,...issues.map(i=>i.code)].join(' '));
  p.action='REVERSE_BANK_DUPLICATE';p.journalDate=date;p.amount=input.amount;p.existingJournalId=canonical.id;p.duplicateJournalId=duplicate.id;p.eligible=true;p.changes=['Independent bank evidence must confirm one intended transaction; a second real external payment is not a local duplicate repair.','Preserve bank-record link to '+canonical.id+' and all original journal lines.','Mark only duplicate '+duplicate.id+' as REVERSED and post its exact opposite on '+date+'.','Retain both sides visibly in GL and bank registers; their net cash effect is zero. They cannot be matched or cleared as external cash.','Keep the independently approved plan, duplicate/canonical identities and verification digests in the operation audit.'];return{public:p};
 }
 if(new Set(journals.map(j=>j.id)).size!==journals.length||records.length>1||source.length>1)return blocked('Duplicate bank or journal evidence requires separate reviewed recovery. No duplicate is deleted or silently selected.');
 const date='transactionDate' in input?input.transactionDate:input.transferDate;try{requireDateKey(date,'Bank intent date');}catch{return blocked('Saved bank intent date is invalid.');}
 p.journalDate=date;p.amount=input.amount;
 if(!records.length&&!source.length){
  if(Object.entries(all).some(([key,value])=>key!=='financialCache'&&allReferences(value,op.resultId!)))return blocked('Other business records still reference the bound result.');
  const issues=runFinancialConsistencyAudit();if(issues.length)return blocked('Other financial inconsistencies remain: '+issues.map(i=>i.code).join(', '));
  p.action='CANCEL_NO_EFFECT';p.eligible=true;p.changes=['Retire this operation as CANCELLED_NO_EFFECT while preserving its original bound identity and full audit history.','No business record, stock movement or GL entry is created, changed or reversed.','The original operation ID can never be replayed. A genuinely new transaction requires a new ID after all write blockers are resolved.'];return{public:p};
 }
 const expectedNumber='REC-'+op.resultId;
 let record:BankTransaction|BankTransfer;
 const common={id:op.resultId,amount:input.amount,description:input.description,reference:input.reference,journalEntryId:source[0]?.id??records[0]?.journalEntryId??'',createdAt:source[0]?.createdAt??records[0]?.createdAt??op.createdAt};
 if('transactionDate' in input){record={...common,transactionNumber:expectedNumber,bankAccountId:input.bankAccountId,transactionDate:input.transactionDate,direction:input.direction,offsetAccountId:input.offsetAccountId};}
 else{record={...common,transferNumber:expectedNumber,fromBankAccountId:input.fromBankAccountId,toBankAccountId:input.toBankAccountId,transferDate:input.transferDate};}
 if(!records.length&&source.length===1){
  // Any foreign ownership of this result is ambiguous, even with a valid source journal.
  const foreign={...all};delete foreign.journals;delete foreign.financialCache;if(Object.values(foreign).some(v=>allReferences(v,op.resultId!)))return blocked('Another repository references the missing bank result.');
  if([...transactions.map(t=>t.transactionNumber),...transfers.map(t=>t.transferNumber)].includes(expectedNumber))return blocked('Recovered business number is already in use.');
  const projected='transactionNumber' in record?{transactions:[record,...transactions]}:{transfers:[record,...transfers]},proof=verifyBankClosureEvidence(operationId,projected,false),issues=runFinancialConsistencyAudit(projected);
  if(proof.length||issues.length)return blocked('Existing GL cannot prove the exact intended bank result: '+[...proof,...issues.map(i=>i.code)].join(' '));
  p.action='RESTORE_BANK_RECORD';p.existingJournalId=source[0].id;p.businessNumber=expectedNumber;p.eligible=true;p.changes=['Restore only the missing bank register record from the saved intent and the uniquely verified existing source journal.','Keep the existing GL journal, financial date, amounts, accounts and reconciliation/match records unchanged.'];return{public:p,record};
 }
 if(records.length===1&&source.length===1&&records[0].journalEntryId!==source[0].id){
  const existing=records[0],journal=source[0];
  if((op.kind==='BANK_TRANSACTION')!==('transactionNumber' in existing))return blocked('Bound result belongs to a different bank operation kind.');
  if(!existing.journalEntryId?.trim())return blocked('Previous journal identity is missing; validated backup recovery is required.');
  // A dangling old ID must not be retained by a bank match, reconciliation or foreign source.
  // A real unrelated journal stays intact, including its legitimate source and clearing references.
  if(!journals.some(j=>j.id===existing.journalEntryId)){
   const foreign={...all};delete foreign.bankTransactions;delete foreign.financialCache;
   if(Object.values(foreign).some(v=>allReferences(v,existing.journalEntryId)))return blocked('The stale missing journal is still referenced by another repository.');
  }
  const linked={...existing,journalEntryId:journal.id},projected='transactionNumber' in linked?{transactions:transactions.map(t=>t.id===linked.id?linked:t)}:{transfers:transfers.map(t=>t.id===linked.id?linked:t)},proof=verifyBankClosureEvidence(operationId,projected,false),issues=runFinancialConsistencyAudit(projected);
  if(proof.length||issues.length)return blocked('A unique existing journal cannot prove an isolated link repair: '+[...proof,...issues.map(i=>i.code)].join(' '));
  p.action='RESTORE_BANK_JOURNAL_LINK';p.previousJournalId=existing.journalEntryId;p.existingJournalId=journal.id;p.eligible=true;p.changes=['Change only this bank record journal link from '+existing.journalEntryId+' to '+journal.id+'.','Preserve every GL journal, original financial date, account, amount, bank balance and reconciliation/match record.','Retain the previous link, the independently approved plan and verification digests in the operation audit.'];return{public:p};
 }
 if(records.length===1&&!source.length){
  const existing=records[0];
  if((op.kind==='BANK_TRANSACTION')!==('transactionNumber' in existing))return blocked('Bound result belongs to a different bank operation kind.');
  if(!existing.journalEntryId||journals.some(j=>j.id===existing.journalEntryId))return blocked('Linked journal exists with a conflicting source.');
  const other={...all};delete other.bankTransactions;delete other.financialCache;
  if(Object.values(other).some(v=>allReferences(v,existing.journalEntryId)))return blocked('Missing journal is referenced by clearing, matching or another repository.');
  const bank='bankAccountId' in record?bankAccountRepository.getById(record.bankAccountId):undefined,from='fromBankAccountId' in record?bankAccountRepository.getById(record.fromBankAccountId):undefined,to='toBankAccountId' in record?bankAccountRepository.getById(record.toBankAccountId):undefined;
  const debit='direction' in record?(record.direction==='MONEY_IN'?bank?.glAccountId:record.offsetAccountId):to?.glAccountId,credit='direction' in record?(record.direction==='MONEY_IN'?record.offsetAccountId:bank?.glAccountId):from?.glAccountId;
  if(!debit||!credit)return blocked('Bank GL mapping is missing.');
  try{assertPostingPeriod(date);assertBankPostingDate(date,[debit,credit]);}catch(e){return blocked((e as Error).message);}
  if([bank,from,to].filter(Boolean).some(b=>!b!.active)||[debit,credit].some(id=>!accountRepository.getAll().find(a=>a.id===id)?.active))return blocked('Missing-journal repair requires currently active bank and GL accounts.');
  const draft:JournalEntryDraft={journalDate:date,description:input.description,reference:input.reference,sourceType:op.kind as 'BANK_TRANSACTION'|'BANK_TRANSFER',sourceId:op.resultId,lines:[{accountId:debit,debit:input.amount,credit:0},{accountId:credit,debit:0,credit:input.amount}]};
  const simulatedId='repair-preview:'+op.operationId;if(journals.some(j=>j.id===simulatedId))return blocked('Preview journal identity collision.');
  const synthetic:JournalEntry={id:simulatedId,journalNumber:'Pending repair approval',journalDate:date,description:input.description,reference:input.reference,sourceType:draft.sourceType,sourceId:op.resultId,status:'POSTED',lines:draft.lines.map((l,i)=>{const a=accountRepository.requireById(l.accountId);return{...l,id:'preview-'+i,accountCode:a.code,accountName:a.name};}),totalDebit:input.amount,totalCredit:input.amount,createdAt:op.createdAt,updatedAt:op.createdAt,postedAt:op.createdAt};
  const linked={...existing,journalEntryId:simulatedId},projected='transactionNumber' in linked?{transactions:transactions.map(t=>t.id===linked.id?linked:t),journals:[synthetic,...journals]}:{transfers:transfers.map(t=>t.id===linked.id?linked:t),journals:[synthetic,...journals]},proof=verifyBankClosureEvidence(operationId,projected,false),issues=runFinancialConsistencyAudit(projected);
  if(proof.length||issues.length)return blocked('Business record and saved intent cannot prove an isolated missing-journal repair: '+[...proof,...issues.map(i=>i.code)].join(' '));
  p.action='RESTORE_BANK_JOURNAL';p.previousJournalId=existing.journalEntryId;p.debitAccountId=debit;p.creditAccountId=credit;p.eligible=true;p.changes=['Post one source-owned GL journal on the original financial date and relink this bank record to the new journal.','Debit '+debit+' '+input.amount.toFixed(2)+'; credit '+credit+' '+input.amount.toFixed(2)+'.','No payment is sent and no other journal is altered. The missing previous journal identity stays in the saved repair plan.'];return{public:p,draft,projectedJournal:synthetic};
 }
 return blocked('Existing business and GL effects must use verified closure, or remain blocked if their evidence conflicts.');
}
export function previewTargetedRepair(raw:unknown):RepairPlan {trustedAuthorization.require('audit.read');const input=previewSchema.parse(raw);return buildPlan(input.operationId).public;}
export function proposeTargetedRepair(raw:unknown){
 const actor=trustedAuthorization.require('accounting.recover'),input=proposeSchema.parse(raw),plan=buildPlan(input.operationId).public;
 if(!plan.eligible||!plan.action)throw new Error('Targeted repair blocked: '+plan.blockers.join(' '));
 if(plan.evidenceDigest!==input.expectedDigest)throw new Error('Repair evidence changed. Refresh the preview.');
 const proposalId=crypto.randomUUID();
 financialOperationJournal.recordManualReview(input.operationId,input.reference,actor.userId,input.summary+' · Proposed '+plan.action+' · '+proposalId);
 const refreshed=buildPlan(input.operationId).public;
 if(!refreshed.eligible||refreshed.action!==plan.action)throw new Error('Repair conditions changed during proposal.');
 return financialOperationJournal.attachRepairProposal(input.operationId,{id:proposalId,action:plan.action,evidenceDigest:refreshed.evidenceDigest,planJson:JSON.stringify(refreshed),reviewer:actor.userId,reference:input.reference,summary:input.summary,proposedAt:new Date().toISOString(),status:'PROPOSED'});
}
export function executeTargetedRepair(raw:unknown){
 const actor=trustedAuthorization.require('accounting.recover'),input=executeSchema.parse(raw),op=financialOperationJournal.list().find(o=>o.operationId===input.operationId),proposal=op?.repairProposal;
 if(!op||!proposal||proposal.id!==input.proposalId||proposal.evidenceDigest!==input.expectedDigest)throw new Error('Repair proposal changed. Refresh the preview.');
 if(proposal.status==='EXECUTED'){
  if(proposal.approver!==actor.userId||proposal.approvalReference!==input.approvalReference)throw new Error('Repair was already executed with a different approval.');return structuredClone(op);
 }
 if(op.state!=='MANUAL_REVIEW'||proposal.reviewer===actor.userId||op.reviewHistory?.some(h=>h.operator===actor.userId))throw new Error('Repair approval requires a different authorized operator.');
 if(op.reviewHistory?.some(h=>h.reference===input.approvalReference))throw new Error('Approval reference must differ from review evidence.');
 const detail=buildPlan(input.operationId),plan=detail.public;
 if(!plan.eligible||plan.action!==proposal.action||plan.evidenceDigest!==proposal.evidenceDigest)throw new Error('Repair evidence changed or is no longer eligible. Refresh and propose again.');
 const apply=()=>{
 let journalId=plan.existingJournalId;
 if(plan.action==='RESTORE_BANK_RECORD')restoreInterruptedBankRecord(detail.record!);
 else if(plan.action==='RESTORE_BANK_JOURNAL_LINK')relinkInterruptedBankJournal(op.resultId!,plan.previousJournalId!,plan.existingJournalId!);
 else if(plan.action==='REVERSE_BANK_DUPLICATE'){
  trustedAuthorization.require('banking.write');trustedAuthorization.require('accounting.post');
  journalId=reverseDuplicateBankJournal(plan.duplicateJournalId!,plan.existingJournalId!,op.operationId,'Approved duplicate correction '+proposal.id+'; '+input.approvalReference).id;
 }
 else if(plan.action==='RESTORE_BANK_JOURNAL'){
  trustedAuthorization.require('banking.write');trustedAuthorization.require('accounting.post');
  const journal=journalEntryRepository.post(detail.draft!);journalId=journal.id;
  relinkInterruptedBankJournal(op.resultId!,plan.previousJournalId!,journal.id);
 }
 const issues=runFinancialConsistencyAudit();if(issues.length)throw new Error('Post-repair consistency checks failed: '+issues.map(i=>i.code).join(', '));
 if(plan.action!=='CANCEL_NO_EFFECT'){const proof=verifyBankClosureEvidence(input.operationId);if(proof.length)throw new Error('Post-repair source proof failed: '+proof.join(' '));}
 else if(buildPlan(input.operationId).public.action!=='CANCEL_NO_EFFECT')throw new Error('No-effect evidence changed before cancellation.');
 return financialOperationJournal.finishRepair(input.operationId,proposal.id,actor.userId,input.approvalReference,hash(snapshotRepositories()),journalId);
 };
 return plan.action==='CANCEL_NO_EFFECT'?apply():financialStateStorage.transaction(apply);
}
