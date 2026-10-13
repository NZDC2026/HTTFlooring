import { purchasePostingRecoveryAuthorization } from "./purchasePostingRecoveryAuthorization";
import type { RecoveryPrincipal } from "./purchasePostingRecoveryAuthorization";

/**
 * Integration boundary for a REAL authenticated backend / Electron main process.
 * Never derive this principal from localStorage, UI-selected roles, or user input.
 * The caller must validate the session server-side on each read and reject expired sessions.
 */
export const purchasePostingTrustedSessionBridge = {
  connect(getVerifiedPrincipal: () => RecoveryPrincipal | null): () => void {
    purchasePostingRecoveryAuthorization.configureTrustedSession(getVerifiedPrincipal);
    return () => purchasePostingRecoveryAuthorization.clear();
  },
  disconnect(): void { purchasePostingRecoveryAuthorization.clear(); },
};
