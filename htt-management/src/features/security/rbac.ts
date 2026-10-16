/** Role-based authorization policy. Roles must come from a verified identity provider. */
export const permissions = [
  'sales.read','sales.write','sales.manage','sales.payment','purchases.read','purchases.receive',
  'purchases.bill','purchases.void','inventory.read','inventory.cost.read','inventory.adjust',
  'accounting.read','accounting.post','accounting.periods','accounting.reopen','accounting.recover','audit.read','users.manage','contacts.write','purchases.write','purchases.payment','banking.read','banking.write','banking.reconcile',
] as const;
export type Permission = typeof permissions[number];
export const roles = ['ADMIN','FINANCE_ADMIN','ACCOUNTANT','SALES','WAREHOUSE','PURCHASING','AUDITOR'] as const;
export type Role = typeof roles[number];
export type VerifiedPrincipal = { readonly userId: string; readonly roles: readonly string[]; readonly authenticated: true };
const policy: Record<Role, readonly Permission[]> = {
  ADMIN: permissions,
  FINANCE_ADMIN: ['accounting.periods','accounting.reopen','sales.read','sales.manage','sales.payment','purchases.read','purchases.bill','purchases.void','inventory.read','inventory.cost.read','accounting.read','accounting.post','accounting.recover','audit.read','banking.read','banking.write','banking.reconcile','purchases.payment','purchases.write','contacts.write'],
  ACCOUNTANT: ['banking.read','banking.reconcile','sales.read','sales.manage','purchases.read','inventory.read','inventory.cost.read','accounting.read','accounting.post','audit.read'],
  SALES: ['contacts.write','sales.read','sales.write','inventory.read'],
  WAREHOUSE: ['inventory.read','inventory.adjust','purchases.read','purchases.receive'],
  PURCHASING: ['contacts.write','purchases.write','purchases.read','purchases.receive','purchases.bill','inventory.read'],
  AUDITOR: ['banking.read','sales.read','purchases.read','inventory.read','inventory.cost.read','accounting.read','audit.read'],
};
export function hasPermission(principal: VerifiedPrincipal | null, permission: Permission): boolean {
  return Boolean(principal?.authenticated && principal.userId.trim() && principal.roles.some(
    role => Object.prototype.hasOwnProperty.call(policy, role) && policy[role as Role].includes(permission),
  ));
}
export function requirePermission(principal: VerifiedPrincipal | null, permission: Permission): VerifiedPrincipal {
  if (!hasPermission(principal, permission)) throw new Error(`Permission denied: ${permission}. Verified session required.`);
  return principal!;
}
export function permissionsForRole(role: Role): readonly Permission[] { return policy[role]; }
