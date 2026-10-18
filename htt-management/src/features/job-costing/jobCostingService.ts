import type { Account } from '../accounting/types/account';
import type { JournalEntry } from '../accounting/types/journalEntry';
import type { ConfigRow } from '../business-workspace/configurationState';
import { requireDateKey } from '../../lib/businessDate';
export type Split = {
    jobId: string;
    amount: number;
};
export type Allocation = {
    id: string;
    journalId: string;
    lineId: string;
    revision: number;
    splits: Split[];
};
export function cents(value: number) {
    const n = Math.round(value * 100);
    if (!Number.isFinite(value) || !Number.isSafeInteger(n) || Math.abs(n / 100 - value) > 0.0000001)
        throw new Error('Amounts must be safe currency values with at most two decimals.');
    return n;
}
export function costingLines(journals: JournalEntry[], accounts: Account[]) {
    return journals.flatMap(j => j.lines.flatMap((line, index) => {
        const account = accounts.find(a => a.id === line.accountId);
        if (!account || !['REVENUE', 'EXPENSE'].includes(account.type))
            return [];
        let root = j, rootLine = line;
        if (j.reversedJournalEntryId) {
            const original = journals.find(x => x.id === j.reversedJournalEntryId), originalLine = original?.lines[index];
            if (!original || !originalLine || originalLine.accountId !== line.accountId || cents(originalLine.debit) !== cents(line.credit) || cents(originalLine.credit) !== cents(line.debit))
                throw new Error('Reversal line does not match its original source.');
            root = original;
            rootLine = originalLine;
        }
        const net = cents(account.type === 'REVENUE' ? line.credit - line.debit : line.debit - line.credit);
        if (!net)
            return [];
        return [{ journalId: j.id, lineId: line.id, rootJournalId: root.id, rootLineId: rootLine.id, date: j.journalDate, number: j.journalNumber, description: line.description || j.description, reference: j.reference ?? '', sourceType: j.sourceType, sourceId: j.sourceId ?? '', accountId: account.id, accountCode: account.code, accountName: account.name, kind: account.type as 'REVENUE' | 'EXPENSE', amount: net / 100, capacity: Math.abs(net) / 100, reversal: !!j.reversedJournalEntryId, signature: JSON.stringify({ journal: root, line: rootLine, accountType: account.type }) }];
    }));
}
export function calculateJobCosting(journals: JournalEntry[], accounts: Account[], jobs: ConfigRow[], allocations: Allocation[], from: string, to: string) {
    requireDateKey(from, 'From date');
    requireDateKey(to, 'To date');
    if (from > to)
        throw new Error('From date must not follow to date.');
    const lines = costingLines(journals, accounts).filter(l => l.date >= from && l.date <= to);
    const rows = lines.flatMap(line => {
        const allocation = allocations.find(a => a.journalId === line.rootJournalId && a.lineId === line.rootLineId), sign = line.amount < 0 ? -1 : 1;
        let remainder = cents(line.capacity);
        const splits = (allocation?.splits ?? []).map(s => { const n = cents(s.amount); remainder -= n; return { ...line, jobId: s.jobId, jobName: jobs.find(j => j.id === s.jobId)?.name ?? s.jobId, allocated: sign * n / 100 }; });
        if (remainder < 0)
            throw new Error('Project allocation exceeds source amount.');
        return [...splits, ...(remainder ? [{ ...line, jobId: '', jobName: 'Unallocated', allocated: sign * remainder / 100 }] : [])];
    });
    const totals = (id: string) => {
        let revenue = 0, cost = 0;
        for (const r of rows.filter(r => r.jobId === id)) {
            if (r.kind === 'REVENUE')
                revenue += cents(r.allocated);
            else
                cost += cents(r.allocated);
        }
        return { revenue: revenue / 100, cost: cost / 100, profit: (revenue - cost) / 100, margin: revenue > 0 ? (revenue - cost) / revenue * 100 : null };
    };
    return { from, to, rows, projects: jobs.map(job => { const t = totals(job.id), budget = cents(Math.round(Number(job.budget) * 100) / 100), costBudget = cents(Math.round(Number(job.costBudget) * 100) / 100); return { id: job.id, name: job.name, code: job.code, status: job.status, ...t, budget: budget / 100, costBudget: costBudget / 100, budgetProfit: (budget - costBudget) / 100, revenueVariance: (cents(t.revenue) - budget) / 100, costVariance: (costBudget - cents(t.cost)) / 100, profitVariance: (cents(t.profit) - budget + costBudget) / 100 }; }), unallocated: totals(''), ledger: { revenue: lines.filter(l => l.kind === 'REVENUE').reduce((n, l) => n + cents(l.amount), 0) / 100, cost: lines.filter(l => l.kind === 'EXPENSE').reduce((n, l) => n + cents(l.amount), 0) / 100 } };
}
