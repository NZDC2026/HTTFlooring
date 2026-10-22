import {validFinancialOperations,validRepairProposal} from './financialOperationValidation';
import { registerRepository } from "../../features/security/repositoryHost";
/**
 * Durable, fail-closed operation intent registry for the local Mock environment.
 * NOT a multi-repository atomic transaction and NOT an automatic replay engine.
 * Call begin BEFORE business writes, complete AFTER all effects are verified.
 * On restart, unresolved operations are MANUAL_REVIEW, never replayed blindly.
 */
import { canWriteMockRepository, readMockRepository, writeMockRepository } from './mockRepositoryStorage';

export type FinancialOperationKind = 'SOURCE_METADATA_REPAIR' | 'CUSTOMER_PAYMENT' | 'PAYMENT_REVERSAL' | 'BANK_TRANSACTION' | 'BANK_TRANSFER' | 'BANK_RECONCILIATION' | 'SALES_INVOICE_VOID' | 'SALES_CREDIT_APPLY' | 'SALES_CREDIT_REVERSAL' | 'SALES_PAYMENT_REVERSAL';
export type FinancialOperationState = 'PENDING' | 'COMPLETED' | 'MANUAL_REVIEW';
export type FinancialRepairAction = 'REPAIR_SOURCE_METADATA' | 'CANCEL_NO_EFFECT' | 'RESTORE_BANK_RECORD' | 'RESTORE_BANK_JOURNAL' | 'RESTORE_BANK_JOURNAL_LINK' | 'REVERSE_BANK_DUPLICATE';
export type FinancialRepairProposal = { id:string; action:FinancialRepairAction; evidenceDigest:string; planJson:string; reviewer:string; reference:string; summary:string; proposedAt:string; status:'PROPOSED'|'EXECUTED'; approver?:string; approvalReference?:string; executedAt?:string; afterDigest?:string; resultJournalId?:string };
export type FinancialOperation = {
  repairProposal?: FinancialRepairProposal;
  repairProposalHistory?: FinancialRepairProposal[];
  resolution?: 'SOURCE_METADATA_REPAIRED' | 'CANCELLED_NO_EFFECT' | 'BANK_RECORD_RESTORED' | 'BANK_JOURNAL_RESTORED' | 'BANK_JOURNAL_LINK_RESTORED' | 'BANK_DUPLICATE_REVERSED';
  operationId: string;
  kind: FinancialOperationKind;
  fingerprint: string;
  state: FinancialOperationState;
  createdAt: string;
  updatedAt: string;
  resultId?: string;
  note?: string;
  reviewHistory?: ReadonlyArray<{ reference: string; operator: string; recordedAt: string; summary: string }>;
};
export type BeginOperationResult = { status: 'started'; operation: FinancialOperation } | { status: 'already_completed'; operation: FinancialOperation } | { status: 'needs_review'; operation: FinancialOperation };

