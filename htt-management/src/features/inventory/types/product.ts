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
    | "ROLL"
    | "BUCKET"
    | "HOUR"
    | "JOB";

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
    tradePrice?: number;
    publicPrice?: number;
    vipPrice?: number;
    vvipPrice?: number;
    containerPrice?: number;

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
    pattern?: "Plank" | "Herringbone" | "Chevron";
    accessoryType?: import("../../contacts/data/priceCatalogue").AccessoryType;
    description?: string;
    dimensions?: { lengthMm?: number; widthMm?: number; thicknessMm?: number };

    status: ProductStatus;

    /** Imported reference cost per base unit; not an inventory valuation. */
    referenceCostPrice?: number;
    revision?: number;
    itemType?: "STOCK" | "NON_STOCK" | "SERVICE";
    buyEnabled?: boolean;
    sellEnabled?: boolean;
    reorderPoint?: number;
    targetStock?: number;
    wholePacks?: boolean;
    taxCode?: string;

    /** Preferred packaging unit shown in product setup. */
    measureUnitId?: string;
    baseUnitId: string;

    units: ProductUnit[];

    createdAt: string;
    updatedAt: string;
}