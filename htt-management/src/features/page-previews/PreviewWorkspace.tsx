import {useState,type ReactNode} from 'react';
import {Link} from 'react-router-dom';
import {Panel,fieldClass,buttonClass} from '../prototype/PrototypeUI';
import {useSecurity} from '../security/securityClient';
import {hasPermission} from '../security/rbac';
import {previewGroups} from './catalog';
import {directoryEntries} from './directoryCatalog';
export function Notice({ children, error = false }: { children?: ReactNode; error?: boolean }) { return children ? <div role={error ? 'alert' : 'status'} className={`rounded-lg border p-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}>{children}</div> : null; }
export function DirectoryPage() {
 const [query, setQuery] = useState(''), { session } = useSecurity();
 const principal = session && { userId: session.user.id, roles: session.user.roles, authenticated: true as const };
 const items=directoryEntries.filter(x=>hasPermission(principal,x.permission)&&`${x.name} ${x.group} ${x.description}`.toLowerCase().includes(query.toLowerCase()));
 return <div className="space-y-5 pb-10"><header><h1 className="font-display text-3xl">Management page directory</h1><p className="mt-2 text-sm">These entries open local business workflows. Each page describes its approval, persistence and output limits. External email, bank feeds and tax submission remain disconnected.</p></header><input aria-label="Find a management page" placeholder="Find products, refunds, bank rules…" className={fieldClass} value={query} onChange={e => setQuery(e.target.value)} />{previewGroups.map(group => { const rows = items.filter(x => x.group === group); return rows.length ? <section key={group} className="space-y-3"><h2 className="text-lg font-semibold">{group}</h2><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{rows.map(x => <Link key={x.path} to={x.path} className="rounded-xl border border-[var(--color-border)] bg-white p-4 text-sm font-medium hover:border-[var(--color-primary)]">{x.name}<span className="mt-2 block text-xs text-[var(--color-text-muted)]">Open local business data →</span><p className="mt-2 text-sm font-normal">{x.description}</p></Link>)}</div></section> : null; })}{!items.length && <Panel title="No matching pages"><button className={buttonClass} onClick={() => setQuery('')}>Clear search</button></Panel>}<Panel title="Scope"><p className="text-sm">This directory covers the management / finance application. The separate sales application and customer portal require their own page acceptance. Time Billing, Activity Billing and Fixed Assets are outside this V1 scope.</p></Panel></div>;
}