const KEY = 'htt:financial-operations:v1';
const kinds: readonly string[] = ['SOURCE_METADATA_REPAIR','CUSTOMER_PAYMENT', 'PAYMENT_REVERSAL', 'BANK_TRANSACTION', 'BANK_TRANSFER', 'BANK_RECONCILIATION', 'SALES_INVOICE_VOID', 'SALES_CREDIT_APPLY', 'SALES_CREDIT_REVERSAL', 'SALES_PAYMENT_REVERSAL'];
function load(): FinancialOperation[] {
  const result = readMockRepository(KEY, validFinancialOperations);
  if (result.status === 'ok') return result.data;
  if (result.status === 'empty') return [];
  throw new Error(`Financial operation journal is ${result.status}; writes are blocked to protect financial data.`);
}
function save(records: FinancialOperation[]): void {
  if (!canWriteMockRepository(KEY) || !writeMockRepository(KEY, records))
    throw new Error('Financial operation journal could not be saved; business writes must not proceed.');
}
export const financialOperationJournal = {
  list(): readonly FinancialOperation[] { return load().map(v => ({ ...v })); },
  begin(operationId: string, kind: FinancialOperationKind, fingerprint: string): BeginOperationResult {
    if (!operationId.trim() || !fingerprint.trim() || !kinds.includes(kind)) throw new Error('Invalid operation identity.');
    const records = load();
    const existing = records.find(v => v.operationId === operationId);
    if (existing) {
      if(existing.resolution==='CANCELLED_NO_EFFECT')throw new Error('Operation ID was retired after verified no-effect cancellation. Use a new operation ID for a new transaction.');
      if (existing.kind !== kind || existing.fingerprint !== fingerprint)
        throw new Error('Operation ID reused with different business data.');
      return { status: existing.state === 'COMPLETED' ? 'already_completed' : 'needs_review', operation: { ...existing } };
    }
    const now = new Date().toISOString();
    const operation: FinancialOperation = { operationId, kind, fingerprint, state: 'PENDING', createdAt: now, updatedAt: now };
    save([...records, operation]);
    return { status: 'started', operation: { ...operation } };
  },
  /** Persist the intended result ID BEFORE any business or GL write.
   * A restart can then identify GL-only and business-only partial outcomes.
   * Binding is immutable and never authorizes automatic replay.
   */
  bindResult(operationId: string, resultId: string): FinancialOperation {
    if (!resultId.trim()) throw new Error('Result ID is required.');
    const records = load();
    const record = records.find(v => v.operationId === operationId);
    if (!record) throw new Error('Operation not found.');
    if (record.resultId && record.resultId !== resultId) throw new Error('Operation result ID cannot be changed.');
    if (record.state !== 'PENDING') throw new Error('Only pending operations can bind a result ID.');
    if (record.resultId === resultId) return { ...record };
    const updated: FinancialOperation = { ...record, resultId, updatedAt: new Date().toISOString() };
    save(records.map(v => v.operationId === operationId ? updated : v));
    return { ...updated };
  },
  complete(operationId: string, resultId: string): FinancialOperation {
    if (!resultId.trim()) throw new Error('Verified business result ID is required.');
    const records = load();
    const record = records.find(v => v.operationId === operationId);
    if (!record) throw new Error('Operation not found.');
    if (record.resultId && record.resultId !== resultId) throw new Error('Operation result ID cannot be changed.');
    if(record.resolution==='CANCELLED_NO_EFFECT')throw new Error('Cancelled operation ID cannot complete or replay.');
    if (record.state === 'COMPLETED') {
      if (record.resultId !== resultId) throw new Error('Operation already completed with a different result.');
      return { ...record };
    }
    if (record.state === 'MANUAL_REVIEW') throw new Error('Manual review is required before completion.');
    const updated: FinancialOperation = { ...record, state: 'COMPLETED', resultId, updatedAt: new Date().toISOString() };
    save(records.map(v => v.operationId === operationId ? updated : v));
    return { ...updated };
  },
  flagForReview(operationId: string, note: string): FinancialOperation {
    if (!note.trim()) throw new Error('Review reason is required.');
    const records = load();
    const record = records.find(v => v.operationId === operationId);
    if (!record) throw new Error('Operation not found.');
    if (record.state === 'COMPLETED') throw new Error('Completed operation cannot be downgraded.');
    const updated: FinancialOperation = { ...record, state: 'MANUAL_REVIEW', note, updatedAt: new Date().toISOString() };
    save(records.map(v => v.operationId === operationId ? updated : v));
    return { ...updated };
  },
  /** Persist an operator's reconciliation note without releasing a financial write block.
   * This is evidence collection only, NOT approval, repair, or operation completion.
   */
  recordManualReview(operationId: string, reference: string, operator: string, summary: string): FinancialOperation {
    if (reference.trim().length < 3 || operator.trim().length < 2 || summary.trim().length < 3)
      throw new Error('Recovery reference, operator and reconciliation summary are required.');
    const records = load();
    const record = records.find(v => v.operationId === operationId);
    if (!record) throw new Error('Operation not found.');
    if (record.state === 'COMPLETED') throw new Error('Completed operation cannot be reviewed again.');
    if (record.reviewHistory?.some(v => v.reference === reference.trim()))
      throw new Error('Recovery reference already recorded; use a new reference.');
    const now = new Date().toISOString();
    const updated: FinancialOperation = {
      ...record, state: 'MANUAL_REVIEW', updatedAt: now,
      reviewHistory: [...(record.reviewHistory ?? []), {
        reference: reference.trim(), operator: operator.trim(), recordedAt: now, summary: summary.trim(),
      }],
    };
    save(records.map(v => v.operationId === operationId ? updated : v));
    return { ...updated, reviewHistory: updated.reviewHistory?.map(v => ({ ...v })) };
  },
  /** Operator-approved closure only after an independent live reconciliation.
   * This does not repair business or GL records and must never be used to replay writes.
   */
  closeReviewed(operationId: string, resultId: string, approvalReference: string, approver: string): FinancialOperation {
    if (approvalReference.trim().length < 3 || approver.trim().length < 2 || !resultId.trim())
      throw new Error('A distinct approval reference, approver and verified result are required.');
    const records = load();
    const record = records.find(v => v.operationId === operationId);
    if (!record || record.state !== 'MANUAL_REVIEW') throw new Error('Only manually reviewed operations can be closed.');
    if (!record.reviewHistory?.length) throw new Error('Recorded reconciliation evidence is required.');
    if (record.resultId !== resultId) throw new Error('Verified result differs from the bound operation result.');
    if (record.reviewHistory.some(v => v.operator.trim().toLowerCase() === approver.trim().toLowerCase()))
      throw new Error('Approval must be performed by a different operator.');
    if (record.reviewHistory.some(v => v.reference === approvalReference.trim()))
      throw new Error('Approval reference must differ from review evidence.');
    const now = new Date().toISOString();
    const updated: FinancialOperation = {
      ...record, state: 'COMPLETED', updatedAt: now,
      note: `Verified closure approved by ${approver.trim()} (${approvalReference.trim()}); no financial write performed.`,
      reviewHistory: [...record.reviewHistory, {
        reference: approvalReference.trim(), operator: approver.trim(), recordedAt: now,
        summary: 'Independent approval: verified existing business and GL result; no replay or repair.',
      }],
    };
    save(records.map(v => v.operationId === operationId ? updated : v));
    return { ...updated, reviewHistory: updated.reviewHistory?.map(v => ({ ...v })) };
  },
  /** Internal proposal metadata; financial effects are owned by the targeted repair service. */
  attachRepairProposal(operationId:string,proposal:FinancialRepairProposal):FinancialOperation {
    const records=load(),record=records.find(r=>r.operationId===operationId);
    if(!record||record.state!=='MANUAL_REVIEW'||!validRepairProposal(proposal)||proposal.status!=='PROPOSED'||!record.reviewHistory?.some(h=>h.reference===proposal.reference&&h.operator===proposal.reviewer))throw new Error('Repair proposal has no trusted review evidence.');
    const updated={...record,repairProposalHistory:record.repairProposal?[...(record.repairProposalHistory??[]),record.repairProposal]:record.repairProposalHistory,repairProposal:structuredClone(proposal)};save(records.map(r=>r.operationId===operationId?updated:r));return structuredClone(updated);
  },
  finishRepair(operationId:string,proposalId:string,approver:string,reference:string,afterDigest:string,resultJournalId?:string):FinancialOperation {
    const records=load(),record=records.find(r=>r.operationId===operationId),proposal=record?.repairProposal;
    if(!record||record.state!=='MANUAL_REVIEW'||!record.resultId||!proposal||proposal.id!==proposalId||proposal.status!=='PROPOSED')throw new Error('Current proposed repair is required.');
    if(!approver.trim()||reference.trim().length<3||reference.length>500||!/^[a-f0-9]{64}$/.test(afterDigest))throw new Error('Valid repair approval and post-repair digest are required.');
    if(proposal.reviewer.toLowerCase()===approver.toLowerCase()||record.reviewHistory?.some(h=>h.operator.toLowerCase()===approver.toLowerCase()))throw new Error('Repair approval requires a different operator.');
    if(record.reviewHistory?.some(h=>h.reference===reference.trim()))throw new Error('Approval reference must differ from review evidence.');
    const now=new Date().toISOString(),resolution=proposal.action==='REPAIR_SOURCE_METADATA'?'SOURCE_METADATA_REPAIRED' as const:proposal.action==='CANCEL_NO_EFFECT'?'CANCELLED_NO_EFFECT' as const:proposal.action==='RESTORE_BANK_RECORD'?'BANK_RECORD_RESTORED' as const:proposal.action==='REVERSE_BANK_DUPLICATE'?'BANK_DUPLICATE_REVERSED' as const:proposal.action==='RESTORE_BANK_JOURNAL_LINK'?'BANK_JOURNAL_LINK_RESTORED' as const:'BANK_JOURNAL_RESTORED' as const;
    const updated:FinancialOperation={...record,state:'COMPLETED',resolution,updatedAt:now,note:`Targeted repair ${resolution} approved by ${approver} (${reference.trim()}). Original operation ID retained.`,repairProposal:{...proposal,status:'EXECUTED',approver,approvalReference:reference.trim(),executedAt:now,afterDigest,resultJournalId},reviewHistory:[...(record.reviewHistory??[]),{reference:reference.trim(),operator:approver,recordedAt:now,summary:`Independent approval and execution: ${resolution}; proposal ${proposal.id}; post-repair digest ${afterDigest}`} ]};
    save(records.map(r=>r.operationId===operationId?updated:r));return structuredClone(updated);
  },
  /** Retire an unexecuted review case without losing any proposed plan or changing a source. */
  withdrawSourceRepair(operationId:string,proposalId:string,actor:string,reason:string):FinancialOperation {
    const records=load(),record=records.find(o=>o.operationId===operationId);
    if(record?.kind==='SOURCE_METADATA_REPAIR'&&record.state==='COMPLETED'&&!record.repairProposal&&record.repairProposalHistory?.at(-1)?.id===proposalId&&record.note==='Source repair proposal withdrawn without changing business records: '+reason&&record.reviewHistory?.at(-1)?.operator===actor)return record;
    if(!record||record.kind!=='SOURCE_METADATA_REPAIR'||record.state==='COMPLETED'||record.repairProposal?.id!==proposalId||record.repairProposal.status!=='PROPOSED')throw new Error('Unexecuted source repair proposal required.');
    const now=new Date().toISOString(),updated:FinancialOperation={...record,state:'COMPLETED',updatedAt:now,repairProposal:undefined,repairProposalHistory:[...(record.repairProposalHistory??[]),record.repairProposal],note:'Source repair proposal withdrawn without changing business records: '+reason,reviewHistory:[...(record.reviewHistory??[]),{reference:'WITHDRAW-'+crypto.randomUUID(),operator:actor,recordedAt:now,summary:reason}]};
    save(records.map(o=>o.operationId===operationId?updated:o));return updated;
  },
  /** Main recovery service only: exact request/result proof precedes this immutable adoption. */
  adoptReviewedResult(operationId:string,resultId:string):void {
    const records=load(),record=records.find(o=>o.operationId===operationId);
    if(!record||record.state==='COMPLETED'||!resultId.trim()||record.resultId&&record.resultId!==resultId)throw new Error('Cannot replace a bound or completed result.');
    save(records.map(o=>o.operationId===operationId?{...o,resultId}:o));
  },
  /** Read-only startup inspection: pending work must be reconciled manually. */
  getUnresolved(): readonly FinancialOperation[] { return load().filter(v => v.state !== 'COMPLETED').map(v => ({ ...v })); },
};

registerRepository("financialOperations", {
    repository: financialOperationJournal, read: "audit.read",
    commands: { begin: null, bindResult: null, complete: null, flagForReview: "accounting.recover", recordManualReview: null, closeReviewed: null, attachRepairProposal:null, finishRepair:null, adoptReviewedResult:null, withdrawSourceRepair:null },
    snapshot: () => [], restore: () => {}, publish: () => {},
});
