import { registerRepository } from "../../security/repositoryHost";
export type PurchasePostingStatus = "PENDING" | "POSTING" | "POSTED" | "FAILED" | "RECOVERY_REQUIRED";
export type PurchasePostingKind = "GOODS_RECEIPT" | "SUPPLIER_BILL" | "SUPPLIER_BILL_VOID";
export interface PurchasePostingOperation {
    key: string;
    kind: PurchasePostingKind;
    sourceId: string;
    status: PurchasePostingStatus;
    completedSteps: string[];
    error?: string;
    updatedAt: string;
}
const operations = new Map<string, PurchasePostingOperation>();
// Persist metadata only. Never replay a repository mutation from this snapshot.
const STORAGE_KEY = "htt.purchasePosting.operations.v1";
function storage(): Storage | null {
    try { return typeof localStorage === "undefined" ? null : localStorage; } catch { return null; }
}
function persist(): void {
    const target = storage();
    if (!target) return;
    try { target.setItem(STORAGE_KEY, JSON.stringify([...operations.values()])); }
    catch { /* Storage may be unavailable; operations remain process-local. */ }
}
function hydrate(): void {
    const target = storage();
    if (!target) return;
    try {
        const value: unknown = JSON.parse(target.getItem(STORAGE_KEY) ?? "[]");
        if (!Array.isArray(value)) return;
        for (const item of value) {
            if (!item || typeof item !== "object") continue;
            const row = item as Partial<PurchasePostingOperation>;
            if (typeof row.key !== "string" || typeof row.sourceId !== "string" ||
                !["GOODS_RECEIPT", "SUPPLIER_BILL", "SUPPLIER_BILL_VOID"].includes(row.kind ?? "") ||
                !["PENDING", "POSTING", "POSTED", "FAILED", "RECOVERY_REQUIRED"].includes(row.status ?? "") ||
                !Array.isArray(row.completedSteps) || !row.completedSteps.every(step => typeof step === "string")) continue;
            const interrupted = row.status === "POSTING" || row.status === "PENDING" || row.status === "RECOVERY_REQUIRED";
            operations.set(row.key, {
                key: row.key, kind: row.kind!, sourceId: row.sourceId,
                status: interrupted ? "FAILED" : row.status!,
                completedSteps: [...row.completedSteps],
                error: interrupted ? "Restored after restart: business repositories and recovery handler must be reconciled before retry." : row.error,
                updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : new Date().toISOString(),
            });
        }
    } catch { /* Corrupt metadata must never trigger automatic replay. */ }
}

hydrate();
const listeners = new Set<() => void>();
// Process-local recovery callbacks. A database-backed outbox is required for restart recovery.
const recoveryHandlers = new Map<string, () => void>();
const injectedFailures = new Map<string, number>();
let executingKey: string | undefined;

function notify() { persist(); listeners.forEach(listener => listener()); }
export const purchasePostingOperationRepository = {
    // Test-only fault injection: throws before a step starts, never after mutation.
    injectFailureBeforeStep(key: string, step: string, times = 1): void {
        injectedFailures.set(`${key}|${step}`, times);
    },
    clearInjectedFailures(): void { injectedFailures.clear(); },
    registerRecovery(key: string, handler: () => void): void {
        if (!operations.has(key)) throw new Error(`Unknown posting operation: ${key}`);
        recoveryHandlers.set(key, handler);
    },
    runStep(key: string, step: string, action: () => void): void {
        const operation = operations.get(key);
        if (!operation) throw new Error(`Unknown posting operation: ${key}`);
        if (operation.completedSteps.includes(step)) return;
        const faultKey = `${key}|${step}`;
        const remaining = injectedFailures.get(faultKey) ?? 0;
        if (remaining > 0) {
            injectedFailures.set(faultKey, remaining - 1);
            throw new Error(`Injected failure before ${step}`);
        }
        try {
            action();
        } catch (error) {
            // A failing repository call might already have mutated state.
            // Do not automatically replay it: an operator must reconcile it.
            this.setStatus(key, "FAILED", String(error));
            throw error;
        }
        this.completeStep(key, step);
    },
    hasRecoveryHandler(key: string): boolean { return recoveryHandlers.has(key); },
    recover(key: string): PurchasePostingOperation {
        const operation = operations.get(key);
        if (!operation) throw new Error(`Unknown posting operation: ${key}`);
        if (operation.status === "POSTED") return this.get(key)!;
        if (operation.status === "FAILED") {
            throw new Error(`Unsafe to replay ${key}: repository step failed during execution; manual reconciliation required.`);
        }
        const handler = recoveryHandlers.get(key);
        if (!handler) throw new Error(`No process-local recovery handler for ${key}`);
        if (executingKey === key || operation.status === "POSTING") {
            throw new Error(`Posting operation is already running: ${key}`);
        }
        executingKey = key;
        this.setStatus(key, "POSTING");
        try {
            handler();
            this.setStatus(key, "POSTED");
        } catch (error) {
            if (this.get(key)?.status !== "FAILED") this.setStatus(key, "RECOVERY_REQUIRED", String(error));
            throw error;
        } finally {
            executingKey = undefined;
        }
        return this.get(key)!;
    },
    get(key: string): PurchasePostingOperation | undefined {
        const item = operations.get(key);
        return item ? { ...item, completedSteps: [...item.completedSteps] } : undefined;
    },
    getAll(): PurchasePostingOperation[] { return [...operations.values()].map(item => ({ ...item, completedSteps: [...item.completedSteps] })); },
    subscribe(listener: () => void): () => void { listeners.add(listener); return () => { listeners.delete(listener); }; },
    begin(kind: PurchasePostingKind, sourceId: string): PurchasePostingOperation {
        const key = `${kind}:${sourceId}`;
        if (operations.has(key)) throw new Error(`Posting operation already exists: ${key}`);
        const item: PurchasePostingOperation = { key, kind, sourceId, status: "PENDING", completedSteps: [], updatedAt: new Date().toISOString() };
        operations.set(key, item); notify(); return this.get(key)!;
    },
    setStatus(key: string, status: PurchasePostingStatus, error?: string): void {
        const item = operations.get(key);
        if (!item) throw new Error(`Unknown posting operation: ${key}`);
        operations.set(key, { ...item, status, error, updatedAt: new Date().toISOString() }); notify();
    },
    completeStep(key: string, step: string): void {
        const item = operations.get(key);
        if (!item) throw new Error(`Unknown posting operation: ${key}`);
        if (item.completedSteps.includes(step)) return;
        operations.set(key, { ...item, completedSteps: [...item.completedSteps, step], updatedAt: new Date().toISOString() }); notify();
    },
};

registerRepository("purchaseOperations", {
    repository: purchasePostingOperationRepository, read: "purchases.read",
    commands: { injectFailureBeforeStep: null, clearInjectedFailures: null, registerRecovery: null, runStep: null, recover: null, begin: null, setStatus: null, completeStep: null },
    snapshot: () => purchasePostingOperationRepository.getAll(),
    restore: value => { operations.clear(); recoveryHandlers.clear(); for (const row of value) operations.set(row.key, row); },
    publish: () => listeners.forEach(listener => listener()),
});
