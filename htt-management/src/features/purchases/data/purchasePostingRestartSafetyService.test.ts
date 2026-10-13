import { describe, expect, it } from "vitest";
import { purchasePostingOperationRepository as repo } from "./purchasePostingOperationRepository";
import { purchasePostingRestartSafetyService as safety } from "./purchasePostingRestartSafetyService";
import { purchasePostingRecoveryAuthorization as auth } from "./purchasePostingRecoveryAuthorization";
import { purchasePostingTrustedSessionBridge as bridge } from "./purchasePostingTrustedSessionBridge";

let counter = 0;
function key() { return repo.begin("SUPPLIER_BILL", `k3-restart-${++counter}`).key; }

describe("6K-K3 restart safety and trusted session boundary", () => {
  it("K301 denies recovery when no trusted session is configured", () => {
    auth.clear();
    expect(auth.canRecover()).toBe(false);
  });
  it("K302 uses verified principal provider and revokes on disconnect", () => {
    const disconnect = bridge.connect(() => ({ userId: "verified-admin", authenticated: true, roles: ["FINANCE_ADMIN"] }));
    expect(auth.canRecover()).toBe(true);
    disconnect();
    expect(auth.canRecover()).toBe(false);
  });
  it("K303 rejects non-finance role even from verified provider", () => {
    const disconnect = bridge.connect(() => ({ userId: "sales", authenticated: true, roles: ["SALES"] }));
    expect(auth.canRecover()).toBe(false);
    disconnect();
  });
  it("K304 identifies FAILED operations as requiring manual reconciliation", () => {
    const id = key();
    repo.setStatus(id, "FAILED", "partial mutation possible");
    expect(safety.blocked().some(item => item.operation.key === id)).toBe(true);
    expect(() => repo.recover(id)).toThrow("Unsafe to replay");
  });
  it("K305 identifies recoverable operations with no process-local handler", () => {
    const id = key();
    repo.setStatus(id, "RECOVERY_REQUIRED");
    expect(safety.blocked().some(item => item.operation.key === id)).toBe(true);
  });
});
