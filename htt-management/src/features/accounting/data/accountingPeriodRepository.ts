import { registerRepository } from '../../security/repositoryHost';
import { validatePeriods } from './accountingPeriodValidation';
import { requireDateKey } from '../../../lib/businessDate';
export type PeriodCheck = { code: string; message: string; path?: string };
export type AccountingPeriod = { id: string; name: string; startDate: string; endDate: string; status: 'OPEN' | 'CLOSED'; history: { action: 'CREATE' | 'CLOSE' | 'REOPEN'; actor: string; reason: string; at: string; checks?: { journalCount: number; debit: number; credit: number } }[] };
export type CloseCheck = { blockers: PeriodCheck[]; journalCount: number; debit: number; credit: number };
let periods: AccountingPeriod[] = [];
let inspect: ((period: AccountingPeriod) => CloseCheck) | undefined;
let actor: (() => string) | undefined;
const listeners = new Set<() => void>();
export function configurePeriodControls(check: (period: AccountingPeriod) => CloseCheck, identity: () => string) { inspect = check; actor = identity; }
function identity() { const id = actor?.(); if (!id) throw new Error('Trusted period management session required.'); return id; }
function reasonText(value: string) { if (typeof value !== 'string' || value.trim().length < 10 || value.length > 2000) throw new Error('Provide a reason of 10–2000 characters.'); return value.trim(); }
function find(id: string) { const period = periods.find(p => p.id === id); if (!period) throw new Error('Accounting period not found.'); return period; }
function publish() { listeners.forEach(fn => fn()); }
export function assertPostingPeriod(date: string): void {
    requireDateKey(date, 'Posting date');
    if (!periods.length) return; // Compatibility before an administrator configures periods.
    const closedThrough = periods.filter(p => p.status === 'CLOSED').map(p => p.endDate).sort().at(-1);
    if (closedThrough && date <= closedThrough) throw new Error(`Accounting period is closed through ${closedThrough}. Reopen it before posting.`);
    if (!periods.some(p => p.status === 'OPEN' && date >= p.startDate && date <= p.endDate)) throw new Error(`No open accounting period covers ${date}.`);
}
export const accountingPeriodRepository = {
    getAll: () => periods,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    create(input: { name: string; startDate: string; endDate: string; reason: string }) {
        const user = identity(), reason = reasonText(input.reason);
        requireDateKey(input.startDate); requireDateKey(input.endDate);
        if (typeof input.name !== 'string' || !input.name.trim() || input.name.length > 100 || input.startDate > input.endDate) throw new Error('Invalid period name or date range.');
        if (periods.some(p => input.startDate <= p.endDate && input.endDate >= p.startDate)) throw new Error('Accounting periods cannot overlap.');
        if (periods.some(p => p.status === 'CLOSED' && input.startDate <= p.endDate)) throw new Error('Reopen later closed periods before inserting an earlier period.');
        const period: AccountingPeriod = { id: crypto.randomUUID(), name: input.name.trim(), startDate: input.startDate, endDate: input.endDate, status: 'OPEN', history: [{ action: 'CREATE', actor: user, reason, at: new Date().toISOString() }] };
        periods = [...periods, period].sort((a, b) => a.startDate.localeCompare(b.startDate)); publish(); return period;
    },
    preflight(id: string): CloseCheck {
        const period = find(id); if (!inspect) throw new Error('Trusted close checks unavailable.'); return inspect(period);
    },
    close(input: { id: string; reason: string }) {
        const user = identity(), reason = reasonText(input.reason), period = find(input.id);
        if (period.status !== 'OPEN') throw new Error('Period is already closed.');
        if (periods.some(p => p.startDate < period.startDate && p.status !== 'CLOSED')) throw new Error('Close earlier periods first.');
        const check = this.preflight(input.id);
        if (check.blockers.length) throw new Error(`Period cannot close: ${check.blockers.map(b => b.message).join('; ')}`);
        const { journalCount, debit, credit } = check;
        periods = periods.map(p => p.id === period.id ? { ...p, status: 'CLOSED', history: [...p.history, { action: 'CLOSE', actor: user, reason, at: new Date().toISOString(), checks: { journalCount, debit, credit } }] } : p); publish(); return find(input.id);
    },
    reopen(input: { id: string; reason: string }) {
        const user = identity(), reason = reasonText(input.reason), period = find(input.id);
        if (period.status !== 'CLOSED') throw new Error('Period is already open.');
        if (periods.some(p => p.startDate > period.startDate && p.status === 'CLOSED')) throw new Error('Reopen later closed periods first.');
        periods = periods.map(p => p.id === period.id ? { ...p, status: 'OPEN', history: [...p.history, { action: 'REOPEN', actor: user, reason, at: new Date().toISOString() }] } : p); publish(); return find(input.id);
    },
};
registerRepository('accountingPeriods', { read: 'accounting.read', repository: accountingPeriodRepository, commands: { create: 'accounting.periods', preflight: 'accounting.read', close: 'accounting.periods', reopen: 'accounting.reopen' }, snapshot: () => ({ periods }), restore: value => { validatePeriods(value.periods); periods = value.periods; }, publish });
