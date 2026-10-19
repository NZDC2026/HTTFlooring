import { it, expect } from 'vitest';
import { parseSource, encodeCsv, formatTag } from './transferModel';
const source = (text: string, patch = {}) => ({ dataset: 'Customers' as const, mode: 'Create' as const, fileName: 'test.csv', text, ...patch });
it('maps canonical headers case-insensitively and handles BOM, quotes, commas and multiline Unicode', () => { const parsed = parseSource(source('\uFEFFExternalId,BusinessName,TradingName\r\none,"客户, Flooring","Line one\nLine ""two"""')); expect(parsed.mapping).toEqual({ externalId: 0, businessName: 1, tradingName: 2 }); expect(parsed.rows[0].values).toEqual({ externalId: 'one', businessName: '客户, Flooring', tradingName: 'Line one\nLine "two"' }); });
it('supports explicit source mappings and reports ignored columns', () => { const parsed = parseSource(source('Source,Company,Unused\none,Example,Ignore', { mapping: { externalId: 0, businessName: 1 } })); expect(parsed.unmappedColumns).toEqual(['Unused']); expect(parsed.rows[0].values.businessName).toBe('Example'); });
it('rejects duplicate/empty headers, width mismatches, malformed quoting and invalid mappings', () => {
    for (const text of ['A,a\none,two', ',Name\none,two', 'Name,Key\none', 'Name,Key\n"unclosed,two', 'Name,Key\n"closed"extra,two'])
        expect(() => parseSource(source(text))).toThrow();
    expect(() => parseSource(source('Name\nOne', { mapping: { businessName: 2 } }))).toThrow();
    expect(() => parseSource(source('Name\nOne', { mapping: { actorId: 0 } }))).toThrow();
});
it('rejects sources without records and enforces the 500-record limit', () => { expect(() => parseSource(source('externalId,businessName'))).toThrow(); expect(parseSource(source('externalId,businessName\n' + Array.from({ length: 500 }, (_, i) => `${i},Company ${i}`).join('\n'))).rows).toHaveLength(500); expect(() => parseSource(source('externalId,businessName\n' + Array.from({ length: 501 }, (_, i) => `${i},Company ${i}`).join('\n')))).toThrow(/500/); });
it('round-trips formula-safe and literal apostrophe fields under the explicit HTT format marker', () => {
    const names = ['=SUM(1,2)', '+Company', '-Company', '@Company', "'Literal", "'=literal", 'Normal company'];
    for (const name of names) {
        const text = encodeCsv([['_format', 'externalId', 'businessName'], [formatTag, 'one', name]]);
        expect(parseSource(source(text)).rows[0].values.businessName).toBe(name);
    }
    expect(parseSource(source("externalId,businessName\none,'=literal")).rows[0].values.businessName).toBe("'=literal");
});
it('does not interpret untrusted format markers or overly wide headers', () => { expect(() => parseSource(source('externalId,businessName\none,Null\0value'))).toThrow(/NUL/); expect(() => parseSource(source('_format,externalId,businessName\nOTHER,one,Company'))).toThrow(/format/); expect(() => parseSource(source(Array.from({ length: 65 }, (_, i) => 'h' + i).join(',') + '\n' + Array(65).fill('x').join(',')))).toThrow(/64/); });
