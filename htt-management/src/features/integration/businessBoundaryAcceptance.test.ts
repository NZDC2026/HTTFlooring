import { describe, expect, it } from 'vitest';
import { inspectBusinessBoundaries, type BusinessBoundaryInput } from './businessBoundaryAcceptance';
import type { Account } from '../accounting/types/account';

const account = (role: NonNullable<Account['systemRole']>, type: Account['type']): Account => ({
  id: role, code: role, name: role, systemRole: role, type, active: true,
  allowManualPosting: false, createdAt: '', updatedAt: '',
});
const baseline = (): BusinessBoundaryInput => ({
  sales: { quotes: [], salesOrders: [], invoices: [], payments: [], creditNotes: [], allocations: [], journals: [] },
  operations: [], banking: { transactions: [], transfers: [] },
  purchases: { asOfDate: '2026-10-14', accounts: [account('INVENTORY', 'ASSET'), account('GRNI', 'LIABILITY'), account('PURCHASE_PRICE_VARIANCE', 'EXPENSE')], journalEntries: [], costMovements: [], receipts: [], matches: [] },
});
describe('8A cross-module financial boundary acceptance', () => {
  it('accepts an empty reconciled baseline', () => {
    const report = inspectBusinessBoundaries(baseline());
    expect(report.safeForFinancialWrites).toBe(true);
    expect(report.findings).toEqual([]);
    expect(report.checkedAreas).toHaveLength(4);
  });
  it('blocks missing purchase control accounts rather than silently passing', () => {
    const input = baseline(); input.purchases.accounts = [];
    const report = inspectBusinessBoundaries(input);
    expect(report.safeForFinancialWrites).toBe(false);
    expect(report.findings).toContainEqual(expect.objectContaining({ area: 'PURCHASES_INVENTORY_GL', code: 'AUDIT_UNAVAILABLE' }));
  });
  it('blocks invalid control account types', () => {
    const input = baseline(); input.purchases.accounts[0].type = 'REVENUE';
    expect(inspectBusinessBoundaries(input).findings.some(f => f.area === 'PURCHASES_INVENTORY_GL')).toBe(true);
  });
  it('blocks unresolved sales financial operations after restart', () => {
    const input = baseline();
    input.operations = [{ operationId: 'op-1', kind: 'SALES_INVOICE_VOID', state: 'PENDING' } as BusinessBoundaryInput['operations'][number]];
    const report = inspectBusinessBoundaries(input);
    expect(report.safeForFinancialWrites).toBe(false);
    expect(report.findings).toContainEqual(expect.objectContaining({ area: 'RECOVERY', code: 'SALES_OPERATION_RESULT_UNVERIFIED' }));
  });
  it('blocks duplicate operation identifiers', () => {
    const input = baseline();
    const op = { operationId: 'dup', kind: 'CUSTOMER_PAYMENT', state: 'COMPLETED' } as BusinessBoundaryInput['operations'][number];
    input.operations = [op, op];
    expect(inspectBusinessBoundaries(input).findings).toContainEqual(expect.objectContaining({ code: 'SALES_OPERATION_DUPLICATE_ID' }));
  });
  it('fails closed on malformed Sales data', () => {
    const input = baseline();
    input.sales.invoices = [undefined] as unknown as BusinessBoundaryInput['sales']['invoices'];
    const report = inspectBusinessBoundaries(input);
    expect(report.safeForFinancialWrites).toBe(false);
    expect(report.findings.some(f => f.code === 'AUDIT_UNAVAILABLE')).toBe(true);
  });
  it('does not mutate the supplied repositories or operation journal', () => {
    const input = baseline(); const before = JSON.stringify(input);
    inspectBusinessBoundaries(input);
    expect(JSON.stringify(input)).toBe(before);
  });
});
