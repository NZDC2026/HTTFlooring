import { registerRepository } from "../../features/security/repositoryHost";
/**
 * Durable, fail-closed operation intent registry for the local Mock environment.
 * NOT a multi-repository atomic transaction and NOT an automatic replay engine.
 * Call begin BEFORE business writes, complete AFTER all effects are verified.
 * On restart, unresolved operations are MANUAL_REVIEW, never replayed blindly.
 */
import { canWriteMockRepository, readMockRepository, writeMockRepository } from './mockRepositoryStorage';

export type FinancialOperationKind = 'CUSTOMER_PAYMENT' | 'PAYMENT_REVERSAL' | 'BANK_TRANSACTION' | 'BANK_TRANSFER' | 'BANK_RECONCILIATION' | 'SALES_INVOICE_VOID' | 'SALES_CREDIT_APPLY' | 'SALES_CREDIT_REVERSAL' | 'SALES_PAYMENT_REVERSAL';
export type FinancialOperationState = 'PENDING' | 'COMPLETED' | 'MANUAL_REVIEW';
export type FinancialOperation = {
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
const kinds: readonly string[] = ['CUSTOMER_PAYMENT', 'PAYMENT_REVERSAL', 'BANK_TRANSACTION', 'BANK_TRANSFER', 'BANK_RECONCILIATION', 'SALES_INVOICE_VOID', 'SALES_CREDIT_APPLY', 'SALES_CREDIT_REVERSAL', 'SALES_PAYMENT_REVERSAL'];
const states: readonly string[] = ['PENDING', 'COMPLETED', 'MANUAL_REVIEW'];
const valid = (value: unknown): value is FinancialOperation[] =>
  Array.isArray(value) && value.every((v: unknown) => {
    if (!v || typeof v !== 'object') return false;
    const o = v as Record<string, unknown>;
    return typeof o.operationId === 'string' && o.operationId.length > 0 &&
      kinds.includes(String(o.kind)) && typeof o.fingerprint === 'string' && o.fingerprint.length > 0 &&
      states.includes(String(o.state)) && typeof o.createdAt === 'string' && typeof o.updatedAt === 'string' &&
      (o.resultId === undefined || typeof o.resultId === 'string') &&
      (o.note === undefined || typeof o.note === 'string') &&
      (o.reviewHistory === undefined || (Array.isArray(o.reviewHistory) && o.reviewHistory.every((entry: unknown) => {
        if (!entry || typeof entry !== 'object') return false;
        const e = entry as Record<string, unknown>;
        return typeof e.reference === 'string' && e.reference.length >= 3 &&
          typeof e.operator === 'string' && e.operator.length >= 2 &&
          typeof e.recordedAt === 'string' && typeof e.summary === 'string' && e.summary.length >= 3;
      }))); 
  }) && new Set(value.map(v => v.operationId)).size === value.length;

function load(): FinancialOperation[] {
  const result = readMockRepository(KEY, valid);
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
  /** Read-only startup inspection: pending work must be reconciled manually. */
  getUnresolved(): readonly FinancialOperation[] { return load().filter(v => v.state !== 'COMPLETED').map(v => ({ ...v })); },
};

registerRepository("financialOperations", {
    repository: financialOperationJournal, read: "audit.read",
    commands: { begin: null, bindResult: null, complete: null, flagForReview: "accounting.recover", recordManualReview: null, closeReviewed: null },
    snapshot: () => [], restore: () => {}, publish: () => {},
});
