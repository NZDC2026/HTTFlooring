import { it, expect } from 'vitest';
import { recordSearchReturnPath, searchBusinessRecords, recordSearchIndex, recordTypes, availableRecordTypes, type RecordSearchSources } from './recordSearchService';
import { roles, type Role, type VerifiedPrincipal } from '../security/rbac';
const principal = (role: Role): VerifiedPrincipal => ({ userId: role, roles: [role], authenticated: true });
const sources = (): RecordSearchSources => ({ customers: [{ id: 'c', code: 'CUS-1', businessName: 'Coastal Flooring', tradingName: 'Coastal', email: 'accounts@coastal.test', phone: '021555', status: 'ACTIVE', notes: 'hidden-private-note' }], suppliers: [{ id: 's', code: 'SUP-1', businessName: 'Timber Supplier', email: 'orders@timber.test', status: 'INACTIVE' }], products: [{ id: 'p', sku: 'OAK-1', name: 'Coastal Oak', brand: 'HTT', category: 'Timber', status: 'ACTIVE', unitCost: 987654, description: 'unindexed-secret' }], sales: [...['QUOTE', 'SALES_ORDER', 'INVOICE'].map((type, i) => ({ id: 'doc' + i, type, documentNumber: ['QUO-1', 'SO-1', 'INV-1'][i], customerId: 'c', customerReference: 'Showroom North', status: i === 2 ? 'VOID' : 'DRAFT', documentDate: `2026-10-${10 + i}`, totals: { total: 987654 } }))], customerCredits: [{ id: 'cc', creditNoteNumber: 'CN-1', customerId: 'c', reason: 'Installation allowance', status: 'ISSUED', creditDate: '2026-10-13' }], purchaseOrders: [{ id: 'po', purchaseOrderNumber: 'PO-1', supplierName: 'Historical timber name', supplierCode: 'SUP-1', status: 'CANCELLED', orderDate: '2026-10-10' }], bills: [{ id: 'b', billNumber: 'BILL-1', supplierName: 'Timber Supplier', supplierInvoiceNumber: 'THEIR-100', status: 'PAID', billDate: '2026-10-11' }], supplierCredits: [{ id: 'sc', creditNumber: 'SC-1', supplierName: 'Timber Supplier', supplierCreditNumber: 'THEIR-CREDIT-3', status: 'ISSUED', creditDate: '2026-10-12' }], journals: [{ id: 'j', journalNumber: 'JRN-1', description: 'Stock correction', reference: 'Warehouse count', status: 'REVERSED', journalDate: '2026-10-09', lines: [{ description: 'hidden-line-cost', debit: 987654 }] }] } as unknown as RecordSearchSources);
it('indexes all 11 supported record types using real source identifiers and links', () => { const s = sources(), before = structuredClone(s), r = searchBusinessRecords(s, principal('ADMIN')); expect(new Set(r.rows.map(x => x.type))).toEqual(new Set(recordTypes)); expect(r.total).toBe(11); expect(r.rows.find(x => x.type === 'Invoice')?.path).toBe('/sales/invoices/doc2'); expect(r.rows.find(x => x.type === 'Supplier credit')?.path).toBe('/purchases/credits/sc'); expect(r.rows.find(x => x.type === 'Purchase order')?.name).toBe('Historical timber name'); expect(s).toEqual(before); });
it('does not index denied types or reveal their existence through counts/status choices', () => {
    for (const role of roles) {
        const r = searchBusinessRecords(sources(), principal(role));
        if (role === 'SALES') {
            expect(r.total).toBe(6);
            expect(r.types).not.toContain('Supplier');
            expect(r.statuses).not.toContain('PAID');
            expect(searchBusinessRecords(sources(), principal(role), { query: 'Timber Supplier' }).total).toBe(0);
        }
        if (role === 'WAREHOUSE' || role === 'PURCHASING') {
            expect(r.total).toBe(5);
            expect(r.types).not.toContain('Customer');
            expect(r.types).not.toContain('Journal');
            expect(searchBusinessRecords(sources(), principal(role), { query: 'Showroom' }).total).toBe(0);
        }
        expect(r.rows.every(row => availableRecordTypes(principal(role)).includes(row.type))).toBe(true);
    }
});
it('returns nothing for anonymous, forged or unauthenticated identities', () => {
    for (const p of [null, { userId: '', roles: ['ADMIN'], authenticated: true }, { userId: 'x', roles: ['UNKNOWN'], authenticated: true }, { userId: 'x', roles: ['ADMIN'], authenticated: false }] as (VerifiedPrincipal | null)[]) {
        expect(searchBusinessRecords(sources(), p).total).toBe(0);
        expect(availableRecordTypes(p)).toEqual([]);
    }
});
it('matches displayed contact details, supplier references and multiple literal terms case-insensitively', () => {
    expect(searchBusinessRecords(sources(), principal('ADMIN'), { query: '  COASTAL   north ' }).total).toBe(3);
    expect(searchBusinessRecords(sources(), principal('ADMIN'), { query: 'accounts@coastal.test' }).rows[0].type).toBe('Customer');
    expect(searchBusinessRecords(sources(), principal('ADMIN'), { query: 'THEIR-100' }).rows[0].number).toBe('BILL-1');
    for (const query of ['.*', '[abc]', '<script>', '987654', 'hidden-private-note', 'unindexed-secret', 'hidden-line-cost'])
        expect(searchBusinessRecords(sources(), principal('ADMIN'), { query }).total).toBe(0);
});
it('keeps voids, cancelled orders, inactive contacts and reversed journals discoverable', () => {
    for (const status of ['VOID', 'CANCELLED', 'INACTIVE', 'REVERSED'])
        expect(searchBusinessRecords(sources(), principal('ADMIN'), { status }).total).toBe(1);
    expect(searchBusinessRecords(sources(), principal('ADMIN'), { type: 'Invoice', status: 'PAID' }).total).toBe(0);
    expect(searchBusinessRecords(sources(), principal('SALES'), { type: 'Supplier' }).rows).toEqual([]);
});
it('uses inclusive document dates and excludes undated master records only when date filters apply', () => { const r = searchBusinessRecords(sources(), principal('ADMIN'), { from: '2026-10-11', to: '2026-10-12' }); expect(r.total).toBe(4); expect(r.rows.every(x => x.date >= '2026-10-11' && x.date <= '2026-10-12')).toBe(true); expect(searchBusinessRecords(sources(), principal('ADMIN'), { to: '2026-10-09' }).rows[0].type).toBe('Journal'); expect(searchBusinessRecords(sources(), principal('ADMIN'), { from: '2030-01-01' }).total).toBe(0); });
it('rejects invalid date ranges, unsupported types and excessive query input', () => {
    for (const f of [{ from: '2026-02-30' }, { to: 'yesterday' }, { from: '2026-10-12', to: '2026-10-01' }, { type: 'Password' }, { query: 'x'.repeat(501) }])
        expect(() => searchBusinessRecords(sources(), principal('ADMIN'), f)).toThrow();
});
it('prioritises exact numbers then orders deterministically and paginates all results', () => {
    const s = sources();
    s.sales = Array.from({ length: 121 }, (_, i) => ({ ...s.sales[2], id: `i${i}`, documentNumber: `INV-${String(i).padStart(3, '0')}`, customerReference: 'INV-000', documentDate: '2026-10-12' }));
    const a = principal('ADMIN'), r = searchBusinessRecords(s, a, { type: 'Invoice', query: 'INV-000' });
    expect(r.rows[0].number).toBe('INV-000');
    expect(r.total).toBe(121);
    expect(r.pages).toBe(3);
    const pages = [1, 2, 3].flatMap(page => searchBusinessRecords(s, a, { type: 'Invoice', page }).rows);
    expect(new Set(pages.map(x => x.key)).size).toBe(121);
    expect(searchBusinessRecords(s, a, { type: 'Invoice', page: 999 }).page).toBe(3);
    for (const page of [0, -1, NaN, Infinity, 1.5])
        expect(searchBusinessRecords(s, a, { page }).page).toBe(1);
});
it('preserves independent result copies and observes updated sources on the next search', () => { const s = sources(), r = recordSearchIndex(s, principal('ADMIN')), before = structuredClone(r); s.customers[0].businessName = 'Renamed'; s.sales = []; expect(r).toEqual(before); expect(searchBusinessRecords(s, principal('ADMIN'), { query: 'Renamed' }).total).toBe(2); expect(searchBusinessRecords({ ...s, sales: [] }, principal('ADMIN'), { type: 'Invoice' }).total).toBe(0); });
it('encodes source IDs as route segments and keys same-number records by type plus ID', () => { const s = sources(); s.sales[2].id = 'one/two?x#y'; s.sales[2].documentNumber = s.customers[0].code; const r = recordSearchIndex(s, principal('ADMIN')); expect(r.find(x => x.type === 'Invoice')?.path).toBe('/sales/invoices/one%2Ftwo%3Fx%23y'); expect(new Set(r.map(x => x.key)).size).toBe(r.length); });
it('accepts only an internal record-search return route while retaining encoded filters and page', () => {
    expect(recordSearchReturnPath({ recordSearch: '/search/records?q=Direct+example&type=Invoice&page=2' })).toBe('/search/records?q=Direct+example&type=Invoice&page=2');
    for (const state of [null, {}, 'x', { recordSearch: 'https://evil.test' }, { recordSearch: '//evil.test' }, { recordSearch: '/settings/security' }, { recordSearch: '/search/records/../../settings' }, { recordSearch: '/search/records#evil' }, { recordSearch: 3 }])
        expect(recordSearchReturnPath(state)).toBeUndefined();
});
it('keeps permitted contact search data visible without linking into a management-only route', () => { for (const role of ['ACCOUNTANT', 'AUDITOR', 'WAREHOUSE'] as const) {
    const r = recordSearchIndex(sources(), principal(role));
    expect(r.filter(x => x.type === 'Customer' || x.type === 'Supplier').length).toBeGreaterThan(0);
    expect(r.filter(x => x.type === 'Customer' || x.type === 'Supplier').every(x => x.path === '')).toBe(true);
} expect(recordSearchIndex(sources(), principal('SALES')).find(x => x.type === 'Customer')?.path).toBe('/contacts/customers/c'); });
it('provides the full authorised filtered export projection independently of viewport pagination',()=>{const s=sources();s.customers=Array.from({length:123},(_,i)=>({...s.customers[0],id:'customer-'+i,code:'CUS-'+i,businessName:'Export customer '+i}));const result=searchBusinessRecords(s,principal('SALES'),{type:'Customer',query:'Export customer',page:3});expect(result.rows).toHaveLength(23);expect(result.total).toBe(123);expect(result.allRows).toHaveLength(123);expect(new Set(result.allRows.map(r=>r.key)).size).toBe(123);expect(JSON.stringify(result.allRows)).not.toContain('hidden-private-note');const denied=searchBusinessRecords(s,principal('WAREHOUSE'),{type:'Customer'});expect(denied.allRows).toEqual([]);});
