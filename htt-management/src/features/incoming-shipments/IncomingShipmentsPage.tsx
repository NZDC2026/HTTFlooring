import { SupplierShipments } from "./SupplierShipments";
import { businessSettings } from "../business-workspace/configurationState";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../components/data-table/DataTable";
import { Button } from "../../components/ui/Button";
import { usePurchaseOrders } from "../purchases/data/usePurchaseOrders";
import { purchaseOrderRepository } from "../purchases/data/purchaseOrderRepository";
import type { PurchaseOrder } from "../purchases/types/purchaseOrder";
import { PurchaseOrderStatusBadge } from "../purchases/components/PurchaseOrderStatusBadge";
import { usePermission } from "../security/usePermission";
import { businessDateKey } from "../../lib/businessDate";
import { incomingStatuses } from "./shipmentEta";

const incoming = (order: PurchaseOrder) => incomingStatuses.some(status=>status===order.status);
const timestamp = (value:string) => new Intl.DateTimeFormat("en-AU",{
    timeZone:businessSettings().timezone,dateStyle:"medium",timeStyle:"short",
}).format(new Date(value));
const fieldClass="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm";

export function IncomingShipmentsPage() {
    const orders=usePurchaseOrders();
    const canEdit=usePermission("purchases.write");
    const today=businessDateKey(new Date().toISOString());
    const [scope,setScope]=useState("Incoming");
    const [editor,setEditor]=useState<{id:string;eta:string;reason:string;expectedRevision:number;operationId:string}>();
    const [error,setError]=useState("");
    const shipments=orders.filter(order=>incoming(order)||["RECEIVED","BILLED"].includes(order.status));
    const filtered=shipments.filter(order=>scope==="All"||(scope==="Incoming"?incoming(order):!incoming(order)));
    const selected=orders.find(order=>order.id===editor?.id);
    const columns=useMemo<ColumnDef<PurchaseOrder>[]>(()=>[
        {accessorKey:"purchaseOrderNumber",header:"Purchase Order",cell:({row})=><Link className="underline" to={`/purchases/${row.original.id}`}>{row.original.purchaseOrderNumber}</Link>},
        {accessorKey:"supplierName",header:"Supplier"},
        {accessorKey:"expectedDeliveryDate",header:"ETA",cell:({row})=>{
            const order=row.original;
            return <span className={incoming(order)&&order.expectedDeliveryDate&&order.expectedDeliveryDate<today?"font-medium text-red-700":""}>{order.expectedDeliveryDate||"Not set"}</span>;
        }},
        {accessorKey:"status",header:"Status",cell:({row})=><PurchaseOrderStatusBadge status={row.original.status}/>},
        {id:"updatedBy",header:"Last ETA Update",cell:({row})=>{
            const last=row.original.etaHistory?.at(-1);
            return last ? <span>{last.actorName}<span className="block text-xs text-[var(--color-text-muted)]">{timestamp(last.at)}</span></span> : <span className="text-xs">From purchase order</span>;
        }},
        {id:"history",header:"History",cell:({row})=><details className="min-w-48 text-xs">
            <summary className="cursor-pointer">{row.original.etaHistory?.length??0} updates</summary>
            <ol className="mt-2 space-y-2">{[...(row.original.etaHistory??[])].reverse().map(event=><li key={event.operationId}>
                <p className="font-medium">{event.previousEta||"Not set"} → {event.eta}</p>
                <p>{event.reason}</p><p className="text-[var(--color-text-muted)]">{event.actorName} · {timestamp(event.at)}</p>
            </li>)}</ol>
        </details>},
        {id:"actions",header:"Actions",meta:{exportable:false},cell:({row})=>canEdit&&incoming(row.original)?<Button size="sm" variant="secondary" onClick={()=>{
            setEditor({id:row.original.id,eta:row.original.expectedDeliveryDate??"",reason:"",expectedRevision:row.original.etaHistory?.length??0,operationId:crypto.randomUUID()});
            setError("");
        }}>Update ETA</Button>:<span>—</span>},
    ],[canEdit,today]);
    return <div className="space-y-4 pb-8"><SupplierShipments/><details className="rounded-xl border border-[var(--color-border)] p-4"><summary className="cursor-pointer text-sm font-semibold">Purchase order ETA tracking · Existing records</summary><div className="mt-4 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)]">Purchases</p>
                <h1 className="font-display text-3xl">Incoming Shipment</h1>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">ETA starts with the purchase order’s expected delivery date. Confirm changes with your agency and update the date manually.</p>
            </div>
            <Link className="rounded-lg border bg-white px-4 py-2 text-sm" to="/purchases">Purchase orders</Link>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
            <label>Show <select aria-label="Shipment status" className={fieldClass} value={scope} onChange={event=>setScope(event.target.value)}>
                <option>Incoming</option><option>Received</option><option>All</option>
            </select></label>
            <span>{shipments.filter(incoming).length} incoming</span>
            <span className="text-red-700">{shipments.filter(order=>incoming(order)&&order.expectedDeliveryDate&&order.expectedDeliveryDate<today).length} past ETA</span>
        </div>
        {editor&&selected&&<form className="space-y-3 rounded-xl border bg-white p-4" onSubmit={event=>{
            event.preventDefault();
            try {purchaseOrderRepository.updateEta(editor);setEditor(undefined);setError("");}
            catch(error){setError(error instanceof Error?error.message:"Unable to update ETA.");}
        }}>
            <h2 className="font-semibold">Update ETA · {selected.purchaseOrderNumber}</h2>
            <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm">New ETA<input aria-label="New ETA" required type="date" min={selected.orderDate} className={fieldClass+" block w-full"} value={editor.eta} onChange={event=>setEditor({...editor,eta:event.target.value})}/></label>
                <label className="text-sm">Reason<input aria-label="ETA change reason" required minLength={3} maxLength={2000} className={fieldClass+" block w-full"} value={editor.reason} onChange={event=>setEditor({...editor,reason:event.target.value})}/></label>
            </div>
            {error&&<p role="alert" className="text-sm text-red-700">{error}</p>}
            <div className="flex gap-2"><Button type="submit">Save ETA</Button><Button type="button" variant="secondary" onClick={()=>setEditor(undefined)}>Cancel</Button></div>
        </form>}
        <DataTable data={filtered} columns={columns}
            capabilities={{id:"incoming-shipments",scope:"complete",permission:"purchases.read",rowId:row=>row.id}}
            search={{placeholder:"Search purchase order or supplier...",filterFn:(row,query)=>(row.purchaseOrderNumber+" "+row.supplierName).toLowerCase().includes(query)}}
            pagination={{pageSize:10}}/>
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h2 className="font-semibold text-amber-900">Sample · Incoming Shipment</h2>
            <p className="mt-1 text-xs text-amber-900">Read-only examples of a revised ETA and a received shipment.</p>
            <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm">
                <thead><tr><th className="p-2">Purchase Order</th><th className="p-2">Supplier</th><th className="p-2">Initial ETA</th><th className="p-2">Current ETA</th><th className="p-2">Status / History</th></tr></thead>
                <tbody>
                    <tr className="border-t border-amber-200"><td className="p-2">PO-SAMPLE-021</td><td className="p-2">Sample Timber Export</td><td className="p-2">18 Nov 2026</td><td className="p-2">21 Nov 2026</td><td className="p-2">In transit<details><summary className="cursor-pointer text-xs">Sample · 1 ETA update</summary><p className="mt-1 text-xs">Jamie · Purchasing · 06 Nov 2026, 09:30<br/>18 Nov → 21 Nov · Agency confirmed the revised vessel arrival date.</p></details></td></tr>
                    <tr className="border-t border-amber-200"><td className="p-2">PO-SAMPLE-019</td><td className="p-2">Sample Flooring Supply</td><td className="p-2">02 Nov 2026</td><td className="p-2">02 Nov 2026</td><td className="p-2">Received · Stock received 03 Nov 2026</td></tr>
                </tbody>
            </table></div>
        </section>
    </div></details></div>;
}
