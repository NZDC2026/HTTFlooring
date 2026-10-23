import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
let root: string, security: InstanceType<typeof import('../../../electron/security/localSecurity').LocalSecurity>, host: InstanceType<typeof import('../../../electron/security/businessHost').BusinessHost>;
const admin = { username: 'documents.admin', displayName: 'Document acceptance', password: 'Documents-test-password-4821' };
async function restart() { vi.resetModules(); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.login(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); }
beforeEach(async () => { vi.resetModules(); vi.stubGlobal('__HTT_MAIN_HOST__', true); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined); root = mkdtempSync(join(tmpdir(), 'htt-contact-review-')); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.setup(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); rmSync(root, { recursive: true, force: true }); });
const cmd = (repository: string, method: string, ...args: unknown[]) => host.command({ repository, method, args }).result as any;
const state = (key: string) => host.view().repositories[key] as any;
async function role(name: 'SALES' | 'WAREHOUSE' | 'PURCHASING' | 'ACCOUNTANT' | 'FINANCE_ADMIN' | 'AUDITOR') { security.login(admin); const user = security.createUser({ username: 'documents.' + name.toLowerCase(), displayName: name, password: admin.password, roles: [name] }); security.login({ username: user.username, password: admin.password }); }
function input(kind = 'Customer', patch: Record<string, unknown> = {}) { return { operationId: String(crypto.randomUUID()), kind, values: kind === 'Customer' ? { businessName: 'Review acceptance unique customer' } : kind === 'Branch' ? { name: 'Review unique branch', addressLine1: '19 Review Street', suburb: 'Auckland', state: 'Auckland', postcode: '1010', country: 'NZ' } : { firstName: 'Review', lastName: 'Acceptance', email: 'review.acceptance@example.test' }, customerId: kind === 'Customer' ? '' : state('customers').customers[0].id, ...patch }; }
const create = (r = input()) => cmd('contactReviews', 'create', r);
const preview = (d: any) => cmd('contactReviews', 'review', d.id);
function decide(d: any, patch = {}) { const p = preview(d); return cmd('contactReviews', 'decide', { id: d.id, expectedRevision: d.revision, action: 'Approve new', reason: '', expectedMaster: p.masterSignature, ...patch }); }
it.each(['Customer', 'Branch', 'Contact'])('approves a %s into the real master and restores the outcome after restart', async (kind) => { const before = structuredClone(state('journals')), d = create(input(kind)), result = decide(d); expect(result.state).toBe('Approved'); const c = state('customers').customers.find((c: any) => c.id === result.decision.customerId); expect(kind === 'Customer' ? c.id : kind === 'Branch' ? c.locations.at(-1).id : c.contacts.at(-1).id).toBe(result.decision.targetId); expect(state('journals')).toEqual(before); await restart(); expect(state('contactReviews').drafts[0]).toEqual(result); expect(readFileSync(join(root, 'security.json'), 'utf8')).toContain('contactReviews.decide'); });
it('retains incomplete drafts, requires full validation at approval and supports correction', () => { const d = create(input('Contact', { values: { firstName: 'Incomplete' } })); expect(preview(d).validationError).not.toBe(''); expect(() => decide(d)).toThrow(); const edited = cmd('contactReviews', 'update', { id: d.id, expectedRevision: 1, customerId: d.customerId, values: { ...d.values, lastName: 'Corrected', email: 'corrected@example.test' } }); expect(edited.revision).toBe(2); expect(decide(edited).state).toBe('Approved'); expect(() => cmd('contactReviews', 'update', { id: d.id, expectedRevision: 1, customerId: d.customerId, values: d.values })).toThrow(/changed/); });
it.each(['Customer', 'Branch', 'Contact'])('links a %s without overwriting master fields', kind => {
    const c = state('customers').customers[0];
    let targetId = c.id;
    if (kind !== 'Customer') {
        const newRecord = decide(create(input(kind)));
        targetId = newRecord.decision.targetId;
    }
    const d = create(input(kind, { values: {} })), before = structuredClone(state('customers'));
    const result = decide(d, { action: 'Link existing', targetId, reason: 'Confirmed source identity' });
    expect(result.state).toBe('Linked');
    expect(result.decision.targetId).toBe(targetId);
    expect(state('customers')).toEqual(before);
});
it('requires explicit duplicate confirmation and a reason before creating a separate record', () => { const c = state('customers').customers[0], d = create(input('Customer', { values: { businessName: c.businessName.toUpperCase() } })); expect(preview(d).duplicates.some((x: any) => x.id === c.id)).toBe(true); expect(() => decide(d)).toThrow(/duplicates/); expect(() => decide(d, { allowDuplicate: true })).toThrow(/duplicates/); expect(decide(d, { allowDuplicate: true, reason: 'Separate legal entity verified' }).state).toBe('Approved'); });
it('rejects a stale duplicate review after another master change and allows a fresh retry', () => { const d = create(), p = preview(d); decide(create(input('Customer', { values: { businessName: 'Concurrent different customer' } }))); const before = readFileSync(join(root, 'business.json'), 'utf8'); expect(() => cmd('contactReviews', 'decide', { id: d.id, expectedRevision: 1, action: 'Approve new', reason: '', expectedMaster: p.masterSignature })).toThrow(/records changed/); expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before); expect(decide(d).state).toBe('Approved'); });
it('requires valid parent mapping and rejects foreign branch linkage or contact location', () => { const originalParent = state('customers').customers[0].id, other = decide(create()).decision.customerId, branch = decide(create(input('Branch', { customerId: originalParent }))), d = create(input('Branch', { customerId: other })); expect(() => decide(d, { action: 'Link existing', targetId: branch.decision.targetId, reason: 'Wrong parent' })).toThrow(/does not belong/); const contact = create(input('Contact', { customerId: other, values: { firstName: 'Other', lastName: 'Contact', email: 'other@example.test', locationId: branch.decision.targetId } })); expect(() => decide(contact)).toThrow(); const unmapped = create(input('Branch', { customerId: '' })); expect(preview(unmapped).validationError).toContain('parent'); expect(() => decide(unmapped)).toThrow(/parent/); });
it('does not create branches or contacts for inactive parents', () => {
    const c = decide(create(input('Customer', { values: { businessName: 'Inactive review parent', status: 'INACTIVE' } }))).decision.customerId;
    for (const kind of ['Branch', 'Contact'])
        expect(() => decide(create(input(kind, { customerId: c })))).toThrow(/available parent/);
});
it('retries source intake after edits and restart without losing corrections or duplicating records', async () => { const r = input('Customer', { source: 'Sales draft', externalId: 'sale-19' }), d = create(r); cmd('contactReviews', 'update', { id: d.id, expectedRevision: 1, customerId: '', values: { ...d.values, businessName: 'Corrected source name' } }); await restart(); expect(create({ ...r, operationId: 'new-operation' }).values.businessName).toBe('Corrected source name'); expect(() => create({ ...r, values: { businessName: 'Conflicting source' } })).toThrow(/different draft/); expect(state('contactReviews').drafts).toHaveLength(1); });
it('imports all drafts atomically, deduplicates repeated source IDs and rejects conflicting batches', () => { const { operationId: _id, ...r } = input('Customer', { externalId: 'batch-customer', source: 'Sales draft' }); const batch = { operationId: 'batch-one', drafts: [r, { ...r, kind: 'Contact', externalId: 'batch-contact', customerId: state('customers').customers[0].id, values: { firstName: 'Imported' } }] }; expect(cmd('contactReviews', 'importBatch', batch)).toHaveLength(2); expect(cmd('contactReviews', 'importBatch', { ...batch, operationId: 'retry-batch' }).map((d: any) => d.id)).toEqual(state('contactReviews').drafts.map((d: any) => d.id)); const before = readFileSync(join(root, 'business.json'), 'utf8'); expect(() => cmd('contactReviews', 'importBatch', { operationId: 'bad-batch', drafts: [{ ...r, externalId: 'would-create' }, { ...r, values: { businessName: 'Conflicting imported source' } }] })).toThrow(); expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before); expect(() => cmd('contactReviews', 'importBatch', { operationId: 'missing-source', drafts: [{ ...r, externalId: '' }] })).toThrow(/external ID/); });
it('rejects with a reason, reopens with revision control, preserves history and approves the corrected draft', () => { const d = create(); expect(() => decide(d, { action: 'Reject' })).toThrow(/Explain/); decide(d, { action: 'Reject', reason: 'Needs verification' }); expect(() => cmd('contactReviews', 'reopen', { id: d.id, expectedRevision: 1, reason: 'Verified' })).toThrow(/changed/); expect(() => cmd('contactReviews', 'reopen', { id: d.id, expectedRevision: 2, reason: '' })).toThrow(); const reopened = cmd('contactReviews', 'reopen', { id: d.id, expectedRevision: 2, reason: 'Verified identity' }); expect(reopened.decision).toBeUndefined(); const approved = decide(reopened); expect(approved.history.map((h: any) => h.action)).toEqual(['Received', 'Reject', 'Reopened', 'Approve new']); expect(() => cmd('contactReviews', 'reopen', { id: d.id, expectedRevision: 4, reason: 'Again' })).toThrow(/Only rejected/); });
it('retries the same decision without creating a second master but refuses a different outcome', () => { const d = create(), approved = decide(d), count = state('customers').customers.length; expect(decide(d).id).toBe(approved.id); expect(state('customers').customers).toHaveLength(count); expect(() => decide(d, { action: 'Reject', reason: 'Different' })).toThrow(/different decision/); });
it('enforces read and write authority independently in the main process', async () => {
    const r = input(), d = create();
    for (const name of ['AUDITOR', 'ACCOUNTANT'] as const) {
        await role(name);
        expect(preview(d).revision).toBe(1);
        expect(() => create(r)).toThrow(/Permission denied/);
        expect(() => decide(d, { action: 'Reject', reason: 'No' })).toThrow(/Permission denied/);
    }
    for (const name of ['PURCHASING', 'WAREHOUSE'] as const) {
        await role(name);
        expect(state('contactReviews')).toEqual({ drafts: [] });
        expect(() => preview(d)).toThrow(/Permission denied/);
        expect(() => create(r)).toThrow(/Permission denied/);
    }
    for (const name of ['SALES', 'FINANCE_ADMIN'] as const) {
        await role(name);
        expect(create(input('Customer', { values: { businessName: name + ' review' } })).createdBy).toBe(security.principal()?.userId);
    }
});
it.each(['Customer', 'Branch', 'Contact'])('rolls back both %s master creation and review decision after a downstream failure', async (kind) => { const d = create(input(kind)); preview(d); const { customerRepository } = await import('../contacts/data/customerRepository'), method = kind === 'Customer' ? 'create' : kind === 'Branch' ? 'addLocation' : 'addContact', original = customerRepository[method] as (...args: any[]) => any, before = readFileSync(join(root, 'business.json'), 'utf8'); const spy = vi.spyOn(customerRepository, method).mockImplementation(((...args: any[]) => { original(...args); throw new Error('Synthetic review failure'); }) as any); expect(() => decide(d)).toThrow(/Synthetic/); expect(state('contactReviews').drafts[0].state).toBe('Pending'); spy.mockRestore(); expect(decide(d).state).toBe('Approved'); expect(before).toContain('Pending'); });
it('rejects forged provenance, unknown fields and wrong value types before saving', () => {
    for (const patch of [{ actorId: 'forged' }, { state: 'Approved' }, { values: { businessName: 'Test', unknown: 'field' } }, { values: { creditLimit: '100' } }])
        expect(() => create(input('Customer', patch))).toThrow();
    expect(state('contactReviews').drafts).toEqual([]);
});
it('rejects corrupted review state, parent references, provenance, history and decision audit during restore validation', async () => {
    const d = create();
    decide(d);
    const { validateRegisteredSnapshots, snapshotRepositories } = await import('../security/repositoryHost');
    const original = snapshotRepositories();
    expect(() => validateRegisteredSnapshots(original)).not.toThrow();
    for (const corrupt of [(r: any) => r.state = 'Pending', (r: any) => r.source = 'Selected contact', (r: any) => r.history[1].actorId = 'forged', (r: any) => r.decision.targetId = 'missing', (r: any) => delete r.values.businessName, (r: any) => r.history[1].at = '2000-01-01T00:00:00.000Z', (r: any) => r.decision.reason = 'tampered']) {
        const data = structuredClone(original);
        corrupt((data.contactReviews as any).drafts[0]);
        expect(() => validateRegisteredSnapshots(data)).toThrow();
    }
});
it('keeps decision actor trusted and prevents a stale editor from overwriting a reviewer', () => { const d = create(), p = preview(d); expect(() => cmd('contactReviews', 'decide', { id: d.id, expectedRevision: 1, action: 'Approve new', reason: '', expectedMaster: p.masterSignature, actorId: 'forged' })).toThrow(); decide(d); expect(() => cmd('contactReviews', 'update', { id: d.id, expectedRevision: 1, customerId: '', values: d.values })).toThrow(/changed/); expect(state('contactReviews').drafts[0].decision.actorId).toBe(security.principal()?.userId); });
it('migrates schema 11 without losing existing customers, visits, tasks or financial data', async () => {
    const before = host.exportBackup() as any;
    before.schemaVersion = 11;
    delete before.repositories.contactReviews;
    delete before.checksum;
    before.checksum = createHash('sha256').update(JSON.stringify(before)).digest('hex');
    writeFileSync(join(root, 'business.json'), JSON.stringify(before));
    await restart();
    expect(host.exportBackup().schemaVersion).toBe(31);
    expect(state('contactReviews')).toEqual({ drafts: [] });
    for (const key of ['customers', 'salesVisits', 'workspace_tasks', 'journals', 'sales'])
        expect(state(key)).toEqual(before.repositories[key]);
});
it('restores review decisions with the business backup and rejects tampering before commit', async () => { const d = create(); const approved = decide(d), backup = host.exportBackup(), prepared = host.prepareRestore(JSON.stringify(backup)); await host.restoreBackup(prepared.token); await restart(); expect(state('contactReviews').drafts[0]).toEqual(approved); const malformed = structuredClone(backup) as any; malformed.repositories.contactReviews.drafts[0].decision.targetId = 'invalid'; delete malformed.checksum; malformed.checksum = createHash('sha256').update(JSON.stringify(malformed)).digest('hex'); const before = readFileSync(join(root, 'business.json'), 'utf8'); expect(() => host.prepareRestore(JSON.stringify(malformed))).toThrow(); expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before); });
