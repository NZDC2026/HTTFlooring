import { BusinessRecoveryPanel } from './BusinessRecoveryPanel';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { nativeRequest } from './repositoryHost';
import { enterBusiness, refreshSecurity, useSecurity } from './securityClient';
import type { SecurityStatus } from './securityContract';
import { hasPermission, type Permission } from './rbac';
export function SecurityGate({ children }: { children: ReactNode }) {
    const status = useSecurity();
    const [loaded, setLoaded] = useState(false), [ready, setReady] = useState(false), [error, setError] = useState('');
    const [username, setUsername] = useState(''), [displayName, setDisplayName] = useState(''), [password, setPassword] = useState(''), [confirmation, setConfirmation] = useState('');
    const [busy, setBusy] = useState(false), [restartRequired, setRestartRequired] = useState(false);
    useEffect(() => { const stop = () => setRestartRequired(true); window.addEventListener('htt-restart-required', stop); return () => window.removeEventListener('htt-restart-required', stop); }, []);
    useEffect(() => {
        try { const current = refreshSecurity(); if (current.session) { enterBusiness(); setReady(true); } } catch (e) { setError(String(e instanceof Error ? e.message : e)); }
        setLoaded(true);
        const timer = setInterval(() => { try { if (!refreshSecurity().session) setReady(false); } catch { setReady(false); } }, 15_000);
        return () => clearInterval(timer);
    }, []);
    async function submit(event: FormEvent) {
        event.preventDefault(); setBusy(true); setError('');
        try {
            if (!status.initialized && password !== confirmation) throw new Error('Passwords do not match.');
            nativeRequest<SecurityStatus>(status.initialized ? 'login' : 'setup', { username, displayName, password });
            setPassword(''); setConfirmation('');
            refreshSecurity(); enterBusiness(); setReady(true);
        } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
        finally { setBusy(false); }
    }
    if (restartRequired) return <main className="p-10"><h1 className="text-2xl font-semibold">Business data restored</h1><p className="mt-4">Quit and reopen the desktop application before continuing. Your local accounts and security audit history are preserved.</p></main>;
    if (ready && status.session) return children;
    return <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-6"><section className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-[var(--color-primary)]">HTT Management · Local desktop</p>
        <h1 className="mt-3 text-2xl font-semibold">{!loaded ? 'Checking local session…' : status.initialized ? 'Sign in' : 'Create the first administrator'}</h1>
        <p className="mt-3 text-sm text-slate-600">Accounts and audit records are stored on this computer. A new application session requires sign-in.</p>
        {error && <p role="alert" className="my-4 rounded border border-red-300 p-3 text-sm text-red-700">{error}</p>}
        {error && status.session?.user.roles.includes('ADMIN') && <BusinessRecoveryPanel recoveryOnly />}
        {loaded && window.securityBridge && <form onSubmit={submit} className="mt-5 grid gap-4">
            <label className="grid gap-1 text-sm">Username<input className="rounded border p-2" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} required /></label>
            {!status.initialized && <label className="grid gap-1 text-sm">Display name<input className="rounded border p-2" value={displayName} onChange={e => setDisplayName(e.target.value)} required /></label>}
            <label className="grid gap-1 text-sm">Password<input type="password" className="rounded border p-2" autoComplete={status.initialized ? 'current-password' : 'new-password'} minLength={status.initialized ? 1 : 12} value={password} onChange={e => setPassword(e.target.value)} required /></label>
            {!status.initialized && <><label className="grid gap-1 text-sm">Confirm password<input type="password" className="rounded border p-2" autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} required /></label><p className="text-xs text-slate-600">Use at least 12 characters. Existing local business records from this desktop profile will be migrated on first sign-in.</p></>}
            <button disabled={busy} className="rounded bg-[var(--color-primary)] p-3 text-white">{busy ? 'Please wait…' : status.initialized ? 'Sign in' : 'Create administrator'}</button>
        </form>}
    </section></main>;
}
export function RouteAccess({ children }: { children: ReactNode }) {
    const { pathname } = useLocation(), { session } = useSecurity();
    const checks: [string, Permission][] = [['/documents/purchase-output', 'purchases.read'], ['/contacts/review', 'sales.read'],['/payroll', 'payroll.read'], ['/dashboard', 'accounting.read'], ['/demo', 'sales.read'], ['/accounting/financial-recovery', 'audit.read'], ['/accounting', 'accounting.read'], ['/banking', 'banking.read'], ['/purchases', 'purchases.read'], ['/sales', 'sales.read'], ['/inventory', 'inventory.read'], ['/contacts', 'contacts.write'], ['/reports/purchase', 'purchases.read'], ['/reports/grni', 'purchases.read'], ['/reports/aged-payables', 'purchases.read'], ['/reports', 'sales.read']];
    const required = checks.find(([prefix]) => pathname.startsWith(prefix))?.[1];
    const principal = session && { userId: session.user.id, roles: session.user.roles, authenticated: true as const };
    if (pathname === '/settings/security') return children;
    if (required && !hasPermission(principal, required)) return <div role="alert" className="rounded border p-6">Your role does not have access to this workspace.</div>;
    return children;
}
