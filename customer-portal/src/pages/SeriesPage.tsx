import { ArrowLeft, ArrowUpRight, Search } from "lucide-react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import PortalHeader from "../components/PortalHeader";
import { getColourCollection, getProductPricing, hasPromotion, productSeries } from "../data/products";
import { useLocalAccount } from "../services/account";

const promotionDate = (value?: string) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "-";
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-AU", {day:"2-digit",month:"short",year:"numeric"});
};

export default function SeriesPage() {
    const {id} = useParams();
    const location = useLocation();
    const [params,setParams] = useSearchParams();
    const {profile} = useLocalAccount();
    const collectionMode = location.pathname.startsWith("/collections/");
    const collection = collectionMode ? getColourCollection(id ?? "") : undefined;
    const series = collectionMode ? (collection ? { ...collection, category:"PRODUCT COLLECTION", logo:undefined } : undefined) : productSeries.find(item => item.id === id);
    const listingReturnTo = collectionMode ? location.pathname + location.search : undefined;
    const inventorySearch = typeof location.state?.inventorySearch === "string" ? location.state.inventorySearch : "";
    if (!series) return <><PortalHeader/><main className="empty-state"><h1>{collectionMode ? "Collection" : "Series"} not found</h1><Link to="/inventory">Back to inventory</Link></main></>;
    const query = params.get("q") ?? "";
    const colours = series.products.filter(product => [product.colour,product.colourCode ?? product.sku,product.sku].some(value => value.toLowerCase().includes(query.trim().toLowerCase())));
    const base = series.products[0];
    const showAccessories = series.category !== "Accessories";
    return <><PortalHeader/><main className="series-page">
        <Link className="back-link" to={collectionMode ? "/dashboard" : `/inventory${inventorySearch}`}><ArrowLeft size={17}/> Back to {collectionMode ? "dashboard" : "series"}</Link>
        <section className="series-heading">
            <div><small className="series-eyebrow">{collectionMode ? "PRODUCT COLLECTION" : `${series.category} · PRODUCT SERIES`}</small><h1 className={series.logo ? "series-logo-heading" : undefined}>{series.logo ? <img className="series-brand-logo" src={series.logo} alt={series.name}/> : <span>{series.name}</span>}</h1><p>{collectionMode ? collection?.description : id === "bonita" ? "Engineered European Oak Flooring" : series.category === "Accessories" ? "Flooring accessories" : `${series.category} flooring`}</p>{!collectionMode && base && <div className="series-spec-summary">{[base.thickness && `${base.thickness}${base.wearLayer ? ` / ${base.wearLayer} wear layer` : ""}`,base.finish && `${base.finish} finish`,base.packSize && `${base.packSize} per box`,base.boardsPerPack && `${base.boardsPerPack} boards per pack`].filter(Boolean).join("  ·  ")}</div>}</div>
            <div className="series-location"><small>Stock location</small><strong>{profile.region}</strong><span>{series.products.length} {series.products.length===1 ? "colour" : "colours"} in this {collectionMode ? "collection" : "series"}</span></div>
        </section>
        <div className="series-toolbar"><h2>Available Colours <span>{colours.length}</span></h2><label className="series-search"><Search size={17}/><input aria-label="Search colours or code" placeholder="Search colour or code..." value={query} onChange={event=>setParams(event.target.value ? {q:event.target.value} : {}, {replace:true,state:{inventorySearch}})}/></label></div>
        <div className="series-table-wrap"><table className="series-table"><thead><tr><th scope="col">Colour</th><th scope="col">Description</th><th scope="col">Code</th><th scope="col">Size / Per Box</th><th scope="col">Standard Price</th><th scope="col">Your Price</th><th scope="col">Promotion Period</th><th scope="col">Available Stock</th>{showAccessories && <><th scope="col">Scotia</th><th scope="col">Stair Nose</th><th scope="col">Trims</th></>}<th scope="col"><span className="visually-hidden">Details</span></th></tr></thead><tbody>
            {colours.map(product => { const pricing=getProductPricing(product); return <tr key={product.id}>
                <td>{product.colourSwatchOffset != null ? <Link to={`/products/${product.id}`} state={{inventorySearch,seriesSearch:collectionMode ? "" : location.search,listingReturnTo}} aria-label={`View ${product.colour}`} className="colour-swatch" style={{backgroundPosition:`-30px -${product.colourSwatchOffset}px`}}/> : <Link to={`/products/${product.id}`} state={{inventorySearch,seriesSearch:collectionMode ? "" : location.search,listingReturnTo}} aria-label={`View ${product.colour}`}><img className="colour-room-image" src={product.image} alt=""/></Link>}</td>
                <th scope="row"><Link className="colour-name" to={`/products/${product.id}`} state={{inventorySearch,seriesSearch:collectionMode ? "" : location.search,listingReturnTo}}>{product.colour}<ArrowUpRight size={14}/></Link></th>
                <td><span className="colour-code">{product.colourCode ?? product.sku}</span></td>
                <td className="colour-pack"><strong>{product.dimensions ?? "-"}</strong><span>{[product.packSize && `${product.packSize} / box`,product.boardsPerPack && `${product.boardsPerPack} pcs`].filter(Boolean).join(" · ") || "-"}</span></td>
                <td className="colour-standard-price">{product.priceKnown === false ? "-" : <><strong>${(product.standardPrice ?? product.price).toFixed(2)}</strong><small>/ {product.packSize ? "m²" : "unit"}</small></>}</td>
                <td className="colour-price">{product.priceKnown === false ? <span className="colour-price-missing">-</span> : hasPromotion(product) ? <div className="customer-promotion-price"><div className="promotion-sale-price"><strong>${product.price.toFixed(2)}</strong><small>/ {product.packSize ? "m²" : "unit"}</small></div><s className="customer-original-price">${pricing.customer.toFixed(2)}</s><div><span className="discount">{product.discount}% OFF</span></div></div> : <><strong>${product.price.toFixed(2)}</strong><small>/ {product.packSize ? "m²" : "unit"}</small></>}</td>
                <td className="colour-promotion-period">{product.priceKnown !== false && hasPromotion(product) && (product.promotionStartDate || product.promotionEndDate) ? <><div>{promotionDate(product.promotionStartDate)}</div><div className="promotion-period-end">to {promotionDate(product.promotionEndDate)}</div></> : "-"}</td>
                <td className="colour-available-stock">{product.stockKnown === false ? "-" : `${product.sqm.toFixed(2)} m²`}</td>{showAccessories && <><td>{product.accessoryProductIds?.["scotia"] ? <Link className="accessory-product-link" to={`/products/${product.accessoryProductIds["scotia"]}`} state={{inventorySearch,accessoryReturnTo:location.pathname+location.search}}>{product.scotia}<ArrowUpRight size={13}/></Link> : product.scotia || "-"}</td><td>{product.accessoryProductIds?.["stair-nose"] ? <Link className="accessory-product-link" to={`/products/${product.accessoryProductIds["stair-nose"]}`} state={{inventorySearch,accessoryReturnTo:location.pathname+location.search}}>{product.hdfStairNose}<ArrowUpRight size={13}/></Link> : product.hdfStairNose || "-"}</td><td>{product.accessoryProductIds?.["trims"] ? <Link className="accessory-product-link" to={`/products/${product.accessoryProductIds["trims"]}`} state={{inventorySearch,accessoryReturnTo:location.pathname+location.search}}>{product.trims}<ArrowUpRight size={13}/></Link> : product.trims || "-"}</td></>}
                <td><Link className="colour-details" to={`/products/${product.id}`} state={{inventorySearch,seriesSearch:collectionMode ? "" : location.search,listingReturnTo}} aria-label={`${product.colour} details`}>View <ArrowUpRight size={14}/></Link></td>
            </tr>;})}
        </tbody></table>{colours.length===0 && <div className="empty-state"><p>No colours match your search.</p><button className="outline-copper-button" onClick={()=>setParams({}, {replace:true,state:{inventorySearch}})}>Clear search</button></div>}</div>
        <p className="series-footnote">Select a colour to view pricing, stock availability and product details. Prices are exclusive of GST.</p>
    </main></>;
}
