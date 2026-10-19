import { useState } from 'react';
import { Link } from 'react-router-dom';
import { businessSettings, configurationRows } from '../business-workspace/configurationState';
import { workspaceRepositories, useWorkspaceRecords } from '../business-workspace/workspaceRepository';
import { BusinessFrame } from '../business-workspace/MasterDataPages';
import { Panel, Field, SampleTable, Cell, fieldClass, buttonClass } from '../prototype/PrototypeUI';
import { Notice } from '../page-previews/PreviewWorkspace';
import { usePermission } from '../security/usePermission';
import { businessDateKey } from '../../lib/businessDate';
import { openingBalanceRepository, useOpeningBalances, type OpeningInput } from './openingBalanceRepository';
import { parseOpeningCsv, openingCsvHeader } from './openingCsv';
import { accountRepository } from '../accounting/data/accountRepository';
import { customerRepository } from '../contacts/data/customerRepository';
import { supplierRepository } from '../contacts/data/supplierRepository';
import { bankAccountRepository } from '../banking/data/bankAccountRepository';
import { inventorySiteRepository } from '../inventory/data/inventorySiteRepository';
import { mockProducts } from '../inventory/data/mockProducts';
const today = () => businessDateKey(new Date().toISOString());
function download(name: string, text: string) { const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url); }
export function FinancialSettingsPage() {
    const rows = useWorkspaceRecords('settings'), row = rows.find(r => r.section === 'business'), canWrite = usePermission('accounting.post');
    const [draft, setDraft] = useState<Record<string, string>>(() => ({ ...businessSettings(), name: 'Business settings', section: 'business', status: 'Active' })), [expected, setExpected] = useState(row?.revision), [error, setError] = useState(''), [notice, setNotice] = useState('');
    const fields: [
        string,
        string,
        string?
    ][] = [['companyName', 'Company name'], ['tradingName', 'Trading name'], ['identifier', 'Business / tax identifier'], ['email', 'Contact email', 'email'], ['phone', 'Phone'], ['address', 'Address'], ['currency', 'Base currency'], ['timezone', 'Business time zone'], ['yearEnd', 'Financial year end (MM-DD)'], ['gstCode', 'Default tax code'], ['basis', 'Manual price entry basis'], ['terms', 'Default invoice terms (days)', 'number']];
    return <BusinessFrame title="Company & financial settings" actions={<><Link className={buttonClass} to="/settings/preferences">Personal preferences</Link><Link className={buttonClass} to="/settings/integrations">Local capabilities & integrations</Link><Link className={buttonClass} to="/settings/roles">Role policy</Link><Link className={buttonClass} to="/accounting/tax-codes">Tax codes & posting accounts</Link><Link className={buttonClass} to="/accounting/opening-balances">Opening balances</Link></>}><Notice error>{error}</Notice><Notice>{notice}</Notice><form className="space-y-5" onSubmit={e => {
            e.preventDefault();
            try {
                const saved = workspaceRepositories.settings.save(draft, expected);
                setDraft({ ...saved });
                setExpected(saved.revision);
                setNotice('Settings saved. New transactions use these rules; historical documents retain their snapshots.');
                setError('');
            }
            catch (e) {
                setError((e as Error).message);
            }
        }}><Panel title="Company, currency & tax"><p className="text-sm">Base currency is locked once bank accounts or financial postings exist. Tax rates are explicitly configured, never inferred from the country. Tax code account/report mappings are copied onto new document lines.</p><div className="grid gap-4 md:grid-cols-2">{fields.map(([key, label, type]) => <Field key={key} label={label}>{key === 'currency' || key === 'basis' || key === 'gstCode' ? <select className={fieldClass} disabled={!canWrite} value={draft[key]} onChange={e => setDraft({ ...draft, [key]: e.target.value })}>{(key === 'currency' ? ['AUD', 'NZD'] : key === 'basis' ? ['Exclusive', 'Inclusive'] : (configurationRows['tax-codes'] ?? []).filter(r => r.status === 'Active').map(r => r.code)).map(v => <option key={v}>{v}</option>)}</select> : <input className={fieldClass} readOnly={!canWrite} type={type ?? 'text'} value={draft[key] ?? ''} min="0" max={key === 'terms' ? 365 : undefined} required={['companyName', 'timezone', 'yearEnd', 'terms'].includes(key)} onChange={e => setDraft({ ...draft, [key]: e.target.value })}/>}</Field>)}</div></Panel><Panel title="New document numbering"><p className="text-sm">Format: PREFIX-business year-sequence. Next number is a minimum; existing document numbers are never reused. Changing settings does not renumber issued documents. Catalogue prices and stored purchase costs remain net; the price basis applies to new manually entered prices.</p><div className="grid gap-4 md:grid-cols-2">{[['quote', 'Quote'], ['order', 'Sales order'], ['invoice', 'Invoice'], ['credit', 'Customer credit'], ['purchase', 'Purchase order'], ['bill', 'Supplier bill'], ['supplierCredit', 'Supplier credit']].map(([key, label]) => <div className="grid grid-cols-2 gap-3" key={key}><Field label={`${label} prefix`}><input className={fieldClass} readOnly={!canWrite} value={draft[key + 'Prefix'] ?? ''} onChange={e => setDraft({ ...draft, [key + 'Prefix']: e.target.value })}/></Field><Field label={`${label} next number`}><input className={fieldClass} readOnly={!canWrite} type="number" min="1" step="1" value={draft['next' + key[0].toUpperCase() + key.slice(1)] ?? '1'} onChange={e => setDraft({ ...draft, ['next' + key[0].toUpperCase() + key.slice(1)]: e.target.value })}/></Field></div>)}</div></Panel>{canWrite && <button className={buttonClass}>Save financial settings</button>}</form><Panel title="Usage"><p className="text-sm">Time zone controls business dates and dated reporting; financial year end sets the default P&amp;L period. Invoice terms apply to new invoices. Tax report labels group document tax snapshots in the tax summary below; this does not submit a statutory return.</p><Link className={buttonClass} to="/reports/tax-summary">Tax summary</Link></Panel></BusinessFrame>;
}
export function OpeningBalancesPage() {
    const batches = useOpeningBalances(), canWrite = usePermission('accounting.post'), [csv, setCsv] = useState(openingCsvHeader + '\n'), [date, setDate] = useState(today()), [reason, setReason] = useState(''), [operationId] = useState(() => crypto.randomUUID()), [error, setError] = useState(''), [notice, setNotice] = useState(''), [review, setReview] = useState<{
        input: OpeningInput;
        summary: ReturnType<typeof openingBalanceRepository.preview>;
    } | null>(null), [reverseDate, setReverseDate] = useState(today()), [reverseReason, setReverseReason] = useState('');
    const invalidate = () => { setReview(null); setNotice(''); };
    const catalogs = [['GL', accountRepository.getAll().filter(a => a.active).map(a => ({ id: a.id, label: `${a.code} · ${a.name}` }))], ['AR', customerRepository.getAll().map(c => ({ id: c.id, label: c.businessName }))], ['AP', supplierRepository.getAll().map(c => ({ id: c.id, label: c.businessName }))], ['BANK', bankAccountRepository.getAll().map(b => ({ id: b.id, label: b.name }))], ['STOCK', mockProducts.filter(p=>!p.itemType||p.itemType==='STOCK').map(p => ({ id: p.id, label: `${p.sku} · ${p.name} (base unit)` }))], ['Site', inventorySiteRepository.getAll().map(s => ({ id: s.id, label: s.name }))]] as const;
    return <BusinessFrame title="Opening balances & reconciliation"><Notice error>{error}</Notice><Notice>{notice}</Notice><Panel title="Import rules"><p>This imports additional historical balances as one atomic batch. It never replaces or clears existing records. Choose a cutover date after existing ledger and inventory activity. Existing AR, AP and inventory must reconcile first.</p><p className="text-sm">GL rows contain a balanced balance-sheet trial balance. AR/AP details must equal their GL controls; negative amounts create unused historical credits. BANK detail must equal bank GL; stock quantity × net base-unit cost must equal inventory GL. Historical outstanding documents enter at cutover with no new GST or revenue/expense recognition; include old tax liabilities/assets in GL.</p><button className={buttonClass} onClick={() => download('HTT-Opening-Balance-Template.csv', openingCsvHeader + '\n')}>Download CSV template</button><details><summary>Column guide & reference IDs</summary><p className="my-3 text-sm">GL: id, debit, credit. AR/AP: contact id, unique reference, original date, dueDate, signed amount. BANK: account id, signed amount. STOCK: product id, site id, positive base quantity, net unitCost. Leave unused fields blank. Dates: YYYY-MM-DD. Amounts: plain decimals, no currency symbols.</p>{catalogs.map(([kind, rows]) => <div className="mb-4" key={kind}><h3>{kind}</h3><SampleTable headers={['ID (copy into CSV)', 'Name']}>{rows.map(r => <tr key={r.id}><Cell><code className="select-all">{r.id}</code></Cell><Cell>{r.label}</Cell></tr>)}</SampleTable></div>)}</details></Panel>{canWrite && <><Panel title="Upload & review"><div className="grid gap-4 md:grid-cols-2"><Field label="Cutover date"><input className={fieldClass} type="date" value={date} onChange={e => { setDate(e.target.value); invalidate(); }}/></Field><Field label="Import reason"><input className={fieldClass} value={reason} onChange={e => { setReason(e.target.value); invalidate(); }}/></Field><Field label="Opening CSV file"><input type="file" accept=".csv,text/csv" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                    if (file.size > 10000000) {
                        setError('File exceeds 10 MB.');
                        return;
                    }
                    setCsv(await file.text());
                    invalidate();
                }
            }}/></Field></div><Field label="Opening CSV"><textarea className={fieldClass + ' font-mono'} rows={12} value={csv} onChange={e => { setCsv(e.target.value); invalidate(); }}/></Field><button className={buttonClass} onClick={() => {
                try {
                    const input = parseOpeningCsv(csv, { operationId, date, reason }), summary = openingBalanceRepository.preview(input);
                    setReview({ input, summary });
                    setError('');
                }
                catch (e) {
                    setReview(null);
                    setError((e as Error).message);
                }
            }}>Validate & preview</button></Panel>{review && <Panel title="Balanced import preview"><dl className="grid gap-3 md:grid-cols-3">{Object.entries(review.summary).map(([key, value]) => <div key={key}><dt>{key}</dt><dd className="font-semibold">{typeof value === 'number' ? value.toFixed(2) : value}</dd></div>)}</dl><p className="text-sm">AR/AP details and bank/stock values match imported GL. Posting revalidates all references, balances and dates in the trusted host.</p><button className={buttonClass} onClick={() => {
                    try {
                        openingBalanceRepository.post(review.input);
                        setReview(null);
                        setNotice('Opening balances posted. Source documents can now be settled through normal receipts/payments, credit allocation and refunds.');
                        setError('');
                    }
                    catch (e) {
                        setError((e as Error).message);
                    }
                }}>Post opening batch</button></Panel>}</>}<Panel title="Import history">{!batches.length ? <p>No opening balances imported.</p> : batches.map(b => <div key={b.id} className="space-y-3 rounded-lg border p-4"><p>{b.date} · {b.reason} · <strong>{b.status}</strong></p><p className="text-sm">Created {b.createdAt}; actor {b.actor}. {b.invoiceIds.length} invoices, {b.billIds.length} bills, {b.customerCreditIds.length + b.supplierCreditIds.length} credits.</p><div className="flex flex-wrap gap-3">{b.journalIds.map(id => <Link className="underline" key={id} to={`/accounting/journals/${id}`}>View journal</Link>)}</div>{b.status === 'POSTED' && canWrite && <div className="grid gap-3 md:grid-cols-3"><Field label="Reversal date"><input className={fieldClass} type="date" value={reverseDate} onChange={e => setReverseDate(e.target.value)}/></Field><Field label="Reversal reason"><input className={fieldClass} value={reverseReason} onChange={e => setReverseReason(e.target.value)}/></Field><button className={buttonClass} disabled={reverseReason.trim().length < 3} onClick={() => {
                    try {
                        openingBalanceRepository.reverse({ id: b.id, date: reverseDate, reason: reverseReason });
                        setNotice('Opening batch reversed with its original records and dated reversal history retained.');
                        setError('');
                    }
                    catch (e) {
                        setError((e as Error).message);
                    }
                }}>Reverse unused opening batch</button><p className="text-sm md:col-span-3">Correction is allowed only before subsequent accounting/inventory activity and bank reconciliation. Otherwise correct the downstream records through their normal workflows.</p></div>}</div>)}</Panel></BusinessFrame>;
}
