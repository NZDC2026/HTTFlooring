import { purchasePostingOperationRepository } from "./purchasePostingOperationRepository";
import type { PurchasePostingOperation } from "./purchasePostingOperationRepository";

/** Restarted operations are read-only until all business ledgers are reconciled. */
export type RestartSafetyFinding = {
  operation: PurchasePostingOperation;
  requiresManualReconciliation: boolean;
  reason: string;
};

export const purchasePostingRestartSafetyService = {
  inspect(): RestartSafetyFinding[] {
    return purchasePostingOperationRepository.getAll().map(operation => {
      const interrupted = operation.error?.startsWith("Restored after restart:") ?? false;
      const unsafe = interrupted || operation.status === "FAILED" ||
        (operation.status === "RECOVERY_REQUIRED" && !purchasePostingOperationRepository.hasRecoveryHandler(operation.key));
      return {
        operation,
        requiresManualReconciliation: unsafe,
        reason: interrupted
          ? "Interrupted during a previous application session; reconcile GL, inventory, PO and FIFO against durable records."
          : operation.status === "FAILED"
            ? "A repository step may have partially mutated business state; automatic replay is prohibited."
            : unsafe
              ? "No live recovery handler is available; automatic replay is prohibited."
              : "No restart-specific blocker detected; normal recovery authorization still applies.",
      };
    });
  },
  blocked(): RestartSafetyFinding[] { return this.inspect().filter(item => item.requiresManualReconciliation); },
};
