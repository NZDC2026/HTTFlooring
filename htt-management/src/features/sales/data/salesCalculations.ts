import type {
    SalesDocumentLine,
    SalesDocumentTotals,
} from "../types/salesDocument";

export const GST_RATE = 0.1;

export function roundMoney(
    value: number,
) {
    return Math.round(
        (value + Number.EPSILON) * 100,
    ) / 100;
}

export function calculateSalesLine({
    quantity,
    standardUnitPrice,
    unitPrice,
}: {
    quantity: number;
    standardUnitPrice: number;
    unitPrice: number;
}) {
    const lineSubtotal =
        roundMoney(
            quantity * unitPrice,
        );

    const taxAmount =
        roundMoney(
            lineSubtotal * GST_RATE,
        );

    const lineTotal =
        roundMoney(
            lineSubtotal + taxAmount,
        );

    const discountAmount =
        roundMoney(
            standardUnitPrice -
            unitPrice,
        );

    const discountPercent =
        standardUnitPrice > 0
            ? roundMoney(
                (discountAmount /
                    standardUnitPrice) *
                100,
            )
            : 0;

    return {
        discountAmount,
        discountPercent,
        lineSubtotal,
        taxAmount,
        lineTotal,
    };
}

export function calculateDocumentTotals(
    lines: SalesDocumentLine[],
): SalesDocumentTotals {
    const subtotal =
        roundMoney(
            lines.reduce(
                (total, line) =>
                    total +
                    line.lineSubtotal,
                0,
            ),
        );

    const taxAmount =
        roundMoney(
            lines.reduce(
                (total, line) =>
                    total +
                    line.taxAmount,
                0,
            ),
        );

    const total =
        roundMoney(
            subtotal + taxAmount,
        );

    return {
        subtotal,
        taxAmount,
        total,
    };
}