import { purchasePostingOperationRepository } from "./purchasePostingOperationRepository";
import { purchasePostingRecoveryAuthorization } from "./purchasePostingRecoveryAuthorization";

export type ManualRecoveryAuditEvent = {
  operationKey: string;
  actorId: string;
  timestamp: string;
  outcome: "SUCCESS" | "ERROR";
  message?: string;
};
const events: ManualRecoveryAuditEvent[] = [];
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
      events.push({ operationKey: key, actorId: actor.userId, timestamp: new Date().toISOString(), outcome: "SUCCESS" });
    } catch (error) {
      events.push({ operationKey: key, actorId: actor.userId, timestamp: new Date().toISOString(), outcome: "ERROR", message: String(error) });
      throw error;
    }
  },
};
