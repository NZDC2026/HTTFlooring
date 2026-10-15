import { registerRepository } from "../../security/repositoryHost";
import { purchasePostingOperationRepository } from "./purchasePostingOperationRepository";
import { purchasePostingRecoveryAuthorization } from "./purchasePostingRecoveryAuthorization";

export type ManualRecoveryAuditEvent = {
  operationKey: string;
  actorId: string;
  timestamp: string;
  outcome: "SUCCESS" | "ERROR";
  message?: string;
};
const AUDIT_KEY = "htt.purchasePosting.manualRecoveryAudit.v1";
function readEvents(): ManualRecoveryAuditEvent[] {
  try {
    if (typeof localStorage === "undefined") return [];
    const raw: unknown = JSON.parse(localStorage.getItem(AUDIT_KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter((item): item is ManualRecoveryAuditEvent =>
      item && typeof item.operationKey === "string" && typeof item.actorId === "string" &&
      typeof item.timestamp === "string" && (item.outcome === "SUCCESS" || item.outcome === "ERROR"));
  } catch { return []; }
}
const events: ManualRecoveryAuditEvent[] = readEvents();
function record(event: ManualRecoveryAuditEvent): void {
  events.push(event);
  try { if (typeof localStorage !== "undefined") localStorage.setItem(AUDIT_KEY, JSON.stringify(events)); }
  catch { /* Audit durability is not guaranteed by browser storage. */ }
}
export const purchasePostingManualRecoveryService = {
  getAuditEvents(): ManualRecoveryAuditEvent[] { return events.map(event => ({ ...event })); },
  canRecover(key: string): boolean {
    const operation = purchasePostingOperationRepository.get(key);
    return purchasePostingRecoveryAuthorization.canRecover() && operation?.status === "RECOVERY_REQUIRED" && purchasePostingOperationRepository.hasRecoveryHandler(key);
  },
  recover(key: string): void {
    const actor = purchasePostingRecoveryAuthorization.requireRecoveryPermission();
    const operation = purchasePostingOperationRepository.get(key);
    if (!operation) throw new Error("Posting operation not found.");
    if (operation.status !== "RECOVERY_REQUIRED") throw new Error("Only RECOVERY_REQUIRED operations may be manually recovered.");
    if (!purchasePostingOperationRepository.hasRecoveryHandler(key)) throw new Error("No process-local recovery handler. Manual reconciliation required.");
    try {
      purchasePostingOperationRepository.recover(key);
      record({ operationKey: key, actorId: actor.userId, timestamp: new Date().toISOString(), outcome: "SUCCESS" });
    } catch (error) {
      record({ operationKey: key, actorId: actor.userId, timestamp: new Date().toISOString(), outcome: "ERROR", message: String(error) });
      throw error;
    }
  },
};

registerRepository("purchaseRecovery", { repository: purchasePostingManualRecoveryService, read: "audit.read", commands: { recover: "accounting.recover" }, snapshot: () => events, restore: value => { events.splice(0, events.length, ...value); }, publish: () => {} });
