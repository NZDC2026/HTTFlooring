import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inspectFinancialOperationsAfterRestart, markFinancialOperationForManualReview, type FinancialRecoveryFinding } from '../../../lib/persistence/financialRestartInspection';

/** Read-only recovery queue with an explicit flag-for-review action. Never auto-posts. */
export function FinancialRecoveryReviewPage() {
    const navigate = useNavigate();
    const [revision, setRevision] = useState(0);
    const [reason, setReason] = useState('Unresolved financial operation after restart; manual reconciliation required.');
    const [error, setError] = useState<string | null>(null);
    let findings: FinancialRecoveryFinding[] = [];
    let inspectionError: string | null = null;
    try { findings = inspectFinancialOperationsAfterRestart(); }
    catch (e) { inspectionError = e instanceof Error ? e.message : String(e); }
    const displayedError = inspectionError ?? error;
    const flag = (id: string) => {
        try { markFinancialOperationForManualReview(id, reason); setError(null); setRevision(v => v + 1); }
        catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    };
    return <main className="p-6 space-y-5" data-revision={revision}>
        <button className="text-sm underline" onClick={() => navigate('/accounting/finance-controls')}>← Finance Controls</button>
        <h1 className="text-2xl font-semibold">Financial Recovery Review</h1>
        <p className="text-sm">Unresolved operations are never replayed or automatically completed. Check bank statements, payment records and GL entries before any manual correction.</p>
        {displayedError && <div role="alert" className="rounded border border-red-500 p-3">Storage or review error: {displayedError}. Financial actions are blocked until resolved.</div>}
        {!displayedError && findings.length === 0 && <p>No unresolved financial operations.</p>}
        {findings.map(item => <section key={item.operationId} className="rounded border p-4 space-y-2">
            <h2 className="font-semibold">{item.kind} — {item.state}</h2>
            <p className="text-sm break-all">Operation: {item.operationId}</p>
            <p className="text-sm">Created: {item.createdAt} · Result: {item.resultId ?? 'Unknown'}</p>
            <p className="text-sm">Snapshot evidence: {item.businessRecordCount} business record(s), {item.journalCount} GL journal(s)</p>
            <p className="text-sm break-all">GL IDs: {item.journalIds.join(', ') || 'None'} · Linked GL: {item.linkedJournalId ?? 'Unknown'}</p>
            <p className="text-sm font-medium">Finding: {item.finding}</p>
            {item.note && <p className="text-sm">Note: {item.note}</p>}
            {item.state === 'PENDING' && <button className="rounded border px-3 py-2 text-sm" disabled={!reason.trim()} onClick={() => flag(item.operationId)}>Flag for manual review</button>}
        </section>)}
        {findings.some(item => item.state === 'PENDING') && <label className="block text-sm">Review reason <input className="block w-full rounded border p-2" value={reason} onChange={e => setReason(e.target.value)} /></label>}
    </main>;
}
