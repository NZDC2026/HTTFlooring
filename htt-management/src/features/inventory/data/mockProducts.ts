import type { Product } from "../types/product";

export const mockProducts: Product[] = [
    {
        id: "prod_001",
        sku: "TIM-OAK-190-NAT",
        name: "European Oak 190mm Natural",
        category: "Timber",
        brand: "HTT Flooring",
        collection: "European Oak",
        description:
            "190mm engineered European oak flooring in Natural finish.",
        status: "ACTIVE",

        baseUnitId: "unit_001_m2",

        units: [
            {
                id: "unit_001_m2",
                code: "M2",
                name: "Square Metre",
                symbol: "m²",
                conversionToBase: 1,
                basePrice: 68.5,
                isBaseUnit: true,
                active: true,
            },
            {
                id: "unit_001_box",
                code: "BOX",
                name: "Box",
                symbol: "box",
                conversionToBase: 2.166,
                basePrice: 148.37,
                isBaseUnit: false,
                active: true,
            },
        ],

        createdAt: "2026-09-01T00:00:00.000Z",
        updatedAt: "2026-09-01T00:00:00.000Z",
    },

    {
        id: "prod_002",
        sku: "HYB-SPC-180-SMK",
        name: "SPC Hybrid 180mm Smoked Oak",
        category: "Hybrid",
        brand: "HTT Flooring",
        collection: "Urban Hybrid",
        description:
            "Water resistant SPC hybrid flooring in Smoked Oak finish.",
        status: "ACTIVE",

        baseUnitId: "unit_002_m2",

        units: [
            {
                id: "unit_002_m2",
                code: "M2",
                name: "Square Metre",
                symbol: "m²",
                conversionToBase: 1,
                basePrice: 42.9,
                isBaseUnit: true,
                active: true,
            },
            {
                id: "unit_002_box",
                code: "BOX",
                name: "Box",
                symbol: "box",
                conversionToBase: 2.22,
                basePrice: 95.24,
                isBaseUnit: false,
                active: true,
            },
        ],

        createdAt: "2026-09-01T00:00:00.000Z",
        updatedAt: "2026-09-01T00:00:00.000Z",
    },

    {
        id: "prod_003",
        sku: "LAM-12MM-NOR-OAK",
        name: "12mm Nordic Oak Laminate",
        category: "Laminate",
        brand: "HTT Flooring",
        collection: "Nordic",
        status: "ACTIVE",

        baseUnitId: "unit_003_m2",

        units: [
            {
                id: "unit_003_m2",
                code: "M2",
                name: "Square Metre",
                symbol: "m²",
                conversionToBase: 1,
                basePrice: 31.5,
                isBaseUnit: true,
                active: true,
            },
            {
                id: "unit_003_box",
                code: "BOX",
                name: "Box",
                symbol: "box",
                conversionToBase: 1.92,
                basePrice: 60.48,
                isBaseUnit: false,
                active: true,
            },
        ],

        createdAt: "2026-09-01T00:00:00.000Z",
        updatedAt: "2026-09-01T00:00:00.000Z",
    },

    {
        id: "prod_004",
        sku: "VIN-PLANK-STONE",
        name: "Luxury Vinyl Plank Stone Grey",
        category: "Vinyl",
        brand: "HTT Flooring",
        collection: "Commercial Vinyl",
        status: "ACTIVE",

        baseUnitId: "unit_004_m2",

        units: [
            {
                id: "unit_004_m2",
                code: "M2",
                name: "Square Metre",
                symbol: "m²",
                conversionToBase: 1,
                basePrice: 36.8,
                isBaseUnit: true,
                active: true,
            },
            {
                id: "unit_004_box",
                code: "BOX",
                name: "Box",
                symbol: "box",
                conversionToBase: 2.5,
                basePrice: 92,
                isBaseUnit: false,
                active: true,
            },
        ],

        createdAt: "2026-09-01T00:00:00.000Z",
        updatedAt: "2026-09-01T00:00:00.000Z",
    },

    {
        id: "prod_005",
        sku: "ACC-SCOTIA-OAK",
        name: "Oak Scotia Trim",
        category: "Accessories",
        brand: "HTT Flooring",
        status: "ACTIVE",

        baseUnitId: "unit_005_piece",

        units: [
            {
                id: "unit_005_piece",
                code: "PIECE",
                name: "Piece",
                symbol: "pc",
                conversionToBase: 1,
                basePrice: 14.9,
                isBaseUnit: true,
                active: true,
            },
        ],

        createdAt: "2026-09-01T00:00:00.000Z",
        updatedAt: "2026-09-01T00:00:00.000Z",
    },

    {
        id: "prod_006",
        sku: "CAR-COM-CHAR",
        name: "Commercial Carpet Charcoal",
        category: "Carpet",
        brand: "HTT Flooring",
        collection: "Commercial",
        status: "ACTIVE",

        baseUnitId: "unit_006_lm",

        units: [
            {
                id: "unit_006_lm",
                code: "LM",
                name: "Linear Metre",
                symbol: "LM",
                conversionToBase: 1,
                basePrice: 52,
                isBaseUnit: true,
                active: true,
            },
            {
                id: "unit_006_roll",
                code: "ROLL",
                name: "Roll",
                symbol: "roll",
                conversionToBase: 25,
                basePrice: 1300,
                isBaseUnit: false,
                active: true,
            },
        ],

        createdAt: "2026-09-01T00:00:00.000Z",
        updatedAt: "2026-09-01T00:00:00.000Z",
    },
];

export function getProductById(
    productId: string,
): Product | undefined {
    return mockProducts.find(
        (product) => product.id === productId,
    );
}

export function getProductUnit(
    productId: string,
    unitId: string,
) {
    return getProductById(productId)?.units.find(
        (unit) => unit.id === unitId,
    );
}