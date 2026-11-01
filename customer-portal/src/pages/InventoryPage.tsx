import { Search } from "lucide-react";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useLocalAccount } from "../data/localAccount";
import PortalHeader from "../components/PortalHeader";
import SeriesRow from "../components/SeriesRow";
import { filterProductSeries, productCollections } from "../data/products";

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
    const collection = params.get("collection") ?? "";
    const activeCollection = productCollections.find(item => item.id === collection);
    const {profile}=useLocalAccount();
    const setFilter=(key:string,value:string)=>setParams(previous=>{const next=new URLSearchParams(previous);if(value)next.set(key,value);else next.delete(key);return next;},{replace:true});

    const visibleSeries = useMemo(() => filterProductSeries(query, category, collection, sort), [query, category, collection, sort]);

    return (
        <>
            <PortalHeader />

            <main className="inventory-page">
                <section className="inventory-title">
                    <h1>{activeCollection?.name ?? "Inventory Lookup"}</h1>
                    <p>Check current stock availability in {profile.region}.</p>

                    <div className="inventory-search">
                        <Search size={19} />

                        <input
                            value={query}
                            onChange={(e) => setFilter("q", e.target.value)}
                            placeholder="Search series, colour, SKU or keyword..."
                        />

                        <span aria-hidden="true"><Search size={18}/></span>
                    </div>
                </section>

                <section className="inventory-content">
                    {activeCollection && <div className="collection-filter"><span>{activeCollection.description}</span><button type="button" className="text-button" onClick={()=>setFilter("collection", "")}>View all products</button></div>}
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
                            <span>{visibleSeries.length} series</span>
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

                    <div className="series-card-grid">{visibleSeries.length===0 && <div className="empty-state"><p>No product series match your search.</p><button className="outline-copper-button" onClick={()=>setParams({})}>Clear filters</button></div>}
                        {visibleSeries.map((series) => (
                            <SeriesRow series={series} key={series.id} />
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