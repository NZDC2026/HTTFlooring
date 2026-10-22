import { useSyncExternalStore } from 'react';
import { registerRepository } from '../security/repositoryHost';
import { recycleHistory, restoreRecycleHistory, type RecycleKind } from './recycleState';
export type RecycleRow = {
    kind: RecycleKind;
    party: string;
    reference: string;
    recordId: string;
    label: string;
    date: string;
    status: string;
    total: number;
    token: string;
    deleted: boolean;
    last?: ReturnType<typeof recycleHistory>[number];
    canWrite: boolean;
    issues: string[];
};
let version = 0;
const listeners = new Set<() => void>();
export const recycleClient = {
    preparePurge(_input: { records: {kind:RecycleKind;recordId:string;token:string}[] }): PurgePreview { throw new Error('Use the secure desktop application.'); },
    purge(_input: {operationId:string;records:{kind:RecycleKind;recordId:string;token:string}[];expectedDigest:string;reason:string;confirmation:string}): unknown { throw new Error('Use the secure desktop application.'); },
    list(): RecycleRow[] { throw new Error('Use the secure desktop application.'); },
    detail(_kind: RecycleKind, _recordId: string): unknown { throw new Error('Use the secure desktop application.'); },
    change(_input: {
        operationId: string;
        action: 'Trashed' | 'Recovered';
        reason: string;
        records: {
            kind: RecycleKind;
            recordId: string;
            token: string;
        }[];
    }): unknown { throw new Error('Use the secure desktop application.'); }
};
registerRepository('documentRecycle', { repository: recycleClient, read: 'inventory.read', commands: { list: 'inventory.read', detail: 'inventory.read', change: 'inventory.read', preparePurge:'users.manage', purge:'users.manage' }, snapshot: () => ({ history: recycleHistory() }), restore: v => restoreRecycleHistory(v.history), publish: () => { version++; listeners.forEach(f => f()); } });
export function useRecycleVersion() { return useSyncExternalStore(f => { listeners.add(f); return () => { listeners.delete(f); }; }, () => version, () => version); }

export type PurgePreview={digest:string;expiresAt:string;confirmation:string;eligible:boolean;rows:{kind:RecycleKind;recordId:string;token:string;label:string;blockers:string[]}[]};
