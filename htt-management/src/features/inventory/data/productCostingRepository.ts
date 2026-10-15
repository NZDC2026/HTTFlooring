import { registerRepository } from "../../security/repositoryHost";
import {
    mockProducts,
} from "./mockProducts";

import type {
    ProductCostingPolicy,
} from "../types/productCosting";

type Listener =
    () => void;

const listeners =
    new Set<Listener>();

const createdAt =
    "2026-01-01T00:00:00.000Z";

let policies:
    ProductCostingPolicy[] =
    mockProducts.map(
        (
            product,
        ) => ({
            productId:
                product.id,

            costingMethod:
                "MOVING_WEIGHTED_AVERAGE",

            baseUnitId:
                product.baseUnitId,

            active:
                true,

            createdAt,

            updatedAt:
                createdAt,
        }),
    );

function emitChange() {
    listeners.forEach(
        (
            listener,
        ) =>
            listener(),
    );
}

export const productCostingRepository =
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
        ProductCostingPolicy[] {
        return policies;
    },

    getAll():
        ProductCostingPolicy[] {
        return policies;
    },

    getByProductId(
        productId:
            string,
    ) {
        return policies.find(
            (
                policy,
            ) =>
                policy.productId ===
                productId,
        );
    },

    requireByProductId(
        productId:
            string,
    ) {
        const policy =
            productCostingRepository
                .getByProductId(
                    productId,
                );

        if (!policy) {
            throw new Error(
                "Product costing policy was not found.",
            );
        }

        return policy;
    },

    setActive(
        productId:
            string,

        active:
            boolean,
    ) {
        const existing =
            productCostingRepository
                .requireByProductId(
                    productId,
                );

        const updated:
            ProductCostingPolicy =
        {
            ...existing,

            active,

            updatedAt:
                new Date()
                    .toISOString(),
        };

        policies =
            policies.map(
                (
                    policy,
                ) =>
                    policy.productId ===
                        productId
                        ? updated
                        : policy,
            );

        emitChange();

        return updated;
    },
};
registerRepository("costingPolicies", {
    repository: productCostingRepository, read: "inventory.read",
    commands: {"setActive": "inventory.adjust"},
    snapshot: () => ({ policies }),
    restore: value => { policies = value.policies;  },
    publish: () => listeners.forEach(listener => listener()),
});
