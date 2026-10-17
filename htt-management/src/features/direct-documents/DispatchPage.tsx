import { useState } from 'react';
import { BusinessFrame } from '../business-workspace/MasterDataPages';
import { Notice } from '../page-previews/PreviewWorkspace';
import { Panel, Field, SampleTable, Cell, fieldClass, buttonClass } from '../prototype/PrototypeUI';
import { useDispatchOrders, dispatchRepository } from './dispatchRepository';
import { inventorySiteRepository } from '../inventory/data/inventorySiteRepository';
import { salesFulfilmentRepository } from '../sales/data/salesFulfilmentRepository';
import { usePermission } from '../security/usePermission';
import { businessDateKey } from '../../lib/businessDate';
export function DispatchPage() {
    const orders = useDispatchOrders(), canWrite = usePermission('inventory.adjust'), [orderId, setOrderId] = useState(''), [site, setSite] = useState(inventorySiteRepository.getActive()[0]?.id ?? ''), [date, setDate] = useState(businessDateKey(new Date().toISOString())), [quantities, setQuantities] = useState<Record<string, string>>({}), [operationId, setOperationId] = useState(() => crypto.randomUUID()), [reason, setReason] = useState(''), [error, setError] = useState(''), [notice, setNotice] = useState(''), order = orders.find(o => o.id === orderId), fulfilments = salesFulfilmentRepository.getAll();
    return <BusinessFrame title="Sales dispatch & fulfilments"><Notice error>{error}</Notice><Notice>{notice}</Notice><Panel title="Dispatch stock"><p className="text-sm">Confirm physical dispatch here. Quantities, inventory valuation and COGS post together. Invoices already issued remain linked; issuing an invoice alone does not dispatch stock. Reverse an active invoice before reversing its dispatch.</p><div className="grid gap-4 md:grid-cols-3"><Field label="Sales order"><select className={fieldClass} value={orderId} onChange={e => { setOrderId(e.target.value); setQuantities({}); setOperationId(crypto.randomUUID()); }}><option value="">Select order…</option>{orders.filter(o => o.lines.some(l => l.quantity > l.fulfilled)).map(o => <option key={o.id} value={o.id}>{o.number}</option>)}</select></Field><Field label="Dispatch site"><select className={fieldClass} value={site} onChange={e => { setSite(e.target.value); setOperationId(crypto.randomUUID()); }}>{inventorySiteRepository.getActive().map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field><Field label="Dispatch / reversal date"><input className={fieldClass} type="date" value={date} onChange={e => { setDate(e.target.value); setOperationId(crypto.randomUUID()); }}/></Field></div>{order && <SampleTable headers={['SKU', 'Description', 'Ordered', 'Dispatched', 'Dispatch quantity']}>{order.lines.map(l => <tr key={l.id}><Cell>{l.sku}</Cell><Cell>{l.description}</Cell><Cell>{l.quantity} {l.unit}</Cell><Cell>{l.fulfilled}</Cell><Cell><input aria-label={'Dispatch ' + l.sku} className={fieldClass} type="number" min="0" max={Math.max(0, l.quantity - l.fulfilled)} step="0.0001" disabled={!canWrite} value={quantities[l.id] ?? ''} onChange={e => { setQuantities({ ...quantities, [l.id]: e.target.value }); setOperationId(crypto.randomUUID()); }}/></Cell></tr>)}</SampleTable>}{canWrite && <button className={buttonClass} disabled={!order} onClick={() => {
                try {
                    const f = dispatchRepository.record({ operationId, salesOrderId: orderId, siteId: site, fulfilmentDate: date, lines: Object.entries(quantities).filter(([, v]) => Number(v) > 0).map(([salesOrderLineId, v]) => ({ salesOrderLineId, fulfilledQuantity: Number(v) })) });
                    setNotice('Dispatch ' + f.fulfilmentNumber + ' posted with inventory and COGS.');
                    setError('');
                    setOrderId('');
                    setQuantities({});
                    setOperationId(crypto.randomUUID());
                }
                catch (e) {
                    setError((e as Error).message);
                }
            }}>Record dispatch</button>}</Panel><Panel title="Dispatch history"><Field label="Reversal reason"><input className={fieldClass} value={reason} onChange={e => setReason(e.target.value)}/></Field><SampleTable headers={['Number', 'Order', 'Date', 'Status', 'Action']} empty={!fulfilments.length}>{fulfilments.map(f => <tr key={f.id}><Cell>{f.fulfilmentNumber}</Cell><Cell>{f.salesOrderNumber}</Cell><Cell>{f.fulfilmentDate}</Cell><Cell>{f.status}</Cell><Cell>{canWrite && f.status === 'ACTIVE' && <button className={buttonClass} disabled={reason.trim().length < 3} onClick={() => {
                    try {
                        dispatchRepository.reverse({ fulfilmentId: f.id, voidDate: date, reason });
                        setNotice('Dispatch reversed; quantities and costs restored.');
                        setError('');
                    }
                    catch (e) {
                        setError((e as Error).message);
                    }
                }}>Reverse dispatch</button>}</Cell></tr>)}</SampleTable></Panel></BusinessFrame>;
}
