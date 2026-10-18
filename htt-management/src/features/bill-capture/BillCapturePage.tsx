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
import { downloadSample, csvText } from '../page-previews/previewModel';
import { captureHeaders, parseCaptureCsv } from './captureCsv';
const defaultBasis = (): 'Exclusive' | 'Inclusive' => businessSettings().basis === 'Inclusive' ? 'Inclusive' : 'Exclusive';
export function BillCapturePage() {
    const suppliers = useSyncExternalStore(supplierRepository.subscribe, supplierRepository.getSnapshot, supplierRepository.getSnapshot), bills = useSyncExternalStore(supplierBillRepository.subscribe, supplierBillRepository.getSnapshot, supplierBillRepository.getSnapshot), drafts = useManagedDrafts('expense'), taxes = useWorkspaceRecords('tax-codes');
    useWorkspaceRecords('settings');
    const options = getExpenseAccountOptions(), { session } = useSecurity(), principal = session && { userId: session.user.id, roles: session.user.roles, authenticated: true as const }, canWrite = hasPermission(principal, 'purchases.bill'), navigate = useNavigate(), today = businessDateKey(new Date().toISOString());
    const [operationId] = useState(() => crypto.randomUUID()), [payload, setPayload] = useState<ExpensePayload>({ kind: 'EXPENSE', supplierId: '', supplierInvoiceNumber: '', documentDate: today, dueDate: today, notes: '', lines: [{ description: '', accountId: '', quantity: 1, unitCost: 0, taxCode: businessSettings().gstCode, priceBasis: defaultBasis() }] }), [declared, setDeclared] = useState({ subtotal: 0, taxAmount: 0, total: 0 }), [sourceName, setSourceName] = useState(''), [reviewed, setReviewed] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [preview, setPreview] = useState<{
        signature: string;
        result: ReturnType<typeof expenseDraftRepository.reviewCapture>;
    }>();
    const signature = JSON.stringify({ payload, declared, sourceName, options, taxes, suppliers, bills, drafts, settings: businessSettings() }), stale = Boolean(preview && preview.signature !== signature);
    const change = (f: () => void) => { f(); setReviewed(false); };
    const line = (index: number, key: string, value: string | number) => change(() => setPayload({ ...payload, lines: payload.lines.map((l, i) => i === index ? { ...l, [key]: value } : l) }));
    const input = (): CaptureInput => ({ operationId, payload, declared, sourceName, reviewed });
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
    return <BusinessFrame title="Supplier document capture & review"><p>Enter a supplier document manually or import one bill from CSV. Review source totals against the current local tax calculation, then create a real expense entry draft. Automatic PDF/image OCR is not connected. Source file bytes are not stored.</p>{error && <p role="alert" className="rounded border border-red-300 p-3 text-red-700">{error}</p>}{!canWrite && <p>Your role may inspect purchasing records but cannot prepare an expense bill. Opening an existing draft retains its normal permissions.</p>}<Panel title="Import source"><div className="flex flex-wrap gap-3"><button className={buttonClass} onClick={() => downloadSample('supplier-bill-capture-template.csv', csvText([[...captureHeaders]]))}>Download CSV headings</button><Link className={buttonClass} to="/purchases/expense-bills">Expense draft register</Link></div><label className="mt-4 block text-sm">Import a single bill CSV (1 MB maximum)<input className="mt-2 block" type="file" accept=".csv,text/csv" disabled={!canWrite || busy} onChange={e => { void importFile(e.target.files?.[0]); e.target.value = ''; }}/></label><p className="mt-3 text-sm">Repeat the same supplier code, reference, dates and document totals on every line. Account codes must identify available expense accounts; numbers use unsigned decimals. Imported fields remain editable before review.</p></Panel><fieldset disabled={!canWrite || busy} className="space-y-5"><Panel title="Supplier document"><div className="grid gap-4 md:grid-cols-2"><Field label="Supplier"><select required className={fieldClass} value={payload.supplierId} onChange={e => change(() => setPayload({ ...payload, supplierId: e.target.value }))}><option value="">Choose supplier</option>{suppliers.filter(s => s.status === 'ACTIVE').map(s => <option key={s.id} value={s.id}>{s.code} · {s.businessName}</option>)}</select></Field><Field label="Supplier invoice reference"><input required maxLength={200} className={fieldClass} value={payload.supplierInvoiceNumber} onChange={e => change(() => setPayload({ ...payload, supplierInvoiceNumber: e.target.value }))}/></Field><Field label="Document date"><input type="date" required className={fieldClass} value={payload.documentDate} onChange={e => change(() => setPayload({ ...payload, documentDate: e.target.value }))}/></Field><Field label="Due date"><input type="date" required className={fieldClass} value={payload.dueDate} onChange={e => change(() => setPayload({ ...payload, dueDate: e.target.value }))}/></Field><Field label="Source name (metadata only)"><input maxLength={200} className={fieldClass} value={sourceName} onChange={e => change(() => setSourceName(e.target.value))}/></Field><Field label="Notes"><textarea maxLength={1000} className={fieldClass} value={payload.notes ?? ''} onChange={e => change(() => setPayload({ ...payload, notes: e.target.value }))}/></Field></div></Panel><Panel title="Expense lines">{payload.lines.map((l, i) => <div key={i} className="mb-4 grid gap-3 rounded border p-4 md:grid-cols-3"><Field label={`Line ${i + 1} description`}><input required maxLength={500} className={fieldClass} value={l.description} onChange={e => line(i, 'description', e.target.value)}/></Field><Field label={`Line ${i + 1} expense account`}><select required className={fieldClass} value={l.accountId} onChange={e => line(i, 'accountId', e.target.value)}><option value="">Select expense account</option>{options.map(a => <option key={a.id} value={a.id}>{a.code} · {a.name}</option>)}</select></Field><Field label={`Line ${i + 1} tax code`}><select className={fieldClass} value={l.taxCode} onChange={e => line(i, 'taxCode', e.target.value)}>{taxes.filter(t => t.status === 'Active').map(t => <option key={t.id} value={t.code}>{t.code} · {t.rate}%</option>)}</select></Field><Field label={`Line ${i + 1} quantity`}><input type="number" min="0.001" step="0.001" required className={fieldClass} value={l.quantity} onChange={e => line(i, 'quantity', Number(e.target.value))}/></Field><Field label={`Line ${i + 1} unit cost`}><input type="number" min="0" step="0.0001" required className={fieldClass} value={l.unitCost} onChange={e => line(i, 'unitCost', Number(e.target.value))}/></Field><Field label={`Line ${i + 1} price basis`}><select className={fieldClass} value={l.priceBasis ?? businessSettings().basis} onChange={e => line(i, 'priceBasis', e.target.value)}><option>Exclusive</option><option>Inclusive</option></select></Field><button className={buttonClass} disabled={payload.lines.length === 1} onClick={() => change(() => setPayload({ ...payload, lines: payload.lines.filter((_, j) => j !== i) }))}>Remove line {i + 1}</button></div>)}<button className={buttonClass} disabled={payload.lines.length >= 500} onClick={() => change(() => setPayload({ ...payload, lines: [...payload.lines, { description: '', accountId: '', quantity: 1, unitCost: 0, taxCode: businessSettings().gstCode, priceBasis: defaultBasis() }] }))}>Add expense line</button></Panel><Panel title="Totals printed on source document"><div className="grid gap-4 md:grid-cols-3">{(['subtotal', 'taxAmount', 'total'] as const).map(k => <Field key={k} label={{ subtotal: 'Source net', taxAmount: 'Source tax', total: 'Source total' }[k]}><input required type="number" min="0" step="0.01" className={fieldClass} value={declared[k]} onChange={e => change(() => setDeclared({ ...declared, [k]: Number(e.target.value) }))}/></Field>)}</div><button className={`${buttonClass} mt-4`} onClick={review}>Calculate & review source</button></Panel>{preview && <Panel title="Review result">{stale && <p role="status" className="mb-3 rounded border border-amber-300 p-3">Fields or source books changed. Calculate and review again before saving.</p>}<SampleTable headers={['Amount', `Source ${businessSettings().currency}`, `Calculated ${businessSettings().currency}`]}>{(['subtotal', 'taxAmount', 'total'] as const).map(k => <tr key={k}><Cell>{{ subtotal: 'Net', taxAmount: 'Tax', total: 'Total' }[k]}</Cell><Cell>{preview.result.declared[k].toFixed(2)}</Cell><Cell>{preview.result.totals[k].toFixed(2)}</Cell></tr>)}</SampleTable>{preview.result.issues.map(message => <p key={message} role="alert" className="my-2 text-red-700">{message}</p>)}{preview.result.duplicates.map(d => <p key={`${d.kind}:${d.id}`}><Link className="underline" to={`${d.kind === 'Entry draft' ? '/purchases/expense-bills' : '/purchases/bills'}/${d.id}`}>Review existing {d.kind.toLowerCase()}</Link></p>)}<label className="my-4 flex gap-2"><input type="checkbox" checked={reviewed} disabled={stale || !preview.result.matches} onChange={e => setReviewed(e.target.checked)}/>I checked supplier, reference, dates, accounts, lines and source totals.</label><button className={buttonClass} disabled={!reviewed || stale || !preview.result.matches} onClick={() => {
                try {
                    const draft = expenseDraftRepository.capture(input());
                    navigate(`/purchases/expense-bills/${draft.id}`);
                }
                catch (e) {
                    setError((e as Error).message);
                    setReviewed(false);
                }
            }}>Create reviewed expense draft</button><p className="mt-3 text-sm">The draft persists locally with the source name and declared totals in its notes. Approval and posting remain separate actions.</p></Panel>}</fieldset></BusinessFrame>;
}
