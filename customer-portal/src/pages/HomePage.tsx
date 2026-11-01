import { ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { productSeries } from "../data/products";

export default function HomePage() {
    return (
        <main className="home">
            <header className="public-header">
                <div className="brand">
                    <span className="brand-mark">HT</span>
                    HTT FLOORING
                </div>

                <nav>
                    <Link to="/inventory">PRODUCTS</Link>
                    <a href="#gallery">GALLERY</a>
                    <a href="#support">SUPPORT</a>
                    <a href="#about">ABOUT HTT</a>
                </nav>

                <div className="public-actions">
                    <Link to="/login" className="outline-button">
                        CUSTOMER LOGIN
                    </Link>
                    <Link to="/inventory" aria-label="Search products"><Search size={19}/></Link>
                </div>
            </header>

            <section className="hero">
                <div className="hero-content">
                    <h1>
                        Floors that
                        <br />
                        belong <em>naturally.</em>
                    </h1>

                    <p>
                        Premium flooring. Wholesale advantage.
                        <br />
                        Trusted by builders, designers and
                        <br />
                        developers Australia-wide.
                    </p>

                    <div className="hero-actions">
                        <Link className="home-cta" to="/register">
                            TRADE ENQUIRY <ArrowRight size={16} />
                        </Link>

                        <a href="#support" className="transparent-button home-cta">
                            RETAILER ENQUIRY <ArrowRight size={16} />
                        </a>
                    </div>
                </div>
            </section>
            <section className="public-section" id="gallery"><h2>Explore our flooring</h2><div className="public-gallery">{productSeries.map(product=><Link to={`/series/${product.id}`} key={product.id}><img src={product.image} alt={product.name}/><h3>{product.name}</h3><p>{product.category}</p></Link>)}</div></section>
            <section className="public-section" id="support"><h2>Trade and retailer enquiries</h2><p>Apply for a trade account to share your business and region details.</p><p className="local-notice">This local preview saves your application on this device. It does not send an enquiry to HTT Flooring.</p><Link className="outline-copper-button" to="/register">Start an application</Link></section>
            <section className="public-section" id="about"><h2>HTT Flooring</h2><p>Flooring for builders, designers and trade partners. Browse engineered timber, hybrid and laminate collections through the customer portal.</p><Link to="/login">Customer login →</Link></section>
        </main>
    );
}