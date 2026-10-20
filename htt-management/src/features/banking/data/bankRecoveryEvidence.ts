import { financialOperationJournal } from '../../../lib/persistence/financialOperationJournal';
import { bankTransactionRepository } from './bankTransactionRepository';
import { bankAccountRepository } from './bankAccountRepository';
import { accountRepository } from '../../accounting/data/accountRepository';
import { journalEntryRepository } from '../../accounting/data/journalEntryRepository';
import { requireDateKey } from '../../../lib/businessDate';

export const isBankRecoveryKind = (kind:string) => kind==='BANK_TRANSACTION'||kind==='BANK_TRANSFER';
/** Verify only already-posted effects. An intent, checklist or balanced total alone is insufficient. */
export function verifyBankClosureEvidence(operationId:string):string[] {
 const operations=financialOperationJournal.list(),matches=operations.filter(o=>o.operationId===operationId);
 if(matches.length!==1)return ['Bank operation identity is missing or duplicated.'];
 const op=matches[0],reasons:string[]=[];
 if(!isBankRecoveryKind(op.kind)||op.state!=='MANUAL_REVIEW')reasons.push('Operation is not an unresolved bank review.');
 if(!op.resultId)reasons.push('Operation has no durable bound result; cannot infer effects.');
 if(!op.reviewHistory?.length)reasons.push('Operator reconciliation evidence is missing.');
 if(reasons.length)return reasons;
 const transactions=bankTransactionRepository.getTransactions(),transfers=bankTransactionRepository.getTransfers(),journals=journalEntryRepository.getAll();
 const records=op.kind==='BANK_TRANSACTION'?transactions:transfers;
 if(records.filter(r=>r.id===op.resultId).length!==1)return ['Bank business result is missing or duplicated.'];
 const t=transactions.find(t=>t.id===op.resultId),f=transfers.find(t=>t.id===op.resultId),record=records.find(r=>r.id===op.resultId)!;
 const unique=(ids:string[])=>new Set(ids).size===ids.length;
 if(!unique(journals.map(j=>j.id))||!unique(records.map(r=>r.id)))return ['Duplicate bank or GL identity; evidence is ambiguous.'];
 const originals=journals.filter(j=>j.sourceType===op.kind&&j.sourceId===op.resultId);
 if(originals.length!==1)return ['Bank result must have exactly one source journal.'];
 const j=originals[0];
 if(j.id!==record.journalEntryId||j.status!=='POSTED'||j.reversedJournalEntryId||j.reversalJournalEntryId||j.reversedAt||journals.some(r=>r.reversedJournalEntryId===j.id))reasons.push('Bank journal link or posted lifecycle is not verified; reversed effects require separate repair.');
 const date=op.kind==='BANK_TRANSACTION'?t!.transactionDate:f!.transferDate;
 try{requireDateKey(date,'Bank result date');}catch{reasons.push('Bank result date is invalid.');}
 const cents=(n:number)=>Math.round((n+Number.EPSILON)*100),amount=record.amount;
 if(!Number.isFinite(amount)||amount<=0||Math.abs(amount-cents(amount)/100)>1e-8)reasons.push('Bank amount must be positive whole cents.');
 if(j.journalDate!==date||j.description!==record.description||j.reference!==record.reference)reasons.push('Journal date, description or reference differs from the bank result.');
 let debit:string|undefined,credit:string|undefined;
 const accounts=accountRepository.getAll();
 if(op.kind==='BANK_TRANSACTION'){
  const bank=bankAccountRepository.getById(t!.bankAccountId),offset=accounts.find(a=>a.id===t!.offsetAccountId);
  if(!bank||!offset||!offset.allowManualPosting||bank.glAccountId===offset.id||bankAccountRepository.getByGlAccountId(offset.id)||date<bank.openingBalanceDate)reasons.push('Bank or offset account mapping is invalid.');
  if(!['MONEY_IN','MONEY_OUT'].includes(t!.direction))reasons.push('Bank direction is invalid.');
  debit=t!.direction==='MONEY_IN'?bank?.glAccountId:offset?.id;credit=t!.direction==='MONEY_IN'?offset?.id:bank?.glAccountId;
 }else{
  const from=bankAccountRepository.getById(f!.fromBankAccountId),to=bankAccountRepository.getById(f!.toBankAccountId);
  if(!from||!to||from.id===to.id||from.glAccountId===to.glAccountId||from.currency!==to.currency||date<from.openingBalanceDate||date<to.openingBalanceDate)reasons.push('Transfer bank mappings, currency or dates are invalid.');
  debit=to?.glAccountId;credit=from?.glAccountId;
 }
 if(!debit||!credit||!accounts.some(a=>a.id===debit)||!accounts.some(a=>a.id===credit)||j.lines.length!==2||!j.lines.every(l=>Number.isFinite(l.debit)&&Number.isFinite(l.credit)&&l.debit>=0&&l.credit>=0)||!j.lines.some(l=>l.accountId===debit&&l.debit===amount&&l.credit===0)||!j.lines.some(l=>l.accountId===credit&&l.credit===amount&&l.debit===0)||j.totalDebit!==amount||j.totalCredit!==amount)reasons.push('Bank journal accounts, direction or amounts do not exactly match the bound result.');
 // The saved intent must describe this result, rather than merely point at another valid posting.
 try{
  const input=JSON.parse(op.fingerprint),optional=(v:unknown)=>typeof v==='string'?(v.trim()||undefined):undefined;
  if(!input||typeof input!=='object'||!Number.isFinite(input.amount)||cents(input.amount)!==cents(amount)||typeof input.description!=='string'||input.description.trim()!==record.description||optional(input.reference)!==record.reference||
   (op.kind==='BANK_TRANSACTION'?(input.bankAccountId!==t!.bankAccountId||input.transactionDate!==date||input.direction!==t!.direction||input.offsetAccountId!==t!.offsetAccountId):(input.fromBankAccountId!==f!.fromBankAccountId||input.toBankAccountId!==f!.toBankAccountId||input.transferDate!==date)))reasons.push('Saved bank intent does not match the bound business result.');
 }catch{reasons.push('Saved bank intent is unreadable; cannot verify original request.');}
 if(operations.some(o=>o.operationId!==op.operationId&&o.kind===op.kind&&o.resultId===op.resultId))reasons.push('Another operation claims this bank result.');
 return reasons;
}
