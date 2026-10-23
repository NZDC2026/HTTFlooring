import { useState } from 'react';
import { datasets, fields, permissions, parseSource, type Dataset, type TransferPreview, type TransferRun, type TransferSource } from './transferModel';
import { transferClient, useTransferRuns } from './transferClient';
import { useSecurity } from '../security/securityClient';
import { hasPermission } from '../security/rbac';
import { BusinessFrame } from '../business-workspace/MasterDataPages';
import { Panel, Field, SampleTable, Cell, fieldClass, buttonClass } from '../prototype/PrototypeUI';
import { downloadFile, csvText } from '../../lib/csv';
export function DataTransferPage() {
    const runs = useTransferRuns(), { session } = useSecurity(), principal = session ? { userId: session.user.id, roles: session.user.roles, authenticated: true as const } : null, available = datasets.filter(d => hasPermission(principal, permissions[d].read));
    const [dataset, setDataset] = useState<Dataset>(available.find(d => hasPermission(principal, permissions[d].write)) ?? available[0] ?? 'Products'), [mode, setMode] = useState<TransferSource['mode']>('Create'), [text, setText] = useState(''), [fileName, setFileName] = useState(''), [headers, setHeaders] = useState<string[]>([]), [mapping, setMapping] = useState<Record<string, number>>({}), [preview, setPreview] = useState<TransferPreview>(), [operationId, setOperationId] = useState(() => crypto.randomUUID()), [reason, setReason] = useState(''), [confirmed, setConfirmed] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [page, setPage] = useState(0), [runPage, setRunPage] = useState(0), [selectedRun, setSelectedRun] = useState<TransferRun>(), [result, setResult] = useState<TransferRun>();
    const canWrite = hasPermission(principal, permissions[dataset].read) && hasPermission(principal, permissions[dataset].write), source = { dataset, mode, text, fileName, mapping }, visibleRuns = runs.filter(r => r.dataset === dataset && hasPermission(principal, permissions[dataset].read)).sort((a, b) => b.at.localeCompare(a.at) || a.id.localeCompare(b.id)), runLast = Math.max(0, Math.ceil(visibleRuns.length / 50) - 1), runCurrent = Math.min(runPage, runLast), last = Math.max(0, Math.ceil((preview?.rows.length ?? 0) / 50) - 1), current = Math.min(page, last);
    const invalidate = () => { setPreview(undefined); setResult(undefined); setConfirmed(false); setOperationId(crypto.randomUUID()); setPage(0); };
    const action = (fn: () => void) => {
        try {
            fn();
            setError('');
        }
        catch (e) {
            setError((e as Error).message);
        }
    };
    async function loadFile(file?: File) {
        if (!file)
            return;
        setBusy(true);
        setError('');
        setNotice('');
        invalidate();
        setHeaders([]);
        setText('');
        setFileName('');
        try {
            if (!/\.csv$/i.test(file.name) || file.size > 1000000)
                throw new Error('Choose a UTF-8 CSV file no larger than 1 MB.');
            const bytes = await file.arrayBuffer(), csv = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes), parsed = parseSource({ dataset, mode, text: csv, fileName: file.name });
            setText(csv);
            setFileName(file.name);
            setHeaders(parsed.headers);
            setMapping(parsed.mapping);
        }
        catch (e) {
            setError((e as Error).message);
        }
        finally {
            setBusy(false);
        }
    }
    const validate = () => action(() => { const p = transferClient.review(source); setPreview(p); setPage(0); setConfirmed(false); setResult(undefined); setNotice(p.valid ? 'Validation passed. Review every mapped field and confirm the batch before committing.' : 'Validation found errors. No records have been imported.'); });
    const commit = () => action(() => {
        if (!preview?.valid || !confirmed)
            throw new Error('Validate and confirm the batch first.');
        const r = transferClient.commit({ ...source, operationId, expectedPreview: preview.fingerprint, reason });
        setResult(r);
        setSelectedRun(r);
        setOperationId(crypto.randomUUID());
        setPreview(undefined);
        setConfirmed(false);
        setNotice(`Batch committed: ${r.results.filter(r => r.action === 'Created').length} created, ${r.results.filter(r => r.action === 'Updated').length} updated, ${r.results.filter(r => r.action === 'Skipped').length} prior source records skipped.`);
    });
    const exportRun = (run: TransferRun) => downloadFile(`import-results-${run.id}.csv`, csvText([['Dataset', run.dataset], ['Mode', run.mode], ['Source', run.fileName], ['Recorded at', run.at], ['Actor', run.actorId], ['Reason', run.reason], ['CSV record', 'External ID', 'Record ID', 'Outcome'], ...run.results.map(r => [String(r.row), r.externalId, r.recordId, r.action])]), 'text/csv');
    return <BusinessFrame title="Business data import & export"><p>Import customers, suppliers, customer branches/contacts and product catalogues into the current local business. Validate first; a committed batch is all-or-nothing. Updates require existing IDs and record tokens from a current export. Bank statements, opening balances and transaction documents use their dedicated business workflows.</p>{error && <p role="alert" className="my-3 rounded border border-red-300 p-3 whitespace-pre-wrap text-red-700">{error}</p>}{notice && <p role="status" className="my-3 rounded border p-3">{notice}</p>}
 <Panel title="Dataset and export"><div className="flex flex-wrap gap-3 items-end"><Field label="Business dataset"><select className={fieldClass} value={dataset} disabled={busy} onChange={e => { setDataset(e.target.value as Dataset); setHeaders([]); setText(''); setMapping({}); setFileName(''); setRunPage(0); setSelectedRun(undefined); setReason(''); invalidate(); setNotice(''); }}>{available.map(d => <option key={d}>{d}</option>)}</select></Field><button className={buttonClass} onClick={() => action(() => downloadFile(`create-${dataset.toLowerCase().replaceAll(' ', '-')}-template.csv`, transferClient.template(dataset), 'text/csv'))}>Download create CSV template</button><button className={buttonClass} onClick={() => action(() => { const exported = transferClient.export(dataset); downloadFile(`${dataset.toLowerCase().replaceAll(' ', '-')}-master-export.csv`, exported.csv, 'text/csv'); setNotice(`Exported all ${exported.count} current master records, including IDs and update tokens.`); })}>Export all current master records</button></div><p className="my-3 text-sm">The HTT export format preserves formula-safe text for round trips. Keep the _format column when editing an export. Product unitsJson contains all selling units and their IDs; new record/unit IDs are assigned at commit; costs, stock balances and financial balances are not imported. Child rows use existing customerId and locationId values from master exports.</p></Panel>
 {canWrite ? <><Panel title="CSV source and field mapping"><Field label="Import mode"><select className={fieldClass} value={mode} disabled={busy} onChange={e => { setMode(e.target.value as TransferSource['mode']); invalidate(); setNotice(''); }}><option>Create</option><option>Update by ID</option></select></Field><Field label="Choose UTF-8 CSV source"><input type="file" accept=".csv,text/csv" disabled={busy} onChange={e => { void loadFile(e.target.files?.[0]); e.target.value = ''; }}/></Field><p className="my-3">{fileName || 'No source file selected'} · up to 500 data records. Create requires a stable externalId. Update by ID preserves unmapped fields; a mapped empty value clears optional text and is validated for required fields.</p>{headers.length > 0 && <><div className="grid gap-3 md:grid-cols-3">{fields(dataset).map(field => <Field key={field} label={field}><select className={fieldClass} value={mapping[field] ?? -1} onChange={e => {
                        const next = { ...mapping };
                        if (Number(e.target.value) < 0)
                            delete next[field];
                        else
                            next[field] = Number(e.target.value);
                        setMapping(next);
                        invalidate();
                    }}><option value={-1}>Not mapped / preserve or default</option>{headers.map((header, index) => <option key={index} value={index}>{header}</option>)}</select></Field>)}</div><button className={`${buttonClass} mt-4`} onClick={validate}>Validate mapped CSV</button></>}</Panel>
 {preview && <Panel title="Validation and review"><p>{preview.rows.length} records · {preview.rows.filter(r => r.errors.length).length} with errors. Unmapped source columns: {preview.unmappedColumns.join(', ') || 'None'}.</p><SampleTable headers={['CSV record', 'Name / reference', 'External ID', 'Existing / resolved ID', 'Planned outcome', 'Resolved fields', 'Errors']} empty={!preview.rows.length}>{preview.rows.slice(current * 50, current * 50 + 50).map(r => <tr key={r.row}><Cell>{r.row}</Cell><Cell>{r.name}</Cell><Cell>{r.externalId}</Cell><Cell>{r.action === 'Created' ? 'Assigned at commit' : r.recordId || '—'}</Cell><Cell>{r.action}</Cell><Cell><details><summary className="cursor-pointer underline">View mapped / resolved fields</summary><pre className="max-w-xl whitespace-pre-wrap break-all text-xs">{JSON.stringify(r.values, null, 2)}</pre></details></Cell><Cell><span className="whitespace-pre-wrap">{r.errors.join('\n') || '—'}</span></Cell></tr>)}</SampleTable><div className="my-3 flex gap-3"><button className={buttonClass} disabled={!current} onClick={() => setPage(current - 1)}>Previous validation rows</button><span>Page {current + 1} of {last + 1}</span><button className={buttonClass} disabled={current === last} onClick={() => setPage(current + 1)}>Next validation rows</button><button className={buttonClass} onClick={() => downloadFile('import-validation-results.csv', csvText([['CSV record', 'Name', 'External ID', 'Record ID', 'Outcome', 'Errors'], ...preview.rows.map(r => [String(r.row), r.name, r.externalId, r.action === 'Created' ? 'Assigned at commit' : r.recordId, r.action, r.errors.join('; ')])]), 'text/csv')}>Export all validation rows</button></div><Field label="Import change reason"><textarea className={fieldClass} maxLength={2000} rows={3} value={reason} onChange={e => setReason(e.target.value)}/></Field><label className="my-3 flex gap-2"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)}/>I reviewed the dataset, mode, mapped fields and all validation results.</label><button className={buttonClass} disabled={!preview.valid || !confirmed || !reason.trim()} onClick={commit}>Commit entire validated batch</button><p className="my-3 text-sm">If masters change after validation, the batch is rejected and must be validated again. Duplicate creates are blocked; use customer review or explicit ID updates to resolve existing records. Failed batches do not partially import rows.</p></Panel>}</> : <p className="rounded border p-3">Your role can export and inspect this dataset but cannot import or update it.</p>}
 {result && hasPermission(principal, permissions[dataset].read) && <Panel title="Committed batch result"><p>{result.results.length} records processed · {result.at} · {result.actorId}</p><button className={buttonClass} onClick={() => exportRun(result)}>Export committed result IDs</button></Panel>}
 <Panel title="Import history"><SampleTable headers={['Source file', 'Mode', 'Recorded at', 'Actor', 'Rows', 'Reason', 'Details']} empty={!visibleRuns.length}>{visibleRuns.slice(runCurrent * 50, runCurrent * 50 + 50).map(r => <tr key={r.id}><Cell>{r.fileName}</Cell><Cell>{r.mode}</Cell><Cell>{r.at}</Cell><Cell>{r.actorId}</Cell><Cell>{r.results.length}</Cell><Cell>{r.reason}</Cell><Cell><button className={buttonClass} onClick={() => setSelectedRun(r)}>View import result</button></Cell></tr>)}</SampleTable><div className="my-3 flex gap-3"><button className={buttonClass} disabled={!runCurrent} onClick={() => setRunPage(runCurrent - 1)}>Previous imports</button><span>Page {runCurrent + 1} of {runLast + 1}</span><button className={buttonClass} disabled={runCurrent === runLast} onClick={() => setRunPage(runCurrent + 1)}>Next imports</button></div></Panel>
 {selectedRun && selectedRun.dataset === dataset && hasPermission(principal, permissions[dataset].read) && <Panel title={`Import result: ${selectedRun.fileName}`}><p>{selectedRun.mode} · {selectedRun.at} · {selectedRun.actorId}</p><p className="break-all text-xs">Source SHA-256: {selectedRun.sourceHash}</p><button className={`${buttonClass} my-3`} onClick={() => exportRun(selectedRun)}>Export all result IDs</button><SampleTable headers={['CSV record', 'Record ID', 'External ID', 'Outcome', 'Before / after audit']}>{selectedRun.results.map(r => <tr key={r.row}><Cell>{r.row}</Cell><Cell>{r.recordId}</Cell><Cell>{r.externalId}</Cell><Cell>{r.action}</Cell><Cell><details><summary className="cursor-pointer underline">View saved fields</summary><pre className="max-w-xl whitespace-pre-wrap break-all text-xs">{JSON.stringify({ before: r.before, after: r.after }, null, 2)}</pre></details></Cell></tr>)}</SampleTable>{selectedRun.parentChanges.map(p => <details key={p.customerId} className="my-3 rounded border p-3"><summary className="cursor-pointer underline">Customer {p.customerId} — related branch/contact changes</summary><pre className="max-h-[500px] overflow-auto whitespace-pre-wrap break-all text-xs">{JSON.stringify({ before: JSON.parse(p.before), after: JSON.parse(p.after) }, null, 2)}</pre></details>)}</Panel>}
 </BusinessFrame>;
}
