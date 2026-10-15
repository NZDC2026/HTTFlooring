import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { financialStateStorage } from './financialStateStorage';
import { financialOperationJournal as operations } from './financialOperationJournal';
import { inspectFinancialOperationsAfterRestart } from './financialRestartInspection';

const SNAPSHOT_KEY = 'htt:financial-snapshot:v1';
const OP_KEY = 'htt:financial-operations:v1';
let values: Map<string, string>;
let failKey: string | undefined;
let writeCount: number;
const storage = () => ({
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => {
    if (key === failKey) throw new Error('simulated disk quota');
    writeCount += 1;
    values.set(key, value);
  },
});
beforeEach(() => {
  values = new Map();
  failKey = undefined;
  writeCount = 0;
  vi.stubGlobal('window', { localStorage: storage() });
  financialStateStorage.resetCacheForTests();
});
afterEach(() => {
  vi.unstubAllGlobals();
  financialStateStorage.resetCacheForTests();
});

describe('D-5 financial persistence boundary and crash safety', () => {
  it('snapshot failure does not modify cached financial records or durable snapshot', () => {
    financialStateStorage.update('payments', []);
    const before = financialStateStorage.read();
    const durable = values.get(SNAPSHOT_KEY);
    failKey = SNAPSHOT_KEY;
    expect(() => financialStateStorage.update('journals', [])).toThrow(/write failed/);
    expect(financialStateStorage.read()).toEqual(before);
    expect(values.get(SNAPSHOT_KEY)).toBe(durable);
  });
  it('journal intent write failure prevents a new operation from starting', () => {
    failKey = OP_KEY;
    expect(() => operations.begin('op-fail', 'BANK_TRANSACTION', 'payload')).toThrow();
    expect(values.has(OP_KEY)).toBe(false);
  });
  it('a bound pending operation remains unresolved after snapshot failure and restart', () => {
    operations.begin('op-crash', 'BANK_TRANSACTION', 'payload');
    operations.bindResult('op-crash', 'bank-crash');
    failKey = SNAPSHOT_KEY;
    expect(() => financialStateStorage.update('transactions', [])).toThrow();
    failKey = undefined;
    financialStateStorage.resetCacheForTests();
    const before = new Map(values);
    expect(inspectFinancialOperationsAfterRestart()[0]).toMatchObject({
      operationId: 'op-crash', resultId: 'bank-crash', finding: 'NO_MATCHING_RECORD', requiresManualReview: true,
    });
    expect(values).toEqual(before);
    expect(operations.begin('op-crash', 'BANK_TRANSACTION', 'payload').status).toBe('needs_review');
  });
  it('failed completion write keeps a bound operation pending', () => {
    operations.begin('op-complete', 'BANK_TRANSFER', 'payload');
    operations.bindResult('op-complete', 'transfer-1');
    const durable = values.get(OP_KEY);
    failKey = OP_KEY;
    expect(() => operations.complete('op-complete', 'transfer-1')).toThrow();
    expect(values.get(OP_KEY)).toBe(durable);
    failKey = undefined;
    expect(operations.getUnresolved()[0]).toMatchObject({ state: 'PENDING', resultId: 'transfer-1' });
  });
  it('manual-review write failure cannot silently mark operation reviewed', () => {
    operations.begin('op-review', 'CUSTOMER_PAYMENT', 'payload');
    failKey = OP_KEY;
    expect(() => operations.flagForReview('op-review', 'uncertain')).toThrow();
    failKey = undefined;
    expect(operations.getUnresolved()[0].state).toBe('PENDING');
  });
  it('a pending intent never replays a business write on inspection', () => {
    operations.begin('op-read', 'BANK_TRANSFER', 'payload');
    operations.bindResult('op-read', 'transfer-read');
    const before = writeCount;
    inspectFinancialOperationsAfterRestart();
    expect(writeCount).toBe(before);
  });
  it('a corrupt snapshot fails closed and is not overwritten by a later update', () => {
    values.set(SNAPSHOT_KEY, '{corrupt');
    financialStateStorage.resetCacheForTests();
    expect(() => financialStateStorage.update('payments', [])).toThrow(/blocked/);
    expect(values.get(SNAPSHOT_KEY)).toBe('{corrupt');
  });
  it('a corrupt operation log blocks new operations and remains untouched', () => {
    values.set(OP_KEY, '{corrupt');
    expect(() => operations.begin('op-new', 'CUSTOMER_PAYMENT', 'payload')).toThrow();
    expect(values.get(OP_KEY)).toBe('{corrupt');
  });
  it('completed operations do not re-enter pending state on duplicate begin', () => {
    operations.begin('op-done', 'BANK_TRANSFER', 'payload');
    operations.bindResult('op-done', 'transfer-done');
    operations.complete('op-done', 'transfer-done');
    const before = writeCount;
    expect(operations.begin('op-done', 'BANK_TRANSFER', 'payload').status).toBe('already_completed');
    expect(writeCount).toBe(before);
  });
});
