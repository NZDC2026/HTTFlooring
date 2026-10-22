import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
let root: string, security: InstanceType<typeof import('../../../electron/security/localSecurity').LocalSecurity>, host: InstanceType<typeof import('../../../electron/security/businessHost').BusinessHost>;
const admin = { username: 'documents.admin', displayName: 'Document acceptance', password: 'Documents-test-password-4821' };
async function restart() { vi.resetModules(); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.login(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); }
beforeEach(async () => { vi.resetModules(); vi.stubGlobal('__HTT_MAIN_HOST__', true); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined); root = mkdtempSync(join(tmpdir(), 'htt-direct-docs-')); const { LocalSecurity } = await import('../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.setup(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); rmSync(root, { recursive: true, force: true }); });
const cmd = (repository: string, method: string, ...args: unknown[]) => host.command({ repository, method, args }).result as any;
const state = (key: string) => host.view().repositories[key] as any;
const date = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Pacific/Auckland' });
async function role(name: 'SALES' | 'WAREHOUSE' | 'PURCHASING' | 'ACCOUNTANT' | 'FINANCE_ADMIN' | 'AUDITOR') { security.login(admin); const user = security.createUser({ username: 'documents.' + name.toLowerCase(), displayName: name, password: admin.password, roles: [name] }); security.login({ username: user.username, password: admin.password }); }
function stockBill(options: {
    quantity?: number;
    cost?: number;
    billCost?: number;
    unitCode?: string;
    receiptDate?: string;
    billDate?: string;
} = {}) {
    const product = state('products').products[0];
    if (options.unitCode)
        cmd('products', 'save', { ...product, wholePacks: true }, product.revision ?? 0);
    const unit = options.unitCode ? product.units.find((u: any) => u.code === options.unitCode) : product.units.find((u: any) => u.id === product.baseUnitId), siteId = 'site_001', quantity = options.quantity ?? 10;
    const po = cmd('purchaseOrders', 'create', { supplierId: state('suppliers').suppliers[0].id, orderDate: '2026-10-01', lines: [{ productId: product.id, unitId: unit.id, orderedQuantity: quantity, unitCost: options.cost ?? 10, priceBasis: 'Exclusive' }] });
    cmd('purchaseOrders', 'approve', po.id);
    cmd('purchaseOrders', 'send', po.id);
    const receipt = cmd('goodsReceipts', 'create', { purchaseOrderId: po.id, siteId, receiptDate: options.receiptDate ?? '2026-10-02', lines: [{ purchaseOrderLineId: po.lines[0].id, receivedQuantity: quantity }] });
    const bill = cmd('supplierBills', 'create', { purchaseOrderId: po.id, supplierInvoiceNumber: 'RETURN-BILL-' + crypto.randomUUID(), billDate: options.billDate ?? options.receiptDate ?? '2026-10-03', dueDate: '2026-11-10', lines: [{ purchaseOrderLineId: po.lines[0].id, quantity, unitCost: options.billCost ?? options.cost ?? 10 }] });
    const match = state('receiptMatches').matches.find((m: any) => m.supplierBillId === bill.id);
    return { product, unit, siteId, po, receipt, bill, match };
}
function request(f: ReturnType<typeof stockBill>, quantity = 2) { return { operationId: crypto.randomUUID(), supplierBillId: f.bill.id, supplierCreditNumber: 'RETURN-CREDIT-' + crypto.randomUUID(), returnDate: '2026-10-10', reason: 'Confirmed damaged goods return', lines: [{ matchId: f.match.id, quantity }] }; }
function create(f: ReturnType<typeof stockBill>, quantity = 2) { return cmd('physicalSupplierReturns', 'create', request(f, quantity)); }
function reverse(row: any, voidDate = '2026-10-11') { return cmd('physicalSupplierReturns', 'reverse', { returnId: row.id, voidDate, reason: 'Supplier return correction' }); }
function costBalance(f: ReturnType<typeof stockBill>) { return state('costBalances').balances.find((b: any) => b.siteId === f.siteId && b.productId === f.product.id); }
it('posts linked physical return and original-price credit with stock/cost and variance journals', () => {
    const f = stockBill({ billCost: 12 }), r = create(f), credit = state('supplierCredits').supplierCredits.find((c: any) => c.id === r.supplierCreditId);
    expect(r).toMatchObject({ status: 'POSTED', inventoryValue: 20, supplierBillId: f.bill.id, createdBy: security.principal()!.userId });
    expect(credit).toMatchObject({ physicalReturnId: r.id, totals: { subtotal: 24, taxAmount: 2.4, total: 26.4 } });
    expect(costBalance(f)).toMatchObject({ quantityOnHand: 8, inventoryValue: 80 });
    expect(state('stock').balances.find((b: any) => b.productId === f.product.id).quantityOnHand).toBe(8);
    expect(state('journals').journalEntries.find((j: any) => j.id === r.journalId)).toMatchObject({ sourceType: 'SUPPLIER_RETURN', totalDebit: 20, totalCredit: 20 });
    expect(state('receiptMatches').matches.find((m: any) => m.id === f.match.id).status).toBe('ACTIVE');
});
it('restores exact historical cost and dated credit reversal after restart, once', async () => {
    const f = stockBill(), r = create(f);
    await restart();
    const reversed = reverse(r);
    expect(reversed.status).toBe('VOID');
    expect(reverse(r).id).toBe(r.id);
    expect(costBalance(f)).toMatchObject({ quantityOnHand: 10, inventoryValue: 100 });
    expect(state('supplierCredits').supplierCredits.find((c: any) => c.id === r.supplierCreditId)).toMatchObject({ status: 'VOID', voidedAt: '2026-10-11' });
    await restart();
    expect(state('physicalSupplierReturns').returns[0].status).toBe('VOID');
});
it('retries a return operation without moving stock twice and rejects changed request data', () => {
    const f = stockBill(), input = request(f), r = cmd('physicalSupplierReturns', 'create', input);
    expect(cmd('physicalSupplierReturns', 'create', input).id).toBe(r.id);
    expect(() => cmd('physicalSupplierReturns', 'create', { ...input, reason: 'Different reason' })).toThrow(/different/);
    expect(costBalance(f).quantityOnHand).toBe(8);
});
it('blocks direct credit void and internal return helpers exposed as IPC commands', () => {
    const f = stockBill(), r = create(f);
    expect(() => cmd('supplierCredits', 'voidCredit', { supplierCreditId: r.supplierCreditId, reason: 'Bypass stock restore' })).toThrow(/linked physical/);
    expect(() => cmd('supplierCredits', 'voidReturnCredit', { supplierCreditId: r.supplierCreditId, reason: 'Bypass', voidDate: date() })).toThrow(/internal/);
    expect(() => cmd('supplierCredits', 'createReturnCredit', {}, 'fake')).toThrow(/internal/);
    expect(costBalance(f).quantityOnHand).toBe(8);
});
it('caps cumulative return quantities by the matched receipt and rejects duplicate lines', () => {
    const f = stockBill();
    create(f, 6);
    expect(() => create(f, 5)).toThrow(/remainder/);
    const input = request(f, 1);
    expect(() => cmd('physicalSupplierReturns', 'create', { ...input, lines: [...input.lines, ...input.lines] })).toThrow(/once/);
    expect(costBalance(f).quantityOnHand).toBe(4);
});
it('supports whole-pack unit conversion using original receiving site', () => {
    const f = stockBill({ unitCode: 'BOX' }), r = create(f, 2);
    expect(r.lines[0].quantityBase).toBe(4.332);
    expect(costBalance(f).quantityOnHand).toBeCloseTo(8 * 2.166);
    expect(() => create(f, 0.5)).toThrow(/Whole packs/);
});
it('values returns at moving average and restores the exact issued value after later receipts', () => {
    const f = stockBill({ cost: 10, billCost: 12 });
    stockBill({ cost: 30, billCost: 30 });
    const r = create(f);
    expect(r.inventoryValue).toBe(40);
    expect(costBalance(f)).toMatchObject({ quantityOnHand: 18, inventoryValue: 360 });
    stockBill({ cost: 50, receiptDate: '2026-10-12' });
    expect(() => reverse(r)).toThrow(/later inventory/);
    reverse(r, '2026-10-13');
    expect(costBalance(f)).toMatchObject({ quantityOnHand: 30, inventoryValue: 900 });
});
it('rejects insufficient stock atomically after other shipments', () => {
    const f = stockBill(), customer = state('customers').customers[0], q = cmd('sales', 'createQuote', { customerId: customer.id, documentDate: '2026-10-04', lines: [{ productId: f.product.id, unitId: f.unit.id, quantity: 9, unitPrice: 100 }] });
    cmd('sales', 'sendQuote', q.id);
    cmd('sales', 'acceptQuote', q.id);
    const order = cmd('sales', 'convertQuoteToOrder', q.id);
    cmd('salesDispatch', 'record', { operationId: crypto.randomUUID(), salesOrderId: order.id, siteId: f.siteId, fulfilmentDate: '2026-10-09', lines: [{ salesOrderLineId: order.lines[0].id, fulfilledQuantity: 9 }] });
    const before = readFileSync(join(root, 'business.json'), 'utf8');
    expect(() => create(f, 2)).toThrow(/Insufficient stock/);
    expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before);
    expect(state('physicalSupplierReturns').returns).toEqual([]);
});
it('blocks reversal until allocations and refunds are reversed, then restores both ledgers', () => {
    const f = stockBill(), r = create(f), credit = state('supplierCredits').supplierCredits.find((c: any) => c.id === r.supplierCreditId), allocation = cmd('supplierCredits', 'applyToBill', { supplierCreditId: credit.id, supplierBillId: f.bill.id, allocationDate: '2026-10-10', amount: 10 });
    expect(() => reverse(r, date())).toThrow(/allocations/);
    cmd('supplierCredits', 'reverseAllocation', { allocationId: allocation.id, reversalReason: 'Correct allocation' });
    const refund = cmd('supplierRefunds', 'create', { operationId: 'return-refund', creditId: credit.id, paymentDate: date(), bankAccountId: 'bank_001', amount: credit.totals.total });
    expect(() => reverse(r, date())).toThrow(/refunds/);
    cmd('supplierRefunds', 'reverse', { id: refund.id, reversalDate: date(), reason: 'Correct refund' });
    reverse(r, date());
    expect(costBalance(f).quantityOnHand).toBe(10);
});
it('blocks source bill void while its return credit is active', () => { const f = stockBill(), r = create(f); expect(() => cmd('supplierBills', 'markVoid', f.bill.id, 'Remove returned source')).toThrow(/credit/i); reverse(r); expect(state('supplierCredits').supplierCredits.find((c: any) => c.id === r.supplierCreditId).status).toBe('VOID'); });
it('rejects unreceived, wrong bill matches, expenses and excess credited source line value', () => {
    const f = stockBill(), other = stockBill(), input = request(f);
    expect(() => cmd('physicalSupplierReturns', 'create', { ...input, lines: [{ matchId: other.match.id, quantity: 1 }] })).toThrow(/match/);
    cmd('supplierCredits', 'create', { sourceSupplierBillId: f.bill.id, supplierCreditNumber: 'full-price-only', creditDate: '2026-10-08', reason: 'Price-only full credit', lines: [{ supplierBillLineId: f.bill.lines[0].id, quantity: 10, unitCost: 10 }] });
    expect(() => create(f)).toThrow(/uncredited/);
    expect(costBalance(f).quantityOnHand).toBe(20);
});
it('rejects duplicate supplier credit references and leaves stock intact', () => {
    const f = stockBill(), input = request(f);
    cmd('physicalSupplierReturns', 'create', input);
    expect(() => cmd('physicalSupplierReturns', 'create', { ...input, operationId: crypto.randomUUID() })).toThrow(/already exists/);
    expect(costBalance(f).quantityOnHand).toBe(8);
});
it('uses source tax snapshots and last-credit residual cents for partial returns', () => {
    const f = stockBill({ quantity: 3, cost: 0.05, billCost: 0.05 }), results = [create(f, 1), create(f, 1), create(f, 1)], credits = state('supplierCredits').supplierCredits.filter((c: any) => results.some(r => r.supplierCreditId === c.id));
    expect(credits.reduce((n: number, c: any) => n + c.totals.subtotal, 0)).toBeCloseTo(f.bill.totals.subtotal);
    expect(credits.reduce((n: number, c: any) => n + c.totals.taxAmount, 0)).toBeCloseTo(f.bill.totals.taxAmount);
    expect(costBalance(f).quantityOnHand).toBe(0);
});
it('keeps price-only credits from moving inventory', () => { const f = stockBill(); cmd('supplierCredits', 'create', { sourceSupplierBillId: f.bill.id, supplierCreditNumber: 'price-rebate', creditDate: '2026-10-08', reason: 'Price adjustment only', lines: [{ supplierBillLineId: f.bill.lines[0].id, quantity: 2, unitCost: 1 }] }); expect(costBalance(f)).toMatchObject({ quantityOnHand: 10, inventoryValue: 100 }); expect(state('physicalSupplierReturns').returns).toEqual([]); });
it('rejects invalid dates, quantities, fields and backdated inventory returns', () => {
    const f = stockBill(), input = request(f);
    for (const date of ['2026-02-30', '2026-10-01'])
        expect(() => cmd('physicalSupplierReturns', 'create', { ...input, returnDate: date })).toThrow();
    for (const quantity of [0, -1, NaN, Infinity, 0.00001])
        expect(() => cmd('physicalSupplierReturns', 'create', { ...input, lines: [{ matchId: f.match.id, quantity }] })).toThrow();
    expect(() => cmd('physicalSupplierReturns', 'create', { ...input, inventoryValue: 1 })).toThrow();
    stockBill({ receiptDate: '2026-10-12' });
    expect(() => create(f)).toThrow(/later inventory/);
});
it('rolls back credit, journal, movements and stock when inventory posting fails mid-return', async () => {
    const f = stockBill(), before = readFileSync(join(root, 'business.json'), 'utf8'), { inventoryCostMovementRepository } = await import('../inventory/data/inventoryCostMovementRepository');
    vi.spyOn(inventoryCostMovementRepository, 'replaceAll').mockImplementation(() => { throw new Error('Synthetic return cost failure'); });
    expect(() => create(f)).toThrow(/Synthetic/);
    expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before);
    expect(costBalance(f)).toMatchObject({ quantityOnHand: 10, inventoryValue: 100 });
    expect(state('physicalSupplierReturns').returns).toEqual([]);
});
it('rolls back partial reversal when stock restoration fails', async () => {
    const f = stockBill(), r = create(f), before = readFileSync(join(root, 'business.json'), 'utf8'), { inventoryCostMovementRepository } = await import('../inventory/data/inventoryCostMovementRepository');
    vi.spyOn(inventoryCostMovementRepository, 'replaceAll').mockImplementation(() => { throw new Error('Synthetic return restore failure'); });
    expect(() => reverse(r)).toThrow(/Synthetic/);
    expect(readFileSync(join(root, 'business.json'), 'utf8')).toBe(before);
    expect(state('supplierCredits').supplierCredits.find((c: any) => c.id === r.supplierCreditId).status).toBe('ISSUED');
    expect(costBalance(f).quantityOnHand).toBe(8);
});
it('enforces closed return and reversal periods', async () => {
    const f = stockBill(), r = create(f), period = cmd('accountingPeriods', 'create', { name: 'Closed October', startDate: '2026-10-01', endDate: '2026-10-31', reason: 'Period control check' }), { snapshotRepositories, restoreRepositories } = await import('../security/repositoryHost');
    const s = snapshotRepositories() as any, row = s.accountingPeriods.periods.find((p: any) => p.id === period.id);
    row.status = 'CLOSED';
    row.history.push({ action: 'CLOSE', actor: security.principal()!.userId, reason: 'Synthetic close evidence', at: new Date().toISOString(), checks: { journalCount: 0, debit: 0, credit: 0 } });
    restoreRepositories(s);
    expect(() => create(f)).toThrow(/closed/i);
    expect(() => reverse(r)).toThrow(/closed/i);
    expect(costBalance(f).quantityOnHand).toBe(8);
});
it('allows purchasing return permission but hides physical return cost history from warehouse', async () => {
    const f = stockBill();
    await role('PURCHASING');
    const r = create(f);
    expect(r.createdBy).toBe(security.principal()!.userId);
    await role('WAREHOUSE');
    expect(state('physicalSupplierReturns')).toEqual({ returns: [] });
    expect(() => create(f)).toThrow(/Permission denied/);
    await role('AUDITOR');
    expect(state('physicalSupplierReturns').returns).toHaveLength(1);
    expect(() => reverse(r)).toThrow(/Permission denied/);
});
it('reconciles AP, inventory and financial consistency before and after reversal', async () => {
    const f = stockBill({ billCost: 12 }), r = create(f), { calculateAccountsPayableGlReconciliation } = await import('../accounting/data/accountsPayableGlReconciliationService'), { calculateInventoryGlReconciliation } = await import('../inventory/data/inventoryGlReconciliationService'), { runFinancialConsistencyAudit } = await import('../../lib/persistence/runFinancialConsistencyAudit');
    for (const asOfDate of ['2026-10-09', '2026-10-10', '2026-10-11']) {
        if (asOfDate === '2026-10-11')
            reverse(r);
        const s = host.view().repositories as any, common = { accounts: s.accounts.accounts, journalEntries: s.journals.journalEntries, asOfDate };
        expect(calculateAccountsPayableGlReconciliation({ ...common, suppliers: s.suppliers.suppliers, bills: s.supplierBills.supplierBills, payments: s.supplierPayments.supplierPayments, credits: s.supplierCredits.supplierCredits, creditAllocations: s.supplierCredits.allocations }).difference).toBe(0);
        expect(calculateInventoryGlReconciliation({ ...common, costMovements: s.costMovements.movements }).difference).toBe(0);
        expect(runFinancialConsistencyAudit()).toEqual([]);
    }
});
it('rejects corrupt return backup references and migrates schema 8 preserving existing balances', async () => {
    const f = stockBill(), baseline = host.exportBackup() as any, r = create(f), bad = host.exportBackup() as any;
    bad.repositories.physicalSupplierReturns.returns[0].lines[0].costMovementId = 'unknown';
    delete bad.checksum;
    bad.checksum = createHash('sha256').update(JSON.stringify(bad)).digest('hex');
    expect(() => host.prepareRestore(JSON.stringify(bad))).toThrow(/stock\/cost/);
    reverse(r);
    const b = baseline;
    delete b.repositories.physicalSupplierReturns;
    b.schemaVersion = 8;
    delete b.checksum;
    b.checksum = createHash('sha256').update(JSON.stringify(b)).digest('hex');
    writeFileSync(join(root, 'business.json'), JSON.stringify(b));
    await restart();
    expect(host.exportBackup().schemaVersion).toBe(30);
    expect(state('physicalSupplierReturns').returns).toEqual([]);
    expect(costBalance(f).inventoryValue).toBe(100);
});
it('combines multiple receipt matches and sites into one bill-line credit while restoring each site', () => {
    const product = state('products').products[0], supplierId = state('suppliers').suppliers[0].id, po = cmd('purchaseOrders', 'create', { supplierId, orderDate: '2026-10-01', lines: [{ productId: product.id, unitId: product.baseUnitId, orderedQuantity: 5, unitCost: 10 }] });
    cmd('purchaseOrders', 'approve', po.id);
    cmd('purchaseOrders', 'send', po.id);
    for (const [siteId, receivedQuantity] of [['site_001', 2], ['site_002', 3]] as const)
        cmd('goodsReceipts', 'create', { purchaseOrderId: po.id, siteId, receiptDate: '2026-10-02', lines: [{ purchaseOrderLineId: po.lines[0].id, receivedQuantity }] });
    const bill = cmd('supplierBills', 'create', { purchaseOrderId: po.id, supplierInvoiceNumber: 'MULTI-SITE', billDate: '2026-10-03', dueDate: '2026-11-01', lines: [{ purchaseOrderLineId: po.lines[0].id, quantity: 5, unitCost: 12 }] }), matches = state('receiptMatches').matches.filter((m: any) => m.supplierBillId === bill.id), r = cmd('physicalSupplierReturns', 'create', { operationId: 'multi-site', supplierBillId: bill.id, supplierCreditNumber: 'MULTI-RETURN', returnDate: '2026-10-10', reason: 'Return one from each location', lines: matches.map((m: any) => ({ matchId: m.id, quantity: 1 })) });
    expect(r.lines).toHaveLength(2);
    expect(state('supplierCredits').supplierCredits.find((c: any) => c.id === r.supplierCreditId).lines).toHaveLength(1);
    expect(state('stock').balances.find((b: any) => b.siteId === 'site_001').quantityOnHand).toBe(1);
    expect(state('stock').balances.find((b: any) => b.siteId === 'site_002').quantityOnHand).toBe(2);
    reverse(r);
    expect(state('stock').balances.find((b: any) => b.siteId === 'site_002').quantityOnHand).toBe(3);
});
it('returns rounded-zero stock value without a zero-value inventory journal', async () => { const f = stockBill({ cost: 0.001, billCost: 10 }), r = create(f); expect(r.inventoryValue).toBe(0); expect(r.journalId).toBeUndefined(); expect(costBalance(f).quantityOnHand).toBe(8); await restart(); reverse(r); expect(costBalance(f)).toMatchObject({ quantityOnHand: 10, inventoryValue: 0.01 }); });
it('rejects a financial expense bill as a physical stock return', () => { const supplierId = state('suppliers').suppliers[0].id, account = state('accounts').accounts.find((a: any) => a.systemRole === 'OPERATING_EXPENSE'), draft = cmd('expenseBillDrafts', 'save', { operationId: 'expense', payload: { kind: 'EXPENSE', supplierId, supplierInvoiceNumber: 'EXP-RETURN', documentDate: '2026-10-03', dueDate: '2026-11-01', lines: [{ description: 'Service', accountId: account.id, quantity: 1, unitCost: 10, taxCode: 'GST', priceBasis: 'Exclusive' }] } }), approved = cmd('expenseBillDrafts', 'approve', draft.id, draft.revision), posted = cmd('expenseBillDrafts', 'post', draft.id, approved.revision); expect(() => cmd('physicalSupplierReturns', 'create', { operationId: 'expense-return', supplierBillId: posted.documentId, supplierCreditNumber: 'EXP-CR', returnDate: '2026-10-10', reason: 'Not stock', lines: [{ matchId: 'fake', quantity: 1 }] })).toThrow(/stock bill/); });
it('rejects orphan physical-credit and forged linked credit quantities in backups', () => {
    const f = stockBill(), r = create(f);
    for (const kind of ['orphan', 'quantity']) {
        const b = host.exportBackup() as any;
        if (kind === 'orphan')
            b.repositories.physicalSupplierReturns.returns = [];
        else
            b.repositories.supplierCredits.supplierCredits.find((c: any) => c.id === r.supplierCreditId).lines[0].quantity = 1;
        delete b.checksum;
        b.checksum = createHash('sha256').update(JSON.stringify(b)).digest('hex');
        expect(() => host.prepareRestore(JSON.stringify(b))).toThrow(/reference|quantity/);
    }
});
