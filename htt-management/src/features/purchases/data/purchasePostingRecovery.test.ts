import { beforeEach, describe, expect, it, vi } from "vitest";

let ops: typeof import("./purchasePostingOperationRepository")["purchasePostingOperationRepository"];

beforeEach(async () => {
    vi.resetModules();
    ({ purchasePostingOperationRepository: ops } = await import("./purchasePostingOperationRepository"));
});

describe("6K-J4 recoverable purchase posting and fault injection", () => {
    it("J401 resumes after a failure injected before a journal without duplicating inventory", () => {
        const key = ops.begin("GOODS_RECEIPT", "gr-1").key;
        const effects: string[] = [];
        ops.registerRecovery(key, () => {
            ops.runStep(key, "MOVEMENT:line-1", () => effects.push("movement"));
            ops.runStep(key, "COST:line-1", () => effects.push("cost"));
            ops.runStep(key, "STOCK:line-1", () => effects.push("stock"));
            ops.runStep(key, "JOURNAL", () => effects.push("journal"));
            ops.runStep(key, "PURCHASE_ORDER", () => effects.push("po"));
        });
        ops.injectFailureBeforeStep(key, "JOURNAL");
        expect(() => ops.recover(key)).toThrow("Injected failure");
        expect(ops.get(key)?.status).toBe("RECOVERY_REQUIRED");
        expect(effects).toEqual(["movement", "cost", "stock"]);
        ops.recover(key);
        expect(effects).toEqual(["movement", "cost", "stock", "journal", "po"]);
        expect(ops.get(key)?.status).toBe("POSTED");
    });

    it("J402 resumes supplier bill after journal without a second journal", () => {
        const key = ops.begin("SUPPLIER_BILL", "bill-1").key;
        const effects: string[] = [];
        ops.registerRecovery(key, () => {
            ops.runStep(key, "JOURNAL", () => effects.push("journal"));
            ops.runStep(key, "PURCHASE_ORDER", () => effects.push("po"));
            ops.runStep(key, "MATCHES", () => effects.push("matches"));
            ops.runStep(key, "BILL", () => effects.push("bill"));
        });
        ops.injectFailureBeforeStep(key, "MATCHES");
        expect(() => ops.recover(key)).toThrow("Injected failure");
        ops.recover(key);
        expect(effects).toEqual(["journal", "po", "matches", "bill"]);
    });

    it("J403 resumes void after reversal journal without repeating PO release", () => {
        const key = ops.begin("SUPPLIER_BILL_VOID", "bill-2").key;
        const effects: string[] = [];
        ops.registerRecovery(key, () => {
            ops.runStep(key, "REVERSAL_JOURNAL", () => effects.push("reverse"));
            ops.runStep(key, "PURCHASE_ORDER", () => effects.push("release"));
            ops.runStep(key, "MATCHES", () => effects.push("matches"));
            ops.runStep(key, "BILL", () => effects.push("void"));
        });
        ops.injectFailureBeforeStep(key, "MATCHES");
        expect(() => ops.recover(key)).toThrow("Injected failure");
        ops.recover(key);
        expect(effects).toEqual(["reverse", "release", "matches", "void"]);
    });

    it("J404 does not replay a repository step that may have partially mutated", () => {
        const key = ops.begin("SUPPLIER_BILL", "bill-3").key;
        let calls = 0;
        ops.registerRecovery(key, () => ops.runStep(key, "PURCHASE_ORDER", () => {
            calls += 1;
            throw new Error("write failed after side effect");
        }));
        expect(() => ops.recover(key)).toThrow("write failed");
        expect(ops.get(key)?.status).toBe("FAILED");
        expect(() => ops.recover(key)).toThrow("manual reconciliation required");
        expect(calls).toBe(1);
    });

    it("J405 a completed operation is idempotent", () => {
        const key = ops.begin("SUPPLIER_BILL", "bill-4").key;
        let calls = 0;
        ops.registerRecovery(key, () => ops.runStep(key, "JOURNAL", () => { calls += 1; }));
        ops.recover(key);
        ops.recover(key);
        expect(calls).toBe(1);
    });

    it("J406 prevents duplicate operation keys", () => {
        ops.begin("GOODS_RECEIPT", "gr-2");
        expect(() => ops.begin("GOODS_RECEIPT", "gr-2")).toThrow("already exists");
    });

    it("J407 rejects recovery when no handler exists", () => {
        const key = ops.begin("GOODS_RECEIPT", "gr-3").key;
        expect(() => ops.recover(key)).toThrow("No process-local recovery handler");
    });

    it("J408 injected failures are one-shot and occur before mutation", () => {
        const key = ops.begin("GOODS_RECEIPT", "gr-4").key;
        let calls = 0;
        ops.registerRecovery(key, () => ops.runStep(key, "JOURNAL", () => { calls += 1; }));
        ops.injectFailureBeforeStep(key, "JOURNAL");
        expect(() => ops.recover(key)).toThrow("Injected failure");
        expect(calls).toBe(0);
        ops.recover(key);
        expect(calls).toBe(1);
    });
});
