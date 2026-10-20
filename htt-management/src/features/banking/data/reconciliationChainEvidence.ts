import type {BankAccount} from '../types/bankAccount';
import type {BankReconciliation} from '../types/bankReconciliation';
import type {JournalEntry} from '../../accounting/types/journalEntry';
import type {StatementLine} from '../../finance-closure/bankStatementRepository';
import {calculateBankRegister} from './bankRegisterService';
import {calculateBankReconciliation} from './bankReconciliationService';
import {requireDateKey} from '../../../lib/businessDate';
const unique=(ids:string[])=>new Set(ids).size===ids.length;
const money=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
/** A later legitimate reversal does not invalidate an earlier completed statement.
 * A reversed original may only count before its exact linked offset's financial date. */
export function bankJournalPostedAsAt(journal:JournalEntry,journals:readonly JournalEntry[],date:string):boolean {
 try{requireDateKey(journal.journalDate);requireDateKey(date);}catch{return false;}
 if(journal.journalDate>date)return false;
 if(journal.status==='POSTED')return !journal.reversalJournalEntryId&&!journal.reversedAt;
 const offsets=journals.filter(j=>j.id===journal.reversalJournalEntryId),offset=offsets[0];
 if(journal.status!=='REVERSED'||!journal.reversedAt||!journal.reversalReason?.trim()||journal.reversedJournalEntryId||offsets.length!==1||offset.status!=='POSTED'||offset.reversedJournalEntryId!==journal.id||offset.reversalJournalEntryId||offset.reversedAt||offset.journalDate<=date||offset.journalDate<journal.journalDate||offset.totalDebit!==journal.totalCredit||offset.totalCredit!==journal.totalDebit)return false;
 try{requireDateKey(offset.journalDate);}catch{return false;}
 const signature=(j:JournalEntry,invert=false)=>JSON.stringify(j.lines.map(l=>[l.accountId,invert?l.credit:l.debit,invert?l.debit:l.credit]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))));
 return signature(journal,true)===signature(offset)&&journals.filter(j=>j.reversedJournalEntryId===journal.id).length===1;
}
/** Read-only proof shared by recovery, subsequent reconciliation and period close.
 * Recompute every saved statement from dated GL and incremental clearing; never repair totals. */
export function verifyReconciliationChain(input:{bank:BankAccount;journals:JournalEntry[];reconciliations:BankReconciliation[];throughDate:string;statements?:StatementLine[]}):string[]{
 const {bank,journals,reconciliations,throughDate}=input,reasons:string[]=[];
 requireDateKey(throughDate,'Reconciliation proof date');requireDateKey(bank.openingBalanceDate,'Bank opening date');
 if(!unique(reconciliations.map(r=>r.id))||!unique(journals.map(j=>j.id))||!unique(journals.flatMap(j=>j.lines.map(l=>j.id+':'+l.id))))return ['Duplicate reconciliation or ledger row identity.'];
 for(const r of reconciliations.filter(r=>r.bankAccountId===bank.id)){try{requireDateKey(r.statementDate);}catch{return ['Reconciliation statement date is invalid.'];}}
 const chain=reconciliations.filter(r=>r.bankAccountId===bank.id&&r.statementDate<=throughDate).sort((a,b)=>a.statementDate.localeCompare(b.statementDate)),cleared=new Set<string>(),journalById=new Map(journals.map(j=>[j.id,j]));
 let previousDate='';
 for(const r of chain){
  try{requireDateKey(r.statementDate,'Statement date');}catch{return ['Reconciliation statement date is invalid.'];}
  if(r.status!=='COMPLETED'||r.statementDate<=previousDate||r.statementDate<bank.openingBalanceDate||!Number.isFinite(r.statementBalance)||money(r.statementBalance)!==r.statementBalance||!unique(r.clearedTransactionIds))return ['Reconciliation sequence, status, balance or cleared identities are invalid.'];
  const register=calculateBankRegister(bank,journals,r.statementDate),rows=new Map(register.transactions.map(t=>[t.id,t]));
  if(r.clearedTransactionIds.some(id=>{const row=rows.get(id);return cleared.has(id)||!row||row.correctionOnly||!bankJournalPostedAsAt(journalById.get(row.journalEntryId)!,journals,r.statementDate);}))return ['Cleared rows are missing, reversed, internal offsets or duplicated across statements.'];
  r.clearedTransactionIds.forEach(id=>cleared.add(id));
  const calculation=calculateBankReconciliation(register,r.statementBalance,[...cleared]);
  if(!calculation.reconciled||(['bookBalance','outstandingDeposits','outstandingPayments','adjustedStatementBalance','difference'] as const).some(k=>!Number.isFinite(r[k])||r[k]!==calculation[k]))reasons.push('Saved reconciliation totals do not match the current dated bank ledger: '+r.reconciliationNumber);
  previousDate=r.statementDate;
 }
 // Only the latest proved statement supplies clearing for imported rows through its date.
 if(!chain.length)return reasons;
 const date=chain.at(-1)!.statementDate,register=calculateBankRegister(bank,journals,date),rows=new Map(register.transactions.map(r=>[r.id,r])),matched=new Set<string>();
 for(const line of (input.statements??[]).filter(l=>l.bankAccountId===bank.id&&l.date<=date)){
  if(line.status==='UNMATCHED')reasons.push('Imported statement contains an unresolved line.');
  if(line.status==='MATCHED'||line.status==='POSTED'){
   if(!line.ledgerIds.length||!unique(line.ledgerIds)||line.ledgerIds.some(id=>{const row=rows.get(id);return !cleared.has(id)||!row||row.correctionOnly||!bankJournalPostedAsAt(journalById.get(row.journalEntryId)!,journals,line.date)||matched.has(id);})||money(line.ledgerIds.reduce((sum,id)=>sum+(rows.get(id)?.moneyIn??0)-(rows.get(id)?.moneyOut??0),0))!==line.amount)reasons.push('Imported statement match, amount or clearing is inconsistent.');
   line.ledgerIds.forEach(id=>matched.add(id));
  }
 }
 return reasons;
}
