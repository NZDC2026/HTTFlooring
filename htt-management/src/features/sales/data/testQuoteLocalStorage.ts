/** In-memory browser storage for Node-based sales integration tests.
 * Installed before dynamically importing repositories; reset for each test.
 */
import { vi } from "vitest";

export function installQuoteTestStorage(): void {
    const items = new Map<string, string>();
    const localStorage = {
        getItem: (key: string): string | null => items.get(key) ?? null,
        setItem: (key: string, value: string): void => { items.set(key, String(value)); },
        removeItem: (key: string): void => { items.delete(key); },
        clear: (): void => { items.clear(); },
        key: (index: number): string | null => [...items.keys()][index] ?? null,
        get length(): number { return items.size; },
    };
    vi.stubGlobal("window", { localStorage });
}
