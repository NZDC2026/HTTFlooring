import type {
    InventoryCostMovement,
} from "../types/inventoryCost";

type Listener =
    () => void;

const listeners =
    new Set<Listener>();

let movements:
    InventoryCostMovement[] =
    [];

function emitChange() {
    listeners.forEach(
        (
            listener,
        ) =>
            listener(),
    );
}

function createMovementNumber() {
    const year =
        new Date()
            .getFullYear();

    const prefix =
        `ICM-${year}-`;

    const numbers =
        movements
            .filter(
                (
                    movement,
                ) =>
                    movement
                        .costMovementNumber
                        .startsWith(
                            prefix,
                        ),
            )
            .map(
                (
                    movement,
                ) =>
                    Number.parseInt(
                        movement
                            .costMovementNumber
                            .slice(
                                prefix.length,
                            ),
                        10,
                    ),
            )
            .filter(
                Number.isFinite,
            );

    const next =
        Math.max(
            0,
            ...numbers,
        ) + 1;

    return `${prefix}${String(
        next,
    ).padStart(
        5,
        "0",
    )}`;
}

export interface CreateInventoryCostMovementInput {
    movementType:
    InventoryCostMovement[
    "movementType"
    ];

    siteId: string;

    productId: string;

    baseUnitId: string;

    quantityBase: number;

    unitCostBase: number;

    valueChange: number;

    quantityAfter: number;

    averageCostAfter: number;

    inventoryValueAfter: number;

    referenceType:
    InventoryCostMovement[
    "referenceType"
    ];

    referenceId?: string;
    referenceNumber?: string;

    inventoryMovementId?: string;

    occurredAt: string;

    notes?: string;
}

function validateInput(
    input:
        CreateInventoryCostMovementInput,
) {
    if (
        !Number.isFinite(
            input.quantityBase,
        ) ||
        input.quantityBase ===
        0
    ) {
        throw new Error(
            "Inventory cost movement quantity cannot be zero.",
        );
    }

    if (
        !Number.isFinite(
            input.unitCostBase,
        ) ||
        input.unitCostBase <
        0
    ) {
        throw new Error(
            "Inventory cost cannot be negative.",
        );
    }

    if (
        !Number.isFinite(
            input.valueChange,
        )
    ) {
        throw new Error(
            "Inventory value movement must be valid.",
        );
    }

    if (
        !Number.isFinite(
            input.quantityAfter,
        ) ||
        input.quantityAfter <
        0
    ) {
        throw new Error(
            "Inventory cost quantity after movement cannot be negative.",
        );
    }

    if (
        !Number.isFinite(
            input.averageCostAfter,
        ) ||
        input.averageCostAfter <
        0
    ) {
        throw new Error(
            "Inventory average cost after movement cannot be negative.",
        );
    }

    if (
        !Number.isFinite(
            input.inventoryValueAfter,
        ) ||
        input.inventoryValueAfter <
        0
    ) {
        throw new Error(
            "Inventory value after movement cannot be negative.",
        );
    }
}

export const inventoryCostMovementRepository =
{
    subscribe(
        listener:
            Listener,
    ) {
        listeners.add(
            listener,
        );

        return () => {
            listeners.delete(
                listener,
            );
        };
    },

    getSnapshot():
        InventoryCostMovement[] {
        return movements;
    },

    getAll():
        InventoryCostMovement[] {
        return movements;
    },

    getByReference(
        referenceType:
            InventoryCostMovement[
            "referenceType"
            ],

        referenceId:
            string,
    ) {
        return movements.filter(
            (
                movement,
            ) =>
                movement.referenceType ===
                referenceType &&
                movement.referenceId ===
                referenceId,
        );
    },

    getByInventoryMovementId(
        inventoryMovementId:
            string,
    ) {
        return movements.find(
            (
                movement,
            ) =>
                movement.inventoryMovementId ===
                inventoryMovementId,
        );
    },

    getByProduct(
        productId:
            string,
    ) {
        return movements.filter(
            (
                movement,
            ) =>
                movement.productId ===
                productId,
        );
    },

    getBySiteAndProduct(
        siteId:
            string,

        productId:
            string,
    ) {
        return movements.filter(
            (
                movement,
            ) =>
                movement.siteId ===
                siteId &&
                movement.productId ===
                productId,
        );
    },

    build(
        input:
            CreateInventoryCostMovementInput,
    ): InventoryCostMovement {
        validateInput(
            input,
        );

        return {
            id:
                `icm_${crypto.randomUUID()}`,

            costMovementNumber:
                createMovementNumber(),

            ...input,

            createdAt:
                new Date()
                    .toISOString(),
        };
    },

    create(
        input:
            CreateInventoryCostMovementInput,
    ) {
        const movement =
            inventoryCostMovementRepository
                .build(
                    input,
                );

        movements = [
            movement,
            ...movements,
        ];

        emitChange();

        return movement;
    },

    replaceAll(
        nextMovements:
            InventoryCostMovement[],
    ) {
        movements =
            nextMovements;

        emitChange();
    },

    clear() {
        movements =
            [];

        emitChange();
    },
};