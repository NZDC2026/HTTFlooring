import { useSyncExternalStore } from 'react';
import { registerRepository } from '../security/repositoryHost';
import type { Dataset, TransferPreview, TransferRun } from './transferModel';
let state: {
    runs: TransferRun[];
} = { runs: [] };
const listeners = new Set<() => void>();
export const transferClient = { subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }, getSnapshot: () => state,
    review(_raw: unknown): TransferPreview { throw new Error('Secure desktop required.'); },
    commit(_raw: unknown): TransferRun { throw new Error('Secure desktop required.'); },
    export(_dataset: Dataset): {
        dataset: Dataset;
        count: number;
        csv: string;
    } { throw new Error('Secure desktop required.'); },
    template(_dataset: Dataset): string { throw new Error('Secure desktop required.'); }
};
registerRepository('dataTransfers', { repository: transferClient, read: 'inventory.read', commands: { review: 'inventory.read', commit: 'inventory.read', export: 'inventory.read', template: 'inventory.read' }, snapshot: () => state, restore: v => { state = v; }, publish: () => listeners.forEach(fn => fn()) });
export const useTransferRuns = () => useSyncExternalStore(transferClient.subscribe, transferClient.getSnapshot, transferClient.getSnapshot).runs;
