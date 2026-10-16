import { businessSettings } from '../features/business-workspace/configurationState';
/** Accounting lifecycle dates use the business timezone, independently of host timezone. */
export function businessDateKey(value: string): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) throw new Error("Invalid accounting timestamp.");
    const parts = new Intl.DateTimeFormat("en-NZ", { timeZone: businessSettings().timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
    const part = (type: string) => parts.find(p => p.type === type)?.value;
    return `${part("year")}-${part("month")}-${part("day")}`;
}
export function requireDateKey(value: string, label = "Date"): void {
    const parsed = new Date(`${value}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
        throw new Error(`${label} must be a valid YYYY-MM-DD date.`);
    }
}

export function fiscalYearStart(date:string):string {
 requireDateKey(date);const year=Number(date.slice(0,4)),end=businessSettings().yearEnd;
 const lastEnd=date.slice(5)>end?year:year-1;
 const d=new Date(`${lastEnd}-${end}T00:00:00Z`);d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10);
}
