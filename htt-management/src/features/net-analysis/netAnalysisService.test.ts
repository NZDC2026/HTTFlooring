import { describe, expect, it } from 'vitest';
import { analysisEvents, calculateNetAnalysis, type AnalysisDocument } from './netAnalysisService';
const doc = (patch: Partial<AnalysisDocument> = {}): AnalysisDocument => ({ id: 'i1', number: 'INV-1', kind: 'INVOICE', partyId: 'c1', partyName: 'Customer', date: '2026-09-30', status: 'ISSUED', subtotal: 100, tax: 10, total: 110, path: '/sales/invoices/i1', ...patch });
const report = (documents: AnalysisDocument[], patch: Partial<Parameters<typeof calculateNetAnalysis>[1]> = {}) => calculateNetAnalysis(documents, { from: '2026-10-01', to: '2026-10-31', ...patch });
describe('net sales and purchase document analysis', () => {
    it('retains an original invoice in its historic period after a later void', () => {
        const d = doc({ status: 'VOID', voidedAt: '2026-10-10' });
        expect(report([d], { from: '2026-09-01', to: '2026-09-30' }).totals).toEqual({ subtotal: 100, tax: 10, total: 110 });
        expect(report([d]).totals).toEqual({ subtotal: -100, tax: -10, total: -110 });
        expect(report([d], { from: '2026-09-01' }).totals.total).toBe(0);
    });
    it('deducts credit on its own date and restores it on its void date', () => {
        const d = doc({ kind: 'CUSTOMER_CREDIT', number: 'CN-1', status: 'VOID', voidedAt: '2026-10-11' });
        expect(report([d], { from: '2026-09-01', to: '2026-09-30' }).totals.total).toBe(-110);
        expect(report([d]).totals.total).toBe(110);
        expect(report([d]).movements[2].total).toBe(110);
    });
    it('reports mixed original, partial credit and void effects using saved cents', () => {
        const r = report([doc({ date: '2026-10-01', subtotal: 0.05, tax: 0.01, total: 0.06 }), doc({ id: 'c1', kind: 'CUSTOMER_CREDIT', date: '2026-10-02', subtotal: 0.02, tax: 0, total: 0.02 }), doc({ id: 'i2', date: '2026-10-03', subtotal: 0.1, tax: 0.01, total: 0.11 })]);
        expect(r.totals).toEqual({ subtotal: 0.13, tax: 0.02, total: 0.15 });
        expect(r.movements[0].total).toBe(0.17);
        expect(r.movements[1].total).toBe(-0.02);
    });
    it('handles supplier expense bills, financial and physical-return credits with the same signs', () => {
        const r = report([doc({ kind: 'BILL', date: '2026-10-01', subtotal: 100, tax: 10, total: 110 }), doc({ id: 'cr1', kind: 'SUPPLIER_CREDIT', date: '2026-10-02', subtotal: 20, tax: 2, total: 22 }), doc({ id: 'cr2', kind: 'SUPPLIER_CREDIT', date: '2026-10-03', subtotal: 30, tax: 3, total: 33 })]);
        expect(r.totals.total).toBe(55);
        expect(r.movements[1].total).toBe(-55);
    });
    it('excludes drafts and historical opening documents and credits without inspecting their totals', () => {
        const r = report([doc({ status: 'DRAFT', subtotal: NaN }), doc({ id: 'opening', openingBalanceImportId: 'batch', total: NaN }), doc({ id: 'opening-credit', kind: 'SUPPLIER_CREDIT', openingBalanceImportId: 'batch', status: 'VOID' })]);
        expect(r.events).toEqual([]);
        expect(r.totals.total).toBe(0);
    });
    it('ignores settlement states and preserves the exact issued totals', () => {
        for (const status of ['ISSUED', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'FULLY_APPLIED', 'OPEN'])
            expect(report([doc({ date: '2026-10-01', status })]).totals.total).toBe(110);
    });
    it('groups by contact ID rather than merging matching names and retains source links', () => {
        const r = report([doc({ date: '2026-10-01' }), doc({ id: 'i2', partyId: 'c2', date: '2026-10-02' })]);
        expect(r.parties).toHaveLength(2);
        expect(r.events[0].path).toBe('/sales/invoices/i1');
        expect(r.parties.reduce((s, p) => s + p.total, 0)).toBe(r.totals.total);
    });
    it('applies inclusive dates, customer, search and activity filters to summaries and detail together', () => {
        const docs = [doc({ date: '2026-10-01' }), doc({ id: 'cr', kind: 'CUSTOMER_CREDIT', number: 'CN-1', date: '2026-10-31' }), doc({ id: 'other', partyId: 'c2', date: '2026-10-01' }), doc({ id: 'future', date: '2026-11-01' })];
        expect(report(docs, { partyId: 'c1' }).events).toHaveLength(2);
        const r = report(docs, { partyId: 'c1', query: ' cn-1 ', event: 'CREDIT' });
        expect(r.events).toHaveLength(1);
        expect(r.totals.total).toBe(-110);
        expect(r.parties[0].total).toBe(-110);
        expect(r.movements[0].count).toBe(0);
    });
    it('uses business timezone at midnight boundaries rather than truncating UTC timestamps', () => {
        const d = doc({ status: 'VOID', voidedAt: '2026-10-01T23:30:00Z' });
        const events = analysisEvents([d]);
        expect(events[1].date).toBe('2026-10-02');
        expect(report([d], { to: '2026-10-01' }).events).toHaveLength(0);
    });
    it('rejects undated or invalid void records rather than silently losing their history', () => {
        for (const voidedAt of [undefined, 'bad', '2026-02-30', '2026-09-01'])
            expect(() => report([doc({ status: 'VOID', voidedAt })])).toThrow();
    });
    it('validates source dates, duplicate source IDs and cent-balanced monetary snapshots', () => {
        for (const patch of [{ date: '2026-02-30' }, { subtotal: Infinity }, { tax: -1 }, { total: 109 }, { subtotal: 100.001 }])
            expect(() => report([doc(patch)])).toThrow();
        expect(() => report([doc(), doc()])).toThrow(/Duplicate/);
        expect(() => report([doc(), doc({ kind: 'CUSTOMER_CREDIT' })])).not.toThrow();
    });
    it('validates required period boundaries and reports an empty result without invented figures', () => {
        for (const patch of [{ from: '' }, { to: 'bad' }, { from: '2026-11-01' }])
            expect(() => report([], patch)).toThrow();
        expect(report([])).toMatchObject({ events: [], parties: [], totals: { subtotal: 0, tax: 0, total: 0 } });
    });
    it('counts source documents separately from original and reversal events without mutating input', () => {
        const docs = [doc({ date: '2026-10-01', status: 'VOID', voidedAt: '2026-10-02' })], before = structuredClone(docs), r = report(docs);
        expect(r.parties[0]).toMatchObject({ documents: 1, events: 2, total: 0 });
        expect(docs).toEqual(before);
        expect(new Set(r.events.map(e => e.eventId)).size).toBe(2);
    });
});
