import { describe, expect, it } from 'vitest';
import { resolvePricingInstant, validatePricingSnapshot } from './pricingInstant';

describe('explicit pricing time and business timezone', () => {
    it('uses one current instant for today and local midnight for other dates', () => {
        expect(resolvePricingInstant('2026-10-22', undefined, 'Australia/Sydney', '2026-10-21T23:30:00Z')).toEqual({pricingAt:'2026-10-21T23:30:00.000Z',pricingTimezone:'Australia/Sydney'});
        expect(resolvePricingInstant('2026-10-21', undefined, 'Australia/Sydney', '2026-10-21T23:30:00Z').pricingAt).toBe('2026-10-20T13:00:00.000Z');
    });
    it.each([
        ['2026-04-05','Australia/Sydney','2026-04-04T13:00:00.000Z'],
        ['2026-10-04','Australia/Sydney','2026-10-03T14:00:00.000Z'],
        ['2026-09-27','Pacific/Auckland','2026-09-26T12:00:00.000Z'],
        ['2026-04-05','Pacific/Auckland','2026-04-04T11:00:00.000Z'],
    ])('finds local midnight across daylight saving boundaries: %s %s', (date, zone, expected) => {
        expect(resolvePricingInstant(date, undefined, zone, '2026-12-01T00:00:00Z').pricingAt).toBe(expected);
    });
    it('distinguishes repeated local hours using explicit offsets', () => {
        const early = resolvePricingInstant('2026-04-05','2026-04-05T02:30:00+11:00','Australia/Sydney');
        const late = resolvePricingInstant('2026-04-05','2026-04-05T02:30:00+10:00','Australia/Sydney');
        expect(Date.parse(late.pricingAt)-Date.parse(early.pricingAt)).toBe(3600000);
    });
    it.each(['2026-10-21T10:00:00','2026-10-21','2026-02-30T10:00:00Z','2026-10-21T24:00:00Z','2026-10-21T10:00:60Z','2026-10-21T10:00:00+14:30','invalid'])('rejects invalid or ambiguous input: %s', at => {
        expect(()=>resolvePricingInstant('2026-10-21',at,'Australia/Sydney')).toThrow();
    });
    it('rejects a business date mismatch, even if the UTC date matches', () => {
        expect(()=>resolvePricingInstant('2026-10-21','2026-10-21T23:30:00Z','Australia/Sydney')).toThrow(/document date/);
    });
    it('accepts unknown legacy time but rejects incomplete snapshot evidence', () => {
        expect(()=>validatePricingSnapshot({})).not.toThrow();
        expect(()=>validatePricingSnapshot({pricingAt:'2026-10-21T10:00:00Z'})).toThrow(/Incomplete/);
        expect(()=>validatePricingSnapshot({pricingAt:'2026-10-21T10:00:00Z',pricingTimezone:'wrong'})).toThrow();
    });
});
