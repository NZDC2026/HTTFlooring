import { useState } from 'react';
import { nativeRequest } from './repositoryHost';
type Preview = { token: string; schemaVersion: number; savedAt: string; counts: Record<string, number> };
export function BusinessRecoveryPanel({ recoveryOnly = false }: { recoveryOnly?: boolean }) {
    const [preview, setPreview] = useState<Preview | null>(null), [message, setMessage] = useState(''), [confirmed, setConfirmed] = useState(false), [restored, setRestored] = useState(false);
    function run(action: () => void) { try { setMessage(''); action(); } catch (e) { setMessage(e instanceof Error ? e.message : String(e)); } }
    return <section className="space-y-3 rounded border bg-white p-5"><h2 className="text-xl font-semibold">Business backup & recovery</h2><p className="text-sm">Backups contain all business repositories, inventory costs, fulfilments and recovery records. Local users, passwords and security audit history stay on this computer. Keep backup files private.</p>
        {!recoveryOnly && <button disabled={restored} className="mr-3 rounded border p-2" onClick={() => run(() => { const result = nativeRequest<{ saved: boolean }>('business.backup.save'); if (result.saved) setMessage('Backup saved.'); })}>Save backup…</button>}
        <button disabled={restored} className="rounded border p-2" onClick={() => run(() => { setPreview(null); setConfirmed(false); setPreview(nativeRequest<Preview | null>('business.restore.preview')); })}>Select backup to restore…</button>
        {preview && !restored && <div className="space-y-3 rounded border p-3"><p>Snapshot v{preview.schemaVersion} · {preview.savedAt}</p><details><summary>Repository record counts</summary>{Object.entries(preview.counts).map(([name, count]) => <p key={name}>{name}: {count}</p>)}</details><label className="flex gap-2 text-sm"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />Replace current business data with this snapshot. A copy of the current file will be preserved. Restart will be required.</label><button disabled={!confirmed} className="rounded border border-red-400 p-2" onClick={() => run(() => { nativeRequest('business.restore.commit', { token: preview.token }); setRestored(true); window.dispatchEvent(new Event('htt-restart-required')); setMessage('Restore saved. Quit and reopen the desktop application before continuing.'); })}>Restore selected snapshot</button></div>}
        {message && <p role="status" className="break-words text-sm">{message}</p>}
    </section>;
}
