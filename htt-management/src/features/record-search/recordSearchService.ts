import { hasPermission, type Permission, type VerifiedPrincipal } from '../security/rbac';
import { requireDateKey } from '../../lib/businessDate';
import type { Customer } from '../contacts/types/customer';
import type { Supplier } from '../contacts/types/supplier';
import type { Product } from '../inventory/types/product';
import type { SalesDocument } from '../sales/types/salesDocument';
import type { CreditNote } from '../sales/types/creditNote';
import type { PurchaseOrder } from '../purchases/types/purchaseOrder';
import type { SupplierBill } from '../purchases/types/supplierBill';
import type { SupplierCredit } from '../purchases/types/supplierCredit';
import type { JournalEntry } from '../accounting/types/journalEntry';
export const recordTypes = ['Customer', 'Supplier', 'Product', 'Quotation', 'Sales order', 'Invoice', 'Customer credit', 'Purchase order', 'Supplier bill', 'Supplier credit', 'Journal'] as const;
export type RecordType = typeof recordTypes[number];
export const recordPermissions: Record<RecordType, Permission> = { Customer: 'sales.read', Supplier: 'purchases.read', Product: 'inventory.read', Quotation: 'sales.read', 'Sales order': 'sales.read', Invoice: 'sales.read', 'Customer credit': 'sales.read', 'Purchase order': 'purchases.read', 'Supplier bill': 'purchases.read', 'Supplier credit': 'purchases.read', Journal: 'accounting.read' };
export type RecordSearchSources = {
    customers: Customer[];
    suppliers: Supplier[];
    products: Product[];
    sales: SalesDocument[];
    customerCredits: CreditNote[];
    purchaseOrders: PurchaseOrder[];
    bills: SupplierBill[];
    supplierCredits: SupplierCredit[];
    journals: JournalEntry[];
};
export type SearchRecord = {
    key: string;
    type: RecordType;
    number: string;
    name: string;
    reference: string;
    status: string;
    date: string;
    path: string;
};
export type SearchFilters = {
    query?: string;
    type?: string;
    status?: string;
    from?: string;
    to?: string;
    page?: number;
};
const pathId = (id: string) => encodeURIComponent(id);
export function availableRecordTypes(principal: VerifiedPrincipal | null) { return recordTypes.filter(type => hasPermission(principal, recordPermissions[type])); }
// Deliberately index only the fields displayed below. Never serialize full source objects:
// that would make hidden purchase costs, contacts or financial fields searchable.
export function recordSearchIndex(s: RecordSearchSources, principal: VerifiedPrincipal | null): SearchRecord[] {
    const rows: SearchRecord[] = [];
    const add = (type: RecordType, id: string, number: string, name: string, reference: string, status: string, date: string, path: string) => {
        if (hasPermission(principal, recordPermissions[type]))
            rows.push({ key: `${type}:${id}`, type, number, name, reference, status, date, path: (type === 'Customer' || type === 'Supplier') && !hasPermission(principal, 'contacts.write') ? '' : path });
    };
    if (hasPermission(principal, 'sales.read')) {
        const customers = new Map(s.customers.map(c => [c.id, c.businessName]));
        s.customers.forEach(c => add('Customer', c.id, c.code, c.businessName, [c.tradingName, c.email, c.phone].filter(Boolean).join(' · '), c.status, '', `/contacts/customers/${pathId(c.id)}`));
        s.sales.forEach(d => { const type = d.type === 'QUOTE' ? 'Quotation' : d.type === 'SALES_ORDER' ? 'Sales order' : 'Invoice', segment = d.type === 'QUOTE' ? 'quotes' : d.type === 'SALES_ORDER' ? 'orders' : 'invoices'; add(type, d.id, d.documentNumber, customers.get(d.customerId) ?? d.customerId, d.customerReference ?? '', d.status, d.documentDate, `/sales/${segment}/${pathId(d.id)}`); });
        s.customerCredits.forEach(c => add('Customer credit', c.id, c.creditNoteNumber, customers.get(c.customerId) ?? c.customerId, c.reason, c.status, c.creditDate, `/sales/credit-notes/${pathId(c.id)}`));
    }
    if (hasPermission(principal, 'purchases.read')) {
        s.suppliers.forEach(c => add('Supplier', c.id, c.code, c.businessName, [c.tradingName, c.email, c.phone].filter(Boolean).join(' · '), c.status, '', `/contacts/suppliers/${pathId(c.id)}`));
        s.purchaseOrders.forEach(d => add('Purchase order', d.id, d.purchaseOrderNumber, d.supplierName, d.supplierCode, d.status, d.orderDate, `/purchases/${pathId(d.id)}`));
        s.bills.forEach(d => add('Supplier bill', d.id, d.billNumber, d.supplierName, d.supplierInvoiceNumber, d.status, d.billDate, `/purchases/bills/${pathId(d.id)}`));
        s.supplierCredits.forEach(d => add('Supplier credit', d.id, d.creditNumber, d.supplierName, d.supplierCreditNumber, d.status, d.creditDate, `/purchases/credits/${pathId(d.id)}`));
    }
    if (hasPermission(principal, 'inventory.read'))
        s.products.forEach(p => add('Product', p.id, p.sku, p.name, [p.brand, p.category, p.itemType ?? 'STOCK'].filter(Boolean).join(' · '), p.status, '', `/inventory/products/${pathId(p.id)}`));
    if (hasPermission(principal, 'accounting.read'))
        s.journals.forEach(j => add('Journal', j.id, j.journalNumber, j.description, j.reference ?? '', j.status, j.journalDate, `/accounting/journals/${pathId(j.id)}`));
    return rows;
}
export function searchBusinessRecords(s: RecordSearchSources, principal: VerifiedPrincipal | null, filters: SearchFilters = {}) {
    const query = (filters.query ?? '').trim();
    if (query.length > 500)
        throw new Error('Search text must be 500 characters or fewer.');
    const type = filters.type ?? 'All', status = filters.status ?? 'All';
    if (type !== 'All' && !recordTypes.includes(type as RecordType))
        throw new Error('Unknown record type.');
    for (const [name, value] of [['From date', filters.from], ['To date', filters.to]])
        if (value)
            requireDateKey(value, name!);
    if (filters.from && filters.to && filters.from > filters.to)
        throw new Error('From date must not exceed To date.');
    const index = recordSearchIndex(s, principal), types = availableRecordTypes(principal), statuses = [...new Set(index.filter(r => type === 'All' || r.type === type).map(r => r.status))].sort();
    const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean), needle = query.toLocaleLowerCase();
    const results = index.filter(r => (type === 'All' || r.type === type) && (status === 'All' || r.status === status) && (!filters.from || !!r.date && r.date >= filters.from) && (!filters.to || !!r.date && r.date <= filters.to) && terms.every(term => [r.type, r.number, r.name, r.reference, r.status, r.date].join(' ').toLocaleLowerCase().includes(term))).sort((a, b) => Number(b.number.toLocaleLowerCase() === needle) - Number(a.number.toLocaleLowerCase() === needle) || b.date.localeCompare(a.date) || a.number.localeCompare(b.number) || a.key.localeCompare(b.key));
    const total = results.length, pages = Math.max(1, Math.ceil(total / 50)), rawPage = filters.page ?? 1, page = Number.isSafeInteger(rawPage) ? Math.max(1, Math.min(rawPage, pages)) : 1;
    return { types, statuses, total, pages, page, rows: results.slice((page - 1) * 50, page * 50) };
}
export function recordSearchReturnPath(state: unknown): string | undefined {
    if (!state || typeof state !== 'object')
        return;
    const value = (state as {
        recordSearch?: unknown;
    }).recordSearch;
    return typeof value === 'string' && /^\/search\/records(?:\?[^#]*)?$/.test(value) ? value : undefined;
}
