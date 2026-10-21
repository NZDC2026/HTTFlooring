import {bankJournalLifecycleIssues} from '../../banking/data/bankJournalEvidence';
import type {JournalEntry} from '../types/journalEntry';
const validPosting=(j:JournalEntry)=>j.lines.length===2&&new Set(j.lines.map(l=>l.id)).size===2&&Number.isFinite(j.totalDebit)&&j.totalDebit>0&&j.totalDebit===j.totalCredit&&Math.abs(j.totalDebit*100-Math.round(j.totalDebit*100))<1e-6&&j.lines.every(l=>Number.isFinite(l.debit)&&Number.isFinite(l.credit)&&((l.debit===j.totalDebit&&l.credit===0)||(l.credit===j.totalCredit&&l.debit===0)))&&j.lines[0].accountId!==j.lines[1].accountId&&j.lines.reduce((n,l)=>n+l.debit,0)===j.totalDebit&&j.lines.reduce((n,l)=>n+l.credit,0)===j.totalCredit;
const signature=(j:JournalEntry,invert=false)=>JSON.stringify(j.lines.map(l=>[l.accountId,l.description??null,invert?l.credit:l.debit,invert?l.debit:l.credit]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))));
export function sameBankPosting(a:JournalEntry,b:JournalEntry):boolean {
 return validPosting(a)&&validPosting(b)&&['BANK_TRANSACTION','BANK_TRANSFER'].includes(a.sourceType)&&a.sourceType===b.sourceType&&!!a.sourceId&&a.sourceId===b.sourceId&&a.journalDate===b.journalDate&&a.description===b.description&&a.reference===b.reference&&a.totalDebit===b.totalDebit&&a.totalCredit===b.totalCredit&&signature(a)===signature(b);
}
/** Only an exact, same-date, zero-net correction can be excluded from source cardinality.
 * Both original and offset remain in GL and bank registers. Invalid metadata never suppresses evidence. */
export function bankDuplicateCorrections(journals:readonly JournalEntry[]){
 const originals=new Set<string>(),offsets=new Set<string>(),invalid:string[]=[];
 const marked=journals.filter(j=>j.bankDuplicateCorrection!==undefined);
 if(!marked.length)return {originals,offsets,invalid};
 const lifecycleIssues=bankJournalLifecycleIssues(journals),unique=(id:string)=>journals.filter(j=>j.id===id);
 for(const j of marked){
  const m=j.bankDuplicateCorrection,c=m&&unique(m.canonicalJournalId),r=j.reversalJournalEntryId&&unique(j.reversalJournalEntryId);
  if(!m||typeof m.operationId!=='string'||!m.operationId.trim()||!c||c.length!==1||!r||r.length!==1||unique(j.id).length!==1){invalid.push(j.id);continue;}
  const canonical=c[0],reverse=r[0];
  if([canonical.id,j.id,reverse.id].some(id=>lifecycleIssues.has(id))||canonical.id===j.id||canonical.bankDuplicateCorrection||canonical.status!=='POSTED'||canonical.reversedJournalEntryId||canonical.reversalJournalEntryId||canonical.reversedAt||j.status!=='REVERSED'||j.reversedJournalEntryId||!j.reversalReason?.trim()||!j.reversedAt||j.reversedAt!==reverse.postedAt||!sameBankPosting(j,canonical)||reverse.status!=='POSTED'||reverse.bankDuplicateCorrection||reverse.sourceType!==j.sourceType||reverse.sourceId!==undefined||reverse.journalDate!==j.journalDate||reverse.reference!==j.reference||reverse.reversedJournalEntryId!==j.id||reverse.reversalJournalEntryId||reverse.reversedAt||reverse.totalDebit!==j.totalCredit||reverse.totalCredit!==j.totalDebit||signature(reverse)!==signature(j,true)||journals.filter(v=>v.reversedJournalEntryId===j.id).length!==1||journals.some(v=>v.reversedJournalEntryId===canonical.id))invalid.push(j.id);
  else{originals.add(j.id);offsets.add(reverse.id);}
 }
 return {originals,offsets,invalid};
}
