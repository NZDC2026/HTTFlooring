export const kinds = ['Quote', 'Purchase order', 'Sales order draft', 'Invoice draft', 'Expense bill draft'] as const;
export type RecycleKind = typeof kinds[number];
export const sources = { Quote: ['sales', 'quotes'], 'Purchase order': ['purchaseOrders', 'purchaseOrders'], 'Sales order draft': ['managedSalesDocuments', 'drafts'], 'Invoice draft': ['managedSalesDocuments', 'drafts'], 'Expense bill draft': ['expenseBillDrafts', 'drafts'] } as const;
export type RecycleEvent = {
    id: string;
    operationId: string;
    fingerprint: string;
    kind: RecycleKind;
    recordId: string;
    action: 'Trashed' | 'Recovered';
    actorId: string;
    at: string;
    reason: string;
    recordToken: string;
    contentToken: string;
};
let history: RecycleEvent[] = [];
export const recycleHistory = () => history;
export const restoreRecycleHistory = (value: RecycleEvent[]) => { history = value; };
export const isRecycled = (id: string) => history.findLast(e => e.recordId === id)?.action === 'Trashed';
// Main checks the authoritative lifecycle even when a renderer sends an old detail-page command.
export function assertNotRecycled(repository: string, args: unknown[]) {
    if (!['sales', 'purchaseOrders', 'managedSalesDocuments', 'expenseBillDrafts'].includes(repository))
        return;
    const visit = (v: unknown): boolean => typeof v === 'string' ? isRecycled(v) : Array.isArray(v) ? v.some(visit) : !!v && typeof v === 'object' && Object.values(v).some(visit);
    if (visit(args))
        throw new Error('This document is in the recycle bin. Recover it before using it.');
}
const visibleCache = new WeakMap<object, {
    history: RecycleEvent[];
    rows: any[];
}>();
export function visibleDocuments<T extends {
    id: string;
}>(rows: T[]): T[] {
    const old = visibleCache.get(rows);
    if (old?.history === history)
        return old.rows;
    const result = rows.filter(r => !isRecycled(r.id));
    visibleCache.set(rows, { history, rows: result });
    return result;
}
