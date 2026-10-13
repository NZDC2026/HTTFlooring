import {
    describe,
    expect,
    it,
} from "vitest";

import {
    calculateMovingWeightedAverage,
    roundInventoryQuantity,
    roundInventoryValue,
} from "./inventoryCostCalculations";

describe("6J-A Inventory Cost Calculations", () => {
    it("calculates moving weighted average after two receipts", () => {
        const averageCost =
            calculateMovingWeightedAverage({
                currentQuantity: 100,
                currentInventoryValue: 2000,
                incomingQuantity: 100,
                incomingInventoryValue: 3000,
            });

        expect(averageCost).toEqual({
            quantityAfter: 200,
            inventoryValueAfter: 5000,
            averageCostAfter: 25,
        });
    });

    it("preserves inventory value after a partial issue", () => {
        const quantityBefore = 200;
        const inventoryValueBefore = 5000;

        const issueQuantity = 40;
        const averageCost = 25;

        const issueValue =
            roundInventoryValue(
                issueQuantity * averageCost,
            );

        const remainingQuantity =
            roundInventoryQuantity(
                quantityBefore - issueQuantity,
            );

        const remainingValue =
            roundInventoryValue(
                inventoryValueBefore - issueValue,
            );

        expect(issueValue).toBe(1000);
        expect(remainingQuantity).toBe(160);
        expect(remainingValue).toBe(4000);
    });

    it("restores historical cost after void", () => {
        const quantityBeforeVoid = 100;
        const inventoryValueBeforeVoid = 2500;

        const restoredQuantity = 60;
        const restoredValue = 1500;

        const quantityAfterVoid =
            roundInventoryQuantity(
                quantityBeforeVoid + restoredQuantity,
            );

        const valueAfterVoid =
            roundInventoryValue(
                inventoryValueBeforeVoid + restoredValue,
            );

        expect(quantityAfterVoid).toBe(160);
        expect(valueAfterVoid).toBe(4000);
    });

    it("rejects negative incoming quantity", () => {
        expect(() =>
            calculateMovingWeightedAverage({
                currentQuantity: 100,
                currentInventoryValue: 2000,
                incomingQuantity: -10,
                incomingInventoryValue: 100,
            }),
        ).toThrow();
    });
});