/** Isolated browser storage for Node-based purchase integration tests.
 * Production continues to fail closed when durable storage is unavailable.
 */
export function installPurchaseTestStorage(): void {
  const values = new Map<string, string>();
  const store: Storage = {
    get length() { return values.size; },
    clear() { values.clear(); },
    getItem(key: string) { return values.get(String(key)) ?? null; },
    key(index: number) { return [...values.keys()][index] ?? null; },
    removeItem(key: string) { values.delete(String(key)); },
    setItem(key: string, value: string) { values.set(String(key), String(value)); },
  };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: store } });
}
