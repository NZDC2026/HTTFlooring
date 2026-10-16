import { Link } from 'react-router-dom';
import { useSecurity } from '../../security/securityClient';
import { hasPermission, type Permission } from '../../security/rbac';
const reports: { name: string; group: string; description: string; path: string; permission: Permission }[] = [
 { name: 'Cash flow · Sample', group: 'Additional previews', description: 'Cash flow layout with illustrative figures.', path: '/reports/cash-flow', permission: 'accounting.read' },
 { name: 'Sales analysis · Sample', group: 'Additional previews', description: 'Customer sales analysis layout.', path: '/reports/sales-analysis', permission: 'sales.read' },
 { name: 'Purchase analysis · Sample', group: 'Additional previews', description: 'Supplier purchase analysis layout.', path: '/reports/purchase-analysis', permission: 'purchases.read' },
 { name: 'Payroll summary · Sample', group: 'Additional previews', description: 'Gross, deductions and net pay layout.', path: '/reports/payroll-summary', permission: 'accounting.read' },
 { name: 'Banking summary · Sample', group: 'Additional previews', description: 'Account movements layout.', path: '/reports/banking-summary', permission: 'banking.read' },
 { name: 'Saved & favourite reports · Sample', group: 'Additional previews', description: 'Dataset, column and filter configuration.', path: '/reports/saved', permission: 'accounting.read' },
 { name: 'Report packs · Sample', group: 'Additional previews', description: 'Cover, contents and combined report layouts.', path: '/reports/packs', permission: 'accounting.read' },
 { name: 'Aged receivables', group: 'Receivables', description: 'Customer balances and overdue ageing.', path: '/reports', permission: 'sales.read' },
 { name: 'Aged payables', group: 'Payables', description: 'Supplier balances and payment ageing.', path: '/reports/aged-payables', permission: 'purchases.read' },
 { name: 'Trial balance', group: 'General ledger', description: 'Opening, period movements and closing balances.', path: '/accounting/trial-balance', permission: 'accounting.read' },
 { name: 'General ledger', group: 'General ledger', description: 'Account journal detail over a selected period.', path: '/accounting/general-ledger', permission: 'accounting.read' },
 { name: 'Profit & loss', group: 'Financial statements', description: 'Revenue, expenses and period earnings.', path: '/accounting/profit-and-loss', permission: 'accounting.read' },
 { name: 'Balance sheet', group: 'Financial statements', description: 'Assets, liabilities and equity at a selected date.', path: '/accounting/balance-sheet', permission: 'accounting.read' },
 { name: 'AR to GL reconciliation', group: 'Controls', description: 'Customer subledger compared with the receivables control.', path: '/accounting/reconciliation/ar', permission: 'accounting.read' },
 { name: 'AP to GL reconciliation', group: 'Controls', description: 'Supplier subledger compared with the payables control.', path: '/accounting/reconciliation/ap', permission: 'accounting.read' },
 { name: 'Inventory valuation', group: 'Inventory', description: 'Inventory quantities and moving-average values.', path: '/inventory/valuation', permission: 'inventory.read' },
 { name: 'Inventory to GL', group: 'Inventory', description: 'Cost movements reconciled with inventory control.', path: '/inventory/reconciliation', permission: 'inventory.read' },
 { name: 'GRNI outstanding', group: 'Purchasing', description: 'Received goods awaiting supplier bill matching.', path: '/reports/grni-outstanding', permission: 'purchases.read' },
 { name: 'Purchase reconciliation', group: 'Purchasing', description: 'Purchase documents and accounting integration.', path: '/reports/purchase-accounting-reconciliation', permission: 'purchases.read' },
 { name: 'Purchase posting audit', group: 'Purchasing', description: 'Posting operations, recovery states and evidence.', path: '/reports/purchase-posting-audit', permission: 'purchases.read' },
 { name: 'Finance controls', group: 'Controls', description: 'Consolidated consistency checks and drill-downs.', path: '/accounting/finance-controls', permission: 'accounting.read' },
];
export function ReportsLibraryPage() {
 const { session } = useSecurity(), principal = session && { userId: session.user.id, roles: session.user.roles, authenticated: true as const };
 const visible = reports.filter(r => hasPermission(principal, r.permission));
 return <main className="space-y-5 pb-8"><header><p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">Insights</p><h1 className="mt-1 font-display text-3xl">Report library</h1><p className="mt-2 text-sm text-[var(--color-text-secondary)]">Open an existing report to choose its date range, filters and detail views.</p></header>{[...new Set(visible.map(r => r.group))].map(group => <section key={group} className="space-y-3"><h2 className="text-lg font-semibold">{group}</h2><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.filter(r => r.group === group).map(r => <Link key={r.path} to={r.path} className="rounded-xl border border-[var(--color-border)] bg-white p-5 transition hover:border-[var(--color-primary)]"><h3 className="font-semibold">{r.name}</h3><p className="mt-2 text-sm text-[var(--color-text-secondary)]">{r.description}</p><p className="mt-4 text-sm font-medium text-[var(--color-primary)]">Open report →</p></Link>)}</div></section>)}{!visible.length && <p>No reports are available for your current role.</p>}</main>;
}
