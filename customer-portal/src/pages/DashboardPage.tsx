import { AlertCircle, MapPin, Search } from "lucide-react";
import { Link } from "react-router-dom";
import PortalHeader from "../components/PortalHeader";

const categories = [
    {
        name: "Engineered Timber",
        image:
            "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=600&q=80",
    },
    {
        name: "Hybrid",
        image:
            "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=600&q=80",
    },
    {
        name: "Laminate",
        image:
            "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
    },
    {
        name: "Accessories",
        image:
            "https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=600&q=80",
    },
];

export default function DashboardPage() {
    return (
        <>
            <PortalHeader />

            <main className="dashboard">
                <section className="dashboard-hero">
                    <div>
                        <h1>
                            Welcome back,
                            <br />
                            ABC Flooring
                        </h1>

                        <div className="location">
                            <MapPin size={21} />
                            <div>
                                <small>Your stock location</small>
                                <strong>Melbourne</strong>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="dashboard-content">
                    <div className="account-summary-cards">
                        <div><small>Outstanding</small><strong>$12,752.00</strong><span>3 invoices</span></div>
                        <div className="overdue-summary"><small>Overdue</small><strong>$2,420.00</strong><span>1 invoice</span></div>
                        <Link to="/invoices/inv-10398" className="payment-attention"><AlertCircle size={20}/><div><small>Payment attention</small><strong>INV-10398 · $2,420.00</strong><span>17 days overdue</span></div></Link>
                    </div>
                    <Link to="/inventory" className="search-large">
                        <Search size={20} />
                        <span>Search product, colour, SKU or keyword...</span>
                        <button>
                            <Search size={19} />
                        </button>
                    </Link>

                    <h3>Browse Products</h3>

                    <div className="category-grid">
                        {categories.map((category) => (
                            <Link to="/inventory" className="category-card" key={category.name}>
                                <img src={category.image} alt="" />
                                <div>{category.name} →</div>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
}