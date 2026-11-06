import type { PurchaseOrder } from "../purchases/types/purchaseOrder";
import { incomingStatuses } from "./shipmentEta";

/** Calendar-day comparisons avoid daylight-saving offsets. */
export function shipmentAlerts(orders: readonly PurchaseOrder[], today: string) {
    return orders.flatMap(order => {
        if (!incomingStatuses.some(status => status === order.status) || !order.expectedDeliveryDate) return [];
        const days = Math.round((Date.parse(`${order.expectedDeliveryDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000);
        if (!Number.isFinite(days) || days > 7) return [];
        return [{ id: order.id, number: order.purchaseOrderNumber, supplier: order.supplierName,
            eta: order.expectedDeliveryDate, days, overdue: days < 0 }];
    }).sort((a, b) => a.days - b.days || a.number.localeCompare(b.number));
}

export function shipmentAlertTiming(days: number) {
    return days < 0 ? `${-days} days overdue` : days === 0 ? "Due today" : `Due in ${days} days`;
}
