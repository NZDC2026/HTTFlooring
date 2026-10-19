import { it, expect } from 'vitest';
import { australianWithholding as tax } from './australianTax';
const at = '2026-10-29';
// Official Schedule 1 weekly sample rows, with columns scales 1, 2, 3, 5, 6.
it.each([[116, 17, 0, 35, 0, 0], [117, 18, 0, 35, 0, 0], [187, 28, 0, 56, 0, 0], [188, 28, 0, 56, 0, 0], [249, 41, 0, 75, 0, 0], [250, 41, 0, 75, 0, 0], [361, 64, 0, 108, 0, 0], [362, 65, 0, 109, 0, 0], [370, 66, 1, 111, 1, 1], [371, 66, 1, 111, 1, 1], [514, 92, 23, 154, 23, 23], [515, 92, 23, 154, 23, 23], [537, 99, 26, 161, 26, 26], [538, 100, 27, 161, 27, 27], [672, 143, 60, 202, 47, 47], [673, 143, 60, 202, 47, 47], [720, 158, 68, 216, 54, 54], [721, 159, 68, 216, 54, 54], [864, 205, 94, 259, 77, 77], [865, 205, 94, 259, 77, 77], [907, 219, 108, 272, 90, 90], [908, 219, 108, 272, 90, 90], [931, 227, 116, 279, 97, 98], [932, 227, 116, 280, 97, 98], [1134, 292, 181, 340, 158, 170]])('matches official 2026 weekly sample %s', (gross, ...expected) => { (['1', '2', '3', '5', '6'] as const).forEach((scale, i) => expect(tax(gross, scale, 'Weekly', at)).toBe(expected[i])); });
it('uses whole-dollar withholding rounding before fortnightly/monthly conversion', () => { expect(tax(1333.45, '2', 'Weekly', at)).toBe(245); expect(tax(2666.90, '2', 'Fortnightly', at)).toBe(490); expect(tax(3066.33, '2', 'Monthly', at)).toBe(286); expect(tax(1333.45 * 13, '2', 'Quarterly', at)).toBe(3185); expect(tax(0, '2', 'Weekly', at)).toBe(0); });
it('ignores earnings and result cents for no-TFN scales without weekly conversion', () => { expect(tax(1000.99, '4-resident', 'Monthly', at)).toBe(470); expect(tax(1000.99, '4-foreign', 'Fortnightly', at)).toBe(450); expect(tax(9.99, '4-resident', 'Weekly', at)).toBe(4); });
it('rejects unsupported years, manual mode and invalid earnings', () => {
    for (const when of ['2026-06-30', '2027-07-01'])
        expect(() => tax(1000, '2', 'Weekly', when)).toThrow(/2026/);
    expect(() => tax(1000, 'Manual', 'Weekly', at)).toThrow();
    expect(() => tax(-1, '2', 'Weekly', at)).toThrow();
    expect(() => tax(NaN, '2', 'Weekly', at)).toThrow();
});
