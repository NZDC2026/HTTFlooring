import {verifyReconciliationChain} from './reconciliationChainEvidence';
import { financialOperationJournal } from '../../../lib/persistence/financialOperationJournal';
import { snapshotRepositories } from '../../security/repositoryHost';
import { bankReconciliationRepository } from './bankReconciliationRepository';
import { bankAccountRepository } from './bankAccountRepository';
import { journalEntryRepository } from '../../accounting/data/journalEntryRepository';
import type { StatementLine } from '../../finance-closure/bankStatementRepository';

/** Read-only proof of already-completed clearing. Never recreates a reconciliation. */
export function verifyReconciliationClosureEvidence(operationId:string):string[] {
 const operations=financialOperationJournal.list(),op=operations.find(o=>o.operationId===operationId),reasons:string[]=[];
 if(!op||op.kind!=='BANK_RECONCILIATION'||op.state!=='MANUAL_REVIEW')return ['Operation is not an unresolved bank reconciliation review.'];
 if(!op.resultId)return ['Operation has no durable bound result; cannot infer clearing.'];
 if(!op.reviewHistory?.length)reasons.push('Operator reconciliation evidence is missing.');
 const all=bankReconciliationRepository.getAll(),matches=all.filter(r=>r.id===op.resultId);
 if(matches.length!==1)return [...reasons,'Completed reconciliation result is missing or duplicated.'];
 const result=matches[0],bank=bankAccountRepository.getById(result.bankAccountId),journals=journalEntryRepository.getAll();
 if(!bank)return [...reasons,'Reconciliation bank account is missing.'];
 const sorted=(ids:string[])=>JSON.stringify([...ids].sort()),money=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
 const chain=all.filter(r=>r.bankAccountId===bank.id&&r.statementDate<=result.statementDate);
 const statements=(snapshotRepositories().bankStatements as {lines:StatementLine[]}|undefined)?.lines??[];
 try{reasons.push(...verifyReconciliationChain({bank,journals,reconciliations:all,throughDate:result.statementDate,statements}));}catch{reasons.push('Reconciliation chain evidence is invalid.');}
 try{
  const input=JSON.parse(op.fingerprint),previous=new Set(chain.filter(r=>r.id!==result.id).flatMap(r=>r.clearedTransactionIds));
  if(!input||input.bankAccountId!==result.bankAccountId||input.statementDate!==result.statementDate||!Number.isFinite(input.statementBalance)||money(input.statementBalance)!==result.statementBalance||!Array.isArray(input.clearedTransactionIds)||input.clearedTransactionIds.some((id:unknown)=>typeof id!=='string')||sorted([...new Set<string>(input.clearedTransactionIds)].filter(id=>!previous.has(id)))!==sorted(result.clearedTransactionIds))reasons.push('Saved reconciliation intent does not match the bound clearing result.');
 }catch{reasons.push('Saved reconciliation intent is unreadable.');}
 if(operations.some(o=>o.operationId!==op.operationId&&o.kind===op.kind&&o.resultId===op.resultId))reasons.push('Another operation claims this reconciliation result.');
 return reasons;
}
