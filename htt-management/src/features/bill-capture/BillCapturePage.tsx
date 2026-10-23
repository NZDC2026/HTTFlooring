import {useCaptureSources,selectCaptureSource,exportCaptureSource,type CaptureSourceView} from './captureSourceClient';
import { purchaseDefaults, purchaseDueDate, purchaseSettings } from '../purchase-settings/purchaseDefaults';
import { BusinessFrame } from '../business-workspace/MasterDataPages';
import { useState, useSyncExternalStore } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supplierRepository } from '../contacts/data/supplierRepository';
import { supplierBillRepository } from '../purchases/data/supplierBillRepository';
import { expenseDraftRepository, useManagedDrafts, getExpenseAccountOptions, type ExpensePayload, type CaptureInput } from '../direct-documents/managedDocumentRepository';
import { useWorkspaceRecords } from '../business-workspace/workspaceRepository';
import { businessSettings } from '../business-workspace/configurationState';
import { useSecurity } from '../security/securityClient';
import { hasPermission } from '../security/rbac';
import { businessDateKey } from '../../lib/businessDate';
import { Panel, Field, SampleTable, Cell, fieldClass, buttonClass } from '../prototype/PrototypeUI';
import { downloadFile, csvText } from '../../lib/csv';
import { captureHeaders, parseCaptureCsv } from './captureCsv';
const defaultBasis = (): 'Exclusive' | 'Inclusive' => businessSettings().basis === 'Inclusive' ? 'Inclusive' : 'Exclusive';
export function BillCapturePage() {
    const suppliers = useSyncExternalStore(supplierRepository.subscribe, supplierRepository.getSnapshot, supplierRepository.getSnapshot), bills = useSyncExternalStore(supplierBillRepository.subscribe, supplierBillRepository.getSnapshot, supplierBillRepository.getSnapshot), drafts = useManagedDrafts('expense'), taxes = useWorkspaceRecords('tax-codes');
    useWorkspaceRecords('settings');
    const options = getExpenseAccountOptions(), { session } = useSecurity(), principal = session && { userId: session.user.id, roles: session.user.roles, authenticated: true as const }, canWrite = hasPermission(principal, 'purchases.bill'), navigate = useNavigate(), today = businessDateKey(new Date().toISOString());
    const [operationId] = useState(() => crypto.randomUUID()), [payload, setPayload] = useState<ExpensePayload>({ kind: 'EXPENSE', supplierId: '', supplierInvoiceNumber: '', documentDate: today, dueDate: purchaseDueDate(today,purchaseDefaults()), notes: '', lines: [{ description: '', accountId: '', quantity: 1, unitCost: 0, taxCode: businessSettings().gstCode, priceBasis: defaultBasis() }] }), [declared, setDeclared] = useState({ subtotal: 0, taxAmount: 0, total: 0 }), [sourceName, setSourceName] = useState(''), [reviewed, setReviewed] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [preview, setPreview] = useState<{
        signature: string;
        result: ReturnType<typeof expenseDraftRepository.reviewCapture>;
    }>();
    const sources=useCaptureSources();
    const [source,setSource]=useState<CaptureSourceView>();
    const [recognitionOperation,setRecognitionOperation]=useState(()=>crypto.randomUUID());
    const signature = JSON.stringify({ sourceId:source?.id,payload, declared, sourceName, options, taxes, suppliers, bills, drafts, settings: businessSettings(), purchaseSettings:purchaseSettings() }), stale = Boolean(preview && preview.signature !== signature);
    const change = (f: () => void) => { f(); setReviewed(false); };
    const line = (index: number, key: string, value: string | number) => change(() => setPayload({ ...payload, lines: payload.lines.map((l, i) => i === index ? { ...l, [key]: value } : l) }));
    const input = (): CaptureInput => ({ operationId, payload, declared, sourceName, reviewed,...(source?{sourceId:source.id}:{}) });
    const review = () => {
        try {
            const result = expenseDraftRepository.reviewCapture(input());
            setPreview({ signature, result });
            setReviewed(false);
            setError('');
        }
        catch (e) {
            setError((e as Error).message);
            setPreview(undefined);
            setReviewed(false);
        }
    };
    const importFile = async (file: File | undefined) => {
        if (!file)
            return;
        setBusy(true);
        setError('');
        setReviewed(false);
        setPreview(undefined);
        try {
            if (!/\.csv$/i.test(file.name) || file.size > 1000000)
                throw new Error('Choose a CSV file no larger than 1 MB.');
            const parsed = parseCaptureCsv(await file.text(), { suppliers, accounts: options, taxCodes: taxes.filter(t => t.status === 'Active').map(t => t.code) });
            setSource(undefined);
            setPayload(parsed.payload);
            setDeclared(parsed.declared);
            setSourceName(file.name.slice(0, 200));
            setReviewed(false);
            setPreview(undefined);
        }
        catch (e) {
            setError((e as Error).message);
        }
        finally {
            setBusy(false);
        }
    };
    const useSource=(value:CaptureSourceView)=>{setSource(value);setSourceName(value.name);setReviewed(false);setPreview(undefined);setRecognitionOperation(crypto.randomUUID());};
    const recognize=()=>{setBusy(true);setReviewed(false);setPreview(undefined);setError('');try{const value=selectCaptureSource(recognitionOperation);if(value)useSource(value);}catch(e){setError((e as Error).message);}finally{setBusy(false);}};
    const applySuggestions=()=>{if(!source)return;const fields=source.suggestions.fields;const one=(key:keyof typeof fields)=>fields[key].length===1?fields[key][0].value:undefined;setPayload({...payload,supplierInvoiceNumber:one('reference')??payload.supplierInvoiceNumber,documentDate:one('date')??payload.documentDate,dueDate:one('dueDate')??payload.dueDate});setDeclared({...declared,...(one('subtotal')?{subtotal:Number(one('subtotal'))}:{}),...(one('taxAmount')?{taxAmount:Number(one('taxAmount'))}:{}),...(one('total')?{total:Number(one('total'))}:{})});setReviewed(false);setPreview(undefined);};
    return <BusinessFrame title="Supplier document capture & review"><p>Enter a supplier document manually or import one bill from CSV. Review source totals against the current local tax calculation, then create a real expense entry draft. PDF/PNG/JPEG recognition runs locally in the macOS desktop build. Originals and recognition evidence are preserved in this business profile. Verify suggestions before creating a draft; recognition never posts a bill.</p>{error && <p role="alert" className="rounded border border-red-300 p-3 text-red-700">{error}</p>}{!canWrite && <p>Your role may inspect purchasing records but cannot prepare an expense bill. Opening an existing draft retains its normal permissions.</p>}<Panel title="Local document recognition"><p>English supplier invoices: PDF (1–10 unlocked pages), PNG or JPEG; maximum 10 MB, images at most 40 megapixels. macOS only. No upload or external OCR service. Line items, supplier, currency, accounts and tax codes require manual verification.</p><button className={buttonClass} disabled={!canWrite||busy} onClick={recognize}>{busy?'Recognizing locally…':'Select and recognize original'}</button><label className="mt-3 block">Resume preserved original<select aria-label="Resume preserved original" className={fieldClass} disabled={!canWrite||busy} value={source?.id??''} onChange={e=>{const selected=sources.find(s=>s.id===e.target.value);if(selected)useSource(selected);else{setSource(undefined);setReviewed(false);setPreview(undefined);}}}><option value="">Manual / CSV entry</option>{sources.map(s=><option key={s.id} value={s.id}>{s.name} · {s.sha256.slice(0,12)}</option>)}</select></label>{canWrite&&source&&<div className="mt-4 space-y-3"><p>Preserved original: {source.name} · {source.size} bytes · SHA256 {source.sha256}</p><p>{source.recognition.engine} · {source.recognition.pages} page(s). Confidence is recognition confidence, not accounting accuracy.</p><button className={buttonClass} disabled={!canWrite||busy} onClick={()=>{try{exportCaptureSource(source.id);}catch(e){setError((e as Error).message);}}}>Export preserved original</button><button className={buttonClass} disabled={!canWrite||busy} onClick={applySuggestions}>Apply unambiguous header / total suggestions</button>{source.suggestions.warnings.map(w=><p key={w} className="text-amber-800">{w}</p>)}<dl>{Object.entries(source.suggestions.fields).map(([key,values])=><div key={key}><dt className="font-semibold">{key}</dt><dd>{values.length?values.map(v=>`Page ${v.page}: ${v.value} (${Math.round(v.confidence*100)}%)`).join(' / '):'Enter manually'}</dd></div>)}</dl><details><summary>Recognized source text and confidence</summary><div className="max-h-80 overflow-auto">{source.recognition.lines.map((l,i)=><p key={i}>Page {l.page} · {Math.round(l.confidence*100)}% · {l.text}</p>)}</div></details><p>Compare the original using Export preserved original. Applying suggestions does not select expense accounts or confirm review. The same file cannot create a second active intake even if its reference is changed.</p></div>}</Panel><Panel title="Import source"><div className="flex flex-wrap gap-3"><button className={buttonClass} onClick={() => downloadFile('supplier-bill-capture-template.csv', csvText([[...captureHeaders]]))}>Download CSV headings</button><Link className={buttonClass} to="/purchases/expense-bills">Expense draft register</Link></div><label className="mt-4 block text-sm">Import a single bill CSV (1 MB maximum)<input className="mt-2 block" type="file" accept=".csv,text/csv" disabled={!canWrite || busy} onChange={e => { void importFile(e.target.files?.[0]); e.target.value = ''; }}/></label><p className="mt-3 text-sm">Repeat the same supplier code, reference, dates and document totals on every line. Account codes must identify available expense accounts; numbers use unsigned decimals. Imported fields remain editable before review.</p></Panel><fieldset disabled={!canWrite || busy} className="space-y-5"><Panel title="Supplier document"><div className="grid gap-4 md:grid-cols-2"><Field label="Supplier"><select required className={fieldClass} value={payload.supplierId} onChange={e => change(() => setPayload({ ...payload, supplierId: e.target.value, dueDate:purchaseDueDate(payload.documentDate,purchaseDefaults(suppliers.find(s=>s.id===e.target.value))) }))}><option value="">Choose supplier</option>{suppliers.filter(s => s.status === 'ACTIVE').map(s => <option key={s.id} value={s.id}>{s.code} · {s.businessName}</option>)}</select></Field><Field label="Supplier invoice reference"><input required maxLength={200} className={fieldClass} value={payload.supplierInvoiceNumber} onChange={e => change(() => setPayload({ ...payload, supplierInvoiceNumber: e.target.value }))}/></Field><Field label="Document date"><input type="date" required className={fieldClass} value={payload.documentDate} onChange={e => change(() => setPayload({ ...payload, documentDate: e.target.value, ...(e.target.value?{dueDate:purchaseDueDate(e.target.value,purchaseDefaults(suppliers.find(s=>s.id===payload.supplierId)))}:{}) }))}/></Field><Field label="Due date"><input type="date" required className={fieldClass} value={payload.dueDate} onChange={e => change(() => setPayload({ ...payload, dueDate: e.target.value }))}/></Field><Field label="Source name (metadata only)"><input disabled={!!source} maxLength={200} className={fieldClass} value={sourceName} onChange={e => change(() => setSourceName(e.target.value))}/></Field><Field label="Notes"><textarea maxLength={1000} className={fieldClass} value={payload.notes ?? ''} onChange={e => change(() => setPayload({ ...payload, notes: e.target.value }))}/></Field></div></Panel><Panel title="Expense lines">{payload.lines.map((l, i) => <div key={i} className="mb-4 grid gap-3 rounded border p-4 md:grid-cols-3"><Field label={`Line ${i + 1} description`}><input required maxLength={500} className={fieldClass} value={l.description} onChange={e => line(i, 'description', e.target.value)}/></Field><Field label={`Line ${i + 1} expense account`}><select required className={fieldClass} value={l.accountId} onChange={e => line(i, 'accountId', e.target.value)}><option value="">Select expense account</option>{options.map(a => <option key={a.id} value={a.id}>{a.code} · {a.name}</option>)}</select></Field><Field label={`Line ${i + 1} tax code`}><select className={fieldClass} value={l.taxCode} onChange={e => line(i, 'taxCode', e.target.value)}>{taxes.filter(t => t.status === 'Active').map(t => <option key={t.id} value={t.code}>{t.code} · {t.rate}%</option>)}</select></Field><Field label={`Line ${i + 1} quantity`}><input type="number" min="0.001" step="0.001" required className={fieldClass} value={l.quantity} onChange={e => line(i, 'quantity', Number(e.target.value))}/></Field><Field label={`Line ${i + 1} unit cost`}><input type="number" min="0" step="0.0001" required className={fieldClass} value={l.unitCost} onChange={e => line(i, 'unitCost', Number(e.target.value))}/></Field><Field label={`Line ${i + 1} price basis`}><select className={fieldClass} value={l.priceBasis ?? businessSettings().basis} onChange={e => line(i, 'priceBasis', e.target.value)}><option>Exclusive</option><option>Inclusive</option></select></Field><button className={buttonClass} disabled={payload.lines.length === 1} onClick={() => change(() => setPayload({ ...payload, lines: payload.lines.filter((_, j) => j !== i) }))}>Remove line {i + 1}</button></div>)}<button className={buttonClass} disabled={payload.lines.length >= 500} onClick={() => change(() => setPayload({ ...payload, lines: [...payload.lines, { description: '', accountId: '', quantity: 1, unitCost: 0, taxCode: businessSettings().gstCode, priceBasis: defaultBasis() }] }))}>Add expense line</button></Panel><Panel title="Totals printed on source document"><div className="grid gap-4 md:grid-cols-3">{(['subtotal', 'taxAmount', 'total'] as const).map(k => <Field key={k} label={{ subtotal: 'Source net', taxAmount: 'Source tax', total: 'Source total' }[k]}><input required type="number" min="0" step="0.01" className={fieldClass} value={declared[k]} onChange={e => change(() => setDeclared({ ...declared, [k]: Number(e.target.value) }))}/></Field>)}</div><button className={`${buttonClass} mt-4`} onClick={review}>Calculate & review source</button></Panel>{preview && <Panel title="Review result">{stale && <p role="status" className="mb-3 rounded border border-amber-300 p-3">Fields or source books changed. Calculate and review again before saving.</p>}<SampleTable headers={['Amount', `Source ${businessSettings().currency}`, `Calculated ${businessSettings().currency}`]}>{(['subtotal', 'taxAmount', 'total'] as const).map(k => <tr key={k}><Cell>{{ subtotal: 'Net', taxAmount: 'Tax', total: 'Total' }[k]}</Cell><Cell>{preview.result.declared[k].toFixed(2)}</Cell><Cell>{preview.result.totals[k].toFixed(2)}</Cell></tr>)}</SampleTable>{preview.result.issues.map(message => <p key={message} role="alert" className="my-2 text-red-700">{message}</p>)}{preview.result.duplicates.map(d => <p key={`${d.kind}:${d.id}`}><Link className="underline" to={`${d.kind === 'Entry draft' ? '/purchases/expense-bills' : '/purchases/bills'}/${d.id}`}>Review existing {d.kind.toLowerCase()}</Link></p>)}<label className="my-4 flex gap-2"><input type="checkbox" checked={reviewed} disabled={stale || !preview.result.matches} onChange={e => setReviewed(e.target.checked)}/>I checked supplier, reference, dates, accounts, lines and source totals.</label><button className={buttonClass} disabled={!reviewed || stale || !preview.result.matches} onClick={() => {
                try {
                    const draft = expenseDraftRepository.capture(input());
                    navigate(`/purchases/expense-bills/${draft.id}`);
                }
                catch (e) {
                    setError((e as Error).message);
                    setReviewed(false);
                }
            }}>Create reviewed expense draft</button><p className="mt-3 text-sm">The draft persists locally with the source name and declared totals; recognized intakes also retain an immutable original ID and SHA256 link. Approval and posting remain separate actions.</p></Panel>}</fieldset></BusinessFrame>;
}
