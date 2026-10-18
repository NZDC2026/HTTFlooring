import { it, expect } from 'vitest';
import { parseCaptureCsv, captureHeaders } from './captureCsv';
import { csvText } from '../page-previews/previewModel';
const lookup = { suppliers: [{ id: 's', code: 'SUP-001', status: 'ACTIVE' }], accounts: [{ id: 'a', code: '6000' }], taxCodes: ['GST', 'ZERO'] };
const row = () => ['SUP-001', 'THEIR-1', '2026-10-10', '2026-11-10', 'Installation, service', '6000', '2', '55', 'GST', 'Inclusive', '100', '10', '110'];
const csv = (rows = [row()]) => csvText([[...captureHeaders], ...rows]);
it('parses a quoted single-bill CSV into real source identifiers and declared totals', () => { const r = parseCaptureCsv(csv(), lookup); expect(r.payload).toMatchObject({ kind: 'EXPENSE', supplierId: 's', supplierInvoiceNumber: 'THEIR-1', documentDate: '2026-10-10', dueDate: '2026-11-10' }); expect(r.payload.lines[0]).toEqual({ description: 'Installation, service', accountId: 'a', quantity: 2, unitCost: 55, taxCode: 'GST', priceBasis: 'Inclusive' }); expect(r.declared).toEqual({ subtotal: 100, taxAmount: 10, total: 110 }); });
it('handles BOM, reordered headers and multiple lines without mutating lookup data', () => { const before = structuredClone(lookup), headers = [...captureHeaders].reverse(), data = row().reverse(); const r = parseCaptureCsv('\uFEFF' + csvText([headers, data, data]), lookup); expect(r.payload.lines).toHaveLength(2); expect(lookup).toEqual(before); });
it('rejects missing, duplicated or unknown headings and malformed quotes', () => {
    for (const text of ['description\nx', csvText([captureHeaders.map(h => h === 'tax' ? 'net' : h), row()]), csvText([[...captureHeaders, 'secret'], [...row(), 'x']]), csv() + '\n"unclosed'])
        expect(() => parseCaptureCsv(text, lookup)).toThrow();
});
it('rejects files containing different invoice headers or inconsistent row widths', () => {
    for (const index of [0, 1, 2, 3, 10, 11, 12]) {
        const b = row();
        b[index] = 'different';
        expect(() => parseCaptureCsv(csv([row(), b]), lookup)).toThrow();
    }
    expect(() => parseCaptureCsv(csv([row().slice(1)]), lookup)).toThrow();
});
it('requires one active supplier and an available expense account with an active tax code', () => {
    for (const patch of [{ suppliers: [] }, { suppliers: [{ ...lookup.suppliers[0], status: 'INACTIVE' }] }, { suppliers: [lookup.suppliers[0], lookup.suppliers[0]] }, { accounts: [] }, { taxCodes: [] }])
        expect(() => parseCaptureCsv(csv(), { ...lookup, ...patch })).toThrow();
});
it('rejects expressions, signed/nonfinite amounts and zero quantities without evaluating text', () => {
    for (const value of ['=1+1', '1e5', 'NaN', 'Infinity', '-1', '1,000']) {
        const r = row();
        r[7] = value;
        expect(() => parseCaptureCsv(csv([r]), lookup)).toThrow();
    }
    const r = row();
    r[6] = '0';
    expect(() => parseCaptureCsv(csv([r]), lookup)).toThrow();
});
it('validates source dates, references, descriptions and basis', () => {
    for (const [index, value] of [[2, '2026-02-30'], [3, '2026-01-01'], [1, ''], [4, ''], [9, 'cash']] as const) {
        const r = row();
        r[index] = value;
        expect(() => parseCaptureCsv(csv([r]), lookup)).toThrow();
    }
});
it('limits input size and number of expense lines and permits an empty zero-tax amount', () => { expect(() => parseCaptureCsv('x'.repeat(1000001), lookup)).toThrow(/1 MB/); expect(() => parseCaptureCsv(csv(Array.from({ length: 501 }, row)), lookup)).toThrow(/500/); expect(() => parseCaptureCsv(csv([]), lookup)).toThrow(); const r = row(); r[8] = 'zero'; r[11] = '0'; expect(parseCaptureCsv(csv([r]), lookup).declared.taxAmount).toBe(0); });
