import { requirePermission, type Permission, type VerifiedPrincipal } from './rbac';
/** This adapter must be connected to a verified server / Electron-main session.
 * Never use a role chosen in the renderer or stored in localStorage as a trusted identity.
 * With no trusted adapter, privileged actions are denied.
 */
let provider: (() => VerifiedPrincipal | null) | null = null;
export const trustedAuthorization = {
  connect(resolver: () => VerifiedPrincipal | null): () => void {
    provider = resolver;
    return () => { if (provider === resolver) provider = null; };
  },
  disconnect(): void { provider = null; },
  current(): VerifiedPrincipal | null { return provider?.() ?? null; },
  require(permission: Permission): VerifiedPrincipal { return requirePermission(this.current(), permission); },
};
