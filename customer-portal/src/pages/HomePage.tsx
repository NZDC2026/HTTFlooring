import { ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
    return (
        <main className="home">
            <header className="public-header">
                <div className="brand">
                    <span className="brand-mark">HT</span>
                    HTT FLOORING
                </div>

                <nav>
                    <a>PRODUCTS</a>
                    <a>GALLERY</a>
                    <a>SUPPORT</a>
                    <a>ABOUT HTT</a>
                </nav>

                <div className="public-actions">
                    <Link to="/login" className="outline-button">
                        CUSTOMER LOGIN
                    </Link>
                    <Search size={19} />
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
                        <button>
                            TRADE ENQUIRY <ArrowRight size={16} />
                        </button>

                        <button className="transparent-button">
                            FIND A RETAILER <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}