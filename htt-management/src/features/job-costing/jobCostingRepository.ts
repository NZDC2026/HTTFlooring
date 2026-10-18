import { z } from 'zod';
import { useSyncExternalStore } from 'react';
import { registerRepository } from '../security/repositoryHost';
import { trustedAuthorization } from '../security/trustedAuthorization';
import { journalEntryRepository } from '../accounting/data/journalEntryRepository';
import { accountRepository } from '../accounting/data/accountRepository';
import { configurationRows, type ConfigRow } from '../business-workspace/configurationState';
import type { JournalEntry } from '../accounting/types/journalEntry';
import type { Account } from '../accounting/types/account';
import { costingLines, calculateJobCosting, cents } from './jobCostingService';
const id = z.string().trim().min(1).max(200), reason = z.string().trim().min(1).max(2000), date = z.string().refine(v => { const d = new Date(v); return Number.isFinite(d.getTime()) && d.toISOString() === v; });
const split = z.object({ jobId: id, amount: z.number().finite().positive().refine(v => {
        try {
            cents(v);
            return true;
        }
        catch {
            return false;
        }
    }) }).strict();
const record = z.object({ id, journalId: id, lineId: id, revision: z.number().int().positive(), splits: z.array(split).max(100), updatedAt: date, updatedBy: id }).strict();
const historySchema = z.object({ id, operationId: id, recordId: id, revision: z.number().int().positive(), at: date, actorId: id, reason, fingerprint: z.string().max(3000000), before: z.array(split), after: z.array(split) }).strict();
const saveSchema = z.object({ operationId: id, journalId: id, lineId: id, expectedRevision: z.number().int().nonnegative(), expectedSource: z.string().max(2000000), splits: z.array(split).max(100), reason }).strict();
let allocations: z.infer<typeof record>[] = [], history: z.infer<typeof historySchema>[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(fn => fn());
const publish = emit;
function checkSplits(splits: z.infer<typeof split>[], capacity: number, jobs: ConfigRow[]) {
    if (new Set(splits.map(s => s.jobId)).size !== splits.length)
        throw new Error('Use one split per project.');
    if (splits.some(s => !jobs.some(j => j.id === s.jobId)))
        throw new Error('Project was not found.');
    if (splits.reduce((n, s) => n + cents(s.amount), 0) > cents(capacity))
        throw new Error('Project splits exceed the source amount.');
}
export const jobCostingRepository = { subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }, getSnapshot: () => allocations,
    review() { trustedAuthorization.require('accounting.read'); return { lines: costingLines(journalEntryRepository.getAll(), accountRepository.getAll()), allocations: structuredClone(allocations), history: structuredClone(history) }; },
    report(raw: unknown) { trustedAuthorization.require('accounting.read'); const input = z.object({ from: z.string(), to: z.string() }).strict().parse(raw); return calculateJobCosting(journalEntryRepository.getAll(), accountRepository.getAll(), configurationRows.jobs, allocations, input.from, input.to); },
    save(raw: unknown) {
        const actor = trustedAuthorization.require('accounting.post'), input = saveSchema.parse(raw), fingerprint = JSON.stringify(input), prior = history.find(h => h.operationId === input.operationId);
        if (prior) {
            if (prior.fingerprint !== fingerprint)
                throw new Error('Operation ID already has different allocation data.');
            return allocations.find(a => a.id === prior.recordId)!;
        }
        const line = costingLines(journalEntryRepository.getAll(), accountRepository.getAll()).find(l => l.journalId === input.journalId && l.lineId === input.lineId);
        if (!line)
            throw new Error('Select a posted revenue or expense line.');
        if (line.reversal)
            throw new Error('Allocate the original line; reversal entries inherit its splits.');
        if (input.expectedSource !== line.signature)
            throw new Error('Source journal changed. Refresh before allocating.');
        const old = allocations.find(a => a.journalId === line.journalId && a.lineId === line.lineId);
        if ((old?.revision ?? 0) !== input.expectedRevision)
            throw new Error('Allocation changed. Refresh before saving.');
        checkSplits(input.splits, line.capacity, configurationRows.jobs);
        for (const s of input.splits) {
            const job = configurationRows.jobs.find(j => j.id === s.jobId)!;
            if (job.status !== 'Active' && old?.splits.find(p => p.jobId === s.jobId)?.amount !== s.amount)
                throw new Error('Only active projects can receive new or changed allocations.');
        }
        const at = new Date().toISOString();
        if (old && at < old.updatedAt)
            throw new Error('System clock precedes the last allocation update.');
        const row = { id: old?.id ?? crypto.randomUUID(), journalId: line.journalId, lineId: line.lineId, revision: (old?.revision ?? 0) + 1, splits: input.splits, updatedBy: actor.userId, updatedAt: at };
        allocations = [...allocations.filter(a => a.id !== row.id), row];
        history = [...history, { id: crypto.randomUUID(), operationId: input.operationId, recordId: row.id, revision: row.revision, at, actorId: actor.userId, reason: input.reason, fingerprint, before: old?.splits ?? [], after: input.splits }];
        publish();
        return row;
    }
};
export const useJobAllocations = () => useSyncExternalStore(jobCostingRepository.subscribe, jobCostingRepository.getSnapshot, jobCostingRepository.getSnapshot);
registerRepository('jobCosting', { repository: jobCostingRepository, read: 'accounting.read', commands: { review: 'accounting.read', report: 'accounting.read', save: 'accounting.post' }, snapshot: () => ({ allocations, history }), restore: v => { allocations = v.allocations; history = v.history; }, publish, validate: (raw, snapshots) => {
        const data = z.object({ allocations: z.array(record), history: z.array(historySchema) }).strict().parse(raw), jobs = (snapshots.workspace_jobs as {
            records: ConfigRow[];
        }).records, lines = costingLines((snapshots.journals as {
            journalEntries: JournalEntry[];
        }).journalEntries, (snapshots.accounts as {
            accounts: Account[];
        }).accounts), keys = new Set<string>(), operations = new Set<string>();
        for (const row of data.allocations) {
            const line = lines.find(l => l.journalId === row.journalId && l.lineId === row.lineId), key = row.journalId + ':' + row.lineId;
            if (!line || line.reversal || keys.has(key))
                throw new Error('Invalid project source reference.');
            keys.add(key);
            checkSplits(row.splits, line.capacity, jobs);
            const events = data.history.filter(h => h.recordId === row.id);
            if (events.length !== row.revision)
                throw new Error('Invalid allocation history length.');
            let previous: z.infer<typeof split>[] = [];
            let at = '';
            for (const [index, e] of events.entries()) {
                const request = saveSchema.parse(JSON.parse(e.fingerprint));
                if (e.revision !== index + 1 || e.at < at || JSON.stringify(e.before) !== JSON.stringify(previous) || request.journalId !== row.journalId || request.lineId !== row.lineId || request.operationId !== e.operationId || request.expectedRevision !== index || request.reason !== e.reason || JSON.stringify(request.splits) !== JSON.stringify(e.after))
                    throw new Error('Invalid allocation history chain.');
                checkSplits(e.after, line.capacity, jobs);
                previous = e.after;
                at = e.at;
            }
            const last = events.at(-1)!;
            if (JSON.stringify(previous) !== JSON.stringify(row.splits) || last.at !== row.updatedAt || last.actorId !== row.updatedBy)
                throw new Error('Allocation outcome differs from audit history.');
        }
        for (const h of data.history) {
            if (operations.has(h.operationId) || !data.allocations.some(a => a.id === h.recordId))
                throw new Error('Invalid allocation operation reference.');
            operations.add(h.operationId);
        }
    } });
