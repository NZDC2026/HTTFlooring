import { businessDateKey, requireDateKey } from '../../lib/businessDate';
export type AnalysisDocument = {
    id: string;
    number: string;
    partyId: string;
    partyName: string;
    kind: 'INVOICE' | 'BILL' | 'CUSTOMER_CREDIT' | 'SUPPLIER_CREDIT';
    date: string;
    status: string;
    voidedAt?: string;
    openingBalanceImportId?: string;
    subtotal: number;
    tax: number;
    total: number;
    path: string;
};
export type AnalysisEvent = Omit<AnalysisDocument, 'date' | 'voidedAt' | 'openingBalanceImportId'> & {
    eventId: string;
    date: string;
    event: 'DOCUMENT' | 'CREDIT' | 'VOID';
};
const cents = (n: number) => Math.round(n * 100);
function values(doc: AnalysisDocument) {
    for (const n of [doc.subtotal, doc.tax, doc.total])
        if (!Number.isFinite(n) || n < 0 || Math.abs(n * 100 - cents(n)) > 0.000001)
            throw new Error(`${doc.number}: invalid saved monetary totals.`);
    if (cents(doc.subtotal) + cents(doc.tax) !== cents(doc.total))
        throw new Error(`${doc.number}: saved net, tax and gross do not reconcile.`);
}
/** Document activity, not AR/AP outstanding, expense recognition, profit or cash flow. */
export function analysisEvents(documents: AnalysisDocument[]): AnalysisEvent[] {
    const ids = new Set<string>(), events: AnalysisEvent[] = [];
    for (const d of documents) {
        if (d.status === 'DRAFT' || d.openingBalanceImportId)
            continue;
        const key = `${d.kind}:${d.id}`;
        if (ids.has(key))
            throw new Error(`Duplicate analysis source: ${d.number}.`);
        ids.add(key);
        requireDateKey(d.date, `Document date (${d.number})`);
        values(d);
        const credit = d.kind === 'CUSTOMER_CREDIT' || d.kind === 'SUPPLIER_CREDIT', sign = credit ? -1 : 1;
        const { voidedAt: _voidedAt, openingBalanceImportId: _opening, ...base } = d;
        const event = (date: string, multiplier: number, type: AnalysisEvent['event']): AnalysisEvent => ({ ...base, date, eventId: `${key}:${type}`, event: type, subtotal: cents(d.subtotal) * multiplier / 100, tax: cents(d.tax) * multiplier / 100, total: cents(d.total) * multiplier / 100 });
        events.push(event(d.date, sign, credit ? 'CREDIT' : 'DOCUMENT'));
        if (d.status === 'VOID') {
            if (!d.voidedAt)
                throw new Error(`${d.number}: void date is missing. Review the source record before reporting.`);
            const date = businessDateKey(d.voidedAt);
            requireDateKey(date, `Void date (${d.number})`);
            if (date < d.date)
                throw new Error(`${d.number}: void date precedes the original document.`);
            events.push(event(date, -sign, 'VOID'));
        }
    }
    return events.sort((a, b) => a.date.localeCompare(b.date) || a.number.localeCompare(b.number) || a.eventId.localeCompare(b.eventId));
}
export function calculateNetAnalysis(documents: AnalysisDocument[], input: {
    from: string;
    to: string;
    partyId?: string;
    query?: string;
    event?: AnalysisEvent['event'] | 'ALL';
}) {
    requireDateKey(input.from, 'From date');
    requireDateKey(input.to, 'To date');
    if (input.from > input.to)
        throw new Error('From date must not exceed To date.');
    const query = input.query?.trim().toLowerCase() ?? '';
    const all = analysisEvents(documents);
    const events = all.filter(e => e.date >= input.from && e.date <= input.to && (!input.partyId || e.partyId === input.partyId) && (!input.event || input.event === 'ALL' || e.event === input.event) && `${e.number} ${e.partyName} ${e.partyId} ${e.kind}`.toLowerCase().includes(query));
    const sum = (rows: AnalysisEvent[], key: 'subtotal' | 'tax' | 'total') => rows.reduce((n, e) => n + cents(e[key]), 0) / 100;
    const totals = { subtotal: sum(events, 'subtotal'), tax: sum(events, 'tax'), total: sum(events, 'total') };
    const byParty = new Map<string, AnalysisEvent[]>();
    for (const e of events)
        byParty.set(e.partyId, [...(byParty.get(e.partyId) ?? []), e]);
    const parties = [...byParty].map(([id, rows]) => ({ id, name: rows[rows.length - 1].partyName, events: rows.length, documents: new Set(rows.map(r => `${r.kind}:${r.id}`)).size, subtotal: sum(rows, 'subtotal'), tax: sum(rows, 'tax'), total: sum(rows, 'total') })).sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
    const movements = (['DOCUMENT', 'CREDIT', 'VOID'] as const).map(type => ({ type, count: events.filter(e => e.event === type).length, subtotal: sum(events.filter(e => e.event === type), 'subtotal'), tax: sum(events.filter(e => e.event === type), 'tax'), total: sum(events.filter(e => e.event === type), 'total') }));
    return { ...input, events, parties, totals, movements };
}
