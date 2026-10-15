import { beforeEach, describe, expect, it, vi } from 'vitest';
import { financialOperationJournal as journal } from './financialOperationJournal';
let data: Map<string, string>;
beforeEach(() => {
  data = new Map();
  vi.stubGlobal('window', { localStorage: {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value); },
  } });
});
describe('financial operation journal fail-closed recovery', () => {
  it('persists intent and does not replay pending operation', () => {
    expect(journal.begin('op-1', 'CUSTOMER_PAYMENT', 'hash-1').status).toBe('started');
    expect(journal.begin('op-1', 'CUSTOMER_PAYMENT', 'hash-1').status).toBe('needs_review');
    expect(journal.getUnresolved()).toHaveLength(1);
  });
  it('returns completed operation on idempotent retry', () => {
    journal.begin('op-2', 'BANK_TRANSFER', 'hash-2');
    journal.complete('op-2', 'transfer-2');
    expect(journal.begin('op-2', 'BANK_TRANSFER', 'hash-2').status).toBe('already_completed');
    expect(journal.complete('op-2', 'transfer-2').resultId).toBe('transfer-2');
    expect(journal.getUnresolved()).toHaveLength(0);
  });
  it('rejects reuse of an operation ID with changed payload', () => {
    journal.begin('op-3', 'BANK_TRANSACTION', 'original');
    expect(() => journal.begin('op-3', 'BANK_TRANSACTION', 'changed')).toThrow();
  });
  it('requires manual review for uncertain operations', () => {
    journal.begin('op-4', 'CUSTOMER_PAYMENT', 'hash-4');
    journal.flagForReview('op-4', 'Journal posting outcome unknown');
    expect(journal.getUnresolved()[0].state).toBe('MANUAL_REVIEW');
    expect(() => journal.complete('op-4', 'payment-4')).toThrow();
  });
  it('blocks writes if saved journal is corrupted', () => {
    data.set('htt:financial-operations:v1', '{broken');
    expect(() => journal.begin('op-5', 'BANK_TRANSFER', 'hash-5')).toThrow();
  });
  it('blocks writes when storage is unavailable', () => {
    vi.stubGlobal('window', { localStorage: { getItem: () => { throw new Error('denied'); } } });
    expect(() => journal.begin('op-6', 'BANK_TRANSFER', 'hash-6')).toThrow();
  });
  it('does not overwrite a completed result', () => {
    journal.begin('op-7', 'BANK_TRANSFER', 'hash-7');
    journal.complete('op-7', 'transfer-7');
    expect(() => journal.complete('op-7', 'different')).toThrow();
    expect(() => journal.flagForReview('op-7', 'uncertain')).toThrow();
  });
});
