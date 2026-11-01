import { ArrowLeft, ArrowUpRight, Search } from "lucide-react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import PortalHeader from "../components/PortalHeader";
import { productSeries } from "../data/products";
import { useLocalAccount } from "../data/localAccount";

export default function SeriesPage() {
    const {id} = useParams();
    const location = useLocation();
    const [params,setParams] = useSearchParams();
    const {profile} = useLocalAccount();
    const series = productSeries.find(item => item.id === id);
    const inventorySearch = typeof location.state?.inventorySearch === "string" ? location.state.inventorySearch : "";
    if (!series) return <><PortalHeader/><main className="empty-state"><h1>Series not found</h1><Link to="/inventory">Back to inventory</Link></main></>;
    const query = params.get("q") ?? "";
    const colours = series.products.filter(product => [product.colour,product.colourCode ?? product.sku,product.sku].some(value => value.toLowerCase().includes(query.trim().toLowerCase())));
    const base = series.products[0];
    return <><PortalHeader/><main className="series-page">
        <Link className="back-link" to={`/inventory${inventorySearch}`}><ArrowLeft size={17}/> Back to series</Link>
        <section className="series-heading">
            <div><small className="series-eyebrow">{series.category} · PRODUCT SERIES</small><h1>{series.name}</h1><p>{id === "bonita" ? "Engineered European Oak Flooring" : `${series.category} flooring`}</p><div className="series-spec-summary">{[base.thickness && `${base.thickness}${base.wearLayer ? ` / ${base.wearLayer} wear layer` : ""}`,base.finish && `${base.finish} finish`,base.packSize && `${base.packSize} per box`,base.boardsPerPack && `${base.boardsPerPack} boards per pack`].filter(Boolean).join("  ·  ")}</div></div>
            <div className="series-location"><small>Stock location</small><strong>{profile.region}</strong><span>{series.products.length} {series.products.length===1 ? "colour" : "colours"} in this series</span></div>
        </section>
        <div className="series-toolbar"><h2>Available Colours <span>{colours.length}</span></h2><label className="series-search"><Search size={17}/><input aria-label="Search colours or code" placeholder="Search colour or code..." value={query} onChange={event=>setParams(event.target.value ? {q:event.target.value} : {}, {replace:true,state:{inventorySearch}})}/></label></div>
        <div className="series-table-wrap"><table className="series-table"><thead><tr><th scope="col">Colour</th><th scope="col">Description</th><th scope="col">Code</th><th scope="col">Size / Per Box</th><th scope="col">Unit Price</th><th scope="col">Promotion</th><th scope="col">Scotia</th><th scope="col">Stair Nose</th><th scope="col">Trims</th><th scope="col"><span className="visually-hidden">Details</span></th></tr></thead><tbody>
            {colours.map(product => <tr key={product.id}>
                <td>{product.colourSwatchOffset != null ? <Link to={`/products/${product.id}`} state={{inventorySearch,seriesSearch:location.search}} aria-label={`View ${product.colour}`} className="colour-swatch" style={{backgroundPosition:`-30px -${product.colourSwatchOffset}px`}}/> : <Link to={`/products/${product.id}`} state={{inventorySearch,seriesSearch:location.search}} aria-label={`View ${product.colour}`}><img className="colour-room-image" src={product.image} alt=""/></Link>}</td>
                <th scope="row"><Link className="colour-name" to={`/products/${product.id}`} state={{inventorySearch,seriesSearch:location.search}}>{product.colour}<ArrowUpRight size={14}/></Link></th>
                <td><span className="colour-code">{product.colourCode ?? product.sku}</span></td>
                <td className="colour-pack"><strong>{product.dimensions ?? "-"}</strong><span>{[product.packSize && `${product.packSize} / box`,product.boardsPerPack && `${product.boardsPerPack} pcs`].filter(Boolean).join(" · ") || "-"}</span></td>
                <td className="colour-price">{product.priceKnown === false ? <span className="colour-price-missing">-</span> : <><strong>${product.price.toFixed(2)}</strong><small>/ {product.packSize ? "m²" : "unit"}</small></>}</td>
                <td className="colour-promotion">{product.priceKnown === false ? "-" : <>{product.discount ? <span className="discount">{product.discount}% OFF</span> : null}{product.standardPrice != null ? <small>Standard <strong>${product.standardPrice.toFixed(2)}</strong></small> : null}{!product.discount && product.standardPrice == null ? "-" : null}</>}</td>
                <td>{product.scotia || "-"}</td><td>{product.hdfStairNose || "-"}</td><td>{product.trims || "-"}</td>
                <td><Link className="colour-details" to={`/products/${product.id}`} state={{inventorySearch,seriesSearch:location.search}} aria-label={`${product.colour} details`}>View <ArrowUpRight size={14}/></Link></td>
            </tr>)}
        </tbody></table>{colours.length===0 && <div className="empty-state"><p>No colours match your search.</p><button className="outline-copper-button" onClick={()=>setParams({}, {replace:true,state:{inventorySearch}})}>Clear search</button></div>}</div>
        <p className="series-footnote">Select a colour to view pricing, stock availability and product details. Prices are exclusive of GST.</p>
    </main></>;
}
