import type {FinancialOperation,FinancialRepairProposal} from './financialOperationJournal';
const kinds:readonly string[]=['SOURCE_METADATA_REPAIR','CUSTOMER_PAYMENT','PAYMENT_REVERSAL','BANK_TRANSACTION','BANK_TRANSFER','BANK_RECONCILIATION','SALES_INVOICE_VOID','SALES_CREDIT_APPLY','SALES_CREDIT_REVERSAL','SALES_PAYMENT_REVERSAL'];
const states: readonly string[] = ['PENDING', 'COMPLETED', 'MANUAL_REVIEW'];
export const validFinancialOperations = (value: unknown): value is FinancialOperation[] =>
  Array.isArray(value) && value.every((v: unknown) => {
    if (!v || typeof v !== 'object') return false;
    const o = v as Record<string, unknown>;
    return typeof o.operationId === 'string' && o.operationId.length > 0 &&
      kinds.includes(String(o.kind)) && typeof o.fingerprint === 'string' && o.fingerprint.length > 0 &&
      states.includes(String(o.state)) && typeof o.createdAt === 'string' && typeof o.updatedAt === 'string' &&
      (o.resolution === undefined || (['SOURCE_METADATA_REPAIRED','CANCELLED_NO_EFFECT','BANK_RECORD_RESTORED','BANK_JOURNAL_RESTORED','BANK_JOURNAL_LINK_RESTORED','BANK_DUPLICATE_REVERSED'].includes(String(o.resolution)) && o.state==='COMPLETED' && typeof o.resultId==='string' && !!o.resultId && !!o.repairProposal && (o.repairProposal as Record<string,unknown>).status==='EXECUTED')) &&
      (o.repairProposal === undefined || validRepairProposal(o.repairProposal) && repairMatchesOperation(o)) &&
      (o.repairProposalHistory === undefined || Array.isArray(o.repairProposalHistory) && o.repairProposalHistory.every(p=>validRepairProposal(p)&&p.status==='PROPOSED'&&repairMatchesOperation({...o,repairProposal:p,resolution:undefined,state:'MANUAL_REVIEW'})&&(o.reviewHistory as FinancialOperation['reviewHistory'])?.some(h=>h.reference===p.reference&&h.operator===p.reviewer))) &&
      (o.resultId === undefined || typeof o.resultId === 'string') &&
      (o.note === undefined || typeof o.note === 'string') &&
      (o.reviewHistory === undefined || (Array.isArray(o.reviewHistory) && o.reviewHistory.every((entry: unknown) => {
        if (!entry || typeof entry !== 'object') return false;
        const e = entry as Record<string, unknown>;
        return typeof e.reference === 'string' && e.reference.length >= 3 &&
          typeof e.operator === 'string' && e.operator.length >= 2 &&
          typeof e.recordedAt === 'string' && typeof e.summary === 'string' && e.summary.length >= 3;
      }))); 
  }) && new Set(value.map(v => v.operationId)).size === value.length && new Set(value.filter(v=>v.repairProposal).map(v=>v.repairProposal!.id)).size===value.filter(v=>v.repairProposal).length && (()=>{const ids=value.flatMap(v=>[...(v.repairProposal?[v.repairProposal.id]:[]),...(v.repairProposalHistory??[]).map((p:FinancialRepairProposal)=>p.id)]);return new Set(ids).size===ids.length;})();

