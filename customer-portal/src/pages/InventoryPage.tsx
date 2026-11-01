import { Search } from "lucide-react";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useLocalAccount } from "../data/localAccount";
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
    const [params,setParams]=useSearchParams();
    const query=params.get("q")??"", category=params.get("category")??"All", sort=params.get("sort")??"Relevance";
    const {profile}=useLocalAccount();
    const setFilter=(key:string,value:string)=>setParams(previous=>{const next=new URLSearchParams(previous);if(value)next.set(key,value);else next.delete(key);return next;},{replace:true});

    const visibleProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesCategory =
                category === "All" || product.category === category;

            const search = query.trim().toLowerCase();

            const matchesQuery =
                product.name.toLowerCase().includes(search) ||
                product.sku.toLowerCase().includes(search) ||
                product.colour.toLowerCase().includes(search) || product.category.toLowerCase().includes(search);

            return matchesCategory && matchesQuery;
        }).sort((a,b)=>sort==="Price: Low to High" ? a.price-b.price : sort==="Price: High to Low" ? b.price-a.price : 0);
    }, [query, category, sort]);

    return (
        <>
            <PortalHeader />

            <main className="inventory-page">
                <section className="inventory-title">
                    <h1>Inventory Lookup</h1>
                    <p>Check current stock availability in {profile.region}.</p>

                    <div className="inventory-search">
                        <Search size={19} />

                        <input
                            value={query}
                            onChange={(e) => setFilter("q", e.target.value)}
                            placeholder="Search product, colour, SKU or keyword..."
                        />

                        <span aria-hidden="true"><Search size={18}/></span>
                    </div>
                </section>

                <section className="inventory-content">
                    <div className="inventory-toolbar">
                        <div className="categories">
                            {categories.map((item) => (
                                <button
                                    key={item}
                                    className={category === item ? "selected" : ""}
                                    onClick={() => setFilter("category",item)}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>

                        <div className="sort">
                            <span>{visibleProducts.length} products</span>
                            <label>
                                Sort by
                                <select value={sort} onChange={event=>setFilter("sort",event.target.value)}>
                                    <option>Relevance</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                </select>
                            </label>
                        </div>
                    </div>

                    <div className="product-list">{visibleProducts.length===0 && <div className="empty-state"><p>No products match your search.</p><button className="outline-copper-button" onClick={()=>setParams({})}>Clear filters</button></div>}
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