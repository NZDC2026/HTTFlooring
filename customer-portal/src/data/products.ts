export type Product = {
    id: string;
    name: string;
    sku: string;
    category: string;
    colour: string;
    price: number;
    standardPrice?: number;
    discount?: number;
    boxes: number;
    sqm: number;
    status: "In Stock" | "Low Stock" | "Out of Stock";
    thickness?: string;
    wearLayer?: string;
    pattern?: string;
    finish?: string;
    packSize?: string;
    boardsPerPack?: number;
    image: string;
};

export const products: Product[] = [
    {
        id: "bonita-natural-oak",
        name: "Bonita Natural Oak",
        sku: "BON-001",
        category: "Engineered Timber",
        colour: "Natural Oak",
        price: 69,
        standardPrice: 82,
        discount: 16,
        boxes: 221,
        sqm: 486.2,
        status: "In Stock",
        thickness: "14mm",
        wearLayer: "2mm",
        pattern: "Plank",
        finish: "Matte",
        packSize: "2.20 m²",
        boardsPerPack: 8,
        image:
            "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: "guardian-d3016",
        name: "Guardian D3016",
        sku: "GUA-016",
        category: "Hybrid",
        colour: "Natural Grey",
        price: 47.5,
        standardPrice: 55,
        discount: 14,
        boxes: 87,
        sqm: 191.4,
        status: "In Stock",
        image:
            "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: "aquaglow-silver",
        name: "AquaGlow Silver",
        sku: "AQU-002",
        category: "Laminate",
        colour: "Silver",
        price: 44,
        standardPrice: 48,
        discount: 10,
        boxes: 26,
        sqm: 57.2,
        status: "Low Stock",
        image:
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: "heritage-rustic-oak",
        name: "Heritage Rustic Oak",
        sku: "HER-008",
        category: "Engineered Timber",
        colour: "Rustic Oak",
        price: 72,
        standardPrice: 82,
        discount: 12,
        boxes: 18,
        sqm: 39.6,
        status: "Low Stock",
        image:
            "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",
    },
];