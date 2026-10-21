import type {JournalEntry} from '../../accounting/types/journalEntry';
import {requireDateKey} from '../../../lib/businessDate';
const money=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
const valid=(j:JournalEntry)=>j.lines.length>=2&&new Set(j.lines.map(l=>l.id)).size===j.lines.length&&j.totalDebit>0&&j.totalDebit===j.totalCredit&&j.lines.every(l=>Number.isFinite(l.debit)&&Number.isFinite(l.credit)&&l.debit>=0&&l.credit>=0&&money(l.debit)===l.debit&&money(l.credit)===l.credit&&!(l.debit&&l.credit))&&money(j.lines.reduce((n,l)=>n+l.debit,0))===j.totalDebit&&money(j.lines.reduce((n,l)=>n+l.credit,0))===j.totalCredit;
const signature=(j:JournalEntry,opposite=false)=>JSON.stringify(j.lines.map(l=>[l.accountId,l.description??null,opposite?l.credit:l.debit,opposite?l.debit:l.credit]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))));
/** Derive internal categorisation cancellations from existing owner/lifecycle evidence.
 * Only an exact same-date pair is zero-net in every financial reporting window. */
export function statementCorrectionEvidence(journals:readonly JournalEntry[]){
 const verifiedIds=new Set<string>(),reviewIds=new Set<string>(),issues:{journalId:string;message:string}[]=[];
 const originals=journals.filter(j=>j.sourceType==='BANK_STATEMENT'&&!j.reversedJournalEntryId&&(j.status==='REVERSED'||j.reversalJournalEntryId||j.reversedAt));
 const fail=(j:JournalEntry,related:string[],message:string)=>{reviewIds.add(j.id);related.forEach(id=>reviewIds.add(id));issues.push({journalId:j.id,message});};
 for(const j of originals){
  const matches=journals.filter(r=>r.id===j.reversalJournalEntryId),r=matches[0];
  if(journals.filter(v=>v.id===j.id).length!==1||matches.length!==1||j.status!=='REVERSED'||!j.sourceId||!/^.+:\d+$/.test(j.sourceId)||!j.reversalReason?.trim()||!Number.isFinite(Date.parse(j.reversedAt??''))||j.reversedAt!==r.postedAt||r.status!=='POSTED'||r.sourceType!=='BANK_STATEMENT'||r.sourceId!==undefined||r.reversedJournalEntryId!==j.id||journals.filter(v=>v.reversalJournalEntryId===r.id).length!==1||r.reversalJournalEntryId||r.reversedAt||j.reference!==r.reference||journals.filter(v=>v.reversedJournalEntryId===j.id).length!==1||!valid(j)||!valid(r)||j.totalDebit!==r.totalCredit||j.totalCredit!==r.totalDebit||signature(j,true)!==signature(r)){
   fail(j,[...(j.reversalJournalEntryId?[j.reversalJournalEntryId]:[]),...journals.filter(v=>v.reversedJournalEntryId===j.id).map(v=>v.id)],'Bank categorisation reversal has incomplete or inconsistent owner, lifecycle or amount evidence.');continue;
  }
  try{requireDateKey(j.journalDate);requireDateKey(r.journalDate);}catch{fail(j,[r.id],'Bank categorisation reversal has an invalid financial date.');continue;}
  if(j.journalDate!==r.journalDate){fail(j,[r.id],'Bank categorisation reversal crosses financial dates; review a validated backup or a separate approved accounting correction.');continue;}
  verifiedIds.add(j.id);verifiedIds.add(r.id);
 }
 for(const r of journals.filter(j=>j.sourceType==='BANK_STATEMENT'&&j.reversedJournalEntryId)){
  if(!originals.some(j=>j.id===r.reversedJournalEntryId))fail(r,[r.reversedJournalEntryId!],'Bank categorisation offset has no verified original owner.');
 }
 for(const id of reviewIds)verifiedIds.delete(id);
 return {verifiedIds,reviewIds,issues};
}
