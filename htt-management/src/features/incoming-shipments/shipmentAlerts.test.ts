import { describe, expect, it } from "vitest";
import { shipmentAlerts, shipmentAlertTiming } from "./shipmentAlerts";
import type { PurchaseOrder } from "../purchases/types/purchaseOrder";
const po = (id: string, eta: string, status = "SENT") => ({ id, expectedDeliveryDate: eta, status, purchaseOrderNumber: id, supplierName: "Test supplier" }) as PurchaseOrder;
describe("shipment reminders", () => {
    it("includes overdue, today and seven-day boundary, earliest first", () => {
        const result = shipmentAlerts([po("week", "2026-11-13"), po("late", "2026-11-04"), po("today", "2026-11-06"), po("later", "2026-11-14"), po("none", "")], "2026-11-06");
        expect(result.map(x => [x.id, x.days, x.overdue])).toEqual([["late", -2, true], ["today", 0, false], ["week", 7, false]]);
    });
    it("clears received, billed, cancelled and draft orders and follows edited ETA", () => {
        expect(shipmentAlerts(["RECEIVED", "BILLED", "CANCELLED", "DRAFT"].map(s => po(s, "2026-11-01", s)), "2026-11-06")).toEqual([]);
        expect(shipmentAlerts([po("updated", "2026-11-20"), po("partial", "2026-11-07", "PARTIALLY_RECEIVED")], "2026-11-06").map(x => x.id)).toEqual(["partial"]);
    });
    it("uses calendar days across month boundaries and labels today", () => {
        expect(shipmentAlerts([po("next", "2026-12-01")], "2026-11-30")[0].days).toBe(1);
        expect(shipmentAlertTiming(0)).toBe("Due today");
    });
});
