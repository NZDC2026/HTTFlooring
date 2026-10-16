import { useSyncExternalStore } from 'react';
import { useProducts } from '../../business-workspace/productRepository';
import { stockRepository } from '../../inventory/data/stockRepository';
import { calculateInventoryHealth } from '../data/inventoryHealth';
import { ArrowRight, Boxes, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui/Card";

export function InventoryHealthCard() {
    const products=useProducts();
    const balances=useSyncExternalStore(stockRepository.subscribe,stockRepository.getSnapshot,stockRepository.getSnapshot);
    const counts=calculateInventoryHealth(products,balances);
    const inventoryHealth=[{label:'Healthy stock',count:counts.healthy,color:'bg-[var(--color-success)]'},{label:'Low stock',count:counts.low,color:'bg-[var(--color-warning)]'},{label:'Out of stock',count:counts.out,color:'bg-[var(--color-danger)]'}].map(row=>({...row,percent:counts.total?row.count/counts.total*100:0}));
    return (
        <Card><CardContent>
            <div className="flex items-start justify-between gap-3">
                <div><h2 className="font-display text-xl">Inventory Health</h2><p className="mt-1 text-xs text-[var(--color-text-muted)]">{counts.total} active stocked SKUs · all sites</p></div>
                <div className="rounded-lg bg-[var(--color-primary-soft)] p-2 text-[var(--color-primary)]"><Boxes size={18} /></div>
            </div>
            <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-[var(--color-surface-muted)]" role="img" aria-label={`${counts.healthy} healthy, ${counts.low} low stock, ${counts.out} out of stock`}>
                {inventoryHealth.map((item) => <div key={item.label} className={item.color} style={{ width: `${item.percent}%` }} />)}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
                {inventoryHealth.map((item) => <div key={item.label} className="rounded-lg bg-[var(--color-surface-muted)] p-3"><div className="text-xl font-semibold">{item.count}</div><div className="mt-1 text-xs text-[var(--color-text-secondary)]">{item.label}</div></div>)}
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-[var(--color-warning-soft)] px-3 py-2 text-xs"><span className="flex items-center gap-2"><AlertTriangle size={15} />{counts.low+counts.out} SKUs need attention</span><Link to="/inventory" className="inline-flex items-center gap-1 font-semibold underline underline-offset-2">Review stock <ArrowRight size={13}/></Link></div>
        </CardContent></Card>
    );
}
