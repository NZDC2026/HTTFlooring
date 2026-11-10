import { useEffect, useId, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { feedback } from "../../components/ui/feedback";
import { businessSettings, type ConfigRow } from "../business-workspace/configurationState";
import { useWorkspaceRecords, workspaceRepositories } from "../business-workspace/workspaceRepository";
import { useCustomerSalesDocuments } from "../sales/data/useSalesDocuments";
import { nativeRequest } from "../security/repositoryHost";
import { usePermission } from "../security/usePermission";
import { useSecurity } from "../security/securityClient";
import { taskLocalTime } from "./deliveryTaskTime";

const tasks = workspaceRepositories.tasks;
const inputClass = "rounded-lg border border-[var(--color-border)] bg-white p-2 text-sm";
type Assignee = { id: string; displayName: string };

function complete(task: ConfigRow) {
    try {
        tasks.setStatus(task.id, "Completed", task.revision);
        feedback.success("Delivery task completed.");
    } catch (error) {
        feedback.error(error instanceof Error ? error.message : "Unable to complete the task.");
    }
}

export function DeliveryTasks({ customerId, orderId }: { customerId: string; orderId?: string }) {
    const records = useWorkspaceRecords("tasks");
    const orders = useCustomerSalesDocuments(customerId).filter(document => document.type === "SALES_ORDER");
    const canWrite = usePermission("sales.write");
    const [editing, setEditing] = useState<ConfigRow | null | undefined>(undefined);
    const visible = records.filter(task => task.orderId && task.customerId === customerId && (!orderId || task.orderId === orderId))
        .sort((a, b) => a.deliveryAt.localeCompare(b.deliveryAt));

    return <Card><CardContent>
        <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl">Delivery tasks</h2>
            {canWrite && editing === undefined && <Button size="sm" variant="secondary" onClick={() => setEditing(null)}>Schedule delivery</Button>}
        </div>
        {editing !== undefined && <DeliveryTaskForm customerId={customerId} orderId={orderId} task={editing} onClose={() => setEditing(undefined)}/>}
        <ul className="mt-3 divide-y divide-[var(--color-border)]">
            {visible.map(task => <li key={task.id} className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm">
                <div className="min-w-0 space-y-1">
                    <Link className="font-medium underline" to={`/sales/orders/${task.orderId}`}>{task.name}</Link>
                    <p>{task.deliveryAt.replace("T", " ")} · {task.reminderTimeZone}</p>
                    <p className="whitespace-pre-wrap break-words">{task.deliveryAddress}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{task.ownerName || task.owner} · {task.status} · Reminder {task.reminderAt.replace("T", " ")}</p>
                    {task.notes !== "Delivery scheduled" && <p className="whitespace-pre-wrap break-words text-xs">{task.notes}</p>}
                </div>
                {canWrite && task.status !== "Completed" && <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setEditing(task)}>Edit</Button>
                    <Button size="sm" onClick={() => complete(task)}>Mark complete</Button>
                </div>}
            </li>)}
        </ul>
        {!visible.length && <p className="mt-2 text-sm text-[var(--color-text-secondary)]">No delivery tasks yet.</p>}
        {!orders.length && editing === undefined && <p className="mt-2 text-xs text-[var(--color-text-secondary)]">A sales order is required to schedule delivery.</p>}
    </CardContent></Card>;
}

