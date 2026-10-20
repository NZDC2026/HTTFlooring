import type {FinancialOperation,FinancialRepairProposal} from './financialOperationJournal';
const kinds:readonly string[]=['CUSTOMER_PAYMENT','PAYMENT_REVERSAL','BANK_TRANSACTION','BANK_TRANSFER','BANK_RECONCILIATION','SALES_INVOICE_VOID','SALES_CREDIT_APPLY','SALES_CREDIT_REVERSAL','SALES_PAYMENT_REVERSAL'];
const states: readonly string[] = ['PENDING', 'COMPLETED', 'MANUAL_REVIEW'];
export const validFinancialOperations = (value: unknown): value is FinancialOperation[] =>
  Array.isArray(value) && value.every((v: unknown) => {
    if (!v || typeof v !== 'object') return false;
    const o = v as Record<string, unknown>;
    return typeof o.operationId === 'string' && o.operationId.length > 0 &&
      kinds.includes(String(o.kind)) && typeof o.fingerprint === 'string' && o.fingerprint.length > 0 &&
      states.includes(String(o.state)) && typeof o.createdAt === 'string' && typeof o.updatedAt === 'string' &&
      (o.resolution === undefined || (['CANCELLED_NO_EFFECT','BANK_RECORD_RESTORED','BANK_JOURNAL_RESTORED','BANK_JOURNAL_LINK_RESTORED','BANK_DUPLICATE_REVERSED'].includes(String(o.resolution)) && o.state==='COMPLETED' && typeof o.resultId==='string' && !!o.resultId && !!o.repairProposal && (o.repairProposal as Record<string,unknown>).status==='EXECUTED')) &&
      (o.repairProposal === undefined || validRepairProposal(o.repairProposal) && repairMatchesOperation(o)) &&
      (o.resultId === undefined || typeof o.resultId === 'string') &&
      (o.note === undefined || typeof o.note === 'string') &&
      (o.reviewHistory === undefined || (Array.isArray(o.reviewHistory) && o.reviewHistory.every((entry: unknown) => {
        if (!entry || typeof entry !== 'object') return false;
        const e = entry as Record<string, unknown>;
        return typeof e.reference === 'string' && e.reference.length >= 3 &&
          typeof e.operator === 'string' && e.operator.length >= 2 &&
          typeof e.recordedAt === 'string' && typeof e.summary === 'string' && e.summary.length >= 3;
      }))); 
  }) && new Set(value.map(v => v.operationId)).size === value.length && new Set(value.filter(v=>v.repairProposal).map(v=>v.repairProposal!.id)).size===value.filter(v=>v.repairProposal).length;

export function validRepairProposal(raw:unknown):raw is FinancialRepairProposal {
 if(!raw||typeof raw!=='object')return false;const p=raw as Record<string,unknown>;
 if(typeof p.reference!=='string'||p.reference.trim().length<3||typeof p.summary!=='string'||p.summary.trim().length<10||!Number.isFinite(Date.parse(String(p.proposedAt))))return false;
 return ['id','planJson','reviewer','reference','summary','proposedAt'].every(k=>typeof p[k]==='string'&&(p[k] as string).length>0) && typeof p.evidenceDigest==='string'&&/^[a-f0-9]{64}$/.test(p.evidenceDigest)&&['CANCEL_NO_EFFECT','RESTORE_BANK_RECORD','RESTORE_BANK_JOURNAL','RESTORE_BANK_JOURNAL_LINK','REVERSE_BANK_DUPLICATE'].includes(String(p.action))&&['PROPOSED','EXECUTED'].includes(String(p.status))&&(p.status!=='EXECUTED'||(['approver','approvalReference','executedAt','afterDigest'].every(k=>typeof p[k]==='string'&&(p[k] as string).length>0)&&String(p.approver).toLowerCase()!==String(p.reviewer).toLowerCase() && /^[a-f0-9]{64}$/.test(String(p.afterDigest))));
}
function repairMatchesOperation(o:Record<string,unknown>):boolean {
 try{if(!['BANK_TRANSACTION','BANK_TRANSFER'].includes(String(o.kind)))return false;const p=o.repairProposal as FinancialRepairProposal,plan=JSON.parse(p.planJson),history=o.reviewHistory as FinancialOperation['reviewHistory'];
 if(!history?.some(h=>h.reference===p.reference&&h.operator===p.reviewer)||!o.resultId||plan.operationId!==o.operationId||plan.resultId!==o.resultId||plan.action!==p.action||plan.evidenceDigest!==p.evidenceDigest||plan.eligible!==true)return false;
 if(p.action==='RESTORE_BANK_JOURNAL_LINK'&&(typeof plan.previousJournalId!=='string'||!plan.previousJournalId.trim()||typeof plan.existingJournalId!=='string'||!plan.existingJournalId.trim()||plan.previousJournalId===plan.existingJournalId||(p.status==='EXECUTED'&&p.resultJournalId!==plan.existingJournalId)))return false;
 if(p.action==='REVERSE_BANK_DUPLICATE'&&(typeof plan.duplicateJournalId!=='string'||!plan.duplicateJournalId.trim()||typeof plan.existingJournalId!=='string'||!plan.existingJournalId.trim()||plan.duplicateJournalId===plan.existingJournalId||(p.status==='EXECUTED'&&(!p.resultJournalId||p.resultJournalId===plan.duplicateJournalId||p.resultJournalId===plan.existingJournalId))))return false;
 if(p.status==='EXECUTED'){const resolution=p.action==='CANCEL_NO_EFFECT'?'CANCELLED_NO_EFFECT':p.action==='RESTORE_BANK_RECORD'?'BANK_RECORD_RESTORED':p.action==='REVERSE_BANK_DUPLICATE'?'BANK_DUPLICATE_REVERSED':p.action==='RESTORE_BANK_JOURNAL_LINK'?'BANK_JOURNAL_LINK_RESTORED':'BANK_JOURNAL_RESTORED';return o.state==='COMPLETED'&&o.resolution===resolution&&history.some(h=>h.reference===p.approvalReference&&h.operator===p.approver)&&Number.isFinite(Date.parse(p.executedAt!));}
 return o.resolution===undefined;
 }catch{return false;}
}
export function validateFinancialOperationStorage(storage:Record<string,string>):void {
 const raw=storage['htt:financial-operations:v1'];if(raw===undefined)return;
 try{const envelope=JSON.parse(raw);if(envelope.schemaVersion!==1||typeof envelope.savedAt!=='string'||!validFinancialOperations(envelope.data))throw new Error('Invalid operation registry.');}
 catch{throw new Error('Financial operation journal or repair evidence is invalid; recovery is blocked.');}
}
