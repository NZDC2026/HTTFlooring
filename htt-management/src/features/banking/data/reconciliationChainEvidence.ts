import {bankJournalPostedAsAt,bankJournalLifecycleIssues} from './bankJournalEvidence';
export {bankJournalPostedAsAt} from './bankJournalEvidence';
import {statementCorrectionEvidence} from './statementCorrectionEvidence';
import type {BankAccount} from '../types/bankAccount';
import type {BankReconciliation} from '../types/bankReconciliation';
import type {JournalEntry} from '../../accounting/types/journalEntry';
import type {StatementLine} from '../../finance-closure/bankStatementRepository';
import {calculateBankRegister} from './bankRegisterService';
import {calculateBankReconciliation} from './bankReconciliationService';
import {requireDateKey} from '../../../lib/businessDate';
const unique=(ids:string[])=>new Set(ids).size===ids.length;
const money=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
/** A later imported bank line cannot reuse cash already cleared by an earlier statement. */
export function bankRowClearedBeforeLine(reconciliations:readonly BankReconciliation[],bankAccountId:string,rowId:string,lineDate:string):boolean {
 return reconciliations.some(r=>r.bankAccountId===bankAccountId&&r.status==='COMPLETED'&&r.statementDate<lineDate&&r.clearedTransactionIds.includes(rowId));
}
/** Read-only proof shared by recovery, subsequent reconciliation and period close.
 * Recompute every saved statement from dated GL and incremental clearing; never repair totals. */
export function verifyReconciliationChain(input:{bank:BankAccount;journals:JournalEntry[];reconciliations:BankReconciliation[];throughDate:string;statements?:StatementLine[]}):string[]{
 const {bank,journals,reconciliations,throughDate}=input,reasons:string[]=[];
 requireDateKey(throughDate,'Reconciliation proof date');requireDateKey(bank.openingBalanceDate,'Bank opening date');
 if(!unique(reconciliations.map(r=>r.id))||!unique(journals.map(j=>j.id))||!unique(journals.flatMap(j=>j.lines.map(l=>j.id+':'+l.id))))return ['Duplicate reconciliation or ledger row identity.'];
 for(const r of reconciliations.filter(r=>r.bankAccountId===bank.id)){try{requireDateKey(r.statementDate);}catch{return ['Reconciliation statement date is invalid.'];}}
 const lifecycleIssues=bankJournalLifecycleIssues(journals);
 if(journals.some(j=>lifecycleIssues.has(j.id)&&j.journalDate>=bank.openingBalanceDate&&j.journalDate<=throughDate&&j.lines.some(l=>l.accountId===bank.glAccountId)))reasons.push('Bank journal reversal has incomplete or inconsistent owner, lifecycle or amount evidence.');
 const correctionProof=statementCorrectionEvidence(journals);
 for(const issue of correctionProof.issues){const j=journals.find(j=>j.id===issue.journalId);if(j&&j.journalDate>=bank.openingBalanceDate&&j.journalDate<=throughDate&&j.lines.some(l=>l.accountId===bank.glAccountId))reasons.push(issue.message);}
 const chain=reconciliations.filter(r=>r.bankAccountId===bank.id&&r.statementDate<=throughDate).sort((a,b)=>a.statementDate.localeCompare(b.statementDate)),cleared=new Set<string>(),journalById=new Map(journals.map(j=>[j.id,j]));
 let previousDate='';
 for(const r of chain){
  try{requireDateKey(r.statementDate,'Statement date');}catch{return ['Reconciliation statement date is invalid.'];}
  if(r.status!=='COMPLETED'||r.statementDate<=previousDate||r.statementDate<bank.openingBalanceDate||!Number.isFinite(r.statementBalance)||money(r.statementBalance)!==r.statementBalance||!unique(r.clearedTransactionIds))return ['Reconciliation sequence, status, balance or cleared identities are invalid.'];
  const register=calculateBankRegister(bank,journals,r.statementDate),rows=new Map(register.transactions.map(t=>[t.id,t]));
  // Legacy clients could clear both sides of a same-date classification cancellation.
  // Accept only a complete proven zero-net pair in the same saved statement, never a lone offset.
  const legacyPairClearing=new Set<string>(),selected=new Set(r.clearedTransactionIds);
  for(const original of journals.filter(j=>correctionProof.verifiedIds.has(j.id)&&j.reversalJournalEntryId)){
   const pair=register.transactions.filter(t=>t.journalEntryId===original.id||t.journalEntryId===original.reversalJournalEntryId);
   if(pair.length&&pair.every(t=>selected.has(t.id)))pair.forEach(t=>legacyPairClearing.add(t.id));
  }
  if(r.clearedTransactionIds.some(id=>{const row=rows.get(id);return cleared.has(id)||!row||row.correctionIssue||(!legacyPairClearing.has(id)&&(row.correctionOnly||!bankJournalPostedAsAt(journalById.get(row.journalEntryId)!,journals,r.statementDate)));}))return ['Cleared rows are missing, reversed, internal offsets or duplicated across statements.'];
  r.clearedTransactionIds.forEach(id=>cleared.add(id));
  const calculation=calculateBankReconciliation(register,r.statementBalance,[...cleared]);
  const agrees=(c:ReturnType<typeof calculateBankReconciliation>)=>c.reconciled&&(['bookBalance','outstandingDeposits','outstandingPayments','adjustedStatementBalance','difference'] as const).every(k=>Number.isFinite(r[k])&&r[k]===c[k]);
  // Earlier versions counted exact classification cancellation pairs in gross outstanding totals.
  // Prove that exact old calculation as an alternative; preserve the saved statement unchanged.
  const legacyRegister={...register,transactions:register.transactions.map(t=>correctionProof.verifiedIds.has(t.journalEntryId)?{...t,correctionOnly:undefined}:t)};
  if(!agrees(calculation)&&!agrees(calculateBankReconciliation(legacyRegister,r.statementBalance,[...cleared])))reasons.push('Saved reconciliation totals do not match the current dated bank ledger: '+r.reconciliationNumber);
  previousDate=r.statementDate;
 }
 // Only the latest proved statement supplies clearing for imported rows through its date.
 if(!chain.length)return reasons;
 const date=chain.at(-1)!.statementDate,register=calculateBankRegister(bank,journals,date),rows=new Map(register.transactions.map(r=>[r.id,r])),matched=new Set<string>();
 for(const line of (input.statements??[]).filter(l=>l.bankAccountId===bank.id&&l.date<=date)){
  if(line.status==='UNMATCHED')reasons.push('Imported statement contains an unresolved line.');
  if(line.status==='MATCHED'||line.status==='POSTED'){
   if(line.ledgerIds.some(id=>bankRowClearedBeforeLine(reconciliations,bank.id,id,line.date)))reasons.push('Imported statement match reuses a ledger row already cleared in an earlier statement.');
   if(!line.ledgerIds.length||!unique(line.ledgerIds)||line.ledgerIds.some(id=>{const row=rows.get(id);return !cleared.has(id)||!row||row.correctionOnly||row.correctionIssue||!bankJournalPostedAsAt(journalById.get(row.journalEntryId)!,journals,line.date)||matched.has(id);})||money(line.ledgerIds.reduce((sum,id)=>sum+(rows.get(id)?.moneyIn??0)-(rows.get(id)?.moneyOut??0),0))!==line.amount)reasons.push('Imported statement match, amount or clearing is inconsistent.');
   line.ledgerIds.forEach(id=>matched.add(id));
  }
 }
 return reasons;
}
