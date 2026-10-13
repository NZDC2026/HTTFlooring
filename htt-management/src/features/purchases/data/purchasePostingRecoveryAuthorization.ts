/** Fail-closed integration point. Only a trusted authenticated session adapter may register a resolver. */
export type RecoveryPrincipal = { userId: string; roles: readonly string[]; authenticated: true };
let resolver: (() => RecoveryPrincipal | null) | null = null;
export const purchasePostingRecoveryAuthorization = {
  configureTrustedSession(getPrincipal: () => RecoveryPrincipal | null): void { resolver = getPrincipal; },
  clear(): void { resolver = null; },
  current(): RecoveryPrincipal | null { return resolver?.() ?? null; },
  canRecover(): boolean {
    const principal = this.current();
    return Boolean(principal?.authenticated && principal.userId.trim() && principal.roles.some(role => role === "FINANCE_ADMIN" || role === "ADMIN"));
  },
  requireRecoveryPermission(): RecoveryPrincipal {
    const principal = this.current();
    if (!principal?.authenticated || !principal.userId.trim() || !principal.roles.some(role => role === "FINANCE_ADMIN" || role === "ADMIN")) {
      throw new Error("Recovery requires an authenticated finance administrator or administrator.");
    }
    return principal;
  },
};
