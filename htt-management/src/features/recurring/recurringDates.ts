import { requireDateKey } from '../../lib/businessDate';
export const frequencies = ['Weekly', 'Fortnightly', 'Monthly', 'Quarterly'] as const;
export type Frequency = typeof frequencies[number];
export function occurrenceDate(first: string, frequency: Frequency, index: number) { requireDateKey(first); if (!Number.isSafeInteger(index) || index < 0 || !frequencies.includes(frequency))
    throw new Error('Invalid schedule occurrence.'); const d = new Date(first + 'T00:00:00Z'); if (frequency === 'Weekly' || frequency === 'Fortnightly')
    d.setUTCDate(d.getUTCDate() + index * (frequency === 'Weekly' ? 7 : 14));
else {
    const day = d.getUTCDate();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() + index * (frequency === 'Monthly' ? 1 : 3));
    const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
    d.setUTCDate(Math.min(day, last));
} const result = d.toISOString().slice(0, 10); requireDateKey(result); return result; }
export function addDays(date: string, days: number) { requireDateKey(date); const d = new Date(date + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + days); const result = d.toISOString().slice(0, 10); requireDateKey(result); return result; }
