import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Panel, Field, SampleTable, Cell, fieldClass, buttonClass } from '../prototype/PrototypeUI';
import { Notice } from '../page-previews/PreviewWorkspace';
import { workspaceDomains, workspaceRepositories, useWorkspaceRecords, systemRoles } from './workspaceRepository';
import { productRepository, useProducts } from './productRepository';
import { configurationHistory, } from './workspaceRepository';
import { businessSettings, configurationRows, type ConfigRow } from './configurationState';
import { accountRepository } from '../accounting/data/accountRepository';
import { customerRepository } from '../contacts/data/customerRepository';
import { useSecurity } from '../security/securityClient';
import { hasPermission, type Permission } from '../security/rbac';
import type { Product, ProductUnit } from '../inventory/types/product';
export const connectedModules = new Set(['products', ...Object.keys(workspaceDomains).filter(d => d !== 'settings')]);
export function BusinessFrame({ title, children, actions, description = 'Saved in this desktop business profile. Authorized changes are recorded in the local security audit.' }: {
    title: string;
    children: ReactNode;
    actions?: ReactNode;
    description?: string;
}) { return <div className="space-y-5 pb-10"><header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">Local business data</p><h1 className="mt-1 font-display text-3xl">{title}</h1><p className="mt-2 text-sm text-[var(--color-text-secondary)]">{description}</p></div><div className="flex flex-wrap gap-2"><Link className={buttonClass} to="/workspace">Page directory</Link>{actions}</div></header>{children}</div>; }
function useCan(permission: Permission) { const { session } = useSecurity(); return hasPermission(session && { userId: session.user.id, roles: session.user.roles, authenticated: true }, permission); }
function Missing({ path }: {
    path: string;
}) { return <BusinessFrame title="Record not found"><p>The business record no longer exists, or is outside your access.</p><Link className={buttonClass} to={path}>Back to register</Link></BusinessFrame>; }
type Mode = 'list' | 'new' | 'edit' | 'detail';
export function ProductBusinessPage({ mode, id }: {
    mode: Mode;
    id?: string;
}) {
    const rows = useProducts(), product = rows.find(p => p.id === id), canWrite = useCan('inventory.adjust'), navigate = useNavigate();
    const [query, setQuery] = useState(''), [error, setError] = useState(''), [expectedRevision] = useState(product ? (product.revision ?? 0) : undefined);
    const [draft, setDraft] = useState<Product>(() => structuredClone(product ?? { id: crypto.randomUUID(), sku: '', name: '', category: 'Other', status: 'ACTIVE', baseUnitId: '', units: [], itemType: 'STOCK', buyEnabled: true, sellEnabled: true, reorderPoint: 0, targetStock: 0, wholePacks: true, taxCode: businessSettings().gstCode, createdAt: '', updatedAt: '' }));
    if (id && !product)
        return <Missing path="/inventory/products"/>;
    const editing = mode === 'new' || mode === 'edit';
    const update = (key: keyof Product, value: unknown) => setDraft({ ...draft, [key]: value });
    function addUnit() { const id = crypto.randomUUID(), isBase = !draft.units.length, unit: ProductUnit = { id, code: draft.itemType==='SERVICE'?(isBase?'JOB':'HOUR'):draft.itemType==='NON_STOCK'?'PIECE':isBase?'M2':'BOX', name: draft.itemType==='SERVICE'?(isBase?'Job':'Hour'):draft.itemType==='NON_STOCK'?'Item':isBase?'Square metre':'Box', symbol: draft.itemType==='SERVICE'?(isBase?'job':'hr'):draft.itemType==='NON_STOCK'?'each':isBase?'m²':'box', conversionToBase: isBase ? 1 : 1, basePrice: 0, isBaseUnit: isBase, active: true }; setDraft({ ...draft, baseUnitId: isBase ? id : draft.baseUnitId, units: [...draft.units, unit] }); }
    return <BusinessFrame title={mode === 'list' ? 'Products & services' : editing ? `${mode === 'new' ? 'New' : 'Edit'} product` : product!.name} actions={mode === 'list' && canWrite ? <Link className={buttonClass} to="/inventory/products/new">New product</Link> : <Link className={buttonClass} to="/inventory/products">Back to products</Link>}><Notice error>{error}</Notice>{mode === 'list' ? <Panel title="Product register"><input aria-label="Search products" className={fieldClass} placeholder="SKU, name or brand" value={query} onChange={e => setQuery(e.target.value)}/><SampleTable headers={['SKU', 'Name', 'Type', 'Units', 'Status']} empty={!rows.some(p => `${p.sku} ${p.name} ${p.brand}`.toLowerCase().includes(query.toLowerCase()))}>{rows.filter(p => `${p.sku} ${p.name} ${p.brand}`.toLowerCase().includes(query.toLowerCase())).map(p => <tr key={p.id}><Cell>{p.sku}</Cell><Cell><Link className="underline" to={`/inventory/products/${p.id}`}>{p.name}</Link></Cell><Cell>{p.itemType ?? 'STOCK'}</Cell><Cell>{p.units.map(u => `${u.symbol}: ${u.conversionToBase}`).join(' / ')}</Cell><Cell>{p.status}</Cell></tr>)}</SampleTable></Panel> : !editing ? <><Panel title="Product details"><dl className="grid gap-4 md:grid-cols-2">{[['SKU', product!.sku], ['Category', product!.category], ['Brand', product!.brand ?? '—'], ['Type', product!.itemType ?? 'STOCK'], ['Tax code', product!.taxCode ?? 'GST'], ['Status', product!.status], ['Reorder point', String(product!.reorderPoint ?? 0)], ['Target stock', String(product!.targetStock ?? 0)]].map(([k, v]) => <div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd className="mt-1">{v}</dd></div>)}</dl>{canWrite && <Link className={buttonClass} to={`/inventory/products/${id}/edit`}>Edit product</Link>}</Panel><Panel title="Selling units"><SampleTable headers={['Unit', 'Base quantity', 'Standard price', 'Base unit']}>{product!.units.map(u => <tr key={u.id}><Cell>{u.name} ({u.symbol})</Cell><Cell>{u.conversionToBase}</Cell><Cell>{u.basePrice.toFixed(2)}</Cell><Cell>{u.isBaseUnit ? 'Yes' : 'No'}</Cell></tr>)}</SampleTable><p className="text-sm">Selling units are shared by quotation and purchase workflows. Selling prices feed quotation pricing; purchase unit costs remain entered on purchase orders. Product changes do not rewrite historical document lines.</p></Panel></> : !canWrite ? <Notice error>Your role cannot maintain products.</Notice> : <form className="space-y-5" onSubmit={e => { e.preventDefault(); try {
        const saved = productRepository.save(draft, expectedRevision);
        navigate(`/inventory/products/${saved.id}`);
    }
    catch (e) {
        setError((e as Error).message);
    } }}><Panel title="Product information"><p className="mb-4 text-sm">Stock items require inventory dispatch. Non-stock and service items are sales-only, do not move stock or COGS, and use expense/service bills for supplier costs. Use hour/job units for services. Referenced item types cannot change.</p><div className="grid gap-4 md:grid-cols-2">{(['sku', 'name', 'brand', 'description'] as const).map(k => <Field key={k} label={({ sku: 'SKU', name: 'Name', brand: 'Brand', description: 'Description', reorderPoint: 'Reorder point', targetStock: 'Target stock' } as Record<string, string>)[k] ?? k}><input className={fieldClass} value={draft[k] ?? ''} required={k === 'sku' || k === 'name'} onChange={e => update(k, e.target.value)}/></Field>)}<Field label="Category"><select className={fieldClass} value={draft.category} onChange={e => update('category', e.target.value)}>{['Timber', 'Hybrid', 'Laminate', 'Vinyl', 'Carpet', 'Accessories', 'Other'].map(v => <option key={v}>{v}</option>)}</select></Field><Field label="Item type"><select className={fieldClass} value={draft.itemType ?? 'STOCK'} onChange={e => setDraft({...draft,itemType:e.target.value as Product['itemType'],buyEnabled:e.target.value==='STOCK',reorderPoint:0,targetStock:0,wholePacks:e.target.value==='STOCK'})}>{['STOCK','NON_STOCK','SERVICE'].map(v => <option key={v}>{v}</option>)}</select></Field><Field label="Tax code"><select className={fieldClass} value={draft.taxCode ?? 'GST'} onChange={e => update('taxCode', e.target.value)}>{(configurationRows['tax-codes'] ?? []).filter(r => r.status === 'Active').map(r => <option key={r.id} value={r.code}>{r.code} · {r.rate}%</option>)}</select></Field><Field label="Status"><select className={fieldClass} value={draft.status} onChange={e => update('status', e.target.value)}><option>ACTIVE</option><option>INACTIVE</option></select></Field>{(['reorderPoint', 'targetStock'] as const).map(k => <Field key={k} label={({ sku: 'SKU', name: 'Name', brand: 'Brand', description: 'Description', reorderPoint: 'Reorder point', targetStock: 'Target stock' } as Record<string, string>)[k] ?? k}><input className={fieldClass} type="number" min="0" step="0.01" value={draft[k] ?? 0} onChange={e => update(k, Number(e.target.value))}/></Field>)}{(['buyEnabled', 'sellEnabled', 'wholePacks'] as const).map(k => <label key={k} className="flex gap-2 text-sm"><input type="checkbox" disabled={k==='buyEnabled'&&draft.itemType!==undefined&&draft.itemType!=='STOCK'} checked={draft[k] ?? true} onChange={e => update(k, e.target.checked)}/>{({ buyEnabled: 'Available for purchase', sellEnabled: 'Available for sale', wholePacks: 'Whole packs only' } as Record<string, string>)[k]}</label>)}</div></Panel><Panel title="Units & selling prices"><p className="text-sm">One base unit is required. Conversions already referenced by business records cannot be changed or removed.</p>{draft.units.map((u, i) => <div key={u.id} className="grid gap-3 rounded-lg border p-4 md:grid-cols-3">{(['name', 'symbol', 'conversionToBase', 'basePrice'] as const).map(k => <Field key={k} label={`${u.code} · ${k}`}><input className={fieldClass} required type={k === 'conversionToBase' || k === 'basePrice' ? 'number' : 'text'} step="0.001" min={k === 'conversionToBase' ? '0.001' : '0'} readOnly={u.isBaseUnit && k === 'conversionToBase'} value={u[k]} onChange={e => update('units', draft.units.map((v, j) => j === i ? { ...v, [k]: k === 'conversionToBase' || k === 'basePrice' ? Number(e.target.value) : e.target.value } : v))}/></Field>)}<Field label="Unit code"><select className={fieldClass} value={u.code} onChange={e => update('units', draft.units.map((v, j) => j === i ? { ...v, code: e.target.value } : v))}>{['M2', 'LM', 'BOX', 'PIECE', 'ROLL', 'BUCKET','HOUR','JOB'].map(v => <option key={v}>{v}</option>)}</select></Field><button type="button" className={buttonClass} disabled={u.isBaseUnit} onClick={() => update('units', draft.units.filter((_, j) => j !== i))}>Remove unit</button></div>)}<button type="button" className={buttonClass} onClick={addUnit}>Add unit</button></Panel><button className={buttonClass}>Save product</button></form>}</BusinessFrame>;
}
type Choice = {
    value: string;
    label: string;
};
type FormField = {
    key: string;
    label: string;
    type?: string;
    options?: Choice[];
    optional?: boolean;
};
const choices = (values: string[]): Choice[] => values.map(v => ({ value: v, label: v }));
export function businessFields(domain: string): FormField[] {
    const accounts = accountRepository.getAll().filter(a => a.active).map(a => ({ value: a.id, label: `${a.code} · ${a.name}` })), customers = customerRepository.getAll().map(c => ({ value: c.id, label: c.businessName })), products = productRepository.getAll().filter(p => p.status === 'ACTIVE').map(p => ({ value: p.id, label: `${p.sku} · ${p.name}` })), units = productRepository.getAll().flatMap(p => p.units.map(u => ({ value: u.id, label: `${p.sku} · ${u.symbol}` })));
    const fields: Record<string, FormField[]> = {
        'tax-codes': [{ key: 'code', label: 'Code' }, { key: 'rate', label: 'Rate (%)', type: 'number' }, { key: 'collected', label: 'GST collected account', options: accounts }, { key: 'paid', label: 'GST paid account', options: accounts }, { key: 'basis', label: 'Entry basis', options: choices(['Exclusive','Inclusive']) }, { key: 'report', label: 'Report mapping' }],
        'linked-accounts': [{ key: 'role', label: 'Posting role', options: choices(systemRoles) }, { key: 'accountId', label: 'General ledger account', options: accounts }],
        promotions: [{ key: 'productId', label: 'Product', options: products }, { key: 'unitId', label: 'Selling unit', options: units }, { key: 'customerId', label: 'Customer (blank = all)', options: [{ value: '', label: 'All customers' }, ...customers], optional: true }, { key: 'starts', label: 'Start (ISO timestamp with time offset)' }, { key: 'ends', label: 'End (ISO timestamp with time offset)' }, { key: 'price', label: 'Unit price', type: 'number' }, { key: 'priority', label: 'Priority (higher wins)', type: 'number' }, { key: 'policy', label: 'Price conflict policy', options: choices(['Customer price first', 'Promotion first', 'Lowest eligible price']) }],
        jobs: [{ key: 'code', label: 'Job code' }, { key: 'customerId', label: 'Customer', options: customers }, { key: 'owner', label: 'Owner', optional: true }, { key: 'starts', label: 'Start date', type: 'date' }, { key: 'ends', label: 'End date', type: 'date' }, { key: 'budget', label: 'Revenue budget', type: 'number' }, { key: 'costBudget', label: 'Cost budget', type: 'number' }],
        tasks: [{ key: 'customerId', label: 'Customer', options: customers }, { key: 'owner', label: 'Assigned user ID' }, { key: 'due', label: 'Due date', type: 'date' }, { key: 'priority', label: 'Priority', options: choices(['Normal', 'High', 'Low']) }, { key: 'notes', label: 'Instructions', type: 'textarea' }],
        'bank-rules': [{ key: 'field', label: 'Condition field', options: choices(['Description', 'Payee', 'Reference']) }, { key: 'operator', label: 'Operator', options: choices(['Contains', 'Equals', 'Starts with']) }, { key: 'value', label: 'Match text' }, { key: 'accountId', label: 'Account', options: accounts }, { key: 'taxCode', label: 'Tax code', options: choices((configurationRows['tax-codes'] ?? []).filter(r => r.status === 'Active').map(r => r.code)) }, { key: 'enabled', label: 'Enabled', options: choices(['Yes', 'No']) }],
        templates: [{ key: 'kind', label: 'Document type', options: choices(['Invoice', 'Quotation', 'Sales order', 'Credit note', 'Purchase order', 'Customer statement', 'Remittance']) }, { key: 'subject', label: 'Email subject' }, { key: 'body', label: 'Email body', type: 'textarea' }, { key: 'footer', label: 'Document footer', type: 'textarea', optional: true }, { key: 'logo', label: 'Logo position', options: choices(['Left', 'Centre', 'Right']) }, { key: 'paper', label: 'Paper', options: choices(['A4', 'Letter']) }],
        'custom-reports': [{ key: 'dataset', label: 'Dataset', options: choices(['Sales', 'Purchases', 'Banking', 'General ledger']) }, { key: 'columns', label: 'Columns (comma separated)' }, { key: 'filter', label: 'Filter', optional: true }, { key: 'basis', label: 'Basis', options: choices(['Accrual', 'Cash']) }, { key: 'favourite', label: 'Favourite', options: choices(['Yes', 'No']) }],
        'report-packs': [{ key: 'periodStart', label: 'From', type: 'date' }, { key: 'periodEnd', label: 'To', type: 'date' }, { key: 'reports', label: 'Included reports (comma separated)' }, { key: 'cover', label: 'Cover title', optional: true }, { key: 'introduction', label: 'Cover note', type: 'textarea', optional: true }],
    };
    return fields[domain] ?? [];
}
export function ConfigurationBusinessPage({ domain, path, title, mode, id }: {
    domain: string;
    path: string;
    title: string;
    mode: Mode;
    id?: string;
}) {
    const rows = useWorkspaceRecords(domain), row = rows.find(r => r.id === id), repo = workspaceRepositories[domain], fields = businessFields(domain), canWrite = useCan(workspaceDomains[domain].write), navigate = useNavigate();
    const [expectedRevision] = useState(row?.revision);
    const [query, setQuery] = useState(''), [error, setError] = useState(''), [note, setNote] = useState(''), [draft, setDraft] = useState<Record<string, string>>(() => row ? { ...row, status: domain === 'tasks' && !['Open','In progress','Completed'].includes(row.status) ? 'Open' : row.status } : Object.fromEntries([['name', ''], ['status', domain === 'tasks' ? 'Open' : 'Active'], ...fields.map(f => [f.key, f.options?.[0]?.value ?? ''])]));
    if (id && !row)
        return <Missing path={path}/>;
    const editing = mode === 'new' || mode === 'edit';
    const save = (data: Record<string, string>) => { try {
        const result = repo.save(data, expectedRevision);
        navigate(`${path}/${result.id}`);
    }
    catch (e) {
        setError((e as Error).message);
    } };
    return <BusinessFrame title={mode === 'list' ? title : editing ? `${mode === 'new' ? 'New' : 'Edit'} ${title.toLowerCase()}` : row!.name} actions={mode === 'list' && canWrite ? <Link className={buttonClass} to={`${path}/new`}>New record</Link> : <Link className={buttonClass} to={path}>Back to register</Link>}><Notice error>{error}</Notice>{!['tax-codes', 'linked-accounts', 'promotions', 'tasks', 'jobs'].includes(domain) && <p className="rounded-lg border bg-slate-50 p-3 text-sm">This register saves configuration and history. Automatic bank processing, report generation and document delivery are not connected to this register yet.</p>}{mode === 'list' ? <Panel title="Business register"><input aria-label="Search business records" className={fieldClass} value={query} onChange={e => setQuery(e.target.value)} placeholder="Name, code or reference"/><SampleTable headers={['Name', 'Status', 'Updated', 'Revision']} empty={!rows.some(r=>Object.values(r).join(' ').toLowerCase().includes(query.toLowerCase()))}>{rows.filter(r => Object.values(r).join(' ').toLowerCase().includes(query.toLowerCase())).map(r => <tr key={r.id}><Cell><Link className="underline" to={`${path}/${r.id}`}>{r.name}</Link></Cell><Cell>{r.status}</Cell><Cell>{r.updatedAt}</Cell><Cell>{r.revision}</Cell></tr>)}</SampleTable></Panel> : editing ? !canWrite ? <Notice error>Your role cannot maintain these records.</Notice> : <Panel title="Business record"><form className="space-y-4" onSubmit={e => { e.preventDefault(); save(draft); }}><Field label="Name"><input className={fieldClass} value={draft.name} required onChange={e => setDraft({ ...draft, name: e.target.value })}/></Field><div className="grid gap-4 md:grid-cols-2">{fields.map(f => <Field key={f.key} label={f.label}>{f.options ? <select required={!f.optional} className={fieldClass} value={draft[f.key] ?? ''} onChange={e => setDraft({ ...draft, [f.key]: e.target.value })}>{f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select> : f.type === 'textarea' ? <textarea rows={4} required={!f.optional} className={fieldClass} value={draft[f.key] ?? ''} onChange={e => setDraft({ ...draft, [f.key]: e.target.value })}/> : <input required={!f.optional} type={f.type ?? 'text'} step="0.01" className={fieldClass} value={draft[f.key] ?? ''} onChange={e => setDraft({ ...draft, [f.key]: e.target.value })}/>}</Field>)}</div><button className={buttonClass}>Save business record</button></form></Panel> : <><Panel title="Details">{domain==='tasks'&&<p className="mb-4 text-sm">Status: {row!.status}{row!.status==='Completed'?` · Completed ${row!.completedAt??'—'} · By ${row!.completedBy??'—'}`:''}</p>}<dl className="grid gap-4 md:grid-cols-2">{fields.map(f => <div key={f.key}><dt className="text-xs text-slate-500">{f.label}</dt><dd className="mt-1 break-words whitespace-pre-wrap">{f.options?.find(o => o.value === row![f.key])?.label ?? row![f.key] ?? '—'}</dd></div>)}</dl>{canWrite && <div className="flex gap-3"><Link className={buttonClass} to={`${path}/${id}/edit`}>Edit business record</Link>{domain === 'tasks' && ['Open','In progress'].filter(s=>s!==row!.status).map(status=><button key={status} className={buttonClass} onClick={()=>{try{repo.setStatus(id!,status,row!.revision);}catch(e){setError((e as Error).message);}}}>{status==='Open'?'Reopen task':'Start task'}</button>)}<button disabled={domain==='tasks'&&row!.status==='Completed'} className={buttonClass} onClick={() => { try {
        repo.setStatus(id!, domain === 'tasks' ? 'Completed' : row!.status === 'Active' ? 'Inactive' : 'Active', row!.revision);
    }
    catch (e) {
        setError((e as Error).message);
    } }}>{domain === 'tasks' ? 'Complete task' : row!.status === 'Active' ? 'Deactivate' : 'Activate'}</button></div>}</Panel>{domain === 'tasks' && canWrite && <Panel title="Add follow-up note"><textarea className={fieldClass} rows={3} value={note} onChange={e => setNote(e.target.value)}/><button className={buttonClass} disabled={!note.trim()} onClick={() => { try {
        repo.addNote(id!, note);
        setNote('');
    }
    catch (e) {
        setError((e as Error).message);
    } }}>Save note</button></Panel>}<Panel title="Change history"><SampleTable headers={['Action', 'Actor', 'Time', 'Note']}>{(configurationHistory[domain] ?? []).filter((r: ConfigRow) => r.recordId === id).map((r: ConfigRow) => <tr key={r.id}><Cell>{r.name}</Cell><Cell>{r.actorId}</Cell><Cell>{r.createdAt}</Cell><Cell>{historyNote(r)}</Cell></tr>)}</SampleTable></Panel></>}</BusinessFrame>;
}

function historyNote(row:ConfigRow){try{return String(JSON.parse(row.after).note??'');}catch{return '';}}
