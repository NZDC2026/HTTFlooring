import type {JournalEntry} from '../../accounting/types/journalEntry';
import {requireDateKey} from '../../../lib/businessDate';
const money=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
const validPosting=(j:JournalEntry)=>j.lines.length>=2&&new Set(j.lines.map(l=>l.id)).size===j.lines.length&&Number.isFinite(j.totalDebit)&&j.totalDebit>0&&j.totalDebit===j.totalCredit&&money(j.totalDebit)===j.totalDebit&&j.lines.every(l=>Number.isFinite(l.debit)&&Number.isFinite(l.credit)&&l.debit>=0&&l.credit>=0&&money(l.debit)===l.debit&&money(l.credit)===l.credit&&!(l.debit&&l.credit))&&money(j.lines.reduce((n,l)=>n+l.debit,0))===j.totalDebit&&money(j.lines.reduce((n,l)=>n+l.credit,0))===j.totalCredit;
const signature=(j:JournalEntry,invert=false)=>JSON.stringify(j.lines.map(l=>[l.accountId,l.description??null,invert?l.credit:l.debit,invert?l.debit:l.credit]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))));
function validPair(original:JournalEntry|undefined,offset:JournalEntry|undefined,journals:readonly JournalEntry[]):boolean {
 if(!original||!offset||original.id===offset.id||journals.filter(j=>j.id===original.id).length!==1||journals.filter(j=>j.id===offset.id).length!==1)return false;
 if(original.status!=='REVERSED'||original.reversedJournalEntryId||!original.reversalReason?.trim()||!Number.isFinite(Date.parse(original.reversedAt??''))||original.reversedAt!==offset.postedAt||original.reversalJournalEntryId!==offset.id||offset.status!=='POSTED'||offset.reversedJournalEntryId!==original.id||offset.reversalJournalEntryId||offset.reversedAt||offset.sourceType!==original.sourceType||offset.sourceId!==undefined||offset.reference!==original.reference)return false;
 if(journals.filter(j=>j.reversedJournalEntryId===original.id).length!==1||journals.filter(j=>j.reversalJournalEntryId===offset.id).length!==1)return false;
 try{requireDateKey(original.journalDate);requireDateKey(offset.journalDate);}catch{return false;}
 return offset.journalDate>=original.journalDate&&validPosting(original)&&validPosting(offset)&&original.totalDebit===offset.totalCredit&&original.totalCredit===offset.totalDebit&&signature(original,true)===signature(offset);
}
/** Both ends must prove one exact reversal; a POSTED offset alone is insufficient. */
function verifiedLifecycle(journal:JournalEntry,journals:readonly JournalEntry[]):boolean {
 if(journals.filter(j=>j.id===journal.id).length!==1)return false;
 if(journal.reversedJournalEntryId)return validPair(journals.find(j=>j.id===journal.reversedJournalEntryId),journal,journals);
 if(journal.status==='REVERSED'||journal.reversalJournalEntryId||journal.reversedAt)return validPair(journal,journals.find(j=>j.id===journal.reversalJournalEntryId),journals);
 return journal.status==='POSTED'&&!journals.some(j=>j.reversedJournalEntryId===journal.id||j.reversalJournalEntryId===journal.id);
}
export function bankJournalLifecycleIssues(journals:readonly JournalEntry[]):Set<string> {
 return new Set(journals.filter(j=>!verifiedLifecycle(j,journals)).map(j=>j.id));
}
/** A later legitimate reversal preserves an earlier statement, but only until its financial date. */
export function bankJournalPostedAsAt(journal:JournalEntry,journals:readonly JournalEntry[],date:string):boolean {
 try{requireDateKey(journal.journalDate);requireDateKey(date);}catch{return false;}
 if(journal.journalDate>date||!verifiedLifecycle(journal,journals))return false;
 return journal.status==='POSTED'||journals.find(j=>j.id===journal.reversalJournalEntryId)!.journalDate>date;
}
