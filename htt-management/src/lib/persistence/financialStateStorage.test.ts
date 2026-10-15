import { afterEach, describe, expect, it, vi } from 'vitest';
import { financialStateStorage } from './financialStateStorage';

afterEach(() => { vi.unstubAllGlobals(); financialStateStorage.resetCacheForTests(); });
function storage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
}
describe('unified financial snapshot', () => {
  it('persists and reloads a complete snapshot', () => {
    const localStorage = storage();
    vi.stubGlobal('window', { localStorage });
    const original = financialStateStorage.read();
    financialStateStorage.update('payments', []);
    financialStateStorage.resetCacheForTests();
    expect(financialStateStorage.read().payments).toEqual([]);
    expect(financialStateStorage.read().journals).toEqual(original.journals);
  });
  it('rejects corrupt persisted data without replacing it', () => {
    const localStorage = storage();
    localStorage.setItem('htt:financial-snapshot:v1', '{broken');
    vi.stubGlobal('window', { localStorage });
    financialStateStorage.resetCacheForTests();
    expect(() => financialStateStorage.read()).toThrow(/blocked/);
    expect(localStorage.getItem('htt:financial-snapshot:v1')).toBe('{broken');
  });
  it('does not update cache when storage write fails', () => {
    const localStorage = { getItem: () => null, setItem: () => { throw new Error('quota'); } };
    vi.stubGlobal('window', { localStorage });
    financialStateStorage.resetCacheForTests();
    const before = financialStateStorage.read();
    expect(() => financialStateStorage.update('payments', [])).toThrow(/write failed/);
    expect(financialStateStorage.read()).toEqual(before);
  });
});
