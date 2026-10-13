import { beforeEach, describe, expect, it, vi } from "vitest";
let ops: typeof import("./purchasePostingOperationRepository")["purchasePostingOperationRepository"];
let auth: typeof import("./purchasePostingRecoveryAuthorization")["purchasePostingRecoveryAuthorization"];
let service: typeof import("./purchasePostingManualRecoveryService")["purchasePostingManualRecoveryService"];
beforeEach(async () => {
  vi.resetModules();
  ({ purchasePostingOperationRepository: ops } = await import("./purchasePostingOperationRepository"));
  ({ purchasePostingRecoveryAuthorization: auth } = await import("./purchasePostingRecoveryAuthorization"));
  ({ purchasePostingManualRecoveryService: service } = await import("./purchasePostingManualRecoveryService"));
});
function recoverable(id: string, handler = () => {}) {
  const key = ops.begin("SUPPLIER_BILL", id).key;
  ops.registerRecovery(key, handler);
  ops.setStatus(key, "RECOVERY_REQUIRED");
  return key;
}
describe("6K-K2 guarded manual purchase recovery", () => {
  it("K201 denies recovery without trusted authenticated session", () => {
    const key = recoverable("1");
    expect(service.canRecover(key)).toBe(false);
    expect(() => service.recover(key)).toThrow("authenticated finance administrator");
  });
  it("K202 denies ordinary users", () => {
    auth.configureTrustedSession(() => ({ userId: "sales-1", authenticated: true, roles: ["SALES"] }));
    const key = recoverable("2");
    expect(service.canRecover(key)).toBe(false);
    expect(() => service.recover(key)).toThrow("authenticated finance administrator");
  });
  it("K203 permits finance admin to resume a recoverable operation exactly once", () => {
    auth.configureTrustedSession(() => ({ userId: "finance-1", authenticated: true, roles: ["FINANCE_ADMIN"] }));
    let count = 0;
    const key = recoverable("3", () => ops.runStep(key, "JOURNAL", () => { count += 1; }));
    expect(service.canRecover(key)).toBe(true);
    service.recover(key);
    expect(count).toBe(1);
    expect(ops.get(key)?.status).toBe("POSTED");
    expect(service.getAuditEvents()).toMatchObject([{ operationKey: key, actorId: "finance-1", outcome: "SUCCESS" }]);
    expect(() => service.recover(key)).toThrow("Only RECOVERY_REQUIRED");
  });
  it("K204 never retries FAILED operations", () => {
    auth.configureTrustedSession(() => ({ userId: "admin", authenticated: true, roles: ["ADMIN"] }));
    const key = recoverable("4");
    ops.setStatus(key, "FAILED");
    expect(service.canRecover(key)).toBe(false);
    expect(() => service.recover(key)).toThrow("Only RECOVERY_REQUIRED");
  });
  it("K205 refuses missing recovery handler", () => {
    auth.configureTrustedSession(() => ({ userId: "admin", authenticated: true, roles: ["ADMIN"] }));
    const key = ops.begin("GOODS_RECEIPT", "5").key;
    ops.setStatus(key, "RECOVERY_REQUIRED");
    expect(service.canRecover(key)).toBe(false);
    expect(() => service.recover(key)).toThrow("No process-local recovery handler");
  });
  it("K206 records failed attempts without marking the operation posted", () => {
    auth.configureTrustedSession(() => ({ userId: "admin", authenticated: true, roles: ["ADMIN"] }));
    const key = recoverable("6", () => { throw new Error("retry failed"); });
    expect(() => service.recover(key)).toThrow("retry failed");
    expect(ops.get(key)?.status).toBe("RECOVERY_REQUIRED");
    expect(service.getAuditEvents()[0]).toMatchObject({ operationKey: key, outcome: "ERROR" });
  });
});
