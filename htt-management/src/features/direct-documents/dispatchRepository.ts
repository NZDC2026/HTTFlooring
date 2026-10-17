import { isStockLine } from '../inventory/data/itemTypes';
import { useSyncExternalStore } from 'react';
import { z } from 'zod';
import { registerRepository } from '../security/repositoryHost';
import { salesRepository } from '../sales/data/salesRepository';
import { salesFulfilmentRepository } from '../sales/data/salesFulfilmentRepository';
import { assertPostingPeriod } from '../accounting/data/accountingPeriodRepository';
import { assertCurrentCrossModuleWriteSafe } from '../integration/crossModuleWriteGate';
import { requireDateKey } from '../../lib/businessDate';
const text = z.string().trim().min(1).max(200);
const inputSchema = z.object({ operationId: text, salesOrderId: text, siteId: text, fulfilmentDate: text, lines: z.array(z.object({ salesOrderLineId: text, fulfilledQuantity: z.number().positive().finite() }).strict()).min(1).max(500) }).strict();
function currentOrders() { return salesRepository.getAll().filter(d => d.type === 'SALES_ORDER' && ['CONFIRMED', 'PARTIALLY_FULFILLED', 'INVOICED'].includes(d.status)).filter(d => d.type === 'SALES_ORDER' && (d.status !== 'INVOICED' || d.invoiceIds.some(id => { const invoice = salesRepository.getById(id); return invoice?.type === 'INVOICE' && invoice.status !== 'VOID'; }))).map(d => ({ id: d.id, number: d.documentNumber, date: d.documentDate, delivery: d.recipient?.deliveryAddress, store: d.recipient?.locationName, lines: d.lines.filter(isStockLine).map(l => ({ id: l.id, sku: l.sku, description: l.description, unit: l.unitSymbol, quantity: l.quantity, fulfilled: salesFulfilmentRepository.getAll().filter(f => f.salesOrderId === d.id && f.status === 'ACTIVE').flatMap(f => f.lines).filter(line => line.salesOrderLineId === l.id).reduce((n, line) => n + line.fulfilledQuantity, 0) })) })).filter(o=>o.lines.length>0); }
export type DispatchOrder = ReturnType<typeof currentOrders>[number];
let orders: DispatchOrder[] = currentOrders(), requests: {
    id: string;
    fingerprint: string;
    fulfilmentId: string;
}[] = [], version = 0;
const listeners = new Set<() => void>();
const emit = () => { version++; listeners.forEach(f => f()); };
export function useDispatchOrders() { useSyncExternalStore(f => { listeners.add(f); return () => { listeners.delete(f); }; }, () => version, () => version); return orders; }
export const dispatchRepository = { record(raw: z.input<typeof inputSchema>) {
        const input = inputSchema.parse(raw), fingerprint = JSON.stringify(input), old = requests.find(r => r.id === input.operationId);
        if (old) {
            if (old.fingerprint !== fingerprint)
                throw new Error('Dispatch operation ID was already used with different data.');
            return salesFulfilmentRepository.getAll().find(f => f.id === old.fulfilmentId)!;
        }
        assertCurrentCrossModuleWriteSafe();
        requireDateKey(input.fulfilmentDate);
        assertPostingPeriod(input.fulfilmentDate);
        if (new Set(input.lines.map(l => l.salesOrderLineId)).size !== input.lines.length)
            throw new Error('Each dispatch line must be selected only once.');
        const fulfilment = salesFulfilmentRepository.create(input);
        requests = [...requests, { id: input.operationId, fingerprint, fulfilmentId: fulfilment.id }];
        emit();
        return fulfilment;
    }, reverse(input: {
        fulfilmentId: string;
        voidDate: string;
        reason: string;
    }) {
        const raw = z.object({ fulfilmentId: text, voidDate: text, reason: z.string().trim().min(3).max(1000) }).strict().parse(input);
        assertCurrentCrossModuleWriteSafe();
        requireDateKey(raw.voidDate);
        assertPostingPeriod(raw.voidDate);
        const prior = salesFulfilmentRepository.getAll().find(f => f.id === raw.fulfilmentId);
        if (prior?.status === 'VOIDED')
            return prior;
        return salesFulfilmentRepository.void(raw);
    } };
registerRepository('salesDispatch', { repository: dispatchRepository, read: 'inventory.read', commands: { record: 'inventory.adjust', reverse: 'inventory.adjust' }, snapshot: () => ({ orders: currentOrders(), requests }), restore: v => { orders = v.orders; requests = v.requests; }, publish: emit, validate: (v, snapshots) => {
        const s = z.object({ orders: z.array(z.object({ id: text, number: text, date: text, delivery: z.string().optional(), store: z.string().optional(), lines: z.array(z.object({ id: text, sku: z.string(), description: z.string(), unit: z.string(), quantity: z.number().finite().positive(), fulfilled: z.number().finite().nonnegative() }).strict()) }).strict()), requests: z.array(z.object({ id: text, fingerprint: z.string().max(1000000), fulfilmentId: text }).strict()) }).strict().parse(v);
        const fulfilments = (snapshots.fulfilments as {
            fulfilments: {
                id: string;
            }[];
        }).fulfilments;
        if (s.requests.some(r => !fulfilments.some(f => f.id === r.fulfilmentId)))
            throw new Error('Dispatch result reference is invalid.');
    } });
