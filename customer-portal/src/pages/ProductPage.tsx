import { ArrowLeft, Box, Ruler } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import PortalHeader from "../components/PortalHeader";
import ProductSalesCard from "../components/ProductSalesCard";
import { netSalesInvoices } from "../data/productSales";
import { useReturnNotes } from "../data/returnNotes";
import { useLocalAccount } from "../data/localAccount";
import { getProductPricing, products } from "../data/products";

export default function ProductPage() {
    const { id } = useParams();
    const salesInvoices=netSalesInvoices(useReturnNotes());
    const location=useLocation();
    const inventorySearch=typeof location.state?.inventorySearch==="string" ? location.state.inventorySearch : "";
    const listingReturnTo=typeof location.state?.listingReturnTo==="string" && /^\/collections\/(new|promotion|clearance)(?:\?|$)/.test(location.state.listingReturnTo) ? location.state.listingReturnTo : "";
    const seriesSearch=typeof location.state?.seriesSearch==="string" ? location.state.seriesSearch : "";
    const accessoryReturnTo=typeof location.state?.accessoryReturnTo==="string" && /^\/(series|products|collections)\//.test(location.state.accessoryReturnTo) ? location.state.accessoryReturnTo : "";
    const {profile}=useLocalAccount();

    const product = products.find((item) => item.id === id);

    if (!product) {
        return <><PortalHeader/><main className="empty-state"><h1>Product not found</h1><Link to="/inventory">Back to inventory</Link></main></>;
    }

    const pricing=getProductPricing(product);
    return (
        <>
            <PortalHeader />

            <main className="product-page">
                <Link to={product.accessoryKind && accessoryReturnTo ? accessoryReturnTo : listingReturnTo || `/series/${product.seriesId}${seriesSearch}`} state={{inventorySearch}} className="back-link">
                    <ArrowLeft size={17} /> {product.accessoryKind && accessoryReturnTo ? "Back to product colours" : listingReturnTo ? "Back to collection" : `Back to ${product.seriesName} colours`}
                </Link>

                <div className="product-detail-grid">
                    <section className="product-gallery">
                        <img className="main-product-image" src={product.image} alt="" />{product.accessoryKind && <p className="accessory-image-note">Room image for colour reference. Accessory photo not supplied.</p>}

                        <div className="thumbnails">
                            <img src={product.image} alt="" />
                            <img src={product.image} alt="" />
                            <img src={product.image} alt="" />
                        </div>
                    </section>

                    <section className="product-information">
                        <div className="product-title-row">
                            <div>
                                <h1>{product.name}</h1>
                                <small>
                                    {product.colourCode ?? product.sku} | {product.category}
                                </small>
                            </div>

                            <span className={`status-badge ${product.stockKnown === false ? "stock-unknown" : product.status === "Low Stock" ? "stock-low" : product.status === "Out of Stock" ? "stock-out" : ""}`}>● {product.stockKnown === false ? "Stock on request" : product.status}</span>
                        </div>

                        <div className="detail-price">{product.priceKnown === false ? <span>Price on request</span> : <>
                            ${product.price.toFixed(2)} <span>/ {product.packSize ? "m²" : "unit"}</span>

                            {product.discount && (
                                <span className="discount">{product.discount}% OFF</span>
                            )}

                            <small>Standard Price<strong>${pricing.standard.toFixed(2)}</strong></small>{pricing.promotion && <small>Your Price<strong className="detail-original-customer-price">${pricing.customer.toFixed(2)}</strong></small>}
                        </>} </div>

                        <p className="description">{product.accessoryKind ? `Matching ${product.seriesName.toLowerCase()} accessory. Contact your HTT account manager for pricing, availability and specifications.` : "A timeless oak design with natural tones and excellent wear resistance. Perfect for modern Australian homes and commercial spaces."}</p>

                        <dl className="specs">
                            <dt>Category</dt>
                            <dd>{product.category}</dd>

                            <dt>Colour</dt>
                            <dd>{product.colour}</dd>

                            <dt>Code</dt><dd>{product.colourCode ?? product.sku}</dd>
                            <dt>Size</dt><dd>{product.dimensions ?? "-"}</dd>

                            <dt>Thickness</dt>
                            <dd>{product.thickness ?? "—"}</dd>

                            <dt>Wear Layer</dt>
                            <dd>{product.wearLayer ?? "—"}</dd>

                            <dt>Pattern</dt>
                            <dd>{product.pattern ?? "—"}</dd>

                            <dt>Finish</dt>
                            <dd>{product.finish ?? "—"}</dd>

                            <dt>Pack Size</dt>
                            <dd>{product.packSize ?? "—"}</dd>

                            <dt>Boards / Pack</dt>
                            <dd>{product.boardsPerPack ?? "—"}</dd>

                            <dt>Scotia</dt>
                            <dd>{product.accessoryProductIds?.["scotia"] ? <Link className="accessory-product-link" to={`/products/${product.accessoryProductIds["scotia"]}`} state={{inventorySearch,accessoryReturnTo:location.pathname+location.search}}>{product.scotia}</Link> : product.scotia || "-"}</dd>

                            <dt>Stair Nose</dt>
                            <dd>{product.accessoryProductIds?.["stair-nose"] ? <Link className="accessory-product-link" to={`/products/${product.accessoryProductIds["stair-nose"]}`} state={{inventorySearch,accessoryReturnTo:location.pathname+location.search}}>{product.hdfStairNose}</Link> : product.hdfStairNose || "-"}</dd>

                            <dt>Trims</dt>
                            <dd>{product.accessoryProductIds?.["trims"] ? <Link className="accessory-product-link" to={`/products/${product.accessoryProductIds["trims"]}`} state={{inventorySearch,accessoryReturnTo:location.pathname+location.search}}>{product.trims}</Link> : product.trims || "-"}</dd>
                        </dl>
                    </section>

                    <section className="stock-panel">
                        <div className="stock-heading">
                            <h2>Stock Availability</h2>
                            <small>Local sample inventory</small>
                        </div>

                        <h3>{profile.region}</h3>

                        <div className="stock-cards">
                            <div>
                                <span className={product.stockKnown === false ? "unknown-dot" : "green-dot"} />
                                <strong>{product.stockKnown === false ? "On request" : product.status}</strong>
                            </div>

                            <div>
                                <Box size={18} />
                                <strong>{product.stockKnown === false ? "-" : `${product.boxes} boxes`}</strong>
                            </div>

                            <div>
                                <Ruler size={18} />
                                <strong>{product.stockKnown === false ? "-" : `${product.sqm.toFixed(1)} m²`}</strong>
                            </div>
                        </div>

                        <div className="info-box">
                            ⓘ &nbsp; Stock levels are updated regularly.
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;Please contact your HTT account manager for
                            pricing,
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;promotions and large order enquiries.
                        </div>

                        <h3>{product.accessoryKind ? "Matching Colours" : "Related Colours"}</h3>

                        <div className="related-products">
                            {products.filter(item=>item.id!==product.id && (product.accessoryKind ? Object.values(item.accessoryProductIds??{}).includes(product.id) : !item.accessoryKind)).sort((a,b)=>Number(b.seriesId===product.seriesId)-Number(a.seriesId===product.seriesId)).slice(0,3).map((item) => (
                                <Link to={`/products/${item.id}`} state={{inventorySearch,seriesSearch:item.seriesId===product.seriesId?seriesSearch:"",listingReturnTo}} key={item.id}>
                                    <img src={item.image} alt="" />
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>

                <ProductSalesCard key={product.id} productId={product.id} invoices={salesInvoices}/>
            </main>
        </>
    );
}