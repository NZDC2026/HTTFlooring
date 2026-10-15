/** Versioned local-only persistence for non-ledger Mock repositories.
 * This is deliberately NOT an atomic multi-repository transaction store.
 * Do not use it for accounting, stock, posting or audit state.
 */
export type PersistedEnvelope<T> = {
    schemaVersion: 1;
    savedAt: string;
    data: T;
};

export type ReadResult<T> =
    | { status: "empty" }
    | { status: "ok"; data: T }
    | { status: "unavailable" }
    | { status: "invalid"; reason: string };

function getStorage(): Storage | null {
    try {
        return typeof window === "undefined" ? null : window.localStorage;
    } catch {
        return null;
    }
}

export function readMockRepository<T>(
    key: string,
    validate: (value: unknown) => value is T,
): ReadResult<T> {
    const store = getStorage();
    if (!store) return { status: "unavailable" };
    let raw: string | null;
    try { raw = store.getItem(key); }
    catch { return { status: "unavailable" }; }
    if (raw === null) return { status: "empty" };
    try {
        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object")
            return { status: "invalid", reason: "Invalid envelope" };
        const envelope = parsed as Partial<PersistedEnvelope<unknown>>;
        if (envelope.schemaVersion !== 1)
            return { status: "invalid", reason: "Unsupported schema version" };
        if (typeof envelope.savedAt !== "string" || !validate(envelope.data))
            return { status: "invalid", reason: "Invalid saved data" };
        return { status: "ok", data: envelope.data };
    } catch {
        return { status: "invalid", reason: "Malformed JSON" };
    }
}

export function writeMockRepository<T>(key: string, data: T): boolean {
    const store = getStorage();
    if (!store) return false;
    const envelope: PersistedEnvelope<T> = {
        schemaVersion: 1,
        savedAt: new Date().toISOString(),
        data,
    };
    try { store.setItem(key, JSON.stringify(envelope)); return true; }
    catch { return false; }
}

/** Prevent overwriting unsupported/corrupt stored data with seed data. */
export function canWriteMockRepository(key: string): boolean {
    const store = getStorage();
    if (!store) return false;
    try {
        const raw = store.getItem(key);
        if (raw === null) return true;
        const parsed: unknown = JSON.parse(raw);
        return !!parsed && typeof parsed === "object" &&
            (parsed as { schemaVersion?: unknown }).schemaVersion === 1;
    } catch { return false; }
}
