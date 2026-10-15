import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { financialStateStorage } from './financialStateStorage';
import { financialOperationJournal } from './financialOperationJournal';
import { inspectFinancialOperationsAfterRestart, markFinancialOperationForManualReview } from './financialRestartInspection';

/** Simulates a renderer restart by dropping the snapshot module cache while keeping durable localStorage. */
const SNAPSHOT = 'htt:financial-snapshot:v1';
const OPERATIONS = 'htt:financial-operations:v1';
let disk: Map<string, string>;
let writes: number;
let blockedKey: string | undefined;

beforeEach(() => {
  disk = new Map();
  writes = 0;
  blockedKey = undefined;
  vi.stubGlobal('window', { localStorage: {
    getItem: (key: string) => disk.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (blockedKey === key) throw new Error('simulated storage failure');
      disk.set(key, value);
      writes += 1;
    },
  } });
  financialStateStorage.resetCacheForTests();
});
afterEach(() => {
  financialStateStorage.resetCacheForTests();
  vi.unstubAllGlobals();
});

function simulateRendererRestart() {
  financialStateStorage.resetCacheForTests();
}

describe('D-6 simulated renderer restart acceptance (not a real Electron process test)', () => {
  it('preserves each of the four financial collections across a simulated restart', () => {
    financialStateStorage.update('payments', []);
    financialStateStorage.update('transactions', []);
    financialStateStorage.update('transfers', []);
    financialStateStorage.update('journals', []);
    const before = financialStateStorage.read();
    const persisted = disk.get(SNAPSHOT);
    simulateRendererRestart();
    expect(financialStateStorage.read()).toEqual(before);
    expect(disk.get(SNAPSHOT)).toBe(persisted);
  });

  it('leaves a bound but unfinished operation unresolved after restart without replay', () => {
    financialOperationJournal.begin('d6-bank-1', 'BANK_TRANSACTION', 'bank-input');
    financialOperationJournal.bindResult('d6-bank-1', 'banktxn-d6');
    const saved = disk.get(OPERATIONS);
    const before = writes;
    simulateRendererRestart();
    expect(inspectFinancialOperationsAfterRestart()).toEqual([
      expect.objectContaining({ operationId: 'd6-bank-1', resultId: 'banktxn-d6', finding: 'NO_MATCHING_RECORD', requiresManualReview: true }),
    ]);
    expect(writes).toBe(before);
    expect(disk.get(OPERATIONS)).toBe(saved);
    expect(financialOperationJournal.begin('d6-bank-1', 'BANK_TRANSACTION', 'bank-input').status).toBe('needs_review');
  });

  it('keeps a manually reviewed operation unresolved after another restart', () => {
    financialOperationJournal.begin('d6-transfer-1', 'BANK_TRANSFER', 'transfer-input');
    financialOperationJournal.bindResult('d6-transfer-1', 'transfer-d6');
    markFinancialOperationForManualReview('d6-transfer-1', 'Reviewed; requires external reconciliation');
    simulateRendererRestart();
    expect(inspectFinancialOperationsAfterRestart()[0]).toMatchObject({
      state: 'MANUAL_REVIEW', resultId: 'transfer-d6', requiresManualReview: true,
    });
    expect(financialOperationJournal.begin('d6-transfer-1', 'BANK_TRANSFER', 'transfer-input').status).toBe('needs_review');
  });

  it('never replaces damaged financial snapshot during restart inspection', () => {
    financialOperationJournal.begin('d6-damaged', 'CUSTOMER_PAYMENT', 'payment-input');
    disk.set(SNAPSHOT, '{damaged');
    simulateRendererRestart();
    expect(() => inspectFinancialOperationsAfterRestart()).toThrow(/blocked/);
    expect(disk.get(SNAPSHOT)).toBe('{damaged');
  });

  it('does not mark an operation completed when completion persistence fails', () => {
    financialOperationJournal.begin('d6-fail', 'BANK_TRANSFER', 'input');
    financialOperationJournal.bindResult('d6-fail', 'transfer-result');
    blockedKey = OPERATIONS;
    expect(() => financialOperationJournal.complete('d6-fail', 'transfer-result')).toThrow();
    blockedKey = undefined;
    simulateRendererRestart();
    expect(financialOperationJournal.getUnresolved()[0]).toMatchObject({ state: 'PENDING', resultId: 'transfer-result' });
  });
});
