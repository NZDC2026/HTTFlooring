import { it, expect } from 'vitest';
import { calculateJobCosting, costingLines, cents } from './jobCostingService';
import type { JournalEntry } from '../accounting/types/journalEntry';
import type { Account } from '../accounting/types/account';
import type { ConfigRow } from '../business-workspace/configurationState';
const accounts = [{ id: 'r', type: 'REVENUE', code: '4000', name: 'Revenue' }, { id: 'e', type: 'EXPENSE', code: '5000', name: 'Expense' }, { id: 'b', type: 'ASSET', code: '1000', name: 'Bank' }] as Account[];
const jobs = [{ id: 'p', name: 'Project', code: 'P', status: 'Active', revision: '1', createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '2026-10-01T00:00:00.000Z', budget: '100', costBudget: '60' }] as ConfigRow[];
const entry = (id: string, accountId: string, debit: number, credit: number, date = '2026-10-01', patch = {}) => ({ id, journalNumber: id, journalDate: date, sourceType: 'MANUAL_JOURNAL', description: id, lines: [{ id: id + 'line', accountId, debit, credit }], ...patch }) as JournalEntry;
const allocation = (j: string, amount: number) => ({ id: j + 'a', journalId: j, lineId: j + 'line', revision: 1, splits: [{ jobId: 'p', amount }] });
it('keeps cent precision for partial splits and negative credit/expense corrections', () => { const journals = [entry('sale', 'r', 0, 0.3), entry('credit', 'r', 0.1, 0), entry('cost', 'e', 0.2, 0), entry('refund', 'e', 0, 0.1)], r = calculateJobCosting(journals, accounts, jobs, journals.map(j => allocation(j.id, Math.abs(j.lines[0].credit - j.lines[0].debit))), '2026-10-01', '2026-10-31'); expect(r.projects[0]).toMatchObject({ revenue: 0.2, cost: 0.1, profit: 0.1, margin: 50 }); expect(r.unallocated.profit).toBe(0); });
it('counts original reversed journals before the reversal date, then offsets exact split cents', () => { const original = entry('j', 'r', 0, 100, '2026-10-01', { status: 'REVERSED' }), reversal = entry('v', 'r', 100, 0, '2026-11-01', { reversedJournalEntryId: 'j' }); const r = calculateJobCosting([original, reversal], accounts, jobs, [allocation('j', 33.33)], '2026-10-01', '2026-11-01'); expect(r.projects[0].revenue).toBe(0); expect(r.unallocated.revenue).toBe(0); expect(r.rows.find(r => r.reversal && r.jobId === 'p')?.allocated).toBe(-33.33); });
it('ignores balance sheet amounts and excludes entries outside inclusive dates', () => { const r = calculateJobCosting([entry('bank', 'b', 1000, 0), entry('before', 'r', 0, 10, '2026-09-30'), entry('inside', 'r', 0, 25, '2026-10-31'), entry('after', 'r', 0, 30, '2026-11-01')], accounts, jobs, [], '2026-10-01', '2026-10-31'); expect(r.ledger.revenue).toBe(25); expect(r.unallocated.revenue).toBe(25); expect(r.rows).toHaveLength(1); });
it('includes inactive projects and shows null margin for nonpositive revenue', () => { const r = calculateJobCosting([entry('credit', 'r', 10, 0)], accounts, [{ ...jobs[0], status: 'Inactive' }], [allocation('credit', 10)], '2026-10-01', '2026-10-31'); expect(r.projects[0]).toMatchObject({ status: 'Inactive', revenue: -10, margin: null }); });
it('fails on malformed reversals instead of silently attributing unrelated lines', () => { const original = entry('j', 'r', 0, 100), reversal = entry('v', 'r', 99, 0, '2026-10-02', { reversedJournalEntryId: 'j' }); expect(() => costingLines([original, reversal], accounts)).toThrow(/does not match/); });
it('rejects unsafe precision and totals above source capacity', () => {
    for (const n of [Infinity, NaN, 0.001, 1e30])
        expect(() => cents(n)).toThrow();
    expect(() => calculateJobCosting([entry('j', 'r', 0, 10)], accounts, jobs, [allocation('j', 10.01)], '2026-10-01', '2026-10-31')).toThrow(/exceeds/);
});
