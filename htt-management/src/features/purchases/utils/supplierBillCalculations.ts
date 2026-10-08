import type {
    SupplierBillLine,
    SupplierBillTotals,
} from "../types/supplierBill";

export const SUPPLIER_BILL_GST_RATE =
    0.1;

export function roundBillMoney(
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

export function calculateSupplierBillLine({
    quantity,
    unitCost,
}: {
    quantity: number;
    unitCost: number;
}) {
    const lineSubtotal =
        roundBillMoney(
            quantity *
            unitCost,
        );

    const taxAmount =
        roundBillMoney(
            lineSubtotal *
            SUPPLIER_BILL_GST_RATE,
        );

    const lineTotal =
        roundBillMoney(
            lineSubtotal +
            taxAmount,
        );

    return {
        lineSubtotal,
        taxAmount,
        lineTotal,
    };
}

export function calculateSupplierBillTotals(
    lines:
        SupplierBillLine[],
): SupplierBillTotals {
    const subtotal =
        roundBillMoney(
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
        roundBillMoney(
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
        roundBillMoney(
            subtotal +
            taxAmount,
        );

    return {
        subtotal,
        taxAmount,
        total,

        amountPaid: 0,
        amountCredited: 0,

        amountDue:
            total,
    };
}