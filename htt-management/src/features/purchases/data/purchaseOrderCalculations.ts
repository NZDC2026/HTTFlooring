import { activeTaxRate } from '../../business-workspace/configurationState';
import type {
    PurchaseOrderLine,
    PurchaseOrderTotals,
} from "../types/purchaseOrder";

export const PURCHASE_GST_RATE = 0.1;

export function roundPurchaseMoney(
    value: number,
) {
    return (
        Math.round(
            (value +
                Number.EPSILON) *
            100,
        ) / 100
    );
}

export function calculatePurchaseOrderLine({
    orderedQuantity,
    unitCost,
    taxRate = activeTaxRate(),
    inclusiveLineTotal,
}: {
    orderedQuantity: number;
    unitCost: number;
    taxRate?: number;
    inclusiveLineTotal?: number;
}) {
    const lineSubtotal =
        roundPurchaseMoney(
            orderedQuantity *
            unitCost,
        );

    const taxAmount =
        roundPurchaseMoney(
            inclusiveLineTotal === undefined ? lineSubtotal * taxRate : inclusiveLineTotal - lineSubtotal,
        );

    const lineTotal =
        roundPurchaseMoney(
            lineSubtotal +
            taxAmount,
        );

    return {
        lineSubtotal,
        taxAmount,
        lineTotal,
    };
}

export function calculatePurchaseOrderTotals(
    lines: PurchaseOrderLine[],
): PurchaseOrderTotals {
    const subtotal =
        roundPurchaseMoney(
            lines.reduce(
                (
                    total,
                    line,
                ) =>
                    total +
                    line.lineSubtotal,
                0,
            ),
        );

    const taxAmount =
        roundPurchaseMoney(
            lines.reduce(
                (
                    total,
                    line,
                ) =>
                    total +
                    line.taxAmount,
                0,
            ),
        );

    const total =
        roundPurchaseMoney(
            subtotal +
            taxAmount,
        );

    return {
        subtotal,
        taxAmount,
        total,
    };
}