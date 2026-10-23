import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
let root: string, security: InstanceType<typeof import('../../../electron/security/localSecurity').LocalSecurity>, host: InstanceType<typeof import('../../../electron/security/businessHost').BusinessHost>;
const admin = { username: 'documents.admin', displayName: 'Document acceptance', password: 'Documents-test-password-4821' };
async function restart() { vi.resetModules(); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.login(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); }
beforeEach(async () => { vi.resetModules(); vi.stubGlobal('__HTT_MAIN_HOST__', true); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined); root = mkdtempSync(join(tmpdir(), 'htt-data-transfer-')); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.setup(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); rmSync(root, { recursive: true, force: true }); });
const cmd = (repository: string, method: string, ...args: unknown[]) => host.command({ repository, method, args }).result as any;
const state = (key: string) => host.view().repositories[key] as any;
async function role(name: 'SALES' | 'WAREHOUSE' | 'PURCHASING' | 'ACCOUNTANT' | 'FINANCE_ADMIN' | 'AUDITOR') { security.login(admin); const user = security.createUser({ username: 'documents.' + name.toLowerCase(), displayName: name, password: admin.password, roles: [name] }); security.login({ username: user.username, password: admin.password }); }
const csv = (rows: string[][]) => rows.map(r => r.map(v => '"' + v.replaceAll('"', '""') + '"').join(',')).join('\r\n');
function source(dataset = 'Customers', data: Record<string, string>[] = [{ externalId: 'customer-1', businessName: 'Transfer acceptance company' }], mode = 'Create', patch = {}) { const headers = [...new Set(data.flatMap(r => Object.keys(r)))]; return { dataset, mode, fileName: 'acceptance.csv', text: csv([headers, ...data.map(r => headers.map(k => r[k] ?? ''))]), ...patch }; }
const review = (s: any) => cmd('dataTransfers', 'review', s);
function commit(s: any, patch = {}) { const p = review(s); return cmd('dataTransfers', 'commit', { ...s, expectedPreview: p.fingerprint, operationId: crypto.randomUUID(), reason: 'Verified CSV migration', ...patch }); }
const exported = (dataset: string) => cmd('dataTransfers', 'export', dataset);
function updateSource(dataset: string, recordId: string, changes: Record<string, string> = {}) {
    const result = exported(dataset), rows = parseCsv(result.csv), index = rows[0].indexOf('id'), row = rows.slice(1).find(r => r[index] === recordId)!;
    for (const [k, v] of Object.entries(changes)) {
        row[rows[0].indexOf(k)] = v;
    }
    return { dataset, mode: 'Update by ID', fileName: 'updated-export.csv', text: csv([rows[0], row]) };
}
import { parseCsv } from '../page-previews/previewModel';
it('previews a mapped source with per-row errors and restores every repository without importing', () => { const before = structuredClone(host.view().repositories), s = source('Customers', [{ externalId: 'preview-1', businessName: 'Preview valid row' }, { externalId: 'preview-2', businessName: '', email: 'invalid' }]), p = review(s); expect(p.valid).toBe(false); expect(p.rows[0].action).toBe('Created'); expect(p.rows[0].values.businessName).toBe('Preview valid row'); expect(p.rows[0].values.status).toBe('ACTIVE'); expect(p.rows[1].errors).not.toEqual([]); expect(host.view().repositories).toEqual(before); expect(state('dataTransfers').runs).toEqual([]); expect(() => commit(s)).toThrow(/every validation error/); });
it.each(['Customers', 'Suppliers', 'Customer branches', 'Customer contacts', 'Products'])('creates real %s master records and exports IDs/update tokens', dataset => {
    const customer = state('customers').customers[0].id, values = dataset === 'Customers' ? { externalId: 'customer-import', businessName: 'Imported customer' } : dataset === 'Suppliers' ? { externalId: 'supplier-import', businessName: 'Imported supplier', country: 'NZ' } : dataset === 'Customer branches' ? { externalId: 'branch-import', customerId: customer, name: 'Imported branch', addressLine1: '19 Import Street', suburb: 'Auckland', state: 'Auckland', postcode: '1010', country: 'NZ' } : dataset === 'Customer contacts' ? { externalId: 'contact-import', customerId: customer, firstName: 'Import', lastName: 'Person', email: 'import.person@example.test' } : { externalId: 'product-import', sku: 'IMPORT-001', name: 'Imported catalogue product' };
    const run = commit(source(dataset, [values] as any));
    expect(run.results[0].action).toBe('Created');
    expect(exported(dataset).csv).toContain(run.results[0].recordId);
    expect(run.results[0].after.recordToken).toMatch(/^[a-f0-9]{64}$/);
    expect(run.actorId).toBe(security.principal()?.userId);
    if (dataset === 'Products')
        expect(state('products').products.find((p: any) => p.id === run.results[0].recordId).units).toHaveLength(1);
});
it('preserves explicit unmapped fields on ID updates and clears mapped optional fields', () => { const run = commit(source('Customers', [{ externalId: 'update-customer', businessName: 'Original import name', phone: '021 456 789', website: 'https://example.test' }])), record = run.results[0], r = exported('Customers'), rows = parseCsv(r.csv), row = rows.slice(1).find(r => r[rows[0].indexOf('id')] === record.recordId)!; const s = source('Customers', [{ id: record.recordId, recordToken: row[rows[0].indexOf('recordToken')], businessName: 'Updated import name', website: '' }], 'Update by ID'); expect(review(s).valid).toBe(true); expect(review(source('Customers', [{ id: record.recordId, recordToken: row[rows[0].indexOf('recordToken')], externalId: 'reassigned-source' }], 'Update by ID')).rows[0].errors.join()).toContain('reassigned'); const update = commit(s), master = state('customers').customers.find((c: any) => c.id === record.recordId); expect(master.phone).toBe('021 456 789'); expect(master.website).toBeUndefined(); expect(master.businessName).toBe('Updated import name'); expect(update.results[0].before.businessName).toBe('Original import name'); expect(update.results[0].after.businessName).toBe('Updated import name'); });
it('blocks stale export tokens and business changes between validation and commit', () => { const created = commit(source()).results[0], s = updateSource('Customers', created.recordId, { phone: '021 999 888' }), p = review(s); commit(source('Suppliers', [{ externalId: 'concurrent-supplier', businessName: 'Concurrent supplier', country: 'NZ' }])); expect(() => cmd('dataTransfers', 'commit', { ...s, expectedPreview: p.fingerprint, operationId: 'stale-preview', reason: 'Stale preview' })).toThrow(/changed/); commit(s); expect(review(s).valid).toBe(false); expect(review(s).rows[0].errors.join()).toContain('stale'); });
it('deduplicates source IDs across new batches and restart without undoing later master corrections', async () => { const s = source(), first = commit(s); commit(updateSource('Customers', first.results[0].recordId, { phone: '021 555 888' })); await restart(); const next = commit(s); expect(next.results[0]).toMatchObject({ action: 'Skipped', recordId: first.results[0].recordId }); expect(state('customers').customers.find((c: any) => c.id === first.results[0].recordId).phone).toBe('021 555 888'); expect(review(source('Customers', [{ externalId: 'customer-1', businessName: 'Different original source' }])).valid).toBe(false); });
it('retries the same committed operation after restart and rejects operation ID reuse for different input', async () => { const s = source(), p = review(s), request = { ...s, expectedPreview: p.fingerprint, operationId: 'stable-import', reason: 'Verified stable batch' }, first = cmd('dataTransfers', 'commit', request); await restart(); expect(cmd('dataTransfers', 'commit', request)).toEqual(first); expect(state('dataTransfers').runs).toHaveLength(1); expect(() => cmd('dataTransfers', 'commit', { ...request, reason: 'Different' })).toThrow(/different import/); });
it('handles custom source headers/mappings and never silently chooses update mode', () => { const s = source('Customers', [{ SourceKey: 'custom-id', Company: 'Custom mapping company', Ignored: 'Unmapped text' }], 'Create', { mapping: { externalId: 0, businessName: 1 } }), p = review(s); expect(p.unmappedColumns).toEqual(['Ignored']); expect(commit(s).results[0].after.businessName).toBe('Custom mapping company'); const row = exported('Customers'); expect(review({ dataset: 'Customers', mode: 'Create', fileName: 'wrong-mode.csv', text: row.csv }).valid).toBe(false); });
it('rejects repeated IDs, existing duplicates, absent parents, invalid types and forged fields', () => {
    const name = state('customers').customers[0].businessName;
    for (const s of [source('Customers', [{ externalId: 'repeat', businessName: 'First distinct company' }, { externalId: 'repeat', businessName: 'Second distinct company' }]), source('Customers', [{ externalId: 'duplicate', businessName: name }]), source('Customers', [{ businessName: 'Missing source ID' }]), source('Customers', [{ externalId: 'bad-number', businessName: 'Bad numeric company', creditLimit: 'not a number' }]), source('Customers', [{ externalId: 'bad-email', businessName: 'Bad email company', email: 'bad' }]), source('Customer contacts', [{ externalId: 'missing-parent', customerId: 'missing', firstName: 'A', lastName: 'B', email: 'a@b.test' }]), source('Customer contacts', [{ externalId: 'invalid-boolean', customerId: state('customers').customers[0].id, firstName: 'A', lastName: 'B', email: 'a@b.test', isPrimary: 'yes' }])])
        expect(review(s).valid).toBe(false);
    expect(() => review({ ...source(), actorId: 'forged' })).toThrow();
    expect(() => review({ ...source(), mapping: { currentBalance: 0 } })).toThrow(/unsupported/);
});
it('round-trips multiline Unicode and formula-looking/literal apostrophe text without altering it', () => {
    const values = [{ externalId: 'unicode-1', businessName: '客户, Flooring', tradingName: 'Quoted "trade"', phone: '+64 21 123 456', website: '=SUM(1,2)' }, { externalId: 'unicode-2', businessName: "'Literal company", tradingName: 'Line one\nLine two', phone: '-021 555 999', website: "'=literal" }];
    const run = commit(source('Customers', values));
    const out = exported('Customers');
    expect(out.csv).toContain("'+64");
    const rows = parseCsv(out.csv), idIndex = rows[0].indexOf('id'), selected = rows.slice(1).filter(r => run.results.some((result: any) => result.recordId === r[idIndex]));
    const s = { dataset: 'Customers', mode: 'Update by ID', fileName: 'roundtrip.csv', text: csv([rows[0], ...selected]) };
    expect(review(s).valid).toBe(true);
    commit(s);
    for (const v of values) {
        const c = state('customers').customers.find((c: any) => c.businessName === v.businessName);
        expect(c.tradingName).toBe(v.tradingName);
        expect(c.phone).toBe(v.phone);
        expect(c.website).toBe(v.website);
    }
});
it('retains every product selling unit and IDs during an exported catalogue update', () => { const product = state('products').products.find((p: any) => p.units.length > 1), unitIds = product.units.map((u: any) => u.id), s = updateSource('Products', product.id, { name: 'Renamed imported catalogue item' }); expect(review(s).valid).toBe(true); commit(s); const changed = state('products').products.find((p: any) => p.id === product.id); expect(changed.units.map((u: any) => u.id)).toEqual(unitIds); expect(changed.baseUnitId).toBe(product.baseUnitId); expect(changed.name).toBe('Renamed imported catalogue item'); });
it('imports sales-only service units and rejects incompatible product structures through the existing repository', () => { const units = JSON.stringify([{ code: 'JOB', name: 'Installation job', symbol: 'job', conversionToBase: 1, basePrice: 100, isBaseUnit: true, active: true }]); const good = source('Products', [{ externalId: 'service-1', sku: 'IMPORT-SERVICE', name: 'Imported installation', itemType: 'SERVICE', buyEnabled: 'false', baseUnitCode: 'JOB', wholePacks: 'false', unitsJson: units }]); expect(review(good).valid).toBe(true); const run = commit(good), p = state('products').products.find((p: any) => p.id === run.results[0].recordId); expect(p.itemType).toBe('SERVICE'); expect(state('costingPolicies').policies.find((c: any) => c.productId === p.id).active).toBe(false); expect(review(source('Products', [{ externalId: 'bad-stock', sku: 'BAD-STOCK', name: 'Invalid stock job unit', baseUnitCode: 'JOB', unitsJson: units }])).valid).toBe(false); });
it('rejects stale or protected product units without modifying posted source references', () => { const p = state('products').products[0], s = updateSource('Products', p.id, { taxCode: 'MISSING' }); expect(review(s).valid).toBe(false); expect(state('products').products[0]).toEqual(p); });
it('switches primary contacts within one validated batch and audits parent side effects', () => { const customer = state('customers').customers[0], created = commit(source('Customer contacts', [{ externalId: 'primary-1', customerId: customer.id, firstName: 'Transfer', lastName: 'First', email: 'primary.first@example.test', isPrimary: 'true' }, { externalId: 'primary-2', customerId: customer.id, firstName: 'Transfer', lastName: 'Second', email: 'primary.second@example.test', isPrimary: 'false' }])); const out = exported('Customer contacts'), rows = parseCsv(out.csv), index = rows[0].indexOf('id'), primary = rows[0].indexOf('isPrimary'), first = rows.slice(1).find(r => r[index] === created.results[0].recordId)!, second = rows.slice(1).find(r => r[index] === created.results[1].recordId)!; first[primary] = 'false'; second[primary] = 'true'; const s = { dataset: 'Customer contacts', mode: 'Update by ID', fileName: 'primary.csv', text: csv([rows[0], second, first]) }; expect(review(s).valid).toBe(true); const run = commit(s), c = state('customers').customers.find((c: any) => c.id === customer.id); expect(c.primaryContactId).toBe(created.results[1].recordId); expect(c.contacts.filter((c: any) => c.isPrimary)).toHaveLength(1); expect(run.parentChanges).toHaveLength(1); expect(JSON.parse(run.parentChanges[0].before).primaryContactId).toBe(created.results[0].recordId); expect(JSON.parse(run.parentChanges[0].after).primaryContactId).toBe(created.results[1].recordId); expect(run.results.find((r: any) => r.recordId === created.results[0].recordId).before.isPrimary).toBe('true'); });
it('rolls back an entire two-row commit and receipt when a downstream write fails mid-batch', async () => {
    const s = source('Customers', [{ externalId: 'atomic-1', businessName: 'Atomic first' }, { externalId: 'atomic-2', businessName: 'Atomic second' }]), p = review(s), before = readFileSync(join(root, 'business.json'), 'utf8'), { customerRepository } = await import('../contacts/data/customerRepository'), original = customerRepository.create;
    let calls = 0;
    const fail = vi.spyOn(customerRepository, 'create').mockImplementation(values => {
        const c = original(values);
        if (++calls === 4)
            throw new Error('Synthetic second import failure');
        return c;
    });
    const request = { ...s, expectedPreview: p.fingerprint, operationId: 'atomic-batch', reason: 'Atomic verification' };
    expect(() => cmd('dataTransfers', 'commit', request)).toThrow(/Synthetic/);
    expect(state('dataTransfers').runs).toEqual([]);
    expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before);
    fail.mockRestore();
    expect(cmd('dataTransfers', 'commit', request).results).toHaveLength(2);
});
// Six real password-hashed role accounts can exceed the default timeout under full-suite contention.
it('enforces dataset read/write authorities and scopes history to permitted datasets', async () => { commit(source()); commit(source('Suppliers', [{ externalId: 'private-supplier', businessName: 'Private imported supplier', country: 'NZ' }])); await role('SALES'); expect(exported('Customers').csv).toContain('Transfer acceptance company'); expect(() => exported('Suppliers')).toThrow(/Permission denied/); expect(() => review(source('Products', [{ externalId: 'role-product', sku: 'ROLE-P', name: 'No product writes' }]))).toThrow(/Permission denied/); expect(state('dataTransfers').runs.every((r: any) => r.dataset === 'Customers')).toBe(true); expect(JSON.stringify(state('dataTransfers'))).not.toContain('Private imported supplier'); await role('PURCHASING'); expect(() => exported('Customers')).toThrow(/Permission denied/); expect(commit(source('Suppliers', [{ externalId: 'purchasing-create', businessName: 'Purchasing supplier', country: 'NZ' }])).results).toHaveLength(1); await role('WAREHOUSE'); expect(() => exported('Customers')).toThrow(/Permission denied/); expect(() => review(source('Suppliers', [{ externalId: 'warehouse-denied', businessName: 'Denied supplier', country: 'NZ' }]))).toThrow(/Permission denied/); expect(commit(source('Products', [{ externalId: 'warehouse-product', sku: 'WH-IMPORT', name: 'Warehouse imported product' }])).results).toHaveLength(1); await role('AUDITOR'); expect(exported('Customers').count).toBeGreaterThan(0); expect(() => review(source())).toThrow(/Permission denied/); await role('ACCOUNTANT'); expect(() => review(source())).toThrow(/Permission denied/); await role('FINANCE_ADMIN'); expect(commit(source('Customers', [{ externalId: 'finance-create', businessName: 'Finance imported customer' }])).results).toHaveLength(1); }, 30000);
it('migrates schema 14 and restores import identities and audit with normal business backups', async () => { const legacy = host.exportBackup() as any; legacy.schemaVersion = 14; delete legacy.repositories.dataTransfers; delete legacy.checksum; legacy.checksum = createHash('sha256').update(JSON.stringify(legacy)).digest('hex'); writeFileSync(join(root, 'business.json'), JSON.stringify(legacy)); await restart(); expect(host.exportBackup().schemaVersion).toBe(31); expect(state('dataTransfers')).toEqual({ runs: [] }); expect(state('attachments')).toEqual({ documents: [], history: [] }); const s = source(), first = commit(s), backup = host.exportBackup(), prepared = host.prepareRestore(JSON.stringify(backup)); await host.restoreBackup(prepared.token); await restart(); expect(state('dataTransfers').runs[0]).toEqual(first); expect(commit(s).results[0].action).toBe('Skipped'); });
it('rejects malformed import audit references and source identities on backup restore', () => {
    commit(source());
    const backup = host.exportBackup();
    for (const corrupt of [(r: any) => r.results[0].recordId = 'missing', (r: any) => r.results[0].after.id = 'missing', (r: any) => r.results[0].action = 'Updated', (r: any) => r.results[0].after.currentBalance = '999', (r: any) => r.results[0].externalId = '', (r: any) => r.results[0].after.recordToken = 'bad']) {
        const data = structuredClone(backup) as any;
        corrupt(data.repositories.dataTransfers.runs[0]);
        delete data.checksum;
        data.checksum = createHash('sha256').update(JSON.stringify(data)).digest('hex');
        expect(() => host.prepareRestore(JSON.stringify(data))).toThrow();
    }
});
it('keeps stock, GL, tax, bank and settlement balances unchanged by master imports', () => {
    const before = structuredClone(host.view().repositories);
    commit(source());
    commit(source('Suppliers', [{ externalId: 'no-ledger', businessName: 'No posting supplier', country: 'NZ' }]));
    for (const key of ['journals', 'stock', 'costBalances', 'supplierBills', 'bankTransactions', 'customerSettlements', 'workspace_tax_codes'])
        expect(state(key)).toEqual(before[key]);
});
it('rejects changing a unit conversion referenced by an actual quote', () => { const p = state('products').products.find((p: any) => p.units.length > 1), unit = p.units.find((u: any) => !u.isBaseUnit); cmd('sales', 'createQuote', { customerId: state('customers').customers[0].id, documentDate: '2026-10-10', lines: [{ productId: p.id, unitId: unit.id, quantity: 2, unitPrice: 100 }] }); const units = p.units.map(({ id: _id, ...u }: any) => u); units.find((u: any) => u.code === unit.code).conversionToBase += 1; const s = updateSource('Products', p.id, { unitsJson: JSON.stringify(units) }), preview = review(s); expect(preview.valid).toBe(false); expect(preview.rows[0].errors.join()).toContain('referenced unit'); expect(state('products').products.find((x: any) => x.id === p.id)).toEqual(p); });
it('rejects reparenting and foreign customer branches and enforces the UTF-8 byte limit', () => { const original = state('customers').customers[0], other = commit(source('Customers', [{ externalId: 'second-parent', businessName: 'Second import parent' }])).results[0].recordId, branch = commit(source('Customer branches', [{ externalId: 'parent-branch', customerId: original.id, name: 'Transfer parent branch', addressLine1: '19 Parent Street', suburb: 'Auckland', state: 'Auckland', postcode: '1010', country: 'NZ' }])).results[0]; expect(review(updateSource('Customer branches', branch.recordId, { customerId: other })).valid).toBe(false); expect(review(source('Customer contacts', [{ externalId: 'foreign-contact', customerId: other, firstName: 'Foreign', lastName: 'Branch', email: 'foreign.branch@example.test', locationId: branch.recordId }])).valid).toBe(false); expect(() => review({ ...source(), text: 'externalId,businessName\none,' + '客户'.repeat(200000) })).toThrow(/1 MB/); });
it('permits unrelated updates to existing approved duplicates while blocking new duplicate identities', () => { const values = { businessName: 'Known shared customer', tradingName: '', abn: '', businessType: 'Other', status: 'ACTIVE', email: 'known.shared@example.test', phone: '021777888', website: '', creditLimit: 0, paymentTermsDays: 30 }, first = cmd('customers', 'create', values); cmd('customers', 'create', values); const s = updateSource('Customers', first.id, { creditLimit: '500' }); expect(review(s).valid).toBe(true); commit(s); const other = cmd('customers', 'create', { ...values, businessName: 'Different known customer', email: 'new.conflict@example.test', phone: '021333444' }); expect(review(updateSource('Customers', first.id, { email: other.email })).valid).toBe(false); });
it('preserves repeated selling-unit codes by exported IDs and supports an explicitly new blank unit ID', () => { const p = state('products').products.find((p: any) => p.units.length > 1), unit = p.units.find((u: any) => !u.isBaseUnit), extra = { ...unit, id: crypto.randomUUID(), name: 'Alternative package', basePrice: 333 }; cmd('products', 'save', { ...p, units: [...p.units, extra] }, p.revision ?? 0); const updated = commit(updateSource('Products', p.id, { name: 'Repeated-code catalogue' })), product = state('products').products.find((x: any) => x.id === p.id); expect(product.units.map((u: any) => u.id)).toEqual([...p.units.map((u: any) => u.id), extra.id]); expect(updated.results[0].after.unitsJson).toContain(extra.id); const units = [...product.units, { ...extra, id: '', name: 'Third package', basePrice: 444 }], next = updateSource('Products', p.id, { unitsJson: JSON.stringify(units) }); expect(review(next).valid).toBe(true); commit(next); const saved = state('products').products.find((x: any) => x.id === p.id); expect(saved.units).toHaveLength(units.length); expect(saved.units.at(-1).id).not.toBe(''); });
it('distinguishes an omitted default from a mapped blank on repeated source IDs', () => {
    commit(source('Suppliers', [{ externalId: 'default-presence', businessName: 'Default presence supplier', country: 'NZ' }]));
    const p = review(source('Suppliers', [{ externalId: 'default-presence', businessName: 'Default presence supplier', country: 'NZ', paymentTermsDays: '' }]));
    expect(p.valid).toBe(false);
    expect(p.rows[0].errors.join()).toContain('Source externalId');
});
it('preserves absent product overrides on partial updates and clears a mapped tax override', () => {
    const run = commit(source('Products', [{ externalId: 'optional-product', sku: 'OPTIONAL-IMPORT', name: 'Optional import', taxCode: '' }]));
    const id = run.results[0].recordId;
    let p = state('products').products.find((p: any) => p.id === id);
    expect(p.taxCode).toBeUndefined();
    const row = parseCsv(exported('Products').csv), current = row.slice(1).find(r => r[row[0].indexOf('id')] === id)!;
    commit(source('Products', [{ id, recordToken: current[row[0].indexOf('recordToken')], name: 'Partial product change' }], 'Update by ID'));
    p = state('products').products.find((p: any) => p.id === id);
    expect(p.taxCode).toBeUndefined();
    expect(p.name).toBe('Partial product change');
    commit(updateSource('Products', id, { taxCode: 'GST' }));
    expect(state('products').products.find((p: any) => p.id === id).taxCode).toBe('GST');
    commit(updateSource('Products', id, { taxCode: '' }));
    expect(state('products').products.find((p: any) => p.id === id).taxCode).toBeUndefined();
});
