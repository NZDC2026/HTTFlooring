import { it, expect } from 'vitest';
import { buildActionCentre, filterActions, type ActionSources } from './actionCentreService';
import { roles, type VerifiedPrincipal, type Role } from '../security/rbac';
const p = (role: Role): VerifiedPrincipal => ({ userId: 'u', roles: [role], authenticated: true });
const today = '2026-10-18';
const sources = (): ActionSources => ({ sales: [{ id: 'i', type: 'INVOICE', customerId: 'c', documentNumber: 'INV-1', documentDate: '2026-10-01', dueDate: '2026-10-17', status: 'PARTIALLY_PAID', amountDue: 45 }], customers: [{ id: 'c', businessName: 'Coastal Flooring' }], bills: [{ id: 'b', billNumber: 'BILL-1', supplierName: 'Timber Supplier', supplierInvoiceNumber: 'THEIR-1', billDate: '2026-10-01', dueDate: '2026-10-16', status: 'OPEN', totals: { amountDue: 100 } }], tasks: [{ id: 't', name: 'Follow up showroom', status: 'Open', customerId: 'c', owner: 'u', due: today, priority: 'High', notes: 'Confirm quantities' }] } as unknown as ActionSources);
it('builds current overdue financial work and tasks due today without mutating sources', () => { const s = sources(), before = structuredClone(s), r = buildActionCentre(s, p('ADMIN'), today); expect(r.map(x => x.kind)).toEqual(['Payables', 'Receivables', 'Tasks']); expect(r.map(x => x.daysOverdue)).toEqual([2, 1, 0]); expect(r[1].name).toBe('Coastal Flooring'); expect(r[1].amount).toBe(45); expect(r[0].path).toBe('/purchases/bills/b'); expect(s).toEqual(before); });
it('excludes fully settled, void and draft financial sources even when their due dates are old', () => { for (const status of ['PAID', 'VOID', 'DRAFT']) {
    const s = sources();
    s.sales[0].status = status as any;
    expect(buildActionCentre(s, p('ADMIN'), today).some(x => x.kind === 'Receivables')).toBe(false);
} for (const status of ['PAID', 'VOID']) {
    const s = sources();
    s.bills[0].status = status as any;
    expect(buildActionCentre(s, p('ADMIN'), today).some(x => x.kind === 'Payables')).toBe(false);
} });
it('does not notify amounts below one cent or zero balances and uses remaining partial balances', () => { for (const amount of [0, 0.001]) {
    const s = sources();
    (s.sales[0] as any).amountDue = amount;
    s.bills[0].totals.amountDue = amount;
    expect(buildActionCentre(s, p('ADMIN'), today).map(x => x.kind)).toEqual(['Tasks']);
} const s = sources(); (s.sales[0] as any).amountDue = 12.5; expect(buildActionCentre(s, p('ADMIN'), today).find(x => x.kind === 'Receivables')?.amount).toBe(12.5); });
it('uses strict financial overdue dates, includes overdue tasks and excludes future documents and future tasks', () => { const s = sources(); (s.sales[0] as any).dueDate = today; s.bills[0].dueDate = today; s.tasks[0].due = '2026-10-19'; expect(buildActionCentre(s, p('ADMIN'), today)).toEqual([]); (s.sales[0] as any).documentDate = '2026-10-19'; (s.sales[0] as any).dueDate = '2026-10-17'; s.bills[0].billDate = '2026-10-19'; s.bills[0].dueDate = '2026-10-17'; expect(buildActionCentre(s, p('ADMIN'), today)).toEqual([]); s.tasks[0].due = '2026-10-15'; expect(buildActionCentre(s, p('ADMIN'), today)[0].daysOverdue).toBe(3); });
it('resolves completed and inactive tasks while reopened or legacy active tasks remain actionable', () => { for (const status of ['Completed', 'Inactive']) {
    const s = sources();
    s.tasks[0].status = status;
    expect(buildActionCentre(s, p('ADMIN'), today).some(x => x.kind === 'Tasks')).toBe(false);
} for (const status of ['Open', 'In progress', 'Active']) {
    const s = sources();
    s.tasks[0].status = status;
    expect(buildActionCentre(s, p('ADMIN'), today).some(x => x.kind === 'Tasks')).toBe(true);
} });
it('filters before computing counts and never surfaces denied records or their data issues', () => { for (const role of roles) {
    const r = buildActionCentre(sources(), p(role), today);
    if (role === 'SALES')
        expect(r.map(x => x.kind)).toEqual(['Receivables', 'Tasks']);
    else if (role === 'WAREHOUSE' || role === 'PURCHASING')
        expect(r.map(x => x.kind)).toEqual(['Payables']);
    else
        expect(r).toHaveLength(3);
} expect(buildActionCentre(sources(), null, today)).toEqual([]); const s = sources(); s.bills[0].dueDate = 'invalid'; expect(buildActionCentre(s, p('SALES'), today).some(x => x.kind === 'Data issues')).toBe(false); });
it('exposes invalid permitted source dates or balances for review without hiding other valid work', () => { for (const value of [NaN, Infinity, -1, 1e30]) {
    const s = sources();
    (s.sales[0] as any).amountDue = value;
    const r = buildActionCentre(s, p('ADMIN'), today);
    expect(r[0].kind).toBe('Data issues');
    expect(r[0].path).toBe('/sales/invoices/i');
    expect(r).toHaveLength(3);
} const s = sources(); s.tasks[0].due = '2026-02-30'; s.bills[0].dueDate = 'invalid'; expect(buildActionCentre(s, p('ADMIN'), today).filter(x => x.kind === 'Data issues')).toHaveLength(2); expect(() => buildActionCentre(s, p('ADMIN'), '2026-02-30')).toThrow(); });
it('computes whole date-key days across daylight saving and year boundaries', () => { const s = sources(); (s.sales[0] as any).documentDate = '2026-09-01'; (s.sales[0] as any).dueDate = '2026-09-26'; expect(buildActionCentre(s, p('ADMIN'), '2026-09-28').find(x => x.kind === 'Receivables')?.daysOverdue).toBe(2); s.tasks[0].due = '2025-12-31'; expect(buildActionCentre(s, p('ADMIN'), '2026-01-01').find(x => x.kind === 'Tasks')?.daysOverdue).toBe(1); });
it('supports literal text/type filters and personal tasks without removing financial work', () => { const r = buildActionCentre(sources(), p('ADMIN'), today); expect(filterActions(r, { query: 'TIMBER THEIR-1' }).total).toBe(1); expect(filterActions(r, { query: '.*' }).total).toBe(0); expect(filterActions(r, { kind: 'Tasks', mine: true, userId: 'other' }).total).toBe(0); expect(filterActions(r, { mine: true, userId: 'other' }).total).toBe(2); expect(filterActions(r, { mine: true, userId: 'u' }).total).toBe(3); });
it('paginates 121 tasks with deterministic unique keys and clamps stale pages', () => { const s = sources(); s.sales = []; s.bills = []; s.tasks = Array.from({ length: 121 }, (_, i) => ({ ...s.tasks[0], id: `t-${i}`, name: `Task ${i}` })); const r = buildActionCentre(s, p('ADMIN'), today), pages = [1, 2, 3].flatMap(page => filterActions(r, { page }).rows); expect(new Set(pages.map(x => x.id)).size).toBe(121); expect(filterActions(r, { page: 999 }).page).toBe(3); expect(filterActions([], { page: 999 }).page).toBe(1); expect(filterActions(r, { page: NaN }).page).toBe(1); expect(r).toEqual(buildActionCentre(s, p('ADMIN'), today)); });
