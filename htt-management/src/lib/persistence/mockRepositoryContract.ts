/** Shared shape for synchronous Mock repositories with React external-store support.
 * Adapters should expose immutable snapshots; do not mutate arrays returned by getSnapshot().
 */
export type MockRepositoryContract<T extends { id: string }> = {
    getAll(): readonly T[];
    getById(id: string): T | undefined;
    getSnapshot(): readonly T[];
    subscribe(listener: () => void): () => void;
};

/** Explicitly forbid treating localStorage writes as a multi-repository transaction. */
export const MOCK_PERSISTENCE_POLICY = {
    schemaVersion: 1,
    crossRepositoryAtomicity: false,
    ledgerWritesAllowed: false,
    auditIsReadOnly: true,
} as const;