function DeliveryTaskForm({ customerId, orderId, task, onClose }: {
    customerId: string; orderId?: string; task: ConfigRow | null; onClose: () => void;
}) {
    const orders = useCustomerSalesDocuments(customerId).filter(document => document.type === "SALES_ORDER" && document.status !== "CANCELLED");
    const { session } = useSecurity();
    const [assignees, setAssignees] = useState<Assignee[]>([]);
    const [selectedOrder, setSelectedOrder] = useState(task?.orderId ?? orderId ?? "");
    const [owner, setOwner] = useState(task?.owner ?? session?.user.id ?? "");
    const [deliveryAt, setDeliveryAt] = useState(task?.deliveryAt ?? "");
    const [reminderAt, setReminderAt] = useState(task?.reminderAt ?? "");
    const [address, setAddress] = useState(task?.deliveryAddress ?? orders.find(order => order.id === selectedOrder)?.recipient?.deliveryAddress ?? "");
    const [notes, setNotes] = useState(task?.notes === "Delivery scheduled" ? "" : task?.notes ?? "");
    const [error, setError] = useState("");
    const zone = task?.reminderTimeZone ?? businessSettings().timezone;
    useEffect(() => {
        try { setAssignees(nativeRequest<Assignee[]>("tasks.assignees")); }
        catch (error) { setError(error instanceof Error ? error.message : "Unable to load staff."); }
    }, []);

    function save(event: FormEvent) {
        event.preventDefault();
        const order = orders.find(item => item.id === selectedOrder);
        const assignee = assignees.find(item => item.id === owner);
        if (!order || !assignee) {
            setError("Select an order and an active staff member.");
            return;
        }
        try {
            tasks.save({
                ...(task ?? {}),
                name: `Delivery · ${order.documentNumber}`,
                customerId, orderId: order.id, owner, ownerName: assignee.displayName,
                deliveryAt, due: deliveryAt.slice(0, 10), deliveryAddress: address.trim(),
                reminderAt: reminderAt || deliveryAt, reminderTimeZone: zone, snoozedUntil: "",
                priority: task?.priority ?? "Normal", notes: notes.trim() || "Delivery scheduled",
            }, task?.revision);
            feedback.success("Delivery task saved.");
            onClose();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unable to save delivery.");
        }
    }

    return <form onSubmit={save} className="mt-4 space-y-3 rounded-xl border border-[var(--color-border)] p-4">
        <p className="text-xs text-[var(--color-text-secondary)]">Delivery and reminder times use {zone}.</p>
        <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">Sales order
                <select required className={inputClass} value={selectedOrder} onChange={event => {
                    setSelectedOrder(event.target.value);
                    setAddress(orders.find(order => order.id === event.target.value)?.recipient?.deliveryAddress ?? "");
                }}>
                    <option value="">Select an order</option>
                    {orders.map(order => <option key={order.id} value={order.id}>{order.documentNumber}</option>)}
                </select>
            </label>
            <label className="grid gap-1 text-sm">Assigned to
                <select required className={inputClass} value={owner} onChange={event => setOwner(event.target.value)}>
                    <option value="">Select staff</option>
                    {assignees.map(item => <option key={item.id} value={item.id}>{item.displayName}</option>)}
                </select>
            </label>
            <label className="grid gap-1 text-sm">Delivery time<input required type="datetime-local" className={inputClass} value={deliveryAt} onChange={event => setDeliveryAt(event.target.value)}/></label>
            <label className="grid gap-1 text-sm">Reminder time (defaults to delivery)<input type="datetime-local" className={inputClass} value={reminderAt} onChange={event => setReminderAt(event.target.value)}/></label>
        </div>
        <label className="grid gap-1 text-sm">Delivery address<input required maxLength={500} className={inputClass} value={address} onChange={event => setAddress(event.target.value)}/></label>
        <label className="grid gap-1 text-sm">Delivery instructions<textarea maxLength={2000} className={inputClass} value={notes} onChange={event => setNotes(event.target.value)}/></label>
        {error && <p role="alert" className="text-sm text-[var(--color-danger)]">{error}</p>}
        <div className="flex gap-2"><Button type="submit">Save delivery</Button><Button variant="secondary" onClick={onClose}>Cancel</Button></div>
    </form>;
}

export function DeliveryReminder() {
    const { session } = useSecurity();
    const records = useWorkspaceRecords("tasks");
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const refresh = () => setNow(new Date());
        const timer = window.setInterval(refresh, 5000);
        window.addEventListener("focus", refresh);
        document.addEventListener("visibilitychange", refresh);
        return () => {
            window.clearInterval(timer);
            window.removeEventListener("focus", refresh);
            document.removeEventListener("visibilitychange", refresh);
        };
    }, []);
    const task = session && document.visibilityState === "visible" ? records.find(record =>
        record.reminderAt && record.reminderTimeZone && record.owner === session.user.id && record.status !== "Completed" && record.status !== "Inactive" &&
        record.reminderAt <= taskLocalTime(now, record.reminderTimeZone) &&
        (!record.snoozedUntil || Date.parse(record.snoozedUntil) <= now.getTime()),
    ) : undefined;
    if (!task) return null;

    return <DeliveryReminderDialog
        name={task.name}
        title={task.orderId ? "Delivery reminder" : "Task reminder"}
        deliveryAt={task.deliveryAt || task.reminderAt}
        timeZone={task.reminderTimeZone}
        address={task.deliveryAddress || task.notes}
        onSnooze={() => {
            try {
                tasks.save({ ...task, snoozedUntil: new Date(Date.now() + 15 * 60_000).toISOString() }, task.revision);
            } catch (error) {
                feedback.error(error instanceof Error ? error.message : "Unable to snooze the task.");
            }
        }}
        onComplete={() => complete(task)}
    />;
}

export function DeliveryReminderDialog({ name, deliveryAt, timeZone, address, title = "Delivery reminder", sample, onSnooze, onComplete, onClose }: {
    name: string;
    title?: string;
    deliveryAt: string;
    timeZone: string;
    address: string;
    sample?: boolean;
    onSnooze: () => void;
    onComplete: () => void;
    onClose?: () => void;
}) {
    const titleId = useId();
    return <div className="fixed inset-0 z-[60] grid place-items-center bg-black/25 p-4">
        <section role="dialog" aria-modal="true" aria-labelledby={titleId} className="w-full max-w-md rounded-xl border bg-white p-5 shadow-lg">
            <h2 id={titleId} className="font-display text-xl">{title} {sample && <span className="rounded bg-amber-100 px-2 py-1 font-sans text-xs text-amber-900">Sample</span>}</h2>
            <p className="mt-3 font-medium">{name}</p>
            <p className="mt-1 text-sm">{deliveryAt.replace("T", " ")} · {timeZone}</p>
            <p className="mt-1 break-words text-sm">{address}</p>
            <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={onSnooze}>Remind in 15 min</Button>
                <Button onClick={onComplete}>Mark complete</Button>
                {onClose && <Button variant="ghost" onClick={onClose}>Close preview</Button>}
            </div>
        </section>
    </div>;
}
