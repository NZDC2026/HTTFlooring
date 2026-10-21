import {it,expect} from 'vitest';
import type {JournalEntry} from '../types/journalEntry';
import {bankDuplicateCorrections} from './bankDuplicateCorrection';
import {auditFinancialConsistency} from '../../../lib/persistence/financialConsistencyAudit';
function fixture(){
 const now='2026-10-20T00:00:00.000Z';
 const canonical:JournalEntry={id:'canonical',journalNumber:'J-1',journalDate:'2026-10-10',description:'Bank receipt',sourceType:'BANK_TRANSACTION',sourceId:'bank-result',status:'POSTED',lines:[{id:'l1',accountId:'bank',accountCode:'1000',accountName:'Bank',debit:10,credit:0},{id:'l2',accountId:'expense',accountCode:'5300',accountName:'Expense',debit:0,credit:10}],totalDebit:10,totalCredit:10,createdAt:now,updatedAt:now,postedAt:now};
 const original:JournalEntry={...structuredClone(canonical),id:'duplicate',journalNumber:'J-2',status:'REVERSED',reversedAt:now,reversalJournalEntryId:'offset',reversalReason:'Approved duplicate correction',bankDuplicateCorrection:{canonicalJournalId:canonical.id,operationId:'repair-case'}};
 const offset:JournalEntry={...structuredClone(canonical),id:'offset',journalNumber:'J-3',description:'Reversal of J-2',sourceId:undefined,reversedJournalEntryId:original.id,lines:original.lines.map(l=>({...l,debit:l.credit,credit:l.debit}))};
 return{canonical,original,offset,journals:[original,canonical,offset]};
}
it('recognizes only the exact original/offset pair and leaves all journals visible',()=>{
 const {journals}=fixture(),before=structuredClone(journals),proof=bankDuplicateCorrections(journals);expect([...proof.originals]).toEqual(['duplicate']);expect([...proof.offsets]).toEqual(['offset']);expect(proof.invalid).toEqual([]);expect(journals).toEqual(before);
});
it.each(['canonical-link','operation','missing-offset','offset-date','offset-amount','offset-source','offset-status','offset-link','canonical-status','canonical-reversal','original-status','original-link','original-date','another-offset','duplicate-identity','line-identity','line-account'])('never suppresses %s corrupt correction evidence',mode=>{
 const f=fixture(),{canonical:c,original:o,offset:r,journals:j}=f;
 if(mode==='canonical-link')o.bankDuplicateCorrection!.canonicalJournalId=o.id;
 if(mode==='operation')o.bankDuplicateCorrection!.operationId='';
 if(mode==='missing-offset')j.pop();if(mode==='offset-date')r.journalDate='2026-10-11';if(mode==='offset-amount')r.lines[0].credit=11;if(mode==='offset-source')r.sourceId=o.sourceId;if(mode==='offset-status')r.status='REVERSED';if(mode==='offset-link')r.reversedJournalEntryId=c.id;if(mode==='canonical-status')c.status='REVERSED';if(mode==='canonical-reversal')c.reversalJournalEntryId='another';if(mode==='original-status')o.status='POSTED';if(mode==='original-link')o.reversalJournalEntryId=c.id;if(mode==='original-date')o.journalDate='2026-10-11';if(mode==='another-offset')j.push({...r,id:'other-offset'});if(mode==='duplicate-identity')j.push({...c});if(mode==='line-identity')o.lines[1].id=o.lines[0].id;if(mode==='line-account')o.lines[0].accountId=o.lines[1].accountId;
 const proof=bankDuplicateCorrections(j);expect(proof.invalid).toContain(o.id);expect(proof.originals.size).toBe(0);expect(proof.offsets.size).toBe(0);
 const issues=auditFinancialConsistency({transactions:[],transfers:[],payments:[],journals:j});expect(issues.some(i=>i.code==='DUPLICATE_SOURCE')).toBe(true);expect(issues.some(i=>i.code==='REVERSAL_MISMATCH')).toBe(true);
});
it.each(['shared-offset-owner','canonical-offset-claim','invalid-stamp','offset-line-identity','invalid-financial-date'])('keeps %s visible to global duplicate-source and reversal auditing',mode=>{
 const {canonical:c,original:o,offset:r,journals}=fixture();
 if(mode==='shared-offset-owner')journals.push({...structuredClone(o),id:'foreign-owner',sourceType:'MANUAL_JOURNAL',sourceId:undefined,bankDuplicateCorrection:undefined});
 if(mode==='canonical-offset-claim')journals.push({...structuredClone(o),id:'foreign-owner',sourceType:'MANUAL_JOURNAL',sourceId:undefined,bankDuplicateCorrection:undefined,reversalJournalEntryId:c.id});
 if(mode==='invalid-stamp'){o.reversedAt='invalid';r.postedAt='invalid';}
 if(mode==='offset-line-identity')r.lines[1].id=r.lines[0].id;
 if(mode==='invalid-financial-date')journals.forEach(j=>j.journalDate='2026-02-30');
 const before=structuredClone(journals),proof=bankDuplicateCorrections(journals);expect(proof.invalid).toContain(o.id);expect(proof.originals.size).toBe(0);expect(proof.offsets.size).toBe(0);
 const issues=auditFinancialConsistency({transactions:[],transfers:[],payments:[],journals});expect(issues.some(i=>i.code==='DUPLICATE_SOURCE')).toBe(true);expect(issues.some(i=>i.code==='REVERSAL_MISMATCH'&&i.entityId===o.id)).toBe(true);expect(journals).toEqual(before);
});
