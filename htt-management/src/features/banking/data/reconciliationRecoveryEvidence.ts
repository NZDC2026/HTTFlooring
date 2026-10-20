import { financialOperationJournal } from '../../../lib/persistence/financialOperationJournal';
import { snapshotRepositories } from '../../security/repositoryHost';
import { bankReconciliationRepository } from './bankReconciliationRepository';
import { bankAccountRepository } from './bankAccountRepository';
import { journalEntryRepository } from '../../accounting/data/journalEntryRepository';
import { calculateBankRegister } from './bankRegisterService';
import { calculateBankReconciliation } from './bankReconciliationService';
import { requireDateKey } from '../../../lib/businessDate';
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
 const unique=(ids:string[])=>new Set(ids).size===ids.length,sorted=(ids:string[])=>JSON.stringify([...ids].sort()),money=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
 if(!unique(all.map(r=>r.id))||!unique(journals.map(j=>j.id))||!unique(journals.flatMap(j=>j.lines.map(l=>j.id+':'+l.id))))return [...reasons,'Duplicate reconciliation or ledger row identity.'];
 const chain=all.filter(r=>r.bankAccountId===bank.id&&r.statementDate<=result.statementDate).sort((a,b)=>a.statementDate.localeCompare(b.statementDate)),cleared=new Set<string>();
 let previousDate='';
 for(const r of chain){
  try{requireDateKey(r.statementDate,'Statement date');}catch{return [...reasons,'Reconciliation statement date is invalid.'];}
  if(r.status!=='COMPLETED'||r.statementDate<=previousDate||r.statementDate<bank.openingBalanceDate||!Number.isFinite(r.statementBalance)||money(r.statementBalance)!==r.statementBalance||!unique(r.clearedTransactionIds))return [...reasons,'Reconciliation sequence, status, balance or cleared identities are invalid.'];
  const register=calculateBankRegister(bank,journals,r.statementDate),rows=new Map(register.transactions.map(t=>[t.id,t]));
  if(r.clearedTransactionIds.some(id=>cleared.has(id)||!rows.has(id)||rows.get(id)!.journalStatus!=='POSTED'))return [...reasons,'Cleared rows are missing, reversed or duplicated across statements.'];
  r.clearedTransactionIds.forEach(id=>cleared.add(id));
  const calculation=calculateBankReconciliation(register,r.statementBalance,[...cleared]);
  if(!calculation.reconciled||(['bookBalance','outstandingDeposits','outstandingPayments','adjustedStatementBalance','difference'] as const).some(k=>!Number.isFinite(r[k])||r[k]!==calculation[k]))reasons.push('Saved reconciliation totals do not match the current dated bank ledger: '+r.reconciliationNumber);
  previousDate=r.statementDate;
 }
 try{
  const input=JSON.parse(op.fingerprint),previous=new Set(chain.filter(r=>r.id!==result.id).flatMap(r=>r.clearedTransactionIds));
  if(!input||input.bankAccountId!==result.bankAccountId||input.statementDate!==result.statementDate||!Number.isFinite(input.statementBalance)||money(input.statementBalance)!==result.statementBalance||!Array.isArray(input.clearedTransactionIds)||input.clearedTransactionIds.some((id:unknown)=>typeof id!=='string')||sorted([...new Set<string>(input.clearedTransactionIds)].filter(id=>!previous.has(id)))!==sorted(result.clearedTransactionIds))reasons.push('Saved reconciliation intent does not match the bound clearing result.');
 }catch{reasons.push('Saved reconciliation intent is unreadable.');}
 const imported=(snapshotRepositories().bankStatements as {lines:StatementLine[]}|undefined)?.lines.filter(l=>l.bankAccountId===bank.id&&l.date<=result.statementDate)??[],register=calculateBankRegister(bank,journals,result.statementDate),rows=new Map(register.transactions.map(r=>[r.id,r])),matched=new Set<string>();
 for(const line of imported){
  if(line.status==='UNMATCHED')reasons.push('Imported statement contains an unresolved line.');
  if(line.status==='MATCHED'||line.status==='POSTED'){
   if(!line.ledgerIds.length||!unique(line.ledgerIds)||line.ledgerIds.some(id=>!cleared.has(id)||!rows.has(id)||rows.get(id)!.journalStatus!=='POSTED'||rows.get(id)!.transactionDate>line.date||matched.has(id))||money(line.ledgerIds.reduce((sum,id)=>sum+(rows.get(id)?.moneyIn??0)-(rows.get(id)?.moneyOut??0),0))!==line.amount)reasons.push('Imported statement match, amount or clearing is inconsistent.');
   line.ledgerIds.forEach(id=>matched.add(id));
  }
 }
 if(operations.some(o=>o.operationId!==op.operationId&&o.kind===op.kind&&o.resultId===op.resultId))reasons.push('Another operation claims this reconciliation result.');
 return reasons;
}