export function validRepairProposal(raw:unknown):raw is FinancialRepairProposal {
 if(!raw||typeof raw!=='object')return false;const p=raw as Record<string,unknown>;
 if(typeof p.reference!=='string'||p.reference.trim().length<3||typeof p.summary!=='string'||p.summary.trim().length<10||!Number.isFinite(Date.parse(String(p.proposedAt))))return false;
 return ['id','planJson','reviewer','reference','summary','proposedAt'].every(k=>typeof p[k]==='string'&&(p[k] as string).length>0) && typeof p.evidenceDigest==='string'&&/^[a-f0-9]{64}$/.test(p.evidenceDigest)&&['REPAIR_SOURCE_METADATA','CANCEL_NO_EFFECT','RESTORE_BANK_RECORD','RESTORE_BANK_JOURNAL','RESTORE_BANK_JOURNAL_LINK','REVERSE_BANK_DUPLICATE'].includes(String(p.action))&&['PROPOSED','EXECUTED'].includes(String(p.status))&&(p.status!=='EXECUTED'||(['approver','approvalReference','executedAt','afterDigest'].every(k=>typeof p[k]==='string'&&(p[k] as string).length>0)&&String(p.approver).toLowerCase()!==String(p.reviewer).toLowerCase() && /^[a-f0-9]{64}$/.test(String(p.afterDigest))));
}
function repairMatchesOperation(o:Record<string,unknown>):boolean {
 try{if(!['SOURCE_METADATA_REPAIR','BANK_TRANSACTION','BANK_TRANSFER'].includes(String(o.kind)))return false;const p=o.repairProposal as FinancialRepairProposal,plan=JSON.parse(p.planJson),history=o.reviewHistory as FinancialOperation['reviewHistory'];
 if(!history?.some(h=>h.reference===p.reference&&h.operator===p.reviewer)||!o.resultId||plan.operationId!==o.operationId||plan.resultId!==o.resultId||plan.action!==p.action||plan.evidenceDigest!==p.evidenceDigest||plan.eligible!==true)return false;
 if((o.kind==='SOURCE_METADATA_REPAIR')!==(p.action==='REPAIR_SOURCE_METADATA'))return false;
 if(p.action==='REPAIR_SOURCE_METADATA'&&!validSourceRepairChanges(plan.changes))return false;
 if(p.action==='RESTORE_BANK_JOURNAL_LINK'&&(typeof plan.previousJournalId!=='string'||!plan.previousJournalId.trim()||typeof plan.existingJournalId!=='string'||!plan.existingJournalId.trim()||plan.previousJournalId===plan.existingJournalId||(p.status==='EXECUTED'&&p.resultJournalId!==plan.existingJournalId)))return false;
 if(p.action==='REVERSE_BANK_DUPLICATE'&&(typeof plan.duplicateJournalId!=='string'||!plan.duplicateJournalId.trim()||typeof plan.existingJournalId!=='string'||!plan.existingJournalId.trim()||plan.duplicateJournalId===plan.existingJournalId||(p.status==='EXECUTED'&&(!p.resultJournalId||p.resultJournalId===plan.duplicateJournalId||p.resultJournalId===plan.existingJournalId))))return false;
 if(p.status==='EXECUTED'){const resolution=p.action==='REPAIR_SOURCE_METADATA'?'SOURCE_METADATA_REPAIRED':p.action==='CANCEL_NO_EFFECT'?'CANCELLED_NO_EFFECT':p.action==='RESTORE_BANK_RECORD'?'BANK_RECORD_RESTORED':p.action==='REVERSE_BANK_DUPLICATE'?'BANK_DUPLICATE_REVERSED':p.action==='RESTORE_BANK_JOURNAL_LINK'?'BANK_JOURNAL_LINK_RESTORED':'BANK_JOURNAL_RESTORED';return o.state==='COMPLETED'&&o.resolution===resolution&&history.some(h=>h.reference===p.approvalReference&&h.operator===p.approver)&&Number.isFinite(Date.parse(p.executedAt!));}
 return o.resolution===undefined;
 }catch{return false;}
}
export function validateFinancialOperationStorage(storage:Record<string,string>):void {
 const raw=storage['htt:financial-operations:v1'];if(raw===undefined)return;
 try{const envelope=JSON.parse(raw);if(envelope.schemaVersion!==1||typeof envelope.savedAt!=='string'||!validFinancialOperations(envelope.data))throw new Error('Invalid operation registry.');}
 catch{throw new Error('Financial operation journal or repair evidence is invalid; recovery is blocked.');}
}

/** Stored plans are evidence, never executable renderer-supplied patches. */
function validSourceRepairChanges(changes:unknown):boolean {
 if(!Array.isArray(changes)||!changes.length||changes.length>10000)return false;
 const keys=(v:unknown,wanted:string[])=>!!v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).sort().join('|')===[...wanted].sort().join('|');
 const amount=(v:unknown)=>typeof v==='number'&&Number.isFinite(v);
 return changes.every(c=>{
  if(!c||typeof c.id!=='string'||!c.id.trim()||c.id.length>200||typeof c.path!=='string'||!Array.isArray(c.evidence)||!c.evidence.every((e:unknown)=>typeof e==='string')||!keys(c,['kind','id','path','before','after','evidence']))return false;
  if(c.kind==='OPERATION')return keys(c.before,['state','resultId'])&&keys(c.after,['state','resultId'])&&['PENDING','MANUAL_REVIEW'].includes(c.before.state)&&(c.before.resultId===null||typeof c.before.resultId==='string')&&c.after.state==='COMPLETED'&&typeof c.after.resultId==='string'&&!!c.after.resultId.trim();
  if(c.kind==='PURCHASE_OPERATION')return keys(c.before,['status','error'])&&keys(c.after,['status','error'])&&['PENDING','POSTING','FAILED','RECOVERY_REQUIRED','POSTED'].includes(c.before.status)&&(c.before.error===null||typeof c.before.error==='string')&&c.after.status==='POSTED'&&c.after.error===null;
  const fields=c.kind==='INVOICE'?['amountPaid','amountDue','status']:c.kind==='BILL'?['amountPaid','amountCredited','amountDue','status']:['CUSTOMER_CREDIT','SUPPLIER_CREDIT'].includes(c.kind)?['amountApplied','amountAvailable','status']:undefined;
  if(!fields||!keys(c.before,fields)||!keys(c.after,fields))return false;
  const statuses=c.kind==='INVOICE'?['ISSUED','OVERDUE','PARTIALLY_PAID','PAID']:c.kind==='BILL'?['OPEN','PARTIALLY_PAID','PAID']:['ISSUED','FULLY_APPLIED'];
  return statuses.includes(c.before.status)&&statuses.includes(c.after.status)&&fields.filter(f=>f!=='status').every(f=>amount(c.before[f])&&amount(c.after[f])&&c.after[f]>=0&&Number.isSafeInteger(Math.round(c.after[f]*100))&&c.after[f]===Math.round(c.after[f]*100)/100);
 });
}
