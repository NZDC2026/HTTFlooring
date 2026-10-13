export function roundInventoryQuantity(
    value: number,
) {
    return Math.round(
        (
            value +
            Number.EPSILON
        ) * 10000,
    ) / 10000;
}

export function roundInventoryCost(
    value: number,
) {
    return Math.round(
        (
            value +
            Number.EPSILON
        ) * 1000000,
    ) / 1000000;
}

export function roundInventoryValue(
    value: number,
) {
    return Math.round(
        (
            value +
            Number.EPSILON
        ) * 100,
    ) / 100;
}

export function calculateBaseUnitCost({
    transactionUnitCost,
    conversionToBase,
}: {
    transactionUnitCost: number;
    conversionToBase: number;
}) {
    if (
        !Number.isFinite(
            transactionUnitCost,
        ) ||
        transactionUnitCost <
        0
    ) {
        throw new Error(
            "Transaction unit cost cannot be negative.",
        );
    }

    if (
        !Number.isFinite(
            conversionToBase,
        ) ||
        conversionToBase <=
        0
    ) {
        throw new Error(
            "Unit conversion must be greater than zero.",
        );
    }

    return roundInventoryCost(
        transactionUnitCost /
        conversionToBase,
    );
}

export function calculateIncomingInventoryValue({
    quantityBase,
    unitCostBase,
}: {
    quantityBase: number;
    unitCostBase: number;
}) {
    if (
        !Number.isFinite(
            quantityBase,
        ) ||
        quantityBase <=
        0
    ) {
        throw new Error(
            "Incoming inventory quantity must be greater than zero.",
        );
    }

    if (
        !Number.isFinite(
            unitCostBase,
        ) ||
        unitCostBase <
        0
    ) {
        throw new Error(
            "Inventory unit cost cannot be negative.",
        );
    }

    return roundInventoryValue(
        quantityBase *
        unitCostBase,
    );
}

export function calculateMovingWeightedAverage({
    currentQuantity,
    currentInventoryValue,
    incomingQuantity,
    incomingInventoryValue,
}: {
    currentQuantity: number;
    currentInventoryValue: number;
    incomingQuantity: number;
    incomingInventoryValue: number;
}) {
    if (
        !Number.isFinite(
            currentQuantity,
        ) ||
        currentQuantity <
        0
    ) {
        throw new Error(
            "Current inventory quantity cannot be negative.",
        );
    }

    if (
        !Number.isFinite(
            currentInventoryValue,
        ) ||
        currentInventoryValue <
        0
    ) {
        throw new Error(
            "Current inventory value cannot be negative.",
        );
    }

    if (
        !Number.isFinite(
            incomingQuantity,
        ) ||
        incomingQuantity <=
        0
    ) {
        throw new Error(
            "Incoming inventory quantity must be greater than zero.",
        );
    }

    if (
        !Number.isFinite(
            incomingInventoryValue,
        ) ||
        incomingInventoryValue <
        0
    ) {
        throw new Error(
            "Incoming inventory value cannot be negative.",
        );
    }

    const quantityAfter =
        roundInventoryQuantity(
            currentQuantity +
            incomingQuantity,
        );

    const inventoryValueAfter =
        roundInventoryValue(
            currentInventoryValue +
            incomingInventoryValue,
        );

    const averageCostAfter =
        quantityAfter ===
            0
            ? 0
            : roundInventoryCost(
                inventoryValueAfter /
                quantityAfter,
            );

    return {
        quantityAfter,

        inventoryValueAfter,

        averageCostAfter,
    };
}

export function calculateInventoryIssueValue({
    quantityBase,
    averageCostPerBaseUnit,
}: {
    quantityBase: number;
    averageCostPerBaseUnit: number;
}) {
    if (
        !Number.isFinite(
            quantityBase,
        ) ||
        quantityBase <=
        0
    ) {
        throw new Error(
            "Issued inventory quantity must be greater than zero.",
        );
    }

    if (
        !Number.isFinite(
            averageCostPerBaseUnit,
        ) ||
        averageCostPerBaseUnit <
        0
    ) {
        throw new Error(
            "Average inventory cost cannot be negative.",
        );
    }

    return roundInventoryValue(
        quantityBase *
        averageCostPerBaseUnit,
    );
}