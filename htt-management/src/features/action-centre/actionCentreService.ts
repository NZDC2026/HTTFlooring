import { requireDateKey } from '../../lib/businessDate';
import { hasPermission, type VerifiedPrincipal } from '../security/rbac';
import type { SalesDocument } from '../sales/types/salesDocument';
import type { SupplierBill } from '../purchases/types/supplierBill';
import type { Customer } from '../contacts/types/customer';
import type { ConfigRow } from '../business-workspace/configurationState';
export type ActionSources = {
    sales: SalesDocument[];
    bills: SupplierBill[];
    tasks: ConfigRow[];
    customers: Customer[];
};
export type ActionItem = {
    id: string;
    kind: 'Receivables' | 'Payables' | 'Tasks' | 'Data issues';
    number: string;
    name: string;
    detail: string;
    due: string;
    daysOverdue: number;
    amount?: number;
    path: string;
    owner?: string;
    priority?: string;
};
const validDate = (value: string) => { try {
    requireDateKey(value);
    return true;
}
catch {
    return false;
} };
const days = (from: string, to: string) => Math.round((Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / 86400000);
export function buildActionCentre(s: ActionSources, principal: VerifiedPrincipal | null, today: string): ActionItem[] {
    requireDateKey(today, 'Business today');
    const rows: ActionItem[] = [];
    const issue = (id: string, number: string, name: string, path: string, detail: string) => rows.push({ id: `issue:${id}`, kind: 'Data issues', number, name, path, detail, due: '', daysOverdue: 0 });
    if (hasPermission(principal, 'sales.read')) {
        const names = new Map(s.customers.map(c => [c.id, c.businessName]));
        for (const d of s.sales) {
            if (d.type !== 'INVOICE' || d.status === 'DRAFT' || d.status === 'VOID' || d.status === 'PAID')
                continue;
            const path = `/sales/invoices/${encodeURIComponent(d.id)}`, name = names.get(d.customerId) ?? d.customerId;
            if (!validDate(d.dueDate) || !validDate(d.documentDate) || !Number.isFinite(d.amountDue) || !Number.isSafeInteger(Math.round(d.amountDue * 100)) || d.amountDue < 0) {
                issue('invoice:' + d.id, d.documentNumber, name, path, 'Invalid invoice dates or outstanding amount. Review the source.');
                continue;
            }
            if (d.documentDate > today || d.dueDate >= today || Math.round(d.amountDue * 100) <= 0)
                continue;
            rows.push({ id: 'invoice:' + d.id, kind: 'Receivables', number: d.documentNumber, name, path, due: d.dueDate, daysOverdue: days(d.dueDate, today), amount: d.amountDue, detail: 'Outstanding customer invoice' });
        }
        for (const t of s.tasks) {
            if (t.status === 'Completed' || t.status === 'Inactive')
                continue;
            const path = `/tasks/${encodeURIComponent(t.id)}`, name = names.get(t.customerId) ?? t.customerId;
            if (!validDate(t.due)) {
                issue('task:' + t.id, t.name, name, path, 'Invalid task due date. Review the task.');
                continue;
            }
            if (t.due > today)
                continue;
            rows.push({ id: 'task:' + t.id, kind: 'Tasks', number: t.name, name, path, due: t.due, daysOverdue: days(t.due, today), owner: t.owner, priority: t.priority, detail: `${t.status} · ${t.priority} priority · Owner ${t.owner}` });
        }
    }
    if (hasPermission(principal, 'purchases.read'))
        for (const b of s.bills) {
            if (b.status === 'VOID' || b.status === 'PAID')
                continue;
            const path = `/purchases/bills/${encodeURIComponent(b.id)}`;
            if (!validDate(b.dueDate) || !validDate(b.billDate) || !Number.isFinite(b.totals.amountDue) || !Number.isSafeInteger(Math.round(b.totals.amountDue * 100)) || b.totals.amountDue < 0) {
                issue('bill:' + b.id, b.billNumber, b.supplierName, path, 'Invalid supplier bill dates or outstanding amount. Review the source.');
                continue;
            }
            if (b.billDate > today || b.dueDate >= today || Math.round(b.totals.amountDue * 100) <= 0)
                continue;
            rows.push({ id: 'bill:' + b.id, kind: 'Payables', number: b.billNumber, name: b.supplierName, path, due: b.dueDate, daysOverdue: days(b.dueDate, today), amount: b.totals.amountDue, detail: `Outstanding supplier bill · ${b.supplierInvoiceNumber}` });
        }
    return rows.sort((a, b) => Number(b.kind === 'Data issues') - Number(a.kind === 'Data issues') || a.due.localeCompare(b.due) || Number(b.priority === 'High') - Number(a.priority === 'High') || a.id.localeCompare(b.id));
}
export function filterActions(items: ActionItem[], input: {
    kind?: string;
    query?: string;
    mine?: boolean;
    userId?: string;
    page?: number;
} = {}) {
    const terms = (input.query ?? '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    const rows = items.filter(r => (!input.kind || input.kind === 'All' || r.kind === input.kind) && (!input.mine || r.kind !== 'Tasks' || r.owner === input.userId) && terms.every(t => [r.number, r.name, r.detail, r.due].join(' ').toLowerCase().includes(t))), total = rows.length, pages = Math.max(1, Math.ceil(total / 50)), page = Number.isSafeInteger(input.page) ? Math.max(1, Math.min(input.page!, pages)) : 1;
    return { total, pages, page, rows: rows.slice((page - 1) * 50, page * 50) };
}
