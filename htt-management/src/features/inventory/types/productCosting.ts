import type {
    InventoryCostingMethod,
} from "./inventoryCost";

export interface ProductCostingPolicy {
    methodHistory?: {method:InventoryCostingMethod;actorId:string;at:string;reason:string}[];
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