import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSecurity } from '../features/security/securityClient';
import { hasPermission, type Permission } from '../features/security/rbac';
import { Panel, fieldClass, buttonClass } from '../features/prototype/PrototypeUI';
const destinations: { name: string; description: string; path: string; permission?: Permission }[] = [
 { name: 'Page directory', description: 'Products, tax codes, refunds, bank rules, templates and local workflows', path: '/workspace' },
 { name: 'Business record search', description: 'Current local numbers, names and references available to your role', path: '/search/records', permission: 'inventory.read' },
 { name: 'Tasks & action centre', description: 'Local follow-ups, owners, due dates and audited status history', path: '/tasks', permission: 'sales.read' },
 { name: 'Dashboard', description: 'Financial overview and recent activity', path: '/dashboard', permission: 'accounting.read' },
 { name: 'Sales', description: 'Quotes, orders, invoices and customer credits', path: '/sales', permission: 'sales.read' },
 { name: 'Purchases', description: 'Purchase orders, receipts and supplier bills', path: '/purchases', permission: 'purchases.read' },
 { name: 'Inventory', description: 'Site stock, movements and valuation', path: '/inventory', permission: 'inventory.read' },
 { name: 'Banking', description: 'Bank registers, transfers and reconciliations', path: '/banking', permission: 'banking.read' },
 { name: 'Accounting', description: 'Chart of accounts and journals', path: '/accounting', permission: 'accounting.read' },
 { name: 'Accounting periods', description: 'Close checks and reopening', path: '/accounting/periods', permission: 'accounting.read' },
 { name: 'Report library', description: 'Financial and operational report directory', path: '/reports/library', permission: 'inventory.read' },
 { name: 'Customers', description: 'Customer contacts and pricing', path: '/contacts', permission: 'contacts.write' },
 { name: 'Suppliers', description: 'Supplier contacts and details', path: '/contacts/suppliers', permission: 'contacts.write' },
 { name: 'Employees', description: 'Saved employee payroll profiles', path: '/payroll/employees', permission: 'payroll.read' },
 { name: 'Payroll', description: 'Local pay runs, timesheets and leave', path: '/payroll', permission: 'payroll.read' },
 { name: 'Documents', description: 'Local files, linked business records, versions and recovery', path: '/documents' },
 { name: 'Personal preferences', description: 'Saved sign-in home, table density and reduced motion for your local account', path: '/settings/preferences' },
 { name: 'Local capabilities & integrations', description: 'Implemented local workflows and external service boundaries', path: '/settings/integrations' },
 { name: 'Settings', description: 'Company settings and local capability information', path: '/settings' },
 { name: 'Local access & audit', description: 'Local users, password, audit and backup controls', path: '/settings/security' },
 { name: 'Help', description: 'Workspace guide and feature boundaries', path: '/help' },
];
export function WorkspaceSearchPage() {
 const [query, setQuery] = useState(''), { session } = useSecurity(), principal = session && { userId: session.user.id, roles: session.user.roles, authenticated: true as const };
 const results = destinations.filter(d => (!d.permission || hasPermission(principal, d.permission)) && `${d.name} ${d.description}`.toLowerCase().includes(query.toLowerCase()));
 return <main className="space-y-5"><h1 className="text-3xl font-semibold">Workspace search</h1><p>Find modules and screens available to your role. Search inside a module to find its business records.</p><input autoFocus aria-label="Search modules and screens" className={fieldClass} placeholder="Search payroll, invoices, reports…" value={query} onChange={e => setQuery(e.target.value)} /><div className="grid gap-3 md:grid-cols-2">{results.map(d => <Link key={d.path} className="rounded-xl border bg-white p-5 hover:border-[var(--color-primary)]" to={d.path}><h2 className="font-semibold">{d.name}</h2><p className="mt-2 text-sm text-slate-500">{d.description}</p></Link>)}</div>{!results.length && <Panel title="No matching screens"><p>Try a module name or choose an item from the sidebar.</p><button className={buttonClass} onClick={() => setQuery('')}>Clear search</button></Panel>}</main>;
}
export function HelpPage() {
 return <main className="space-y-5 pb-8"><h1 className="text-3xl font-semibold">Help & workspace guide</h1><p>Choose a workflow below or find a screen with workspace search (⌘K / Ctrl+K).</p><div className="grid gap-4 lg:grid-cols-2">{[
 ['Sales workflow', 'Create a quotation, send and accept it, convert to an order, fulfil stock and review its invoice. Record receipts from the invoice payment form.', '/sales'],
 ['Purchase workflow', 'Create and approve a purchase order, record received goods, match the supplier bill and allocate its payment.', '/purchases'],
 ['Finance & closing', 'Review reconciliation controls, resolve pending operations, configure open accounting periods and run close checks before closing.', '/accounting/periods'],
 ['Local security & recovery', 'Sign in to the desktop profile. Administrators manage users and business backups. Restore requires quitting and reopening the application.', '/settings/security'],
 ['Local payroll', 'Employees, hours, leave, reviewed payroll, journals and recorded payments. Government/STP submission and SuperStream delivery are not connected.', '/payroll'],
 ['Document centre', 'Save files against business records, preview or export versions, and recover recycled attachments. File bytes and audit history are included in local business backups.', '/documents'],
 ['Supplier document recognition', 'macOS English PDF/PNG/JPEG recognition preserves originals and confidence. Verify fields and totals before creating an expense draft; Windows uses manual/CSV. Recognition does not post bills.', '/documents/capture'],
 ['Bank instruction files', 'CommBank/CommBiz ABA files use local preview and independent approval. Export does not execute a bank payment; Basiq AU feed synchronization can be configured separately, with explicit statement import review.', '/banking/instruction-files'],
 ['Personal preferences', 'Choose your sign-in home, compact or comfortable tables and reduced motion. Settings persist for your account on this device, separately from business backups.', '/settings/preferences'],
 ].map(([title, text, path]) => <Panel key={title} title={title}><p className="text-sm leading-6">{text}</p><Link className={buttonClass} to={path}>Open workspace</Link></Panel>)}</div><Panel title="Frequently asked questions">{[
 ['Why is an action unavailable?', 'Actions depend on your signed-in role, document status, accounting period and any unresolved posting operations. Review the displayed reason before retrying.'],
 ['Will changes remain after reload?', 'Business records, files and payroll persist in local main-process storage and business backups. Personal display preferences persist separately on this device for your account.'],
 ['Does the application send data to a live backend?', 'Business data stays in local repositories. Optional Resend email and Stripe checkout use external providers when configured and explicitly enabled. Communications and reminders run only while the application is running with the owner signed in.'],
 ].map(([question, answer]) => <details className="rounded border p-4" key={question}><summary className="font-medium">{question}</summary><p className="mt-3 text-sm">{answer}</p></details>)}</Panel></main>;
}
export { ActionCentrePage as NotificationsPage } from '../features/action-centre/ActionCentrePage';
