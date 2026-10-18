import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSecurity } from '../features/security/securityClient';
import { hasPermission, type Permission } from '../features/security/rbac';
import { Panel, fieldClass, buttonClass } from '../features/prototype/PrototypeUI';
const destinations: { name: string; description: string; path: string; permission?: Permission }[] = [
 { name: 'Page directory', description: 'Products, tax codes, refunds, bank rules, templates and additional previews', path: '/workspace' },
 { name: 'Business record search', description: 'Current local numbers, names and references available to your role', path: '/search/records', permission: 'inventory.read' },
 { name: 'Tasks & action centre', description: 'Follow-ups, owners, due dates and status history samples', path: '/tasks', permission: 'sales.read' },
 { name: 'Dashboard', description: 'Financial overview and recent activity', path: '/dashboard', permission: 'accounting.read' },
 { name: 'Sales', description: 'Quotes, orders, invoices and customer credits', path: '/sales', permission: 'sales.read' },
 { name: 'Purchases', description: 'Purchase orders, receipts and supplier bills', path: '/purchases', permission: 'purchases.read' },
 { name: 'Inventory', description: 'Site stock, movements and valuation', path: '/inventory', permission: 'inventory.read' },
 { name: 'Banking', description: 'Bank registers, transfers and reconciliations', path: '/banking', permission: 'banking.read' },
 { name: 'Accounting', description: 'Chart of accounts and journals', path: '/accounting', permission: 'accounting.read' },
 { name: 'Accounting periods', description: 'Close checks and reopening', path: '/accounting/periods', permission: 'accounting.read' },
 { name: 'Report library', description: 'Financial and operational report directory', path: '/reports/library', permission: 'sales.read' },
 { name: 'Customers', description: 'Customer contacts and pricing', path: '/contacts', permission: 'contacts.write' },
 { name: 'Suppliers', description: 'Supplier contacts and details', path: '/contacts/suppliers', permission: 'contacts.write' },
 { name: 'Employees', description: 'Sample employee profiles', path: '/payroll/employees', permission: 'accounting.read' },
 { name: 'Payroll', description: 'Sample pay runs, timesheets and leave', path: '/payroll', permission: 'accounting.read' },
 { name: 'Documents', description: 'Sample document library and upload preview', path: '/documents' },
 { name: 'Settings', description: 'Company and preference previews', path: '/settings' },
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
 ['Payroll prototype', 'Explore employees, hours, leave, sample pay runs and payslip layouts. Preview amounts do not perform tax calculations or payments.', '/payroll'],
 ['Document prototype', 'Explore metadata, sample content outlines, version/access layouts and file-selection preview. No file bytes are uploaded or stored.', '/documents'],
 ].map(([title, text, path]) => <Panel key={title} title={title}><p className="text-sm leading-6">{text}</p><Link className={buttonClass} to={path}>Open workspace</Link></Panel>)}</div><Panel title="Frequently asked questions">{[
 ['Why is an action unavailable?', 'Actions depend on your signed-in role, document status, accounting period and any unresolved posting operations. Review the displayed reason before retrying.'],
 ['Will prototype changes remain after reload?', 'Payroll, documents and general setting previews reset on reload. Actual finance, contacts, security and period data use the local main-process storage.'],
 ['Does the application send data to a live backend?', 'The current implementation uses local repositories and mocks. The integration configuration screens are static previews.'],
 ].map(([question, answer]) => <details className="rounded border p-4" key={question}><summary className="font-medium">{question}</summary><p className="mt-3 text-sm">{answer}</p></details>)}</Panel></main>;
}
export function NotificationsPage() {
 const [read, setRead] = useState<string[]>([]), [filter, setFilter] = useState('All');
 const items = [{ id: 'sample-1', title: 'Payroll review example', text: 'A sample timesheet is ready for review.', path: '/payroll/timesheets' }, { id: 'sample-2', title: 'Document review example', text: 'The sample stock-count worksheet is in draft.', path: '/documents/DOC-1003' }];
 const rows = items.filter(i => filter === 'All' || !read.includes(i.id));
 return <main className="space-y-5"><h1 className="text-3xl font-semibold">Notifications</h1><p className="rounded border border-amber-200 bg-amber-50 p-3">Sample notification layouts only. These are illustrative messages, not a live business alert feed.</p><div className="flex flex-wrap gap-3"><select aria-label="Notification filter" className={`${fieldClass} max-w-48`} value={filter} onChange={e => setFilter(e.target.value)}><option>All</option><option>Unread</option></select><button className={buttonClass} onClick={() => setRead(items.map(i => i.id))}>Mark samples read</button></div>{rows.map(i => <Panel key={i.id} title={i.title}><p>{i.text}</p><p className="text-sm text-slate-500">{read.includes(i.id) ? 'Read' : 'Unread'} · Sample</p><div className="flex gap-3"><Link className={buttonClass} to={i.path}>View example</Link><button className={buttonClass} onClick={() => setRead(read.includes(i.id) ? read.filter(id => id !== i.id) : [...read, i.id])}>{read.includes(i.id) ? 'Mark unread' : 'Mark read'}</button></div></Panel>)}{!rows.length && <Panel title="All caught up"><p>No unread sample notifications.</p></Panel>}</main>;
}
