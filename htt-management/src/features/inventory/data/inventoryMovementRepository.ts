import type {
    InventoryMovement,
} from "../types/inventoryMovement";

type Listener = () => void;

const listeners =
    new Set<Listener>();

let movements:
    InventoryMovement[] =
    [];

function emitChange() {
    listeners.forEach(
        (listener) =>
            listener(),
    );
}

function createMovementNumber() {
    const year =
        new Date().getFullYear();

    const prefix =
        `IM-${year}-`;

    const numbers =
        movements
            .filter(
                (movement) =>
                    movement.movementNumber.startsWith(
                        prefix,
                    ),
            )
            .map(
                (movement) =>
                    Number.parseInt(
                        movement.movementNumber.slice(
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

export interface CreateInventoryMovementInput {
    movementType:
    InventoryMovement["movementType"];

    siteId: string;

    productId: string;

    baseUnitId: string;

    quantityBase: number;

    transactionUnitId: string;
    transactionUnitSymbol: string;
    transactionQuantity: number;

    conversionToBase: number;

    referenceType:
    InventoryMovement["referenceType"];

    referenceId?: string;
    referenceNumber?: string;

    purchaseOrderId?: string;
    purchaseOrderNumber?: string;

    occurredAt: string;

    notes?: string;
}

export const inventoryMovementRepository =
{
    subscribe(
        listener: Listener,
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
        InventoryMovement[] {
        return movements;
    },

    getAll():
        InventoryMovement[] {
        return movements;
    },

    getByReference(
        referenceType:
            InventoryMovement["referenceType"],

        referenceId: string,
    ) {
        return movements.filter(
            (movement) =>
                movement.referenceType ===
                referenceType &&
                movement.referenceId ===
                referenceId,
        );
    },

    getByPurchaseOrder(
        purchaseOrderId:
            string,
    ) {
        return movements.filter(
            (movement) =>
                movement.purchaseOrderId ===
                purchaseOrderId,
        );
    },

    create(
        input:
            CreateInventoryMovementInput,
    ) {
        if (
            !Number.isFinite(
                input.quantityBase,
            ) ||
            input.quantityBase ===
            0
        ) {
            throw new Error(
                "Inventory movement quantity cannot be zero.",
            );
        }

        const movement:
            InventoryMovement =
        {
            id:
                `im_${crypto.randomUUID()}`,

            movementNumber:
                createMovementNumber(),

            ...input,

            createdAt:
                new Date().toISOString(),
        };

        movements = [
            movement,
            ...movements,
        ];

        emitChange();

        return movement;
    },
};