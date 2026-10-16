import { requireDateKey } from '../../../lib/businessDate';
import type { AccountingPeriod } from './accountingPeriodRepository';
export function validatePeriods(value: unknown): asserts value is AccountingPeriod[] {
    if (!Array.isArray(value)) throw new Error('Invalid accounting periods.');
    const sorted = [...value].sort((a, b) => String(a?.startDate).localeCompare(String(b?.startDate)));
    for (let i = 0; i < sorted.length; i++) {
        const p = sorted[i];
        if (!p || typeof p.id !== 'string' || !p.id || typeof p.name !== 'string' || !p.name.trim() || !['OPEN', 'CLOSED'].includes(p.status) || !Array.isArray(p.history) || !p.history.length) throw new Error('Invalid accounting period record.');
        requireDateKey(p.startDate); requireDateKey(p.endDate);
        if (p.startDate > p.endDate || (i && sorted[i - 1].endDate >= p.startDate)) throw new Error('Overlapping or invalid accounting periods.');
        for (const h of p.history) if (!['CREATE', 'CLOSE', 'REOPEN'].includes(h.action) || typeof h.actor !== 'string' || !h.actor || typeof h.reason !== 'string' || !Number.isFinite(Date.parse(h.at))) throw new Error('Invalid accounting period history.');
        let state = 'NEW';
        for (const h of p.history) {
            if (h.action === 'CREATE' && state === 'NEW') state = 'OPEN';
            else if (h.action === 'CLOSE' && state === 'OPEN') {
                if (!h.checks || !Number.isInteger(h.checks.journalCount) || h.checks.journalCount < 0 || !Number.isFinite(h.checks.debit) || !Number.isFinite(h.checks.credit) || h.checks.debit !== h.checks.credit) throw new Error('Invalid close evidence.');
                state = 'CLOSED';
            } else if (h.action === 'REOPEN' && state === 'CLOSED') state = 'OPEN';
            else throw new Error('Invalid period history sequence.');
        }
        if (state !== p.status) throw new Error('Period status does not match history.');
    }
}

