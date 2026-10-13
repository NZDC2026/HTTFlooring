import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => vi.resetModules());

describe("6K-K purchase posting audit", () => {
  it("K01 exposes a safe document link and operation status", async () => {
    const { purchasePostingOperationRepository: ops } = await import("./purchasePostingOperationRepository");
    const { purchasePostingAuditService: audit } = await import("./purchasePostingAuditService");
    const operation = ops.begin("GOODS_RECEIPT", "gr-audit");
    ops.completeStep(operation.key, "STOCK");
    ops.setStatus(operation.key, "RECOVERY_REQUIRED", "journal not posted");
    expect(audit.list()).toEqual(expect.arrayContaining([expect.objectContaining({ key: operation.key, needsAttention: true, sourcePath: "/purchases/goods-receipts/gr-audit", completedSteps: ["STOCK"] })]));
  });
  it("K02 distinguishes FAILED from safely recoverable operations", async () => {
    const { purchasePostingOperationRepository: ops } = await import("./purchasePostingOperationRepository");
    const { purchasePostingAuditService: audit } = await import("./purchasePostingAuditService");
    const key = ops.begin("SUPPLIER_BILL", "bill-audit").key;
    ops.setStatus(key, "FAILED", "partial mutation");
    expect(audit.list().find(row => row.key === key)).toMatchObject({ needsAttention: true, error: "partial mutation", sourcePath: "/purchases/bills/bill-audit" });
    expect(() => ops.recover(key)).toThrow("manual reconciliation required");
  });
  it("K03 returns detached audit snapshots", async () => {
    const { purchasePostingOperationRepository: ops } = await import("./purchasePostingOperationRepository");
    const { purchasePostingAuditService: audit } = await import("./purchasePostingAuditService");
    const key = ops.begin("SUPPLIER_BILL_VOID", "bill-void").key;
    audit.list()[0].completedSteps.push("FAKE");
    expect(ops.get(key)?.completedSteps).toEqual([]);
  });
});
