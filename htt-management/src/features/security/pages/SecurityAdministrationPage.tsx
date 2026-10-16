import { BusinessRecoveryPanel } from '../BusinessRecoveryPanel';
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { roles, hasPermission, type Role } from '../rbac';
import { nativeRequest } from '../repositoryHost';
import { refreshSecurity, useSecurity } from '../securityClient';
import type { PublicUser, SecurityAuditRow } from '../securityContract';
const inputStyle = 'rounded border p-2';
export function SecurityAdministrationPage() {
    const { session } = useSecurity();
    const principal = session && { userId: session.user.id, roles: session.user.roles, authenticated: true as const };
    const manage = hasPermission(principal, 'users.manage'), audit = hasPermission(principal, 'audit.read');
    const [users, setUsers] = useState<PublicUser[]>([]), [rows, setRows] = useState<SecurityAuditRow[]>([]), [total, setTotal] = useState(0);
    const [error, setError] = useState(''), [notice, setNotice] = useState(''), [offset, setOffset] = useState(0), [query, setQuery] = useState('');
    const [username, setUsername] = useState(''), [displayName, setDisplayName] = useState(''), [password, setPassword] = useState(''), [role, setRole] = useState<Role>('SALES');
    const [currentPassword, setCurrentPassword] = useState(''), [nextPassword, setNextPassword] = useState(''), [confirmPassword, setConfirmPassword] = useState('');
    function load() {
        try {
            if (manage) setUsers(nativeRequest<PublicUser[]>('users.list'));
            if (audit) { const result = nativeRequest<{ total: number; rows: SecurityAuditRow[] }>('audit.list', { offset, limit: 30, query }); setRows(result.rows); setTotal(result.total); }
            setError('');
        } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    }
    useEffect(load, [manage, audit, offset, query]);
    function create(event: FormEvent) {
        event.preventDefault();
        try { nativeRequest('users.create', { username, displayName, password, roles: [role] }); setPassword(''); setUsername(''); setDisplayName(''); setNotice('User created.'); load(); } catch (e) { setError(String(e instanceof Error ? e.message : e)); }
    }
    function saveUser(user: PublicUser) {
        try { nativeRequest('users.update', { id: user.id, roles: user.roles, active: user.active }); refreshSecurity(); setNotice('User permissions saved.'); load(); } catch (e) { setError(String(e instanceof Error ? e.message : e)); }
    }
    function changePassword(event: FormEvent) {
        event.preventDefault();
        try { if (nextPassword !== confirmPassword) throw new Error('Passwords do not match.'); nativeRequest('password.change', { currentPassword, password: nextPassword }); setCurrentPassword(''); setNextPassword(''); setConfirmPassword(''); refreshSecurity(); } catch (e) { setError(String(e instanceof Error ? e.message : e)); }
    }
    return <main className="space-y-6 pb-8"><Link className="underline" to="/settings">← Settings</Link><h1 className="text-3xl font-semibold">Local access & audit</h1>
        <p className="text-sm">Signed in as {session?.user.displayName} · {session?.user.roles.join(', ')}</p>
        {error && <p role="alert" className="rounded border border-red-400 p-3 text-red-700">{error}</p>}{notice && <p role="status">{notice}</p>}
        {manage && <BusinessRecoveryPanel />}
        {manage && <section className="space-y-4 rounded border bg-white p-5"><h2 className="text-xl font-semibold">Users & roles</h2>
            <form onSubmit={create} className="flex flex-wrap items-end gap-3"><label className="grid text-sm">Username<input className={inputStyle} value={username} onChange={e => setUsername(e.target.value)} required autoComplete="off" /></label><label className="grid text-sm">Display name<input className={inputStyle} value={displayName} onChange={e => setDisplayName(e.target.value)} required /></label><label className="grid text-sm">Initial password<input type="password" className={inputStyle} value={password} onChange={e => setPassword(e.target.value)} minLength={12} required autoComplete="new-password" /></label><label className="grid text-sm">Role<select className={inputStyle} value={role} onChange={e => setRole(e.target.value as Role)}>{roles.map(value => <option key={value}>{value}</option>)}</select></label><button className="rounded border p-2">Create user</button></form>
            {users.map(user => <UserRow key={user.id} user={user} save={saveUser} />)}
        </section>}
        <section className="space-y-3 rounded border bg-white p-5"><h2 className="text-xl font-semibold">Change your password</h2><form onSubmit={changePassword} className="grid max-w-md gap-3"><label className="grid text-sm">Current password<input className={inputStyle} type="password" autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required /></label><label className="grid text-sm">New password<input className={inputStyle} type="password" autoComplete="new-password" minLength={12} value={nextPassword} onChange={e => setNextPassword(e.target.value)} required /></label><label className="grid text-sm">Confirm new password<input className={inputStyle} type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required /></label><button className="rounded border p-2">Change password and sign out</button></form></section>
        {audit && <section className="space-y-3 rounded border bg-white p-5"><h2 className="text-xl font-semibold">Persistent operation audit</h2><p className="text-sm">Append-only through the application API; chain integrity is checked when the desktop starts. Passwords are never included.</p><div className="flex gap-3"><input aria-label="Filter audit" className={inputStyle} placeholder="Actor ID, action, resource or outcome" value={query} onChange={e => { setQuery(e.target.value); setOffset(0); }} /><button className="rounded border p-2" onClick={load}>Refresh audit</button></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] table-fixed text-left text-sm"><thead><tr>{['Time', 'Actor', 'Action', 'Resource', 'Outcome'].map(label => <th className="p-2" key={label}>{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-t"><td className="p-2">{row.timestamp}</td><td className="break-all p-3">{row.actorId}</td><td className="break-all p-3">{row.action}</td><td className="break-all p-3">{row.resourceId}</td><td className="p-2">{row.outcome}</td></tr>)}</tbody></table></div><p>{total} matching events</p><button className="mr-3 rounded border p-2" disabled={!offset} onClick={() => setOffset(Math.max(0, offset - 30))}>Previous</button><button className="rounded border p-2" disabled={offset + 30 >= total} onClick={() => setOffset(offset + 30)}>Next</button></section>}
    </main>;
}
function UserRow({ user, save }: { user: PublicUser; save: (user: PublicUser) => void }) {
    const [selected, setSelected] = useState(user.roles), [active, setActive] = useState(user.active);
    useEffect(() => { setSelected(user.roles); setActive(user.active); }, [user]);
    return <fieldset className="rounded border p-3"><legend className="px-2 font-medium">{user.displayName} · {user.username}</legend><div className="flex flex-wrap gap-3">{roles.map(role => <label key={role} className="flex items-center gap-1 text-sm"><input type="checkbox" checked={selected.includes(role)} onChange={e => setSelected(e.target.checked ? [...selected, role] : selected.filter(value => value !== role))} />{role}</label>)}<label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />Active</label><button className="rounded border px-3 py-1" onClick={() => save({ ...user, roles: selected, active })}>Save permissions</button></div></fieldset>;
}
