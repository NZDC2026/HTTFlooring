import { z } from 'zod';
import { createHash } from 'node:crypto';
import { registerRepository, snapshotRepositories, restoreRepositories } from '../../src/features/security/repositoryHost';
import { trustedAuthorization } from '../../src/features/security/trustedAuthorization';
import { hasPermission } from '../../src/features/security/rbac';
import { customerRepository } from '../../src/features/contacts/data/customerRepository';
import { supplierRepository } from '../../src/features/contacts/data/supplierRepository';
import { customerFormSchema, locationFormSchema, contactFormSchema } from '../../src/features/contacts/schemas/customerSchemas';
import { supplierFormSchema } from '../../src/features/contacts/schemas/supplierSchemas';
import { productRepository, productSchema } from '../../src/features/business-workspace/productRepository';
import { duplicateCandidates } from '../../src/features/contact-review/reviewModel';
import { defaults, fields, datasets, modes, formatTag, permissions, sourceSchema, parseSource, encodeCsv, type Dataset, type TransferSource, type TransferResult, type TransferRun, type TransferPreview } from '../../src/features/data-transfer/transferModel';
import type { Product } from '../../src/features/inventory/types/product';
const id = z.string().trim().min(1).max(200), reason = z.string().trim().min(1).max(2000);
const stable = (v: any): any => Array.isArray(v) ? v.map(stable) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).filter(([, value]) => value !== undefined).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, value]) => [key, stable(value)])) : v;
const hash = (v: unknown) => createHash('sha256').update(JSON.stringify(stable(v))).digest('hex');
let runs: TransferRun[] = [];
const actor = (dataset: Dataset, write = false) => {
    trustedAuthorization.require('inventory.read');
    const p = trustedAuthorization.require(permissions[dataset].read);
    if (write)
        trustedAuthorization.require(permissions[dataset].write);
    return p.userId;
};
function masters(dataset: Dataset): {
    id: string;
    parentId: string;
    raw: any;
}[] {
    if (dataset === 'Customers')
        return customerRepository.getAll().map(raw => ({ id: raw.id, parentId: '', raw }));
    if (dataset === 'Suppliers')
        return supplierRepository.getAll().map(raw => ({ id: raw.id, parentId: '', raw }));
    if (dataset === 'Products')
        return productRepository.getAll().map(raw => ({ id: raw.id, parentId: '', raw }));
    return customerRepository.getAll().flatMap(c => (dataset === 'Customer branches' ? c.locations : c.contacts).map(raw => ({ id: raw.id, parentId: c.id, raw })));
}
function rowValues(dataset: Dataset, item: ReturnType<typeof masters>[number]) {
    const values: Record<string, string> = {};
    for (const [key, value] of Object.entries(defaults[dataset]))
        values[key] = String(item.raw[key] ?? value);
    if (dataset === 'Customer branches' || dataset === 'Customer contacts')
        values.customerId = item.parentId;
    if (dataset === 'Products') {
        const p = item.raw as Product;
        values.taxCode = p.taxCode ?? '';
        values.itemType = p.itemType ?? 'STOCK';
        values.buyEnabled = String(p.buyEnabled ?? (p.itemType === undefined || p.itemType === 'STOCK'));
        values.baseUnitCode = p.units.find(u => u.id === p.baseUnitId)!.code;
        values.unitsJson = JSON.stringify(p.units);
    }
    return values;
}
function canonical(dataset: Dataset, item: ReturnType<typeof masters>[number]): Record<string, string> { return { _format: formatTag, id: item.id, recordToken: hash({ parentId: item.parentId, record: item.raw }), externalId: runs.filter(r => r.dataset === dataset).flatMap(r => r.results).find(r => r.action === 'Created' && r.recordId === item.id)?.externalId ?? '', ...rowValues(dataset, item) }; }
function numeric(value: string, key: string) {
    if (!/^-?\d+(?:\.\d+)?$/.test(value) || !Number.isFinite(Number(value)) || Math.abs(Number(value)) > Number.MAX_SAFE_INTEGER)
        throw new Error(`${key} must contain a safe plain number.`);
    return Number(value);
}
function typed(dataset: Dataset, values: Record<string, string>, existing?: ReturnType<typeof masters>[number]) {
    const base: Record<string, unknown> = existing ? rowValues(dataset, existing) : { ...defaults[dataset] };
    for (const key of Object.keys(defaults[dataset]))
        if (Object.hasOwn(values, key)) {
            const value = values[key].trim();
            if (typeof defaults[dataset][key] === 'number')
                base[key] = numeric(value, key);
            else if (typeof defaults[dataset][key] === 'boolean') {
                if (!['true', 'false'].includes(value))
                    throw new Error(`${key} must be true or false.`);
                base[key] = value === 'true';
            }
            else
                base[key] = value.trim();
        }
    if (existing)
        for (const [key, value] of Object.entries(defaults[dataset]))
            if (!Object.hasOwn(values, key)) {
                if (typeof value === 'number')
                    base[key] = Number(base[key]);
                if (typeof value === 'boolean')
                    base[key] = base[key] === 'true';
            }
    return base;
}
const norm = (v: unknown) => String(v ?? '').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const newMatches = (next: any[], previous: any[]) => next.some(n => n.reasons.some((reason: string) => !previous.some(p => p.id === n.id && p.reasons.includes(reason))));
function supplierMatches(data: any, others: any[]) { return others.map(s => ({ id: s.id, reasons: [...(norm(s.businessName) === norm(data.businessName) ? ['Name'] : []), ...(data.email && s.email?.toLowerCase() === data.email.toLowerCase() ? ['Email'] : []), ...(data.abn && norm(s.abn) === norm(data.abn) ? ['Identifier'] : [])] })).filter(s => s.reasons.length); }
function apply(dataset: Dataset, mode: TransferSource['mode'], values: Record<string, string>, skipToken = false) {
    const current = values.id ? masters(dataset).find(x => x.id === values.id) : undefined;
    if (mode === 'Update by ID') {
        if (!current)
            throw new Error('Existing record ID was not found.');
        if (!skipToken && (!values.recordToken || values.recordToken !== canonical(dataset, current).recordToken))
            throw new Error('Record token is missing or stale. Export the current record again.');
    }
    else if (values.id || values.recordToken)
        throw new Error('Create mode does not accept existing IDs or record tokens. Choose Update by ID.');
    if (mode === 'Update by ID' && values.externalId && values.externalId !== canonical(dataset, current!).externalId)
        throw new Error('External source IDs cannot be reassigned by an update. Keep the export value or leave it blank.');
    const old = mode === 'Update by ID' ? current : undefined, before = old ? canonical(dataset, old) : null, v = typed(dataset, values, old);
    let result: any;
    if (dataset === 'Customers') {
        const data = customerFormSchema.strict().parse(v);
        const others = customerRepository.getAll().filter(c => c.id !== old?.id);
        if (newMatches(duplicateCandidates({ kind: 'Customer', customerId: '', values: data }, others), old ? duplicateCandidates({ kind: 'Customer', customerId: '', values: old.raw }, others) : []))
            throw new Error('Possible existing customer duplicate. Use the customer review workflow or explicit ID update.');
        result = old ? customerRepository.update(old.id, data) : customerRepository.create(data);
    }
    else if (dataset === 'Suppliers') {
        const data = supplierFormSchema.strict().parse(v);
        const others = supplierRepository.getAll().filter(s => s.id !== old?.id);
        if (newMatches(supplierMatches(data, others), old ? supplierMatches(old.raw, others) : []))
            throw new Error('Possible existing supplier duplicate. Resolve it before import.');
        result = old ? supplierRepository.update(old.id, data) : supplierRepository.create(data);
    }
    else if (dataset === 'Products') {
        const units = z.array(z.object({ id: z.string().max(200).optional(), code: z.enum(['M2', 'LM', 'BOX', 'PIECE', 'ROLL', 'BUCKET', 'HOUR', 'JOB']), name: z.string().trim().min(1).max(120), symbol: z.string().min(1).max(40), conversionToBase: z.number().finite().positive(), basePrice: z.number().finite().nonnegative(), isBaseUnit: z.boolean(), active: z.boolean() }).strict()).min(1).max(100).parse(JSON.parse(String(v.unitsJson)));
        const existing = old?.raw as Product | undefined, newUnits = units.map(u => {
            let unitId = crypto.randomUUID() as string;
            if (existing) {
                if (u.id) {
                    if (!existing.units.some(p => p.id === u.id))
                        throw new Error('Unit ID does not belong to this product. Keep exported IDs; use an empty ID for a new unit.');
                    unitId = u.id;
                }
                else if (!Object.hasOwn(u, 'id')) {
                    const matches = existing.units.filter(p => p.code === u.code);
                    if (matches.length > 1)
                        throw new Error('Ambiguous unit code. Keep the unit IDs from the current export.');
                    unitId = matches[0]?.id ?? unitId;
                }
            }
            return { ...u, id: unitId };
        }), baseUnit = newUnits.find(u => u.code === v.baseUnitCode && u.isBaseUnit);
        if (!baseUnit)
            throw new Error('baseUnitCode must identify the primary product unit.');
        const { unitsJson: _unitsJson, baseUnitCode: _baseUnitCode, ...rest } = v, at = new Date().toISOString();
        if (rest.taxCode === '')
            delete rest.taxCode;
        if (existing)
            for (const key of ['brand', 'collection', 'description', 'itemType', 'buyEnabled', 'sellEnabled', 'reorderPoint', 'targetStock', 'wholePacks', 'taxCode'])
                if (!Object.hasOwn(values, key) && existing[key as keyof Product] === undefined)
                    delete rest[key];
        const product = productSchema.parse({ ...rest, id: old?.id ?? crypto.randomUUID(), baseUnitId: baseUnit.id, units: newUnits, createdAt: existing?.createdAt ?? at, updatedAt: at }) as Product;
        result = productRepository.save(product, existing?.revision ?? (old ? 0 : undefined));
    }
    else {
        const parentId = String(v.customerId), parent = customerRepository.getById(parentId);
        if (!parent || parent.status === 'INACTIVE')
            throw new Error('Select an existing, non-inactive parent customer.');
        if (old && old.parentId !== parentId)
            throw new Error('Existing branch/contact cannot move to a different customer.');
        const { customerId: _customerId, ...rest } = v, kind = dataset === 'Customer branches' ? 'Branch' : 'Contact', data = kind === 'Branch' ? locationFormSchema.strict().parse(rest) : contactFormSchema.strict().parse(rest);
        const candidates = duplicateCandidates({ kind, customerId: parentId, values: data }, [parent]);
        if (newMatches(candidates.filter(c => c.id !== old?.id), old ? duplicateCandidates({ kind, customerId: parentId, values: old.raw }, [parent]).filter(c => c.id !== old.id) : []))
            throw new Error('Possible existing branch/contact duplicate. Use customer review or explicit ID update.');
        if (kind === 'Branch')
            result = old ? customerRepository.updateLocation(parentId, old.id, data as any) : customerRepository.addLocation(parentId, data as any);
        else
            result = old ? customerRepository.updateContact(parentId, old.id, data as any) : customerRepository.addContact(parentId, data as any);
    }
    const saved = masters(dataset).find(x => x.id === result.id)!;
    return { recordId: result.id, before, after: canonical(dataset, saved) };
}
function inspect(input: TransferSource) {
    actor(input.dataset, true);
    if (Buffer.byteLength(input.text, 'utf8') > 1000000)
        throw new Error('CSV source exceeds 1 MB of UTF-8 text.');
    const parsed = parseSource(input), originals = new Map(masters(input.dataset).map(item => [item.id, canonical(input.dataset, item)])), snapshot = snapshotRepositories(), fingerprint = hash({ input, master: snapshot }), seen = new Set<string>(), results: TransferResult[] = [], rows: TransferPreview['rows'] = [];
    try {
        for (const source of parsed.rows) {
            const values = source.values, externalId = (values.externalId ?? '').trim(), identityFingerprint = hash({ dataset: input.dataset, values: Object.fromEntries(Object.keys(defaults[input.dataset]).filter(k => Object.hasOwn(values, k)).map(k => [k, values[k]])) }), key = input.mode === 'Create' ? externalId : values.id;
            let error = '', result: TransferResult | undefined;
            try {
                if (!key)
                    throw new Error(input.mode === 'Create' ? 'externalId is required for safe create retries.' : 'id is required for explicit updates.');
                if (key.length > 200 || externalId.length > 200)
                    throw new Error('Import identity exceeds 200 characters.');
                if (seen.has(key))
                    throw new Error('Repeated identity in this CSV file.');
                seen.add(key);
                if (input.mode === 'Create' && (values.id || values.recordToken))
                    throw new Error('Create mode does not accept existing IDs or record tokens. Choose Update by ID.');
                if (input.mode === 'Update by ID' && (!originals.has(values.id) || values.recordToken !== originals.get(values.id)!.recordToken))
                    throw new Error('Record token is missing or stale. Export the current record again.');
                const identity = input.mode === 'Create' ? runs.filter(r => r.dataset === input.dataset).flatMap(r => r.results).find(r => r.action === 'Created' && r.externalId === externalId) : undefined;
                if (identity) {
                    if (identity.identityFingerprint !== identityFingerprint)
                        throw new Error('Source externalId already contains different creation data. Use an explicit ID update.');
                    const existing = masters(input.dataset).find(r => r.id === identity.recordId);
                    if (!existing)
                        throw new Error('Prior imported record is missing.');
                    result = { row: source.row, externalId, recordId: existing.id, action: 'Skipped', identityFingerprint, before: null, after: canonical(input.dataset, existing) };
                }
                else {
                    const saved = apply(input.dataset, input.mode, values, true);
                    if (input.mode === 'Update by ID')
                        saved.before = originals.get(values.id)!;
                    result = { row: source.row, externalId, action: input.mode === 'Create' ? 'Created' : 'Updated', identityFingerprint, ...saved };
                }
                results.push(result);
            }
            catch (e) {
                error = e instanceof Error ? e.message : 'Validation failed.';
            }
            rows.push({ row: source.row, externalId, recordId: result?.recordId ?? values.id ?? '', name: values.businessName || values.name || [values.firstName, values.lastName].filter(Boolean).join(' ') || values.sku || values.id || externalId, action: result?.action ?? 'Error', values: { ...values }, errors: error ? [error] : [] });
        }
        for (const row of rows) {
            const resolved = results.find(r => r.row === row.row);
            if (resolved) {
                const item = masters(input.dataset).find(m => m.id === resolved.recordId)!;
                const values = canonical(input.dataset, item);
                row.values = Object.fromEntries(Object.keys(defaults[input.dataset]).filter(k => Object.hasOwn(values, k)).map(k => [k, values[k]]));
                if (input.dataset === 'Products') {
                    const oldUnits = ((snapshot.products as any).products.find((p: any) => p.id === resolved.recordId)?.units ?? []).map((u: any) => u.id);
                    row.values.unitsJson = JSON.stringify(JSON.parse(row.values.unitsJson).map((u: any) => ({ ...u, id: oldUnits.includes(u.id) ? u.id : 'Assigned at commit' })));
                }
            }
        }
    }
    finally {
        restoreRepositories(snapshot);
    }
    return { preview: { fingerprint, headers: parsed.headers, mapping: parsed.mapping, unmappedColumns: parsed.unmappedColumns, rows, valid: rows.every(r => !r.errors.length) }, results };
}
export const transferRepository = {
    review(raw: unknown) { return inspect(sourceSchema.parse(raw)).preview; },
    commit(raw: unknown) {
        const input = sourceSchema.extend({ operationId: id, expectedPreview: z.string().regex(/^[a-f0-9]{64}$/), reason }).strict().parse(raw);
        const user = actor(input.dataset, true), { operationId, expectedPreview, reason: why, ...source } = input, fingerprint = hash({ source, reason: why }), prior = runs.find(r => r.operationId === operationId);
        if (prior) {
            if (prior.fingerprint !== fingerprint)
                throw new Error('Operation ID already has different import data.');
            return structuredClone(prior);
        }
        const plan = inspect(source);
        if (plan.preview.fingerprint !== expectedPreview)
            throw new Error('Business records or import fields changed. Validate the file again.');
        if (!plan.preview.valid)
            throw new Error('Resolve every validation error before committing the batch.');
        const parsed = parseSource(source), parentIds = new Set(parsed.rows.map(r => r.values.customerId || masters(source.dataset).find(x => x.id === r.values.id)?.parentId || '')), parentState = (c: any) => JSON.stringify({ primaryLocationId: c.primaryLocationId, primaryContactId: c.primaryContactId, locations: c.locations, contacts: c.contacts }), parents = ['Customer branches', 'Customer contacts'].includes(source.dataset) ? customerRepository.getAll().filter(c => parentIds.has(c.id)).map(c => ({ customerId: c.id, before: parentState(c) })) : [], results: TransferResult[] = [];
        for (const [index, row] of parsed.rows.entries()) {
            const planned = plan.results[index];
            if (planned.action === 'Skipped')
                results.push(planned);
            else
                results.push({ ...planned, ...apply(source.dataset, source.mode, row.values, true), before: planned.before });
        }
        for (const result of results) {
            const item = masters(source.dataset).find(x => x.id === result.recordId)!;
            result.after = canonical(source.dataset, item);
            if (result.action === 'Created')
                result.after.externalId = result.externalId;
        }
        const run: TransferRun = { id: crypto.randomUUID(), operationId, fingerprint, dataset: source.dataset, mode: source.mode, fileName: source.fileName, sourceHash: createHash('sha256').update(source.text).digest('hex'), actorId: user, at: new Date().toISOString(), reason: why, results, parentChanges: parents.map(p => ({ ...p, after: parentState(customerRepository.getById(p.customerId)) })).filter(p => p.before !== p.after) };
        runSchema.parse(run);
        runs = [...runs, run];
        return structuredClone(run);
    },
    export(dataset: Dataset) { dataset = z.enum(datasets).parse(dataset); actor(dataset); const columns = fields(dataset), rows = masters(dataset).map(item => canonical(dataset, item)); return { dataset, count: rows.length, csv: encodeCsv([columns, ...rows.map(row => columns.map(k => row[k] ?? ''))]) }; },
    template(dataset: Dataset) {
        dataset = z.enum(datasets).parse(dataset);
        actor(dataset);
        const columns = fields(dataset).filter(k => !['id', 'recordToken'].includes(k)), sample: Record<string, string> = { _format: formatTag, externalId: 'replace-with-stable-source-id', ...Object.fromEntries(Object.entries(defaults[dataset]).map(([k, v]) => [k, String(v)])) };
        if (dataset === 'Customers' || dataset === 'Suppliers')
            sample.businessName = 'Replace company name';
        if (dataset === 'Suppliers')
            sample.country = 'Replace country';
        if (dataset === 'Customer branches') {
            sample.name = 'Replace branch name';
            sample.addressLine1 = 'Replace address';
            sample.suburb = 'Replace city';
            sample.state = 'Replace region';
            sample.postcode = 'Replace postcode';
            sample.country = 'Replace country';
        }
        if (dataset === 'Customer contacts') {
            sample.firstName = 'Replace';
            sample.lastName = 'Name';
            sample.email = 'replace@example.test';
        }
        if (dataset === 'Products') {
            sample.sku = 'REPLACE-SKU';
            sample.name = 'Replace product name';
        }
        return encodeCsv([columns, columns.map(k => sample[k] ?? '')]);
    }
};
const cellValues = z.record(z.string(), z.string());
const resultSchema = z.object({ row: z.number().int().min(2).max(501), externalId: z.string().max(200), recordId: id, action: z.enum(['Created', 'Updated', 'Skipped']), identityFingerprint: z.string().regex(/^[a-f0-9]{64}$/), before: cellValues.nullable(), after: cellValues }).strict();
const runSchema = z.object({ id, operationId: id, fingerprint: z.string().regex(/^[a-f0-9]{64}$/), dataset: z.enum(datasets), mode: z.enum(modes), fileName: id, sourceHash: z.string().regex(/^[a-f0-9]{64}$/), actorId: id, at: z.string().refine(v => new Date(v).toISOString() === v), reason, results: z.array(resultSchema).min(1).max(500), parentChanges: z.array(z.object({ customerId: id, before: z.string().max(5000000), after: z.string().max(5000000) }).strict()).max(500) }).strict();
registerRepository('dataTransfers', { repository: transferRepository, read: 'inventory.read', commands: { review: 'inventory.read', commit: 'inventory.read', export: 'inventory.read', template: 'inventory.read' }, snapshot: () => ({ runs }), restore: v => { runs = v.runs; }, publish: () => { }, view: p => ({ runs: runs.filter(r => hasPermission(p, permissions[r.dataset].read)) }), validate: (raw, snapshots) => {
        const parsed = z.object({ runs: z.array(runSchema) }).strict().parse(raw), operations = new Set<string>(), identities = new Map<string, TransferResult>(), createdRecords = new Set<string>();
        for (const run of parsed.runs) {
            if (operations.has(run.operationId))
                throw new Error('Duplicate import operation.');
            operations.add(run.operationId);
            const root = run.dataset === 'Products' ? (snapshots.products as any).products : run.dataset === 'Suppliers' ? (snapshots.suppliers as any).suppliers : (snapshots.customers as any).customers;
            let previous = 1;
            for (const result of run.results) {
                if (result.row <= previous)
                    throw new Error('Import result rows must be ordered.');
                previous = result.row;
                const exists = run.dataset === 'Customer branches' ? root.some((c: any) => c.locations.some((r: any) => r.id === result.recordId)) : run.dataset === 'Customer contacts' ? root.some((c: any) => c.contacts.some((r: any) => r.id === result.recordId)) : root.some((r: any) => r.id === result.recordId);
                if (!exists || result.after.id !== result.recordId || result.before && result.before.id !== result.recordId || result.action === 'Updated' && !result.before || result.action !== 'Updated' && result.before)
                    throw new Error('Invalid imported record reference or before/after audit.');
                if (result.action === 'Created') {
                    if (run.mode !== 'Create' || !result.externalId || identities.has(run.dataset + ':' + result.externalId) || createdRecords.has(run.dataset + ':' + result.recordId))
                        throw new Error('Invalid import source identity.');
                    identities.set(run.dataset + ':' + result.externalId, result);
                    createdRecords.add(run.dataset + ':' + result.recordId);
                }
                if (result.action === 'Skipped') {
                    const original = identities.get(run.dataset + ':' + result.externalId);
                    if (run.mode !== 'Create' || !original || original.recordId !== result.recordId || original.identityFingerprint !== result.identityFingerprint)
                        throw new Error('Invalid skipped import identity.');
                }
                if (result.action === 'Updated' && run.mode !== 'Update by ID')
                    throw new Error('Invalid import update mode.');
                if (result.before && (Object.keys(result.before).some(k => !fields(run.dataset).includes(k)) || result.before._format !== formatTag || !/^[a-f0-9]{64}$/.test(result.before.recordToken)))
                    throw new Error('Invalid import before-state audit.');
                if (Object.keys(result.after).some(k => !fields(run.dataset).includes(k)) || result.after._format !== formatTag || !/^[a-f0-9]{64}$/.test(result.after.recordToken))
                    throw new Error('Invalid import audit fields.');
            }
            if (new Set(run.parentChanges.map(p => p.customerId)).size !== run.parentChanges.length || run.parentChanges.length && !['Customer branches', 'Customer contacts'].includes(run.dataset))
                throw new Error('Invalid import parent audit.');
            for (const change of run.parentChanges) {
                if (!root.some((c: any) => c.id === change.customerId))
                    throw new Error('Invalid import parent reference.');
                for (const json of [change.before, change.after]) {
                    const state = z.object({ primaryLocationId: z.string().optional(), primaryContactId: z.string().optional(), locations: z.array(z.object({ id }).passthrough()), contacts: z.array(z.object({ id }).passthrough()) }).strict().parse(JSON.parse(json));
                    if (state.primaryLocationId && !state.locations.some(l => l.id === state.primaryLocationId) || state.primaryContactId && !state.contacts.some(c => c.id === state.primaryContactId))
                        throw new Error('Invalid import primary-record audit.');
                }
            }
        }
    } });
