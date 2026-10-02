import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../data/products";

export default function ProductRow({ product }: { product: Product }) {
    const statusClass =
        product.status === "In Stock"
            ? "stock-good"
            : product.status === "Low Stock"
                ? "stock-low"
                : "stock-out";

    return (
        <Link to={`/products/${product.id}`} className="product-row">
            <img src={product.image} alt={product.name} />

            <div className="product-main">
                <strong>{product.name}</strong>
                <small>
                    {product.sku} &nbsp;|&nbsp; {product.category}
                </small>
            </div>

            <div className="price">
                ${product.price.toFixed(2)}
                <span>/ m²</span>
            </div>

            <div className="promotion">
                {product.discount && (
                    <span className="discount">{product.discount}% OFF</span>
                )}

                {product.standardPrice && (
                    <small>
                        Standard
                        <strong>${product.standardPrice.toFixed(2)}</strong>
                    </small>
                )}
            </div>

            <div className={`stock ${statusClass}`}>
                <strong>
                    <i /> {product.status}
                </strong>
                <span>{product.boxes} boxes</span>
                <small>{product.sqm.toFixed(1)} m²</small>
            </div>

            <ChevronRight size={20} />
        </Link>
    );
}