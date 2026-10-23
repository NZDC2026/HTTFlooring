import { z } from 'zod';
import {trustedAuthorization} from '../../security/trustedAuthorization';
import {inventoryCostBalanceRepository} from './inventoryCostBalanceRepository';
import {stockRepository} from './stockRepository';
import { isStockProduct } from './itemTypes';
import { getProductById } from './mockProducts';
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
    setMethod(raw:unknown){
        const input=z.object({productId:z.string().min(1),method:z.enum(['MOVING_WEIGHTED_AVERAGE','FIFO']),expectedUpdatedAt:z.string().min(1),reason:z.string().trim().min(3).max(2000)}).strict().parse(raw),actor=trustedAuthorization.require('accounting.post');
        const old=productCostingRepository.requireByProductId(input.productId);
        if(old.updatedAt!==input.expectedUpdatedAt)throw Error('Costing policy changed. Refresh before changing it.');
        if(old.costingMethod===input.method)return old;
        if(inventoryCostBalanceRepository.getAll().some(b=>b.productId===input.productId&&(b.quantityOnHand!==0||b.inventoryValue!==0))||stockRepository.getAll().some(b=>b.productId===input.productId&&b.quantityOnHand!==0))throw Error('Clear stock and inventory value at every site before changing the costing method.');
        const now=new Date().toISOString(),next={...old,costingMethod:input.method,updatedAt:now,methodHistory:[...(old.methodHistory??[]),{method:input.method,actorId:actor.userId,at:now,reason:input.reason}]};
        policies=policies.map(p=>p.productId===old.productId?next:p);
        inventoryCostBalanceRepository.replaceAll(inventoryCostBalanceRepository.getAll().map(b=>b.productId===old.productId?{...b,costingMethod:input.method,updatedAt:now}:b));emitChange();return next;
    },
    ensureProductPolicy(productId: string, baseUnitId: string, active: boolean) {
        const existing = policies.find(p => p.productId === productId);
        const now = new Date().toISOString();
        const policy: ProductCostingPolicy = { productId, baseUnitId, active: active ? existing?.active ?? true : false, costingMethod: existing?.costingMethod ?? "MOVING_WEIGHTED_AVERAGE", ...(existing?.methodHistory?{methodHistory:existing.methodHistory}:{}), createdAt: existing?.createdAt ?? now, updatedAt: now };
        policies = [...policies.filter(p => p.productId !== productId), policy];
        emitChange();
        return policy;
    },
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
        if(active && !isStockProduct(getProductById(productId)??{itemType:'SERVICE'}))throw new Error('Inventory costing cannot be enabled for non-stock/service items.');
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
    repository: productCostingRepository, read: "inventory.cost.read",
    commands: {"setMethod":"accounting.post", "ensureProductPolicy": null, "setActive": "accounting.post"},
    validate:(value,snapshots)=>{
      const rows=(value as {policies:ProductCostingPolicy[]}).policies;
      for(const policy of rows){if(!['FIFO','MOVING_WEIGHTED_AVERAGE'].includes(policy.costingMethod))throw Error('Unsupported saved costing policy.');
        if(policy.methodHistory){for(const h of policy.methodHistory)z.object({method:z.enum(['FIFO','MOVING_WEIGHTED_AVERAGE']),actorId:z.string().min(1),at:z.iso.datetime(),reason:z.string().trim().min(3).max(2000)}).strict().parse(h);if(policy.methodHistory.at(-1)?.method!==policy.costingMethod)throw Error('Costing policy audit does not match the active method.');}
        if((snapshots.costBalances as {balances:{productId:string;costingMethod:string}[]}).balances.some(b=>b.productId===policy.productId&&b.costingMethod!==policy.costingMethod))throw Error('Inventory balance method differs from policy.');
      }
    },
    snapshot: () => ({ policies }),
    restore: value => { policies = value.policies;  },
    publish: () => listeners.forEach(listener => listener()),
});
