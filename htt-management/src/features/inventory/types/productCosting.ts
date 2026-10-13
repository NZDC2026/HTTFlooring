import type {
    InventoryCostingMethod,
} from "./inventoryCost";

export interface ProductCostingPolicy {
    productId: string;

    costingMethod:
    InventoryCostingMethod;

    /**
     * Cost calculations are always
     * performed in the product's
     * base unit.
     */
    baseUnitId: string;

    active: boolean;

    createdAt: string;
    updatedAt: string;
}