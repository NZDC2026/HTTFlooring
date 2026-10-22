import { businessSettings } from '../../business-workspace/configurationState';
import { resolvePricingInstant } from '../data/pricingInstant';

export function defaultPricingTime(date: string, timezone = businessSettings().timezone): string {
    try { return resolvePricingInstant(date, undefined, timezone).pricingAt; } catch { return ''; }
}
/** An explicit offset makes repeated DST hours unambiguous. */
export function PricingTimeFields({ date, value, onChange, timezone = businessSettings().timezone }: { date: string; value: string; timezone?: string; onChange: (at: string) => void }) {
    let error = '', display = '';
    try {
        const context = resolvePricingInstant(date, value, timezone);
        display = new Intl.DateTimeFormat('en-AU', { timeZone: timezone, dateStyle: 'medium', timeStyle: 'long' }).format(new Date(context.pricingAt));
    } catch (e) { error = (e as Error).message; }
    return <div className="space-y-2 rounded-lg border bg-slate-50 p-3 text-sm">
        <label className="block font-medium">Pricing time (ISO timestamp with UTC offset)
            <input className="mt-1 block w-full rounded border bg-white p-2" required value={value} placeholder="2026-10-21T10:00:00+11:00" onChange={e => onChange(e.target.value)} />
        </label>
        <p>Pricing timezone: {timezone}. {display}</p>
        <p>Promotions include their start time and exclude their end time. Saving fixes this time; posting and conversion keep the saved prices.</p>
        <button type="button" className="rounded border bg-white px-3 py-1" onClick={() => onChange(defaultPricingTime(date, timezone))}>Reset pricing time</button>
        <p className="text-xs">Reset uses now for today, or local midnight for another document date. Enter an offset timestamp for another time.</p>
        {error && <p role="alert" className="text-red-700">{error}</p>}
    </div>;
}
export function PricingTimeSummary({ lines }: { lines: { pricingAt?: string; pricingTimezone?: string }[] }) {
    const contexts = [...new Set(lines.map(l => l.pricingAt && l.pricingTimezone ? `${l.pricingAt} · ${l.pricingTimezone}` : 'Legacy pricing time not recorded'))];
    return <p className="my-2 text-xs text-slate-600">Pricing snapshot: {contexts.join('; ')}</p>;
}
