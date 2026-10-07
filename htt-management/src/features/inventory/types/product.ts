export type ProductStatus =
    | "ACTIVE"
    | "INACTIVE";

export type ProductCategory =
    | "Timber"
    | "Hybrid"
    | "Laminate"
    | "Vinyl"
    | "Carpet"
    | "Accessories"
    | "Other";

export type UnitCode =
    | "M2"
    | "LM"
    | "BOX"
    | "PIECE"
    | "ROLL";

export interface ProductUnit {
    id: string;
    code: UnitCode;
    name: string;
    symbol: string;

    /**
     * Quantity of the product's base unit represented
     * by one of this selling unit.
     *
     * Example:
     * base unit = m²
     * 1 box = 2.166 m²
     */
    conversionToBase: number;

    /**
     * Standard selling price for one of this unit.
     */
    basePrice: number;

    isBaseUnit: boolean;
    active: boolean;
}

export interface Product {
    id: string;
    sku: string;
    name: string;
    category: ProductCategory;
    brand?: string;
    collection?: string;
    description?: string;

    status: ProductStatus;

    baseUnitId: string;

    units: ProductUnit[];

    createdAt: string;
    updatedAt: string;
}