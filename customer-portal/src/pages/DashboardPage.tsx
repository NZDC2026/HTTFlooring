import { AlertCircle, ArrowUpRight, MapPin, Search, Package, FileText, Truck, Wallet } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import PortalHeader from "../components/PortalHeader";
import { useInvoiceLedger } from "../data/ledger";
import { productCollections } from "../data/products";

const money = (value: number) => value.toLocaleString("en-AU", { style: "currency", currency: "AUD" });


import { useLocalAccount } from "../services/account";
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
    const {invoiceSummary,unappliedCredit,credits}=useInvoiceLedger();
    const {profile}=useLocalAccount(); const navigate=useNavigate();
    const { outstanding, outstandingCount, overdue, overdueCount, attentionInvoice } = invoiceSummary;
    return (
        <>
            <PortalHeader />

            <main className="dashboard">
                <section className="dashboard-hero">
                    <div>
                        <h1>
                            Welcome back,
                            <br />
                            {profile.businessName}
                        </h1>

                        <div className="location">
                            <MapPin size={21} />
                            <div>
                                <small>Your stock location</small>
                                <strong>{profile.region}</strong>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="dashboard-content">
                    <nav className="portal-quick-actions" aria-label="Customer quick actions">
                        <Link to="/inventory"><Package size={22}/>Check stock</Link>
                        <Link to="/quotes"><FileText size={22}/>My quotes</Link>
                        <Link to="/orders"><Truck size={22}/>Track orders</Link>
                        <Link to="/invoices"><Wallet size={22}/>Invoices &amp; payments</Link>
                    </nav>
                    <div className="account-summary-cards dashboard-account-summary">
                        <div><small>Outstanding</small><strong>{money(outstanding)}</strong><span>{outstandingCount} {outstandingCount === 1 ? "invoice" : "invoices"}</span></div>
                        <div className="overdue-summary"><small>Overdue</small><strong>{money(overdue)}</strong><span>{overdueCount} {overdueCount === 1 ? "invoice" : "invoices"}</span></div>
                        <Link to="/invoices?tab=credits" className="credit-summary"><small>Credit</small><strong>{money(unappliedCredit)}</strong><span>{credits.filter(credit=>credit.remainingAmount>0).length} unapplied credit {credits.filter(credit=>credit.remainingAmount>0).length===1?"note":"notes"}</span></Link>
                        {attentionInvoice && <Link to={`/invoices/${attentionInvoice.id}`} className="payment-attention"><AlertCircle size={20}/><div><small>Payment attention</small><strong>{attentionInvoice.invoiceNumber} · {money(attentionInvoice.balance)}</strong><span>{attentionInvoice.overdueDays} days overdue</span></div></Link>}
                    </div>
                    <form className="search-large" onSubmit={event=>{event.preventDefault();const values=new FormData(event.currentTarget);navigate(`/inventory?q=${encodeURIComponent(String(values.get("q")??""))}`);}}>
                        <Search size={20} />
                        <input name="q" aria-label="Search inventory" placeholder="Search product, colour, SKU or keyword..."/>
                        <button aria-label="Search inventory">
                            <Search size={19} />
                        </button>
                    </form>

                    <div className="product-collections" aria-label="Featured product collections">
                        {productCollections.map(collection => (
                            <Link className={`collection-card collection-${collection.id}`} to={`/collections/${collection.id}`} key={collection.id}>
                                <img src={collection.image} alt="" loading="lazy"/>
                                <div className="collection-card-content">
                                    <h3>{collection.name}</h3>
                                    <p>{collection.description}</p>
                                    <span>View products <ArrowUpRight size={17}/></span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <h3>Browse Products</h3>

                    <div className="category-grid">
                        {categories.map((category) => (
                            <Link to={`/inventory?category=${encodeURIComponent(category.name)}`} className="category-card" key={category.name}>
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