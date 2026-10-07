import {
    inventoryMovementRepository,
} from "./inventoryMovementRepository";

import type {
    StockBalance,
} from "../types/stockBalance";

type Listener = () => void;

const listeners =
    new Set<Listener>();

let balances:
    StockBalance[] =
    [];

function emitChange() {
    listeners.forEach(
        (listener) =>
            listener(),
    );
}

function roundQuantity(
    value: number,
) {
    return (
        Math.round(
            (value +
                Number.EPSILON) *
            10000,
        ) / 10000
    );
}

export const stockRepository =
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
        StockBalance[] {
        return balances;
    },

    getAll():
        StockBalance[] {
        return balances;
    },

    getBalance(
        siteId: string,
        productId: string,
    ) {
        return balances.find(
            (balance) =>
                balance.siteId ===
                siteId &&
                balance.productId ===
                productId,
        );
    },

    receive({
        siteId,
        productId,
        baseUnitId,
        quantityBase,
    }: {
        siteId: string;
        productId: string;
        baseUnitId: string;
        quantityBase: number;
    }) {
        if (
            !Number.isFinite(
                quantityBase,
            ) ||
            quantityBase <=
            0
        ) {
            throw new Error(
                "Received stock quantity must be greater than zero.",
            );
        }

        const existing =
            stockRepository.getBalance(
                siteId,
                productId,
            );

        const now =
            new Date().toISOString();

        if (existing) {
            const updated:
                StockBalance =
            {
                ...existing,

                quantityOnHand:
                    roundQuantity(
                        existing.quantityOnHand +
                        quantityBase,
                    ),

                updatedAt:
                    now,
            };

            balances =
                balances.map(
                    (balance) =>
                        balance.siteId ===
                            siteId &&
                            balance.productId ===
                            productId
                            ? updated
                            : balance,
                );

            emitChange();

            return updated;
        }

        const created:
            StockBalance =
        {
            siteId,

            productId,

            baseUnitId,

            quantityOnHand:
                roundQuantity(
                    quantityBase,
                ),

            updatedAt:
                now,
        };

        balances = [
            created,
            ...balances,
        ];

        emitChange();

        return created;
    },

    rebuildFromMovements() {
        const nextBalances =
            new Map<
                string,
                StockBalance
            >();

        for (
            const movement of
            inventoryMovementRepository.getAll()
        ) {
            const key =
                `${movement.siteId}:${movement.productId}`;

            const existing =
                nextBalances.get(
                    key,
                );

            nextBalances.set(
                key,
                {
                    siteId:
                        movement.siteId,

                    productId:
                        movement.productId,

                    baseUnitId:
                        movement.baseUnitId,

                    quantityOnHand:
                        roundQuantity(
                            (existing?.quantityOnHand ??
                                0) +
                            movement.quantityBase,
                        ),

                    updatedAt:
                        movement.createdAt,
                },
            );
        }

        balances = Array.from(
            nextBalances.values(),
        );

        emitChange();
    },
};