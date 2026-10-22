import { businessSettings } from '../../business-workspace/configurationState';
import { requireDateKey } from '../../../lib/businessDate';

export interface PricingInstant { pricingAt: string; pricingTimezone: string }
export function pricingDate(at: string, timezone: string): string {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(at));
    const value = (type: string) => parts.find(p => p.type === type)!.value;
    return `${value('year')}-${value('month')}-${value('day')}`;
}
function canonicalInstant(at: string): string {
    const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/.exec(at);
    if (!match || Number(match[2]) > 23 || Number(match[3]) > 59 || Number(match[4]) > 59 || !Number.isFinite(Date.parse(at)))
        throw new Error('Pricing time must be an ISO timestamp with seconds and an explicit UTC offset.');
    requireDateKey(match[1], 'Pricing date');
    if (match[6] !== 'Z' && (Number(match[6].slice(1,3)) > 14 || Number(match[6].slice(4)) > 59 || (Number(match[6].slice(1,3)) === 14 && Number(match[6].slice(4)) !== 0)))
        throw new Error('Invalid pricing UTC offset.');
    return new Date(at).toISOString();
}
/** Missing time: today uses now; another business date uses its local midnight.
 * Persist once per command; never recompute a historical document on read/post. */
export function resolvePricingInstant(documentDate: string, at?: string, timezone = businessSettings().timezone, now = new Date().toISOString()): PricingInstant {
    requireDateKey(documentDate, 'Document date');
    // Validate the IANA timezone even when an explicit instant was supplied.
    pricingDate(now, timezone);
    if (at === undefined) {
        if (pricingDate(now, timezone) === documentDate) at = now;
        else {
            const target = Date.parse(`${documentDate}T00:00:00Z`);
            let candidate = target;
            for (let i = 0; i < 6; i++) {
                const parts = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(candidate));
                const p = (type: string) => parts.find(v => v.type === type)!.value;
                const local = Date.parse(`${p('year')}-${p('month')}-${p('day')}T${p('hour')}:${p('minute')}:${p('second')}Z`);
                if (local === target) { at = new Date(candidate).toISOString(); break; }
                candidate += target - local;
            }
            if (!at) throw new Error('This date has no local midnight. Enter an explicit pricing time.');
        }
    }
    const pricingAt = canonicalInstant(at);
    if (pricingDate(pricingAt, timezone) !== documentDate) throw new Error('Pricing time must fall on the document date in the pricing timezone.');
    return { pricingAt, pricingTimezone: timezone };
}
/** Legacy snapshots without either field stay unknown; never invent historical evidence. */
export function validatePricingSnapshot(line: { pricingAt?: string; pricingTimezone?: string }, documentDate?: string): void {
    if (line.pricingAt === undefined && line.pricingTimezone === undefined) return;
    if (!line.pricingAt || !line.pricingTimezone) throw new Error('Incomplete pricing time snapshot.');
    const date = pricingDate(canonicalInstant(line.pricingAt), line.pricingTimezone);
    if (documentDate && date !== documentDate) throw new Error('Pricing snapshot date does not match the document.');
}
