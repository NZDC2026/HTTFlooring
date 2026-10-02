import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import PortalHeader from "../components/PortalHeader";
import ProductRow from "../components/ProductRow";
import { products } from "../data/products";

const categories = [
    "All",
    "Engineered Timber",
    "Hybrid",
    "Laminate",
    "Accessories",
];

export default function InventoryPage() {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All");

    const visibleProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesCategory =
                category === "All" || product.category === category;

            const search = query.toLowerCase();

            const matchesQuery =
                product.name.toLowerCase().includes(search) ||
                product.sku.toLowerCase().includes(search) ||
                product.colour.toLowerCase().includes(search);

            return matchesCategory && matchesQuery;
        });
    }, [query, category]);

    return (
        <>
            <PortalHeader />

            <main className="inventory-page">
                <section className="inventory-title">
                    <h1>Inventory Lookup</h1>
                    <p>Check current stock availability in Melbourne.</p>

                    <div className="inventory-search">
                        <Search size={19} />

                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search product, colour, SKU or keyword..."
                        />

                        <button>
                            <Search size={18} />
                        </button>
                    </div>
                </section>

                <section className="inventory-content">
                    <div className="inventory-toolbar">
                        <div className="categories">
                            {categories.map((item) => (
                                <button
                                    key={item}
                                    className={category === item ? "selected" : ""}
                                    onClick={() => setCategory(item)}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>

                        <div className="sort">
                            <span>{visibleProducts.length} products</span>
                            <label>
                                Sort by
                                <select>
                                    <option>Relevance</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                </select>
                            </label>
                        </div>
                    </div>

                    <div className="product-list">
                        {visibleProducts.map((product) => (
                            <ProductRow product={product} key={product.id} />
                        ))}
                    </div>

                    <div className="gst-note">
                        ⓘ &nbsp; Prices are exclusive of GST.
                    </div>
                </section>
            </main>
        </>
    );
}