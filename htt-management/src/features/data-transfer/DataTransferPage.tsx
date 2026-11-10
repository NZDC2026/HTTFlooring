import { useState } from 'react';
import { datasets, fields, permissions, parseSource, type Dataset, type TransferPreview, type TransferRun, type TransferSource } from './transferModel';
import { transferClient, useTransferRuns } from './transferClient';
import { useSecurity } from '../security/securityClient';
import { hasPermission } from '../security/rbac';
import { Upload, Download, Users, Truck, Package, Contact, MapPin, CheckCircle, Clock, FileText, ArrowRight, CloudUpload } from 'lucide-react';
import './data-transfer.css';
import { Field, SampleTable, Cell, fieldClass } from '../prototype/PrototypeUI';
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
    const [tab,setTab]=useState<'Import'|'Export'>('Import'),[step,setStep]=useState(1),[sample,setSample]=useState(false),[sampleState,setSampleState]=useState('Pending');
    const changeDataset=(d:Dataset)=>{setDataset(d);setHeaders([]);setText('');setMapping({});setFileName('');setRunPage(0);setSelectedRun(undefined);setReason('');invalidate();setNotice('');setStep(1);};
    const template=(d:Dataset)=>action(()=>downloadFile(`create-${d.toLowerCase().replaceAll(' ','-')}-template.csv`,transferClient.template(d),'text/csv'));
    const icons={Customers:Users,Suppliers:Truck,Products:Package,'Customer contacts':Contact,'Customer branches':MapPin};
    const descriptions={Customers:'Customer accounts and trading details',Suppliers:'Supplier accounts and contact details',Products:'SKU, units, coverage and prices','Customer contacts':'Names, phone numbers and emails','Customer branches':'Billing and delivery locations'};
    const stepNames=['Select Data','Upload File','Map & Validate','Import'];
    const sampleRows=dataset==='Products'?[['Sample European Oak · Box × 2.166 m²','SAMPLE-OAK-001','Created','$68.50 selling · $26.50 reference cost'],['Sample Underlay · Roll × 20 m²','SAMPLE-UND-020','Updated','$2.80 selling · $1.80 reference cost'],['Sample Scotia · Piece','SAMPLE-TRIM-001','Skipped','Duplicate SKU'],['Sample invalid product','SAMPLE-BAD-001','Error','Coverage must be positive']]:[['National Floors – Dandenong','SAMPLE-CUST-001','Created','Ready'],['Harbour Flooring','SAMPLE-CUST-002','Updated','Ready'],['National Floors – Dandenong','SAMPLE-CUST-001','Skipped','Duplicate external ID'],['Missing business name','SAMPLE-CUST-004','Error','Business name is required']];
    const mappingFields=fields(dataset);
    let firstValues:Record<string,string>={};try{if(text)firstValues=parseSource(source).rows[0]?.values??{};}catch{/* Validation displays malformed sources. */}
    const labels:Record<string,string>={unit:'Unit',coveragePerUnit:'Coverage per Box / Roll (m²)',sellingPrice:'Selling Price (ex. GST)',costPrice:'Cost Price (reference, ex. GST)',unitsJson:'Advanced units JSON'};
    return <div className="transfer-page">
      <header className="transfer-hero"><h1>Import &amp; Export</h1><p>Bring your data in or out of HTT Flooring. Import customers, suppliers, products and contacts, or export master data for reporting and backup.</p></header>
      <div className="transfer-tabs" role="tablist">{(['Import','Export'] as const).map(t=><button role="tab" aria-selected={tab===t} key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t==='Import'?<Upload size={19}/>:<Download size={19}/>} {t} Data</button>)}</div>
      <div className="transfer-datasets">{available.map(d=>{const Icon=icons[d];return <button key={d} disabled={busy} className={dataset===d?'selected':''} onClick={()=>changeDataset(d)}><span className="transfer-icon"><Icon size={25}/></span><span><strong>{d==='Products'?'Products & Services':d}</strong><small>{descriptions[d]}</small></span>{dataset===d&&<CheckCircle className="transfer-check" size={21}/>}</button>;})}</div>
      <label className="transfer-sample"><input type="checkbox" checked={sample} onChange={e=>{setSample(e.target.checked);setStep(1);setSampleState('Pending');}}/> Sample · Preview upload, mapping, validation and completed import. Read-only; no business records are created.</label>
      {error&&<p role="alert" className="transfer-error">{error}</p>}{notice&&<p role="status" className="transfer-notice">{notice}</p>}
      <div className="transfer-columns"><main>
      {tab==='Export'?<section className="transfer-card"><h2><Download size={22}/>Export {dataset}</h2><p>Download all current records, including record IDs and update tokens. Use this file for safe updates.</p><div className="transfer-export-stats"><FileText/><span>{dataset} · {sample?'Sample preview':'Current business records'}</span></div><button className="transfer-primary" onClick={()=>action(()=>{if(sample){downloadFile('sample-export.csv',csvText([['externalId','businessName','status'],['SAMPLE-001','Sample Flooring','ACTIVE']]),'text/csv');return;}const exported=transferClient.export(dataset);downloadFile(`${dataset.toLowerCase().replaceAll(' ','-')}-master-export.csv`,exported.csv,'text/csv');setNotice(`Exported ${exported.count} records.`);})}><Download size={17}/>Export CSV{sample?' · Sample':''}</button><p className="transfer-help">Keep _format, id and recordToken when updating exported records. Inventory balances, financial balances and transactions use their dedicated workflows.</p></section>:
      <section className="transfer-card"><div className="transfer-card-heading"><h2><Upload size={22}/>Import {dataset==='Products'?'Products & Services':dataset}</h2><button className="transfer-link" onClick={()=>template(dataset)}><Download size={17}/>Download CSV Template</button></div>
      {!canWrite?<p>Your role can export this dataset but cannot import or update it.</p>:<div className="transfer-wizard"><nav aria-label="Import steps">{stepNames.map((name,i)=><div key={name} className={step===i+1?'current':step>i+1?'done':''}><span>{step>i+1?'✓':i+1}</span>{name}</div>)}</nav><div className="transfer-work">
      <h3>Step {step}: {stepNames[step-1]}{sample?' · Sample':''}</h3>
      {step===1&&<><p>Select the data type above, then choose how this batch should be imported.</p><Field label="Import mode"><select className={fieldClass} value={mode} onChange={e=>{setMode(e.target.value as TransferSource['mode']);invalidate();}}><option>Create</option><option>Update by ID</option></select></Field><p className="transfer-help">Create requires a stable externalId. Update by ID requires IDs and record tokens from a current export, and preserves unmapped fields.</p></>}
      {step===2&&<><p>Upload a UTF-8 CSV file with your {dataset.toLowerCase()} data.</p><label className="transfer-drop" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(!sample&&!busy)void loadFile(e.dataTransfer.files[0]);}}><CloudUpload size={43}/><strong>{sample?'Sample file ready':'Drag and drop your file here, or click to browse'}</strong><span>CSV · UTF-8 · Max 1 MB · Up to 500 records</span>{!sample&&<input type="file" accept=".csv,text/csv" disabled={busy} onChange={e=>{void loadFile(e.target.files?.[0]);e.target.value='';}}/>}</label>{(sample||fileName)&&<div className="transfer-file"><FileText size={24}/><span>{sample?`${dataset.replaceAll(' ','_')}_Sample.csv`:fileName}<small>{sample?'4 sample records':`${headers.length} columns detected`}</small></span></div>}</>}
      {step===3&&<><p>Match source columns to HTT fields, then validate before importing.</p>{sample?<><SampleTable headers={['Your File Column','HTT Field','Preview (Row 1)']}><tr><Cell>Customer Name</Cell><Cell>businessName</Cell><Cell>National Floors – Dandenong</Cell></tr><tr><Cell>Email</Cell><Cell>email</Cell><Cell>accounts@example.invalid</Cell></tr></SampleTable><p className="transfer-help">Sample validation includes a new record, update, duplicate and invalid record. Errors must be corrected before a real import.</p></>:<><div className="transfer-mapping"><table><thead><tr><th>HTT Field</th><th>Your File Column</th><th>Preview (Row 1)</th></tr></thead><tbody>{mappingFields.map(field=><tr key={field}><td>{labels[field]??field}</td><td><select aria-label={'Map '+field} value={mapping[field]??-1} onChange={e=>{const next={...mapping};if(Number(e.target.value)<0)delete next[field];else next[field]=Number(e.target.value);setMapping(next);invalidate();}}><option value={-1}>Not mapped</option>{headers.map((h,i)=><option key={i} value={i}>{h}</option>)}</select></td><td>{mapping[field]===undefined?'—':(firstValues[field]||'—')}</td></tr>)}</tbody></table></div><button className="transfer-primary" onClick={validate}>Validate mapped CSV</button></>}
      {(sample||preview)&&<><div className="transfer-validation-stats">{sample?<><span>New: 1</span><span>Updates: 1</span><span>Duplicates: 1</span><span className="text-red-700">Errors: 1</span></>:<><span>New: {preview!.rows.filter(r=>r.action==='Created').length}</span><span>Updates: {preview!.rows.filter(r=>r.action==='Updated').length}</span><span>Skipped: {preview!.rows.filter(r=>r.action==='Skipped').length}</span><span>Errors: {preview!.rows.filter(r=>r.errors.length).length}</span></>}</div><div className="transfer-mapping"><table><thead><tr><th>Record</th><th>Outcome</th><th>Validation</th></tr></thead><tbody>{sample?sampleRows.map(r=><tr key={r[1]+r[2]}><td>{r[0]}<small>{r[1]}</small></td><td>{r[2]}</td><td>{r[3]}</td></tr>):preview!.rows.slice(current*50,current*50+50).map(r=><tr key={r.row}><td>{r.row} · {r.name}<small>{r.externalId}</small></td><td>{r.action}</td><td className={r.errors.length?'text-red-700':''}>{r.errors.join('; ')||'Ready'}<details><summary>Resolved fields</summary><pre>{JSON.stringify(r.values,null,2)}</pre></details></td></tr>)}</tbody></table></div>{!sample&&preview!.rows.length>50&&<div className="transfer-footer"><button disabled={!current} onClick={()=>setPage(current-1)}>Previous</button><span>{current+1} / {last+1}</span><button disabled={current===last} onClick={()=>setPage(current+1)}>Next</button></div>}</>}
      </>}
      {step===4&&<>{sample?<><div className="transfer-result"><CheckCircle/><strong>{sampleState==='Completed'?'Import completed · Sample':'Ready to import · Sample'}</strong><p>{sampleState==='Completed'?'2 successful · 1 duplicate skipped · 0 failed':'Corrected preview: 1 new · 1 update · 1 duplicate skipped'}</p><p>Operator: Sample Admin · No live records created.</p></div><button className="transfer-primary" onClick={()=>setSampleState('Completed')}>Preview completed import</button></>:result?<div className="transfer-result"><CheckCircle/><h3>Import completed</h3><p>{result.results.length} records · {result.actorId} · {result.at}</p><button onClick={()=>exportRun(result)}>Download result IDs</button></div>:<><p>{preview?.rows.length??0} validated records. All changes are committed together; an error prevents the entire batch.</p><Field label="Import change reason"><textarea className={fieldClass} value={reason} maxLength={2000} onChange={e=>setReason(e.target.value)}/></Field><label className="transfer-confirm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>I reviewed the mapped fields and all validation results.</label><button className="transfer-primary" disabled={!preview?.valid||!confirmed||!reason.trim()} onClick={commit}>Import validated batch</button></>}</>}
      <div className="transfer-footer">{step>1&&<button onClick={()=>setStep(step-1)}>Back</button>}{step<4&&<button className="transfer-primary" disabled={busy||(!sample&&step===2&&!headers.length)||(!sample&&step===3&&!preview?.valid)} onClick={()=>setStep(step+1)}>Next: {stepNames[step]}<ArrowRight size={16}/></button>}</div>
      </div></div>}
      </section>}
      {selectedRun&&!sample&&<section className="transfer-card"><div className="transfer-card-heading"><h2>Import result: {selectedRun.fileName}</h2><button onClick={()=>setSelectedRun(undefined)}>Close</button></div><p>{selectedRun.at} · {selectedRun.actorId} · {selectedRun.reason}</p><button className="transfer-link" onClick={()=>exportRun(selectedRun)}>Download result IDs</button><div className="transfer-mapping"><table><thead><tr><th>Row</th><th>Record ID</th><th>Outcome</th><th>Audit</th></tr></thead><tbody>{selectedRun.results.map(r=><tr key={r.row}><td>{r.row}</td><td>{r.recordId}</td><td>{r.action}</td><td><details><summary>Before / after</summary><pre>{JSON.stringify({before:r.before,after:r.after},null,2)}</pre></details></td></tr>)}</tbody></table></div>{selectedRun.parentChanges.map(p=><details key={p.customerId}><summary>Related contacts / locations · {p.customerId}</summary><pre>{JSON.stringify({before:JSON.parse(p.before),after:JSON.parse(p.after)},null,2)}</pre></details>)}</section>}
      </main><aside><section className="transfer-card"><h2><Clock size={22}/>Import History</h2><p className="transfer-help">{sample?'Read-only Sample history':`History for ${dataset}`} · Operator, date and outcomes</p><div className="transfer-mapping"><table><thead><tr><th>Date / Operator</th><th>File</th><th>Success / Failed</th><th>Status</th></tr></thead><tbody>{sample?[['12 Nov 2026 · Sample Admin','Customers_Sample.csv','256 / 0','Completed'],['10 Nov 2026 · Sample Alex','Products_Sample.csv','87 / 0','Completed'],['09 Nov 2026 · Sample Admin','Suppliers_Sample.csv','0 / 2','Validation failed'],['08 Nov 2026 · Sample Jamie','Contacts_Sample.csv','0 / 0','Pending review']].map(r=><tr key={r[1]}>{r.map((v,i)=><td key={i}>{v}</td>)}</tr>):visibleRuns.slice(runCurrent*50,runCurrent*50+50).map(r=><tr key={r.id}><td>{r.at}<small>{r.actorId}</small></td><td><button className="transfer-link" onClick={()=>setSelectedRun(r)}>{r.fileName}</button><small>{r.mode}</small></td><td>{r.results.filter(x=>x.action!=='Skipped').length} / 0<small>{r.results.filter(x=>x.action==='Skipped').length} skipped</small></td><td><span className="transfer-status">Completed</span></td></tr>)}</tbody></table>{!sample&&!visibleRuns.length&&<p className="transfer-help">No completed imports for this dataset. Validation failures are shown before import; no partial records are saved.</p>}</div>{!sample&&visibleRuns.length>50&&<div className="transfer-footer"><button disabled={!runCurrent} onClick={()=>setRunPage(runCurrent-1)}>Previous</button><span>{runCurrent+1} / {runLast+1}</span><button disabled={runCurrent===runLast} onClick={()=>setRunPage(runCurrent+1)}>Next</button></div>}</section>
      <section className="transfer-card"><h2><FileText size={22}/>Templates &amp; Guides</h2>{available.map(d=><button key={d} className="transfer-template" onClick={()=>template(d)}><FileText size={25}/><span><strong>{d} CSV Template</strong><small>Preformatted fields and example structure</small></span><Download size={18}/></button>)}<details className="transfer-guide"><summary>Product units &amp; prices guide</summary><p>Use Unit (m² / Box / Roll / Piece / Bucket), Coverage per Unit (m² per package), Selling Price and Cost Price. Selling Price and reference Cost Price are per m² for area products, otherwise per unit, excluding GST. Cost Price is a catalogue reference only and never changes stock valuation. Advanced round-trip updates can use unitsJson instead of the simple unit columns.</p></details></section>
      </aside></div>
    </div>;
}
