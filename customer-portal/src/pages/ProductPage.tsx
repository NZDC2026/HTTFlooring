import { ArrowLeft, Box, Ruler } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PortalHeader from "../components/PortalHeader";
import { products } from "../data/products";

export default function ProductPage() {
    const { id } = useParams();

    const product = products.find((item) => item.id === id);

    if (!product) {
        return <h1>Product not found.</h1>;
    }

    return (
        <>
            <PortalHeader />

            <main className="product-page">
                <Link to="/inventory" className="back-link">
                    <ArrowLeft size={17} /> Back to results
                </Link>

                <div className="product-detail-grid">
                    <section className="product-gallery">
                        <img className="main-product-image" src={product.image} alt="" />

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
                                    {product.sku} | {product.category}
                                </small>
                            </div>

                            <span className="status-badge">● {product.status}</span>
                        </div>

                        <div className="detail-price">
                            ${product.price.toFixed(2)} <span>/ m²</span>

                            {product.discount && (
                                <span className="discount">{product.discount}% OFF</span>
                            )}

                            <small>
                                Standard
                                <strong>${product.standardPrice?.toFixed(2)}</strong>
                            </small>
                        </div>

                        <p className="description">
                            A timeless oak design with natural tones and excellent wear
                            resistance. Perfect for modern Australian homes and commercial
                            spaces.
                        </p>

                        <dl className="specs">
                            <dt>Category</dt>
                            <dd>{product.category}</dd>

                            <dt>Colour</dt>
                            <dd>{product.colour}</dd>

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
                        </dl>
                    </section>

                    <section className="stock-panel">
                        <div className="stock-heading">
                            <h2>Stock Availability</h2>
                            <small>Updated 2 Oct 2026, 7:32 PM</small>
                        </div>

                        <h3>Melbourne</h3>

                        <div className="stock-cards">
                            <div>
                                <span className="green-dot" />
                                <strong>{product.status}</strong>
                            </div>

                            <div>
                                <Box size={18} />
                                <strong>{product.boxes} boxes</strong>
                            </div>

                            <div>
                                <Ruler size={18} />
                                <strong>{product.sqm.toFixed(1)} m²</strong>
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

                        <h3>Related Products</h3>

                        <div className="related-products">
                            {products.slice(1, 4).map((item) => (
                                <Link to={`/products/${item.id}`} key={item.id}>
                                    <img src={item.image} alt="" />
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}