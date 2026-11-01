export type Product = {
    id: string;
    name: string;
    seriesId: string;
    seriesName: string;
    colourCode?: string;
    dimensions?: string;
    colourSwatchOffset?: number;
    stockKnown?: boolean;
    priceKnown?: boolean;
    sku: string;
    category: string;
    colour: string;
    price: number;
    standardPrice?: number;
    discount?: number;
    isNew?: boolean;
    isClearance?: boolean;
    boxes: number;
    sqm: number;
    status: "In Stock" | "Low Stock" | "Out of Stock";
    thickness?: string;
    wearLayer?: string;
    pattern?: string;
    finish?: string;
    packSize?: string;
    boardsPerPack?: number;
    scotia?: string;
    hdfStairNose?: string;
    trims?: string;
    image: string;
};

export const products: Product[] = [
    {
        seriesId: "bonita",
        seriesName: "Bonita",
        id: "bonita-natural-oak",
        name: "Bonita Natural Oak",
        sku: "BON-001",
        isNew: true,
        category: "Engineered Timber",
        colour: "Natural Oak",
        colourCode: "M-2",
        dimensions: "1900 × 190 × 14/2 mm",
        colourSwatchOffset: 238,
        price: 69,
        standardPrice: 82,
        discount: 16,
        boxes: 221,
        sqm: 478.686,
        status: "In Stock",
        thickness: "14mm",
        wearLayer: "2mm",
        pattern: "Plank",
        finish: "Matte",
        packSize: "2.166 m²",
        boardsPerPack: 6,
        scotia: "WF807",
        hdfStairNose: "Customized",
        trims: "Blackbutt",
        image:
            "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
    },
    {
        seriesId: "guardian",
        seriesName: "Guardian",
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
        seriesId: "aquaglow",
        seriesName: "AquaGlow",
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
        seriesId: "heritage",
        seriesName: "Heritage",
        id: "heritage-rustic-oak",
        name: "Heritage Rustic Oak",
        sku: "HER-008",
        isClearance: true,
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
// Colour names, codes and accessory references supplied in the Bonita range sheet.
const bonitaColours = [
    { colour: "Latte Oak", code: "M-3", scotia: "D3005", trims: "HBY-W019" },
    { colour: "Lime Wash", code: "M-5", scotia: "WF806", trims: "Cream" },
    { colour: "Grey Wash", code: "M-6", scotia: "A108", trims: "HBY-W024" },
    { colour: "Brescia", code: "M-8", scotia: "A113", trims: "Black" },
    { colour: "White Oak", code: "M-9", scotia: "WF806", trims: "HBY-W019" },
    { colour: "Cuban", code: "M-11", scotia: "WF08", trims: "D3015" },
    { colour: "Cotton Oak", code: "M-13", scotia: "WF801", trims: "HBY-W019" },
    { colour: "Smoked Brown", code: "M-14", scotia: "A115", trims: "HBY-004" },
];
const bonitaBase = products.find(product => product.id === "bonita-natural-oak")!;
products.push(...bonitaColours.map((colour, index): Product => ({
    ...bonitaBase,
    id: `bonita-${colour.colour.toLowerCase().replace(/ /g, "-")}`,
    name: `Bonita ${colour.colour}`,
    sku: colour.code,
    colourCode: colour.code,
    colour: colour.colour,
    scotia: colour.scotia,
    trims: colour.trims,
    colourSwatchOffset: 238 + (index + 1) * 49,
    priceKnown: false,
    standardPrice: undefined,
    discount: undefined,
    stockKnown: false,
    boxes: 0,
    sqm: 0,
}))); // Price and stock await colour-specific data; zero values are never displayed as stock.

export type ProductSeries = {
    id: string; name: string; category: string; image: string; products: Product[];
};
export const productSeries: ProductSeries[] = Array.from(new Set(products.map(product => product.seriesId))).map(id => {
    const colours = products.filter(product => product.seriesId === id);
    return { id, name: colours[0].seriesName, category: colours[0].category, image: colours[0].image, products: colours };
});

export function filterProductSeries(query: string, category: string, collection: string, sort: string) {
    const search = query.trim().toLowerCase();
    const matches = productSeries.filter(series => (category === "All" || series.category === category) && series.products.some(product =>
        matchesCollection(product, collection) && [series.name, product.name, product.colour, product.sku, product.colourCode ?? "", product.category].some(value => value.toLowerCase().includes(search))
    ));
    const price = (series: ProductSeries) => Math.min(...series.products.filter(product => product.priceKnown !== false).map(product => product.price));
    return matches.sort((a,b) => sort === "Price: Low to High" ? price(a) - price(b) : sort === "Price: High to Low" ? price(b) - price(a) : 0);
}

export const productCollections = [
    { id: "new", name: "New Product", description: "Discover the latest additions", image: products[0].image },
    { id: "promotion", name: "Promotion", description: "Explore current special offers", image: products[1].image },
    { id: "clearance", name: "Clearance", description: "Shop the remaining stock", image: products[3].image },
] as const;

export function matchesCollection(product: Product, collection: string) {
    if (collection === "new") return product.isNew === true;
    if (collection === "promotion") return (product.discount ?? 0) > 0;
    if (collection === "clearance") return product.isClearance === true;
    return true;
}
