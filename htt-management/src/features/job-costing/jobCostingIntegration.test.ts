import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
let root: string, security: InstanceType<typeof import('../../../electron/security/localSecurity').LocalSecurity>, host: InstanceType<typeof import('../../../electron/security/businessHost').BusinessHost>;
const admin = { username: 'documents.admin', displayName: 'Document acceptance', password: 'Documents-test-password-4821' };
async function restart() { vi.resetModules(); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.login(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); }
beforeEach(async () => { vi.resetModules(); vi.stubGlobal('__HTT_MAIN_HOST__', true); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined); root = mkdtempSync(join(tmpdir(), 'htt-job-costing-')); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.setup(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); rmSync(root, { recursive: true, force: true }); });
const cmd = (repository: string, method: string, ...args: unknown[]) => host.command({ repository, method, args }).result as any;
const state = (key: string) => host.view().repositories[key] as any;
async function role(name: 'SALES' | 'WAREHOUSE' | 'PURCHASING' | 'ACCOUNTANT' | 'FINANCE_ADMIN' | 'AUDITOR') { security.login(admin); const user = security.createUser({ username: 'documents.' + name.toLowerCase(), displayName: name, password: admin.password, roles: [name] }); security.login({ username: user.username, password: admin.password }); }
function job(name = 'Project acceptance', patch = {}) { return cmd('workspace_jobs', 'save', { name, code: name.replaceAll(' ', '-'), customerId: state('customers').customers[0].id, owner: 'Acceptance', starts: '2026-10-01', ends: '2026-12-31', budget: '1000', costBudget: '600', status: 'Active', ...patch }); }
let accountSequence = 0;
beforeEach(() => { accountSequence = 0; });
function journal(amount = 100, date = '2026-10-10', kind = 'REVENUE') { const a = cmd('accounts', 'create', { code: String(100000 + ++accountSequence), name: 'Project ' + kind, type: kind, allowManualPosting: true, active: true }), b = cmd('accounts', 'create', { code: String(100000 + ++accountSequence), name: 'Project clearing', type: 'ASSET', allowManualPosting: true, active: true }); return cmd('journals', 'post', { journalDate: date, description: 'Project acceptance source', sourceType: 'MANUAL_JOURNAL', lines: [{ accountId: a.id, debit: kind === 'EXPENSE' ? amount : 0, credit: kind === 'REVENUE' ? amount : 0 }, { accountId: b.id, debit: kind === 'REVENUE' ? amount : 0, credit: kind === 'EXPENSE' ? amount : 0 }] }); }
const review = () => cmd('jobCosting', 'review'), report = (from = '2026-10-01', to = '2026-10-31') => cmd('jobCosting', 'report', { from, to });
function request(j: any, splits: any[], patch = {}) { const view = review(), line = view.lines.find((l: any) => l.journalId === j.id), old = view.allocations.find((a: any) => a.journalId === line.journalId && a.lineId === line.lineId); return { operationId: crypto.randomUUID(), journalId: line.journalId, lineId: line.lineId, expectedRevision: old?.revision ?? 0, expectedSource: line.signature, splits, reason: 'Checked source allocation', ...patch }; }
const save = (r: any) => cmd('jobCosting', 'save', r);
let initialRevenue = 0, initialCost = 0, initialLines = 0;
beforeEach(() => { const base = report(); initialRevenue = base.unallocated.revenue; initialCost = base.unallocated.cost; initialLines = review().lines.length; });
it('splits actual revenue and costs across projects, keeps residuals and reconciles to the GL', () => { const a = job('Project A'), b = job('Project B'), revenue = journal(1000), cost = journal(600, '2026-10-11', 'EXPENSE'); save(request(revenue, [{ jobId: a.id, amount: 600 }, { jobId: b.id, amount: 300 }])); save(request(cost, [{ jobId: a.id, amount: 200 }, { jobId: b.id, amount: 350 }])); const r = report(), p = r.projects.find((p: any) => p.id === a.id); expect(p).toMatchObject({ revenue: 600, cost: 200, profit: 400, budgetProfit: 400, revenueVariance: -400, costVariance: 400, profitVariance: 0 }); expect(r.unallocated).toMatchObject({ revenue: initialRevenue + 100, cost: initialCost + 50, profit: initialRevenue - initialCost + 50 }); expect(r.projects.reduce((n: number, p: any) => n + p.revenue, 0) + r.unallocated.revenue).toBe(r.ledger.revenue); expect(r.projects.reduce((n: number, p: any) => n + p.cost, 0) + r.unallocated.cost).toBe(r.ledger.cost); });
it('inherits exact splits on reversal dates and retains original-period actuals', () => { const a = job(), j = journal(100); save(request(j, [{ jobId: a.id, amount: 33.33 }])); cmd('journals', 'reverse', { journalEntryId: j.id, reversalDate: '2026-11-02', reason: 'Correct source transaction' }); expect(report().projects[0].revenue).toBe(33.33); expect(report('2026-11-01', '2026-11-30').projects[0].revenue).toBe(-33.33); expect(report('2026-10-01', '2026-11-30').projects[0].revenue).toBe(0); expect(report('2026-10-01', '2026-11-30').unallocated.revenue).toBe(initialRevenue); const line = review().lines.find((l: any) => l.reversal); expect(() => save({ ...request(j, [{ jobId: a.id, amount: 100 }]), journalId: line.journalId, lineId: line.lineId, expectedSource: line.signature })).toThrow(/original line/); });
it('allows allocation after reversal and updates both sides together without reposting', () => { const a = job(), j = journal(); cmd('journals', 'reverse', { journalEntryId: j.id, reversalDate: '2026-10-12', reason: 'Same period correction' }); const before = structuredClone(state('journals')); save(request(j, [{ jobId: a.id, amount: 50 }])); expect(report().projects[0].revenue).toBe(0); expect(state('journals')).toEqual(before); });
it('reclassifies or clears allocations with reason and preserves before/after history', () => { const a = job('Project A'), b = job('Project B'), j = journal(); save(request(j, [{ jobId: a.id, amount: 100 }])); save(request(j, [{ jobId: b.id, amount: 75 }])); save(request(j, [])); const view = review(); expect(view.allocations[0].revision).toBe(3); expect(view.history[1].before).toEqual([{ jobId: a.id, amount: 100 }]); expect(view.history[1].after).toEqual([{ jobId: b.id, amount: 75 }]); expect(report().unallocated.revenue).toBe(initialRevenue + 100); });
it('persists allocations and retries idempotently across restart and later revisions', async () => { const a = job(), j = journal(), r = request(j, [{ jobId: a.id, amount: 100 }]), first = save(r); await restart(); expect(save(r).id).toBe(first.id); save(request(j, [])); expect(save(r).revision).toBe(2); expect(review().history).toHaveLength(2); expect(() => save({ ...r, reason: 'Different' })).toThrow(/different allocation/); });
it('rejects stale editors and changed source journals before saving', () => { const a = job(), j = journal(), r = request(j, [{ jobId: a.id, amount: 50 }]); save(r); expect(() => save({ ...r, operationId: crypto.randomUUID() })).toThrow(/Allocation changed/); const current = request(j, [{ jobId: a.id, amount: 25 }]); cmd('journals', 'reverse', { journalEntryId: j.id, reversalDate: '2026-10-12', reason: 'Changed source' }); expect(() => save(current)).toThrow(/Source journal changed/); });
it('rejects over-allocation, duplicate projects, unknown references, unsafe values and forged actors', () => {
    const a = job(), j = journal();
    for (const splits of [[{ jobId: a.id, amount: 100.01 }], [{ jobId: a.id, amount: 10 }, { jobId: a.id, amount: 10 }], [{ jobId: 'missing', amount: 10 }], [{ jobId: a.id, amount: 0 }], [{ jobId: a.id, amount: -10 }], [{ jobId: a.id, amount: 0.001 }], [{ jobId: a.id, amount: Infinity }]])
        expect(() => save(request(j, splits))).toThrow();
    expect(() => save({ ...request(j, []), actorId: 'forged' })).toThrow();
    expect(() => save(request(j, [], { reason: '' }))).toThrow();
    expect(review().allocations).toEqual([]);
});
it('does not accept balance-sheet lines as project income or cost', () => { const a = job(), j = journal(), r = request(j, [{ jobId: a.id, amount: 10 }]); expect(() => save({ ...r, lineId: j.lines[1].id })).toThrow(/posted revenue or expense/); expect(review().lines).toHaveLength(initialLines + 1); });
it('blocks new allocations to inactive projects but preserves history and permits removal', () => { const a = job(), j = journal(); save(request(j, [{ jobId: a.id, amount: 50 }])); cmd('workspace_jobs', 'setStatus', a.id, 'Inactive', a.revision); expect(() => save(request(j, [{ jobId: a.id, amount: 60 }]))).toThrow(/active projects/); expect(save(request(j, [{ jobId: a.id, amount: 50 }])).revision).toBe(2); expect(report().projects[0].revenue).toBe(50); expect(save(request(j, [])).splits).toEqual([]); });
it('retains trusted actor audit, refuses readonly writers and redacts unauthorized roles', async () => {
    const a = job(), j = journal(), r = request(j, [{ jobId: a.id, amount: 50 }]);
    await role('AUDITOR');
    expect(report().ledger.revenue).toBe(initialRevenue + 100);
    expect(review().lines).toHaveLength(initialLines + 1);
    expect(() => save(r)).toThrow(/Permission denied/);
    for (const name of ['SALES', 'PURCHASING', 'WAREHOUSE'] as const) {
        await role(name);
        expect(state('jobCosting')).toEqual({ allocations: [], history: [] });
        expect(() => review()).toThrow(/Permission denied/);
        expect(() => report()).toThrow(/Permission denied/);
        expect(() => save(r)).toThrow(/Permission denied/);
    }
    await role('ACCOUNTANT');
    const result = save(r);
    expect(result.updatedBy).toBe(security.principal()?.userId);
    expect(review().history[0].actorId).toBe(result.updatedBy);
    expect(readFileSync(join(root, 'security.json'), 'utf8')).toContain('jobCosting.save');
});
it('leaves GL, tax, AR/AP, inventory and bank records unchanged when allocating', () => {
    const a = job(), j = journal(), before = structuredClone(host.view().repositories);
    save(request(j, [{ jobId: a.id, amount: 100 }]));
    for (const key of ['journals', 'sales', 'supplierBills', 'bankTransactions', 'stock', 'costBalances', 'workspace_tax_codes'])
        expect(state(key)).toEqual(before[key]);
});
it('rejects invalid dates and invalid currency budgets without saving', () => { expect(() => report('2026-02-30')).toThrow(); expect(() => report('2026-11-01', '2026-10-01')).toThrow(); expect(() => job('Bad budget', { budget: '0.001' })).toThrow(/two decimals/); expect(() => job('Unsafe budget', { costBudget: '1e30' })).toThrow(); });
it('validates backup allocation references, history chain, operation identity and over-allocation', async () => {
    const a = job(), j = journal();
    save(request(j, [{ jobId: a.id, amount: 50 }]));
    const { snapshotRepositories, validateRegisteredSnapshots } = await import('../security/repositoryHost'), before = snapshotRepositories();
    expect(() => validateRegisteredSnapshots(before)).not.toThrow();
    for (const mutate of [(d: any) => d.allocations[0].lineId = 'missing', (d: any) => d.allocations[0].splits[0].amount = 1000, (d: any) => d.allocations[0].splits[0].jobId = 'missing', (d: any) => d.history[0].actorId = 'forged', (d: any) => d.history[0].after = [], (d: any) => d.history[0].reason = 'altered', (d: any) => d.allocations[0].revision = 2]) {
        const bad = structuredClone(before);
        mutate(bad.jobCosting);
        expect(() => validateRegisteredSnapshots(bad)).toThrow();
    }
});
it('migrates schema 12 with empty allocations and retains prior business workflows', async () => {
    const before = host.exportBackup() as any;
    before.schemaVersion = 12;
    delete before.repositories.jobCosting;
    delete before.checksum;
    before.checksum = createHash('sha256').update(JSON.stringify(before)).digest('hex');
    writeFileSync(join(root, 'business.json'), JSON.stringify(before));
    await restart();
    expect(host.exportBackup().schemaVersion).toBe(31);
    expect(state('jobCosting')).toEqual({ allocations: [], history: [] });
    for (const key of ['contactReviews', 'salesVisits', 'journals', 'customers'])
        expect(state(key)).toEqual(before.repositories[key]);
});
it('restores project actuals using the normal business backup', async () => { const a = job(), j = journal(); save(request(j, [{ jobId: a.id, amount: 30 }])); const backup = host.exportBackup(); save(request(j, [])); const p = host.prepareRestore(JSON.stringify(backup)); await host.restoreBackup(p.token); await restart(); expect(report().projects[0].revenue).toBe(30); });
it('uses real invoice and expense postings net of tax, with voids inheriting project splits', () => {
    const project = job(), product = state('products').products[0], customer = state('customers').customers[0], expenseAccount = state('accounts').accounts.find((a: any) => a.systemRole === 'OPERATING_EXPENSE').id;
    const draft = cmd('managedSalesDocuments', 'save', { operationId: 'job-invoice', payload: { kind: 'INVOICE', customerId: customer.id, documentDate: '2026-10-10', dueDate: '2026-11-10', lines: [{ productId: product.id, unitId: product.baseUnitId, quantity: 2, unitPrice: 100, priceBasis: 'Exclusive' }] } });
    expect(review().lines).toHaveLength(initialLines);
    const approved = cmd('managedSalesDocuments', 'approve', draft.id, draft.revision), invoice = cmd('managedSalesDocuments', 'post', draft.id, approved.revision);
    const expenseDraft = cmd('expenseBillDrafts', 'save', { operationId: 'job-expense', payload: { kind: 'EXPENSE', supplierId: state('suppliers').suppliers[0].id, supplierInvoiceNumber: 'JOB-COST-1', documentDate: '2026-10-10', dueDate: '2026-11-10', lines: [{ description: 'Installation', accountId: expenseAccount, quantity: 2, unitCost: 55, taxCode: 'GST', priceBasis: 'Inclusive' }] } }), expenseApproved = cmd('expenseBillDrafts', 'approve', expenseDraft.id, expenseDraft.revision), bill = cmd('expenseBillDrafts', 'post', expenseDraft.id, expenseApproved.revision);
    for (const line of review().lines.filter((l: any) => [invoice.documentId, bill.documentId].includes(l.sourceId))) {
        save({ operationId: crypto.randomUUID(), journalId: line.journalId, lineId: line.lineId, expectedRevision: 0, expectedSource: line.signature, splits: [{ jobId: project.id, amount: line.capacity }], reason: 'Allocate posted document' });
    }
    expect(report().projects[0]).toMatchObject({ revenue: 200, cost: 100, profit: 100 });
    cmd('sales', 'voidInvoice', invoice.documentId, 'Correct source invoice');
    cmd('supplierBills', 'markVoid', bill.documentId, 'Correct source bill');
    const all = report('2026-10-01', '2026-12-31');
    expect(all.projects[0]).toMatchObject({ revenue: 0, cost: 0, profit: 0 });
    expect(all.rows.some((r: any) => r.reversal)).toBe(true);
});
it('rolls back allocation and history together after a failed command and allows a clean retry', async () => { const a = job(), j = journal(), r = request(j, [{ jobId: a.id, amount: 50 }]), before = readFileSync(join(root, 'business.json'), 'utf8'), { jobCostingRepository } = await import('./jobCostingRepository'), original = jobCostingRepository.save; const fail = vi.spyOn(jobCostingRepository, 'save').mockImplementation(raw => { original(raw); throw new Error('Synthetic allocation failure'); }); expect(() => save(r)).toThrow(/Synthetic/); expect(state('jobCosting')).toEqual({ allocations: [], history: [] }); expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before); fail.mockRestore(); expect(save(r).revision).toBe(1); });
it('reads legacy fractional budgets at currency precision while enforcing cents for new edits', async () => { const a = job(), { snapshotRepositories, restoreRepositories } = await import('../security/repositoryHost'), data = snapshotRepositories() as any; data.workspace_jobs.records.find((r: any) => r.id === a.id).budget = '100.005'; restoreRepositories(data); expect(report().projects[0].budget).toBe(100.01); });
